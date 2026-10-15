import fs from 'node:fs';
const trial=JSON.parse(fs.readFileSync(new URL('../../docs/c1-trial-forge/SCRIPT.json',import.meta.url))).scenes;
Object.assign(trial,JSON.parse(fs.readFileSync(new URL('../../docs/c1-restraint/SCRIPT.json',import.meta.url))).scenes);
const legacy=JSON.parse(fs.readFileSync(new URL('../../docs/c1-trial-forge/baseline/dialogues.json',import.meta.url)));
import assert from 'node:assert/strict';
import {DIALOGUE_COPYEDITS} from '../../dist/dialogue-copyedits-data.js';
export function copyedited(id,prior){const e=DIALOGUE_COPYEDITS.find(e=>e.static&&e.id===id);if(!e)return trial[id]||prior;assert.deepEqual(prior,e.before,id+' exact authorized baseline');return trial[id]||e.after;}
export function beforeCopyedit(id,current){if(trial[id]){assert.deepEqual(current,trial[id],id+' exact adopted 1.4');current=legacy[id];}const e=DIALOGUE_COPYEDITS.find(e=>e.static&&e.id===id);if(!e)return current;assert.deepEqual(current,e.after,id+' exact authorized final text');return e.before;}
