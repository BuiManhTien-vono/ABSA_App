// Infrastructure/Repositories/Repository.cs - Generic Repository Implementation
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Domain.Interfaces;
using HigenAbsa.Infrastructure.Data;

namespace HigenAbsa.Infrastructure.Repositories;

/// <summary>
/// Generic Repository wrapping EF Core DbSet<T> for standard CRUD operations.
/// </summary>
public class Repository<T> : IRepository<T> where T : class
{
    protected readonly AppDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(AppDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(object id) => await _dbSet.FindAsync(id);

    public async Task<List<T>> GetAllAsync() => await _dbSet.ToListAsync();

    public IQueryable<T> Query() => _dbSet.AsQueryable();

    public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        => await _dbSet.AnyAsync(predicate);

    public void Add(T entity) => _dbSet.Add(entity);

    public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);

    public void AddRange(IEnumerable<T> entities) => _dbSet.AddRange(entities);

    public async Task AddRangeAsync(IEnumerable<T> entities) => await _dbSet.AddRangeAsync(entities);

    public void Update(T entity) => _dbSet.Update(entity);

    public void Remove(T entity) => _dbSet.Remove(entity);

    public void RemoveRange(IEnumerable<T> entities) => _dbSet.RemoveRange(entities);
}
