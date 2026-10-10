import assert from 'node:assert/strict';
import fs from 'node:fs';
import {RPG} from '../../../../dist/core-v14.js';
import {DIALOGUES} from '../../../../dist/data-v14.js';
import {STAGING} from '../../../../dist/staging-v14.js';
import {chapterTick} from '../../../../dist/chapter-runtime-v14.js';

const ids=['ch2Arrival','ch2SearchAside','ch2Relay','darkCommissionV9','ch2Terms','ch2Bridge','ch2OuterCourt','ch2TargetBefore','ch2InnerDoor','ch2Alarm','ch2Breakout','ch2TargetAfter','ch2Spillway','ch2ExileApproach','ch2PursuitStops','ch2ExileEnd','darkExileV9'];
const transcript=ids.map(id=>({id,lines:DIALOGUES[id],map:STAGING.scenes[id]?.map}));
const runs=[];
for(const cls of ['shadow','oath','ember']){
 const g=new RPG(cls,null,()=>.44),trace=[];
 g.chapter=5;g.flags.chapterOneComplete=true;g.flags.complete=false;g.quests.escape='done';
 const end=id=>{assert.equal(g.pending?.id,id);trace.push({id,then:g.pending.then,phase:g.chapter,map:g.map});g.finishScene();};
 const prop=action=>{const p=g.props.find(x=>x.action===action);assert.ok(p,action);g.relocate(p.interactX??p.x,p.interactY??p.y);g.useProp(p.id);if(g.transition)g.confirmTransition();};
 g.enter('post',680,660);end('ch2Arrival');end('ch2SearchAside');
 assert.equal(g.chapter,6);
 g.enter('inn',730,650);g.choose('ch2:relay');end('ch2Relay');end('darkCommissionV9');end('ch2Terms');
 assert.equal(g.chapter,7);assert.equal(g.quests.relay,'done');
 g.enter('bridge',230,600);end('ch2Bridge');
 g.enter('manor',1000,640);end('ch2OuterCourt');chapterTick(g,0);end('ch2TargetBefore');
 prop('ch2-door');end('ch2InnerDoor');end('ch2Alarm');assert.equal(g.chapter,8);assert.equal(g.flags.alarm,true);
 for(let wave=0;wave<2;wave++){
  for(const e of g.enemies.filter(e=>!e.dead))g.damage(e,999999);
  chapterTick(g,0);
 }
 end('ch2Breakout');end('ch2TargetAfter');assert.equal(g.chapter,10);assert.equal(g.map,'spillway');end('ch2Spillway');
 assert.equal(g.quests.breakout,'done');assert.equal(g.quests.exile,'active');
 const hesterWasKilled=Object.values(g.states).some(s=>(s.enemies||[]).some(e=>e.id==='hester'&&e.dead));assert.equal(hesterWasKilled,false);
 assert.equal(g.canDoor({to:'chamber'}),'这里没有可走的入口。');
 g.enter('exile',500,650);prop('ch2-mark');end('ch2ExileApproach');end('ch2PursuitStops');
 assert.equal(g.flags.exileCrossed,true);assert.equal(g.flags.pursuitStopped,true);
 prop('ch2-deep');end('ch2ExileEnd');end('darkExileV9');
 assert.equal(g.flags.chapterTwoComplete,true);assert.equal(g.chapter,12);assert.equal(g.map,'hellGate');assert.equal(g.pending?.id,'ch3Arrival');
 assert.ok(g.knowledge.player.includes('exile-was-unplanned'));
 assert.ok(!g.knowledge.hero.includes('hester-tax-abuse'));assert.ok(!g.knowledge.saint.includes('hester-tax-abuse'));
 runs.push({cls,trace,final:{phase:g.chapter,map:g.map,pending:g.pending.id,quests:g.quests,knowledge:g.knowledge},assertions:'PASS'});
}
const out={scope:'现有运行章2状态/场景回放；固定章首，战斗由真实damage函数快速清场。不是完整实际游玩、战斗平衡或浏览器演出验收。',transcript,runs};
fs.writeFileSync(new URL('./ch2-current-replay.json',import.meta.url),JSON.stringify(out,null,2));
console.log(JSON.stringify({runs:runs.map(r=>({cls:r.cls,scenes:r.trace.length,final:r.final,assertions:r.assertions})),transcriptCount:transcript.length}));
