import {sagaBasePowerV25,applySagaStatsV25} from './saga-stats-v25.js';
import {mercenaryQualityBonusV18} from './mercenary-quality-v18.js';
import {saintBondBonusesV17} from './rank-scaling-v17.js';
import {applyHellRouteGearStats} from './hell-route-gear-v15.js';
import {applyChapter5Stats} from './chapter5-economy-v14.js';
import {careerGrowthBonus,applyCareerStats} from './progression-data-v14.js';
import {enchantStat} from './enchantments-v14.js';
export const ATTR_NAMES={str:'力量',dex:'敏捷',vit:'体质',wis:'精神'};
export const CLASS_GROWTH={shadow:{initial:{str:2,dex:5,vit:2,wis:1},perLevel:{str:1,dex:2,vit:0,wis:0}},oath:{initial:{str:5,dex:1,vit:6,wis:1},perLevel:{str:2,dex:0,vit:1,wis:0}},ember:{initial:{str:1,dex:2,vit:1,wis:6},perLevel:{str:0,dex:0,vit:1,wis:2}}};
export function attributeParts(p,key){const v=CLASS_GROWTH[p.cls],initial=v.initial[key],growth=v.perLevel[key]*(p.level-1)+careerGrowthBonus(p,key,v.perLevel[key])+mercenaryQualityBonusV18(p,key),allocated=p.attrs[key]||0,gear=Object.values(p.gear||{}).reduce((n,i)=>n+(i?.attrs?.[key]||0),0)+enchantStat(p,key);return {initial,growth,allocated,gear,total:initial+growth+allocated+gear};}
export function totalAttributes(p){return Object.fromEntries(Object.keys(ATTR_NAMES).map(k=>[k,attributeParts(p,k).total]));}
export const CLASS_TRAITS={
 shadow:{name:'疾刃',desc:'攻速额外 +15%。短刃普攻按力量×1.4 + 敏捷×1.1加成，命中积累流血。'},
 oath:{name:'铁骨',desc:'基础体质 +3；敌方伤害减免 8% + 体质×0.25%，最高32%。重剑反击保留。'},
 ember:{name:'余烬聚能',desc:'每3次普攻命中积蓄一次烬能。下一次直接伤害法术耗蓝 −20%、威力 +18%；最多储存一次。'},
 saint:{name:'慈悲圣职',desc:'治疗与护盾效果 +20%。神圣普攻不造成流血，也不触发血棘；圣光战技适合精神成长，仍可研习其他战技。'}
};
export const ATTRIBUTE_HELP={str:'按职业增加普攻；决定力量战技的伤害。具体倍率见下方与技能说明。',dex:'每点暴击 +0.25%（基础总上限35%），并增强敏捷战技；力量和敏捷都不增加攻速或移速。攻速独立来自职业特性、装备与技能。',vit:'每点最大生命 +10；断誓者每点另减免0.25%来袭伤害。',wis:'每点最大法力 +4；每点每秒回蓝 +0.01（基础0.6，合计最高1.2），增强精神战技。'};
export function baseCombatPower(p,c){return c.atk+(p.level-1)*2+(p.skills.edge||0)*3+Object.entries(p.gear||{}).reduce((n,[slot,i])=>n+(i?.atk||0)*(slot==='offhand'&&p.gear.weapon?.5:1),0)+enchantStat(p,'basePower')+sagaBasePowerV25(p);}
export function vitalStats(p,c,a=totalAttributes(p)){
 return {hp:Math.round(c.hp+(p.level-1)*13+a.vit*10+(p.skills.heart||0)*20+Object.values(p.gear||{}).reduce((n,i)=>n+(i?.hp||0),0)+enchantStat(p,'maxHp')+(p.lampContract==='warmWick'?24:0)+saintBondBonusesV17(p).hp),mp:Math.round(c.mp+(p.level-1)*2+a.wis*4+enchantStat(p,'maxMp'))};
}
export function characterStats(p,c){
 const a=totalAttributes(p),B=baseCombatPower(p,c),coeff={shadow:{str:1.4,dex:1.1},oath:{str:2,dex:.4},ember:{wis:2,dex:.3},saint:{wis:1.6,dex:.3}}[p.cls];
 const atk=B+Object.entries(coeff).reduce((n,[k,v])=>n+a[k]*v,0),haste=(p.cls==='shadow'?.15:0)+(p.battleTempo>0?.25:0);
 return applySagaStatsV25(p,applyHellRouteGearStats(p,applyChapter5Stats(p,applyCareerStats(p,{...vitalStats(p,c,a),atk,crit:Math.min(.35,.06+a.dex*.0025),critMultiplier:1.5,speed:205,attackRate:({shadow:.46,oath:.68,ember:.72,saint:.76}[p.cls])/(1+haste),haste,manaRegen:Math.min(1.2,.6+a.wis*.01),reduction:Math.min(.42,(p.cls==='oath'?Math.min(.32,.08+a.vit*.0025):0)+(p.skills.trialResolve?.04:0)+(p.stoneSkin>0?.12:0)+saintBondBonusesV17(p).reduction),healing:p.cls==='saint'?1.2:1,affixes:new Set(Object.values(p.gear||{}).map(i=>i?.affix).filter(Boolean))},a))));
}
export function hasPracticeRing(p){return ['staff','wand'].includes((p.gear.weapon||p.gear.offhand)?.weaponType)&&Object.values(p.gear).some(i=>i?.uniqueEffect==='copperPractice');}
export function damageModifier(p,kind){if(!hasPracticeRing(p))return 1;if(['cleave','crash'].includes(kind))return 1.35;if(['firebolt','frost'].includes(kind)||(p.cls==='ember'&&['attack','q','e'].includes(kind)))return .8;return 1;}
export const UNIQUE_EFFECTS={copperPractice:'持法杖时：暴砍、断魂击伤害 +35%；法杖普攻、烬印、焚星、火矢、寒霜印伤害 −20%；回响牵引不受影响。其他武器不触发。'};

UNIQUE_EFFECTS.offbeat='前后施放不同战技时，后一次消耗 −3 MP；每6秒最多触发一次。药品、闪避、怒焰不参与，换激活或换装备不刷新间隔。';
