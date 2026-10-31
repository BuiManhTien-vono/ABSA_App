using Microsoft.EntityFrameworkCore;
using HigenAbsa.Modules.Inference.Infrastructure;
using HigenAbsa.SharedKernel.Contracts;

namespace HigenAbsa.Modules.Inference.Application.Contracts;

public class InferenceLookupService(InferenceDbContext db) : IInferenceLookupContract
{
    public async Task<InferenceSummaryContractDto?> GetAnalysisByReviewIdAsync(
        Guid reviewId, CancellationToken cancellationToken = default)
    {
        var analysis = await db.ReviewAIAnalyses
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.ReviewId == reviewId, cancellationToken);

        if (analysis == null) return null;

        return new InferenceSummaryContractDto(
            analysis.ReviewId,
            analysis.OverallSentiment,
            analysis.SentimentScore,
            analysis.RootCause,
            analysis.SuggestedSellerResponse);
    }
}

