import * as THREE from 'three';
import { mulberry32, snap4 } from './geo.js';

function windowAtlas() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d'); const rnd = mulberry32(6688);
  for (let tile = 0; tile < 64; tile++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const lit = rnd() < (0.58 + (tile % 5) * 0.045);
    const color = lit ? (rnd() < .57 ? '#ffd89c' : '#b5eaff') : '#07131e';
    ctx.fillStyle = color; ctx.fillRect((tile%8)*16+x, Math.floor(tile/8)*16+y, 1, 1);
  }
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; return tex;
}

function makeFacade(uniforms, atlas) {
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: .35, roughness: .34 });
  mat.onBeforeCompile = s => {
    s.uniforms.uNight = uniforms.uNight; s.uniforms.uTime = uniforms.uTime;
    s.uniforms.uWindowAtlas = { value: atlas };
    s.vertexShader = s.vertexShader.replace('void main() {',
      'varying vec2 vWindowGrid; varying float vWindowSeed; varying float vWindowWall; void main() {');
    s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 cubeSize = vec3(length(instanceMatrix[0].xyz),length(instanceMatrix[1].xyz),length(instanceMatrix[2].xyz));
      vec3 cubePos = position * cubeSize;
      vWindowGrid = abs(normal.x) > .5 ? vec2(cubePos.z,cubePos.y)/4.0 : vec2(cubePos.x,cubePos.y)/4.0;
      vWindowWall = 1.0 - abs(normal.y);
      vWindowSeed = fract((instanceMatrix[3].x * .017 + instanceMatrix[3].z * .031) * .071);`);
    s.fragmentShader = s.fragmentShader.replace('void main() {',
      'uniform float uNight; uniform float uTime; uniform sampler2D uWindowAtlas; varying vec2 vWindowGrid; varying float vWindowSeed; varying float vWindowWall; void main() {');
    s.fragmentShader = s.fragmentShader.replace('#include <tonemapping_fragment>', `
      vec2 gridCell = floor(vWindowGrid);
      vec2 gridFract = fract(vWindowGrid);
      float seedCell = floor(vWindowSeed * 64.0);
      vec2 tile = vec2(mod(seedCell,8.0),floor(seedCell/8.0));
      vec2 atlasUV = (tile*16.0 + mod(gridCell,16.0) + .5)/128.0;
      vec3 lamp = texture2D(uWindowAtlas,atlasUV).rgb;
      float mask = step(.17,gridFract.x)*step(gridFract.x,.83)*step(.18,gridFract.y)*step(gridFract.y,.77);
      float life = step(.045,fract(sin(dot(gridCell,vec2(12.9898,78.233))+vWindowSeed*90.0)*43758.5453 + floor(uTime*.15)*.008));
      float glow = uNight * vWindowWall * mask * life;
      gl_FragColor.rgb += lamp * glow * 1.18;
      gl_FragColor.rgb *= 1.0 - .16*uNight*vWindowWall*(1.0-mask);
      #include <tonemapping_fragment>`);
  };
  mat.customProgramCacheKey = () => 'voxel-windows-v2';
  return mat;
}

function makeTowerNeon(uniforms, params) {
  const mat = new THREE.MeshStandardMaterial({color:0xb5dce8,metalness:.55,roughness:.27});
  mat.onBeforeCompile = s => {
    s.uniforms.uTime=uniforms.uTime; s.uniforms.uNight=uniforms.uNight; s.uniforms.uNeonParams=params;
    s.vertexShader=s.vertexShader.replace('void main() {','varying float vTowerY; void main() {');
    s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      vTowerY = (instanceMatrix * vec4(position,1.0)).y;`);
    s.fragmentShader=s.fragmentShader.replace('void main() {','uniform float uTime; uniform float uNight; uniform vec4 uNeonParams; varying float vTowerY; void main() {');
    s.fragmentShader=s.fragmentShader.replace('#include <tonemapping_fragment>',`
      float phase = vTowerY/max(6.0,uNeonParams.z) - uTime*uNeonParams.x;
      vec3 ribbon = .5+.5*cos(6.2831853*(vec3(0.0,.33,.67)+phase+uNeonParams.w));
      gl_FragColor.rgb += ribbon * (.88*uNeonParams.y*uNight);
      #include <tonemapping_fragment>`);
  };
  mat.customProgramCacheKey=()=> 'tower-rainbow-v1'; return mat;
}

export class VoxelBatch {
  constructor(scene, uniforms) {
    this.scene = scene; this.uniforms = uniforms; this.unit = new THREE.BoxGeometry(1,1,1);
    this.items = { glass: [], solid: [], glow: [], foliage: [], tower: [] };
    this.dummy = new THREE.Object3D(); this.atlas = windowAtlas(); this.meshes = [];
    this.neonParams = { value: new THREE.Vector4(.12,1.25,55,0) };
  }
  voxelBox(x,y,z,w,h,d,color,type='solid',ry=0) {
    if (w<=0 || h<=0 || d<=0) return;
    this.items[type].push({ x,y,z,w,h,d,color,ry });
  }
  flush() {
    const materials = {
      glass: makeFacade(this.uniforms,this.atlas),
      solid: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .76, metalness: .08 }),
      glow: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
      foliage: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }),
      tower: makeTowerNeon(this.uniforms,this.neonParams)
    };
    materials.glow.onBeforeCompile = s => {
      s.uniforms.uNight=this.uniforms.uNight;s.uniforms.uTime=this.uniforms.uTime;
      s.fragmentShader=s.fragmentShader.replace('void main() {','uniform float uNight; uniform float uTime; void main() {');
      s.fragmentShader=s.fragmentShader.replace('#include <tonemapping_fragment>',
        'gl_FragColor.rgb *= (0.08 + .92*uNight) * (0.88 + 0.12*sin(uTime*2.2));\n#include <tonemapping_fragment>');
    };
    materials.glow.customProgramCacheKey=()=> 'night-glow-v1';
    materials.foliage.onBeforeCompile = s => {
      s.uniforms.uTime=this.uniforms.uTime;
      s.vertexShader=s.vertexShader.replace('void main() {','uniform float uTime; void main() {');
      s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed.x += sin(uTime*1.5 + instanceMatrix[3].x*.013 + instanceMatrix[3].z*.017)*.33;');
    };
    materials.foliage.customProgramCacheKey=()=> 'wind-leaves-v1';
    for (const [type,items] of Object.entries(this.items)) {
      if (!items.length) continue;
      const mesh = new THREE.InstancedMesh(this.unit, materials[type],items.length);
      mesh.name = `VOXELS_${type.toUpperCase()}`; mesh.frustumCulled = false;
      for (let i=0;i<items.length;i++) {
        const q=items[i]; this.dummy.position.set(q.x,q.y,q.z);
        this.dummy.rotation.set(0,q.ry,0); this.dummy.scale.set(q.w,q.h,q.d); this.dummy.updateMatrix();
        mesh.setMatrixAt(i,this.dummy.matrix); mesh.setColorAt(i,new THREE.Color(q.color));
      }
      mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
      mesh.castShadow = type==='glass'; mesh.receiveShadow = type!=='glow';
      this.scene.add(mesh); this.meshes.push(mesh);
    }
    this.items = { glass: [], solid: [], glow: [], foliage: [], tower: [] };
    return this.meshes;
  }
}

export class VoxelCity {
  constructor(batch) { this.batch=batch; this.count=0; this.roofBeacons=[]; this.billboards=[]; }
  generate() {
    const b=this.batch, rnd=mulberry32(25092026);
    const facades=['#2a4659','#39546a','#24394d','#597487','#1f3c51','#426273','#6c7985','#33475b'];
    for(let z=-1572;z<=1512;z+=72) for(let x=-2304;x<=2304;x+=72) {
      const frontRiver = z>-290 && z<380;
      const axis = Math.abs(x)<156 && z<-290 && z>-1120;
      const cultural = z>-770 && z<-290 && Math.abs(x)<560;
      const towerExclusion = Math.abs(x)<160 && z>360 && z<600;
      const twinExclusion = z<-650 && z>-1010 && Math.abs(x)<330;
      if(frontRiver||axis||cultural||towerExclusion||twinExclusion||rnd()>.87) continue;
      const w=snap4(32+rnd()*28),d=snap4(32+rnd()*28);
      const decay=1/(1+Math.abs(x)/1350);
      let h=snap4(Math.min(335,(26+Math.pow(rnd(),2.25)*390)*decay*(z>380?.66:1)));
      h=Math.max(16,h);
      this.makeBuilding(x+(rnd()-.5)*9,z+(rnd()-.5)*9,w,d,h,facades[Math.floor(rnd()*facades.length)],rnd);
      this.count++;
    }
    return this.count;
  }
  makeBuilding(x,z,w,d,h,color,rnd) {
    const b=this.batch;
    const tiers=3+Math.floor(rnd()*5); let y=2, remaining=h;
    const topWidth=w,topDepth=d;
    for(let t=0;t<tiers;t++) {
      const part=t===tiers-1?remaining:snap4(Math.max(4,(h-y)*(.16+rnd()*.26)));
      remaining-=part;
      const shrink=t===0?0:Math.floor(t*.8)*4;
      const ww=Math.max(12,topWidth-shrink),dd=Math.max(12,topDepth-shrink);
      const ox=t>1?(rnd()-.5)*8:0,oz=t>1?(rnd()-.5)*8:0;
      b.voxelBox(x+ox,y+part/2,z+oz,ww,part,dd,color,'glass');
      if(t>0) {
        b.voxelBox(x+ox,y+.8,z+oz,ww+4,1.6,dd+4,t%2?'#53c7e6':'#cfaa77','solid');
      }
      y+=part;
      if(remaining<=4) break;
    }
    const roofY=2+h;
    b.voxelBox(x,roofY+2,z,w*.68,4,d*.68,'#182e3c');
    b.voxelBox(x+(rnd()-.5)*w*.3,roofY+5,z+(rnd()-.5)*d*.3,Math.max(4,w*.23),6,Math.max(4,d*.2),'#1c3442');
    if(h>85) {
      const neon=rnd()<.5?'#22d8ef':'#ffc061';
      b.voxelBox(x,roofY+1,z+d/2,w,2,2,neon,'glow');
      b.voxelBox(x,roofY+1,z-d/2,w,2,2,neon,'glow');
      b.voxelBox(x-w/2,roofY+1,z,2,2,d,neon,'glow');
      if(rnd()<.35) {
        b.voxelBox(x,roofY+10,z,2,16,2,'#708c9b');
        b.voxelBox(x,roofY+19,z,3,3,3,'#ff284b','glow');
        this.roofBeacons.push({x,y:roofY+19,z});
      }
      if(h>125 && rnd()<.25) this.billboards.push({x,y:roofY+9,z:z+d/2+1,w:Math.min(21,w*.55),h:10});
    }
  }
  createBillboards(scene,uniforms) {
    if(!this.billboards.length) return;
    const material = new THREE.ShaderMaterial({
      transparent:true,depthWrite:false,side:THREE.DoubleSide,
      uniforms:{uTime:uniforms.uTime,uNight:uniforms.uNight},
      vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float uTime;uniform float uNight;varying vec2 vUv;
      void main(){float border=step(.04,vUv.x)*step(.04,vUv.y)*step(vUv.x,.96)*step(vUv.y,.96);
      float bars=step(.52,sin(vUv.x*45.+sin(vUv.y*11.)*3.)*.5+.5);
      float scan=.67+.33*sin(vUv.y*125.-uTime*3.);
      vec3 c=mix(vec3(.08,.7,1.),vec3(1.,.18,.58),step(.5,vUv.x));
      c*=bars*scan*1.9*uNight; c+=vec3(.03,.09,.13);
      c=mix(vec3(.01,.03,.06),c,border);
      gl_FragColor=vec4(c,mix(.15,.92,uNight));}`
    });
    const mesh=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),material,this.billboards.length);
    const o=new THREE.Object3D(); mesh.frustumCulled=false;
    this.billboards.forEach((q,i)=>{o.position.set(q.x,q.y,q.z);o.scale.set(q.w,q.h,1);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
    mesh.instanceMatrix.needsUpdate=true;scene.add(mesh);
  }
}
