import fs from 'node:fs';import assert from 'node:assert/strict';import{dialogueCorpus}from '../../tools/harness/dialogue_corpus.mjs';import{RPG}from '../../dist/core-v14.js';
const p='docs/c1-character-flow/',s=JSON.parse(fs.readFileSync(p+'SCRIPT.json')),b=JSON.parse(fs.readFileSync(p+'before/CORPUS.json')).scenes,c=dialogueCorpus();assert.deepEqual(c,JSON.parse(fs.readFileSync(p+'CURRENT_CORPUS.json')));
const edited=new Map(s.entries.map(e=>[e.key,e]));for(const [key,v]of Object.entries(b))assert.deepEqual(c.scenes[key].text,edited.get(key)?.after||v.text,key);
for(const id of ['c1iden','c1hesha','c1venn','c1blake','c1eve','c1mada']){const g=new RPG('shadow');g.pending=null;g.chapter=2;g.choose('c1:localTalk:'+id);assert.deepEqual(g.pending.lines,c.scenes['local:'+id].text,id);}
console.log('Current 726 static/dynamic variants match adopted script; 142 edits, 584 preserved; six real local-talk producers verified.');
