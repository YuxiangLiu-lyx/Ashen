// Reuse original scene IDs, staging, knowledge grants and completion actions.
// Flags preserve old saves; a blocked entrance remains eligible on the next safe tick.
export const EXPERIENCE_EVENTS = [
 {id:'saintBrief',map:'town',chapter:2,flag:'cityIntro',markOnStart:true,then:null,stage:'chapel',actors:['saint','prelate'],audience:'player'},
 {id:'assassination',map:'chapel',chapter:2,flag:'assassination',markOnStart:true,then:'assassinate',stage:'chapel',actors:['hero','saint','prelate'],audience:'present'},
 {id:'canalStart',map:'canal',chapter:3,flag:'captainStarted',markOnStart:false,then:'captain',stage:'canal',actors:['hero','saint','captain'],audience:'present'}
];
export function experienceSceneSafe(g){return g.active&&!g.pending&&!g.transition&&g.p.hp>0&&!g.enemies.some(e=>!e.dead&&Math.hypot(e.x-g.p.x,e.y-g.p.y)<360&&g.clearLine(e,g.p,false))&&!g.bullets.some(b=>b.friendly===false);}
export function installExperienceTriggers(RPG){
 const P=RPG.prototype,enter=P.enter,begin=P.beginScene,update=P.update;
 P.beginScene=function(id,then){
  const row=this.experienceEntering&&EXPERIENCE_EVENTS.find(r=>r.id===id&&r.map===this.map&&r.chapter===this.chapter);
  if(row&&!experienceSceneSafe(this)){if(row.markOnStart)this.flags[row.flag]=false;this.saveEvent();return false;}
  return begin.call(this,id,then);
 };
 P.enter=function(...args){this.experienceEntering=true;try{return enter.apply(this,args);}finally{delete this.experienceEntering;}};
 P.experienceSceneTick=function(){
  if(!experienceSceneSafe(this))return false;
  const row=EXPERIENCE_EVENTS.find(r=>r.map===this.map&&r.chapter===this.chapter&&!this.flags[r.flag]);
  if(!row)return false;
  if(row.markOnStart)this.flags[row.flag]=true;
  this.beginScene(row.id,row.then);return true;
 };
 P.update=function(...args){if(this.experienceSceneTick())return;return update.apply(this,args);};
}
