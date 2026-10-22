import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import AxeBuilder from '@axe-core/playwright';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','5180','--strictPort'],{env:{...process.env,VITE_FORMSPREE_ENDPOINT:'https://formspree.io/f/testform'},stdio:'ignore'});
let browser;
try {
let ready=false;
for(let i=0;i<100;i++){
 if(server.exitCode !== null) throw new Error('Test server exited; check that port 5180 is available.');
 try{if((await fetch('http://127.0.0.1:5180')).ok){ready=true;break;}}catch{}
 await new Promise(r=>setTimeout(r,100));
}
if(!ready) throw new Error('Test server did not become ready.');
browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage();let sent=0;let fail=false;
await page.route('https://formspree.io/**',async r=>{sent++;assert(r.request().postData().includes('Test Brand'));assert(r.request().postData().includes('test@example.test'));await r.fulfill({status:fail?422:200,contentType:'application/json',body:JSON.stringify(fail?{errors:[{message:'Unavailable'}]}:{ok:true})});});
await page.goto('http://127.0.0.1:5180/contact');
const menu=page.getByRole('button',{name:'Open menu',exact:true});await menu.click();await page.waitForTimeout(350);assert.equal(await page.getByRole('button',{name:'Close menu',exact:true}).evaluate(e=>e===document.activeElement),true);
await page.keyboard.press('Shift+Tab');assert.equal(await page.getByRole('dialog').getByText('Start a Campaign',{exact:true}).evaluate(e=>e===document.activeElement),true);await page.keyboard.press('Tab');assert.equal(await page.getByRole('button',{name:'Close menu',exact:true}).evaluate(e=>e===document.activeElement),true);
await page.keyboard.press('Escape');await page.waitForTimeout(400);assert.equal(await menu.evaluate(e=>e===document.activeElement),true);console.log('PASS mobile menu focus entry, wrap, Escape and restoration');
await page.getByRole('button',{name:'Send Brief',exact:true}).click();assert.equal(sent,0);assert(await page.locator('input:invalid').count()>0);console.log('PASS empty form blocked without network request');
await page.locator('input[name="brand"]').fill('Test Brand');await page.locator('input[name="email"]').fill('test@example.test');await page.locator('textarea[name="outline"]').fill('A test brief that must never send real email');await page.getByRole('button',{name:'Send Brief',exact:true}).click();await page.getByRole('status').filter({hasText:'Submission completed.'}).waitFor();assert.equal(sent,1);console.log('PASS multipart Formspree submission and announced success (mocked; no email sent)');
fail=true;await page.getByRole('button',{name:'Send Brief',exact:true}).evaluate(button=>button.click());await page.getByRole('status').filter({hasText:'not been sent'}).waitFor();assert.equal(await page.locator('input[name="brand"]').inputValue(),'Test Brand');console.log('PASS failure preserves fields and does not claim delivery');
await page.goto('http://127.0.0.1:5180/roster');assert.equal(await page.locator('video[src]').count(),0);await page.getByRole('link',{name:"View Alissa Eady's WEARD profile",exact:true}).click();await page.waitForURL('**/creators/alissa-eady');console.log('PASS mobile roster avoids automatic video requests; profile navigation works');
for(const width of [390,1280]) {
 const auditContext=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce',bypassCSP:true});
 const auditPage=await auditContext.newPage();
 await auditPage.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 for(const route of ['/','/roster','/creators/alissa-eady','/contact']) {
  await auditPage.goto('http://127.0.0.1:5180'+route);
  await auditPage.waitForTimeout(2300);
  assert.equal(await auditPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const results=await new AxeBuilder({page:auditPage}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  assert.deepEqual(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
  console.log('PASS accessibility and overflow',width,route);
 }
 await auditContext.close();
}
await browser.close();
} finally { await browser?.close(); server.kill(); }

