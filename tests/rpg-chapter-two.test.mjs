import test from 'node:test';import assert from 'node:assert/strict';
import {RPG,stats,MAPS} from '../dist/core-v14.js';import {parseSave} from '../dist/save-transfer-v14.js';
import {DIALOGUES} from '../dist/data-v14.js';import {StoryFlow} from '../dist/story-flow-v14.js';
import {takePumpReward} from '../dist/chapter-runtime-v14.js';import {experienceServicePanel} from '../dist/rpg-experience-services-ui.js';
const game=(cls='shadow')=>{const g=new RPG(cls,null,()=>.44);g.chapter=7;g.enter('inn');g.pending=null;g.active=true;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];return g;};
const near=(g,id)=>{const n=g.npcs.find(n=>n.id===id)||g.props.find(p=>p.id===id);g.relocate(n.interactX??n.x,(n.interactY??n.y)+(n.interactY?0:55));};
const restore=g=>new RPG(g.p.cls,parseSave(JSON.stringify(g.snapshot())),()=>.44);
const finish=g=>{for(let i=0;g.pending&&i<20;i++)g.finishScene();assert.equal(g.pending,null);};

test('relay counter compares actual stats, buys/equips/sells; phase, capacity and duplicate guards hold',()=>{
 for(const cls of ['shadow','oath','ember']){
  const g=game(cls);g.p.level=6;g.p.gold=242;near(g,'seline');const preview=g.experiencePreview('seline','relayWeapon');assert.ok(g.experienceBuy('seline','relayWeapon'));assert.equal(g.p.gold,157);assert.equal(g.experienceBuy('seline','relayWeapon'),false);assert.ok(g.experienceEquip('seline','outfit-seline-relayWeapon'));assert.equal(stats(g.p).atk,preview.after.atk);assert.ok(!experienceServicePanel(g,'seline').body.includes('outfit-potion:seline'));
  g.p.gold=0;assert.equal(g.experienceBuy('seline','relayHead'),false);g.p.gold=200;g.p.bag=Array.from({length:60},(_,i)=>({...g.p.gear.weapon,id:'full'+i}));assert.equal(g.experienceBuy('seline','relayHead'),false);assert.equal(g.p.gold,200);g.p.bag=[];assert.ok(g.experienceBuy('seline','relayHead'));const id=g.p.bag[0].id;assert.ok(g.experienceSell('seline',id));assert.equal(g.p.gold,200-48+12);assert.equal(g.experienceSell('seline',id),false);
  const r=restore(g);near(r,'seline');assert.equal(r.experienceBuy('seline','relayWeapon'),false);r.chapter=8;assert.equal(r.experienceService('seline'),null);assert.equal(r.experienceBuy('seline','relayChest'),false);
 }
});
test('repair is a lasting free rest result; both real locations, pending resume and actual reward remain correct',()=>{
 const g=game();g.p.gold=100;g.p.hp=1;near(g,'seline');assert.ok(g.choose('ch2:rest'));assert.equal(g.pending.id,'innRestTalk');assert.equal(g.p.gold,100);finish(g);assert.equal(g.p.gold,80);assert.equal(g.p.hp,stats(g.p).hp);assert.equal(g.choose('ch2:rest'),false);assert.equal(g.p.gold,80);
 g.flags.pumpTool=true;g.quests.pump='active';g.apply('pump_fixed');finish(g);assert.ok(g.flags.pumpFixed);assert.equal(g.quests.pump,'active');assert.ok(takePumpReward(g,'medicine'));finish(g);const gold=g.p.gold,hp=g.p.items.hp;assert.equal(takePumpReward(g,'medicine'),false);assert.equal(g.p.items.hp,hp);
 near(g,'seline');g.p.hp=1;assert.ok(g.choose('ch2:rest'));assert.equal(g.pending.id,'c2PumpRest');const flow=new StoryFlow(g,DIALOGUES.c2PumpRest);flow.advance();const r=restore(g);assert.equal(r.pending.line,1);finish(r);assert.equal(r.p.gold,gold);assert.equal(r.p.hp,stats(r.p).hp);
 near(r,'inn-rest');r.p.mp=0;assert.ok(r.useProp('inn-rest'));finish(r);assert.equal(r.p.mp,stats(r.p).mp);assert.equal(r.p.gold,gold);r.chapter=8;r.p.hp=1;assert.equal(r.useProp('inn-rest'),false);
});
test('rest cannot be applied from another map, distant menu, dead player or through active threats',()=>{
 const g=game();g.flags.pumpFixed=true;g.p.hp=1;near(g,'seline');g.bullets.push({friendly:false});assert.equal(g.choose('ch2:rest'),false);g.bullets=[];g.relocate(1300,850);assert.equal(g.choose('ch2:rest'),false);g.enter('post');g.pending=null;assert.equal(g.apply('ch2_paid_rest'),false);assert.equal(g.p.hp,1);
});
test('cellar supplies pay once only after a legal claim; full bag and legacy claimed boxes do not print medicine',()=>{
 const g=game();g.enter('bridgecellar');finish(g);near(g,'v9-toll-box');const before={...g.p.items};g.p.bag=Array.from({length:60},(_,i)=>({id:'x'+i,name:'x',slot:'head',rarity:'common',atk:0,hp:1}));g.useProp('v9-toll-box');assert.equal(g.flags.v9TollClaimed,undefined);assert.equal(g.p.items.mp,before.mp);g.p.bag=[];g.useProp('v9-toll-box');assert.equal(g.p.items.mp,before.mp+2);assert.equal(g.p.items.hp,before.hp+1);assert.equal(g.p.bag[0].hp,24);finish(g);const r=restore(g);near(r,'v9-toll-box');r.useProp('v9-toll-box');assert.equal(r.p.items.mp,before.mp+2);
 const legacy=game();legacy.flags.v9TollClaimed=true;legacy.p.bag.push({id:'quest-v9-dry-knot',slot:'relic',name:'干绳护符',rarity:'rare',hp:8,atk:0,affix:'mercy'});const n=legacy.p.items.hp,z=restore(legacy);assert.equal(z.p.bag.find(i=>i.id==='quest-v9-dry-knot').hp,24);assert.equal(z.p.items.hp,n);assert.equal(z.p.bag.length,legacy.p.bag.length);
});
test('authored guard roles cooperate and preserve off-map deaths, health ratio, XP and claims on restore',()=>{
 const g=game();g.enter('manor');finish(g);g.apply('ch2_alarm');const es=g.enemies;assert.equal(new Set(es.map(e=>e.experienceRole)).size,3);assert.ok(es.every(e=>e.groupId==='c2-manor-wave'));
 const e=es[0],f=es[1];e.hp=e.maxHP/2;g.damage(f,99999);const snap=g.snapshot();delete snap.states.manor.enemies[0].c2ExperienceRevision;snap.states.manor.enemies[0].maxHP=240;snap.states.manor.enemies[0].hp=120;const r=new RPG('shadow',parseSave(JSON.stringify(snap)));assert.equal(r.enemies[0].hp,165);assert.ok(r.enemies[1].dead);assert.equal(r.p.gold,snap.p.gold);
 r.enter('spillway');const q=restore(r);assert.ok(q.states.manor.enemies[1].dead);assert.equal(q.states.manor.enemies[0].hp,165);
});
test('front guard responds to position and skills, while DOT is not silently weakened',()=>{
 const g=game();g.enter('manor');finish(g);g.apply('ch2_alarm');const e=g.enemies[0];e.angle=0;
 const hit=(x,kind)=>{e.hp=e.maxHP;e.exposedUntil=0;g.p.x=e.x+x;g.p.y=e.y;const hp=e.hp;g.damage(e,40,kind);return hp-e.hp;};
 const front=hit(80,'hit'),rear=hit(-80,'hit');assert.ok(rear>front);const dotA=hit(80,'dot'),dotB=hit(-80,'dot');assert.equal(dotA,dotB);hit(80,'skill');assert.ok(e.exposedUntil>g.time);
});
test('unsafe automatic arrivals and east-court cutaway defer, survive save, and retain original audience knowledge',()=>{
 const g=game();g.enter('manor');finish(g);g.flags.targetCutaway=false;g.relocate(1100,600);const e=g.enemy('guard',1100,650,'ch2-cutaway-test');g.enemies.push(e);g.update(.035,{});assert.equal(g.pending,null);assert.equal(g.flags.targetCutaway,false);const r=restore(g);r.damage(r.enemies.find(x=>x.id==='ch2-cutaway-test'),99999);r.bullets=[];r.active=true;assert.ok(r.c2SceneTick());assert.equal(r.pending.id,'ch2TargetBefore');const knowledge=structuredClone(r.knowledge);finish(r);assert.deepEqual(r.knowledge.hero,knowledge.hero);assert.deepEqual(r.knowledge.saint,knowledge.saint);assert.ok(r.knowledge.player.includes('hester-tax-abuse'));assert.equal(r.c2SceneTick(),false);
 const h=game();h.ensureMap('bridge');h.states.bridge.enemies.push(h.enemy('guard',230,600,'ch2-entry-test'));h.enter('bridge',230,600);assert.equal(h.pending,null);assert.equal(h.flags.bridgeSeen,false);
});
test('the well chain is a real one-time control tool and old pending mainline scenes remain readable',()=>{
 const g=game();g.enter('wellcrypt');finish(g);near(g,'v9-warden-chain');const e=g.enemies.find(e=>e.id==='secret-warden');g.useProp('v9-warden-chain');finish(g);assert.ok(e.stun>=1.2&&e.slow>=3);assert.ok(g.flags.v9ChainDropped);e.stun=0;g.useProp('v9-warden-chain');assert.equal(e.stun,0);
 const r=restore(g);assert.ok(r.flags.v9ChainDropped);r.beginScene('ch2InnerDoor','ch2_inner');const f=new StoryFlow(r,DIALOGUES.ch2InnerDoor);f.advance();const z=restore(r);assert.equal(z.pending.line,r.pending.line);assert.deepEqual(new StoryFlow(z,DIALOGUES.ch2InnerDoor).current,f.current);
});

 test('a deferred spillway conversation remains available after escaping and uses the real safe arrival',()=>{
 const g=game();g.chapter=10;g.ensureMap('spillway');g.states.spillway.enemies.push(g.enemy('guard',260,700,'ch2-defer-threat'));g.enter('spillway',260,700);assert.equal(g.pending,null);assert.equal(g.flags.spillSeen,false);g.enter('exile',260,700);g.pending=null;g.active=true;assert.ok(g.c2SceneTick());assert.equal(g.pending.id,'ch2Spillway');const flow=new StoryFlow(g,DIALOGUES.ch2Spillway);assert.equal(flow.cine.map,'exile');assert.deepEqual([flow.cine.get('hero').x,flow.cine.get('hero').y],[g.p.x,g.p.y]);const r=restore(g);finish(r);assert.ok(r.flags.spillSeen);assert.equal(r.c2SceneTick(),false);assert.equal(r.map,'exile');
 });
