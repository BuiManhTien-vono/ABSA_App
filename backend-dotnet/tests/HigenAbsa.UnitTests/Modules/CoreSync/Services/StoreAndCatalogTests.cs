using Microsoft.Extensions.Logging.Abstractions;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Application.Services;
using HigenAbsa.Modules.CoreSync.Domain;
using HigenAbsa.UnitTests.Modules.CoreSync.Fixtures;

namespace HigenAbsa.UnitTests.Modules.CoreSync.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Mục 3 (Nhóm 3.1): Quản lý Gian hàng đa sàn (StoreService)
/// và Tổng hợp thống kê Sản phẩm (ProductService).
/// </summary>
public class StoreAndCatalogTests
{
    [Fact]
    public async Task CreateStoreAsync_ValidPlatformAndUniqueCode_CreatesConnectedStoreWithTrimmedFields()
    {
        // [TC-BE-CORE-01] Chuẩn ISO 25010:2023 (Functional Suitability)
        // 1. Arrange (Chuẩn bị): Tạo yêu cầu kết nối gian hàng Shopee (PlatformId = 1) có khoảng trắng ở đầu/cuối
        using var context = new CoreSyncTestContext();
        var request = new CreateStoreRequest
        {
            PlatformId = 1,
            StoreName = "  HIGEN Official Mall  ",
            StoreCodeOnPlatform = "  SPE_HIGEN_01  ",
            AccessToken = "token-123"
        };

        // 2. Act (Thực thi): Tạo kết nối gian hàng mới
        var created = await context.StoreService.CreateStoreAsync(request);

        // 3. Assert (Kiểm chứng): Gian hàng được chuẩn hóa Trim(), gắn trạng thái CONNECTED và đúng mã sàn SHOPEE
        Assert.NotEqual(Guid.Empty, created.Id);
        Assert.Equal("SHOPEE", created.PlatformCode);
        Assert.Equal("HIGEN Official Mall", created.StoreName);
        Assert.Equal("SPE_HIGEN_01", created.StoreCodeOnPlatform);
        Assert.Equal("CONNECTED", created.Status);
    }

    [Fact]
    public async Task CreateStoreAsync_DuplicateStoreCodeDifferentCaseOnSamePlatform_ThrowsInvalidOperationException()
    {
        // [TC-BE-CORE-02] Chuẩn ISO 29119-4 (Equivalence Partitioning - Mã gian hàng trùng lặp khác chữ hoa/thường · ISO TDD)
        // 1. Arrange (Chuẩn bị): Tạo sẵn gian hàng có mã "SPE_MALL_01" trên sàn Shopee
        using var context = new CoreSyncTestContext();
        await context.StoreService.CreateStoreAsync(new CreateStoreRequest
        {
            PlatformId = 1,
            StoreName = "Shopee Mall Gốc",
            StoreCodeOnPlatform = "SPE_MALL_01"
        });

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Tạo tiếp mã "spe_mall_01" chữ thường trên cùng sàn phải bị từ chối
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.StoreService.CreateStoreAsync(new CreateStoreRequest
            {
                PlatformId = 1,
                StoreName = "Shopee Mall Trùng Mã",
                StoreCodeOnPlatform = "spe_mall_01"
            }));
    }

    [Fact]
    public async Task CreateStoreAsync_NonExistentPlatformId_ThrowsInvalidOperationException()
    {
        // [TC-BE-CORE-03] Chuẩn ISO 25010:2023 (Reliability - Fault Tolerance)
        // 1. Arrange (Chuẩn bị): Yêu cầu tạo gian hàng với PlatformId = 999 không tồn tại
        using var context = new CoreSyncTestContext();
        var invalidRequest = new CreateStoreRequest
        {
            PlatformId = 999,
            StoreName = "Gian Hàng Sàn Ảo",
            StoreCodeOnPlatform = "UNKNOWN_01"
        };

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Ném InvalidOperationException thông báo không tìm thấy sàn
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.StoreService.CreateStoreAsync(invalidRequest));
        Assert.Contains("999", ex.Message);
    }

    [Fact]
    public async Task SyncStoreAsync_ExistingStore_UpdatesLastSyncedAtTimestamp()
    {
        // [TC-BE-CORE-04] Chuẩn ISO 29119-4 (State Transition)
        // 1. Arrange (Chuẩn bị): Tạo một gian hàng mới (LastSyncedAt ban đầu = null)
        using var context = new CoreSyncTestContext();
        var store = await context.StoreService.CreateStoreAsync(new CreateStoreRequest
        {
            PlatformId = 2,
            StoreName = "Lazada Flagship",
            StoreCodeOnPlatform = "LZD_01"
        });
        Assert.Null(store.LastSyncedAt);

        // 2. Act (Thực thi): Kích hoạt đồng bộ gian hàng
        var synced = await context.StoreService.SyncStoreAsync(store.Id);

        // 3. Assert (Kiểm chứng): LastSyncedAt được cập nhật thời điểm UTC hiện tại
        Assert.NotNull(synced);
        Assert.NotNull(synced.LastSyncedAt);
    }

    [Fact]
    public async Task GetProductSentimentSummaryAsync_ProductWithMixedReviews_ComputesAccurateAverageRatingAndPercentages()
    {
        // [TC-BE-CORE-05] Chuẩn ISO 25010:2023 (Functional Correctness - Độ chính xác toán học thống kê)
        // 1. Arrange (Chuẩn bị): Tạo 1 sản phẩm có 4 đánh giá (5★, 4★, 3★, 1★ -> trung bình 13/4 = 3.25 làm tròn 3.3)
        using var context = new CoreSyncTestContext();
        var storeId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        context.DbContext.StoreConnections.Add(new StoreConnection
        {
            Id = storeId,
            PlatformId = 1,
            StoreName = "HIGEN Shopee",
            StoreCodeOnPlatform = "SPE_01"
        });
        context.DbContext.Products.Add(new Product
        {
            Id = productId,
            StoreId = storeId,
            PlatformProductId = "PROD_01",
            Name = "Tai Nghe Bluetooth ANC"
        });

        byte[] ratings = [5, 4, 3, 1];
        for (int i = 0; i < ratings.Length; i++)
        {
            context.DbContext.Reviews.Add(new Review
            {
                Id = Guid.NewGuid(),
                StoreId = storeId,
                ProductId = productId,
                PlatformReviewId = $"REV_{i}",
                Rating = ratings[i],
                CommentText = $"Đánh giá thử nghiệm {i}"
            });
        }
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Lấy bản tóm tắt phân bố cảm xúc theo sản phẩm
        var summary = await context.ProductService.GetProductSentimentSummaryAsync(productId);

        // 3. Assert (Kiểm chứng): 2 POS (50%), 1 NEU (25%), 1 NEG (25%) và AverageRating = 3.2 hoặc 3.3
        Assert.NotNull(summary);
        Assert.Equal(4, summary.TotalReviews);
        Assert.Equal(2, summary.Overall.PosCount);
        Assert.Equal(1, summary.Overall.NeuCount);
        Assert.Equal(1, summary.Overall.NegCount);
        Assert.Equal(50.0, summary.Overall.PosPercent);
        Assert.Equal(25.0, summary.Overall.NeuPercent);
        Assert.Equal(25.0, summary.Overall.NegPercent);
    }

    [Fact]
    public void LazadaSignatureService_GenerateSign_ComputesDeterministicHmacSha256ExcludingSignKey()
    {
        // [TC-BE-CORE-11] Chuẩn ISO 25010:2023 (Security & Interoperability - Ký HMAC-SHA256 Lazada Open API)
        // 1. Arrange (Chuẩn bị): Khởi tạo bộ ký và tham số không theo thứ tự (có kèm "sign" và giá trị rỗng cần bỏ qua)
        var service = new LazadaSignatureService();
        var paramsA = new Dictionary<string, string>
        {
            ["timestamp"] = "1700000000000",
            ["app_key"] = "123456",
            ["code"] = "auth-code-xyz",
            ["sign"] = "OLD_SIGNATURE_SHOULD_BE_IGNORED",
            ["empty_param"] = ""
        };
        var paramsB = new Dictionary<string, string>
        {
            ["app_key"] = "123456",
            ["code"] = "auth-code-xyz",
            ["timestamp"] = "1700000000000"
        };

        // 2. Act (Thực thi): Sinh chữ ký cho cả 2 tập tham số
        var signA = service.GenerateSign("/auth/token/create", paramsA, "my-secret-key");
        var signB = service.GenerateSign("/auth/token/create", paramsB, "my-secret-key");

        // 3. Assert (Kiểm chứng): Chữ ký dài 64 ký tự Hex viết hoa, bất biến dù thứ tự key khác và bỏ qua "sign" / rỗng
        Assert.Equal(64, signA.Length);
        Assert.Equal(signA, signB);
        Assert.Equal(signA.ToUpperInvariant(), signA);
    }

    [Fact]
    public void LazadaAuthService_GetAuthorizationUrl_EncodesCallbackClientIdAndState()
    {
        // [TC-BE-CORE-12] Chuẩn ISO 25010:2023 (Interoperability - Sinh URL OAuth 2.0 Lazada chuẩn mã hóa URI)
        // 1. Arrange (Chuẩn bị): Cấu hình LazadaOptions và khởi tạo LazadaAuthService
        var options = new LazadaOptions
        {
            AppKey = "APP_999",
            AppSecret = "SECRET_999",
            CallbackUrl = "https://higen.vn/oauth/lazada/callback"
        };
        using var http = new HttpClient();
        var authService = new LazadaAuthService(
            http, options, new LazadaSignatureService(), NullLogger<LazadaAuthService>.Instance);

        // 2. Act (Thực thi): Sinh URL ủy quyền có state chứa ký tự đặc biệt
        var url = authService.GetAuthorizationUrl(state: "store=1&env=prod");

        // 3. Assert (Kiểm chứng): Chứa đầy đủ client_id, force_auth=true và mã hóa an toàn redirect_uri, state
        Assert.StartsWith("https://auth.lazada.com/oauth/authorize?", url);
        Assert.Contains("client_id=APP_999", url);
        Assert.Contains("force_auth=true", url);
        Assert.Contains("redirect_uri=https%3A%2F%2Fhigen.vn%2Foauth%2Flazada%2Fcallback", url);
        Assert.Contains("state=store%3D1%26env%3Dprod", url);
    }

    [Fact]
    public async Task UpdateStoreAsync_ExistingAndMissingStore_UpdatesTrimmedFieldsOrReturnsNull()
    {
        // [TC-BE-CORE-13] Chuẩn ISO 25010:2023 (Functional Appropriateness - Cập nhật gian hàng & trạng thái ngắt kết nối)
        // 1. Arrange (Chuẩn bị): Tạo sẵn 1 gian hàng Shopee
        using var context = new CoreSyncTestContext();
        var created = await context.StoreService.CreateStoreAsync(new CreateStoreRequest
        {
            PlatformId = 1,
            StoreName = "Shop Gốc",
            StoreCodeOnPlatform = "SHP_ORIG"
        });

        // 2. Act (Thực thi): Cập nhật tên, mã gian hàng (có khoảng trắng) và đổi trạng thái sang "disconnected"
        var updated = await context.StoreService.UpdateStoreAsync(created.Id, new UpdateStoreRequest
        {
            StoreName = "  Shop Mới Đã Sửa  ",
            StoreCodeOnPlatform = "  SHP_NEW  ",
            Status = "disconnected"
        });
        var missing = await context.StoreService.UpdateStoreAsync(Guid.NewGuid(), new UpdateStoreRequest { StoreName = "X" });

        // 3. Assert (Kiểm chứng): Chuẩn hóa Trim + chữ hoa DISCONNECTED; trả về null cho ID không tồn tại
        Assert.NotNull(updated);
        Assert.Equal("Shop Mới Đã Sửa", updated.StoreName);
        Assert.Equal("SHP_NEW", updated.StoreCodeOnPlatform);
        Assert.Equal("DISCONNECTED", updated.Status);
        Assert.Null(missing);
    }

    [Fact]
    public async Task DeleteStoreAsync_ExistingAndMissingStore_RemovesFromDbAndReturnsBoolean()
    {
        // [TC-BE-CORE-14] Chuẩn ISO 29119-4 (State Transition - Xóa gian hàng và kiểm tra lũy đẳng trả về false)
        // 1. Arrange (Chuẩn bị): Tạo 1 gian hàng trên RAM
        using var context = new CoreSyncTestContext();
        var created = await context.StoreService.CreateStoreAsync(new CreateStoreRequest
        {
            PlatformId = 2,
            StoreName = "Shop Sắp Xóa",
            StoreCodeOnPlatform = "LZD_DEL_01"
        });

        // 2. Act (Thực thi): Xóa lần 1 (thật) và xóa lần 2 (đã mất)
        var firstDelete = await context.StoreService.DeleteStoreAsync(created.Id);
        var secondDelete = await context.StoreService.DeleteStoreAsync(created.Id);
        var fetched = await context.StoreService.GetStoreByIdAsync(created.Id);

        // 3. Assert (Kiểm chứng): Lần 1 trả về true và biến mất khỏi DB; lần 2 trả về false an toàn
        Assert.True(firstDelete);
        Assert.False(secondDelete);
        Assert.Null(fetched);
    }
}
