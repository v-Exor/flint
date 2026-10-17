# Original laboratory Python implementations

The four `part*.py` scripts are preserved from the completed local lab, including
the hard ten-epoch maximum. The activity body specifies YOLOv11, despite the
YOLOv8 filename.

For a new local reproduction, extract the Python kit and prepared dataset ZIP
from the website into the same fresh folder. Install requirements, then run:

```powershell
python -m pip install -r requirements.txt
python part1_webcam.py
python part3_train.py --epochs 10
python part4_evaluate_predict.py
```

The prepared dataset archive supplies `data.yaml` and the real annotated
`dataset` directory. To prepare your own annotations instead, use Part 2 in a
fresh folder without an existing data.yaml. Part 2 requires a graphical
desktop: draw a box, Enter to confirm, Esc to finish each image.

`export_models.py` belongs to the website's offline asset preparation. Install
Ultralytics and `onnx>=1.17,<1.20`, then execute it from this project. It reads
the copied checkpoints in `assets/models` and writes ONNX graphs and the model
manifest. It does not retrain the model. The browser uses these graphs and
implements letterboxing, RGB/255 CHW input, confidence filtering and NMS.

The original training and evaluation may produce different results on other
library versions, hardware, or manually modified annotations. Preserve the
downloaded CSV/metrics when citing the completed historical run.
