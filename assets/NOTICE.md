# Assets and model provenance

The sixty images and annotations are copied from the completed local Lab 6 dataset. The source photographs were selected from TensorFlow's public Cats and Dogs filtered example archive at `https://storage.googleapis.com/tensorflow-1-public/course2/cats_and_dogs_filtered.zip`, originally derived from the Microsoft/Kaggle Cats vs Dogs dataset. They are real photographs; original image rights remain with the source dataset/photographers. This is an academic laboratory demonstration, not a claim of ownership of the images.

The hero photos use `cat.125.jpg` and `dog.125.jpg` from that same downloaded archive, converted to WebP. Hero result boxes are the genuine saved pretrained predictions from the original laboratory run, not decorative AI-generated boxes. The generic VisionLab SVG mark follows the other website projects and is not a college logo.

The six result photographs, confusion matrices, PR curves, training plots, CSV, metrics, and 13.92 FPS report are original outputs of the completed local laboratory. Full manifests and SHA-256 image/checkpoint identifiers are in `data/lab.json`.

`models/yolo11n.pt` is the official Ultralytics YOLO11 nano checkpoint downloaded during the original lab. `models/cats-dogs-best.pt` is the student's actual best checkpoint from ten training epochs, `runs/detect/train-3`. Both were exported without retraining to float32 ONNX at fixed 640 × 640 input, opset 17, with NMS performed in JavaScript. Model files inherit Ultralytics AGPL-3.0 terms; see `models/ULTRALYTICS-LICENSE.txt` and https://www.ultralytics.com/license.

`vendor` contains pinned ONNX Runtime Web 1.23.2 WASM files. ONNX Runtime is copyright Microsoft Corporation, MIT licensed; see `vendor/ONNX-RUNTIME-LICENSE.txt`. No CDN, third-party tracker, personal webcam screenshot, or school logo is included.
