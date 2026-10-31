using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Inference.Domain;

namespace HigenAbsa.Modules.Inference.Infrastructure;

public class InferenceDbContext : DbContext
{
    public const string SchemaName = "inference";

    public InferenceDbContext(DbContextOptions<InferenceDbContext> options) : base(options) { }

    public DbSet<ReviewAIAnalysis> ReviewAIAnalyses => Set<ReviewAIAnalysis>();
    public DbSet<ReviewAspect> ReviewAspects => Set<ReviewAspect>();
    public DbSet<ReviewKeyword> ReviewKeywords => Set<ReviewKeyword>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(SchemaName);

        modelBuilder.Entity<ReviewAIAnalysis>(entity =>
        {
            entity.ToTable("ReviewAIAnalysis", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReviewId).IsUnique();
            entity.HasIndex(e => e.OverallSentiment);
        });

        modelBuilder.Entity<ReviewAspect>(entity =>
        {
            entity.ToTable("ReviewAspects", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReviewId);
            entity.HasIndex(e => e.MacroCategory);
        });

        modelBuilder.Entity<ReviewKeyword>(entity =>
        {
            entity.ToTable("ReviewKeywords", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReviewId);
        });
    }
}

