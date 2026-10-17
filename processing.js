export function letterboxGeometry(width, height, size = 640) {
  if (!(width > 0 && height > 0)) throw new Error('The image has no readable dimensions.');
  const ratio = Math.min(size / width, size / height);
  const resizedWidth = Math.round(width * ratio), resizedHeight = Math.round(height * ratio);
  return { width, height, size, ratio, resizedWidth, resizedHeight,
    left: Math.max(0, Math.round((size - resizedWidth) / 2 - 0.1)), top: Math.max(0, Math.round((size - resizedHeight) / 2 - 0.1)) };
}
export function rgbaToCHW(rgba, size) {
  const pixels = size * size, data = new Float32Array(pixels * 3);
  for (let i = 0; i < pixels; i++) {
    data[i] = rgba[i * 4] / 255;
    data[i + pixels] = rgba[i * 4 + 1] / 255;
    data[i + pixels * 2] = rgba[i * 4 + 2] / 255;
  }
  return data;
}
export function iou(a, b) {
  const intersection = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1)) * Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  const union = (a.x2 - a.x1) * (a.y2 - a.y1) + (b.x2 - b.x1) * (b.y2 - b.y1) - intersection;
  return union > 0 ? intersection / union : 0;
}
export function nms(boxes, threshold = 0.45, limit = 300) {
  const sorted = boxes.slice().sort((a, b) => b.score - a.score), kept = [];
  for (const box of sorted) {
    if (!kept.some(other => other.classId === box.classId && iou(box, other) > threshold)) kept.push(box);
    if (kept.length >= limit) break;
  }
  return kept;
}
export function decodeYOLO(data, dims, labels, geometry, confidence = 0.25, overlap = 0.45) {
  const channels = 4 + labels.length;
  if (dims.length !== 3 || dims[0] !== 1 || dims[1] !== channels) throw new Error(`Unexpected model output [${dims}]. Expected [1, ${channels}, anchors].`);
  const anchors = dims[2], boxes = [];
  const { ratio, left, top, width, height } = geometry;
  for (let i = 0; i < anchors; i++) {
    let score = 0, classId = -1;
    for (let c = 0; c < labels.length; c++) {
      const value = data[(c + 4) * anchors + i];
      if (value > score) { score = value; classId = c; }
    }
    if (score < confidence || classId < 0) continue;
    const cx = data[i], cy = data[anchors + i], w = data[anchors * 2 + i], h = data[anchors * 3 + i];
    const x1 = Math.max(0, Math.min(width, (cx - w / 2 - left) / ratio));
    const y1 = Math.max(0, Math.min(height, (cy - h / 2 - top) / ratio));
    const x2 = Math.max(0, Math.min(width, (cx + w / 2 - left) / ratio));
    const y2 = Math.max(0, Math.min(height, (cy + h / 2 - top) / ratio));
    if (x2 > x1 && y2 > y1) boxes.push({ x1, y1, x2, y2, score, classId, label: labels[classId] });
  }
  return nms(boxes, overlap);
}
export function normalizedBox(box, width, height) {
  const x1 = Math.max(0, Math.min(width, Math.min(box.x1, box.x2))), x2 = Math.max(0, Math.min(width, Math.max(box.x1, box.x2)));
  const y1 = Math.max(0, Math.min(height, Math.min(box.y1, box.y2))), y2 = Math.max(0, Math.min(height, Math.max(box.y1, box.y2)));
  return [box.classId, (x1 + x2) / (2 * width), (y1 + y2) / (2 * height), (x2 - x1) / width, (y2 - y1) / height];
}
export function yoloText(boxes, width, height) {
  return boxes.map(b => normalizedBox(b, width, height)).filter(b => b[3] > 0 && b[4] > 0).map(b => [b[0], ...b.slice(1).map(v => v.toFixed(6))].join(' ')).join('\n');
}
export function groundTruthBoxes(labels, width, height) {
  return labels.map(([classId, x, y, w, h]) => ({ classId, x1: (x - w / 2) * width, y1: (y - h / 2) * height, x2: (x + w / 2) * width, y2: (y + h / 2) * height }));
}
export function matchDetections(predictions, truths, threshold = 0.5) {
  const used = new Set(); let tp = 0;
  for (const prediction of predictions.slice().sort((a, b) => b.score - a.score)) {
    let best = -1, bestIoU = threshold;
    truths.forEach((truth, i) => { const overlap = iou(prediction, truth); if (!used.has(i) && truth.classId === prediction.classId && overlap >= bestIoU) { best = i; bestIoU = overlap; } });
    if (best >= 0) { used.add(best); tp++; }
  }
  return { tp, fp: predictions.length - tp, fn: truths.length - tp };
}
