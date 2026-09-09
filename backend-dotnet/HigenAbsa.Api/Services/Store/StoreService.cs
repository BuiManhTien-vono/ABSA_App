// Services/Store/StoreService.cs - Store Connection & Platform Management Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Core;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models;
using HigenAbsa.Api.Models.Store;

using ProductEntity = HigenAbsa.Api.Data.Entities.Product;
using CustomerEntity = HigenAbsa.Api.Data.Entities.Customer;
using ReviewEntity = HigenAbsa.Api.Data.Entities.Review;

namespace HigenAbsa.Api.Services.Store;

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

public class StoreService : IStoreService
{
    private readonly AppDbContext _db;
    private readonly IInferenceService _inferenceService;

    public StoreService(AppDbContext db, IInferenceService inferenceService)
    {
        _db = db;
        _inferenceService = inferenceService;
    }

    public async Task<List<PlatformDto>> GetPlatformsAsync()
    {
        return await _db.Platforms
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
        var query = _db.StoreConnections
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

        var pagedQuery = query
            .OrderByDescending(s => s.CreatedAt)
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
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<StoreConnectionDto?> GetStoreByIdAsync(Guid id)
    {
        return await _db.StoreConnections
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
        var platform = await _db.Platforms.FindAsync(request.PlatformId)
            ?? throw new InvalidOperationException($"Platform with ID {request.PlatformId} not found.");

        // Check unique StoreCode per platform
        var exists = await _db.StoreConnections.AnyAsync(s =>
            s.PlatformId == request.PlatformId &&
            s.StoreCodeOnPlatform == request.StoreCodeOnPlatform);

        if (exists)
            throw new InvalidOperationException(
                $"Store code '{request.StoreCodeOnPlatform}' already exists on platform '{platform.Name}'.");

        var store = new StoreConnection
        {
            Id = Guid.NewGuid(),
            PlatformId = request.PlatformId,
            StoreName = request.StoreName.Trim(),
            StoreCodeOnPlatform = request.StoreCodeOnPlatform.Trim(),
            AccessToken = request.AccessToken,
            RefreshToken = request.RefreshToken,
            Status = "CONNECTED",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.StoreConnections.Add(store);
        await _db.SaveChangesAsync();

        return (await GetStoreByIdAsync(store.Id))!;
    }

    public async Task<StoreConnectionDto?> UpdateStoreAsync(Guid id, UpdateStoreRequest request)
    {
        var store = await _db.StoreConnections.FindAsync(id);
        if (store == null) return null;

        if (!string.IsNullOrWhiteSpace(request.StoreName))
            store.StoreName = request.StoreName.Trim();

        if (!string.IsNullOrWhiteSpace(request.StoreCodeOnPlatform))
            store.StoreCodeOnPlatform = request.StoreCodeOnPlatform.Trim();

        if (request.AccessToken != null)
        {
            store.AccessToken = request.AccessToken;
            store.Status = "CONNECTED"; // Reset to connected when new token provided
        }

        if (request.RefreshToken != null)
            store.RefreshToken = request.RefreshToken;

        if (!string.IsNullOrWhiteSpace(request.Status))
            store.Status = request.Status.ToUpper();

        store.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetStoreByIdAsync(id);
    }

    public async Task<bool> DeleteStoreAsync(Guid id)
    {
        var store = await _db.StoreConnections
            .Include(s => s.Products)
            .Include(s => s.Reviews)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (store == null) return false;

        if (store.StoreCodeOnPlatform.StartsWith("EXCEL_"))
        {
            var reviewIds = store.Reviews.Select(r => r.Id).ToList();
            var aiAnalyses = await _db.ReviewAIAnalyses.Where(a => reviewIds.Contains(a.ReviewId)).ToListAsync();
            var aspects = await _db.ReviewAspects.Where(a => reviewIds.Contains(a.ReviewId)).ToListAsync();

            _db.ReviewAspects.RemoveRange(aspects);
            _db.ReviewAIAnalyses.RemoveRange(aiAnalyses);
            _db.Reviews.RemoveRange(store.Reviews);
            _db.Products.RemoveRange(store.Products);
            _db.StoreConnections.Remove(store);
        }
        else
        {
            store.Status = "DISCONNECTED";
            store.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<StoreConnectionDto?> SyncStoreAsync(Guid id)
    {
        var store = await _db.StoreConnections.FindAsync(id);
        if (store == null) return null;

        // Simulate sync — in production, this would call the platform API
        store.LastSyncedAt = DateTime.UtcNow;
        store.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GetStoreByIdAsync(id);
    }

    public async Task<StoreConnectionDto> SeedMockLazadaStoreAsync()
    {
        var platform = await _db.Platforms.FirstOrDefaultAsync(p => p.Code == "LAZADA")
            ?? await _db.Platforms.FirstAsync();

        const string mockStoreCode = "LAZADA_MOCK_OFFICIAL_VN";
        var existing = await _db.StoreConnections
            .Include(s => s.Products)
            .Include(s => s.Reviews)
            .FirstOrDefaultAsync(s => s.StoreCodeOnPlatform == mockStoreCode);

        if (existing != null)
        {
            existing.LastSyncedAt = DateTime.UtcNow;
            existing.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
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
            LastSyncedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.StoreConnections.Add(store);

        var mockProducts = new List<(string Name, string Sku, string Category, string ImageUrl, List<(string Comment, int Rating, string CustomerName)> Reviews)>
        {
            (
                "Túi Xách Nữ Nắp Gập Da PU Cao Cấp HIGEN-L12",
                "LAZ-BAG-L12",
                "Thời trang nữ",
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300",
                new()
                {
                    ("Túi xinh xắn lắm nha, da mềm mịn đường may chắc chắn. Đóng gói cẩn thận 2 lớp nilon chống sốc. Giao hàng cực nhanh mới đặt hôm qua hôm nay đã nhận được!", 5, "Nguyễn Thu Hà"),
                    ("Hàng giống hình, form túi đứng dáng màu be sang xỉu. Tuy nhiên hộp hơi bị móp một chút do bên vận chuyển quăng quật nhưng may túi không bị làm sao.", 4, "Lê Mai Anh"),
                    ("Giá rẻ mua đợt sale lềnh lềnh mà chất lượng vượt mong đợi. Rất đáng tiền nên mua nhé mng!", 5, "Trần Thanh Hương")
                }
            ),
            (
                "Giày Sneaker Nam Thể Thao Dệt Kim Thoáng Khí HIGEN-S05",
                "LAZ-SHOES-S05",
                "Giày dép nam",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
                new()
                {
                    ("Giày êm chân, đế cao su bám đường tốt chạy bộ mượt mà. Form chuẩn size vừa in.", 5, "Phạm Quốc Bảo"),
                    ("Vải dệt kim thoáng khí mang không bị hôi chân. Giao đúng màu đúng size shop tư vấn nhiệt tình.", 5, "Vũ Hoàng Long"),
                    ("Giao sai màu rồi shop ơi, đặt màu đen mà giao màu xám. Đề nghị shop đổi lại giúp mình!", 2, "Đặng Minh Quân")
                }
            ),
            (
                "Áo Sơ Mi Nam Tay Dài Chống Nhăn Cotton Premium",
                "LAZ-SHIRT-M01",
                "Thời trang nam",
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300",
                new()
                {
                    ("Vải cotton mềm mát giặt không xù lông không bị nhăn nhiều. Mặc đi làm công sở rất lịch sự.", 5, "Hoàng Văn Nam"),
                    ("Áo mỏng hơn mình nghĩ, đường chỉ thừa ở cổ áo hơi nhiều. Giá này thì tạm chấp nhận được.", 3, "Đỗ Đức Anh")
                }
            ),
            (
                "Bàn Phím Cơ Không Dây Bluetooth RGB 87 Phím HIGEN-K87",
                "LAZ-TECH-K87",
                "Phụ kiện máy tính",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300",
                new()
                {
                    ("Gõ sướng tay, switch nảy êm không bị ồn quá. Đèn led RGB nhiều chế độ cực đẹp mắt.", 5, "Trần Tuấn Kiệt"),
                    ("Pin trâu dùng cả tuần chưa phải sạc. Kết nối bluetooth với ipad với laptop mượt mà không bị trễ.", 5, "Bùi Việt Hùng"),
                    ("Bị liệt phím Space sau 3 ngày dùng! Chat với shop thì phản hồi rất chậm bực cả mình.", 1, "Nguyễn Khánh Duy")
                }
            ),
            (
                "Tai Nghe True Wireless Chống Ồn ANC Bluetooth 5.3 HIGEN-TWS02",
                "LAZ-AUDIO-T02",
                "Thiết bị âm thanh",
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300",
                new()
                {
                    ("Âm bass đầm chắc, chống ồn chủ động ANC hoạt động hiệu quả khi đi xe bus. Đáng tiền lắm!", 5, "Lê Hoàng Yến"),
                    ("Tai nghe đeo êm tai không bị đau, míc đàm thoại rõ ràng không bị rè.", 5, "Phạm Mỹ Duyên")
                }
            ),
            (
                "Son Kem Lỳ Mịn Mượt Nhung HIGEN Velvet Lip Tint",
                "LAZ-BEAUTY-V08",
                "Mỹ phẩm & Làm đẹp",
                "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300",
                new()
                {
                    ("Màu son đất xinh xỉu lên môi chuẩn màu không bị khô môi. Thỏi son thiết kế sang trọng.", 5, "Vũ Thùy Linh"),
                    ("Hàng chính hãng tem mác đầy đủ. Shop tặng kèm thêm mặt nạ dưỡng da rất dễ thương.", 5, "Đinh Bảo Ngọc")
                }
            ),
            (
                "Ví Nam Dáng Ngắn Da Bò Thật Chống Trộm RFID HIGEN-W03",
                "LAZ-WALLET-W03",
                "Phụ kiện nam",
                "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300",
                new()
                {
                    ("Da bò thật thơm mùi da, nhiều ngăn đựng thẻ tiện lợi. Hộp đựng bọc quà lịch sự làm quà tặng rất hợp.", 5, "Nguyễn Đức Trọng"),
                    ("Shipper giao hàng thái độ cộc lốc khó chịu, gọi điện mắng khách vì không nghe máy kịp.", 1, "Trần Văn Huy")
                }
            )
        };

        foreach (var pData in mockProducts)
        {
            var product = new ProductEntity
            {
                Id = Guid.NewGuid(),
                StoreId = store.Id,
                PlatformProductId = $"LAZ_PROD_{pData.Sku}",
                Sku = pData.Sku,
                Name = pData.Name,
                CategoryName = pData.Category,
                ImageUrl = pData.ImageUrl,
                ProductUrl = "https://www.lazada.vn/products/mock-p1.html",
                CreatedAt = DateTime.UtcNow
            };
            _db.Products.Add(product);

            foreach (var rData in pData.Reviews)
            {
                var customer = new CustomerEntity
                {
                    Id = Guid.NewGuid(),
                    StoreId = store.Id,
                    PlatformUserId = $"LAZ_CUST_{Guid.NewGuid().ToString().Substring(0, 8)}",
                    DisplayName = rData.CustomerName,
                    AvatarUrl = null,
                    RiskLevel = rData.Rating <= 2 ? "POTENTIAL_BOMMER" : "NORMAL",
                    CreatedAt = DateTime.UtcNow
                };
                _db.Customers.Add(customer);

                var review = new ReviewEntity
                {
                    Id = Guid.NewGuid(),
                    StoreId = store.Id,
                    ProductId = product.Id,
                    CustomerId = customer.Id,
                    PlatformReviewId = $"LAZ_REV_{Guid.NewGuid().ToString().Substring(0, 8)}",
                    Rating = (byte)rData.Rating,
                    CommentText = rData.Comment,
                    Status = rData.Rating <= 2 ? "ESCALATED" : "PROCESSED",
                    ReviewCreatedAt = DateTime.UtcNow.AddHours(-Random.Shared.Next(1, 72))
                };
                _db.Reviews.Add(review);

                try
                {
                    var pred = await _inferenceService.PredictOneAsync(rData.Comment);
                    var aiAnalysis = new ReviewAIAnalysis
                    {
                        Id = Guid.NewGuid(),
                        ReviewId = review.Id,
                        OverallSentiment = pred.OverallSentiment?.Label ?? (rData.Rating >= 4 ? "POS" : rData.Rating == 3 ? "NEU" : "NEG"),
                        SentimentScore = pred.OverallSentiment?.Score ?? (rData.Rating >= 4 ? 0.95f : rData.Rating == 3 ? 0.90f : 0.95f),
                        CustomerInsight = pred.Insight?.CustomerInsight,
                        RootCause = pred.Insight?.RootCause,
                        BusinessRecommendation = pred.Insight?.BusinessRecommendation,
                        SuggestedSellerResponse = pred.Insight?.SuggestedSellerResponse,
                        ProcessedAt = DateTime.UtcNow
                    };
                    _db.ReviewAIAnalyses.Add(aiAnalysis);

                    foreach (var asp in pred.AspectSentiments ?? [])
                    {
                        _db.ReviewAspects.Add(new ReviewAspect
                        {
                            ReviewId = review.Id,
                            MacroCategory = asp.Macro ?? "OTHERS",
                            MicroAspect = asp.Micro,
                            Sentiment = asp.Sentiment,
                            AspectScore = asp.AspectScore,
                            SentimentScore = asp.SentimentScore
                        });
                    }
                }
                catch
                {
                    var fallbackSentiment = rData.Rating >= 4 ? "POS" : rData.Rating == 3 ? "NEU" : "NEG";
                    _db.ReviewAIAnalyses.Add(new ReviewAIAnalysis
                    {
                        Id = Guid.NewGuid(),
                        ReviewId = review.Id,
                        OverallSentiment = fallbackSentiment,
                        SentimentScore = rData.Rating >= 4 ? 0.95f : rData.Rating == 3 ? 0.90f : 0.95f,
                        ProcessedAt = DateTime.UtcNow
                    });
                }
            }
        }

        await _db.SaveChangesAsync();
        return (await GetStoreByIdAsync(store.Id))!;
    }
}
