// Domain/Interfaces/IRepository.cs - Generic Repository Interface
namespace HigenAbsa.Domain.Interfaces;

/// <summary>
/// Generic Repository providing standard CRUD operations over a DbSet.
/// Leverages EF Core's DbSet<T> underneath — thin abstraction for testability.
/// </summary>
public interface IRepository<T> where T : class
{
    // -----------------------------------------------------------------------
    // Read Operations
    // -----------------------------------------------------------------------

    /// <summary>Find entity by primary key.</summary>
    Task<T?> GetByIdAsync(object id);

    /// <summary>Get all entities (use with caution on large tables).</summary>
    Task<List<T>> GetAllAsync();

    /// <summary>Expose IQueryable for flexible query composition in Services.</summary>
    IQueryable<T> Query();

    /// <summary>Check if any entity matches the predicate.</summary>
    Task<bool> AnyAsync(System.Linq.Expressions.Expression<Func<T, bool>> predicate);

    // -----------------------------------------------------------------------
    // Write Operations
    // -----------------------------------------------------------------------

    void Add(T entity);
    Task AddAsync(T entity);
    void AddRange(IEnumerable<T> entities);
    Task AddRangeAsync(IEnumerable<T> entities);
    void Update(T entity);
    void Remove(T entity);
    void RemoveRange(IEnumerable<T> entities);
}
