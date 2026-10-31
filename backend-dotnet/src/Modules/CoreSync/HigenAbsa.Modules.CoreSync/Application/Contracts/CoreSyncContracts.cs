using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.CoreSync.Application.Contracts;

public class CoreSyncStoreLookupService(CoreSyncDbContext db) : IStoreLookupContract
{
    public async Task<StoreContractDto?> GetByIdAsync(Guid storeId, CancellationToken cancellationToken = default)
    {
        var store = await db.StoreConnections
            .Include(s => s.Platform)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == storeId, cancellationToken);

        return store is null ? null : new StoreContractDto(
            store.Id,
            store.StoreName,
            store.PlatformId,
            store.Platform?.Code ?? "",
            store.Status);
    }

    public async Task<List<StoreContractDto>> GetAllActiveStoresAsync(CancellationToken cancellationToken = default)
    {
        return await db.StoreConnections
            .Include(s => s.Platform)
            .AsNoTracking()
            .Where(s => s.Status == "CONNECTED")
            .Select(s => new StoreContractDto(
                s.Id,
                s.StoreName,
                s.PlatformId,
                s.Platform != null ? s.Platform.Code : "",
                s.Status))
            .ToListAsync(cancellationToken);
    }
}

public class CoreSyncReviewLookupService(CoreSyncDbContext db) : IReviewLookupContract
{
    public async Task<ReviewContractDto?> GetByIdAsync(Guid reviewId, CancellationToken cancellationToken = default)
    {
        var review = await db.Reviews
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == reviewId, cancellationToken);

        return review is null ? null : new ReviewContractDto(
            review.Id,
            review.StoreId ?? Guid.Empty,
            review.Rating,
            review.CommentText ?? "",
            review.ReviewCreatedAt,
            review.Status);
    }

    public async Task<int> GetCountByDateRangeAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
    {
        var query = db.Reviews.AsQueryable();
        if (from.HasValue)
        {
            var fromOffset = new DateTimeOffset(from.Value);
            query = query.Where(r => r.ReviewCreatedAt >= fromOffset);
        }
        if (to.HasValue)
        {
            var toOffset = new DateTimeOffset(to.Value);
            query = query.Where(r => r.ReviewCreatedAt <= toOffset);
        }

        return await query.CountAsync(cancellationToken);
    }
}

