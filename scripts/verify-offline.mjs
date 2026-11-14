import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.argv[2]+'/playwright/index.mjs'));
const browser=await chromium.launch({channel:'msedge',headless:true,timeout:60000});
try {
 const context=await browser.newContext();
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:8080/apollo-rca/');
 await page.locator('.h2c-session-notice').waitFor();
 const cachesFound=await page.evaluate(async()=>{await navigator.serviceWorker.ready;return await caches.keys();});
 assert.ok(cachesFound.includes('apollo-rca-shell-v28'));
 const cachedModules=await page.evaluate(async()=>{const cache=await caches.open('apollo-rca-shell-v28');return (await cache.keys()).map(r=>new URL(r.url).pathname);});
 assert.ok(cachedModules.includes('/apollo-rca/session-store.js'));
 assert.ok(cachedModules.includes('/apollo-rca/provider-presets.js'));
 await context.setOffline(true);
 await page.reload();
 await page.locator('.h2c-session-notice').waitFor();
 await page.getByRole('button',{name:'RCA Coach',exact:true}).click();
 await page.locator('.h2c-local-bridge-card').waitFor();
 console.log(JSON.stringify({offlineShell:true,coachControls:true,caches:cachesFound}));
} finally {await browser.close();}
