// Services/Customer/CustomerService.cs - Customer Management Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Application.Common;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Application.Common;
using HigenAbsa.Application.DTOs.Customer;

using HigenAbsa.Domain.Interfaces;
using HigenAbsa.Domain.Entities;

namespace HigenAbsa.Application.Services.Customer;

public interface ICustomerService
{
    Task<PagedResult<CustomerDto>> GetCustomersAsync(int page, int pageSize, string? riskLevel, string? search);
    Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid id);
    Task<CustomerDto?> UpdateRiskLevelAsync(Guid id, string riskLevel);
}

public class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _uow;

    public CustomerService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<PagedResult<CustomerDto>> GetCustomersAsync(
        int page, int pageSize, string? riskLevel, string? search)
    {
        var query = _uow.Customers.Query()
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

        var pagedQuery = query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                StoreId = c.StoreId,
                StoreName = c.Store != null ? c.Store.StoreName : "",
                PlatformUserId = c.PlatformUserId,
                DisplayName = c.DisplayName,
                AvatarUrl = c.AvatarUrl,
                TotalReviewsCount = c.TotalReviewsCount,
                RiskLevel = c.RiskLevel,
                CreatedAt = c.CreatedAt
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<CustomerDetailDto?> GetCustomerByIdAsync(Guid id)
    {
        var customer = await _uow.Customers.Query()
            .Include(c => c.Store)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return null;

        // Get review sentiment stats for this customer
        var sentimentCounts = await _uow.ReviewAIAnalyses.Query()
            .Where(a => a.Review != null && a.Review.CustomerId == id)
            .GroupBy(a => a.OverallSentiment)
            .Select(g => new { Sentiment = g.Key, Count = g.Count() })
            .ToListAsync();

        var avgRating = await _uow.Reviews.Query()
            .Where(r => r.CustomerId == id)
            .Select(r => (double?)r.Rating)
            .AverageAsync() ?? 0;

        return new CustomerDetailDto
        {
            Id = customer.Id,
            StoreId = customer.StoreId,
            StoreName = customer.Store?.StoreName ?? "",
            PlatformUserId = customer.PlatformUserId,
            DisplayName = customer.DisplayName,
            AvatarUrl = customer.AvatarUrl,
            TotalReviewsCount = customer.TotalReviewsCount,
            RiskLevel = customer.RiskLevel,
            CreatedAt = customer.CreatedAt,
            AverageRating = Math.Round(avgRating, 2),
            PosCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "POS")?.Count ?? 0,
            NeuCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "NEU")?.Count ?? 0,
            NegCount = sentimentCounts.FirstOrDefault(s => s.Sentiment == "NEG")?.Count ?? 0
        };
    }

    public async Task<CustomerDto?> UpdateRiskLevelAsync(Guid id, string riskLevel)
    {
        var customer = await _uow.Customers.Query().Include(c => c.Store).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null) return null;

        customer.RiskLevel = riskLevel.ToUpper();
        await _uow.SaveChangesAsync();

        return new CustomerDto
        {
            Id = customer.Id,
            StoreId = customer.StoreId,
            StoreName = customer.Store?.StoreName ?? "",
            PlatformUserId = customer.PlatformUserId,
            DisplayName = customer.DisplayName,
            AvatarUrl = customer.AvatarUrl,
            TotalReviewsCount = customer.TotalReviewsCount,
            RiskLevel = customer.RiskLevel,
            CreatedAt = customer.CreatedAt
        };
    }
}

