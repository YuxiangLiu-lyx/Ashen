// Same actual campaign saves; isolated production encounters, no balance formula copies.
import fs from 'node:fs';import {RPG,stats} from '../../dist/core-v14.js';import {C1_ELITES}from '../../dist/chapter-one-expansion-data.js';import {cohort,groupExperiment}from '../../tools/balance_lab/experience-audit.mjs';import {c1Danger}from '../../dist/chapter-one-expansion-combat.js';import {provenance,sha}from '../../tools/balance_lab/provenance.mjs';
const dir='docs/c1-trial-forge/integration/economy',runs=[],groups=[],sources=[];
function encounter(snapshot,kind,id,map,seed,policy){
 const g=cohort(snapshot,kind,seed);g.map=map;delete g.states[map];g.ensureMap(map);g.pending=null;g.transition=null;g.active=true;g.portCD=999;g.saint.visible=false;g.bullets=[];g.zones=[];
 const e=g.enemies.find(e=>e.id===id);if(!e)throw Error(id);g.states[map].enemies=[e];const p=g.safePoint(e.x-180,e.y+120);g.relocate(p.x,p.y);g.target=id;
 const start={level:g.p.level,stats:stats(g.p),gear:g.p.gear,attrs:g.p.attrs,hp:e.hp,isBoss:e.isBoss,elite:e.elite},t0=g.time;let received=0,potions=0,mpPotions=0,tells=0,idleMana=0,lastTell=null,skills=0;
 const hurt=g.hurt;g.hurt=function(...a){const before=this.p.hp,r=hurt.apply(this,a);received+=Math.max(0,before-this.p.hp);return r;};
 let outcome='timeout';for(let i=0;i<240/.035;i++){
  if(e.dead){outcome='win';break;}if(g.p.hp<=0){outcome='loss';break;}if(g.pending||!g.active){outcome='interrupted';break;}
  if(g.p.hp<stats(g.p).hp*.6&&g.potion('hp'))potions++;if(g.p.mp<18&&g.potion('mp'))mpPotions++;
  const t=e.telegraph;if(t&&t!==lastTell){tells++;lastTell=t;}let input={auto:true};
  if(policy==='responsive'&&t&&e.wind>.14&&c1Danger(t,g.p)){const a=t.shape==='circle'?Math.atan2(g.p.y-t.y,g.p.x-t.x):t.a+Math.PI/2;input={x:Math.cos(a),y:Math.sin(a)};}else{if(g.p.cls!=='shadow'||e.bleed>=3)if(g.skill('e'))skills++;if(g.skill('q'))skills++;if(g.p.emotion>=100)g.skill('resonance');}
  g.update(.035,input);g.events=[];if(g.p.mp<10)idleMana+=.035;
 }
 return {kind,id,map,seed,policy,start,outcome,elapsed:g.time-t0,received,potions,mpPotions,tells,skills,idleMana,levelUps:g.p.level-start.level,remainingHP:g.p.hp,remainingMP:g.p.mp};
}
for(const cls of ['shadow','oath','ember']){
 const file=dir+'/'+cls+'-main_only.json',raw=fs.readFileSync(file),data=JSON.parse(raw);sources.push({path:file,sha256:sha(raw)});
 const trial=data.milestones.find(m=>m.name==='trial-boss-entry').snapshot,prepared=data.milestones.find(m=>m.name==='prepared').snapshot;
 for(const kind of ['starter','normal','optimized'])for(const seed of [7300,7301,7302]){
  for(const [id,cfg]of [...Object.entries(C1_ELITES),['c1-final-examiner',{map:'c1TrialVault'}]])for(const policy of ['responsive','commit'])runs.push({cls,...encounter(cfg.map.startsWith('c1Trial')||cfg.map==='c1DrillGallery'?trial:prepared,kind,id,cfg.map,seed,policy)});
  for(const maps of [['c1TrialCrypt'],['road','millpath','grove']])groups.push({cls,...groupExperiment(maps[0]==='c1TrialCrypt'?trial:prepared,{kind,seed,maps,policy:'responsive'})});
 }
 console.log(cls,runs.filter(r=>r.cls===cls&&r.kind==='normal'&&r.policy==='responsive').map(r=>({id:r.id,outcome:r.outcome,seconds:r.elapsed,tells:r.tells})));
}
fs.writeFileSync('docs/c1-trial-forge/COMBAT_COMPARISON.json',JSON.stringify({provenance:provenance(),sources,runs,groups,limits:['Isolated placement on actual authored maps; full HP/MP plus two small potions each at sequence start. Same source save per class/encounter, not a human win rate.','Starter keeps legal initial weapon, zero allocated stats; optimized reallocates already spent points and owned gear only. Production XP/loot/level healing remain enabled.','Commit policy intentionally ignores tells. Groups retain resources/cooldowns between maps. Three seeds diagnose mechanics, not statistical assurance.']},null,2)+'\n');
