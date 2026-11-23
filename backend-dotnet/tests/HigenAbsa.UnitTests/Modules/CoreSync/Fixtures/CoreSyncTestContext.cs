using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Application.Services;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;
using HigenAbsa.UnitTests.Modules.Inference.Fixtures;

namespace HigenAbsa.UnitTests.Modules.CoreSync.Fixtures;

/// <summary>
/// Môi trường kiểm thử cô lập trên RAM (Test Fixture) cho Module 3: CoreSync.
/// Tự động khởi tạo 4 sàn TMĐT (SHOPEE, LAZADA, TIKI, TIKTOK_SHOP) trên InMemoryDbContext.
/// </summary>
public sealed class CoreSyncTestContext : IDisposable
{
    public CoreSyncDbContext DbContext { get; }
    public SpyEventBus EventBus { get; }
    public FakeInferenceLookup FakeInferenceLookup { get; }
    public StoreService StoreService { get; }
    public ProductService ProductService { get; }
    public CustomerService CustomerService { get; }
    public ReviewService ReviewService { get; }

    public CoreSyncTestContext()
    {
        var options = new DbContextOptionsBuilder<CoreSyncDbContext>()
            .UseInMemoryDatabase($"HigenCoreSyncTestDb_{Guid.NewGuid()}")
            .Options;

        DbContext = new CoreSyncDbContext(options);
        DbContext.Database.EnsureCreated();

        EventBus = new SpyEventBus();
        FakeInferenceLookup = new FakeInferenceLookup();

        StoreService = new StoreService(DbContext, EventBus, FakeInferenceLookup);
        ProductService = new ProductService(DbContext, FakeInferenceLookup);
        CustomerService = new CustomerService(DbContext);
        ReviewService = new ReviewService(DbContext, FakeInferenceLookup);
    }

    public void Dispose()
    {
        DbContext.Dispose();
    }
}

/// <summary>
/// Bộ giả lập hợp đồng tra cứu kết quả AI giữa CoreSync và Inference trên RAM.
/// </summary>
public sealed class FakeInferenceLookup : IInferenceLookupContract
{
    public Dictionary<Guid, InferenceSummaryContractDto> Analyses { get; } = [];

    public Task<InferenceSummaryContractDto?> GetAnalysisByReviewIdAsync(
        Guid reviewId,
        CancellationToken cancellationToken = default)
    {
        Analyses.TryGetValue(reviewId, out var dto);
        return Task.FromResult(dto);
    }
}
