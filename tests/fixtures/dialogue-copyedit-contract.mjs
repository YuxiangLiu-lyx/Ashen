import fs from 'node:fs';
const trial=JSON.parse(fs.readFileSync(new URL('../../docs/c1-trial-forge/SCRIPT.json',import.meta.url))).scenes;
Object.assign(trial,JSON.parse(fs.readFileSync(new URL('../../docs/c1-restraint/SCRIPT.json',import.meta.url))).scenes);
Object.assign(trial,JSON.parse(fs.readFileSync(new URL('../../docs/c1-dialogue-voice/SCRIPT.json',import.meta.url))).scenes);
const voice=JSON.parse(fs.readFileSync(new URL('../../docs/c1-character-flow/SCRIPT.json',import.meta.url))).entries.filter(e=>e.static);
const second=JSON.parse(fs.readFileSync(new URL('../../docs/c2-optimization/SCRIPT.json',import.meta.url))).entries.filter(e=>e.static);
const legacy=JSON.parse(fs.readFileSync(new URL('../../docs/c1-trial-forge/baseline/dialogues.json',import.meta.url)));
import assert from 'node:assert/strict';
import {DIALOGUE_COPYEDITS} from '../../dist/dialogue-copyedits-data.js';
function firstChapterCopyedit(id,prior){const latest=voice.find(e=>e.key===id);const e=DIALOGUE_COPYEDITS.find(e=>e.static&&e.id===id);if(!e)return latest?.after||trial[id]||prior;assert.deepEqual(prior,e.before,id+' exact authorized baseline');return latest?.after||trial[id]||e.after;}
export function copyedited(id,prior){const current=firstChapterCopyedit(id,prior),e=second.find(e=>e.key===id);if(!e)return current;assert.deepEqual(current,e.before,id+' exact chapter-two baseline');return e.after;}
export function beforeCopyedit(id,current){const secondEdit=second.find(e=>e.key===id);if(secondEdit){assert.deepEqual(current,secondEdit.after,id+' exact adopted second chapter 0.5');current=secondEdit.before;}const latest=voice.find(e=>e.key===id);if(latest){assert.deepEqual(current,latest.after,id+' exact adopted 1.5');current=latest.before;}if(trial[id]){assert.deepEqual(current,trial[id],id+' exact adopted 1.4');current=legacy[id];}const e=DIALOGUE_COPYEDITS.find(e=>e.static&&e.id===id);if(!e)return current;assert.deepEqual(current,e.after,id+' exact authorized final text');return e.before;}
