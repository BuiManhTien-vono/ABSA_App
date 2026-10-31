using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using HigenAbsa.Modules.Inference.Application.Core;
using HigenAbsa.Modules.Inference.Application.DTOs;
using HigenAbsa.Modules.Inference.Application.Services;
using HigenAbsa.Modules.Inference.Domain;
using HigenAbsa.Modules.Inference.Infrastructure;

namespace HigenAbsa.Modules.Inference.Endpoints;

[ApiController]
public class InferenceController(
    IInferenceService service,
    IServiceScopeFactory scopeFactory,
    ILogger<InferenceController> logger) : ControllerBase
{
    [HttpGet("/health")]
    [HttpGet("/api/v1/inference/health")]
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

    [HttpGet("/labels")]
    [HttpGet("/api/v1/inference/labels")]
    public IActionResult Labels([FromServices] ModelBundle model) =>
        Ok(model.LabelConfig);

    [HttpPost("/predict")]
    [HttpPost("/api/v1/inference/predict")]
    public async Task<IActionResult> Predict([FromBody] PredictRequest request)
    {
        var texts = CleanTexts([request.Text]);
        if (texts == null) return BadRequest(new { detail = "No non-empty text provided" });

        var sw = Stopwatch.StartNew();
        try
        {
            var results = await service.PredictManyAsync(texts, request.NoDomainOverrides);
            var prediction = results[0];

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
            logger.LogError(ex, "Predict failed");
            return StatusCode(500, new { detail = ex.Message });
        }
    }

    [HttpPost("/predict/batch")]
    [HttpPost("/api/v1/inference/predict-batch")]
    public async Task<IActionResult> PredictBatch([FromBody] BatchPredictRequest request)
    {
        var texts = CleanTexts(request.Texts);
        if (texts == null) return BadRequest(new { detail = "No non-empty text provided" });

        var sw = Stopwatch.StartNew();
        try
        {
            var results = await service.PredictManyAsync(texts, request.NoDomainOverrides);

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
            logger.LogError(ex, "PredictBatch failed");
            return StatusCode(500, new { detail = ex.Message });
        }
    }

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

    [HttpPost("/api/v1/inference/upload-excel")]
    [ProducesResponseType(typeof(ExcelAnalysisResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadExcelReviewFile(
        IFormFile file,
        [FromQuery] bool saveToDb = true,
        [FromServices] IExcelAnalysisService excelService = null!)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { detail = "Vui lòng chọn một file Excel (.xlsx, .xls, .csv) để tải lên." });
        }

        string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext != ".xlsx" && ext != ".xls" && ext != ".csv")
        {
            return BadRequest(new { detail = "Định dạng file không được hỗ trợ. Vui lòng tải lên file .xlsx, .xls hoặc .csv." });
        }

        try
        {
            using var stream = file.OpenReadStream();
            var result = await excelService.ProcessExcelStreamAsync(stream, file.FileName, saveToDb);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process Excel upload: {FileName}", file.FileName);
            return StatusCode(500, new { detail = $"Lỗi xử lý file Excel: {ex.Message}" });
        }
    }

    private static List<string>? CleanTexts(IEnumerable<string> raw)
    {
        var cleaned = raw
            .Select(t => t?.Trim() ?? "")
            .Where(t => t.Length > 0)
            .ToList();
        return cleaned.Count > 0 ? cleaned : null;
    }

    private async Task SavePredictionToDbAsync(PredictionResult prediction)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<InferenceDbContext>();

            var reviewId = Guid.NewGuid();
            var aiAnalysis = new ReviewAIAnalysis
            {
                ReviewId = reviewId,
                OverallSentiment = prediction.OverallSentiment.Label,
                SentimentScore = prediction.OverallSentiment.Score,
                IsSpam = prediction.Spam,
                IsIntentQa = prediction.IntentQa,
                CustomerInsight = prediction.Insight?.CustomerInsight,
                RootCause = prediction.Insight?.RootCause,
                BusinessRecommendation = prediction.Insight?.BusinessRecommendation,
                SuggestedSellerResponse = prediction.Insight?.SuggestedSellerResponse,
                ModelVersion = "ViSoBERT-ABSA-v8",
                ProcessedAt = DateTimeOffset.UtcNow
            };
            db.ReviewAIAnalyses.Add(aiAnalysis);

            foreach (var a in prediction.AspectSentiments)
            {
                db.ReviewAspects.Add(new ReviewAspect
                {
                    ReviewId = reviewId,
                    MacroCategory = a.Macro ?? Taxonomy.MicroToMacro.GetValueOrDefault(a.Micro, "OTHERS"),
                    MicroAspect = a.Micro,
                    Sentiment = a.Sentiment,
                    AspectScore = a.AspectScore,
                    AspectThreshold = a.AspectThreshold,
                    SentimentScore = a.SentimentScore,
                    SentimentThreshold = a.SentimentThreshold,
                    EvidenceText = a.Evidence,
                    EvidenceStart = a.EvidenceStart,
                    EvidenceEnd = a.EvidenceEnd,
                    EvidenceSource = a.EvidenceSource,
                    OverrideReason = a.OverrideReason
                });
            }

            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Async DB persistence skipped for prediction");
        }
    }
}
