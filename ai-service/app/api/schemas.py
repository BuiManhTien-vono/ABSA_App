"""Pydantic request/response schemas for the AI Service internal API."""

from __future__ import annotations

from pydantic import BaseModel, Field


# ─── Request Schemas ───────────────────────────────────────────────────────────

class ClassifyRequest(BaseModel):
    """Single review classification request."""
    reviewId: int
    content: str = Field(..., min_length=1)


class ClassifyItem(BaseModel):
    """A single item in a batch classification request."""
    reviewId: int
    content: str = Field(..., min_length=1)


class ClassifyBatchRequest(BaseModel):
    """Batch review classification request."""
    items: list[ClassifyItem] = Field(..., min_length=1)


# ─── Response Schemas ──────────────────────────────────────────────────────────

class AspectResult(BaseModel):
    """A single aspect sentiment result."""
    aspect: str
    sentiment: str          # "positive" | "neutral" | "negative"
    confidenceScore: float


class ClassifyResponse(BaseModel):
    """Single review classification response."""
    reviewId: int
    aspects: list[AspectResult]


class ClassifyBatchResponse(BaseModel):
    """Batch review classification response."""
    results: list[ClassifyResponse]
