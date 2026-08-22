// Services/Store/StoreService.cs - Store Connection & Platform Management Service
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Core;
using HigenAbsa.Api.Data;
using HigenAbsa.Api.Data.Entities;
using HigenAbsa.Api.Models;
using HigenAbsa.Api.Models.Store;

namespace HigenAbsa.Api.Services.Store;

public interface IStoreService
{
    Task<List<PlatformDto>> GetPlatformsAsync();
    Task<PagedResult<StoreConnectionDto>> GetStoresAsync(int page, int pageSize, string? search, string? status);
    Task<StoreConnectionDto?> GetStoreByIdAsync(Guid id);
    Task<StoreConnectionDto> CreateStoreAsync(CreateStoreRequest request);
    Task<StoreConnectionDto?> UpdateStoreAsync(Guid id, UpdateStoreRequest request);
    Task<bool> DeleteStoreAsync(Guid id);
    Task<StoreConnectionDto?> SyncStoreAsync(Guid id);
}

public class StoreService : IStoreService
{
    private readonly AppDbContext _db;

    public StoreService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<PlatformDto>> GetPlatformsAsync()
    {
        return await _db.Platforms
            .Where(p => p.IsActive)
            .OrderBy(p => p.Id)
            .Select(p => new PlatformDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                ApiBaseUrl = p.ApiBaseUrl,
                IsActive = p.IsActive
            })
            .ToListAsync();
    }

    public async Task<PagedResult<StoreConnectionDto>> GetStoresAsync(
        int page, int pageSize, string? search, string? status)
    {
        var query = _db.StoreConnections
            .Include(s => s.Platform)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(s =>
                s.StoreName.ToLower().Contains(term) ||
                s.StoreCodeOnPlatform.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(s => s.Status == status.ToUpper());

        var pagedQuery = query
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new StoreConnectionDto
            {
                Id = s.Id,
                PlatformId = s.PlatformId,
                PlatformCode = s.Platform != null ? s.Platform.Code : "",
                PlatformName = s.Platform != null ? s.Platform.Name : "",
                StoreName = s.StoreName,
                StoreCodeOnPlatform = s.StoreCodeOnPlatform,
                Status = s.Status,
                LastSyncedAt = s.LastSyncedAt,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                ProductCount = s.Products.Count,
                ReviewCount = s.Reviews.Count
            });

        return await pagedQuery.ToPagedResultAsync(page, pageSize);
    }

    public async Task<StoreConnectionDto?> GetStoreByIdAsync(Guid id)
    {
        return await _db.StoreConnections
            .Include(s => s.Platform)
            .Where(s => s.Id == id)
            .Select(s => new StoreConnectionDto
            {
                Id = s.Id,
                PlatformId = s.PlatformId,
                PlatformCode = s.Platform != null ? s.Platform.Code : "",
                PlatformName = s.Platform != null ? s.Platform.Name : "",
                StoreName = s.StoreName,
                StoreCodeOnPlatform = s.StoreCodeOnPlatform,
                Status = s.Status,
                LastSyncedAt = s.LastSyncedAt,
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt,
                ProductCount = s.Products.Count,
                ReviewCount = s.Reviews.Count
            })
            .FirstOrDefaultAsync();
    }

    public async Task<StoreConnectionDto> CreateStoreAsync(CreateStoreRequest request)
    {
        var platform = await _db.Platforms.FindAsync(request.PlatformId)
            ?? throw new InvalidOperationException($"Platform with ID {request.PlatformId} not found.");

        // Check unique StoreCode per platform
        var exists = await _db.StoreConnections.AnyAsync(s =>
            s.PlatformId == request.PlatformId &&
            s.StoreCodeOnPlatform == request.StoreCodeOnPlatform);

        if (exists)
            throw new InvalidOperationException(
                $"Store code '{request.StoreCodeOnPlatform}' already exists on platform '{platform.Name}'.");

        var store = new StoreConnection
        {
            Id = Guid.NewGuid(),
            PlatformId = request.PlatformId,
            StoreName = request.StoreName.Trim(),
            StoreCodeOnPlatform = request.StoreCodeOnPlatform.Trim(),
            AccessToken = request.AccessToken,
            RefreshToken = request.RefreshToken,
            Status = "CONNECTED",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.StoreConnections.Add(store);
        await _db.SaveChangesAsync();

        return (await GetStoreByIdAsync(store.Id))!;
    }

    public async Task<StoreConnectionDto?> UpdateStoreAsync(Guid id, UpdateStoreRequest request)
    {
        var store = await _db.StoreConnections.FindAsync(id);
        if (store == null) return null;

        if (!string.IsNullOrWhiteSpace(request.StoreName))
            store.StoreName = request.StoreName.Trim();

        if (!string.IsNullOrWhiteSpace(request.StoreCodeOnPlatform))
            store.StoreCodeOnPlatform = request.StoreCodeOnPlatform.Trim();

        if (request.AccessToken != null)
        {
            store.AccessToken = request.AccessToken;
            store.Status = "CONNECTED"; // Reset to connected when new token provided
        }

        if (request.RefreshToken != null)
            store.RefreshToken = request.RefreshToken;

        if (!string.IsNullOrWhiteSpace(request.Status))
            store.Status = request.Status.ToUpper();

        store.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetStoreByIdAsync(id);
    }

    public async Task<bool> DeleteStoreAsync(Guid id)
    {
        var store = await _db.StoreConnections.FindAsync(id);
        if (store == null) return false;

        store.Status = "DISCONNECTED";
        store.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<StoreConnectionDto?> SyncStoreAsync(Guid id)
    {
        var store = await _db.StoreConnections.FindAsync(id);
        if (store == null) return null;

        // Simulate sync — in production, this would call the platform API
        store.LastSyncedAt = DateTime.UtcNow;
        store.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return await GetStoreByIdAsync(id);
    }
}
