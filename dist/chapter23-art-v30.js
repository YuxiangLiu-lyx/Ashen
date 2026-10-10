import {chapter123PropArtV30} from './chapter123-presentation-v30.js';
// Cached ground and small local lighting; all collision and encounter data stay native.
import {CH3_GROUND_STYLE} from './chapter3-world-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {SCENERY,BOUNDARIES,WATERS,BRIDGES} from './world-v14.js';
import {chapterTwoV30,chapterThreeV30,chapter23V30,CHAPTER_TWO_PATHS_V30,CHAPTER_THREE_PALETTES_V30} from './chapter23-design-v30.js';
const canvas=()=>{const c=document.createElement('canvas');c.width=1600;c.height=1080;return c;};
const trace=(c,points)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));};
// Mirroring avoids a hard seam at each repetition. It uses the original source rect.
function texture(c,bank,sheet,index,size=300){
 const f=bank.frame(sheet,index),im=bank.images[sheet];if(!f||!im)return null;
 const tile=document.createElement('canvas');tile.width=tile.height=size*2;const t=tile.getContext('2d');t.imageSmoothingEnabled=true;
 for(let y=0;y<2;y++)for(let x=0;x<2;x++){t.save();t.translate(x?size*2:0,y?size*2:0);t.scale(x?-1:1,y?-1:1);t.drawImage(im,f.x,f.y,f.w,f.h,0,0,size,size);t.restore();}
 return c.createPattern(tile,'repeat');
}
function surface(c,bank,sheet,index,size){c.fillStyle=texture(c,bank,sheet,index,size)||'#444a48';c.fillRect(0,0,1600,1080);}
function glow(c,x,y,r,color,alpha=.16){const gr=c.createRadialGradient(x,y,2,x,y,r);gr.addColorStop(0,color);gr.addColorStop(1,color+'00');c.save();c.globalAlpha*=alpha;c.fillStyle=gr;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
function lanes(c,bank,paths,{hell=false,palette=null}={}){
 const layer=canvas(),l=layer.getContext('2d');
 surface(l,bank,hell?'chapterHellMaterials':'chapterMaterials',hell?1:0,hell?330:255);
 if(hell){l.fillStyle=palette.lane;l.globalAlpha=.48;l.fillRect(0,0,1600,1080);l.globalAlpha=.22;l.fillStyle=texture(l,bank,'chapterHellMaterials',1,320);l.fillRect(0,0,1600,1080);l.globalAlpha=1;}
 const mask=canvas(),m=mask.getContext('2d');m.lineCap='round';m.lineJoin='round';m.strokeStyle='#fff';
 for(const p of paths){trace(m,p.points);m.save();m.filter='blur(15px)';m.lineWidth=p.width+18;m.stroke();m.restore();m.lineWidth=Math.max(30,p.width-34);m.stroke();}
 l.globalCompositeOperation='destination-in';l.drawImage(mask,0,0);c.drawImage(layer,0,0);
}
function water(c,bank,id){
 for(const [x,y,w,h]of WATERS[id]||[]){
  c.fillStyle='#232f30';c.fillRect(x-9,y-5,w+18,h+10);
  const g=c.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'#344b49');g.addColorStop(.5,'#253b40');g.addColorStop(1,'#425958');c.fillStyle=g;c.fillRect(x,y,w,h);
  for(const edge of [x,x+w])for(let yy=y+19,i=0;yy<y+h;yy+=34,i++){c.save();c.filter='saturate(.4) brightness(.72)';bank.draw(c,'chapterSettlement',8,edge+(i%2?3:-2),yy,33+(i%3)*5,27);c.restore();}
  c.strokeStyle='#91a29b55';c.lineWidth=2;for(const xx of [x+5,x+w-5]){c.beginPath();c.moveTo(xx,y);c.lineTo(xx,y+h);c.stroke();}
 }
 const b=BRIDGES[id];if(b)bank.draw(c,'chapterArchitecture',7,b.x+b.w/2,b.y+b.h,b.w,b.h);
}
function floorDetail(c,id){
 if(['inn','chamber'].includes(id)){
  const rect=id==='inn'?[745,300,138,430]:[870,300,130,525];c.fillStyle='#5b423969';c.fillRect(...rect);c.strokeStyle='#b2996a70';c.lineWidth=2;c.strokeRect(rect[0]+7,rect[1]+7,rect[2]-14,rect[3]-14);
 }
 if(['bridgecellar','wellcrypt','hellTomb'].includes(id)){
  c.strokeStyle='#b5b4a226';c.lineWidth=2;for(const y of [320,810]){c.beginPath();c.moveTo(400,y);c.lineTo(1190,y);c.stroke();}
 }
 if(id==='hellMine'){
  // Broken rails stop before the roof fall and the southern rock face.
  for(const points of [[[220,405],[350,405],[555,540]],[[625,555],[925,555],[1080,745]]]){
   c.save();c.lineCap='round';for(const offset of [-14,14]){c.save();c.translate(0,offset);trace(c,points);c.strokeStyle='#292d2e';c.lineWidth=5;c.stroke();c.strokeStyle='#a6987880';c.lineWidth=1;c.stroke();c.restore();}
   for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let t=20;t<length;t+=30){const x=a[0]+(b[0]-a[0])*t/length,y=a[1]+(b[1]-a[1])*t/length;c.strokeStyle='#433b31';c.lineWidth=4;c.beginPath();c.moveTo(x,y-20);c.lineTo(x,y+20);c.stroke();}}
   c.restore();
  }
 }
 if(['hellArena','hellRift','hellQuarry','hellSluice'].includes(id)){
  const [x,y,rx,ry]=id==='hellArena'?[800,600,215,148]:id==='hellRift'?[870,650,190,125]:[1110,535,177,125];
  c.strokeStyle='#c3b49a30';c.lineWidth=3;c.beginPath();c.ellipse(x,y,rx,ry,0,.2,2.5);c.stroke();c.beginPath();c.ellipse(x,y,rx,ry,0,2.8,5.9);c.stroke();
 }
}
export function chapter23GroundV30(bank,id){
 if(!chapter23V30(id)||!bank.images.chapterMaterials)return null;
 const out=canvas(),c=out.getContext('2d'),hell=chapterThreeV30(id),palette=CHAPTER_THREE_PALETTES_V30[id];
 const interior=['inn','chamber','bridgecellar','wellcrypt'].includes(id);
 if(hell){
  const style=CH3_GROUND_STYLE[id]||V11_GROUND_STYLE[id];
  c.fillStyle=palette.base;c.fillRect(0,0,1600,1080);c.save();c.filter='contrast(.6) saturate(.45)';c.globalAlpha=.55;surface(c,bank,'chapterHellMaterials',style.base,380);c.restore();
  c.fillStyle=palette.base;c.globalAlpha=.22;c.fillRect(0,0,1600,1080);c.globalAlpha=1;
  // Quiet broad patches sit below paths, so routes remain legible at intersections.
  for(const p of style.patches||[])glow(c,p.x,p.y,Math.max(p.w,p.h)*.55,palette.light,.1);
  lanes(c,bank,style.paths,{hell,palette});
 }else{
  surface(c,bank,'chapterMaterials',interior?['inn','chamber'].includes(id)?2:3:1,interior?270:450);
  c.fillStyle=id==='exile'?'#54636230':'#534e4324';c.fillRect(0,0,1600,1080);
  lanes(c,bank,CHAPTER_TWO_PATHS_V30[id]||[]);
 }
 // Grounded scenery shadows use existing feet, never a second collision outline.
 for(const o of SCENERY[id]||[]){if(o.flat)continue;c.save();c.translate(o.x+o.w*.10,o.y+3);c.scale(1,.22);glow(c,0,0,Math.min(150,o.w*.60),'#12191c',.34);c.restore();}
 for(const [x,y,w,h]of BOUNDARIES[id]||[]){c.fillStyle=interior?'#192026c4':'#17232049';c.fillRect(x,y,w,h);if(interior){c.fillStyle='#92917a60';c.fillRect(x,y+h-7,w,3);}}
 water(c,bank,id);floorDetail(c,id);
 if(id==='exile'){const g=c.createLinearGradient(770,0,1500,0);g.addColorStop(0,'#81999b00');g.addColorStop(1,'#81999b60');c.fillStyle=g;c.fillRect(770,150,830,810);}
 return out;
}
export function chapter23PropArtV30(p,g,legacy){return chapter23V30(g.map)?chapter123PropArtV30(p,g.map,legacy,g):legacy;}
export function drawChapter23AtmosphereV30(c,bank,g,front=false,id=g.map){
 if(!chapter23V30(id))return;
 c.save();
 if(!front){
  const color=CHAPTER_THREE_PALETTES_V30[id]?.light||'#ebc28b';
  for(const o of SCENERY[id]||[])if(o.sheet==='hellWorld'&&o.asset===15||o.sheet==='world'&&o.asset===14||o.id.includes('hearth')||o.id==='chamber-fire')glow(c,o.x,o.y-10,125,color,.22);
  if(id==='hellCamp')glow(c,510,530,210,'#edc391',.15);
  if(id==='hellGrotto')for(const p of [[730,440],[1120,535]])glow(c,...p,160,'#a5dbd6',.18);
 }else{
  const v=c.createRadialGradient(800,550,400,800,550,1030);v.addColorStop(0,'#14202600');v.addColorStop(1,'#14202675');c.fillStyle=v;c.fillRect(0,0,1600,1080);
  for(const [x,y,w,h]of WATERS[id]||[]){c.strokeStyle='#abc7c42a';c.lineWidth=1;for(let i=0;i<4;i++){const yy=y+(g.time*8+i*61)%h;c.beginPath();c.moveTo(x+14,yy);c.quadraticCurveTo(x+w*.5,yy+5,x+w-14,yy);c.stroke();}}
 }
 c.restore();
}
