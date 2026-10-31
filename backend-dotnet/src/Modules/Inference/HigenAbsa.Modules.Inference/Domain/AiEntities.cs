using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HigenAbsa.SharedKernel.Domain;

namespace HigenAbsa.Modules.Inference.Domain;

[Table("ReviewAIAnalysis", Schema = "inference")]
public class ReviewAIAnalysis : BaseEntity
{
    public Guid ReviewId { get; set; } // Logical reference to coresync.Reviews(Id)

    [Required, MaxLength(30)]
    public string OverallSentiment { get; set; } = "POS"; // POS, NEU, NEG, MIXED

    public float SentimentScore { get; set; }
    public bool IsSpam { get; set; } = false;
    public bool IsIntentQa { get; set; } = false;

    public string? CustomerInsight { get; set; }
    public string? RootCause { get; set; }
    public string? BusinessRecommendation { get; set; }
    public string? SuggestedSellerResponse { get; set; }

    [MaxLength(10)]
    public string Language { get; set; } = "vi";

    [Required, MaxLength(50)]
    public string ModelVersion { get; set; } = "ViSoBERT-ABSA-v8";

    public DateTimeOffset ProcessedAt { get; set; } = DateTimeOffset.UtcNow;
}

[Table("ReviewAspects", Schema = "inference")]
public class ReviewAspect
{
    [Key]
    public long Id { get; set; }

    public Guid ReviewId { get; set; } // Logical reference to coresync.Reviews(Id)

    [Required, MaxLength(50)]
    public string MacroCategory { get; set; } = ""; // PRODUCT, SHIPPING, SERVICE, PRICE, OTHERS

    [Required, MaxLength(100)]
    public string MicroAspect { get; set; } = "";

    [Required, MaxLength(30)]
    public string Sentiment { get; set; } = "POS"; // POS, NEU, NEG

    public float AspectScore { get; set; } = 1.0f;
    public float? AspectThreshold { get; set; }
    public float SentimentScore { get; set; } = 1.0f;
    public float? SentimentThreshold { get; set; }

    [MaxLength(500)]
    public string? EvidenceText { get; set; }
    public int? EvidenceStart { get; set; }
    public int? EvidenceEnd { get; set; }

    [MaxLength(50)]
    public string? EvidenceSource { get; set; }

    [MaxLength(255)]
    public string? OverrideReason { get; set; }
}

[Table("ReviewKeywords", Schema = "inference")]
public class ReviewKeyword
{
    [Key]
    public long Id { get; set; }

    public Guid ReviewId { get; set; } // Logical reference to coresync.Reviews(Id)

    [Required, MaxLength(100)]
    public string Keyword { get; set; } = "";

    public float Weight { get; set; } = 1.0f;
}

