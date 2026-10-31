using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Domain;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.SharedKernel.Common;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.CoreSync.Application.Services;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetProductsAsync(int page, int pageSize, Guid? storeId, string? search);
    Task<ProductDetailDto?> GetProductByIdAsync(Guid id);
    Task<PagedResult<ReviewListDto>> GetProductReviewsAsync(Guid productId, int page, int pageSize, byte? rating, string? sentiment);
    Task<ProductSentimentSummaryDto?> GetProductSentimentSummaryAsync(Guid productId);
}

public class ProductService(CoreSyncDbContext db, IInferenceLookupContract inferenceLookup) : IProductService
{
    public async Task<PagedResult<ProductDto>> GetProductsAsync(
        int page, int pageSize, Guid? storeId, string? search)
    {
        var query = db.Products
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

        int totalCount = await query.CountAsync();
        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
                ReviewCount = db.Reviews.Count(r => r.ProductId == p.Id),
                AverageRating = db.Reviews.Where(r => r.ProductId == p.Id).Select(r => (double?)r.Rating).Average() ?? 0
            })
            .ToListAsync();

        return new PagedResult<ProductDto>(products, totalCount, page, pageSize);
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(Guid id)
    {
        var product = await db.Products
            .Include(p => p.Store).ThenInclude(s => s!.Platform)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return null;

        var reviews = await db.Reviews.Where(r => r.ProductId == id).ToListAsync();
        double avgRating = reviews.Count > 0 ? reviews.Average(r => (double)r.Rating) : 0;

        return new ProductDetailDto
        {
            Id = product.Id,
            StoreId = product.StoreId,
            StoreName = product.Store != null ? product.Store.StoreName : "",
            PlatformCode = product.Store != null && product.Store.Platform != null ? product.Store.Platform.Code : "",
            PlatformProductId = product.PlatformProductId,
            Sku = product.Sku,
            Name = product.Name,
            ImageUrl = product.ImageUrl,
            ProductUrl = product.ProductUrl,
            CategoryName = product.CategoryName,
            CreatedAt = product.CreatedAt,
            ReviewCount = reviews.Count,
            AverageRating = Math.Round(avgRating, 1),
            PosCount = reviews.Count(r => r.Rating >= 4),
            NeuCount = reviews.Count(r => r.Rating == 3),
            NegCount = reviews.Count(r => r.Rating <= 2)
        };
    }

    public async Task<PagedResult<ReviewListDto>> GetProductReviewsAsync(
        Guid productId, int page, int pageSize, byte? rating, string? sentiment)
    {
        var query = db.Reviews
            .Include(r => r.Customer)
            .Include(r => r.Store)
            .Include(r => r.Product)
            .Where(r => r.ProductId == productId)
            .AsQueryable();

        if (rating.HasValue)
            query = query.Where(r => r.Rating == rating.Value);

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

    public async Task<ProductSentimentSummaryDto?> GetProductSentimentSummaryAsync(Guid productId)
    {
        var product = await db.Products.FindAsync(productId);
        if (product == null) return null;

        var reviews = await db.Reviews.Where(r => r.ProductId == productId).ToListAsync();
        int total = reviews.Count;
        double avgRating = total > 0 ? reviews.Average(r => (double)r.Rating) : 0;

        int pos = reviews.Count(r => r.Rating >= 4);
        int neu = reviews.Count(r => r.Rating == 3);
        int neg = reviews.Count(r => r.Rating <= 2);

        return new ProductSentimentSummaryDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            TotalReviews = total,
            AverageRating = Math.Round(avgRating, 1),
            Overall = new SentimentBreakdown
            {
                PosCount = pos,
                NeuCount = neu,
                NegCount = neg,
                PosPercent = total > 0 ? Math.Round(100.0 * pos / total, 1) : 0,
                NeuPercent = total > 0 ? Math.Round(100.0 * neu / total, 1) : 0,
                NegPercent = total > 0 ? Math.Round(100.0 * neg / total, 1) : 0
            }
        };
    }
}

