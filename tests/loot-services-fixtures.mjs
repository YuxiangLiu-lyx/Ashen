import fs from 'node:fs';
export const serviceScript=JSON.parse(fs.readFileSync(new URL('../docs/loot-services/SCRIPT.json',import.meta.url))).scenes;
export const serviceDialogue=(id,fallback)=>serviceScript[id]||fallback;
// Unit settlement fixtures now perform the required pickup after a kill. Whole
// campaign/browser tests walk using the actual movement loop instead.
export function collectFloor(g){
 const original={x:g.p.x,y:g.p.y,active:g.active};for(let i=0;g.pending&&i<20;i++)g.finishScene();g.active=true;
 for(const d of [...g.floorLoot()]){g.relocate(d.x,d.y);g.pickGroundLoot(d.id);}
 g.relocate(original.x,original.y);g.active=original.active;
}
export function damageAndCollect(g,...args){const result=g.damage(...args);collectFloor(g);return result;}
