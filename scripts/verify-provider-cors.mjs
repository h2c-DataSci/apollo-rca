import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.argv[2]+'/playwright/index.mjs'));
const browser=await chromium.launch({channel:'msedge',headless:true,timeout:60000});
try {
 const page=await browser.newPage();
 await page.route('https://h2c-datasci.github.io/apollo-rca/',r=>r.fulfill({contentType:'text/html',body:'<title>Credential-free browser connectivity test</title>'}));
 await page.goto('https://h2c-datasci.github.io/apollo-rca/');
 const results=await page.evaluate(async()=>Promise.all(['https://api.groq.com/openai/v1/models','https://openrouter.ai/api/v1/models','https://api.openai.com/v1/models'].map(async url=>{try { const r=await fetch(url,{headers:{Authorization:'Bearer synthetic-invalid-key'},signal:AbortSignal.timeout(10000)}); return {url,status:r.status,browserReadable:true}; } catch(e){return {url,browserReadable:false,error:e.name};}})));
 console.log(JSON.stringify(results));
} finally {await browser.close();}
