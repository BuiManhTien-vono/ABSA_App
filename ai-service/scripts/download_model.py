"""Script to download trained ABSA model weights (best_model.pt).

Usage:
    python scripts/download_model.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
import urllib.request

# Placeholder URL for the model weight file.
# Replace with actual Google Drive, HuggingFace Hub, or direct download link.
MODEL_URL = "TODO: điền link sau khi upload"

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "models" / "visobert_absa_v8"
TARGET_FILE = MODEL_DIR / "best_model.pt"


def download_model() -> None:
    if TARGET_FILE.exists():
        print(f"Model file already exists: {TARGET_FILE}")
        return

    if "TODO" in MODEL_URL or not MODEL_URL.startswith("http"):
        print("WARNING: MODEL_URL is a placeholder.")
        print(f"Please place 'best_model.pt' manually in: {MODEL_DIR}")
        print("or set MODEL_URL in scripts/download_model.py after uploading.")
        return

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Downloading model from {MODEL_URL} ...")

    try:
        urllib.request.urlretrieve(MODEL_URL, TARGET_FILE)
        print(f"Model downloaded successfully to: {TARGET_FILE}")
    except Exception as exc:
        print(f"ERROR downloading model: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    download_model()
