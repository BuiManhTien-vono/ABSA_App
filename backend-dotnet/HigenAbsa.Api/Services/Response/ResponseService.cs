// Services/Response/ResponseService.cs - Response Template, Automation Rule & Response Management Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Core;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models;
using HigenAbsa.Api.Models.Response;
using HigenAbsa.Api.Models.Review;

namespace HigenAbsa.Api.Services.Response;

public interface IResponseService
{
    // Templates
    Task<PagedResult<ResponseTemplateDto>> GetTemplatesAsync(int page, int pageSize, Guid? storeId);
    Task<ResponseTemplateDto> CreateTemplateAsync(CreateTemplateRequest request, Guid userId);
    Task<ResponseTemplateDto?> UpdateTemplateAsync(Guid id, UpdateTemplateRequest request);
    Task<bool> DeleteTemplateAsync(Guid id);

    // Automation Rules
    Task<PagedResult<AutomationRuleDto>> GetRulesAsync(int page, int pageSize, Guid? storeId);
    Task<AutomationRuleDto> CreateRuleAsync(CreateRuleRequest request);
    Task<AutomationRuleDto?> UpdateRuleAsync(Guid id, UpdateRuleRequest request);
    Task<AutomationRuleDto?> ToggleRuleAsync(Guid id);

    // Review Responses
    Task<ReviewResponseItemDto> SendManualResponseAsync(Guid reviewId, SendResponseRequest request, Guid userId);
    Task<List<ReviewResponseItemDto>> GetResponseHistoryAsync(Guid reviewId);
}

public class ResponseService : IResponseService
{
    private readonly AppDbContext _db;

    public ResponseService(AppDbContext db)
    {
        _db = db;
    }

    // -----------------------------------------------------------------------
    // Templates
    // -----------------------------------------------------------------------

    public async Task<PagedResult<ResponseTemplateDto>> GetTemplatesAsync(int page, int pageSize, Guid? storeId)
    {
        var query = _db.ResponseTemplates
            .Include(t => t.Store)
            .Include(t => t.CreatedByUser)
            .AsQueryable();

        if (storeId.HasValue)
            query = query.Where(t => t.StoreId == storeId.Value);

        var pagedQuery = query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new ResponseTemplateDto
            {
                Id = t.Id,
                StoreId = t.StoreId,
                StoreName = t.Store != null ? t.Store.StoreName : null,
                Title = t.Title,
                TargetRating = t.TargetRating,
                TargetSentiment = t.TargetSentiment,
                TargetAspect = t.TargetAspect,
                ContentTemplate = t.ContentTemplate,
                IsActive = t.IsActive,
                CreatedByName = t.CreatedByUser != null ? t.CreatedByUser.FullName : null,
                CreatedAt = t.CreatedAt
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<ResponseTemplateDto> CreateTemplateAsync(CreateTemplateRequest request, Guid userId)
    {
        var template = new ResponseTemplate
        {
            Id = Guid.NewGuid(),
            StoreId = request.StoreId,
            Title = request.Title.Trim(),
            TargetRating = request.TargetRating,
            TargetSentiment = request.TargetSentiment,
            TargetAspect = request.TargetAspect,
            ContentTemplate = request.ContentTemplate,
            IsActive = true,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _db.ResponseTemplates.Add(template);
        await _db.SaveChangesAsync();

        var user = await _db.SystemUsers.FindAsync(userId);

        return new ResponseTemplateDto
        {
            Id = template.Id,
            StoreId = template.StoreId,
            Title = template.Title,
            TargetRating = template.TargetRating,
            TargetSentiment = template.TargetSentiment,
            TargetAspect = template.TargetAspect,
            ContentTemplate = template.ContentTemplate,
            IsActive = template.IsActive,
            CreatedByName = user?.FullName,
            CreatedAt = template.CreatedAt
        };
    }

    public async Task<ResponseTemplateDto?> UpdateTemplateAsync(Guid id, UpdateTemplateRequest request)
    {
        var template = await _db.ResponseTemplates
            .Include(t => t.Store)
            .Include(t => t.CreatedByUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (template == null) return null;

        if (!string.IsNullOrWhiteSpace(request.Title)) template.Title = request.Title.Trim();
        if (request.TargetRating.HasValue) template.TargetRating = request.TargetRating;
        if (request.TargetSentiment != null) template.TargetSentiment = request.TargetSentiment;
        if (request.TargetAspect != null) template.TargetAspect = request.TargetAspect;
        if (!string.IsNullOrWhiteSpace(request.ContentTemplate)) template.ContentTemplate = request.ContentTemplate;
        if (request.IsActive.HasValue) template.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync();

        return new ResponseTemplateDto
        {
            Id = template.Id,
            StoreId = template.StoreId,
            StoreName = template.Store?.StoreName,
            Title = template.Title,
            TargetRating = template.TargetRating,
            TargetSentiment = template.TargetSentiment,
            TargetAspect = template.TargetAspect,
            ContentTemplate = template.ContentTemplate,
            IsActive = template.IsActive,
            CreatedByName = template.CreatedByUser?.FullName,
            CreatedAt = template.CreatedAt
        };
    }

    public async Task<bool> DeleteTemplateAsync(Guid id)
    {
        var template = await _db.ResponseTemplates.FindAsync(id);
        if (template == null) return false;

        _db.ResponseTemplates.Remove(template);
        await _db.SaveChangesAsync();
        return true;
    }

    // -----------------------------------------------------------------------
    // Automation Rules
    // -----------------------------------------------------------------------

    public async Task<PagedResult<AutomationRuleDto>> GetRulesAsync(int page, int pageSize, Guid? storeId)
    {
        var query = _db.AutomationRules
            .Include(r => r.Store)
            .Include(r => r.SelectedTemplate)
            .AsQueryable();

        if (storeId.HasValue)
            query = query.Where(r => r.StoreId == storeId.Value);

        var pagedQuery = query
            .OrderByDescending(r => r.IsEnabled)
            .ThenBy(r => r.RuleName)
            .Select(r => new AutomationRuleDto
            {
                Id = r.Id,
                StoreId = r.StoreId,
                StoreName = r.Store != null ? r.Store.StoreName : "",
                RuleName = r.RuleName,
                MinRating = r.MinRating,
                MaxRating = r.MaxRating,
                ApplySentimentsJson = r.ApplySentimentsJson,
                ActionType = r.ActionType,
                DelayMinutes = r.DelayMinutes,
                SelectedTemplateId = r.SelectedTemplateId,
                SelectedTemplateTitle = r.SelectedTemplate != null ? r.SelectedTemplate.Title : null,
                UseAiGenerative = r.UseAiGenerative,
                IsEnabled = r.IsEnabled
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<AutomationRuleDto> CreateRuleAsync(CreateRuleRequest request)
    {
        var rule = new AutomationRule
        {
            Id = Guid.NewGuid(),
            StoreId = request.StoreId,
            RuleName = request.RuleName.Trim(),
            MinRating = request.MinRating,
            MaxRating = request.MaxRating,
            ApplySentimentsJson = request.ApplySentimentsJson,
            ActionType = request.ActionType,
            DelayMinutes = request.DelayMinutes,
            SelectedTemplateId = request.SelectedTemplateId,
            UseAiGenerative = request.UseAiGenerative,
            IsEnabled = true
        };

        _db.AutomationRules.Add(rule);
        await _db.SaveChangesAsync();

        var store = await _db.StoreConnections.FindAsync(request.StoreId);

        return new AutomationRuleDto
        {
            Id = rule.Id,
            StoreId = rule.StoreId,
            StoreName = store?.StoreName ?? "",
            RuleName = rule.RuleName,
            MinRating = rule.MinRating,
            MaxRating = rule.MaxRating,
            ApplySentimentsJson = rule.ApplySentimentsJson,
            ActionType = rule.ActionType,
            DelayMinutes = rule.DelayMinutes,
            SelectedTemplateId = rule.SelectedTemplateId,
            UseAiGenerative = rule.UseAiGenerative,
            IsEnabled = rule.IsEnabled
        };
    }

    public async Task<AutomationRuleDto?> UpdateRuleAsync(Guid id, UpdateRuleRequest request)
    {
        var rule = await _db.AutomationRules
            .Include(r => r.Store)
            .Include(r => r.SelectedTemplate)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rule == null) return null;

        if (!string.IsNullOrWhiteSpace(request.RuleName)) rule.RuleName = request.RuleName.Trim();
        if (request.MinRating.HasValue) rule.MinRating = request.MinRating.Value;
        if (request.MaxRating.HasValue) rule.MaxRating = request.MaxRating.Value;
        if (request.ApplySentimentsJson != null) rule.ApplySentimentsJson = request.ApplySentimentsJson;
        if (!string.IsNullOrWhiteSpace(request.ActionType)) rule.ActionType = request.ActionType;
        if (request.DelayMinutes.HasValue) rule.DelayMinutes = request.DelayMinutes.Value;
        if (request.SelectedTemplateId.HasValue) rule.SelectedTemplateId = request.SelectedTemplateId.Value;
        if (request.UseAiGenerative.HasValue) rule.UseAiGenerative = request.UseAiGenerative.Value;

        await _db.SaveChangesAsync();

        return new AutomationRuleDto
        {
            Id = rule.Id,
            StoreId = rule.StoreId,
            StoreName = rule.Store?.StoreName ?? "",
            RuleName = rule.RuleName,
            MinRating = rule.MinRating,
            MaxRating = rule.MaxRating,
            ApplySentimentsJson = rule.ApplySentimentsJson,
            ActionType = rule.ActionType,
            DelayMinutes = rule.DelayMinutes,
            SelectedTemplateId = rule.SelectedTemplateId,
            SelectedTemplateTitle = rule.SelectedTemplate?.Title,
            UseAiGenerative = rule.UseAiGenerative,
            IsEnabled = rule.IsEnabled
        };
    }

    public async Task<AutomationRuleDto?> ToggleRuleAsync(Guid id)
    {
        var rule = await _db.AutomationRules
            .Include(r => r.Store)
            .Include(r => r.SelectedTemplate)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rule == null) return null;

        rule.IsEnabled = !rule.IsEnabled;
        await _db.SaveChangesAsync();

        return new AutomationRuleDto
        {
            Id = rule.Id,
            StoreId = rule.StoreId,
            StoreName = rule.Store?.StoreName ?? "",
            RuleName = rule.RuleName,
            MinRating = rule.MinRating,
            MaxRating = rule.MaxRating,
            ApplySentimentsJson = rule.ApplySentimentsJson,
            ActionType = rule.ActionType,
            DelayMinutes = rule.DelayMinutes,
            SelectedTemplateId = rule.SelectedTemplateId,
            SelectedTemplateTitle = rule.SelectedTemplate?.Title,
            UseAiGenerative = rule.UseAiGenerative,
            IsEnabled = rule.IsEnabled
        };
    }

    // -----------------------------------------------------------------------
    // Review Responses
    // -----------------------------------------------------------------------

    public async Task<ReviewResponseItemDto> SendManualResponseAsync(
        Guid reviewId, SendResponseRequest request, Guid userId)
    {
        var review = await _db.Reviews.FindAsync(reviewId)
            ?? throw new InvalidOperationException("Review not found.");

        var response = new ReviewResponse
        {
            Id = Guid.NewGuid(),
            ReviewId = reviewId,
            ResponseText = request.ResponseText.Trim(),
            ResponseType = "MANUAL",
            RespondedByUserId = userId,
            Status = "SUCCESS", // In production, this would be QUEUED → SUCCESS/FAILED after platform API call
            RespondedAt = DateTime.UtcNow
        };

        _db.ReviewResponses.Add(response);

        // Update review status to REPLIED
        review.Status = "REPLIED";
        await _db.SaveChangesAsync();

        var user = await _db.SystemUsers.FindAsync(userId);

        return new ReviewResponseItemDto
        {
            Id = response.Id,
            ResponseText = response.ResponseText,
            ResponseType = response.ResponseType,
            Status = response.Status,
            RespondedByName = user?.FullName,
            RespondedAt = response.RespondedAt
        };
    }

    public async Task<List<ReviewResponseItemDto>> GetResponseHistoryAsync(Guid reviewId)
    {
        return await _db.ReviewResponses
            .Include(r => r.RespondedByUser)
            .Where(r => r.ReviewId == reviewId)
            .OrderByDescending(r => r.RespondedAt)
            .Select(r => new ReviewResponseItemDto
            {
                Id = r.Id,
                ResponseText = r.ResponseText,
                ResponseType = r.ResponseType,
                Status = r.Status,
                RespondedByName = r.RespondedByUser != null ? r.RespondedByUser.FullName : null,
                RespondedAt = r.RespondedAt
            })
            .ToListAsync();
    }
}
