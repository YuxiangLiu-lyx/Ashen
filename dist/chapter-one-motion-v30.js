// Transient visual reactions; does not alter RNG, hit timing, cooldowns or physics.
import {chapterOneV30} from './chapter-one-art-v30.js';
const reactions=new WeakMap(),defeats=new WeakMap(),fallen=new WeakSet();
export const reactionV30=a=>reactions.get(a)||null;
export const defeatsV30=g=>defeats.get(g)||[];
export function motionPoseV30(a,time=0,{hero=false,reaction=null}={}){
 const direction=Math.cos(a.angle||0)<0?-1:1;
 let dx=0,dy=0,rotation=0,sx=1,sy=1;
 if(a.wind>0){const p=Math.max(0,Math.min(1,1-a.wind/Math.max(.01,a.windMax||.45)));dx=-direction*3*p;dy=1.8*p;sx=1+.025*p;sy=1-.04*p;rotation=-direction*.035*p;}
 else if(a.attackAnim>0){const duration=hero?(a.attackDuration||.36):.32,p=Math.max(0,Math.min(1,1-a.attackAnim/duration)),strike=Math.sin(p*Math.PI);dx=direction*strike*(hero?3.5:7);dy=-strike*1.5;rotation=direction*strike*.045;}
 else if(a.moving){const phase=(a.walkDistance??(a.anim||0)*18)/18;dy=-Math.abs(Math.sin(phase))*(hero?.75:1.1);rotation=Math.sin(phase)*.009;}
 else {sy=1+Math.sin(time*2.1+(a.x||0))*.003;}
 if(a.fall){rotation+=direction*Math.min(1,a.fall)*(['guard','captain'].includes(a.type)?1.4:.6);sy*=1-Math.min(1,a.fall)*.24;}
 if(reaction){const fade=Math.max(0,reaction.life/.16);dx+=reaction.dx*fade;dy+=reaction.dy*fade;rotation+=reaction.dx*.008*fade;}
 return {dx,dy,rotation,sx,sy};
}
export function applyMotionV30(c,a,time,options){const p=motionPoseV30(a,time,options);c.translate(a.x+p.dx,a.y+p.dy);c.rotate(p.rotation);c.scale(p.sx,p.sy);c.translate(-a.x,-a.y);}
export function installChapterOneMotionV30(RPG){
 const P=RPG.prototype;if(P.__motionV30)return;Object.defineProperty(P,'__motionV30',{value:true});
 const damage=P.damage,hurt=P.hurt,update=P.update,enter=P.enter,restore=P.restore;
 P.damage=function(e,...args){const hp=e.hp,wasDead=e.dead,result=damage.call(this,e,...args),kind=args[1]||'hit';
  if(chapterOneV30(this.map)&&e.hp<hp&&!['dot','proc','enchant'].includes(kind)){
   const angle=Math.atan2(e.y-this.p.y,e.x-this.p.x);reactions.set(e,{life:.16,dx:Math.cos(angle)*4,dy:Math.sin(angle)*2});
  }
  if(chapterOneV30(this.map)&&!wasDead&&e.dead&&!fallen.has(e)){
   fallen.add(e);defeats.set(this,[...(defeats.get(this)||[]),{actor:{...e},x:e.x,y:e.y,life:.38,max:.38}]);
  }return result;
 };
 P.hurt=function(...args){const hp=this.p.hp,result=hurt.apply(this,args);if(chapterOneV30(this.map)&&this.p.hp<hp)reactions.set(this.p,{life:.16,dx:-Math.cos(this.p.angle)*3,dy:1});return result;};
 P.update=function(dt,...args){
  for(const a of [this.p,...this.enemies]){const r=reactions.get(a);if(r){r.life-=dt;if(r.life<=0)reactions.delete(a);}}
  const ghosts=defeats.get(this);if(ghosts)defeats.set(this,ghosts.map(v=>({...v,life:v.life-dt})).filter(v=>v.life>0));
  return update.call(this,dt,...args);
 };
 P.enter=function(...args){defeats.delete(this);reactions.delete(this.p);return enter.apply(this,args);};
 P.restore=function(...args){defeats.delete(this);reactions.delete(this.p);return restore.apply(this,args);};
}
