import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {RPG,MAPS,stats} from '../dist/core-v14.js';
import {Cinematic} from '../dist/cinematics-v14.js';
import {STAGING} from '../dist/staging-v14.js';
import {createStoryChapterTestV26} from '../dist/story-test-v26.js';
import {CH5_VISUAL_FAMILIES} from '../dist/chapter5-world-v14.js';
import {SAGA_ILLUSTRATIONS_V25,SAGA_ILLUSTRATION_BEATS_V25} from '../dist/saga-art-v25.js';
import {sceneIllustrationV19,prepareSceneIllustrationsV19,storyIllustrationHTMLV19,loadStoryIllustrationV19,STORY_ILLUSTRATIONS_V19} from '../dist/story-illustrations-v19.js';
import {actorHeightV281,nativeMonsterTypeV281,footRadiusV281,walkPhaseV281,chapterEightSceneV281,chapterEightArtV281} from '../dist/presentation-metrics-v281.js';
import {validFootBoxV281,pointInFootBoxV281,segmentFootBoxV281,supplementalFootprintsV281,installPresentationPhysicsV281} from '../dist/presentation-physics-v281.js';
import {V281_GEAR_SIGNATURES,gearAppearanceV281,weaponAngleV281,drawFittedEquipmentV281,drawWeaponSignatureV281} from '../dist/equipment-art-v281.js';
import {drawCutoutGaitV281,monsterStyleV281} from '../dist/actor-art-v281.js';
import {V28_RARE_GEAR} from '../dist/combat-overhaul-v28.js';
import {createGear,appearance} from '../dist/equipment-v14.js';
import {medicalDepth} from '../dist/medical-staging-v14.js';
import {mapFurnitureV26,furnitureFootprintV26} from '../dist/scene-geometry-v26.js';
import {SCENERY} from '../dist/world-v14.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const navBaseline=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/v28-navigation.json')));
function mockCanvas(){const calls=[];const c=new Proxy({calls,drawImage:(...v)=>calls.push(['drawImage',...v]),save:()=>calls.push(['save']),restore:()=>calls.push(['restore'])},{get:(t,k)=>k in t?t[k]:(...v)=>calls.push([k,...v]),set:(t,k,v)=>(t[k]=v,calls.push(['set',k,v]),true)});return c;}
function mapGame(id){const g=new RPG('shadow');g.map=id;g.ensureMap(id);g.pending=null;g.active=false;return g;}

test('native species is independent of V28 player-level skin fields',()=>{
 for(const type of ['rat','bat','wolf','guard','hellHound','hellSoul','hellGuard','deepHound','deepSoul','deepGuard'])for(const level of [1,8,16,32])assert.equal(nativeMonsterTypeV281({type,level,v28VisualType:'rat',v28Filter:'hue-rotate(99deg)'},CH5_VISUAL_FAMILIES),type);
});
test('boss identities have meaningful silhouettes rather than a common guard',()=>{
 assert.equal(nativeMonsterTypeV281({type:'ch5Gatekeeper'},CH5_VISUAL_FAMILIES),'furnaceSentinel');
 assert.equal(nativeMonsterTypeV281({type:'v25FinalJudge'},CH5_VISUAL_FAMILIES),'severin');
 const looks=['captain','hellJailer','ironScuttler','furnaceSentinel','odric','martha','severin','ch5Gatekeeper','v25FinalJudge'].map(type=>monsterStyleV281({type,id:type,isBoss:true},CH5_VISUAL_FAMILIES));
 assert.equal(new Set(looks.map(s=>s.type+':'+s.ornament)).size,looks.length);
});
test('small creatures, humans and bosses use separate bounded scales',()=>{
 assert.equal(actorHeightV281({id:'hero'},'hero'),84);assert.equal(actorHeightV281({id:'saint'}),80);assert.equal(actorHeightV281({id:'ch8Chengli',size:130}),81);
 for(const size of [40,70,90,140])assert.ok(actorHeightV281({id:'villager',size})>=76&&actorHeightV281({id:'villager',size})<=86);
 assert.ok(actorHeightV281({type:'rat'})<actorHeightV281({type:'wolf'}));assert.ok(actorHeightV281({type:'furnaceSentinel'})>actorHeightV281({type:'guard'}));
 assert.ok(footRadiusV281({type:'furnaceSentinel',isBoss:true})>footRadiusV281({id:'hero'}));
});
test('foot-space depth contract preserves flat ground and explicit pivots',()=>{
 assert.equal(medicalDepth({y:200,footY:240},'npc'),240);assert.equal(medicalDepth({y:200,footY:240,flat:true},'scenery'),0);
 assert.ok(medicalDepth({y:201},'npc')>medicalDepth({y:200},'npc'));
});
test('footprint validation and segment clipping handle boundaries',()=>{
 assert.equal(validFootBoxV281([0,0,20,10]),true);assert.equal(validFootBoxV281([0,0,-1,10]),false);assert.equal(validFootBoxV281([NaN,0,1,1]),false);
 assert.equal(pointInFootBoxV281(5,5,[0,0,20,10]),true);assert.equal(pointInFootBoxV281(22,5,[0,0,20,10],3),true);
 assert.equal(segmentFootBoxV281({x:-5,y:5},{x:30,y:5},[0,0,20,10]),true);assert.equal(segmentFootBoxV281({x:-5,y:15},{x:30,y:15},[0,0,20,10]),false);
});
test('missing trees, basins and beds get footprints; authored boxes remain authoritative',()=>{
 for(const [sheet,asset]of [['world',4],['world',13],['medicalProps',1],['medicalCart',0]])assert.equal(supplementalFootprintsV281({id:'x',sheet,asset,x:500,y:600,w:160,h:120}).length,1);
 for(const extra of [{box:[1,2,3,4]},{flat:true},{geometryV26:false},{romanceWaterV20:true}])assert.equal(supplementalFootprintsV281({sheet:'world',asset:4,x:500,y:600,w:160,h:120,...extra}).length,0);
});
test('arch posts block sides without sealing the central doorway',()=>{
 const parts=supplementalFootprintsV281({id:'gate',sheet:'world',asset:7,x:800,y:600,w:180,h:220});assert.equal(parts.length,2);
 assert.equal(parts.some(o=>pointInFootBoxV281(800,590,o.box,12)),false);assert.equal(parts.some(o=>pointInFootBoxV281(730,590,o.box,12)),true);
});
test('actor sweep cannot tunnel through a narrow obstacle',()=>{
 const g=mapGame('hall'),obstacle={x:800,y:740};g.p.x=275;g.p.y=740;g.moveActor(g.p,620,740,false);
 assert.ok(g.p.x<=288,'player should not finish inside the authored hall table');
 // A deterministic isolated solver test for thin walls, independent of map furnishing changes.
 const old=g.blocked;g.blocked=(x,y)=>x>500&&x<520;g.p.x=470;g.p.y=500;g.moveActor(g.p,560,500);assert.ok(g.p.x<=500);g.blocked=old;
});
test('walk phase advances with travelled distance, not wall time',()=>{
 assert.equal(walkPhaseV281({walkDistance:0}),0);assert.notEqual(walkPhaseV281({walkDistance:0}),walkPhaseV281({walkDistance:21}));
 const c=mockCanvas();drawCutoutGaitV281(c,{},[0,0,100,200],[-20,-80,40,80],{moving:false});assert.equal(c.calls.filter(x=>x[0]==='drawImage').length,1);
 for(const distance of [0,36]){const c=mockCanvas();drawCutoutGaitV281(c,{},[0,0,100,200],[-20,-80,40,80],{moving:true,walkDistance:distance});const draws=c.calls.filter(x=>x[0]==='drawImage');assert.equal(draws.length,3);assert.notEqual(draws[1][7],draws[2][7]);}
});
test('moving a companion accumulates gait distance and enemy movement is not double-counted',()=>{
 const g=mapGame('hall');g.p.x=800;g.p.y=900;const a={id:'friend',x:800,y:900,walkDistance:0};g.moveActor(a,810,900,false);assert.equal(a.walkDistance,10);
 const e={id:'enemy-test',type:'guard',x:800,y:900,walkDistance:0};g.inEnemyMovement=true;g.moveActor(e,810,900,false);g.inEnemyMovement=false;assert.equal(e.walkDistance,10);
});
test('resting/carry transfers never receive fake walking limbs',()=>{
 for(const pose of ['lying','sleep','sleep-bed','carried']){const c=mockCanvas();drawCutoutGaitV281(c,{},[0,0,100,200],[-20,-80,40,80],{pose,moving:true});assert.equal(c.calls.filter(x=>x[0]==='drawImage').length,1);}
});
test('all 24 rare gear IDs have appearance signatures',()=>{
 assert.equal(V28_RARE_GEAR.length,24);assert.equal(Object.keys(V281_GEAR_SIGNATURES).length,24);for(const item of V28_RARE_GEAR)assert.ok(V281_GEAR_SIGNATURES[item.id]);
 assert.notEqual(gearAppearanceV281({id:'v28-ashen-vow',rarity:'abyssal'}).signature,gearAppearanceV281({id:'v28-greyfang-edge',rarity:'rare'}).signature);
});
test('weapon types and offhand-only rarity survive appearance projection',()=>{
 for(const [cls,type]of [['shadow','daggers'],['oath','sword'],['oath','greatsword'],['ember','staff'],['ember','wand']]){const item=createGear(cls,24,()=>.4,{slot:'weapon',weaponType:type,rarity:'legendary'});const p={cls,gear:{offhand:{...item,slot:'offhand'}}};assert.equal(appearance(p).weapon,type);assert.equal(appearance(p).weaponTier,'legendary');}
 assert.equal(weaponAngleV281('daggers',[0,0],[-12,0],.8),.8);assert.equal(weaponAngleV281('staff',[0,0],[20,5],-1.3),-1.3,'do not flip an authored weapon across the body');
});
test('special weapon appearances produce distinct geometry with balanced canvas state',()=>{
 const signatures=[];for(const id of ['v28-greyfang-edge','v28-bonebrand','v28-oath-ember','v28-ashen-vow']){const c=mockCanvas();drawWeaponSignatureV281(c,{id,weaponType:'daggers',rarity:'abyssal'},[0,-30],.8,30);signatures.push(JSON.stringify(c.calls));assert.equal(c.calls.filter(x=>x[0]==='save').length,c.calls.filter(x=>x[0]==='restore').length);}
 // All four named rare weapons have different structural details, not just recoloring.
 assert.equal(new Set(signatures).size,4);
});
test('fitted gear preserves face clearance and finite per-frame coordinates',()=>{
 const c=mockCanvas();drawFittedEquipmentV281(c,{head:{id:'v28-greycrown',rarity:'legendary'},chest:{id:'v28-last-guard',rarity:'abyssal'},relic:{id:'v28-nameless-echo',rarity:'abyssal'}},{head:[2,-65],hand:[14,-30],offhand:[-12,-28],feet:[[-7,0],[6,0]]},'oath');
 for(const call of c.calls)for(const x of call.slice(1))if(typeof x==='number')assert.ok(Number.isFinite(x));assert.equal(c.calls.filter(x=>x[0]==='save').length,c.calls.filter(x=>x[0]==='restore').length);
});
test('chapter 8 CG references, preload and HTML are disabled; other chapters keep illustrations',()=>{
 assert.deepEqual(Object.keys(SAGA_ILLUSTRATIONS_V25),[]);assert.deepEqual(Object.keys(SAGA_ILLUSTRATION_BEATS_V25),[]);
 for(const id of ['v25C8Sanctuary','v25C8Dawn','v25C8Bind','c8v26FirstAid','ch8After']){assert.equal(chapterEightSceneV281(id),true);assert.equal(sceneIllustrationV19({id,cine:{id,map:'ch8GuestHouse'}},{[id]:[{id:'tavern',from:0,to:100}]}),null);prepareSceneIllustrationsV19(id,{[id]:[{id:'tavern'}]},()=>assert.fail('chapter 8 must not preload'));}
 for(const id of ['v25-c8-first','assets/v26/c8-binding-v26.webp']){assert.equal(chapterEightArtV281(id),true);assert.equal(storyIllustrationHTMLV19({id}), '');assert.equal(loadStoryIllustrationV19(id),false);}
 assert.ok(STORY_ILLUSTRATIONS_V19.tavern);assert.equal(chapterEightSceneV281('v20RomanceTavern','ch5Tavern'),false);
});
test('all 118 map registries load; no previously open doorway becomes blocked',()=>{
 assert.equal(navBaseline.maps.length,118);for(const base of navBaseline.maps){assert.ok(MAPS[base.id]);const g=mapGame(base.id);for(const door of base.doors){if(door.blocked)continue;const actual=MAPS[base.id].doors[door.id];assert.equal(g.blocked(actual.x,actual.y,false),false,base.id+' doorway '+door.id);}}
});
test('all nine later-chapter/class checkpoints construct and restore',()=>{
 for(const chapter of [6,7,8])for(const cls of ['shadow','oath','ember']){const g=createStoryChapterTestV26(RPG,stats,chapter,cls),s=g.snapshot(),restored=new RPG(cls,structuredClone(s));assert.equal(restored.map,g.map);assert.equal(restored.sagaV25.stage,g.sagaV25.stage);assert.deepEqual(restored.quests,g.quests);assert.equal(restored.p.level,g.p.level);}
});
test('27 medical, seating and chapter 8 scenes retain executable stage routes',()=>{
 const g0=createStoryChapterTestV26(RPG,stats,8,'shadow');const ids=Object.keys(STAGING.scenes).filter(id=>/v25C8(?:Sanctuary|Dawn|TrialRescue|Bind|After)$|c8v26|ch3(?:Wound|RescueCart|Doctor|Treatment)|v20Romance(?:Rest|Bed|Care)|v24Moment/i.test(id)).slice(0,75);assert.ok(ids.length>=27);
 for(const id of ids){const g=new RPG('shadow',structuredClone(g0.snapshot()));g.map=STAGING.scenes[id].map;g.ensureMap(g.map);g.pending={id};const c=new Cinematic(g,id);for(const b of c.stage.beats){c.setLine(b.line);c.fastForward();}c.startOutro();c.fastForward();assert.ok(c.actors.every(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)),id);}
});
test('derived atlases have matching dimensions and exact SHA256 manifest',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'docs/v28.1/ASSET_MANIFEST.json')));assert.equal(m.assets.length,5);
 for(const item of m.assets){const src=fs.readFileSync(path.join(root,'dist',item.source)),out=fs.readFileSync(path.join(root,'dist',item.output));assert.equal(crypto.createHash('sha256').update(src).digest('hex'),item.source_sha256);assert.equal(crypto.createHash('sha256').update(out).digest('hex'),item.output_sha256);assert.equal(out.readUInt32BE(16),item.width);assert.equal(out.readUInt32BE(20),item.height);assert.equal(src.readUInt32BE(16),item.width);assert.equal(src.readUInt32BE(20),item.height);}
});


test('large actor clearance expands existing unboxed furniture for movement and paths',()=>{
 const box=[100,100,40,30],object={id:'table',box};
 class Fixture{
  constructor(){this.map='room';this.states={room:{props:[]}};}
  blocked(x,y){return !this.geometryIgnoreV26?.has('table')&&pointInFootBoxV281(x,y,box,10);}
  clearLine(a,b){return this.geometryIgnoreV26?.has('table')||!segmentFootBoxV281(a,b,box,10);}
  moveActor(a,x,y){if(!this.blocked(x,y)){a.x=x;a.y=y;}}
  pathDirection(a,b){return this.clearLine(a,b)?{x:1,y:0}:{x:0,y:0};}
  update(){}enter(){}restore(){}
 }
 installPresentationPhysicsV281(Fixture,{MAPS:{room:{blocks:[],props:[]}},SCENERY:{room:[]},furniture:()=>[object]});
 const g=new Fixture(),start={x:60,y:85},end={x:180,y:85};
 assert.equal(g.clearLine(start,end),true,'preserve human staging apertures');
 const boss={type:'furnaceSentinel',isBoss:true,x:80,y:115};
 g.moveActor(boss,85,115,false);assert.equal(boss.x,80,'boss feet must not clip the unboxed table');
 g.navigationRadiusV281=20;assert.equal(g.blocked(85,115),true);assert.equal(g.clearLine(start,end),false);
 g.geometryIgnoreV26=new Set(['table']);assert.equal(g.blocked(85,115),false);assert.equal(g.clearLine(start,end),true);
});
test('unnamed runtime furniture has stable per-object IDs for selective seat transfers',()=>{
 const map='qa-v281-unnamed';
 MAPS[map]={props:[],blocks:[]};SCENERY[map]=[
  {sheet:'world',asset:9,x:500,y:500,w:100,h:80},
  {sheet:'world',asset:9,x:700,y:500,w:100,h:80}
 ];
 try{
  const first=mapFurnitureV26(map),again=mapFurnitureV26(map);
  assert.equal(first.length,2);assert.deepEqual(first.map(o=>o.id),[map+':scenery:0',map+':scenery:1']);
  assert.deepEqual(first.map(o=>o.id),again.map(o=>o.id),'stable across cached reads');
  const ignore=new Set([first[0].id]);assert.equal(ignore.has(first[1].id),false);
 }finally{delete MAPS[map];delete SCENERY[map];}
});
test('spawn repair rescues active companions but preserves downed and seated transfers',()=>{
 const live={id:'live',x:110,y:115},down={id:'down',x:110,y:115,downed:true},carried={id:'patient',x:110,y:115,patientSurface:'cot'};
 class Fixture{
  constructor(){this.map='room';this.p={x:20,y:20};this.states={room:{enemies:[],props:[]}};this.paths=new Map([['old',{}]]);}
  blocked(x,y){return pointInFootBoxV281(x,y,[100,100,40,30],10);}
  clearLine(){return true;}moveActor(){}pathDirection(){}update(){}enter(){}restore(){}
  safePoint(){return {x:60,y:60};}activeMercenaries(){return [live,down,carried,live];}
 }
 installPresentationPhysicsV281(Fixture,{MAPS:{room:{blocks:[],props:[]}},SCENERY:{room:[]}});
 const g=new Fixture();g.enter('room');
 assert.deepEqual([live.x,live.y],[60,60]);assert.deepEqual([down.x,down.y],[110,115]);assert.deepEqual([carried.x,carried.y],[110,115]);assert.equal(g.paths.size,0);
});
