// Infrastructure/Repositories/UnitOfWork.cs - Unit of Work Implementation
using HigenAbsa.Domain.Entities;
using HigenAbsa.Domain.Interfaces;
using HigenAbsa.Infrastructure.Data;

namespace HigenAbsa.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    // Lazy-initialized generic repositories
    private IRepository<Platform>? _platforms;
    private IRepository<StoreConnection>? _storeConnections;
    private IRepository<Product>? _products;
    private IRepository<Customer>? _customers;
    private IRepository<Review>? _reviews;
    private IRepository<ReviewAIAnalysis>? _reviewAIAnalyses;
    private IRepository<ReviewAspect>? _reviewAspects;
    private IRepository<ReviewKeyword>? _reviewKeywords;
    private IRepository<ResponseTemplate>? _responseTemplates;
    private IRepository<AutomationRule>? _automationRules;
    private IRepository<ReviewResponse>? _reviewResponses;
    private IRepository<Ticket>? _tickets;
    private IRepository<SystemUser>? _systemUsers;
    private IRepository<RefreshToken>? _refreshTokens;
    private IRepository<AuditLog>? _auditLogs;

    // Lazy-initialized specialized repositories
    private IReviewRepository? _reviewRepo;
    private IUserRepository? _userRepo;
    private ITicketRepository? _ticketRepo;

    public UnitOfWork(AppDbContext context) => _context = context;

    // -----------------------------------------------------------------------
    // Generic Repositories
    // -----------------------------------------------------------------------
    public IRepository<Platform> Platforms =>
        _platforms ??= new Repository<Platform>(_context);

    public IRepository<StoreConnection> StoreConnections =>
        _storeConnections ??= new Repository<StoreConnection>(_context);

    public IRepository<Product> Products =>
        _products ??= new Repository<Product>(_context);

    public IRepository<Customer> Customers =>
        _customers ??= new Repository<Customer>(_context);

    public IRepository<Review> Reviews =>
        _reviews ??= new Repository<Review>(_context);

    public IRepository<ReviewAIAnalysis> ReviewAIAnalyses =>
        _reviewAIAnalyses ??= new Repository<ReviewAIAnalysis>(_context);

    public IRepository<ReviewAspect> ReviewAspects =>
        _reviewAspects ??= new Repository<ReviewAspect>(_context);

    public IRepository<ReviewKeyword> ReviewKeywords =>
        _reviewKeywords ??= new Repository<ReviewKeyword>(_context);

    public IRepository<ResponseTemplate> ResponseTemplates =>
        _responseTemplates ??= new Repository<ResponseTemplate>(_context);

    public IRepository<AutomationRule> AutomationRules =>
        _automationRules ??= new Repository<AutomationRule>(_context);

    public IRepository<ReviewResponse> ReviewResponses =>
        _reviewResponses ??= new Repository<ReviewResponse>(_context);

    public IRepository<Ticket> Tickets =>
        _tickets ??= new Repository<Ticket>(_context);

    public IRepository<SystemUser> SystemUsers =>
        _systemUsers ??= new Repository<SystemUser>(_context);

    public IRepository<RefreshToken> RefreshTokens =>
        _refreshTokens ??= new Repository<RefreshToken>(_context);

    public IRepository<AuditLog> AuditLogs =>
        _auditLogs ??= new Repository<AuditLog>(_context);

    // -----------------------------------------------------------------------
    // Specialized Repositories
    // -----------------------------------------------------------------------
    public IReviewRepository ReviewRepo =>
        _reviewRepo ??= new ReviewRepository(_context);

    public IUserRepository UserRepo =>
        _userRepo ??= new UserRepository(_context);

    public ITicketRepository TicketRepo =>
        _ticketRepo ??= new TicketRepository(_context);

    // -----------------------------------------------------------------------
    // Transaction Commit
    // -----------------------------------------------------------------------
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);

    public void Dispose() => _context.Dispose();
}
