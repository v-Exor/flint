import { mkdir, copyFile, access } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
await mkdir(new URL('assets/vendor/', root), { recursive: true });
for (const name of ['ort.wasm.min.mjs', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) {
  await copyFile(new URL(`node_modules/onnxruntime-web/dist/${name}`, root), new URL(`assets/vendor/${name}`, root));
}
try { await copyFile(new URL('node_modules/onnxruntime-web/LICENSE', root), new URL('assets/vendor/ONNX-RUNTIME-LICENSE.txt', root)); }
catch (error) { if (error.code !== 'ENOENT') throw error; await access(new URL('assets/vendor/ONNX-RUNTIME-LICENSE.txt', root)); }
console.log('Vendored pinned ONNX Runtime Web WASM assets.');
