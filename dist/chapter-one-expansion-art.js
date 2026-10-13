import {sceneryAlphaV26} from './scene-geometry-v26.js';
import {C1_LAYOUTS,c1Map,c1Land} from './chapter-one-layout.js';
function material(c,bank,index,rect,size=220){
 const f=bank.frame('chapterMaterials',index),im=bank.images.chapterMaterials;if(!f||!im)return;
 c.save();c.beginPath();c.rect(...rect);c.clip();c.imageSmoothingEnabled=true;
 for(let y=Math.floor(rect[1]/size)*size;y<rect[1]+rect[3];y+=size)for(let x=Math.floor(rect[0]/size)*size;x<rect[0]+rect[2];x+=size)c.drawImage(im,f.cell.x,f.cell.y,f.cell.w,f.cell.h,x,y,size,size);c.restore();
}
export function c1Ground(bank,id){const plan=C1_LAYOUTS[id];if(!plan)return null;
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1080;const c=canvas.getContext('2d');
 material(c,bank,plan.outdoor?1:3,[0,0,1600,1080],plan.outdoor?440:210);c.fillStyle=plan.outdoor?'#07190c55':'#080e15b8';c.fillRect(0,0,1600,1080);
 c.save();c.beginPath();for(const b of plan.rooms)c.rect(...b);c.clip();material(c,bank,plan.floor,[0,0,1600,1080],plan.floor===1?440:plan.floor===2?290:210);
 // Forest clearings have worn, lighter ground; settlement plazas remain stone.
 c.fillStyle=plan.floor===1?'#a2925312':plan.floor===2?'#c2ab7210':'#acada00a';c.fillRect(0,0,1600,1080);
 for(const points of plan.paths||[]){c.lineCap='round';c.lineJoin='round';// Soft dirt shoulders, worn center; no opaque painted road ribbon.
  for(let w=108;w>=36;w-=8){c.strokeStyle=plan.floor===1?'#b0a17b08':'#b2b09a04';c.lineWidth=w;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 }

 c.restore();
 // Only edges bordering real land get a wall/vegetation silhouette. Never hide
 // a walkable meadow under a grid of decorative trees.
 // Sample the actual land edge. Dense low shrubs/stone courses make the
 // collision edge readable, with irregular foliage rather than square grass cuts.
 for(let y=185;y<1010;y+=55)for(let x=140;x<1490;x+=65){const xx=x+Math.sin(y*.03+x)*12,yy=y+Math.cos(x*.03)*8;if(c1Land(id,xx,yy)||plan.water?.some(([a,b,w,h])=>xx>a-30&&xx<a+w+30&&yy>b&&yy<b+h))continue;
  const edge=[[48,0],[-48,0],[0,42],[0,-42]].some(([dx,dy])=>c1Land(id,xx+dx,yy+dy));if(!edge)continue;
  if(plan.outdoor&&plan.edge!=='masonry'){bank.draw(c,'chapterArchitecture',6,xx,yy+24,105+Math.sin(x)*13,68);if(Math.sin(x*.1+y*.2)>.67)bank.draw(c,'chapterArchitecture',2,xx-12,yy+5,155,165);}
 }

 if(!plan.outdoor||plan.edge==='masonry'){const warm=plan.floor===2;for(let y=180;y<980;y+=20)for(let x=140;x<1480;x+=20){if(!c1Land(id,x+10,y+10))continue;
  if(!c1Land(id,x+10,y-10)){const gr=c.createLinearGradient(0,y-45,0,y);gr.addColorStop(0,warm?'#83765f':'#77827e');gr.addColorStop(1,warm?'#423b31':'#354044');c.fillStyle=gr;c.fillRect(x,y-45,20,45);c.fillStyle='#c1b48b55';c.fillRect(x,y-45,20,4);if(x%80===0){c.fillStyle='#19201b80';c.fillRect(x,y-41,1,41);}}
  for(const sign of [-1,1])if(!c1Land(id,x+10+sign*20,y+10)){c.fillStyle=warm?'#514838':'#414e50';c.fillRect(sign<0?x-10:x+20,y-24,10,44);c.fillStyle='#a69e7955';c.fillRect(sign<0?x-10:x+27,y-24,3,44);}
  if(!c1Land(id,x+10,y+30)){c.fillStyle=warm?'#74664c':'#6b7875';c.fillRect(x,y+18,20,8);c.fillStyle='#1b252380';c.fillRect(x,y+26,20,7);}
 }}

 for(const [x,y,w,h]of plan.water||[]){const gradient=c.createLinearGradient(x,0,x+w,0);gradient.addColorStop(0,'#294349');gradient.addColorStop(.5,'#3b5757');gradient.addColorStop(1,'#263d44');c.fillStyle='#1a2427';c.fillRect(x-7,y,w+14,h);c.fillStyle=gradient;c.fillRect(x,y,w,h);c.strokeStyle='#a1b5a921';c.lineWidth=1;for(let yy=y+10;yy<y+h;yy+=17){const offset=(Math.sin(yy*.93)+1)*w*.25;c.beginPath();c.moveTo(x+10+offset,yy);c.quadraticCurveTo(x+30+offset,yy+3,x+Math.min(w-9,offset+55),yy-1);c.stroke();}for(let yy=y;yy<y+h;yy+=25){c.fillStyle=plan.floor===1?'#424b2e':'#5e6660';c.fillRect(x-8,yy,8,23);c.fillRect(x+w,yy,8,23);}}
 for(const [x,y,w,h]of plan.bridges||[]){c.save();c.translate(x+w/2,y+h/2);c.rotate(Math.PI/2);bank.draw(c,'chapterArchitecture',7,0,w/2,h,w);c.restore();}
 if(id==='c1ReedKiln'){const soot=c.createRadialGradient(1180,300,35,1180,300,280);soot.addColorStop(0,'#211a14a0');soot.addColorStop(1,'#211a1400');c.fillStyle=soot;c.fillRect(900,100,580,570);}
 return canvas;
}
export function drawC1Prop(c,bank,g,p,people=[]){
 if(!p.c1Art&&!p.action?.startsWith('c1:'))return false;
 if(p.c1Resource&&!g.c1PropVisible?.(p))return true;
 const spec=p.c1Art;if(!spec)return true;
 const [sheet,index,w,h]=spec;c.save();c.globalAlpha=(p.used?.45:1)*sceneryAlphaV26(bank,{...p,sheet:sheet==='loom'?'c1Loom':'chapter'+sheet,asset:index,w,h},people);bank.draw(c,sheet==='loom'?'c1Loom':'chapter'+sheet,index,p.x,p.y,w,h);c.restore();return true;
}
export function drawC1Telegraph(c,t){if(!t)return;c.save();c.fillStyle='#e6aa553d';c.strokeStyle='#f5cc87';c.lineWidth=3;c.translate(t.x,t.y);c.beginPath();if(t.shape==='circle')c.arc(0,0,t.r,0,Math.PI*2);else if(t.shape==='cone'){c.moveTo(0,0);c.arc(0,0,t.r,t.a-t.arc,t.a+t.arc);c.closePath();}else{c.rotate(t.a);c.rect(0,-t.width/2,t.length,t.width);}c.fill();c.stroke();c.restore();}

export function drawC1World(c,g,bank){
 if(c1Map(g.map)){const doors=g.targets().filter(t=>t.kind==='door');for(const d of doors){const locked=!!g.canDoor(d),color=locked?'#b5a281':'#88e4d0';let a=Math.abs(d.x-800)>Math.abs((d.y-550)*1.6)?d.x<800?Math.PI:0:d.y<550?-Math.PI/2:Math.PI/2;
  c.save();c.translate(d.x,d.y);c.fillStyle=locked?'#4e43304d':'#69d9c02b';c.beginPath();c.ellipse(0,0,55,28,0,0,Math.PI*2);c.fill();c.strokeStyle=color;c.lineWidth=4;c.rotate(a);for(const x of [-9,8]){c.beginPath();c.moveTo(x-8,-12);c.lineTo(x+5,0);c.lineTo(x-8,12);c.stroke();}c.restore();
  const label=d.label||d.to;c.save();c.font='bold 16px serif';const width=Math.min(300,c.measureText(label).width+26),x=Math.max(width/2+10,Math.min(1590-width/2,d.x)),y=d.y<230?d.y+48:d.y-48;c.fillStyle='#142325e8';c.fillRect(x-width/2,y-19,width,29);c.strokeStyle=color;c.lineWidth=1;c.strokeRect(x-width/2,y-19,width,29);c.textAlign='center';c.fillStyle=color;c.fillText(label,x,y+2);c.restore();
 }}
 drawC1Telegraph(c,g.c1TrainingSession?.warning);for(const e of g.enemies)if(!e.dead&&e.telegraph?.c1)drawC1Telegraph(c,e.telegraph);
}
export function drawC1Target(c,e,bank){if(!e.c1Training)return false;if(bank){bank.draw(c,'chapterUtilities',16,e.x,e.y,65,105);return true;}c.save();c.translate(e.x,e.y);c.fillStyle='#8d7652';c.fillRect(-7,-86,14,86);c.fillRect(-44,-59,88,10);c.fillStyle='#bcb08b';c.beginPath();c.ellipse(0,-69,21,25,0,0,7);c.fill();c.strokeStyle='#675237';c.lineWidth=4;c.beginPath();c.arc(0,-69,14,0,7);c.stroke();c.restore();return true;}
export function drawC1Elite(c,e){if(!e.c1Custom||e.dead)return;c.save();c.translate(e.x,e.y);c.scale(Math.cos(e.angle||0)<0?-1:1,1);c.lineJoin='round';c.lineCap='round';
 // Small weathered bone, fur and membrane details preserve each native silhouette.
 if(e.type==='rat'){c.strokeStyle='#605548';c.lineWidth=3.2;c.beginPath();c.moveTo(-25,-19);c.quadraticCurveTo(-30,-14,-32,-21);c.moveTo(-20,-18);c.quadraticCurveTo(-24,-12,-26,-19);c.stroke();c.strokeStyle='#b5a787';c.lineWidth=1.2;c.stroke();}
 if(e.type==='wolf'){c.strokeStyle='#656d68';c.lineWidth=7;c.beginPath();c.moveTo(-22,-36);c.quadraticCurveTo(-3,-45,22,-35);c.stroke();c.strokeStyle='#a6aaa0';c.lineWidth=1.3;for(let x=-20;x<23;x+=4){c.beginPath();c.moveTo(x,-36-Math.cos(x/23)*4);c.lineTo(x+4,-40-Math.cos(x/23)*4);c.stroke();}}
 if(e.type==='bat'){c.strokeStyle='#aca07d';c.lineWidth=1.1;for(const sign of [-1,1]){c.beginPath();c.moveTo(sign*7,-34);c.quadraticCurveTo(sign*22,-51,sign*37,-43);c.quadraticCurveTo(sign*22,-37,sign*16,-28);c.stroke();}c.strokeStyle='#746f58';c.lineWidth=2;c.beginPath();c.moveTo(-6,-34);c.lineTo(0,-42);c.lineTo(6,-34);c.stroke();}
 c.restore();}


export function drawC1Scenery(c,bank,o,people=[]){if(!o.c1Authored)return false;c.save();c.globalAlpha*=sceneryAlphaV26(bank,o,people);bank.draw(c,o.sheet,o.asset,o.x,o.y,o.w,o.h);c.restore();return true;}

export function drawC1Creature(c,e,bank){if(!e.c1Species)return false;const sheet=e.c1Species==='beetle'?'c1Beetle':'c1Construct',i=e.wind>0?4:e.attackAnim>0?5:e.moving?1+Math.floor((e.walkDistance||0)/23)%3:0,f=bank.frame(sheet,i);if(!f)return false;const size=e.c1Species==='beetle'?66:95,k=size/(bank.frame(sheet,0)?.h||f.h);c.save();c.translate(e.x,e.y);if(Math.cos(e.angle||0)>0)c.scale(-1,1);if(e.dead)c.globalAlpha=.45;c.imageSmoothingEnabled=true;c.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,-f.w*k/2,-f.h*k,f.w*k,f.h*k);c.restore();return true;}

export function c1PersonFrame(a){const base=a.id==='c1saido'?8:0,back=Math.sin(a.angle||0)<-.25,row=back?4:0;return base+row+(a.moving?1+Math.floor((a.walkDistance||0)/23)%2:Math.cos(a.angle||0)<0?3:0);}
export function drawC1Person(c,a,bank){if(!['c1rosa','c1saido'].includes(a.id))return false;const sheet='c1Artisans',i=c1PersonFrame(a),f=bank.frame(sheet,i),ref=bank.frame(sheet,a.id==='c1saido'?8:0);if(!f||!ref)return false;const k=82/ref.h;c.save();c.imageSmoothingEnabled=true;c.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,a.x-f.w*k/2,a.y-f.h*k,f.w*k,f.h*k);c.restore();return true;}
