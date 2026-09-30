import * as THREE from 'three';
import { LANDMARKS } from './CentralAxisBuildings.js';

export class SkyEnvironment {
  constructor(scene,uniforms){this.scene=scene;this.uniforms=uniforms;this.searchlights=[];}
  build(){
    const s=this.scene;
    s.background=new THREE.Color('#071a2c');s.fog=new THREE.FogExp2('#0c263b',.00029);
    this.skyDome=new THREE.Mesh(new THREE.SphereGeometry(4800,32,18),new THREE.ShaderMaterial({
      side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{uNight:this.uniforms.uNight},
      vertexShader:`varying float vHeight;void main(){vHeight=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float uNight;varying float vHeight;
        void main(){float h=smoothstep(-.08,.42,vHeight);
          vec3 night=mix(vec3(.105,.21,.30),vec3(.008,.024,.065),h);
          vec3 day=mix(vec3(.60,.79,.83),vec3(.16,.44,.66),h);
          gl_FragColor=vec4(mix(day,night,uNight),1.);}`
    }));s.add(this.skyDome);
    this.hemi=new THREE.HemisphereLight(0xcad9eb,0x385b6c,1.45);s.add(this.hemi);
    this.sun=new THREE.DirectionalLight(0xffdcc0,2.2);this.sun.position.set(-750,1250,800);
    this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);
    this.sun.shadow.camera.left=-1050;this.sun.shadow.camera.right=1050;
    this.sun.shadow.camera.top=1050;this.sun.shadow.camera.bottom=-1050;
    this.sun.shadow.camera.near=10;this.sun.shadow.camera.far=3500;
    this.sun.shadow.bias=-.00018;this.sun.shadow.radius=2;s.add(this.sun);
    const moon=new THREE.Mesh(new THREE.SphereGeometry(66,20,12),new THREE.MeshBasicMaterial({color:0xc1e8f7}));
    moon.position.set(-1720,1120,-2100);s.add(moon);this.moon=moon;
    this.makeSkyGlow();
    for(const [p,top] of [[LANDMARKS.ifc,432],[LANDMARKS.ctf,530]]) {
      const cone=new THREE.Mesh(new THREE.ConeGeometry(55,650,14,1,true),new THREE.ShaderMaterial({
        uniforms:{uNight:this.uniforms.uNight},transparent:true,blending:THREE.AdditiveBlending,
        depthWrite:false,side:THREE.DoubleSide,
        vertexShader:`varying vec3 vLocal;void main(){vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader:`uniform float uNight;varying vec3 vLocal;
          void main(){float h=clamp((vLocal.y+325.)/650.,0.,1.);
            float fade=smoothstep(0.,.17,h)*(1.-smoothstep(.65,1.,h));
            float a=.05*fade*uNight;
            gl_FragColor=vec4(.45,.86,1.,a);}`
      }));
      cone.position.set(p.x,top+325,p.z);cone.rotation.z=.34;s.add(cone);this.searchlights.push(cone);
    }
    const starsGeo=new THREE.BufferGeometry(),pts=[];
    for(let i=0;i<200;i++){const a=i*2.39996,r=700+Math.sqrt(i/200)*3200;pts.push(Math.cos(a)*r,850+(i*97)%1300,Math.sin(a)*r);}
    starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
    this.stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xaedbea,size:5,sizeAttenuation:true}));s.add(this.stars);
    return this;
  }
  makeSkyGlow(){
    const s=this.scene,u=this.uniforms;
    const mat=new THREE.ShaderMaterial({
      uniforms:{uNight:u.uNight,uTime:u.uTime},transparent:true,depthWrite:false,
      side:THREE.DoubleSide,blending:THREE.AdditiveBlending,
      vertexShader:`varying vec3 vLocal;void main(){vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform float uNight;uniform float uTime;varying vec3 vLocal;
      void main(){float edge=1.-smoothstep(.18,.5,max(abs(vLocal.x),abs(vLocal.z)));
        float up=1.-smoothstep(-.5,.5,vLocal.y);float haze=(.5+.5*sin(uTime*.15+vLocal.x*10.));
        gl_FragColor=vec4(vec3(.13,.43,.71)*edge*up*(.6+.4*haze),.07*uNight*edge*up);}`
    });
    const locations=[[-1450,-700],[-950,-970],[-400,-1250],[0,-1150],[400,-1050],[890,-930],[1450,-650],[-1700,710],[-850,850],[700,650],[1550,680]];
    const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,locations.length),o=new THREE.Object3D();
    locations.forEach(([x,z],i)=>{o.position.set(x,260,z);o.scale.set(430,600,430);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
    mesh.frustumCulled=false;mesh.instanceMatrix.needsUpdate=true;s.add(mesh);this.skyGlow=mesh;
  }
  update(t,night){
    this.scene.background.set('#071a2c').lerp(new THREE.Color('#acd4df'),1-night);
    this.scene.fog.color.copy(this.scene.background);this.scene.fog.density=.00027+night*.00009;
    this.hemi.intensity=.75+night*.35+(1-night)*1.35;
    this.sun.intensity=.18+2.4*(1-night);this.sun.color.set('#ffddbd');
    this.moon.visible=night>.2;this.stars.visible=night>.3;
    this.searchlights.forEach((c,i)=>{c.rotation.z=.29+Math.sin(t*.15+i*2)*.2;c.rotation.y=t*.09+i*2;c.visible=night>.35;});
  }
}
