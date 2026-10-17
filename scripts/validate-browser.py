"""Compare real browser outputs with native ONNX and the original PyTorch model."""
from pathlib import Path
import json
import os
import sys

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.export-deps'))
os.environ.setdefault('YOLO_CONFIG_DIR',str(ROOT/'artifacts'))
import numpy as np
import onnxruntime as ort
import torch
from ultralytics import YOLO

def overlap(a,b):
    intersection=max(0,min(a['x2'],b['x2'])-max(a['x1'],b['x1']))*max(0,min(a['y2'],b['y2'])-max(a['y1'],b['y1']))
    union=(a['x2']-a['x1'])*(a['y2']-a['y1'])+(b['x2']-b['x1'])*(b['y2']-b['y1'])-intersection
    return intersection/union if union else 0

def main():
    tensor=np.fromfile(ROOT/'artifacts/browser-input.bin',dtype=np.float32).reshape(1,3,640,640)
    geometry=json.loads((ROOT/'artifacts/browser-geometry.json').read_text())
    browser=json.loads((ROOT/'artifacts/browser-predictions.json').read_text())
    session=ort.InferenceSession(str(ROOT/'assets/models/cats-dogs-best.onnx'),providers=['CPUExecutionProvider'])
    native=session.run(None,{session.get_inputs()[0].name:tensor})[0]
    model=YOLO(str(ROOT/'assets/models/cats-dogs-best.pt')).model.eval().fuse()
    with torch.no_grad():
        output=model(torch.from_numpy(tensor))
        pytorch=(output[0] if isinstance(output,tuple) else output).cpu().numpy()
    raw_error=float(np.abs(native-pytorch).max())
    assert np.allclose(native,pytorch,atol=.003,rtol=.001),raw_error
    candidates=[]
    for prediction in native[0].T:
        class_id=int(np.argmax(prediction[4:]));score=float(prediction[4+class_id])
        if score<browser['confidence']:continue
        cx,cy,w,h=map(float,prediction[:4]);r=geometry['ratio'];left=geometry['left'];top=geometry['top']
        box={'classId':class_id,'score':score,'x1':max(0,min(geometry['width'],(cx-w/2-left)/r)),
             'x2':max(0,min(geometry['width'],(cx+w/2-left)/r)),
             'y1':max(0,min(geometry['height'],(cy-h/2-top)/r)),
             'y2':max(0,min(geometry['height'],(cy+h/2-top)/r))}
        if box['x2']>box['x1'] and box['y2']>box['y1']:candidates.append(box)
    kept=[]
    for box in sorted(candidates,key=lambda b:b['score'],reverse=True):
        if not any(b['classId']==box['classId'] and overlap(b,box)>browser['nmsIoU'] for b in kept):kept.append(box)
        if len(kept)>=300:break
    assert len(kept)==len(browser['detections']),(len(kept),len(browser['detections']))
    maximum_box_error=0;maximum_score_error=0
    for reference,predicted in zip(kept,browser['detections']):
        assert reference['classId']==predicted['classId']
        maximum_box_error=max(maximum_box_error,max(abs(reference[k]-predicted[k]) for k in ('x1','x2','y1','y2')))
        maximum_score_error=max(maximum_score_error,abs(reference['score']-predicted['score']))
    assert maximum_box_error<.1,maximum_box_error
    assert maximum_score_error<.001,maximum_score_error
    report={'source':'exact browser-generated input tensor and browser JSON export','model':'actual custom 10-epoch YOLO11n checkpoint',
            'matchedDetections':len(kept),'onnxVersusPyTorchMaxRawAbsoluteError':raw_error,
            'browserVersusNativeMaxBoxErrorPixels':maximum_box_error,'browserVersusNativeMaxScoreError':maximum_score_error}
    (ROOT/'artifacts/numerical-parity.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))

if __name__=='__main__':main()
