// Data/Entities/ResponseEntities.cs - Response Management, Automation & Ticket Entities
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HigenAbsa.Api.Data.Entities;

[Table("ResponseTemplates")]
public class ResponseTemplate
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? StoreId { get; set; }
    [ForeignKey(nameof(StoreId))]
    public StoreConnection? Store { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = "";

    public byte? TargetRating { get; set; }

    [MaxLength(30)]
    public string? TargetSentiment { get; set; }

    [MaxLength(50)]
    public string? TargetAspect { get; set; }

    [Required]
    public string ContentTemplate { get; set; } = "";

    public bool IsActive { get; set; } = true;

    public Guid? CreatedByUserId { get; set; }
    [ForeignKey(nameof(CreatedByUserId))]
    public SystemUser? CreatedByUser { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("AutomationRules")]
public class AutomationRule
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid StoreId { get; set; }
    [ForeignKey(nameof(StoreId))]
    public StoreConnection? Store { get; set; }

    [Required, MaxLength(200)]
    public string RuleName { get; set; } = "";

    public byte MinRating { get; set; } = 1;
    public byte MaxRating { get; set; } = 5;

    public string? ApplySentimentsJson { get; set; }

    [Required, MaxLength(30)]
    public string ActionType { get; set; } = "AUTO_REPLY_IMMEDIATELY";

    public int DelayMinutes { get; set; } = 0;

    public Guid? SelectedTemplateId { get; set; }
    [ForeignKey(nameof(SelectedTemplateId))]
    public ResponseTemplate? SelectedTemplate { get; set; }

    public bool UseAiGenerative { get; set; } = false;
    public bool IsEnabled { get; set; } = true;
}

[Table("ReviewResponses")]
public class ReviewResponse
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ReviewId { get; set; }
    [ForeignKey(nameof(ReviewId))]
    public Review? Review { get; set; }

    [Required]
    public string ResponseText { get; set; } = "";

    [Required, MaxLength(30)]
    public string ResponseType { get; set; } = "AUTOMATIC"; // AUTOMATIC, MANUAL

    public Guid? TemplateId { get; set; }
    [ForeignKey(nameof(TemplateId))]
    public ResponseTemplate? Template { get; set; }

    public string? AiGeneratedSuggestion { get; set; }

    public Guid? RespondedByUserId { get; set; }
    [ForeignKey(nameof(RespondedByUserId))]
    public SystemUser? RespondedByUser { get; set; }

    [MaxLength(100)]
    public string? PlatformResponseId { get; set; }

    [MaxLength(30)]
    public string Status { get; set; } = "QUEUED"; // QUEUED, SUCCESS, FAILED

    public string? ErrorMessage { get; set; }
    public DateTime RespondedAt { get; set; } = DateTime.UtcNow;
}

[Table("Tickets")]
public class Ticket
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ReviewId { get; set; }
    [ForeignKey(nameof(ReviewId))]
    public Review? Review { get; set; }

    public Guid CustomerId { get; set; }
    [ForeignKey(nameof(CustomerId))]
    public Customer? Customer { get; set; }

    public Guid? AssignedToUserId { get; set; }
    [ForeignKey(nameof(AssignedToUserId))]
    public SystemUser? AssignedToUser { get; set; }

    [MaxLength(20)]
    public string Priority { get; set; } = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    [MaxLength(30)]
    public string Status { get; set; } = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}
