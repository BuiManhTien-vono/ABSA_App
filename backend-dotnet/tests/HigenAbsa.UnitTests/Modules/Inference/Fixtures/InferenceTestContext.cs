using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using HigenAbsa.Modules.Inference.Application.Core;
using HigenAbsa.Modules.Inference.Application.Handlers;
using HigenAbsa.Modules.Inference.Application.Services;
using HigenAbsa.Modules.Inference.Infrastructure;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.UnitTests.Modules.Inference.Fixtures;

/// <summary>
/// Môi trường kiểm thử cô lập trên RAM (Test Fixture) cho Module 2: Inference (AI Phân tích cảm xúc).
/// Cung cấp InferenceDbContext In-Memory, FakeInferenceService xác định (không phụ thuộc file ONNX nặng)
/// và SpyEventBus để kiểm chứng các sự kiện tích hợp phát ra.
/// </summary>
public sealed class InferenceTestContext : IDisposable
{
    public InferenceDbContext DbContext { get; }
    public FakeInferenceService FakeInferenceService { get; }
    public SpyEventBus EventBus { get; }
    public ExcelAnalysisService ExcelAnalysisService { get; }
    public ReviewCreatedEventHandler ReviewCreatedHandler { get; }

    public InferenceTestContext()
    {
        var options = new DbContextOptionsBuilder<InferenceDbContext>()
            .UseInMemoryDatabase($"HigenInferenceTestDb_{Guid.NewGuid()}")
            .Options;

        DbContext = new InferenceDbContext(options);
        FakeInferenceService = new FakeInferenceService();
        EventBus = new SpyEventBus();

        ExcelAnalysisService = new ExcelAnalysisService(
            FakeInferenceService,
            DbContext,
            EventBus,
            NullLogger<ExcelAnalysisService>.Instance);

        ReviewCreatedHandler = new ReviewCreatedEventHandler(
            DbContext,
            FakeInferenceService,
            EventBus);
    }

    public void Dispose()
    {
        DbContext.Dispose();
    }
}

/// <summary>
/// Bộ giả lập IInferenceService trên RAM giúp kiểm thử chính xác luồng nghiệp vụ AI
/// theo từ khóa tiếng Việt mà không cần nạp file trọng số ONNX.
/// </summary>
public sealed class FakeInferenceService : IInferenceService
{
    public string ModelDir => "in-memory-mock-model";
    public string ModelNameStr => "ViSoBERT-ABSA-v8-TestStub";
    public int MaxLength => 256;
    public string Device => "cpu";
    public int BatchSize => 8;
    public bool NoDomainOverrides => false;

    public Func<string, PredictionResult>? CustomPredictor { get; set; }

    public Task<PredictionResult> PredictOneAsync(string text, bool? noDomainOverrides = null)
    {
        if (CustomPredictor != null)
            return Task.FromResult(CustomPredictor(text));

        var cleaned = TextUtils.CleanText(text);
        var lower = cleaned.ToLowerInvariant();
        bool isNeg = lower.Contains("lỗi") || lower.Contains("hỏng") || lower.Contains("tệ") || lower.Contains("móp") || lower.Contains("chậm");
        bool isNeu = !isNeg && (lower.Contains("tạm") || lower.Contains("bình thường"));
        string overall = isNeg ? "NEG" : isNeu ? "NEU" : "POS";

        var result = new PredictionResult
        {
            Text = text,
            NormalizedText = cleaned,
            OverallSentiment = new OverallSentiment { Label = overall, Score = 0.92f },
            Macros =
            [
                new LabelEntry { Label = isNeg ? "SHIPPING" : "PRODUCT", Score = 0.91f, Threshold = 0.5f }
            ],
            Micros =
            [
                new LabelEntry { Label = isNeg ? "Delivery_Speed" : "Performance_Functionality", Score = 0.91f, Threshold = 0.5f }
            ],
            AspectSentiments =
            [
                new AspectSentimentEntry
                {
                    Macro = isNeg ? "SHIPPING" : "PRODUCT",
                    Micro = isNeg ? "Delivery_Speed" : "Performance_Functionality",
                    Sentiment = overall,
                    AspectScore = 0.91f,
                    SentimentScore = 0.93f,
                    SentimentPassedThreshold = true,
                    Evidence = cleaned
                }
            ]
        };

        result.Insight = Postprocess.BuildTemplateInsight(result);
        return Task.FromResult(result);
    }

    public async Task<List<PredictionResult>> PredictManyAsync(IReadOnlyList<string> texts, bool? noDomainOverrides = null)
    {
        var list = new List<PredictionResult>(texts.Count);
        foreach (var t in texts)
        {
            list.Add(await PredictOneAsync(t, noDomainOverrides));
        }
        return list;
    }
}

/// <summary>
/// Event Bus ghi nhận toàn bộ sự kiện đã phát trên RAM để kiểm chứng trong bước Assert.
/// </summary>
public sealed class SpyEventBus : IInMemoryEventBus
{
    public List<IIntegrationEvent> PublishedEvents { get; } = [];

    public Task PublishAsync<TEvent>(TEvent integrationEvent, CancellationToken cancellationToken = default)
        where TEvent : class, IIntegrationEvent
    {
        PublishedEvents.Add(integrationEvent);
        return Task.CompletedTask;
    }
}
