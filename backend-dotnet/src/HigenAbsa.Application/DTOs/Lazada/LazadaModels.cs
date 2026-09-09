// Models/Lazada/LazadaModels.cs - Lazada Open Platform DTOs & API Response Models
using System.Text.Json.Serialization;
using HigenAbsa.Application.DTOs.Review;

namespace HigenAbsa.Application.DTOs.Lazada;

/// <summary>
/// Response payload returned by Lazada OAuth token endpoints (/auth/token/create & /auth/token/refresh).
/// </summary>
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

    [JsonPropertyName("detail")]
    public List<LazadaErrorDetail>? Details { get; set; }
}

public class LazadaErrorDetail
{
    [JsonPropertyName("field")]
    public string? Field { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }
}

/// <summary>
/// Individual product review item structure returned by Lazada GetProductReviewList API (/review/seller/list).
/// </summary>
public class LazadaReviewItem
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("review_id")]
    public string? ReviewId { get; set; }

    [JsonPropertyName("item_id")]
    public long ItemId { get; set; }

    [JsonPropertyName("product_title")]
    public string? ProductTitle { get; set; }

    [JsonPropertyName("seller_id")]
    public string? SellerId { get; set; }

    [JsonPropertyName("seller_name")]
    public string? SellerName { get; set; }

    [JsonPropertyName("buyer_id")]
    public string? BuyerId { get; set; }

    [JsonPropertyName("buyer_name")]
    public string? BuyerName { get; set; }

    [JsonPropertyName("rating")]
    public byte Rating { get; set; } = 5;

    [JsonPropertyName("review_content")]
    public string? ReviewContent { get; set; }

    [JsonPropertyName("order_id")]
    public string? OrderId { get; set; }

    [JsonPropertyName("create_time")]
    public string? CreateTime { get; set; }

    [JsonPropertyName("created_at")]
    public DateTime? CreatedAt { get; set; }

    [JsonPropertyName("seller_reply")]
    public string? SellerReply { get; set; }

    [JsonPropertyName("seller_reply_time")]
    public string? SellerReplyTime { get; set; }

    [JsonPropertyName("image_list")]
    public List<string>? ImageList { get; set; }
}

/// <summary>
/// Data wrapper for GetProductReviewList response.
/// </summary>
public class LazadaReviewListData
{
    [JsonPropertyName("data")]
    public List<LazadaReviewItem>? Reviews { get; set; }

    [JsonPropertyName("total")]
    public int Total { get; set; }

    [JsonPropertyName("page_no")]
    public int PageNo { get; set; }

    [JsonPropertyName("page_size")]
    public int PageSize { get; set; }
}

/// <summary>
/// Root response object returned by /review/seller/list API.
/// </summary>
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

/// <summary>
/// DTO returned after triggering a store review sync.
/// </summary>
public class LazadaSyncResultDto
{
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = "";
    public int SyncedCount { get; set; }
    public int SkippedCount { get; set; }
    public List<ReviewListDto> SyncedReviews { get; set; } = [];
}

/// <summary>
/// Request model for manual token generation.
/// </summary>
public class LazadaTokenRequest
{
    public string Code { get; set; } = "";
}

/// <summary>
/// Request model for manual review sync call.
/// </summary>
public class LazadaSyncRequest
{
    public Guid StoreId { get; set; }
    public long? ItemId { get; set; }
    public int PageNo { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
