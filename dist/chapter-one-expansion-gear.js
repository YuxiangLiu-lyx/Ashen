import {C1_RECIPES,C1_RUNES,C1_CORES,C1_GEAR,C1_EFFECT_TEXT,c1CoreAt} from './chapter-one-expansion-data.js';
import {c1State,c1Random,c1Clone} from './chapter-one-expansion-save.js';
import {normalizeGear,WEAPON_RULES,equipmentPlan} from './equipment-v14.js';
export function c1Effects(p){const effects={};for(const item of Object.values(p.gear||{})){if(!item?.c1Effect)continue;const k=item.c1Effect;effects[k]=Math.max(effects[k]||0,item.c1Value||1);}return effects;}
export function c1Stats(p,s){const effects=c1Effects(p),armor=Object.values(p.gear||{}).reduce((n,i)=>n+Math.max(0,Math.min(.15,i?.experienceArmor||0)),0);return {...s,reduction:Math.min(.6,s.reduction+Math.min(.2,armor)),mp:s.mp+Object.values(p.gear||{}).reduce((n,i)=>n+(i?.c1Mana||0),0)+(effects.mana||0),manaRegen:s.manaRegen+(effects.regen||0),speed:s.speed*(1+(effects.speed||0)+(effects.trail&&p.c1QuietSeconds>=4?.06:0))};}
export const c1Weapons=cls=>Object.entries(WEAPON_RULES).filter(([,v])=>v.classes.includes(cls)).map(([k])=>k);
export function c1Item(cls,template,instance,weaponType){
 const t=C1_GEAR[template]||C1_RECIPES[template];if(!t)throw Error('Unknown chapter-one gear');
 return normalizeGear({id:instance,instanceId:instance,recipeId:C1_RECIPES[template]?template:undefined,c1Template:template,name:t.name,slot:t.slot,rarity:t.rarity||'epic',minLevel:t.minLevel||3,gearGrowthVersion:17,atk:t.atk||0,hp:t.hp||0,attrs:{...t.attrs,...(t.primary?{[{shadow:'dex',oath:'str',ember:'wis'}[cls]||'wis']:t.primary}:{})},affix:null,c1Mana:t.mp||0,c1Effect:t.effect,c1Value:t.value||1,uniqueEffect:'c1:'+t.effect,c1Description:t.effect==='regen'?'每秒法力恢复 +'+t.value:C1_EFFECT_TEXT[t.effect],...(t.slot==='weapon'?{weaponType:weaponType||c1Weapons(cls)[0]}:{}),...(C1_RECIPES[template]?{c1SellPrice:6}:{})},cls);
}
function runeOn(item,rune,value){if(['str','dex','vit','wis'].includes(rune.stat))item.attrs[rune.stat]=(item.attrs[rune.stat]||0)+value;else if(rune.stat==='mp')item.c1Mana+=value;else item.atk+=value;item.c1Rune={id:rune.id,value};return item;}
const validEnemy=e=>e&&!e.dead&&!e.c1Training&&!e.c1NoReward&&!e.v11Add&&!e.storyTag&&!e.trialFloor;
export function installC1Gear(RPG,{stats,ITEMS}){
 const P=RPG.prototype;
 for(const [id,t]of Object.entries(C1_CORES))ITEMS[id]={name:t.name,category:'quest',kind:'material',desc:'来源：试织赠送、罗萨委托与巡检。三个未用核心可换一个自选核心；不含旧机芯。'};
 for(const [id,t]of Object.entries(C1_RUNES))ITEMS[id]={name:t.name+' · T1',category:'material',kind:'material',desc:`用于六种缀纹配方；${t.stat} +${t.min}～${t.max}，整数等概率；售价${t.price}金。`};
 ITEMS.c1FeeCoupon={name:'试作免工费券',category:'quest',kind:'quest',desc:'制作时可抵扣一次6金币工费。'};
 P.c1Preview=function(recipeId,runeId,weaponType){
  const r=C1_RECIPES[recipeId],u=C1_RUNES[runeId];if(!r||!u||r.slot==='weapon'&&!c1Weapons(this.p.cls).includes(weaponType))return null;
  const item=c1Item(this.p.cls,recipeId,'preview',weaponType),before=stats(this.p);
  const values=[u.min,u.max].map(value=>{const i=runeOn(c1Clone(item),u,value),copy={...this.p,level:Math.max(this.p.level,i.minLevel)},plan=equipmentPlan(copy,i);return {value,item:i,stats:stats({...copy,gear:plan.gear})};});
  return {recipeId,runeId,weaponType,base:item,before,values,cost:{core:r.core,rune:runeId,gold:r.fee},levelRequired:r.minLevel};
 };
 P.c1Craft=function(order){
  const {recipeId,runeId,weaponType,useCoupon=false,transactionId}=order||{},h=c1State(this);
  if(typeof transactionId!=='string'||!/^craft:[0-9]+$/.test(transactionId))return false;
  if(h.crafting.transactions[transactionId])return h.crafting.transactions[transactionId].item;
  if(transactionId!=='craft:'+(h.crafting.sequence+1)||!this.c1AtService('loom'))return false;
  const preview=this.c1Preview(recipeId,runeId,weaponType),r=C1_RECIPES[recipeId],u=C1_RUNES[runeId];if(!preview)return false;
  const fee=useCoupon&&this.p.items.c1FeeCoupon>0?0:r.fee;
  if(!(this.p.items[r.core]>0)||!(this.p.items[runeId]>0)||this.p.gold<fee)return false;
  const tx=this.c1Transaction(transactionId,()=>{
   const value=u.min+Math.floor(c1Random(this,'crafting')*(u.max-u.min+1)),item=runeOn(c1Item(this.p.cls,recipeId,'c1-crafted-'+(h.crafting.sequence+1),weaponType),u,value);
   this.p.items[r.core]--;this.p.items[runeId]--;this.p.gold-=fee;if(!fee)this.p.items.c1FeeCoupon--;
   h.crafting.sequence++;h.crafting.transactions[transactionId]={id:transactionId,item:c1Clone(item),cost:{core:r.core,rune:runeId,gold:fee,coupon:!fee}};
   this.c1Deliver(item);h.economy.push({event:transactionId,xp:0,gold:-fee,core:r.core,rune:runeId,item:item.id,balance:this.p.gold});return {items:[item.id]};
  });return tx?h.crafting.transactions[transactionId].item:false;
 };
 P.c1BuyRune=function(id){const r=C1_RUNES[id];if(!r||!this.c1AtService('rosa')||this.p.gold<r.price)return false;this.p.gold-=r.price;this.addItem(id);c1State(this).economy.push({event:'buy:'+id,gold:-r.price,balance:this.p.gold});this.saveEvent();return true;};
 P.c1Exchange=function(target,selected){if(!C1_CORES[target]||!this.c1AtService('rosa')||!Array.isArray(selected)||selected.length!==3||selected.some(id=>!C1_CORES[id]))return false;const counts={};for(const id of selected)counts[id]=(counts[id]||0)+1;if(Object.entries(counts).some(([id,n])=>(this.p.items[id]||0)<n))return false;for(const [id,n]of Object.entries(counts))this.p.items[id]-=n;this.addItem(target);this.saveEvent();return true;};
 P.c1FreeMaterials=function(core,rune){if(!C1_CORES[core]||!C1_RUNES[rune]||!this.c1AtService('loom'))return false;const h=c1State(this);if(this.quests.c1LoomBrief!=='active'&&!h.worldChanges.loomGift||!h.questSteps.c1LoomBrief?.previewed)return false;const tx=this.c1Transaction('loom:gift',()=>{this.addItem(core);this.addItem(rune);this.addItem('c1FeeCoupon');h.worldChanges.loomGift=true;return {items:[core,rune,'c1FeeCoupon']};});if(tx)return tx;};
 P.c1RandomCore=function(){const id=c1CoreAt(c1Random(this,'materialSeed'));this.addItem(id);return id;};
 const sell=P.sell,canSell=P.canSell;
 P.canSell=function(item){return item?.c1SellPrice!==undefined||canSell.call(this,item);};
 P.sell=function(id){const item=this.p.bag.find(i=>i.id===id);if(item?.c1SellPrice!==undefined){if(this.p.hp<=0||!['hall','town','guestroom','workshop','c1LoomRoom','post','inn'].includes(this.map)||this.enemies.some(e=>!e.dead))return false;this.p.bag=this.p.bag.filter(i=>i.id!==id);this.p.gold+=item.c1SellPrice;this.saveEvent();return true;}return sell.call(this,id);};
 const damage=P.damage,hurt=P.hurt,skill=P.skill,attack=P.attack,potion=P.potion,update=P.update;
 const action=(g,fn,args,type)=>{const previous=g.c1DamageAction,source={type,counted:false,manaReturned:false,boosted:false},bullets=new Set(g.bullets),pulses=new Set(g.ch3?.pulses||[]);g.c1DamageAction=source;try{return fn.apply(g,args);}finally{for(const b of g.bullets)if(!bullets.has(b))b.c1Action=source;for(const b of g.ch3?.pulses||[])if(!pulses.has(b))b.c1Action=source;g.c1DamageAction=previous;}};
 P.skill=function(...args){return action(this,skill,args,'skill');};
 P.attack=function(...args){return action(this,attack,args,'attack');};
 P.damage=function(e,n,kind='hit',source=this.c1DamageAction){
  if(e.dead)return damage.call(this,e,n,kind);
  const p=this.p,f=c1Effects(p),direct=['hit','skill','ch3skill'].includes(kind),activeSkill=['skill','ch3skill'].includes(kind),valid=validEnemy(e),hp=e.hp;
  if(direct){n*=1+(activeSkill?(f.skill||0):(f.attack||0));if(valid){
   if(f.opener&&e.hp>e.maxHP*.7&&!(p.cd.c1Opener>0)){n*=1.15;p.cd.c1Opener=8;}
   if(activeSkill&&f.threeHits&&!source?.boosted&&(p.c1WingHits||0)>=3&&!(p.cd.c1Wing>0)){n*=1.12;p.c1WingHits=0;p.cd.c1Wing=8;if(source)source.boosted=true;}
   if(activeSkill&&f.evasion&&p.cd.c1EvasionWindow>0){n*=1.18;p.cd.c1EvasionWindow=0;}
  }}
  const result=damage.call(this,e,n,kind);
  if(valid&&direct&&e.hp<hp){
   if(kind==='hit'&&f.threeHits&&!source?.counted&&!(p.cd.c1Wing>0)){p.c1WingHits=Math.min(3,(p.c1WingHits||0)+1);if(source)source.counted=true;}
   if(activeSkill&&f.skillMana&&!source?.manaReturned&&!(p.cd.c1SkillMana>0)){p.mp=Math.min(stats(p).mp,p.mp+2);p.cd.c1SkillMana=8;if(source)source.manaReturned=true;}
   if(e.dead&&f.killMana&&!(p.cd.c1KillMana>0)){p.mp=Math.min(stats(p).mp,p.mp+3);p.cd.c1KillMana=3;}
  }return result;
 };
 P.hurt=function(n){const f=c1Effects(this.p),hp=this.p.hp;let factor=1-(f.directReduction||0);if(f.lowGuard&&hp<stats(this.p).hp*.35)factor*=.96;if(f.potionGuard&&this.p.cd.c1PotionWindow>0)factor*=.92;const result=hurt.call(this,n*factor);if(this.p.hp<hp){this.p.c1QuietSeconds=0;this.p.cd.c1EvasionWindow=0;}return result;};
 P.potion=function(id){if(this.c1TrainingSession){this.say('练习不消耗药品，离场即可恢复。');return false;}const result=potion.call(this,id);if(result&&id.startsWith('hp')&&c1Effects(this.p).potionGuard&&!(this.p.cd.c1PotionGuard>0)){this.p.cd.c1PotionGuard=12;this.p.cd.c1PotionWindow=4;}return result;};
 P.update=function(dt,input){const active=this.active&&!this.pending&&!this.transition,result=update.call(this,dt,input);if(active)this.p.c1QuietSeconds=Math.min(4,(this.p.c1QuietSeconds||0)+dt);return result;};
}
