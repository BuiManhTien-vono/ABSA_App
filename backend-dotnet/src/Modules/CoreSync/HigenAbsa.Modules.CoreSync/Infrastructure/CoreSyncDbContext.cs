using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Domain;

namespace HigenAbsa.Modules.CoreSync.Infrastructure;

public class CoreSyncDbContext : DbContext
{
    public const string SchemaName = "coresync";

    public CoreSyncDbContext(DbContextOptions<CoreSyncDbContext> options) : base(options) { }

    public DbSet<Platform> Platforms => Set<Platform>();
    public DbSet<StoreConnection> StoreConnections => Set<StoreConnection>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(SchemaName);

        modelBuilder.Entity<Platform>(entity =>
        {
            entity.ToTable("Platforms", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
        });

        modelBuilder.Entity<StoreConnection>(entity =>
        {
            entity.ToTable("StoreConnections", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Platform)
                  .WithMany(p => p.Stores)
                  .HasForeignKey(e => e.PlatformId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Products", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Store)
                  .WithMany(s => s.Products)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.ToTable("Customers", SchemaName);
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("Reviews", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.PlatformReviewId).IsUnique();
            entity.HasIndex(e => new { e.StoreId, e.Status, e.Rating });
            entity.HasIndex(e => e.ReviewCreatedAt);

            entity.HasOne(e => e.Store)
                  .WithMany(s => s.Reviews)
                  .HasForeignKey(e => e.StoreId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                  .WithMany()
                  .HasForeignKey(e => e.ProductId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Customer)
                  .WithMany()
                  .HasForeignKey(e => e.CustomerId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Seed Platforms
        modelBuilder.Entity<Platform>().HasData(
            new Platform { Id = 1, Code = "SHOPEE", Name = "Shopee Việt Nam", IsActive = true, CreatedAt = DateTimeOffset.UtcNow },
            new Platform { Id = 2, Code = "LAZADA", Name = "Lazada Việt Nam", IsActive = true, CreatedAt = DateTimeOffset.UtcNow },
            new Platform { Id = 3, Code = "TIKI", Name = "Tiki", IsActive = true, CreatedAt = DateTimeOffset.UtcNow },
            new Platform { Id = 4, Code = "TIKTOK_SHOP", Name = "TikTok Shop Việt Nam", IsActive = true, CreatedAt = DateTimeOffset.UtcNow }
        );
    }
}

