using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Domain;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.SharedKernel.Common;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.Modules.CoreSync.Application.Services;

public interface IStoreService
{
    Task<List<PlatformDto>> GetPlatformsAsync();
    Task<PagedResult<StoreConnectionDto>> GetStoresAsync(int page, int pageSize, string? search, string? status);
    Task<StoreConnectionDto?> GetStoreByIdAsync(Guid id);
    Task<StoreConnectionDto> CreateStoreAsync(CreateStoreRequest request);
    Task<StoreConnectionDto?> UpdateStoreAsync(Guid id, UpdateStoreRequest request);
    Task<bool> DeleteStoreAsync(Guid id);
    Task<StoreConnectionDto?> SyncStoreAsync(Guid id);
    Task<StoreConnectionDto> SeedMockLazadaStoreAsync();
}

public class StoreService(
    CoreSyncDbContext db,
    IInMemoryEventBus eventBus,
    IInferenceLookupContract inferenceLookup) : IStoreService
{
    public async Task<List<PlatformDto>> GetPlatformsAsync()
    {
        return await db.Platforms
            .Where(p => p.IsActive)
            .OrderBy(p => p.Id)
            .Select(p => new PlatformDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                ApiBaseUrl = p.ApiBaseUrl,
                IsActive = p.IsActive
            })
            .ToListAsync();
    }

    public async Task<PagedResult<StoreConnectionDto>> GetStoresAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = db.StoreConnections
            .Include(s => s.Platform)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(s =>
                s.StoreName.ToLower().Contains(term) ||
                s.StoreCodeOnPlatform.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status.ToUpper());

        int totalCount = await query.CountAsync();
        var stores = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new StoreConnectionDto
            {
                Id = s.Id,
                PlatformId = s.PlatformId,
                PlatformCode = s.Platform != null ? s.Platform.Code : "",
                PlatformName = s.Platform != null ? s.Platform.Name : "",
                StoreName = s.StoreName,
                StoreCodeOnPlatform = s.StoreCodeOnPlatform,
                Status = s.Status,
                LastSyncedAt = s.LastSyncedAt,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                ProductCount = s.Products.Count,
                ReviewCount = s.Reviews.Count
            })
            .ToListAsync();

        return new PagedResult<StoreConnectionDto>(stores, totalCount, page, pageSize);
    }

    public async Task<StoreConnectionDto?> GetStoreByIdAsync(Guid id)
    {
        return await db.StoreConnections
            .Include(s => s.Platform)
            .Where(s => s.Id == id)
            .Select(s => new StoreConnectionDto
            {
                Id = s.Id,
                PlatformId = s.PlatformId,
                PlatformCode = s.Platform != null ? s.Platform.Code : "",
                PlatformName = s.Platform != null ? s.Platform.Name : "",
                StoreName = s.StoreName,
                StoreCodeOnPlatform = s.StoreCodeOnPlatform,
                Status = s.Status,
                LastSyncedAt = s.LastSyncedAt,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                ProductCount = s.Products.Count,
                ReviewCount = s.Reviews.Count
            })
            .FirstOrDefaultAsync();
    }

    public async Task<StoreConnectionDto> CreateStoreAsync(CreateStoreRequest request)
    {
        var platform = await db.Platforms.FindAsync(request.PlatformId)
            ?? throw new InvalidOperationException($"Platform with ID {request.PlatformId} not found.");

        var exists = await db.StoreConnections.AnyAsync(s =>
            s.PlatformId == request.PlatformId &&
            s.StoreCodeOnPlatform == request.StoreCodeOnPlatform);

        if (exists)
            throw new InvalidOperationException($"Store code '{request.StoreCodeOnPlatform}' already exists on platform '{platform.Name}'.");

        var store = new StoreConnection
        {
            Id = Guid.NewGuid(),
            PlatformId = request.PlatformId,
            StoreName = request.StoreName.Trim(),
            StoreCodeOnPlatform = request.StoreCodeOnPlatform.Trim(),
            AccessToken = request.AccessToken,
            RefreshToken = request.RefreshToken,
            Status = "CONNECTED",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.StoreConnections.Add(store);
        await db.SaveChangesAsync();

        return (await GetStoreByIdAsync(store.Id))!;
    }

    public async Task<StoreConnectionDto?> UpdateStoreAsync(Guid id, UpdateStoreRequest request)
    {
        var store = await db.StoreConnections.FindAsync(id);
        if (store == null) return null;

        if (!string.IsNullOrWhiteSpace(request.StoreName))
            store.StoreName = request.StoreName.Trim();

        if (!string.IsNullOrWhiteSpace(request.StoreCodeOnPlatform))
            store.StoreCodeOnPlatform = request.StoreCodeOnPlatform.Trim();

        if (request.AccessToken != null)
            store.AccessToken = request.AccessToken;

        if (request.RefreshToken != null)
            store.RefreshToken = request.RefreshToken;

        if (!string.IsNullOrWhiteSpace(request.Status))
            store.Status = request.Status.ToUpper();

        store.MarkUpdated();
        await db.SaveChangesAsync();

        return await GetStoreByIdAsync(id);
    }

    public async Task<bool> DeleteStoreAsync(Guid id)
    {
        var store = await db.StoreConnections.FindAsync(id);
        if (store == null) return false;

        db.StoreConnections.Remove(store);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<StoreConnectionDto?> SyncStoreAsync(Guid id)
    {
        var store = await db.StoreConnections.FindAsync(id);
        if (store == null) return null;

        store.LastSyncedAt = DateTimeOffset.UtcNow;
        store.MarkUpdated();
        await db.SaveChangesAsync();

        return await GetStoreByIdAsync(id);
    }

    public async Task<StoreConnectionDto> SeedMockLazadaStoreAsync()
    {
        var platform = await db.Platforms.FirstOrDefaultAsync(p => p.Code == "LAZADA")
            ?? await db.Platforms.FirstAsync();

        const string mockStoreCode = "LAZADA_MOCK_OFFICIAL_VN";
        var existing = await db.StoreConnections
            .Include(s => s.Products)
            .Include(s => s.Reviews)
            .FirstOrDefaultAsync(s => s.StoreCodeOnPlatform == mockStoreCode);

        if (existing != null)
        {
            existing.LastSyncedAt = DateTimeOffset.UtcNow;
            existing.MarkUpdated();
            await db.SaveChangesAsync();
            return (await GetStoreByIdAsync(existing.Id))!;
        }

        var store = new StoreConnection
        {
            Id = Guid.NewGuid(),
            PlatformId = platform.Id,
            StoreName = "Lazada Flagship Store - HIGEN Official VN",
            StoreCodeOnPlatform = mockStoreCode,
            AccessToken = "mock_lazada_access_token_889900",
            Status = "CONNECTED",
            LastSyncedAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        db.StoreConnections.Add(store);

        var mockProducts = new List<(string Name, string Sku, string Category, string ImageUrl, List<(string Comment, int Rating, string CustomerName)> Reviews)>
        {
            (
                "Túi Xách Nữ Nắp Gập Da PU Cao Cấp HIGEN-L12",
                "LAZ-BAG-L12",
                "Thời trang nữ",
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300",
                new List<(string, int, string)>
                {
                    ("Túi form chuẩn đẹp, da mềm không có mùi hôi, giao hàng siêu nhanh đóng gói cẩn thận 5 sao", 5, "Thu Hà Nguyễn"),
                    ("Đường may chắc chắn, đựng vừa điện thoại và son phấn rất ưng ý nhé shop", 5, "Minh Thư"),
                    ("Giao sai màu đặt màu be giao màu đen, shipper thái độ khó chịu, rất thất vọng", 1, "Trần Văn Toàn"),
                    ("Chất da bình thường không như hình, khóa kéo hơi rít", 2, "Kim Oanh"),
                    ("Túi xinh xắn đóng hộp đẹp kèm túi vải chống bụi, đáng đồng tiền", 4, "Bích Phương")
                }
            ),
            (
                "Tai Nghe Bluetooth Không Dây True Wireless HIGEN Pods Pro",
                "LAZ-EAR-PODS",
                "Thiết bị điện tử",
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300",
                new List<(string, int, string)>
                {
                    ("Tai nghe chống ồn cực đỉnh, pin trâu dùng liên tục 6 tiếng chưa hết, kết nối nhanh với iPhone", 5, "Hoàng Long"),
                    ("Bass đập chắc, nghe EDM cực đã, mic thu âm đàm thoại rõ ràng không bị rè", 5, "Quốc Bảo"),
                    ("Bị lỗi tai bên trái không sạc được pin, shop đổi trả quá chậm chạp", 1, "Tuấn Anh"),
                    ("Tai nghe ổn trong tầm giá nhưng hộp sạc hơi lỏng lẻo dễ trầy", 3, "Văn Nam")
                }
            )
        };

        int reviewIndex = 1;
        foreach (var prodData in mockProducts)
        {
            var product = new Product
            {
                Id = Guid.NewGuid(),
                StoreId = store.Id,
                PlatformProductId = $"LAZ_ITEM_{store.Id.ToString()[..6]}_{prodData.Sku}",
                Name = prodData.Name,
                Sku = prodData.Sku,
                CategoryName = prodData.Category,
                ImageUrl = prodData.ImageUrl,
                ProductUrl = $"https://www.lazada.vn/products/{prodData.Sku}.html",
                CreatedAt = DateTimeOffset.UtcNow
            };
            db.Products.Add(product);

            foreach (var revData in prodData.Reviews)
            {
                var customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    StoreId = store.Id,
                    PlatformUserId = $"LAZ_USER_{reviewIndex:D5}",
                    DisplayName = revData.CustomerName,
                    TotalReviewsCount = 1,
                    RiskLevel = revData.Rating == 1 ? "POTENTIAL_BOMMER" : "NORMAL",
                    CreatedAt = DateTimeOffset.UtcNow.AddDays(-reviewIndex * 2)
                };
                db.Customers.Add(customer);

                var review = new Review
                {
                    Id = Guid.NewGuid(),
                    StoreId = store.Id,
                    ProductId = product.Id,
                    CustomerId = customer.Id,
                    PlatformReviewId = $"LAZ_REV_MOCK_{reviewIndex:D5}",
                    Rating = (byte)revData.Rating,
                    CommentText = revData.Comment,
                    ReviewCreatedAt = DateTimeOffset.UtcNow.AddDays(-reviewIndex * 2).AddHours(reviewIndex * 3),
                    SyncedAt = DateTimeOffset.UtcNow,
                    Status = revData.Rating <= 2 ? "PENDING" : "REPLIED"
                };
                db.Reviews.Add(review);
                reviewIndex++;
            }
        }

        await db.SaveChangesAsync();

        // Publish events for seeded reviews so other modules react
        var createdReviews = await db.Reviews.Where(r => r.StoreId == store.Id).ToListAsync();
        foreach (var rev in createdReviews)
        {
            await eventBus.PublishAsync(new ReviewCreatedIntegrationEvent(
                rev.Id, store.Id, rev.Rating, rev.CommentText ?? "", rev.ReviewCreatedAt));
        }

        return (await GetStoreByIdAsync(store.Id))!;
    }
}

