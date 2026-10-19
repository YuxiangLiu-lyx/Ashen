// Authored shapes, selected by persistent item identity; no random work or save mutation.
export const GEAR_COLORS=Object.freeze({common:'#d7d9dd',uncommon:'#70e29a',rare:'#68bdff',epic:'#ce95ff',legendary:'#ffc169',abyssal:'#f1c9e8'});
export const NAMED_EQUIPMENT_ICONS=Object.freeze({
 'v28-greyfang-edge':1,'v28-cinder-cuff':32,'v28-road-charm':40,'v28-night-runner':36,'v28-stonewatch':26,'v28-spark-grip':33,
 'v28-bonebrand':5,'v28-ash-hood':17,'v28-soul-knot':41,'v28-tide-mail':27,'v28-rift-boots':37,'v28-oath-ember':6,
 'v28-bloodwell':34,'v28-lantern-crown':21,'v28-executor-shell':29,'v28-frost-bite':10,'v28-prayer-thread':43,'v28-black-iron-step':38,
 'v28-voidfang':2,'v28-mirrorflame':42,'v28-greycrown':19,'v28-ashen-vow':7,'v28-nameless-echo':46,'v28-last-guard':31
});
const hash=s=>{let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const weapons={daggers:[0,1,2,3],sword:[4,5,6,7],greatsword:[8,9,10,11],wand:[12,13],staff:[14,15]};
export function equipmentDesign(item){
 const rarity=GEAR_COLORS[item.rarity]?item.rarity:'common',slot=item.slot==='offhand'?'weapon':item.slot,key=[item.name,slot,item.weaponType,item.c1Recipe,item.uniqueEffect,item.setId,item.appearanceId].filter(Boolean).join('|')||item.id||'gear',seed=hash(key);
 let index=NAMED_EQUIPMENT_ICONS[item.id];
 if(slot==='weapon'){
  const pool=weapons[item.weaponType];
  // A class-adapted named weapon still looks like the weapon actually held.
  if(pool&&!pool.includes(index))index=pool[rarity==='common'?0:seed%pool.length];
  else if(index===undefined)index=(pool||weapons.sword)[seed%(pool||weapons.sword).length];
 }else if(index===undefined){
  const cloth=/法|咒|星|ember|saint/.test(key),plate=/钢|铁|卫|甲胄|oath/.test(key),pools={head:cloth?[20,22,21]:plate?[18,23,19]:[16,17,22],chest:cloth?[28,30]:plate?[26,27,29,31]:[24,25,30],hands:cloth?[35,32]:plate?[34,33]:[32,33,35],feet:cloth?[39,37]:plate?[38,37]:[36,37],relic:[40,41,42,43,44,45,46,47]},pool=pools[slot]||pools.relic;
  index=item.uniqueEffect==='offbeat'?47:pool[rarity==='common'?0:seed%pool.length];
 }
 return {key,index,sheet:'gearDetailed',rarity,color:GEAR_COLORS[rarity],signature:seed%16};
}
export function equipmentIconURL(item,image){const d=equipmentDesign(item);return image?.(d.sheet,d.index)||'';}
