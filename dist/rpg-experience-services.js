import {C2_STOCK} from './rpg-chapter-two-data.js';
import {normalizeGear,equipmentPlan} from './equipment-v14.js';
import {c1State} from './chapter-one-expansion-save.js';
import {GEAR_SELL_PRICE} from './systems-data-v14.js';
export const EXPERIENCE_STOCK={
 ...C2_STOCK,
 fieldWeapon:{name:'整修过的行路武器',slot:'weapon',atk:8,hp:0,cost:18,minLevel:1},
 fieldChest:{name:'夹棉练武衣',slot:'chest',atk:0,hp:32,experienceArmor:.06,cost:22,minLevel:1},
 fieldHead:{name:'衬皮兜帽',slot:'head',atk:0,hp:16,experienceArmor:.02,cost:14,minLevel:1},
 roadWeapon:{name:'白榆锻制武器',slot:'weapon',atk:15,hp:0,cost:58,minLevel:3},
 roadChest:{name:'补铁行路衣',slot:'chest',atk:0,hp:52,experienceArmor:.09,cost:52,minLevel:3},
 roadFeet:{name:'护踝行靴',slot:'feet',atk:0,hp:20,experienceArmor:.03,cost:26,minLevel:2},
};
export const EXPERIENCE_SERVICES={
 seline:{map:'inn',title:'塞琳的寄卖行装',stock:['relayWeapon','relayChest','relayHead'],potions:false,rest:20,phases:[5,8]},
 clerk:{map:'hall',title:'会馆行装柜',stock:['fieldWeapon','fieldChest','fieldHead'],potions:true},
 c1iden:{map:'c1TrialFoyer',title:'地下接待室',stock:['fieldChest','fieldHead'],potions:true,rest:0},
 lotti:{map:'workshop',title:'洛缇的成品架',stock:['roadWeapon','roadChest','roadFeet'],potions:true},
 c1eve:{map:'c1RiversideCamp',title:'营地药箱',stock:[],potions:true,rest:8},
};
export function serviceItem(cls,id,vendor){const s=EXPERIENCE_STOCK[id];if(!s)return null;const weaponType={shadow:'daggers',oath:'greatsword',ember:'staff'}[cls];return normalizeGear({...s,id:'outfit-'+vendor+'-'+id,instanceId:'outfit-'+vendor+'-'+id,rarity:'rare',...(s.slot==='weapon'?{weaponType}:{}),c1SellPrice:Math.floor(s.cost/4),source:EXPERIENCE_SERVICES[vendor]?.title},cls);}
export function installExperienceServices(RPG,{stats,MAPS}){
 const P=RPG.prototype,old={npcOptions:P.npcOptions,choose:P.choose};
 P.experienceService=function(id){const s=EXPERIENCE_SERVICES[id],npc=this.npcs.find(n=>n.id===id);return s&&this.chapter>=(s.phases?.[0]??0)&&this.chapter<(s.phases?.[1]??3)&&this.map===s.map&&MAPS[this.map].safe&&this.p.hp>0&&!this.pending&&!this.transition&&!this.enemies.some(e=>!e.dead)&&npc&&Math.hypot(this.p.x-npc.x,this.p.y-npc.y)<=145&&this.clearLine(this.p,npc,false)?s:null;};
 P.experiencePreview=function(vendor,id){const s=EXPERIENCE_SERVICES[vendor];if(!s?.stock.includes(id))return null;const item=serviceItem(this.p.cls,id,vendor),plan=equipmentPlan({...this.p,level:Math.max(this.p.level,item.minLevel)},item);return {item,before:stats(this.p),after:stats({...this.p,gear:plan.gear}),owned:!!c1State(this).claimLedger['outfit:'+vendor+':'+id]};};
 P.experienceBuy=function(vendor,id){const s=this.experienceService(vendor),offer=this.experiencePreview(vendor,id);if(!s||!offer||offer.owned||this.p.bag.length>=60||this.p.gold<offer.item.cost||this.p.level<offer.item.minLevel)return false;
  return !!this.c1Transaction('outfit:'+vendor+':'+id,()=>{this.p.gold-=offer.item.cost;if(!this.c1Deliver(offer.item))return false;c1State(this).economy.push({event:'outfit:'+vendor+':'+id,gold:-offer.item.cost,balance:this.p.gold});return {items:[offer.item.id]};});
 };
 P.experienceBuyPotion=function(vendor,id){if(!this.experienceService(vendor)?.potions||!['hp','mp'].includes(id)||this.p.gold<12)return false;this.p.gold-=12;this.addItem(id);this.saveEvent();return true;};
 P.experienceRestCost=function(vendor){const s=EXPERIENCE_SERVICES[vendor];return vendor==='seline'&&this.flags.pumpFixed||vendor==='c1eve'&&this.quests.c1CampHerbs==='done'?0:s?.rest;};
 P.experienceRest=function(vendor){const s=this.experienceService(vendor);if(s?.rest===undefined)return false;const cost=this.experienceRestCost(vendor);return this.restAtBed(cost);};
 P.experienceEquip=function(vendor,id){if(!this.experienceService(vendor))return false;const item=this.p.bag.find(i=>i.id===id);return !!item&&this.equip(id,item.slot);};
 P.experienceSellPrice=function(item){return item?.c1SellPrice??GEAR_SELL_PRICE[item?.rarity]??6;};
 P.experienceSell=function(vendor,id){if(!this.experienceService(vendor))return false;const item=this.p.bag.find(i=>i.id===id);if(!item||!this.canSell(item))return false;this.p.bag=this.p.bag.filter(i=>i.id!==id);this.p.gold+=this.experienceSellPrice(item);this.saveEvent();return true;};
 P.npcOptions=function(id){const options=old.npcOptions.call(this,id),s=EXPERIENCE_SERVICES[id];if(s&&this.chapter>=(s.phases?.[0]??0)&&this.chapter<(s.phases?.[1]??3)&&this.map===s.map)options.push({label:s.title+' · 行装与补给',action:'experience:service:'+id,questState:'service'});return options;};
 P.choose=function(action){if(action.startsWith('experience:service:')){const id=action.slice(19);if(!this.experienceService(id))return false;this.emit('mechanism',{kind:'c1-outfit:'+id});return true;}return old.choose.call(this,action);};
}
