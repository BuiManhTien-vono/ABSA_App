using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HigenAbsa.SharedKernel.Domain;

namespace HigenAbsa.Modules.Security.Domain;

[Table("SystemUsers", Schema = "security")]
public class SystemUser : BaseEntity
{
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
}

[Table("RefreshTokens", Schema = "security")]
public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    [ForeignKey(nameof(UserId))]
    public SystemUser? User { get; set; }

    [Required, MaxLength(500)]
    public string Token { get; set; } = "";

    public DateTimeOffset ExpiresAt { get; set; }

    [MaxLength(45)]
    public string? CreatedByIp { get; set; }

    public bool IsRevoked { get; set; } = false;
    public DateTimeOffset? RevokedAt { get; set; }

    [MaxLength(45)]
    public string? RevokedByIp { get; set; }

    [MaxLength(500)]
    public string? ReplacedByToken { get; set; }

    [NotMapped]
    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;

    [NotMapped]
    public bool IsActive => !IsRevoked && !IsExpired;
}

