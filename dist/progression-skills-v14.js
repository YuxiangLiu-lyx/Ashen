import {skillRankMultiplierV17,skillRankDurationV17,skillRankSupportV17} from './rank-scaling-v17.js';
import {PROGRESSION_SKILLS,careerFor} from './progression-data-v14.js';
import {totalAttributes,baseCombatPower,vitalStats} from './growth-v14.js';
import {hellDamageFactor} from './chapter3-skills-v14.js';
import {arcaneBonus} from './systems-data-v14.js';
import {modifySkill} from './enchantments-v14.js';
const names={B:'基础战力',str:'力量',dex:'敏捷',vit:'体质',wis:'精神'};
export const isCareerDamage=s=>!!s&&['target','pulse','targetPulse','projectile'].includes(s.kind);
export function progressionSkillNumbers(p,k,c){
 const s=PROGRESSION_SKILLS[k];if(!s)return null;
 const a=totalAttributes(p),B=baseCombatPower(p,c),rank=Math.max(1,p.skills[k]||1),mult=skillRankMultiplierV17(rank,true),t=p.careerState?.timers||{};
 const raw=Object.entries(s.formula).reduce((v,[key,n])=>v+n*(key==='constant'?1:key==='B'?B:a[key]),0);
 const terms=Object.entries(s.formula).map(([key,n])=>key==='constant'?String(n):`${names[key]}×${n}`).join(' + ');
 let formula=terms?`(${terms})×${mult}`:'',cost=s.mp,damage=raw*mult*hellDamageFactor(p,k),extra=s.description;
 const career=careerFor(p),direct=isCareerDamage(s),starReady=career?.id==='riftmage'&&direct&&(p.careerState?.stars||0)>=3;
 if(t.riftFocus>0&&direct){damage*=1.25;cost=Math.ceil(cost*1.1);formula+=' ×1.25（开眼）';}
 if(starReady){damage*=1.45;cost=Math.ceil(cost*.75);formula+=' ×1.45（星核）';extra+=' 本次消耗3枚星核，法力消耗减少25%。';}
 // New ember branches participate in the same 3-basic-hit charge as the earlier spells.
 const ember=career?.cls==='ember'&&p.emberReady&&direct?{damage:1.18,cost:.8}:null;
 if(ember){damage*=ember.damage;cost=Math.ceil(cost*ember.cost);formula+=' ×1.18（烬能）';extra+=' 本次消耗烬能。';}
 const v={cost,baseCost:s.mp,cd:s.cd,rank,mult,B,damage,formula,label:'当前效果',value:Math.round(damage)+' 伤害',extra,increments:Object.entries(s.formula).filter(([key])=>names[key]&&key!=='B').map(([key,n])=>`${names[key]}+1 → 基础效果+${Number((n*mult).toFixed(2))}`).join('；'),range:s.range,radius:s.radius,duration:(s.duration||0)+(['buff','shield','stance'].includes(s.kind)?skillRankDurationV17(rank):0),starReady,emberReady:!!ember};
 const vitals=vitalStats(p,c,a),maxHp=career?.id==='dreadguard'?Math.round(vitals.hp*1.12):vitals.hp,maxMp=career?.id==='frostweaver'?Math.round(vitals.mp*1.1):vitals.mp;
 if(s.kind==='buff'){
  v.formula=s.description;v.value=`持续 ${v.duration} 秒`;v.increments='2–3阶每阶延长1秒，4–8阶每阶延长0.35秒；增益幅度与冷却不变。';
 }else if(s.kind==='shield'||s.kind==='heal'){
  const healing=p.cls==='saint'?1.2:1,value=Math.min(maxHp*s.hpCap,raw*mult*healing);
  v[s.kind==='heal'?'heal':'shield']=Math.round(value);v.value=Math.round(value)+(s.kind==='heal'?' 治疗':' 护盾');v.formula+=`，最多为最大生命${s.hpCap*100}%`;
 }else if(s.kind==='mana'){
  v.mana=Math.round(Math.min(maxMp*s.mpCap,raw*mult));v.value=`恢复 ${v.mana} MP`;v.formula+=`，最多为最大法力${s.mpCap*100}%`;
 }else if(s.kind==='stance'){v.value=`每次反击 ${Math.round(damage)} 伤害 · 最多${s.charges}次`;v.formula+=`，持续${v.duration}秒，反击间隔至少1秒`;}
 if(Object.values(p.gear||{}).some(i=>i?.uniqueEffect==='offbeat')){
  v.extra+=' 偏拍指环：与上次不同的战技省3 MP，每6秒一次。';
  if(p.lastCombatSkill&&p.lastCombatSkill!==k&&!(p.cd.offbeat>0)){v.cost=Math.max(0,v.cost-3);v.offbeat=true;}
 }
 // The shared enchant helper rewrites value for positive damage packets. Healing,
 // shielding and restoration have no damage packet even when their formula is positive.
 if(['buff','shield','heal','mana'].includes(s.kind))v.damage=0;
 const result=modifySkill(p,k,v,{range:s.range,radius:s.radius,maxHP:maxHp,hpCap:s.hpCap});
 if(s.kind==='stance')result.value=`每次反击 ${Math.round(result.damage)} 伤害 · 最多${s.charges}次`;
 return result;
}
