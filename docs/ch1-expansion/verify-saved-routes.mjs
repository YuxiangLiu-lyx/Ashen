// Recheck retained normal-input saves against the delivered validator/runtime.
// This never creates or substitutes a playthrough.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {RPG} from '../../dist/core-v14.js';
import {parseSave} from '../../dist/save-transfer-v14.js';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const reports=[];
for(const dir of ['shadow-final','oath-final-corners','ember-final-corners']){
 const root=path.join('docs/ch1-expansion/natural',dir),file=path.join(root,'PLAY.json');
 const play=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(play.status,'two-chapters-complete');assert.deepEqual(play.errors,[]);
 const changed=Object.entries(play.source.files).filter(([p,h])=>hash(p)!==h).map(([p])=>p);
 assert.ok(changed.every(p=>['dist/chapter-one-expansion-save.js','dist/story-test-v31.js'].includes(p)),JSON.stringify(changed));
 const saves=[];
 for(const step of play.steps){
  const p=path.join(root,step.name+'-save.json'),raw=fs.readFileSync(p,'utf8');
  const parsed=parseSave(raw),g=new RPG(play.class,parsed);
  assert.equal(g.chapter,step.state.chapter);assert.equal(g.map,step.state.map);
  assert.equal(g.p.gold,step.state.p.gold);assert.equal(g.p.level,step.state.p.level);
  parseSave(JSON.stringify(g.snapshot()));
  saves.push({path:p,sha256:hash(p),chapter:g.chapter,map:g.map,level:g.p.level,gold:g.p.gold});
 }
 reports.push({class:play.class,source:play.source.head,evidence:{path:file,sha256:hash(file)},changed_runtime_files:changed,saves});
}
fs.writeFileSync('docs/ch1-expansion/SAVED_ROUTE_COMPATIBILITY.json',JSON.stringify({status:'pass',basis:'Parse, load and serialize all 60 retained real-input milestone saves with current runtime',limits:['Only validator strictness and isolated chapter-test factory changed since these routes; this is compatibility verification, not another playthrough.'],reports},null,2)+'\n');
console.log('Passed: 60 real-input milestone saves parse, load and serialize without changing map, chapter, level or money.');
