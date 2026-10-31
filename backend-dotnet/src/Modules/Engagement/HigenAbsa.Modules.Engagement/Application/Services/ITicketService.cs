using HigenAbsa.Modules.Engagement.Application.DTOs;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.Engagement.Application.Services;

public interface ITicketService
{
    Task<PagedResult<TicketListDto>> GetTicketsAsync(
        int page, int pageSize, string? status, string? priority, Guid? assignedToUserId);
    Task<TicketDetailDto?> GetTicketByIdAsync(Guid id);
    Task<TicketDetailDto?> AssignTicketAsync(Guid id, Guid userId);
    Task<TicketDetailDto?> UpdateTicketStatusAsync(Guid id, string status);
    Task<TicketDetailDto?> ResolveTicketAsync(Guid id, string resolutionNotes);
    Task<TicketStatsDto> GetTicketStatsAsync();
}

