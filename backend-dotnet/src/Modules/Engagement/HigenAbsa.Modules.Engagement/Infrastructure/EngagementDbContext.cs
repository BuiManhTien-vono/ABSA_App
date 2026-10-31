using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Engagement.Domain;

namespace HigenAbsa.Modules.Engagement.Infrastructure;

public class EngagementDbContext(DbContextOptions<EngagementDbContext> options) : DbContext(options)
{
    public const string SchemaName = "engagement";

    public DbSet<ResponseTemplate> ResponseTemplates => Set<ResponseTemplate>();
    public DbSet<AutomationRule> AutomationRules => Set<AutomationRule>();
    public DbSet<ReviewResponse> ReviewResponses => Set<ReviewResponse>();
    public DbSet<Ticket> Tickets => Set<Ticket>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema(SchemaName);

        modelBuilder.Entity<ResponseTemplate>(entity =>
        {
            entity.ToTable("ResponseTemplates", SchemaName);
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.ContentTemplate).IsRequired();
        });

        modelBuilder.Entity<AutomationRule>(entity =>
        {
            entity.ToTable("AutomationRules", SchemaName);
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RuleName).HasMaxLength(200).IsRequired();
        });

        modelBuilder.Entity<ReviewResponse>(entity =>
        {
            entity.ToTable("ReviewResponses", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReviewId);
            entity.Property(e => e.ResponseText).IsRequired();
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.ToTable("Tickets", SchemaName);
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.AssignedToUserId, e.Status });
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
        });
    }
}

