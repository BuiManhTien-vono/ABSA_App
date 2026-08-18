// Services/ModelBundle.cs - ONNX model loading with custom ViSoBERT tokenizer
using System.Text.Json;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;

namespace HigenAbsa.Api.Services;

/// <summary>Label configuration loaded from label_config.json.</summary>
public class LabelConfig
{
    public List<string> Macros { get; set; } = [];
    public List<string> Micros { get; set; } = [];
    public List<string> Sentiments { get; set; } = [];
    public List<string> MicroSentiments { get; set; } = [];
    public List<string> Overalls { get; set; } = [];
    public string ModelName { get; set; } = "uitnlp/visobert";
    public int MaxLength { get; set; } = 256;
}

/// <summary>
/// Loads and wraps a trained HIGEN-ABSA ONNX model with its tokenizer and config.
/// </summary>
public sealed class ModelBundle : IDisposable
{
    private readonly InferenceSession _session;
    private readonly ViSoBertTokenizer _tokenizer;
    private bool _disposed;

    public LabelConfig LabelConfig { get; }
    public string ModelName { get; }
    public int MaxLength { get; }
    public float[] MacroThresholds { get; }
    public float[] MicroThresholds { get; }
    public float[] MicroSentimentThresholds { get; }

    public ModelBundle(AbsaOptions options, ILogger<ModelBundle> logger)
    {
        var modelDir = options.ModelDir;
        if (!Directory.Exists(modelDir))
            throw new DirectoryNotFoundException($"Model directory not found: {modelDir}");

        // Load label config
        var labelJson = File.ReadAllText(Path.Combine(modelDir, "label_config.json"));
        LabelConfig = DeserializeLabelConfig(labelJson);
        ModelName = LabelConfig.ModelName;
        MaxLength = LabelConfig.MaxLength;

        // Load thresholds
        var threshJson = File.ReadAllText(Path.Combine(modelDir, "thresholds.json"));
        var thresholds = JsonDocument.Parse(threshJson).RootElement;
        MacroThresholds          = BuildThresholdArray(thresholds, "macro",           LabelConfig.Macros);
        MicroThresholds          = BuildThresholdArray(thresholds, "micro",           LabelConfig.Micros);
        MicroSentimentThresholds = BuildThresholdArray(thresholds, "micro_sentiment", LabelConfig.MicroSentiments);

        // Load tokenizer (custom SentencePiece Unigram)
        var tokenizerJsonPath = Path.Combine(modelDir, "tokenizer", "tokenizer.json");
        logger.LogInformation("Loading tokenizer from {Path}", tokenizerJsonPath);
        _tokenizer = new ViSoBertTokenizer(tokenizerJsonPath, MaxLength);

        // Load ONNX model
        var onnxPath = Path.Combine(modelDir, "best_model.onnx");
        if (!File.Exists(onnxPath))
            throw new FileNotFoundException(
                $"ONNX model not found: {onnxPath}. Run 'python export_onnx.py' in the backend/ directory first.");

        logger.LogInformation("Loading ONNX model from {Path} ({SizeMB:F1} MB)",
            onnxPath, new FileInfo(onnxPath).Length / (1024.0 * 1024.0));

        var sessionOpts = new Microsoft.ML.OnnxRuntime.SessionOptions();
        sessionOpts.GraphOptimizationLevel = GraphOptimizationLevel.ORT_ENABLE_ALL;
        _session = new InferenceSession(onnxPath, sessionOpts);

        logger.LogInformation("Model loaded. Inputs: {Inputs}", string.Join(", ", _session.InputNames));
    }

    /// <summary>
    /// Tokenize and run inference for a batch of texts.
    /// Returns dict: {macro, micro, micro_sentiment, overall} → float[batch][classes]
    /// </summary>
    public Dictionary<string, float[][]> Predict(IReadOnlyList<string> texts)
    {
        var (inputIds, attentionMask) = _tokenizer.BatchEncode(texts);
        int batch  = texts.Count;
        int seqLen = inputIds.GetLength(1);

        var inputIdsTensor = new DenseTensor<long>(Flatten2D(inputIds, batch, seqLen), [batch, seqLen]);
        var attentionMaskTensor = new DenseTensor<long>(Flatten2D(attentionMask, batch, seqLen), [batch, seqLen]);

        var inputs = new List<NamedOnnxValue>
        {
            NamedOnnxValue.CreateFromTensor("input_ids",      inputIdsTensor),
            NamedOnnxValue.CreateFromTensor("attention_mask", attentionMaskTensor),
        };

        using var outputs = _session.Run(inputs);

        var result = new Dictionary<string, float[][]>();
        foreach (var output in outputs)
        {
            var tensor = output.AsTensor<float>();
            int rows = tensor.Dimensions[0];
            int cols = tensor.Dimensions[1];
            var data  = tensor.ToArray();
            var matrix = new float[rows][];
            for (int i = 0; i < rows; i++)
            {
                matrix[i] = new float[cols];
                Array.Copy(data, i * cols, matrix[i], 0, cols);
            }
            result[output.Name] = matrix;
        }
        return result;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private static long[] Flatten2D(long[,] arr, int rows, int cols)
    {
        var flat = new long[rows * cols];
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < cols; j++)
                flat[i * cols + j] = arr[i, j];
        return flat;
    }

    private static LabelConfig DeserializeLabelConfig(string json)
    {
        var doc = JsonDocument.Parse(json).RootElement;
        return new LabelConfig
        {
            Macros          = ReadStringList(doc, "macros"),
            Micros          = ReadStringList(doc, "micros"),
            Sentiments      = ReadStringList(doc, "sentiments"),
            MicroSentiments = ReadStringList(doc, "micro_sentiments"),
            Overalls        = ReadStringList(doc, "overalls"),
            ModelName       = doc.TryGetProperty("model_name", out var mn) ? mn.GetString()! : "uitnlp/visobert",
            MaxLength       = doc.TryGetProperty("max_length",  out var ml) ? ml.GetInt32() : 256,
        };
    }

    private static List<string> ReadStringList(JsonElement doc, string key) =>
        doc.TryGetProperty(key, out var prop)
            ? prop.EnumerateArray().Select(e => e.GetString()!).ToList()
            : [];

    private static float[] BuildThresholdArray(JsonElement thresholds, string key, List<string> labels)
    {
        var arr = new float[labels.Count];
        if (!thresholds.TryGetProperty(key, out var section)) { arr.AsSpan().Fill(0.5f); return arr; }
        for (int i = 0; i < labels.Count; i++)
            arr[i] = section.TryGetProperty(labels[i], out var v) ? v.GetSingle() : 0.5f;
        return arr;
    }

    public void Dispose()
    {
        if (_disposed) return;
        _session.Dispose();
        _disposed = true;
    }
}
