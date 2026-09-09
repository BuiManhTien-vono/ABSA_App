// Services/Lazada/ILazadaAuthService.cs - Interface for Lazada OAuth authentication service
using HigenAbsa.Application.DTOs.Lazada;

namespace HigenAbsa.Application.Services.Lazada;

public interface ILazadaAuthService
{
    /// <summary>
    /// Generates the Lazada OAuth Authorization URL for seller login & app consent.
    /// </summary>
    string GetAuthorizationUrl(string? redirectUri = null, string? state = null);

    /// <summary>
    /// Exchanges authorization code for Access Token and Refresh Token (/auth/token/create).
    /// </summary>
    Task<LazadaTokenResponse> CreateTokenAsync(string code);

    /// <summary>
    /// Refreshes expired Access Token using Refresh Token (/auth/token/refresh).
    /// </summary>
    Task<LazadaTokenResponse> RefreshTokenAsync(string refreshToken);
}

