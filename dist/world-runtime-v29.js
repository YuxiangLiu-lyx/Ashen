import {repairChapter23AnchorsV30,TOWN_NOTICE_ANCHOR_V30} from './chapter23-design-v30.js';
import {DEMO_MAPS_V29} from './world-design-v29.js';
import {WORLD_DIALOGUES_V29} from './world-dialogues-v29.js';
const demo=new Set(DEMO_MAPS_V29), distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const feedback=new WeakMap();
const fresh=()=>({schema:1,seen:[]});
export function validateWorldSaveV29(save){
 const value=save.flags?.worldV29;if(value===undefined)return;
 if(!value||Array.isArray(value)||value.schema!==1||Object.keys(value).some(k=>!['schema','seen'].includes(k))||!Array.isArray(value.seen)||value.seen.length>64||new Set(value.seen).size!==value.seen.length||value.seen.some(k=>typeof k!=='string'||!/^[-a-z0-9]{1,64}$/.test(k)))throw Error('磨坊探索记录不完整。原存档应保留后再重试。');
}
const state=g=>g.flags.worldV29||(g.flags.worldV29=fresh());
// Retained for existing callers; interactions no longer create a timed operation.
export const worldOperationV29=()=>null;
export const worldFeedbackV29=g=>feedback.get(g)||[];
export function worldPropVisibleV29(g,p){
 if(p.id==='v29-echo-core')return !!g.flags.echoWardenDefeated&&!g.flags.echoCoreFound;
 if(p.id==='v29-repair-core')return g.quests.echo==='done';
 return true;
}
export function worldProgressV29(g){
 if(g.quests.echo==='done')return g.refineryUnlocked()?'ready':'curing';
 if(g.flags.echoCoreFound)return 'return';
 if(g.flags.echoWardenDefeated&&g.echoReady())return 'extract';
 if(g.flags.echoWardenDefeated)return 'clear-workspace';
 return g.flags.echoLog?'encounter':'inspect';
}

export function installWorldExplorationV29(RPG,{MAPS,DIALOGUES}){
 const P=RPG.prototype;if(P.__worldV29)return;Object.defineProperty(P,'__worldV29',{value:true});Object.assign(DIALOGUES,WORLD_DIALOGUES_V29);
 const oldEnsure=P.ensureMap,oldEnter=P.enter,oldRestore=P.restore,oldTargets=P.targets,oldUse=P.useProp,oldInteract=P.interact,oldUpdate=P.update,oldChoose=P.chooseExtra,oldApply=P.applyExtra,oldMechanism=P.mechanismProp,oldGoal=P.questGoal,oldReward=P.takeEchoReward;
 Object.assign(MAPS.town.props.find(p=>p.id==='townbook'),TOWN_NOTICE_ANCHOR_V30);
 function migrate(g,id){
  if(id==='bridge'||id==='town')repairChapter23AnchorsV30(g);
  if(!demo.has(id)||!g.states[id])return;
  const st=g.states[id],m=MAPS[id];state(g);
  if(st.layoutV29!==1){
   const spawns=new Map(m.spawns.map(a=>[a[3],a]));
   for(const e of st.enemies){const spawn=spawns.get(e.id);if(!spawn){e.worldRetiredV29=true;e.dead=true;e.hp=0;e.aiState='DEAD';continue;}if(!e.dead)Object.assign(e,{x:spawn[1],y:spawn[2],homeX:spawn[1],homeY:spawn[2],roamTarget:null,wind:0,telegraph:null,action:null,aiState:'IDLE',returning:false});}
   st.layoutV29=1;
  }
  for(const e of st.enemies){const group=m.encounters?.find(a=>a.spawnIds.includes(e.id));if(group)Object.assign(e,{groupId:group.groupId,leashBounds:group.leashBounds,activationBounds:group.activationBounds,isBossArena:false,isBoss:group.bossId===e.id});}
  // Old resolved claims remain authoritative; new prerequisites are not imposed retroactively.
  if(g.flags.echoCoreFound||g.quests.echo==='done'||(g.p.items.echoCore||0)>0){g.flags.echoCoreFound=true;if(g.quests.echo==='done'||g.flags.echoCoreFound)g.flags.echoWardenDefeated=true;}
  if(id==='echo'&&g.flags.echoWardenDefeated){const w=st.enemies.find(e=>e.id==='echo-warden');if(w){w.dead=true;w.hp=0;w.aiState='DEAD';}}
 }
 P.ensureMap=function(id){const result=oldEnsure.call(this,id);migrate(this,id);return result;};
 P.enter=function(...args){feedback.delete(this);const result=oldEnter.apply(this,args);migrate(this,this.map);return result;};
 P.restore=function(saved){validateWorldSaveV29(saved);feedback.delete(this);const result=oldRestore.call(this,saved);for(const id of DEMO_MAPS_V29)migrate(this,id);repairChapter23AnchorsV30(this);return result;};
 P.targets=function(){return oldTargets.call(this).filter(p=>worldPropVisibleV29(this,p));};
 P.worldCueV29=function(key,text){
  if(state(this).seen.includes(key))return false;state(this).seen.push(key);feedback.set(this,[...(feedback.get(this)||[]),{text,life:3.5,max:3.5}]);this.say(text);this.saveEvent();return true;
 };
 P.worldEnemyKilledV29=function(e){
  if(this.map!=='echo'||e.id!=='echo-warden')return false;
  this.flags.echoWardenDefeated=true;
  this.worldCueV29('warden-cleared','灰脊狼退倒在旧皮带旁。后槽露出来了，先把附近清稳。');
  return true;
 };
 P.interact=function(target=null){
  const t=target||this.nearby(),prop=t?.kind==='prop'&&this.props.find(p=>p.id===t.id);
  if(!prop?.worldInteractionV29)return oldInteract.call(this,target);
  if(!this.active||this.pending||prop.broken||(prop.used&&!this.questPropNeeded?.(prop.id))||!worldPropVisibleV29(this,prop))return false;
  const at={x:prop.interactX??prop.x,y:prop.interactY??prop.y};
  if(distance(this.p,at)>112||!this.clearLine(this.p,at,false)){this.say('绕到物件前面，站稳后再动手。');return false;}
  this.moveTo=null;this.p.moving=false;this.p.attackAnim=0;this.p.angle=Math.atan2(prop.y-this.p.y,prop.x-this.p.x);
  // Immediate commit; existing environmental feedback never locks movement or saving.
  const result=this.useProp(prop.id);return result===false?false:true;
 };
 P.update=function(dt,input={}){
  const result=oldUpdate.call(this,dt,input);
  const cues=feedback.get(this);if(cues)feedback.set(this,cues.map(c=>({...c,life:c.life-dt})).filter(c=>c.life>0));
  if(!demo.has(this.map)||!this.active||this.pending)return result;
  if(this.map==='millpath'&&this.p.y>360&&this.p.y<520&&this.p.x>650&&this.p.x<930)this.worldCueV29('mill-warning','前院没有人声，水槽下却挂着刚扯断的皮带。');
  if(this.map==='echo'&&this.p.x>470&&this.p.x<650&&this.p.y<650)this.worldCueV29('pipe-warning','石台上的检修簿还干着。铜管从它旁边通向东岸。');
  if(this.map==='echo'&&this.echoReady())this.worldCueV29('room-clear',this.flags.echoCoreFound?'水声又能听清了。取过的槽位仍空着。':'兽群散了。机芯还在后槽里，得亲手卸下来。');
  return result;
 };
 P.useProp=function(id,...args){
  const p=this.props.find(o=>o.id===id);
  if(p&&!worldPropVisibleV29(this,p))return false;
  const scenes={v29RoadSign:'v29RoadSign',v29MillTracks:'v29MillTracks',v29MillChannel:'v29MillChannel'};
  if(p&&scenes[p.action]){if(!state(this).seen.includes(id))state(this).seen.push(id);this.beginScene(scenes[p.action]);return true;}
  if(p?.action==='v29RepairCore'){this.beginScene(this.refineryUnlocked()?'v29RepairReady':'v29RepairCuring');return true;}
  if(p?.action==='v29EchoCore'){
   const at={x:p.interactX,y:p.interactY};
   if(distance(this.p,at)>125||!this.clearLine(this.p,at,false)||!this.echoReady()||this.flags.echoCoreFound)return false;
   if(!this.flags.echoLog){this.beginScene('v29EchoNeedNotes');return false;}
   this.flags.echoCoreFound=true;p.used=true;this.addItem('echoCore');if(!this.quests.echo)this.quests.echo='active';this.flags.tracked='echo';
   this.effect('sparks',p.x,p.y,20,'#d6b779',.4);this.beginScene('v29EchoCoreTaken');this.saveEvent();return true;
  }
  return oldUse.call(this,id,...args);
 };
 P.mechanismProp=function(p){
  if(this.map==='echo'&&p.action==='echoMachine'&&this.echoReady()&&!this.flags.echoCoreFound){this.beginScene('v29EchoSeparateCore');return true;}
  if(this.map==='echo'&&p.action==='echoNotes'){this.flags.echoLog=true;this.beginScene('v29EchoNotes');return true;}
  if(this.map==='echo'&&p.action==='echoValve'){
   if(this.flags.echoValve)this.beginScene('echoValveAfter');else this.apply('releaseSteam');return true;
  }
  return oldMechanism.call(this,p);
 };
 P.takeEchoReward=function(...args){if(!this.flags.echoCoreFound)return false;return oldReward.apply(this,args);};
 P.chooseExtra=function(a){
  if(a==='echoAccept'&&!this.quests.echo){this.beginScene(this.flags.echoCoreFound?'lottieFoundFirst':'v29LottieWork','echoAccept');return true;}
  if(a==='echoReturn'&&this.flags.echoCoreFound&&this.quests.echo!=='done'){this.beginScene(state(this).seen.includes('lottie-work')?'v29LottieReturn':'v29LottieFoundReturn','echoReturn');return true;}
  if(a==='lottiWorkState'&&this.quests.echo==='done'){this.beginScene(this.refineryUnlocked()?'v29RepairReady':'v29RepairCuring');return true;}
  return oldChoose.call(this,a);
 };
 P.applyExtra=function(a){
  const beforeValve=this.flags.echoValve,beforeReturn=this.quests.echo==='done',result=oldApply.call(this,a);
  if(a==='echoAccept'&&!state(this).seen.includes('lottie-work'))state(this).seen.push('lottie-work');
  if(a==='releaseSteam'&&!beforeValve&&this.flags.echoValve){feedback.set(this,[...(feedback.get(this)||[]),{type:'steam',life:2.2,max:2.2}]);this.emit('sfx',{name:'guard'});}
  if(a==='echoReturn'&&!beforeReturn&&this.quests.echo==='done'){this.effect('sparks',995,510,18,'#d5bb84',.4);this.say('机芯已经留在修理台上，封浆还要等一会儿。');}
  return result;
 };
 P.questGoal=function(id){
  const base=oldGoal.call(this,id);if(id!=='echo'||base?.completed||base?.suspended)return base;
  const goal=(text,map,target)=>({text,map,target,type:'支线任务'}),progress=worldProgressV29(this);
  if(progress==='return')return goal('把包好的机芯带给洛缇，看看她能否接稳','workshop','lotti');
  if(progress==='extract')return goal(this.flags.echoLog?'亲手卸下后槽的黄铜心轴':'先核对石台上的检修簿','echo',this.flags.echoLog?'v29-echo-core':'echo-notes');
  if(progress==='clear-workspace')return goal('兽窝已散，先让操作台附近安全下来','echo','echo-machine');
  if(progress==='inspect')return goal('沿磨坊水槽找到检修洞，查看西侧石台上的检修簿','echo','echo-notes');
  return goal(this.flags.echoValve?'循铜管接近旧机后的兽窝':'铜管对着兽窝，可以先试西侧泄压阀','echo',this.flags.echoValve?'echo-machine':'echo-valve');
 };
}
