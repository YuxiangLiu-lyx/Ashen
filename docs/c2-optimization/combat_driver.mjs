// Same real title-to-post saves for before/after. Placement/full starting resources
// are controlled Lab conditions, never natural input or human completion claims.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {cohort,groupExperiment} from '../../tools/balance_lab/experience-audit.mjs';
import {simulateSnapshot} from '../../tools/balance_lab/chapter-one.mjs';
import {provenance,sha} from '../../tools/balance_lab/provenance.mjs';
const out=process.argv[2]||'docs/c2-optimization/combat';fs.mkdirSync(out,{recursive:true});
const report={provenance:provenance(),sources:[],groups:[],bren:[],limits:['Same real C1 normal-input chapter-two start saves for all cohorts, including before/after.','Detached placement; full HP/MP and 2+2 potions once per sequence, production XP/loot/cooldowns/AI.','Starter retains a legal starter weapon; optimized can only use owned gear and allocated points.','Automated strategies, not human victory rates or chapter duration.']};
for(const cls of ['shadow','oath','ember']){
 const file=`docs/rpg-experience/c1/natural-final/${cls}/15-post-save.json`,raw=fs.readFileSync(file),snapshot=JSON.parse(raw);report.sources.push({path:file,sha256:sha(raw)});Object.assign(snapshot.flags,{postArrival:true,bridgeSeen:true,courtSeen:true,targetCutaway:true,spillSeen:true,v9CellarVisited:true,v9WellVisited:true});
 for(const kind of ['starter','normal','optimized'])for(const policy of ['basic','responsive'])for(const seed of [7300,7301,7302]){
  for(const maps of [['bridge'],['wellcrypt'],['spillway'],['bridge','bridgecellar','wellcrypt','spillway']])report.groups.push({cls,...groupExperiment(snapshot,{kind,policy,maps,seed})});
  const g=cohort(snapshot,kind,seed);report.bren.push({cls,kind,...simulateSnapshot(g.snapshot(),'bren',seed,'full',policy==='basic'?'commit':'responsive')});
 }
 console.log(cls,'completed');
}
report.isolationFlags='Only already-seen automatic scenes are set, identically for the archived baseline and current run; no rewards, XP, gear or combat flags are granted.';
assert.ok([...report.groups,...report.bren].every(r=>['win','loss'].includes(r.outcome)),'Only resolved combat outcomes are accepted; interrupted scenes are an invalid Lab fixture.');
fs.writeFileSync(path.join(out,'COMBAT.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({groups:report.groups.length,bren:report.bren.length}));
