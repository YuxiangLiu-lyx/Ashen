import test from 'node:test';
import assert from 'node:assert/strict';
import {RPG,stats,needXP} from '../dist/core-v14.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {c1Panel,c1UIAction} from '../dist/chapter-one-expansion-ui.js';
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
 const g=game();g.chapter=2;g.quests.c1Readiness='active';g.enter('c1TrainingYard');g.pending=null;const e=g.enemies[0],xp=e.v28RewardXP;g.damage(e,99999,'enchant');const count=g.c1Count('c1Readiness');
 g.enter('hall');g.enter('c1TrainingYard');g.pending=null;const fresh=g.enemies.find(x=>x.id===e.id);assert.ok(fresh.v28RewardXP<xp);assert.equal(g.c1Count('c1Readiness'),count);fresh.hp=Math.floor(fresh.maxHP*.4);
 const save=parseSave(JSON.stringify(g.snapshot())),restored=new RPG('shadow',save,()=>.9);assert.equal(restored.enemies.find(x=>x.id===e.id).hp,fresh.hp);assert.equal(restored.enemies.find(x=>x.id===e.id).c1QuestGeneration,fresh.c1QuestGeneration);
 g.damage(fresh,99999,'enchant');const dead=new RPG('shadow',parseSave(JSON.stringify(g.snapshot())),()=>.9);assert.equal(dead.enemies.find(x=>x.id===e.id).dead,true);
});
test('level-up restores a bounded amount in chapter one without stripping level or AP',()=>{
 const g=game();g.p.hp=10;g.p.mp=1;g.gainXP(needXP(1));assert.equal(g.p.level,2);assert.equal(g.p.ap,3);assert.ok(g.p.hp>10&&g.p.hp<stats(g.p).hp);assert.ok(g.p.mp>1&&g.p.mp<stats(g.p).mp);
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
 const g=game();g.p.gold=100;near(g,'clerk');assert.match(c1Panel(g,'c1-outfit:clerk'),/换装后/);assert.equal(c1UIAction(g,'outfit-buy:clerk:fieldWeapon'),'c1-outfit:clerk');const item=g.p.bag.find(i=>i.id==='outfit-clerk-fieldWeapon');assert.ok(item);
 assert.equal(g.experienceSellPrice(item),4);c1UIAction(g,'outfit-sell:clerk:'+item.id);assert.equal(g.p.gold,86);assert.equal(g.experienceSell('clerk',item.id),false);
 const n=g.p.items.hp;c1UIAction(g,'outfit-potion:clerk:hp');assert.equal(g.p.items.hp,n+1);assert.equal(g.p.gold,74);
 g.chapter=2;g.enter('c1TrialFoyer');g.pending=null;near(g,'c1iden');g.p.hp=10;g.p.mp=1;assert.ok(g.experienceRest('c1iden'));assert.equal(g.p.hp,stats(g.p).hp);assert.equal(g.p.mp,stats(g.p).mp);assert.equal(g.p.gold,74);
 g.pending=null;g.chapter=3;assert.equal(g.experienceBuyPotion('c1iden','hp'),false);assert.equal(g.experienceRest('c1iden'),false);
});
