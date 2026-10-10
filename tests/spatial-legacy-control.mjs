// Retain the exact pre-refactor combat fixture, including its obstructed start.
// This is a TEST-ONLY controlled layout; never installed in the game or Lab.
import fs from 'node:fs';
import {MAPS} from '../dist/core-v14.js';
import {SCENERY,BOUNDARIES,WATERS,BRIDGES} from '../dist/world-v14.js';
import {invalidateSceneGeometryV281} from '../dist/scene-geometry-v26.js';
const baseline=JSON.parse(fs.readFileSync(new URL('../docs/chapter123-spatial/BASELINE_MAPS.json',import.meta.url)));
export function legacySpatialControl(id,run){
 if(!baseline.maps[id])return run();
 const registries=[MAPS,SCENERY,BOUNDARIES,WATERS,BRIDGES],sources=[baseline.maps,baseline.scenery,baseline.boundaries,baseline.waters,baseline.bridges],old=registries.map(r=>r[id]);
 try{registries.forEach((r,i)=>r[id]=structuredClone(sources[i][id]));invalidateSceneGeometryV281();return run();}
 finally{registries.forEach((r,i)=>r[id]=old[i]);invalidateSceneGeometryV281();}
}
