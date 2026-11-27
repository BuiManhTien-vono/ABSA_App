using System.Collections.Concurrent;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using HigenAbsa.Modules.Security.Application.DTOs;
using HigenAbsa.Modules.Security.Domain;
using HigenAbsa.Modules.Security.Infrastructure;
using HigenAbsa.SharedKernel.Common;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.Security.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress);
    Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken, string ipAddress);
    Task<bool> LogoutAsync(string refreshToken, string ipAddress);
    Task<UserProfileDto?> GetProfileAsync(Guid userId);

    Task<PagedResult<UserListDto>> GetUsersAsync(int page, int pageSize, string? role, string? search);
    Task<UserProfileDto?> GetUserByIdAsync(Guid id);
    Task<UserProfileDto> CreateUserAsync(CreateUserRequest request);
    Task<UserProfileDto?> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task<bool> DeleteUserAsync(Guid id);

    Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
}

public class AuthService : IAuthService
{
    private static readonly ConcurrentDictionary<string, (int FailedCount, DateTimeOffset? LockoutEnd)> _loginAttempts = new(StringComparer.OrdinalIgnoreCase);

    private readonly SecurityDbContext _dbContext;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IInMemoryEventBus _eventBus;
    private readonly IConfiguration _config;
    private readonly int _refreshTokenExpirationDays;

    public AuthService(
        SecurityDbContext dbContext,
        IJwtTokenService jwtTokenService,
        IInMemoryEventBus eventBus,
        IConfiguration config)
    {
        _dbContext = dbContext;
        _jwtTokenService = jwtTokenService;
        _eventBus = eventBus;
        _config = config;
        _refreshTokenExpirationDays = int.TryParse(_config["Jwt:RefreshTokenExpirationDays"], out var d) ? d : 7;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress)
    {
        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            throw new ArgumentException("Password must be at least 6 characters.");

        if (request.Password.All(char.IsDigit))
            throw new ArgumentException("Password must contain at least one non-numeric character.");

        string normalizedEmail = (request.Email ?? "").Trim().ToLower();
        var existingUser = await _dbContext.SystemUsers
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (existingUser != null)
            throw new InvalidOperationException("Email address is already registered.");

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new SystemUser
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            PasswordHash = passwordHash,
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = "STORE_MANAGER", // Public registration strictly defaults to STORE_MANAGER to prevent privilege escalation
            IsActive = true
        };

        _dbContext.SystemUsers.Add(user);
        await _dbContext.SaveChangesAsync();

        var (accessToken, expiresInSeconds) = _jwtTokenService.GenerateAccessToken(user);
        string refreshTokenString = _jwtTokenService.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenString,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_refreshTokenExpirationDays),
            CreatedByIp = ipAddress
        };

        _dbContext.RefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync();

        await _eventBus.PublishAsync(new UserAuditIntegrationEvent(
            user.Id, "REGISTER", "SystemUser", user.Id.ToString(), $"Registered user {user.Email}", ipAddress));

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenString,
            TokenType = "Bearer",
            ExpiresInSeconds = expiresInSeconds,
            User = MapToProfile(user)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress)
    {
        string emailKey = (request.Email ?? "").Trim().ToLower();
        if (_loginAttempts.TryGetValue(emailKey, out var state))
        {
            if (state.LockoutEnd.HasValue && state.LockoutEnd.Value > DateTimeOffset.UtcNow)
            {
                throw new UnauthorizedAccessException("Account is temporarily locked out due to multiple failed login attempts. Please try again later.");
            }
        }

        var user = await _dbContext.SystemUsers
            .FirstOrDefaultAsync(u => u.Email.ToLower() == emailKey);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            _loginAttempts.AddOrUpdate(emailKey,
                _ => (1, null),
                (_, current) =>
                {
                    int newCount = current.FailedCount + 1;
                    if (newCount >= 5)
                    {
                        return (newCount, DateTimeOffset.UtcNow.AddMinutes(15));
                    }
                    return (newCount, null);
                });

            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        _loginAttempts.TryRemove(emailKey, out _);

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated. Contact administrator.");

        var (accessToken, expiresInSeconds) = _jwtTokenService.GenerateAccessToken(user);
        string refreshTokenString = _jwtTokenService.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenString,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_refreshTokenExpirationDays),
            CreatedByIp = ipAddress
        };

        _dbContext.RefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync();

        await _eventBus.PublishAsync(new UserAuditIntegrationEvent(
            user.Id, "LOGIN", "SystemUser", user.Id.ToString(), $"User logged in: {user.Email}", ipAddress));

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenString,
            TokenType = "Bearer",
            ExpiresInSeconds = expiresInSeconds,
            User = MapToProfile(user)
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken, string ipAddress)
    {
        var existingToken = await _dbContext.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken);

        if (existingToken == null || existingToken.IsRevoked || existingToken.IsExpired)
        {
            if (existingToken != null && existingToken.IsRevoked)
            {
                // Breach / Token Replay detection: revoke all active descendant refresh tokens of user
                var activeTokens = await _dbContext.RefreshTokens
                    .Where(r => r.UserId == existingToken.UserId && !r.IsRevoked)
                    .ToListAsync();
                foreach (var token in activeTokens)
                {
                    token.IsRevoked = true;
                    token.RevokedAt = DateTimeOffset.UtcNow;
                    token.RevokedByIp = ipAddress;
                }
                await _dbContext.SaveChangesAsync();
            }
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");
        }

        var user = existingToken.User;
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("User not found or account is deactivated.");

        existingToken.IsRevoked = true;
        existingToken.RevokedAt = DateTimeOffset.UtcNow;
        existingToken.RevokedByIp = ipAddress;

        string newRefreshTokenString = _jwtTokenService.GenerateRefreshToken();
        existingToken.ReplacedByToken = newRefreshTokenString;

        var newRefreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshTokenString,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_refreshTokenExpirationDays),
            CreatedByIp = ipAddress
        };

        _dbContext.RefreshTokens.Add(newRefreshToken);
        await _dbContext.SaveChangesAsync();

        var (accessToken, expiresInSeconds) = _jwtTokenService.GenerateAccessToken(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshTokenString,
            TokenType = "Bearer",
            ExpiresInSeconds = expiresInSeconds,
            User = MapToProfile(user)
        };
    }

    public async Task<bool> LogoutAsync(string refreshToken, string ipAddress)
    {
        var existingToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(r => r.Token == refreshToken);

        if (existingToken == null) return false;

        existingToken.IsRevoked = true;
        existingToken.RevokedAt = DateTimeOffset.UtcNow;
        existingToken.RevokedByIp = ipAddress;

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
    {
        var user = await _dbContext.SystemUsers.FindAsync(userId);
        return user == null ? null : MapToProfile(user);
    }

    public async Task<PagedResult<UserListDto>> GetUsersAsync(int page, int pageSize, string? role, string? search)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.SystemUsers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role == role.ToUpper());

        if (!string.IsNullOrWhiteSpace(search))
        {
            string s = search.ToLower();
            query = query.Where(u => u.Email.ToLower().Contains(s) || u.FullName.ToLower().Contains(s));
        }

        int totalCount = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<UserListDto>(users, totalCount, page, pageSize);
    }

    public async Task<UserProfileDto?> GetUserByIdAsync(Guid id)
    {
        var user = await _dbContext.SystemUsers.FindAsync(id);
        return user == null ? null : MapToProfile(user);
    }

    public async Task<UserProfileDto> CreateUserAsync(CreateUserRequest request)
    {
        var allowedRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "ADMIN", "CSKH_STAFF", "STORE_MANAGER" };
        if (string.IsNullOrWhiteSpace(request.Role) || !allowedRoles.Contains(request.Role.Trim()))
            throw new ArgumentException($"Invalid role '{request.Role}'. Allowed roles: ADMIN, CSKH_STAFF, STORE_MANAGER.");

        var normalizedEmail = (request.Email ?? "").Trim().ToLower();
        var exists = await _dbContext.SystemUsers.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
        if (exists) throw new InvalidOperationException("Email address is already in use.");

        var user = new SystemUser
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = request.Role.Trim().ToUpper(),
            IsActive = true
        };

        _dbContext.SystemUsers.Add(user);
        await _dbContext.SaveChangesAsync();

        return MapToProfile(user);
    }

    public async Task<UserProfileDto?> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _dbContext.SystemUsers.FindAsync(id);
        if (user == null) return null;

        if (!string.IsNullOrWhiteSpace(request.FullName)) user.FullName = request.FullName.Trim();
        if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber.Trim();
        if (!string.IsNullOrWhiteSpace(request.Role)) user.Role = request.Role.ToUpper();
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
        user.MarkUpdated();

        await _dbContext.SaveChangesAsync();
        return MapToProfile(user);
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _dbContext.SystemUsers.FindAsync(id);
        if (user == null) return false;

        user.IsActive = false; // Soft delete
        user.MarkUpdated();
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        if (currentPassword == newPassword)
            throw new ArgumentException("New password cannot be the same as current password.");

        var user = await _dbContext.SystemUsers.FindAsync(userId);
        if (user == null) throw new InvalidOperationException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");

        if (BCrypt.Net.BCrypt.Verify(newPassword, user.PasswordHash))
            throw new InvalidOperationException("New password cannot be the same as current password.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.MarkUpdated();
        await _dbContext.SaveChangesAsync();
        return true;
    }

    private static UserProfileDto MapToProfile(SystemUser user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role,
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}


