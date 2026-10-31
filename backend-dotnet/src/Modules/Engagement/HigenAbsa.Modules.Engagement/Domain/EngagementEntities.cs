using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HigenAbsa.SharedKernel.Domain;

namespace HigenAbsa.Modules.Engagement.Domain;

[Table("ResponseTemplates", Schema = "engagement")]
public class ResponseTemplate : BaseEntity
{
    public Guid? StoreId { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = "";

    public byte? TargetRating { get; set; }

    [MaxLength(50)]
    public string? TargetSentiment { get; set; }

    [MaxLength(100)]
    public string? TargetAspect { get; set; }

    [Required]
    public string ContentTemplate { get; set; } = "";

    public bool IsActive { get; set; } = true;

    public Guid? CreatedByUserId { get; set; }
}

[Table("AutomationRules", Schema = "engagement")]
public class AutomationRule : BaseEntity
{
    public Guid? StoreId { get; set; }

    [Required, MaxLength(200)]
    public string RuleName { get; set; } = "";

    public byte MinRating { get; set; } = 1;
    public byte MaxRating { get; set; } = 5;

    public string? ApplySentimentsJson { get; set; }

    [Required, MaxLength(50)]
    public string ActionType { get; set; } = "AUTO_REPLY_IMMEDIATELY";

    public int DelayMinutes { get; set; } = 0;

    public Guid? SelectedTemplateId { get; set; }
    public bool UseAiGenerative { get; set; } = false;
    public bool AutoCreateTicket { get; set; } = false;
    public bool IsEnabled { get; set; } = true;
}

[Table("ReviewResponses", Schema = "engagement")]
public class ReviewResponse : BaseEntity
{
    public Guid ReviewId { get; set; }

    [Required]
    public string ResponseText { get; set; } = "";

    [Required, MaxLength(50)]
    public string ResponseType { get; set; } = "AUTOMATIC"; // AUTOMATIC, MANUAL

    public Guid? TemplateId { get; set; }

    public string? AiGeneratedSuggestion { get; set; }

    public Guid? RespondedByUserId { get; set; }

    [MaxLength(100)]
    public string? PlatformResponseId { get; set; }

    [Required, MaxLength(50)]
    public string Status { get; set; } = "SENT"; // QUEUED, SENT, FAILED

    public string? ErrorMessage { get; set; }

    public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;
}

[Table("Tickets", Schema = "engagement")]
public class Ticket : BaseEntity
{
    public Guid ReviewId { get; set; }
    public Guid StoreId { get; set; }
    public Guid? CustomerId { get; set; }

    [MaxLength(150)]
    public string? CustomerName { get; set; }

    [MaxLength(50)]
    public string? CustomerPhone { get; set; }

    [Required, MaxLength(255)]
    public string Title { get; set; } = "";

    public string? Description { get; set; }

    [Required, MaxLength(50)]
    public string Priority { get; set; } = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    [Required, MaxLength(50)]
    public string Status { get; set; } = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    public Guid? AssignedToUserId { get; set; }

    public string? ResolutionNote { get; set; }

    public DateTimeOffset? ResolvedAt { get; set; }
}

