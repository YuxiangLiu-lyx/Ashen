import test from 'node:test';
import assert from 'node:assert/strict';
import {RPG} from '../dist/core-v14.js';
import {parseSave} from '../dist/save-transfer-v14.js';
const snapshot=g=>JSON.parse(JSON.stringify(g.snapshot()));
test('chapter-two completion pays once through the backstage scene, retries and reloads',()=>{
 for(const cls of ['shadow','oath','ember']){
  const g=new RPG(cls,null,()=>.44);g.chapter=11;g.enter('exile',1200,850);g.pending=null;g.quests.exile='active';
  const before=g.p.gold;g.apply('ch2_end');assert.equal(g.pending.id,'darkExileV9');assert.equal(g.p.gold,before);
  g.finishScene();assert.equal(g.chapter,12);assert.equal(g.map,'hellGate');assert.equal(g.p.gold,before+35);assert.ok(g.pending?.id==='ch3Arrival'||g.ch3.experienceScenes?.includes('ch3Arrival'),'arrival either starts safely or is durably queued by C3');
  const committed=snapshot(g);g.apply('ch2_end');assert.deepEqual(snapshot(g),committed,'duplicate completion must not grant XP, gold or mutate pending');
  const r=new RPG(cls,parseSave(JSON.stringify(committed)),()=>.44),saved=snapshot(r);r.apply('ch2_end');assert.deepEqual(snapshot(r),saved,'reload keeps one-time completion');
 }
});
test('stale chapter-two completion cannot reward early or overwrite a later chapter',()=>{
 for(const stage of [5,10,12,21,25]){
  const g=new RPG('shadow',null,()=>.44);g.chapter=stage;g.flags.darkExileV9=true;g.events=[];
  const before=snapshot(g);g.apply('ch2_end');assert.deepEqual(snapshot(g),before,'stage '+stage);
 }
});
