import { mkdir, cp, rm } from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,sep} from 'node:path';
const root=new URL('../',import.meta.url), destination=new URL('dist/',root);
// The destination is a fixed directory inside this project, never user data.
if(resolve(fileURLToPath(destination))!==resolve(fileURLToPath(root),'dist')||!resolve(fileURLToPath(destination)).startsWith(resolve(fileURLToPath(root))+sep))throw new Error('Build destination must remain inside this project.');
await rm(destination,{recursive:true,force:true});await mkdir(destination,{recursive:true});
for(const file of ['index.html','report.html','styles.css','app.js','processing.js','inference-worker.js','site-config.js','.nojekyll','README.md','SOURCE_MAP.md','VALIDATION.md'])await cp(new URL(file,root),new URL(file,destination));
for(const folder of ['assets','python','downloads'])await cp(new URL(`${folder}/`,root),new URL(`${folder}/`,destination),{recursive:true});
console.log('Built standalone public website in dist/. No server or build is required by visitors.');
