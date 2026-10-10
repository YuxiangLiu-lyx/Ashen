import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RPG} from '../dist/core-v14.js';
import {simulate} from '../tools/balance_lab/simulator.mjs';
import {reactionV30,defeatsV30,motionPoseV30} from '../dist/chapter-one-motion-v30.js';
import {chapterOneV30,drawChapterStrikeV30,chapterSceneryArtV30,chapterGuardFrameV30} from '../dist/chapter-one-art-v30.js';
import {worldOperationV29} from '../dist/world-runtime-v29.js';

test('12 real combat fixtures retain every baseline damage, resource, cooldown and RNG event',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/v29-combat-presentation.json',import.meta.url)));
 for(const {config,result} of baseline.runs)assert.deepEqual(simulate(config),result,config.cls+'/'+config.enemy);
});
test('hit reactions and defeats are transient, emitted once, sorted at the feet, and cleared on enter',()=>{
 const g=new RPG('shadow',null,()=>.44);g.enter('warehouse',680,400);g.pending=null;g.active=true;
 const e=g.enemies[0];g.damage(e,1);assert.ok(reactionV30(e));
 const snap=g.snapshot();assert.equal(JSON.stringify(snap).includes('reactionV30'),false);
 g.damage(e,10000);g.damage(e,10000);assert.equal(defeatsV30(g).length,1);
 assert.equal(defeatsV30(g)[0].y,e.y);g.update(.4,{});assert.equal(defeatsV30(g).length,0);
 const living=g.enemies.find(v=>!v.dead);g.damage(living,10000);assert.ok(defeatsV30(g).length);g.enter('hall',685,535);assert.equal(defeatsV30(g).length,0);
 g.restore(snap);assert.equal(defeatsV30(g).length,0);assert.equal(reactionV30(g.enemies[0]),null);
});
test('first chapter uses physical creature types and distinguishes windup, strike, recoil and fall',()=>{
 const a={x:800,y:600,type:'wolf',angle:0};const idle=motionPoseV30(a,0),wind=motionPoseV30({...a,wind:.1,windMax:.4}),strike=motionPoseV30({...a,attackAnim:.16}),fall=motionPoseV30({...a,fall:1});
 assert.ok(wind.dx<idle.dx);assert.ok(strike.dx>idle.dx);assert.ok(fall.sy<idle.sy);
 assert.ok(motionPoseV30(a,0,{reaction:{life:.16,dx:4,dy:2}}).dx>0);
 assert.equal(chapterOneV30('ch5Arcade'),false);
 for(const [index,id]of ['stock-a-left','stock-a-right','stock-b','stock-c'].entries()){const art=chapterSceneryArtV30({id,sheet:'world',asset:11});assert.equal(art.sheet,'narrativeStores');assert.equal(art.index,index);}
});
test('ordinary cut metadata takes the restrained trail; magical skills keep their own art',()=>{
 let strokes=0;const c=new Proxy({stroke(){strokes++;}},{get:(t,k)=>t[k]||(()=>{})});
 assert.equal(drawChapterStrikeV30(c,{type:'cut',skillKey:'attack',x:0,y:0,r:80,life:.1,max:.17}),true);
 assert.equal(strokes,1);assert.equal(drawChapterStrikeV30(c,{type:'cut',skillKey:'cleave'}),false);
 assert.equal(drawChapterStrikeV30(c,{type:'enemyCut',skillKey:'q',x:0,y:0,r:60,life:.1,max:.2}),true);
});
test('instant valve action accepts the real nearby target without a second update or save lock',()=>{
 const g=new RPG('shadow',null,()=>.44);g.enter('echo',850,480);g.pending=null;g.active=true;
 const t=g.targets().find(t=>t.id==='echo-valve');g.relocate(t.x,t.y);assert.equal(g.interact(t),true);
 assert.equal(g.flags.echoValve,true);assert.equal(worldOperationV29(g),null);assert.notEqual(g.saveBlockReason(),'先放稳手里的东西，再保存。');
});
test('live V29 non-demo audit correction only changes the retired arcade table, preserving the original record',()=>{
 const old=JSON.parse(fs.readFileSync(new URL('../docs/v29/MAP_AUDIT_BEFORE.json',import.meta.url))).maps;
 const live=JSON.parse(fs.readFileSync(new URL('./fixtures/v29-live-navigation.json',import.meta.url))).maps;
 const differences=old.filter(m=>!['road','millpath','echo','workshop'].includes(m.id)).filter(m=>m.walkableCells!==live.find(n=>n.id===m.id).walkableCells).map(m=>m.id);
 assert.deepEqual(differences,['ch5Arcade']);assert.equal(live.find(m=>m.id==='ch5Arcade').walkableCells,598);
});

test('guard sprites use directional foot-contact walk frames and distinct windup/strike/recovery',()=>{
 const a={angle:0,moving:true};assert.deepEqual([0,38,76,114].map(walkDistance=>chapterGuardFrameV30({...a,walkDistance})),[0,1,2,3]);
 assert.equal(chapterGuardFrameV30({...a,wind:.4,windMax:.45}),4);assert.equal(chapterGuardFrameV30({...a,wind:.1,windMax:.45}),5);
 assert.equal(chapterGuardFrameV30({...a,attackAnim:.3}),6);assert.equal(chapterGuardFrameV30({...a,attackAnim:.1}),7);
 assert.equal(chapterGuardFrameV30({...a,angle:-1,attackAnim:.3}),14);
});
