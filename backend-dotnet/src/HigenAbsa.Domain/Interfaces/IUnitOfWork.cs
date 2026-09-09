// Domain/Interfaces/IUnitOfWork.cs - Unit of Work Pattern Interface
using HigenAbsa.Domain.Entities;

namespace HigenAbsa.Domain.Interfaces;

/// <summary>
/// Unit of Work aggregates all repositories and coordinates a single SaveChanges transaction.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    // -----------------------------------------------------------------------
    // Generic Repositories — one per Entity/Aggregate Root
    // -----------------------------------------------------------------------
    IRepository<Platform> Platforms { get; }
    IRepository<StoreConnection> StoreConnections { get; }
    IRepository<Product> Products { get; }
    IRepository<Customer> Customers { get; }
    IRepository<Review> Reviews { get; }
    IRepository<ReviewAIAnalysis> ReviewAIAnalyses { get; }
    IRepository<ReviewAspect> ReviewAspects { get; }
    IRepository<ReviewKeyword> ReviewKeywords { get; }
    IRepository<ResponseTemplate> ResponseTemplates { get; }
    IRepository<AutomationRule> AutomationRules { get; }
    IRepository<ReviewResponse> ReviewResponses { get; }
    IRepository<Ticket> Tickets { get; }
    IRepository<SystemUser> SystemUsers { get; }
    IRepository<RefreshToken> RefreshTokens { get; }
    IRepository<AuditLog> AuditLogs { get; }

    // -----------------------------------------------------------------------
    // Specialized Repositories — for complex queries with Includes
    // -----------------------------------------------------------------------
    IReviewRepository ReviewRepo { get; }
    IUserRepository UserRepo { get; }
    ITicketRepository TicketRepo { get; }

    // -----------------------------------------------------------------------
    // Transaction Commit
    // -----------------------------------------------------------------------
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
