from pathlib import Path
from time import perf_counter
import argparse

import cv2
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent


def main():
    parser = argparse.ArgumentParser(description="YOLO11 webcam detection")
    parser.add_argument("--camera", type=int, default=0)
    parser.add_argument("--max-frames", type=int, default=0,
                        help="Stop after this many frames; 0 runs until Q is pressed.")
    parser.add_argument("--no-display", action="store_true")
    args = parser.parse_args()
    model = YOLO(str(ROOT / "yolo11n.pt"))
    camera = cv2.VideoCapture(args.camera)
    if not camera.isOpened():
        raise RuntimeError("Cannot open webcam. Close other camera apps or try camera index 1.")
    frames, elapsed = 0, 0.0
    try:
        while True:
            ok, frame = camera.read()
            if not ok:
                break
            start = perf_counter()
            result = model.predict(frame, conf=0.25, imgsz=640, verbose=False)[0]
            duration = perf_counter() - start
            annotated = result.plot()
            cv2.putText(annotated, f"Detection FPS: {1 / duration:.1f}",
                        (15, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            if not args.no_display:
                cv2.imshow("YOLO11 - Q: quit, S: screenshot", annotated)
            frames += 1
            if frames > 5:  # Exclude the first five warm-up frames.
                elapsed += duration
            key = cv2.waitKey(1) & 0xFF if not args.no_display else 255
            if key == ord("s"):
                cv2.imwrite(str(ROOT / "part1_detection.jpg"), annotated)
            if key == ord("q"):
                break
            if args.max_frames and frames >= args.max_frames:
                break
    finally:
        camera.release()
        cv2.destroyAllWindows()
    if frames > 5 and elapsed:
        report = f"Average detection FPS (excluding display/capture): {(frames - 5) / elapsed:.2f}\n"
        (ROOT / "part1_speed.txt").write_text(report, encoding="utf-8")
        print(report)


if __name__ == "__main__":
    main()
