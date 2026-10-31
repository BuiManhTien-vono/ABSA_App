using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Inference.Application.Core;
using HigenAbsa.Modules.Inference.Application.Services;
using HigenAbsa.Modules.Inference.Domain;
using HigenAbsa.Modules.Inference.Infrastructure;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.Inference.Application.Handlers;

/// <summary>
/// Bộ lắng nghe sự kiện: Tự động chạy mô hình AI suy luận ViSoBERT
/// khi một đánh giá mới được tạo ra hoặc đồng bộ từ sàn.
/// </summary>
public sealed class ReviewCreatedEventHandler(
    InferenceDbContext db,
    IInferenceService inferenceService,
    IInMemoryEventBus eventBus) : IIntegrationEventHandler<ReviewCreatedIntegrationEvent>
{
    public async Task HandleAsync(
        ReviewCreatedIntegrationEvent integrationEvent,
        CancellationToken cancellationToken = default)
    {
        var existing = await db.ReviewAIAnalyses
            .AnyAsync(a => a.ReviewId == integrationEvent.ReviewId, cancellationToken);
        if (existing) return;

        var pred = await inferenceService.PredictOneAsync(integrationEvent.ReviewText);

        var aiAnalysis = new ReviewAIAnalysis
        {
            ReviewId = integrationEvent.ReviewId,
            OverallSentiment = pred.OverallSentiment.Label,
            SentimentScore = pred.OverallSentiment.Score,
            IsSpam = pred.Spam,
            IsIntentQa = pred.IntentQa,
            CustomerInsight = pred.Insight?.CustomerInsight,
            RootCause = pred.Insight?.RootCause,
            BusinessRecommendation = pred.Insight?.BusinessRecommendation,
            SuggestedSellerResponse = pred.Insight?.SuggestedSellerResponse,
            ModelVersion = "ViSoBERT-ABSA-v8",
            ProcessedAt = DateTimeOffset.UtcNow
        };
        db.ReviewAIAnalyses.Add(aiAnalysis);

        foreach (var aspect in pred.AspectSentiments)
        {
            db.ReviewAspects.Add(new ReviewAspect
            {
                ReviewId = integrationEvent.ReviewId,
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
                OverrideReason = aspect.OverrideReason
            });
        }

        await db.SaveChangesAsync(cancellationToken);

        await eventBus.PublishAsync(new ReviewAnalyzedIntegrationEvent(
            integrationEvent.ReviewId,
            pred.OverallSentiment.Label,
            pred.OverallSentiment.Score,
            pred.Insight?.RootCause,
            pred.Insight?.SuggestedSellerResponse), cancellationToken);

        if (pred.OverallSentiment.Label == "NEG")
        {
            await eventBus.PublishAsync(new NegativeReviewDetectedIntegrationEvent(
                integrationEvent.ReviewId,
                integrationEvent.StoreId,
                "Khách hàng",
                "",
                $"Đánh giá tiêu cực {integrationEvent.Rating} sao",
                integrationEvent.ReviewText,
                integrationEvent.Rating <= 2 ? "HIGH" : "MEDIUM"), cancellationToken);
        }
    }
}
