import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RPG,MAPS,stats} from '../dist/core-v14.js';
import {DIALOGUES} from '../dist/data-v14.js';
import {STAGING} from '../dist/staging-v14.js';
import {StoryFlow} from '../dist/story-flow-v14.js';
import {CHAPTER12_REWRITE_V30} from '../dist/chapter12-text-v30.js';
import {chapter12ShotV30,skipStorySegmentV30} from '../dist/chapter12-director-v30.js';
import {migrateDialogueSaveV26} from '../dist/dialogue-save-migration-v26.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {sagaPortraitV25} from '../dist/saga-art-v25.js';
import {takePumpReward} from '../dist/chapter-runtime-v14.js';
const baseline=JSON.parse(fs.readFileSync(new URL('../docs/ch12-epic/BASELINE_DIALOGUES.json',import.meta.url)));
const fresh=()=>new RPG('shadow',null,()=>.44);
function finish(g,skip=true){let count=0;while(g.pending){assert.ok(++count<12,'chain finishes');const flow=new StoryFlow(g,g.pending.lines||DIALOGUES[g.pending.id]);if(skip)skipStorySegmentV30(flow);else{while(!flow.finished){flow.cine?.fastForward();flow.update(0);if(!flow.finished)flow.advance();}}}return g;}

test('authored edits keep identities, line counts, speakers, choreography and all later scenes',()=>{
 for(const entry of CHAPTER12_REWRITE_V30){assert.equal(entry.before.length,entry.after.length,entry.id);assert.deepEqual(entry.before.map(r=>r[0]),entry.after.map(r=>r[0]),entry.id);assert.deepEqual(DIALOGUES[entry.id],entry.after);if(baseline[entry.id])assert.deepEqual(STAGING.scenes[entry.id],baseline[entry.id].stage,entry.id+' staging');}
 for(const id of ['canalStart','ch2Alarm','ch2TargetBefore','ch2TargetAfter','ch2ExileEnd'])assert.deepEqual(DIALOGUES[id],baseline[id].lines,id);
});

test('every changed legacy pending row migrates without altering cursor, phase, callback or input',()=>{
 for(const entry of CHAPTER12_REWRITE_V30)for(let line=0;line<entry.before.length;line++)for(const phase of ['action','dialogue']){
  const pending={id:entry.id,lines:entry.before,line,phase,then:'legacy-callback',closing:line===entry.before.length-1};
  const old={pending,beforeDeparture:{pending:structuredClone(pending)},memoryV13:{reality:{pending:structuredClone(pending)}}};
  const result=migrateDialogueSaveV26(old);for(const p of [result.pending,result.beforeDeparture.pending,result.memoryV13.reality.pending]){assert.deepEqual(p.lines,entry.after);assert.equal(p.line,line);assert.equal(p.phase,phase);assert.equal(p.then,'legacy-callback');}
  assert.deepEqual(old.pending.lines,entry.before,'input preserved');assert.deepEqual(migrateDialogueSaveV26(result),result,'idempotent');
 }
 const old={pending:{id:'intro',lines:[['奥伦','unknown edited save']]}};assert.throws(()=>migrateDialogueSaveV26(old),/无法识别/);
});

test('real save import resumes the same dialogue row with the current text and camera',()=>{
 for(const entry of CHAPTER12_REWRITE_V30){const g=fresh();g.pending={id:entry.id,lines:structuredClone(entry.before),line:Math.min(3,entry.before.length-1),phase:'dialogue',then:null};const old=g.snapshot();const h=new RPG('shadow',parseSave(JSON.stringify(old)),()=>.44);assert.equal(h.pending.line,old.pending.line,entry.id);assert.deepEqual(h.pending.lines,entry.after);const f=new StoryFlow(h,h.pending.lines);assert.equal(f.current[1],entry.after[f.index][1]);}
 const g=fresh();g.pending={id:'assassination',line:12,phase:'dialogue'};const f=new StoryFlow(g,DIALOGUES.assassination);assert.equal(chapter12ShotV30(f).size,'close');f.phase='action';assert.equal(chapter12ShotV30(f),null);
});

test('forward reading and skipping preserve physical end positions and callbacks',()=>{
 for(const id of Object.keys(baseline)){
  const states=[];for(const skip of [false,true]){const g=fresh();g.enter(baseline[id].stage.map,800,750);g.pending=null;g.events=[];g.beginScene(id);const f=new StoryFlow(g,DIALOGUES[id]);if(skip)skipStorySegmentV30(f);else while(!f.finished){f.cine?.fastForward();f.update(0);if(!f.finished)f.advance();}assert.ok(f.finished);assert.equal(skipStorySegmentV30(f),false);states.push({map:g.map,p:[g.p.x,g.p.y],saint:g.saint,pending:g.pending,quests:g.quests});}assert.deepEqual(states[0],states[1],id);
 }
});

test('chapter-one task chain reaches departure with the seal and coercion unresolved',()=>{
 const g=fresh();finish(g);g.choose('ratsAccept');finish(g);g.enter('warehouse',800,850);finish(g);
 // Exercise death and quest rules directly; spatial scenarios cover live combat controls.
 for(const e of g.enemies.filter(e=>e.type==='rat'))g.damage(e,10000);
 assert.equal(g.ready('rats'),false,'wall clue still required');const crack=g.targets().find(t=>t.id==='crack');g.relocate(crack.x,crack.y);g.interact(crack);assert.equal(g.ready('rats'),true);
 g.enter('hall',800,800);g.choose('ratsDone');finish(g);assert.equal(g.chapter,1);g.choose('contractAccept');finish(g);assert.equal(g.chapter,2);
 g.enter('chapel',800,900);finish(g);assert.equal(g.chapter,3);assert.equal(g.quests.contract,'done');assert.ok(g.knowledge.saint.includes('saint-specific-seal'));
 for(const e of g.enemies)if(!e.dead)g.damage(e,10000);
 g.enter('canal',650,820);finish(g);for(const e of g.enemies)if(!e.dead)g.damage(e,10000);assert.equal(g.chapter,4);
 g.beginScene('chapterEnd','end');finish(g);assert.equal(g.chapter,6);assert.equal(g.quests.escape,'done');assert.equal(g.flags.chapterOneComplete,true);assert.equal(g.map,'post');assert.deepEqual(g.relations.saint,{trust:0,romance:0});
 const gold=g.p.gold;g.apply('end');assert.equal(g.p.gold,gold);
});

test('chapter-two relay, refusal, alarm and escape keep knowledge and one-time rewards',()=>{
 const g=fresh();g.chapter=6;g.enter('inn',800,650);g.pending=null;g.events=[];g.choose('ch2:relay');finish(g);assert.equal(g.chapter,7);assert.equal(g.flags.darkCommissionV9,true);assert.equal(g.quests.relay,'done');
 g.enter('manor',1100,650);finish(g);g.beginScene('ch2InnerDoor','ch2_inner');finish(g);assert.equal(g.chapter,8);assert.equal(g.flags.alarm,true);assert.ok(g.enemies.some(e=>e.id==='ch2-alarm-1'));assert.equal(MAPS.manor.doors.some(d=>d.to==='chamber'),false,'inner room has no accessible map exit');
 for(const e of g.enemies)if(!e.dead)g.damage(e,10000);g.active=true;g.update(.02,{});assert.equal(g.flags.manorWave,2);assert.ok(g.enemies.some(e=>e.id==='ch2-bren'));for(const e of g.enemies)if(!e.dead)g.damage(e,10000);g.active=true;g.update(.02,{});assert.equal(g.flags.brenDefeated,true);finish(g);assert.equal(g.chapter,10);assert.equal(g.map,'spillway');assert.equal(g.quests.breakout,'done');
 g.enter('exile',700,600);g.pending=null;g.beginScene('ch2ExileApproach','ch2_cross');finish(g);assert.equal(g.chapter,11);assert.equal(g.flags.pursuitStopped,true);
 g.beginScene('ch2ExileEnd','ch2_end');finish(g);assert.equal(g.flags.darkExileV9,true);assert.ok(g.chapter>=12);const reward={gold:g.p.gold,xp:g.p.xp,level:g.p.level};g.apply('ch2_end');assert.deepEqual({gold:g.p.gold,xp:g.p.xp,level:g.p.level},reward);
 assert.ok(g.knowledge.player.includes('hester-tax-abuse'));for(const who of ['hero','saint'])assert.equal(g.knowledge[who].includes('hester-tax-abuse'),false);assert.deepEqual(g.relations.saint,{trust:0,romance:0});
 const loaded=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.44);loaded.apply('ch2_end');assert.deepEqual({gold:loaded.p.gold,xp:loaded.p.xp,level:loaded.p.level},reward,'retry after save import');
});

test('pump side quest still supports found-first route and mutually exclusive one-time rewards',()=>{
 for(const choice of ['medicine','wrap']){const g=fresh();g.chapter=7;g.enter('bridge',1150,830);g.pending=null;g.apply('pump_take');g.enter('inn',450,600);g.pending=null;g.choose('ch2:pumpReturn');finish(g);assert.equal(g.flags.pumpFixed,true);const gold=g.p.gold;assert.equal(takePumpReward(g,choice),true);finish(g);assert.equal(g.quests.pump,'done');assert.equal(g.p.gold,gold+25);assert.equal(takePumpReward(g,choice==='wrap'?'medicine':'wrap'),false);assert.equal(g.flags.pumpChoice,choice);}
});

test('cover identity uses a resolute expression under coercion and keeps late disguise',()=>{
 const bank={cropped:(sheet,index)=>sheet+':'+index,portrait:()=> 'fallback'};
 assert.equal(sagaPortraitV25(bank,'艾莉娅',{chapter:2}),'elyriaGentleV30:0');
 assert.equal(sagaPortraitV25(bank,'艾莉娅',{chapter:2},{id:'assassination'}),'elyriaResoluteV30:0');
 assert.equal(sagaPortraitV25(bank,'艾莉娅',{chapter:8}),'elyriaResoluteV30:0');
 assert.equal(sagaPortraitV25(bank,'艾莉娅',{chapter:20,sagaV25:{disguise:true}}),'sagaElyriaPortraitV27:0');
});
