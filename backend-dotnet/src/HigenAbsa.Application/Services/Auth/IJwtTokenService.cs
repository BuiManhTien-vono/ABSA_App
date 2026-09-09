using System.Security.Claims;
using HigenAbsa.Domain.Entities;

namespace HigenAbsa.Application.Services.Auth;

public interface IJwtTokenService
{
    (string AccessToken, int ExpiresInSeconds) GenerateAccessToken(SystemUser user);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
