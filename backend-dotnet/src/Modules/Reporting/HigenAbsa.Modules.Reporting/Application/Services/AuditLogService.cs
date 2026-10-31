using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Reporting.Application.DTOs;
using HigenAbsa.Modules.Reporting.Domain;
using HigenAbsa.Modules.Reporting.Infrastructure;
using HigenAbsa.SharedKernel.Common;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.Reporting.Application.Services;

public class AuditLogService(
    ReportingDbContext db,
    IUserLookupContract userLookup) : IAuditLogService
{
    public async Task LogAsync(
        Guid? userId, string action, string entityName, string? entityId,
        string? details = null, string? oldValuesJson = null, string? newValuesJson = null, string? ipAddress = null)
    {
        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action.ToUpperInvariant(),
            EntityName = entityName,
            EntityId = entityId,
            Details = details,
            OldValuesJson = oldValuesJson,
            NewValuesJson = newValuesJson,
            IpAddress = ipAddress,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.AuditLogs.Add(log);
        await db.SaveChangesAsync();
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(
        int page, int pageSize, string? action, Guid? userId, string? entityName,
        DateTime? dateFrom, DateTime? dateTo)
    {
        var query = db.AuditLogs.AsNoTracking().AsQueryable();

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

        var totalItems = await query.CountAsync();

        var logs = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = new List<AuditLogDto>(logs.Count);
        foreach (var l in logs)
        {
            string? userName = null;
            if (l.UserId.HasValue)
            {
                var u = await userLookup.GetByIdAsync(l.UserId.Value);
                userName = u?.FullName;
            }

            items.Add(new AuditLogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                UserName = userName,
                Action = l.Action,
                EntityName = l.EntityName,
                EntityId = l.EntityId,
                Details = l.Details,
                OldValuesJson = l.OldValuesJson,
                NewValuesJson = l.NewValuesJson,
                IpAddress = l.IpAddress,
                CreatedAt = l.CreatedAt
            });
        }

        return new PagedResult<AuditLogDto>(items, totalItems, page, pageSize);
    }
}

