using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Engagement.Application.Handlers;
using HigenAbsa.Modules.Engagement.Application.Services;
using HigenAbsa.Modules.Engagement.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.UnitTests.Modules.CoreSync.Fixtures;

namespace HigenAbsa.UnitTests.Modules.Engagement.Fixtures;

/// <summary>
/// Môi trường kiểm thử cô lập trên RAM (Test Fixture) cho Module 4: Engagement (Ticket CSKH & Tự động Phản hồi).
/// </summary>
public sealed class EngagementTestContext : IDisposable
{
    public EngagementDbContext DbContext { get; }
    public FakeUserLookup UserLookup { get; }
    public FakeStoreLookup StoreLookup { get; }
    public FakeReviewLookup ReviewLookup { get; }
    public FakeInferenceLookup InferenceLookup { get; }

    public TicketService TicketService { get; }
    public ResponseService ResponseService { get; }
    public NegativeReviewDetectedEventHandler NegativeReviewHandler { get; }
    public ReviewCreatedEventHandler ReviewCreatedHandler { get; }

    public EngagementTestContext()
    {
        var options = new DbContextOptionsBuilder<EngagementDbContext>()
            .UseInMemoryDatabase($"HigenEngagementTestDb_{Guid.NewGuid()}")
            .Options;

        DbContext = new EngagementDbContext(options);
        UserLookup = new FakeUserLookup();
        StoreLookup = new FakeStoreLookup();
        ReviewLookup = new FakeReviewLookup();
        InferenceLookup = new FakeInferenceLookup();

        TicketService = new TicketService(
            DbContext,
            UserLookup,
            StoreLookup,
            ReviewLookup,
            InferenceLookup);

        ResponseService = new ResponseService(
            DbContext,
            StoreLookup,
            UserLookup);

        NegativeReviewHandler = new NegativeReviewDetectedEventHandler(DbContext);
        ReviewCreatedHandler = new ReviewCreatedEventHandler(DbContext);
    }

    public void Dispose()
    {
        DbContext.Dispose();
    }
}

public sealed class FakeUserLookup : IUserLookupContract
{
    public Dictionary<Guid, UserContractDto> Users { get; } = [];

    public Task<UserContractDto?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        Users.TryGetValue(userId, out var user);
        return Task.FromResult(user);
    }

    public Task<UserContractDto?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = Users.Values.FirstOrDefault(u => u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(user);
    }
}

public sealed class FakeStoreLookup : IStoreLookupContract
{
    public Dictionary<Guid, StoreContractDto> Stores { get; } = [];

    public Task<StoreContractDto?> GetByIdAsync(Guid storeId, CancellationToken cancellationToken = default)
    {
        Stores.TryGetValue(storeId, out var store);
        return Task.FromResult(store);
    }

    public Task<List<StoreContractDto>> GetAllActiveStoresAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Stores.Values.Where(s => s.Status == "CONNECTED").ToList());
    }
}

public sealed class FakeReviewLookup : IReviewLookupContract
{
    public Dictionary<Guid, ReviewContractDto> Reviews { get; } = [];

    public Task<ReviewContractDto?> GetByIdAsync(Guid reviewId, CancellationToken cancellationToken = default)
    {
        Reviews.TryGetValue(reviewId, out var review);
        return Task.FromResult(review);
    }

    public Task<int> GetCountByDateRangeAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Reviews.Count);
    }
}
