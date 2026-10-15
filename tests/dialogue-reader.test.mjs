import {copyedited} from './fixtures/dialogue-copyedit-contract.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RPG} from '../dist/core-v14.js';
import {DIALOGUES} from '../dist/data-v14.js';
import {ChapterOneStoryFlow,C1_HIDDEN} from '../dist/chapter-one-dialogues-v31.js';
import {DialogueReader} from '../dist/dialogue-reader.js';
import {C1_CARE_CURSOR_MAP} from '../dist/chapter-one-care-save.js';
import {parseSave} from '../dist/save-transfer-v14.js';
const baseline=JSON.parse(fs.readFileSync(new URL('../docs/c1-care-ui/baseline/runtime.json',import.meta.url)));
const script=JSON.parse(fs.readFileSync(new URL('../docs/c1-care-ui/SCRIPT.json',import.meta.url))).scenes;
const resume=g=>new RPG(g.p.cls,parseSave(JSON.stringify(g.snapshot())),()=>.44);
function scene(id,then=null,cls='shadow'){const g=new RPG(cls,null,()=>.44);g.chapter=id==='contract'?1:2;g.c1Expansion.preparation.legacy=true;g.beginScene(id,then);g.events=[];const f=new ChapterOneStoryFlow(g,DIALOGUES[id]);while(f.phase==='action')f.update(30);return {g,f,r:new DialogueReader(f)};}
function advanceTo(f,r,index){for(let i=0;f.index<index&&i<200;i++){if(f.phase==='action')f.update(30);else r.next();}while(f.phase==='action')f.update(30);assert.equal(f.index,index);}
test('read every previously reached commission page without changing pending, actors, knowledge or rewards',()=>{
 for(const cls of ['shadow','oath','ember']){
  const {g,f,r}=scene('contract','contractAccept',cls);advanceTo(f,r,DIALOGUES.contract.length-1);
  const saved=structuredClone(g.snapshot()),actors=structuredClone(f.cine.actors),revision=f.revision;
  for(let i=DIALOGUES.contract.length-2;i>=0;i--){assert.equal(r.previous(),true);assert.deepEqual(r.current,DIALOGUES.contract[i]);assert.deepEqual(g.snapshot(),saved);}
  assert.equal(r.previous(),false);
  for(let i=1;i<DIALOGUES.contract.length;i++){assert.equal(r.next(),true);assert.deepEqual(r.current,DIALOGUES.contract[i]);assert.deepEqual(g.snapshot(),saved);}
  assert.equal(r.reviewing,false);assert.equal(f.revision,revision);assert.deepEqual(f.cine.actors,actors);
  const restored=resume(g);assert.equal(restored.pending.line,DIALOGUES.contract.length-1);
  r.next();while(f.phase==='action')f.update(30);assert.ok(f.finished);assert.equal(g.chapter,2);assert.equal(g.flags.c1PrivateTalk,'awaitingExit');
  const paid=structuredClone(g.snapshot());assert.equal(r.next(),false);assert.equal(r.previous(),false);assert.deepEqual(g.snapshot(),paid);
 }
});
test('action phases cannot be advanced or rewound by reading controls',()=>{
 const g=new RPG('shadow');g.beginScene('contract','contractAccept');const f=new ChapterOneStoryFlow(g,DIALOGUES.contract),r=new DialogueReader(f);assert.equal(f.phase,'action');const saved=structuredClone(g.snapshot());assert.equal(r.previous(),false);assert.equal(r.next(),false);assert.equal(r.current,null);assert.deepEqual(g.snapshot(),saved);
});
test('quest accept and reward wait for live final page; going backward and forward never commits',()=>{
 for(const kind of ['offer','report']){
  const g=new RPG('shadow');g.chapter=2;g.quests.rats='done';if(kind==='report'){g.quests.oil='active';g.c1Expansion.journey.counts.oil=5;g.p.items.oil=5;}
  g.choose('c1:'+(kind==='offer'?'accept':'claim')+':oil');assert.equal(g.pending.id,'c1Talk_oil_'+kind);
  const f=new ChapterOneStoryFlow(g,DIALOGUES[g.pending.id]),r=new DialogueReader(f);advanceTo(f,r,f.lines.length-1);const before=structuredClone(g.snapshot());
  r.previous();r.next();assert.deepEqual(g.snapshot(),before);assert.equal(resume(g).pending.line,f.index);
  r.next();assert.equal(g.quests.oil,kind==='offer'?'active':'done');const once=structuredClone(g.snapshot());r.next();r.previous();assert.deepEqual(g.snapshot(),once);
 }
});
test('legacy private tail has its own read-back rows and never exposes the earlier commission',()=>{
 const g=new RPG('shadow');g.chapter=1;g.pending={id:'contract',then:'contractAccept',line:24,phase:'dialogue',closing:true,c1Tail:{id:'c1HiddenPairArrangement',line:6,revision:3}};
 const f=new ChapterOneStoryFlow(g,DIALOGUES.contract),r=new DialogueReader(f),before=structuredClone(g.snapshot());
 for(let i=5;i>=0;i--){assert.ok(r.previous());assert.deepEqual(r.current,C1_HIDDEN.c1HiddenPairArrangement[i]);}assert.equal(r.previous(),false);assert.deepEqual(g.snapshot(),before);
 for(let i=1;i<=6;i++)assert.ok(r.next());assert.deepEqual(g.snapshot(),before);assert.equal(r.reviewing,false);
});
test('all 45 old static positions migrate once by meaning, including direct/imported/nested saves',()=>{
 let positions=0;
 for(const [id,map]of Object.entries(C1_CARE_CURSOR_MAP))for(let line=0;line<map.length;line++){
  const g=new RPG('shadow');g.chapter=2;g.pending={id,line,phase:'dialogue',then:null};const old=g.snapshot();old.c1Expansion.schema=5;delete old.c1Expansion.preparation;const original=JSON.stringify(old);
  const direct=new RPG('shadow',old),imported=new RPG('shadow',parseSave(JSON.stringify(old)));assert.equal(direct.pending.line,map[line]);assert.equal(imported.pending.line,map[line]);assert.equal(resume(direct).pending.line,map[line]);assert.equal(JSON.stringify(old),original);
  const nested=structuredClone(old);nested.chapter=4;nested.pending=null;nested.beforeDeparture=structuredClone(old);nested.beforeDeparture.chapter=4;assert.equal(parseSave(JSON.stringify(nested)).beforeDeparture.pending.line,map[line]);positions++;
 }
 assert.equal(positions,45);
});
test('exact inline old dialogue text and new authored cursors survive import unchanged',()=>{
 for(const id of Object.keys(C1_CARE_CURSOR_MAP)){
  const g=new RPG('shadow');g.chapter=2;const rows=baseline.scenes[id].text;g.pending={id,lines:structuredClone(rows),line:rows.length-1,phase:'dialogue',then:null};const r=resume(g);assert.deepEqual(r.pending.lines,rows);assert.equal(r.pending.line,rows.length-1);
  for(let line=0;line<DIALOGUES[id].length;line++){g.beginScene(id);g.pending.line=line;g.pending.phase='dialogue';assert.equal(resume(g).pending.line,line);}
 }
});
test('four care scenes plus explicit copyedits match adopted drafts; protected commission facts/staging rows remain exact',()=>{
 for(const [id,old]of Object.entries(baseline.scenes))assert.deepEqual(DIALOGUES[id]||C1_HIDDEN[id],copyedited(id,script[id]||old.text),id);
 assert.deepEqual(DIALOGUES.contract.slice(1,15),copyedited('contract',script.contract).slice(1,15));
});
