using System.Text.Json.Serialization;

namespace HigenAbsa.Modules.CoreSync.Application.DTOs;

public class LazadaOptions
{
    public const string SectionName = "Lazada";
    public string AppKey { get; set; } = "";
    public string AppSecret { get; set; } = "";
    public string CallbackUrl { get; set; } = "";
    public string AuthBaseUrl { get; set; } = "https://auth.lazada.com/rest";
    public string ApiBaseUrl { get; set; } = "https://api.lazada.vn/rest";
}

public class LazadaTokenResponse
{
    [JsonPropertyName("access_token")]
    public string? AccessToken { get; set; }

    [JsonPropertyName("refresh_token")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("expires_in")]
    public int ExpiresIn { get; set; }

    [JsonPropertyName("refresh_expires_in")]
    public int RefreshExpiresIn { get; set; }

    [JsonPropertyName("account")]
    public string? Account { get; set; }

    [JsonPropertyName("country")]
    public string? Country { get; set; }

    [JsonPropertyName("account_platform")]
    public string? AccountPlatform { get; set; }

    [JsonPropertyName("code")]
    public string? Code { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("request_id")]
    public string? RequestId { get; set; }
}

public class LazadaTokenRequest
{
    public string Code { get; set; } = "";
}

public class LazadaReviewListResponse
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = "0";

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("request_id")]
    public string? RequestId { get; set; }

    [JsonPropertyName("data")]
    public LazadaReviewListData? Data { get; set; }
}

public class LazadaReviewListData
{
    [JsonPropertyName("items")]
    public List<LazadaReviewItem>? Items { get; set; }

    [JsonPropertyName("total")]
    public int Total { get; set; }
}

public class LazadaReviewItem
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("item_id")]
    public long ItemId { get; set; }

    [JsonPropertyName("buyer_name")]
    public string? BuyerName { get; set; }

    [JsonPropertyName("rating")]
    public int Rating { get; set; }

    [JsonPropertyName("review_content")]
    public string? ReviewContent { get; set; }

    [JsonPropertyName("create_time")]
    public long CreateTime { get; set; }
}

public class LazadaSyncResultDto
{
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = "";
    public int SyncedCount { get; set; }
    public int SkippedCount { get; set; }
    public List<ReviewListDto> SyncedReviews { get; set; } = [];
}
