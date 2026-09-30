import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

export class PostEffects {
  constructor(renderer,scene,camera,uniforms){
    this.renderer=renderer;this.composer=new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene,camera));
    this.bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.15,.45,.68);
    this.composer.addPass(this.bloom);
    this.grade=new ShaderPass({
      uniforms:{tDiffuse:{value:null},uNight:uniforms.uNight},
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform sampler2D tDiffuse;uniform float uNight;varying vec2 vUv;
      void main(){vec3 col=texture2D(tDiffuse,vUv).rgb;
        float luma=dot(col,vec3(.2126,.7152,.0722));
        col=mix(vec3(luma),col,1.08+.16*uNight);
        col=mix(col,col*vec3(.91,1.,1.09),.5*uNight);
        float r=length((vUv-.5)*vec2(1.12,1.));
        col*=1.-smoothstep(.35,.82,r)*(.15+.16*uNight);
        gl_FragColor=vec4(col,1.);}`
    });
    this.composer.addPass(this.grade);
    this.smaa=new SMAAPass(innerWidth,innerHeight);
    this.composer.addPass(this.smaa);
    this.resize(innerWidth,innerHeight);
  }
  resize(w,h){this.composer.setSize(w,h);this.bloom.setSize(w,h);this.smaa.setSize(w,h);}
  render(){this.composer.render();}
}
