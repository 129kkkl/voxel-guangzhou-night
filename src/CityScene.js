import * as THREE from 'three';
import GUI from 'lil-gui';
import { VoxelBatch,VoxelCity } from './VoxelCity.js';
import { CantonTowerMesh } from './CantonTowerMesh.js';
import { CentralAxisBuildings } from './CentralAxisBuildings.js';
import { RiverSystem } from './RiverSystem.js';
import { Bridges } from './Bridges.js';
import { SkyEnvironment } from './SkyEnvironment.js';
import { TrafficSystem } from './TrafficSystem.js';
import { PostEffects } from './PostEffects.js';
import { CameraRig } from './CameraRig.js';

export class CityScene {
  constructor(root,hud){
    this.root=root;this.hud=hud;this.scene=new THREE.Scene();
    this.renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance',alpha:false});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));
    this.renderer.setSize(innerWidth,innerHeight);this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
    this.renderer.shadowMap.enabled=false;this.renderer.shadowMap.type=THREE.PCFShadowMap;
    this.renderer.info.autoReset=false;
    root.appendChild(this.renderer.domElement);
    this.camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,1,7000);
    this.uniforms={uTime:{value:0},uNight:{value:1}};
    this.batch=new VoxelBatch(this.scene,this.uniforms);
    this.sky=new SkyEnvironment(this.scene,this.uniforms).build();
    this.river=new RiverSystem(this.scene,this.batch,this.uniforms).build();
    this.city=new VoxelCity(this.batch);this.buildingCount=this.city.generate();
    this.tower=new CantonTowerMesh(this.batch).build();
    new CentralAxisBuildings(this.batch).build();new Bridges(this.batch).build();
    this.batch.flush();this.city.createBillboards(this.scene,this.uniforms);
    this.traffic=new TrafficSystem(this.scene,this.uniforms).build();
    this.cameraRig=new CameraRig(this.camera,this.renderer.domElement);
    this.post=new PostEffects(this.renderer,this.scene,this.camera,this.uniforms);
    this.state={night:1,exposure:1.1,neonSpeed:.12,neonIntensity:1.25,neonWidth:55,neonHue:0,
      traffic:1,wave:1,reflection:1,bloomStrength:1.15,bloomRadius:.45,bloomThreshold:.68,
      smaa:true,autoOrbit:false};
    this.makeGUI();this.resize=()=>{
      this.renderer.setSize(innerWidth,innerHeight);this.camera.aspect=innerWidth/innerHeight;
      this.camera.updateProjectionMatrix();this.post.resize(innerWidth,innerHeight);
      if(innerWidth<700)this.gui.close();
    };
    addEventListener('resize',this.resize);
    this.last=performance.now();this.samples=0;this.fps=0;this.fpsTime=this.last;
    this.running=true;requestAnimationFrame(t=>this.frame(t));
    window.__VOXEL_GUANGZHOU__={scene:this,buildingCount:this.buildingCount,treeCount:this.river.treeCount};
  }
  makeGUI(){
    const g=new GUI({title:'体素广州 · 控制台',width:292});this.gui=g;
    g.add(this.state,'night',0,1,.01).name('昼夜 mix');
    g.add(this.state,'exposure',.35,2.5,.01).name('曝光');
    const n=g.addFolder('广州塔霓虹');
    n.add(this.state,'neonSpeed',0,.5,.005).name('滚动速度');
    n.add(this.state,'neonIntensity',0,3,.01).name('强度');
    n.add(this.state,'neonWidth',8,120,1).name('色带宽');
    n.add(this.state,'neonHue',0,1,.01).name('色相');
    n.close();
    const env=g.addFolder('水面与车流');
    env.add(this.state,'traffic',0,2,.01).name('车流密度');
    env.add(this.state,'wave',0,2,.01).name('体素波纹');
    env.add(this.state,'reflection',0,1,.01).name('镜面倒影');
    env.close();
    const fx=g.addFolder('后期');
    fx.add(this.state,'bloomStrength',0,3,.01).name('Bloom 强度');
    fx.add(this.state,'bloomRadius',0,1,.01).name('Bloom 半径');
    fx.add(this.state,'bloomThreshold',0,1,.01).name('Bloom 阈值');
    fx.add(this.state,'smaa').name('SMAA');
    fx.close();
    const cam=g.addFolder('镜头');
    this.cameraRig.presets.forEach((p,i)=>cam.add({go:()=>this.cameraRig.go(i)},'go').name(`${i+1}  ${p.label}`));
    cam.add(this.state,'autoOrbit').name('自动环绕');
    cam.close();
    if(innerWidth<700)g.close();
  }
  frame(now){
    if(!this.running)return;
    requestAnimationFrame(t=>this.frame(t));
    const dt=Math.min(.08,(now-this.last)/1000);this.last=now;
    this.uniforms.uTime.value+=dt;this.uniforms.uNight.value=this.state.night;
    this.renderer.toneMappingExposure=this.state.exposure*(1.15-.15*this.state.night);
    this.batch.neonParams.value.set(this.state.neonSpeed,this.state.neonIntensity,
      this.state.neonWidth,this.state.neonHue);
    this.traffic.density.value=this.state.traffic;
    this.river.wave.value=this.state.wave;this.river.reflectMix.value=this.state.reflection;
    this.post.bloom.strength=this.state.bloomStrength*(.04+.96*this.state.night);
    this.post.bloom.radius=this.state.bloomRadius;
    this.post.bloom.threshold=this.state.bloomThreshold;
    this.post.smaa.enabled=this.state.smaa;
    this.cameraRig.autoOrbit=this.state.autoOrbit;
    this.cameraRig.update(now,dt);this.sky.update(this.uniforms.uTime.value,this.state.night);
    this.renderer.shadowMap.enabled=this.state.night<.48;
    this.renderer.info.reset();this.post.render();this.samples++;
    if(now-this.fpsTime>600){this.fps=Math.round(this.samples*1000/(now-this.fpsTime));this.samples=0;this.fpsTime=now;
      const r=this.renderer.info.render;
      this.hud.innerHTML=`<b>GUANGZHOU / 体素新中轴</b><span>FPS ${this.fps} · DRAW ${r.calls} · TRI ${r.triangles.toLocaleString()}</span><span>CBD ${this.buildingCount.toLocaleString()} 栋 · 二沙岛 ${this.river.treeCount.toLocaleString()} 棵树</span><small>1–5 镜头　拖动环绕　滚轮缩放</small>`;
    }
  }
}
