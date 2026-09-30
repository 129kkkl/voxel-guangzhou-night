import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const html=path.resolve(root,'..','交互作品_离线HTML','体素广州_新中轴夜景_离线版.html');
const exe='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if(!fs.existsSync(exe))throw Error('Chrome not found: '+exe);
const hardware=process.argv.includes('--hardware');
const browser=await chromium.launch({executablePath:exe,headless:true,
  args:hardware?['--enable-gpu-rasterization','--no-sandbox']:
    ['--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-gpu-sandbox','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];const warnings=[];
page.on('pageerror',e=>errors.push(`PAGE ${e.message}`));
page.on('console',m=>{if(m.type()==='error')errors.push(`CONSOLE ${m.text()}`);else if(m.type()==='warning')warnings.push(m.text());});
page.on('requestfailed',r=>errors.push(`REQUEST ${r.url()} ${r.failure()?.errorText}`));
await page.goto(pathToFileURL(html).href,{waitUntil:'load',timeout:30000});
await page.waitForFunction(()=>!!window.__VOXEL_GUANGZHOU__,null,{timeout:120000});
await page.waitForTimeout(6000);
const status=await page.evaluate(()=>({
  loading:!!document.getElementById('loading'),
  hud:document.getElementById('hud').innerText,
  buildingCount:window.__VOXEL_GUANGZHOU__.buildingCount,
  treeCount:window.__VOXEL_GUANGZHOU__.treeCount,
  calls:window.__VOXEL_GUANGZHOU__.scene.renderer.info.render.calls,
  triangles:window.__VOXEL_GUANGZHOU__.scene.renderer.info.render.triangles,
  webgl:!!document.querySelector('canvas'),
  glRenderer:(()=>{const gl=window.__VOXEL_GUANGZHOU__.scene.renderer.getContext();
    const ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);})()
}));
await page.screenshot({path:path.join(root,'browser-night.png')});
await page.keyboard.press('1');
await page.waitForTimeout(1700);
await page.screenshot({path:path.join(root,'browser-axis.png')});
await page.keyboard.press('2');
await page.waitForTimeout(1800);
const beforeDrag=await page.evaluate(()=>window.__VOXEL_GUANGZHOU__.scene.camera.position.toArray());
await page.mouse.move(690,520);await page.mouse.down();await page.mouse.move(780,545,{steps:5});await page.mouse.up();
await page.waitForTimeout(500);
const afterDrag=await page.evaluate(()=>window.__VOXEL_GUANGZHOU__.scene.camera.position.toArray());
await page.mouse.wheel(0,-220);await page.waitForTimeout(500);
const afterZoom=await page.evaluate(()=>window.__VOXEL_GUANGZHOU__.scene.camera.position.toArray());
await page.evaluate(()=>window.__VOXEL_GUANGZHOU__.scene.state.night=0);
await page.waitForTimeout(1800);
await page.screenshot({path:path.join(root,'browser-day.png')});
await page.setViewportSize({width:390,height:844});
await page.keyboard.press('5');
await page.waitForTimeout(1800);
const mobile=await page.evaluate(()=>({w:innerWidth,canvasW:document.querySelector('canvas').clientWidth,
  hudVisible:!!document.getElementById('hud').getBoundingClientRect().height,
  guiCollapsed:window.__VOXEL_GUANGZHOU__.scene.gui._closed}));
await page.screenshot({path:path.join(root,'browser-mobile.png')});
await browser.close();
const interaction={drag:beforeDrag.some((v,i)=>Math.abs(v-afterDrag[i])>1),
  zoom:afterDrag.some((v,i)=>Math.abs(v-afterZoom[i])>1)};
console.log(JSON.stringify({status,mobile,interaction,errors,warnings},null,2));
if(status.buildingCount<1500||status.treeCount<2000||status.loading||!interaction.drag||!interaction.zoom||errors.length)process.exitCode=1;
