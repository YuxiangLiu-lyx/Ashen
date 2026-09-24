import {drawMedicalBed,drawCourtActor,drawV11Monster} from './art-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {HELL_PROPS_META} from './hell-props-meta-v14.js';
import {HELL_NPC_META} from './npc-actions-meta-v14.js';
import {HELL_ART_META} from './hell-art-meta-v14.js';
import {CH3_GROUND_STYLE} from './chapter3-world-v14.js';
export function installHellFrames(bank,name){const key={hellWorld:'environment',hellEnemies:'enemies',hellPortraits:'portraits',hellNPC:'actions',hellProps:'props'}[name];if(!key)return;bank.frames[name]=(name==='hellNPC'?HELL_NPC_META:name==='hellProps'?HELL_PROPS_META:HELL_ART_META[key]).items.map(m=>({x:m.sourceRect[0],y:m.sourceRect[1],w:m.sourceRect[2],h:m.sourceRect[3],cell:{x:m.sourceRect[0],y:m.sourceRect[1],w:m.sourceRect[2],h:m.sourceRect[3]},meta:m}));}
export function hellGround(bank,id){const style=CH3_GROUND_STYLE[id]||V11_GROUND_STYLE[id];if(!style)return null;const c=document.createElement('canvas');c.width=1600;c.height=1080;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=true;
 const texture=(asset,sheet=style.sheet||'hellWorld')=>{const t=document.createElement('canvas'),mirrored=sheet==='cityGround',side=mirrored?320:192;t.width=t.height=side*(mirrored?2:1);const f=bank.frame(sheet,asset),tc=t.getContext('2d');if(mirrored){for(let y=0;y<2;y++)for(let x=0;x<2;x++){tc.save();tc.translate((x?2:0)*side,(y?2:0)*side);tc.scale(x?-1:1,y?-1:1);tc.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,0,0,side,side);tc.restore();}}else tc.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,0,0,side,side);return ctx.createPattern(t,'repeat');};
 ctx.fillStyle=texture(style.base);ctx.fillRect(0,0,1600,1080);
 for(const p of style.paths||[]){ctx.save();ctx.strokeStyle=texture(p.asset);ctx.lineJoin='round';ctx.lineCap='round';ctx.lineWidth=p.width;ctx.beginPath();p.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.restore();}
 for(const p of style.patches||[]){ctx.save();ctx.fillStyle=texture(p.asset);if(p.shape==='ellipse'){for(let j=12;j>0;j--){ctx.globalAlpha=.075;ctx.beginPath();ctx.ellipse(p.x,p.y,p.w/2*j/12,p.h/2*j/12,0,0,7);ctx.fill();}}else{ctx.globalAlpha=.4;ctx.fillRect(p.x-p.w/2,p.y-p.h/2,p.w,p.h);}ctx.restore();}
 const vignette=ctx.createRadialGradient(800,580,300,800,580,970);vignette.addColorStop(0,'#10121500');vignette.addColorStop(1,'#070d16c9');ctx.fillStyle=vignette;ctx.fillRect(0,0,1600,1080);
 // Authored ground textures provide grit; do not scatter procedural spots indoors.
 return c;
}
export function drawHellMonster(c,bank,a,time){if(a.type.startsWith('trialBoss'))a={...a,type:['ironScuttler','furnaceSentinel','odric','martha','severin'][Number(a.type.slice(9))-1]};if(drawV11Monster(c,bank,a,time))return true;const family={deepHound:'hellHound',deepSoul:'hellSoul',deepGuard:'hellGuard',deepElite:'hellGuard'}[a.type];if(family)a={...a,type:family};const row={hellHound:0,hellSoul:1,hellGuard:2,hellJailer:3}[a.type];if(row===undefined)return false;const steps=[1,1,0,2,2,0],moving=a.moving&&!a.wind;const phase=a.attackAnim>0?3:moving?steps[Math.floor((a.walkDistance||0)/(row===0?24:30))%steps.length]:0;const f=bank.frame('hellEnemies',row*4+phase);if(!f)return true;const base=HELL_ART_META.enemies.items[row*4].sourceRect[3],unit=[62,88,95,142][row]/base;const anchor=f.meta.anchorInSourceRect;c.save();c.translate(Math.round(a.x),Math.round(a.y));if(Math.cos(a.angle||0)<0)c.scale(-1,1);if(a.elite)c.filter='brightness(1.12)';c.imageSmoothingEnabled=true;c.drawImage(bank.images.hellEnemies,f.x,f.y,f.w,f.h,-anchor[0]*unit,-anchor[1]*unit,f.w*unit,f.h*unit);c.restore();return true;}
// Cache immutable atmosphere paint. Gradients remain vectors at the final canvas
// resolution; one fog bitmap per context is regenerated only when color/scale changes.
// No map, particle, animation timing, or combat state is altered.
const atmospherePaintV13=new WeakMap();
function atmospherePaint(c){
 let paint=atmospherePaintV13.get(c);
 if(!paint){paint={red:[],fog:null};atmospherePaintV13.set(c,paint);}
 return paint;
}
function hellTint(c,safe){
 const paint=atmospherePaint(c),index=safe?1:0;
 if(!paint.red[index]){const red=c.createLinearGradient(0,0,1600,1080);red.addColorStop(0,'#3048540a');red.addColorStop(1,safe?'#76542a10':'#6d231b20');paint.red[index]=red;}
 return paint.red[index];
}
function hellFog(c,safe){
 const paint=atmospherePaint(c),t=c.getTransform();
 const side=Math.ceil(460*Math.max(1,Math.hypot(t.a,t.b),Math.hypot(t.c,t.d)));
 if(paint.fog?.side===side&&paint.fog.safe===safe)return paint.fog.canvas;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=side;
 const ctx=canvas.getContext('2d');ctx.setTransform(side/460,0,0,side/460,0,0);
 const fog=ctx.createRadialGradient(230,230,0,230,230,230);fog.addColorStop(0,safe?'#c6b0810c':'#8db6c312');fog.addColorStop(1,'#8db6c300');ctx.fillStyle=fog;ctx.fillRect(0,0,460,460);
 paint.fog={side,safe,canvas};return canvas;
}
export function drawHellAtmosphere(c,bank,id,time,front=false){
 if(!CH3_GROUND_STYLE[id]&&!V11_GROUND_STYLE[id])return;
 const safe=['hellCamp','hellWorkshop','deepCamp','deepSeal'].includes(id);c.save();
 if(!front){c.fillStyle=hellTint(c,safe);c.fillRect(0,0,1600,1080);}
 else{
  for(let i=0;i<22;i++){const x=(i*193+time*(safe?7:14))%1600,y=(i*107-time*10+100000)%1080;c.fillStyle=i%4===0?'#eeb46b66':'#a0b7bf38';c.beginPath();c.ellipse(x,y,1.1+i%2,.8,0,0,7);c.fill();}
  const fog=hellFog(c,safe);c.imageSmoothingEnabled=true;
  for(let i=0;i<4;i++){const x=230+i*410+Math.sin(time*.06+i)*30,y=350+(i%2)*460;c.drawImage(fog,x-230,y-230,460,460);}
 }
 c.restore();
}
export function drawTravelBed(c,bank,x,y,cart=false){drawMedicalBed(c,bank,x,y,cart);}

export function drawHellNPC(c,bank,a,time,size=82){
 if(drawCourtActor(c,bank,a,time,size))return true;
 const row={deepEnchanter:0,deepMerchant:1,deepInnkeeper:0,doctor:0,mechanist:1,dancer1:2,dancer2:2,servant:3}[a.id];if(row===undefined||!bank.images.hellNPC)return false;
 let phase=a.moving?(1+Math.floor((a.walkDistance||0)/24)%2):0;
 if(row===2)phase=a.fall>.2?3:[0,1,2,1][Math.floor(time*2+(a.id==='dancer2'?2:0))%4];
 else if(row===3)phase=a.pose==='collect_shards'?3:a.fall>.2?2:a.pose==='tray'||a.moving?1:0;
 else if(!a.moving&&a.pose==='work')phase=3;
 const f=bank.frame('hellNPC',row*4+phase),k=size/HELL_NPC_META.renderScaleReferenceHeight;if(!f)return true;
 const [ax,ay]=f.meta.anchorInSourceRect;c.save();c.translate(Math.round(a.x),Math.round(a.y));if(Math.cos(a.angle||0)<0)c.scale(-1,1);
 c.imageSmoothingEnabled=true;c.drawImage(bank.images.hellNPC,f.x,f.y,f.w,f.h,-ax*k,-ay*k,f.w*k,f.h*k);c.restore();return true;
}
