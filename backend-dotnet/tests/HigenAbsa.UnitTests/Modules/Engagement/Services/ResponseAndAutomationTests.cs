using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Engagement.Application.DTOs;
using HigenAbsa.Modules.Engagement.Endpoints;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.SharedKernel.Events;
using HigenAbsa.UnitTests.Modules.Engagement.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Engagement.Services;

/// <summary>
/// Bộ kịch bản kiểm thử Mục 4 (Nhóm 4.2): Quản lý Mẫu câu trả lời, Quy tắc Tự động (AutomationRule)
/// và Phản hồi Đánh giá (Tự động & Thủ công).
/// </summary>
public class ResponseAndAutomationTests
{
    [Fact]
    public async Task CreateRuleAsync_MinRatingGreaterThanMaxRating_ThrowsArgumentOrInvalidOperationException()
    {
        // [TC-BE-ENG-07] Chuẩn ISO 29119-4 (Boundary Value Analysis - Khoảng sao bị đảo ngược MinRating > MaxRating · ISO TDD)
        // 1. Arrange (Chuẩn bị): Yêu cầu tạo quy tắc tự động với MinRating = 5 nhưng MaxRating = 1 (vô lý về mặt toán học)
        using var context = new EngagementTestContext();
        var invalidRuleRequest = new CreateRuleRequest
        {
            RuleName = "Quy tắc khoảng sao ngược",
            MinRating = 5,
            MaxRating = 1,
            ActionType = "AUTO_REPLY_IMMEDIATELY"
        };

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Tầng dịch vụ phải từ chối cấu hình MinRating > MaxRating
        await Assert.ThrowsAnyAsync<Exception>(() =>
            context.ResponseService.CreateRuleAsync(invalidRuleRequest));
    }

    [Fact]
    public async Task ToggleRuleAsync_ExistingRule_FlipsIsEnabledStateBetweenTrueAndFalse()
    {
        // [TC-BE-ENG-08] Chuẩn ISO 29119-4 (State Transition: Enabled <-> Disabled)
        // 1. Arrange (Chuẩn bị): Tạo mới một quy tắc (mặc định IsEnabled = true)
        using var context = new EngagementTestContext();
        var created = await context.ResponseService.CreateRuleAsync(new CreateRuleRequest
        {
            RuleName = "Tự động cảm ơn đánh giá 5 sao",
            MinRating = 5,
            MaxRating = 5,
            ActionType = "AUTO_REPLY_IMMEDIATELY"
        });
        Assert.True(created.IsEnabled);

        // 2. Act (Thực thi): Bấm bật/tắt 2 lần liên tiếp
        var firstToggle = await context.ResponseService.ToggleRuleAsync(created.Id);
        var secondToggle = await context.ResponseService.ToggleRuleAsync(created.Id);

        // 3. Assert (Kiểm chứng): Lần 1 tắt về false, lần 2 bật lại true
        Assert.NotNull(firstToggle);
        Assert.False(firstToggle.IsEnabled);
        Assert.NotNull(secondToggle);
        Assert.True(secondToggle.IsEnabled);
    }

    [Fact]
    public async Task ReviewCreatedEventHandler_MatchingActiveRuleAndTemplate_CreatesAutomaticReviewResponseOnce()
    {
        // [TC-BE-ENG-09] Chuẩn ISO 25010:2023 (Functional Completeness & Idempotency)
        // 1. Arrange (Chuẩn bị): Tạo mẫu phản hồi 5 sao và quy tắc tự động trỏ tới mẫu đó
        using var context = new EngagementTestContext();
        var adminId = Guid.NewGuid();
        var template = await context.ResponseService.CreateTemplateAsync(new CreateTemplateRequest
        {
            Title = "Mẫu tri ân 5 sao",
            TargetRating = 5,
            TargetSentiment = "POS",
            ContentTemplate = "Dạ HIGEN xin chân thành cảm ơn quý khách đã đánh giá 5 sao!"
        }, adminId);

        await context.ResponseService.CreateRuleAsync(new CreateRuleRequest
        {
            RuleName = "Auto Reply 5 Sao",
            MinRating = 5,
            MaxRating = 5,
            ActionType = "AUTO_REPLY_IMMEDIATELY",
            SelectedTemplateId = template.Id
        });

        var reviewId = Guid.NewGuid();
        var evt = new ReviewCreatedIntegrationEvent(
            reviewId,
            Guid.NewGuid(),
            Rating: 5,
            ReviewText: "Sản phẩm tuyệt vời 5 sao!",
            ReviewCreatedAt: DateTimeOffset.UtcNow);

        // 2. Act (Thực thi): Gửi sự kiện đánh giá 5 sao 2 lần
        await context.ReviewCreatedHandler.HandleAsync(evt);
        await context.ReviewCreatedHandler.HandleAsync(evt);

        // 3. Assert (Kiểm chứng): Tự động sinh đúng 1 phản hồi AUTOMATIC từ mẫu đã gắn
        var responses = await context.DbContext.ReviewResponses.Where(r => r.ReviewId == reviewId).ToListAsync();
        var autoResponse = Assert.Single(responses);
        Assert.Equal("AUTOMATIC", autoResponse.ResponseType);
        Assert.Equal("SENT", autoResponse.Status);
        Assert.Equal(template.ContentTemplate, autoResponse.ResponseText);
    }

    [Fact]
    public async Task SendManualResponseAsync_ValidRequest_PersistsTrimmedManualResponseAndReturnsHistory()
    {
        // [TC-BE-ENG-10] Chuẩn ISO 25010:2023 (Functional Suitability)
        // 1. Arrange (Chuẩn bị): Khởi tạo nhân viên CSKH trong UserLookup
        using var context = new EngagementTestContext();
        var reviewId = Guid.NewGuid();
        var staffId = Guid.NewGuid();
        context.UserLookup.Users[staffId] = new UserContractDto(
            staffId, "Lê Mỹ Duyên", "duyen.cskh@higen.vn", "CSKH_STAFF", true);

        // 2. Act (Thực thi): Nhân viên gửi câu trả lời thủ công và truy vấn lại lịch sử
        var sent = await context.ResponseService.SendManualResponseAsync(
            reviewId,
            new SendResponseRequest { ResponseText = "   Dạ shop đã liên hệ hỗ trợ đổi hàng cho mình ạ!   " },
            staffId);
        var history = await context.ResponseService.GetResponseHistoryAsync(reviewId);

        // 3. Assert (Kiểm chứng): Nội dung được Trim(), loại MANUAL, gắn đúng tên nhân viên và lưu vào lịch sử
        Assert.Equal("MANUAL", sent.ResponseType);
        Assert.Equal("SUCCESS", sent.Status);
        Assert.Equal("Lê Mỹ Duyên", sent.RespondedByName);
        Assert.Equal("Dạ shop đã liên hệ hỗ trợ đổi hàng cho mình ạ!", sent.ResponseText);

        var singleHistory = Assert.Single(history);
        Assert.Equal(sent.Id, singleHistory.Id);
    }

    [Fact]
    public async Task ResponseTemplates_CreateUpdateFilterByStoreAndDelete_FullCrudLifecycleSucceeds()
    {
        // [TC-BE-ENG-15] Chuẩn ISO 25010:2023 (Functional Completeness - Vòng đời CRUD đầy đủ cho Mẫu câu trả lời)
        // 1. Arrange (Chuẩn bị): Chuẩn bị gian hàng và nhân viên tạo mẫu
        using var context = new EngagementTestContext();
        var storeId = Guid.NewGuid();
        var staffId = Guid.NewGuid();
        context.StoreLookup.Stores[storeId] = new StoreContractDto(storeId, "HIGEN Mall", 1, "SHOPEE", "CONNECTED");
        context.UserLookup.Users[staffId] = new UserContractDto(staffId, "Ngọc Anh", "na@higen.vn", "ADMIN", true);

        // 2. Act (Thực thi): Tạo 2 mẫu (1 gắn Store, 1 toàn cục), cập nhật mẫu 1, lọc theo StoreId, rồi xóa mẫu 1
        var created = await context.ResponseService.CreateTemplateAsync(new CreateTemplateRequest
        {
            StoreId = storeId,
            Title = "  Mẫu Xin Lỗi Gốc  ",
            TargetSentiment = "NEG",
            ContentTemplate = "Shop xin lỗi quý khách!"
        }, staffId);

        await context.ResponseService.CreateTemplateAsync(new CreateTemplateRequest
        {
            Title = "Mẫu Toàn Cục",
            TargetSentiment = "POS",
            ContentTemplate = "Cảm ơn bạn!"
        }, staffId);

        var updated = await context.ResponseService.UpdateTemplateAsync(created.Id, new UpdateTemplateRequest
        {
            Title = "  Mẫu Xin Lỗi Mới  ",
            IsActive = false
        });
        var storeTemplates = await context.ResponseService.GetTemplatesAsync(1, 10, storeId);
        var deleted = await context.ResponseService.DeleteTemplateAsync(created.Id);
        var deleteAgain = await context.ResponseService.DeleteTemplateAsync(created.Id);

        // 3. Assert (Kiểm chứng): Toàn bộ vòng đời CRUD & bộ lọc StoreId hoạt động chuẩn xác
        Assert.NotNull(updated);
        Assert.Equal("Mẫu Xin Lỗi Mới", updated.Title);
        Assert.False(updated.IsActive);
        Assert.Equal("HIGEN Mall", updated.StoreName);
        Assert.Equal(1, storeTemplates.TotalCount);
        Assert.True(deleted);
        Assert.False(deleteAgain);
    }

    [Fact]
    public async Task UpdateRuleAsync_ExistingAndMissingRule_UpdatesConfigurationOrReturnsNull()
    {
        // [TC-BE-ENG-16] Chuẩn ISO 25010:2023 (Functional Appropriateness - Cập nhật cấu hình quy tắc Auto-Reply)
        // 1. Arrange (Chuẩn bị): Tạo sẵn 1 AutomationRule và 1 Template đích
        using var context = new EngagementTestContext();
        var tmpl = await context.ResponseService.CreateTemplateAsync(new CreateTemplateRequest
        {
            Title = "Mẫu Tự Động Mới",
            ContentTemplate = "Cảm ơn đánh giá {rating} sao!"
        }, Guid.NewGuid());

        var rule = await context.ResponseService.CreateRuleAsync(new CreateRuleRequest
        {
            RuleName = "Rule Gốc",
            MinRating = 4,
            MaxRating = 5,
            DelayMinutes = 0
        });

        // 2. Act (Thực thi): Cập nhật thông số Rule thật và thử cập nhật Guid ma
        var updated = await context.ResponseService.UpdateRuleAsync(rule.Id, new UpdateRuleRequest
        {
            RuleName = "  Rule Nâng Cấp  ",
            DelayMinutes = 15,
            SelectedTemplateId = tmpl.Id,
            IsEnabled = false
        });
        var missing = await context.ResponseService.UpdateRuleAsync(Guid.NewGuid(), new UpdateRuleRequest { RuleName = "X" });

        // 3. Assert (Kiểm chứng): Cập nhật chính xác tên, DelayMinutes, tên mẫu liên kết và trả về null khi không tìm thấy
        Assert.NotNull(updated);
        Assert.Equal("Rule Nâng Cấp", updated.RuleName);
        Assert.Equal(15, updated.DelayMinutes);
        Assert.Equal("Mẫu Tự Động Mới", updated.SelectedTemplateTitle);
        Assert.False(updated.IsEnabled);
        Assert.Null(missing);
    }

    [Fact]
    public async Task ReviewCreatedEventHandler_RatingOutsideRuleRangeOrDisabledRule_DoesNotAutoReply()
    {
        // [TC-BE-ENG-17] Chuẩn ISO 29119-4 (Boundary Value Analysis - Không trả lời tự động ngoài biên sao hoặc khi Rule đang tắt)
        // 1. Arrange (Chuẩn bị): Tạo 1 Rule bật chỉ áp dụng [4..5] sao và 1 Rule đang tắt cho [1..3] sao
        using var context = new EngagementTestContext();
        var storeId = Guid.NewGuid();
        var tmpl = await context.ResponseService.CreateTemplateAsync(new CreateTemplateRequest
        {
            StoreId = storeId,
            Title = "Mẫu Auto",
            ContentTemplate = "Cảm ơn!"
        }, Guid.NewGuid());

        await context.ResponseService.CreateRuleAsync(new CreateRuleRequest
        {
            StoreId = storeId,
            RuleName = "Chỉ trả lời 4-5 sao",
            MinRating = 4,
            MaxRating = 5,
            SelectedTemplateId = tmpl.Id
        });

        var disabledRule = await context.ResponseService.CreateRuleAsync(new CreateRuleRequest
        {
            StoreId = storeId,
            RuleName = "Rule 1-3 sao đang tắt",
            MinRating = 1,
            MaxRating = 3,
            SelectedTemplateId = tmpl.Id
        });
        await context.ResponseService.ToggleRuleAsync(disabledRule.Id);

        var reviewId = Guid.NewGuid();

        // 2. Act (Thực thi): Gửi đánh giá 3 sao (nằm dưới biên 4 sao của rule bật, rơi vào rule đang tắt)
        await context.ReviewCreatedHandler.HandleAsync(new ReviewCreatedIntegrationEvent(
            reviewId, storeId, Rating: 3, ReviewText: "Sản phẩm bình thường", ReviewCreatedAt: DateTimeOffset.UtcNow));

        // 3. Assert (Kiểm chứng): Không tự động sinh bản ghi ReviewResponse nào
        Assert.Equal(0, await context.DbContext.ReviewResponses.CountAsync(r => r.ReviewId == reviewId));
    }

    [Fact]
    public async Task SendManualResponseAsync_WhitespaceOnlyMessage_ThrowsArgumentException()
    {
        // [TC-BE-ENG-18] Chuẩn ISO 29119-4 (Boundary / Input Validation - Chặn gửi phản hồi rỗng tới khách hàng · ISO TDD)
        // 1. Arrange (Chuẩn bị): Nhân viên CSKH gửi phản hồi toàn dấu cách trắng "   "
        using var context = new EngagementTestContext();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Phải từ chối bằng ArgumentException thay vì lưu chuỗi rỗng
        await Assert.ThrowsAnyAsync<ArgumentException>(() =>
            context.ResponseService.SendManualResponseAsync(
                Guid.NewGuid(),
                new SendResponseRequest { ResponseText = "    " },
                Guid.NewGuid()));
    }

    [Fact]
    public async Task CreateRuleAsync_NegativeDelayOrOutOfRangeRatingBounds_ThrowsArgumentException()
    {
        // [TC-BE-ENG-21] Chuẩn ISO 29119-4 (Boundary Value Analysis - Chặn DelayMinutes âm & số sao ngoài [1..5] · ISO TDD)
        // 1. Arrange (Chuẩn bị): Tạo cấu hình quy tắc với MinRating=0, MaxRating=99 và DelayMinutes=-30
        using var context = new EngagementTestContext();

        // 2. Act & 3. Assert (Thực thi & Kiểm chứng): Phải từ chối tham số âm/ngoài dải [1..5] bằng ArgumentException
        await Assert.ThrowsAnyAsync<ArgumentException>(() =>
            context.ResponseService.CreateRuleAsync(new CreateRuleRequest
            {
                RuleName = "Rule biên âm sai phạm vi",
                MinRating = 0,
                MaxRating = 99,
                DelayMinutes = -30
            }));
    }

    [Fact]
    public async Task ResponseController_MissingUserClaim_ReturnsUnauthorizedSafely()
    {
        // [TC-BE-ENG-22] Chuẩn OWASP API2:2023 (Broken Authentication - Từ chối tạo Template khi Token thiếu UserId Claim)
        // 1. Arrange (Chuẩn bị): Khởi tạo ResponseController với HttpContext rỗng (không có Claim NameIdentifier)
        using var context = new EngagementTestContext();
        var controller = new ResponseController(context.ResponseService)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext() }
        };

        // 2. Act (Thực thi): Gọi endpoint CreateTemplate
        var actionResult = await controller.CreateTemplate(new CreateTemplateRequest
        {
            Title = "Mẫu cảm ơn",
            ContentTemplate = "Cảm ơn quý khách"
        });

        // 3. Assert (Kiểm chứng): Controller trả HTTP 401 UnauthorizedResult an toàn
        Assert.IsType<UnauthorizedResult>(actionResult);
    }
}
