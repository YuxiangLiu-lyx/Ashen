import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {RPG,MAPS,stats} from '../dist/core-v14.js';
import {createStoryChapterTestV26} from '../dist/story-test-v26.js';
import {freshSagaV26} from '../dist/saga-state-v26.js';
import {SAGA_NODES_V25,SAGA_TASKS_V25} from '../dist/saga-nodes-v25.js';import {DIALOGUES} from '../dist/data-v14.js';
import {DIALOGUE_COPYEDITS} from '../dist/dialogue-copyedits-data.js';
import {migrateDialogueSaveV26,createDialogueSaveMigratorV26} from '../dist/dialogue-save-migration-v26.js';
import {combatTarget,combatTargetName} from '../dist/combat-target-ui.js';
import {C1_ELITES} from '../dist/chapter-one-expansion-data.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {dialogueCorpus} from '../tools/harness/dialogue_corpus.mjs';
const trial=JSON.parse(fs.readFileSync(new URL('../docs/c1-trial-forge/SCRIPT.json',import.meta.url))).scenes;
const baseline=JSON.parse(fs.readFileSync(new URL('../docs/dialogue-hud/baseline/full-corpus.json',import.meta.url))).scenes;
const clone=x=>structuredClone(x),finish=g=>{for(let n=0;g.pending&&n<20;n++)g.finishScene();};
test('all static/dynamic providers are covered; only exact authored whole-scene revisions change',()=>{
 const corpus=dialogueCorpus();assert.deepEqual(corpus,JSON.parse(fs.readFileSync(new URL('../docs/c1-trial-forge/CURRENT_CORPUS.json',import.meta.url))),'saved corpus must equal live installed providers');const now=corpus.scenes;assert.deepEqual(Object.keys(now).sort(),[...new Set([...Object.keys(baseline),...Object.keys(trial)])].sort());
 for(const[id,b]of Object.entries(baseline)){
  const e=DIALOGUE_COPYEDITS.find(e=>e.key===id)||DIALOGUE_COPYEDITS.find(e=>JSON.stringify(e.before)===JSON.stringify(b.text));
  if(e){assert.deepEqual(e.before,b.text,id);assert.deepEqual(e.after.map(r=>r[0]),b.text.map(r=>r[0]),id);}
  assert.deepEqual(now[id].text,trial[id]||e?.after||b.text,id);
 }
});
test('every edited pending page preserves cursor, callback and nested history; immutable input and idempotent migration',()=>{
 for(const e of DIALOGUE_COPYEDITS)for(let line=0;line<e.before.length;line++){
  const leaf={pending:{id:e.id,line,then:'keep-callback',phase:'dialogue',lines:clone(e.before)}};
  const saved={...clone(leaf),beforeDeparture:clone(leaf),memoryV13:{reality:clone(leaf)}};const original=clone(saved),next=migrateDialogueSaveV26(saved);
  for(const p of [next.pending,next.beforeDeparture.pending,next.memoryV13.reality.pending]){assert.deepEqual(p.lines,e.after,e.key);assert.equal(p.line,line);assert.equal(p.then,'keep-callback');}
  assert.deepEqual(saved,original);assert.deepEqual(migrateDialogueSaveV26(next),next);
 }
 const e=DIALOGUE_COPYEDITS.find(e=>e.id==='v25C8Table');const guard=createDialogueSaveMigratorV26([e]);assert.throws(()=>guard({pending:{id:e.id,lines:[['澄璃','伪造全文']]}}));
});
test('public save import accepts current and previous full texts in ordinary chapter-one dialogue',()=>{
 for(const e of DIALOGUE_COPYEDITS.filter(e=>e.static&&e.key.startsWith('c1Talk_'))){const g=new RPG('shadow');g.chapter=2;g.beginScene(e.id);g.pending.lines=clone(e.before);g.pending.line=e.before.length-1;const restored=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));assert.deepEqual(restored.pending.lines,e.after);assert.equal(restored.pending.line,e.before.length-1);}
});
test('selected ordinary enemy takes priority; dead, distant, stale-map and disengaged targets clear without changing combat state',()=>{
 const rat={id:'rat',type:'rat',x:50,y:0,hp:10,maxHP:20},boss={id:'boss',type:'captain',x:100,y:0,hp:80,maxHP:100,aiState:'COMBAT'};
 const g={p:{x:0,y:0},enemies:[rat,boss],target:'rat',time:10};const before=clone(g);assert.equal(combatTarget(g),rat);assert.deepEqual(g,before);assert.equal(combatTargetName(rat),'灰鼠');
 g.target=null;assert.equal(combatTarget(g),boss);rat.aiState='COMBAT';assert.equal(combatTarget(g,boss),boss);boss.dead=true;assert.equal(combatTarget(g,boss),rat);rat.x=900;assert.equal(combatTarget(g,rat),null);g.enemies=[];assert.equal(combatTarget(g,rat),null);
});
test('all three elite samples require accepted quest; pre-accept kills do not spend eligibility; accepted reentry and saves complete once',()=>{
 for(const[id,c]of Object.entries(C1_ELITES).filter(([,c])=>c.part)){
  const g=new RPG('shadow',null,()=>.44);g.chapter=2;g.enter(c.map,600,560);g.pending=null;const gold=g.p.gold;g.damage(g.enemies.find(e=>e.id===id),1e7);
  assert.equal(g.p.gold,gold+12);assert.ok(!g.c1Expansion.samples[c.part]);assert.ok(!g.c1Expansion.elite[id].firstPartGranted);
  g.quests.c1AlchemistSamples='active';g.enter('hall');g.enter(c.map);g.pending=null;g.damage(g.enemies.find(e=>e.id===id),1e7);assert.equal(g.c1Expansion.samples[c.part],true);
  const r=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));assert.equal(r.c1Expansion.samples[c.part],true);r.quests.c1AlchemistSamples='done';r.c1Expansion.samples[c.part]=false;r.enter('hall');r.enter(c.map);r.pending=null;r.damage(r.enemies.find(e=>e.id===id),1e7);assert.equal(r.c1Expansion.samples[c.part],false);
 }
});
test('pump pole interaction and delayed callback cannot grant before acceptance; accepts, collects and survives reload; old owned pole retained',()=>{
 const g=new RPG('shadow');g.chapter=7;g.enter('bridge',600,560);g.pending=null;const p=g.props.find(p=>p.id==='bridge-tools');assert.ok(p);g.useProp(p.id,true);assert.equal(g.p.items.pumpPole||0,0);assert.ok(!p.used);g.apply('pump_take');assert.ok(!g.flags.pumpTool);
 g.apply('pump_accept');g.useProp(p.id,true);assert.equal(g.pending?.id,'selinePoleFound');finish(g);assert.equal(g.p.items.pumpPole,1);assert.ok(p.used);
 const old=g.snapshot();delete old.quests.pump;const r=new RPG('shadow',parseSave(JSON.stringify(old)));assert.equal(r.p.items.pumpPole,1);assert.ok(r.flags.pumpTool);
});
test('chapter two/four quest drops require accepted unfinished tasks, survive import and stop after claim/expiry',()=>{
 for(const [qid,map,type,item,chapter,flag]of [['v12CartBuckles','bridge','wolf','v12HarnessBuckle',7,null],['v12ForgeRivets','deepCourt','deepGuard','v12ForgeJaw',16,'ch4EnchantUnlocked']]){
  const g=new RPG('shadow');g.chapter=chapter;if(flag)g.flags[flag]=true;g.enter(map);g.pending=null;let serial=0;
  const kill=()=>{g.pending=null;const e=g.enemy(type,800,700,'drop-check-'+serial++);g.enemies.push(e);g.damage(e,1e7);};
  for(let i=0;i<6;i++)kill();assert.equal(g.p.items[item]||0,0,qid+' before');
  g.apply('v12q:accept:'+qid);assert.equal(g.quests[qid],'active');for(let i=0;i<6;i++)kill();const count=g.p.items[item];assert.ok(count>0,qid+' after');
  const r=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));assert.equal(r.p.items[item],count);g.claimPacing(qid);assert.equal(g.p.items[item],0);for(let i=0;i<6;i++)kill();assert.equal(g.p.items[item],0,qid+' claimed');
  if(chapter===7){r.chapter=8;for(let i=0;i<4;i++){const e=r.enemy(type,800,700,'expired-'+i);r.enemies.push(e);r.damage(e,1e7);}assert.equal(r.p.items[item],count,'expired no new drops');}
 }
});
test('chapter three medicine and repair props stay available until actual task acceptance',()=>{
 for(const [map,action,item,quest]of [['hellGrotto','ch3-salt-moss','saltMoss',null],['hellMine','ch3-black-brine','milkCrystal',null],['hellMine','ch3-spring','copperSpring','ch3Machine'],['hellFerry','ch3-wick','wickFrame','ch3Ferry']]){
  const g=new RPG('shadow');g.chapter=12;g.enter(map);g.pending=null;g.ch3.stage='doctor';g.enemies.splice(0);g.active=true;const p=g.props.find(p=>p.action===action);assert.ok(p,action);g.relocate(p.interactX??p.x,p.interactY??p.y);g.useProp(p.id,true);assert.ok(!g.pending);assert.equal(g.p.items[item]||0,0);assert.ok(!p.used);
  if(quest)g.quests[quest]='active';else g.ch3.stage='medicine';g.useProp(p.id,true);assert.ok(g.pending,action);finish(g);assert.equal(g.p.items[item],1);g.useProp(p.id,true);finish(g);assert.equal(g.p.items[item],1,'claim once');assert.equal(new RPG('shadow',parseSave(JSON.stringify(g.snapshot()))).p.items[item],1);
 }
});
test('chapter five named pages drop only between accepting and claiming; ordinary crafting loot remains',()=>{
 const g=new RPG('shadow',null,()=>.1);g.chapter=21;g.flags.ch5CitySeen=true;g.enter('ch5Training');g.pending=null;let serial=0;
 const kill=()=>{g.pending=null;const e=g.enemy('deepGuard',800,700,'names-check-'+serial++);g.enemies.push(e);g.damage(e,1e7);};
 for(let i=0;i<20;i++)kill();assert.equal(g.p.items.ch5CourierPage||0,0);assert.ok(g.p.items.ch5GoldSand>0);
 g.apply('v14ch5:accept:ch5Names');assert.equal(g.quests.ch5Names,'active');for(let i=0;i<20;i++)kill();assert.equal(g.p.items.ch5CourierPage,4);
 const r=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));assert.equal(r.p.items.ch5CourierPage,4);g.ch5.quests.ch5Names.claimed=true;g.p.items.ch5CourierPage=0;for(let i=0;i<20;i++)kill();assert.equal(g.p.items.ch5CourierPage,0);
});
test('legacy base storyline checkpoints accept previous full text at real scene tokens and resume original callbacks',()=>{
 let g=createStoryChapterTestV26(RPG,stats,6,'shadow');g._sagaTestFastForwardV26=true;const visited=new Set();let guard=0;
 while(g.sagaV25.phase!=='finished'&&guard++<500){
  if(g.pending){const e=DIALOGUE_COPYEDITS.find(e=>e.static&&e.id===g.pending.id);if(e){g.sagaV26=freshSagaV26(g.sagaV25);g.pending.lines=clone(e.before);g.pending.line=e.before.length-1;const old=g.snapshot(),r=new RPG('shadow',parseSave(JSON.stringify(old)));assert.deepEqual(r.pending.lines,e.after,e.id);assert.equal(r.pending.line,old.pending.line);assert.equal(r.pending.then,old.pending.then);assert.deepEqual(r.sagaV25,JSON.parse(JSON.stringify(old.sagaV25)));g=r;g._sagaTestFastForwardV26=true;visited.add(e.id);}g.finishScene();g.events=[];continue;}
  const s=g.sagaV25,n=SAGA_NODES_V25[s.stage];
  if(s.phase==='awaiting'){if(g.map!==n.map)g.enter(n.map,...MAPS[n.map].entry);g.active=true;g.update(.02,{});continue;}
  const t=SAGA_TASKS_V25[s.task?.id];assert.ok(t);if(g.map!==t.map)g.enter(t.map,...MAPS[t.map].entry);g.active=true;
  if(t.kind==='duel'){g.hurt(100000);continue;}
  if(t.kind==='escape'){g.relocate(t.escapeAt[0],t.escapeAt[1]);g.update(.02,{});continue;}
  for(const id of t.enemyIds||[]){const e=g.enemies.find(e=>e.id===id);if(e&&!e.dead)g.damage(e,1e7,'enchant');}
  for(const id of t.propIds||[]){if(g.sagaV25.task?.id!==t.id)break;const p=g.props.find(p=>p.id===id);assert.ok(p);const at={x:p.interactX??p.x,y:p.interactY??p.y};let positioned=false;for(const r of [0,60,80,100])for(let i=0;i<(r?16:1);i++){const x=at.x+Math.cos(i*Math.PI/8)*r,y=at.y+Math.sin(i*Math.PI/8)*r;if(!g.blocked(x,y)&&g.clearLine({x,y},at,false)){g.relocate(x,y);positioned=true;break;}if(positioned)break;}assert.ok(positioned);assert.ok(g.useProp(id));}
  g.events=[];
 }
 assert.ok(guard<500);for(const id of ['c6v25Disguise','c7v25MarthaFarewell','v25C8Lodging','v25C8Table','v25C8After','v25C8Farewell'])assert.ok(visited.has(id),id);
});
