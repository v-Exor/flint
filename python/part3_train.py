from pathlib import Path
import argparse
import torch
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent
MAX_EPOCHS = 10


def main():
    parser = argparse.ArgumentParser(description="Train a custom YOLO11 detector for at most 10 epochs")
    parser.add_argument("--data", type=Path, default=ROOT / "data.yaml")
    parser.add_argument("--epochs", type=int, default=MAX_EPOCHS,
                        help="Number of epochs: 1 to 10 (default: 10; maximum: 10)")
    parser.add_argument("--name", default="train")
    parser.add_argument("--model-path-file", type=Path, default=ROOT / "trained_model.txt")
    args = parser.parse_args()
    if not 1 <= args.epochs <= MAX_EPOCHS:
        parser.error(f"--epochs must be between 1 and {MAX_EPOCHS}; the maximum allowed is {MAX_EPOCHS}")
    if not args.data.exists():
        raise FileNotFoundError("Complete Part 2 first.")
    print(f"Training for {args.epochs} epochs (maximum allowed: {MAX_EPOCHS}).", flush=True)
    model = YOLO(str(ROOT / "yolo11n.pt"))
    model.train(
        data=str(args.data.resolve()),
        epochs=args.epochs,
        patience=args.epochs,
        imgsz=640,
        batch=4,
        workers=0,
        device=0 if torch.cuda.is_available() else "cpu",
        project=str(ROOT / "runs" / "detect"),
        name=args.name,
        seed=42,
        plots=True,
    )
    best = Path(model.trainer.best)
    args.model_path_file.write_text(str(best.resolve()), encoding="utf-8")
    print(f"Best model: {best}")


if __name__ == "__main__":
    main()
