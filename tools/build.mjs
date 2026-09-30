import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const out=path.resolve(root,'..','交互作品_离线HTML','体素广州_新中轴夜景_离线版.html');
const result=await build({entryPoints:[path.join(root,'src','main.js')],bundle:true,write:false,
  format:'iife',platform:'browser',target:'es2020',minify:true,charset:'utf8',legalComments:'none'});
const js=result.outputFiles[0].text;
const css=await fs.readFile(path.join(root,'src','style.css'),'utf8');
const tpl=await fs.readFile(path.join(root,'src','template.html'),'utf8');
const html=tpl.replace('/* INLINE_CSS */',css).replace('/* INLINE_JS */',js.replace(/<\/script/gi,'<\\/script'));
await fs.writeFile(out,html,'utf8');
console.log(`BUILD_OK ${out} ${Buffer.byteLength(html)} bytes`);
