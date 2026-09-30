import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.resolve(root,'..','交互作品_离线HTML','体素广州_新中轴夜景_离线版.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
if(scripts.length!==1)throw Error(`expected one inline script, found ${scripts.length}`);
new vm.Script(scripts[0][1]);
if(/<(script|link|img)[^>]+(?:src|href)\s*=\s*["']?https?:/i.test(html))throw Error('automatic remote resource');
if(/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/.test(scripts[0][1]))throw Error('network API found');
if(html.indexOf('id="app"')>html.indexOf('<script>'))throw Error('root after script');
for(const key of ['CityScene','VoxelCity','CantonTowerMesh','RiverSystem','Bridges','SkyEnvironment','PostEffects','CameraRig'])
  if(!fs.readFileSync(path.join(root,'src',key+'.js'),'utf8'))throw Error('missing module '+key);
console.log(`VALIDATION_OK INLINE_JS_PARSE=OK REMOTE_AUTO_RESOURCES=0 NETWORK_API_CALLS=0 BYTES=${Buffer.byteLength(html)}`);
