// Services/ViSoBertTokenizer.cs
// Custom SentencePiece Unigram tokenizer for ViSoBERT (XLM-RoBERTa family)
// Reads vocab from tokenizer.json and implements Viterbi-based Unigram tokenization.

using System.Text.Json;

namespace HigenAbsa.Api.Services;

/// <summary>
/// Implements the Unigram SentencePiece tokenizer used by ViSoBERT.
/// Reads vocab scores from the "model.vocab" section of tokenizer.json.
/// Pre-tokenizes using Metaspace (▁ = space prefix, WhitespaceSplit).
/// Post-processes: [BOS] tokens... [EOS] with padding.
/// </summary>
public sealed class ViSoBertTokenizer
{
    // Special token IDs
    public const int BosId = 0;   // <s>
    public const int PadId = 1;   // <pad>
    public const int EosId = 2;   // </s>
    public const int UnkId = 3;   // <unk>

    // Metaspace prefix
    private const string SpaceStr = "\u2581"; // ▁ (U+2581 LOWER ONE EIGHTH BLOCK)

    private readonly Dictionary<string, int> _vocabToId;
    private readonly float[] _vocabScores;
    private readonly string[] _idToVocab;
    private readonly int _maxLength;

    public ViSoBertTokenizer(string tokenizerJsonPath, int maxLength)
    {
        _maxLength = maxLength;

        using var stream = File.OpenRead(tokenizerJsonPath);
        var doc = JsonDocument.Parse(stream).RootElement;

        // Parse model.vocab — array of [token, score]
        var vocabArray = doc.GetProperty("model").GetProperty("vocab").EnumerateArray().ToList();
        int vocabSize = vocabArray.Count;
        _vocabToId = new Dictionary<string, int>(vocabSize);
        _vocabScores = new float[vocabSize];
        _idToVocab = new string[vocabSize];

        for (int i = 0; i < vocabSize; i++)
        {
            var entry = vocabArray[i];
            string token = entry[0].GetString()!;
            float score = (float)entry[1].GetDouble();
            _vocabToId[token] = i;
            _vocabScores[i] = score;
            _idToVocab[i] = token;
        }

        // Override scores for special tokens so they are always preferred
        foreach (var (tok, id) in new[] { ("<s>", BosId), ("<pad>", PadId), ("</s>", EosId), ("<unk>", UnkId) })
        {
            if (_vocabToId.ContainsKey(tok))
                _vocabScores[id] = 0f;
        }
    }

    /// <summary>
    /// Tokenize a single text and return (inputIds, attentionMask) without padding.
    /// BOS and EOS are included. Max content tokens = maxLength - 2.
    /// </summary>
    public (List<int> Ids, List<int> Mask) Encode(string text)
    {
        // Pre-tokenize: split on whitespace, prepend ▁
        var words = text.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var pieces = new List<int>();

        for (int wi = 0; wi < words.Length; wi++)
        {
            string word = (wi == 0 ? SpaceStr : SpaceStr) + words[wi];
            var wordIds = UnigramSegment(word);
            pieces.AddRange(wordIds);
        }

        // Truncate to maxLength - 2 (for BOS + EOS)
        int maxContent = _maxLength - 2;
        if (pieces.Count > maxContent) pieces = pieces[..maxContent];

        var ids = new List<int>(pieces.Count + 2) { BosId };
        ids.AddRange(pieces);
        ids.Add(EosId);

        var mask = Enumerable.Repeat(1, ids.Count).ToList();
        return (ids, mask);
    }

    /// <summary>
    /// Batch encode texts with padding to the longest sequence.
    /// Returns (inputIds[batch,seq], attentionMask[batch,seq]).
    /// </summary>
    public (long[,] InputIds, long[,] AttentionMask) BatchEncode(IReadOnlyList<string> texts)
    {
        var encoded = texts.Select(Encode).ToList();
        int maxLen = encoded.Max(e => e.Ids.Count);
        int batch = texts.Count;

        var inputIds = new long[batch, maxLen];
        var attMask  = new long[batch, maxLen];

        for (int i = 0; i < batch; i++)
        {
            var (ids, mask) = encoded[i];
            for (int j = 0; j < ids.Count; j++)
            {
                inputIds[i, j] = ids[j];
                attMask[i, j]  = mask[j];
            }
            for (int j = ids.Count; j < maxLen; j++)
            {
                inputIds[i, j] = PadId;
                attMask[i, j]  = 0;
            }
        }
        return (inputIds, attMask);
    }

    // -----------------------------------------------------------------------
    // Viterbi-based Unigram segmentation
    // -----------------------------------------------------------------------

    private List<int> UnigramSegment(string text)
    {
        if (string.IsNullOrEmpty(text)) return [];

        int n = text.Length;
        // best[i] = (score, start_pos_of_last_piece) for best path ending at i
        var best = new (float Score, int Prev, int TokenId)[n + 1];
        best[0] = (0f, -1, -1);
        for (int i = 1; i <= n; i++) best[i] = (float.NegativeInfinity, -1, -1);

        for (int i = 0; i < n; i++)
        {
            if (best[i].Score == float.NegativeInfinity) continue;
            // Try all substrings starting at i
            for (int j = i + 1; j <= n; j++)
            {
                var sub = text[i..j];
                if (_vocabToId.TryGetValue(sub, out int tokenId))
                {
                    float score = best[i].Score + _vocabScores[tokenId];
                    if (score > best[j].Score)
                        best[j] = (score, i, tokenId);
                }
            }
        }

        // If no path found, fall back to character-level with <unk>
        if (best[n].Score == float.NegativeInfinity)
        {
            return Enumerable.Repeat(UnkId, n).ToList();
        }

        // Backtrack
        var result = new List<int>();
        int pos = n;
        while (pos > 0)
        {
            var (_, prev, tokenId) = best[pos];
            if (tokenId < 0) break;
            result.Add(tokenId);
            pos = prev;
        }
        result.Reverse();
        return result;
    }
}
