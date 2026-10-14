import fs from 'node:fs';
import {cohort} from './experience-audit.mjs';
import {simulateSnapshot} from './chapter-one.mjs';
import {provenance,sha} from './provenance.mjs';
const runs=[],sources=[],sourceDir=process.env.ASHEN_C1_ECONOMY||'docs/rpg-experience/c1/core008/economy',out=process.argv[2]||'docs/rpg-experience/c1/elites';
for(const cls of ['shadow','oath','ember'])for(const route of ['main_only','local_work']){
 const file=`${sourceDir}/${cls}-${route}.json`,raw=fs.readFileSync(file),data=JSON.parse(raw);sources.push({path:file,sha256:sha(raw)});
 for(const encounter of ['rat','warden','bat','captain']){
  const milestone=data.milestones.find(x=>x.name===(encounter==='captain'?'captain-entry':'prepared'));
  for(const kind of route==='main_only'?['starter','normal','optimized']:['normal'])for(const strategy of ['responsive','commit'])for(let seed=7300;seed<7312;seed++){
   const g=cohort(milestone.snapshot,kind,seed);
   runs.push({cls,route,kind,milestone:milestone.name,...simulateSnapshot(g.snapshot(),encounter,seed,'full',strategy)});
  }
 }
}
const report={provenance:provenance(),sources,runs,limits:['Isolated production encounters at real route milestones; placement/full resources/two potions are explicit fixtures.','Starter keeps a legal zero-attack weapon and no allocated attributes; optimized only uses owned items and already allocated points.','Responsive avoids actual tells; commit uses skills without avoiding tells. Neither is a human success rate.']};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/COMBAT.json',JSON.stringify(report,null,2)+'\n');
for(const cls of ['shadow','oath','ember'])for(const encounter of ['rat','warden','bat','captain']){const r=runs.filter(r=>r.cls===cls&&r.encounter===encounter&&r.kind==='normal'&&r.route==='main_only'&&r.strategy==='responsive');console.log(cls,encounter,JSON.stringify({wins:r.filter(x=>x.outcome==='win').length,total:r.length,time:[Math.min(...r.map(x=>x.elapsed)),Math.max(...r.map(x=>x.elapsed))],warnings:[Math.min(...r.map(x=>x.warnings)),Math.max(...r.map(x=>x.warnings))]}));}
