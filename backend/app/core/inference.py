"""Inference service for HIGEN-ABSA API."""

from __future__ import annotations

import threading
from pathlib import Path
from typing import Any

import torch

from .model_bundle import ModelBundle
from .postprocess import build_result, detect_domain_overrides
from .text_utils import clean_text


class InferenceService:
    """Thread-safe inference service wrapping a trained ABSA model."""

    def __init__(
        self,
        model_dir: Path,
        device_name: str = "auto",
        batch_size: int = 16,
        model_name: str | None = None,
        no_domain_overrides: bool = False,
    ) -> None:
        if not model_dir.exists():
            raise FileNotFoundError(f"Model directory not found: {model_dir}")
        if device_name == "auto":
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = torch.device(device_name)

        self.model_dir = model_dir
        self.batch_size = batch_size
        self.no_domain_overrides = no_domain_overrides
        self.lock = threading.Lock()

        # Load model (supports single-folder format from v6+)
        if (model_dir / "label_config.json").exists():
            self.aspect_model = ModelBundle(model_dir, self.device, model_name)
            self.sentiment_model = self.aspect_model
        else:
            self.aspect_model = ModelBundle(
                model_dir / "visobert_absa_aspect_v4", self.device, model_name
            )
            self.sentiment_model = ModelBundle(
                model_dir / "visobert_absa_micro_sentiment_v4",
                self.device,
                model_name,
            )

    @property
    def model_name_str(self) -> str:
        return str(self.aspect_model.model_name)

    @property
    def max_length(self) -> int:
        return int(self.aspect_model.max_length)

    def predict_many(
        self,
        texts: list[str],
        no_domain_overrides: bool | None = None,
    ) -> list[dict[str, Any]]:
        """Run inference on a list of texts."""
        cleaned = [clean_text(text) for text in texts]
        disable_overrides = (
            self.no_domain_overrides
            if no_domain_overrides is None
            else no_domain_overrides
        )
        results: list[dict[str, Any]] = []
        with self.lock:
            for start in range(0, len(cleaned), self.batch_size):
                batch_texts = cleaned[start : start + self.batch_size]
                aspect_logits = self.aspect_model.predict(batch_texts, self.device)
                sentiment_logits = self.sentiment_model.predict(
                    batch_texts, self.device
                )
                for offset, text in enumerate(batch_texts):
                    raw_text = texts[start + offset]
                    domain_overrides = (
                        []
                        if disable_overrides
                        else detect_domain_overrides(raw_text)
                    )
                    results.append(
                        build_result(
                            raw_text=raw_text,
                            text=text,
                            aspect_logits=aspect_logits,
                            sentiment_logits=sentiment_logits,
                            aspect_model=self.aspect_model,
                            sentiment_model=self.sentiment_model,
                            row_index=offset,
                            domain_overrides=domain_overrides,
                        )
                    )
        return results

    def predict_one(
        self,
        text: str,
        no_domain_overrides: bool | None = None,
    ) -> dict[str, Any]:
        """Run inference on a single text."""
        return self.predict_many([text], no_domain_overrides)[0]
