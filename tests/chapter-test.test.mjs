import test from 'node:test';
import assert from 'node:assert/strict';
import {RPG,stats,MAPS} from '../dist/core-v14.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {enableStoryTestV25,isStoryTestV25,STORY_TEST_CHAPTERS,STORY_TEST_SAVE_V25,storyTestChapterSaveKeyV26,isStoryTestSaveKeyV26,storyTestSaveTextV25,parseStoryTestSaveV25} from '../dist/story-test-v25.js';
import {createStoryChapterTestV31,skipStoryTestStepV31} from '../dist/story-test-v31.js';
import {storyChapterV17} from '../dist/presentation-v17.js';
const classes=['shadow','oath','ember'];
const restore=g=>new RPG(g.p.cls,parseSave(JSON.stringify(g.snapshot())));

test('24 chapter/class starts keep chapter, class, position, pending dialogue and isolated slot through validated saves',()=>{
 const expected=['hall','post','hellGate','deepGate','ch5AshRoad','ch5Exit','ch7Camp','ch8FlightRavine'];
 for(const chapter of STORY_TEST_CHAPTERS)for(const cls of classes){
  const g=createStoryChapterTestV31(RPG,stats,chapter,cls),s=g.snapshot(),r=restore(g);
  assert.equal(g.map,expected[chapter-1]);if(chapter===2){assert.equal(g.chapter,5);assert.equal(g.pending.id,'ch2Arrival');}assert.equal(storyChapterV17(r),chapter);
  assert.equal(r.p.cls,cls);assert.deepEqual(r.pending,parseSave(JSON.stringify(s)).pending);assert.equal(r.map,g.map);
  assert.equal(g.storyTestSaveKeyV26,storyTestChapterSaveKeyV26(chapter));
  assert.ok(!g.blocked(g.p.x,g.p.y),`${chapter}/${cls} spawn`);assert.ok(isStoryTestV25(g));
  assert.equal(isStoryTestV25(r),false,'save cannot enable test capability');
 }
 assert.equal(new Set(STORY_TEST_CHAPTERS.map(storyTestChapterSaveKeyV26)).size,8);
 for(const bad of [0,9,-1,1.5,NaN])assert.equal(storyTestChapterSaveKeyV26(bad),null);
 assert.ok(isStoryTestSaveKeyV26(STORY_TEST_SAVE_V25));
});

test('all three classes skip from chapter one through eight with every intermediate save validated',()=>{
 for(const cls of classes){
  let g=createStoryChapterTestV31(RPG,stats,1,cls);const visited=new Set(),actors=new Set();let steps=0;
  while(g.sagaV25?.phase!=='finished'&&steps<200){
   visited.add(storyChapterV17(g));actors.add(g.p.cls);
   const old=JSON.stringify(g.snapshot());
   g=skipStoryTestStepV31(RPG,stats,g);restore(g);steps++;
   assert.notEqual(JSON.stringify(g.snapshot()),old);
  }
  assert.equal(g.sagaV25.phase,'finished',cls);assert.deepEqual([...visited],[1,2,3,4,5,6,7,8]);
  assert.ok(actors.has('saint'));assert.equal(g.p.cls,cls);
  for(const flag of ['chapterOneComplete','chapterTwoComplete','ch3Unsealed','ch3TreatmentApplied','ch3HeroRecovered','ch3Complete','v12WatchHoursDone','v12CleanBottlesDone','ch4V13MemoryComplete','ch4Complete','ch5CityUnlocked','ch5BossDefeated','ch5Complete'])assert.equal(g.flags[flag],true,flag);
  assert.equal(g.flags.ch4V13SaintTruthKnown,false);assert.equal(g.flags.c1Viewed.c1HiddenPairArrangement,true);assert.equal(g.flags.c1Viewed.c1HiddenSealEcho,undefined);
  assert.ok(g.knowledge.player.includes('trio-betrayal-memory'));
  const before=JSON.stringify(g.snapshot());assert.throws(()=>skipStoryTestStepV31(RPG,stats,g),/已完成/);assert.equal(JSON.stringify(g.snapshot()),before);
 }
});

test('each later chapter start can skip to the final result without stuck quests',()=>{
 for(const chapter of [2,3,4,5,6,7,8]){
  let g=createStoryChapterTestV31(RPG,stats,chapter);let steps=0;
  while(g.sagaV25?.phase!=='finished'&&steps++<180)g=skipStoryTestStepV31(RPG,stats,g);
  assert.equal(g.sagaV25.phase,'finished',String(chapter));restore(g);
 }
});

test('normal sessions reject skip; test export is rejected by normal import; normal save stays unchanged',()=>{
 const normal=new RPG('oath');const raw=JSON.stringify(normal.snapshot());
 assert.throws(()=>skipStoryTestStepV31(RPG,stats,normal),/测试模式/);
 const copy=enableStoryTestV25(new RPG('oath',parseSave(raw)),stats);
 const skipped=skipStoryTestStepV31(RPG,stats,copy);
 assert.equal(JSON.stringify(normal.snapshot()),raw);assert.equal(copy.chapter,0);assert.equal(skipped.chapter,1);
 const text=storyTestSaveTextV25(skipped);assert.throws(()=>parseStoryTestSaveV25(text,parseSave,false),/测试存档/);
 const restored=parseStoryTestSaveV25(text,parseSave,true);assert.equal(restored.chapter,1);
 assert.equal(isStoryTestV25(new RPG('oath',restored)),false);
});

test('test damage kills normal and boss enemies once; normal damage and invalid hits retain original behavior',()=>{
 for(const type of ['rat','wolf','captain','ironScuttler','hellJailer','odric'])for(const kind of ['hit','skill','ch3skill','dot','mercenary']){
  const normal=new RPG(),g=enableStoryTestV25(new RPG(),stats);
  const a=normal.enemy(type,850,750,'normal-'+type),b=g.enemy(type,850,750,'test-'+type);
  normal.enemies.push(a);g.enemies.push(b);
  normal.damage(a,1,kind);assert.ok(!a.dead,`${type}/${kind} normal`);
  for(const n of [0,-1,NaN,Infinity])g.damage(b,n,kind);assert.ok(!b.dead);
  g.damage(b,1,kind);assert.equal(b.dead,true,`${type}/${kind}`);
  const reward=[g.p.gold,g.p.xp,g.p.level,g.p.bag.length];g.damage(b,1,kind);assert.deepEqual([g.p.gold,g.p.xp,g.p.level,g.p.bag.length],reward);
 }
});

test('immune hero/saint, mana costs, and scripted fifth-chapter setback remain intact',()=>{
 for(const cls of classes){const g=enableStoryTestV25(new RPG(cls),stats);g.active=true;g.p.invuln=0;
  const hp=g.p.hp;g.hurt(100000);assert.equal(g.p.hp,hp);assert.ok(!g.events.some(e=>e.type==='death'));
  const normal=new RPG(cls);normal.active=true;normal.p.invuln=0;normal.hurt(10);assert.ok(normal.p.hp<stats(normal.p).hp);
 }
 let g=createStoryChapterTestV31(RPG,stats,3);
 while(g.p.cls!=='saint')g=skipStoryTestStepV31(RPG,stats,g);
 g.active=true;g.p.invuln=0;const hp=g.p.hp;g.hurt(100000);assert.equal(g.p.hp,hp);
 const e=g.enemy('hellSoul',g.p.x+30,g.p.y,'saint-target');g.enemies.push(e);g.damage(e,1,'ch3skill');assert.ok(e.dead);
 g=createStoryChapterTestV31(RPG,stats,5);
 while(!g.flags.ch5MentorDone)g=skipStoryTestStepV31(RPG,stats,g);
 const before=g.p.hp;g=skipStoryTestStepV31(RPG,stats,g);
 assert.equal(g.flags.ch5CityUnlocked,true);assert.ok(!g.flags.ch5BossDefeated);assert.ok(g.p.hp>=before);restore(g);
});

test('real melee and projectile attacks kill only after hitting; no-weapon and mana gates still work',()=>{
 for(const cls of classes){
  const g=enableStoryTestV25(new RPG(cls),stats);g.enter('road',800,750);g.pending=null;g.active=true;g.states.road.enemies=[];
  const e=g.enemy('wolf',g.p.x+50,g.p.y,'actual-target');g.enemies.push(e);g.target=e.id;
  assert.ok(g.clearLine(g.p,e));g.attack();
  for(let i=0;i<60&&!e.dead;i++)g.update(.02,{});
  assert.ok(e.dead,cls+' attack');
  g.p.mp=0;g.p.cd.q=0;assert.equal(g.skill('q'),false);
  g.p.gear.weapon=null;g.p.gear.offhand=null;g.p.cd.attack=0;assert.equal(g.attack(),false);
 }
});
