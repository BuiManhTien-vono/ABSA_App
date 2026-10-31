using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Engagement.Application.DTOs;
using HigenAbsa.Modules.Engagement.Domain;
using HigenAbsa.Modules.Engagement.Infrastructure;
using HigenAbsa.SharedKernel.Common;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.Engagement.Application.Services;

public class TicketService(
    EngagementDbContext db,
    IUserLookupContract userLookup,
    IStoreLookupContract storeLookup,
    IReviewLookupContract reviewLookup,
    IInferenceLookupContract inferenceLookup) : ITicketService
{
    public async Task<PagedResult<TicketListDto>> GetTicketsAsync(
        int page, int pageSize, string? status, string? priority, Guid? assignedToUserId)
    {
        var query = db.Tickets.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(t => t.Status == status.ToUpper());

        if (!string.IsNullOrWhiteSpace(priority))
            query = query.Where(t => t.Priority == priority.ToUpper());

        if (assignedToUserId.HasValue)
            query = query.Where(t => t.AssignedToUserId == assignedToUserId.Value);

        var totalItems = await query.CountAsync();

        var tickets = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = new List<TicketListDto>(tickets.Count);
        foreach (var t in tickets)
        {
            var review = await reviewLookup.GetByIdAsync(t.ReviewId);
            string? assignedToName = null;
            if (t.AssignedToUserId.HasValue)
            {
                var u = await userLookup.GetByIdAsync(t.AssignedToUserId.Value);
                assignedToName = u?.FullName;
            }

            items.Add(new TicketListDto
            {
                Id = t.Id,
                ReviewId = t.ReviewId,
                ReviewComment = review?.ReviewText ?? t.Description,
                ReviewRating = (byte)(review?.Rating ?? 1),
                CustomerName = t.CustomerName,
                AssignedToName = assignedToName,
                Priority = t.Priority,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                ResolvedAt = t.ResolvedAt
            });
        }

        return new PagedResult<TicketListDto>(items, totalItems, page, pageSize);
    }

    public async Task<TicketDetailDto?> GetTicketByIdAsync(Guid id)
    {
        var ticket = await db.Tickets.FindAsync(id);
        if (ticket == null) return null;

        var review = await reviewLookup.GetByIdAsync(ticket.ReviewId);
        var inference = await inferenceLookup.GetAnalysisByReviewIdAsync(ticket.ReviewId);

        string? assignedToName = null;
        if (ticket.AssignedToUserId.HasValue)
        {
            var u = await userLookup.GetByIdAsync(ticket.AssignedToUserId.Value);
            assignedToName = u?.FullName;
        }

        string? storeName = null;
        var s = await storeLookup.GetByIdAsync(ticket.StoreId);
        if (s != null) storeName = s.StoreName;

        return new TicketDetailDto
        {
            Id = ticket.Id,
            ReviewId = ticket.ReviewId,
            ReviewComment = review?.ReviewText ?? ticket.Description,
            ReviewRating = (byte)(review?.Rating ?? 1),
            CustomerName = ticket.CustomerName,
            AssignedToName = assignedToName,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            ResolvedAt = ticket.ResolvedAt,
            CustomerId = ticket.CustomerId,
            AssignedToUserId = ticket.AssignedToUserId,
            ResolutionNotes = ticket.ResolutionNote,
            OverallSentiment = inference?.OverallSentiment,
            CustomerInsight = inference?.RootCause,
            SuggestedSellerResponse = inference?.SuggestedResponse,
            ProductName = null,
            StoreName = storeName
        };
    }

    public async Task<TicketDetailDto?> AssignTicketAsync(Guid id, Guid userId)
    {
        var ticket = await db.Tickets.FindAsync(id);
        if (ticket == null) return null;

        var user = await userLookup.GetByIdAsync(userId)
            ?? throw new InvalidOperationException("Assigned user not found.");

        ticket.AssignedToUserId = userId;
        if (ticket.Status == "OPEN")
            ticket.Status = "IN_PROGRESS";
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return await GetTicketByIdAsync(id);
    }

    public async Task<TicketDetailDto?> UpdateTicketStatusAsync(Guid id, string status)
    {
        var ticket = await db.Tickets.FindAsync(id);
        if (ticket == null) return null;

        ticket.Status = status.ToUpper();
        if (ticket.Status is "RESOLVED" or "CLOSED")
            ticket.ResolvedAt ??= DateTimeOffset.UtcNow;
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return await GetTicketByIdAsync(id);
    }

    public async Task<TicketDetailDto?> ResolveTicketAsync(Guid id, string resolutionNotes)
    {
        var ticket = await db.Tickets.FindAsync(id);
        if (ticket == null) return null;

        ticket.Status = "RESOLVED";
        ticket.ResolutionNote = resolutionNotes.Trim();
        ticket.ResolvedAt = DateTimeOffset.UtcNow;
        ticket.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return await GetTicketByIdAsync(id);
    }

    public async Task<TicketStatsDto> GetTicketStatsAsync()
    {
        var stats = await db.Tickets
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var openCount = stats.FirstOrDefault(s => s.Status == "OPEN")?.Count ?? 0;
        var inProgressCount = stats.FirstOrDefault(s => s.Status == "IN_PROGRESS")?.Count ?? 0;
        var resolvedCount = stats.FirstOrDefault(s => s.Status == "RESOLVED")?.Count ?? 0;
        var closedCount = stats.FirstOrDefault(s => s.Status == "CLOSED")?.Count ?? 0;

        var urgentCount = await db.Tickets.CountAsync(t => t.Priority == "URGENT" && t.Status != "RESOLVED" && t.Status != "CLOSED");
        var highCount = await db.Tickets.CountAsync(t => t.Priority == "HIGH" && t.Status != "RESOLVED" && t.Status != "CLOSED");

        var byAssigneeGroup = await db.Tickets
            .GroupBy(t => t.AssignedToUserId)
            .Select(g => new
            {
                UserId = g.Key,
                OpenCount = g.Count(x => x.Status == "OPEN"),
                InProgressCount = g.Count(x => x.Status == "IN_PROGRESS"),
                ResolvedCount = g.Count(x => x.Status == "RESOLVED" || x.Status == "CLOSED")
            })
            .ToListAsync();

        var byAssignee = new List<TicketAssigneeStats>();
        foreach (var g in byAssigneeGroup)
        {
            string userName = "Chưa phân công";
            if (g.UserId.HasValue)
            {
                var u = await userLookup.GetByIdAsync(g.UserId.Value);
                if (u != null) userName = u.FullName;
            }

            byAssignee.Add(new TicketAssigneeStats
            {
                UserId = g.UserId,
                UserName = userName,
                OpenCount = g.OpenCount,
                InProgressCount = g.InProgressCount,
                ResolvedCount = g.ResolvedCount
            });
        }

        return new TicketStatsDto
        {
            OpenCount = openCount,
            InProgressCount = inProgressCount,
            ResolvedCount = resolvedCount,
            ClosedCount = closedCount,
            TotalCount = openCount + inProgressCount + resolvedCount + closedCount,
            UrgentCount = urgentCount,
            HighCount = highCount,
            ByAssignee = byAssignee
        };
    }
}
