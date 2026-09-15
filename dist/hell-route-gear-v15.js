import {activityGearBonusesV17} from './activity-gear-v17.js';
// Pure route-equipment data. No runtime imports: growth can safely import this.
const SLOTS = {2:'weapon',3:'chest',4:'hands',5:'relic'};
const SLOT_NAMES = {weapon:'战刃',chest:'行衣',hands:'护手',relic:'心印'};
export const HELL_ROUTE_GEAR_V15 = {
 bloodblade:{cls:'shadow',name:'赤痕缝骨',attrs:{"str":10,"dex":14,"vit":4},pieces:{2:{dotDamage:.12},3:{reduction:.025},4:{dotDamage:.13,basicDamage:.08},5:{skillDamage:.12,manaRegen:.3}}},
 assassin:{cls:'shadow',name:'无声断影',attrs:{"str":6,"dex":20,"vit":2},pieces:{2:{crit:.035},3:{reduction:.02},4:{crit:.035,skillDamage:.06},5:{executeDamage:.18,skillDamage:.08}}},
 nightmare:{cls:'shadow',name:'无眠追夜',attrs:{"str":7,"dex":16,"vit":4},pieces:{2:{haste:.12,basicDamage:.15},3:{reduction:.035},4:{haste:.08,onHitPower:.08},5:{onHitPower:.08,manaRegen:.3}}},
 dreadguard:{cls:'oath',name:'不坠灯垒',attrs:{"str":7,"vit":16,"wis":2},pieces:{2:{basicDamage:.08},3:{reduction:.05},4:{basicDamage:.10},5:{reduction:.04,manaRegen:.4}}},
 berserker:{cls:'oath',name:'裂岳赤铁',attrs:{"str":20,"dex":4,"vit":4},pieces:{2:{basicDamage:.10},3:{reduction:.025},4:{haste:.12,skillDamage:.10},5:{basicDamage:.06,executeDamage:.12}}},
 spellbreaker:{cls:'oath',name:'咒钢回纹',attrs:{"str":9,"vit":6,"wis":13},pieces:{2:{onHitWis:.35},3:{mp:45,reduction:.025},4:{onHitWis:.30},5:{mp:45,manaRegen:.5,skillDamage:.10}}},
 pyromancer:{cls:'ember',name:'焚星烬绸',attrs:{"dex":2,"vit":6,"wis":20},pieces:{2:{skillDamage:.09},3:{mp:45,reduction:.02},4:{dotDamage:.18},5:{skillDamage:.08,manaRegen:.5}}},
 frostweaver:{cls:'ember',name:'凝霜守纹',attrs:{"vit":10,"wis":18},pieces:{2:{slowDamage:.10},3:{mp:40,reduction:.03},4:{slowDamage:.08},5:{mp:40,reduction:.02,manaRegen:.45}}},
 riftmage:{cls:'ember',name:'星渊织环',attrs:{"dex":2,"vit":4,"wis":22},pieces:{2:{skillDamage:.10},3:{mp:65,reduction:.02},4:{skillDamage:.10},5:{mp:65,manaRegen:.65}}}
};
const pct=n=>Number((n*100).toFixed(1))+'%';
export function hellRouteStatTextV15(s={}){
 const out=[];
 if(s.haste)out.push('独立装备攻速 +'+pct(s.haste)+'（不依赖敏捷）');
 if(s.basicDamage)out.push('普攻伤害 +'+pct(s.basicDamage));
 if(s.onHitPower)out.push('普攻命中附伤：基础战力 ×'+s.onHitPower.toFixed(2)+'（不触发连锁）');
 if(s.onHitWis)out.push('普攻命中附伤：精神 ×'+s.onHitWis.toFixed(2)+'（不触发连锁）');
 if(s.skillDamage)out.push('直接战技伤害 +'+pct(s.skillDamage));
 if(s.dotDamage)out.push('持续伤害 +'+pct(s.dotDamage));
 if(s.executeDamage)out.push('对低于35%生命目标直接伤害 +'+pct(s.executeDamage));
 if(s.slowDamage)out.push('对受控目标直接伤害 +'+pct(s.slowDamage));
 if(s.crit)out.push('暴击率 +'+pct(s.crit));
 if(s.reduction)out.push('减伤 +'+pct(s.reduction)+'（总上限60%）');
 if(s.mp)out.push('法力上限 +'+s.mp);
 if(s.manaRegen)out.push('每秒回蓝 +'+s.manaRegen);
 return out.join('；');
}
export function createHellRouteGearV15(cls,careerId,stage){
 const route=HELL_ROUTE_GEAR_V15[careerId],slot=SLOTS[stage];
 if(!route||route.cls!==cls||!slot)return null;
 const special={...route.pieces[stage]},weaponType={shadow:'daggers',oath:careerId==='spellbreaker'?'sword':'greatsword',ember:'staff'}[cls];
 return {id:'quest-v15-route-'+careerId+'-'+slot,name:route.name+' · '+(slot==='weapon'&&cls==='ember'?'法杖':SLOT_NAMES[slot]),slot,
  ...(slot==='weapon'?{weaponType}:{}),rarity:stage===5?'legendary':'epic',minLevel:1,
  atk:{weapon:82,chest:8,hands:24,relic:26}[slot],hp:{weapon:35,chest:195,hands:60,relic:105}[slot],
  attrs:{...route.attrs},affix:null,careerId,routeSetName:route.name,hellRouteStage:stage,hellRouteStats:special,
  hellRouteDescription:hellRouteStatTextV15(special)+'。仅'+route.name+'对应转职生效；同路2件：攻击+14、生命+100；4件：再加攻击+18、生命+120。',
  source:'阙灯城 · '+({2:'裂灯巡猎',3:'矿庭寻宝',4:'无赎死斗',5:'三灯试炼'}[stage])};
}
export function hellRouteGearBonuses(p){
 const out={count:0,attack:0,hp:0,haste:0,basicDamage:0,onHitPower:0,onHitWis:0,skillDamage:0,dotDamage:0,executeDamage:0,slowDamage:0,crit:0,reduction:0,mp:0,manaRegen:0};
 if(!HELL_ROUTE_GEAR_V15[p?.career?.id]||p.career.preview)return out;
 const seen=new Set();
 for(const [slot,item] of Object.entries(p.gear||{})){
  if(!item||item.careerId!==p.career.id||!item.hellRouteStats||!['weapon','chest','hands','relic'].includes(slot)||item.slot!==slot||seen.has(item.id))continue;
  // Only authored numerical modifiers are applied. A saved label cannot create effects.
  const authored=HELL_ROUTE_GEAR_V15[item.careerId]?.pieces[item.hellRouteStage];
  if(!authored||SLOTS[item.hellRouteStage]!==slot||item.id!=='quest-v15-route-'+item.careerId+'-'+slot||!p.career.unlockedStages?.includes(item.hellRouteStage))continue;
  seen.add(item.id);out.count++;
  for(const [k,v]of Object.entries(authored))out[k]+=v;
 }
 for(const [k,n]of Object.entries(activityGearBonusesV17(p)))out[k]+=n;
 out.haste=Math.min(.35,out.haste);out.basicDamage=Math.min(.30,out.basicDamage);out.onHitPower=Math.min(.22,out.onHitPower);
 if(out.count>=2){out.attack+=14;out.hp+=100;}
 if(out.count>=4){out.attack+=18;out.hp+=120;}
 return out;
}
export function applyHellRouteGearStats(p,s){
 const b=hellRouteGearBonuses(p),rate=Math.max(.105,s.attackRate/(1+b.haste));
 return {...s,atk:s.atk+b.attack,hp:s.hp+b.hp,mp:s.mp+b.mp,attackRate:rate,
  haste:(1+(s.haste||0))*(1+b.haste)-1,independentGearHaste:b.haste,
  crit:Math.min(.45,(s.crit||0)+b.crit),reduction:Math.min(.6,(s.reduction||0)+b.reduction),manaRegen:(s.manaRegen||0)+b.manaRegen};
}
