using HigenAbsa.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using HigenAbsa.Application.Services.Lazada;
using HigenAbsa.Application.Services.Inference;
// Services/Lazada/LazadaAuthService.cs - Lazada OAuth 2.0 flow implementation
using System.Text.Json;
using HigenAbsa.Application.DTOs.Lazada;

namespace HigenAbsa.Infrastructure.Services.Lazada;

public class LazadaAuthService(
    HttpClient httpClient,
    LazadaOptions options,
    ILazadaSignatureService signatureService,
    ILogger<LazadaAuthService> logger) : ILazadaAuthService
{
    public string GetAuthorizationUrl(string? redirectUri = null, string? state = null)
    {
        var callback = !string.IsNullOrWhiteSpace(redirectUri) ? redirectUri : options.CallbackUrl;

        var url = "https://auth.lazada.com/oauth/authorize" +
                  "?response_type=code" +
                  "&force_auth=true" +
                  "&redirect_uri=" + Uri.EscapeDataString(callback) +
                  "&client_id=" + Uri.EscapeDataString(options.AppKey);

        if (!string.IsNullOrWhiteSpace(state))
        {
            url += "&state=" + Uri.EscapeDataString(state);
        }

        return url;
    }

    public async Task<LazadaTokenResponse> CreateTokenAsync(string code)
    {
        const string apiPath = "/auth/token/create";
        string timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();

        var parameters = new Dictionary<string, string>
        {
            { "app_key", options.AppKey },
            { "code", code },
            { "timestamp", timestamp },
            { "sign_method", "sha256" }
        };

        string sign = signatureService.GenerateSign(apiPath, parameters, options.AppSecret);
        parameters.Add("sign", sign);

        string requestUrl = $"{options.AuthBaseUrl.TrimEnd('/')}{apiPath}";
        logger.LogInformation("Calling Lazada CreateToken API: {Url}", requestUrl);

        using var content = new FormUrlEncodedContent(parameters);
        var response = await httpClient.PostAsync(requestUrl, content);
        string responseString = await response.Content.ReadAsStringAsync();

        logger.LogInformation("Lazada CreateToken Response: {Response}", responseString);

        var tokenResponse = JsonSerializer.Deserialize<LazadaTokenResponse>(responseString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        return tokenResponse ?? new LazadaTokenResponse
        {
            Code = "ERROR",
            Message = "Failed to parse token response from Lazada."
        };
    }

    public async Task<LazadaTokenResponse> RefreshTokenAsync(string refreshToken)
    {
        const string apiPath = "/auth/token/refresh";
        string timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();

        var parameters = new Dictionary<string, string>
        {
            { "app_key", options.AppKey },
            { "refresh_token", refreshToken },
            { "timestamp", timestamp },
            { "sign_method", "sha256" }
        };

        string sign = signatureService.GenerateSign(apiPath, parameters, options.AppSecret);
        parameters.Add("sign", sign);

        string requestUrl = $"{options.AuthBaseUrl.TrimEnd('/')}{apiPath}";
        using var content = new FormUrlEncodedContent(parameters);
        var response = await httpClient.PostAsync(requestUrl, content);
        string responseString = await response.Content.ReadAsStringAsync();

        logger.LogInformation("Lazada RefreshToken Response: {Response}", responseString);

        var tokenResponse = JsonSerializer.Deserialize<LazadaTokenResponse>(responseString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        return tokenResponse ?? new LazadaTokenResponse
        {
            Code = "ERROR",
            Message = "Failed to parse refresh token response from Lazada."
        };
    }
}



