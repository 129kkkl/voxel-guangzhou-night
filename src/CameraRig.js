import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PRESETS=[
  {label:'A · 塔顶鸟瞰',position:[720,900,1070],target:[0,165,-370]},
  {label:'B · 塔下仰望',position:[100,18,585],target:[5,300,430]},
  {label:'C · 中轴漫游',position:[-15,90,-1190],target:[10,145,-20]},
  {label:'D · 珠江全景',position:[1100,290,-150],target:[0,160,160]},
  {label:'E · 二沙岛',position:[-2070,145,490],target:[-925,95,-180]}
];
export class CameraRig {
  constructor(camera,dom){
    this.camera=camera;this.controls=new OrbitControls(camera,dom);
    this.controls.enableDamping=true;this.controls.dampingFactor=.075;
    this.controls.maxDistance=3600;this.controls.minDistance=20;
    this.controls.maxPolarAngle=Math.PI*.49;
    this.presets=PRESETS;this.autoOrbit=false;this.tween=null;
    this.snap(3);
    window.addEventListener('keydown',e=>{
      const i=Number(e.key)-1;if(i>=0&&i<5&& !e.altKey&&!e.ctrlKey&&!e.metaKey)this.go(i);
    });
  }
  snap(i){const p=PRESETS[i];this.camera.position.set(...p.position);this.controls.target.set(...p.target);this.controls.update();}
  go(i){const p=PRESETS[i];this.tween={start:performance.now(),fromP:this.camera.position.clone(),
    fromT:this.controls.target.clone(),toP:new THREE.Vector3(...p.position),toT:new THREE.Vector3(...p.target)};}
  update(now,dt){
    if(this.tween){const q=this.tween,t=Math.min(1,(now-q.start)/1450),e=t*t*(3-2*t);
      this.camera.position.copy(q.fromP).lerp(q.toP,e);this.controls.target.copy(q.fromT).lerp(q.toT,e);
      if(t>=1)this.tween=null;
    }else if(this.autoOrbit){const a=dt*.075,p=this.camera.position,c=this.controls.target;
      const dx=p.x-c.x,dz=p.z-c.z;p.x=c.x+dx*Math.cos(a)-dz*Math.sin(a);p.z=c.z+dx*Math.sin(a)+dz*Math.cos(a);}
    this.controls.update();
  }
}
