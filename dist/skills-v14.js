import {skillRankMultiplierV17,skillRankDurationV17,skillRankSupportV17} from './rank-scaling-v17.js';
import {progressionSkillNumbers} from './progression-skills-v14.js';
import {arcaneBonus} from './systems-data-v14.js';
import {enchantStat,modifySkill} from './enchantments-v14.js';
import {chapter3SkillNumbers,hellDamageFactor} from './chapter3-skills-v14.js';
// All skill numbers shown in the interface and consumed by combat share this source.
import {totalAttributes,damageModifier,baseCombatPower} from './growth-v14.js';
import {SKILL_SPEC as spec} from './balance-v14.js';

export function basePower(p,c){return baseCombatPower(p,c);}
export function skillNumbers(p,k,c){const career=progressionSkillNumbers(p,k,c);if(career)return career;const extra=chapter3SkillNumbers(p,k,c);if(extra)return extra;const v=spec[p.cls]?.[k]||spec.common[k];if(!v)return null;const rank=p.skills[k]||1,mult=skillRankMultiplierV17(rank),B=basePower(p,c),a=totalAttributes(p),practiceModifier=damageModifier(p,k),hellModifier=hellDamageFactor(p,k),modifier=practiceModifier*hellModifier;let raw=(v.base||0)*B;for(const attr of ['str','dex','vit','wis'])raw+=(v[attr]||0)*a[attr];const names={str:'力量',dex:'敏捷',vit:'体质',wis:'精神'},terms=[];if(v.base)terms.push(`基础战力×${v.base}`);for(const [key,n] of Object.entries(names))if(v[key])terms.push(`${n}×${v[key]}`);let formula=terms.join(' + ');if(mult!==1&&formula)formula=`(${formula}) ×${mult}`;const data={...v,rank,mult,B,damage:raw*mult*modifier,formula,heal:6+a.vit*.5,guard:1.5+skillRankDurationV17(rank)*.35+a.dex*.025,duration:k==='frost'?4+skillRankDurationV17(rank)+a.wis*.03:5+skillRankDurationV17(rank),speed:Math.min(.70,.35+a.dex*.01+enchantStat(p,'sprintBoost')/100),nova:(B*.8+a.wis)*mult*modifier};
 if(practiceModifier!==1){data.formula=`(${data.formula}) ×${practiceModifier}（练武环）`;data.extra+=practiceModifier>1?' 练武环：近身杖技增强35%。':' 练武环：法术削弱20%。';}if(hellModifier!==1){data.formula=`(${data.formula}) ×${Number(hellModifier.toFixed(4))}（灯契 / 战技状态 / 装备）`;data.extra+=' 当前增益与代价已计入。';}
 if(k==='e'&&p.cls==='oath'){data.formula='1.5 + 升阶时长收益×0.35 + 敏捷×0.025 秒（4阶起时长收益递减）';data.value=data.guard.toFixed(2)+' 秒';}
 else if(k==='sprint'){data.formula='35% + 敏捷×1% + 疾行刻印（最高 70%）';data.value='+'+Math.round(data.speed*100)+'% · '+data.duration+' 秒';}
 else data.value=Math.round(data.damage)+' 伤害';
 if(k==='frost')data.extra+=` 持续 ${data.duration.toFixed(1)} 秒（4 + 升阶时长收益 + 精神×0.03；4阶起收益递减）。`;
 if(k==='e'&&p.cls==='ember')data.extra+=` 每枚火弹 ${Math.round(data.nova)} 伤害：[基础战力×0.8 + 精神]×${mult}${modifier!==1?'×'+modifier:''}。`;
 data.increments=Object.entries(names).filter(([key])=>v[key]).map(([key,n])=>`${n}+1 → 伤害+${Number((v[key]*mult*modifier).toFixed(2))}`).join('；');
 if(k==='e'&&p.cls==='oath')data.increments='敏捷+1 → 格挡窗口+0.025 秒';
 if(k==='sprint')data.increments='敏捷+1 → 移速加成+1%（到上限为止）';
 data.baseCost=data.cost;if(Object.values(p.gear).some(i=>i?.uniqueEffect==='offbeat')){data.extra+=' 偏拍指环：与上次不同的战技省3MP，每6秒一次。';if(p.lastCombatSkill&&p.lastCombatSkill!==k&&!(p.cd.offbeat>0)){data.cost=Math.max(0,data.cost-3);data.offbeat=true;}}
 const arcane=arcaneBonus(p,k);if(arcane){data.damage*=arcane.damage;data.nova*=arcane.damage;data.cost=Math.ceil(data.cost*arcane.cost);data.value=Math.round(data.damage)+' 伤害';data.formula+=' ×1.18（烬能）';data.extra+=' 本次消耗烬能，法力消耗减少20%。';}return modifySkill(p,k,data,{range:k==='cleave'?125:undefined});
}
