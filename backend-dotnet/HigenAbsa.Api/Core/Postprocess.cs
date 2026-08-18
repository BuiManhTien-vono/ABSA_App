// Core/Postprocess.cs - Port of postprocess.py pipeline
namespace HigenAbsa.Api.Core;

// -----------------------------------------------------------------------
// Data types used throughout the pipeline
// -----------------------------------------------------------------------

public class LabelEntry
{
    public string Label { get; set; } = "";
    public float Score { get; set; }
    public float? Threshold { get; set; }
    public string? Source { get; set; }
}

public class AspectSentimentEntry
{
    public string? Macro { get; set; }
    public string Micro { get; set; } = "";
    public string Sentiment { get; set; } = "";
    public float AspectScore { get; set; }
    public float? AspectThreshold { get; set; }
    public float SentimentScore { get; set; }
    public float? SentimentThreshold { get; set; }
    public bool SentimentPassedThreshold { get; set; }
    public string? Source { get; set; }
    public string? OverrideReason { get; set; }
    public string? ModelSentiment { get; set; }
    public string? ModelMacro { get; set; }
    public string? Evidence { get; set; }
    public int? EvidenceStart { get; set; }
    public int? EvidenceEnd { get; set; }
    public string? EvidenceSource { get; set; }
}

public class OverallSentiment
{
    public string Label { get; set; } = "";
    public float Score { get; set; }
    public string? Source { get; set; }
    public string? OverrideReason { get; set; }
    public string? ModelLabel { get; set; }
    public float? ModelScore { get; set; }
}

public class InsightResult
{
    public string CustomerInsight { get; set; } = "";
    public string RootCause { get; set; } = "";
    public string BusinessRecommendation { get; set; } = "";
    public string SuggestedSellerResponse { get; set; } = "";
    public string Source { get; set; } = "template";
}

public class PredictionResult
{
    public string Text { get; set; } = "";
    public string NormalizedText { get; set; } = "";
    public OverallSentiment OverallSentiment { get; set; } = new();
    public List<LabelEntry> Macros { get; set; } = [];
    public List<LabelEntry> Micros { get; set; } = [];
    public List<AspectSentimentEntry> AspectSentiments { get; set; } = [];
    public InsightResult? Insight { get; set; }
    public bool Spam { get; set; }
    public bool IntentQa { get; set; }
    public Dictionary<string, object>? Postprocess { get; set; }
    public Dictionary<string, object>? Meta { get; set; }
}

// -----------------------------------------------------------------------
// Pipeline
// -----------------------------------------------------------------------

public static class Postprocess
{
    // --- Label helpers ---------------------------------------------------

    private static void UpsertLabel(List<LabelEntry> labels, string label, string source)
    {
        if (labels.Any(l => l.Label == label)) return;
        labels.Add(new LabelEntry { Label = label, Score = 1f, Threshold = null, Source = source });
    }

    // --- Domain overrides ------------------------------------------------

    public static void ApplyDomainOverrides(PredictionResult result, List<OverrideEntry> overrides)
    {
        if (overrides.Count == 0) return;
        var applied = new List<OverrideEntry>();

        foreach (var ov in overrides)
        {
            UpsertLabel(result.Macros, ov.Macro, "domain_override");
            UpsertLabel(result.Micros, ov.Micro, "domain_override");

            // Check for conflicting existing aspect with overlapping evidence
            AspectSentimentEntry? conflicting = null;
            if (ov.Evidence != null)
            {
                conflicting = result.AspectSentiments.FirstOrDefault(a =>
                    a.Micro == ov.Micro &&
                    a.Evidence != null &&
                    a.Sentiment != ov.Sentiment &&
                    (a.Evidence.ToLower().Contains(ov.Evidence.ToLower()) ||
                     ov.Evidence.ToLower().Contains(a.Evidence.ToLower())));
            }

            if (conflicting != null)
            {
                var src = conflicting.Source ?? "";
                if (!src.Contains("domain_override"))
                {
                    conflicting.ModelSentiment = conflicting.Sentiment;
                    conflicting.Sentiment = ov.Sentiment;
                    conflicting.Source = src.Length > 0 ? $"{src}+domain_override" : "model+domain_override";
                    conflicting.OverrideReason = ov.Reason;
                    if (ov.Evidence != null)
                    {
                        conflicting.Evidence = ov.Evidence;
                        conflicting.EvidenceStart = ov.EvidenceStart;
                        conflicting.EvidenceEnd = ov.EvidenceEnd;
                        conflicting.EvidenceSource = "domain_override";
                    }
                    applied.Add(ov);
                }
                else
                {
                    AddToPostprocess(result, "skipped_overrides", ov);
                }
                continue;
            }

            // Check for existing aspect (same micro, same or no evidence)
            AspectSentimentEntry? existing = result.AspectSentiments.FirstOrDefault(a =>
                a.Micro == ov.Micro &&
                (a.Evidence == null || a.Evidence == ov.Evidence));

            if (existing != null &&
                existing.Evidence != null && ov.Evidence != null &&
                existing.Sentiment != ov.Sentiment &&
                (existing.Evidence.ToLower().Contains(ov.Evidence.ToLower()) ||
                 ov.Evidence.ToLower().Contains(existing.Evidence.ToLower())))
            {
                AddToPostprocess(result, "skipped_overrides", ov);
                continue;
            }

            if (existing == null)
            {
                var aspect = new AspectSentimentEntry
                {
                    Macro = ov.Macro, Micro = ov.Micro, Sentiment = ov.Sentiment,
                    AspectScore = 1f, AspectThreshold = null,
                    SentimentScore = 1f, SentimentThreshold = null, SentimentPassedThreshold = true,
                    Source = "domain_override", OverrideReason = ov.Reason,
                };
                if (ov.Evidence != null)
                {
                    aspect.Evidence = ov.Evidence; aspect.EvidenceStart = ov.EvidenceStart;
                    aspect.EvidenceEnd = ov.EvidenceEnd; aspect.EvidenceSource = "domain_override";
                }
                result.AspectSentiments.Add(aspect);
            }
            else
            {
                existing.ModelSentiment = existing.Sentiment;
                existing.Sentiment = ov.Sentiment;
                existing.Source = "model+domain_override";
                existing.OverrideReason = ov.Reason;
                if (ov.Evidence != null)
                {
                    existing.Evidence = ov.Evidence; existing.EvidenceStart = ov.EvidenceStart;
                    existing.EvidenceEnd = ov.EvidenceEnd; existing.EvidenceSource = "domain_override";
                }
            }

            if (ov.OverallHint != null)
            {
                var overall = result.OverallSentiment;
                overall.ModelLabel ??= overall.Label;
                overall.ModelScore ??= overall.Score;
                overall.Label = ov.OverallHint;
                overall.Score = 0.75f;
                overall.Source = "domain_override";
                overall.OverrideReason = ov.Reason;
            }
            applied.Add(ov);
        }

        AddToPostprocess(result, "domain_overrides", applied);
    }

    // --- Evidence attachment ---------------------------------------------

    public static void AttachRuleEvidence(PredictionResult result, string text)
    {
        var missing = new List<string>();
        foreach (var aspect in result.AspectSentiments)
        {
            var ev = aspect.Evidence;
            if (ev != null)
            {
                var s = aspect.EvidenceStart; var e = aspect.EvidenceEnd;
                if (s.HasValue && e.HasValue && text[s.Value..e.Value] == ev) continue;
            }
            var found = DomainOverrides.FindEvidenceForMicro(text, aspect.Micro);
            if (found == null) { missing.Add(aspect.Micro); continue; }
            var (fs, fe, fev, fsrc) = found.Value;
            aspect.Evidence = fev; aspect.EvidenceStart = fs;
            aspect.EvidenceEnd = fe; aspect.EvidenceSource = fsrc;
        }
        if (missing.Count > 0)
            (result.Postprocess ??= [])["missing_evidence"] = missing;
    }

    // --- Hierarchy correction --------------------------------------------

    public static void ApplyHierarchyCorrection(PredictionResult result)
    {
        var corrected = new List<string>();
        foreach (var aspect in result.AspectSentiments)
        {
            if (!Taxonomy.MicroToMacro.TryGetValue(aspect.Micro, out var parent)) continue;
            if (aspect.Macro != parent)
            {
                aspect.ModelMacro = aspect.Macro;
                aspect.Macro = parent;
                corrected.Add(aspect.Micro);
            }
            int before = result.Macros.Count;
            UpsertLabel(result.Macros, parent, "hierarchy_correction");
            if (result.Macros.Count > before) corrected.Add(parent);
        }
        if (corrected.Count > 0)
            (result.Postprocess ??= [])["hierarchy_corrections"] = corrected;
    }

    // --- Remove unfounded aspects ----------------------------------------

    public static void RemoveUnfoundedSpecialAspects(PredictionResult result)
    {
        var kept = new List<AspectSentimentEntry>();
        var removed = new List<string>();

        foreach (var aspect in result.AspectSentiments)
        {
            if (aspect.Evidence == null) { removed.Add(aspect.Micro); continue; }
            var evLower = aspect.Evidence.ToLower();
            if (aspect.Micro == "Performance_Functionality" && evLower.Contains("xin lỗi"))
            { removed.Add(aspect.Micro); continue; }
            kept.Add(aspect);
        }

        if (removed.Count == 0) return;
        result.AspectSentiments = kept;
        var activeMicros = kept.Select(a => a.Micro).ToHashSet();
        result.Micros = result.Micros.Where(m => activeMicros.Contains(m.Label)).ToList();
        var activeMacros = activeMicros
            .Where(m => Taxonomy.MicroToMacro.ContainsKey(m))
            .Select(m => Taxonomy.MicroToMacro[m]).ToHashSet();
        result.Macros = result.Macros
            .Where(m => activeMacros.Contains(m.Label) || m.Source != "hierarchy_correction")
            .ToList();
        (result.Postprocess ??= [])["removed_aspects"] = removed;
    }

    // --- Macro sync ------------------------------------------------------

    public static void SyncMacroLabelsToAspects(PredictionResult result)
    {
        var activeMacros = result.AspectSentiments
            .Where(a => a.Macro != null).Select(a => a.Macro!).ToHashSet();
        var removed = result.Macros.Where(m => !activeMacros.Contains(m.Label)).Select(m => m.Label).ToList();
        result.Macros = result.Macros.Where(m => activeMacros.Contains(m.Label)).ToList();
        foreach (var macro in activeMacros) UpsertLabel(result.Macros, macro, "aspect_sync");
        if (removed.Count > 0) (result.Postprocess ??= [])["macro_sync_removed"] = removed;
    }

    // --- Derive overall --------------------------------------------------

    public static void DeriveOverallFromAspects(PredictionResult result)
    {
        var sentiments = result.AspectSentiments
            .Where(a => !Taxonomy.InsightIgnoredMicros.Contains(a.Micro) && a.Sentiment != "NEU")
            .Select(a => a.Sentiment).ToHashSet();

        string derived;
        if (sentiments.Contains("POS") && sentiments.Contains("NEG")) derived = "MIXED";
        else if (sentiments.Contains("NEG")) derived = "NEG";
        else if (sentiments.Contains("POS")) derived = "POS";
        else if (result.AspectSentiments.Count > 0) derived = "NEU";
        else derived = result.OverallSentiment.Label;

        if (result.OverallSentiment.Label == derived) return;
        var overall = result.OverallSentiment;
        overall.ModelLabel ??= overall.Label;
        overall.ModelScore ??= overall.Score;
        overall.Label = derived;
        overall.Score = derived == "MIXED" ? 0.8f : 0.7f;
        overall.Source = "aspect_sentiment_rule";
    }

    // --- Comment flags ---------------------------------------------------

    public static void AddCommentFlags(PredictionResult result)
    {
        var micros = result.AspectSentiments.Select(a => a.Micro).ToHashSet();
        result.Spam = micros.Contains("Spam_Noise");
        result.IntentQa = micros.Contains("Intent_QA");
    }

    // --- Insight generation ----------------------------------------------

    private static string JoinVietnamese(IEnumerable<string> items)
    {
        var list = items.Where(s => !string.IsNullOrEmpty(s)).Distinct().ToList();
        return list.Count switch
        {
            0 => "",
            1 => list[0],
            2 => $"{list[0]} và {list[1]}",
            _ => $"{string.Join(", ", list[..^1])} và {list[^1]}"
        };
    }

    private static string JoinRecommendations(IEnumerable<string> items)
    {
        var list = items.Where(s => !string.IsNullOrEmpty(s)).Distinct().ToList();
        return list.Count switch { 0 => "", 1 => list[0], _ => string.Join("; đồng thời ", list) };
    }

    private static IEnumerable<string> AspectTerms(List<AspectSentimentEntry> aspects, string sentiment) =>
        aspects
            .Where(a => a.Sentiment == sentiment && !Taxonomy.InsightIgnoredMicros.Contains(a.Micro))
            .Select(a => Taxonomy.MicroText.GetValueOrDefault(a.Micro, a.Micro));

    public static InsightResult BuildTemplateInsight(PredictionResult result)
    {
        var aspects = result.AspectSentiments;
        var positive = JoinVietnamese(AspectTerms(aspects, "POS"));
        var negative = JoinVietnamese(AspectTerms(aspects, "NEG"));
        var neutral  = JoinVietnamese(AspectTerms(aspects, "NEU"));

        string customerInsight = (positive, negative) switch
        {
            ({ Length: > 0 }, { Length: > 0 }) => $"Khách hàng hài lòng với {positive}, nhưng chưa hài lòng về {negative}.",
            (_, { Length: > 0 }) => $"Khách hàng chưa hài lòng về {negative}.",
            ({ Length: > 0 }, _) => $"Khách hàng hài lòng với {positive}.",
            _ when neutral.Length > 0 => $"Khách hàng có phản hồi trung tính liên quan đến {neutral}.",
            _ => "Chưa có đủ tín hiệu rõ ràng để rút ra insight theo khía cạnh.",
        };

        var negativeMicros = aspects
            .Where(a => a.Sentiment == "NEG" && Taxonomy.MicroRecommendations.ContainsKey(a.Micro))
            .Select(a => a.Micro).Distinct().ToList();

        string rootCause, businessRec;
        if (negativeMicros.Count > 0)
        {
            rootCause = $"Vấn đề chính nằm ở {JoinVietnamese(negativeMicros.Select(m => Taxonomy.MicroText[m]))}.";
            businessRec = "Nên " + JoinRecommendations(negativeMicros.Select(m => Taxonomy.MicroRecommendations[m])) + ".";
        }
        else
        {
            rootCause = "Không phát hiện nguyên nhân tiêu cực rõ ràng từ các khía cạnh dự đoán.";
            businessRec = "Nên duy trì các điểm đang được khách hàng đánh giá tích cực.";
        }

        string sellerResponse = (positive, negative) switch
        {
            ({ Length: > 0 }, { Length: > 0 }) =>
                $"Shop cảm ơn bạn đã góp ý. Shop rất vui vì bạn hài lòng với {positive}; " +
                $"đồng thời shop ghi nhận các vấn đề về {negative} để kiểm tra và cải thiện trong các đơn tiếp theo.",
            (_, { Length: > 0 }) =>
                $"Shop xin lỗi vì trải nghiệm của bạn chưa tốt về {negative}. " +
                "Shop ghi nhận phản hồi này và sẽ kiểm tra lại để cải thiện.",
            ({ Length: > 0 }, _) =>
                $"Shop cảm ơn bạn đã đánh giá tích cực về {positive}. " +
                "Shop sẽ tiếp tục duy trì chất lượng phục vụ trong các đơn tiếp theo.",
            _ => "Shop cảm ơn bạn đã để lại phản hồi. Shop sẽ tiếp tục theo dõi để hỗ trợ khi cần.",
        };

        return new InsightResult
        {
            CustomerInsight = customerInsight,
            RootCause = rootCause,
            BusinessRecommendation = businessRec,
            SuggestedSellerResponse = sellerResponse,
            Source = "template",
        };
    }

    // --- Full pipeline ---------------------------------------------------

    public static void ApplyPostprocess(PredictionResult result, string text)
    {
        ApplyHierarchyCorrection(result);
        AttachRuleEvidence(result, text);
        RemoveUnfoundedSpecialAspects(result);
        SyncMacroLabelsToAspects(result);
        DeriveOverallFromAspects(result);
        AddCommentFlags(result);
        result.Insight = BuildTemplateInsight(result);
    }

    // --- Helpers ---------------------------------------------------------

    private static void AddToPostprocess(PredictionResult result, string key, object value)
    {
        result.Postprocess ??= [];
        if (!result.Postprocess.TryGetValue(key, out var existing))
        {
            result.Postprocess[key] = value;
        }
        else if (existing is List<object> list)
        {
            list.Add(value);
        }
    }
}
