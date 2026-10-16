import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RPG} from '../dist/core-v14.js';
import {parseSave} from '../dist/save-transfer-v14.js';
const baseline=JSON.parse(fs.readFileSync('docs/c1-endurance/before/ENEMIES.json'));
const boost=e=>e.elite||e.isBoss?2.5:1.5;
const reload=g=>new RPG(g.p.cls,parseSave(JSON.stringify(g.snapshot())),()=>.44);
test('all chapter-one authored encounters increase from shipped final HP, independent of player level',()=>{
 for(const row of baseline.maps){const g=new RPG('shadow',null,()=>.44);g.chapter=2;g.p.level=row.level;g.map=row.map;delete g.states[row.map];g.ensureMap(row.map);
  for(const before of row.enemies){const e=g.enemies.find(e=>e.id===before.id);assert.ok(e,row.map+':'+before.id);assert.equal(e.maxHP,Math.ceil(before.maxHP*boost(before)),before.id);assert.equal(e.hp,e.maxHP);}
 }
});
test('legacy visited enemies preserve death and health ratio through repeated restores, no repeated multiplication or rewards',()=>{
 for(const entry of baseline.saves){
  const s=structuredClone(entry.snapshot);let n=0;
  for(const state of Object.values(s.states))for(const e of state.enemies){e.hp=++n%3===0?0:Math.round(e.maxHP*.4);e.dead=e.hp===0;}
  let g=new RPG('shadow',parseSave(JSON.stringify(s)),()=>.44);
  for(let pass=0;pass<3;pass++){
   for(const [map,state]of Object.entries(s.states))for(const before of state.enemies){const e=g.states[map].enemies.find(e=>e.id===before.id),max=Math.ceil(before.maxHP*boost(before));assert.equal(e.maxHP,max,before.id);assert.equal(e.hp,before.dead?0:Math.max(1,Math.round(max*before.hp/before.maxHP)),before.id);assert.equal(e.dead,before.dead);}
   assert.equal(g.p.gold,s.p.gold);assert.equal(g.p.xp,s.p.xp);g=reload(g);
  }
 }
});
test('dynamic captain migrates from prior endurance maximum and leaves chapter-two/three/later enemies unchanged',()=>{
 for(const [map,phase]of [['canal',4],['bridge',7],['deepBastion',16]]){
  let g=new RPG('shadow',null,()=>.44);g.chapter=phase;g.map=map;g.ensureMap(map);g.pending=null;
  const e=g.enemy('captain',800,600,'captain');g.states[map].enemies=[e];
  if(map==='canal'){
   const previous=Math.round(e.endurance.base*1.7);assert.equal(e.maxHP,Math.ceil(previous*2.5));
   e.maxHP=previous;e.hp=Math.round(previous*.41);e.endurance={revision:1,base:e.endurance.base,maxHP:previous};const ratio=e.hp/e.maxHP;
   g=reload(g);assert.equal(g.enemies[0].maxHP,Math.ceil(previous*2.5));assert.equal(g.enemies[0].hp,Math.round(Math.ceil(previous*2.5)*ratio));
  }else if(map==='bridge'){assert.equal(e.endurance.revision,1);assert.equal(e.maxHP,Math.round(e.endurance.base*1.7));}
  else assert.equal(e.endurance,undefined);
  const before=g.enemies.find(e=>e.id==='captain');const expected=[before.hp,before.maxHP];for(let i=0;i<3;i++)g=reload(g);const actual=g.enemies.find(e=>e.id==='captain');assert.deepEqual([actual.hp,actual.maxHP],expected);
 }
});
