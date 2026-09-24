import {isStoryTestV25} from './story-test-v25.js';
import {BLOODBLADE_BLEED_MAX_STACKS,CAREERS,PROGRESSION_SKILLS,careerFor,MEMORY_CAREERS,careerSkillUnlocked,careerUnlockedSkills,CAREER_STAGE_LABELS} from './progression-data-v14.js';
import {progressionSkillNumbers,isCareerDamage} from './progression-skills-v14.js';
import {totalAttributes,baseCombatPower} from './growth-v14.js';
import {cleanBindings} from './attunement-v14.js';
import {ITEMS} from './data-v14.js';
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const state=p=>{
 const cs=p.careerState||(p.careerState={timers:{},stacks:0,stars:0});cs.timers=cs.timers||{};
 // Stale/forged locked timers cannot borrow benefits without their earned skill.
 for(const k of Object.keys(cs.timers))if(PROGRESSION_SKILLS[k]&&(!careerSkillUnlocked(p,k)||!(p.skills?.[k]>0)))delete cs.timers[k];
 return cs;
};
const formidable=e=>e.isBoss||e.elite||e.type==='captain'||e.type==='hellJailer';
const direct=kind=>!['dot','enchant','proc','mercenary','careerDot'].includes(kind);
function register(SKILLS){for(const s of Object.values(PROGRESSION_SKILLS))SKILLS[s.id]={name:s.name,rank:s.rank,cost:1,lv:s.level,level:s.level,desc:s.description,career:s.career,icon:s.icon,school:s.school};}
export function applyMemoryCareerPreview(p){
 const id=MEMORY_CAREERS[p.cls];if(!id)return null;
 p.career={id,levelAtUnlock:1,preview:true,progressionVersion:15,unlockedStages:[1,2,3,4,5],activityRewards:{}};p.careerState={timers:{},stacks:0,stars:0};p.skills={...p.skills};p.skillOrigins={...p.skillOrigins};p.skillSpent={...p.skillSpent};
 for(const k of Object.keys(PROGRESSION_SKILLS)){delete p.skills[k];delete p.skillOrigins[k];delete p.skillSpent[k];}
 for(const k of CAREERS[id].skills){p.skills[k]=3;p.skillOrigins[k]='career-preview';p.skillSpent[k]=0;}
 // Preview loadout order is independent from real activity reward order.
 const previewLoadouts={nightmare:['nightFrenzy','nightMomentum','nightThirst','nightPursuit','nightBreaker'],berserker:['rageAwaken','rageSunder','rageWhirl','rageReturn','rageExecute'],riftmage:['riftFocus','riftLance','riftGravity','riftWard','riftCollapse']};
 p.activeSkills=[...(previewLoadouts[id]||CAREERS[id].skills)];p.bar=[[...p.activeSkills,'hpGrand'],['mpGrand','resonance',null,null,null,null]];p.page=0;
 // Preview owns a disposable copy; caller's memory serializer must keep exporting reality.
 p.items={...p.items,mpGrand:Math.max(2,p.items?.mpGrand||0)};return id;
}
export function validateCareerBuild(p,{allowPreview=false,allowLegacy=true}={}){
 if(!p.career){if(Object.keys(PROGRESSION_SKILLS).some(k=>p.skills?.[k]>0))throw new Error('转职技能缺少传承记录。');return true;}
 const c=CAREERS[p.career.id],record=p.career;
 if(!c||c.cls!==p.cls||!Number.isInteger(record.levelAtUnlock)||record.levelAtUnlock<1||record.levelAtUnlock>p.level||record.preview&&!allowPreview)throw new Error('转职成长记录不完整。');
 const legacy=record.unlockedStages===undefined;
 if(legacy&&!allowLegacy)throw new Error('转职历练记录缺失。');
 if(!legacy){
  const stages=record.unlockedStages;
  if(!Array.isArray(stages)||!stages.includes(1)||stages.length>5||new Set(stages).size!==stages.length||stages.some(v=>!Number.isInteger(v)||v<1||v>5)||Math.max(...stages)!==stages.length)throw new Error('转职历练阶段不正确。');
  if(!record.preview){
   const rewards=record.activityRewards;
   if(!rewards||typeof rewards!=='object'||Array.isArray(rewards)||Object.keys(rewards).some(v=>!stages.includes(Number(v))||Number(v)<2)||stages.some(v=>v>1&&(typeof rewards[v]!=='string'||!rewards[v].trim()||rewards[v].length>80)))throw new Error('转职历练奖励缺少来源。');
  }
 }
 for(const [k,s] of Object.entries(PROGRESSION_SKILLS))if(p.skills?.[k]>0&&(s.career!==c.id||!legacy&&!careerSkillUnlocked(p,k)))throw new Error('转职技能与已完成历练不符。');
 return true;
}
// One-time V14 migration only removes the former four free route gifts.
// Refunding their actual paid ranks preserves all unrelated skills and books.
export function migrateCareerProgression(p,SKILLS,{allowPreview=false}={}){
 validateCareerBuild(p,{allowLegacy:true,allowPreview});
 const c=careerFor(p);if(!c)return {migrated:false,refunded:0};
 if(p.career.preview)return {migrated:false,refunded:0};
 const legacy=p.career.unlockedStages===undefined;let refunded=0;
 p.skills={...p.skills};p.skillOrigins={...p.skillOrigins};p.skillSpent={...p.skillSpent};
 if(legacy){
  p.career={...p.career,progressionVersion:15,unlockedStages:[1],activityRewards:{}};
  for(const k of c.skills.slice(1)){
   const paid=Math.max(0,((p.skills[k]||0)-1)*(SKILLS[k]?.cost||1)),recorded=Number(p.skillSpent[k]);
   refunded+=Math.min(paid,Number.isFinite(recorded)?Math.max(0,recorded):paid);
   delete p.skills[k];delete p.skillOrigins[k];delete p.skillSpent[k];if(p.cd)delete p.cd[k];
  }
  p.sp=Math.max(0,Number(p.sp)||0)+refunded;
  p.career.migrationV15={source:'free-kit-v14',refundedPoints:refunded};
  p.careerState={timers:{},stacks:0,stars:0};
 }
 for(const k of c.skills.filter(k=>careerSkillUnlocked(p,k))){p.skills[k]=Math.max(1,p.skills[k]||0);p.skillOrigins[k]=p.skillOrigins[k]||'career';p.skillSpent[k]=p.skillSpent[k]||0;}
 p.activeSkills=(p.activeSkills||[]).filter(k=>careerSkillUnlocked(p,k)&&(p.skills[k]||0)>0).slice(0,5);
 if(!p.activeSkills.length&&p.skills[c.skills[0]])p.activeSkills.push(c.skills[0]);
 cleanBindings(p,SKILLS);
 validateCareerBuild(p,{allowLegacy:false,allowPreview});
 return {migrated:legacy,refunded};
}
export function installProgressionV14(RPG,{stats,CLASSES,SKILLS,MAPS}){
 register(SKILLS);
 const P=RPG.prototype,old={};for(const k of ['skill','damage','hurt','attack','update','restore','train','useBook','activateSkill','relearn','assign','activeSkills','learnedSkills','enter','respawn'])old[k]=P[k];
 P.careerOptions=function(){return Object.values(CAREERS).filter(c=>c.cls===this.p.cls);};
 P.chooseCareer=function(id){
  const c=CAREERS[id],p=this.p;if(!c||c.cls!==p.cls||p.career||!this.flags.ch5MentorReady||this.memoryV13?.active||p.hp<=0||this.enemies.some(e=>!e.dead)||!((MAPS[this.map].chapterRegion||MAPS[this.map].region||0)>=5||this.map.startsWith('ch5'))){this.say('先与雷昂谈完，再选择今后的战法。');return false;}
  p.career={id,levelAtUnlock:p.level,progressionVersion:15,unlockedStages:[1],activityRewards:{}};p.careerState={timers:{},stacks:0,stars:0};p.skillOrigins={...p.skillOrigins};p.skillSpent={...p.skillSpent};
  const starter=c.skills[0];p.skills[starter]=Math.max(1,p.skills[starter]||0);p.skillOrigins[starter]='career';p.skillSpent[starter]=0;
  if(p.activeSkills.length<5&&!p.activeSkills.includes(starter))p.activeSkills.push(starter);cleanBindings(p,SKILLS);
  if(!this.flags.ch5CareerGift){this.flags.ch5CareerGift=true;this.addItem('attributeReset');this.addItem('skillReset');}
  p.hp=Math.min(stats(p).hp,p.hp);p.mp=Math.min(stats(p).mp,p.mp);this.flags.ch5CareerChosen=true;this.say('转职为'+c.name+' · 学会「'+PROGRESSION_SKILLS[starter].name+'」。旧招式仍然保留。');this.saveEvent();return true;
 };
 P.careerUnlockedSkills=function(){return careerUnlockedSkills(this.p);};
 P.careerSkillUnlocked=function(k){return careerSkillUnlocked(this.p,k);};
 P.grantCareerActivity=function(stage,activityId='hell-stage-'+stage){
  const p=this.p,c=careerFor(p);
  if(!c||!Number.isInteger(stage)||stage<2||stage>5||p.hp<=0||p.career.preview||this.memoryV13?.active||this._mercenaryContext||typeof activityId!=='string'||!activityId.trim()||activityId.length>80)return false;
  migrateCareerProgression(p,SKILLS);
  if(p.career.unlockedStages.includes(stage)||!Array.from({length:stage-1},(_,i)=>i+1).every(n=>p.career.unlockedStages.includes(n)))return false;
  const k=c.skills[stage-1];p.career.unlockedStages.push(stage);p.career.unlockedStages.sort((a,b)=>a-b);p.career.activityRewards[stage]=activityId;
  p.skills[k]=Math.max(1,p.skills[k]||0);p.skillOrigins[k]='career';p.skillSpent[k]=p.skillSpent[k]||0;
  if(p.activeSkills.length<5&&!p.activeSkills.includes(k))p.activeSkills.push(k);
  cleanBindings(p,SKILLS);this.say('完成'+CAREER_STAGE_LABELS[stage]+' · 学会「'+PROGRESSION_SKILLS[k].name+'」。');this.saveEvent();return true;
 };
 P.unlockCareerStage=P.grantCareerActivity;
 P.equipCareerSkills=function(){
  const p=this.p,c=careerFor(p);if(!c)return false;
  p.activeSkills=[...new Set([...careerUnlockedSkills(p),...this.activeSkills()])].slice(0,5);
  cleanBindings(p,SKILLS);const hp=['hpGrand','hpLarge','hpMedium','hp'].find(id=>p.items[id]>0)||'hp',mp=['mpGrand','mpLarge','mpMedium','mp'].find(id=>p.items[id]>0)||'mp';
  p.bar[0]=[...Array.from({length:5},(_,i)=>p.activeSkills[i]||null),hp];p.bar[1]=[mp,'resonance',null,null,null,null];p.page=0;this.saveEvent();return true;
 };
 for(const method of ['activeSkills','learnedSkills'])P[method]=function(...args){return old[method].apply(this,args).filter(k=>careerSkillUnlocked(this.p,k));};
 for(const method of ['train','activateSkill','relearn'])P[method]=function(k,...args){
  if(PROGRESSION_SKILLS[k]&&!careerSkillUnlocked(this.p,k)){this.say('这项转职战技尚未解锁，请先完成对应地狱历练。');return false;}
  return old[method].call(this,k,...args);
 };
 P.assign=function(page,slot,k){if(PROGRESSION_SKILLS[k]&&!careerSkillUnlocked(this.p,k))return false;return old.assign.call(this,page,slot,k);};
 P.useBook=function(id){
  const k=ITEMS[id]?.skill;
  if(PROGRESSION_SKILLS[k]&&!careerSkillUnlocked(this.p,k)){this.say('转职战技由地狱历练解锁，书页已保留。');return false;}
  return old.useBook.call(this,id);
 };
 P.restore=function(s){
  // core.restore merges over the current actor. Optional fields absent from a
  // real save must not be inherited from the disposable Lv.100 preview actor.
  const sourceCareer=s.p?.career?JSON.parse(JSON.stringify(s.p.career)):null;
  const sourceState=s.p?.careerState?JSON.parse(JSON.stringify(s.p.careerState)):null;
  const sourcePlayer=JSON.parse(JSON.stringify(s.p)),wasPreview=!!(this.p?.career?.preview||this.p?.memoryEmpowered);
  if(this.p){
   // Do not mutate an aliased snapshot. Missing optional learning fields must
   // start empty, or attunement would resurrect the preview's five free ranks.
   this.p={...this.p};delete this.p.career;delete this.p.careerState;delete this.p.skillOrigins;delete this.p.skillSpent;delete this.p.memoryEmpowered;delete this.p.memoryPreview;
   if(wasPreview){this.p.items={};this.p.cd={};for(const k of ['battleTempo','stoneSkin','focusBreath','bloodPact','counterBrand','emberReady','emberHits'])delete this.p[k];}
  }
  old.restore.call(this,{...s,p:sourcePlayer});
  if(sourceCareer){this.p.career=sourceCareer;this.p.careerState=sourceState||{timers:{},stacks:0,stars:0};}
  else {delete this.p.career;delete this.p.careerState;}
  for(const p of [this.p,this.ch3?.saintBuild,this.ch3?.frozenHero,...Object.values(this.mercenariesV14?.roster||{})].filter(Boolean)){
   migrateCareerProgression(p,SKILLS,{allowPreview:!!this.memoryV13?.active});if(p.career)state(p).timers={...state(p).timers};else delete p.careerState;
  }this.careerGround=[];
 };
 P.attack=function(...args){const p=this.p,before=p.cd.attack||0,cs=state(p),previous=cs.swing||0;cs.swing=previous+1;cs.swingDamageStacks=cs.stacks||0;const result=old.attack.apply(this,args);if(p.cd.attack>before){if(careerFor(p)?.id==='nightmare'){p.cd.action=Math.min(p.cd.action,.1);p.attackAnim=Math.min(p.attackAnim,p.cd.attack+.03);}p.attackDuration=p.attackAnim;}else cs.swing=previous;return result;};
 function bleed(g,e,layers){if(e.dead)return;const p=g.p,a=totalAttributes(p),s=e.careerBleed||{stacks:0,tick:1};s.stacks=Math.min(BLOODBLADE_BLEED_MAX_STACKS,s.stacks+layers);s.life=6;s.damage=(baseCombatPower(p,CLASSES[p.cls])*.08+a.dex*.12+a.str*.08);e.careerBleed=s;}
 function status(g,e,s,n){if(e.dead)return;if(s.bleed)bleed(g,e,s.bleed);if(s.mark)e.careerMarkUntil=g.time+s.mark;
  if(s.control){if(formidable(e)){e.slow=Math.max(e.slow||0,s.control+1);e.slowFactor=s.slowFactor||.75;}else e.stun=Math.max(e.stun||0,s.control);}
  if(s.slow){e.slow=Math.max(e.slow||0,s.slow);e.slowFactor=formidable(e)?Math.max(.75,s.slowFactor||.75):s.slowFactor||.75;}
  if(s.fracture){e.fractureTime=s.fracture;e.fractureMultiplier=formidable(e)?1.06:1.12;}
  if(s.burn)e.careerBurn={life:s.burn,tick:1,damage:n*(s.burnFactor||.1)};
 }
 P.skill=function(k){
  const s=PROGRESSION_SKILLS[k];if(!s)return old.skill.call(this,k);const p=this.p,cs=state(p),c=careerFor(p);
  if(!this.active||p.hp<=0||!c||c.id!==s.career||!careerSkillUnlocked(p,k)||!p.skills[k]||!this.activeSkills().includes(k)||p.cd.action>0||p.cd[k]>0)return false;
  if(s.weapon&&!p.gear.weapon&&!p.gear.offhand){this.say('先装备武器。');return false;}
  const v=progressionSkillNumbers(p,k,CLASSES[p.cls]),target=this.aim(),r=v.range||s.range;
  if(['target','targetPulse','projectile'].includes(s.kind)&&(!target||target.dead||dist(p,target)>r||!this.clearLine(p,target,false))){this.say('目标不在射程内，或被墙壁挡住了。');return false;}
  if(s.kind==='heal'&&p.hp>=stats(p).hp||s.kind==='mana'&&p.mp>=stats(p).mp){this.say('现在不需要恢复。');return false;}
  if(p.mp<v.cost){this.say('法力不足。');return false;}
  p.mp-=v.cost;p.cd[k]=v.cd;p.cd.action=.24;p.lastCombatSkill=k;p.attackKind=k;p.attackAnim=['ember','saint'].includes(p.cls)?.38:.3;p.attackDuration=p.attackAnim;
  if(v.offbeat){p.cd.offbeat=6;this.text('偏拍 −3MP',p.x,p.y-94,'#9ee3da');}
  if(v.emberReady){p.emberReady=false;p.emberHits=0;}if(c.id==='riftmage'&&isCareerDamage(s))cs.stars=v.starReady?0:Math.min(3,(cs.stars||0)+1);
  this.emit('sfx',{name:s.school==='spell'?'holy':'skill'});
  const hit=(e)=>{if(e.dead)return;let n=v.damage;if(s.consumeBleed)n*=1+(e.careerBleed?.stacks||0)*.18;if(s.markedBonus&&e.careerMarkUntil>this.time)n*=s.markedBonus;if(s.execute&&e.hp/e.maxHP<.35)n*=s.execute;if(s.shieldBonus&&p.shield>0)n*=s.shieldBonus;if(s.burnBonus&&(e.burn>0||e.careerBurn?.life>0))n*=s.burnBonus;if(s.frozenBonus&&(e.slow>0||e.stun>0))n*=s.frozenBonus;
   const before=e.hp;this.damage(e,n,'ch3skill');const actual=Math.max(0,before-Math.max(0,e.hp));status(this,e,s,v.damage);if(s.consumeBleed)delete e.careerBleed;
   if(actual&&s.drain)this.heal(Math.round(Math.min(stats(p).hp*s.drainCap,actual*s.drain)));
   if(actual&&s.manaHit){const amount=Math.round(Math.min(30,12+totalAttributes(p).wis*.08));p.mp=Math.min(stats(p).mp,p.mp+amount);this.text('法力 +'+amount,p.x,p.y-86,'#abddec');}
  };
  const visual=(at,size)=>this.effect(s.fx,at.x,at.y-12,size,s.school==='spell'?'#b6d6ed':'#dfb5ab',.65,{a:p.angle,skillKey:k});
  if(s.kind==='buff'){cs.timers[s.buff]=v.duration;if(s.buff==='nightMomentum')cs.stacks=0;if(s.buff==='assassinVeil')cs.veilStrike=true;if(s.hpCost&&!isStoryTestV25(this))p.hp=Math.max(1,p.hp-Math.floor(p.hp*s.hpCost));visual(p,68);}
  else if(s.kind==='shield'){p.shield=Math.max(p.shield,v.shield);p.shieldTime=Math.max(p.shieldTime||0,v.duration);visual(p,70);}
  else if(s.kind==='heal'){const bonus=s.bleedHeal&&this.enemies.some(e=>!e.dead&&e.careerBleed?.life>0&&dist(e,p)<300)?1.3:1;this.heal(Math.round(Math.min(stats(p).hp*s.hpCap,v.heal*bonus)));visual(p,72);}
  else if(s.kind==='mana'){const bonus=s.burnMana&&this.enemies.some(e=>!e.dead&&(e.careerBurn?.life>0||e.burn>0)&&dist(e,p)<400)?s.burnMana:0,amount=Math.round(Math.min(stats(p).mp*s.mpCap,v.mana+bonus));p.mp=Math.min(stats(p).mp,p.mp+amount);this.text('法力 +'+amount,p.x,p.y-82,'#abddec');visual(p,64);}
  else if(s.kind==='stance'){cs.timers[s.buff]=v.duration;cs.reprisalCharges=s.charges;cs.reprisalDamage=v.damage;visual(p,76);}
  else if(s.kind==='target'){hit(target);visual(target,Math.min(150,r*.6));}
  else if(s.kind==='pulse'||s.kind==='targetPulse'){const center=s.kind==='pulse'?p:target,range=s.kind==='pulse'?r:v.radius||s.radius;const nearby=this.enemies.filter(e=>!e.dead&&dist(e,center)<=range&&this.clearLine(center,e,false)&&(!s.arc||Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-p.angle)>=Math.cos(s.arc))).sort((a,b)=>dist(a,center)-dist(b,center)).slice(0,s.maxTargets);nearby.forEach(hit);visual(center,range);}
  else if(s.kind==='projectile'){
   this.bullets.push({x:p.x,y:p.y-15,vx:Math.cos(p.angle)*s.speed,vy:Math.sin(p.angle)*s.speed,r:9,life:r/s.speed,remaining:r,originX:p.x,originY:p.y,rangeLimit:r,friendly:true,skill:true,n:v.damage,color:s.career==='pyromancer'?'#ffc68a':s.career==='frostweaver'?'#b6e2f0':'#c5c0fb',holy:s.career==='riftmage',skillKey:k,pierce:s.pierce||0,hitIds:[],secondaryMultiplier:s.secondary||1,slowDuration:s.career==='frostweaver'?2:0,slowFactor:.7});visual(p,45);
  }
  return true;
 };
 P.damage=function(e,n,kind='hit'){
  const p=this.p,c=careerFor(p),cs=state(p),t=cs.timers,isDirect=direct(kind),before=e.hp,wasDead=e.dead;
  if(c&&isDirect){if(c.id==='assassin'&&e.hp/e.maxHP<.35)n*=1.15;if(c.id==='berserker')n*=1+Math.min(.25,Math.max(0,1-p.hp/stats(p).hp)*.35);if(c.id==='dreadguard'&&p.shield>0&&kind==='hit')n*=1.12;if(c.id==='frostweaver'&&(e.slow>0||e.stun>0))n*=1.18;if(c.id==='pyromancer'&&kind!=='hit')n*=1.12*(e.burn>0||e.careerBurn?.life>0?1.08:1);if(e.careerMarkUntil>this.time&&c.id==='assassin')n*=1.25;if(t.rageAwaken>0)n*=1.3;if(t.assassinVeil>0&&cs.veilStrike){n*=1.4;cs.veilStrike=false;}if(t.nightMomentum>0&&kind==='hit')n*=1.10+.02*Math.min(10,cs.swingDamageStacks??cs.stacks??0);}
  const result=old.damage.call(this,e,n,kind),actual=Math.max(0,before-Math.max(0,e.hp));if(wasDead||!actual||!c||kind!=='hit')return result;
  if(c.id==='bloodblade')bleed(this,e,1);
  if(t.nightMomentum>0&&cs.lastStackSwing!==cs.swing){cs.stacks=Math.min(10,(cs.stacks||0)+1);cs.lastStackSwing=cs.swing;}
  if(t.nightThirst>0&&cs.lastHealSwing!==cs.swing&&!(p.cd.nightThirstHeal>0)){cs.lastHealSwing=cs.swing;p.cd.nightThirstHeal=.45;this.heal(Math.round(Math.min(stats(p).hp*.015,actual*.10)));}
  if((c.id==='nightmare'||c.id==='spellbreaker')&&!(p.cd.careerMana>0)){p.cd.careerMana=c.id==='nightmare'?.45:.7;p.mp=Math.min(stats(p).mp,p.mp+(c.id==='nightmare'?2:3));}
  return result;
 };
 P.hurt=function(n){const p=this.p,cs=state(p),before=p.hp,shield=p.shield||0;if(cs.timers.rageAwaken>0)n*=1.1;const result=old.hurt.call(this,n);if(p.hp>0&&(p.hp<before||(p.shield||0)<shield)&&cs.timers.guardReprisal>0&&cs.reprisalCharges>0&&!(p.cd.careerReprisal>0)){p.cd.careerReprisal=1;cs.reprisalCharges--;for(const e of this.enemies.filter(e=>!e.dead&&dist(e,p)<180&&this.clearLine(p,e,false)))this.damage(e,cs.reprisalDamage,'proc');this.effect('impact',p.x,p.y,175,'#dcc5a1',.6);}return result;};
 P.update=function(dt,input){old.update.call(this,dt,input);if(!this.active||this.pending)return;const p=this.p,cs=state(p),t=cs.timers;
  if(t.frostBreath>0)p.mp=Math.min(stats(p).mp,p.mp+Math.min(dt,t.frostBreath)*(4+totalAttributes(p).wis*.035));
  for(const key of Object.keys(t))t[key]=Math.max(0,t[key]-dt);if(!t.nightMomentum)cs.stacks=0;
  // Bounded per-enemy state; no new timers, DOM work or per-tick art allocation.
  for(const e of this.enemies){if(e.dead)continue;for(const key of ['careerBleed','careerBurn']){const d=e[key];if(!d)continue;const elapsed=Math.min(dt,d.life);d.life=Math.max(0,d.life-dt);d.tick-=elapsed;if(d.tick<=0){d.tick+=1;this.damage(e,d.damage*(key==='careerBleed'?d.stacks:1),'dot');}if(!d.life)delete e[key];}}
 };
 for(const method of ['enter','respawn'])P[method]=function(...args){const result=old[method].apply(this,args);if(this.p.careerState){const stars=this.p.careerState.stars||0;this.p.careerState={timers:{},stacks:0,stars};}return result;};
}
