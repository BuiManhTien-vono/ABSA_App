"""Internal API routes for HIGEN-ABSA AI Service."""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, HTTPException

from .schemas import (
    AspectResult,
    ClassifyBatchRequest,
    ClassifyBatchResponse,
    ClassifyRequest,
    ClassifyResponse,
)

router = APIRouter()

# The inference service is injected via app.state at startup
_service = None

# Sentiment label mapping from model output → standard labels
_SENTIMENT_MAP = {
    "POS": "positive",
    "NEG": "negative",
    "NEU": "neutral",
    "positive": "positive",
    "negative": "negative",
    "neutral": "neutral",
}


def get_service():
    """Get the InferenceService from module-level reference."""
    if _service is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    return _service


def set_service(service) -> None:
    """Set the inference service (called during app startup)."""
    global _service
    _service = service


def _map_result_to_aspects(result: dict[str, Any]) -> list[AspectResult]:
    """Map the raw ABSA model output to a list of AspectResult.

    The model returns `aspect_sentiments` where each entry has:
      - micro: aspect name (e.g. "Chất_lượng_sản_phẩm")
      - sentiment: "POS" / "NEG" / "NEU"
      - aspect_score: float confidence
    We map these to the standardized AspectResult format.
    """
    aspects: list[AspectResult] = []
    for asp in result.get("aspect_sentiments", []):
        micro_label = asp.get("micro", "unknown")
        # Make aspect label human-readable: replace underscores, lowercase
        aspect_name = micro_label.replace("_", " ").strip()

        raw_sentiment = asp.get("sentiment", "NEU")
        sentiment = _SENTIMENT_MAP.get(raw_sentiment, "neutral")

        # Use aspect_score as confidence; fall back to sentiment_score
        confidence = asp.get("aspect_score", asp.get("sentiment_score", 0.0))
        if isinstance(confidence, (int, float)):
            confidence = round(float(confidence), 4)
        else:
            confidence = 0.0

        aspects.append(AspectResult(
            aspect=aspect_name,
            sentiment=sentiment,
            confidenceScore=confidence,
        ))

    return aspects


@router.get("/health")
def health() -> dict[str, Any]:
    svc = get_service()
    return {
        "status": "ok",
        "model_dir": str(svc.model_dir),
        "model_name": svc.model_name_str,
        "max_length": svc.max_length,
        "device": str(svc.device),
        "batch_size": svc.batch_size,
    }


@router.post("/internal/classify", response_model=ClassifyResponse)
def classify(request: ClassifyRequest) -> ClassifyResponse:
    """Classify a single review and return aspect-level sentiments."""
    content = request.content.strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content must not be empty")

    started = time.perf_counter()
    try:
        result = get_service().predict_one(content)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    aspects = _map_result_to_aspects(result)
    elapsed = round((time.perf_counter() - started) * 1000)

    return ClassifyResponse(
        reviewId=request.reviewId,
        aspects=aspects,
    )


@router.post("/internal/classify-batch", response_model=ClassifyBatchResponse)
def classify_batch(request: ClassifyBatchRequest) -> ClassifyBatchResponse:
    """Classify a batch of reviews and return aspect-level sentiments."""
    texts = [item.content.strip() for item in request.items]
    if not texts or not any(texts):
        raise HTTPException(status_code=400, detail="No non-empty content provided")

    started = time.perf_counter()
    try:
        results = get_service().predict_many(texts)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    responses: list[ClassifyResponse] = []
    for item, result in zip(request.items, results):
        aspects = _map_result_to_aspects(result)
        responses.append(ClassifyResponse(
            reviewId=item.reviewId,
            aspects=aspects,
        ))

    return ClassifyBatchResponse(results=responses)
