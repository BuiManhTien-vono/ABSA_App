using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using HigenAbsa.SharedKernel.Domain;

namespace HigenAbsa.Modules.CoreSync.Domain;

[Table("Platforms", Schema = "coresync")]
public class Platform
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Code { get; set; } = ""; // TIKI, SHOPEE, LAZADA, TIKTOK_SHOP

    [Required, MaxLength(100)]
    public string Name { get; set; } = "";

    [MaxLength(255)]
    public string? ApiBaseUrl { get; set; }

    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<StoreConnection> Stores { get; set; } = [];
}

[Table("StoreConnections", Schema = "coresync")]
public class StoreConnection : BaseEntity
{
    public int PlatformId { get; set; }
    [ForeignKey(nameof(PlatformId))]
    public Platform? Platform { get; set; }

    [Required, MaxLength(200)]
    public string StoreName { get; set; } = "";

    [Required, MaxLength(100)]
    public string StoreCodeOnPlatform { get; set; } = "";

    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTimeOffset? TokenExpiresAt { get; set; }

    [MaxLength(30)]
    public string Status { get; set; } = "CONNECTED"; // CONNECTED, EXPIRED, DISCONNECTED

    public DateTimeOffset? LastSyncedAt { get; set; }

    public ICollection<Product> Products { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}

[Table("Products", Schema = "coresync")]
public class Product : BaseEntity
{
    public Guid StoreId { get; set; }
    [ForeignKey(nameof(StoreId))]
    public StoreConnection? Store { get; set; }

    [Required, MaxLength(100)]
    public string PlatformProductId { get; set; } = "";

    [MaxLength(100)]
    public string? Sku { get; set; }

    [Required, MaxLength(500)]
    public string Name { get; set; } = "";

    public string? ImageUrl { get; set; }
    public string? ProductUrl { get; set; }

    [MaxLength(200)]
    public string? CategoryName { get; set; }
}

[Table("Customers", Schema = "coresync")]
public class Customer : BaseEntity
{
    public Guid StoreId { get; set; }
    [ForeignKey(nameof(StoreId))]
    public StoreConnection? Store { get; set; }

    [Required, MaxLength(100)]
    public string PlatformUserId { get; set; } = "";

    [MaxLength(200)]
    public string? DisplayName { get; set; }

    public string? AvatarUrl { get; set; }
    public int TotalReviewsCount { get; set; } = 1;

    [MaxLength(30)]
    public string RiskLevel { get; set; } = "NORMAL"; // NORMAL, POTENTIAL_BOMMER, VIP
}

[Table("Reviews", Schema = "coresync")]
public class Review : BaseEntity
{
    public Guid? StoreId { get; set; }
    [ForeignKey(nameof(StoreId))]
    public StoreConnection? Store { get; set; }

    public Guid? ProductId { get; set; }
    [ForeignKey(nameof(ProductId))]
    public Product? Product { get; set; }

    public Guid? CustomerId { get; set; }
    [ForeignKey(nameof(CustomerId))]
    public Customer? Customer { get; set; }

    [Required, MaxLength(100)]
    public string PlatformReviewId { get; set; } = "";

    [MaxLength(100)]
    public string? OrderIdOnPlatform { get; set; }

    public byte Rating { get; set; } = 5; // 1 -> 5

    public string? CommentText { get; set; }
    public string? MediaUrlsJson { get; set; }

    public DateTimeOffset ReviewCreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset SyncedAt { get; set; } = DateTimeOffset.UtcNow;

    [MaxLength(30)]
    public string Status { get; set; } = "PENDING"; // PENDING, REPLIED, FAILED, SKIPPED
}

