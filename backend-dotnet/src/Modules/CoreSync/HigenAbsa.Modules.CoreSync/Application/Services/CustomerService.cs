using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.CoreSync.Application.DTOs;
using HigenAbsa.Modules.CoreSync.Infrastructure;
using HigenAbsa.SharedKernel.Common;

namespace HigenAbsa.Modules.CoreSync.Application.Services;

public interface ICustomerService
{
    Task<PagedResult<CustomerDto>> GetCustomersAsync(int page, int pageSize, string? riskLevel, string? search);
    Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid id);
    Task<CustomerDto?> UpdateRiskLevelAsync(Guid id, string riskLevel);
}

public class CustomerService(CoreSyncDbContext db) : ICustomerService
{
    public async Task<PagedResult<CustomerDto>> GetCustomersAsync(
        int page, int pageSize, string? riskLevel, string? search)
    {
        var query = db.Customers
            .Include(c => c.Store)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(riskLevel))
            query = query.Where(c => c.RiskLevel == riskLevel.ToUpper());

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(c =>
                (c.DisplayName != null && c.DisplayName.ToLower().Contains(term)) ||
                c.PlatformUserId.ToLower().Contains(term));
        }

        int totalCount = await query.CountAsync();
        var customers = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                StoreId = c.StoreId,
                StoreName = c.Store != null ? c.Store.StoreName : "",
                PlatformUserId = c.PlatformUserId,
                DisplayName = c.DisplayName,
                AvatarUrl = c.AvatarUrl,
                TotalReviewsCount = db.Reviews.Count(r => r.CustomerId == c.Id),
                RiskLevel = c.RiskLevel,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return new PagedResult<CustomerDto>(customers, totalCount, page, pageSize);
    }

    public async Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid id)
    {
        var customer = await db.Customers
            .Include(c => c.Store)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return null;

        var reviews = await db.Reviews.Where(r => r.CustomerId == id).ToListAsync();
        double avgRating = reviews.Count > 0 ? reviews.Average(r => (double)r.Rating) : 0;

        return new CustomerDetailDto
        {
            Id = customer.Id,
            StoreId = customer.StoreId,
            StoreName = customer.Store != null ? customer.Store.StoreName : "",
            PlatformUserId = customer.PlatformUserId,
            DisplayName = customer.DisplayName,
            AvatarUrl = customer.AvatarUrl,
            TotalReviewsCount = reviews.Count,
            RiskLevel = customer.RiskLevel,
            CreatedAt = customer.CreatedAt,
            AverageRating = Math.Round(avgRating, 1),
            PosCount = reviews.Count(r => r.Rating >= 4),
            NeuCount = reviews.Count(r => r.Rating == 3),
            NegCount = reviews.Count(r => r.Rating <= 2)
        };
    }

    public async Task<CustomerDto?> UpdateRiskLevelAsync(Guid id, string riskLevel)
    {
        var customer = await db.Customers.Include(c => c.Store).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null) return null;

        customer.RiskLevel = riskLevel.ToUpper();
        customer.MarkUpdated();
        await db.SaveChangesAsync();

        return new CustomerDto
        {
            Id = customer.Id,
            StoreId = customer.StoreId,
            StoreName = customer.Store?.StoreName ?? "",
            PlatformUserId = customer.PlatformUserId,
            DisplayName = customer.DisplayName,
            AvatarUrl = customer.AvatarUrl,
            TotalReviewsCount = await db.Reviews.CountAsync(r => r.CustomerId == customer.Id),
            RiskLevel = customer.RiskLevel,
            CreatedAt = customer.CreatedAt
        };
    }
}

