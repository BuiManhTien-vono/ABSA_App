// Data/Entities/SecurityEntities.cs - User, RBAC & Audit Entities
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HigenAbsa.Api.Data.Entities;

[Table("SystemUsers")]
public class SystemUser
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(256)]
    public string Email { get; set; } = "";

    [Required]
    public string PasswordHash { get; set; } = "";

    [Required, MaxLength(200)]
    public string FullName { get; set; } = "";

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required, MaxLength(50)]
    public string Role { get; set; } = "STORE_MANAGER"; // ADMIN, STORE_MANAGER, CSKH_STAFF

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("AuditLogs")]
public class AuditLog
{
    [Key]
    public long Id { get; set; }

    public Guid? UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public SystemUser? User { get; set; }

    [Required, MaxLength(100)]
    public string Action { get; set; } = ""; // REPLY_REVIEW, UPDATE_RULE, RESOLVE_TICKET

    [Required, MaxLength(50)]
    public string EntityName { get; set; } = "";

    [Required, MaxLength(100)]
    public string EntityId { get; set; } = "";

    public string? OldValuesJson { get; set; }
    public string? NewValuesJson { get; set; }

    [MaxLength(45)]
    public string? IpAddress { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
