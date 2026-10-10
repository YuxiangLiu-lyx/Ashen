import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RPG,MAPS} from '../dist/core-v14.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {simulate} from '../tools/balance_lab/simulator.mjs';
import {inspectWorldMap} from '../tools/world_audit.mjs';
import {CHAPTER23_MAPS_V30,chapter23V30,hellMonsterFrameV30} from '../dist/chapter23-design-v30.js';
import {reactionV30,defeatsV30,motionPoseV30} from '../dist/chapter-one-motion-v30.js';
const read=name=>JSON.parse(fs.readFileSync(new URL('../docs/chapter23/'+name,import.meta.url)));
const game=()=>new RPG('shadow',null,()=>.44);
const savedGame=g=>parseSave(JSON.stringify(g.snapshot()));
test('23 maps keep the exact baseline geometry, spawns and gates; all interaction anchors are reachable',()=>{
 const before=read('BASELINE_NAVIGATION.json');assert.equal(CHAPTER23_MAPS_V30.length,23);
 for(const row of before.maps){const g=game();g.enter(row.id,...(MAPS[row.id].entry||[800,800]));const after=inspectWorldMap(g,row.id);
  assert.equal(after.walkableCells,row.walkableCells,row.id);assert.equal(after.connectedCells,row.connectedCells,row.id);
  assert.equal(after.enemies,row.enemies,row.id);assert.deepEqual(after.unreachable,[],row.id);
  assert.deepEqual(MAPS[row.id].spawns,row.spawns,row.id);assert.deepEqual(JSON.parse(JSON.stringify(MAPS[row.id].doors)),row.doors,row.id);
 }
 assert.equal(chapter23V30('hellMemoryVillage'),false);assert.equal(chapter23V30('deepGate'),false);
});
test('24 baseline seeded encounters preserve full combat, reward, cooldown and RNG event streams',()=>{
 for(const {config,result}of read('BASELINE_COMBAT.json').runs)assert.deepEqual(simulate(config),result,config.cls+'/'+config.enemy);
});
test('water interaction migration repairs visited old maps without moving actors or resetting claims',()=>{
 const g=game();g.enter('bridge',1040,495);const p=g.props.find(p=>p.id==='v9-bridge-water');p.interactY=525;
 const e=g.enemies[0];g.damage(e,99999);g.flags.v9WaterShared=true;
 const snap=savedGame(g);snap.states.bridge.props.find(p=>p.id==='v9-bridge-water').interactY=525;const h=game();h.restore(structuredClone(snap));
 const target=h.targets().find(p=>p.id==='v9-bridge-water');assert.equal(target.y,495);assert.equal(h.blocked(target.x,target.y,false),false);
 assert.deepEqual([h.p.x,h.p.y],[snap.p.x,snap.p.y]);assert.equal(h.enemies.find(v=>v.id===e.id).dead,true);assert.equal(h.flags.v9WaterShared,true);
 assert.equal(snap.states.bridge.props.find(p=>p.id==='v9-bridge-water').interactY,525,'original serialized old save remains available');
 const j=game();j.enter('post',800,600);j.states.bridge=snap.states.bridge;j.states.bridge.props.find(p=>p.id==='v9-bridge-water').used=true;
 const off=game();off.restore(savedGame(j));assert.equal(off.states.bridge.props.find(p=>p.id==='v9-bridge-water').interactY,495);assert.equal(off.states.bridge.props.find(p=>p.id==='v9-bridge-water').used,true);
});
test('near water interaction enters its original scene and distant interaction remains rejected',()=>{
 const g=game();g.enter('bridge',1040,495);g.pending=null;g.active=true;
 const target=g.targets().find(p=>p.id==='v9-bridge-water');g.interact(target);assert.equal(g.pending?.id,'v9BridgeWater');
 const h=game();h.enter('bridge',230,600);h.pending=null;h.active=true;h.interact(h.targets().find(p=>p.id==='v9-bridge-water'));assert.equal(h.pending,null);
});
test('chapter 2/3 reactions and defeat poses remain transient across save, restore and map entry',()=>{
 for(const map of ['spillway','hellGate','hellMine']){const g=game();g.enter(map,850,700);g.pending=null;g.active=true;const e=g.enemies[0];g.damage(e,1);assert.ok(reactionV30(e));
  const saved=savedGame(g);g.damage(e,99999);g.damage(e,99999);assert.equal(defeatsV30(g).length,1);
  const h=game();h.restore(structuredClone(saved));assert.equal(reactionV30(h.enemies[0]),null);assert.equal(defeatsV30(h).length,0);assert.equal(h.enemies[0].hp,saved.states[map].enemies[0].hp);
  g.enter('hellCamp',800,600);assert.equal(defeatsV30(g).length,0);
 }
});
test('native hell walk contacts, full strikes and recovery are distinct, with species-specific body weight',()=>{
 assert.deepEqual([0,24,48,72,96,120].map(walkDistance=>hellMonsterFrameV30({type:'hellHound',moving:true,walkDistance})),[1,1,0,2,2,0]);
 assert.equal(hellMonsterFrameV30({attackAnim:.3}),3);assert.equal(hellMonsterFrameV30({attackAnim:.08}),0);assert.equal(hellMonsterFrameV30({wind:.1,attackAnim:.3}),0);
 const a={x:700,y:600,attackAnim:.16,angle:0};assert.ok(motionPoseV30({...a,type:'hellGuard'}).dx<motionPoseV30({...a,type:'wolf'}).dx);
 assert.notEqual(motionPoseV30({...a,type:'hellSoul'},1).dy,motionPoseV30({...a,type:'hellSoul'},2).dy);
});
