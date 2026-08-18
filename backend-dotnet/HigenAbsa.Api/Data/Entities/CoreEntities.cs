// Data/Entities/CoreEntities.cs - Core & E-commerce Sync Domain Entities
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HigenAbsa.Api.Data.Entities;

[Table("Platforms")]
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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<StoreConnection> Stores { get; set; } = [];
}

[Table("StoreConnections")]
public class StoreConnection
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public int PlatformId { get; set; }
    [ForeignKey(nameof(PlatformId))]
    public Platform? Platform { get; set; }

    [Required, MaxLength(200)]
    public string StoreName { get; set; } = "";

    [Required, MaxLength(100)]
    public string StoreCodeOnPlatform { get; set; } = "";

    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? TokenExpiresAt { get; set; }

    [MaxLength(30)]
    public string Status { get; set; } = "CONNECTED"; // CONNECTED, EXPIRED, DISCONNECTED

    public DateTime? LastSyncedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Product> Products { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}

[Table("Products")]
public class Product
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("Customers")]
public class Customer
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

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

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("Reviews")]
public class Review
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

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

    public DateTime ReviewCreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime SyncedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(30)]
    public string Status { get; set; } = "PENDING"; // PENDING, REPLIED, FAILED, SKIPPED

    public ReviewAIAnalysis? AIAnalysis { get; set; }
    public ICollection<ReviewAspect> Aspects { get; set; } = [];
    public ICollection<ReviewKeyword> Keywords { get; set; } = [];
}
