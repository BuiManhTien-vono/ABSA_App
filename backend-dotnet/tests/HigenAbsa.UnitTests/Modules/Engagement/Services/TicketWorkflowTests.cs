using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Engagement.Domain;
using HigenAbsa.Modules.Engagement.Endpoints;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.SharedKernel.Events;
using HigenAbsa.UnitTests.Modules.Engagement.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Engagement.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Mục 4 (Nhóm 4.1): Vòng đời Ticket CSKH Kanban (OPEN -> IN_PROGRESS -> RESOLVED -> OPEN)
/// và Bộ lắng nghe sự kiện phát hiện đánh giá tiêu cực.
/// Đối chiếu chuẩn ISO/IEC/IEEE 29119-4 (State Transition) và ISO/IEC 25010:2023.
/// </summary>
public class TicketWorkflowTests
{
    [Fact]
    public async Task NegativeReviewDetectedEventHandler_NewNegativeReview_AutoCreatesOpenTicketWithIdempotency()
    {
        // [TC-BE-ENG-01] Chuẩn ISO 25010:2023 (Functional Suitability & Reliability - Idempotency)
        // 1. Arrange (Chuẩn bị): Tạo sự kiện phát hiện đánh giá tiêu cực
        using var context = new EngagementTestContext();
        var reviewId = Guid.NewGuid();
        var storeId = Guid.NewGuid();
        var evt = new NegativeReviewDetectedIntegrationEvent(
            reviewId,
            storeId,
            CustomerName: "Nguyễn Thu Hà",
            CustomerPhone: "0901234567",
            Title: "Khiếu nại tai nghe lỗi",
            Description: "Tai nghe dùng 1 tiếng đã sụt pin tắt nguồn",
            Priority: "URGENT");

        // 2. Act (Thực thi): Gửi sự kiện 2 lần liên tiếp để kiểm tra tính lũy đẳng
        await context.NegativeReviewHandler.HandleAsync(evt);
        await context.NegativeReviewHandler.HandleAsync(evt);

        // 3. Assert (Kiểm chứng): Chỉ tạo đúng 1 Ticket với trạng thái OPEN và mức ưu tiên URGENT
        var tickets = await context.DbContext.Tickets.Where(t => t.ReviewId == reviewId).ToListAsync();
        var ticket = Assert.Single(tickets);
        Assert.Equal("OPEN", ticket.Status);
        Assert.Equal("URGENT", ticket.Priority);
        Assert.Equal("Nguyễn Thu Hà", ticket.CustomerName);
    }

    [Fact]
    public async Task AssignTicketAsync_OpenTicketAndValidUser_TransitionsToInProgressAndSetsAssignee()
    {
        // [TC-BE-ENG-02] Chuẩn ISO 29119-4 (State Transition: OPEN -> IN_PROGRESS khi được giao cho nhân viên)
        // 1. Arrange (Chuẩn bị): Có 1 Ticket đang OPEN và 1 nhân viên CSKH hợp lệ trong UserLookup
        using var context = new EngagementTestContext();
        var ticketId = Guid.NewGuid();
        var staffId = Guid.NewGuid();

        context.UserLookup.Users[staffId] = new UserContractDto(
            staffId, "Trần Văn Nam (CSKH)", "nam.cskh@higen.vn", "CSKH_STAFF", true);

        context.DbContext.Tickets.Add(new Ticket
        {
            Id = ticketId,
            ReviewId = Guid.NewGuid(),
            StoreId = Guid.NewGuid(),
            Title = "Khiếu nại giao nhầm size",
            Status = "OPEN",
            Priority = "HIGH"
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Phân công Ticket cho nhân viên CSKH
        var assigned = await context.TicketService.AssignTicketAsync(ticketId, staffId);

        // 3. Assert (Kiểm chứng): Tự động chuyển trạng thái từ OPEN sang IN_PROGRESS và gán đúng tên nhân viên
        Assert.NotNull(assigned);
        Assert.Equal("IN_PROGRESS", assigned.Status);
        Assert.Equal(staffId, assigned.AssignedToUserId);
        Assert.Equal("Trần Văn Nam (CSKH)", assigned.AssignedToName);
    }

    [Fact]
    public async Task AssignTicketAsync_NonExistentUser_ThrowsInvalidOperationException()
    {
        // [TC-BE-ENG-03] Chuẩn ISO 25010:2023 (Reliability - Fault Tolerance)
        // 1. Arrange (Chuẩn bị): Có Ticket hợp lệ nhưng UserId không tồn tại trong hệ thống
        using var context = new EngagementTestContext();
        var ticketId = Guid.NewGuid();
        context.DbContext.Tickets.Add(new Ticket
        {
            Id = ticketId,
            ReviewId = Guid.NewGuid(),
            StoreId = Guid.NewGuid(),
            Title = "Khiếu nại kiểm thử",
            Status = "OPEN"
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Ném InvalidOperationException khi nhân viên không tồn tại
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.TicketService.AssignTicketAsync(ticketId, Guid.NewGuid()));
        Assert.Equal("Assigned user not found.", ex.Message);
    }

    [Fact]
    public async Task ResolveTicketAsync_ValidTicket_SetsStatusResolvedTrimsNotesAndRecordsTimestamp()
    {
        // [TC-BE-ENG-04] Chuẩn ISO 25010:2023 (Functional Completeness)
        // 1. Arrange (Chuẩn bị): Ticket đang ở trạng thái IN_PROGRESS
        using var context = new EngagementTestContext();
        var ticketId = Guid.NewGuid();
        context.DbContext.Tickets.Add(new Ticket
        {
            Id = ticketId,
            ReviewId = Guid.NewGuid(),
            StoreId = Guid.NewGuid(),
            Title = "Khiếu nại hộp móp",
            Status = "IN_PROGRESS"
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Đánh dấu giải quyết kèm ghi chú có khoảng trắng thừa
        var resolved = await context.TicketService.ResolveTicketAsync(
            ticketId,
            "   Đã gọi điện xin lỗi và gửi bù voucher 30k cho khách.   ");

        // 3. Assert (Kiểm chứng): Trạng thái đổi thành RESOLVED, ghi chú được Trim() và ResolvedAt khác null
        Assert.NotNull(resolved);
        Assert.Equal("RESOLVED", resolved.Status);
        Assert.Equal("Đã gọi điện xin lỗi và gửi bù voucher 30k cho khách.", resolved.ResolutionNotes);
        Assert.NotNull(resolved.ResolvedAt);
    }

    [Fact]
    public async Task UpdateTicketStatusAsync_ReopeningResolvedTicket_ClearsResolvedAtTimestamp()
    {
        // [TC-BE-ENG-05] Chuẩn ISO 29119-4 (State Transition: RESOLVED -> OPEN phải xóa ResolvedAt · ISO TDD)
        // 1. Arrange (Chuẩn bị): Ticket đã được giải quyết (Status = RESOLVED, ResolvedAt đã có giá trị)
        using var context = new EngagementTestContext();
        var ticketId = Guid.NewGuid();
        context.DbContext.Tickets.Add(new Ticket
        {
            Id = ticketId,
            ReviewId = Guid.NewGuid(),
            StoreId = Guid.NewGuid(),
            Title = "Khiếu nại cần mở lại",
            Status = "RESOLVED",
            ResolvedAt = DateTimeOffset.UtcNow.AddHours(-2)
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Quản lý mở lại Ticket về trạng thái OPEN vì khách hàng chưa đồng ý phương án
        var reopened = await context.TicketService.UpdateTicketStatusAsync(ticketId, "OPEN");

        // 3. Assert (Kiểm chứng): Một Ticket đang OPEN không được giữ mốc thời gian ResolvedAt cũ
        Assert.NotNull(reopened);
        Assert.Equal("OPEN", reopened.Status);
        Assert.Null(reopened.ResolvedAt);
    }

    [Fact]
    public async Task GetTicketStatsAsync_MultipleTicketsAcrossStatusesAndPriorities_ComputesAccurateKanbanCounters()
    {
        // [TC-BE-ENG-06] Chuẩn ISO 25010:2023 (Functional Correctness)
        // 1. Arrange (Chuẩn bị): Tạo 4 Ticket ở 4 trạng thái (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
        using var context = new EngagementTestContext();
        context.DbContext.Tickets.AddRange(
            new Ticket { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), StoreId = Guid.NewGuid(), Title = "T1", Status = "OPEN", Priority = "URGENT" },
            new Ticket { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), StoreId = Guid.NewGuid(), Title = "T2", Status = "IN_PROGRESS", Priority = "HIGH" },
            new Ticket { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), StoreId = Guid.NewGuid(), Title = "T3", Status = "RESOLVED", Priority = "URGENT" },
            new Ticket { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), StoreId = Guid.NewGuid(), Title = "T4", Status = "CLOSED", Priority = "LOW" }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Tính toán thống kê Kanban
        var stats = await context.TicketService.GetTicketStatsAsync();

        // 3. Assert (Kiểm chứng): Đếm chính xác từng cột và chỉ tính UrgentCount cho các Ticket chưa RESOLVED/CLOSED
        Assert.Equal(4, stats.TotalCount);
        Assert.Equal(1, stats.OpenCount);
        Assert.Equal(1, stats.InProgressCount);
        Assert.Equal(1, stats.ResolvedCount);
        Assert.Equal(1, stats.ClosedCount);
        Assert.Equal(1, stats.UrgentCount);
        Assert.Equal(1, stats.HighCount);
    }

    [Fact]
    public async Task GetTicketsAsync_FilterByStatusPriorityAndAssignee_ReturnsFilteredPagedResultWithNames()
    {
        // [TC-BE-ENG-11] Chuẩn ISO 29119-4 (Combinatorial Filtering - Lọc Ticket đa điều kiện kèm tên nhân viên phụ trách)
        // 1. Arrange (Chuẩn bị): Tạo 3 Ticket ở nhiều trạng thái/độ ưu tiên và đăng ký nhân viên CSKH
        using var context = new EngagementTestContext();
        var staffId = Guid.NewGuid();
        context.UserLookup.Users[staffId] = new UserContractDto(staffId, "Phạm Gia Bảo", "bao@higen.vn", "CSKH_STAFF", true);

        context.DbContext.Tickets.AddRange(
            new Ticket { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), StoreId = Guid.NewGuid(), Title = "Ticket Khớp", Status = "IN_PROGRESS", Priority = "HIGH", AssignedToUserId = staffId },
            new Ticket { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), StoreId = Guid.NewGuid(), Title = "Ticket Sai Priority", Status = "IN_PROGRESS", Priority = "LOW", AssignedToUserId = staffId },
            new Ticket { Id = Guid.NewGuid(), ReviewId = Guid.NewGuid(), StoreId = Guid.NewGuid(), Title = "Ticket Chưa Giao", Status = "OPEN", Priority = "HIGH" }
        );
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Lọc theo status="in_progress", priority="high", assignedToUserId=staffId
        var page = await context.TicketService.GetTicketsAsync(1, 10, "in_progress", "high", staffId);

        // 3. Assert (Kiểm chứng): Chỉ trả về 1 Ticket khớp cả 3 điều kiện kèm tên "Phạm Gia Bảo"
        Assert.Equal(1, page.TotalCount);
        var ticket = Assert.Single(page.Items);
        Assert.Equal("Phạm Gia Bảo", ticket.AssignedToName);
        Assert.Equal("HIGH", ticket.Priority);
    }

    [Fact]
    public async Task GetTicketByIdAsync_HydratesCrossModuleReviewInferenceStoreAndUserNames()
    {
        // [TC-BE-ENG-12] Chuẩn ISO 25010:2023 (Modularity - Liên kết dữ liệu từ 4 Contract vào TicketDetailDto)
        // 1. Arrange (Chuẩn bị): Nạp dữ liệu giả lập cho StoreLookup, UserLookup, ReviewLookup, InferenceLookup
        using var context = new EngagementTestContext();
        var storeId = Guid.NewGuid();
        var reviewId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var ticketId = Guid.NewGuid();

        context.StoreLookup.Stores[storeId] = new StoreContractDto(storeId, "HIGEN Flagship", 1, "SHOPEE", "CONNECTED");
        context.UserLookup.Users[userId] = new UserContractDto(userId, "Võ Lan Anh", "anh@higen.vn", "CSKH_STAFF", true);
        context.ReviewLookup.Reviews[reviewId] = new ReviewContractDto(reviewId, storeId, 1, "Hàng giao bị vỡ", DateTimeOffset.UtcNow, "ANALYZED");
        context.InferenceLookup.Analyses[reviewId] = new InferenceSummaryContractDto(reviewId, "NEG", 0.97f, "Vỡ do đóng gói", "Shop xin hoàn tiền ngay ạ!");

        context.DbContext.Tickets.Add(new Ticket
        {
            Id = ticketId,
            ReviewId = reviewId,
            StoreId = storeId,
            AssignedToUserId = userId,
            Title = "Khiếu nại hàng vỡ",
            Status = "IN_PROGRESS",
            Priority = "URGENT"
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Truy vấn chi tiết Ticket
        var detail = await context.TicketService.GetTicketByIdAsync(ticketId);

        // 3. Assert (Kiểm chứng): Ghép đủ StoreName, AssignedToName, ReviewComment, OverallSentiment và SuggestedSellerResponse
        Assert.NotNull(detail);
        Assert.Equal("HIGEN Flagship", detail.StoreName);
        Assert.Equal("Võ Lan Anh", detail.AssignedToName);
        Assert.Equal("Hàng giao bị vỡ", detail.ReviewComment);
        Assert.Equal("NEG", detail.OverallSentiment);
        Assert.Equal("Vỡ do đóng gói", detail.CustomerInsight);
        Assert.Equal("Shop xin hoàn tiền ngay ạ!", detail.SuggestedSellerResponse);
    }

    [Fact]
    public async Task ResolveTicketAsync_NonExistentTicketId_ReturnsNullSafely()
    {
        // [TC-BE-ENG-13] Chuẩn ISO 25010:2023 (Fault Tolerance - Không ném NullReference khi Resolve Ticket không tồn tại)
        // 1. Arrange (Chuẩn bị): Khởi tạo EngagementTestContext
        using var context = new EngagementTestContext();

        // 2. Act (Thực thi): Gọi ResolveTicketAsync với Guid không tồn tại
        var result = await context.TicketService.ResolveTicketAsync(Guid.NewGuid(), "Đã xử lý");

        // 3. Assert (Kiểm chứng): Trả về null an toàn
        Assert.Null(result);
    }

    [Fact]
    public async Task AssignTicketAsync_DeactivatedStaffAccount_ThrowsInvalidOperationException()
    {
        // [TC-BE-ENG-14] Chuẩn ISO 25010:2023 (Security / Workflow - Không được giao Ticket cho nhân viên đã bị vô hiệu hóa · ISO TDD)
        // 1. Arrange (Chuẩn bị): Tạo Ticket OPEN và một tài khoản nhân viên đang bị khóa (IsActive = false)
        using var context = new EngagementTestContext();
        var ticketId = Guid.NewGuid();
        var inactiveUserId = Guid.NewGuid();
        context.UserLookup.Users[inactiveUserId] = new UserContractDto(
            inactiveUserId, "Nhân Viên Đã Nghỉ Việc", "locked@higen.vn", "CSKH_STAFF", IsActive: false);

        context.DbContext.Tickets.Add(new Ticket
        {
            Id = ticketId,
            ReviewId = Guid.NewGuid(),
            StoreId = Guid.NewGuid(),
            Title = "Ticket chờ phân công",
            Status = "OPEN"
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Phải từ chối giao việc cho tài khoản IsActive = false
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            context.TicketService.AssignTicketAsync(ticketId, inactiveUserId));
    }

    [Fact]
    public async Task GetTicketsAsync_NegativePageAndExcessivePageSize_ClampsToSafeAntiDoSBounds()
    {
        // [TC-BE-ENG-19] Chuẩn OWASP API4:2023 (Unrestricted Resource Consumption - Chống DDoS phân trang Ticket & biên âm · ISO TDD)
        // 1. Arrange (Chuẩn bị): Tạo 1 Ticket OPEN trên RAM
        using var context = new EngagementTestContext();
        context.DbContext.Tickets.Add(new Ticket
        {
            Id = Guid.NewGuid(),
            ReviewId = Guid.NewGuid(),
            StoreId = Guid.NewGuid(),
            Title = "Ticket test DDoS",
            Status = "OPEN"
        });
        await context.DbContext.SaveChangesAsync();

        // 2. Act (Thực thi): Gửi page = 0 và pageSize = 100000
        var result = await context.TicketService.GetTicketsAsync(page: 0, pageSize: 100000, null, null, null);

        // 3. Assert (Kiểm chứng): Page >= 1 và PageSize phải bị giới hạn <= 100
        Assert.InRange(result.Page, 1, int.MaxValue);
        Assert.InRange(result.PageSize, 1, 100);
    }

    [Fact]
    public void TicketController_MustRequireAuthorizeInsteadOfAllowAnonymous()
    {
        // [TC-BE-ENG-20] Chuẩn OWASP API1:2023 (Broken Access Control - Cấm gắn [AllowAnonymous] cho Ticket CSKH · ISO TDD)
        // 1. Arrange (Chuẩn bị): Đọc metadata phân quyền trên TicketController
        var authAttr = Attribute.GetCustomAttribute(typeof(TicketController), typeof(AuthorizeAttribute));
        var anonAttr = Attribute.GetCustomAttribute(typeof(TicketController), typeof(AllowAnonymousAttribute));

        // 2 & 3. Act & Assert (Kiểm chứng): TicketController chứa dữ liệu khách hàng nhạy cảm, bắt buộc có [Authorize] và cấm [AllowAnonymous]
        Assert.NotNull(authAttr);
        Assert.Null(anonAttr);
    }
}
