// Services/Audit/AuditLogService.cs - Audit Logging Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Core;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models;
using HigenAbsa.Api.Models.Audit;

namespace HigenAbsa.Api.Services.Audit;

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
    private readonly AppDbContext _db;

    public AuditLogService(AppDbContext db)
    {
        _db = db;
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

        _db.AuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(
        int page, int pageSize, string? action, Guid? userId, string? entityName,
        DateTime? dateFrom, DateTime? dateTo)
    {
        var query = _db.AuditLogs
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
