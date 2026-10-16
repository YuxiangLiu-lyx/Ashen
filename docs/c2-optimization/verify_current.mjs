import fs from 'node:fs';import assert from 'node:assert/strict';
import {dialogueCorpus} from '../../tools/harness/dialogue_corpus.mjs';import{RPG}from '../../dist/core-v14.js';
const p='docs/c2-optimization/',s=JSON.parse(fs.readFileSync(p+'SCRIPT.json')),b=JSON.parse(fs.readFileSync(p+'before/CORPUS.json')).scenes,c=dialogueCorpus();assert.deepEqual(c,JSON.parse(fs.readFileSync(p+'CURRENT_CORPUS.json')));
const edits=new Map(s.entries.map(e=>[e.key,e]));for(const[key,row]of Object.entries(b))assert.deepEqual(c.scenes[key].text,edits.get(key)?.after||row.text,key);
for(const q of ['v12WatchHours','v12QuietRoom','v12CartBuckles']){
 const g=new RPG('shadow');g.chapter=7;g.enter('inn');g.pending=null;g.choose('v12q:accept:'+q);assert.deepEqual(g.pending.lines,c.scenes[`pacing:${q}:accept`].text);g.finishScene();g.choose('v12q:progress:'+q);assert.deepEqual(g.pending.lines,c.scenes[`pacing:${q}:progress`].text);
}
console.log('43 edited and all retained variants equal adopted full text; three real pacing producers verified.');
