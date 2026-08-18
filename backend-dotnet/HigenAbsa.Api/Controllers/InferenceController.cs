// Controllers/InferenceController.cs - API endpoints with SQL Server persistence
using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Core;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models;
using HigenAbsa.Api.Services;

namespace HigenAbsa.Api.Controllers;

[ApiController]
public class InferenceController(IInferenceService service, IServiceProvider serviceProvider, ILogger<InferenceController> logger) : ControllerBase
{
    // -----------------------------------------------------------------------
    // Health check
    // -----------------------------------------------------------------------

    [HttpGet("/health")]
    public IActionResult Health() => Ok(new
    {
        status = "ok",
        model_dir = service.ModelDir,
        model_name = service.ModelNameStr,
        max_length = service.MaxLength,
        device = service.Device,
        batch_size = service.BatchSize,
        domain_overrides = !service.NoDomainOverrides,
        database = "SQL Server",
    });

    // -----------------------------------------------------------------------
    // Labels
    // -----------------------------------------------------------------------

    [HttpGet("/labels")]
    public IActionResult Labels([FromServices] ModelBundle model) =>
        Ok(model.LabelConfig);

    // -----------------------------------------------------------------------
    // Single predict
    // -----------------------------------------------------------------------

    [HttpPost("/predict")]
    public async Task<IActionResult> Predict([FromBody] PredictRequest request)
    {
        var texts = CleanTexts([request.Text]);
        if (texts == null) return BadRequest(new { detail = "No non-empty text provided" });

        var sw = Stopwatch.StartNew();
        try
        {
            var results = await service.PredictManyAsync(texts, request.NoDomainOverrides);
            var prediction = results[0];

            // Persist to SQL Server asynchronously
            _ = Task.Run(() => SavePredictionToDbAsync(prediction));

            return Ok(new
            {
                result = prediction,
                elapsed_ms = (int)sw.ElapsedMilliseconds,
                domain_overrides = !(request.NoDomainOverrides == true || service.NoDomainOverrides),
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { detail = ex.Message });
        }
    }

    // -----------------------------------------------------------------------
    // Batch predict
    // -----------------------------------------------------------------------

    [HttpPost("/predict/batch")]
    public async Task<IActionResult> PredictBatch([FromBody] BatchPredictRequest request)
    {
        var texts = CleanTexts(request.Texts);
        if (texts == null) return BadRequest(new { detail = "No non-empty text provided" });

        var sw = Stopwatch.StartNew();
        try
        {
            var results = await service.PredictManyAsync(texts, request.NoDomainOverrides);

            // Persist to SQL Server asynchronously
            _ = Task.Run(async () =>
            {
                foreach (var res in results)
                    await SavePredictionToDbAsync(res);
            });

            return Ok(new
            {
                results,
                count = results.Count,
                elapsed_ms = (int)sw.ElapsedMilliseconds,
                domain_overrides = !(request.NoDomainOverrides == true || service.NoDomainOverrides),
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { detail = ex.Message });
        }
    }

    // -----------------------------------------------------------------------
    // Legacy /api/infer endpoint
    // -----------------------------------------------------------------------

    [HttpPost("/api/infer")]
    public async Task<IActionResult> ApiInfer([FromBody] Dictionary<string, object?> payload)
    {
        var sw = Stopwatch.StartNew();
        bool? noDomainOverrides = payload.TryGetValue("no_domain_overrides", out var ndoVal) && ndoVal is bool b ? b : null;

        if (payload.ContainsKey("texts") && payload["texts"] is System.Text.Json.JsonElement textsEl)
        {
            var rawTexts = textsEl.EnumerateArray().Select(e => e.GetString() ?? "").ToList();
            var texts = CleanTexts(rawTexts);
            if (texts == null) return BadRequest(new { detail = "No non-empty text provided" });
            var results = await service.PredictManyAsync(texts, noDomainOverrides);

            _ = Task.Run(async () =>
            {
                foreach (var res in results)
                    await SavePredictionToDbAsync(res);
            });

            return Ok(new { results, elapsed_ms = (int)sw.ElapsedMilliseconds });
        }

        var text = payload.TryGetValue("text", out var textVal) && textVal is System.Text.Json.JsonElement te
            ? te.GetString() ?? "" : "";
        var singleTexts = CleanTexts([text]);
        if (singleTexts == null) return BadRequest(new { detail = "No non-empty text provided" });
        var result = await service.PredictManyAsync(singleTexts, noDomainOverrides);

        _ = Task.Run(() => SavePredictionToDbAsync(result[0]));

        return Ok(new { result = result[0], elapsed_ms = (int)sw.ElapsedMilliseconds });
    }

    // -----------------------------------------------------------------------
    // Database Persistence Helper
    // -----------------------------------------------------------------------

    private async Task SavePredictionToDbAsync(PredictionResult prediction)
    {
        try
        {
            using var scope = serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var review = new Review
            {
                Id = Guid.NewGuid(),
                PlatformReviewId = $"local_{Guid.NewGuid():N}",
                CommentText = prediction.Text,
                Rating = InferRatingFromOverall(prediction.OverallSentiment.Label),
                Status = "PENDING",
                ReviewCreatedAt = DateTime.UtcNow,
                SyncedAt = DateTime.UtcNow,
            };

            db.Reviews.Add(review);

            var aiAnalysis = new ReviewAIAnalysis
            {
                Id = Guid.NewGuid(),
                ReviewId = review.Id,
                OverallSentiment = prediction.OverallSentiment.Label,
                SentimentScore = prediction.OverallSentiment.Score,
                IsSpam = prediction.Spam,
                IsIntentQa = prediction.IntentQa,
                CustomerInsight = prediction.Insight?.CustomerInsight,
                RootCause = prediction.Insight?.RootCause,
                BusinessRecommendation = prediction.Insight?.BusinessRecommendation,
                SuggestedSellerResponse = prediction.Insight?.SuggestedSellerResponse,
                ModelVersion = "ViSoBERT-ABSA-v8",
                ProcessedAt = DateTime.UtcNow,
            };

            db.ReviewAIAnalyses.Add(aiAnalysis);

            foreach (var aspect in prediction.AspectSentiments)
            {
                db.ReviewAspects.Add(new ReviewAspect
                {
                    ReviewId = review.Id,
                    MacroCategory = aspect.Macro ?? Taxonomy.MicroToMacro.GetValueOrDefault(aspect.Micro, "OTHERS"),
                    MicroAspect = aspect.Micro,
                    Sentiment = aspect.Sentiment,
                    AspectScore = aspect.AspectScore,
                    AspectThreshold = aspect.AspectThreshold,
                    SentimentScore = aspect.SentimentScore,
                    SentimentThreshold = aspect.SentimentThreshold,
                    EvidenceText = aspect.Evidence,
                    EvidenceStart = aspect.EvidenceStart,
                    EvidenceEnd = aspect.EvidenceEnd,
                    EvidenceSource = aspect.EvidenceSource,
                    OverrideReason = aspect.OverrideReason,
                });
            }

            // Auto-create CSKH Ticket for negative reviews
            if (prediction.OverallSentiment.Label == "NEG")
            {
                db.Tickets.Add(new Ticket
                {
                    Id = Guid.NewGuid(),
                    ReviewId = review.Id,
                    CustomerId = Guid.NewGuid(), // Placeholder customer
                    Priority = "HIGH",
                    Status = "OPEN",
                    CreatedAt = DateTime.UtcNow,
                });
            }

            await db.SaveChangesAsync();
            logger.LogInformation("Saved review analysis (ID: {ReviewId}) to SQL Server DB", review.Id);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to persist prediction result to SQL Server DB");
        }
    }

    private static byte InferRatingFromOverall(string overall) => overall switch
    {
        "POS" => 5,
        "NEU" => 3,
        "NEG" => 1,
        _ => 4
    };

    private static List<string>? CleanTexts(IEnumerable<string> texts)
    {
        var cleaned = texts.Select(t => t.Trim()).Where(t => t.Length > 0).ToList();
        return cleaned.Count == 0 ? null : cleaned;
    }
}
