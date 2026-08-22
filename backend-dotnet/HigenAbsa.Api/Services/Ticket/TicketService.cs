// Services/Ticket/TicketService.cs - CSKH Ticket Management Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Core;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models;
using HigenAbsa.Api.Models.Ticket;

namespace HigenAbsa.Api.Services.Ticket;

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

public class TicketService : ITicketService
{
    private readonly AppDbContext _db;

    public TicketService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<TicketListDto>> GetTicketsAsync(
        int page, int pageSize, string? status, string? priority, Guid? assignedToUserId)
    {
        var query = _db.Tickets
            .Include(t => t.Review)
            .Include(t => t.Customer)
            .Include(t => t.AssignedToUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(t => t.Status == status.ToUpper());

        if (!string.IsNullOrWhiteSpace(priority))
            query = query.Where(t => t.Priority == priority.ToUpper());

        if (assignedToUserId.HasValue)
            query = query.Where(t => t.AssignedToUserId == assignedToUserId.Value);

        var pagedQuery = query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TicketListDto
            {
                Id = t.Id,
                ReviewId = t.ReviewId,
                ReviewComment = t.Review != null ? t.Review.CommentText : null,
                ReviewRating = t.Review != null ? t.Review.Rating : (byte)0,
                CustomerName = t.Customer != null ? t.Customer.DisplayName : null,
                AssignedToName = t.AssignedToUser != null ? t.AssignedToUser.FullName : null,
                Priority = t.Priority,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                ResolvedAt = t.ResolvedAt
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<TicketDetailDto?> GetTicketByIdAsync(Guid id)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Review).ThenInclude(r => r!.AIAnalysis)
            .Include(t => t.Review).ThenInclude(r => r!.Product)
            .Include(t => t.Review).ThenInclude(r => r!.Store)
            .Include(t => t.Customer)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null) return null;

        return new TicketDetailDto
        {
            Id = ticket.Id,
            ReviewId = ticket.ReviewId,
            ReviewComment = ticket.Review?.CommentText,
            ReviewRating = ticket.Review?.Rating ?? 0,
            CustomerName = ticket.Customer?.DisplayName,
            AssignedToName = ticket.AssignedToUser?.FullName,
            Priority = ticket.Priority,
            Status = ticket.Status,
            CreatedAt = ticket.CreatedAt,
            ResolvedAt = ticket.ResolvedAt,
            CustomerId = ticket.CustomerId,
            AssignedToUserId = ticket.AssignedToUserId,
            ResolutionNotes = ticket.ResolutionNotes,
            OverallSentiment = ticket.Review?.AIAnalysis?.OverallSentiment,
            CustomerInsight = ticket.Review?.AIAnalysis?.CustomerInsight,
            SuggestedSellerResponse = ticket.Review?.AIAnalysis?.SuggestedSellerResponse,
            ProductName = ticket.Review?.Product?.Name,
            StoreName = ticket.Review?.Store?.StoreName
        };
    }

    public async Task<TicketDetailDto?> AssignTicketAsync(Guid id, Guid userId)
    {
        var ticket = await _db.Tickets.FindAsync(id);
        if (ticket == null) return null;

        var user = await _db.SystemUsers.FindAsync(userId)
            ?? throw new InvalidOperationException("Assigned user not found.");

        ticket.AssignedToUserId = userId;
        if (ticket.Status == "OPEN")
            ticket.Status = "IN_PROGRESS";

        await _db.SaveChangesAsync();
        return await GetTicketByIdAsync(id);
    }

    public async Task<TicketDetailDto?> UpdateTicketStatusAsync(Guid id, string status)
    {
        var ticket = await _db.Tickets.FindAsync(id);
        if (ticket == null) return null;

        ticket.Status = status.ToUpper();
        if (ticket.Status == "RESOLVED" || ticket.Status == "CLOSED")
            ticket.ResolvedAt ??= DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetTicketByIdAsync(id);
    }

    public async Task<TicketDetailDto?> ResolveTicketAsync(Guid id, string resolutionNotes)
    {
        var ticket = await _db.Tickets.FindAsync(id);
        if (ticket == null) return null;

        ticket.Status = "RESOLVED";
        ticket.ResolutionNotes = resolutionNotes.Trim();
        ticket.ResolvedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetTicketByIdAsync(id);
    }

    public async Task<TicketStatsDto> GetTicketStatsAsync()
    {
        var stats = await _db.Tickets
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var openCount = stats.FirstOrDefault(s => s.Status == "OPEN")?.Count ?? 0;
        var inProgressCount = stats.FirstOrDefault(s => s.Status == "IN_PROGRESS")?.Count ?? 0;
        var resolvedCount = stats.FirstOrDefault(s => s.Status == "RESOLVED")?.Count ?? 0;
        var closedCount = stats.FirstOrDefault(s => s.Status == "CLOSED")?.Count ?? 0;

        var urgentCount = await _db.Tickets.CountAsync(t => t.Priority == "URGENT" && t.Status != "RESOLVED" && t.Status != "CLOSED");
        var highCount = await _db.Tickets.CountAsync(t => t.Priority == "HIGH" && t.Status != "RESOLVED" && t.Status != "CLOSED");

        var byAssignee = await _db.Tickets
            .Include(t => t.AssignedToUser)
            .GroupBy(t => new { t.AssignedToUserId, UserName = t.AssignedToUser != null ? t.AssignedToUser.FullName : "Chưa phân công" })
            .Select(g => new TicketAssigneeStats
            {
                UserId = g.Key.AssignedToUserId,
                UserName = g.Key.UserName,
                OpenCount = g.Count(x => x.Status == "OPEN"),
                InProgressCount = g.Count(x => x.Status == "IN_PROGRESS"),
                ResolvedCount = g.Count(x => x.Status == "RESOLVED" || x.Status == "CLOSED")
            })
            .ToListAsync();

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
