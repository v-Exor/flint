import {readFile,stat,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);let checks=0;
async function exists(path){const result=await stat(new URL(path,root));if(result.isFile()&&result.size===0&&path!=='.nojekyll')throw new Error(`Empty asset: ${path}`);checks++;}
for(const name of ['index.html','report.html','app.js','processing.js','inference-worker.js','site-config.js','styles.css','assets/data/lab.json','assets/models/manifest.json','assets/vendor/ort.wasm.min.mjs','assets/vendor/ort-wasm-simd-threaded.mjs','assets/vendor/ort-wasm-simd-threaded.wasm','assets/vendor/ONNX-RUNTIME-LICENSE.txt','assets/models/ULTRALYTICS-LICENSE.txt','downloads/lab6-python-kit.zip','downloads/lab6-yolo-dataset.zip','downloads/lab6-answers.txt'])await exists(name);
for(const name of ['app.js','processing.js','inference-worker.js','site-config.js']){const result=spawnSync(process.execPath,['--check',fileURLToPath(new URL(name,root))],{encoding:'utf8'});if(result.status)throw new Error(result.stderr);}
for(const html of ['index.html','report.html']){const text=await readFile(new URL(html,root),'utf8');const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);if(new Set(ids).size!==ids.length)throw new Error(`Duplicate IDs in ${html}`);for(const match of text.matchAll(/(?:src|href)="(\.\/[^"]+)"/g))await exists(match[1].split('#')[0]);}
const lab=JSON.parse(await readFile(new URL('assets/data/lab.json',root),'utf8'));
if(lab.activity!==6||lab.epochs!==10||lab.history.length!==10||lab.images.length!==60)throw new Error('Lab identity or recorded-run count mismatch.');
const partitions={train:new Set(),val:new Set(),test:new Set()};
for(const image of lab.images){await exists(image.url);partitions[image.split].add(image.sha256);if(image.prediction)await exists(image.prediction);if(image.labels.some(row=>row.length!==5||![0,1].includes(row[0])||row.slice(1).some(v=>v<0||v>1)))throw new Error(`Invalid labels: ${image.id}`);}
if(partitions.train.size!==42||partitions.val.size!==12||partitions.test.size!==6)throw new Error('Dataset split mismatch.');
for(const [a,b] of [['train','val'],['train','test'],['val','test']])if([...partitions[a]].some(hash=>partitions[b].has(hash)))throw new Error('Cross-partition duplicate image.');
const checkpoint=await readFile(new URL('assets/models/cats-dogs-best.pt',root));if(createHash('sha256').update(checkpoint).digest('hex')!==lab.modelSha256)throw new Error('The checkpoint is not the original trained model.');
const models=JSON.parse(await readFile(new URL('assets/models/manifest.json',root),'utf8'));for(const model of models){await exists(model.url);if((await stat(new URL(model.url,root))).size!==model.bytes)throw new Error('Model size mismatch.');}
if(models.find(m=>m.id==='pretrained').labels.length!==80||models.find(m=>m.id==='custom').labels.join(',')!=='cat,dog')throw new Error('Model class mismatch.');
const training=await readFile(new URL('python/part3_train.py',root),'utf8');if(!training.includes('MAX_EPOCHS = 10'))throw new Error('Python epoch cap missing.');
console.log(`Passed: ${checks} local asset checks, script syntax, unique IDs, real checkpoint hash, model classes, valid labels, and independent 42/12/6 partitions.`);
