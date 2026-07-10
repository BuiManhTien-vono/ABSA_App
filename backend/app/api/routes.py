"""API routes for HIGEN-ABSA backend."""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, HTTPException

from .schemas import BatchPredictRequest, PredictRequest

router = APIRouter()

# The inference service is injected via app.state at startup
_service = None


def get_service():
    """Get the InferenceService from module-level reference."""
    if _service is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    return _service


def set_service(service) -> None:
    """Set the inference service (called during app startup)."""
    global _service
    _service = service


def clean_texts(texts: list[str]) -> list[str]:
    cleaned = [str(text).strip() for text in texts if str(text).strip()]
    if not cleaned:
        raise HTTPException(status_code=400, detail="No non-empty text provided")
    return cleaned


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
        "domain_overrides": not svc.no_domain_overrides,
    }


@router.get("/labels")
def labels() -> dict[str, Any]:
    return get_service().aspect_model.label_config


@router.post("/predict")
def predict(request: PredictRequest) -> dict[str, Any]:
    texts = clean_texts([request.text])
    started = time.perf_counter()
    try:
        result = get_service().predict_many(texts, request.no_domain_overrides)[0]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {
        "result": result,
        "elapsed_ms": round((time.perf_counter() - started) * 1000),
        "domain_overrides": not (
            request.no_domain_overrides or get_service().no_domain_overrides
        ),
    }


@router.post("/predict/batch")
def predict_batch(request: BatchPredictRequest) -> dict[str, Any]:
    texts = clean_texts(request.texts)
    started = time.perf_counter()
    try:
        results = get_service().predict_many(texts, request.no_domain_overrides)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {
        "results": results,
        "count": len(results),
        "elapsed_ms": round((time.perf_counter() - started) * 1000),
        "domain_overrides": not (
            request.no_domain_overrides or get_service().no_domain_overrides
        ),
    }


@router.post("/api/infer")
def api_infer(payload: dict[str, Any]) -> dict[str, Any]:
    """Legacy-compatible inference endpoint."""
    started = time.perf_counter()
    if "texts" in payload:
        texts = clean_texts(payload.get("texts") or [])
        results = get_service().predict_many(texts, payload.get("no_domain_overrides"))
        return {
            "results": results,
            "elapsed_ms": round((time.perf_counter() - started) * 1000),
        }
    texts = clean_texts([payload.get("text", "")])
    result = get_service().predict_many(texts, payload.get("no_domain_overrides"))[0]
    return {
        "result": result,
        "elapsed_ms": round((time.perf_counter() - started) * 1000),
    }
