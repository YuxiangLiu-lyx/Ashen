import fs from 'node:fs';
import {RPG} from '../../dist/core-v14.js';
import {C1_MAPS} from '../../dist/chapter-one-layout.js';
import {provenance} from '../../tools/balance_lab/provenance.mjs';
const output=process.argv[2]||'docs/c1-endurance/before/ENEMIES.json';
const report={provenance:provenance(),maps:[],saves:[]};
for(const level of [1,5,12]){
 const g=new RPG('shadow',null,()=>.44);g.chapter=2;g.p.level=level;g.pending=null;
 for(const map of C1_MAPS){g.map=map;delete g.states[map];g.ensureMap(map);report.maps.push({level,map,enemies:g.enemies.map(e=>({id:e.id,type:e.type,maxHP:e.maxHP,hp:e.hp,elite:e.elite,isBoss:e.isBoss,role:e.experienceRole,custom:e.c1Custom,endurance:e.endurance}))});}
 // Preserve baseline full saves for repeated-load migration, including visited maps.
 report.saves.push({level,snapshot:g.snapshot()});
}
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(report.maps.reduce((n,m)=>n+m.enemies.length,0),'enemy samples');
