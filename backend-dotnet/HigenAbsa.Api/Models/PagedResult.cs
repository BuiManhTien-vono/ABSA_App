// Models/PagedResult.cs - Generic pagination wrapper for all list endpoints
namespace HigenAbsa.Api.Models;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize);
}
