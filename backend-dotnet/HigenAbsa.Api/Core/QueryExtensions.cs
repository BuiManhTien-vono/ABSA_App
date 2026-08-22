// Core/QueryExtensions.cs - IQueryable extension methods for pagination
using Microsoft.EntityFrameworkCore;
using HigenAbsa.Api.Models;

namespace HigenAbsa.Api.Core;

public static class QueryExtensions
{
    /// <summary>
    /// Apply pagination to an IQueryable and return a PagedResult.
    /// </summary>
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query, int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var totalItems = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<T>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }
}
