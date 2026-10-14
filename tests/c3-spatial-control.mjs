// Historical combat control only. Never installed in the game or Balance Lab.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {MAPS} from '../dist/core-v14.js';
import {SCENERY,BOUNDARIES,WATERS,BRIDGES} from '../dist/world-v14.js';
import {invalidateSceneGeometryV281} from '../dist/scene-geometry-v26.js';
export const legacyCaves=JSON.parse(fs.readFileSync(new URL('../docs/rpg-experience/c3/LEGACY_CAVES.json',import.meta.url)));
export const C3_AUTHORED_CAVES=['hellGrotto','hellMine'];
export const C3_NAVIGATION={hellGrotto:330,hellMine:326};
export function assertAuthoredCave(id){
 const accepted={hellGrotto:'a0a6e74dabad52ef89e124b23d4b393a8cce0cdd6fd65cbf3e3b33c51061c9fa',hellMine:'c7ddc618b60c552f35f7ec35673a54794be9b2855b0973bd00a9cb955cfad500'};
 assert.equal(createHash('sha256').update(JSON.stringify({map:MAPS[id],scenery:SCENERY[id]})).digest('hex'),accepted[id],id+' authored layout');
 assert.equal(MAPS[id].c3Layout,1);
 assert.deepEqual(MAPS[id].doors,legacyCaves.maps[id].doors);
 assert.deepEqual(MAPS[id].spawns.map(s=>[s[0],s[3]]),legacyCaves.maps[id].spawns.map(s=>[s[0],s[3]]));
 assert.deepEqual(MAPS[id].props.map(p=>[p.id,p.action,p.label]),legacyCaves.maps[id].props.map(p=>[p.id,p.action,p.label]));
}
export function legacyCaveControl(id,run){
 if(!C3_AUTHORED_CAVES.includes(id))return run();
 const registries=[MAPS,SCENERY,BOUNDARIES,WATERS,BRIDGES],sources=[legacyCaves.maps,legacyCaves.scenery,legacyCaves.boundaries,legacyCaves.waters,legacyCaves.bridges],old=registries.map(r=>r[id]);
 try{registries.forEach((r,i)=>r[id]=structuredClone(sources[i][id]));invalidateSceneGeometryV281();return run();}
 finally{registries.forEach((r,i)=>r[id]=old[i]);invalidateSceneGeometryV281();}
}
