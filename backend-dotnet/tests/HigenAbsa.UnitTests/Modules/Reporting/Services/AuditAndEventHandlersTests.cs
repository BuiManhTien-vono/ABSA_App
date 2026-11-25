using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Reporting.Endpoints;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.SharedKernel.Events;
using HigenAbsa.UnitTests.Modules.Reporting.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Reporting.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Mục 5 (Nhóm 5.2): Nhật ký Truy vết Bảo mật (AuditLogService)
/// và Bộ lắng nghe sự kiện tổng hợp báo cáo ngày (ReportingEventHandlers).
/// </summary>
public class AuditAndEventHandlersTests
{
    [Fact]
    public async Task AuditLogService_LogAndFilterByActionUserAndEntity_PersistsAndFiltersAuditTrail()
    {
        // [TC-BE-REP-07] Chuẩn ISO 25010:2023 (Security - Accountability & Traceability)
        // 1. Arrange (Chuẩn bị): Đăng ký thông tin Admin trong UserLookup và gửi sự kiện UserAuditIntegrationEvent
        using var context = new ReportingTestContext();
        var adminId = Guid.NewGuid();
        context.UserLookup.Users[adminId] = new UserContractDto(
            adminId, "Bùi Mạnh Tiến", "admin@higen.vn", "ADMIN", true);

        // 2. Act (Thực thi): Ghi 1 log qua EventHandler (chữ thường "login") và 1 log trực tiếp ("DELETE_STORE")
        await context.UserAuditHandler.HandleAsync(new UserAuditIntegrationEvent(
            adminId, "login", "SystemUser", adminId.ToString(), "Admin logged in", "192.168.1.10"));

        await context.AuditLogService.LogAsync(
            adminId, "delete_store", "StoreConnection", "st-01", "Deleted store", ipAddress: "192.168.1.10");

        var loginLogs = await context.AuditLogService.GetAuditLogsAsync(
            page: 1, pageSize: 10, action: "LOGIN", userId: adminId, entityName: "SystemUser", dateFrom: null, dateTo: null);

        // 3. Assert (Kiểm chứng): Chuẩn hóa Action thành chữ hoa "LOGIN", nối đúng tên "Bùi Mạnh Tiến" và lọc chính xác
        Assert.Equal(1, loginLogs.TotalCount);
        var logItem = Assert.Single(loginLogs.Items);
        Assert.Equal("LOGIN", logItem.Action);
        Assert.Equal("Bùi Mạnh Tiến", logItem.UserName);
        Assert.Equal("192.168.1.10", logItem.IpAddress);
    }

    [Fact]
    public async Task ReportingEventHandlers_MultipleAnalyzedReviewsInSameDay_MaintainsConsistentTotalEqualsSumOfSentiments()
    {
        // [TC-BE-REP-08] Chuẩn ISO 25010:2023 (Data Integrity - Bất biến TotalReviews == Pos + Neu + Neg · ISO TDD)
        // 1. Arrange (Chuẩn bị): Hai đánh giá được AI phân tích xong trong cùng 1 ngày (1 POS, 1 NEG)
        using var context = new ReportingTestContext();
        var rev1 = Guid.NewGuid();
        var rev2 = Guid.NewGuid();

        // 2. Act (Thực thi): Bộ lắng nghe ReportingReviewAnalyzedEventHandler nhận 2 sự kiện phân tích liên tiếp
        await context.ReviewAnalyzedHandler.HandleAsync(
            new ReviewAnalyzedIntegrationEvent(rev1, "POS", 0.96f, null, "Cảm ơn bạn!"));
        await context.ReviewAnalyzedHandler.HandleAsync(
            new ReviewAnalyzedIntegrationEvent(rev2, "NEG", 0.91f, "Lỗi đóng gói", "Shop xin lỗi bạn!"));

        // 3. Assert (Kiểm chứng): Bảng tổng hợp ngày DailyPlatformSummary phải có Pos=1, Neg=1 và TotalReviews phải bằng tổng (2)
        var summary = await context.DbContext.DailyPlatformSummaries.FirstOrDefaultAsync(s => s.PlatformCode == "ALL");
        Assert.NotNull(summary);
        Assert.Equal(1, summary.PositiveCount);
        Assert.Equal(0, summary.NeutralCount);
        Assert.Equal(1, summary.NegativeCount);
        Assert.Equal(
            summary.PositiveCount + summary.NeutralCount + summary.NegativeCount,
            summary.TotalReviews);
    }

    [Fact]
    public async Task ReportingReviewCreatedEventHandler_MultipleReviewsSameDay_IncrementsTotalReviewsProjection()
    {
        // [TC-BE-REP-13] Chuẩn ISO 25010:2023 (Functional Completeness - Cộng dồn tổng đánh giá trong ngày khi nhận sự kiện mới)
        // 1. Arrange (Chuẩn bị): Hai sự kiện đánh giá mới xuất hiện trong cùng một ngày
        using var context = new ReportingTestContext();
        var storeId = Guid.NewGuid();

        // 2. Act (Thực thi): Kích hoạt ReportingReviewCreatedEventHandler 2 lần liên tiếp
        await context.ReviewCreatedHandler.HandleAsync(new ReviewCreatedIntegrationEvent(
            Guid.NewGuid(), storeId, 5, "Tốt", DateTimeOffset.UtcNow));
        await context.ReviewCreatedHandler.HandleAsync(new ReviewCreatedIntegrationEvent(
            Guid.NewGuid(), storeId, 4, "Ổn", DateTimeOffset.UtcNow));

        // 3. Assert (Kiểm chứng): Bản ghi tổng hợp ngày "ALL" có TotalReviews = 2
        var summary = await context.DbContext.DailyPlatformSummaries.FirstOrDefaultAsync(s => s.PlatformCode == "ALL");
        Assert.NotNull(summary);
        Assert.Equal(2, summary.TotalReviews);
    }

    [Fact]
    public async Task ReportingEventHandlers_CreatedThenAnalyzedSameDay_MaintainsConsistentTotalEqualsSum()
    {
        // [TC-BE-REP-14] Chuẩn ISO 25010:2023 (Modularity & Data Integrity - Khớp nối đúng chuỗi Created -> Analyzed trong cùng ngày)
        // 1. Arrange (Chuẩn bị): 1 đánh giá vừa tạo xong được chuyển qua AI phân tích trong cùng ngày
        using var context = new ReportingTestContext();
        var reviewId = Guid.NewGuid();
        var storeId = Guid.NewGuid();

        // 2. Act (Thực thi): Created tăng TotalReviews lên 1, sau đó Analyzed ghi nhận kết quả POS vào đúng bản ghi ngày đó
        await context.ReviewCreatedHandler.HandleAsync(new ReviewCreatedIntegrationEvent(
            reviewId, storeId, 5, "Quá hài lòng", DateTimeOffset.UtcNow));
        await context.ReviewAnalyzedHandler.HandleAsync(new ReviewAnalyzedIntegrationEvent(
            reviewId, "POS", 0.98f, null, "Cảm ơn bạn đã ủng hộ!"));

        // 3. Assert (Kiểm chứng): TotalReviews = 1 và PositiveCount = 1 (không bị nhân đôi lên 2)
        var summary = await context.DbContext.DailyPlatformSummaries.FirstOrDefaultAsync(s => s.PlatformCode == "ALL");
        Assert.NotNull(summary);
        Assert.Equal(1, summary.TotalReviews);
        Assert.Equal(1, summary.PositiveCount);
    }

    [Fact]
    public async Task AuditLogService_PaginationAndDateRangeFilter_ReturnsDescendingChronologicalPage()
    {
        // [TC-BE-REP-15] Chuẩn ISO 25010:2023 (Accountability - Phân trang và lọc nhật ký Audit Trail theo khoảng ngày)
        // 1. Arrange (Chuẩn bị): Ghi 3 bản ghi Audit Log liên tiếp
        using var context = new ReportingTestContext();
        var userId = Guid.NewGuid();
        await context.AuditLogService.LogAsync(userId, "CREATE_STORE", "StoreConnection", "S1", "Created 1");
        await Task.Delay(15);
        await context.AuditLogService.LogAsync(userId, "SYNC_STORE", "StoreConnection", "S1", "Synced 2");
        await Task.Delay(15);
        await context.AuditLogService.LogAsync(userId, "DELETE_STORE", "StoreConnection", "S1", "Deleted 3");

        // 2. Act (Thực thi): Lấy trang 1 kích thước 2 trong khoảng ngày hôm nay
        var page1 = await context.AuditLogService.GetAuditLogsAsync(
            page: 1,
            pageSize: 2,
            action: null,
            userId: userId,
            entityName: "StoreConnection",
            dateFrom: DateTime.UtcNow.AddDays(-1),
            dateTo: DateTime.UtcNow.AddDays(1));

        // 3. Assert (Kiểm chứng): Tổng 3 bản ghi, trang 1 trả 2 bản ghi theo thứ tự mới nhất trước (DELETE_STORE -> SYNC_STORE)
        Assert.Equal(3, page1.TotalCount);
        Assert.Equal(2, page1.Items.Count);
        Assert.Equal("DELETE_STORE", page1.Items[0].Action);
        Assert.Equal("SYNC_STORE", page1.Items[1].Action);
    }

    [Fact]
    public async Task AuditLogService_UnknownUserId_PreservesAuditRecordWithNullUserName()
    {
        // [TC-BE-REP-16] Chuẩn ISO 25010:2023 (Non-repudiation - Giữ nguyên dấu vết log dù UserId chưa tra cứu được tên)
        // 1. Arrange (Chuẩn bị): UserId chưa từng khai báo trong FakeUserLookup
        using var context = new ReportingTestContext();
        var unknownUserId = Guid.NewGuid();

        // 2. Act (Thực thi): Ghi log hành động và truy vấn lại
        await context.AuditLogService.LogAsync(unknownUserId, "SYSTEM_TASK", "BatchJob", "J1", "Background run");
        var logs = await context.AuditLogService.GetAuditLogsAsync(1, 10, "SYSTEM_TASK", unknownUserId, null, null, null);

        // 3. Assert (Kiểm chứng): Nhật ký vẫn được lưu và truy xuất đầy đủ, UserName an toàn bằng null
        var item = Assert.Single(logs.Items);
        Assert.Equal(unknownUserId, item.UserId);
        Assert.Null(item.UserName);
        Assert.Equal("SYSTEM_TASK", item.Action);
    }

    [Fact]
    public async Task AuditLogService_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds()
    {
        // [TC-BE-REP-19] Chuẩn OWASP API4:2023 (Unrestricted Resource Consumption - Kẹp biên phân trang AuditLog · ISO TDD)
        // 1. Arrange (Chuẩn bị): Ghi 1 dòng nhật ký kiểm toán
        using var context = new ReportingTestContext();
        await context.AuditLogService.LogAsync(Guid.NewGuid(), "LOGIN", "SystemUser", "U1", "Test");

        // 2. Act (Thực thi): Truy vấn với page = -3 và pageSize = 50000
        var result = await context.AuditLogService.GetAuditLogsAsync(-3, 50000, null, null, null, null, null);

        // 3. Assert (Kiểm chứng): Page >= 1 và PageSize <= 100
        Assert.InRange(result.Page, 1, int.MaxValue);
        Assert.InRange(result.PageSize, 1, 100);
    }

    [Fact]
    public void AuditLogController_Endpoints_EnforceAdminRoleAuthorization()
    {
        // [TC-BE-REP-20] Chuẩn OWASP API5:2023 (Accountability Protection - Chỉ ADMIN mới được truy xuất Audit Log)
        // 1. Arrange (Chuẩn bị): Kiểm tra thuộc tính [Authorize] trên AuditLogController
        var authAttr = Attribute.GetCustomAttribute(typeof(AuditLogController), typeof(AuthorizeAttribute)) as AuthorizeAttribute;
        var anonAttr = Attribute.GetCustomAttribute(typeof(AuditLogController), typeof(AllowAnonymousAttribute));

        // 2 & 3. Act & Assert (Kiểm chứng): Bắt buộc Roles = "ADMIN" và không có [AllowAnonymous]
        Assert.NotNull(authAttr);
        Assert.Equal("ADMIN", authAttr.Roles);
        Assert.Null(anonAttr);
    }
}
