// Contract fixtures: verify independent state transitions, not human pacing.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {RPG,MAPS} from '../dist/core-v14.js';
import {C1_OBJECTIVES,c1ObjectiveParts,C1_ACCEPT_TEXT,C1_GIVERS} from '../dist/chapter-one-objectives.js';
import {C1_ELITES} from '../dist/chapter-one-expansion-data.js';
import {c1Journal} from '../dist/chapter-one-expansion-ui.js';
import {C1_STORY_RETURN,C1_LOCAL_TALK} from '../dist/chapter-one-story-world.js';
import {C1_CONNECTIONS} from '../dist/chapter-one-expansion-world.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {mapRoute} from '../dist/navigation-v14.js';
const finish=g=>{for(let i=0;g.pending&&i<80;i++)g.finishScene();g.active=true;};
const game=()=>{const g=new RPG('shadow',null,()=>.44);finish(g);g.chapter=2;g.quests.c1CommissionBrief='done';g.quests.c1Readiness='done';return g;};
const enter=(g,id)=>{g.enter(id,780,850);finish(g);};
const killAll=g=>{for(const e of [...g.enemies])if(!e.dead)g.damage(e,1e4);finish(g);};
const reload=g=>new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));

test('available gold exclamation, waiting gray question, ready gold question; main contact Vilerena is actionable',()=>{
 const g=game();enter(g,'c1TrialCrypt');assert.equal(g.marker('c1hesha'),'!');g.c1Accept('c1CryptRepair');assert.equal(g.marker('c1hesha'),'?');killAll(g);assert.equal(g.marker('c1hesha'),'?');enter(g,'c1DrillGallery');killAll(g);enter(g,'c1TrialCrypt');killAll(g);for(const id of ['c1-crypt-cable','c1-crypt-drain']){const p=g.props.find(p=>p.id===id);g.relocate(p.interactX,p.interactY);assert.ok(g.useProp(id));finish(g);}assert.equal(g.marker('c1hesha'),'gold?');assert.ok(g.npcOptions('c1hesha').some(o=>o.questState==='ready'&&o.action==='c1:claim:c1CryptRepair'));g.choose('c1:claim:c1CryptRepair');finish(g);assert.equal(g.quests.c1CryptRepair,'done');assert.equal(g.marker('c1hesha'),'');
 const h=game();h.chapter=1;h.quests.rats='done';enter(h,'hall');assert.equal(h.objective().target,'sister');assert.equal(h.marker('sister'),'gold?');assert.ok(h.npcOptions('sister').some(o=>o.questState==='advance'&&o.action==='contractAccept'));h.choose('contractAccept');finish(h);assert.equal(h.chapter,2);assert.notEqual(h.marker('sister'),'gold?');
});
test('default main tracking survives side acceptance; explicit side tracking and cancel survive save',()=>{
 const g=game();const main=g.trackedGoal();g.c1Accept('oil');assert.equal(g.trackedGoal().target,main.target);assert.equal(g.trackedGoal().type,'主线任务');g.flags.tracked='oil';assert.equal(g.trackedGoal().type,'主线任务');g.trackQuest('oil');assert.deepEqual(g.trackedGoal(),g.questGoal('oil'));g.c1Accept('c1TrialSalvage');assert.deepEqual(g.trackedGoal(),g.questGoal('oil'));const r=reload(g);assert.deepEqual(r.trackedGoal(),r.questGoal('oil'));r.trackQuest(null);assert.equal(r.trackedGoal().type,'主线任务');
});
test('cross-floor kill counters cannot be substituted; all ordinary source targets are 7–10',()=>{
 for(const [id,o]of Object.entries(C1_OBJECTIVES))for(const p of c1ObjectiveParts(o))if(p.kind==='kill')assert.ok(p.count>=7&&p.count<=10,id+'/'+p.id);
 const g=game();g.c1Accept('c1ExitDrill');enter(g,'c1DrillGallery');killAll(g);assert.equal(g.c1Count('c1ExitDrill','sentries'),8);assert.equal(g.c1Count('c1ExitDrill','cableRats'),0);assert.equal(g.c1Ready('c1ExitDrill'),false);assert.equal(g.questGoal('c1ExitDrill').map,'c1TrialCrypt');enter(g,'c1TrialFoyer');enter(g,'c1DrillGallery');killAll(g);assert.equal(g.c1Count('c1ExitDrill','cableRats'),0);enter(g,'c1TrialCrypt');assert.ok(g.enemies.filter(e=>e.id.startsWith('c1-crypt-')).every(e=>!e.c1Species&&e.label==='啃线鼠'));killAll(g);assert.ok(g.c1Ready('c1ExitDrill'));const r=reload(g);enter(r,'c1DrillGallery');assert.equal(r.enemies.filter(e=>e.id==='c1-trial-warden'&&!e.dead).length,1);assert.ok(r.c1Ready('c1ExitDrill'),'fresh warden does not revoke a recorded defeat');
});
test('materials from each floor remain separate and one death generation receives one roll',()=>{
 const g=game();enter(g,'c1TrialCrypt');killAll(g);g.c1Accept('c1TrialSalvage');assert.equal(g.c1Count('c1TrialSalvage'),0);enter(g,'c1DrillGallery');g.c1Expansion.journey.seed=1;killAll(g);assert.ok(g.c1Count('c1TrialSalvage','rivets')>0);assert.equal(g.c1Count('c1TrialSalvage','wire'),0);const e=g.enemies[0],seed=g.c1Expansion.journey.seed,n=g.c1Count('c1TrialSalvage');g.c1CreditKill(e);assert.equal(g.c1Expansion.journey.seed,seed);assert.equal(g.c1Count('c1TrialSalvage'),n);enter(g,'c1TrialCrypt');killAll(g);assert.ok(g.c1Count('c1TrialSalvage','wire')>0);assert.equal(g.c1Count('c1TrialSalvage','rivets'),n);
});
test('each actual entry repopulates residents irrespective of quests; load, same-map enter and ensureMap do not',()=>{
 for(const status of [undefined,'active','done'])for(const map of ['warehouse','c1DrillGallery','c1TrialCrypt','c1TrialVault','grove','echo','c1ReedKiln']){
  const g=game();g.quests.c1ExitDrill=status;enter(g,map);const before=g.enemies.filter(e=>!e.c1NoReward).map(e=>e.id).sort();killAll(g);const gold=g.p.gold,r=reload(g);assert.ok(r.enemies.every(e=>e.dead),map+' load');r.ensureMap(map);r.enter(map);assert.ok(r.enemies.every(e=>e.dead),map+' same');assert.equal(r.p.gold,gold);enter(r,'hall');enter(r,map);assert.deepEqual(r.enemies.filter(e=>!e.c1NoReward).map(e=>e.id).sort(),before,map);assert.ok(r.enemies.every(e=>!e.dead),map+' fresh');assert.equal(new Set(r.enemies.map(e=>e.id)).size,r.enemies.length);for(const e of r.enemies)assert.ok(Number.isFinite(e.hp)&&e.hp>0);
 }
});
test('elite reentry advances payout generation but sample and quest report are one-time',()=>{
 const g=game();g.quests.c1AlchemistSamples='active';enter(g,'grove');const id='c1-elite-rat';g.damage(g.enemies.find(e=>e.id===id),1e4);const samples=structuredClone(g.c1Expansion.samples);assert.ok(samples.c1PartJaw);enter(g,'hall');enter(g,'grove');const e=g.enemies.find(e=>e.id===id);assert.equal(e.c1Generation,2);assert.equal(g.enemies.filter(e=>e.elite).length,1);const before=g.p.gold;g.damage(e,1e4);assert.equal(g.p.gold,before+12);assert.equal(g.c1Expansion.elite[id].killSequence,2);assert.deepEqual(g.c1Expansion.samples,samples);g.c1EliteKill(e);assert.equal(g.p.gold,before+12);assert.deepEqual(reload(g).c1Expansion.elite,g.c1Expansion.elite);
});
test('two herb sources cannot be replaced with four leaves from one source',()=>{
 const g=game();g.quests.c1ExitDrill='done';g.c1Accept('c1CampHerbs');for(const map of ['grove','road']){enter(g,map);for(const t of [...g.targets()].filter(t=>t.id.startsWith('c1-herb-'))){g.relocate(t.x,t.y);g.useProp(t.id);}assert.equal(g.c1Count('c1CampHerbs',map==='grove'?'groveLeaves':'roadLeaves'),2);assert.equal(g.c1Ready('c1CampHerbs'),map==='road');}assert.ok(reload(g).c1Ready('c1CampHerbs'));
});
test('0.8 complete/partial objectives migrate without payments, lost credit or reviving dead enemies',()=>{
 for(const [id,n,ready]of [['c1ExitDrill',8,true],['c1ExitDrill',3,false],['c1TrialSalvage',5,true],['c1CampHerbs',4,true]]){
  const g=game();g.quests[id]='active';enter(g,'c1DrillGallery');killAll(g);const s=structuredClone(g.snapshot());s.c1Expansion.schema=3;s.c1Expansion.journey.revision=8;delete s.c1Expansion.journey.parts;s.c1Expansion.journey.counts[id]=n;const r=new RPG('shadow',parseSave(JSON.stringify(s)));assert.equal(r.c1Expansion.schema,5);assert.equal(r.c1Ready(id),ready,id);assert.equal(r.p.gold,s.p.gold);assert.ok(r.enemies.every(e=>e.dead));assert.deepEqual(r.c1Expansion.claimLedger,s.c1Expansion.claimLedger);if(n===3)assert.equal(r.c1Count(id,'sentries'),3);assert.doesNotThrow(()=>reload(r));
 }
 const g=game();g.c1Accept('c1ExitDrill');const s=g.snapshot();s.c1Expansion.journey.parts.c1ExitDrill={sentries:9};assert.throws(()=>parseSave(JSON.stringify(s)));s.c1Expansion.journey.parts.c1ExitDrill={unknown:1};assert.throws(()=>parseSave(JSON.stringify(s)));
});
test('new cross-links are reciprocal and locked branches cannot shortcut main access; denials are diegetic',()=>{
 const g=game();for(const [a,b]of C1_CONNECTIONS)assert.ok(MAPS[a].doors.some(d=>d.to===b)&&MAPS[b].doors.some(d=>d.to===a),a+' '+b);
 const pairs=[['c1DrillGallery','c1TrialCrypt'],['c1TrialCrypt','c1TrainingYard'],['c1TrialVault','c1DrillGallery'],['c1RiversideCamp','millpath'],['c1ReedKiln','c1NorthWalk']];for(const [a,b]of pairs)assert.ok(C1_CONNECTIONS.some(([x,y])=>x===a&&y===b));
 enter(g,'c1ReedKiln');assert.ok(g.canDoor(MAPS[g.map].doors.find(d=>d.to==='c1NorthWalk')));assert.deepEqual(mapRoute(g,'town'),[]);g.quests.c1ExitDrill='done';g.quests.v12CourierRoad='done';g.c1Expansion.worldChanges.morning=true;assert.ok(mapRoute(g,'town').length);assert.ok(!mapRoute(g,'town').some(d=>d.to==='c1NorthWalk'));g.quests.v12NorthDelivery='done';assert.equal(g.canDoor(MAPS[g.map].doors.find(d=>d.to==='c1NorthWalk')),null);
 for(const chapter of [0,1,2,3,4]){g.chapter=chapter;for(const id of ['hall','road','town','c1TrialCrypt','c1NorthWalk','c1ReedKiln']){g.map=id;g.ensureMap(id);for(const d of MAPS[id].doors){const why=g.canDoor(d)||'';assert.doesNotMatch(why,/完成|击杀|击败.*后|交付.*才能|入场前/);}}}
});
test('all first-chapter task-facing text omits drop percentages and fixed wait countdowns',()=>{
 const g=game();for(const [id,giver]of Object.entries(C1_GIVERS)){g.quests[id]='active';g.c1Expansion.questSteps[id]||={};const goal=g.questGoal(id);assert.doesNotMatch(goal?.text||'',/\d+(?:\.\d+)?%|七成|45秒|180秒/,id);}
 for(const text of [...Object.values(C1_ACCEPT_TEXT),...Object.values(C1_STORY_RETURN),...Object.values(C1_LOCAL_TALK),c1Journal(g)])assert.doesNotMatch(text,/\d+(?:\.\d+)?%|七成|45秒|180秒/);
 const board=MAPS.warehouse.props.find(p=>p.id==='crack');assert.ok(board.c1WallPatch);assert.ok(board.y<=190);assert.ok(board.interactY>=220);assert.equal(board.c1Art,undefined);for(const p of ['dist/assets/c1-layer-rules/wall-patch.png','dist/assets/c1-layer-rules/quest-marks.png'])assert.ok(fs.statSync(p).size>10000);
});

test('story captain stays defeated while resident patrols return, and delivered escape stays delivered',()=>{const g=game();g.chapter=3;enter(g,'canal');g.choose('c1:accept:c1CanalBreak');finish(g);if(!g.flags.captainStarted)g.apply('captain');finish(g);killAll(g);assert.equal(g.chapter,4);assert.ok(g.c1Ready('c1CanalBreak'));g.c1Claim('c1CanalBreak');const ledger=structuredClone(g.c1Expansion.claimLedger),gold=g.p.gold;enter(g,'alley');enter(g,'canal');assert.ok(g.enemies.some(e=>!e.dead&&e.id!=='captain'));assert.ok(!g.enemies.some(e=>e.id==='captain'&&!e.dead));assert.equal(g.quests.c1CanalBreak,'done');assert.deepEqual(g.c1Expansion.claimLedger,ledger);assert.equal(g.p.gold,gold);});
