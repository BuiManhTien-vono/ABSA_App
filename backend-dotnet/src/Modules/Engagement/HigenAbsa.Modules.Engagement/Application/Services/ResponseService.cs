using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Engagement.Application.DTOs;
using HigenAbsa.Modules.Engagement.Domain;
using HigenAbsa.Modules.Engagement.Infrastructure;
using HigenAbsa.SharedKernel.Common;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.Engagement.Application.Services;

public class ResponseService(
    EngagementDbContext db,
    IStoreLookupContract storeLookup,
    IUserLookupContract userLookup) : IResponseService
{
    // -----------------------------------------------------------------------
    // Templates
    // -----------------------------------------------------------------------

    public async Task<PagedResult<ResponseTemplateDto>> GetTemplatesAsync(int page, int pageSize, Guid? storeId)
    {
        var query = db.ResponseTemplates.AsNoTracking().AsQueryable();

        if (storeId.HasValue)
            query = query.Where(t => t.StoreId == storeId.Value);

        var totalItems = await query.CountAsync();

        var templates = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = new List<ResponseTemplateDto>(templates.Count);
        foreach (var t in templates)
        {
            string? storeName = null;
            if (t.StoreId.HasValue)
            {
                var s = await storeLookup.GetByIdAsync(t.StoreId.Value);
                storeName = s?.StoreName;
            }

            string? createdByName = null;
            if (t.CreatedByUserId.HasValue)
            {
                var u = await userLookup.GetByIdAsync(t.CreatedByUserId.Value);
                createdByName = u?.FullName;
            }

            items.Add(new ResponseTemplateDto
            {
                Id = t.Id,
                StoreId = t.StoreId,
                StoreName = storeName,
                Title = t.Title,
                TargetRating = t.TargetRating,
                TargetSentiment = t.TargetSentiment,
                TargetAspect = t.TargetAspect,
                ContentTemplate = t.ContentTemplate,
                IsActive = t.IsActive,
                CreatedByName = createdByName,
                CreatedAt = t.CreatedAt
            });
        }

        return new PagedResult<ResponseTemplateDto>(items, totalItems, page, pageSize);
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
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.ResponseTemplates.Add(template);
        await db.SaveChangesAsync();

        var user = await userLookup.GetByIdAsync(userId);
        string? storeName = null;
        if (template.StoreId.HasValue)
        {
            var s = await storeLookup.GetByIdAsync(template.StoreId.Value);
            storeName = s?.StoreName;
        }

        return new ResponseTemplateDto
        {
            Id = template.Id,
            StoreId = template.StoreId,
            StoreName = storeName,
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
        var template = await db.ResponseTemplates.FindAsync(id);
        if (template == null) return null;

        if (!string.IsNullOrWhiteSpace(request.Title)) template.Title = request.Title.Trim();
        if (request.TargetRating.HasValue) template.TargetRating = request.TargetRating;
        if (request.TargetSentiment != null) template.TargetSentiment = request.TargetSentiment;
        if (request.TargetAspect != null) template.TargetAspect = request.TargetAspect;
        if (!string.IsNullOrWhiteSpace(request.ContentTemplate)) template.ContentTemplate = request.ContentTemplate;
        if (request.IsActive.HasValue) template.IsActive = request.IsActive.Value;
        template.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        string? storeName = null;
        if (template.StoreId.HasValue)
        {
            var s = await storeLookup.GetByIdAsync(template.StoreId.Value);
            storeName = s?.StoreName;
        }

        string? createdByName = null;
        if (template.CreatedByUserId.HasValue)
        {
            var u = await userLookup.GetByIdAsync(template.CreatedByUserId.Value);
            createdByName = u?.FullName;
        }

        return new ResponseTemplateDto
        {
            Id = template.Id,
            StoreId = template.StoreId,
            StoreName = storeName,
            Title = template.Title,
            TargetRating = template.TargetRating,
            TargetSentiment = template.TargetSentiment,
            TargetAspect = template.TargetAspect,
            ContentTemplate = template.ContentTemplate,
            IsActive = template.IsActive,
            CreatedByName = createdByName,
            CreatedAt = template.CreatedAt
        };
    }

    public async Task<bool> DeleteTemplateAsync(Guid id)
    {
        var template = await db.ResponseTemplates.FindAsync(id);
        if (template == null) return false;

        db.ResponseTemplates.Remove(template);
        await db.SaveChangesAsync();
        return true;
    }

    // -----------------------------------------------------------------------
    // Automation Rules
    // -----------------------------------------------------------------------

    public async Task<PagedResult<AutomationRuleDto>> GetRulesAsync(int page, int pageSize, Guid? storeId)
    {
        var query = db.AutomationRules.AsNoTracking().AsQueryable();

        if (storeId.HasValue)
            query = query.Where(r => r.StoreId == storeId.Value);

        var totalItems = await query.CountAsync();

        var rules = await query
            .OrderByDescending(r => r.IsEnabled)
            .ThenBy(r => r.RuleName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var templateIds = rules.Where(r => r.SelectedTemplateId.HasValue).Select(r => r.SelectedTemplateId!.Value).Distinct().ToList();
        var templateTitles = await db.ResponseTemplates
            .Where(t => templateIds.Contains(t.Id))
            .ToDictionaryAsync(t => t.Id, t => t.Title);

        var items = new List<AutomationRuleDto>(rules.Count);
        foreach (var r in rules)
        {
            string storeName = "";
            if (r.StoreId.HasValue)
            {
                var s = await storeLookup.GetByIdAsync(r.StoreId.Value);
                storeName = s?.StoreName ?? "";
            }

            string? templateTitle = null;
            if (r.SelectedTemplateId.HasValue && templateTitles.TryGetValue(r.SelectedTemplateId.Value, out var title))
            {
                templateTitle = title;
            }

            items.Add(new AutomationRuleDto
            {
                Id = r.Id,
                StoreId = r.StoreId,
                StoreName = storeName,
                RuleName = r.RuleName,
                MinRating = r.MinRating,
                MaxRating = r.MaxRating,
                ApplySentimentsJson = r.ApplySentimentsJson,
                ActionType = r.ActionType,
                DelayMinutes = r.DelayMinutes,
                SelectedTemplateId = r.SelectedTemplateId,
                SelectedTemplateTitle = templateTitle,
                UseAiGenerative = r.UseAiGenerative,
                IsEnabled = r.IsEnabled
            });
        }

        return new PagedResult<AutomationRuleDto>(items, totalItems, page, pageSize);
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
            IsEnabled = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.AutomationRules.Add(rule);
        await db.SaveChangesAsync();

        string storeName = "";
        if (rule.StoreId.HasValue)
        {
            var s = await storeLookup.GetByIdAsync(rule.StoreId.Value);
            storeName = s?.StoreName ?? "";
        }

        return new AutomationRuleDto
        {
            Id = rule.Id,
            StoreId = rule.StoreId,
            StoreName = storeName,
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
        var rule = await db.AutomationRules.FindAsync(id);
        if (rule == null) return null;

        if (!string.IsNullOrWhiteSpace(request.RuleName)) rule.RuleName = request.RuleName.Trim();
        if (request.MinRating.HasValue) rule.MinRating = request.MinRating.Value;
        if (request.MaxRating.HasValue) rule.MaxRating = request.MaxRating.Value;
        if (request.ApplySentimentsJson != null) rule.ApplySentimentsJson = request.ApplySentimentsJson;
        if (!string.IsNullOrWhiteSpace(request.ActionType)) rule.ActionType = request.ActionType;
        if (request.DelayMinutes.HasValue) rule.DelayMinutes = request.DelayMinutes.Value;
        if (request.SelectedTemplateId.HasValue) rule.SelectedTemplateId = request.SelectedTemplateId.Value;
        if (request.UseAiGenerative.HasValue) rule.UseAiGenerative = request.UseAiGenerative.Value;
        if (request.IsEnabled.HasValue) rule.IsEnabled = request.IsEnabled.Value;
        rule.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        string storeName = "";
        if (rule.StoreId.HasValue)
        {
            var s = await storeLookup.GetByIdAsync(rule.StoreId.Value);
            storeName = s?.StoreName ?? "";
        }

        string? templateTitle = null;
        if (rule.SelectedTemplateId.HasValue)
        {
            var tmpl = await db.ResponseTemplates.FindAsync(rule.SelectedTemplateId.Value);
            templateTitle = tmpl?.Title;
        }

        return new AutomationRuleDto
        {
            Id = rule.Id,
            StoreId = rule.StoreId,
            StoreName = storeName,
            RuleName = rule.RuleName,
            MinRating = rule.MinRating,
            MaxRating = rule.MaxRating,
            ApplySentimentsJson = rule.ApplySentimentsJson,
            ActionType = rule.ActionType,
            DelayMinutes = rule.DelayMinutes,
            SelectedTemplateId = rule.SelectedTemplateId,
            SelectedTemplateTitle = templateTitle,
            UseAiGenerative = rule.UseAiGenerative,
            IsEnabled = rule.IsEnabled
        };
    }

    public async Task<AutomationRuleDto?> ToggleRuleAsync(Guid id)
    {
        var rule = await db.AutomationRules.FindAsync(id);
        if (rule == null) return null;

        rule.IsEnabled = !rule.IsEnabled;
        rule.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        string storeName = "";
        if (rule.StoreId.HasValue)
        {
            var s = await storeLookup.GetByIdAsync(rule.StoreId.Value);
            storeName = s?.StoreName ?? "";
        }

        return new AutomationRuleDto
        {
            Id = rule.Id,
            StoreId = rule.StoreId,
            StoreName = storeName,
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

    // -----------------------------------------------------------------------
    // Review Responses
    // -----------------------------------------------------------------------

    public async Task<ReviewResponseItemDto> SendManualResponseAsync(
        Guid reviewId, SendResponseRequest request, Guid userId)
    {
        var response = new ReviewResponse
        {
            Id = Guid.NewGuid(),
            ReviewId = reviewId,
            ResponseText = request.ResponseText.Trim(),
            ResponseType = "MANUAL",
            RespondedByUserId = userId,
            Status = "SUCCESS",
            SentAt = DateTimeOffset.UtcNow,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.ReviewResponses.Add(response);
        await db.SaveChangesAsync();

        var user = await userLookup.GetByIdAsync(userId);

        return new ReviewResponseItemDto
        {
            Id = response.Id,
            ReviewId = response.ReviewId,
            ResponseText = response.ResponseText,
            ResponseType = response.ResponseType,
            Status = response.Status,
            RespondedByName = user?.FullName,
            RespondedAt = response.SentAt
        };
    }

    public async Task<List<ReviewResponseItemDto>> GetResponseHistoryAsync(Guid reviewId)
    {
        var responses = await db.ReviewResponses
            .AsNoTracking()
            .Where(r => r.ReviewId == reviewId)
            .OrderByDescending(r => r.SentAt)
            .ToListAsync();

        var userIds = responses.Where(r => r.RespondedByUserId.HasValue).Select(r => r.RespondedByUserId!.Value).Distinct().ToList();
        var userDict = new Dictionary<Guid, string>();
        foreach (var uid in userIds)
        {
            var u = await userLookup.GetByIdAsync(uid);
            if (u != null) userDict[uid] = u.FullName;
        }

        return responses.Select(r => new ReviewResponseItemDto
        {
            Id = r.Id,
            ReviewId = r.ReviewId,
            ResponseText = r.ResponseText,
            ResponseType = r.ResponseType,
            Status = r.Status,
            RespondedByName = r.RespondedByUserId.HasValue && userDict.TryGetValue(r.RespondedByUserId.Value, out var name) ? name : null,
            RespondedAt = r.SentAt
        }).ToList();
    }
}

