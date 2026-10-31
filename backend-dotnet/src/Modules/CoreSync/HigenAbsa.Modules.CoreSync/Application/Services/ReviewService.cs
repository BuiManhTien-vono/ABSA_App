using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Domain;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.SharedKernel.Common;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.CoreSync.Application.Services;

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

public class ReviewService(CoreSyncDbContext db, IInferenceLookupContract inferenceLookup) : IReviewService
{
    public async Task<PagedResult<ReviewListDto>> GetReviewsAsync(
        int page, int pageSize,
        Guid? storeId, Guid? productId,
        byte? rating, string? sentiment,
        string? status, string? search)
    {
        var query = db.Reviews
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

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status.ToUpper());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(r =>
                (r.CommentText != null && r.CommentText.ToLower().Contains(term)) ||
                r.PlatformReviewId.ToLower().Contains(term));
        }

        int totalCount = await query.CountAsync();
        var reviews = await query
            .OrderByDescending(r => r.ReviewCreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtoList = new List<ReviewListDto>();
        foreach (var r in reviews)
        {
            var analysis = await inferenceLookup.GetAnalysisByReviewIdAsync(r.Id);
            if (!string.IsNullOrWhiteSpace(sentiment) && analysis?.OverallSentiment != sentiment.ToUpper())
                continue;

            dtoList.Add(new ReviewListDto
            {
                Id = r.Id,
                PlatformReviewId = r.PlatformReviewId,
                Rating = r.Rating,
                CommentText = r.CommentText,
                Status = r.Status,
                ReviewCreatedAt = r.ReviewCreatedAt,
                OverallSentiment = analysis?.OverallSentiment,
                SentimentScore = analysis?.Confidence,
                StoreName = r.Store?.StoreName,
                ProductName = r.Product?.Name,
                CustomerName = r.Customer?.DisplayName
            });
        }

        return new PagedResult<ReviewListDto>(dtoList, totalCount, page, pageSize);
    }

    public async Task<ReviewDetailDto?> GetReviewByIdAsync(Guid id)
    {
        var review = await db.Reviews
            .Include(r => r.Store)
            .Include(r => r.Product)
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null) return null;

        var analysis = await inferenceLookup.GetAnalysisByReviewIdAsync(id);

        return new ReviewDetailDto
        {
            Id = review.Id,
            StoreId = review.StoreId,
            ProductId = review.ProductId,
            CustomerId = review.CustomerId,
            PlatformReviewId = review.PlatformReviewId,
            OrderIdOnPlatform = review.OrderIdOnPlatform,
            Rating = review.Rating,
            CommentText = review.CommentText,
            MediaUrlsJson = review.MediaUrlsJson,
            Status = review.Status,
            ReviewCreatedAt = review.ReviewCreatedAt,
            SyncedAt = review.SyncedAt,
            StoreName = review.Store?.StoreName,
            ProductName = review.Product?.Name,
            CustomerName = review.Customer?.DisplayName,
            OverallSentiment = analysis?.OverallSentiment,
            SentimentScore = analysis?.Confidence,
            AiAnalysis = analysis == null ? null : new ReviewAIAnalysisDto
            {
                Id = Guid.NewGuid(),
                OverallSentiment = analysis.OverallSentiment,
                SentimentScore = analysis.Confidence,
                RootCause = analysis.RootCause,
                SuggestedSellerResponse = analysis.SuggestedResponse,
                ProcessedAt = DateTimeOffset.UtcNow
            }
        };
    }

    public async Task<ReviewListDto?> UpdateReviewStatusAsync(Guid id, string status)
    {
        var review = await db.Reviews
            .Include(r => r.Store)
            .Include(r => r.Product)
            .Include(r => r.Customer)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null) return null;

        review.Status = status.ToUpper();
        review.MarkUpdated();
        await db.SaveChangesAsync();

        var analysis = await inferenceLookup.GetAnalysisByReviewIdAsync(id);

        return new ReviewListDto
        {
            Id = review.Id,
            PlatformReviewId = review.PlatformReviewId,
            Rating = review.Rating,
            CommentText = review.CommentText,
            Status = review.Status,
            ReviewCreatedAt = review.ReviewCreatedAt,
            StoreName = review.Store?.StoreName,
            ProductName = review.Product?.Name,
            CustomerName = review.Customer?.DisplayName,
            OverallSentiment = analysis?.OverallSentiment,
            SentimentScore = analysis?.Confidence
        };
    }
}

