// Queryable descriptions from live registries, plus the verified base-skill semantics.
import {SKILL_SPEC,COMBAT_BALANCE} from '../../dist/balance-v14.js';
import {CAREERS,PROGRESSION_SKILLS,BLOODBLADE_BLEED_MAX_STACKS} from '../../dist/progression-data-v14.js';
import {ENCHANT_DEFS,ENCHANT_RULES} from '../../dist/combat-data-v14.js';
import {CH5_SETS,CH5_SET_RECIPES,CH5_DRINKS} from '../../dist/chapter5-economy-v14.js';
import {V28_RARE_GEAR} from '../../dist/combat-overhaul-v28.js';
import {V28_SKILL_CATALOG} from '../../dist/combat-overhaul-v28.js';
import {SYSTEM_SKILLS} from '../../dist/systems-data-v14.js';
import {HELL_SKILL_BOOKS,SAINT_SKILLS} from '../../dist/chapter3-combat-data-v14.js';

export function effectCatalog() {
  const base=Object.entries(SKILL_SPEC).flatMap(([cls,skills])=>Object.entries(skills).map(([id,spec])=>({
    id:cls+':'+id,source:'dist/balance-v14.js',runtime:'dist/core-v14.js',spec,
    applies:cls==='shadow'&&id==='q'?['bleed']:cls==='oath'&&id==='e'?['guard','empower']:cls==='ember'&&id==='q'?['fireMark']:[],
    consumes:cls==='shadow'&&id==='e'?['bleed']:cls==='ember'&&id==='e'?['fireMark']:[],
  })));
  const career=Object.values(PROGRESSION_SKILLS).map(s=>({id:s.id,source:'dist/progression-data-v14.js',runtime:'dist/progression-runtime-v14.js',
    spec:s,applies:[s.bleed?'careerBleed':null,s.burn?'careerBurn':null,s.mark?'mark':null,s.fracture?'fracture':null,s.control?'control':null,s.slow?'slow':null,s.buff].filter(Boolean),
    consumes:s.consumeBleed?['careerBleed']:[],interactions:{manaHit:s.manaHit||false,drain:s.drain||0,hpCost:s.hpCost||0,
      conditionalDamage:{marked:s.markedBonus||null,shield:s.shieldBonus||null,burn:s.burnBonus||null,frozen:s.frozenBonus||null,execute:s.execute||null}}}));
  const enchant=Object.values(ENCHANT_DEFS).map(s=>({id:s.id,source:'dist/combat-data-v14.js',runtime:'dist/enchantments-v14.js',spec:s,
    affectedSkills:s.skills||[],stackGroup:s.stackGroup||s.procFamily||null,applies:s.slow?['slow']:[],consumes:[]}));
  // HELL_SKILL_BOOKS already contains SYSTEM_SKILLS; preserve one definition per ID.
  const learned=[...HELL_SKILL_BOOKS,...SAINT_SKILLS].map(s=>({id:s.id,
    source:SYSTEM_SKILLS.includes(s)?'dist/systems-data-v14.js':'dist/chapter3-combat-data-v14.js',
    runtime:SYSTEM_SKILLS.includes(s)?'dist/systems-runtime-v14.js':'dist/chapter3-runtime-v14.js',spec:s,
    applies:[s.mechanic?.kind==='selfShield'?'shield':null,s.mechanic?.rootDuration?'root':null,
      s.mechanic?.slowDuration||s.mechanic?.bossSlowDuration?'slow':null,
      ({tempoBuff:'battleTempo',defenceBuff:'stoneSkin',manaOverTime:'focusBreath'})[s.mechanic?.kind]].filter(Boolean),consumes:[]}));
  const effects=[...base,...career,...learned,...enchant],edges=[];
  for(const a of effects)for(const b of effects)for(const state of a.applies||[])
    if(b.consumes?.includes(state))edges.push({from:a.id,to:b.id,state,kind:'apply-consume'});
  for(const item of enchant)for(const skill of item.affectedSkills)edges.push({from:item.id,to:skill,kind:'skill-modifier'});
  return {schema:1,effects,edges,v28Catalog:V28_SKILL_CATALOG,careers:CAREERS,rareGear:V28_RARE_GEAR,sets:CH5_SETS,setRecipes:CH5_SET_RECIPES,drinks:CH5_DRINKS,
    invariants:{baseBleedCap:4,baseBleedDuration:COMBAT_BALANCE.bleedDuration,careerBleedCap:BLOODBLADE_BLEED_MAX_STACKS,enchantRules:ENCHANT_RULES},
    cycleReview:{boundedRisks:[{chain:'direct hit -> enchant -> damage',guard:ENCHANT_RULES.excludedTriggers},
      {chain:'skill hit -> storm -> proc',guard:'proc excluded from storm skill triggers in core-v14'},
      {chain:'hurt -> guardReprisal -> proc',guard:'three charges and actor.cd.careerReprisal >= 1 second'}],
      status:'Known proc paths checked by behavioral tests; static catalog does not prove arbitrary future code free of loops'},
    limits:['Base/common skill effects have partial semantic annotations; actual code remains authority',
      'Conditional damage relations and cooldown guards are descriptors, not an independent combat interpreter']};
}

export function queryEffects(term) {
  const c=effectCatalog(),q=term.toLowerCase();
  const effects=c.effects.filter(x=>JSON.stringify(x).toLowerCase().includes(q));
  const ids=new Set(effects.map(x=>x.id));
  return {term,effects,edges:c.edges.filter(e=>ids.has(e.from)||ids.has(e.to)),limits:c.limits};
}
