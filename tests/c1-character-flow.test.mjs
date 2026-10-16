import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {RPG,MAPS,QUESTS,ITEMS}from '../dist/core-v14.js';import{DIALOGUES}from '../dist/data-v14.js';
import{C1_MAPS}from '../dist/chapter-one-layout.js';import{QUEST_PRIORITY}from '../dist/quest-service-v14.js';
import{C1_OBJECTIVES}from '../dist/chapter-one-objectives.js';import{C1_FINAL_BOSS}from '../dist/chapter-one-trial-runtime.js';
import{parseSave}from '../dist/save-transfer-v14.js';import{dialogueCorpus}from '../tools/harness/dialogue_corpus.mjs';
const script=JSON.parse(fs.readFileSync('docs/c1-character-flow/SCRIPT.json'));const before=JSON.parse(fs.readFileSync('docs/c1-character-flow/before/CORPUS.json')).scenes;
const second=new Map(JSON.parse(fs.readFileSync('docs/c2-optimization/SCRIPT.json')).entries.map(e=>[e.key,e]));
const finish=g=>{for(let i=0;g.pending&&i<20;i++)g.finishScene();assert.equal(g.pending,null);};
const load=g=>new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.44);
test('full chapter edit matches adopted script, keeps page beats and all other chapter text',()=>{
 const corpus=dialogueCorpus().scenes,entries=new Map(script.entries.map(e=>[e.key,e]));
 for(const [id,old]of Object.entries(before)){
  const e=entries.get(id),later=second.get(id);if(later)assert.deepEqual(later.before,e?.after||old.text,id+' chapter-two exact baseline');assert.deepEqual(corpus[id].text,later?.after||e?.after||old.text,id);if(e){assert.equal(e.after.length,old.text.length,id);assert.deepEqual(e.after.map(r=>r[0]),old.text.map(r=>r[0]==='罗萨'?'商人':r[0]),id);}
 }
 assert.equal(script.reviewed.length,263);assert.equal(entries.size,142);
 for(const id of script.reviewed)assert.doesNotMatch(JSON.stringify(corpus[id].text),/罗萨/,id);
 for(const entry of [...Object.values(ITEMS),...Object.values(QUESTS)])assert.doesNotMatch(entry.desc||'',/罗萨/);
});
test('trial introduces each contact only when the previous round has been reported',()=>{
 const g=new RPG('shadow',null,()=>.44);g.chapter=1;g.quests.rats='done';g.pending=null;
 assert.equal(g.c1CanOffer('c1ExitDrill'),false);g.choose('contractAccept');assert.equal(g.pending.id,'c1TrialInvitation');
 assert.doesNotMatch(JSON.stringify(DIALOGUES.c1TrialInvitation),/伊登|终试执卫|三层|二层/);finish(g);
 assert.equal(g.objective().target,'clerk');g.choose('c1:accept:c1Readiness');finish(g);assert.equal(g.quests.c1Readiness,'active');
 g.c1Expansion.journey.counts.c1Readiness=8;assert.equal(g.c1CanOffer('c1ExitDrill'),false);g.choose('c1:claim:c1Readiness');
 assert.equal(g.pending.id,'c1Talk_c1Readiness_report');assert.match(JSON.stringify(DIALOGUES[g.pending.id]),/身手不错嘛.*伊登/);
 assert.equal(g.c1CanOffer('c1ExitDrill'),false);finish(g);const gold=g.p.gold;g.c1Claim('c1Readiness');assert.equal(g.p.gold,gold);
 assert.equal(g.objective().target,'c1iden');assert.equal(g.c1CanOffer('c1ExitDrill'),true);
 g.enter('c1TrialFoyer');g.pending=null;g.choose('c1:accept:c1ExitDrill');assert.equal(g.pending.id,'c1Talk_c1ExitDrill_offer');finish(g);
 g.c1Expansion.journey.parts.c1ExitDrill=Object.fromEntries(C1_OBJECTIVES.c1ExitDrill.parts.map(p=>[p.id,p.count]));g.enter('c1TrialVault');g.pending=null;g.damage(g.enemies.find(e=>e.id===C1_FINAL_BOSS),1e8,'skill');g.enter('hall');g.pending=null;
 assert.equal(g.objective().target,'sister');g.choose('contractAccept');assert.equal(g.pending.id,'c1TrialReport');finish(g);assert.equal(g.chapter,2);assert.equal(g.c1Expansion.preparation.approved,true);
});
test('every first-chapter menu sorts actionable tasks before services and idle talk at each progress state',()=>{
 let menus=0;
 for(const phase of [0,1,2,3,4])for(const state of ['fresh','active','ready','done']){
  const g=new RPG('shadow',null,()=>.44);g.chapter=phase;g.pending=null;g.c1Expansion.preparation.started=phase>0;g.c1Expansion.preparation.approved=phase>=2;
  for(const id of Object.keys(C1_OBJECTIVES)){if(state!=='fresh')g.quests[id]=state==='done'?'done':'active';if(state==='ready'){const q=C1_OBJECTIVES[id];g.c1Expansion.journey.counts[id]=q.count||99;if(q.parts)g.c1Expansion.journey.parts[id]=Object.fromEntries(q.parts.map(p=>[p.id,p.count]));}}
  for(const map of C1_MAPS){g.enter(map);g.pending=null;for(const npc of g.npcs){const rows=g.npcOptions(npc.id),scores=rows.map(r=>QUEST_PRIORITY[r.questState]);assert.ok(scores.every(Number.isFinite),map+'/'+npc.id);assert.deepEqual(scores,scores.slice().sort((a,b)=>a-b),map+'/'+npc.id+'/'+phase+'/'+state);menus++;}}
 }
 assert.ok(menus>100);
});
test('previous full-text pages preserve progress, callbacks and merchant actor identity over reload',()=>{
 for(const e of script.entries.filter(e=>e.static))for(const line of [0,e.before.length-1]){
  const g=new RPG('shadow');g.chapter=1;g.pending={id:e.key,line,lines:structuredClone(e.before),then:null};const r=load(g);assert.deepEqual(r.pending.lines,e.before,e.key);assert.equal(r.pending.line,line,e.key);
 }
 const g=new RPG('shadow');g.npcPoses['hall:c1rosa']={name:'罗萨'};const r=load(g);assert.equal(r.npcs.find(n=>n.id==='c1rosa').name,'商人');assert.equal(MAPS.hall.npcs.find(n=>n.id==='c1rosa').name,'商人');
});
