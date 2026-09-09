using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using HigenAbsa.Application.Common;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Application.DTOs.Auth;
using HigenAbsa.Domain.Interfaces;

namespace HigenAbsa.Application.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress);
    Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken, string ipAddress);
    Task<bool> LogoutAsync(string refreshToken, string ipAddress);
    Task<UserProfileDto?> GetProfileAsync(Guid userId);

    // NV1-A: Admin User CRUD
    Task<PagedResult<UserListDto>> GetUsersAsync(int page, int pageSize, string? role, string? search);
    Task<UserProfileDto?> GetUserByIdAsync(Guid id);
    Task<UserProfileDto> CreateUserAsync(CreateUserRequest request);
    Task<UserProfileDto?> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task<bool> DeleteUserAsync(Guid id);

    // NV1-B: Change Password
    Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
}

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IConfiguration _config;
    private readonly int _refreshTokenExpirationDays;

    public AuthService(IUnitOfWork uow, IJwtTokenService jwtTokenService, IConfiguration config)
    {
        _uow = uow;
        _jwtTokenService = jwtTokenService;
        _config = config;
        _refreshTokenExpirationDays = int.TryParse(_config["Jwt:RefreshTokenExpirationDays"], out var d) ? d : 7;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress)
    {
        var existingUser = await _uow.SystemUsers.Query().FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
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
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _uow.SystemUsers.AddAsync(user);
        await _uow.SaveChangesAsync();

        return await GenerateAuthResponseAsync(user, ipAddress);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress)
    {
        var user = await _uow.SystemUsers.Query().FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid email or password.");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
            throw new UnauthorizedAccessException("Invalid email or password.");

        return await GenerateAuthResponseAsync(user, ipAddress);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshTokenStr, string ipAddress)
    {
        var tokenRecord = await _uow.RefreshTokens.Query()
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshTokenStr);

        if (tokenRecord == null)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        if (tokenRecord.IsRevoked)
        {
            // Security Alert: Attempted use of revoked token -> Revoke all child tokens for user (Reuse Detection)
            await RevokeAllUserTokensAsync(tokenRecord.UserId, ipAddress, "Attempted reuse of revoked token");
            throw new UnauthorizedAccessException("Invalid refresh token.");
        }

        if (tokenRecord.IsExpired)
            throw new UnauthorizedAccessException("Refresh token has expired. Please log in again.");

        var user = tokenRecord.User;
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("User is inactive or not found.");

        // Rotate token: Revoke current token and issue a new one
        string newRefreshTokenStr = _jwtTokenService.GenerateRefreshToken();
        tokenRecord.IsRevoked = true;
        tokenRecord.RevokedAt = DateTime.UtcNow;
        tokenRecord.RevokedByIp = ipAddress;
        tokenRecord.ReplacedByToken = newRefreshTokenStr;

        var newRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenExpirationDays),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };

        _uow.RefreshTokens.AddAsync(newRefreshToken);
        await _uow.SaveChangesAsync();

        var (accessToken, expiresInSeconds) = _jwtTokenService.GenerateAccessToken(user);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshTokenStr,
            TokenType = "Bearer",
            ExpiresInSeconds = expiresInSeconds,
            User = MapToUserProfileDto(user)
        };
    }

    public async Task<bool> LogoutAsync(string refreshTokenStr, string ipAddress)
    {
        var tokenRecord = await _uow.RefreshTokens.Query()
            .FirstOrDefaultAsync(r => r.Token == refreshTokenStr);

        if (tokenRecord == null || tokenRecord.IsRevoked)
            return false;

        tokenRecord.IsRevoked = true;
        tokenRecord.RevokedAt = DateTime.UtcNow;
        tokenRecord.RevokedByIp = ipAddress;

        await _uow.SaveChangesAsync();
        return true;
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
    {
        var user = await _uow.SystemUsers.GetByIdAsync(userId);
        return user == null ? null : MapToUserProfileDto(user);
    }

    // -----------------------------------------------------------------------
    // Helper Methods
    // -----------------------------------------------------------------------

    private async Task<AuthResponse> GenerateAuthResponseAsync(SystemUser user, string ipAddress)
    {
        var (accessToken, expiresInSeconds) = _jwtTokenService.GenerateAccessToken(user);
        string refreshTokenStr = _jwtTokenService.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(_refreshTokenExpirationDays),
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress
        };

        _uow.RefreshTokens.AddAsync(refreshToken);
        await _uow.SaveChangesAsync();

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenStr,
            TokenType = "Bearer",
            ExpiresInSeconds = expiresInSeconds,
            User = MapToUserProfileDto(user)
        };
    }

    private async Task RevokeAllUserTokensAsync(Guid userId, string ipAddress, string reason)
    {
        var activeTokens = await _uow.RefreshTokens.Query()
            .Where(r => r.UserId == userId && !r.IsRevoked)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;
        }

        await _uow.SaveChangesAsync();
    }

    // -----------------------------------------------------------------------
    // NV1-A: Admin User CRUD
    // -----------------------------------------------------------------------

    public async Task<PagedResult<UserListDto>> GetUsersAsync(int page, int pageSize, string? role, string? search)
    {
        var query = _uow.SystemUsers.Query().AsQueryable();

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role == role.ToUpper());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(term) ||
                u.FullName.ToLower().Contains(term));
        }

        var pagedQuery = query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new UserListDto
            {
                Id = u.Id,
                Email = u.Email,
                FullName = u.FullName,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<UserProfileDto?> GetUserByIdAsync(Guid id)
    {
        var user = await _uow.SystemUsers.GetByIdAsync(id);
        return user == null ? null : MapToUserProfileDto(user);
    }

    public async Task<UserProfileDto> CreateUserAsync(CreateUserRequest request)
    {
        var existingUser = await _uow.SystemUsers.Query().FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (existingUser != null)
            throw new InvalidOperationException("Email address is already registered.");

        var user = new SystemUser
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Role = request.Role.ToUpper(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _uow.SystemUsers.AddAsync(user);
        await _uow.SaveChangesAsync();
        return MapToUserProfileDto(user);
    }

    public async Task<UserProfileDto?> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _uow.SystemUsers.GetByIdAsync(id);
        if (user == null) return null;

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName.Trim();

        if (request.PhoneNumber != null)
            user.PhoneNumber = request.PhoneNumber.Trim();

        if (!string.IsNullOrWhiteSpace(request.Role))
            user.Role = request.Role.ToUpper();

        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        await _uow.SaveChangesAsync();
        return MapToUserProfileDto(user);
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _uow.SystemUsers.GetByIdAsync(id);
        if (user == null) return false;

        user.IsActive = false; // Soft delete
        await _uow.SaveChangesAsync();
        return true;
    }

    // -----------------------------------------------------------------------
    // NV1-B: Change Password
    // -----------------------------------------------------------------------

    public async Task<bool> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _uow.SystemUsers.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _uow.SaveChangesAsync();
        return true;
    }

    // -----------------------------------------------------------------------
    // Shared Helpers
    // -----------------------------------------------------------------------

    private static UserProfileDto MapToUserProfileDto(SystemUser user) => new()
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

