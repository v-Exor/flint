# CSST106 Laboratory 6 YOLO Object Detection

An independent white-and-orange VisionLab website for **Laboratory Exercise No. 6**. It includes genuine browser inference with the COCO-pretrained YOLO11 nano detector and the student's actual ten-epoch cat/dog detector. It does not depend on any other laboratory repository.

Live website: **https://v-exor.github.io/LabAct6_CSST106/**  
Repository: **https://github.com/v-Exor/LabAct6_CSST106**

## Identification and scope

The primary source is `CSST106_Lab_Experiment_06_YOLOV8_Object_Detection.docx`. The filename says YOLOv8, the document body specifies YOLOv11, and one internal heading incorrectly says Activity 5. This project follows the Lab 6 header, four YOLOv11 parts, original scripts, and completed results. Training is capped at **10 epochs**, the user's explicit override of the handout's 100-epoch example. No school logos or Word-document media are included.

## Run locally

No installation or build is needed to view the website. Node is used only as a local static file server:

```powershell
cd "C:\Users\Admin\Documents\ChatGPT\Laboratory_Activities_CSST106\lab-06"
node scripts/serve.mjs
```

Open **http://127.0.0.1:4178/**. The same server supports **http://127.0.0.1:4178/lab-06/** to test repository-prefix paths. Stop the preview with Ctrl+C. Alternatively, run `python -m http.server 8000` and open http://localhost:8000/. Use HTTP/HTTPS, not `file://`.

## Implemented experiments

| Part | Functionality |
| --- | --- |
| 1 | Actual COCO-pretrained YOLO11 inference on samples, local JPEG/PNG/WebP images, MP4/WebM video, and webcam frames; confidence and NMS controls; input/output views; labels; measured runtime; PNG and JSON exports. |
| 2 | All 60 real lab photographs, partition/species filters, pointer/touch bounding-box drawing, class choice, editable normalized labels, original annotation loading, undo/clear, individual TXT and YAML export, and a ZIP of the genuine prepared dataset. |
| 3 | Interactive chart and epoch inspection of the genuine 10-epoch CSV, loss/mAP/precision/recall views, validated Python command generation, original plots, Python kit, and the original trained PyTorch weights. Training is explicitly offline, not simulated. |
| 4 | Actual inference with the ten-epoch two-class model; image/video/webcam inputs; live evaluation of six held-out images with TP/FP/FN and precision/recall at fixed thresholds; cancellation and evaluation JSON export. |
| Results | Recorded validation/test metrics, six original-versus-predicted gallery pairs, confusion matrix and PR curve, analysis, the exact written question and answer, conclusion, answers TXT, and a printable report. |

The model downloads are lazy. First inference loads the local WASM runtime (about 11.4 MiB) and the selected ONNX graph (about 10.1–10.2 MiB). Switching model loads the second graph. Both graphs and all runtime files are bundled; there is no runtime CDN, account, API key, paid inference service, or Python server. Uploaded media and webcam frames are processed on the visitor's device.

## Recorded results and live results

The saved Python run used 42 training, 12 validation, and 6 test images, two classes, input size 640, batch size 4, and seed 42. The original run was `runs/detect/train-3`.

| Metric | Validation | Test |
| --- | ---: | ---: |
| Precision | 58.90% | 73.04% |
| Recall | 91.67% | 83.33% |
| mAP50 | 80.47% | 80.46% |
| mAP50–95 | 43.09% | 35.03% |

Recorded desktop webcam speed was 13.92 detection FPS, excluding capture/display and warm-up frames. It is not a browser speed claim. Training losses decreased, while validation mAP50 stayed near 80%. Six test images are too few to establish general-purpose performance.

Live evaluation uses class-aware greedy matching at IoU ≥ 0.50, the selected confidence threshold, and selected class-aware NMS threshold. Its micro-averaged precision/recall are **not mAP** and are not expected to equal Ultralytics' recorded best-F1 precision/recall. Browser Canvas resizing can also differ slightly from OpenCV interpolation. Saved Python prediction images are labeled recorded outputs; current browser boxes are calculated from the current input pixels.

## Compilation and repository links

Edit `site-config.js` with your real destinations:

```javascript
window.LAB_CONFIG = {
  compilationUrl: '',
  repositoryUrl: 'https://github.com/v-Exor/LabAct6_CSST106',
};
```

The repository link is configured. Set `compilationUrl` once your compilation website is online. Empty destinations open the configuration dialog. The footer's **Configure website links** also saves per-browser overrides. Download the generated config and replace `site-config.js` to set destinations for all visitors. Browser overrides take precedence.

## Deploy to your own free GitHub Pages repository

This project uses the public `v-Exor/LabAct6_CSST106` repository and the included GitHub Actions Pages workflow. Future pushes to `main` automatically update the website. To deploy a separate copy:

1. Create a **new public GitHub repository** for Lab 6 using your own chosen name.
2. Upload the **contents** of this project into the repository root, preserving the folders. `index.html` should be at the root, not inside another `lab-06` directory. Do not upload `.export-deps`, `.npm-cache`, `.venv`, `node_modules`, `artifacts`, `dist`, or `test-results`. The delivery ZIP already excludes them.
3. Set the actual URLs in `site-config.js`.
4. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
5. Push to `main` or run **Actions → Deploy Lab 6 to GitHub Pages → Run workflow**. If your default branch has another name, update `.github/workflows/pages.yml`.
6. The workflow checks the static assets, stages `dist`, and deploys. Open its environment URL or **Settings → Pages → Visit site**.

Alternative: choose **Deploy from a branch → main → /(root)**. The buildless root files also work directly. Use one publishing method at a time. Do not upload the ZIP as a single file and expect GitHub Pages to extract it.

Add the published URL to your compilation's Lab 6 button:

```text
https://v-exor.github.io/LabAct6_CSST106/
```

All application URLs are relative, so changing the repository name does not require changing a hard-coded base path. No custom domain or paid backend is required.

## Development and verification

Only development requires npm dependencies:

```powershell
npm ci
npm run check
npm test
npm run test:e2e
```

Browser tests use installed Google Chrome in an isolated profile and exercise the `/lab-06/` prefix, real model inference, file uploads, annotation, ten-epoch validation, recorded metrics, evaluation, camera/video lifecycle, responsive layouts, and accessibility. See `VALIDATION.md` for actual completed checks. The preview/test processes require loopback network access.

The ONNX Runtime Web version is pinned at 1.23.2. Runtime files are already vendored in `assets/vendor`; `npm run vendor` refreshes them from the pinned npm package. The MIT license is committed alongside the runtime.

```powershell
node scripts/build.mjs
python scripts/package-delivery.py
```

`dist/` is the public static build. The delivery ZIP in the parent directory contains source plus committed production assets and deployment instructions, excluding local dependencies and test outputs.

## Python and model export

The `python` directory preserves the original four scripts and their requirements. Download the Python kit and prepared dataset ZIP; extract both into the same fresh folder. The dataset archive contains `data.yaml` and `dataset/`. Run Parts 3 and 4 there. To collect/annotate new photos with Part 2, use a separate fresh folder; a completed `data.yaml` is protected from accidental overwrite.

Model export is an offline preparation step, not performed on GitHub Pages. `python/export_models.py` exports copied checkpoints from `assets/models` to fixed 640 × 640, float32, opset-17 ONNX graphs without embedded NMS. Install Ultralytics and ONNX in a local Python environment, then run the exporter. Python export and reference comparison need no camera. `scripts/prepare-content.py` documents the provenance import from the original local lab folder; the finished site does not require that folder.

## Troubleshooting and limitations

- **Models fail to load:** use HTTP/HTTPS and ensure both ONNX graphs and all three runtime files were uploaded. The WASM `.mjs` and `.wasm` filenames and versions must match. Single-thread WASM avoids GitHub Pages' lack of custom cross-origin-isolation headers.
- **First inference is slow:** wait for the model/runtime download. Inference is CPU-based WASM for broad compatibility; mobile speed varies. Heavy computation is in a worker to keep the UI responsive.
- **Webcam access fails:** use HTTPS or localhost, grant camera access, and close other camera applications. Stopping, hiding, or leaving the page releases camera tracks. Image upload remains usable without camera permission.
- **Video does not play:** use a browser-supported MP4 or WebM codec, under 100 MB. A video file extension alone does not guarantee codec support. Videos are processed locally and loop until stopped.
- **Images fail to decode:** choose a valid JPEG, PNG, or WebP under 20 MB. Browser annotation uses the actual visible image dimensions.
- **No objects detected:** this is valid at a high confidence threshold or on objects outside the model's learned classes. The custom model supports only cats and dogs; the pretrained model supports 80 COCO classes.
- **My annotation changes disappeared:** per-image edits are retained during this page session, not uploaded or permanently written to disk. Download labels before leaving. The prepared dataset ZIP always contains original lab annotations, not browser edits.
- **Training button does not train:** it intentionally generates a real Python command. GitHub Pages cannot host a Python training backend. The ten-epoch chart is recorded data, not a simulated job.
- **Saved and live metrics differ:** they use different threshold/matching procedures; the web evaluation is explicitly fixed-threshold and does not calculate mAP.
- **404 after deployment:** check root `index.html`, filename case, model/runtime assets, publishing source, workflow branch, and the final slash in your repository URL.

## Provenance and licenses

`SOURCE_MAP.md` maps each handout requirement to implemented modules. `assets/data/lab.json` contains original labels, partition membership, real history, saved metrics, and checkpoint/image hashes. `assets/NOTICE.md` records data/model provenance. No personal webcam screenshot or school logo is bundled. Ultralytics model/source terms are AGPL-3.0; ONNX Runtime is MIT; original photographs retain their original dataset rights. Attribution/license files are included with the models/runtime.
