import fs from 'node:fs';import {MAPS} from '../../dist/core-v14.js';import {simulate} from '../../tools/balance_lab/simulator.mjs';import {legacyCaveControl} from '../../tests/c3-spatial-control.mjs';
const report=[];
for(const [name,prior]of [['c1','endurance-c1-combat'],['c23','restraint-c23-combat']]){
 const baseline=JSON.parse(fs.readFileSync('tests/fixtures/'+prior+'.json')),live=MAPS.warehouse.spawns;
 if(name==='c1')MAPS.warehouse.spawns=JSON.parse(fs.readFileSync('docs/chapter123/BASELINE_CONTENT.json')).find(m=>m.id==='warehouse').spawns;
 const rows=[];try{for(const {config,result}of baseline.runs){const next=name==='c23'?legacyCaveControl(config.map,()=>simulate(config)):simulate(config);rows.push({config,result:next});report.push({scope:name,config,changed:Object.keys(next).filter(k=>JSON.stringify(next[k])!==JSON.stringify(result[k])),before:Object.fromEntries(Object.entries(result).filter(([k])=>k!=='events')),after:Object.fromEntries(Object.entries(next).filter(([k])=>k!=='events'))});}}finally{MAPS.warehouse.spawns=live;}
 fs.writeFileSync('tests/fixtures/loot-services-'+name+'-combat.json',JSON.stringify({...baseline,authorization:'2026-10-19 user authorized ordinary melee counter range, full HP on level-up and physical drops',baseline:'tests/fixtures/'+prior+'.json',basis:'2026-10-19 ordinary-melee reach + full-health level-up + ground reward timing; previous fixture retained',runs:rows},null,2));
}
fs.writeFileSync('docs/loot-services/COMBAT_DIFF_REPORT.json',JSON.stringify(report,null,2));console.log(report.map(r=>({scope:r.scope,enemy:r.config.enemy,changed:r.changed})));
