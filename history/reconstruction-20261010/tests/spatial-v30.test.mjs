import test from 'node:test';
import assert from 'node:assert/strict';
import {RPG,MAPS} from '../dist/core-v14.js';
import {SCENERY} from '../dist/world-v14.js';
import {SPATIAL_PLANS_V30,NPC_DUTIES_V30} from '../dist/spatial-design-v30.js';
import {ambientActorsV30,terrainBlockedV30} from '../dist/spatial-world-v30.js';
import {roleAtlasV30} from '../dist/role-art-v30.js';
import {spatialAudit} from '../tools/spatial_audit.mjs';
import {parseSave} from '../dist/save-transfer-v14.js';
const game=(map='bridge')=>{const g=new RPG('shadow',null,()=>.44);g.enter(map,900,560);g.pending=null;g.active=true;g.portCD=999;return g;};
test('35 independent runtime maps have connected targets, explicit purposes and unobstructed ordinary/elite/boss arenas',()=>{
 const ids=Object.keys(MAPS).filter(id=>(MAPS[id].chapterRegion??MAPS[id].chapter??1)<=3);assert.deepEqual(ids.sort(),Object.keys(SPATIAL_PLANS_V30).sort());
 const g=game();let count=0;for(const id of ids){const row=spatialAudit(g,id);assert.equal(row.unreachable,0,id);assert.deepEqual(row.targets.filter(t=>!t.approach),[],id);
  for(const a of row.arenas){assert.equal(a.blockedSamples,0,id);assert.ok(a.rect[2]>=240&&a.rect[3]>=192,id);count++;}
  assert.ok(MAPS[id].spatialPurposeV30.length>12);assert.ok(!SCENERY[id].some(o=>o.id.startsWith('edge-tree-')),id);
 }assert.ok(count>=20);
});
test('river polygon is solid for movement and line of sight, while the bridge passes horizontally',()=>{
 const g=game();assert.equal(terrainBlockedV30('bridge',770,300),true);assert.equal(g.clearLine({x:640,y:300},{x:920,y:300},false),false);
 const a={x:640,y:230};g.moveActor(a,950,230);assert.ok(a.x<700);assert.equal(g.blocked(a.x,a.y),false);
 const b={x:640,y:555};g.moveActor(b,940,555);assert.ok(b.x>930);assert.equal(g.clearLine({x:640,y:555},{x:940,y:555}),true);
 assert.equal(g.blocked(780,656),true,'solid foreground parapet');
});
test('all role stops are physically clear; duty movement pauses near player and never mutates shared NPC templates',()=>{
 const before=JSON.stringify(Object.fromEntries(Object.keys(SPATIAL_PLANS_V30).map(id=>[id,[MAPS[id].npcs,MAPS[id].ambientActors]])));
 const g=game();for(const [key,d]of Object.entries(NPC_DUTIES_V30)){const [id]=key.split(':');g.map=id;g.ensureMap(id);for(const [x,y]of d.stops)assert.equal(g.blocked(x,y),false,key);}
 g.map='bridge';g.p.x=900;g.p.y=560;const initial=g.npcs.find(n=>n.id==='bridgewatch');for(let i=0;i<1200;i++)g.update(1/60,{});
 const changed=g.npcs.find(n=>n.id==='bridgewatch');assert.ok(changed.walkDistance>30);assert.ok(Math.hypot(changed.x-initial.x,changed.y-initial.y)<80);
 g.faceNPC('bridgewatch');assert.equal(g.npcs.find(n=>n.id==='bridgewatch').x,changed.x,'conversation must not teleport a working NPC back to its template');g.releaseNPC('bridgewatch');
 Object.assign(g.p,{x:changed.x+40,y:changed.y+20});const at={x:changed.x,y:changed.y};for(let i=0;i<120;i++)g.update(1/60,{});const stopped=g.npcs.find(n=>n.id==='bridgewatch');assert.deepEqual({x:stopped.x,y:stopped.y},at);assert.equal(stopped.moving,false);
 assert.equal(JSON.stringify(Object.fromEntries(Object.keys(SPATIAL_PLANS_V30).map(id=>[id,[MAPS[id].npcs,MAPS[id].ambientActors]]))),before);
 assert.equal(ambientActorsV30(g).length,6);
});
test('visited legacy saves migrate bridge positions once, preserve claims and deaths, and accept roundtrip',()=>{
 const g=game();g.enemies[0].dead=true;g.enemies[0].hp=0;g.enemies[1].hp=19;g.props[0].used=true;g.flags.v9WaterShared=true;
 const saved=parseSave(JSON.stringify(g.snapshot()));delete saved.states.bridge.spatialV30;saved.states.bridge.enemies[1].x=530;saved.states.bridge.enemies[1].y=810;
 const h=new RPG('shadow',structuredClone(saved),()=>.44);assert.equal(h.enemies[0].dead,true);assert.equal(h.enemies[1].hp,19);assert.equal(h.props[0].used,true);assert.equal(h.flags.v9WaterShared,true);assert.equal(h.states.bridge.spatialV30,1);
 h.enemies[1].x=555;h.ensureMap('bridge');assert.equal(h.enemies[1].x,555);assert.ok(parseSave(JSON.stringify(h.snapshot())));assert.equal(saved.states.bridge.spatialV30,undefined);
});
test('soldier elite and officer have different body assets, near-equal stature and explicit original portrait correspondence',()=>{
 const roles=[roleAtlasV30({type:'guard'}),roleAtlasV30({type:'guard',elite:true}),roleAtlasV30({type:'captain'})];assert.equal(new Set(roles.map(r=>r.sheet)).size,3);assert.ok(Math.max(...roles.map(r=>r.height))-Math.min(...roles.map(r=>r.height))<=2);assert.ok(roles.every(r=>r.reference&&r.identity));
});
