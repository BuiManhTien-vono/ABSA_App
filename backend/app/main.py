"""FastAPI application entry point for HIGEN-ABSA."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import routes
from .config import BATCH_SIZE, DEVICE, MODEL_DIR, MODEL_NAME, NO_DOMAIN_OVERRIDES
from .core.inference import InferenceService


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
    title="HIGEN-ABSA API",
    version="1.0.0",
    description=(
        "Hierarchical Insight Generation for Vietnamese E-commerce "
        "Aspect-Based Sentiment Analysis"
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router)
