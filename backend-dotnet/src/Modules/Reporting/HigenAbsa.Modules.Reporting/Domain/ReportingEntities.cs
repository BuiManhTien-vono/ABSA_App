using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HigenAbsa.SharedKernel.Domain;

namespace HigenAbsa.Modules.Reporting.Domain;

[Table("AuditLogs", Schema = "reporting")]
public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }

    [Required, MaxLength(100)]
    public string Action { get; set; } = "";

    [Required, MaxLength(100)]
    public string EntityName { get; set; } = "";

    [MaxLength(100)]
    public string? EntityId { get; set; }

    public string? Details { get; set; }
    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }

    [MaxLength(50)]
    public string? IpAddress { get; set; }
}

[Table("DailyPlatformSummaries", Schema = "reporting")]
public class DailyPlatformSummary : BaseEntity
{
    public DateOnly SummaryDate { get; set; }

    [Required, MaxLength(50)]
    public string PlatformCode { get; set; } = "";

    public int TotalReviews { get; set; }
    public int PositiveCount { get; set; }
    public int NegativeCount { get; set; }
    public int NeutralCount { get; set; }
}

