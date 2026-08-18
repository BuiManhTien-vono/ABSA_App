"""Export the HIGEN-ABSA PyTorch model to ONNX format for C# inference."""

from __future__ import annotations

import sys
from pathlib import Path

import torch

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.core.model_bundle import MultiTaskABSA, load_json, load_state_dict


def export_onnx(
    model_dir: Path,
    output_path: Path | None = None,
    opset: int = 14,
) -> Path:
    """Export best_model.pt to best_model.onnx with dynamic axes (legacy exporter)."""
    if output_path is None:
        output_path = model_dir / "best_model.onnx"

    print(f"[INFO] Loading label config from {model_dir}")
    label_config = load_json(model_dir / "label_config.json")

    device = torch.device("cpu")
    print(f"[INFO] Loading state dict from {model_dir / 'best_model.pt'}")
    state_dict = load_state_dict(model_dir / "best_model.pt", device)

    model_name = label_config.get("model_name", "uitnlp/visobert")
    print(f"[INFO] Building MultiTaskABSA (encoder: {model_name})")
    model = MultiTaskABSA(model_name, label_config, state_dict=state_dict)
    model.load_state_dict(state_dict)
    model.eval()

    # Dummy input: batch=1, seq=32
    dummy_ids = torch.randint(4, 15000, (1, 32))
    dummy_mask = torch.ones(1, 32, dtype=torch.long)

    print(f"[INFO] Exporting to ONNX (opset={opset}, dynamo=False) -> {output_path}")
    with torch.no_grad():
        # dynamo=False forces legacy TorchScript-based exporter which embeds weights
        torch.onnx.export(
            model,
            args=(dummy_ids, dummy_mask),
            f=str(output_path),
            export_params=True,
            opset_version=opset,
            do_constant_folding=True,
            input_names=["input_ids", "attention_mask"],
            output_names=["macro", "micro", "micro_sentiment", "overall"],
            dynamic_axes={
                "input_ids":       {0: "batch_size", 1: "sequence_length"},
                "attention_mask":  {0: "batch_size", 1: "sequence_length"},
                "macro":           {0: "batch_size"},
                "micro":           {0: "batch_size"},
                "micro_sentiment": {0: "batch_size"},
                "overall":         {0: "batch_size"},
            },
            dynamo=False,
        )

    size_mb = output_path.stat().st_size / (1024 * 1024)
    print(f"[OK]   Exported -> {output_path}  ({size_mb:.1f} MB)")
    return output_path


if __name__ == "__main__":
    model_dir = Path("models/visobert_absa_v8")
    if not model_dir.exists():
        print(f"[ERROR] Model directory not found: {model_dir}")
        sys.exit(1)
    export_onnx(model_dir)
