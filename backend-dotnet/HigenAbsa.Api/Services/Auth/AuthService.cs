// Services/Auth/AuthService.cs - Enterprise Authentication & Token Management Service
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models.Auth;

namespace HigenAbsa.Api.Services.Auth;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress);
    Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken, string ipAddress);
    Task<bool> LogoutAsync(string refreshToken, string ipAddress);
    Task<UserProfileDto?> GetProfileAsync(Guid userId);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IConfiguration _config;
    private readonly int _refreshTokenExpirationDays;

    public AuthService(AppDbContext db, IJwtTokenService jwtTokenService, IConfiguration config)
    {
        _db = db;
        _jwtTokenService = jwtTokenService;
        _config = config;
        _refreshTokenExpirationDays = int.TryParse(_config["Jwt:RefreshTokenExpirationDays"], out var d) ? d : 7;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string ipAddress)
    {
        var existingUser = await _db.SystemUsers.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
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

        _db.SystemUsers.Add(user);
        await _db.SaveChangesAsync();

        return await GenerateAuthResponseAsync(user, ipAddress);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string ipAddress)
    {
        var user = await _db.SystemUsers.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null || !user.IsActive)
            throw new UnauthorizedAccessException("Invalid email or password.");

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
            throw new UnauthorizedAccessException("Invalid email or password.");

        return await GenerateAuthResponseAsync(user, ipAddress);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshTokenStr, string ipAddress)
    {
        var tokenRecord = await _db.Set<RefreshToken>()
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

        _db.Set<RefreshToken>().Add(newRefreshToken);
        await _db.SaveChangesAsync();

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
        var tokenRecord = await _db.Set<RefreshToken>()
            .FirstOrDefaultAsync(r => r.Token == refreshTokenStr);

        if (tokenRecord == null || tokenRecord.IsRevoked)
            return false;

        tokenRecord.IsRevoked = true;
        tokenRecord.RevokedAt = DateTime.UtcNow;
        tokenRecord.RevokedByIp = ipAddress;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
    {
        var user = await _db.SystemUsers.FindAsync(userId);
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

        _db.Set<RefreshToken>().Add(refreshToken);
        await _db.SaveChangesAsync();

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
        var activeTokens = await _db.Set<RefreshToken>()
            .Where(r => r.UserId == userId && !r.IsRevoked)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.IsRevoked = true;
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = ipAddress;
        }

        await _db.SaveChangesAsync();
    }

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
