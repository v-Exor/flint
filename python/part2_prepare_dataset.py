from pathlib import Path
import hashlib
import json
import random
import shutil
from urllib.request import urlopen
from urllib.error import HTTPError, URLError
import zipfile

import cv2

ROOT = Path(__file__).resolve().parent
CLASSES = ["cat", "dog"]
EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def download_example_photos():
    # The original mledu URL can return 403; try the public course mirror first.
    urls = [
        "https://storage.googleapis.com/tensorflow-1-public/course2/cats_and_dogs_filtered.zip",
        "https://storage.googleapis.com/mledu-datasets/cats_and_dogs_filtered.zip",
    ]
    archive = ROOT / "cats_and_dogs_filtered.zip"
    if not archive.exists():
        print("Downloading the cat/dog photo archive (about 69 MB)...")
        partial = archive.with_suffix(".zip.part")
        for url in urls:
            try:
                with urlopen(url, timeout=60) as response, partial.open("wb") as target:
                    shutil.copyfileobj(response, target)
                break
            except (HTTPError, URLError) as error:
                print(f"Photo download failed: {error}")
        else:
            raise RuntimeError("Photo sources unavailable. Save photos in raw_images/cat and raw_images/dog.")
        partial.replace(archive)
    with zipfile.ZipFile(archive) as collection:
        for name in CLASSES:
            folder = ROOT / "raw_images" / name
            folder.mkdir(parents=True, exist_ok=True)
            prefix = f"cats_and_dogs_filtered/train/{name}s/"
            choices = sorted(p for p in collection.namelist()
                             if p.startswith(prefix) and p.endswith(".jpg"))
            selected = random.Random(42).sample(choices, 30)
            for entry in selected:
                (folder / Path(entry).name).write_bytes(collection.read(entry))


def main():
    dataset = ROOT / "dataset"
    if (ROOT / "data.yaml").exists():
        raise SystemExit("data.yaml already exists. Keep your completed dataset or use a new project folder.")
    if not any(path.is_file() and path.suffix.lower() in EXTENSIONS
               for name in CLASSES for path in (ROOT / "raw_images" / name).glob("*")):
        download_example_photos()
    samples, seen = {}, set()
    for name in CLASSES:
        folder = ROOT / "raw_images" / name
        folder.mkdir(parents=True, exist_ok=True)
        samples[name] = []
        for path in sorted(folder.iterdir()):
            if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
                continue
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
            if digest not in seen:
                seen.add(digest)
                samples[name].append(path)
    for name, paths in samples.items():
        if len(paths) < 10:
            raise SystemExit(f"Put at least 10 different {name} photos in raw_images/{name}, then run again.")
    for split in ("train", "val", "test"):
        (dataset / "images" / split).mkdir(parents=True, exist_ok=True)
        (dataset / "labels" / split).mkdir(parents=True, exist_ok=True)

    rng = random.Random(42)
    for class_id, name in enumerate(CLASSES):
        paths = samples[name]
        rng.shuffle(paths)
        train_end = int(len(paths) * 0.7)
        val_end = train_end + int(len(paths) * 0.2)
        for index, source in enumerate(paths):
            split = "train" if index < train_end else "val" if index < val_end else "test"
            stem = f"{name}_{hashlib.sha256(source.read_bytes()).hexdigest()}"
            image_path = dataset / "images" / split / f"{stem}.jpg"
            label_path = dataset / "labels" / split / f"{stem}.txt"
            if image_path.exists() and label_path.exists():
                continue  # Resume an interrupted annotation session.
            image = cv2.imread(str(source))
            if image is None:
                raise RuntimeError(f"Cannot read {source}; replace it with a valid photo.")
            height, width = image.shape[:2]
            scale = min(1.0, 1000 / width, 700 / height)
            preview = cv2.resize(image, (max(1, round(width * scale)), max(1, round(height * scale))))
            title = f"{name}: box EVERY {name}; ENTER after each box; ESC when finished"
            boxes = cv2.selectROIs(title, preview, showCrosshair=True, fromCenter=False)
            cv2.destroyAllWindows()
            if len(boxes) == 0:
                raise SystemExit("No boxes selected. Run again to resume and annotate this image.")
            display_h, display_w = preview.shape[:2]
            lines = []
            for x, y, w, h in boxes:
                if w > 0 and h > 0:
                    lines.append(f"{class_id} {(x+w/2)/display_w:.6f} {(y+h/2)/display_h:.6f} {w/display_w:.6f} {h/display_h:.6f}")
            if not lines:
                raise SystemExit("No valid boxes selected. Run again to resume.")
            if not cv2.imwrite(str(image_path), image):
                raise RuntimeError(f"Cannot save {image_path}")
            label_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    yaml = (f"path: {json.dumps(dataset.as_posix())}\n"
            "train: images/train\nval: images/val\ntest: images/test\n"
            "nc: 2\nnames: ['cat', 'dog']\n")
    (ROOT / "data.yaml").write_text(yaml, encoding="utf-8")
    print("Dataset ready: approximately 70% training, 20% validation, 10% testing per class.")


if __name__ == "__main__":
    main()
