import {isStoryTestV25} from './story-test-v25.js';
import {skillRankMultiplierV17,skillRankDurationV17,skillRankSupportV17} from './rank-scaling-v17.js';
import {arcaneBonus} from './systems-data-v14.js';
import {enchantStat,modifySkill} from './enchantments-v14.js';
import {HELL_SKILL_BOOKS,SAINT_SKILLS,HELL_UNIQUES,SOUL_LAMP_SYSTEM} from './chapter3-combat-data-v14.js';
import {totalAttributes,vitalStats,baseCombatPower} from './growth-v14.js';

export const EXTRA_SKILLS=Object.fromEntries([...HELL_SKILL_BOOKS,...SAINT_SKILLS].map(v=>[v.id,v]));
const unique=(p,id)=>Object.values(p.gear||{}).some(v=>v?.uniqueEffect===id);
export function hellDamageFactor(p,k='attack'){
 let n=p.lampContract==='warmWick'?.95:p.lampContract==='sharpWick'?1.07:1;
 if(p.bloodPact>0)n*=1.24+.03*skillRankSupportV17(p.skills.bloodPact||1);
 if(unique(p,'kilnGrip')&&p.gear.weapon?.weaponType==='staff'){
  if(['boneBreak','counterBrand'].includes(k))n*=1.22;
  if(['emberLance','q'].includes(k)&&p.cls==='ember')n*=.88;
 }
 if(k==='wispLantern'&&unique(p,'pilgrimKnot'))n*=.88;
 return n;
}
export function hellStats(p,s){if(p.lampContract==='warmWick')s.hp+=24;return s;}
function maxHP(p,c,a){return vitalStats(p,c,a).hp;}
const formidable=e=>e.isBoss||e.isBossArena||e.elite||e.type==='captain'||e.type==='hellJailer';
const names={str:'力量',dex:'敏捷',vit:'体质',wis:'精神'};
const formula=(f)=>Object.entries(f).filter(([,n])=>n).map(([k,n])=>k==='constant'?String(n):`${names[k]}×${n}`).join(' + ');
const calc=(f,a)=>Object.entries(f).reduce((n,[k,v])=>n+v*(k==='constant'?1:a[k]),0);
export function chapter3SkillNumbers(p,k,c){
 const v=EXTRA_SKILLS[k];if(!v)return null;
 const a=totalAttributes(p),rank=p.skills[k]||1,mult=skillRankMultiplierV17(rank);
 const B=baseCombatPower(p,c);
 let raw=(v.base||0)*B;for(const attr in names)raw+=(v[attr]||0)*a[attr];
 const factor=hellDamageFactor(p,k),m=v.mechanic,s={cost:v.mp,cd:v.cd,rank,mult,B,damage:raw*mult*factor,label:'当前效果',formula:[v.base?`基础战力×${v.base}`:'',...Object.keys(names).filter(a=>v[a]).map(a=>`${names[a]}×${v[a]}`)].filter(Boolean).join(' + '),extra:v.description,increments:Object.keys(names).filter(a=>v[a]).map(a=>`${names[a]}+1 → 伤害+${(v[a]*mult*factor).toFixed(2)}`).join('；')};
 if(['tempoBuff','defenceBuff','manaOverTime'].includes(m.kind)){s.duration=m.duration+(m.kind==='manaOverTime'?0:skillRankDurationV17(rank));s.regen=4+a.wis*.03+skillRankSupportV17(rank)*.5;s.formula=m.kind==='tempoBuff'?'攻速加成 +25%；持续5秒，2–3阶每阶+1秒、4–8阶每阶+0.35秒':m.kind==='defenceBuff'?'减伤 +12%；持续6秒，2–3阶每阶+1秒、4–8阶每阶+0.35秒；总减伤最高42%':`每秒4 + 精神×0.03 + 升阶恢复收益×0.5，持续6秒；4阶起升阶收益递减`;s.value=m.kind==='tempoBuff'?`攻速 +25% · ${s.duration}秒`:m.kind==='defenceBuff'?`减伤 +12% · ${s.duration}秒`:`额外恢复 ${Number((s.regen*6).toFixed(1))} MP`;s.extra=v.description;s.increments=m.kind==='manaOverTime'?'精神+1 → 6秒共多回0.18 MP':'升阶延长持续时间，冷却不变';s.baseCost=s.cost;return s;}
 if(s.formula&&mult!==1)s.formula=`(${s.formula})×${mult}`;
 if(s.formula&&factor!==1)s.formula=`(${s.formula})×${factor.toFixed(2)}（装备 / 灯契）`;
 if(m.kind==='selfShield'||m.kind==='selfHeal'){
  const f=m.shieldFormula||m.healFormula,value=Math.min(maxHP(p,c,a)*m.maxHpCap,calc(f,a)*mult*(p.cls==='saint'?1.2:1));
  s[m.kind==='selfHeal'?'heal':'shield']=Math.round(value);s.value=`${Math.round(value)} ${m.kind==='selfHeal'?'治疗':'护盾'}`;
  s.formula=`(${formula(f)})×${mult}，上限为最大生命${m.maxHpCap*100}%`;if(p.cls==='saint')s.formula+='（慈悲圣职×1.2，仍受生命上限约束）';s.increments=Object.keys(f).filter(k=>k!=='constant').map(k=>`${names[k]}+1 → 效果+${(f[k]*mult).toFixed(2)}（受上限约束）`).join('；');
 }else if(m.kind==='resourceTrade'){s.mana=Math.floor(Math.min(vitalStats(p,c,a).mp*m.maxManaFraction,calc(m.manaFormula,a)*(1+Math.max(0,Math.min(8,rank)-3)*.03)));s.value=`恢复 ${s.mana} MP`;s.formula=`消耗最大生命8%；回蓝 min((${formula(m.manaFormula)})×${Number((1+Math.max(0,Math.min(8,rank)-3)*.03).toFixed(2))}, 最大法力15%)`;s.increments='精神影响回蓝；不会触发受伤类装备。';}
 else if(m.kind==='riskBuff'){s.value=`伤害 +${Number((24+skillRankSupportV17(rank)*3).toFixed(1))}%`;s.formula=unique(p,'measuredDebt')?'消耗最大生命10%，持续5秒；额外承伤6%':'消耗最大生命10%，持续6秒；额外承伤12%';s.increments='2–3阶每阶增伤再提高3%，4–8阶每阶再提高0.9%；不能在低生命时施放。';}
 else s.value=Math.round(s.damage)+' 伤害';
 s.baseCost=s.cost;
 if(unique(p,'offbeat')&&p.lastCombatSkill&&p.lastCombatSkill!==k&&!(p.cd.offbeat>0)){s.cost=Math.max(0,s.cost-3);s.offbeat=true;}
 const arcane=arcaneBonus(p,k);if(arcane){s.damage*=arcane.damage;s.cost=Math.ceil(s.cost*arcane.cost);s.value=Math.round(s.damage)+' 伤害';s.formula+=' ×1.18（烬能）';s.extra+=' 本次消耗烬能，法力消耗减少20%。';}return modifySkill(p,k,s,{range:m.range,radius:m.radius,hpCap:m.maxHpCap,maxHP:maxHP(p,c,a)});
}
export function runChapter3Skill(g,k,stats,numbers){
 const v=EXTRA_SKILLS[k];if(!v)return null;const p=g.p,m={...v.mechanic};const evaluated=numbers(p,k);if(evaluated.range)m.range=evaluated.range;if(evaluated.radius)m.radius=evaluated.radius;
 if(!g.active||p.hp<=0||p.cd.action>0||p.cd[k]>0||!p.skills[k]||!g.activeSkills().includes(k))return false;
 if(v.requiresWeapon&&!p.gear.weapon){g.say('先装备武器。');return false;}
 const target=g.aim(),needTarget=['target','projectile'].includes(m.kind);
 if(needTarget&&(!target||Math.hypot(p.x-target.x,p.y-target.y)>m.range||!g.clearLine(p,target,false))){g.say('目标不在射程内，或被岩壁挡住了。');return false;}
 if(m.kind==='manaOverTime'&&p.mp>=stats(p).mp){g.say('法力已经充足。');return false;}
 if(m.kind==='selfHeal'&&p.hp>=stats(p).hp){g.say('现在不需要治疗。');return false;}
 if(!isStoryTestV25(g)&&['riskBuff','resourceTrade'].includes(m.kind)&&p.hp<=stats(p).hp*m.minHpFractionToCast){g.say('现在的伤势承受不了这项战技。');return false;}
 if(m.kind==='resourceTrade'&&p.mp>=stats(p).mp){g.say('法力已经充足。');return false;}
 let zoneAt=null;if(m.kind==='groundZone'){zoneAt=target&&Math.hypot(target.x-p.x,target.y-p.y)<=m.range?target:{x:p.x+Math.cos(p.angle)*145,y:p.y+Math.sin(p.angle)*145};if(g.blocked(zoneAt.x,zoneAt.y,false)||!g.clearLine(p,zoneAt,false)){g.say('魂灯照不到岩壁后。');return false;}}
 const s=numbers(p,k);if(p.mp<s.cost){g.say('法力不足。');return false;}
 p.mp-=s.cost;p.cd[k]=s.cd;p.cd.action=.28;p.lastCombatSkill=k;p.attackKind=k;p.attackAnim=.4;
 if(s.offbeat)p.cd.offbeat=6;
 const holy=k.startsWith('saint'),color=holy?'#fff0bb':'#9bcfd9';
 g.emit('sfx',{name:holy?'holy':'skill'});
 const hit=(e,n)=>g.damage(e,n,'ch3skill');
 const nearby=(r,max=20)=>g.enemies.filter(e=>!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<r&&g.clearLine(p,e,false)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,max);
 if(m.kind==='tempoBuff'){p.battleTempo=s.duration;g.effect('heal',p.x,p.y,60,'#a6dad8',.8);}
 else if(m.kind==='defenceBuff'){p.stoneSkin=s.duration;g.effect('ashShield',p.x,p.y,62,'#c5c9df',.8);}
 else if(m.kind==='manaOverTime'){p.focusBreath=6;p.focusRegen=s.regen;g.effect('soulBind',p.x,p.y,58,'#b3dbea',.8);}
 else if(m.kind==='meleeArc'){
  g.effect('cut',p.x,p.y-20,m.range,k==='boneBreak'?'#e8b17a':'#adcbe7',.3,{a:p.angle});
  for(const e of nearby(m.range).filter(e=>Math.cos(Math.atan2(e.y-p.y,e.x-p.x)-p.angle)>Math.cos(m.arc)).slice(0,m.maxTargets)){
   const fin=m.finisherBelowHpFraction&&e.hp/e.maxHP<m.finisherBelowHpFraction?m.finisherMultiplier:1;hit(e,s.damage*fin);
   if(m.breakGuard){e.fractureTime=m.breakGuard.duration;e.fractureMultiplier=formidable(e)?1.08:1.15;}
  }
  for(const o of g.props.filter(o=>!o.action&&!o.broken&&Math.hypot(o.x-p.x,o.y-p.y)<m.range&&g.clearLine(p,o,false)&&Math.cos(Math.atan2(o.y-p.y,o.x-p.x)-p.angle)>Math.cos(m.arc)))g.damageProp(o,s.damage);
 }else if(m.kind==='projectile'){
  g.bullets.push({x:p.x,y:p.y-15,vx:Math.cos(p.angle)*m.speed,vy:Math.sin(p.angle)*m.speed,r:m.radius,life:m.range/m.speed,remaining:m.range,originX:p.x,originY:p.y,rangeLimit:m.range,friendly:true,skill:true,n:s.damage,color:holy?'#fff2c1':'#ffbd74',holy,skillKey:k,pierce:m.pierce||0,hitIds:[],secondaryMultiplier:m.secondaryMultiplier||1,slowDuration:m.slowDuration,slowFactor:m.slowFactor});
  g.effect(holy?'holyCast':'flame',p.x+Math.cos(p.angle)*20,p.y-40,38,color,.4,{a:p.angle});
 }else if(m.kind==='target'){
  hit(target,s.damage);const boss=formidable(target);
  if(!boss)target.stun=Math.max(target.stun,m.rootDuration||1.8);else {target.slow=Math.max(target.slow,m.bossSlowDuration||1.2);target.slowFactor=m.bossSlowFactor||.8;}
  g.effect(holy?'holyChime':'soulBind',target.x,target.y,60,color,1.1);
 }else if(m.kind==='selfShield'){
  p.shield=Math.max(p.shield,s.shield);p.shieldTime=m.duration;g.effect(holy?'holyShield':'ashShield',p.x,p.y,58,color,.8);
 }else if(m.kind==='selfHeal'){
  g.heal(s.heal);g.effect('holyHeal',p.x,p.y,62,color,1.1);
 }else if(m.kind==='selfPulse'){
  g.effect(holy?'holyNova':'graveBell',p.x,p.y,m.radius,color,.8);
  for(const e of nearby(m.radius,m.maxTargets)){hit(e,s.damage);e.slow=m.slowDuration||2;e.slowFactor=formidable(e)?.8:m.slowFactor||.7;
   if(m.knockback&&!formidable(e)){const a=Math.atan2(e.y-p.y,e.x-p.x);g.moveActor(e,e.x+Math.cos(a)*m.knockback,e.y+Math.sin(a)*m.knockback,false);}
  }
  if(m.pulses>1)g.ch3.pulses.push({x:p.x,y:p.y,at:g.time+m.pulseInterval,r:m.radius,n:s.damage*m.secondMultiplier,kind:k,max:m.maxTargets,map:g.map});
 }else if(m.kind==='groundZone'){
  const at=zoneAt;
  g.ch3.lantern={x:at.x,y:at.y,r:m.radius,life:m.duration+(unique(p,'pilgrimKnot')?1:0),tick:1,ticksLeft:Math.floor(m.duration+(unique(p,'pilgrimKnot')?1:0)),n:s.damage,maxTargets:3,map:g.map};
 }else if(m.kind==='riskBuff'){
  if(!isStoryTestV25(g))p.hp-=Math.ceil(stats(p).hp*m.hpCostMaxFraction);p.bloodPact=unique(p,'measuredDebt')?5:6;g.effect('bloodPact',p.x,p.y,55,'#e8866e',.8);
 }else if(m.kind==='retaliation'){
  p.counterBrand=4;p.counterDamage=s.damage;g.effect('guard',p.x,p.y-25,50,'#eccc98',.5);
 }else if(m.kind==='resourceTrade'){
  if(!isStoryTestV25(g))p.hp-=Math.ceil(stats(p).hp*m.hpCostMaxFraction);p.mp=Math.min(stats(p).mp,p.mp+s.mana);g.text('法力 +'+s.mana,p.x,p.y-80,'#acd4e7');g.effect('soulBind',p.x,p.y,48,'#bdb4e6',.8);
 }
 return true;
}
export function hellIncoming(p,n){if(p.lampContract==='sharpWick')n*=1.07;if(p.bloodPact>0)n*=unique(p,'measuredDebt')?1.06:1.12;return n;}
export {unique as hasHellUnique};
