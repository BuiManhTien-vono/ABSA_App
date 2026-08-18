// Services/InferenceService.cs - Thread-safe inference wrapper
using HigenAbsa.Api.Core;

namespace HigenAbsa.Api.Services;

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

public sealed class InferenceService : IInferenceService, IDisposable
{
    private readonly ModelBundle _model;
    private readonly SemaphoreSlim _lock = new(1, 1);
    private bool _disposed;

    public string ModelDir { get; }
    public string ModelNameStr => _model.ModelName;
    public int MaxLength => _model.MaxLength;
    public string Device { get; }
    public int BatchSize { get; }
    public bool NoDomainOverrides { get; }

    public InferenceService(ModelBundle model, AbsaOptions options)
    {
        _model = model;
        ModelDir = options.ModelDir;
        Device = options.Device;
        BatchSize = options.BatchSize;
        NoDomainOverrides = options.NoDomainOverrides;
    }

    public async Task<List<PredictionResult>> PredictManyAsync(
        IReadOnlyList<string> texts,
        bool? noDomainOverrides = null)
    {
        var cleaned = texts.Select(TextUtils.CleanText).ToList();
        bool disableOverrides = noDomainOverrides ?? NoDomainOverrides;

        await _lock.WaitAsync();
        try
        {
            var results = new List<PredictionResult>();
            int count = cleaned.Count;
            for (int start = 0; start < count; start += BatchSize)
            {
                int end = Math.Min(start + BatchSize, count);
                var batchClean = cleaned.GetRange(start, end - start);
                var batchRaw   = texts.Skip(start).Take(end - start).ToList();

                var logits = _model.Predict(batchClean);

                for (int offset = 0; offset < batchClean.Count; offset++)
                {
                    string rawText     = batchRaw[offset];
                    string cleanedText = batchClean[offset];
                    var overrides = disableOverrides
                        ? new List<OverrideEntry>()
                        : DomainOverrides.DetectDomainOverrides(rawText);

                    results.Add(BuildResult(rawText, cleanedText, logits, _model, offset, overrides));
                }
            }
            return results;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<PredictionResult> PredictOneAsync(string text, bool? noDomainOverrides = null)
    {
        var results = await PredictManyAsync([text], noDomainOverrides);
        return results[0];
    }

    private static PredictionResult BuildResult(
        string rawText,
        string text,
        Dictionary<string, float[][]> logits,
        ModelBundle model,
        int rowIndex,
        List<OverrideEntry> domainOverrides)
    {
        var config = model.LabelConfig;

        var macroScores          = MathHelpers.Sigmoid(logits["macro"][rowIndex]);
        var microScores          = MathHelpers.Sigmoid(logits["micro"][rowIndex]);
        var overallProbs         = MathHelpers.Softmax(logits["overall"][rowIndex]);
        var microSentimentScores = MathHelpers.Sigmoid(logits["micro_sentiment"][rowIndex]);

        var macroIndices = Enumerable.Range(0, macroScores.Length)
            .Where(i => macroScores[i] >= model.MacroThresholds[i]).ToList();
        var microIndices = Enumerable.Range(0, microScores.Length)
            .Where(i => microScores[i] >= model.MicroThresholds[i]).ToList();
        int overallIdx = MathHelpers.ArgMax(overallProbs);

        var macros = macroIndices.Select(i => new LabelEntry
        {
            Label     = config.Macros[i],
            Score     = MathHelpers.RoundFloat(macroScores[i]),
            Threshold = MathHelpers.RoundFloat(model.MacroThresholds[i]),
        }).ToList();

        var micros = microIndices.Select(i => new LabelEntry
        {
            Label     = config.Micros[i],
            Score     = MathHelpers.RoundFloat(microScores[i]),
            Threshold = MathHelpers.RoundFloat(model.MicroThresholds[i]),
        }).ToList();

        var aspectSentiments = microIndices.Select(i =>
        {
            var micro  = config.Micros[i];
            var picked = PickSentiment(micro, microSentimentScores, model.MicroSentimentThresholds, config);
            return new AspectSentimentEntry
            {
                Macro                    = Taxonomy.MicroToMacro.GetValueOrDefault(micro),
                Micro                    = micro,
                Sentiment                = picked.Sentiment,
                AspectScore              = MathHelpers.RoundFloat(microScores[i]),
                AspectThreshold          = MathHelpers.RoundFloat(model.MicroThresholds[i]),
                SentimentScore           = MathHelpers.RoundFloat(picked.Score),
                SentimentThreshold       = MathHelpers.RoundFloat(picked.Threshold),
                SentimentPassedThreshold = picked.Passed,
            };
        }).ToList();

        var result = new PredictionResult
        {
            Text           = rawText,
            NormalizedText = text,
            OverallSentiment = new OverallSentiment
            {
                Label = config.Overalls[overallIdx],
                Score = MathHelpers.RoundFloat(overallProbs[overallIdx]),
            },
            Macros           = macros,
            Micros           = micros,
            AspectSentiments = aspectSentiments,
        };

        Postprocess.ApplyDomainOverrides(result, domainOverrides);
        Postprocess.ApplyPostprocess(result, rawText);
        return result;
    }

    private static (string Sentiment, float Score, float Threshold, bool Passed) PickSentiment(
        string micro,
        float[] sentimentScores,
        float[] thresholds,
        LabelConfig config)
    {
        string bestSentiment = config.Sentiments[0];
        float bestScore = float.NegativeInfinity;
        float bestThreshold = 0.5f;
        bool bestPassed = false;

        string? firstPassedSentiment = null;
        float firstPassedScore = float.NegativeInfinity;
        float firstPassedThreshold = 0.5f;

        foreach (var sentiment in config.Sentiments)
        {
            var key = $"{micro}__{sentiment}";
            var idx = config.MicroSentiments.IndexOf(key);
            if (idx < 0) continue;

            float score  = sentimentScores[idx];
            float thresh = thresholds[idx];
            bool passed  = score >= thresh;

            if (passed && score > firstPassedScore)
            {
                firstPassedSentiment  = sentiment;
                firstPassedScore      = score;
                firstPassedThreshold  = thresh;
            }
            if (score > bestScore)
            {
                bestScore     = score;
                bestSentiment = sentiment;
                bestThreshold = thresh;
                bestPassed    = passed;
            }
        }

        return firstPassedSentiment != null
            ? (firstPassedSentiment, firstPassedScore, firstPassedThreshold, true)
            : (bestSentiment, bestScore, bestThreshold, bestPassed);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _lock.Dispose();
        _model.Dispose();
        _disposed = true;
    }
}
