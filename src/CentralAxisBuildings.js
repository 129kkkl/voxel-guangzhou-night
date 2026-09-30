import { geoToLocal } from './geo.js';

const P={
  opera:geoToLocal(23.1177657,113.3167493), museum:geoToLocal(23.1174004,113.3214163),
  library:geoToLocal(23.1188425,113.3205690), ifc:geoToLocal(23.1202510,113.3178641),
  ctf:geoToLocal(23.1205531,113.3208773), haixinsha:geoToLocal(23.1144924,113.3186405)
};
export { P as LANDMARKS };

export class CentralAxisBuildings {
  constructor(batch){this.b=batch;}
  build(){this.opera();this.museum();this.library();this.haixinsha();this.twinTowers();this.plaza();}
  opera(){
    const b=this.b,{x,z}=P.opera;
    b.voxelBox(x,4,z,156,8,112,'#26303c');
    for(let side of [-1,1]) for(let level=0;level<7;level++) {
      const w=side===-1?83:57, d=side===-1?66:51;
      b.voxelBox(x+side*30+level*side*3,12+level*6,z+side*11,w-level*7,6,d-level*6,
        side===-1?(level%2?'#1c2530':'#38444d'):(level%2?'#e7edf0':'#abbcc1'),'solid',side*.07);
    }
    for(let k=-3;k<=3;k++) b.voxelBox(x+k*13,36,z-36,3,28,2,'#91f1ff','glow',.32);
  }
  museum(){
    const b=this.b,{x,z}=P.museum;
    b.voxelBox(x,5,z,100,10,90,'#27313d');
    b.voxelBox(x,22,z,79,30,70,'#b0cee0','glow');
    b.voxelBox(x,45,z,104,51,94,'#2e4254','solid');
    b.voxelBox(x,73,z,108,7,98,'#485d70','solid');
    for(let y=28;y<69;y+=12) {
      b.voxelBox(x-54,y,z+13,2,4,68,'#74cbe4','glow');
      b.voxelBox(x+54,y,z-13,2,4,68,'#b7e6ed','glow');
    }
    for(let i=0;i<6;i++) b.voxelBox(x-41+i*16,47,z+48,3,37,2,'#75d7ed','glow');
  }
  library(){
    const b=this.b,{x,z}=P.library;
    b.voxelBox(x,5,z,120,10,89,'#202f3d');
    for(let i=0;i<12;i++) {
      const y=11+i*5,off=(i%4<2?-1:1)*(i%3)*3;
      b.voxelBox(x+off,y,z,110-Math.floor(i/4)*6,4,80,'#d7e3dd','solid');
      b.voxelBox(x+off+3,y-2,z+41,91,2,2,'#5bd8ee','glow');
    }
    for(let i=-5;i<=5;i++) b.voxelBox(x+i*10,41,z+42+(i%2)*3,3,56,3,'#2b4557','solid');
  }
  haixinsha(){
    const b=this.b,{x,z}=P.haixinsha;
    b.voxelBox(x,5,z,470,8,142,'#394d55');
    for(let i=0;i<17;i++) {
      const xx=x-180+i*22, hh=10+30*Math.sin((i+1)/18*Math.PI);
      b.voxelBox(xx,11+hh/2,z+24-i*.6,14,hh,5,'#f2f6ef','solid',-.13);
      b.voxelBox(xx,13+hh,z+24-i*.6,14,2,6,'#4ce4f8','glow');
    }
    for(let i=0;i<22;i++) b.voxelBox(x-220+i*20,10,z-45,9,3,8,'#ffc76c','glow');
  }
  twinTowers(){
    this.ifc(); this.ctf();
  }
  ifc(){
    const b=this.b,{x,z}=P.ifc; const h=422;
    b.voxelBox(x,5,z,94,10,80,'#273844');
    for(let y=10;y<h;y+=24) {
      const shrink=Math.floor(y/105)*4;
      const seg=Math.min(24,h-y);
      b.voxelBox(x,y+seg/2,z,70-shrink,seg,60-shrink,'#244459','glass');
      b.voxelBox(x,y+seg,z,72-shrink,2,62-shrink,'#58bdda','solid');
    }
    for(let y=18;y<410;y+=16) {
      const r=35-Math.floor(y/105)*2;
      b.voxelBox(x-r,y,z+30,2,14,2,'#45667a','solid',(y%32?1:-1)*.25);
      b.voxelBox(x+r,y,z-30,2,14,2,'#45667a','solid',(y%32?-1:1)*.25);
    }
    // Stepped dark diamonds reference the IFC's diagonal exoskeleton.
    for(let y=24;y<412;y+=8) {
      const phase=(Math.floor(y/8)%12);
      const dx=(phase<6?phase:12-phase)*6;
      for(const side of [-1,1]) b.voxelBox(x+side*(dx-16),y,z+30,3,3,2,'#172d3f','solid');
    }
    for(let i=0;i<14;i++) b.voxelBox(x-25+i*4,424,z+29,3,4,2,i%3?'#4fe8f9':'#fff2c0','glow');
    b.voxelBox(x,427,z,16,8,14,'#1b3c53','solid');
    b.voxelBox(x,431,z,4,2,4,'#ff3150','glow');
  }
  ctf(){
    const b=this.b,{x,z}=P.ctf; const h=530;
    b.voxelBox(x,5,z,104,10,88,'#48505a');
    const bands=[[10,126,80,68],[126,234,72,64],[234,338,64,58],[338,426,56,50],[426,500,49,43],[500,522,42,38]];
    for(const [a,c,w,d] of bands){b.voxelBox(x+2,(a+c)/2,z,w,c-a,d,'#b5c7cc','glass');b.voxelBox(x+2,c,z,w+3,3,d+3,'#e3d9c2','solid');}
    for(let y=20;y<520;y+=8) for(let side of [-1,1]) {
      const w=y<126?80:y<234?72:y<338?64:y<426?56:y<500?49:42;
      b.voxelBox(x+side*(w/2+1),y,z,2,7,3,'#e7e2d2','solid');
    }
    // One side of the crown is cut down to produce CTF's asymmetric roofline.
    for(let i=0;i<5;i++) b.voxelBox(x+18+i*3,524-i*3,z,4,4,35-i*3,'#e7dcc7','solid');
    b.voxelBox(x,526,z,16,5,12,'#36e3ed','glow');
    b.voxelBox(x,529,z,4,2,4,'#ff2449','glow');
  }
  plaza(){
    const b=this.b;
    for(let z=-1030;z<-320;z+=20) {
      b.voxelBox(0,3,z,155,1.6,14,z%40===0?'#3f6267':'#354e50','solid');
      if(z%80===-70) for(let x of [-68,68]) b.voxelBox(x,6,z,4,5,4,'#f9df97','glow');
    }
    for(let z=-930;z<-380;z+=72) for(let x of [-110,110]) {
      b.voxelBox(x,7,z,3,10,3,'#505a55'); b.voxelBox(x,15,z,10,9,10,'#296c58','foliage');
    }
  }
}
