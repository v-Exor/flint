import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'node:path';
test('real pretrained and custom browser inference work under a repository path',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);
  for(const id of ['pretrained-panel','custom-panel']){
    const panel=page.locator(`#${id}`);await expect(panel.locator('[data-role=status]')).toContainText('Image ready');
    await panel.getByRole('button',{name:'Run detection'}).click();
    await expect(panel.locator('[data-role=status]')).toContainText('computed on your device',{timeout:90000});
    await expect(panel.locator('[data-role=detections]')).toContainText('cat');
    await expect(panel.locator('[data-role=png]')).toBeEnabled();
  }
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'artifacts/desktop.png',fullPage:true});expect(errors).toEqual([]);
});
test('annotation, coordinate validation, exports, history and epoch cap work',async({page})=>{
  await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);
  await expect(page.locator('#annotation-meta')).toContainText('original saved');
  await page.getByRole('button',{name:'Load saved boxes'}).click();
  await expect(page.locator('#annotation-text')).not.toHaveValue('');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Download .txt'}).click();expect((await pending).suggestedFilename()).toMatch(/cat-.*\.txt/);
  await page.locator('#annotation-text').fill('2 0.5 0.5 0.2 0.2');await page.getByRole('button',{name:'Apply text'}).click();await expect(page.locator('#annotation-error')).toBeVisible();
  await page.locator('#annotation-text').fill('0 0.5 0.5 0.4 0.4');await page.getByRole('button',{name:'Apply text'}).click();await expect(page.locator('#annotation-error')).toBeHidden();
  await page.locator('#training-epochs').fill('100');await page.getByRole('button',{name:'Generate Python command'}).click();await expect(page.locator('#training-message')).toContainText('maximum of 10');
  await page.locator('#training-epochs').fill('10');await page.getByRole('button',{name:'Generate Python command'}).click();await expect(page.locator('#training-command')).toHaveText('python part3_train.py --epochs 10');
  await page.locator('#history-epoch').fill('1');await expect(page.locator('#history-epoch-value')).toHaveText('1 / 10');
  await page.locator('#recorded-split').selectOption('val');await expect(page.locator('#recorded-metrics')).toContainText('91.67%');
  await page.locator('#gallery-originals').check();await expect(page.locator('#prediction-gallery figure')).toHaveCount(6);
});
test('custom test evaluation and uploads use actual images',async({page})=>{
  await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);
  const panel=page.locator('#custom-panel');await panel.locator('[data-role=image-file]').setInputFiles(resolve('assets/samples/dog-28.jpg'));
  await expect(panel.locator('[data-role=status]')).toContainText('Your image is ready');await panel.locator('[data-role=run]').click();await expect(panel.locator('[data-role=status]')).toContainText('computed on your device',{timeout:90000});
  await page.getByRole('button',{name:'Evaluate six test images'}).click();await expect(page.locator('#evaluation-status')).toContainText('Completed 6 / 6',{timeout:90000});await expect(page.locator('#evaluation-progress')).toHaveAttribute('value','6');
  const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Evaluation JSON'}).click();expect((await pending).suggestedFilename()).toBe('lab6-live-evaluation.json');
});
test('responsive navigation, configuration and accessibility',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);
  await page.getByRole('button',{name:'Open navigation'}).click();await expect(page.locator('#main-nav')).toBeVisible();await page.locator('#main-nav a[href="#part1"]').count();await page.locator('#main-nav a[href="#experiments"]').click();await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','false');
  await page.getByRole('button',{name:'Configure website links'}).click();await expect(page.locator('#links-dialog')).toBeVisible();await page.locator('#compilation-url').fill('https://example.org/compilation');await page.getByRole('button',{name:'Save links'}).click();await expect(page.locator('#links-dialog')).toBeHidden();
  const layout=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,outside:[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,id:el.id,cls:el.className,x:el.getBoundingClientRect().x,right:el.getBoundingClientRect().right,width:el.getBoundingClientRect().width})).filter(e=>e.width>0&&(e.x<-.5||e.right>innerWidth+.5))}));
  console.log('Mobile layout after link configuration:',JSON.stringify(layout));
  expect(layout.width).toBeLessThanOrEqual(layout.viewport+1);
  await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'artifacts/mobile.png',fullPage:true});
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations).toEqual([]);
});
