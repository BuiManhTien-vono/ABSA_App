"""FastAPI application entry point for HIGEN-ABSA AI Service."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import routes
from .config import (
    BATCH_SIZE,
    DEVICE,
    INTERNAL_TOKEN,
    MODEL_DIR,
    MODEL_NAME,
    NO_DOMAIN_OVERRIDES,
)
from .core.inference import InferenceService
from .middleware import InternalTokenMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the inference service on startup."""
    service = InferenceService(
        model_dir=MODEL_DIR,
        device_name=DEVICE,
        batch_size=BATCH_SIZE,
        model_name=MODEL_NAME,
        no_domain_overrides=NO_DOMAIN_OVERRIDES,
    )
    app.state.service = service
    routes.set_service(service)
    yield


app = FastAPI(
    title="AI Service - HIGEN-ABSA",
    version="2.0.0",
    description=(
        "Internal AI/NLP service for Vietnamese E-commerce "
        "Aspect-Based Sentiment Analysis. "
        "This service is intended to be called only by backend-java."
    ),
    lifespan=lifespan,
)

# Internal token authentication middleware
app.add_middleware(InternalTokenMiddleware, token=INTERNAL_TOKEN)

# CORS — restrict to backend-java only (not public)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Internal-Token"],
)

app.include_router(routes.router)
