import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {RPG,MAPS,QUESTS} from '../dist/core-v14.js';
import {DIALOGUES} from '../dist/data-v14.js';
import {SCENERY} from '../dist/world-v14.js';
import {StoryFlow} from '../dist/story-flow-v14.js';
import {ChapterOneStoryFlow,C1_HIDDEN,C1_CINEMATIC_LOADS,c1Shot} from '../dist/chapter-one-cinematic-v31.js';
import {C1_PURSUIT_LOADS,pursuitSheet,pursuitFrame,drawPursuit} from '../dist/chapter-one-pursuit-v31.js';
const baseline=JSON.parse(fs.readFileSync(new URL('../docs/ch1-pilot-r2/AUDIT.json',import.meta.url)));
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const copy=v=>JSON.parse(JSON.stringify(v));
function game(cls,id){const g=new RPG(cls,null,()=>.44);g.chapter=id==='contract'?1:2;g.enter(id==='contract'?'hall':'chapel',800,850);g.beginScene(id,id==='contract'?'contractAccept':'assassinate');g.events=[];return g;}
function finish(f){let n=0;while(!f.finished&&n++<200){if(f.phase==='action')f.update(30);else f.advance();}assert.equal(f.finished,true);}
function outcome(g){return copy({chapter:g.chapter,quests:g.quests,p:g.p,knowledge:g.knowledge,saint:g.saint,enemies:g.enemies,relations:g.relations});}

test('all original map geometry, scenery, quest definitions and final dialogue are unchanged',()=>{
 for(const [id,h]of Object.entries(baseline.allMapHashes))assert.equal(hash(MAPS[id]),h,id);
 for(const [id,h]of Object.entries(baseline.allDialogueHashes))assert.equal(hash(DIALOGUES[id]),h,id);
 for(const m of baseline.maps)assert.equal(hash(SCENERY[m.id]),m.scenerySha256,m.id);
 for(const [id,q]of Object.entries(baseline.quests))assert.deepEqual(QUESTS[id]??null,q,id);
});
test('normal and skip paths commit precisely the original rewards, actors and knowledge for three classes',()=>{
 for(const cls of ['shadow','oath','ember'])for(const id of ['contract','assassination']){
  const control=game(cls,id);finish(new StoryFlow(control,DIALOGUES[id]));
  for(const skip of [false,true]){
   const g=game(cls,id),f=new ChapterOneStoryFlow(g,DIALOGUES[id]);skip?f.skip():finish(f);
   assert.deepEqual(outcome(g),outcome(control),cls+'/'+id+'/'+skip);
   assert.equal(Object.keys(g.flags.c1Viewed).length,1);
   const committed=copy(g.snapshot());f.skip();f.complete();f.advance();f.update(1);
   assert.deepEqual(copy(g.snapshot()),committed,'repeated input must not commit twice');
  }
 }
});
test('every original pending line resumes in both action and dialogue phases without duplicating completion',()=>{
 for(const cls of ['shadow','oath','ember'])for(const id of ['contract','assassination']){
  for(let line=0;line<DIALOGUES[id].length;line++)for(const phase of ['action','dialogue']){
   const old=game(cls,id);Object.assign(old.pending,{line,phase});
   const saved=copy(old.snapshot()),control=new RPG(cls,copy(saved),()=>.44);
   finish(new StoryFlow(control,DIALOGUES[id]));
   const g=new RPG(cls,copy(saved),()=>.44),f=new ChapterOneStoryFlow(g,DIALOGUES[id]);finish(f);
   assert.deepEqual(outcome(g),outcome(control),`${cls}/${id}/${line}/${phase}`);
  }
 }
});
test('all hidden-tail cursors survive real snapshot/restore and keep backstage knowledge private',()=>{
 for(const id of ['contract','assassination'])for(let line=0;line<6;line++){
  const g=game('shadow',id),f=new ChapterOneStoryFlow(g,DIALOGUES[id]);
  while(!f.c1Tail){if(f.phase==='action')f.update(30);else f.advance();}
  for(let i=0;i<line;i++)f.advance();
  const saved=copy(g.snapshot()),r=new RPG('shadow',saved,()=>.44),resume=new ChapterOneStoryFlow(r,DIALOGUES[id]);
  assert.equal(resume.c1Tail.line,line);assert.deepEqual(resume.current,C1_HIDDEN[resume.c1TailID][line]);
  assert.deepEqual(r.knowledge,g.knowledge);finish(resume);assert.equal(r.pending,null);
  assert.equal(r.flags.c1Viewed[resume.c1TailID],true);
 }
});
test('past-event saves do not replay tails; replay cannot write rewards or viewed state',()=>{
 const g=game('shadow','assassination');finish(new ChapterOneStoryFlow(g,DIALOGUES.assassination));
 const past=copy(g.snapshot());delete past.flags.c1Viewed;const restored=new RPG('shadow',past,()=>.44);
 restored.enter('chapel',800,850);assert.equal(restored.pending,null);assert.equal(restored.chapter,3);
 for(const skip of [false,true]){
  const r=game('shadow','assassination');r.c1Replay=true;r.pending.then=null;const before=outcome(r);
  const f=new ChapterOneStoryFlow(r,DIALOGUES.assassination);skip?f.skip():finish(f);
  assert.deepEqual(outcome(r),before);assert.equal(r.flags.c1Viewed,undefined);
 }
});
test('confrontation precedes seal and every referenced original asset exists',()=>{
 const g=game('shadow','assassination');g.pending.line=10;
 const f=new ChapterOneStoryFlow(g,DIALOGUES.assassination);f.c1BeatAt=f.mainCine.time;
 assert.equal(c1Shot(f).index,5);f.update(4);assert.equal(c1Shot(f).index,6);
 const cues=f.update(4.4);assert.equal(c1Shot(f).index,7);assert.ok(cues.some(c=>c.name==='seal'));
 for(const [,url]of [...C1_CINEMATIC_LOADS,...C1_PURSUIT_LOADS])assert.ok(fs.statSync(new URL('../dist/'+url,import.meta.url)).size>100000,url);
});
test('the well keeps its artwork and saved object, with a reachable south-rim interaction in old visited saves',()=>{
 const g=new RPG('shadow');g.enter('town',900,770);g.pending=null;g.active=true;
 const saved=copy(g.snapshot()),prop=saved.states.town.props.find(p=>p.id==='well');
 assert.deepEqual([prop.x,prop.y],[900,700]);
 for(const offMap of [false,true]){
  const old=copy(saved);if(offMap)old.map='hall';const r=new RPG('shadow',old);if(offMap)r.enter('town',900,770);
  r.pending=null;r.active=true;const t=r.targets().find(t=>t.id==='well');assert.deepEqual([t.x,t.y,t.drawX,t.drawY],[900,735,900,700]);
  assert.equal(r.blocked(t.x,t.y,false),false);assert.equal(r.clearLine(r.p,t,false),true);r.interact(t);assert.equal(r.flags.wellSeen,true);
  assert.deepEqual(saved.states.town.props.find(p=>p.id==='well'),prop);
 }
});
test('guard, elite and officer select distinct 16-frame sheets at equal body scale',()=>{
 assert.equal(pursuitSheet({type:'guard'}),'c1Guard');assert.equal(pursuitSheet({type:'guard',elite:true}),'c1Elite');assert.equal(pursuitSheet({type:'captain'}),'c1Officer');assert.equal(pursuitSheet({type:'wolf',elite:true}),null);
 const calls=[],ctx=new Proxy({drawImage:(...args)=>calls.push(args)},{get:(t,k)=>t[k]||(()=>{})});
 const bank={images:{},frames:{},frame:(s,i)=>bank.frames[s]?.[i]};
 for(const [sheet]of C1_PURSUIT_LOADS){bank.frames[sheet]=Array.from({length:16},()=>({x:0,y:0,w:200,h:400,foot:{x:100,y:400}}));bank.images[sheet]=sheet;}
 for(const a of [{type:'guard'},{type:'guard',elite:true},{type:'captain'}])drawPursuit(ctx,bank,{...a,x:0,y:0});
 assert.deepEqual(calls.map(c=>c.at(-1)),[82,82,82]);
 assert.deepEqual([0,38,76,114].map(walkDistance=>pursuitFrame({moving:true,walkDistance})),[0,1,2,3]);
 assert.equal(pursuitFrame({angle:-1,wind:.4,windMax:.45}),12);assert.equal(pursuitFrame({angle:-1,attackAnim:.2}),14);
});
