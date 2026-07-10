"""Text cleaning and normalization utilities for HIGEN-ABSA."""

from __future__ import annotations

import re


def clean_text(text: str) -> str:
    """Clean raw review text for model inference.

    Strips leading 'Review N:' prefixes and collapses whitespace.
    """
    text = re.sub(r"^\s*Review\s+\d+\s*:\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def trim_span(text: str, start: int, end: int) -> tuple[int, int, str]:
    """Trim leading/trailing punctuation and whitespace from a text span."""
    trim_chars = " \t\r\n,.;:!?()[]{}\"'"
    while start < end and text[start] in trim_chars:
        start += 1
    while end > start and text[end - 1] in trim_chars:
        end -= 1
    return start, end, text[start:end]


CLAUSE_BOUNDARY_PATTERN = re.compile(
    r"[,;.!?]+|\b(?:nhưng|nhung|nhg|tuy\s+nhiên|tuy\s+nhien|mà|ma|còn|con)\b",
    re.IGNORECASE,
)


def clause_span_for_match(text: str, start: int, end: int) -> tuple[int, int, str]:
    """Expand a match span to clause boundaries for better evidence extraction."""
    left = 0
    right = len(text)
    for boundary in CLAUSE_BOUNDARY_PATTERN.finditer(text):
        if boundary.end() <= start:
            left = boundary.end()
            continue
        if boundary.start() >= end:
            right = boundary.start()
            break
    left, right, evidence = trim_span(text, left, right)
    if evidence:
        return left, right, evidence
    return trim_span(text, start, end)
