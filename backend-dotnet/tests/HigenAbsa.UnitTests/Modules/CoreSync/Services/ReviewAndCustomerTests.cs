using Microsoft.AspNetCore.Authorization;
using HigenAbsa.Modules.CoreSync.Application.Contracts;
using HigenAbsa.Modules.CoreSync.Domain;
using HigenAbsa.Modules.CoreSync.Endpoints;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.UnitTests.Modules.CoreSync.Fixtures;

namespace HigenAbsa.UnitTests.Modules.CoreSync.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Mục 3 (Nhóm 3.2): Truy vấn & Lọc Đánh giá (ReviewService),
/// Phân tích Khách hàng (CustomerService) và Tính lũy đẳng khi Seed dữ liệu (Idempotency).
/// </summary>
public class ReviewAndCustomerTests
{
    [Fact]
    public async Task GetReviewsAsync_FilterBySentiment_ReturnsConsistentTotalCountAndFilteredItems()
    {
        // [TC-BE-CORE-06] Chuẩn ISO 25010:2023 (Functional Correctness - Tính nhất quán phân trang khi lọc theo Sentiment · ISO TDD)
        // 1. Arrange (Chuẩn bị): Tạo 3 đánh giá trong DB (2 đánh giá POS và 1 đánh giá NEG)
        using var context = new CoreSyncTestContext();
        var storeId = Guid.NewGuid();
        context.DbContext.StoreConnections.Add(new StoreConnection
        {
            Id = storeId,
            PlatformId = 1,
            StoreName = "Shop Test",
            StoreCodeOnPlatform = "SPE_TEST"
        });

        var revPos1 = new Review { Id = Guid.NewGuid(), StoreId = storeId, PlatformReviewId = "R_POS_1", Rating = 5, CommentText = "Tốt 1" };
        var revPos2 = new Review { Id = Guid.NewGuid(), StoreId = storeId, PlatformReviewId = "R_POS_2", Rating = 5, CommentText = "Tốt 2" };
        var revNeg1 = new Review { Id = Guid.NewGuid(), StoreId = storeId, PlatformReviewId = "R_NEG_1", Rating = 1, CommentText = "Lỗi nặng" };

        context.DbContext.Reviews.AddRange(revPos1, revPos2, revNeg1);
        await context.DbContext.SaveChangesAsync();

        context.FakeInferenceLookup.Analyses[revPos1.Id] = new InferenceSummaryContractDto(revPos1.Id, "POS", 0.95f, null, null);
        context.FakeInferenceLookup.Analyses[revPos2.Id] = new InferenceSummaryContractDto(revPos2.Id, "POS", 0.92f, null, null);
        context.FakeInferenceLookup.Analyses[revNeg1.Id] = new InferenceSummaryContractDto(revNeg1.Id, "NEG", 0.96f, "Lỗi phần cứng", null);

        // 2. Act (Thực thi): Truy vấn danh sách đánh giá có lọc theo sentiment = "NEG"
        var pagedResult = await context.ReviewService.GetReviewsAsync(
            page: 1, pageSize: 20, storeId: storeId, productId: null,
            rating: null, sentiment: "NEG", status: null, search: null);

        // 3. Assert (Kiểm chứng): Danh sách chỉ có 1 bản ghi NEG và TotalCount của PagedResult cũng bắt buộc phải bằng 1
        Assert.Single(pagedResult.Items);
        Assert.Equal("NEG", pagedResult.Items[0].OverallSentiment);
        Assert.Equal(1, pagedResult.TotalCount);
    }

    [Fact]
    public async Task UpdateReviewStatusAsync_InvalidDomainStatus_ThrowsArgumentOrInvalidOperationException()
    {
        // [TC-BE-CORE-07] Chuẩn ISO 29119-4 (Boundary / Domain Input Validation · ISO TDD)
        // 1. Arrange (Chuẩn bị): Tạo 1 bản ghi đánh giá hợp lệ đang ở trạng thái PENDING
        using var context = new CoreSyncTestContext();
        var reviewId = Guid.NewGuid();
        context.DbContext.Reviews.Add(new Review
        {
            Id = reviewId,
            PlatformReviewId = "REV_STATUS_01",
            Rating = 4,
            Status = "PENDING"
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Truyền trạng thái ngoài tập (PENDING, REPLIED, FAILED, SKIPPED) phải bị chặn
        await Assert.ThrowsAnyAsync<Exception>(() =>
            context.ReviewService.UpdateReviewStatusAsync(reviewId, "INVALID_HACKED_STATUS"));
    }

    [Fact]
    public async Task GetCustomerByIdAsync_CustomerWithMultipleReviews_ComputesAccurateRatingBreakdown()
    {
        // [TC-BE-CORE-08] Chuẩn ISO 25010:2023 (Functional Correctness)
        // 1. Arrange (Chuẩn bị): Tạo khách hàng có 3 đánh giá (5★, 3★, 2★)
        using var context = new CoreSyncTestContext();
        var storeId = Guid.NewGuid();
        var customerId = Guid.NewGuid();

        context.DbContext.StoreConnections.Add(new StoreConnection
        {
            Id = storeId,
            PlatformId = 1,
            StoreName = "HIGEN Store",
            StoreCodeOnPlatform = "SPE_02"
        });
        context.DbContext.Customers.Add(new Customer
        {
            Id = customerId,
            StoreId = storeId,
            PlatformUserId = "CUST_99",
            DisplayName = "Nguyễn Khách Hàng",
            RiskLevel = "NORMAL"
        });
        context.DbContext.Reviews.AddRange(
            new Review { Id = Guid.NewGuid(), StoreId = storeId, CustomerId = customerId, PlatformReviewId = "CR_1", Rating = 5 },
            new Review { Id = Guid.NewGuid(), StoreId = storeId, CustomerId = customerId, PlatformReviewId = "CR_2", Rating = 3 },
            new Review { Id = Guid.NewGuid(), StoreId = storeId, CustomerId = customerId, PlatformReviewId = "CR_3", Rating = 2 }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Truy vấn hồ sơ chi tiết khách hàng
        var detail = await context.CustomerService.GetCustomerByIdAsync(customerId);

        // 3. Assert (Kiểm chứng): 3 đánh giá, trung bình (5+3+2)/3 = 3.3, Pos=1, Neu=1, Neg=1
        Assert.NotNull(detail);
        Assert.Equal(3, detail.TotalReviewsCount);
        Assert.Equal(3.3, detail.AverageRating);
        Assert.Equal(1, detail.PosCount);
        Assert.Equal(1, detail.NeuCount);
        Assert.Equal(1, detail.NegCount);
    }

    [Fact]
    public async Task UpdateRiskLevelAsync_ValidRiskLevel_UpdatesCustomerRiskLevelToPotentialBommer()
    {
        // [TC-BE-CORE-09] Chuẩn ISO 29119-4 (State Transition)
        // 1. Arrange (Chuẩn bị): Khách hàng đang ở mức NORMAL gắn với một gian hàng hợp lệ
        using var context = new CoreSyncTestContext();
        var storeId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        context.DbContext.StoreConnections.Add(new StoreConnection
        {
            Id = storeId,
            PlatformId = 1,
            StoreName = "HIGEN Risk Test Store",
            StoreCodeOnPlatform = "SPE_RISK_01"
        });
        context.DbContext.Customers.Add(new Customer
        {
            Id = customerId,
            StoreId = storeId,
            PlatformUserId = "CUST_RISK",
            DisplayName = "Khách Nghi Vấn",
            RiskLevel = "NORMAL"
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Đổi mức cảnh báo sang chữ thường "potential_bommer"
        var updated = await context.CustomerService.UpdateRiskLevelAsync(customerId, "potential_bommer");

        // 3. Assert (Kiểm chứng): Chuẩn hóa thành chữ hoa POTENTIAL_BOMMER và lưu DB
        Assert.NotNull(updated);
        Assert.Equal("POTENTIAL_BOMMER", updated.RiskLevel);
    }

    [Fact]
    public async Task SeedMockLazadaStoreAsync_CalledTwice_IsIdempotentAndDoesNotDuplicateStoreOrReviews()
    {
        // [TC-BE-CORE-10] Chuẩn ISO 25010:2023 (Reliability - Idempotency)
        // 1. Arrange (Chuẩn bị): Khởi tạo CoreSyncTestContext
        using var context = new CoreSyncTestContext();

        // 2. Act (Thực thi): Gọi hàm khởi tạo dữ liệu mẫu Lazada 2 lần liên tiếp
        var firstSeed = await context.StoreService.SeedMockLazadaStoreAsync();
        var secondSeed = await context.StoreService.SeedMockLazadaStoreAsync();

        // 3. Assert (Kiểm chứng): Cùng một StoreId và số lượng đánh giá/sản phẩm không bị nhân đôi
        Assert.Equal(firstSeed.Id, secondSeed.Id);
        Assert.Equal(firstSeed.ProductCount, secondSeed.ProductCount);
        Assert.Equal(firstSeed.ReviewCount, secondSeed.ReviewCount);
    }

    [Fact]
    public async Task GetProductsAsync_FilterByStoreAndSearchTerm_IsolatesStoreAndSkuMatches()
    {
        // [TC-BE-CORE-15] Chuẩn ISO 29119-4 (Equivalence Partitioning - Cô lập sản phẩm theo StoreId & từ khóa SKU)
        // 1. Arrange (Chuẩn bị): Tạo 2 gian hàng cùng sản phẩm khác SKU
        using var context = new CoreSyncTestContext();
        var storeA = Guid.NewGuid();
        var storeB = Guid.NewGuid();
        context.DbContext.StoreConnections.AddRange(
            new StoreConnection { Id = storeA, PlatformId = 1, StoreName = "Shop A", StoreCodeOnPlatform = "SA" },
            new StoreConnection { Id = storeB, PlatformId = 2, StoreName = "Shop B", StoreCodeOnPlatform = "SB" }
        );
        context.DbContext.Products.AddRange(
            new Product { Id = Guid.NewGuid(), StoreId = storeA, PlatformProductId = "PA1", Sku = "AUDIO-ANC-01", Name = "Tai nghe Chống Ồn" },
            new Product { Id = Guid.NewGuid(), StoreId = storeA, PlatformProductId = "PA2", Sku = "CASE-01", Name = "Ốp lưng Silicon" },
            new Product { Id = Guid.NewGuid(), StoreId = storeB, PlatformProductId = "PB1", Sku = "AUDIO-ANC-99", Name = "Tai nghe Store B" }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Lọc theo Store A + từ khóa SKU "anc"
        var page = await context.ProductService.GetProductsAsync(page: 1, pageSize: 10, storeId: storeA, search: "anc");

        // 3. Assert (Kiểm chứng): Chỉ trả về đúng 1 sản phẩm khớp cả Store A và SKU AUDIO-ANC-01
        Assert.Equal(1, page.TotalCount);
        var item = Assert.Single(page.Items);
        Assert.Equal("AUDIO-ANC-01", item.Sku);
        Assert.Equal("SHOPEE", item.PlatformCode);
    }

    [Fact]
    public async Task GetReviewByIdAsync_WithAnalyzedInference_CombinesReviewAndAiSummaryDto()
    {
        // [TC-BE-CORE-16] Chuẩn ISO 25010:2023 (Interoperability - Kết nối ReviewDetailDto với kết quả AI từ IInferenceLookupContract)
        // 1. Arrange (Chuẩn bị): Tạo Review thuộc gian hàng/sản phẩm và gắn kết quả AI trong FakeInferenceLookup
        using var context = new CoreSyncTestContext();
        var storeId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var reviewId = Guid.NewGuid();

        context.DbContext.StoreConnections.Add(new StoreConnection { Id = storeId, PlatformId = 1, StoreName = "Mall", StoreCodeOnPlatform = "M1" });
        context.DbContext.Products.Add(new Product { Id = productId, StoreId = storeId, PlatformProductId = "P1", Name = "Chuột Không Dây" });
        context.DbContext.Reviews.Add(new Review
        {
            Id = reviewId,
            StoreId = storeId,
            ProductId = productId,
            PlatformReviewId = "REV-AI-1",
            Rating = 2,
            CommentText = "Pin nhanh hết quá",
            Status = "ANALYZED"
        });
        await context.DbContext.SaveChangesAsync();

        context.FakeInferenceLookup.Analyses[reviewId] = new InferenceSummaryContractDto(
            reviewId, "NEG", 0.93f, "Pin chai nhanh", "Shop xin lỗi và hỗ trợ đổi pin mới ạ!");

        // 2. Act (Thực thi): Lấy chi tiết Review theo ID
        var detail = await context.ReviewService.GetReviewByIdAsync(reviewId);

        // 4. Assert (Kiểm chứng): Ghép đầy đủ tên gian hàng, tên sản phẩm và nhánh AiAnalysis
        Assert.NotNull(detail);
        Assert.Equal("Mall", detail.StoreName);
        Assert.Equal("Chuột Không Dây", detail.ProductName);
        Assert.Equal("NEG", detail.OverallSentiment);
        Assert.NotNull(detail.AiAnalysis);
        Assert.Equal("Pin chai nhanh", detail.AiAnalysis.RootCause);
    }

    [Fact]
    public async Task CoreSyncContracts_StoreAndReviewLookups_IsolateActiveStoresAndDateCount()
    {
        // [TC-BE-CORE-17] Chuẩn ISO 25010:2023 (Modularity - Hợp đồng liên module IStoreLookupContract & IReviewLookupContract)
        // 1. Arrange (Chuẩn bị): Tạo 1 gian hàng CONNECTED, 1 gian hàng DISCONNECTED và 2 đánh giá ở 2 mốc ngày
        using var context = new CoreSyncTestContext();
        var activeStoreId = Guid.NewGuid();
        var inactiveStoreId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        context.DbContext.StoreConnections.AddRange(
            new StoreConnection { Id = activeStoreId, PlatformId = 1, StoreName = "Active Mall", StoreCodeOnPlatform = "ACT1", Status = "CONNECTED" },
            new StoreConnection { Id = inactiveStoreId, PlatformId = 2, StoreName = "Closed Shop", StoreCodeOnPlatform = "CLS1", Status = "DISCONNECTED" }
        );
        context.DbContext.Reviews.AddRange(
            new Review { Id = Guid.NewGuid(), StoreId = activeStoreId, PlatformReviewId = "R1", Rating = 5, ReviewCreatedAt = now.AddDays(-1) },
            new Review { Id = Guid.NewGuid(), StoreId = activeStoreId, PlatformReviewId = "R2", Rating = 4, ReviewCreatedAt = now.AddDays(-20) }
        );
        await context.DbContext.SaveChangesAsync();

        var storeLookup = new CoreSyncStoreLookupService(context.DbContext);
        var reviewLookup = new CoreSyncReviewLookupService(context.DbContext);

        // 2. Act (Thực thi): Truy vấn danh sách gian hàng đang hoạt động và đếm review 7 ngày gần nhất
        var activeStores = await storeLookup.GetAllActiveStoresAsync();
        var storeById = await storeLookup.GetByIdAsync(activeStoreId);
        var recentCount = await reviewLookup.GetCountByDateRangeAsync(DateTime.UtcNow.AddDays(-7), DateTime.UtcNow);

        // 3. Assert (Kiểm chứng): Chỉ trả về gian hàng CONNECTED và đếm đúng 1 review trong khung 7 ngày
        var singleActive = Assert.Single(activeStores);
        Assert.Equal(activeStoreId, singleActive.StoreId);
        Assert.NotNull(storeById);
        Assert.Equal("SHOPEE", storeById.PlatformCode);
        Assert.Equal(1, recentCount);
    }

    [Fact]
    public async Task UpdateRiskLevelAsync_UnsupportedRiskLevel_ThrowsArgumentException()
    {
        // [TC-BE-CORE-18] Chuẩn ISO 29119-4 (State Transition Validation - Chặn phân loại rủi ro khách hàng không hợp lệ · ISO TDD)
        // 1. Arrange (Chuẩn bị): Khách hàng hợp lệ thuộc gian hàng thật
        using var context = new CoreSyncTestContext();
        var storeId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        context.DbContext.StoreConnections.Add(new StoreConnection { Id = storeId, PlatformId = 1, StoreName = "Store", StoreCodeOnPlatform = "S1" });
        context.DbContext.Customers.Add(new Customer { Id = customerId, StoreId = storeId, PlatformUserId = "C1", RiskLevel = "NORMAL" });
        await context.DbContext.SaveChangesAsync();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Giá trị ngoài tập {NORMAL, VIP, POTENTIAL_BOMMER, HIGH_RISK} phải bị chặn
        await Assert.ThrowsAnyAsync<ArgumentException>(() =>
            context.CustomerService.UpdateRiskLevelAsync(customerId, "INVALID_ALIEN_RISK"));
    }

    [Fact]
    public async Task GetReviewsAsync_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds()
    {
        // [TC-BE-CORE-19] Chuẩn OWASP API4:2023 (Unrestricted Resource Consumption - Chống DDoS phân trang Review & biên âm · ISO TDD)
        // 1. Arrange (Chuẩn bị): Nạp 2 đánh giá vào CSDL CoreSync trên RAM
        using var context = new CoreSyncTestContext();
        var storeId = Guid.NewGuid();
        context.DbContext.StoreConnections.Add(new StoreConnection { Id = storeId, PlatformId = 1, StoreName = "Mall", StoreCodeOnPlatform = "M1" });
        context.DbContext.Reviews.AddRange(
            new Review { Id = Guid.NewGuid(), StoreId = storeId, PlatformReviewId = "R1", Rating = 5 },
            new Review { Id = Guid.NewGuid(), StoreId = storeId, PlatformReviewId = "R2", Rating = 4 }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Truy vấn phân trang với biên âm page = -1 và pageSize = 50000
        var result = await context.ReviewService.GetReviewsAsync(-1, 50000, null, null, null, null, null, null);

        // 3. Assert (Kiểm chứng): Page phải >= 1 và PageSize phải bị kẹp trần <= 100
        Assert.InRange(result.Page, 1, int.MaxValue);
        Assert.InRange(result.PageSize, 1, 100);
    }

    [Fact]
    public async Task GetReviewsAsync_OutOfRangeRatingFilter_ThrowsArgumentOutOfRangeException()
    {
        // [TC-BE-CORE-20] Chuẩn ISO 29119-4 (Boundary Value Analysis - Chặn lọc số sao ngoài biên [1..5] · ISO TDD)
        // 1. Arrange (Chuẩn bị): Khởi tạo CoreSyncTestContext
        using var context = new CoreSyncTestContext();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Truyền rating = 0 (hoặc 99) ngoài dải sao 1..5 phải ném ArgumentException
        await Assert.ThrowsAnyAsync<ArgumentException>(() =>
            context.ReviewService.GetReviewsAsync(1, 20, null, null, rating: 0, null, null, null));
    }

    [Fact]
    public void ReviewAndCustomerControllers_Endpoints_EnforceAuthorizeWithoutAllowAnonymous()
    {
        // [TC-BE-CORE-21] Chuẩn OWASP API1:2023 (Broken Object/Controller Authorization - Khóa truy cập ẩn danh trên Review & Customer)
        // 1. Arrange (Chuẩn bị): Lấy metadata Attribute của ReviewController và CustomerController
        var reviewAuth = Attribute.GetCustomAttribute(typeof(ReviewController), typeof(AuthorizeAttribute));
        var reviewAnon = Attribute.GetCustomAttribute(typeof(ReviewController), typeof(AllowAnonymousAttribute));
        var custAuth = Attribute.GetCustomAttribute(typeof(CustomerController), typeof(AuthorizeAttribute));
        var custAnon = Attribute.GetCustomAttribute(typeof(CustomerController), typeof(AllowAnonymousAttribute));

        // 2 & 3. Act & Assert (Kiểm chứng): Cả 2 Controller bắt buộc gắn [Authorize] và không cho phép [AllowAnonymous]
        Assert.NotNull(reviewAuth);
        Assert.Null(reviewAnon);
        Assert.NotNull(custAuth);
        Assert.Null(custAnon);
    }

    [Fact]
    public async Task GetCustomersAsync_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds()
    {
        // [TC-BE-CORE-22] Chuẩn OWASP API4:2023 (Anti-DDoS Pagination - Kẹp biên âm & quá tải kích thước trang khách hàng · ISO TDD)
        // 1. Arrange (Chuẩn bị): Nạp 1 khách hàng vào CSDL CoreSync trên RAM
        using var context = new CoreSyncTestContext();
        var storeId = Guid.NewGuid();
        context.DbContext.StoreConnections.Add(new StoreConnection { Id = storeId, PlatformId = 1, StoreName = "Mall", StoreCodeOnPlatform = "M2" });
        context.DbContext.Customers.Add(new Customer { Id = Guid.NewGuid(), StoreId = storeId, PlatformUserId = "CUST-1" });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Truyền page = -5 và pageSize = 100000
        var result = await context.CustomerService.GetCustomersAsync(page: -5, pageSize: 100000, riskLevel: null, search: null);

        // 3. Assert (Kiểm chứng): Phải kẹp biên Page >= 1 và PageSize <= 100
        Assert.InRange(result.Page, 1, int.MaxValue);
        Assert.InRange(result.PageSize, 1, 100);
    }
}
