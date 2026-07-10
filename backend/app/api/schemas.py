"""Pydantic request/response schemas for the ABSA API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    text: str = Field(..., min_length=1)
    no_domain_overrides: bool | None = None


class BatchPredictRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1)
    no_domain_overrides: bool | None = None
