import test from 'node:test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {RPG,stats} from '../dist/core-v14.js';
import {DIALOGUES} from '../dist/data-v14.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {DEMO_MAPS_V29} from '../dist/world-design-v29.js';
import {worldOperationV29,worldPropVisibleV29,worldProgressV29} from '../dist/world-runtime-v29.js';
import {inspectWorldMap} from '../tools/world_audit.mjs';
const game=(map='echo',x=300,y=810)=>{const g=new RPG('shadow',null,()=>.44);g.chapter=1;g.enter(map,x,y);g.pending=null;g.active=true;g.events=[];g.portCD=999;return g;};
const finish=g=>{g.finishScene();g.events=[];};
const clear=g=>{for(const e of [...g.enemies])if(!e.dead)g.damage(e,10000);g.events=[];};
const at=(g,id)=>{const t=g.targets().find(p=>p.id===id);assert.ok(t,id);g.relocate(t.x,t.y);return t;};
const operate=(g,id)=>{const t=at(g,id);assert.equal(g.interact(t),true);for(let n=0;n<30&&worldOperationV29(g);n++)g.update(.035,{});};

test('all four demo maps connect every visible exit, NPC and actionable object',()=>{
 for(const id of DEMO_MAPS_V29){const report=inspectWorldMap(game(),id,20);assert.deepEqual(report.unreachable,[],JSON.stringify(report));assert.ok(report.connectedRatio>.93,JSON.stringify(report));}
});
test('operation faces the object, delays the effect, and movement cancels it',()=>{
 const g=game();const t=at(g,'echo-valve');g.interact(t);assert.ok(worldOperationV29(g));assert.ok(!g.flags.echoValve);assert.equal(g.canSave(),false);g.update(.1,{x:1});assert.equal(worldOperationV29(g),null);assert.ok(!g.flags.echoValve);
 operate(g,'echo-valve');assert.equal(g.flags.echoValve,true);const hp=g.enemies.find(e=>e.id==='echo-warden').hp;g.pending=null;g.active=true;operate(g,'echo-valve');assert.equal(g.enemies.find(e=>e.id==='echo-warden').hp,hp);
});
test('actual damage and skills cancel an operation, and a wall rejects remote use',()=>{
 const g=game();let t=at(g,'echo-valve');g.interact(t);g.p.invuln=0;g.hurt(2);assert.equal(worldOperationV29(g),null);g.active=true;t=at(g,'echo-valve');g.interact(t);g.skill('sprint');assert.equal(worldOperationV29(g),null);
 g.relocate(620,420);assert.equal(g.interact({...t,x:790,y:420}),false);assert.ok(!g.flags.echoValve);
});
test('warden death opens a physical claim, and surviving enemies prevent extraction',()=>{
 const g=game();const w=g.enemies.find(e=>e.id==='echo-warden');g.damage(w,10000);assert.equal(g.flags.echoWardenDefeated,true);assert.ok(!g.flags.echoCoreFound);assert.equal(g.p.items.echoCore||0,0);assert.equal(worldProgressV29(g),'clear-workspace');operate(g,'v29-echo-core');assert.ok(!g.flags.echoCoreFound);
 clear(g);assert.equal(worldProgressV29(g),'extract');assert.equal(g.takeEchoReward('gear'),false);operate(g,'v29-echo-core');assert.equal(g.pending.id,'v29EchoNeedNotes');assert.ok(!g.flags.echoCoreFound);
 finish(g);operate(g,'echo-notes');assert.equal(g.pending.id,'v29EchoNotes');finish(g);operate(g,'v29-echo-core');assert.equal(g.p.items.echoCore,1);assert.equal(g.quests.echo,'active');assert.equal(g.pending.id,'v29EchoCoreTaken');finish(g);
 assert.equal(worldPropVisibleV29(g,{id:'v29-echo-core'}),false);assert.equal(g.useProp('v29-echo-core'),false);assert.equal(g.p.items.echoCore,1);
});
test('accepted and discovery-first routes both return once, retain rewards and persistent state',()=>{
 for(const accepted of [false,true]){const g=game();if(accepted){g.choose('echoAccept');assert.equal(g.pending.id,'v29LottieWork');finish(g);}clear(g);operate(g,'echo-notes');finish(g);operate(g,'v29-echo-core');finish(g);
  const gold=g.p.gold;g.enter('workshop',800,870);g.choose('echoReturn');assert.equal(g.pending.id,accepted?'v29LottieReturn':'v29LottieFoundReturn');finish(g);assert.equal(g.quests.echo,'done');assert.equal(g.p.items.echoCore,0);assert.equal(g.p.gold,gold+20);assert.equal(worldProgressV29(g),'curing');assert.equal(worldPropVisibleV29(g,{id:'v29-repair-core'}),true);
  g.choose('echoReturn');assert.equal(g.p.gold,gold+20);const saved=parseSave(JSON.stringify(g.snapshot())),r=new RPG('shadow',saved,()=>.44);assert.equal(r.quests.echo,'done');r.enter('echo',300,810);assert.ok(r.enemies.every(e=>e.dead));r.chapter=3;assert.equal(worldProgressV29(r),'ready');assert.equal(r.refineryUnlocked(),true);
 }
});
test('front-slot choice is independent, bag-full retry and repeated claims stay safe',()=>{
 const g=game();clear(g);g.flags.echoLog=true;operate(g,'v29-echo-core');finish(g);at(g,'echo-machine');g.p.bag=Array.from({length:60},()=>({...g.p.gear.weapon}));assert.equal(g.takeEchoReward('gear'),false);assert.ok(!g.flags.echoChoice);g.p.bag.pop();assert.equal(g.takeEchoReward('gear'),true);assert.equal(g.takeEchoReward('book'),false);assert.equal(g.flags.echoChoice,'gear');assert.equal(g.p.items.echoCore,1);
});
test('legacy active/completed/core-claimed/pending-dialogue saves migrate without resetting progress',()=>{
 for(const phase of ['active','core','done','pending']){const g=game();g.ensureMap('millpath');const s=g.snapshot();delete s.flags.worldV29;for(const st of Object.values(s.states))delete st.layoutV29;
  s.states.millpath.enemies.push({...s.states.millpath.enemies[0],id:'millpath-5',dead:false,hp:22});s.states.echo.enemies.find(e=>e.id==='echo-0').dead=true;
  if(phase==='active')s.quests.echo='active';if(phase==='core'||phase==='done'){s.flags.echoCoreFound=true;s.flags.echoWardenDefeated=true;s.p.items.echoCore=phase==='core'?1:0;s.quests.echo=phase==='done'?'done':'active';s.flags.echoChoice='book';}
  if(phase==='pending')s.pending={id:'lottieWork',then:'echoAccept',line:1,phase:'dialogue'};
  const r=new RPG('shadow',parseSave(JSON.stringify(s)),()=>.44);assert.equal(r.states.echo.enemies.find(e=>e.id==='echo-0').dead,true);assert.equal(r.states.millpath.enemies.find(e=>e.id==='millpath-5').dead,true);assert.equal(r.p.gold,s.p.gold);assert.equal(r.flags.echoChoice,s.flags.echoChoice);if(phase==='pending'){assert.equal(r.pending.id,'lottieWork');assert.equal(r.pending.line,1);}if(phase==='core'||phase==='done')assert.equal(r.targets().some(p=>p.id==='v29-echo-core'),false);
  const pos={x:r.p.x,y:r.p.y};r.update(.01,{});assert.ok(Math.hypot(r.p.x-pos.x,r.p.y-pos.y)<5);
 }
});
test('new state round trips and rejects malformed records; old state remains optional',()=>{
 const g=game();g.worldCueV29('inspection','test');assert.deepEqual(parseSave(JSON.stringify(g.snapshot())).flags.worldV29,{schema:1,seen:['inspection']});const s=g.snapshot();s.flags.worldV29.seen=['inspection','inspection'];assert.throws(()=>parseSave(JSON.stringify(s)),/探索记录/);delete s.flags.worldV29;assert.doesNotThrow(()=>parseSave(JSON.stringify(s)));
});
test('new dialogue IDs coexist with legacy cursors and never summon an absent companion',()=>{
 for(const id of ['lottieWork','lottieCoreReturn','waterworksLog','v29LottieWork','v29LottieReturn','v29EchoNotes'])assert.ok(DIALOGUES[id],id);
 for(const [id,rows] of Object.entries(DIALOGUES).filter(([id])=>id.startsWith('v29')))assert.ok(rows.every(row=>row[0]!=='艾莉娅'),id);
});
test('legacy player in a new footprint is repaired only during restore',()=>{
 const g=game(),s=g.snapshot();delete s.flags.worldV29;delete s.states.echo.layoutV29;s.p.x=1250;s.p.y=665;
 const r=new RPG('shadow',parseSave(JSON.stringify(s)),()=>.44);assert.equal(r.blocked(r.p.x,r.p.y,false),false);const p={x:r.p.x,y:r.p.y};r.active=false;r.update(.1,{});assert.deepEqual({x:r.p.x,y:r.p.y},p);
});
test('opt-in guestroom rest keeps its old result and ends at the original position',()=>{
 const g=game('guestroom',800,600),rest=g.props.find(p=>p.action==='guestRest');g.p.hp=30;const t=at(g,rest.id),p={x:g.p.x,y:g.p.y};g.interact(t);assert.equal(g.p.hp,30);for(let i=0;i<22;i++)g.update(.035,{});assert.equal(g.pending.id,'guestRest');finish(g);assert.equal(g.p.hp,stats(g.p).hp);assert.deepEqual({x:g.p.x,y:g.p.y},p);
});
test('other 114 maps retain baseline navigation and interaction diagnostics',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('../docs/v29/MAP_AUDIT_BEFORE.json',import.meta.url))).maps,g=new RPG('shadow',null,()=>.44);
 for(const m of baseline)if(!DEMO_MAPS_V29.includes(m.id)){const report=inspectWorldMap(g,m.id);assert.deepEqual(report.unreachable,m.unreachable,m.id);assert.equal(report.walkableCells,m.walkableCells,m.id);}
});
