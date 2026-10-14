// UI-only selection: never calls aim(), changes facing, or writes a saved target.
export function combatTarget(g,previous=null){
 const alive=g.enemies.filter(e=>!e.dead&&e.hp>0),distance=e=>Math.hypot(e.x-g.p.x,e.y-g.p.y);
 const selected=alive.find(e=>e.id===g.target);
 if(selected&&distance(selected)<=850)return selected;
 const engaged=alive.filter(e=>distance(e)<=650&&(e.aiState==='COMBAT'||e.alertUntil>g.time||e.wind>0));
 return engaged.find(e=>e===previous)||engaged.sort((a,b)=>distance(a)-distance(b))[0]||null;
}
const names={rat:'灰鼠',wolf:'灰狼',bat:'夜蝠',guard:'巡卫',captain:'追缉官 · 罗德',hellHound:'焦骨猎犬',hellSoul:'灰烬亡魂',hellGuard:'流放重卫',hellJailer:'缚链狱卒',deepHound:'黑潮猎犬',deepSoul:'断誓幽魂',deepGuard:'熔甲守卫',deepElite:'持印近卫'};
export function combatTargetName(e){return e.label||names[e.type]||e.name||'敌人';}
