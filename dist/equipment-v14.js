import {QUALITIES,gearQuality} from './systems-data-v14.js';
import {createHellRouteGearV15} from './hell-route-gear-v15.js';
export function gearBudgetV17(cls,lv,slot,rarity){
 const power=QUALITIES[rarity]?.power||1,primary={shadow:'dex',oath:'str',ember:'wis',saint:'wis'}[cls]||'vit',late=Math.max(0,Math.min(32,lv)-6);
 return {gearGrowthVersion:17,attrs:power>1?{[primary]:Math.ceil((power-1)*(1+Math.max(0,Math.min(32,lv)-5)*.25)),...(power>=4?{vit:Math.ceil((power-2)*(1+Math.max(0,Math.min(32,lv)-5)*.12))}:{})}:{},
  atk:slot==='weapon'||slot==='offhand'?lv+power*2+Math.ceil(late*(power-1)*.33):slot==='hands'||slot==='relic'?power+Math.ceil(late*(power-1)*.1):0,
  hp:(slot==='chest'?12+power*9:slot==='head'?power*6:slot==='feet'||slot==='relic'?power*4:0)+(late>0&&['chest','head','feet','relic'].includes(slot)?Math.ceil(late*power*(slot==='chest'?.8:.3)):0)};
}
export function migrateGearGrowthV17(item,cls){
 if(!item)return item;
 const route=item.careerId&&item.hellRouteStage&&createHellRouteGearV15(cls,item.careerId,item.hellRouteStage);
 if(route&&item.id===route.id&&['weapon','offhand','chest','hands','relic'].includes(item.slot))return {...item,atk:route.atk,hp:route.hp,attrs:route.attrs,hellRouteStats:route.hellRouteStats,hellRouteDescription:route.hellRouteDescription,gearGrowthVersion:17};
 if(item.gearGrowthVersion===17||item.activityGearV17||item.uniqueEffect||item.routeSetName||!item.attrs)return item;
 const power=QUALITIES[item.rarity]?.power||1,primary={shadow:'dex',oath:'str',ember:'wis',saint:'wis'}[cls]||'vit',legacy=power>1?{[primary]:power-1,...(power>=4?{vit:power-2}:{})}:{};
 if(Object.keys(item.attrs).length!==Object.keys(legacy).length||Object.keys(legacy).some(k=>item.attrs[k]!==legacy[k]))return item;
 const lv=Math.max(1,Math.min(32,(item.minLevel||1)+2));if(lv<7)return item;
 const budget=gearBudgetV17(cls,lv,item.slot,item.rarity);
 return {...item,...budget,atk:Math.max(item.atk||0,budget.atk),hp:Math.max(item.hp||0,budget.hp)};
}

export const EQUIPMENT_SLOTS=['weapon','offhand','head','chest','hands','feet','relic'];
export const SLOT_NAMES={weapon:'主武器',offhand:'副武器',head:'头部',chest:'胸甲',hands:'护手',feet:'鞋靴',relic:'饰品'};
export const WEAPON_RULES={daggers:{hands:1,label:'单手短刃',classes:['shadow'],visual:'daggers'},sword:{hands:1,label:'单手剑',classes:['oath'],visual:'greatsword'},greatsword:{hands:2,label:'双手重剑',classes:['oath'],visual:'greatsword'},wand:{hands:1,label:'单手短杖',classes:['ember','saint'],visual:'staff'},staff:{hands:2,label:'双手法杖',classes:['ember','saint'],visual:'staff'}};
export function weaponHands(i){return i&&['weapon','offhand'].includes(i.slot)?(WEAPON_RULES[i.weaponType]?.hands||2):0;}
export function equipmentPlan(p,item,target=item?.slot){
 if(!canEquip(item,p.cls)||item.minLevel>p.level)return null;
 if(item.slot==='weapon'||item.slot==='offhand'){if(!['weapon','offhand'].includes(target))return null;if(target==='offhand'&&weaponHands(item)!==1)return null;}else if(target!==item.slot)return null;
 const gear={...p.gear},removed=[];const remove=k=>{if(gear[k]){removed.push(gear[k]);gear[k]=null;}};
 remove(target);if(target==='weapon'&&weaponHands(item)===2)remove('offhand');if(target==='offhand'&&weaponHands(gear.weapon)===2)remove('weapon');
 gear[target]={...item,slot:target};return {gear,removed:removed.map(i=>({...i,slot:i.slot==='offhand'?'weapon':i.slot}))};
}
export const WEAPONS={shadow:'daggers',oath:'greatsword',ember:'staff'};
const names={weapon:{shadow:'精钢双匕',oath:'守望重剑',ember:'刻纹法杖'},head:{shadow:'旅人兜帽',oath:'旧巡卫盔',ember:'夜蓝法帽'},chest:{shadow:'夜行皮甲',oath:'护路钢甲',ember:'星纹法袍'},hands:{shadow:'柔皮护腕',oath:'铁片护手',ember:'咒纹手套'},feet:{shadow:'软底行靴',oath:'铆钉护靴',ember:'绒边短靴'},relic:{shadow:'旧护符',oath:'旧护符',ember:'旧护符'}};
export function normalizeGear(item,cls){
 if(!item)return null;const i={...migrateGearGrowthV17(item,cls)};if(i.slot==='armor')i.slot='chest';
 i.atk=Number(i.atk)||0;i.hp=Number(i.hp)||0;i.rarity=Object.hasOwn(QUALITIES,i.rarity)?i.rarity:'common';
 if(['weapon','offhand'].includes(i.slot)){i.weaponType=i.weaponType||WEAPONS[cls]||'staff';i.hands=weaponHands(i);if(i.weaponType==='sword')i.name=i.name.replace('重剑','长剑');if(i.weaponType==='wand')i.name=i.name.replace('法杖','短杖');if(cls==='ember'&&/咒刃/.test(i.name))i.name=i.name.replace(/咒刃/g,'法杖');if(i.weaponType==='daggers')i.name=i.name.replace('双匕','短匕');}
 const icons={weapon:{daggers:0,greatsword:1,staff:2}[i.weaponType],head:{shadow:4,oath:5,ember:6,saint:6}[cls],chest:{shadow:8,oath:9,ember:10,saint:10}[cls],hands:cls==='oath'?13:12,feet:i.rarity==='common'?14:15,relic:3};
 i.iconId=Number.isInteger(i.iconId)?i.iconId:(['weapon','offhand'].includes(i.slot)?({daggers:0,sword:1,greatsword:1,wand:2,staff:2}[i.weaponType]):icons[i.slot]);i.appearanceId=i.appearanceId||i.slot+'-'+cls+'-'+i.rarity;
 return i;
}
export function migrateEquipment(p){const old=p.gear||{};p.gear=Object.fromEntries(EQUIPMENT_SLOTS.map(k=>[k,normalizeGear(old[k]||(k==='chest'?old.armor:null),p.cls)]));p.bag=(p.bag||[]).map(i=>normalizeGear(i,p.cls));return p;}
export function createGear(cls,lv,rng=Math.random,fix={},affixes={}){
 const slots=['weapon','head','chest','hands','feet','relic'],slot=fix.slot==='armor'?'chest':fix.slot||slots[Math.floor(rng()*slots.length)],v=rng(),rarity=fix.rarity||gearQuality(lv>=13?4:lv>=7?3:1,'ordinary',()=>v),power=QUALITIES[rarity]?.power||1,keys=Object.keys(affixes),affix=fix.affix||(rarity==='common'||!keys.length?null:keys[Math.floor(rng()*keys.length)]);
 return normalizeGear({id:fix.id||'i'+Math.floor(rng()*1e12).toString(36)+Date.now().toString(36),slot,weaponType:fix.weaponType||(slot==='weapon'?(cls==='oath'&&rng()<.4?'sword':['ember','saint'].includes(cls)&&rng()<.4?'wand':WEAPONS[cls]):undefined),rarity,affix,name:fix.name||((names[slot]||names.weapon)[cls]||(names[slot]||names.weapon).ember)+(affix?' · '+affixes[affix].name:''),attrs:power>1?{[{shadow:'dex',oath:'str',ember:'wis',saint:'wis'}[cls]||'vit']:Math.max(1,power-1),...(power>=4?{vit:power-2}:{})}:{},minLevel:Math.max(1,lv-2),atk:slot==='weapon'?lv+power*2:slot==='hands'||slot==='relic'?power:0,hp:slot==='chest'?12+power*9:slot==='head'?power*6:slot==='feet'||slot==='relic'?power*4:0,...gearBudgetV17(cls,lv,slot,rarity),...fix},cls);
}
export function canEquip(item,cls){return !!item&&EQUIPMENT_SLOTS.includes(item.slot)&&(!['weapon','offhand'].includes(item.slot)||!!WEAPON_RULES[item.weaponType]?.classes.includes(cls));}
export function appearance(p){const g=p.gear;return {cls:p.cls,weapon:(g.weapon||g.offhand)?.weaponType||null,offhand:g.weapon?g.offhand?.weaponType||null:null,offhandTier:g.offhand?.rarity||'common',weaponTier:(g.weapon||g.offhand)?.rarity||'common',head:g.head?({shadow:4,oath:5,ember:6,saint:6}[p.cls]+(g.head.rarity==='epic'?0:0)):null,chest:g.chest?{layer:g.chest.rarity==='common'?9:8,tier:g.chest.rarity}:null,hands:!!g.hands,feet:!!g.feet,relic:!!g.relic};}
