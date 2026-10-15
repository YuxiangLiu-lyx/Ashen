import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {RPG,MAPS}from '../dist/core-v14.js';import{parseSave}from '../dist/save-transfer-v14.js';
import{drawRestrainedWarning,enduranceFactor}from '../dist/encounter-restraint.js';
import{preparationAction,preparationPanel}from '../dist/chapter-one-preparation-ui.js';
import{DIALOGUES}from '../dist/data-v14.js';
const reload=g=>new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.44);
test('new durability preserves partial health and corpses over repeated loads and map queries',()=>{
 for(const [map,type,phase]of [['canal','captain',3],['bridge','guard',7],['hellGate','hellHound',12],['hellApproach','ironScuttler',12]]){
  let g=new RPG('shadow',phase>=12?JSON.parse(fs.readFileSync('docs/rpg-experience/c2/natural-005/shadow/10-chapter-two-end-save.json')):null,()=>.44);g.chapter=phase;g.enter(map);g.pending=null;
  const e=g.enemy(type,800,700,'durability-fixture');g.states[map].enemies=[e];assert.ok(e.maxHP>0);assert.ok(e.endurance,map);
  e.hp=Math.round(e.maxHP*.4);const hp=e.hp,max=e.maxHP;
  for(let n=0;n<4;n++){g=reload(g);g.ensureMap(map);assert.equal(g.enemies[0].hp,hp,map);assert.equal(g.enemies[0].maxHP,max,map);}
  g.enemies[0].dead=true;g.enemies[0].hp=0;g=reload(g);assert.equal(g.enemies[0].hp,0);assert.equal(g.enemies[0].dead,true);
 }
 const native=new RPG('shadow',JSON.parse(fs.readFileSync('docs/rpg-experience/c2/natural-005/shadow/10-chapter-two-end-save.json')));
 native.enter('hellMine');native.pending=null;const elites=native.enemies.filter(e=>e.elite);assert.ok(elites.length);
 for(const e of elites){assert.equal(e.endurance.maxHP,Math.round(e.endurance.base*1.65));e.hp=Math.round(e.maxHP*.3);}
 const living=elites.map(e=>({id:e.id,hp:e.hp,maxHP:e.maxHP}));const saved=reload(native);assert.deepEqual(saved.enemies.filter(e=>e.elite).map(e=>({id:e.id,hp:e.hp,maxHP:e.maxHP})),living);
 const weak=native.enemy('hellHound',800,600,'weak-fixture');weak.hp=weak.maxHP=Math.round(weak.maxHP*.48);native.enemies.push(weak);const weakHP=weak.maxHP;native.ensureMap('hellMine');assert.equal(weak.maxHP,weakHP);assert.equal(reload(native).enemies.find(e=>e.id===weak.id).maxHP,weakHP);
 assert.equal(enduranceFactor({type:'odric',isBoss:true},'deepBastion'),1);
 const fresh=new RPG('shadow');fresh.ensureMap('deepBastion');assert.ok(fresh.states.deepBastion.enemies.every(e=>!e.endurance),'creating a later map from the hall must not apply early-game HP');
});
test('selecting a grid only reveals details; unavailable early services remain locked',()=>{
 const g=new RPG('shadow');g.pending=null;const before=g.snapshot(),html=preparationPanel(g,'c1-shop').body;
 assert.match(html,/inventory-grid/);assert.doesNotMatch(html,/data-c1="supply:hp"/);preparationAction(g,'inspect:shop:supply:hp');assert.match(preparationPanel(g,'c1-shop').body,/data-c1="supply:hp"/);
 assert.deepEqual(g.p,before.p);assert.equal(g.c1Expansion.preparation.approved,false);assert.doesNotMatch(preparationPanel(g,'c1-loom').body,/inspect:loom:recipe/);
});
test('elite has no floor VFX; boss outlines use actual radius, arc and locked line origin',()=>{
 const calls=[],c=new Proxy({}, {get:(_,name)=>typeof name==='string'?((...a)=>calls.push([name,...a])):undefined,set:()=>true});
 const e={type:'guard',isBoss:false,wind:.5,windMax:1,telegraph:{shape:'circle',r:118,x:400,y:500}};drawRestrainedWarning(c,e);assert.equal(calls.length,0);
 e.type='captain';drawRestrainedWarning(c,e);assert.ok(calls.some(a=>a[0]==='arc'&&a[1]===400&&a[2]===500&&a[3]===118));
 calls.length=0;e.telegraph={shape:'line',length:245,width:58,a:0,x:420,y:530};drawRestrainedWarning(c,e);assert.ok(calls.some(a=>a[0]==='translate'&&a[1]===420&&a[2]===530));assert.ok(calls.some(a=>a[0]==='lineTo'&&a[1]===245&&a[2]===29));assert.ok(!calls.some(a=>['fill','drawImage','createRadialGradient'].includes(a[0])));
});
test('edited conversations keep page roles and pending full-text saves retain the original words',()=>{
 const original=fs.readFileSync('docs/c1-restraint/before/chapter-one-trial-dialogues.js.txt','utf8');const before=Function(original.replace('export const C1_TRIAL_DIALOGUES=', 'return '))();
 for(const [id,length]of [['c1TrialInvitation',16],['c1TrainingReason',5],['c1TrialReport',19]]){
  assert.equal(DIALOGUES[id].length,length);assert.deepEqual(DIALOGUES[id].map(r=>r[0]),before[id].map(r=>r[0]));
  for(const lines of [before[id],JSON.parse(fs.readFileSync('docs/c1-restraint/SCRIPT.json')).scenes[id]]){
   let g=new RPG('shadow');g.chapter=1;g.pending={id,line:2,then:null,lines};
   const r=reload(g);for(const field of ['id','line','lines','then'])assert.deepEqual(r.pending[field],g.pending[field],id+':'+field);
  }
 }
 const loom=MAPS.hall.props.find(p=>p.id==='c1-loom');assert.equal(loom.c1Art[3],100);assert.ok(MAPS.town.props.filter(p=>p.id.startsWith('c1-aid-')).length>=5);
});
