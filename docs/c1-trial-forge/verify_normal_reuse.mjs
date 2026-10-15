import fs from 'node:fs';import assert from 'node:assert/strict';import {pathToFileURL}from 'node:url';import {RPG}from '../../dist/core-v14.js';import {c1Panel as current}from '../../dist/chapter-one-expansion-ui.js';import {provenance,sha}from '../../tools/balance_lab/provenance.mjs';
const prior=fs.readFileSync('docs/c1-trial-forge/pre-legacy-ui.js.txt','utf8'),root=pathToFileURL(process.cwd()+'/dist/').href;
const old=await import('data:text/javascript;base64,'+Buffer.from(prior.replace(/from '\.\//g,"from '"+root)).toString('base64')),now=provenance(),results=[];
for(const cls of ['shadow','oath','ember']){
 const folder='docs/c1-trial-forge/natural-final/'+cls,raw=fs.readFileSync(folder+'/PLAY.json'),play=JSON.parse(raw);
 assert.equal(play.status,'chapter-one-complete');assert.deepEqual(play.errors,[]);assert.equal(play.steps.at(-1).state.chapter,6);
 const changed=Object.keys(now.files).filter(p=>now.files[p]!==play.source.files[p]);assert.deepEqual(changed,['dist/chapter-one-expansion-ui.js']);assert.equal(sha(prior),play.source.files[changed[0]]);
 let panels=0;for(const file of fs.readdirSync(folder).filter(f=>f.endsWith('-save.json'))){const s=JSON.parse(fs.readFileSync(folder+'/'+file)),g=new RPG(cls,s);assert.equal(g.c1Expansion.preparation.legacy,false);assert.ok(!g.quests.c1AlchemistSamples);for(const kind of ['c1-shop','c1-loom','c1-guide']){assert.equal(current(g,kind),old.c1Panel(g,kind),cls+'/'+file+'/'+kind);panels++;}}
 results.push({class:cls,status:'pass',play_sha256:sha(raw),ending_phase:6,unchanged_panels:panels,only_changed_runtime:changed});
}
fs.writeFileSync('docs/c1-trial-forge/NORMAL_REUSE.json',JSON.stringify({provenance:now,results,reason:'Normal runs have identical production movement/combat/story/save modules. Only subsequent legacy-with-no-rune gift visibility and three-sample journal filter changed. Every saved normal UI panel is byte-identical; original runs/failures remain untouched.'},null,2)+'\n');console.log(results);
