// Services/Lazada/ILazadaApiService.cs - Interface for Lazada Open Platform Product Review & DB Integration
using HigenAbsa.Api.Models.Lazada;

namespace HigenAbsa.Api.Services.Lazada;

public interface ILazadaApiService
{
    /// <summary>
    /// Calls Lazada Open Platform GetProductReviewList API (/review/seller/list).
    /// </summary>
    Task<LazadaReviewListResponse> GetProductReviewListAsync(
        string accessToken,
        long? itemId = null,
        int pageNo = 1,
        int pageSize = 20);

    /// <summary>
    /// Fetches reviews from Lazada, maps to EF Core entities, saves to SQL Server, and triggers AI sentiment inference.
    /// </summary>
    Task<LazadaSyncResultDto> SyncReviewsToDatabaseAsync(
        Guid storeId,
        string? accessToken = null,
        long? itemId = null,
        int pageNo = 1,
        int pageSize = 20);
}
