using Microsoft.AspNetCore.Authorization;
using HigenAbsa.Modules.Reporting.Endpoints;
using HigenAbsa.Modules.Reporting.Infrastructure;
using HigenAbsa.UnitTests.Modules.Reporting.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Reporting.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Mục 5 (Nhóm 5.1): Thống kê KPI, Xu hướng Cảm xúc, Phân bổ theo Sàn,
/// Cảnh báo Đột biến Tiêu cực và Ma trận Khía cạnh (DashboardService).
/// Đối chiếu chuẩn ISO/IEC/IEEE 29119-4 và ISO/IEC 25010:2023.
/// </summary>
public class DashboardAnalyticsTests
{
    [Fact]
    public async Task GetKpiAsync_EmptyDatabase_ReturnsZeroedMetricsWithoutDivisionByZero()
    {
        // [TC-BE-REP-01] Chuẩn ISO 29119-4 (Boundary Value Analysis - CSDL 0 bản ghi chống lỗi chia cho 0)
        // 1. Arrange (Chuẩn bị): CSDL Reporting trên RAM hoàn toàn trống
        using var context = new ReportingTestContext();

        // 2. Act (Thực thi): Gọi tính toán KPI tổng quan
        var kpi = await context.DashboardService.GetKpiAsync(dateFrom: null, dateTo: null);

        // 3. Assert (Kiểm chứng): Toàn bộ chỉ số bằng 0, không phát sinh NaN hoặc Infinity
        Assert.Equal(0, kpi.TotalReviews);
        Assert.Equal(0, kpi.TodayReviews);
        Assert.Equal(0, kpi.TodayChangePercent);
        Assert.Equal(0, kpi.PosPercent);
        Assert.Equal(0, kpi.NeuPercent);
        Assert.Equal(0, kpi.NegPercent);
        Assert.Equal(0, kpi.ConnectedStores);
        Assert.Equal(0, kpi.OpenTickets);
    }

    [Fact]
    public async Task GetKpiAsync_PopulatedData_CalculatesAccuratePercentagesStoreCountAndOpenTickets()
    {
        // [TC-BE-REP-02] Chuẩn ISO 25010:2023 (Functional Correctness)
        // 1. Arrange (Chuẩn bị): Nạp 2 đánh giá hôm nay, 1 đánh giá hôm qua (+100%), 4 phân tích (3 POS = 75%, 1 NEG = 25%),
        // 2 gian hàng (1 CONNECTED, 1 DISCONNECTED) và 3 Ticket (1 OPEN, 1 IN_PROGRESS, 1 RESOLVED)
        using var context = new ReportingTestContext();
        var now = DateTimeOffset.UtcNow;
        var todayStart = new DateTimeOffset(now.Year, now.Month, now.Day, 0, 0, 0, TimeSpan.Zero);

        context.DbContext.ReadReviews.AddRange(
            new ReadReview { Id = Guid.NewGuid(), StoreId = Guid.NewGuid(), Rating = 5, ReviewCreatedAt = todayStart.AddHours(1) },
            new ReadReview { Id = Guid.NewGuid(), StoreId = Guid.NewGuid(), Rating = 4, ReviewCreatedAt = todayStart.AddHours(2) },
            new ReadReview { Id = Guid.NewGuid(), StoreId = Guid.NewGuid(), Rating = 2, ReviewCreatedAt = todayStart.AddHours(-5) }
        );

        context.DbContext.ReadAnalyses.AddRange(
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), OverallSentiment = "POS", ProcessedAt = now },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), OverallSentiment = "POS", ProcessedAt = now },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), OverallSentiment = "POS", ProcessedAt = now },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), OverallSentiment = "NEG", ProcessedAt = now }
        );

        context.DbContext.ReadStores.AddRange(
            new ReadStoreConnection { Id = Guid.NewGuid(), StoreName = "Shopee Connected", PlatformId = 1, Status = "CONNECTED" },
            new ReadStoreConnection { Id = Guid.NewGuid(), StoreName = "Lazada Disconnected", PlatformId = 2, Status = "DISCONNECTED" }
        );

        context.DbContext.ReadTickets.AddRange(
            new ReadTicket { Id = Guid.NewGuid(), StoreId = Guid.NewGuid(), ReviewId = Guid.NewGuid(), Status = "OPEN" },
            new ReadTicket { Id = Guid.NewGuid(), StoreId = Guid.NewGuid(), ReviewId = Guid.NewGuid(), Status = "IN_PROGRESS" },
            new ReadTicket { Id = Guid.NewGuid(), StoreId = Guid.NewGuid(), ReviewId = Guid.NewGuid(), Status = "RESOLVED" }
        );

        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Lấy chỉ số KPI
        var kpi = await context.DashboardService.GetKpiAsync(null, null);

        // 3. Assert (Kiểm chứng): Tổng 3 đánh giá, hôm nay 2 (+100% so với hôm qua 1), POS 75%, NEG 25%, 1 Shop kết nối, 2 Ticket đang mở
        Assert.Equal(3, kpi.TotalReviews);
        Assert.Equal(2, kpi.TodayReviews);
        Assert.Equal(100.0, kpi.TodayChangePercent);
        Assert.Equal(75.0, kpi.PosPercent);
        Assert.Equal(25.0, kpi.NegPercent);
        Assert.Equal(1, kpi.ConnectedStores);
        Assert.Equal(2, kpi.OpenTickets);
    }

    [Fact]
    public async Task GetSentimentTrendAsync_GroupByDayAndMonth_AggregatesChronologically()
    {
        // [TC-BE-REP-03] Chuẩn ISO 29119-4 (Equivalence Partitioning - Nhóm theo ngày và tháng)
        // 1. Arrange (Chuẩn bị): Thêm 3 kết quả phân tích ở 2 ngày khác nhau
        using var context = new ReportingTestContext();
        var day1 = DateTimeOffset.UtcNow.AddDays(-2);
        var day2 = DateTimeOffset.UtcNow.AddDays(-1);

        context.DbContext.ReadAnalyses.AddRange(
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), OverallSentiment = "POS", ProcessedAt = day1 },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), OverallSentiment = "NEG", ProcessedAt = day1 },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), OverallSentiment = "POS", ProcessedAt = day2 }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Truy vấn xu hướng theo ngày
        var dailyTrend = await context.DashboardService.GetSentimentTrendAsync(null, null, "day");

        // 3. Assert (Kiểm chứng): Có 2 mốc ngày sắp xếp tăng dần, ngày 1 có Total = 2 (1 POS, 1 NEG), ngày 2 có Total = 1 (1 POS)
        Assert.Equal(2, dailyTrend.Count);
        Assert.Equal(2, dailyTrend[0].TotalCount);
        Assert.Equal(1, dailyTrend[0].PosCount);
        Assert.Equal(1, dailyTrend[0].NegCount);
        Assert.Equal(1, dailyTrend[1].TotalCount);
    }

    [Fact]
    public async Task GetPlatformDistributionAsync_MultiplePlatforms_CalculatesAccurateReviewCountsAndPercentages()
    {
        // [TC-BE-REP-04] Chuẩn ISO 25010:2023 (Functional Correctness - Tỷ lệ phân bổ theo sàn)
        // 1. Arrange (Chuẩn bị): 4 đánh giá (2 trên Shopee, 1 trên Lazada, 1 trên TikTok Shop)
        using var context = new ReportingTestContext();
        var shopeeStore = Guid.NewGuid();
        var lazadaStore = Guid.NewGuid();
        var tiktokStore = Guid.NewGuid();

        context.DbContext.ReadPlatforms.AddRange(
            new ReadPlatform { Id = 1, Code = "SHOPEE", Name = "Shopee" },
            new ReadPlatform { Id = 2, Code = "LAZADA", Name = "Lazada" },
            new ReadPlatform { Id = 4, Code = "TIKTOK_SHOP", Name = "TikTok Shop" }
        );

        context.DbContext.ReadStores.AddRange(
            new ReadStoreConnection { Id = shopeeStore, StoreName = "S1", PlatformId = 1, Status = "CONNECTED" },
            new ReadStoreConnection { Id = lazadaStore, StoreName = "S2", PlatformId = 2, Status = "CONNECTED" },
            new ReadStoreConnection { Id = tiktokStore, StoreName = "S3", PlatformId = 4, Status = "CONNECTED" }
        );

        context.DbContext.ReadReviews.AddRange(
            new ReadReview { Id = Guid.NewGuid(), StoreId = shopeeStore, ReviewCreatedAt = DateTimeOffset.UtcNow },
            new ReadReview { Id = Guid.NewGuid(), StoreId = shopeeStore, ReviewCreatedAt = DateTimeOffset.UtcNow },
            new ReadReview { Id = Guid.NewGuid(), StoreId = lazadaStore, ReviewCreatedAt = DateTimeOffset.UtcNow },
            new ReadReview { Id = Guid.NewGuid(), StoreId = tiktokStore, ReviewCreatedAt = DateTimeOffset.UtcNow }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Lấy phân bổ phần trăm theo sàn
        var dist = await context.DashboardService.GetPlatformDistributionAsync(null, null);

        // 3. Assert (Kiểm chứng): Shopee dẫn đầu với 50%, Lazada 25%, TikTok Shop 25%, tổng = 100%
        Assert.Equal(3, dist.Count);
        Assert.Equal("SHOPEE", dist[0].PlatformCode);
        Assert.Equal(50.0, dist[0].Percentage);
        Assert.Equal(100.0, dist.Sum(d => d.Percentage));
    }

    [Fact]
    public async Task GetNegativeSpikesAsync_ProductsWithNegativeReviews_RanksTopNegativeProductsAndComputesNegPercent()
    {
        // [TC-BE-REP-05] Chuẩn ISO 25010:2023 (Functional Appropriateness)
        // 1. Arrange (Chuẩn bị): Sản phẩm A có 3/4 đánh giá NEG (75%), Sản phẩm B có 1/2 đánh giá NEG (50%)
        using var context = new ReportingTestContext();
        var storeId = Guid.NewGuid();
        var prodA = Guid.NewGuid();
        var prodB = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        context.DbContext.ReadStores.Add(new ReadStoreConnection { Id = storeId, StoreName = "Digital World", PlatformId = 2 });
        context.DbContext.ReadProducts.AddRange(
            new ReadProduct { Id = prodA, StoreId = storeId, Name = "Tai Nghe Lỗi Pin" },
            new ReadProduct { Id = prodB, StoreId = storeId, Name = "Bàn Phím Cơ" }
        );

        var revA1 = Guid.NewGuid(); var revA2 = Guid.NewGuid(); var revA3 = Guid.NewGuid(); var revA4 = Guid.NewGuid();
        var revB1 = Guid.NewGuid(); var revB2 = Guid.NewGuid();

        context.DbContext.ReadReviews.AddRange(
            new ReadReview { Id = revA1, StoreId = storeId, ProductId = prodA, ReviewCreatedAt = now },
            new ReadReview { Id = revA2, StoreId = storeId, ProductId = prodA, ReviewCreatedAt = now },
            new ReadReview { Id = revA3, StoreId = storeId, ProductId = prodA, ReviewCreatedAt = now },
            new ReadReview { Id = revA4, StoreId = storeId, ProductId = prodA, ReviewCreatedAt = now },
            new ReadReview { Id = revB1, StoreId = storeId, ProductId = prodB, ReviewCreatedAt = now },
            new ReadReview { Id = revB2, StoreId = storeId, ProductId = prodB, ReviewCreatedAt = now }
        );

        context.DbContext.ReadAnalyses.AddRange(
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = revA1, OverallSentiment = "NEG", ProcessedAt = now },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = revA2, OverallSentiment = "NEG", ProcessedAt = now },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = revA3, OverallSentiment = "NEG", ProcessedAt = now },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = revA4, OverallSentiment = "POS", ProcessedAt = now },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = revB1, OverallSentiment = "NEG", ProcessedAt = now },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = revB2, OverallSentiment = "POS", ProcessedAt = now }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Lấy danh sách cảnh báo sản phẩm tiêu cực đột biến trong 7 ngày
        var spikes = await context.DashboardService.GetNegativeSpikesAsync(days: 7);

        // 3. Assert (Kiểm chứng): Sản phẩm A đứng đầu với 3 NEG (75%), Sản phẩm B đứng thứ 2 với 1 NEG (50%)
        Assert.Equal(2, spikes.Count);
        Assert.Equal(prodA, spikes[0].ProductId);
        Assert.Equal(3, spikes[0].NegCount);
        Assert.Equal(75.0, spikes[0].NegPercent);
        Assert.Equal(prodB, spikes[1].ProductId);
        Assert.Equal(50.0, spikes[1].NegPercent);
    }

    [Fact]
    public async Task GetAspectSummaryAsync_FilterByStoreId_AggregatesMacroMicroMentionsIsolatedByStore()
    {
        // [TC-BE-REP-06] Chuẩn ISO 29119-4 (Equivalence Partitioning - Cô lập dữ liệu Ma trận Khía cạnh theo StoreId)
        // 1. Arrange (Chuẩn bị): Store A có 2 đánh giá nhắc tới Delivery_Speed, Store B có 1 đánh giá nhắc tới Price_Promotion
        using var context = new ReportingTestContext();
        var storeA = Guid.NewGuid();
        var storeB = Guid.NewGuid();
        var revA1 = Guid.NewGuid();
        var revA2 = Guid.NewGuid();
        var revB1 = Guid.NewGuid();

        context.DbContext.ReadReviews.AddRange(
            new ReadReview { Id = revA1, StoreId = storeA },
            new ReadReview { Id = revA2, StoreId = storeA },
            new ReadReview { Id = revB1, StoreId = storeB }
        );

        context.DbContext.ReadAspects.AddRange(
            new ReadReviewAspect { Id = 1, ReviewId = revA1, MacroCategory = "SHIPPING", MicroAspect = "Delivery_Speed", Sentiment = "POS" },
            new ReadReviewAspect { Id = 2, ReviewId = revA2, MacroCategory = "SHIPPING", MicroAspect = "Delivery_Speed", Sentiment = "NEG" },
            new ReadReviewAspect { Id = 3, ReviewId = revB1, MacroCategory = "PRICE", MicroAspect = "Price_Promotion", Sentiment = "POS" }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Lọc Ma trận Khía cạnh riêng cho Store A
        var storeAAspects = await context.DashboardService.GetAspectSummaryAsync(storeA);

        // 3. Assert (Kiểm chứng): Chỉ trả về Delivery_Speed (Total = 2, Pos = 1, Neg = 1), không lẫn Price_Promotion của Store B
        var aspect = Assert.Single(storeAAspects);
        Assert.Equal("Delivery_Speed", aspect.MicroAspect);
        Assert.Equal(2, aspect.TotalMentions);
        Assert.Equal(1, aspect.PositiveMentions);
        Assert.Equal(1, aspect.NegativeMentions);
    }

    [Fact]
    public async Task GetSentimentTrendAsync_EmptyDateRange_ReturnsEmptyListWithoutException()
    {
        // [TC-BE-REP-09] Chuẩn ISO 29119-4 (Boundary Value Analysis - Khoảng thời gian không có dữ liệu)
        // 1. Arrange (Chuẩn bị): CSDL Reporting trống
        using var context = new ReportingTestContext();

        // 2. Act (Thực thi): Truy vấn chuỗi xu hướng cảm xúc
        var trend = await context.DashboardService.GetSentimentTrendAsync(
            DateTime.UtcNow.AddDays(-7), DateTime.UtcNow, "day");

        // 3. Assert (Kiểm chứng): Trả về danh sách rỗng an toàn, không ném ngoại lệ
        Assert.Empty(trend);
    }

    [Fact]
    public async Task GetRecentReviewsAsync_CountAbove50AndBelow1_ClampsSafeBoundsBetween1And50()
    {
        // [TC-BE-REP-10] Chuẩn ISO 29119-4 (Boundary Value Analysis - Kẹp biên tham số count trong khoảng [1..50])
        // 1. Arrange (Chuẩn bị): Nạp 60 đánh giá thuộc cùng một gian hàng
        using var context = new ReportingTestContext();
        var storeId = Guid.NewGuid();
        var baseTime = DateTimeOffset.UtcNow;
        context.DbContext.ReadStores.Add(new ReadStoreConnection { Id = storeId, StoreName = "HIGEN Official", PlatformId = 1 });
        for (int i = 0; i < 60; i++)
        {
            context.DbContext.ReadReviews.Add(new ReadReview
            {
                Id = Guid.NewGuid(),
                StoreId = storeId,
                Rating = 5,
                CommentText = $"Review {i}",
                ReviewCreatedAt = baseTime.AddMinutes(-i)
            });
        }
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Yêu cầu count=200 (vượt trần 50) và count=0 (dưới sàn 1)
        var maxClamped = await context.DashboardService.GetRecentReviewsAsync(count: 200);
        var minClamped = await context.DashboardService.GetRecentReviewsAsync(count: 0);

        // 3. Assert (Kiểm chứng): Giới hạn tối đa 50 bản ghi, tối thiểu 1 bản ghi và sắp xếp mới nhất lên đầu
        Assert.Equal(50, maxClamped.Count);
        Assert.Single(minClamped);
        Assert.Equal("Review 0", minClamped[0].CommentText);
    }

    [Fact]
    public async Task GetKpiAsync_DateRangeWindow_ExcludesReviewsAndAnalysesOutsideWindow()
    {
        // [TC-BE-REP-11] Chuẩn ISO 25010:2023 (Functional Correctness - Cô lập thống kê KPI theo cửa sổ ngày)
        // 1. Arrange (Chuẩn bị): Tạo 1 review trong cửa sổ 3 ngày gần đây (POS) và 1 review từ 30 ngày trước (NEG)
        using var context = new ReportingTestContext();
        var storeId = Guid.NewGuid();
        var recentRev = Guid.NewGuid();
        var oldRev = Guid.NewGuid();
        var now = DateTime.UtcNow;

        context.DbContext.ReadStores.Add(new ReadStoreConnection { Id = storeId, StoreName = "Mall", PlatformId = 1, Status = "CONNECTED" });
        context.DbContext.ReadReviews.AddRange(
            new ReadReview { Id = recentRev, StoreId = storeId, Rating = 5, ReviewCreatedAt = new DateTimeOffset(now.AddDays(-1), TimeSpan.Zero) },
            new ReadReview { Id = oldRev, StoreId = storeId, Rating = 1, ReviewCreatedAt = new DateTimeOffset(now.AddDays(-30), TimeSpan.Zero) }
        );
        context.DbContext.ReadAnalyses.AddRange(
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = recentRev, OverallSentiment = "POS", ProcessedAt = new DateTimeOffset(now.AddDays(-1), TimeSpan.Zero) },
            new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = oldRev, OverallSentiment = "NEG", ProcessedAt = new DateTimeOffset(now.AddDays(-30), TimeSpan.Zero) }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Truy vấn KPI chỉ trong khoảng [now - 5 ngày .. now + 1 ngày]
        var kpi = await context.DashboardService.GetKpiAsync(now.AddDays(-5), now.AddDays(1));

        // 3. Assert (Kiểm chứng): Chỉ đếm đúng 1 review gần đây với PosPercent = 100% và NegPercent = 0%
        Assert.Equal(1, kpi.TotalReviews);
        Assert.Equal(100.0, kpi.PosPercent);
        Assert.Equal(0.0, kpi.NegPercent);
    }

    [Fact]
    public async Task GetNegativeSpikesAsync_NegativeDaysAndPositiveOnlyProduct_ClampsLookbackAndExcludesNonNegative()
    {
        // [TC-BE-REP-12] Chuẩn ISO 29119-4 (Boundary & Exclusion - Kẹp days âm về 1 ngày & loại bỏ sản phẩm toàn đánh giá tích cực)
        // 1. Arrange (Chuẩn bị): Sản phẩm tốt 100% POS trong ngày hôm nay
        using var context = new ReportingTestContext();
        var storeId = Guid.NewGuid();
        var goodProd = Guid.NewGuid();
        var goodRev = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        context.DbContext.ReadStores.Add(new ReadStoreConnection { Id = storeId, StoreName = "Shop Chuẩn", PlatformId = 1 });
        context.DbContext.ReadProducts.Add(new ReadProduct { Id = goodProd, StoreId = storeId, Name = "Sản Phẩm Hoàn Hảo" });
        context.DbContext.ReadReviews.Add(new ReadReview { Id = goodRev, StoreId = storeId, ProductId = goodProd, ReviewCreatedAt = now });
        context.DbContext.ReadAnalyses.Add(new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = goodRev, OverallSentiment = "POS", ProcessedAt = now });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Truyền tham số days âm (-5)
        var spikes = await context.DashboardService.GetNegativeSpikesAsync(days: -5);

        // 3. Assert (Kiểm chứng): Không văng lỗi và không đưa sản phẩm toàn POS vào danh sách cảnh báo tiêu cực
        Assert.Empty(spikes);
    }

    [Fact]
    public void DashboardController_MustRequireAuthorizeInsteadOfAllowAnonymous()
    {
        // [TC-BE-REP-17] Chuẩn OWASP API1/API3:2023 (Broken Access Control - Không lộ số liệu kinh doanh Dashboard cho truy cập ẩn danh · ISO TDD)
        // 1. Arrange (Chuẩn bị): Kiểm tra thuộc tính phân quyền của DashboardController
        var authAttr = Attribute.GetCustomAttribute(typeof(DashboardController), typeof(AuthorizeAttribute));
        var anonAttr = Attribute.GetCustomAttribute(typeof(DashboardController), typeof(AllowAnonymousAttribute));

        // 2 & 3. Act & Assert (Kiểm chứng): DashboardController bắt buộc có [Authorize] và không được gắn [AllowAnonymous]
        Assert.NotNull(authAttr);
        Assert.Null(anonAttr);
    }

    [Fact]
    public async Task GetNegativeSpikesAsync_ExcessiveLookbackDays_ClampsWindowToAntiDoSMaximum()
    {
        // [TC-BE-REP-18] Chuẩn OWASP API4:2023 (Anti-DDoS Unbounded Time Window - Kẹp trần truy vấn lookback days <= 365 ngày · ISO TDD)
        // 1. Arrange (Chuẩn bị): Nạp 1 sản phẩm có đánh giá tiêu cực quá cũ (500 ngày trước) ngoài cửa sổ 1 năm
        using var context = new ReportingTestContext();
        var storeId = Guid.NewGuid();
        var prodId = Guid.NewGuid();
        var oldRevId = Guid.NewGuid();
        var ancientTime = DateTimeOffset.UtcNow.AddDays(-500);

        context.DbContext.ReadStores.Add(new ReadStoreConnection { Id = storeId, StoreName = "Old Mall", PlatformId = 1 });
        context.DbContext.ReadProducts.Add(new ReadProduct { Id = prodId, StoreId = storeId, Name = "Sản Phẩm Cũ" });
        context.DbContext.ReadReviews.Add(new ReadReview { Id = oldRevId, StoreId = storeId, ProductId = prodId, ReviewCreatedAt = ancientTime });
        context.DbContext.ReadAnalyses.Add(new ReadReviewAIAnalysis { Id = Guid.NewGuid(), ReviewId = oldRevId, OverallSentiment = "NEG", ProcessedAt = ancientTime });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Kẻ tấn công truyền days = 36500 (100 năm) để quét toàn bộ bảng lịch sử
        var spikes = await context.DashboardService.GetNegativeSpikesAsync(days: 36500);

        // 3. Assert (Kiểm chứng): Cửa sổ lookback phải được kẹp trần (tối đa <= 365 ngày) nên dữ liệu 500 ngày trước không lọt vào quét toàn DB
        Assert.Empty(spikes);
    }
}
