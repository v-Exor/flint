"""Export copied lab checkpoints; writes only inside this website project."""
from pathlib import Path
import json
import os
import sys

ROOT = Path(__file__).resolve().parents[1]
local_deps = ROOT / '.export-deps'
if local_deps.exists():
    sys.path.insert(0, str(local_deps))
os.environ.setdefault('YOLO_CONFIG_DIR', str(ROOT / 'artifacts'))
os.environ.setdefault('YOLO_AUTOINSTALL', 'false')
from ultralytics import YOLO


def main():
    definitions = []
    for identifier, filename, title in [
        ('pretrained', 'yolo11n.pt', 'YOLO11 nano · COCO pretrained'),
        ('custom', 'cats-dogs-best.pt', 'YOLO11 nano · custom cats & dogs'),
    ]:
        path = ROOT / 'assets' / 'models' / filename
        model = YOLO(str(path))
        exported = model.export(format='onnx', imgsz=640, batch=1,
                                dynamic=False, simplify=False, opset=17,
                                nms=False, device='cpu')
        definitions.append({
            'id': identifier, 'title': title,
            'url': f'./assets/models/{Path(exported).name}',
            'inputSize': 640, 'labels': list(model.names.values()),
            'bytes': Path(exported).stat().st_size,
        })
    (ROOT / 'assets' / 'models' / 'manifest.json').write_text(
        json.dumps(definitions, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
