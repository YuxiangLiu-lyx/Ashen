import {c1NaturalSprite,drawC1LocalPerson} from './chapter-one-natural-art.js';
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

 c.restore();
 // Only edges bordering real land get a wall/vegetation silhouette. Never hide
 // a walkable meadow under a grid of decorative trees.
 // Sample the actual land edge. Dense low shrubs/stone courses make the
 // collision edge readable, with irregular foliage rather than square grass cuts.
 for(let y=185;y<1010;y+=55)for(let x=140;x<1490;x+=65){const xx=x+Math.sin(y*.03+x)*12,yy=y+Math.cos(x*.03)*8;if(c1Land(id,xx,yy)||plan.water?.some(([a,b,w,h])=>xx>a-30&&xx<a+w+30&&yy>b&&yy<b+h))continue;
  const edge=[[48,0],[-48,0],[0,42],[0,-42]].some(([dx,dy])=>c1Land(id,xx+dx,yy+dy));if(!edge)continue;
  if(plan.outdoor&&plan.edge!=='masonry'){bank.draw(c,'chapterArchitecture',6,xx,yy+24,105+Math.sin(x)*13,68);if(Math.sin(x*.1+y*.2)>.67)bank.draw(c,'chapterArchitecture',2,xx-12,yy+5,155,165);}
 }

 if(!plan.outdoor||plan.edge==='masonry'){
  for(const side of ['north','south'])for(let y=180;y<980;y+=20){let start=null;for(let x=140;x<=1480;x+=20){const edge=x<1480&&c1Land(id,x+10,y+10)&&!c1Land(id,x+10,y+(side==='north'?-10:30));if(edge&&start===null)start=x;if(!edge&&start!==null){for(let xx=start;xx<x;xx+=200)bank.draw(c,'c1Walls',side==='north'?0:1,xx+Math.min(210,x-xx)/2,y+(side==='north'?5:40),Math.min(210,x-xx),side==='north'?78:44);start=null;}}}
  for(const side of ['west','east'])for(let x=140;x<1480;x+=20){let start=null;for(let y=180;y<=980;y+=20){const edge=y<980&&c1Land(id,x+10,y+10)&&!c1Land(id,x+(side==='west'?-10:30),y+10);if(edge&&start===null)start=y;if(!edge&&start!==null){for(let yy=start;yy<y;yy+=190)bank.draw(c,'c1Walls',side==='west'?2:3,x+(side==='west'?-12:33),yy+Math.min(200,y-yy),52,Math.min(200,y-yy));start=null;}}}
 }
 for(const [x,y,w,h]of plan.water||[]){const water=bank.images.c1Water;if(water){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();for(let yy=y;yy<y+h;yy+=320)c.drawImage(water,x-80,yy,320,320);c.restore();}
  for(let yy=y+40;yy<y+h+40;yy+=100){for(const [xx,flip]of [[x,-1],[x+w,1]]){c.save();c.translate(xx,yy);c.rotate(flip*Math.PI/2);c1NaturalSprite(c,bank,plan.floor===1?4:3,0,10,112,32);c.restore();}}
 }
 for(const [x,y,w,h]of plan.bridges||[]){c.save();c.translate(x+w/2,y+h/2);c.rotate(Math.PI/2);bank.draw(c,'chapterArchitecture',7,0,w/2,h,w);c.restore();}
 return canvas;
}
export function drawC1Prop(c,bank,g,p,people=[]){
 if(!p.c1Art&&!p.action?.startsWith('c1:'))return false;
 if(p.c1Resource&&!g.c1PropVisible?.(p))return true;
 const spec=p.c1Art;if(!spec)return true;
 const [sheet,index,w,h]=spec;c.save();c.globalAlpha=(p.used?.45:1)*sceneryAlphaV26(bank,{...p,sheet:sheet==='loom'?'c1Loom':'chapter'+sheet,asset:index,w,h},people);bank.draw(c,sheet==='loom'?'c1Loom':'chapter'+sheet,index,p.x,p.y,w,h);c.restore();return true;
}
// Readable enemy windups use the game's painted dust/impact images, never floor polygons.
export function drawC1Telegraph(c,t,bank){if(!t||!bank)return;const f=bank.frame('combatFX',1);if(!f)return;const width=t.r?2*t.r:t.length||120,height=t.shape==='rect'?t.width:width*.65;c.save();c.globalAlpha=.48;c.translate(t.x,t.y);c.rotate(t.a||0);bank.draw(c,'combatFX',1,t.shape==='rect'?width/2:0,height/2,width,height);c.restore();}
export function drawC1World(c,g,bank){if(c1Map(g.map)){const plan=C1_LAYOUTS[g.map];for(const d of g.targets().filter(t=>t.kind==='door')){const outside=plan.outdoor;if(outside)c1NaturalSprite(c,bank,5,d.x+38,d.y,42,88);else bank.draw(c,'c1Walls',d.to==='c1TrialCrypt'||d.to==='c1TrialVault'||d.to==='c1DrillGallery'?4:5,d.x,d.y+12,112,108);if(Math.hypot(g.p.x-d.x,g.p.y-d.y)<240){c.save();c.textAlign='center';c.font='16px serif';c.fillStyle='#ecdfbf';c.shadowColor='#121913';c.shadowBlur=5;c.fillText(d.label||d.to,d.x,d.y+26);c.restore();}}}
 drawC1Telegraph(c,g.c1TrainingSession?.warning,bank);for(const e of g.enemies)if(!e.dead&&e.telegraph?.c1)drawC1Telegraph(c,e.telegraph,bank);
}
export function drawC1Target(c,e,bank){if(!e.c1Training)return false;if(bank)bank.draw(c,'chapterUtilities',16,e.x,e.y,65,105);return true;}
export function drawC1Elite(){}

export function drawC1Scenery(c,bank,o,people=[]){if(!o.c1Authored)return false;c.save();c.globalAlpha*=sceneryAlphaV26(bank,o,people);bank.draw(c,o.sheet,o.asset,o.x,o.y,o.w,o.h);c.restore();return true;}

export function drawC1Creature(c,e,bank){if(!e.c1Species)return false;const sheet=e.c1Species==='beetle'?'c1Beetle':e.c1Species==='vaultwarden'?'c1VaultGuardian':'c1Construct',i=e.wind>0?4:e.attackAnim>0?5:e.moving?1+Math.floor((e.walkDistance||0)/23)%3:0,f=bank.frame(sheet,i);if(!f)return false;const size=e.c1Species==='beetle'?66:95,k=size/(bank.frame(sheet,0)?.h||f.h);c.save();c.translate(e.x,e.y);if(Math.cos(e.angle||0)>0)c.scale(-1,1);if(e.dead)c.globalAlpha=.45;c.imageSmoothingEnabled=true;c.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,-f.w*k/2,-f.h*k,f.w*k,f.h*k);c.restore();return true;}

export function c1PersonFrame(a){const base=a.id==='c1saido'?8:0,back=Math.sin(a.angle||0)<-.25,row=back?4:0;return base+row+(a.moving?1+Math.floor((a.walkDistance||0)/23)%2:Math.cos(a.angle||0)<0?3:0);}
export function drawC1Person(c,a,bank){if(drawC1LocalPerson(c,a,bank))return true;if(!['c1rosa','c1saido'].includes(a.id))return false;const sheet='c1Artisans',i=c1PersonFrame(a),f=bank.frame(sheet,i),ref=bank.frame(sheet,a.id==='c1saido'?8:0);if(!f||!ref)return false;const k=82/ref.h;c.save();c.imageSmoothingEnabled=true;c.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,a.x-f.w*k/2,a.y-f.h*k,f.w*k,f.h*k);c.restore();return true;}
