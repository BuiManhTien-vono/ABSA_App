using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HigenAbsa.Infrastructure;
using HigenAbsa.Modules.CoreSync.Application.Contracts;
using HigenAbsa.Modules.CoreSync.Domain;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.Modules.Engagement.Application.Handlers;
using HigenAbsa.Modules.Engagement.Infrastructure;
using HigenAbsa.Modules.Security.Application.Contracts;
using HigenAbsa.Modules.Security.Domain;
using HigenAbsa.Modules.Security.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.SharedKernel.Events;

namespace HigenAbsa.UnitTests;

public class ModulesAndEventBusTests
{
    private static ServiceProvider BuildModularServiceProvider(string dbName)
    {
        var services = new ServiceCollection();

        services.AddSharedInfrastructure();

        // Register in-memory DbContexts for isolated modules
        services.AddDbContext<SecurityDbContext>(o => o.UseInMemoryDatabase($"{dbName}_security"));
        services.AddDbContext<CoreSyncDbContext>(o => o.UseInMemoryDatabase($"{dbName}_coresync"));
        services.AddDbContext<EngagementDbContext>(o => o.UseInMemoryDatabase($"{dbName}_engagement"));

        // Register contract services (Cross-module communication)
        services.AddScoped<IUserLookupContract, SecurityUserLookupService>();
        services.AddScoped<IStoreLookupContract, CoreSyncStoreLookupService>();
        services.AddScoped<IReviewLookupContract, CoreSyncReviewLookupService>();

        // Register event handlers
        services.AddScoped<NegativeReviewDetectedEventHandler>();
        services.AddTransient<IIntegrationEventHandler<NegativeReviewDetectedIntegrationEvent>, NegativeReviewDetectedEventHandler>();

        return services.BuildServiceProvider();
    }

    [Fact]
    public async Task EventBus_Should_Deliver_NegativeReviewDetected_To_Engagement_Tickets()
    {
        using var provider = BuildModularServiceProvider(nameof(EventBus_Should_Deliver_NegativeReviewDetected_To_Engagement_Tickets));
        using var scope = provider.CreateScope();

        var eventBus = scope.ServiceProvider.GetRequiredService<IInMemoryEventBus>();
        var engagementDb = scope.ServiceProvider.GetRequiredService<EngagementDbContext>();

        var reviewId = Guid.NewGuid();
        var storeId = Guid.NewGuid();

        // Publish negative review event
        await eventBus.PublishAsync(new NegativeReviewDetectedIntegrationEvent(
            reviewId,
            storeId,
            "Nguyễn Văn An",
            "0912345678",
            "Đánh giá 1 sao - Hàng vỡ",
            "Sản phẩm vỡ nát khi nhận hàng, đóng gói rất tệ.",
            "URGENT"));

        // Verify that the handler caught the event and created a ticket in the engagement schema
        var ticket = await engagementDb.Tickets.FirstOrDefaultAsync(t => t.ReviewId == reviewId);
        Assert.NotNull(ticket);
        Assert.Equal("URGENT", ticket.Priority);
        Assert.Equal("OPEN", ticket.Status);
        Assert.Equal(storeId, ticket.StoreId);
        Assert.Equal("Nguyễn Văn An", ticket.CustomerName);
    }

    [Fact]
    public async Task CrossModuleContracts_Should_Lookup_Entities_Without_Direct_Coupling()
    {
        using var provider = BuildModularServiceProvider(nameof(CrossModuleContracts_Should_Lookup_Entities_Without_Direct_Coupling));
        using var scope = provider.CreateScope();

        var securityDb = scope.ServiceProvider.GetRequiredService<SecurityDbContext>();
        var userLookup = scope.ServiceProvider.GetRequiredService<IUserLookupContract>();

        var userId = Guid.NewGuid();
        securityDb.SystemUsers.Add(new SystemUser
        {
            Id = userId,
            Email = "support@higen.vn",
            PasswordHash = "hash123",
            FullName = "Trần Thị Hỗ Trợ",
            Role = "SUPPORT",
            IsActive = true
        });
        await securityDb.SaveChangesAsync();

        var userDto = await userLookup.GetByIdAsync(userId);
        Assert.NotNull(userDto);
        Assert.Equal("Trần Thị Hỗ Trợ", userDto.FullName);
        Assert.Equal("SUPPORT", userDto.Role);
        Assert.Equal("support@higen.vn", userDto.Email);
    }
}
