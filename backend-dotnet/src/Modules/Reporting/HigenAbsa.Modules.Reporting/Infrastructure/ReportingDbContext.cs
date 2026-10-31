using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Reporting.Domain;

namespace HigenAbsa.Modules.Reporting.Infrastructure;

public class ReportingDbContext(DbContextOptions<ReportingDbContext> options) : DbContext(options)
{
    public const string SchemaName = "reporting";

    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<DailyPlatformSummary> DailyPlatformSummaries => Set<DailyPlatformSummary>();

    // Read-only query projections for high-performance dashboard analytics
    public DbSet<ReadReview> ReadReviews => Set<ReadReview>();
    public DbSet<ReadProduct> ReadProducts => Set<ReadProduct>();
    public DbSet<ReadStoreConnection> ReadStores => Set<ReadStoreConnection>();
    public DbSet<ReadPlatform> ReadPlatforms => Set<ReadPlatform>();
    public DbSet<ReadCustomer> ReadCustomers => Set<ReadCustomer>();
    public DbSet<ReadReviewAIAnalysis> ReadAnalyses => Set<ReadReviewAIAnalysis>();
    public DbSet<ReadReviewAspect> ReadAspects => Set<ReadReviewAspect>();
    public DbSet<ReadTicket> ReadTickets => Set<ReadTicket>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(SchemaName);

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.ToTable("AuditLogs", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.CreatedAt);
        });

        modelBuilder.Entity<DailyPlatformSummary>(entity =>
        {
            entity.ToTable("DailyPlatformSummaries", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.SummaryDate, e.PlatformCode }).IsUnique();
        });

        // Configure read projections
        modelBuilder.Entity<ReadReview>(entity =>
        {
            entity.ToTable("Reviews", "coresync", t => t.ExcludeFromMigrations());
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReadProduct>(entity =>
        {
            entity.ToTable("Products", "coresync", t => t.ExcludeFromMigrations());
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReadStoreConnection>(entity =>
        {
            entity.ToTable("StoreConnections", "coresync", t => t.ExcludeFromMigrations());
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReadPlatform>(entity =>
        {
            entity.ToTable("Platforms", "coresync", t => t.ExcludeFromMigrations());
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReadCustomer>(entity =>
        {
            entity.ToTable("Customers", "coresync", t => t.ExcludeFromMigrations());
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReadReviewAIAnalysis>(entity =>
        {
            entity.ToTable("ReviewAIAnalysis", "inference", t => t.ExcludeFromMigrations());
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReadReviewAspect>(entity =>
        {
            entity.ToTable("ReviewAspects", "inference", t => t.ExcludeFromMigrations());
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ReadTicket>(entity =>
        {
            entity.ToTable("Tickets", "engagement", t => t.ExcludeFromMigrations());
            entity.HasKey(e => e.Id);
        });
    }
}

public class ReadReview
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public Guid? ProductId { get; set; }
    public Guid? CustomerId { get; set; }
    public byte Rating { get; set; }
    public string CommentText { get; set; } = "";
    public DateTimeOffset ReviewCreatedAt { get; set; }
    public string Status { get; set; } = "PENDING";
}

public class ReadProduct
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string Name { get; set; } = "";
    public string? Sku { get; set; }
}

public class ReadStoreConnection
{
    public Guid Id { get; set; }
    public string StoreName { get; set; } = "";
    public int PlatformId { get; set; }
    public string Status { get; set; } = "";
}

public class ReadPlatform
{
    public int Id { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
}

public class ReadCustomer
{
    public Guid Id { get; set; }
    [System.ComponentModel.DataAnnotations.Schema.Column("DisplayName")]
    public string? Name { get; set; }
}

public class ReadReviewAIAnalysis
{
    public Guid Id { get; set; }
    public Guid ReviewId { get; set; }
    public string OverallSentiment { get; set; } = "POS";
    public float SentimentScore { get; set; }
    public DateTimeOffset ProcessedAt { get; set; }
}

public class ReadReviewAspect
{
    public long Id { get; set; }
    public Guid ReviewId { get; set; }
    public string MacroCategory { get; set; } = "";
    public string MicroAspect { get; set; } = "";
    public string Sentiment { get; set; } = "POS";
}

public class ReadTicket
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public Guid ReviewId { get; set; }
    public string Status { get; set; } = "OPEN";
    public string Priority { get; set; } = "MEDIUM";
}

