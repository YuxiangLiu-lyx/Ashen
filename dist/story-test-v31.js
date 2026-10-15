// Test-session tools reuse production scene, quest, combat and reward reducers.
// There is no write to storage here; the UI owns the existing isolated test slots.
import {c1UIAction} from './chapter-one-expansion-ui.js';
import {C3_DEFERRED} from './rpg-chapter-three-data.js';
import {V12_PACING} from './pacing-data-v14.js';
import {MAPS,DIALOGUES} from './data-v14.js';
import {enableStoryTestV25,isStoryTestV25,storyTestChapterSaveKeyV26,STORY_TEST_CHAPTERS} from './story-test-v25.js';
import {createStoryChapterTestV26} from './story-test-v26.js';
import {ChapterOneStoryFlow} from './chapter-one-dialogues-v31.js';
import {SAGA_NODES_V25,SAGA_TASKS_V25} from './saga-nodes-v25.js';
import {SAGA_CHAINS67_V26} from './saga-chains67-v26.js';
import {SAGA_CHAINS8_V26} from './v26-story8-chains.js';
const chains=[...SAGA_CHAINS67_V26,...SAGA_CHAINS8_V26];

function finishScenes(g,stop=()=>false){
 for(let i=0;g.pending&&!stop();i++){
  if(i>=40)throw Error('这段对白尚未结束，请继续对白后重试。');
  const flow=new ChapterOneStoryFlow(g,g.pending.lines||DIALOGUES[g.pending.id]);
  // complete() restores the real staging and marks the chapter-one hidden tail.
  flow.complete();if(!flow.finished)flow.complete();
 }
}
function entry(map){
 if(MAPS[map].entry)return MAPS[map].entry;
 const door=Object.values(MAPS).flatMap(m=>m.doors||[]).find(d=>d.to===map&&Number.isFinite(d.tx)&&Number.isFinite(d.ty));
 if(!door)throw Error('找不到章节入口：'+map);return [door.tx,door.ty];
}
function go(g,map){if(g.map!==map)g.enter(map,...entry(map));g.active=true;}
function pacing(g,id){
 const q=V12_PACING.find(q=>q.id===id);go(g,q.giverMap);finishScenes(g);
 if(!g.v12?.quests[id]){g.choose('v12q:accept:'+id);finishScenes(g);}
 for(let i=0;i<q.goals.length;i++)if(g.v12.quests[id].counts[i]<q.goals[i].count){
  const goal=q.goals[i];go(g,Array.isArray(goal.map)?goal.map[0]:goal.map);finishScenes(g);
  g.choose('v12q:advance:'+id+':'+i);finishScenes(g);
 }
 if(!g.v12.quests[id].claimed){go(g,q.receiverMap);g.choose('v12q:claim:'+id);}
}
function approach(g,target){
 const at={x:target.interactX??target.x,y:target.interactY??target.y};
 for(const r of [0,40,70,95])for(let i=0;i<(r?24:1);i++){
  const a=i*Math.PI/12,q={x:at.x+Math.cos(a)*r,y:at.y+Math.sin(a)*r};
  if(!g.blocked(q.x,q.y)&&g.clearLine(q,at,false)){g.relocate(q.x,q.y);return;}
 }
 throw Error('目标暂时无法接近，请先完成眼前交互。');
}
function use(g,id){const p=g.props.find(p=>p.id===id);if(!p)throw Error('当前任务目标不存在：'+id);approach(g,p);g.useProp(id,true);}
// Skipping a collection/handoff deliberately bypasses distance and sight, only
// for this detached test instance and this one call. Preserve world geometry.
function testInteract(g,target,action){
 if(!target)throw Error('当前任务交互目标不存在。');
 const actor=g.p,map=g.map,at={x:actor.x,y:actor.y},own=Object.hasOwn(g,'clearLine'),line=g.clearLine;
 actor.x=target.interactX??target.x;actor.y=target.interactY??target.y;g.clearLine=()=>true;
 try{return action();}finally{
  if(own)g.clearLine=line;else delete g.clearLine;
  if(g.p===actor&&g.map===map)g.relocate(at.x,at.y);
 }
}
function clear(g,predicate=()=>true){
 // A bounded snapshot of the current wave; reducers may spawn the next wave.
 for(const e of [...g.enemies])if(!e.dead&&predicate(e))g.damage(e,Math.max(1,e.hp),'enchant');
}
function tick(g){g.active=true;g.update(.02,{});}
function boss(g,map,type){
 go(g,map);finishScenes(g);
 if(!g.enemies.some(e=>!e.dead&&e.v11Boss===type)){g.startV11Boss(type);finishScenes(g);}
 clear(g);tick(g);finishScenes(g);
}
function earlyStep(g){
 switch(g.chapter){
 case 0:
  if(!g.quests.rats){g.choose('ratsAccept');finishScenes(g);}
  go(g,'warehouse');finishScenes(g);clear(g);for(const id of ['c1-wall-hole','c1-board','c1-wall-seal'])if(g.props.some(p=>p.id===id))use(g,id);use(g,'crack');finishScenes(g);
  go(g,'hall');g.choose('ratsDone');break;
 case 1:{
  if(!g.c1Expansion.preparation.started){go(g,'hall');g.choose('contractAccept');break;}
  if(g.quests.c1Readiness!=='done'){go(g,'hall');g.choose('c1:accept:c1Readiness');finishScenes(g);go(g,'c1TrainingYard');clear(g);go(g,'hall');g.choose('c1:claim:c1Readiness');break;}
  if(!g.c1TrialComplete()){go(g,'c1TrialFoyer');g.choose('c1:accept:c1ExitDrill');finishScenes(g);for(const map of ['c1DrillGallery','c1TrialCrypt','c1TrialVault']){go(g,map);finishScenes(g);clear(g);}}
  go(g,'hall');g.choose('contractAccept');break;
 }
 case 2:{
  // Test skip settles the real current objectives and giver reducers, one task
  // per step. It never relies on the retired auto-payment behavior.
  const routes=[['c1Readiness','hall','c1TrainingYard'],['c1ExitDrill','c1TrialFoyer','c1DrillGallery'],['v12CourierRoad','road','road'],['v12NorthDelivery','town','town'],['c1GateCheck','town','town'],['c1CanalPrep','town','c1NorthWalk'],['c1LoomBrief','hall','hall']];
  const next=routes.find(([id])=>g.quests[id]!=='done');
  if(next){const [id,giver,map]=next;go(g,giver);finishScenes(g);g.choose('c1:accept:'+id);finishScenes(g);go(g,map);finishScenes(g);
   if(id==='c1LoomBrief'){use(g,'c1-loom');c1UIAction(g,'preview');c1UIAction(g,'gift');}else if(['c1Readiness','c1ExitDrill','v12CourierRoad','c1CanalPrep'].includes(id)){clear(g);if(id==='c1ExitDrill'){go(g,'c1TrialCrypt');finishScenes(g);clear(g);}}
   go(g,giver);g.choose('c1:claim:'+id);finishScenes(g);if(g.quests[id]!=='done')throw Error('章节测试交接尚未完成：'+id);
   if(id==='v12CourierRoad'){g.c1Morning();finishScenes(g);}return;
  }
  go(g,'chapel');finishScenes(g);g.choose('observe');break;
 }
 case 3:go(g,'canal');finishScenes(g);g.choose('c1:accept:c1CanalBreak');finishScenes(g);if(!g.flags.captainStarted)g.apply('captain');clear(g);break;
 case 4:{
  go(g,'canal');g.choose('c1:accept:c1CanalBreak');finishScenes(g);clear(g);g.choose('c1:claim:c1CanalBreak');finishScenes(g);for(const id of ['c1-sluice','c1-hideout'])if(g.props.some(p=>p.id===id)){use(g,id);finishScenes(g);}g.requestDeparture();approach(g,MAPS.canal.doors.find(d=>d.to==='end'));
  if(!g.confirmDeparture())throw Error('离城准备尚未完成。');break;
 }
 case 5:g.enter('post',...entry('post'));break;
 case 6:go(g,'inn');finishScenes(g);g.choose('ch2:relay');break;
 case 7:if(!g.flags.v12WatchHoursDone&&!g.v12?.migrations.bridge)return pacing(g,'v12WatchHours');go(g,'manor');finishScenes(g);use(g,'inner-door');break;
 case 8:go(g,'manor');clear(g);tick(g);break;
 case 9:g.beginScene('ch2Breakout','ch2_target_after');break;
 case 10:go(g,'exile');finishScenes(g);use(g,'exile-mark');break;
 case 11:go(g,'exile');finishScenes(g);use(g,'exile-deep');break;
 default:throw Error('当前没有可跳过的主线步骤。');
 }
}
function thirdStep(g){
 const stage=g.ch3.stage;
 if(['arrival','road'].includes(stage)){
  if(!g.flags.ch3Advance1)return boss(g,'hellQuarry','ironScuttler');
  if(!g.flags.ch3Advance2)return boss(g,'hellSluice','furnaceSentinel');
  go(g,'hellWall');return;
 }
 if(['ambush','defense'].includes(stage)){clear(g);tick(g);return;}
 if(stage==='medicine'){
  const goal=g.objective();go(g,goal.map);finishScenes(g);
  if(goal.target==='doctor')g.choose('ch3:doctorTalk');
  else if(goal.target==='mechanist')g.choose('ch3:borrow');
  else use(g,goal.target);return;
 }
 if(g.flags.ch3BossDefeated){
  go(g,'hellArena');if(g.ch3.bossChoice)g.hellAction('bossReward','book');
  use(g,'hell-boss-chain');if(g.transition)g.confirmTransition();return;
 }
 go(g,'hellArena');finishScenes(g);clear(g);
 if(!g.pending&&!g.flags.ch3BossStarted){use(g,'hell-boss-chain');finishScenes(g);clear(g);}
}
function fourthStep(g){
 if(g.flags.ch4Complete){g.startChapterFive();return;}
 if(!g.flags.ch4EnchantUnlocked){go(g,'deepCamp');finishScenes(g);g.choose('v11:smithTalk');return;}
 if(!g.flags.v12CleanBottlesDone&&!g.v12?.migrations.camp)return pacing(g,'v12CleanBottles');
 for(const [flag,map,type] of [['ch4Odric','deepCourt','odric'],['ch4Martha','deepBastion','martha'],['ch4Severin','deepCloister','severin']])if(!g.flags[flag])return boss(g,map,type);
 if(!g.flags.ch4V13MemoryComplete){go(g,'deepSeal');finishScenes(g);use(g,'v11-deep-seal');return;}
 go(g,'deepCamp');finishScenes(g);g.choose('v11:endTalk');
}
function fifthStep(g){
 if(!g.flags.ch5MentorReady){go(g,'ch5Memorial');finishScenes(g);g.choose('v14ch5:mentor-before');return;}
 if(!g.p.career?.id){
  // A test-only default build; the normal career UI is still available before skipping.
  if(!g.chooseCareer(g.careerOptions()[0].id))throw Error('请先在转职界面选定传承，再跳过下一步。');
 }
 if(!g.flags.ch5MentorDone){go(g,'ch5Memorial');g.finishChapter5Career();return;}
 if(!g.flags.ch5CityUnlocked){go(g,'ch5Gate');g.startChapter5Boss();finishScenes(g);g.hurt(1);return;}
 if(!g.flags.ch5CitySeen){go(g,'ch5CityGate');return;}
 if(!g.flags.ch5BossDefeated){go(g,'ch5Gate');g.startChapter5Boss();finishScenes(g);clear(g);return;}
 go(g,'ch5Exit');finishScenes(g);g.active=true;g.startSagaV25();
}
function sagaStep(g){
 const expansion=g.sagaV26?.active;
 if(expansion){
  const step=chains.find(c=>c.id===expansion.id)?.steps[expansion.step];
  if(!step)throw Error('当前测试任务阶段无法识别。');
  go(g,step.map);
  for(let i=0;!g.sagaExpansionReadyV26()&&i<80;i++){
   clear(g,e=>e.sagaV26);
   for(const prop of [...g.props])if(!prop.used&&((prop.action==='v26:gather'&&step.collect?.some(i=>i.id===prop.v26Item))||(prop.action==='v26:drop'&&expansion.drops[prop.v26Enemy])))testInteract(g,prop,()=>g.useProp(prop.id));
   tick(g);
  }
  if(!g.sagaExpansionReadyV26())throw Error('任务材料尚未收齐，请重试。');
  go(g,step.turnIn.map);
  if(!testInteract(g,g.npcs.find(n=>n.id===step.turnIn.npc),()=>g.choose('v26:handin')))throw Error('任务交付尚未完成。');return;
 }
 const s=g.sagaV25,node=SAGA_NODES_V25[s.stage];
 if(!node)throw Error('八章主线测试已完成，可从选章菜单重新开始。');
 if(s.phase==='awaiting'){
  go(g,node.map);if(node.trigger)approach(g,{x:node.trigger[0],y:node.trigger[1]});tick(g);return;
 }
 const task=SAGA_TASKS_V25[s.task?.id];if(!task)throw Error('当前没有可跳过的任务。');
 go(g,task.map);
 if(task.kind==='duel'){g.hurt(1);return;}
 if(task.kind==='escape'){g.relocate(task.escapeAt[0],task.escapeAt[1]);tick(g);return;}
 if(g.sagaInvisibleV25())g.sagaCloakV25(false);
 clear(g,e=>(task.enemyIds||[]).includes(e.id));
 for(const id of task.propIds||[]){if(g.sagaV25.task?.id!==task.id)break;use(g,id);}
}
function step(g){
 if(g.transition){g.confirmTransition();return;}
 if(g.pending){finishScenes(g);return;}
 if(g.memoryV13?.active){clear(g);return;}
 if(g.sagaV25?.started)return sagaStep(g);
 if(g.flags.ch5Started)return fifthStep(g);
 if(g.flags.ch4Started)return fourthStep(g);
 if(g.flags.ch3Started){
  // A detached skip settles the current threat before the production safe-event tick.
  if(g.ch3?.experienceScenes?.some(id=>C3_DEFERRED[id]?.[0]===g.map)){clear(g);tick(g);if(g.pending){finishScenes(g);return;}}
  return thirdStep(g);
 }
 return earlyStep(g);
}
export function createStoryChapterTestV31(RPG,stats,chapter,cls='shadow'){
 if(!STORY_TEST_CHAPTERS.includes(chapter)||!['shadow','oath','ember'].includes(cls))throw Error('请选择章节和初始战法。');
 let g;
 if(chapter>=6)g=createStoryChapterTestV26(RPG,stats,chapter,cls);
 else{
  g=enableStoryTestV25(new RPG(cls),stats);g.active=true;
  if(chapter===1)g.startNew();
  if(chapter===2){for(let i=0;g.chapter<5;i++){if(i>=20)throw Error('第二章测试准备失败。');step(g);if(g.chapter<5)finishScenes(g,()=>g.chapter>=5);}}
  if(chapter===3)g.startChapterThree(true);
  if(chapter===4)g.startChapterFour(true);
  if(chapter===5)g.startChapterFive(true);
 }
 enableStoryTestV25(g,stats,storyTestChapterSaveKeyV26(chapter));
 g.p.mp=stats(g.p).mp;g.events=[];return g;
}
export function skipStoryTestStepV31(RPG,stats,current){
 if(!isStoryTestV25(current))throw Error('请先进入章节测试模式。');
 // Work on a detached copy. Failure keeps the active session and stored bytes intact.
 const g=enableStoryTestV25(new RPG(current.p.cls,current.snapshot()),stats,current.storyTestSaveKeyV26);
 const before=JSON.stringify([g.chapter,g.pending,g.objective(),g.sagaV25,g.sagaV26,g.flags,g.quests,g.c1Expansion,g.ch3,g.v11]);
 g.active=true;step(g);finishScenes(g);
 const after=JSON.stringify([g.chapter,g.pending,g.objective(),g.sagaV25,g.sagaV26,g.flags,g.quests,g.c1Expansion,g.ch3,g.v11]);
 if(before===after)throw Error('当前步骤未能推进，请完成眼前交互或重新选择章节。');
 g.moveTo=null;g.target=null;g.bullets=[];g.zones=[];g.events=[];g.active=true;
 return g;
}
