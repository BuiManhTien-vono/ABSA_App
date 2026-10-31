using HigenAbsa.Modules.Engagement.Application.DTOs;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.Engagement.Application.Services;

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

