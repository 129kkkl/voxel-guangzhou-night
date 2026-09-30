import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mulberry32, geoToLocal } from './geo.js';

function polygon(points,color,y=2.1) {
  const shape=new THREE.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshStandardMaterial({color,roughness:.94}));
  mesh.rotation.x=-Math.PI/2; mesh.position.y=y; mesh.receiveShadow=true;return mesh;
}

export class RiverSystem {
  constructor(scene,batch,uniforms){this.scene=scene;this.b=batch;this.uniforms=uniforms;this.frame=0;this.wave={value:1};this.reflectMix={value:1};}
  build(){
    const s=this.scene,b=this.b;
    // A single river datum is masked by correctly ordered banks and islands.
    const mirror=new Reflector(new THREE.PlaneGeometry(5100,870),{
      textureWidth:768,textureHeight:384,clipBias:.006,color:0x5a819a
    });
    mirror.rotation.x=-Math.PI/2;mirror.position.set(0,-.12,40);
    mirror.getRenderTarget().texture.type=THREE.HalfFloatType;
    mirror.material.colorWrite=false;mirror.material.depthWrite=false;
    const original=mirror.onBeforeRender.bind(mirror);
    mirror.onBeforeRender=(...args)=>{this.frame++;if(this.frame%2===0)original(...args);};
    s.add(mirror);this.mirror=mirror;
    const water=new THREE.Mesh(new THREE.PlaneGeometry(5100,870,638,109),new THREE.ShaderMaterial({
      uniforms:{uTime:this.uniforms.uTime,uNight:this.uniforms.uNight,uWave:this.wave,
        uReflect:this.reflectMix,tReflection:{value:mirror.getRenderTarget().texture},
        textureMatrix:{value:mirror.material.uniforms.textureMatrix.value}},
      vertexShader:`uniform float uTime;uniform float uWave;uniform mat4 textureMatrix;
      varying vec3 vWorld; varying vec4 vMirror;
      void main(){vec3 p=position;
        float wave=sin(p.x*.042+uTime*.75)*.85+sin(p.y*.051-uTime*.57)*.64;
        p.z += floor(wave*2.0)*.24*uWave;
        vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;vMirror=textureMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*viewMatrix*world;}`,
      fragmentShader:`uniform float uTime;uniform float uNight;uniform float uReflect;uniform sampler2D tReflection;
      varying vec3 vWorld;varying vec4 vMirror;
      void main(){vec2 uv=vMirror.xy/vMirror.w;
        vec2 ripple=vec2(sin(vWorld.x*.067+uTime*.8),cos(vWorld.z*.058-uTime*.7))*.002;
        vec3 reflected=texture2D(tReflection,uv+ripple).rgb;
        float glint=pow(max(0.,sin(vWorld.x*.13+uTime*.8)*sin(vWorld.z*.08-uTime*.4)),13.);
        vec3 base=mix(vec3(.18,.35,.39),vec3(.018,.07,.12),uNight);
        vec3 c=mix(base,reflected,clamp(uReflect,0.,1.)*(.72+.19*uNight));
        c+=vec3(.025,.12,.19)*glint*uNight;
        gl_FragColor=vec4(c,1.);}`
    }));
    water.rotation.x=-Math.PI/2;water.position.set(0,.04,40);water.receiveShadow=false;s.add(water);this.water=water;
    const bankColor='#17282d';
    s.add(polygon([[-2600,-1800],[2600,-1800],[2600,-310],[420,-310],[240,-295],[-350,-310],[-2600,-320]],bankColor));
    s.add(polygon([[-2600,390],[2600,380],[2600,1750],[-2600,1750]],'#182831'));
    // Ersha Island follows the western channel; the north channel remains open.
    s.add(polygon([[-2430,28],[-2250,-4],[-1850,-28],[-1350,-10],[-890,45],[-760,132],[-950,295],[-1430,348],[-1990,345],[-2420,275]],'#1c4439',2.5));
    // Haixinsha is a separate long island between the front channel and Linjiang Avenue.
    s.add(polygon([[-307,-254],[-205,-278],[180,-277],[335,-205],[300,-105],[150,-76],[-225,-99],[-324,-164]],'#294342',2.6));
    this.banks();this.erSha();
    return this;
  }
  banks(){
    const b=this.b;
    for(let x=-2520;x<2500;x+=16){
      b.voxelBox(x,4.4,-311,15,2,3,'#49c4d5','glow');
      b.voxelBox(x,4.4,389,15,2,3,'#e6b36a','glow');
      if(x>-280&&x<290) b.voxelBox(x,4,-265,15,2,3,'#72dce4','glow');
    }
    for(let x=-2320;x<-900;x+=18){b.voxelBox(x,4.4,319,16,2,2,'#46c7bc','glow');}
  }
  erSha(){
    const b=this.b,rnd=mulberry32(225500);
    let planted=0,tries=0;
    while(planted<2100 && tries<12000){
      tries++;const x=-2370+rnd()*1460,z=25+rnd()*283;
      const eastMask=x>-1300? .62*(x+1300):0;
      if(z<38+eastMask*.17||z>318-eastMask*.2||rnd()<.035) continue;
      const h=6+Math.floor(rnd()*5)*2;
      b.voxelBox(x,4+h/2,z,1.7,h,1.7,'#72583d');
      b.voxelBox(x,5+h,z,2,2,2,'#286347','foliage');
      b.voxelBox(x+1.4,5+h,z,2,2,2,rnd()<.45?'#318a5a':'#3d9760','foliage');
      b.voxelBox(x-1.2,5+h+1.7,z+.7,2,2,2,'#256e4e','foliage');
      planted++;
    }
    this.treeCount=planted;
    const p=geoToLocal(23.1104300,113.3000436);
    // Xinghai Concert Hall, two stepped voxel shells.
    b.voxelBox(p.x,5,p.z,112,8,74,'#576658');
    for(let shell of [-1,1]) for(let y=0;y<9;y++) {
      const rx=(shell<0?42:31)*Math.sqrt(1-Math.pow(y/10,2));
      const cx=p.x+shell*31;
      b.voxelBox(cx,11+y*4,p.z,Math.max(8,rx*2),4,Math.max(8,rx*1.38),'#d6d9bd','solid');
      if(y%2===0) b.voxelBox(cx,13+y*4,p.z+rx*.69,rx*1.5,2,2,'#f6c685','glow');
    }
  }
}
