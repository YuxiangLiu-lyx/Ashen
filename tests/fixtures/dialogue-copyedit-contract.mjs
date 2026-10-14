import assert from 'node:assert/strict';
import {DIALOGUE_COPYEDITS} from '../../dist/dialogue-copyedits-data.js';
export function copyedited(id,prior){const e=DIALOGUE_COPYEDITS.find(e=>e.static&&e.id===id);if(!e)return prior;assert.deepEqual(prior,e.before,id+' exact authorized baseline');return e.after;}
export function beforeCopyedit(id,current){const e=DIALOGUE_COPYEDITS.find(e=>e.static&&e.id===id);if(!e)return current;assert.deepEqual(current,e.after,id+' exact authorized final text');return e.before;}
