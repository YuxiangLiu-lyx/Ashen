import {profileForEnemy} from './balance-v14.js';
import {C1_MAPS} from './chapter-one-layout.js';
import {CHAPTER_TWO_MAPS_V30,CHAPTER_THREE_MAPS_V30} from './chapter23-design-v30.js';

const maps=new Set([...C1_MAPS,...CHAPTER_TWO_MAPS_V30,...CHAPTER_THREE_MAPS_V30]);
const isBoss=e=>!!e.isBoss||['captain','hellJailer'].includes(e.type)||!!profileForEnemy(e.type,e.id).isBoss;
// Regional named roles keep their authored budgets in their original data tables.
export function enduranceFactor(e,map){
 if(!maps.has(map)||e.c1Training||e.c1NoReward||e.c1Custom||e.experienceRole)return 1;
 return isBoss(e)?1.7:e.elite?1.65:1.45;
}
function tune(e,map){
 const factor=enduranceFactor(e,map);if(factor===1||!Number.isFinite(e.maxHP))return;
 if(e.endurance?.revision===1)return;
 const ratio=Math.max(0,Math.min(1,e.hp/Math.max(1,e.maxHP))),base=e.maxHP;
 e.maxHP=Math.round(base*factor);e.hp=e.dead||e.hp<=0?0:Math.max(1,Math.round(e.maxHP*ratio));
 e.endurance={revision:1,base,maxHP:e.maxHP};
}
export function installEncounterRestraint(RPG){
 const P=RPG.prototype,old={};for(const key of ['enemy','ensureMap','restore'])old[key]=P[key];
 P.enemy=function(...args){const e=old.enemy.apply(this,args);if(this._enduranceCreationMap==null)tune(e,this.map);return e;};
 P.ensureMap=function(map){
  const previous=this._enduranceCreationMap;this._enduranceCreationMap=map;
  try{const result=old.ensureMap.call(this,map);for(const e of this.states[map]?.enemies||[])tune(e,map);return result;}
  finally{this._enduranceCreationMap=previous;}
 };
 P.restore=function(...args){const result=old.restore.apply(this,args);for(const [map,s]of Object.entries(this.states))for(const e of s.enemies)tune(e,map);return result;};
}

// Early encounters use only a thin physical trace. No additive bloom or atlas stamp.
export function restrainedEncounter(map){return maps.has(map);}
export function drawRestrainedWarning(c,e){
 const t=e.telegraph;if(!t||e.wind<=0||!isBoss(e))return;
 const progress=Math.max(0,Math.min(1,1-e.wind/Math.max(.01,e.windMax)));
 const fire=/furnace/.test(e.type),chain=/Jailer/.test(e.type);
 c.save();c.strokeStyle=fire?'#cb9975':chain?'#a6b6bc':'#c9b995';c.globalAlpha=.42+progress*.28;c.lineWidth=1.6;
 const a=t.a??e.angle,x=t.x??e.x,y=t.y??e.y;
 if(t.shape==='line'||t.shape==='rect'){
  c.translate(x,y);c.rotate(a);const h=(t.width||32)/2,len=t.length||100;
  c.setLineDash(chain?[8,5]:[16,7]);
  for(const sign of [-1,1]){c.beginPath();c.moveTo(0,h*sign);c.lineTo(len,h*sign);c.stroke();}
  c.setLineDash([]);c.beginPath();c.moveTo(len-9,-6);c.lineTo(len,0);c.lineTo(len-9,6);c.stroke();
 }else if(t.shape==='circle'){
  const r=t.r||100;c.setLineDash([12,6]);c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.setLineDash([]);
  // Short cracks identify a fixed landing point without filling the arena.
  for(let i=0;i<3;i++){const angle=i*Math.PI*2/3;c.beginPath();c.moveTo(x+Math.cos(angle)*8,y+Math.sin(angle)*8);c.lineTo(x+Math.cos(angle+.2)*22,y+Math.sin(angle+.2)*22);c.lineTo(x+Math.cos(angle)*34,y+Math.sin(angle)*34);c.stroke();}
 }else{
  const r=t.r||100,arc=t.arc??.82;c.beginPath();c.arc(x,y,r,a-arc,a+arc);c.stroke();
  for(const sign of [-1,1]){c.beginPath();c.moveTo(x+Math.cos(a+arc*sign)*(r-15),y+Math.sin(a+arc*sign)*(r-15));c.lineTo(x+Math.cos(a+arc*sign)*r,y+Math.sin(a+arc*sign)*r);c.stroke();}
 }
 c.restore();
}
export function drawRestrainedImpact(c,f){
 if(!f.hostile)return false;
 const t=Math.max(0,Math.min(1,f.life/f.max));c.save();c.globalAlpha=t*.65;c.strokeStyle=f.color||'#c6b69a';c.fillStyle=c.strokeStyle;c.lineWidth=1.5;
 if(f.type==='enemyCut'){
  c.translate(f.x,f.y);c.rotate(f.a||0);c.beginPath();c.arc(0,0,Math.min(36,f.r*.5),-.5,.55);c.stroke();
 }else if(f.type==='streak'){
  c.translate(f.x,f.y);c.rotate(f.a||0);c.beginPath();c.moveTo(-9,0);c.lineTo(19,0);c.stroke();
 }else for(let i=0;i<5;i++){const a=i*2.4,r=(1-t)*Math.min(45,f.r);c.fillRect(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r*.5,2,2);}
 c.restore();return true;
}
