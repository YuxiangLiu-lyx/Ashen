import {WORLD_REGIONS_V29} from './world-design-v29.js';
import {WATERS,BRIDGES,BOUNDARIES} from './world-v14.js';
import {worldFeedbackV29} from './world-runtime-v29.js';

const route=(c,points)=>{c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length-1;i++){const a=points[i],b=points[i+1];c.quadraticCurveTo(...a,(a[0]+b[0])/2,(a[1]+b[1])/2);}c.lineTo(...points.at(-1));};
const slab=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
function tiles(c,bank,base){
 for(let y=0;y<1080;y+=64)for(let x=0;x<1600;x+=64){const f=bank.frame('terrain',base+(x/64*13+y/64*7)%4);c.drawImage(bank.images.terrain,f.cell.x,f.cell.y,f.cell.w,f.cell.h,x,y,64,64);}
}
function pathPaint(c,bank,paths,base){
 const layer=document.createElement('canvas');layer.width=1600;layer.height=1080;const p=layer.getContext('2d');tiles(p,bank,base);
 const mask=document.createElement('canvas');mask.width=1600;mask.height=1080;const m=mask.getContext('2d');m.lineCap='round';m.lineJoin='round';m.strokeStyle='#fff';
 for(const road of paths){route(m,road.points);m.lineWidth=road.width;m.stroke();}
 p.globalCompositeOperation='destination-in';p.drawImage(mask,0,0);
 c.drawImage(layer,0,0);
}
function pool(c,bank,[x,y,w,h]){
 slab(c,x-15,y-12,w+30,h+24,'#3a4238');slab(c,x-7,y-4,w+14,h+8,'#7a7861');
 c.save();c.filter='saturate(.23) brightness(.64)';const f=bank.frame('details',12);c.drawImage(bank.images.details,f.x,f.y,f.w,f.h,x,y,w,h);c.restore();
 c.strokeStyle='#b8cbc02c';c.lineWidth=2;for(let yy=y+18;yy<y+h;yy+=37){c.beginPath();c.moveTo(x+9,yy);c.lineTo(x+w-12,yy+5);c.stroke();}
}
export function worldGroundV29(bank,id){
 const design=WORLD_REGIONS_V29[id];if(!design)return null;
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1080;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
 const outdoor=['road','millpath'].includes(id);tiles(c,bank,outdoor?4:id==='echo'?12:8);
 if(outdoor){
  slab(c,0,0,1600,1080,'#263d284b');
  // Broad soil/grass masses lead the eye; authored trunks supply physical edges.
  for(const [x,y,rx,ry] of [[280,380,200,150],[640,260,210,140],[550,830,240,150],[1270,360,220,190],[1320,840,230,160]]){
   const shade=c.createRadialGradient(x,y,20,x,y,rx);shade.addColorStop(0,'#77904b38');shade.addColorStop(1,'#26342600');c.fillStyle=shade;c.save();c.translate(x,y);c.scale(1,ry/rx);c.translate(-x,-y);c.fillRect(x-rx,y-rx,rx*2,rx*2);c.restore();
  }
  c.lineCap='round';c.lineJoin='round';for(const road of design.paths){route(c,road.points);c.strokeStyle='#493f322e';c.lineWidth=road.width+18;c.stroke();route(c,road.points);c.strokeStyle='#a18d5a28';c.lineWidth=road.width+8;c.stroke();}
  pathPaint(c,bank,design.paths,id==='road'?0:4);
  if(id==='millpath'){
   c.fillStyle='#b5a27d24';c.beginPath();c.ellipse(510,477,165,105,-.3,0,Math.PI*2);c.fill();
   // Broken masonry follows the source of the water instead of forming a second road.
   c.strokeStyle='#464c3d';c.lineWidth=15;route(c,[[1190,410],[1250,480],[1280,570],[1280,660]]);c.stroke();c.strokeStyle='#8b8b69';c.lineWidth=5;c.stroke();
  }else{
   c.strokeStyle='#74634b66';c.lineWidth=3;for(const offset of [-28,28]){route(c,[[150,540+offset],[360,570+offset],[650,510+offset],[850,535+offset],[1090,590+offset],[1450,540+offset]]);c.stroke();}
  }
 }else{
  // Distinct functional floor zones, with clear walking lanes between them.
  if(id==='echo'){
   slab(c,175,215,440,330,'#7c7b5b20');slab(c,825,230,560,300,'#333b3980');slab(c,980,700,415,215,'#2c302c77');
   c.strokeStyle='#b59d6480';c.lineWidth=4;route(c,[[450,350],[580,350],[580,565],[850,565],[850,393],[1175,393]]);c.stroke();c.strokeStyle='#342e25';c.lineWidth=11;route(c,[[850,393],[1175,393]]);c.stroke();c.strokeStyle='#a48a57';c.lineWidth=5;c.stroke();
   for(const [x,y] of [[580,565],[850,565],[850,393],[1175,393]]){slab(c,x-7,y-4,14,8,'#c0a56c');}
   slab(c,1105,355,210,7,'#171e1c');slab(c,1105,362,210,5,'#8b7955');
  }else{
   slab(c,870,405,355,270,'#494c3d66');slab(c,275,430,285,290,'#3a413b50');slab(c,345,740,300,140,'#785c3d55');
   c.strokeStyle='#a88b5e55';c.lineWidth=4;c.strokeRect(870,405,355,270);
   // Runners and a threshold give the entrance a human scale.
   slab(c,737,810,126,127,'#443e31');for(let y=820;y<930;y+=9)slab(c,747,y,106,3,'#ad8c5844');
   slab(c,732,934,136,8,'#c8b48a');
  }
 }
 for(const box of WATERS[id]||[])pool(c,bank,box);
 const bridge=BRIDGES[id];if(bridge){bank.draw(c,'details',8,bridge.x+bridge.w/2,bridge.y+bridge.h,bridge.w,bridge.h);slab(c,bridge.x,bridge.y+8,bridge.w,6,'#8e7d56');slab(c,bridge.x,bridge.y+bridge.h-9,bridge.w,6,'#8e7d56');}
 for(const [x,y,w,h] of BOUNDARIES[id]||[]){
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();slab(c,x,y,w,h,outdoor?'#25382cc0':'#252d2df5');
  if(!outdoor){for(let yy=y+45;yy<y+h+50;yy+=48)for(let xx=x+(Math.floor(yy/48)%2)*32;xx<x+w;xx+=95){c.strokeStyle='#69716b45';c.lineWidth=2;c.strokeRect(xx,yy-42,91,40);}slab(c,x,y+h-9,w,5,'#a4977466');}
  c.restore();
 }
 return canvas;
}
export function drawWorldSceneryV29(c,g,o){
 if(g.map!=='echo'||o.id!=='echo-machine-base')return;
 c.save();
 // A separate back-slot stays empty after extraction, including on a later visit.
 if(g.flags.echoCoreFound){c.fillStyle='#141e1c';c.beginPath();c.ellipse(1163,316,9,6,0,0,7);c.fill();c.strokeStyle='#766647';c.lineWidth=2;c.stroke();}
 if(g.flags.echoValve){c.fillStyle='#93b6a8';c.beginPath();c.arc(1239,281,5,0,7);c.fill();}
 c.restore();
}
export function drawWorldPropV29(c,g,p){
 if(g.map==='echo'&&p.action==='echoValve'){
  c.save();c.translate(p.x,p.y-50);c.rotate(g.flags.echoValve?.7:-.45);c.strokeStyle='#302e28';c.lineWidth=8;c.beginPath();c.moveTo(-15,0);c.lineTo(15,0);c.stroke();c.strokeStyle=g.flags.echoValve?'#a4bbb0':'#b6a06e';c.lineWidth=4;c.stroke();c.restore();
 }
 if(p.id==='v29-repair-core'){
  c.save();c.strokeStyle=g.refineryUnlocked()?'#b1c6a1':'#b99b66';c.lineWidth=3;c.beginPath();c.moveTo(p.x-17,p.y-15);c.lineTo(p.x+17,p.y-10);c.stroke();c.restore();
 }
}
export function drawWorldEffectsV29(c,g){
 if(g.map!=='echo')return;
 for(const effect of worldFeedbackV29(g))if(effect.type==='steam'){
  const progress=1-effect.life/effect.max;c.save();c.globalAlpha=Math.sin(progress*Math.PI)*.4;c.fillStyle='#c0d4cb';
  for(let i=0;i<9;i++){c.beginPath();c.ellipse(880+progress*290+i*12,390+Math.sin(i*2.4)*20-progress*50,20+progress*25,12+progress*20,0,0,7);c.fill();}c.restore();
 }
}
