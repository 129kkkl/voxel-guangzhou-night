import * as THREE from 'three';

export class TrafficSystem {
  constructor(scene,uniforms){this.scene=scene;this.uniforms=uniforms;this.density={value:1};}
  build(){
    const entries=[];
    // North and south block roads. They follow the 72 m lot pitch.
    for(const z of [-1458,-1314,-1170,-1026,-882,-738,-594,-450,510,654,798,942,1086,1230,1374])
      entries.push({x:0,z,len:4740,yaw:0});
    for(let x=-2232;x<=2232;x+=144){
      entries.push({x,z:-1040,len:1070,yaw:Math.PI/2});
      entries.push({x,z:1010,len:1110,yaw:Math.PI/2});
    }
    // Linjiang Avenue and the high-energy axis lanes.
    entries.push({x:0,z:-325,len:4950,yaw:0});
    entries.push({x:-195,z:-910,len:1050,yaw:Math.PI/2});
    entries.push({x:195,z:-910,len:1050,yaw:Math.PI/2});
    this.roadCount=entries.length;
    const geo=new THREE.PlaneGeometry(1,1);geo.rotateX(-Math.PI/2);
    const roadMat=new THREE.MeshStandardMaterial({color:0x1d2933,metalness:.2,roughness:.8,side:THREE.DoubleSide});
    const road=new THREE.InstancedMesh(geo,roadMat,entries.length),lights=new THREE.InstancedMesh(geo,
      new THREE.ShaderMaterial({
        uniforms:{uTime:this.uniforms.uTime,uNight:this.uniforms.uNight,uDensity:this.density},
        side:THREE.DoubleSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
        vertexShader:`varying vec2 vUv;varying float vLen;varying float vSeed;
          void main(){vUv=uv;vLen=length(instanceMatrix[0].xyz);vSeed=fract(instanceMatrix[3].x*.013+instanceMatrix[3].z*.019);
          gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
        fragmentShader:`uniform float uTime;uniform float uNight;uniform float uDensity;
          varying vec2 vUv;varying float vLen;varying float vSeed;
          void main(){float lane=step(vUv.y,.47);float y=lane>.5?.35:.65;
            float across=1.-smoothstep(.015,.10,abs(vUv.y-y));
            float pace=lane>.5?uTime*.65:-uTime*.52;
            float count=mix(18.,7.,1.-uDensity);
            float stream=fract(vUv.x*vLen/(count*1.9)+pace+vSeed);
            float head=1.-smoothstep(.012,.067,stream);
            float tail=exp(-stream*19.)*.42;
            float flicker=.78+.22*sin(uTime*3.+vSeed*40.);
            vec3 color=mix(vec3(1.,.15,.035),vec3(1.,.65,.20),lane);
            float a=(head+tail)*across*uNight*flicker;
            gl_FragColor=vec4(color*a*2.8,a*.82);}`
      }),entries.length);
    const obj=new THREE.Object3D();road.frustumCulled=lights.frustumCulled=false;
    entries.forEach((e,i)=>{
      obj.position.set(e.x,2.8,e.z);obj.rotation.set(0,e.yaw,0);obj.scale.set(e.len,22,1);obj.updateMatrix();road.setMatrixAt(i,obj.matrix);
      obj.position.y=3.04;obj.updateMatrix();lights.setMatrixAt(i,obj.matrix);
    });
    road.instanceMatrix.needsUpdate=lights.instanceMatrix.needsUpdate=true;
    this.scene.add(road,lights);return this;
  }
}
