// Core/TextUtils.cs - Port of text_utils.py
using System.Text.RegularExpressions;

namespace HigenAbsa.Api.Core;

public static class TextUtils
{
    private static readonly Regex ReviewPrefixPattern =
        new(@"^\s*Review\s+\d+\s*:\s*", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex WhitespacePattern =
        new(@"\s+", RegexOptions.Compiled);

    /// <summary>Clean raw review text: strip Review N: prefix and collapse whitespace.</summary>
    public static string CleanText(string text)
    {
        text = ReviewPrefixPattern.Replace(text, "");
        text = WhitespacePattern.Replace(text, " ");
        return text.Trim();
    }

    private static readonly Regex ClauseBoundaryPattern = new(
        @"[,;.!?]+|\b(?:nhưng|nhung|nhg|tuy\s+nhiên|tuy\s+nhien|mà|ma|còn|con)\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private const string TrimChars = " \t\r\n,.;:!?()[]{}\"'";

    /// <summary>Trim leading/trailing punctuation and whitespace from a text span.</summary>
    public static (int Start, int End, string Evidence) TrimSpan(string text, int start, int end)
    {
        while (start < end && TrimChars.Contains(text[start])) start++;
        while (end > start && TrimChars.Contains(text[end - 1])) end--;
        return (start, end, text[start..end]);
    }

    /// <summary>Expand a match span to clause boundaries for evidence extraction.</summary>
    public static (int Start, int End, string Evidence) ClauseSpanForMatch(string text, int matchStart, int matchEnd)
    {
        int left = 0;
        int right = text.Length;

        foreach (Match boundary in ClauseBoundaryPattern.Matches(text))
        {
            if (boundary.Index + boundary.Length <= matchStart)
            {
                left = boundary.Index + boundary.Length;
                continue;
            }
            if (boundary.Index >= matchEnd)
            {
                right = boundary.Index;
                break;
            }
        }

        var (ts, te, evidence) = TrimSpan(text, left, right);
        if (!string.IsNullOrEmpty(evidence))
            return (ts, te, evidence);

        return TrimSpan(text, matchStart, matchEnd);
    }
}
