import {selectCommerce} from '../dist/commerce-ui.js';
import {serviceDialogue,serviceScript} from './loot-services-fixtures.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {RPG,stats} from '../dist/core-v14.js';import {DIALOGUES} from '../dist/data-v14.js';
import {dialogueCorpus} from '../tools/harness/dialogue_corpus.mjs';import {parseSave} from '../dist/save-transfer-v14.js';
import {experienceServicePanel,experienceServiceAction} from '../dist/rpg-experience-services-ui.js';
const script=JSON.parse(fs.readFileSync('docs/c2-optimization/SCRIPT.json'));
const game=()=>{const g=new RPG('shadow',null,()=>.44);g.chapter=7;g.enter('inn');g.pending=null;g.transition=null;g.active=true;const n=g.npcs.find(n=>n.id==='seline');g.relocate(n.x,n.y+50);return g;};
const reload=g=>new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.44);
test('all installed dialogue matches adopted text and unrelated chapters stay byte-for-byte equal',()=>{
 const before=JSON.parse(fs.readFileSync('docs/c2-optimization/before/CORPUS.json')).scenes,after=dialogueCorpus().scenes,changed=new Map(script.entries.map(e=>[e.key,e]));
 for(const [id,row]of Object.entries(before)){const e=changed.get(id);assert.deepEqual(after[id].text,serviceDialogue(id,e?e.after:row.text),id);if(e)assert.deepEqual(e.before.map(r=>r[0]),e.after.map(r=>r[0]),id);}
});
test('old full-text pending pages retain words and callback; static pages keep the same line contract',()=>{
 for(const e of script.entries){let g=game();g.pending={id:e.static?e.key:'_v12Quest',line:e.before.length-1,then:null,lines:structuredClone(e.before)};const r=reload(g);assert.deepEqual(r.pending.lines,e.before,e.key);assert.equal(r.pending.line,g.pending.line);assert.equal(r.pending.then,null);}
});
test('chapter-two quest options precede service/daily and mainline precedes optional requests of the same state',()=>{
 const g=game(),rows=g.npcOptions('seline');assert.equal(rows[0].action,'v12q:accept:v12WatchHours');
 const order={ready:0,advance:0,available:1,waiting:2,service:3,daily:4};assert.ok(rows.every((r,i)=>!i||order[r.questState]>=order[rows[i-1].questState]));
 assert.equal(g.objective().target,'seline');g.choose('v12q:accept:v12WatchHours');assert.equal(g.quests.v12WatchHours,undefined);g.finishScene();assert.equal(g.objective().target,'bridgewatch');
 const h=g.v12.quests.v12WatchHours;assert.equal(h.claimed,false);g.map='bridge';g.ensureMap('bridge');g.pending=null;g.choose('v12q:advance:v12WatchHours:0');assert.equal(h.claimed,false);g.finishScene();assert.equal(h.claimed,true);assert.equal(g.objective().target,'inner-door');const xp=g.p.xp;g.apply('v12q:advance:v12WatchHours:0');assert.equal(g.p.xp,xp);
});
test('relay grid selection never buys; confirmation, equip, sale and repeated clicks use real transactions',()=>{
 const g=game();g.p.level=6;g.p.gold=200;const before=structuredClone(g.p);let html=experienceServicePanel(g,'seline').body;assert.match(html,/inventory-grid/);assert.doesNotMatch(html,/data-c1="outfit-buy/);
 selectCommerce(g,'c1-outfit:seline','relayChest');assert.deepEqual(g.p,before);html=experienceServicePanel(g,'seline').body;assert.match(html,/outfit-buy:seline:relayChest/);
 const preview=g.experiencePreview('seline','relayChest');experienceServiceAction(g,'outfit-buy:seline:relayChest');assert.equal(g.p.gold,125);assert.match(experienceServicePanel(g,'seline').body,/outfit-equip:seline:outfit-seline-relayChest/);
 experienceServiceAction(g,'outfit-buy:seline:relayChest');assert.equal(g.p.gold,125);experienceServiceAction(g,'outfit-equip:seline:outfit-seline-relayChest');assert.equal(stats(g.p).hp,preview.after.hp);
 selectCommerce(g,'c1-outfit:seline','relayHead');experienceServiceAction(g,'outfit-buy:seline:relayHead');assert.equal(g.p.gold,77);experienceServiceAction(g,'outfit-sell:seline:outfit-seline-relayHead');assert.equal(g.p.gold,89);experienceServiceAction(g,'outfit-sell:seline:outfit-seline-relayHead');assert.equal(g.p.gold,89);
 const r=reload(g);assert.equal(r.experienceBuy('seline','relayHead'),false);r.chapter=8;experienceServiceAction(r,'outfit-buy:seline:relayWeapon');assert.equal(r.p.gold,g.p.gold);
});
