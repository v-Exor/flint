import * as ort from './assets/vendor/ort.wasm.min.mjs';
import { decodeYOLO } from './processing.js';
ort.env.wasm.numThreads = 1; // Works on Pages without COOP/COEP headers.
ort.env.wasm.proxy = false;
ort.env.wasm.wasmPaths = new URL('./assets/vendor/', import.meta.url).href;
const sessions = new Map();
let queue = Promise.resolve();
async function execute(message) {
  const { id, model, input, geometry, confidence, overlap } = message;
  try {
    let session = sessions.get(model.id);
    if (!session) {
      postMessage({ id, type: 'status', text: `Loading ${model.title} on this device…` });
      const response = await fetch(model.url);
      if (!response.ok) throw new Error(`Model download failed (${response.status}). Check assets/models on your host.`);
      session = await ort.InferenceSession.create(await response.arrayBuffer(), { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
      sessions.set(model.id, session);
    }
    const tensor = new ort.Tensor('float32', input, [1, 3, geometry.size, geometry.size]);
    const started = performance.now();
    const outputs = await session.run({ [session.inputNames[0]]: tensor });
    const output = outputs[session.outputNames[0]];
    const boxes = decodeYOLO(output.data, output.dims, model.labels, geometry, confidence, overlap);
    const milliseconds = performance.now() - started;
    tensor.dispose(); Object.values(outputs).forEach(value => value.dispose());
    postMessage({ id, type: 'result', boxes, milliseconds, shape: output.dims });
  } catch (error) { postMessage({ id, type: 'error', text: `${error.message || error}` }); }
}
self.onmessage = ({ data }) => { queue = queue.then(() => execute(data)); };
