import {selectCommerce} from '../dist/commerce-ui.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {RPG,stats,needXP} from '../dist/core-v14.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {c1Panel,c1UIAction} from '../dist/chapter-one-expansion-ui.js';
import {C1_QUESTS} from '../dist/chapter-one-expansion-data.js';
import {DIALOGUES} from '../dist/data-v14.js';
import {StoryFlow} from '../dist/story-flow-v14.js';
import fs from 'node:fs';
import {EXPERIENCE_CACHES,EXPERIENCE_DUNGEONS} from '../dist/rpg-experience-exploration.js';
import {EXPERIENCE_INSPECTIONS} from '../dist/rpg-experience-dialogues.js';
import {EXPERIENCE_EVENTS} from '../dist/rpg-experience-triggers.js';
import {STAGING} from '../dist/staging-v14.js';
const finish=g=>{for(let i=0;g.pending&&i<80;i++)g.finishScene();g.active=true;};
const enter=(g,map)=>{g.enter(map);finish(g);};
const kill=g=>{for(const e of g.enemies)if(!e.dead)g.damage(e,99999);finish(g);};
const inspect=(g,id)=>{const p=g.props.find(p=>p.id===id);g.relocate(p.interactX,p.interactY);return g.useProp(id);};
const game=()=>{const g=new RPG('shadow',null,()=>.9);g.pending=null;g.active=true;return g;};
const near=(g,id)=>{const n=g.npcs.find(n=>n.id===id);g.relocate(n.x,n.y+55);};
test('overkill behind a vulnerable enemy never serializes negative health',()=>{const g=game();g.map='c1DrillGallery';g.ensureMap(g.map);const e=g.enemies[0];e.angle=0;g.p.x=e.x-60;g.p.y=e.y;g.damage(e,99999);assert.equal(e.hp,0);assert.equal(e.dead,true);parseSave(JSON.stringify(g.snapshot()));});
test('regional roles stay fixed at high level; other chapters retain their profiles',()=>{
 const g=game();g.map='c1DrillGallery';const a=g.enemy('rat',500,500,'c1-sentry-1');g.p.level=20;const b=g.enemy('rat',500,500,'c1-sentry-1');assert.equal(a.maxHP,b.maxHP);assert.equal(a.experienceRole,'drillSentry');
 g.chapter=6;g.map='bridge';assert.equal(g.enemy('guard',500,500,'bridge-new').experienceRole,undefined);
});
test('construct facing and a real skill hit create different counterattack windows',()=>{
 const g=game();g.map='c1DrillGallery';g.ensureMap(g.map);const e=g.enemies.find(e=>e.id==='c1-sentry-1');e.angle=0;g.p.x=e.x+60;g.p.y=e.y;
 let hp=e.hp;g.damage(e,40,'hit');const front=hp-e.hp;e.hp=e.maxHP;g.p.x=e.x-60;hp=e.hp;g.damage(e,40,'hit');assert.ok(hp-e.hp>front);
 e.hp=e.maxHP;g.p.x=e.x+60;g.damage(e,20,'skill');assert.ok(e.exposedUntil>g.time);hp=e.hp;g.damage(e,40,'hit');assert.ok(hp-e.hp>front);
});
test('repeat entry retains quest evidence, gives less XP and load keeps injuries/death',()=>{
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.quests.c1Readiness='active';g.enter('c1TrainingYard');g.pending=null;const e=g.enemies[0],xp=e.v28RewardXP;g.damage(e,99999,'enchant');const count=g.c1Count('c1Readiness');
 g.enter('hall');g.enter('c1TrainingYard');g.pending=null;const fresh=g.enemies.find(x=>x.id===e.id);assert.ok(fresh.v28RewardXP<xp);assert.equal(g.c1Count('c1Readiness'),count);fresh.hp=Math.floor(fresh.maxHP*.4);
 const save=parseSave(JSON.stringify(g.snapshot())),restored=new RPG('shadow',save,()=>.9);assert.equal(restored.enemies.find(x=>x.id===e.id).hp,fresh.hp);assert.equal(restored.enemies.find(x=>x.id===e.id).c1QuestGeneration,fresh.c1QuestGeneration);
 g.damage(fresh,99999,'enchant');const dead=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.9);assert.equal(dead.enemies.find(x=>x.id===e.id).dead,true);
});
test('level-up restores full health in chapter one without stripping level or AP',()=>{
 const g=game();g.p.hp=10;g.p.mp=1;g.gainXP(needXP(1));assert.equal(g.p.level,2);assert.equal(g.p.ap,3);assert.equal(g.p.hp,stats(g.p).hp);assert.ok(g.p.mp>1&&g.p.mp<stats(g.p).mp);
 const copy=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.9);assert.equal(copy.p.level,2);assert.equal(copy.p.ap,3);assert.equal(copy.p.hp,g.p.hp);
});
test('outfitter purchase is near, affordable, capacity-safe and idempotent after loading',()=>{
 const g=game();g.p.gold=100;assert.equal(g.experienceBuy('clerk','fieldChest'),false);near(g,'clerk');
 assert.ok(g.choose('experience:service:clerk'));assert.ok(g.events.some(e=>e.type==='mechanism'&&e.kind==='c1-outfit:clerk'));
 const before=stats(g.p),preview=g.experiencePreview('clerk','fieldChest');assert.ok(g.experienceBuy('clerk','fieldChest'));assert.equal(g.p.gold,78);assert.equal(g.experienceBuy('clerk','fieldChest'),false);
 assert.ok(g.experienceEquip('clerk',preview.item.id));assert.equal(stats(g.p).hp,preview.after.hp);assert.equal(stats(g.p).reduction,preview.after.reduction);assert.ok(stats(g.p).reduction>before.reduction);
 const copy=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.9);copy.pending=null;near(copy,'clerk');assert.equal(copy.experienceBuy('clerk','fieldChest'),false);assert.equal(copy.p.gold,78);
 const blocked=game();blocked.p.gold=100;near(blocked,'clerk');blocked.p.bag=Array.from({length:60},(_,i)=>({id:'bag-'+i,slot:'relic',name:'旧饰物',atk:0,hp:0,rarity:'common'}));assert.equal(blocked.experienceBuy('clerk','fieldWeapon'),false);assert.equal(blocked.p.gold,100);
});
test('actual service panel buys/equips/sells, rest and potion restore real resources',()=>{
 const g=game();g.p.gold=100;near(g,'clerk');selectCommerce(g,'c1-outfit:clerk','fieldWeapon');assert.match(c1Panel(g,'c1-outfit:clerk'),/换装后/);assert.equal(c1UIAction(g,'outfit-buy:clerk:fieldWeapon'),'c1-outfit:clerk');const item=g.p.bag.find(i=>i.id==='outfit-clerk-fieldWeapon');assert.ok(item);
 assert.equal(g.experienceSellPrice(item),4);c1UIAction(g,'outfit-sell:clerk:'+item.id);assert.equal(g.p.gold,86);assert.equal(g.experienceSell('clerk',item.id),false);
 const n=g.p.items.hp;c1UIAction(g,'outfit-potion:clerk:hp');assert.equal(g.p.items.hp,n+1);assert.equal(g.p.gold,74);
 g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.enter('c1TrialFoyer');g.pending=null;near(g,'c1iden');g.p.hp=10;g.p.mp=1;assert.ok(g.experienceRest('c1iden'));assert.equal(g.p.hp,stats(g.p).hp);assert.equal(g.p.mp,stats(g.p).mp);assert.equal(g.p.gold,74);
 g.pending=null;g.chapter=3;assert.equal(g.experienceBuyPotion('c1iden','hp'),false);assert.equal(g.experienceRest('c1iden'),false);
});
test('repair uses physical findings and earlier warden evidence, without a second kill quota',()=>{
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.quests.c1Readiness='done';enter(g,'c1DrillGallery');kill(g);enter(g,'c1TrialCrypt');kill(g);
 assert.equal(inspect(g,'c1-crypt-cable'),false,'must receive the commission');g.c1Accept('c1CryptRepair');
 assert.equal(g.c1Ready('c1CryptRepair'),false);assert.ok(inspect(g,'c1-crypt-cable'));assert.equal(g.c1Expansion.questSteps.c1CryptRepair.a,undefined,'finding commits at scene completion');
 const r=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));finish(r);assert.equal(r.c1Expansion.questSteps.c1CryptRepair.a,true);assert.equal(r.c1Ready('c1CryptRepair'),false);assert.equal(inspect(r,'c1-crypt-cable'),false);
 assert.ok(inspect(r,'c1-crypt-drain'));finish(r);assert.ok(r.c1Ready('c1CryptRepair'));const gold=r.p.gold;r.choose('c1:claim:c1CryptRepair');assert.equal(r.p.gold,gold);finish(r);assert.equal(r.p.gold,gold+14);assert.equal(r.c1Expansion.worldChanges.leakFixed,true);assert.equal(r.quests.c1CryptRepair,'done');
 r.apply('c1:localReport:c1CryptRepair');assert.equal(r.p.gold,gold+14);assert.doesNotThrow(()=>parseSave(JSON.stringify(r.snapshot())));
});
test('vault reward needs the warden and actual ledger; reloading cannot duplicate medicine',()=>{
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.quests.c1CryptRepair='done';enter(g,'c1TrialVault');g.c1Accept('c1VaultWatch');assert.equal(inspect(g,'c1-vault-ledger'),false);kill(g);assert.equal(g.c1Ready('c1VaultWatch'),false);assert.ok(inspect(g,'c1-vault-ledger'));finish(g);assert.ok(g.c1Ready('c1VaultWatch'));
 const hp=g.p.items.hp,gold=g.p.gold;g.choose('c1:claim:c1VaultWatch');const r=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));finish(r);assert.equal(r.p.items.hp,hp+2);assert.equal(r.p.gold,gold+14);r.apply('c1:localReport:c1VaultWatch');assert.equal(r.p.items.hp,hp+2);assert.equal(r.p.gold,gold+14);
});
test('nearby combat blocks inspection; stopping/reloading mid-scene keeps the actual page and handoff',()=>{
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.quests.c1Readiness='done';enter(g,'c1TrialCrypt');g.c1Accept('c1CryptRepair');const p=g.props.find(p=>p.id==='c1-crypt-cable'),e=g.enemies[0];Object.assign(e,{x:p.interactX+70,y:p.interactY});assert.equal(inspect(g,p.id),false);
 kill(g);delete g.quests.c1CryptRepair;g.choose('c1:accept:c1CryptRepair');assert.equal(g.pending.id,'c1RepairAccept');const flow=new StoryFlow(g,DIALOGUES[g.pending.id]);flow.advance();flow.advance();const copy=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));assert.equal(copy.pending.line,2);const restored=new StoryFlow(copy,DIALOGUES[copy.pending.id]);assert.equal(restored.index,2);finish(copy);assert.equal(copy.c1Ready('c1CryptRepair'),false);
});
test('one north-gate briefing settles both original payments after reading/skip, exactly once',()=>{
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.quests.c1CommissionBrief='done';g.quests.v12CourierRoad='done';g.c1Expansion.worldChanges.envelope=true;enter(g,'town');g.c1Accept('v12NorthDelivery');const gold=g.p.gold;g.choose('c1:claim:v12NorthDelivery');assert.equal(g.pending.id,'c1NorthBrief');assert.equal(g.p.gold,gold);
 const r=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));finish(r);const expected=C1_QUESTS.v12NorthDelivery.gold+C1_QUESTS.c1GateCheck.gold;assert.equal(r.p.gold,gold+expected);assert.equal(r.quests.c1GateCheck,'done');assert.equal(r.flags.gateXP,true);assert.ok(r.c1Expansion.claimLedger['quest:v12NorthDelivery']);assert.ok(r.c1Expansion.claimLedger['quest:c1GateCheck']);r.apply('c1:completeNorthBrief');assert.equal(r.p.gold,gold+expected);
 const old=game();old.chapter=2;old.quests.v12CourierRoad='done';old.quests.v12NorthDelivery='done';enter(old,'town');const before=old.p.gold;old.choose('c1:accept:c1GateCheck');assert.equal(old.pending.id,'c1GateBrief');finish(old);assert.equal(old.p.gold,before+10);assert.equal(old.quests.c1GateCheck,'done');
});
test('schema4 ready local work stays payable, partial kills are retained, migration pays nothing',()=>{
 for(const id of ['c1CryptRepair','c1VaultWatch'])for(const ready of [true,false]){
  const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.quests[id]='active';enter(g,id==='c1CryptRepair'?'c1TrialCrypt':'c1TrialVault');kill(g);const s=g.snapshot();s.c1Expansion.schema=4;delete s.c1Expansion.preparation;s.c1Expansion.journey.revision=9;
  s.c1Expansion.journey.parts[id]=id==='c1CryptRepair'?{cableRats:8,sentries:ready?8:3}:{vaultGuards:ready?8:3,cableRats:8};const gold=s.p.gold,ledger=structuredClone(s.c1Expansion.claimLedger);const r=new RPG('shadow',parseSave(JSON.stringify(s)));assert.equal(r.c1Expansion.schema,6);assert.equal(r.c1Ready(id),ready);assert.equal(r.p.gold,gold);assert.deepEqual(r.c1Expansion.claimLedger,ledger);assert.deepEqual(r.c1Expansion.journey.parts[id],s.c1Expansion.journey.parts[id]);assert.ok(r.enemies.every(e=>e.dead));
  if(ready){r.choose('c1:claim:'+id);assert.match(r.pending.id,/LegacyReturn$/);finish(r);assert.equal(r.p.gold,gold+14);}assert.doesNotThrow(()=>parseSave(JSON.stringify(r.snapshot())));
 }
});
test('each underground entrance reaches new investigation and cache targets using real movement',()=>{
 const report=[];for(const map of Object.keys(EXPERIENCE_DUNGEONS)){
  const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.quests.c1Readiness='done';enter(g,map);kill(g);g.c1Accept('c1CryptRepair');if(map==='c1TrialVault'){g.quests.c1CryptRepair='done';g.c1Accept('c1VaultWatch');}
  const targets=g.targets(),ids=[...Object.entries(EXPERIENCE_INSPECTIONS),...Object.entries(EXPERIENCE_CACHES)].filter(([,v])=>v.map===map).map(([id])=>id);let routes=0;
  for(const id of ids){const t=targets.find(t=>t.id===id);assert.ok(t,map+'/'+id);for(const door of targets.filter(t=>t.kind==='door')){g.relocate(door.x,door.y);for(const p of g.routeTo(t,g.p)){let n=0;while(Math.hypot(g.p.x-p.x,g.p.y-p.y)>4&&n++<300){const d=Math.hypot(g.p.x-p.x,g.p.y-p.y),r=Math.min(8,d);assert.ok(g.moveActor(g.p,g.p.x+(p.x-g.p.x)/d*r,g.p.y+(p.y-g.p.y)/d*r)!==false);assert.ok(!g.blocked(g.p.x,g.p.y));}assert.ok(n<300,map+'/'+id);}assert.ok(Math.hypot(g.p.x-t.x,g.p.y-t.y)<35,map+'/'+id);routes++;}}
  report.push({map,targets:ids,routes,scope:'isolated killed-enemy fixtures; actual routeTo/moveActor, no combat-completion claim'});
 }
 const dir=process.env.ASHEN_C1_EVIDENCE||'docs/rpg-experience/c1/content-space';fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(dir+'/NEW_TARGET_MOVEMENT.json',JSON.stringify(report,null,2)+'\n');
});
test('exploration caches contain real usable supplies/materials and remain empty after reload',()=>{
 for(const [id,c]of Object.entries(EXPERIENCE_CACHES)){
  const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});enter(g,c.map);kill(g);const before={...g.p.items};assert.ok(inspect(g,id));for(const [item,n]of Object.entries(c.items))assert.equal(g.p.items[item],(before[item]||0)+n);const r=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())));assert.equal(inspect(r,id),false);for(const [item,n]of Object.entries(c.items))assert.equal(r.p.items[item],(before[item]||0)+n);assert.ok(!r.targets().some(t=>t.id===id));
 }
});

test('elite migration preserves living health ratio, off-map deaths, and all settled rewards',()=>{
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});enter(g,'grove');const e=g.enemies.find(e=>e.id==='c1-elite-rat');
 e.maxHP=540;e.hp=270;e.c1Tuned=true;delete e.c1CombatRevision;const saved=parseSave(JSON.stringify(g.snapshot())),r=new RPG('shadow',saved,()=>.9);
 assert.equal(r.enemies.find(x=>x.id===e.id).hp,2025);assert.equal(r.enemies.find(x=>x.id===e.id).maxHP,4050);const twice=new RPG('shadow',parseSave(JSON.stringify(r.snapshot())),()=>.9);assert.equal(twice.enemies.find(x=>x.id===e.id).hp,2025);
 r.damage(r.enemies.find(x=>x.id===e.id),99999);const ledger=structuredClone(r.c1Expansion.claimLedger),gold=r.p.gold;r.enter('hall');const death=r.snapshot();delete death.states.grove.enemies.find(x=>x.id===e.id).c1CombatRevision;const restored=new RPG('shadow',parseSave(JSON.stringify(death)),()=>.9);assert.ok(restored.states.grove.enemies.find(x=>x.id===e.id).dead);assert.equal(restored.p.gold,gold);assert.deepEqual(restored.c1Expansion.claimLedger,ledger);
});
test('charging rat protects its front while recovery rewards a counterattack; DOT is unchanged',()=>{
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});enter(g,'grove');const e=g.enemies.find(e=>e.id==='c1-elite-rat');e.angle=0;e.telegraph={a:0};
 const hit=(x,kind='skill')=>{e.hp=e.maxHP;g.p.x=e.x+x;g.p.y=e.y;const before=e.hp;g.damage(e,40,kind);return before-e.hp;};
 const front=hit(70),rear=hit(-70);assert.ok(rear>front);const dot=hit(70,'dot');e.c1Recovery=1;const counter=hit(70);assert.ok(counter>rear);assert.equal(hit(70,'dot'),dot);
});
test('automatic scene registry uses real stages and keeps the saint cutaway away from hero knowledge',()=>{
 for(const row of EXPERIENCE_EVENTS){assert.ok(DIALOGUES[row.id]);assert.equal(STAGING.scenes[row.id].map,row.stage);for(const actor of row.actors)assert.ok(STAGING.scenes[row.id].actors[actor]);}
 assert.ok(!STAGING.scenes.saintBrief.actors.hero);
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});const knowledge=structuredClone(g.knowledge);g.enter('town');assert.equal(g.pending.id,'saintBrief');finish(g);assert.deepEqual(g.knowledge,knowledge);g.enter('workshop');g.enter('town');assert.equal(g.pending,null);
});
test('unsafe entrance defers its scene, reload and a safe tick restore it exactly once',()=>{
 const g=game();g.chapter=2;Object.assign(g.c1Expansion.preparation,{started:true,approved:true});g.ensureMap('town');g.map='town';const e=g.enemy('guard',800,800,'trigger-fixture');g.states.town.enemies.push(e);g.map='hall';g.enter('town',800,800);
 assert.equal(g.pending,null);assert.equal(g.flags.cityIntro,false);assert.equal(g.experienceSceneTick(),false);
 const r=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.9);r.damage(r.enemies.find(e=>e.id==='trigger-fixture'),99999);r.pending=null;r.active=true;
 r.transition={to:'workshop'};assert.equal(r.experienceSceneTick(),false);r.transition=null;r.beginScene('_spoken');assert.equal(r.experienceSceneTick(),false);finish(r);
 r.bullets.push({friendly:false});assert.equal(r.experienceSceneTick(),false);r.bullets=[];assert.ok(r.experienceSceneTick());assert.equal(r.pending.id,'saintBrief');
 const f=new StoryFlow(r,DIALOGUES.saintBrief);f.advance();const saved=parseSave(JSON.stringify(r.snapshot())),s=new RPG('shadow',saved,()=>.9);assert.equal(s.pending.line,saved.pending.line);finish(s);assert.equal(s.experienceSceneTick(),false);assert.ok(s.flags.cityIntro);
});
