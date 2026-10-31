using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Modules.Engagement.Application.DTOs;

public class TicketListDto
{
    public Guid Id { get; set; }
    public Guid ReviewId { get; set; }
    public string? ReviewComment { get; set; }
    public byte ReviewRating { get; set; }
    public string? CustomerName { get; set; }
    public string? AssignedToName { get; set; }
    public string Priority { get; set; } = "MEDIUM";
    public string Status { get; set; } = "OPEN";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ResolvedAt { get; set; }
}

public class TicketDetailDto : TicketListDto
{
    public Guid? CustomerId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public string? ResolutionNotes { get; set; }
    public string? OverallSentiment { get; set; }
    public string? CustomerInsight { get; set; }
    public string? SuggestedSellerResponse { get; set; }
    public string? ProductName { get; set; }
    public string? StoreName { get; set; }
}

public class AssignTicketRequest
{
    [Required]
    public Guid UserId { get; set; }
}

public class UpdateTicketStatusRequest
{
    [Required, RegularExpression("^(OPEN|IN_PROGRESS|RESOLVED|CLOSED)$",
        ErrorMessage = "Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED")]
    public string Status { get; set; } = "";
}

public class ResolveTicketRequest
{
    [Required]
    public string ResolutionNotes { get; set; } = "";
}

public class TicketStatsDto
{
    public int OpenCount { get; set; }
    public int InProgressCount { get; set; }
    public int ResolvedCount { get; set; }
    public int ClosedCount { get; set; }
    public int TotalCount { get; set; }
    public int UrgentCount { get; set; }
    public int HighCount { get; set; }
    public List<TicketAssigneeStats> ByAssignee { get; set; } = [];
}

public class TicketAssigneeStats
{
    public Guid? UserId { get; set; }
    public string UserName { get; set; } = "";
    public int OpenCount { get; set; }
    public int InProgressCount { get; set; }
    public int ResolvedCount { get; set; }
}

