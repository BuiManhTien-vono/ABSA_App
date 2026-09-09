// Models/Inference/ExcelAnalysisDtos.cs - Excel Review Upload & Analysis DTOs
using System.Text.Json.Serialization;
using HigenAbsa.Api.Core;

namespace HigenAbsa.Api.Models.Inference;

public class ExcelAnalysisResultDto
{
    [JsonPropertyName("file_name")]
    public string FileName { get; set; } = "";

    [JsonPropertyName("total_rows")]
    public int TotalRows { get; set; }

    [JsonPropertyName("processed_rows")]
    public int ProcessedRows { get; set; }

    [JsonPropertyName("positive_count")]
    public int PositiveCount { get; set; }

    [JsonPropertyName("neutral_count")]
    public int NeutralCount { get; set; }

    [JsonPropertyName("negative_count")]
    public int NegativeCount { get; set; }

    [JsonPropertyName("positive_percentage")]
    public float PositivePercentage { get; set; }

    [JsonPropertyName("neutral_percentage")]
    public float NeutralPercentage { get; set; }

    [JsonPropertyName("negative_percentage")]
    public float NegativePercentage { get; set; }

    [JsonPropertyName("store_id")]
    public Guid? StoreId { get; set; }

    [JsonPropertyName("store_name")]
    public string? StoreName { get; set; }

    [JsonPropertyName("top_aspects")]
    public List<AspectSummaryDto> TopAspects { get; set; } = [];

    [JsonPropertyName("reviews")]
    public List<AnalyzedReviewRowDto> Reviews { get; set; } = [];
}

public class AspectSummaryDto
{
    [JsonPropertyName("macro_category")]
    public string MacroCategory { get; set; } = "";

    [JsonPropertyName("micro_aspect")]
    public string MicroAspect { get; set; } = "";

    [JsonPropertyName("total_mentions")]
    public int TotalMentions { get; set; }

    [JsonPropertyName("positive_mentions")]
    public int PositiveMentions { get; set; }

    [JsonPropertyName("neutral_mentions")]
    public int NeutralMentions { get; set; }

    [JsonPropertyName("negative_mentions")]
    public int NegativeMentions { get; set; }
}

public class AnalyzedReviewRowDto
{
    [JsonPropertyName("row_index")]
    public int RowIndex { get; set; }

    [JsonPropertyName("product_name")]
    public string? ProductName { get; set; }

    [JsonPropertyName("customer_name")]
    public string? CustomerName { get; set; }

    [JsonPropertyName("rating")]
    public byte Rating { get; set; } = 5;

    [JsonPropertyName("comment_text")]
    public string CommentText { get; set; } = "";

    [JsonPropertyName("overall_sentiment")]
    public string OverallSentiment { get; set; } = "POS";

    [JsonPropertyName("sentiment_score")]
    public float SentimentScore { get; set; }

    [JsonPropertyName("aspect_sentiments")]
    public List<AspectSentimentEntry> AspectSentiments { get; set; } = [];
}
