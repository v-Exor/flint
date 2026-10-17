import {test,expect} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
test.use({launchOptions:{channel:'chrome',args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']}});
test('camera media lifecycle and local video inference',async({page})=>{
  await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);
  const panel=page.locator('#custom-panel');await panel.locator('[data-role=camera]').click();
  await expect(panel.locator('[data-role=status]')).toContainText('computed on your device',{timeout:90000});
  expect(await panel.locator('video').evaluate(video=>video.srcObject.getVideoTracks()[0].readyState)).toBe('live');
  await panel.locator('[data-role=stop]').click();expect(await panel.locator('video').evaluate(video=>video.srcObject)).toBe(null);
  const encoded=await page.evaluate(async()=>{
    const image=new Image();image.src='./assets/hero-cat.webp';await image.decode();
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=320;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,320,320);
    const stream=canvas.captureStream(8),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];
    const completed=new Promise(resolve=>{recorder.ondataavailable=event=>chunks.push(event.data);recorder.onstop=resolve;});recorder.start();
    await new Promise(resolve=>setTimeout(resolve,800));recorder.stop();await completed;stream.getTracks().forEach(t=>t.stop());
    const bytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);
  });
  await panel.locator('[data-role=video-file]').setInputFiles({name:'actual-cat-photo-clip.webm',mimeType:'video/webm',buffer:Buffer.from(encoded,'base64')});
  await expect(panel.locator('[data-role=status]')).toContainText('computed on your device',{timeout:90000});await expect(panel.locator('[data-role=detections]')).toContainText('cat');await panel.locator('[data-role=stop]').click();
  await panel.locator('[data-role=image-file]').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('not an image')});await expect(panel.locator('[data-role=status]')).toHaveAttribute('data-state','error');
});
test('model download failure is reported honestly',async({page})=>{
  await page.route('**/cats-dogs-best.onnx',route=>route.fulfill({status:404,body:'Missing model'}));
  await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);const panel=page.locator('#custom-panel');await expect(panel.locator('[data-role=status]')).toContainText('Image ready');await panel.locator('[data-role=run]').click();await expect(panel.locator('[data-role=status]')).toContainText('Model download failed (404)',{timeout:90000});await expect(panel.locator('[data-role=png]')).toBeDisabled();
});
test('capture exact browser preprocessing and prediction for Python cross-check',async({page})=>{
  await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);const panel=page.locator('#custom-panel');await expect(panel.locator('[data-role=status]')).toContainText('Image ready');await panel.locator('[data-role=run]').click();await expect(panel.locator('[data-role=status]')).toContainText('computed on your device',{timeout:90000});
  const download=page.waitForEvent('download');await panel.locator('[data-role=json]').click();await (await download).saveAs('artifacts/browser-predictions.json');
  const prepared=await page.evaluate(async()=>{const {prepareInput}=await import('./app.js');const source=document.querySelector('#custom-panel [data-role=original]');const {geometry,input}=prepareInput(source,source.width,source.height);const bytes=new Uint8Array(input.buffer);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return {geometry,base64:btoa(binary)};});
  await writeFile('artifacts/browser-input.bin',Buffer.from(prepared.base64,'base64'));await writeFile('artifacts/browser-geometry.json',JSON.stringify(prepared.geometry));
});
