// Reproducible release audit; inputs are QA milestone saves, never personal saves.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {RPG} from '../../dist/core-v14.js';
import {parseSave} from '../../dist/save-transfer-v14.js';
const roots=['docs/ch1-expansion/natural/shadow-final','docs/ch1-expansion/natural/oath-final-corners','docs/ch1-expansion/natural/ember-final-corners',...['shadow','oath','ember'].map(c=>'docs/ch1-map-quests/natural-final/'+c),...['shadow','oath','ember'].map(c=>'docs/ch1-story-world/natural/'+c),...['shadow','oath','ember'].map(c=>'docs/ch1-layer-rules/natural/'+c)];
const rows=[];
for(const root of roots){
 const files=fs.readdirSync(root).filter(f=>/^\d{2}[a-z]?-.*-save\.json$/.test(f));assert.equal(files.length,root.includes('ch1-layer-rules')?21:20,root);
 for(const f of files){
  const file=path.join(root,f),bytes=fs.readFileSync(file),raw=JSON.parse(bytes),g=new RPG(raw.p.cls,parseSave(bytes.toString()));
  for(const k of ['gold','xp','level'])assert.equal(g.p[k],raw.p[k],file+'/'+k);
  assert.equal(g.map,raw.map,file);assert.equal(g.chapter,raw.chapter,file);assert.equal(g.c1Expansion.schema,4,file);
  assert.deepEqual(g.c1Expansion.claimLedger,raw.c1Expansion.claimLedger,file+' no automatic payment');
  for(const [id,status]of Object.entries(raw.quests))if(status==='done')assert.equal(g.quests[id],'done',file+'/'+id);
  for(const [map,st]of Object.entries(raw.states))for(const e of st.enemies||[])if(e.dead)assert.ok(g.states[map].enemies.find(n=>n.id===e.id)?.dead,file+'/'+e.id);
  const r=new RPG(g.p.cls,parseSave(JSON.stringify(g.snapshot())));
  for(const k of ['gold','xp','level'])assert.equal(r.p[k],g.p[k],file+' repeated reload/'+k);
  assert.deepEqual(r.c1Expansion.claimLedger,g.c1Expansion.claimLedger,file);
  rows.push({path:file,sha256:createHash('sha256').update(bytes).digest('hex'),oldSchema:raw.c1Expansion.schema,newSchema:g.c1Expansion.schema,map:g.map,level:g.p.level,gold:g.p.gold,automaticPayments:0,completedQuestsAndDeadEnemiesPreserved:true});
 }
}
assert.equal(rows.length,243);
fs.writeFileSync('docs/ch1-layer-rules/SAVES.json',JSON.stringify({passed:true,scope:'60 actual milestones each from 0.6, 0.7 and 0.8 plus 63 from 0.9; strict import and twice restored; no automatic payments, lost completions or revived enemies',rows},null,2)+'\n');
console.log('243 actual milestone saves passed strict import, unchanged balances/completions and repeated restore.');
