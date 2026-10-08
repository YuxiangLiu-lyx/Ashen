import {stats,needXP,MAPS} from '../../dist/core-v14.js';
import {createEncounter} from './simulator.mjs';
import {CH5_QUESTS,CH5_SET_RECIPES,CH5_ALCHEMY,CH5_MATERIALS} from '../../dist/chapter5-economy-v14.js';
import {CH5_ENEMY_PROFILES} from '../../dist/chapter5-world-v14.js';
import {POTIONS,GEAR_SELL_PRICE} from '../../dist/systems-data-v14.js';

const paths={
  main:[{kind:'apply',action:'v14ch5:city-seen'},{kind:'apply',action:'v14ch5:exit-done'}],
  partial:[{kind:'apply',action:'v14ch5:city-seen'},{kind:'quest',id:'ch5ForgeWork'},{kind:'craft',id:'weapon'},{kind:'apply',action:'v14ch5:exit-done'}],
  collection:[{kind:'apply',action:'v14ch5:city-seen'},...Object.keys(CH5_QUESTS).map(id=>({kind:'quest',id})),
    ...CH5_SET_RECIPES.map(r=>({kind:'craft',id:r.id})),{kind:'apply',action:'v14ch5:exit-done'}],
  grind:[{kind:'apply',action:'v14ch5:city-seen'},...Array.from({length:60},()=>({kind:'kill',enemy:'ch5Guard',map:'ch5Training'})),{kind:'apply',action:'v14ch5:exit-done'}],
  failures:[{kind:'apply',action:'v14ch5:city-seen'},...Array.from({length:20},()=>({kind:'wound-and-potion',id:'hpLarge'})),{kind:'apply',action:'v14ch5:exit-done'}],
};
export const ECONOMY_LIMITS=[
  'Chapter-five ledger foundation, not an eight-chapter campaign simulator; main contains city/exit grants only',
  'Quest prerequisites and wound/kill events are explicit supplied fixtures, not observed playthroughs or reachable-route proofs',
  'Injected quest materials are counted separately; not earned income or verified gathering/drop paths',
  'Rewards, claim retry prevention, crafting, potion prices/consumption, kill drops and XP leveling call real installed RPG methods',
  'Craft failures reveal the supplied route budget; they do not establish universal player progression blocks',
];
const clone=v=>JSON.parse(JSON.stringify(v));
function ledger(g){return {level:g.p.level,xp:g.p.xp,gold:g.p.gold,items:clone(g.p.items),gear:g.p.bag.map(x=>({id:x.id,slot:x.slot,rarity:x.rarity,atk:x.atk,hp:x.hp})),claims:clone(g.ch5?.claims||{})};}
function mapAt(g,id){if(!MAPS[id])throw Error('Unknown economy map '+id);g.map=id;g.ensureMap(id);g.states[id].enemies=[];g.pending=null;g.transition=null;g.active=true;}

export function economyExperiment({path='partial',seed=42,events=null,level=23,gold=30,cls='shadow'}={}) {
  const plan=events||paths[path];if(!plan)throw Error('Unknown economy path');
  const {g}=createEncounter({seed,level,cls,enemy:'guard',career:{shadow:'bloodblade',oath:'dreadguard',ember:'pyromancer'}[cls]});
  mapAt(g,'ch5GrandSquare');g.apply('v14ch5:arrived');g.ch5.seed=seed;g.p.gold=gold;
  const initial=ledger(g),injected={},log=[];let rawXP=0,failures=0;
  const xp=g.gainXP;g.gainXP=function(n){rawXP+=n;return xp.call(this,n);};
  let count=0;
  for(const event of plan){
    const before=ledger(g);let ok=true,details={};
    if(event.kind==='apply'){
      if(!['v14ch5:city-seen','v14ch5:exit-done'].includes(event.action))throw Error('Unsupported ledger callback '+event.action);
      g.apply(event.action);
    }
    else if(event.kind==='quest'){
      const q=CH5_QUESTS[event.id];if(!q)throw Error('Unknown quest');
      mapAt(g,q.map);g.flags.ch5CitySeen=true;g.apply('v14ch5:accept:'+event.id);
      const progress=g.ch5.quests[event.id];if(!progress)throw Error('Quest fixture did not accept');
      progress.kills=q.kills||0;
      for(const [key,n]of Object.entries(q.required)){const missing=Math.max(0,n-(g.p.items[key]||0));g.p.items[key]=(g.p.items[key]||0)+missing;injected[key]=(injected[key]||0)+missing;}
      ok=g.claimChapter5Quest(event.id);details.claimRetry=g.claimChapter5Quest(event.id);
    }else if(event.kind==='craft'){
      mapAt(g,'ch5Forge');ok=g.ch5Action('craft',event.id);
    }else if(event.kind==='kill'){
      if(!CH5_ENEMY_PROFILES[event.enemy])throw Error('Unknown chapter-five enemy');
      mapAt(g,event.map);const e=g.enemy(event.enemy,850,740,'economy-kill-'+(++count));g.states[g.map].enemies.push(e);
      g.damage(e,e.maxHP*100,'enchant');details={enemy:e.type,tier:e.v28Tier,killed:e.dead};
    }else if(event.kind==='wound-and-potion'){
      mapAt(g,'ch5Market');const id=event.id;if(!POTIONS[id])throw Error('Unknown potion');
      if(!(g.p.items[id]>0))details.purchased=g.buyPotion(id);
      // Explicit wound fixture; regeneration/cooldown then advance with real runtime ticks.
      g.p.hp=Math.max(1,g.p.hp-POTIONS[id].amount);ok=g.potion(id);
      for(let i=0;i<320;i++)g.update(.025,{});
    }else throw Error('Unknown economy event '+event.kind);
    if(!ok)failures++;
    log.push({event,ok,details,before,after:ledger(g)});g.events=[];
  }
  return {schema:1,path,seed,parameters:{level,gold,cls,events:clone(plan)},initial,final:ledger(g),
    metrics:{rawXP,goldDelta:g.p.gold-initial.gold,failedActions:failures,questMaterialsInjected:injected,
      gearObtained:g.p.bag.length-initial.gear.length},growthCurve:Array.from({length:32},(_,i)=>({level:i+1,needXP:needXP(i+1)})),
    prices:{potions:POTIONS,craft:CH5_SET_RECIPES,alchemy:CH5_ALCHEMY,materials:CH5_MATERIALS,sell:GEAR_SELL_PRICE},events:log,limits:ECONOMY_LIMITS};
}

export const ECONOMY_PATHS=Object.keys(paths);
