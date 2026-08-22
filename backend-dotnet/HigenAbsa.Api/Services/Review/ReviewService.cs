// Services/Review/ReviewService.cs - Review Management Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Core;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Models;
using HigenAbsa.Api.Models.Review;

namespace HigenAbsa.Api.Services.Review;

public interface IReviewService
{
    Task<PagedResult<ReviewListDto>> GetReviewsAsync(
        int page, int pageSize,
        Guid? storeId, Guid? productId,
        byte? rating, string? sentiment,
        string? status, string? search);
    Task<ReviewDetailDto?> GetReviewByIdAsync(Guid id);
    Task<ReviewListDto?> UpdateReviewStatusAsync(Guid id, string status);
}

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ReviewListDto>> GetReviewsAsync(
        int page, int pageSize,
        Guid? storeId, Guid? productId,
        byte? rating, string? sentiment,
        string? status, string? search)
    {
        var query = _db.Reviews
            .Include(r => r.AIAnalysis)
            .Include(r => r.Store)
            .Include(r => r.Product)
            .Include(r => r.Customer)
            .AsQueryable();

        if (storeId.HasValue)
            query = query.Where(r => r.StoreId == storeId.Value);

        if (productId.HasValue)
            query = query.Where(r => r.ProductId == productId.Value);

        if (rating.HasValue)
            query = query.Where(r => r.Rating == rating.Value);

        if (!string.IsNullOrWhiteSpace(sentiment))
            query = query.Where(r => r.AIAnalysis != null && r.AIAnalysis.OverallSentiment == sentiment.ToUpper());

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status.ToUpper());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(r =>
                (r.CommentText != null && r.CommentText.ToLower().Contains(term)) ||
                r.PlatformReviewId.ToLower().Contains(term));
        }

        var pagedQuery = query
            .OrderByDescending(r => r.ReviewCreatedAt)
            .Select(r => new ReviewListDto
            {
                Id = r.Id,
                PlatformReviewId = r.PlatformReviewId,
                Rating = r.Rating,
                CommentText = r.CommentText,
                Status = r.Status,
                ReviewCreatedAt = r.ReviewCreatedAt,
                OverallSentiment = r.AIAnalysis != null ? r.AIAnalysis.OverallSentiment : null,
                SentimentScore = r.AIAnalysis != null ? r.AIAnalysis.SentimentScore : null,
                IsSpam = r.AIAnalysis != null && r.AIAnalysis.IsSpam,
                StoreName = r.Store != null ? r.Store.StoreName : null,
                ProductName = r.Product != null ? r.Product.Name : null,
                CustomerName = r.Customer != null ? r.Customer.DisplayName : null
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<ReviewDetailDto?> GetReviewByIdAsync(Guid id)
    {
        var review = await _db.Reviews
            .Include(r => r.Store)
            .Include(r => r.Product)
            .Include(r => r.Customer)
            .Include(r => r.AIAnalysis)
            .Include(r => r.Aspects)
            .Include(r => r.Keywords)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null) return null;

        // Get responses for this review
        var responses = await _db.ReviewResponses
            .Include(rr => rr.RespondedByUser)
            .Where(rr => rr.ReviewId == id)
            .OrderByDescending(rr => rr.RespondedAt)
            .Select(rr => new ReviewResponseItemDto
            {
                Id = rr.Id,
                ResponseText = rr.ResponseText,
                ResponseType = rr.ResponseType,
                Status = rr.Status,
                RespondedByName = rr.RespondedByUser != null ? rr.RespondedByUser.FullName : null,
                RespondedAt = rr.RespondedAt
            })
            .ToListAsync();

        return new ReviewDetailDto
        {
            Id = review.Id,
            PlatformReviewId = review.PlatformReviewId,
            Rating = review.Rating,
            CommentText = review.CommentText,
            Status = review.Status,
            ReviewCreatedAt = review.ReviewCreatedAt,
            StoreId = review.StoreId,
            ProductId = review.ProductId,
            CustomerId = review.CustomerId,
            OrderIdOnPlatform = review.OrderIdOnPlatform,
            MediaUrlsJson = review.MediaUrlsJson,
            SyncedAt = review.SyncedAt,
            OverallSentiment = review.AIAnalysis?.OverallSentiment,
            SentimentScore = review.AIAnalysis?.SentimentScore,
            IsSpam = review.AIAnalysis?.IsSpam ?? false,
            StoreName = review.Store?.StoreName,
            ProductName = review.Product?.Name,
            CustomerName = review.Customer?.DisplayName,
            AiAnalysis = review.AIAnalysis != null ? new ReviewAIAnalysisDto
            {
                Id = review.AIAnalysis.Id,
                OverallSentiment = review.AIAnalysis.OverallSentiment,
                SentimentScore = review.AIAnalysis.SentimentScore,
                IsSpam = review.AIAnalysis.IsSpam,
                IsIntentQa = review.AIAnalysis.IsIntentQa,
                CustomerInsight = review.AIAnalysis.CustomerInsight,
                RootCause = review.AIAnalysis.RootCause,
                BusinessRecommendation = review.AIAnalysis.BusinessRecommendation,
                SuggestedSellerResponse = review.AIAnalysis.SuggestedSellerResponse,
                ModelVersion = review.AIAnalysis.ModelVersion,
                ProcessedAt = review.AIAnalysis.ProcessedAt
            } : null,
            Aspects = review.Aspects.Select(a => new ReviewAspectDto
            {
                Id = a.Id,
                MacroCategory = a.MacroCategory,
                MicroAspect = a.MicroAspect,
                Sentiment = a.Sentiment,
                AspectScore = a.AspectScore,
                SentimentScore = a.SentimentScore,
                EvidenceText = a.EvidenceText,
                OverrideReason = a.OverrideReason
            }).ToList(),
            Keywords = review.Keywords.Select(k => new ReviewKeywordDto
            {
                Id = k.Id,
                Keyword = k.Keyword,
                Weight = k.Weight
            }).ToList(),
            Responses = responses
        };
    }

    public async Task<ReviewListDto?> UpdateReviewStatusAsync(Guid id, string status)
    {
        var review = await _db.Reviews
            .Include(r => r.AIAnalysis)
            .Include(r => r.Store)
            .Include(r => r.Product)
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null) return null;

        review.Status = status.ToUpper();
        await _db.SaveChangesAsync();

        return new ReviewListDto
        {
            Id = review.Id,
            PlatformReviewId = review.PlatformReviewId,
            Rating = review.Rating,
            CommentText = review.CommentText,
            Status = review.Status,
            ReviewCreatedAt = review.ReviewCreatedAt,
            OverallSentiment = review.AIAnalysis?.OverallSentiment,
            SentimentScore = review.AIAnalysis?.SentimentScore,
            IsSpam = review.AIAnalysis?.IsSpam ?? false,
            StoreName = review.Store?.StoreName,
            ProductName = review.Product?.Name,
            CustomerName = review.Customer?.DisplayName
        };
    }
}
