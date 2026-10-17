import {test,expect} from '@playwright/test';
test('report, static downloads, root URL, and evaluation cancellation',async({page,request})=>{
  for(const path of ['http://127.0.0.1:4178/','./downloads/lab6-python-kit.zip','./downloads/lab6-yolo-dataset.zip','./assets/vendor/ort-wasm-simd-threaded.wasm','./assets/models/cats-dogs-best.onnx']){
    const response=await request.get(path);expect(response.status()).toBe(200);
  }
  await page.goto('./report.html');await expect(page.getByRole('heading',{name:'Laboratory 6 YOLO Object Detection'})).toBeVisible();await expect(page.locator('tbody')).toContainText('73.04%');await page.getByLabel('Student name').fill('Student');await page.screenshot({path:'artifacts/report.png',fullPage:true});await page.pdf({path:'artifacts/report-print.pdf',format:'A4',printBackground:true,preferCSSPageSize:true});
  await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);await page.getByRole('button',{name:'Evaluate six test images'}).click();await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.locator('#evaluation-status')).toContainText('Cancelled after',{timeout:90000});await expect(page.locator('#run-test-set')).toBeEnabled();
});
