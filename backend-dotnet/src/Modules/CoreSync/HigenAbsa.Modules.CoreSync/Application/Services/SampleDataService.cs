using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Domain;
using HigenAbsa.Modules.CoreSync.Infrastructure;

namespace HigenAbsa.Modules.CoreSync.Application.Services;

public record SampleSeedResultDto(
    Guid StoreId,
    string StoreName,
    int ProductsCreated,
    int CustomersCreated,
    int ReviewsCreated,
    IReadOnlyList<Guid> ProductIds);

public interface ISampleDataService
{
    Task<SampleSeedResultDto> SeedCatalogAsync(
        int productCount = 10,
        int reviewsPerProduct = 100,
        Guid? storeId = null,
        CancellationToken cancellationToken = default);
}

public class SampleDataService(CoreSyncDbContext dbContext) : ISampleDataService
{
    private const int MaxProducts = 50;
    private const int MaxReviewsPerProduct = 500;

    private static readonly (string Name, string Category, string SkuPrefix)[] ProductCatalog =
    [
        ("Tai nghe Bluetooth HIGEN AirPro Chống Ồn ANC", "Thiết bị âm thanh", "HIGEN-AUD"),
        ("Sạc dự phòng MagSafe 20000mAh Sạc Nhanh 22.5W", "Phụ kiện điện thoại", "HIGEN-PWR"),
        ("Bàn phím cơ Không dây 75% Gasket Mount RGB", "Thiết bị ngoại vi", "HIGEN-KBD"),
        ("Chuột Gaming Siêu Nhẹ 58g Cảm Biến PAW3395", "Thiết bị ngoại vi", "HIGEN-MSE"),
        ("Áo khoác Gió Chống Nước 2 Lớp Unisex Cao Cấp", "Thời trang nam nữ", "HIGEN-JKT"),
        ("Bình giữ nhiệt Inox 316 Dung Tích 900ml Kèm Ống Hút", "Đồ gia dụng", "HIGEN-BTL"),
        ("Đèn bàn học Chống Cận LED 3 Chế Độ Sáng Cảm Ứng", "Thiết bị chiếu sáng", "HIGEN-LMP"),
        ("Quạt tích điện Mini Cầm Tay Pin 5000mAh Gấp Gọn", "Đồ gia dụng", "HIGEN-FAN"),
        ("Balo Laptop 15.6 inch Chống Sốc Có Cổng Sạc USB", "Túi & Balo", "HIGEN-BAG"),
        ("Nồi chiên không dầu Điện Tử 6.5L Lòng Nồi Chống Dính", "Thiết bị nhà bếp", "HIGEN-AFR")
    ];

    private static readonly (byte Rating, string Comment)[] CommentTemplates =
    [
        (5, "Sản phẩm hoàn thiện cực kỳ chắc chắn, dùng rất mượt và đúng như mô tả của shop. Giao hàng siêu nhanh, đóng gói cẩn thận chống sốc kỹ."),
        (5, "Chất lượng vượt mong đợi trong tầm giá, thiết kế đẹp và sang. Nhân viên CSKH tư vấn nhiệt tình, săn được giá sale nên rất hời."),
        (5, "Mua lần thứ hai ở shop rồi vẫn rất hài lòng. Hàng chính hãng nguyên seal, shipper thân thiện giao đúng hẹn."),
        (4, "Sản phẩm dùng ổn, ngoại hình đẹp, đúng màu đã đặt. Tuy nhiên giao hàng hơi chậm một chút so với dự kiến, hộp ngoài hơi móp nhẹ."),
        (4, "Chất lượng tốt so với giá tiền, đóng gói ổn áp. Giá mà shop phản hồi tin nhắn nhanh hơn thì sẽ cho 5 sao trọn vẹn."),
        (3, "Hàng tạm ổn, dùng được các chức năng cơ bản nhưng chất liệu hơi mỏng hơn hình ảnh quảng cáo. Giao hàng bình thường."),
        (3, "Giá hợp lý nhưng trải nghiệm chưa thực sự ấn tượng, pin/độ bền cần dùng thêm thời gian mới đánh giá chính xác được."),
        (2, "Sản phẩm có lỗi nhẹ ở phần hoàn thiện, nhắn tin cho shop hỏi đổi trả mà chờ phản hồi khá lâu mới thấy trả lời."),
        (1, "Quá thất vọng, hàng nhận về bị trầy xước và hộp móp méo do đóng gói sơ sài. Yêu cầu hỗ trợ hoàn hàng rất mất thời gian."),
        (1, "Chất lượng kém không giống mô tả, sử dụng bị lỗi ngay ngày đầu tiên. Giá cao mà dịch vụ hậu mãi quá tệ.")
    ];

    private static readonly string[] CustomerNames =
    [
        "Nguyễn Minh Anh", "Trần Quốc Bảo", "Lê Thảo Vy", "Phạm Hoàng Nam", "Hoàng Lan Phương",
        "Vũ Đức Thịnh", "Đặng Ngọc Hân", "Bùi Tuấn Kiệt", "Đỗ Khánh Linh", "Ngô Gia Huy",
        "Dương Thanh Tùng", "Phan Mỹ Duyên", "Võ Trọng Nghĩa", "Lý Kim Ngân", "Trịnh Quang Hải"
    ];

    public async Task<SampleSeedResultDto> SeedCatalogAsync(
        int productCount = 10,
        int reviewsPerProduct = 100,
        Guid? storeId = null,
        CancellationToken cancellationToken = default)
    {
        if (productCount is < 1 or > MaxProducts)
            throw new ArgumentOutOfRangeException(nameof(productCount), $"Số sản phẩm phải từ 1 đến {MaxProducts}.");

        if (reviewsPerProduct is < 1 or > MaxReviewsPerProduct)
            throw new ArgumentOutOfRangeException(nameof(reviewsPerProduct), $"Số bình luận mỗi sản phẩm phải từ 1 đến {MaxReviewsPerProduct}.");

        var store = await EnsureDemoStoreAsync(storeId, cancellationToken);
        var batchTag = Guid.NewGuid().ToString("N")[..8].ToUpperInvariant();
        var now = DateTimeOffset.UtcNow;

        var customers = Enumerable.Range(0, CustomerNames.Length)
            .Select(i => new Customer
            {
                Id = Guid.NewGuid(),
                StoreId = store.Id,
                PlatformUserId = $"DEMO_CUST_{batchTag}_{i + 1:D2}",
                DisplayName = CustomerNames[i],
                TotalReviewsCount = Math.Max(1, (productCount * reviewsPerProduct) / CustomerNames.Length),
                RiskLevel = i % 7 == 0 ? "VIP" : "NORMAL",
                CreatedAt = now
            })
            .ToList();

        var products = new List<Product>(productCount);
        var reviews = new List<Review>(productCount * reviewsPerProduct);

        for (var pIdx = 0; pIdx < productCount; pIdx++)
        {
            var template = ProductCatalog[pIdx % ProductCatalog.Length];
            var suffix = pIdx >= ProductCatalog.Length ? $" (Phiên bản {pIdx + 1})" : "";
            var productId = Guid.NewGuid();

            products.Add(new Product
            {
                Id = productId,
                StoreId = store.Id,
                PlatformProductId = $"DEMO_SP_{batchTag}_{pIdx + 1:D3}",
                Sku = $"{template.SkuPrefix}-{batchTag}-{pIdx + 1:D2}",
                Name = $"{template.Name}{suffix}",
                CategoryName = template.Category,
                CreatedAt = now
            });

            for (var rIdx = 0; rIdx < reviewsPerProduct; rIdx++)
            {
                var sample = CommentTemplates[(pIdx + rIdx) % CommentTemplates.Length];
                var customer = customers[(pIdx * 3 + rIdx) % customers.Count];
                var createdAt = now.AddMinutes(-(pIdx * 120 + rIdx * 15));

                reviews.Add(new Review
                {
                    Id = Guid.NewGuid(),
                    StoreId = store.Id,
                    ProductId = productId,
                    CustomerId = customer.Id,
                    PlatformReviewId = $"DEMO_REV_{batchTag}_{pIdx + 1:D2}_{rIdx + 1:D3}",
                    OrderIdOnPlatform = $"ORD_{batchTag}_{pIdx + 1:D2}{rIdx + 1:D3}",
                    Rating = sample.Rating,
                    CommentText = $"[{template.Category}] {sample.Comment} (Đánh giá #{rIdx + 1})",
                    ReviewCreatedAt = createdAt,
                    SyncedAt = now,
                    Status = rIdx % 4 == 0 ? "REPLIED" : "PENDING",
                    CreatedAt = now
                });
            }
        }

        await dbContext.Customers.AddRangeAsync(customers, cancellationToken);
        await dbContext.Products.AddRangeAsync(products, cancellationToken);
        await dbContext.Reviews.AddRangeAsync(reviews, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new SampleSeedResultDto(
            store.Id,
            store.StoreName,
            products.Count,
            customers.Count,
            reviews.Count,
            products.Select(p => p.Id).ToList());
    }

    private async Task<StoreConnection> EnsureDemoStoreAsync(Guid? storeId, CancellationToken cancellationToken)
    {
        if (storeId.HasValue)
        {
            var requestedStore = await dbContext.StoreConnections
                .FirstOrDefaultAsync(s => s.Id == storeId.Value, cancellationToken);
            if (requestedStore != null)
                return requestedStore;
        }

        var existingStore = await dbContext.StoreConnections
            .OrderBy(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingStore != null)
            return existingStore;

        var platform = await dbContext.Platforms
            .OrderBy(p => p.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (platform == null)
        {
            platform = new Platform
            {
                Id = 1,
                Code = "SHOPEE",
                Name = "Shopee Việt Nam",
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };
            dbContext.Platforms.Add(platform);
        }

        var demoStore = new StoreConnection
        {
            Id = Guid.NewGuid(),
            PlatformId = platform.Id,
            StoreName = "HIGEN Demo Official Store",
            StoreCodeOnPlatform = $"HIGEN_DEMO_{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
            Status = "CONNECTED",
            LastSyncedAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        };

        dbContext.StoreConnections.Add(demoStore);
        return demoStore;
    }
}
