// Painted animation families shared by careers and learned cross-career skills.
export const VFX_FAMILY={shadow:0,steel:1,fire:2,spirit:3,holy:4,healing:5};
export const SKILL_VFX={q:{shadow:'shadow',oath:'steel',ember:'fire'},e:{shadow:'shadow',oath:'steel',ember:'fire'},cleave:'steel',firebolt:'fire',crash:'steel',frost:'spirit',sprint:'healing',tether:'spirit',boneBreak:'steel',emberLance:'fire',soulBind:'spirit',ashWard:'spirit',bloodPact:'shadow',graveBell:'spirit',wispLantern:'spirit',counterBrand:'steel',ferrymanCut:'spirit',echoExchange:'spirit',saintRay:'holy',saintMend:'healing',saintAegis:'holy',saintNova:'holy',saintChime:'holy',resonance:'fire'};
export function skillFamily(cls,key){const v=SKILL_VFX[key];return typeof v==='object'?v[cls]||'holy':v||({shadow:'shadow',oath:'steel',ember:'fire',saint:'holy'}[cls]||'steel');}
export function effectFamily(f){if(f.type==='holyHeal'||f.type==='heal'||f.type==='level')return 'healing';if(f.type.startsWith('holy'))return 'holy';if(['frost','soulBind','ashShield','graveBell','lightning'].includes(f.type))return 'spirit';if(f.type==='flame')return 'fire';if(f.type==='bloodPact')return 'shadow';return skillFamily(f.ownerClass,f.skillKey);}
const cached=new WeakMap();
function atlasFrame(bank,row,index){const image=bank.images.combatFX;if(!image)return null;let list=cached.get(image);if(!list){list=[];const sw=image.width/4,sh=image.height/6;for(let r=0;r<6;r++)for(let j=0;j<4;j++){const c=document.createElement('canvas');c.width=sw;c.height=sh;const ctx=c.getContext('2d');ctx.drawImage(image,j*sw,r*sh,sw,sh,0,0,sw,sh);
   // Source remains unmodified. Alpha masks protect against any frame-edge bleed.
   ctx.globalCompositeOperation='destination-in';const x=ctx.createLinearGradient(0,0,sw,0);x.addColorStop(0,'#0000');x.addColorStop(.095,'#000');x.addColorStop(.905,'#000');x.addColorStop(1,'#0000');ctx.fillStyle=x;ctx.fillRect(0,0,sw,sh);const y=ctx.createLinearGradient(0,0,0,sh);y.addColorStop(0,'#0000');y.addColorStop(.095,'#000');y.addColorStop(.905,'#000');y.addColorStop(1,'#0000');ctx.fillStyle=y;ctx.fillRect(0,0,sw,sh);list.push(c);}cached.set(image,list);}return list[row*4+index];}
export function paintedFX(c,bank,family,phase,x,y,width,height=width,angle=0,alpha=1){const frame=atlasFrame(bank,VFX_FAMILY[family]??1,Math.max(0,Math.min(3,phase)));if(!frame)return false;c.save();c.globalAlpha*=Math.max(0,Math.min(1,alpha));c.translate(x,y);c.rotate(angle);c.imageSmoothingEnabled=true;c.drawImage(frame,-width*.5,-height*.72,width,height);c.restore();return true;}
export function drawPaintedEffect(c,bank,f,time){
 const supported=['cut','enemyCut','spin','streak','trail','impact','flame','frost','guard','shield','holyCast','holyHeal','holyNova','holyShield','holyChime','ashShield','soulBind','bloodPact','graveBell','heal','level','machine','lightning'];if(!supported.includes(f.type))return false;
 const t=Math.max(0,Math.min(.999,1-f.life/f.max)),phase=Math.floor(t*4),family=effectFamily(f),direction=f.a||0,melee=['cut','streak','trail','enemyCut'].includes(f.type),size=Math.min(f.type==='enemyCut'?85:210,Math.max(48,f.r*(melee?1.32:1.18)));
 const x=f.x+(melee?Math.cos(direction)*size*.22:0),y=f.y+(melee?Math.sin(direction)*size*.2:0);
 if(!paintedFX(c,bank,family,phase,x,y+18,size,size,melee?direction+.35:0,Math.min(1,(1-t)*2)))return false;
 if(f.type==='spin'){paintedFX(c,bank,family,phase,f.x-32,f.y+9,size*.82,size*.74,Math.PI+t*.65,.8);}
 if(['holyNova','graveBell','frost'].includes(f.type))for(let i=0;i<5;i++){const a=i*2.399,r=f.r*(.32+.44*t);paintedFX(c,bank,family,(phase+i)%4,f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.64,50,72,0,(1-t)*.55);}
 return true;
}
export function drawFireZone(c,bank,z,time){
 const fade=Math.min(1,z.life/1.0),r=z.r;c.save();const glow=c.createRadialGradient(z.x,z.y,6,z.x,z.y,r);glow.addColorStop(0,'#d982392d');glow.addColorStop(.7,'#c0642014');glow.addColorStop(1,'#c0642000');c.fillStyle=glow;c.fillRect(z.x-r,z.y-r,r*2,r*2);c.restore();
 for(let i=0;i<7;i++){const a=i*2.399,d=i?(.32+(i%3)*.18)*r:0,phase=Math.floor(time*8+i)%4;paintedFX(c,bank,'fire',phase,z.x+Math.cos(a)*d,z.y+Math.sin(a)*d*.78+12,52+(i%3)*8,68+(i%3)*10,0,fade*(i?.55:.9));}
}
export function drawPaintedProjectile(c,bank,b,time){const family=b.holy?'holy':b.enemyType==='hellSoul'?'spirit':b.friendly?'fire':'steel',a=Math.atan2(b.vy,b.vx);return paintedFX(c,bank,family,Math.floor(time*14)%4,b.x,b.y,b.skill?52:37,b.skill?36:26,a+.3,.95);}

export function warmPaintedFX(bank){return !!atlasFrame(bank,0,0);}
