"""Quick smoke test for HIGEN-ABSA inference pipeline."""
from pathlib import Path
import torch
from app.core.inference import InferenceService

print("Loading model...")
svc = InferenceService(
    model_dir=Path("models/visobert_absa_v8"),
    device_name="cpu",
    batch_size=4,
)
print("Model loaded!")

text = "San pham rat tot, giao hang nhanh, chinh hang, gia hop ly!"
print(f"\nTest text: {text}")
result = svc.predict_one(text)

print("\n=== RESULT ===")
print("Overall:", result["overall_sentiment"])
print("Spam:", result.get("spam"))
print("Intent QA:", result.get("intent_qa"))
print("\nAspect sentiments:")
for a in result["aspect_sentiments"]:
    print(f"  [{a['macro']}] {a['micro']} -> {a['sentiment']} (score={a['sentiment_score']})")
print("\nInsight:", result["insight"]["customer_insight"])
print("Status: ALL OK")
