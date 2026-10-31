using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Domain;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.CoreSync.Application.Services;

public interface ILazadaSignatureService
{
    string GenerateSign(string apiPath, IDictionary<string, string> parameters, string appSecret);
}

public class LazadaSignatureService : ILazadaSignatureService
{
    public string GenerateSign(string apiPath, IDictionary<string, string> parameters, string appSecret)
    {
        ArgumentNullException.ThrowIfNull(parameters);
        ArgumentException.ThrowIfNullOrWhiteSpace(appSecret);

        var sortedParams = parameters
            .Where(kvp => kvp.Key != "sign" && !string.IsNullOrEmpty(kvp.Value))
            .OrderBy(kvp => kvp.Key, StringComparer.Ordinal)
            .ToList();

        var sb = new StringBuilder();
        if (!string.IsNullOrEmpty(apiPath))
        {
            sb.Append(apiPath);
        }

        foreach (var (key, val) in sortedParams)
        {
            sb.Append(key).Append(val);
        }

        byte[] keyBytes = Encoding.UTF8.GetBytes(appSecret);
        byte[] inputBytes = Encoding.UTF8.GetBytes(sb.ToString());

        using var hmac = new HMACSHA256(keyBytes);
        byte[] hashBytes = hmac.ComputeHash(inputBytes);

        return Convert.ToHexString(hashBytes);
    }
}

public interface ILazadaAuthService
{
    string GetAuthorizationUrl(string? redirectUri = null, string? state = null);
    Task<LazadaTokenResponse> CreateTokenAsync(string code);
    Task<LazadaTokenResponse> RefreshTokenAsync(string refreshToken);
}

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
        using var content = new FormUrlEncodedContent(parameters);
        var response = await httpClient.PostAsync(requestUrl, content);
        string responseString = await response.Content.ReadAsStringAsync();

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

public interface ILazadaApiService
{
    Task<LazadaReviewListResponse> GetProductReviewListAsync(
        string accessToken,
        long? itemId = null,
        int pageNo = 1,
        int pageSize = 20);

    Task<LazadaSyncResultDto> SyncStoreReviewsAsync(Guid storeId, int maxPages = 3);
}

public class LazadaApiService(
    HttpClient httpClient,
    LazadaOptions options,
    ILazadaSignatureService signatureService,
    CoreSyncDbContext db,
    IInMemoryEventBus eventBus,
    IInferenceLookupContract inferenceLookup,
    ILogger<LazadaApiService> logger) : ILazadaApiService
{
    public async Task<LazadaReviewListResponse> GetProductReviewListAsync(
        string accessToken,
        long? itemId = null,
        int pageNo = 1,
        int pageSize = 20)
    {
        const string apiPath = "/review/seller/list";
        string timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString();

        var parameters = new Dictionary<string, string>
        {
            { "app_key", options.AppKey },
            { "access_token", accessToken },
            { "timestamp", timestamp },
            { "sign_method", "sha256" },
            { "page_no", pageNo.ToString() },
            { "page_size", pageSize.ToString() }
        };

        if (itemId.HasValue && itemId.Value > 0)
        {
            parameters.Add("item_id", itemId.Value.ToString());
        }

        string sign = signatureService.GenerateSign(apiPath, parameters, options.AppSecret);
        parameters.Add("sign", sign);

        string queryString = string.Join("&", parameters.Select(kvp => $"{Uri.EscapeDataString(kvp.Key)}={Uri.EscapeDataString(kvp.Value)}"));
        string requestUrl = $"{options.ApiBaseUrl.TrimEnd('/')}{apiPath}?{queryString}";

        var response = await httpClient.GetAsync(requestUrl);
        string responseString = await response.Content.ReadAsStringAsync();

        var reviewResponse = JsonSerializer.Deserialize<LazadaReviewListResponse>(responseString, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        return reviewResponse ?? new LazadaReviewListResponse
        {
            Code = "ERROR",
            Message = "Failed to deserialize review list from Lazada."
        };
    }

    public async Task<LazadaSyncResultDto> SyncStoreReviewsAsync(Guid storeId, int maxPages = 3)
    {
        var store = await db.StoreConnections.FindAsync(storeId);
        if (store == null)
            throw new InvalidOperationException($"Store with ID '{storeId}' was not found.");

        if (string.IsNullOrWhiteSpace(store.AccessToken))
            throw new InvalidOperationException($"Store '{store.StoreName}' does not have an active Access Token.");

        int syncedCount = 0;
        int skippedCount = 0;
        var savedReviews = new List<ReviewListDto>();

        for (int page = 1; page <= maxPages; page++)
        {
            var lazadaResult = await GetProductReviewListAsync(store.AccessToken, pageNo: page, pageSize: 20);
            if (lazadaResult.Code != "0" || lazadaResult.Data?.Items == null || lazadaResult.Data.Items.Count == 0)
                break;

            foreach (var item in lazadaResult.Data.Items)
            {
                string platformReviewId = $"LAZADA_{item.Id}";
                bool exists = await db.Reviews.AnyAsync(r => r.PlatformReviewId == platformReviewId);
                if (exists)
                {
                    skippedCount++;
                    continue;
                }

                var review = new Review
                {
                    StoreId = store.Id,
                    PlatformReviewId = platformReviewId,
                    Rating = (byte)Math.Clamp(item.Rating, 1, 5),
                    CommentText = item.ReviewContent ?? "",
                    ReviewCreatedAt = DateTimeOffset.FromUnixTimeMilliseconds(item.CreateTime),
                    SyncedAt = DateTimeOffset.UtcNow,
                    Status = "PENDING"
                };

                db.Reviews.Add(review);
                await db.SaveChangesAsync();

                await eventBus.PublishAsync(new ReviewCreatedIntegrationEvent(
                    review.Id, store.Id, review.Rating, review.CommentText, review.ReviewCreatedAt));

                var analysis = await inferenceLookup.GetAnalysisByReviewIdAsync(review.Id);

                savedReviews.Add(new ReviewListDto
                {
                    Id = review.Id,
                    PlatformReviewId = review.PlatformReviewId,
                    Rating = review.Rating,
                    CommentText = review.CommentText,
                    Status = review.Status,
                    ReviewCreatedAt = review.ReviewCreatedAt,
                    StoreName = store.StoreName,
                    OverallSentiment = analysis?.OverallSentiment,
                    SentimentScore = analysis?.Confidence
                });

                syncedCount++;
            }
        }

        store.LastSyncedAt = DateTimeOffset.UtcNow;
        store.MarkUpdated();
        await db.SaveChangesAsync();

        return new LazadaSyncResultDto
        {
            StoreId = store.Id,
            StoreName = store.StoreName,
            SyncedCount = syncedCount,
            SkippedCount = skippedCount,
            SyncedReviews = savedReviews
        };
    }
}

