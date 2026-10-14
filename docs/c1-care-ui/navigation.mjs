import fs from 'node:fs';
import assert from 'node:assert/strict';
import {RPG,MAPS} from '../../dist/core-v14.js';
import {inspectWorldMap} from '../../tools/world_audit.mjs';
const report=[];
for(const id of ['c1TrialFoyer','c1TrialCrypt','c1TrialVault']){
 const g=new RPG('shadow',null,()=>.44);g.chapter=2;g.quests.c1Readiness='done';g.quests.c1CryptRepair='done';g.enter(id,800,850);g.pending=null;g.events=[];g.active=false;
 const grid=inspectWorldMap(g,id,20),routes=[];assert.deepEqual(grid.unreachable,[],id);
 const npc=g.npcs[0];
 for(const door of MAPS[id].doors){
  const start={x:door.x,y:door.y},end={x:npc.x,y:npc.y+65};g.relocate(start.x,start.y);const route=g.routeTo(end);assert.ok(route?.length,id+':'+door.to);
  // Run the original movement/collision function along each route, with no combat
  // fixture grants. The art fix must not shift the NPC or change usable space.
  for(const target of route){let ticks=0;while(Math.hypot(g.p.x-target.x,g.p.y-target.y)>7&&ticks++<400){const dx=target.x-g.p.x,dy=target.y-g.p.y,d=Math.hypot(dx,dy);g.moveActor(g.p,g.p.x+dx/d*3,g.p.y+dy/d*3);}
   assert.ok(ticks<400,id+' movement stuck '+JSON.stringify(target));}
  assert.ok(Math.hypot(g.p.x-end.x,g.p.y-end.y)<25);assert.ok(g.clearLine(g.p,npc,false));routes.push({from:door.to,to:npc.id,points:route,arrived:[g.p.x,g.p.y]});
 }
 report.push({id,grid,routes,scope:'Actual blocked/clearLine/routeTo/moveActor; collision/actor/AI configurations are unchanged. Combat regressions run in integration.'});
}
fs.writeFileSync('docs/c1-care-ui/NAVIGATION.json',JSON.stringify({status:'passed',maps:report},null,2));console.log(JSON.stringify(report.map(r=>({id:r.id,routes:r.routes.length,unreachable:r.grid.unreachable}))));
