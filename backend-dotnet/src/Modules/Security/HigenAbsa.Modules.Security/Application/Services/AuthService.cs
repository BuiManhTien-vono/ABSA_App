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
        var existingUser = await _dbContext.SystemUsers
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (existingUser != null)
            throw new InvalidOperationException("Email address is already registered.");

        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new SystemUser
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower().Trim(),
            PasswordHash = passwordHash,
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = string.IsNullOrWhiteSpace(request.Role) ? "STORE_MANAGER" : request.Role.ToUpper(),
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
        var user = await _dbContext.SystemUsers
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

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
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

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
        var exists = await _dbContext.SystemUsers.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());
        if (exists) throw new InvalidOperationException("Email address is already in use.");

        var user = new SystemUser
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = request.Role.ToUpper(),
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
        var user = await _dbContext.SystemUsers.FindAsync(userId);
        if (user == null) throw new InvalidOperationException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");

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

