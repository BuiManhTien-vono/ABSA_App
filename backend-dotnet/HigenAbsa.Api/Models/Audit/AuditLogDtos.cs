// Models/Audit/AuditLogDtos.cs - DTOs for Audit Logging
namespace HigenAbsa.Api.Models.Audit;

public class AuditLogDto
{
    public long Id { get; set; }
    public Guid? UserId { get; set; }
    public string? UserName { get; set; }
    public string Action { get; set; } = "";
    public string EntityName { get; set; } = "";
    public string EntityId { get; set; } = "";
    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }
    public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
}
