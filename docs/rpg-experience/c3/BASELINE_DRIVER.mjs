// Real second-chapter completion sources, isolated production combat. No human claims.
import fs from 'node:fs';import path from 'node:path';
import {cohort,groupExperiment} from '../../../tools/balance_lab/experience-audit.mjs';
import {provenance,sha} from '../../../tools/balance_lab/provenance.mjs';
import {RPG,MAPS,stats} from '../../../dist/core-v14.js';
import {DIALOGUES} from '../../../dist/data-v14.js';
import {CH3_MAPS} from '../../../dist/chapter3-world-v14.js';
import {CH3_GEAR,CH3_RECIPES,CH3_LAMPS,CH3_TRIALS} from '../../../dist/chapter3-runtime-v14.js';
const out=process.argv[2]||'docs/rpg-experience/c3/baseline';fs.mkdirSync(out,{recursive:true});const report={provenance:provenance(),sources:[],groups:[],limits:['Unchanged real C2 normal-UI end saves; no preview seed.','Fixed starting full HP/MP and 2+2 medicine only for comparison; production AI/XP/loot/level healing between maps.','Placement is an isolated Lab fixture, not normal-input completion. Interruption/timeout is reported separately and never called a win.']};
for(const cls of ['shadow','oath','ember']){const file=`docs/rpg-experience/c2/natural-005/${cls}/10-chapter-two-end-save.json`,raw=fs.readFileSync(file),s=JSON.parse(raw);report.sources.push({path:file,sha256:sha(raw),level:s.p.level,phase:s.chapter});for(const kind of ['starter','normal','optimized'])for(const policy of ['basic','responsive'])for(const seed of [7300,7301,7302])for(const maps of [['hellApproach'],['hellQuarry'],['hellSluice'],['hellGrotto'],['hellGate','hellApproach','hellQuarry','hellSluice']])report.groups.push({cls,...groupExperiment(s,{kind,policy,seed,maps})});console.log(cls,'completed');}
fs.writeFileSync(path.join(out,'COMBAT.json'),JSON.stringify(report,null,2)+'\n');
const s=JSON.parse(fs.readFileSync(report.sources[0].path)),g=new RPG(s.p.cls,s),ids=[...Object.keys(CH3_MAPS),'hellApproach','hellQuarry','hellSluice'],maps=[];
for(const id of ids){g.map=id;g.ensureMap(id);maps.push({id,name:MAPS[id].name,safe:MAPS[id].safe,doors:MAPS[id].doors,targets:g.targets(),enemies:g.enemies.map(e=>({id:e.id,type:e.type,hp:e.maxHP,groupId:e.groupId,elite:e.elite})),availableNPCs:g.npcs.map(n=>({id:n.id,options:g.npcOptions(n.id)}))});}
fs.writeFileSync(path.join(out,'WORLD.json'),JSON.stringify({provenance:report.provenance,stats:stats(g.p),maps,gear:CH3_GEAR,recipes:CH3_RECIPES,lamps:CH3_LAMPS,trials:CH3_TRIALS,scenes:Object.fromEntries(Object.entries(DIALOGUES).filter(([id])=>id.startsWith('ch3')||id.startsWith('v11')))},null,2)+'\n');
console.log(JSON.stringify({groups:report.groups.length,outcomes:Object.fromEntries(['win','loss','timeout','interrupted'].map(k=>[k,report.groups.filter(r=>r.outcome===k).length])),maps:maps.length}));
