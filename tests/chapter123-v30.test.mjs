import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {RPG,MAPS} from '../dist/core-v14.js';
import {SCENERY} from '../dist/world-v14.js';
import {parseSave} from '../dist/save-transfer-v14.js';
import {inspectWorldMap} from '../tools/world_audit.mjs';
import {CHAPTER123_MAPS_V30} from '../dist/chapter23-design-v30.js';
import {chapter123PropArtV30,chapter123SceneryArtV30,CHAPTER123_HOSTS_V30} from '../dist/chapter123-presentation-v30.js';
import {reactionV30,defeatsV30} from '../dist/chapter-one-motion-v30.js';
const read=n=>JSON.parse(fs.readFileSync(new URL('../docs/chapter123/'+n,import.meta.url)));
const game=()=>new RPG('shadow',null,()=>.44);
const maps=Object.keys(MAPS).filter(id=>(MAPS[id].chapterRegion??MAPS[id].chapter??1)<=3);

test('runtime independently enumerates all 35 maps including optional rooms and staged chamber',()=>{
 assert.equal(maps.length,35);assert.deepEqual([...CHAPTER123_MAPS_V30].sort(),maps.sort());
 for(const id of maps){const g=game();g.chapter=MAPS[id].chapterRegion||2;g.enter(id,800,540);assert.equal(g.map,id);
  for(const o of SCENERY[id])assert.ok(chapter123SceneryArtV30(o,id),id+'/'+o.id);
  for(const p of g.props){const host=CHAPTER123_HOSTS_V30[p.id];
   if(host)assert.ok(SCENERY[id].some(o=>o.id===host),id+'/'+p.id+' host');
   else assert.ok(chapter123PropArtV30(p,id,null,g),id+'/'+p.id+' artwork');
  }
 }
 assert.ok(!maps.includes('hellMemoryVillage'),'chapter 4 memory remains separate');
});

test('all 118 maps preserve baseline navigation and counts; only the documented well interaction becomes reachable',()=>{
 const g=game(),baseline=read('BASELINE_NAVIGATION.json');assert.equal(baseline.length,118);
 for(const row of baseline){g.enter(row.id);const after=inspectWorldMap(g,row.id);
  for(const key of ['walkableCells','connectedCells','enemies','targets','unreachable']){
   const expected=key==='unreachable'&&row.id==='town'?row[key].filter(t=>t.id!=='well'):row[key];
   assert.deepEqual(after[key],expected,row.id+'/'+key);
  }
 }
});

test('original chapter geometry, exits, encounters and object identities remain intact',()=>{
 for(const before of read('BASELINE_CONTENT.json')){
  const map=MAPS[before.id];for(const key of ['blocks','doors','spawns'])assert.deepEqual(JSON.parse(JSON.stringify(map[key]||[])),before[key],before.id+'/'+key);
  assert.deepEqual(SCENERY[before.id],before.scenery,before.id+'/scenery');
  const g=game();g.chapter=map.chapterRegion||2;g.enter(before.id,800,540);
  for(const p of before.props){const actual=g.props.find(a=>a.id===p.id);assert.ok(actual);
   for(const key of ['action','type','label','interactX','interactY','depthY'])assert.equal(actual[key],p[key],before.id+'/'+p.id+'/'+key);
   if(p.id!=='townbook')assert.deepEqual([actual.x,actual.y],[p.x,p.y],before.id+'/'+p.id);
  }
 }
});

test('notice migrates visited old saves without moving actors or resetting claims',()=>{
 const g=game();g.enter('town',990,840);g.pending=null;g.active=true;
 const p=g.props.find(p=>p.id==='townbook');assert.deepEqual([p.x,p.y],[990,840]);
 g.flags.wellSeen=true;g.quests.rats='done';p.x=1290;p.y=840;
 const saved=parseSave(JSON.stringify(g.snapshot()));saved.states.town.props.find(p=>p.id==='townbook').x=1290;
 for(const offMap of [false,true]){const old=structuredClone(saved);if(offMap){old.map='hall';old.p.x=800;old.p.y=540;}
  const h=game();h.restore(old);const board=h.states.town.props.find(p=>p.id==='townbook');
  assert.deepEqual([board.x,board.y],[990,840]);assert.equal(h.flags.wellSeen,true);assert.equal(h.quests.rats,'done');
  if(!offMap){assert.deepEqual([h.p.x,h.p.y],[saved.p.x,saved.p.y]);assert.equal(h.blocked(board.x,board.y,false),false);h.pending=null;h.active=true;h.interact(h.targets().find(t=>t.id==='townbook'));assert.ok(h.events.some(e=>e.type==='toast'&&e.text.includes('礼拜通知')));}
 }
 assert.equal(saved.states.town.props.find(p=>p.id==='townbook').x,1290,'input file retained');
});

test('quest-state art and scenery hosts avoid duplicate props without affecting late chapters',()=>{
 const g=game();g.enter('warehouse',800,540);const crack=g.props.find(p=>p.id==='crack');
 assert.equal(chapter123PropArtV30(crack,'warehouse',null,g).sheet,'chapterSettlement');
 g.quests.rats='done';assert.equal(chapter123PropArtV30(crack,'warehouse',null,g).sheet,'chapterObjects');
 assert.equal(chapter123PropArtV30({id:'well'},'town'),null);
 const legacy={sheet:'original',index:0};assert.equal(chapter123PropArtV30({id:'guest-basin'},'ch8GuestHouse',legacy),legacy);
 assert.equal(chapter123SceneryArtV30({id:'guest-cot'},'ch8GuestHouse'),null);
});

test('every native enemy and story boss keeps reactions transient through save/restore',()=>{
 for(const type of ['rat','wolf','bat','guard','captain','hellHound','hellSoul','hellGuard','hellJailer','ironScuttler','furnaceSentinel']){
  const g=game();g.enter(type.startsWith('hell')||['ironScuttler','furnaceSentinel'].includes(type)?'hellArena':'canal',800,540);g.pending=null;g.active=true;
  const e=g.enemy(type,1000,650,'qa-'+type);g.enemies.push(e);g.damage(e,20);assert.ok(reactionV30(e),type);
  const saved=parseSave(JSON.stringify(g.snapshot()));g.damage(e,999999);assert.equal(defeatsV30(g).length,1,type);const h=game();h.restore(saved);assert.equal(defeatsV30(h).length,0,type);assert.equal(reactionV30(h.enemies.find(a=>a.id===e.id)),null,type);
 }
});

test('new atlases remain available with their reviewed hashes and generation provenance',()=>{
 const manifest=read('ASSET_MANIFEST.json');assert.equal(manifest.assets.length,4);
 for(const a of manifest.assets){const bytes=fs.readFileSync(new URL('../'+a.path,import.meta.url));assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256,a.path);}
 assert.ok(read('GENERATION.json').prompts.objects);
});
