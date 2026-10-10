import {CHAPTER_ONE_MAPS_V30,chapterOneV30,chapter123V30} from './chapter23-design-v30.js';
import {chapter123SceneryArtV30,chapter123SceneryV30,chapter123PropArtV30} from './chapter123-presentation-v30.js';
export {CHAPTER_ONE_MAPS_V30,chapterOneV30} from './chapter23-design-v30.js';
// First-chapter presentation only. No map geometry, item IDs or rules are mutated.
import {WORLD_REGIONS_V29} from './world-design-v29.js';
import {BOUNDARIES,WATERS,BRIDGES} from './world-v14.js';
const wood=new Set(['hall','warehouse','workshop','guestroom']),outdoor=new Set(['road','town','alley','grove','millpath']);
export const immersiveWorldV30=chapter123V30;
export const CHAPTER_ONE_LOADS_V30=[['chapterArchitecture','assets/v30/architecture.png',4,2,false],['chapterFurnishings','assets/v30/furnishings.png',4,3,false],['chapterMaterials','assets/v30/materials.png',2,2,false],['chapterSettlement','assets/v30/settlement.png',4,3,false],['chapterGuards','assets/v30/guards.png',4,4,false],['chapterUtilities','assets/v30/utilities.png',4,5,false],['chapterObjects','assets/v30/objects.png',4,3,false],['chapterHell','assets/v30/hell-scenery.png',4,4,false],['chapterHellMaterials','assets/v30/hell-materials.png',2,2,false]];
// Generated sheets are not a regular grid. These reviewed source partitions exclude
// neighbouring sprites; alpha bounds are measured inside each partition at load time.
export const CHAPTER_SOURCE_REGIONS_V30={
 chapterUtilities:{width:1122,height:1402,rows:[
  {y:0,end:280,x:[0,280,562,844,1122]},
  {y:280,end:560,x:[0,280,562,844,1122]},
  {y:560,end:824,x:[0,290,562,844,1122]},
  {y:824,end:1086,x:[0,280,562,844,1122]},
  {y:1086,end:1402,x:[0,280,562,844,1122]}]},
 chapterObjects:{width:1448,height:1086,rows:[
  {y:0,end:357,x:[0,360,738,1098,1448]},
  {y:357,end:700,x:[0,360,738,1098,1448]},
  {y:700,end:1086,x:[0,292,750,1098,1448]}]},
 chapterHell:{width:1254,height:1254,rows:[
  {y:0,end:313,x:[0,313,627,940,1254]},
  {y:313,end:627,x:[0,313,627,940,1254]},
  {y:627,end:940,x:[0,313,627,940,1254]},
  {y:940,end:1254,x:[0,313,627,940,1254]}]},
 chapterFurnishings:{width:1448,height:1086,rows:[
  {y:0,end:366,x:[0,415,807,1220,1448]},
  {y:366,end:727,x:[0,390,795,1135,1448]},
  {y:727,end:1086,x:[0,380,790,1130,1448]}]},
 chapterSettlement:{width:1448,height:1086,rows:[
  {y:0,end:389,x:[0,375,740,1100,1448]},
  {y:389,end:744,x:[0,375,740,1100,1448]},
  {y:744,end:1086,x:[0,375,760,1100,1448]}]},
 chapterGuards:{width:1254,height:1254,rows:[
  {y:0,end:315,x:[0,315,627,941,1254]},
  {y:315,end:628,x:[0,318,628,998,1254]},
  {y:628,end:938,x:[0,315,627,941,1254]},
  {y:938,end:1254,x:[0,340,628,996,1254]}]}
};
export function installChapterFramesV30(bank,name,data){
 const layout=CHAPTER_SOURCE_REGIONS_V30[name];if(!layout)return;
 const image=bank.images[name],sx=image.width/layout.width,sy=image.height/layout.height,frames=[];
 for(const row of layout.rows)for(let i=0;i<4;i++){
  const x=Math.round(row.x[i]*sx),y=Math.round(row.y*sy),ex=Math.round(row.x[i+1]*sx),ey=Math.round(row.end*sy);
  let x0=ex,y0=ey,x1=x,y1=y;
  for(let yy=y;yy<ey;yy++)for(let xx=x;xx<ex;xx++)if(data.data[(yy*image.width+xx)*4+3]>120){x0=Math.min(xx,x0);y0=Math.min(yy,y0);x1=Math.max(xx,x1);y1=Math.max(yy,y1);}
  const frame={x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,cell:{x,y,w:ex-x,h:ey-y}};
  if(name==='chapterGuards'){
   let sum=0,n=0;for(let yy=Math.max(y0,y1-Math.round(frame.h*.07));yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)if(data.data[(yy*image.width+xx)*4+3]>120){sum+=xx;n++;}
   frame.foot={x:n?sum/n:(x0+x1)/2,y:y1};
  }frames.push(frame);
 }
 // Separate the portable lantern from its post for the workshop handover.
 if(name==='chapterHell')frames.push({x:1044*sx,y:684*sy,w:66*sx,h:111*sy,cell:{x:1044*sx,y:684*sy,w:66*sx,h:111*sy}});
 bank.frames[name]=frames;
}

export function chapterGuardFrameV30(a){
 const back=Math.sin(a.angle||0)<-.22?8:0;
 if(a.wind>0)return back+4+(a.wind<Math.max(.01,a.windMax||.45)*.45?1:0);
 if(a.attackAnim>0)return back+(a.attackAnim>.14?6:7);
 return back+(a.moving?Math.floor((a.walkDistance||0)/38)%4:1);
}
export function drawChapterGuardV30(c,bank,a,height){
 if(!['guard','captain'].includes(a.type)||!bank.images.chapterGuards)return false;
 const frames=bank.frames.chapterGuards,f=frames[chapterGuardFrameV30(a)];if(!f?.foot)return false;
 const reference=Math.max(...frames.slice(0,4).map(f=>f.h)),k=height/reference;
 c.save();c.translate(a.x,a.y);if(Math.cos(a.angle||0)<0)c.scale(-1,1);
 if(a.type==='captain')c.filter='sepia(.16)';c.imageSmoothingEnabled=true;
 c.drawImage(bank.images.chapterGuards,f.x,f.y,f.w,f.h,(f.x-f.foot.x)*k,(f.y-f.foot.y)*k,f.w*k,f.h*k);
 c.restore();return true;
}
export const chapterSceneryArtV30=o=>chapter123SceneryArtV30(o,'hall');
export function chapterPropArtV30(p,g,legacy){return chapterOneV30(g.map)?chapter123PropArtV30(p,g.map,legacy,g):legacy;}
const line=(c,points)=>{c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length-1;i++){const a=points[i],b=points[i+1];c.quadraticCurveTo(...a,(a[0]+b[0])/2,(a[1]+b[1])/2);}c.lineTo(...points.at(-1));};
function material(c,bank,index,rect=[0,0,1600,1080],size=index===0?205:index===1?480:index===2?270:175){
 const f=bank.frame('chapterMaterials',index),im=bank.images.chapterMaterials;if(!f||!im)return;
 c.save();c.beginPath();c.rect(...rect);c.clip();c.imageSmoothingEnabled=true;
 for(let y=Math.floor(rect[1]/size)*size;y<rect[1]+rect[3];y+=size)for(let x=Math.floor(rect[0]/size)*size;x<rect[0]+rect[2];x+=size)c.drawImage(im,f.cell.x,f.cell.y,f.cell.w,f.cell.h,x,y,size,size);
 c.restore();
}
const paths={town:[{width:225,points:[[180,610],[650,600],[850,580],[1430,610]]},{width:200,points:[[820,175],[830,575],[820,970]]}],alley:[{width:170,points:[[850,170],[860,550],[1430,560]]},{width:100,points:[[200,540],[850,550],[900,930]]}],grove:[{width:100,points:[[800,960],[660,760],[680,570],[840,550],[1100,600],[1250,330]]}]};
export function chapterGroundV30(bank,id){
 if(!chapterOneV30(id)||!bank.images.chapterMaterials)return null;
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1080;const c=canvas.getContext('2d'),outside=outdoor.has(id);
 material(c,bank,outside?1:wood.has(id)?2:3);
 // Lower contrast on the ground so faces, silhouettes and readable paths lead the eye.
 c.fillStyle=outside?'#48504424':'#55504318';c.fillRect(0,0,1600,1080);
 const routes=WORLD_REGIONS_V29[id]?.paths||paths[id]||[];
 if(outside&&routes.length){
  const lane=document.createElement('canvas');lane.width=1600;lane.height=1080;const p=lane.getContext('2d');material(p,bank,0);
  const mask=document.createElement('canvas');mask.width=1600;mask.height=1080;const m=mask.getContext('2d');m.lineCap='round';m.lineJoin='round';m.strokeStyle='#fff';
  for(const r of routes){m.save();m.filter='blur(13px)';line(m,r.points);m.lineWidth=r.width+14;m.stroke();m.restore();line(m,r.points);m.lineWidth=Math.max(20,r.width-28);m.stroke();}
  p.globalCompositeOperation='destination-in';p.drawImage(mask,0,0);c.drawImage(lane,0,0);
  if(id==='road'||id==='millpath'){
   c.save();c.strokeStyle='#635c4438';c.lineWidth=2;c.lineCap='round';
   for(const offset of [-23,23]){line(c,[[140,555+offset],[450,555+offset],[770,535+offset],[1100,580+offset],[1440,550+offset]]);c.stroke();}c.restore();
  }
  // Uneven sediment and sparse leaf litter, baked once with a deterministic seed.
  let seed=17+id.length;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  for(let i=0;i<240;i++){const x=rand()*1600,y=rand()*1080;c.fillStyle=i%3?'#a6976c19':'#151e1629';c.beginPath();c.ellipse(x,y,2+rand()*6,1+rand()*2,rand()*6,0,7);c.fill();}
 }
 if(id==='hall'||id==='chapel'){
  const x=id==='hall'?715:750,y=id==='hall'?290:260,w=id==='hall'?180:230,h=id==='hall'?620:685;
  c.fillStyle=id==='hall'?'#473b3290':'#5a38337a';c.fillRect(x,y,w,h);c.strokeStyle='#b09b6a54';c.lineWidth=2;c.strokeRect(x+7,y+7,w-14,h-14);
  for(let yy=y+20;yy<y+h;yy+=28){c.strokeStyle='#c4ab7730';c.beginPath();c.moveTo(x+12,yy);c.lineTo(x+19,yy+7);c.lineTo(x+12,yy+14);c.moveTo(x+w-12,yy);c.lineTo(x+w-19,yy+7);c.lineTo(x+w-12,yy+14);c.stroke();}
 }
 if(id==='warehouse'){
  c.fillStyle='#0e12161e';for(const [x,y,w,h]of [[490,275,475,100],[425,565,190,70],[900,585,175,75]])c.fillRect(x,y,w,h);
  for(let i=0;i<25;i++){c.fillStyle='#b2a27b35';c.fillRect(1090+Math.sin(i*7.2)*65,790+Math.cos(i*4.1)*30,2,1);}
 }
 if(id==='echo'){
  c.strokeStyle='#302d25';c.lineWidth=12;line(c,[[450,350],[580,350],[580,565],[850,565],[850,393],[1175,393]]);c.stroke();c.strokeStyle='#9e8051';c.lineWidth=5;c.stroke();
 }
 for(const [x,y,w,h]of WATERS[id]||[]){
  c.fillStyle='#171f22';c.fillRect(x-9,y-8,w+18,h+16);c.fillStyle='#354d50';c.fillRect(x,y,w,h);
  const gr=c.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,'#8aaba82c');gr.addColorStop(1,'#101c2366');c.fillStyle=gr;c.fillRect(x,y,w,h);
  for(let yy=y+14;yy<y+h;yy+=31){c.strokeStyle='#b8cbc51c';c.lineWidth=1;c.beginPath();c.moveTo(x+8,yy);c.lineTo(x+w-10,yy+4);c.stroke();}
 }
 const b=BRIDGES[id];if(b)bank.draw(c,'chapterArchitecture',7,b.x+b.w/2,b.y+b.h,b.w,b.h);
 for(const rect of BOUNDARIES[id]||[]){
  if(outside){c.fillStyle='#101c1745';c.fillRect(...rect);continue;}
  material(c,bank,3,rect,240);c.fillStyle='#171e27b3';c.fillRect(...rect);
  const [x,y,w,h]=rect;c.fillStyle='#a59d7c80';c.fillRect(x,y+h-7,w,4);c.fillStyle='#080c10a0';c.fillRect(x,y+h-3,w,6);
 }
 return canvas;
}
export function drawChapterSceneryV30(c,bank,o,id){
 const fitted=chapter123SceneryV30(bank,o,id);if(!fitted)return false;
 c.save();c.imageSmoothingEnabled=true;
 if(!o.flat){const w=Math.min(o.w*.43,150),h=Math.min(18,o.h*.08),shade=c.createRadialGradient(o.x,o.y-2,1,o.x,o.y-2,w);shade.addColorStop(0,'#0e111354');shade.addColorStop(1,'#0e111300');c.save();c.translate(o.x,o.y-2);c.scale(1,h/w);c.translate(-o.x,-o.y+2);c.fillStyle=shade;c.fillRect(o.x-w,o.y-2-w,w*2,w*2);c.restore();}
 if(o.cold)c.filter='saturate(.25) brightness(.8)';
 if(fitted.sheet==='chapterArchitecture'&&fitted.asset===2){const t=performance.now()/1000,angle=Math.sin(t*.7+o.x)*.003;c.translate(o.x,o.y);c.rotate(angle);if(Math.floor(o.x+o.y)%3===0)c.scale(-1,1);c.translate(-o.x,-o.y);}
 bank.draw(c,fitted.sheet,fitted.asset,fitted.x,fitted.y,fitted.w,fitted.h);c.restore();return true;
}

// Ordinary hits have a brief directional blade glint, separate from magical skill effects.
export function drawChapterStrikeV30(c,f){
 if(!['cut','enemyCut'].includes(f.type)||f.type==='cut'&&f.skillKey&&f.skillKey!=='attack')return false;
 const t=1-f.life/f.max;if(t>.72)return true;
 const a=f.a||0,r=Math.min(45,Math.max(16,f.r*.52));
 c.save();c.translate(f.x,f.y-22);c.rotate(a);c.globalAlpha=Math.sin(Math.PI*t/.72)*.8;
 c.lineCap='round';c.strokeStyle=f.type==='enemyCut'?'#ccb2a2':'#e5ded0';c.lineWidth=2.2;
 c.beginPath();c.arc(9,0,r,-.9+t*.7,.55+t*.7);c.stroke();c.restore();return true;
}
const lamps={guestroom:[[770,315]],hall:[[240,420],[1210,390]],warehouse:[[390,265]],town:[[700,190],[940,215]],chapel:[[590,170],[1140,260]],alley:[[1180,380]],canal:[[510,295]],workshop:[[620,330],[1060,390]],echo:[[450,330]]};
export function drawChapterAtmosphereV30(c,bank,g,foreground=false,id=g.map){
 if(!chapterOneV30(id))return;
 c.save();
 if(!foreground){
  // Pools illuminate the floor beneath bodies; shadowed walls retain their volume.
  for(const [x,y]of lamps[id]||[]){const gr=c.createRadialGradient(x,y,4,x,y,145);gr.addColorStop(0,'#edb45c29');gr.addColorStop(1,'#e8bb6500');c.fillStyle=gr;c.fillRect(x-145,y-145,290,290);}
  if(['hall','chapel','workshop','guestroom'].includes(id)){
   c.save();c.globalCompositeOperation='screen';const gr=c.createLinearGradient(290,180,700,720);gr.addColorStop(0,'#d6c9a620');gr.addColorStop(1,'#d6c9a600');c.fillStyle=gr;c.beginPath();c.moveTo(290,180);c.lineTo(355,180);c.lineTo(880,800);c.lineTo(600,800);c.closePath();c.fill();c.restore();
  }
 }else{
  const gr=c.createRadialGradient(800,540,340,800,540,940);gr.addColorStop(0,'#10182300');gr.addColorStop(1,'#10182370');c.fillStyle=gr;c.fillRect(0,0,1600,1080);
  for(let i=0;i<12;i++){const t=g.time*.09+i*8.3,x=200+(i*131+Math.sin(t)*24)%1200,y=210+(i*67+g.time*4)%650;c.globalAlpha=.08+.07*Math.sin(t);c.fillStyle=outdoor.has(id)?'#e1d7aa':'#ecd1a3';c.beginPath();c.ellipse(x,y,1.2,.8,t,0,7);c.fill();}
  for(const [x,y,w,h]of WATERS[id]||[]){c.globalAlpha=.14;c.strokeStyle='#bad0c9';c.lineWidth=1;for(let i=0;i<4;i++){const yy=y+(g.time*8+i*69)%h;c.beginPath();c.moveTo(x+12,yy);c.quadraticCurveTo(x+w*.5,yy+3,x+w-14,yy);c.stroke();}}
 }
 c.restore();
}
