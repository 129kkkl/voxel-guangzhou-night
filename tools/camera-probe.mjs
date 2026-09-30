import { chromium } from 'playwright-core';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root=path.resolve(import.meta.dirname,'..');
const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true,
  args:['--enable-unsafe-swiftshader','--use-angle=swiftshader','--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto(pathToFileURL(path.resolve(root,'..','交互作品_离线HTML','体素广州_新中轴夜景_离线版.html')).href);
await page.waitForFunction(()=>!!window.__VOXEL_GUANGZHOU__,null,{timeout:120000});
const candidates=[
  [[-110,300,-1020],[0,170,380]],
  [[1100,290,-150],[0,160,160]],
  [[0,180,-390],[0,185,430]],
  [[-650,210,-310],[0,160,430]]
];
for(let i=0;i<candidates.length;i++){
  const [pos,target]=candidates[i];
  await page.evaluate(({pos,target})=>{const s=window.__VOXEL_GUANGZHOU__.scene;
    s.cameraRig.tween=null;s.camera.position.set(...pos);s.cameraRig.controls.target.set(...target);
    s.cameraRig.controls.update();document.querySelector('.lil-gui').style.display='none';}, {pos,target});
  await page.waitForTimeout(1900);
  await page.screenshot({path:path.join(root,`probe-${i+1}.png`)});
}
await browser.close();
