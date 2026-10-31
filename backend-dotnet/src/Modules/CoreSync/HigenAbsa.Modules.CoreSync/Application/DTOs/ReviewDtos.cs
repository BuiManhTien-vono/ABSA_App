using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Modules.CoreSync.Application.DTOs;

public class ReviewListDto
{
    public Guid Id { get; set; }
    public string PlatformReviewId { get; set; } = "";
    public byte Rating { get; set; }
    public string? CommentText { get; set; }
    public string Status { get; set; } = "";
    public DateTimeOffset ReviewCreatedAt { get; set; }

    // AI Analysis summary
    public string? OverallSentiment { get; set; }
    public float? SentimentScore { get; set; }
    public bool IsSpam { get; set; }

    // Related names for display
    public string? StoreName { get; set; }
    public string? ProductName { get; set; }
    public string? CustomerName { get; set; }
}

public class ReviewDetailDto : ReviewListDto
{
    public Guid? StoreId { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? CustomerId { get; set; }
    public string? OrderIdOnPlatform { get; set; }
    public string? MediaUrlsJson { get; set; }
    public DateTimeOffset SyncedAt { get; set; }

    public ReviewAIAnalysisDto? AiAnalysis { get; set; }
    public List<ReviewAspectDto> Aspects { get; set; } = [];
    public List<ReviewKeywordDto> Keywords { get; set; } = [];
    public List<ReviewResponseItemDto> Responses { get; set; } = [];
}

public class ReviewAIAnalysisDto
{
    public Guid Id { get; set; }
    public string OverallSentiment { get; set; } = "";
    public float SentimentScore { get; set; }
    public bool IsSpam { get; set; }
    public bool IsIntentQa { get; set; }
    public string? CustomerInsight { get; set; }
    public string? RootCause { get; set; }
    public string? BusinessRecommendation { get; set; }
    public string? SuggestedSellerResponse { get; set; }
    public string ModelVersion { get; set; } = "";
    public DateTimeOffset ProcessedAt { get; set; }
}

public class ReviewAspectDto
{
    public long Id { get; set; }
    public string MacroCategory { get; set; } = "";
    public string MicroAspect { get; set; } = "";
    public string Sentiment { get; set; } = "";
    public float AspectScore { get; set; }
    public float SentimentScore { get; set; }
    public string? EvidenceText { get; set; }
    public string? OverrideReason { get; set; }
}

public class ReviewKeywordDto
{
    public long Id { get; set; }
    public string Keyword { get; set; } = "";
    public float Weight { get; set; }
}

public class ReviewResponseItemDto
{
    public Guid Id { get; set; }
    public string ResponseText { get; set; } = "";
    public string ResponseType { get; set; } = "";
    public string Status { get; set; } = "";
    public string? RespondedByName { get; set; }
    public DateTimeOffset RespondedAt { get; set; }
}

public class UpdateReviewStatusRequest
{
    [Required, RegularExpression("^(PENDING|REPLIED|FAILED|SKIPPED)$",
        ErrorMessage = "Status must be PENDING, REPLIED, FAILED, or SKIPPED")]
    public string Status { get; set; } = "";
}

