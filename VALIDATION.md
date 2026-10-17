# Lab 6 validation record

## Public GitHub Pages deployment — 17 October 2026

- Repository: https://github.com/v-Exor/flint
- Website: https://v-exor.github.io/flint/
- GitHub Actions deployment completed successfully. The public homepage returned HTTP 200.
- Three browser tests passed against the actual public HTTPS website: both real YOLO model inference paths; annotation, coordinate validation, label export, history and the ten-epoch cap; image upload and evaluation of all six test images with JSON export.
- The repository contains all 132 source, model, runtime, dataset, report, download, test, and deployment files. Local dependency caches and test artifacts are excluded.
- The repository link is configured. Set `compilationUrl` in `site-config.js` when the compilation website is available.

## Completed verification

- Primary Word document re-read and mapped against all four parts, four learning outcomes, the detection-vs-classification question, and recorded original outputs. Filename/body identification conflict and ten-epoch override are documented.
- Static check: 116 local asset/link checks passed; JavaScript syntax, unique HTML IDs, original checkpoint SHA-256, 80/2 model classes, annotation ranges, and image hashes across independent 42/12/6 partitions checked.
- Six mathematical unit tests passed: aspect-preserving letterbox geometry, normalized RGB CHW packing, IoU, class-aware NMS, YOLO output decoding, normalized annotation round-trip, and class-aware one-to-one matching.
- Nine browser tests passed in isolated installed Chrome against the repository-prefix URL `/lab-06/`. Tests cover real pretrained and custom model inference, image uploads, TXT/JSON downloads, original label loading, invalid coordinate rejection, epoch cap, recorded metrics, all-six-image evaluation, cancellation, local video processing, camera lifecycle, missing-model errors, config links, mobile navigation, report generation, and static downloads.
- Both sample and held-out-photo predictions were calculated by actual ONNX Runtime Web. The application contains no random/generated detection results, fixture prediction substitutions, or simulated training jobs.
- Actual browser model inference also passed a targeted repeat after label-placement refinement. Annotation/history and mobile/accessibility checks passed targeted repeats after the final responsive chart sizing change.
- Automated accessibility scan reported **zero WCAG 2 A/AA and WCAG 2.1 AA violations** in the tested state. This is an automated check, not a claim of complete accessibility certification.
- Layout inspected at 1440, 390 and 320 pixels; mobile configuration interaction has no horizontal document overflow. Desktop and mobile screenshots were visually reviewed. Labels, keyboard focus, reduced-motion support, and responsive navigation are present.
- Report HTML was visually inspected; Chrome successfully generated an internal print-to-PDF QA artifact. The deliverable remains the HTML report, not that QA PDF.

## Numerical cross-check

The test captured the exact float32 RGB CHW input from browser Canvas and the actual custom-model JSON export. Native ONNX and the original PyTorch checkpoint were evaluated with the same tensor.

- One retained detection matched between browser and native ONNX.
- Maximum box coordinate difference: **0.00004759 pixels**.
- Maximum confidence difference: **0.0000002981**.
- Native ONNX vs. original PyTorch maximum raw output absolute difference: **0.00125123**, within the checked tolerance.

This verifies the tested conversion/inference/preprocessing path, not universal detection accuracy or parity for every possible photograph. Small browser/OpenCV resize differences can affect predictions on different inputs.

## Media and hosting limits

- Automated camera lifecycle checks used Chrome's generated test camera. No personal camera frames were captured in those tests. The video fixture was a short WebM made from a real bundled cat photograph; inference on those frames used the actual custom model.
- Physical webcam access and Safari/Firefox/mobile-device inference have not been independently tested in this website build. HTTPS/localhost and permission are required for a real webcam. Image/video functionality is available without camera permission.
- Validation/test scores in the website are the genuine original Ultralytics run, not claims about newly measured browser performance. Live fixed-threshold precision/recall are explicitly separate from recorded mAP.
- Model fitting is local Python only. The site offers actual inference and annotation plus a recorded training-history explorer and real Python command/source downloads.
- GitHub Pages-style root and repository-prefix assets were checked locally. The public deployment target is `v-Exor/flint`, using the included GitHub Actions workflow. The repository link is configured; the compilation destination remains configurable until that website is online.
- Browser annotation edits last for this page session; individual TXT downloads persist them. The prepared ZIP contains the original dataset, not unsaved visitor edits.

## Reproduce

```powershell
npm ci
npm run check
npm test
npm run test:e2e
```

Local browser tests use installed Chrome. The optional `scripts/validate-browser.py` needs the original export environment (Ultralytics, torch, ONNX Runtime, NumPy) and the browser-captured artifacts generated by `tests/media.spec.js`. Development/QA artifacts and dependency caches are excluded from the delivery ZIP.
