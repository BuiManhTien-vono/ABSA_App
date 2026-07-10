"""Configuration management for HIGEN-ABSA backend."""

from __future__ import annotations

import os
from pathlib import Path


def bool_env(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


# Paths
BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
DEFAULT_MODEL_DIR = BASE_DIR / "models" / "visobert_absa_v8"

# Settings from environment
MODEL_DIR = Path(os.getenv("ABSA_MODEL_DIR", str(DEFAULT_MODEL_DIR))).resolve()
DEVICE = os.getenv("ABSA_DEVICE", "auto")
BATCH_SIZE = int(os.getenv("ABSA_BATCH_SIZE", "16"))
MODEL_NAME = os.getenv("ABSA_MODEL_NAME") or None
NO_DOMAIN_OVERRIDES = bool_env("ABSA_NO_DOMAIN_OVERRIDES", False)

# Server
HOST = os.getenv("ABSA_HOST", "0.0.0.0")
PORT = int(os.getenv("ABSA_PORT", "8000"))
