import {test} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
test('inspect layout and accessibility',async({page})=>{
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:1000});await page.goto('./');await page.waitForFunction(()=>window.__LAB_READY__);
    const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,id:el.id,cls:el.className,x:el.getBoundingClientRect().x,right:el.getBoundingClientRect().right,width:el.getBoundingClientRect().width})).filter(e=>e.width>0&&(e.x<-.5||e.right>innerWidth+.5)));
    console.log('OVERFLOW',width,JSON.stringify(overflow));
    await page.screenshot({path:`artifacts/layout-${width}.png`,fullPage:true});
  }
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  await writeFile('artifacts/accessibility.json',JSON.stringify(results.violations,null,2));
  console.log('AXE',results.violations.map(v=>({id:v.id,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
});
