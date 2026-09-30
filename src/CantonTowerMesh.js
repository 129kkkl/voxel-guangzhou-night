import { geoToLocal } from './geo.js';

export class CantonTowerMesh {
  constructor(batch) { this.b=batch; this.p=geoToLocal(23.1090145,113.3191477); }
  build() {
    const b=this.b,{x,z}=this.p;
    b.voxelBox(x,3,z,118,6,96,'#192b37');
    for(let h=0;h<=448;h+=8) {
      const t=h/450, waist=Math.exp(-Math.pow((t-.66)/.29,2));
      const rx=37-18*waist-7*t, rz=29-14*waist-5*t;
      const twist=t*1.05;
      const n=36;
      for(let i=0;i<n;i++) {
        const a=i/n*Math.PI*2+twist;
        const px=x+Math.cos(a)*rx,pz=z+Math.sin(a)*rz;
        b.voxelBox(px,h+6,pz,4.5,7.2,4.5,'#8daebb','tower',a);
        if(i%3===0 && h<440) {
          const a2=(i/n*Math.PI*2)+(h+8)/450*1.05+.065;
          const qx=x+Math.cos(a2)*(rx-.3),qz=z+Math.sin(a2)*(rz-.3);
          b.voxelBox((px+qx)/2,h+10,(pz+qz)/2,2.3,9,2.3,'#e5edf1','tower',a+.25);
        }
      }
      if(h%40===0) {
        for(let i=0;i<8;i++) {
          const a=i/8*Math.PI*2;
          b.voxelBox(x+Math.cos(a)*rx*.55,h+4,z+Math.sin(a)*rz*.55,4,3,4,'#486878','tower');
        }
      }
    }
    // Suspended observation pod and its stepped edge.
    for(let k=0;k<5;k++) {
      const r=20+Math.sin((k+1)/6*Math.PI)*7;
      for(let j=0;j<24;j++) {
        const a=j/24*Math.PI*2;
        b.voxelBox(x+Math.cos(a)*r,408+k*4,z+Math.sin(a)*r*.72,4,4,4,'#d3e9eb','tower');
      }
    }
    // The 450 m sky wheel: ring track and individual voxel cabins.
    for(let i=0;i<32;i++) {
      const a=i/32*Math.PI*2;
      const px=x+Math.cos(a)*29,pz=z+Math.sin(a)*21;
      b.voxelBox(px,453,pz,4,2,4,'#fff0bc','glow',a);
      if(i%2===0) b.voxelBox(px,457,pz,4,4,4,'#d8fdff','tower');
    }
    // 150 m antenna, visually divided into shorter voxel stages.
    for(let h=450;h<600;h+=6) {
      const r=h<495?6:h<550?4:2;
      b.voxelBox(x,h+5,z,r,6,r,'#c5e4e9','solid');
      if((h-450)%30===0) b.voxelBox(x,h+8,z,r+5,2,r+5,'#3de0f6','glow');
    }
    for(const y of [472,505,540,575,600]) b.voxelBox(x,y,z,5,3,5,'#ff2449','glow');
    return this.p;
  }
}
