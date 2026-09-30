import { geoToLocal } from './geo.js';

export class Bridges {
  constructor(batch){this.b=batch;}
  build(){this.haixin();this.liede();this.guangzhou();}
  haixin(){
    const b=this.b,n=90;
    for(let i=0;i<=n;i++){
      const t=i/n,x=-850+720*t,z=116+290*t+38*Math.sin(t*Math.PI*2);
      b.voxelBox(x,19,z,10,4,14,'#e8efea','solid',-.32);
      b.voxelBox(x,22,z+8,10,2,2,'#38e9f6','glow',-.32);
      b.voxelBox(x,22,z-8,10,2,2,'#f9efe4','glow',-.32);
      const arch=22+72*Math.sin(Math.PI*t);
      if(i%2===0){b.voxelBox(x,arch,z-7,4,4,4,'#f4f8f3','solid');
        for(let y=28;y<arch;y+=8)b.voxelBox(x,y,z-7,1.5,7,1.5,'#b7d8dd','solid');}
    }
  }
  liede(){
    const b=this.b,p=geoToLocal(23.1121537,113.3285435),x=p.x;
    for(let z=-360;z<=420;z+=12){b.voxelBox(x,17,z,38,5,12,'#738a94');
      b.voxelBox(x-19,20,z,2,2,12,'#ffbd6e','glow');
      b.voxelBox(x+19,20,z,2,2,12,'#ffbd6e','glow');}
    for(let side of [-1,1]) for(let level=0;level<17;level++){
      const y=21+level*5, width=25+Math.sin(level/17*Math.PI)*15;
      b.voxelBox(x+side*width,y,40,5,5,12,'#e8e2d7','solid');
    }
    for(let i=-14;i<=14;i++){const z=40+i*24, top=88-Math.abs(i)*2.8;
      for(let y=23;y<top;y+=10)b.voxelBox(x+(y%20?8:-8),y,z+(40-z)*(y/90),2,9,2,'#bcd7dc','solid');}
  }
  guangzhou(){
    const b=this.b,p=geoToLocal(23.1153005,113.3098739),x=p.x;
    for(let z=-390;z<=450;z+=16){
      b.voxelBox(x,12,z,37,5,16,'#8d9a99');
      for(const side of [-1,1]) b.voxelBox(x+side*19,16,z,2,2,16,'#f7b869','glow');
      if(z%64===-6){for(const side of [-1,1]){b.voxelBox(x+side*19,20,z,2,11,2,'#bec4b8');b.voxelBox(x+side*19,27,z,4,3,4,'#ffe8ad','glow');}}
    }
    for(let z=-350;z<440;z+=125) b.voxelBox(x,7,z,26,14,9,'#6a8183');
  }
}
