// Infrastructure/Repositories/ReviewRepository.cs - Specialized Review Repository
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Domain.Entities;
using HigenAbsa.Domain.Interfaces;
using HigenAbsa.Infrastructure.Data;

namespace HigenAbsa.Infrastructure.Repositories;

public class ReviewRepository : Repository<Review>, IReviewRepository
{
    public ReviewRepository(AppDbContext context) : base(context) { }

    public async Task<Review?> GetByIdWithAnalysisAsync(Guid id)
    {
        return await _dbSet
            .Include(r => r.Store)
            .Include(r => r.Product)
            .Include(r => r.Customer)
            .Include(r => r.AIAnalysis)
            .Include(r => r.Aspects)
            .Include(r => r.Keywords)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Review?> GetByPlatformReviewIdAsync(string platformReviewId)
    {
        return await _dbSet
            .FirstOrDefaultAsync(r => r.PlatformReviewId == platformReviewId);
    }

    public IQueryable<Review> QueryWithIncludes()
    {
        return _dbSet
            .Include(r => r.Store)
            .Include(r => r.Product)
            .Include(r => r.Customer)
            .Include(r => r.AIAnalysis)
            .Include(r => r.Aspects)
            .Include(r => r.Keywords);
    }
}
