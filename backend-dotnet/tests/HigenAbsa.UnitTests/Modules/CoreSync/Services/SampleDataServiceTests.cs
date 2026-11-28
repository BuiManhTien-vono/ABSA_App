using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Application.Services;
using HigenAbsa.UnitTests.Modules.CoreSync.Fixtures;

namespace HigenAbsa.UnitTests.Modules.CoreSync.Services;

public class SampleDataServiceTests
{
    [Fact]
    public async Task SeedCatalogAsync_DefaultParameters_Creates10ProductsWith100ReviewsEach()
    {
        using var ctx = new CoreSyncTestContext();
        var service = new SampleDataService(ctx.DbContext);

        var result = await service.SeedCatalogAsync();

        Assert.Equal(10, result.ProductsCreated);
        Assert.Equal(1000, result.ReviewsCreated);
        Assert.Equal(10, result.ProductIds.Count);

        var productsInDb = await ctx.DbContext.Products.CountAsync();
        var reviewsInDb = await ctx.DbContext.Reviews.CountAsync();
        Assert.Equal(10, productsInDb);
        Assert.Equal(1000, reviewsInDb);

        foreach (var productId in result.ProductIds)
        {
            var reviewCount = await ctx.DbContext.Reviews.CountAsync(r => r.ProductId == productId);
            Assert.Equal(100, reviewCount);
        }
    }

    [Theory]
    [InlineData(0, 100)]
    [InlineData(51, 100)]
    [InlineData(10, 0)]
    [InlineData(10, 501)]
    public async Task SeedCatalogAsync_OutOfRangeParameters_ThrowsArgumentOutOfRangeException(
        int productCount,
        int reviewsPerProduct)
    {
        using var ctx = new CoreSyncTestContext();
        var service = new SampleDataService(ctx.DbContext);

        await Assert.ThrowsAsync<ArgumentOutOfRangeException>(() =>
            service.SeedCatalogAsync(productCount, reviewsPerProduct));
    }
}
