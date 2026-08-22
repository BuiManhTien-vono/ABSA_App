// Models/Response/TemplateDtos.cs - DTOs for Response Templates, Automation Rules & Review Responses
using System.ComponentModel.DataAnnotations;

namespace HigenAbsa.Api.Models.Response;

// -----------------------------------------------------------------------
// Response Templates
// -----------------------------------------------------------------------

public class ResponseTemplateDto
{
    public Guid Id { get; set; }
    public Guid? StoreId { get; set; }
    public string? StoreName { get; set; }
    public string Title { get; set; } = "";
    public byte? TargetRating { get; set; }
    public string? TargetSentiment { get; set; }
    public string? TargetAspect { get; set; }
    public string ContentTemplate { get; set; } = "";
    public bool IsActive { get; set; }
    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateTemplateRequest
{
    public Guid? StoreId { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = "";

    public byte? TargetRating { get; set; }

    [MaxLength(30)]
    public string? TargetSentiment { get; set; }

    [MaxLength(50)]
    public string? TargetAspect { get; set; }

    [Required]
    public string ContentTemplate { get; set; } = "";
}

public class UpdateTemplateRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    public byte? TargetRating { get; set; }
    public string? TargetSentiment { get; set; }
    public string? TargetAspect { get; set; }
    public string? ContentTemplate { get; set; }
    public bool? IsActive { get; set; }
}

// -----------------------------------------------------------------------
// Automation Rules
// -----------------------------------------------------------------------

public class AutomationRuleDto
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string StoreName { get; set; } = "";
    public string RuleName { get; set; } = "";
    public byte MinRating { get; set; }
    public byte MaxRating { get; set; }
    public string? ApplySentimentsJson { get; set; }
    public string ActionType { get; set; } = "";
    public int DelayMinutes { get; set; }
    public Guid? SelectedTemplateId { get; set; }
    public string? SelectedTemplateTitle { get; set; }
    public bool UseAiGenerative { get; set; }
    public bool IsEnabled { get; set; }
}

public class CreateRuleRequest
{
    [Required]
    public Guid StoreId { get; set; }

    [Required, MaxLength(200)]
    public string RuleName { get; set; } = "";

    public byte MinRating { get; set; } = 1;
    public byte MaxRating { get; set; } = 5;
    public string? ApplySentimentsJson { get; set; }

    [Required, RegularExpression("^(AUTO_REPLY_IMMEDIATELY|AUTO_REPLY_DELAYED)$")]
    public string ActionType { get; set; } = "AUTO_REPLY_IMMEDIATELY";

    public int DelayMinutes { get; set; } = 0;
    public Guid? SelectedTemplateId { get; set; }
    public bool UseAiGenerative { get; set; } = false;
}

public class UpdateRuleRequest
{
    [MaxLength(200)]
    public string? RuleName { get; set; }

    public byte? MinRating { get; set; }
    public byte? MaxRating { get; set; }
    public string? ApplySentimentsJson { get; set; }
    public string? ActionType { get; set; }
    public int? DelayMinutes { get; set; }
    public Guid? SelectedTemplateId { get; set; }
    public bool? UseAiGenerative { get; set; }
}

// -----------------------------------------------------------------------
// Review Responses
// -----------------------------------------------------------------------

public class SendResponseRequest
{
    [Required]
    public string ResponseText { get; set; } = "";
}
