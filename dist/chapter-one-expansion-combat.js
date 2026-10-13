import {COMBAT_BALANCE as B} from './balance-v14.js';
import {C1_ELITES,c1DropIndex} from './chapter-one-expansion-data.js';
import {c1State,c1Random,c1Clone} from './chapter-one-expansion-save.js';
import {c1Item,c1Effects} from './chapter-one-expansion-gear.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const steps=(g,id)=>c1State(g).questSteps[id]||(c1State(g).questSteps[id]={});
export function c1Encounter(g,id){const h=c1State(g);return h.elite[id]||(h.elite[id]={killSequence:0,aliveGeneration:1,lastKill:0,outsideActiveSeconds:0,leftAfterKill:false,firstPartGranted:false,lootResult:null});}
export function c1Danger(t,p){if(!t)return false;if(t.shape==='circle')return distance(t,p)<t.r;if(t.shape==='cone')return distance(t,p)<t.r&&Math.cos(Math.atan2(p.y-t.y,p.x-t.x)-t.a)>Math.cos(t.arc);const dx=p.x-t.x,dy=p.y-t.y,along=dx*Math.cos(t.a)+dy*Math.sin(t.a),across=Math.abs(-dx*Math.sin(t.a)+dy*Math.cos(t.a));return along>-18&&along<t.length&&across<t.width/2+12;}
function tune(g,e){const cfg=C1_ELITES[e.id];if(!cfg)return;const h=c1Encounter(g,e.id),ratio=e.hp/Math.max(1,e.maxHP);if(!e.c1Tuned){e.maxHP=cfg.hp;e.hp=e.dead?0:Math.max(1,Math.round(cfg.hp*ratio));e.c1Tuned=true;}
 Object.assign(e,{label:cfg.name,elite:true,c1Custom:true,c1Generation:e.c1Generation||h.aliveGeneration,v15BossStats:'custom',v28DamageMultiplier:1,v28RewardXP:35,v28RewardGold:12,v13Tuned:true});}
export function installC1Combat(RPG,{stats}){
 const P=RPG.prototype,old={};for(const k of ['ensureMap','enemy','enter','update','damage','handleHellDeath','dropCombatLoot','snapshot','restore','respawn','skill','enemyHit'])old[k]=P[k];
 P.enemy=function(...args){const e=old.enemy.apply(this,args);tune(this,e);if(e.id.startsWith('c1-moss-')){e.c1Species='beetle';e.label='苔壳爬兽';}if(e.id.startsWith('c1-sentry-')||e.id==='c1-trial-warden'){e.c1Species='construct';e.label=e.id==='c1-trial-warden'?'试炼守卫':'旧廊构装体';}if(e.id==='c1-trial-warden'){e.elite=true;e.maxHP=320;e.hp=e.dead?0:320;}return e;};
 P.ensureMap=function(id){c1State(this);const r=old.ensureMap.call(this,id);const st=this.states[id];if(!st)return r;for(const [eliteId,cfg]of Object.entries(C1_ELITES)){if(cfg.map!==id)continue;let e=st.enemies.find(e=>e.id===eliteId);if(!e&&cfg.x!==undefined){e=this.enemy(cfg.type,cfg.x,cfg.y,eliteId);st.enemies.push(e);}if(e)tune(this,e);}return r;};
 P.c1EliteKill=function(e){
  const cfg=C1_ELITES[e.id];if(!cfg||this.map!==cfg.map)return false;e.hp=0;const h=c1Encounter(this,e.id),key='elite:'+e.id+':'+e.c1Generation;
  const tx=this.c1Transaction(key,()=>{
   const result=c1DropIndex(c1Random(this)),items=[];h.lootResult=result;h.killSequence++;h.lastKill=this.time;h.leftAfterKill=false;h.outsideActiveSeconds=0;
   if(!h.firstPartGranted){h.firstPartGranted=true;c1State(this).samples[cfg.part]=true;items.push(cfg.part);}
   if(result>=0){const item=c1Item(this.p.cls,cfg.pool[result],'c1-loot-'+e.id+'-'+e.c1Generation);this.c1Deliver(item);items.push(item.id);}
   this.gainXP(35);this.p.gold+=12;e.v13Loot=true;e.v28LootRolled=true;e.c1Settled=true;
   if(e.id==='echo-warden'){this.flags.echoWardenDefeated=true;this.worldCueV29?.('warden-cleared','灰脊守兽退倒。后槽露出来了，原机芯仍要亲手卸下。');}
   c1State(this).economy.push({event:key,xp:35,gold:12,items,balance:this.p.gold});return {xp:35,gold:12,items,draw:result};
  });return !!tx;
 };
 P.handleHellDeath=function(e){if(e.c1Training||e.c1NoReward)return true;if(C1_ELITES[e.id]&&C1_ELITES[e.id].map===this.map)return this.c1EliteKill(e);return old.handleHellDeath?.call(this,e);};
 P.dropCombatLoot=function(e){if(C1_ELITES[e.id]&&C1_ELITES[e.id].map===this.map)return this.c1EliteKill(e);if(this.map==='canal'&&e.id==='captain')return this.c1Transaction('captain:seal',()=>{const item=c1Item(this.p.cls,'c1CaptainSeal','c1-captain-seal');this.c1Deliver(item);return {items:[item.id]};});return old.dropCombatLoot.call(this,e);};
 P.enter=function(id,...args){
  const previous=this.map;for(const [eliteId,cfg]of Object.entries(C1_ELITES))if(cfg.map===previous&&id!==previous&&this.states[previous]?.enemies.find(e=>e.id===eliteId)?.dead)c1Encounter(this,eliteId).leftAfterKill=true;
  const result=old.enter.call(this,id,...args);if(this.map!==id)return result;
  for(const [eliteId,cfg]of Object.entries(C1_ELITES))if(cfg.map===id){const h=c1Encounter(this,eliteId),e=this.enemies.find(e=>e.id===eliteId);if(e?.dead&&h.leftAfterKill&&h.outsideActiveSeconds>=180){h.aliveGeneration++;h.outsideActiveSeconds=0;h.leftAfterKill=false;const replacement=this.enemy(cfg.type,e.homeX,e.homeY,eliteId);replacement.c1Generation=h.aliveGeneration;this.states[id].enemies[this.enemies.indexOf(e)]=replacement;}}
  return result;
 };
 P.c1TickEnemy=function(e,dt){
  if(e.c1Training){if(this.c1TrainingSession?.kind==='drill'){const target={x:940,y:540+Math.sin(this.time*.8)*100};this.moveActor(e,target.x,target.y,false);e.angle=Math.cos(this.time*.8)>0?Math.PI/2:-Math.PI/2;e.moving=true;}return true;}if(!e.c1Custom){
   const t=e.telegraph;if(t&&['heavySlam','chainSlam','charge','shieldBash','wolfLunge','wolfSweep','chainSweep'].includes(t.kind)&&c1Danger(t,this.p)&&this.clearLine(e,this.p,false))t.c1Threatened=true;
   return false;
  }
  const cfg=C1_ELITES[e.id],p=this.p;e.stun=Math.max(0,e.stun-dt);e.slow=Math.max(0,(e.slow||0)-dt);e.bleedTime=Math.max(0,e.bleedTime-dt);if(!e.bleedTime)e.bleed=0;e.dot-=dt;if(e.dot<=0){e.dot=1;if(e.bleed||e.burn)this.damage(e,e.bleed*B.bleedTickDamage+(e.burn||0)*B.burnTickDamage,'dot');e.burn=Math.max(0,e.burn-1);}if(e.dead)return true;
  e.attackAnim=Math.max(0,e.attackAnim-dt);e.cd=Math.max(0,e.cd-dt);e.c1Recovery=Math.max(0,(e.c1Recovery||0)-dt);e.anim=(e.anim||0)+dt*5;e.moving=false;
  if(e.stun>0||e.c1Recovery>0)return true;
  if(e.c1Charge){const a=e.c1Charge,oldX=e.x,oldY=e.y;this.moveActor(e,e.x+Math.cos(a.a)*650*dt,e.y+Math.sin(a.a)*650*dt,false);a.life-=dt;
   if(!a.hit&&distance(e,p)<48&&this.clearLine(e,p,false)){a.hit=true;this.hurt(cfg.heavy);}
   if(Math.hypot(e.x-oldX,e.y-oldY)<dt*120||a.life<=0){const wall=Math.hypot(e.x-oldX,e.y-oldY)<dt*120;e.c1Charge=null;if(a.threatened&&!a.hit)this.c1EvadedThreat();e.c1Recovery=e.c1Follow?0:wall&&e.type==='rat'?1.5:1.2;e.cd=e.c1Follow?0:1.3;if(wall)this.text('撞击硬直',e.x,e.y-95);}
   return true;
  }
  if(e.telegraph){const t=e.telegraph;t.life-=dt;e.wind=t.life;t.threatened=t.threatened||(c1Danger(t,p)&&this.clearLine(e,p,false));if(t.life>0)return true;
   e.telegraph=null;e.wind=0;e.attackAnim=.35;
   if(t.shape==='line'){e.c1Charge={a:t.a,life:t.length/650,hit:false,threatened:t.threatened};}
   else{const hit=c1Danger(t,p)&&this.clearLine(e,p,false);if(hit)this.hurt(cfg.heavy);else if(t.threatened)this.c1EvadedThreat();e.c1Recovery=1.3;e.cd=1.8;}
   if(e.type==='wolf'&&e.hp<e.maxHP*.5&&!e.c1Second){e.c1Second=true;e.c1Follow=.65;}else e.c1Second=false;
   return true;
  }
  if(e.type==='bat'&&e.hp<e.maxHP*.5&&!e.c1Summoned){e.c1Summoned=true;for(const dy of [-70,70]){const at=this.safePoint(e.x-130,e.y+dy),add=this.enemy('bat',at.x,at.y,'c1-weak-bat-'+dy);Object.assign(add,{maxHP:40,hp:40,c1NoReward:true,storyTag:'c1-weak',v28RewardXP:0,v28RewardGold:0});this.enemies.push(add);}this.say('夜翼只唤来这一对弱蝠，绕窑柱挡住声波。');}
  const d=distance(e,p);if(d>550&&e.aiState!=='COMBAT')return true;if(d>750){e.aiState='IDLE';return true;}e.aiState='COMBAT';e.angle=Math.atan2(p.y-e.y,p.x-e.x);
  if(e.cd<=0&&d<410&&this.clearLine(e,p,false)){
   e.c1Pattern=(e.c1Pattern||0)+1;
   if(e.c1Pattern%3===0&&d<75){this.hurt(cfg.hit);e.attackAnim=.3;e.cd=1.5;return true;}
   const wind=e.c1Follow||cfg.wind;e.c1Follow=0;e.wind=wind;e.windMax=wind;
   e.telegraph={shape:e.type==='bat'?'cone':'line',x:e.x,y:e.y,a:e.angle,r:320,arc:.65,length:e.type==='rat'?360:290,width:60,life:wind,max:wind,threatened:false,c1:true};e.cd=2.7;
   this.text(e.type==='bat'?'声波 · 绕柱':e.type==='rat'?'冲撞 · 引向石墩':'压身 · 侧移',e.x,e.y-105,'#e6bf85');return true;
  }
  if(d>65){const dir=this.pathDirection(e,p);if(dir){const speed=(e.slow>0?55:105)*dt;this.moveActor(e,e.x+dir.x*speed,e.y+dir.y*speed,false);e.moving=true;}}
  return true;
 };
 P.enemyHit=function(e){const t=e.telegraph,threatened=t?.c1Threatened===true,outside=t&&!c1Danger(t,this.p);const result=old.enemyHit.call(this,e);if(threatened){if(e.action)e.action.c1Threatened=true;else if(outside&&!e.dead)this.c1EvadedThreat();}return result;};
 P.c1ResolvedCharge=function(e,a){if(!e.dead&&a.c1Threatened&&!a.hit)this.c1EvadedThreat();};
 P.c1EvadedThreat=function(){if(c1Effects(this.p).evasion&&!(this.p.cd.c1Evasion>0)){this.p.cd.c1Evasion=10;this.p.cd.c1EvasionWindow=6;this.effect('guard',this.p.x,this.p.y-20,36,'#e7c47d',.3);}};
 P.c1StartTraining=function(kind,assist=false){
  if(!['c1TrainingYard','c1DrillGallery'].includes(this.map)||this.chapter>=5)return false;
  this.c1EndTraining();const p=this.p;
  this.c1TrainingSession={kind,assist,alarmWarning:null,map:this.map,backup:c1Clone({gear:p.gear,skills:p.skills,activeSkills:p.activeSkills,bar:p.bar,mp:p.mp,hp:p.hp,cd:p.cd,emotion:p.emotion,shield:p.shield,shieldTime:p.shieldTime,guard:p.guard,empower:p.empower,resonance:p.resonance,invuln:p.invuln,sprint:p.sprint,dash:p.dash,combo:p.combo,comboLife:p.comboLife}),warning:null,timer:1,failed:steps(this,'c1ExitDrill').attempts||0,lastHit:-100,previous:{x:p.x,y:p.y},borrowed:kind==='copper'};
  if(kind==='copper'){p.gear={...p.gear,weapon:{id:'training-staff',name:'借用训练杖',slot:'weapon',weaponType:'staff',atk:0,hp:0},offhand:null,relic:{id:'training-ring',slot:'relic',name:'试装铜圈',uniqueEffect:'copperPractice',atk:0,hp:8}};p.skills={...p.skills,cleave:1};p.activeSkills=['cleave',...p.activeSkills.filter(k=>k!=='cleave')].slice(0,5);p.bar=c1Clone(p.bar);p.bar[0][0]='cleave';}
  const target=this.enemy('rat',kind==='drill'?940:910,kind==='drill'?560:480,'c1-training-target');Object.assign(target,{hp:kind==='drill'?110:10000,maxHP:kind==='drill'?110:10000,c1Training:true,label:'练习构装靶',storyTag:'c1-training',v28RewardXP:0,v28RewardGold:0});this.enemies.push(target);p.hp=stats(p).hp;p.mp=stats(p).mp;this.active=true;
  this.say(kind==='drill'?'先看铃线，处理构装靶；上方掩体与下方绕道都能合格。':'普攻后衔接自己的战技；走进预警区，再在落地前走出。练习不耗药。');return true;
 };
 P.c1EndTraining=function(){const s=this.c1TrainingSession;if(!s)return;Object.assign(this.p,c1Clone(s.backup));for(const st of Object.values(this.states))st.enemies=st.enemies.filter(e=>!e.c1Training);this.bullets=[];this.zones=[];delete this.c1TrainingSession;};
 P.damage=function(e,n,kind='hit',source){const hp=e.hp,result=old.damage.call(this,e,n,kind,source),s=this.c1TrainingSession;if(e.c1Training&&s&&hp>e.hp){if(s.kind==='drill'){if(e.dead||e.hp<=0){steps(this,'c1ExitDrill').target=true;this.say('构装靶停下了。把负重带到便门，记住你选的路线。');}}else{e.hp=e.maxHP;e.dead=false;}if(s.kind==='copper'&&['skill','ch3skill'].includes(kind)){steps(this,'copper').tested=true;this.c1EndTraining();this.say('铜圈把力传到了杖端。借用装已归还，回洛缇的工作台装牢。');}else if(s.kind==='readiness'){if(kind==='hit')s.lastHit=this.time;if(['skill','ch3skill'].includes(kind)){steps(this,'c1Readiness').skill=true;if(this.time-s.lastHit<5)steps(this,'c1Readiness').combo=true;}}}return result;};
 P.snapshot=function(){const out=old.snapshot.call(this),s=this.c1TrainingSession;if(!s)return out;const saved=c1Clone(out);Object.assign(saved.p,c1Clone(s.backup));for(const st of Object.values(saved.states))st.enemies=st.enemies.filter(e=>!e.c1Training);return saved;};
 P.restore=function(...args){delete this.c1TrainingSession;const result=old.restore.apply(this,args);for(const st of Object.values(this.states))st.enemies=st.enemies.filter(e=>!e.c1Training);return result;};
 P.respawn=function(...args){this.c1EndTraining();return old.respawn.apply(this,args);};
 P.update=function(dt,input={}){
  const active=this.active&&!this.pending&&!this.transition,at={x:this.p.x,y:this.p.y};
  const result=old.update.call(this,dt,input);if(!active)return result;
  for(const [id,cfg]of Object.entries(C1_ELITES)){const e=c1State(this).elite[id];if(e?.leftAfterKill&&this.map!==cfg.map&&(distance(at,this.p)>.01||(this.p.attackAnim>0&&this.enemies.some(e=>!e.dead&&distance(e,this.p)<450))))e.outsideActiveSeconds+=dt;}
  const s=this.c1TrainingSession;if(!s)return result;if(s.map!==this.map||this.p.hp<=0){this.c1EndTraining();return result;}
  this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;
  if(s.kind==='drill'){
   const q=steps(this,'c1ExitDrill'),crossed=s.previous.x<535&&this.p.x>=535&&this.p.y>320&&this.p.y<840;
   if(crossed&&!q.line&&!s.alarmWarning){s.alarmWarning={life:.6+(s.assist?.3:0)};this.text('铃绳绷紧 · 退回线后',this.p.x,this.p.y-65);}if(s.alarmWarning){s.alarmWarning.life-=dt;if(q.line||this.p.x<530)s.alarmWarning=null;else if(s.alarmWarning.life<=0){s.failed++;q.attempts=s.failed;q.route=false;this.text('警铃响了',this.p.x,this.p.y-65);this.relocate(370,550);s.alarmWarning=null;this.say(s.failed>=2?'可回负重架选择延长0.3秒预警的练习辅助；沿红绳找到铃扣。':'踩过未断开的铃线。沿绳找到挂钩，再试一次。');}}
   s.previous={x:this.p.x,y:this.p.y};
  }
  if(s.kind==='readiness'){
   s.timer-=dt;if(!s.warning&&s.timer<=0){s.warning={shape:'circle',x:1110,y:650,r:100,life:1.5,max:1.5,threatened:false};s.timer=3;}
   if(s.warning){s.warning.threatened=s.warning.threatened||c1Danger(s.warning,this.p);s.warning.life-=dt;if(s.warning.life<=0){if(s.warning.threatened&&!c1Danger(s.warning,this.p)){steps(this,'c1Readiness').evade=true;this.text('避险复核通过');}else if(c1Danger(s.warning,this.p))this.say('预警落地了，再走一次，不损失药品。');s.warning=null;}}
  }
  return result;
 };
}
