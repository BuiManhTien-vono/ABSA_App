using HigenAbsa.Modules.Reporting.Application.DTOs;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.Reporting.Application.Services;

public interface IAuditLogService
{
    Task LogAsync(
        Guid? userId, string action, string entityName, string? entityId,
        string? details = null, string? oldValuesJson = null, string? newValuesJson = null, string? ipAddress = null);

    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(
        int page, int pageSize, string? action, Guid? userId, string? entityName,
        DateTime? dateFrom, DateTime? dateTo);
}

