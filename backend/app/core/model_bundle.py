"""Model loading and inference bundle for HIGEN-ABSA multi-task ViSoBERT model."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import torch
import torch.nn as nn
from transformers import AutoConfig, AutoModel, AutoTokenizer, XLMRobertaConfig


# ---------------------------------------------------------------------------
# Math helpers
# ---------------------------------------------------------------------------

def sigmoid(logits: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-logits))


def softmax(logits: np.ndarray) -> np.ndarray:
    logits = logits - logits.max(axis=1, keepdims=True)
    exp = np.exp(logits)
    return exp / exp.sum(axis=1, keepdims=True)


def round_float(value: float) -> float:
    return round(float(value), 4)


# ---------------------------------------------------------------------------
# JSON helpers
# ---------------------------------------------------------------------------

def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# Config inference for offline-only loading
# ---------------------------------------------------------------------------

def infer_xlm_roberta_config(state_dict: dict[str, torch.Tensor]) -> XLMRobertaConfig:
    word_embeddings = state_dict["encoder.embeddings.word_embeddings.weight"]
    position_embeddings = state_dict["encoder.embeddings.position_embeddings.weight"]
    token_type_embeddings = state_dict["encoder.embeddings.token_type_embeddings.weight"]
    intermediate = state_dict["encoder.encoder.layer.0.intermediate.dense.weight"]
    hidden_size = int(word_embeddings.shape[1])
    if hidden_size % 64 == 0:
        num_attention_heads = hidden_size // 64
    else:
        num_attention_heads = next(
            heads for heads in (16, 12, 8, 6, 4, 2, 1) if hidden_size % heads == 0
        )
    layer_indices = {
        int(key.split(".")[3])
        for key in state_dict
        if key.startswith("encoder.encoder.layer.")
    }
    return XLMRobertaConfig(
        vocab_size=int(word_embeddings.shape[0]),
        hidden_size=hidden_size,
        num_hidden_layers=len(layer_indices),
        num_attention_heads=num_attention_heads,
        intermediate_size=int(intermediate.shape[0]),
        max_position_embeddings=int(position_embeddings.shape[0]),
        type_vocab_size=int(token_type_embeddings.shape[0]),
        pad_token_id=1,
        bos_token_id=0,
        eos_token_id=2,
        layer_norm_eps=1e-5,
    )


def load_encoder_config(
    model_name: str, state_dict: dict[str, torch.Tensor] | None
) -> Any:
    try:
        return AutoConfig.from_pretrained(model_name, local_files_only=True)
    except Exception:
        if state_dict is None:
            return AutoConfig.from_pretrained(model_name)
        return infer_xlm_roberta_config(state_dict)


# ---------------------------------------------------------------------------
# Multi-task ABSA model architecture
# ---------------------------------------------------------------------------

class MultiTaskABSA(nn.Module):
    """ViSoBERT-based multi-task model with 4 heads:
    macro, micro, micro_sentiment, and overall.
    """

    def __init__(
        self,
        model_name: str,
        label_config: dict[str, Any],
        state_dict: dict[str, torch.Tensor] | None = None,
        dropout: float = 0.2,
    ):
        super().__init__()
        config = load_encoder_config(model_name, state_dict)
        self.encoder = AutoModel.from_config(config)
        hidden = config.hidden_size
        self.dropout = nn.Dropout(dropout)
        self.macro_head = nn.Linear(hidden, len(label_config["macros"]))
        self.micro_head = nn.Linear(hidden, len(label_config["micros"]))
        self.micro_sentiment_head = nn.Linear(hidden, len(label_config["micro_sentiments"]))
        self.overall_head = nn.Linear(hidden, len(label_config["overalls"]))

    def forward(self, input_ids, attention_mask=None, token_type_ids=None):
        kwargs = {"input_ids": input_ids, "attention_mask": attention_mask}
        if token_type_ids is not None:
            kwargs["token_type_ids"] = token_type_ids
        outputs = self.encoder(**kwargs)
        if hasattr(outputs, "pooler_output") and outputs.pooler_output is not None:
            pooled = outputs.pooler_output
        else:
            pooled = outputs.last_hidden_state[:, 0]
        pooled = self.dropout(pooled)
        return {
            "macro": self.macro_head(pooled),
            "micro": self.micro_head(pooled),
            "micro_sentiment": self.micro_sentiment_head(pooled),
            "overall": self.overall_head(pooled),
        }


# ---------------------------------------------------------------------------
# State dict loading
# ---------------------------------------------------------------------------

def load_state_dict(path: Path, device: torch.device) -> dict[str, torch.Tensor]:
    try:
        state = torch.load(path, map_location=device, weights_only=True)
    except TypeError:
        state = torch.load(path, map_location=device)
    if any(key.startswith("module.") for key in state):
        state = {key.removeprefix("module."): value for key, value in state.items()}
    return state


def threshold_array(thresholds: dict[str, Any], key: str, labels: list[str]) -> np.ndarray:
    label_thresholds = thresholds.get(key, {})
    return np.array(
        [float(label_thresholds.get(label, 0.5)) for label in labels],
        dtype=np.float32,
    )


# ---------------------------------------------------------------------------
# ModelBundle: wraps model + tokenizer + config for inference
# ---------------------------------------------------------------------------

class ModelBundle:
    """Loads and wraps a trained HIGEN-ABSA model for inference."""

    def __init__(
        self,
        model_dir: Path,
        device: torch.device,
        model_name: str | None = None,
    ):
        self.model_dir = model_dir
        self.label_config = load_json(model_dir / "label_config.json")
        self.thresholds = load_json(model_dir / "thresholds.json")
        self.model_name = model_name or self.label_config.get("model_name", "uitnlp/visobert")
        self.max_length = int(self.label_config.get("max_length", 192))
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_dir / "tokenizer", use_fast=False
        )

        state_dict = load_state_dict(model_dir / "best_model.pt", device)
        self.model = MultiTaskABSA(
            self.model_name, self.label_config, state_dict=state_dict
        )
        self.model.load_state_dict(state_dict)
        self.model.to(device)
        self.model.eval()

        self.macro_thresholds = threshold_array(
            self.thresholds, "macro", self.label_config["macros"]
        )
        self.micro_thresholds = threshold_array(
            self.thresholds, "micro", self.label_config["micros"]
        )
        self.micro_sentiment_thresholds = threshold_array(
            self.thresholds, "micro_sentiment", self.label_config["micro_sentiments"]
        )

    @torch.no_grad()
    def predict(self, texts: list[str], device: torch.device) -> dict[str, np.ndarray]:
        encoded = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=self.max_length,
            return_tensors="pt",
        )
        encoded = {key: value.to(device) for key, value in encoded.items()}
        outputs = self.model(
            input_ids=encoded["input_ids"],
            attention_mask=encoded.get("attention_mask"),
            token_type_ids=encoded.get("token_type_ids"),
        )
        return {key: value.detach().cpu().numpy() for key, value in outputs.items()}
