# Laboratory 6 source and requirement map

Primary source: `CSST106_Lab_Experiment_06_YOLOV8_Object_Detection.docx`, provided by the user. Its text is retained in `assets/data/handout.txt`; its two embedded school images were not extracted or used. The Lab 6 header and YOLOv11 body control identification, despite the YOLOv8 filename and Activity 5 typo.

| Handout requirement | Website implementation | Evidence |
| --- | --- | --- |
| Learning outcomes | Overview and four objectives | `index.html#overview`, `#objectives` |
| Part 1 pretrained YOLOv11 webcam, boxes, labels, confidence, speed | Real COCO YOLO11 ONNX inference on webcam/video/images; measured runtime; preserved Python | `#part1`, `python/part1_webcam.py`, `assets/models/yolo11n.onnx` |
| Collect and annotate custom objects | Original 30 cat + 30 dog photos; actual browser box editor and original labels | `#part2`, `assets/samples`, `assets/data/lab.json` |
| Normalized YOLO TXT labels and folder structure | Real TXT/YAML export; packaged 42/12/6 image/label partitions | `downloads/lab6-yolo-dataset.zip` |
| Train custom model, monitor loss and metrics | Genuine history chart, epoch inspector, original CSV/plots, Python training command and source | `#part3`, `assets/results/results.csv`, `python/part3_train.py` |
| Example epochs=100 | Explicit user override to ten epochs; generator and Python enforce 1–10 | `python/part3_train.py`, `#part3`, `README.md` |
| Saved best weights | Actual checkpoint and exported graph from completed `train-3` run | `assets/models/cats-dogs-best.pt`, `.onnx` |
| Validation and new-image/video inference | Recorded val/test metrics; genuine custom browser inference; live six-image fixed-threshold evaluation | `#part4`, `#results`, `downloads/part4_metrics.txt` |
| Analyze precision, recall and accuracy | Explicit definitions, actual metrics, limits of six test images, saved matrix/PR curves | Results, report, answers TXT |
| One written detection-vs-classification question | Exact question and concise answer with cats/dog example | `#questions`, `report.html`, `downloads/lab6-answers.txt` |

## Recorded and live boundaries

- Pretrained and custom browser boxes are computed from actual input pixels using the real graphs, normalized RGB CHW input, letterboxing, confidence filtering, and class-aware NMS. No random boxes or fixture detection results are used in the application.
- Original Python outputs are labeled recorded. The ten-epoch chart is an exploration of actual CSV rows, not live training or a timer pretending to train.
- Live precision/recall are micro counts at a fixed score threshold and matching IoU of 0.50. They are distinct from the saved Ultralytics evaluation and do not claim to calculate mAP.
- The runtime and models are self-contained static files. Python runs locally for training/export and is preserved for reproducibility.
- The original annotations include one duplicate training annotation that Ultralytics reported ignoring. Labels are preserved as supplied; the website does not silently improve the recorded dataset or claim independent annotation quality certification.

Technical sources: [Ultralytics YOLO11](https://docs.ultralytics.com/models/yolo11/), [YOLO dataset format](https://docs.ultralytics.com/datasets/detect/), [model export](https://docs.ultralytics.com/modes/export/), [validation](https://docs.ultralytics.com/modes/val/), [ONNX Runtime Web deployment](https://onnxruntime.ai/docs/tutorials/web/deploy.html), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
