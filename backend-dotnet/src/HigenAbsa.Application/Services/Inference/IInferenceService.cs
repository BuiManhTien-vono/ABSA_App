using HigenAbsa.Application.Common;

namespace HigenAbsa.Application.Services.Inference;

public interface IInferenceService
{
    Task<List<PredictionResult>> PredictManyAsync(IReadOnlyList<string> texts, bool? noDomainOverrides = null);
    Task<PredictionResult> PredictOneAsync(string text, bool? noDomainOverrides = null);
    string ModelDir { get; }
    string ModelNameStr { get; }
    int MaxLength { get; }
    string Device { get; }
    int BatchSize { get; }
    bool NoDomainOverrides { get; }
}
