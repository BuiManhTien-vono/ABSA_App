// Data/AppDbContext.cs - Entity Framework Core DbContext
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Data.Entities;

namespace HigenAbsa.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // Core Domain
    public DbSet<Platform> Platforms => Set<Platform>();
    public DbSet<StoreConnection> StoreConnections => Set<StoreConnection>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Review> Reviews => Set<Review>();

    // AI Domain
    public DbSet<ReviewAIAnalysis> ReviewAIAnalyses => Set<ReviewAIAnalysis>();
    public DbSet<ReviewAspect> ReviewAspects => Set<ReviewAspect>();
    public DbSet<ReviewKeyword> ReviewKeywords => Set<ReviewKeyword>();

    // Response & Ticket Domain
    public DbSet<ResponseTemplate> ResponseTemplates => Set<ResponseTemplate>();
    public DbSet<AutomationRule> AutomationRules => Set<AutomationRule>();
    public DbSet<ReviewResponse> ReviewResponses => Set<ReviewResponse>();
    public DbSet<Ticket> Tickets => Set<Ticket>();

    // Security & Audit Domain
    public DbSet<SystemUser> SystemUsers => Set<SystemUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Indexes ---
        modelBuilder.Entity<Platform>()
            .HasIndex(p => p.Code).IsUnique();

        modelBuilder.Entity<Review>()
            .HasIndex(r => r.PlatformReviewId).IsUnique();

        modelBuilder.Entity<Review>()
            .HasIndex(r => new { r.StoreId, r.Status, r.Rating });

        modelBuilder.Entity<Review>()
            .HasIndex(r => r.ReviewCreatedAt);

        modelBuilder.Entity<ReviewAIAnalysis>()
            .HasIndex(a => a.ReviewId).IsUnique();

        modelBuilder.Entity<ReviewAIAnalysis>()
            .HasIndex(a => a.OverallSentiment);

        modelBuilder.Entity<Ticket>()
            .HasIndex(t => new { t.AssignedToUserId, t.Status });

        modelBuilder.Entity<SystemUser>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(r => r.Token).IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(r => new { r.UserId, r.IsRevoked });

        // --- Seed Data ---
        modelBuilder.Entity<Platform>().HasData(
            new Platform { Id = 1, Code = "SHOPEE", Name = "Shopee Việt Nam", IsActive = true },
            new Platform { Id = 2, Code = "LAZADA", Name = "Lazada Việt Nam", IsActive = true },
            new Platform { Id = 3, Code = "TIKI", Name = "Tiki", IsActive = true },
            new Platform { Id = 4, Code = "TIKTOK_SHOP", Name = "TikTok Shop Việt Nam", IsActive = true }
        );

        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        // Hash for "Admin@123"
        string adminPasswordHash = "$2a$11$0J/2cWbBqFwS8n0xZ6.37eU8Wj1vTzX1Y9W8V7U6T5S4R3Q2P1O0N";

        modelBuilder.Entity<SystemUser>().HasData(
            new SystemUser
            {
                Id = adminId,
                Email = "admin@higen-absa.com",
                PasswordHash = adminPasswordHash,
                FullName = "System Administrator",
                Role = "ADMIN",
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
