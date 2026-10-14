import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RPG,MAPS} from '../dist/core-v14.js';
import {DIALOGUES} from '../dist/data-v14.js';
import {C1_QUESTS} from '../dist/chapter-one-expansion-data.js';
import {C1_GIVERS,C1_OBJECTIVES} from '../dist/chapter-one-objectives.js';
import {C1_QUEST_TALKS,C1_QUEST_DIALOGUES} from '../dist/chapter-one-quest-dialogues.js';
import {ChapterOneStoryFlow,C1_HIDDEN} from '../dist/chapter-one-dialogues-v31.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {stageNavigationV26} from '../dist/scene-geometry-v26.js';
const copy=x=>structuredClone(x);
const restore=g=>{const r=new RPG(g.p.cls,parseSave(JSON.stringify(g.snapshot())),()=>.44);r.active=!r.pending;return r;};
function finish(g){for(let i=0;g.pending&&i<20;i++){const flow=new ChapterOneStoryFlow(g,g.pending.lines||DIALOGUES[g.pending.id]);for(let n=0;!flow.finished&&n<200;n++)flow.phase==='action'?flow.update(20):flow.advance();assert.ok(flow.finished);}assert.equal(g.pending,null);}
function setup(id,cls='shadow'){const g=new RPG(cls,null,()=>.44);g.chapter=id==='rats'?0:id==='c1CanalBreak'?3:2;for(const req of C1_QUESTS[id].requires||[])g.quests[req]='done';if(id==='v12NorthDelivery')g.quests.v12CourierRoad='done';const giver=C1_GIVERS[id];const map=Object.keys(MAPS).find(k=>MAPS[k].npcs.some(n=>n.id===giver))||'canal';g.enter(map);finish(g);g.events=[];return g;}
function ready(g,id){const o=C1_OBJECTIVES[id];if(o){g.c1Expansion.journey.counts[id]=o.count;if(o.parts)g.c1Expansion.journey.parts[id]=Object.fromEntries(o.parts.map(p=>[p.id,p.count]));if(o.cause)g.c1Expansion.journey.kills[o.map+':'+o.cause]=1;}
 if(id==='rats')Object.assign(g.flags,{rats:8,crack:true});
 if(id==='echo')g.flags.echoCoreFound=true;
 if(id==='c1ClockMemory')g.flags.silverFound=true;
 if(id==='c1LoomBrief')g.c1Expansion.worldChanges.loomGift=true;
 if(id==='v12NorthDelivery')g.c1Expansion.worldChanges.envelope=true;
 if(id==='c1AlchemistSamples')Object.assign(g.c1Expansion.samples,{c1PartJaw:true,c1PartTendon:true,c1PartMembrane:true});
 if(id==='c1CryptRepair')Object.assign(g.c1Expansion.questSteps[id],{legacyEvidence:true});
 if(id==='c1VaultWatch')Object.assign(g.c1Expansion.questSteps[id],{legacyEvidence:true});
 if(id==='c1CanalBreak'){g.flags.captainDefeated=true;g.ensureMap('canal');g.states.canal.enemies.forEach(e=>{e.dead=true;e.hp=0;});}
 assert.ok(g.c1Ready(id),id);
}

test('every authored request waits for its final page, survives import, and cannot overwrite another conversation',()=>{
 for(const id of Object.keys(C1_QUEST_TALKS)){
  const g=setup(id);g.choose(id==='rats'?'ratsAccept':'c1:accept:'+id);assert.ok(g.pending,id);assert.notEqual(g.quests[id],'active',id);
  const original=copy(g.pending);g.choose('c1:accept:oil');assert.deepEqual(g.pending,original,'pending survives stale input');
  const r=restore(g);finish(r);assert.equal(r.quests[id],'active',id);const after=copy(r.snapshot());r.apply('c1:acceptAfterTalk:'+id);assert.equal(r.p.gold,after.p.gold);assert.equal(r.p.xp,after.p.xp);
 }
});
test('all reports defer rewards to completion and pay exactly once across import and retries',()=>{
 for(const id of Object.keys(C1_QUEST_TALKS).filter(id=>id!=='rats')){
  const g=setup(id);g.c1Accept(id);ready(g,id);const before={gold:g.p.gold,xp:g.p.xp};g.choose('c1:claim:'+id);assert.ok(g.pending,id);assert.equal(g.p.gold,before.gold,id);assert.equal(g.quests[id],'active');
  const action=g.pending.then,r=restore(g);finish(r);assert.equal(r.quests[id],'done',id);assert.equal(r.p.gold,before.gold+C1_QUESTS[id].gold+(id==='v12NorthDelivery'?10:0),id);
  const paid=copy(r.snapshot());r.apply(action);r.choose('c1:claim:'+id);assert.equal(r.p.gold,paid.p.gold);assert.equal(r.p.xp,paid.p.xp);assert.deepEqual(r.p.items,paid.p.items);
 }
});
test('both herb recipients and rotating patrol retain their distinct, once-only results after reading',()=>{
 const g=setup('herbs');g.c1Accept('herbs');ready(g,'herbs');g.choose('c1:herbsWoman');assert.equal(g.flags.herbChoice,undefined);const r=restore(g);finish(r);assert.equal(r.flags.herbChoice,'woman');const items=copy(r.p.items);r.apply('c1:reportAfterTalk:herbs:woman');assert.deepEqual(r.p.items,items);
 for(let route=0;route<2;route++){const p=setup('c1RuneWear');p.quests.c1RuneWear='done';p.c1Expansion.merchant.patrolSequence=route;p.choose('c1:patrolAccept');assert.equal(p.c1Expansion.merchant.activePatrol,null);assert.equal(p.pending.id,route?'c1PatrolGrove':'c1PatrolRoad');finish(p);assert.equal(p.c1Expansion.merchant.activePatrol.route,route);p.c1Expansion.journey.counts.c1RunePatrol=8;const gold=p.p.gold;p.choose('c1:patrolClaim');assert.equal(p.p.gold,gold);finish(p);assert.equal(p.p.gold,gold+18);p.apply('c1:reportAfterTalk:c1RunePatrol');assert.equal(p.p.gold,gold+18);}
});
test('three careers complete the contract before the private meeting; crossing the hall exit opens the real hall stage once',()=>{
 for(const cls of ['shadow','oath','ember']){
  const g=new RPG(cls,null,()=>.44);g.chapter=1;g.beginScene('contract','contractAccept');finish(g);assert.equal(g.chapter,2);assert.equal(g.map,'hall');assert.equal(g.pending,null);assert.equal(g.flags.c1PrivateTalk,'awaitingExit');assert.equal(g.flags.c1Viewed?.c1HiddenPairArrangement,undefined);
  const r=restore(g);r.enter('c1TrainingYard',800,850);assert.equal(r.pending.id,'c1HiddenPairArrangement');const at=[r.map,r.p.x,r.p.y],gold=r.p.gold,knowledge=copy(r.knowledge),flow=new ChapterOneStoryFlow(r,DIALOGUES[r.pending.id]);assert.equal(flow.cine.map,'hall');assert.deepEqual(flow.cine.actors.map(a=>a.id).sort(),['clerk','sister']);assert.equal(flow.phase,'action');
  const start=copy(flow.cine.get('clerk'));flow.update(.3);assert.ok(Math.hypot(flow.cine.get('clerk').x-start.x,flow.cine.get('clerk').y-start.y)>0);while(!flow.finished)flow.phase==='action'?flow.update(20):flow.advance();assert.deepEqual([r.map,r.p.x,r.p.y],at);assert.equal(r.p.gold,gold);assert.deepEqual(r.knowledge,knowledge);assert.equal(r.flags.c1Viewed.c1HiddenPairArrangement,true);assert.equal(r.flags.c1PrivateTalk,undefined);
  r.enter('hall');r.enter('c1TrainingYard');assert.equal(r.pending,null);
 }
});
test('private meeting waits through unsafe arrival and existing dialogue, and queued state survives loading',()=>{
 const g=new RPG('shadow',null,()=>.44);g.chapter=2;g.flags.c1PrivateTalk='awaitingExit';g.beginScene('c1TrainingReason');g.enter('c1TrainingYard',800,850);assert.equal(g.pending.id,'c1TrainingReason');assert.equal(g.flags.c1PrivateTalk,'exited');finish(g);
 const e=g.enemies[0];Object.assign(e,{x:g.p.x+60,y:g.p.y,hp:100,dead:false});assert.equal(g.c1PrivateTalkTick(),false);const r=restore(g);r.enemies.forEach(e=>{e.dead=true;e.hp=0;});r.bullets=[{friendly:false}];assert.equal(r.c1PrivateTalkTick(),false);r.bullets=[];assert.equal(r.c1PrivateTalkTick(),true);finish(r);assert.equal(r.c1PrivateTalkTick(),false);
});
test('all new private scene pages and legacy tail cursors resume without replaying payment or revealing to the hero',()=>{
 for(const legacy of [false,true])for(let i=0;i<C1_HIDDEN.c1HiddenPairArrangement.length;i++){
  const g=new RPG('shadow',null,()=>.44);g.chapter=legacy?1:2;g.enter(legacy?'hall':'c1TrainingYard',800,850);g.beginScene(legacy?'contract':'c1HiddenPairArrangement',legacy?'contractAccept':'c1:privateTalkDone');Object.assign(g.pending,legacy?{line:19,phase:'dialogue',closing:true,c1Tail:{id:'c1HiddenPairArrangement',line:i,revision:3}}:{line:i,phase:'dialogue'});
  const r=restore(g),f=new ChapterOneStoryFlow(r,DIALOGUES[r.pending.id]);assert.deepEqual(f.current,C1_HIDDEN.c1HiddenPairArrangement[i]);const knowledge=copy(r.knowledge);finish(r);assert.deepEqual(r.knowledge,knowledge);const paid=copy(r.snapshot());r.finishScene();assert.equal(r.p.gold,paid.p.gold);assert.equal(r.p.xp,paid.p.xp);assert.equal(r.flags.c1Viewed.c1HiddenPairArrangement,true);
 }
});
test('the clerk walks around real hall furniture and never occupies a blocked foot position',()=>{
 const g=new RPG('shadow',null,()=>.44);g.chapter=2;g.enter('c1TrainingYard');g.beginScene('c1HiddenPairArrangement','c1:privateTalkDone');const f=new ChapterOneStoryFlow(g,DIALOGUES[g.pending.id]),cine=f.cine,nav=stageNavigationV26(g,cine.stage,'clerk');let samples=0;
 while(cine.busy()&&samples++<1000){cine.update(.016);const a=cine.get('clerk');assert.equal(nav.blocked(a.x,a.y),false,JSON.stringify(a));}assert.ok(samples>10&&samples<1000);assert.ok(Math.hypot(cine.get('clerk').x-cine.get('sister').x,cine.get('clerk').y-cine.get('sister').y)<150);
});
test('original scenes outside adopted first-chapter care conversations stay byte identical; quest budgets remain intact',()=>{
 const before=JSON.parse(fs.readFileSync(new URL('../docs/c1-story-flow/baseline/dialogues.json',import.meta.url))),care=JSON.parse(fs.readFileSync(new URL('../docs/c1-care-ui/SCRIPT.json',import.meta.url))).scenes;for(const [id,rows]of Object.entries(before))assert.deepEqual(DIALOGUES[id],care[id]||rows,id);
 const budgets=JSON.parse(fs.readFileSync(new URL('../docs/c1-story-flow/baseline/quests.json',import.meta.url)));for(const [id,q]of Object.entries(budgets))assert.deepEqual([C1_QUESTS[id].xp,C1_QUESTS[id].gold,C1_QUESTS[id].requires],[q.xp,q.gold,q.requires],id);
 assert.equal(Object.keys(C1_QUEST_DIALOGUES).length,75);assert.ok(!JSON.stringify(C1_QUEST_DIALOGUES).includes('肩伤'));
});

test('Iden local conversation uses the actual foyer menu and persists without inventing an injury',()=>{
 const g=setup('c1ExitDrill');assert.ok(g.npcOptions('c1iden').some(o=>o.action==='c1:localTalk:c1iden'));g.choose('c1:localTalk:c1iden');assert.equal(g.pending.id,'c1Conversation');assert.deepEqual(g.pending.lines,[['伊登','这里原是会馆练习队形的地下场地。我负责让人平安进出。薇蕾娜让鲁恩先看你的庭院实战，地下这几层由我安排。赫莎在侧廊等着检修。']]);const r=restore(g);assert.deepEqual(r.pending.lines,g.pending.lines);finish(r);assert.equal(r.quests.c1ExitDrill,undefined);
});
