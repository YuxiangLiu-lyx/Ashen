import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {journey} from './chapter-one-economy.mjs';import {C1_MAIN,C1_SIDE} from '../dist/chapter-one-expansion-data.js';
const out='docs/ch1-map-quests/economy';fs.mkdirSync(out,{recursive:true});
for(const cls of ['shadow','oath','ember'])for(const route of ['main_only','typical','all_once','repeat_patrol'])test(cls+' '+route+' actual campaign economy and second-chapter carry',()=>{
 const r=journey(cls,route,2654435769),g=r.g,h=g.c1Expansion;
 for(const q of C1_MAIN)assert.equal(g.quests[q.id],'done',q.id);
 assert.equal(C1_MAIN.reduce((n,q)=>n+h.claimLedger['quest:'+q.id].xp,0),425);assert.equal(C1_MAIN.reduce((n,q)=>n+h.claimLedger['quest:'+q.id].gold,0),196);
 if(['all_once','repeat_patrol'].includes(route)){for(const q of C1_SIDE)assert.equal(g.quests[q.id],'done',q.id);assert.equal(C1_SIDE.reduce((n,q)=>n+h.claimLedger['quest:'+q.id].xp,0),400);assert.equal(h.crafting.sequence,3);for(const e of Object.values(h.elite))assert.ok(e.firstPartGranted);}
 if(route==='typical'){assert.equal(h.crafting.sequence,2);for(const id of ['oil','letter','c1RuneWear'])assert.equal(g.quests[id],'done');}
 if(route==='repeat_patrol'){assert.equal(h.merchant.patrolSequence,5);assert.equal(Object.keys(h.claimLedger).filter(k=>k.startsWith('patrol:')).length,5);}
 const latest=r.milestones.at(-1),path=out+'/'+cls+'-'+route+'.json';fs.writeFileSync(path,JSON.stringify({route,cls,basis:'runtime_events',events:r.events,milestones:r.milestones,limits:r.limits},null,2));
 assert.equal(r.events.reduce((n,e)=>n+e.delta.gold,30),latest.balance.gold);assert.equal(r.events.reduce((n,e)=>n+e.delta.xp,0),latest.balance.xp);
 r.continueChapterTwo();fs.writeFileSync(path,JSON.stringify({route,cls,basis:'runtime_events',events:r.events,milestones:r.milestones,limits:r.limits},null,2));
});
for(const cls of ['shadow','oath','ember'])test(cls+' full route with exactly one exclusive epic carries through chapter two',()=>{
 const r=journey(cls,'all_once',10);assert.equal(Object.values(r.g.c1Expansion.elite).filter(e=>e.lootResult>=0).length,1);r.continueChapterTwo();fs.writeFileSync(out+'/'+cls+'-all_once-one-epic.json',JSON.stringify({route:'all_once',cls,seed:10,basis:'runtime_events',variant:'exactly one exclusive epic',events:r.events,milestones:r.milestones,limits:r.limits},null,2)+'\n');
});
