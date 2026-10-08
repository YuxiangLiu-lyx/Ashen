import test from 'node:test';import assert from 'node:assert/strict';
import {RPG,stats,loot,skillNumbers,CLASSES} from '../dist/core-v14.js';
import {COMBAT_BALANCE,profileForEnemy} from '../dist/balance-v14.js';
import {V28_RARE_GEAR} from '../dist/combat-overhaul-v28.js';
import {installCombatOverhaulV28} from '../dist/combat-overhaul-v28.js';
import {ENCHANT_RULES} from '../dist/combat-data-v14.js';
import {simulate,createEncounter,seeded,summarize,normalizeConfig} from '../tools/balance_lab/simulator.mjs';
import {effectCatalog,queryEffects} from '../tools/balance_lab/effects.mjs';
import {economyExperiment,ECONOMY_PATHS} from '../tools/balance_lab/economy.mjs';

test('same seeds replay complete combat metrics and events exactly',()=>{
 const config={enemy:'captain',cls:'shadow',seed:71,strategy:'combo'};
 assert.deepEqual(simulate(config),simulate(config));
 assert.notDeepEqual(simulate({...config,seed:72}).events,simulate(config).events);
});
test('all base classes run real ordinary, elite and boss encounters',()=>{
 for(const cls of ['shadow','oath','ember'])for(const enemy of ['guard','deepElite','captain']){
  const run=simulate({cls,enemy,seed:42});
  assert.ok(['win','loss','timeout'].includes(run.outcome));assert.ok(run.metrics.damage>0);
  assert.ok(run.metrics.damage<=run.metrics.enemyInitialHP,'nested proc and overkill never double count');
  if(enemy==='captain'){assert.ok(run.metrics.damageReceived>0);assert.ok(run.metrics.enemyAttacks>0);}
  if(enemy==='deepElite')assert.equal(createEncounter({cls,enemy}).enemy.elite,true);
 }
});
test('direct real RPG q matches experiment first cast damage/cost/cooldown',()=>{
 const {g,enemy,config}=createEncounter({gearRarity:'common',seed:91,enemy:'captain'});
 const before=enemy.hp,mp=g.p.mp;assert.equal(g.skill('q'),true);
 const experiment=simulate(config);const damage=experiment.events.find(e=>e.type==='damage');
 assert.equal(damage.amount,before-enemy.hp);assert.equal(experiment.events.find(e=>e.type==='use').mpSpent,mp-g.p.mp);
 assert.equal(experiment.events.find(e=>e.type==='use').cooldown,g.p.cd.q);
 assert.equal(g.p.cd.q,skillNumbers(g.p,'q',CLASSES.shadow).cd);
});
test('base bleed and e consume real stacks; boss damage differs from ordinary',()=>{
 const {g,enemy:e}=createEncounter({enemy:'captain',gearRarity:'common'});
 g.skill('q');assert.equal(e.bleed,2);assert.equal(e.bleedTime,COMBAT_BALANCE.bleedDuration);
 g.p.cd.action=0;g.p.cd.attack=0;g.attack();assert.equal(e.bleed,3);
 g.p.cd.action=0;g.p.cd.e=0;g.skill('e');assert.equal(e.bleed,0);assert.equal(e.bleedTime,0);
 const boss=createEncounter({enemy:'captain',gearRarity:'common'}),ordinary=createEncounter({enemy:'guard',gearRarity:'common'});
 const hb=boss.enemy.hp,ho=ordinary.enemy.hp;boss.g.damage(boss.enemy,100,'dot');ordinary.g.damage(ordinary.enemy,100,'dot');
 assert.ok(hb-boss.enemy.hp<ho-ordinary.enemy.hp);
});
test('career bleed uses separate real thirty-stack state and harvest consumes it',()=>{
 const {g,enemy:e}=createEncounter({level:16,enemy:'severin',career:'bloodblade',skills:{bloodCarve:1,bloodHarvest:1},distance:90});
 for(let i=0;i<12;i++){g.p.cd.action=0;g.p.cd.bloodCarve=0;g.p.mp=stats(g.p).mp;g.skill('bloodCarve');}
 assert.equal(e.careerBleed.stacks,30);g.p.cd.action=0;g.p.mp=stats(g.p).mp;g.skill('bloodHarvest');
 assert.equal(e.careerBleed,undefined);
});
test('insufficient mana/action cooldown reject casts without false simulated uses',()=>{
 const {g,enemy}=createEncounter();g.p.mp=0;const hp=enemy.hp;assert.equal(g.skill('q'),false);assert.equal(enemy.hp,hp);
 g.p.mp=100;g.p.cd.q=2;assert.equal(g.requestSkill('q'),false);
 const run=simulate({enemy:'captain',strategy:'basic'});assert.equal(run.metrics.uses.q,undefined);
});
test('real AI damage, resources and distinct policies affect outcomes',()=>{
 const basic=simulate({enemy:'captain',cls:'ember',strategy:'basic'}),combo=simulate({enemy:'captain',cls:'ember',strategy:'combo'});
 assert.notDeepEqual(basic.metrics,combo.metrics);assert.ok(combo.metrics.mpSpent>0);
 const novice=simulate({enemy:'captain',cls:'shadow',strategy:'novice'});assert.notDeepEqual(novice.metrics.uses,simulate({enemy:'captain'}).metrics.uses);
});
test('invalid fixtures reject unknown enemies/skills/allocations, not silent guard fallback',()=>{
 for(const config of [{enemy:'invented'},{dt:1},{cls:'saint'},{seed:-1},{career:'riftmage'},
   {attrs:{dex:1000}},{skills:{q:99}},{skills:{bloodHarvest:1}}])assert.throws(()=>normalizeConfig(config));
});
// Isolate V28 wrapper for exact RNG boundary/ownership tests, retaining the production loot primitive.
class DropHost{
 constructor(level){this.p={level,cls:'shadow',bag:[],gear:{}};this.pendingRewards=[];this.rng=()=>0;this.obtained=[];}
 enemy(type,x,y,id){return {type,x,y,id,level:1,hp:100,maxHP:100};}
 restore(saved){this.states=saved.states;return true;}
 dropCombatLoot(e){e.baseLootCalled=true;}
 obtainGear(item){this.obtained.push(item);return true;}
 text(){}
}
installCombatOverhaulV28(DropHost,{loot});
test('V28 exact tier boundaries, no future tier relative to max player/enemy level',()=>{
 for(const [level,tier]of [[1,1],[3,1],[4,2],[6,2],[7,3],[9,3],[10,4],[12,4],[13,5],[15,5],[16,6],[18,6],[19,7],[22,7],[23,8],[32,8]]){
  const g=new DropHost(level),e=g.enemy('guard',0,0,'fixture');assert.equal(e.v28Tier,tier);g.dropCombatLoot(e);
  assert.ok(g.obtained.every(x=>x.v28Tier<=tier&&x.v28Tier>=Math.max(1,tier-1)));assert.equal(g.obtained.length,1);
 }
});
test('V28 high-level old-map and kill-time tier are recorded existing behavior',()=>{
 const g=new DropHost(1),e=g.enemy('rat',0,0,'old-map-rat');assert.equal(e.v28Tier,1);
 g.p.level=32;g.dropCombatLoot(e);assert.equal(g.obtained[0].v28Tier,7,'kill-time pool recalculates from player level');
 const higher=new DropHost(1),raw={type:'guard',id:'higher',level:23,hp:100,maxHP:100};
 higher.restore({states:{map:{enemies:[raw]}}});assert.equal(raw.v28Tier,8);
});
test('V28 1% threshold, once-only roll and scripted exclusions',()=>{
 const g=new DropHost(4),e=g.enemy('rat',0,0,'chance');g.rng=()=>.01;g.dropCombatLoot(e);assert.equal(g.obtained.length,0);
 g.rng=()=>0;g.dropCombatLoot(e);assert.equal(g.obtained.length,0,'failed chance still consumes one roll');
 for(const field of ['storyTag','trialFloor','v11Add']){const h=new DropHost(4),x=h.enemy('guard',0,0,field);x[field]=true;h.dropCombatLoot(x);assert.equal(h.obtained.length,0);}
 const h=new DropHost(4);h.rng=()=>.009999;h.dropCombatLoot(h.enemy('rat',0,0,'below'));assert.equal(h.obtained.length,1);
});
test('V28 ownership includes gear, inventory and pending rewards; saturated pool has no drop',()=>{
 const g=new DropHost(4),pool=V28_RARE_GEAR.filter(i=>i.tier<=2);
 g.p.bag=pool.slice(0,2);g.p.gear={weapon:pool[2]};g.pendingRewards=pool.slice(3);
 g.dropCombatLoot(g.enemy('guard',0,0,'owned'));assert.equal(g.obtained.length,0);
});
test('V28 legacy restore preserves HP ratio, dead state and does not tune twice',()=>{
 const g=new DropHost(8),e={type:'guard',id:'legacy',level:1,hp:50,maxHP:100};
 const dead={...e,id:'dead',hp:0,dead:true};g.restore({states:{road:{enemies:[e,dead]}}});
 assert.ok(Math.abs(e.hp/e.maxHP-.5)<.01);assert.equal(dead.hp,0);const max=e.maxHP;
 g.restore({states:g.states});assert.equal(e.maxHP,max);
});
test('real save roundtrip retains V28 markers, build and HP ratio',()=>{
 const {g,enemy}=createEncounter({enemy:'captain'});enemy.hp=Math.round(enemy.maxHP*.4);
 const saved=JSON.parse(JSON.stringify(g.snapshot())),loaded=new RPG('shadow',saved,seeded(42));
 const restored=loaded.states.road.enemies.find(x=>x.id===enemy.id);assert.equal(restored.maxHP,enemy.maxHP);
 assert.equal(restored.hp,enemy.hp);assert.equal(loaded.p.level,g.p.level);
});
test('full inventory rare gear follows real conversion behavior, not fictitious reward queue',()=>{
 const {g,enemy}=createEncounter();g.p.bag=Array.from({length:60},(_,i)=>({id:'filled-'+i}));
 g.rng=()=>0;const gold=g.p.gold;g.dropCombatLoot(enemy);
 assert.equal(g.p.bag.length,60);assert.equal(g.pendingRewards.length,0);assert.ok(g.p.gold>=gold+10);
});
test('enchant proc excludes DOT and proc; storm chain stays finite and on cooldown',()=>{
 const {g,enemy:e}=createEncounter({enemy:'captain',gearRarity:'common',gear:{weapon:{affix:'storm',enchantment:{schema:1,defId:'emberTouch',quality:'common',value:7,nonce:'test'}}}});
 const other=g.enemy('guard',e.x+20,e.y,'near');g.states[g.map].enemies.push(other);
 g.damage(e,1,'skill');assert.equal(g.p.cd.storm,8);assert.ok(e.hp>0);assert.ok(other.hp>0);
 const cooldown=g.p.cd['enchant:weaponElement'];assert.ok(cooldown>0);
 delete g.p.cd['enchant:weaponElement'];g.damage(e,1,'dot');assert.equal(g.p.cd['enchant:weaponElement'],undefined);
 g.damage(e,1,'proc');assert.equal(g.p.cd['enchant:weaponElement'],undefined);
 assert.ok(ENCHANT_RULES.excludedTriggers.includes('equipmentProc'));
});
test('real reprisal cannot exceed three charges or retrigger inside one second',()=>{
 const {g,enemy:e}=createEncounter({cls:'oath',level:16,enemy:'severin',career:'dreadguard',skills:{guardReprisal:1},distance:90,gearRarity:'common'});
 assert.equal(g.skill('guardReprisal'),true);const before=e.hp;
 g.hurt(20);assert.ok(e.hp<before);assert.equal(g.p.careerState.reprisalCharges,2);
 const first=e.hp;g.p.invuln=0;g.hurt(20);assert.equal(e.hp,first);assert.equal(g.p.careerState.reprisalCharges,2);
 for(let i=0;i<3;i++){g.p.invuln=0;g.p.cd.careerReprisal=0;g.hurt(20);}
 assert.equal(g.p.careerState.reprisalCharges,0);const final=e.hp;g.p.invuln=0;g.p.cd.careerReprisal=0;g.hurt(20);assert.equal(e.hp,final);
});
test('effects exposes base/career apply-consume and runtime-enforced proc guard descriptions',()=>{
 const catalog=effectCatalog();assert.equal(catalog.invariants.careerBleedCap,30);assert.equal(catalog.invariants.baseBleedCap,4);
 assert.ok(catalog.edges.some(e=>e.from==='shadow:q'&&e.to==='shadow:e'&&e.state==='bleed'));
 assert.ok(catalog.edges.some(e=>e.to==='bloodHarvest'&&e.state==='careerBleed'));
 assert.ok(queryEffects('bleed').effects.length>2);
 const ids=new Set(catalog.effects.map(e=>e.id));assert.equal(ids.size,catalog.effects.length);
 for(const id of catalog.v28Catalog)assert.ok(ids.has(id),id);
});
test('economy real rewards and one-time claim retry, free craft, injected prerequisites',()=>{
 const result=economyExperiment({path:'partial',seed:42});assert.deepEqual(result,economyExperiment({path:'partial',seed:42}));
 assert.equal(result.metrics.rawXP,1270);assert.equal(result.metrics.goldDelta,360);assert.equal(result.metrics.failedActions,0);
 assert.equal(result.events.find(e=>e.event.kind==='quest').details.claimRetry,false);
 assert.deepEqual(result.metrics.questMaterialsInjected,{ch5GoldSand:3});assert.equal(result.metrics.gearObtained,1);
});
test('all economy paths execute; resource deficits and repeated callbacks remain visible',()=>{
 for(const path of ECONOMY_PATHS){const result=economyExperiment({path});assert.ok(Number.isFinite(result.metrics.goldDelta));}
 const collect=economyExperiment({path:'collection'});assert.ok(collect.metrics.failedActions>0,'not enough supplied materials for all set pieces');
 const repeated=economyExperiment({events:[{kind:'apply',action:'v14ch5:city-seen'},{kind:'apply',action:'v14ch5:city-seen'}]});assert.equal(repeated.metrics.goldDelta,80);
 assert.ok(economyExperiment({path:'failures'}).metrics.failedActions>0);
});
test('distribution separates censored fights and reports confidence interval',()=>{
 const runs=[simulate({enemy:'captain'}),simulate({enemy:'captain',duration:.025})];
 const summary=summarize(runs);assert.equal(summary.winRate,.5);assert.equal(summary.outcomes.timeout,1);
 assert.ok(summary.winRateWilson95[0]<.5&&summary.winRateWilson95[1]>.5);
});
