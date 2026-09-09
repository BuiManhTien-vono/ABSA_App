// Services/Audit/AuditLogService.cs - Audit Logging Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Application.Common;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Application.Common;
using HigenAbsa.Application.DTOs.Audit;

using HigenAbsa.Domain.Interfaces;

namespace HigenAbsa.Application.Services.Audit;

public interface IAuditLogService
{
    Task LogAsync(Guid? userId, string action, string entityName, string entityId,
        string? oldValuesJson = null, string? newValuesJson = null, string? ipAddress = null);

    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(
        int page, int pageSize, string? action, Guid? userId, string? entityName,
        DateTime? dateFrom, DateTime? dateTo);
}

public class AuditLogService : IAuditLogService
{
    private readonly IUnitOfWork _uow;

    public AuditLogService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task LogAsync(
        Guid? userId, string action, string entityName, string entityId,
        string? oldValuesJson = null, string? newValuesJson = null, string? ipAddress = null)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = action.ToUpper(),
            EntityName = entityName,
            EntityId = entityId,
            OldValuesJson = oldValuesJson,
            NewValuesJson = newValuesJson,
            IpAddress = ipAddress,
            CreatedAt = DateTime.UtcNow
        };

        _uow.AuditLogs.AddAsync(log);
        await _uow.SaveChangesAsync();
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(
        int page, int pageSize, string? action, Guid? userId, string? entityName,
        DateTime? dateFrom, DateTime? dateTo)
    {
        var query = _uow.AuditLogs.Query()
            .Include(a => a.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action.ToUpper());

        if (userId.HasValue)
            query = query.Where(a => a.UserId == userId.Value);

        if (!string.IsNullOrWhiteSpace(entityName))
            query = query.Where(a => a.EntityName == entityName);

        if (dateFrom.HasValue)
            query = query.Where(a => a.CreatedAt >= dateFrom.Value);

        if (dateTo.HasValue)
            query = query.Where(a => a.CreatedAt <= dateTo.Value);

        var pagedQuery = query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                UserId = a.UserId,
                UserName = a.User != null ? a.User.FullName : "Hệ thống",
                Action = a.Action,
                EntityName = a.EntityName,
                EntityId = a.EntityId,
                OldValuesJson = a.OldValuesJson,
                NewValuesJson = a.NewValuesJson,
                IpAddress = a.IpAddress,
                CreatedAt = a.CreatedAt
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }
}

