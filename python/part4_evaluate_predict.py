from pathlib import Path
import argparse
import torch
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description="Evaluate and test a custom YOLO11 detector")
    parser.add_argument("--data", type=Path, default=ROOT / "data.yaml")
    parser.add_argument("--model-path-file", type=Path, default=ROOT / "trained_model.txt")
    parser.add_argument("--source", type=Path, default=ROOT / "dataset" / "images" / "test")
    parser.add_argument("--report", type=Path, default=ROOT / "part4_metrics.txt")
    parser.add_argument("--run-prefix", default="")
    parser.add_argument("--no-display", action="store_true")
    args = parser.parse_args()
    marker = args.model_path_file
    if not marker.exists():
        raise FileNotFoundError("Complete Part 3 first.")
    model = YOLO(marker.read_text(encoding="utf-8").strip())
    reports = []
    for split in ("val", "test"):
        metrics = model.val(
            data=str(args.data.resolve()),
            split=split,
            imgsz=640,
            batch=4,
            workers=0,
            device=0 if torch.cuda.is_available() else "cpu",
            project=str(ROOT / "runs" / "detect"),
            name=f"{args.run_prefix}evaluate_{split}",
            plots=True,
        )
        reports.append(
            f"{split.upper()}\nPrecision: {metrics.box.mp:.4f}\n"
            f"Recall: {metrics.box.mr:.4f}\nmAP50: {metrics.box.map50:.4f}\n"
            f"mAP50-95: {metrics.box.map:.4f}\n"
        )
    report = "\n".join(reports)
    print(report)
    args.report.write_text(report, encoding="utf-8")
    # Use held-out photos so the example runs without needing another image.
    results = model.predict(
        source=str(args.source.resolve()),
        conf=0.25,
        save=True,
        project=str(ROOT / "runs" / "detect"),
        name=f"{args.run_prefix}predictions",
    )
    for result in results:
        print(f"{Path(result.path).name}: {len(result.boxes)} detections")
    if results and not args.no_display:
        results[0].show()
    # For another image or video after training, use:
    # model.predict(source="new_image.jpg", conf=0.25, save=True, show=True)
    # model.predict(source="new_video.mp4", conf=0.25, save=True, show=True)


if __name__ == "__main__":
    main()
