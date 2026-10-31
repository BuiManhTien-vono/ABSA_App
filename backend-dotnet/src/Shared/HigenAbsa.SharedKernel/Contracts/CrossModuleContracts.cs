namespace HigenAbsa.SharedKernel.Contracts;

public sealed record UserContractDto(
    Guid UserId,
    string FullName,
    string Email,
    string Role,
    bool IsActive);

/// <summary>
/// PHƯƠNG THỨC GIAO TIẾP 2 (Contract Interface):
/// Cho phép các Module khác (Reporting, Engagement...) tra cứu thông tin người dùng từ Security Module.
/// </summary>
public interface IUserLookupContract
{
    Task<UserContractDto?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<UserContractDto?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
}

public sealed record StoreContractDto(
    Guid StoreId,
    string StoreName,
    int PlatformId,
    string PlatformCode,
    string Status);

public interface IStoreLookupContract
{
    Task<StoreContractDto?> GetByIdAsync(Guid storeId, CancellationToken cancellationToken = default);
    Task<List<StoreContractDto>> GetAllActiveStoresAsync(CancellationToken cancellationToken = default);
}

public sealed record ReviewContractDto(
    Guid ReviewId,
    Guid StoreId,
    int Rating,
    string ReviewText,
    DateTimeOffset ReviewCreatedAt,
    string Status);

public interface IReviewLookupContract
{
    Task<ReviewContractDto?> GetByIdAsync(Guid reviewId, CancellationToken cancellationToken = default);
    Task<int> GetCountByDateRangeAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default);
}

public sealed record InferenceSummaryContractDto(
    Guid ReviewId,
    string OverallSentiment,
    float Confidence,
    string? RootCause,
    string? SuggestedResponse);

public interface IInferenceLookupContract
{
    Task<InferenceSummaryContractDto?> GetAnalysisByReviewIdAsync(Guid reviewId, CancellationToken cancellationToken = default);
}

