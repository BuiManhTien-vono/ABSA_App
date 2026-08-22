// Services/Product/ProductService.cs - Product Management Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Core;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Models;
using HigenAbsa.Api.Models.Product;
using HigenAbsa.Api.Models.Review;

namespace HigenAbsa.Api.Services.Product;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(int page, int pageSize, Guid? storeId, string? search);
    Task<ProductDetailDto?> GetProductByIdAsync(Guid id);
    Task<PagedResult<ReviewListDto>> GetProductReviewsAsync(Guid productId, int page, int pageSize, byte? rating, string? sentiment);
    Task<ProductSentimentSummaryDto?> GetProductSentimentSummaryAsync(Guid productId);
}

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ProductDto>> GetProductsAsync(
        int page, int pageSize, Guid? storeId, string? search)
    {
        var query = _db.Products
            .Include(p => p.Store).ThenInclude(s => s!.Platform)
            .AsQueryable();

        if (storeId.HasValue)
            query = query.Where(p => p.StoreId == storeId.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term) ||
                (p.Sku != null && p.Sku.ToLower().Contains(term)) ||
                p.PlatformProductId.ToLower().Contains(term));
        }

        var pagedQuery = query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                StoreId = p.StoreId,
                StoreName = p.Store != null ? p.Store.StoreName : "",
                PlatformCode = p.Store != null && p.Store.Platform != null ? p.Store.Platform.Code : "",
                PlatformProductId = p.PlatformProductId,
                Sku = p.Sku,
                Name = p.Name,
                ImageUrl = p.ImageUrl,
                ProductUrl = p.ProductUrl,
                CategoryName = p.CategoryName,
                CreatedAt = p.CreatedAt,
                ReviewCount = _db.Reviews.Count(r => r.ProductId == p.Id),
                AverageRating = _db.Reviews.Where(r => r.ProductId == p.Id).Any()
                    ? _db.Reviews.Where(r => r.ProductId == p.Id).Average(r => (double)r.Rating) : 0
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(Guid id)
    {
        var product = await _db.Products
            .Include(p => p.Store).ThenInclude(s => s!.Platform)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return null;

        var reviews = _db.Reviews.Where(r => r.ProductId == id);
        var reviewCount = await reviews.CountAsync();
        var avgRating = reviewCount > 0 ? await reviews.AverageAsync(r => (double)r.Rating) : 0;

        var sentimentCounts = await _db.ReviewAIAnalyses
            .Where(a => a.Review != null && a.Review.ProductId == id)
            .GroupBy(a => a.OverallSentiment)
            .Select(g => new { Sentiment = g.Key, Count = g.Count() })
            .ToListAsync();

        return new ProductDetailDto
        {
            Id = product.Id,
            StoreId = product.StoreId,
            StoreName = product.Store?.StoreName ?? "",
            PlatformCode = product.Store?.Platform?.Code ?? "",
            PlatformProductId = product.PlatformProductId,
            Sku = product.Sku,
            Name = product.Name,
            ImageUrl = product.ImageUrl,
            ProductUrl = product.ProductUrl,
            CategoryName = product.CategoryName,
            CreatedAt = product.CreatedAt,
            ReviewCount = reviewCount,
            AverageRating = Math.Round(avgRating, 2),
            PosCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "POS")?.Count ?? 0,
            NeuCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "NEU")?.Count ?? 0,
            NegCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "NEG")?.Count ?? 0
        };
    }

    public async Task<PagedResult<ReviewListDto>> GetProductReviewsAsync(
        Guid productId, int page, int pageSize, byte? rating, string? sentiment)
    {
        var query = _db.Reviews
            .Include(r => r.AIAnalysis)
            .Where(r => r.ProductId == productId);

        if (rating.HasValue)
            query = query.Where(r => r.Rating == rating.Value);

        if (!string.IsNullOrWhiteSpace(sentiment))
            query = query.Where(r => r.AIAnalysis != null && r.AIAnalysis.OverallSentiment == sentiment.ToUpper());

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
                IsSpam = r.AIAnalysis != null ? r.AIAnalysis.IsSpam : false,
                StoreName = r.Store != null ? r.Store.StoreName : null,
                ProductName = r.Product != null ? r.Product.Name : null,
                CustomerName = r.Customer != null ? r.Customer.DisplayName : null
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<ProductSentimentSummaryDto?> GetProductSentimentSummaryAsync(Guid productId)
    {
        var product = await _db.Products.FindAsync(productId);
        if (product == null) return null;

        var reviews = _db.Reviews.Where(r => r.ProductId == productId);
        var totalReviews = await reviews.CountAsync();
        var avgRating = totalReviews > 0 ? await reviews.AverageAsync(r => (double)r.Rating) : 0;

        // Overall sentiment breakdown
        var sentimentCounts = await _db.ReviewAIAnalyses
            .Where(a => a.Review != null && a.Review.ProductId == productId)
            .GroupBy(a => a.OverallSentiment)
            .Select(g => new { Sentiment = g.Key, Count = g.Count() })
            .ToListAsync();

        var totalAnalyzed = sentimentCounts.Sum(s => s.Count);
        var posCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "POS")?.Count ?? 0;
        var neuCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "NEU")?.Count ?? 0;
        var negCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "NEG")?.Count ?? 0;

        // Aspect-level breakdown
        var aspectBreakdown = await _db.ReviewAspects
            .Where(a => a.Review != null && a.Review.ProductId == productId)
            .GroupBy(a => new { a.MacroCategory, a.MicroAspect })
            .Select(g => new AspectSummaryItem
            {
                MacroCategory = g.Key.MacroCategory,
                MicroAspect = g.Key.MicroAspect,
                PosCount = g.Count(x => x.Sentiment == "POS"),
                NeuCount = g.Count(x => x.Sentiment == "NEU"),
                NegCount = g.Count(x => x.Sentiment == "NEG"),
                TotalMentions = g.Count()
            })
            .OrderByDescending(a => a.TotalMentions)
            .ToListAsync();

        return new ProductSentimentSummaryDto
        {
            ProductId = productId,
            ProductName = product.Name,
            TotalReviews = totalReviews,
            AverageRating = Math.Round(avgRating, 2),
            Overall = new SentimentBreakdown
            {
                PosCount = posCount,
                NeuCount = neuCount,
                NegCount = negCount,
                PosPercent = totalAnalyzed > 0 ? Math.Round(100.0 * posCount / totalAnalyzed, 1) : 0,
                NeuPercent = totalAnalyzed > 0 ? Math.Round(100.0 * neuCount / totalAnalyzed, 1) : 0,
                NegPercent = totalAnalyzed > 0 ? Math.Round(100.0 * negCount / totalAnalyzed, 1) : 0
            },
            AspectBreakdown = aspectBreakdown
        };
    }
}
