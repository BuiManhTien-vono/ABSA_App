// Domain/Interfaces/IReviewRepository.cs - Specialized Review Repository
using HigenAbsa.Domain.Entities;

namespace HigenAbsa.Domain.Interfaces;

/// <summary>
/// Specialized repository for Review entity with eager-loaded navigation properties.
/// </summary>
public interface IReviewRepository : IRepository<Review>
{
    /// <summary>Get review by ID with AI Analysis, Aspects, and Keywords included.</summary>
    Task<Review?> GetByIdWithAnalysisAsync(Guid id);

    /// <summary>Find review by platform-specific review ID.</summary>
    Task<Review?> GetByPlatformReviewIdAsync(string platformReviewId);

    /// <summary>IQueryable with AI Analysis, Aspects, Keywords, Product, Customer included.</summary>
    IQueryable<Review> QueryWithIncludes();
}
