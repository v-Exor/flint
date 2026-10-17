"""Copy genuine Lab 6 outputs and create the site's data/download assets."""
from pathlib import Path
import csv
import hashlib
import json
import re
import shutil
import zipfile
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'C:\Users\Admin\Desktop\Lab6')
MODEL = Path((SOURCE / 'trained_model.txt').read_text().strip())
RUN = MODEL.parent.parent


def main():
    records = []
    for split in ('train', 'val', 'test'):
        for path in sorted((SOURCE / 'dataset' / 'images' / split).glob('*.jpg')):
            label_path = SOURCE / 'dataset' / 'labels' / split / (path.stem + '.txt')
            labels = [[float(v) for v in line.split()] for line in label_path.read_text().splitlines() if line.strip()]
            species = path.name.split('_')[0]
            identifier = f'{species}-{sum(r["species"] == species for r in records) + 1:02}'
            target = ROOT / 'assets' / 'samples' / f'{identifier}.jpg'
            shutil.copyfile(path, target)
            width, height = Image.open(path).size
            saved_prediction = SOURCE / 'runs' / 'detect' / 'predictions' / path.name
            prediction = None
            if split == 'test' and saved_prediction.exists():
                prediction = f'./assets/results/{identifier}-prediction.jpg'
                shutil.copyfile(saved_prediction, ROOT / prediction[2:])
            records.append({
                'id': identifier, 'species': species, 'split': split,
                'url': f'./assets/samples/{identifier}.jpg', 'width': width, 'height': height,
                'labels': labels, 'prediction': prediction, 'originalFilename': path.name,
                'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            })
    history = []
    with (RUN / 'results.csv').open(newline='') as handle:
        for row in csv.DictReader(handle):
            history.append({key.strip(): float(value) for key, value in row.items()})
    metrics, current = {}, None
    for line in (SOURCE / 'part4_metrics.txt').read_text().splitlines():
        if line.strip() in ('VAL', 'TEST'):
            current = line.strip().lower(); metrics[current] = {}
        elif ':' in line and current:
            key, value = line.split(':', 1)
            metrics[current][key.strip()] = float(value)
    data = {
        'activity': 6, 'model': 'YOLO11n', 'epochs': 10, 'inputSize': 640,
        'classes': ['cat', 'dog'], 'seed': 42, 'batchSize': 4,
        'recordedWebcamDetectionFps': float(re.search(r'([0-9.]+)\s*$', (SOURCE / 'part1_speed.txt').read_text()).group(1)), 'metrics': metrics, 'history': history,
        'images': records, 'sourceRun': 'runs/detect/train-3',
        'sourceDocument': 'CSST106_Lab_Experiment_06_YOLOV8_Object_Detection.docx',
        'modelSha256': hashlib.sha256(MODEL.read_bytes()).hexdigest(),
        'notes': ['The document filename says YOLOv8; its body specifies YOLOv11.',
                  '10 epochs were explicitly requested instead of the handout\'s 100-epoch example.',
                  'Original user annotations are preserved. Ultralytics reported and ignored one duplicate training box.',
                  'Six test images are a small demonstration set, not a general-purpose benchmark.'],
    }
    (ROOT / 'assets' / 'data' / 'lab.json').write_text(json.dumps(data, indent=2), encoding='utf-8')
    for name in ('results.png', 'results.csv', 'args.yaml'):
        shutil.copyfile(RUN / name, ROOT / 'assets' / 'results' / name)
    for split, source_name in [('val', 'evaluate_val'), ('test', 'evaluate_test')]:
        for name in ('confusion_matrix.png', 'BoxPR_curve.png'):
            shutil.copyfile(SOURCE / 'runs' / 'detect' / source_name / name,
                            ROOT / 'assets' / 'results' / f'{split}-{name}')
    for name in ('part1_speed.txt', 'part4_metrics.txt'):
        shutil.copyfile(SOURCE / name, ROOT / 'downloads' / name)
    for species in ('cat', 'dog'):
        image = Image.open(SOURCE / 'raw_images' / species / f'{species}.125.jpg').convert('RGB')
        image.thumbnail((640, 640))
        image.save(ROOT / 'assets' / f'hero-{species}.webp', quality=87)
        shutil.copyfile(SOURCE / 'runs' / 'detect' / 'pretrained_preview' / f'{species}.125.jpg',
                        ROOT / 'assets' / 'results' / f'pretrained-{species}.jpg')
    doc = Path(r'C:\Users\Admin\Downloads\CSST106_Lab_Experiment_06_YOLOV8_Object_Detection.docx')
    with zipfile.ZipFile(doc) as archive:
        tree = ET.fromstring(archive.read('word/document.xml'))
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    paragraphs = [''.join(t.text or '' for t in p.findall('.//w:t', ns)) for p in tree.findall('.//w:body//w:p', ns)]
    (ROOT / 'assets' / 'data' / 'handout.txt').write_text('\n'.join(paragraphs), encoding='utf-8')
    with zipfile.ZipFile(ROOT / 'downloads' / 'lab6-yolo-dataset.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
        for record in records:
            archive.write(ROOT / record['url'][2:], f'dataset/images/{record["split"]}/{record["id"]}.jpg')
            original = SOURCE / 'dataset' / 'labels' / record['split'] / (Path(record['originalFilename']).stem + '.txt')
            archive.write(original, f'dataset/labels/{record["split"]}/{record["id"]}.txt')
        archive.writestr('data.yaml', "path: ./dataset\ntrain: images/train\nval: images/val\ntest: images/test\nnc: 2\nnames: ['cat', 'dog']\n")
    print('Prepared', len(records), 'original labeled photos,', len(history), 'actual training epochs, and recorded results.')


if __name__ == '__main__':
    main()
