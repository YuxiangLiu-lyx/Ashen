import test from 'node:test';import assert from 'node:assert/strict';
import {RPG,stats} from '../dist/core-v14.js';
import {parseSave,exportSave} from '../dist/save-transfer-v14.js';
import {CheckpointClock,checkpointBlockReason,automaticSaveSafe} from '../dist/checkpoint-save.js';
import {preparationPanel,preparationAction} from '../dist/chapter-one-preparation-ui.js';
import {C1_BREWS,C1_MEDICINE} from '../dist/chapter-one-trial-runtime.js';
import {equipmentIconURL,equipmentDesign,GEAR_COLORS} from '../dist/equipment-icons.js';
import {V28_RARE_GEAR} from '../dist/combat-overhaul-v28.js';
const fresh=()=>{const g=new RPG('shadow');g.chapter=1;g.pending=null;g.events=[];g.relocate(370,535);g.p.items[C1_MEDICINE]=15;g.p.gold=30;return g;};
test('each potion displays live owned/required amounts and repeated real crafts consume exactly once',()=>{
 for(const [id,b]of Object.entries(C1_BREWS)){
  const g=fresh();preparationAction(g,'inspect:loom:brew:'+id);let html=preparationPanel(g,'c1-loom').body;
  assert.match(html,new RegExp(`<b>15</b><span> / ${b.amount}</span>`));assert.ok(!html.includes('需要药用精粹'));
  const n=g.p.items[id]||0;preparationAction(g,'brew:'+id+':1');assert.equal(g.p.items[id],n+1);assert.equal(g.p.items[C1_MEDICINE],15-b.amount);
  preparationAction(g,'brew:'+id+':1');assert.equal(g.p.items[id],n+1);
  html=preparationPanel(g,'c1-loom').body;assert.ok(html.includes(`<b>${15-b.amount}</b><span> / ${b.amount}</span>`));
  preparationAction(g,'brew:'+id+':2');assert.equal(g.p.items[id],n+2);assert.equal(g.p.gold,30-b.fee*2);
  g.p.items[C1_MEDICINE]=0;const before=JSON.stringify(g.p);preparationAction(g,'brew:'+id+':3');assert.equal(JSON.stringify(g.p),before);assert.match(preparationPanel(g,'c1-loom').body,/ingredient-cell insufficient/);
 }
});
test('automatic timer only saves after 60 active seconds; failure retries and death never overwrites',()=>{
 const g=fresh(),clock=new CheckpointClock();let writes=0;const write=kind=>{writes++;clock.saved(kind,123);return true;};
 for(let i=0;i<59;i++)clock.tick(1,g,true,write);assert.equal(writes,0);clock.tick(1,g,false,write);assert.equal(writes,0);clock.tick(1,g,true,write);assert.equal(writes,1);assert.equal(clock.savedAt,123);
 g.p.hp=0;for(let i=0;i<100;i++)clock.tick(1,g,true,write);assert.equal(writes,1);assert.ok(checkpointBlockReason(g));
 g.p.hp=100;clock.elapsed=60;clock.tick(1,g,true,()=>{writes++;return false;});assert.equal(clock.elapsed,61);clock.tick(1,g,true,write);assert.equal(writes,2);for(let i=0;i<4;i++)clock.tick(1,g,true,write);assert.equal(writes,3);
});
test('unsafe scenes, training and combat postpone automatic saving until safe',()=>{
 const g=fresh();assert.ok(automaticSaveSafe(g));g.pending={id:'hello'};assert.equal(automaticSaveSafe(g),false);g.pending=null;g.c1TrainingSession={};assert.ok(checkpointBlockReason(g));g.c1TrainingSession=null;
 const e=g.enemy('rat',g.p.x+20,g.p.y,'polish-guard');g.enemies.push(e);assert.equal(automaticSaveSafe(g),false);e.dead=true;assert.ok(automaticSaveSafe(g));g.memoryV13={active:true};assert.equal(automaticSaveSafe(g),false);
});
test('full snapshot roundtrip restores location, money and inventory without changing gear stats',()=>{
 const g=fresh();g.relocate(800,720);const snapshot=parseSave(exportSave(g)),before=stats(g.p);g.p.gold=0;g.relocate(900,700);const r=new RPG('shadow',snapshot);assert.equal(r.map,snapshot.map);assert.equal(r.p.x,snapshot.p.x);assert.equal(r.p.y,snapshot.p.y);assert.equal(r.p.gold,30);assert.deepEqual(stats(r.p),before);
 for(const i of [...r.p.bag,...Object.values(r.p.gear).filter(Boolean)]){const raw=JSON.stringify(i);equipmentDesign(i);assert.equal(JSON.stringify(i),raw);assert.deepEqual(equipmentDesign(i),equipmentDesign(JSON.parse(raw)));}
});
test('six quality palettes and rare equipment designs remain distinct with no gameplay mutation',()=>{
 assert.equal(new Set(Object.values(GEAR_COLORS)).size,6);
 const items=Array.isArray(V28_RARE_GEAR)?V28_RARE_GEAR:Object.values(V28_RARE_GEAR),icons=items.map(i=>equipmentDesign(i).index);assert.equal(new Set(icons).size,items.length);assert.ok(icons.every(i=>Number.isInteger(i)&&i>=0&&i<48));
 for(const weaponType of ['daggers','sword','greatsword','wand','staff'])for(const item of items.filter(i=>i.slot==='weapon')){const icon=equipmentDesign({...item,weaponType}).index;assert.ok(({daggers:[0,1,2,3],sword:[4,5,6,7],greatsword:[8,9,10,11],wand:[12,13],staff:[14,15]})[weaponType].includes(icon));}
});
