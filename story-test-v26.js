// A generated testing checkpoint, never a mutation of the player's save.
// The seed was already accepted by production V25 parseSave. History is advanced
// with the same scene/quest/death reducers as normal play, silently off-screen.
import {STORY_TEST_SEEDS_V26} from './story-test-seeds-v26.js';
import {SAGA_NODES_V25,SAGA_TASKS_V25} from './saga-nodes-v25.js';
import {MAPS} from './data-v14.js';
import {freshSagaV26} from './saga-state-v26.js';
import {enableStoryTestV25} from './story-test-v25.js';
function approach(g,prop){const target={x:prop.interactX??prop.x,y:prop.interactY??prop.y};for(const radius of [0,60,80,100])for(let i=0;i<(radius?16:1);i++){const angle=i*Math.PI/8,q={x:target.x+Math.cos(angle)*radius,y:target.y+Math.sin(angle)*radius};if(!g.blocked(q.x,q.y)&&g.clearLine(q,target,false)){g.relocate(q.x,q.y);return;}}throw Error('测试旅程的交互点无法接近：'+prop.id);}
export function createStoryChapterTestV26(RPG,stats,chapter,cls='shadow'){
 if(![6,7,8].includes(chapter)||!Object.hasOwn(STORY_TEST_SEEDS_V26,cls))throw Error('请选择第六、七或八章与一个初始职业。');
 const g=enableStoryTestV25(new RPG(cls,structuredClone(STORY_TEST_SEEDS_V26[cls]),()=>.5),stats);
 g._sagaTestFastForwardV26=true;g.active=true;g.pending=null;g.events=[];
 // These functions operate solely on this new, detached RPG instance.
 if(!g.startSagaV25())throw Error('测试旅程未能从已完成的第五章出发。');
 const target=SAGA_NODES_V25.findIndex(n=>n.chapter===chapter);let guard=0;
 while(g.sagaV25.stage<target){
  if(++guard>300)throw Error('测试旅程初始化未完成。');
  if(g.pending){g.finishScene();g.events=[];continue;}
  const s=g.sagaV25,node=SAGA_NODES_V25[s.stage];
  if(s.phase==='awaiting'){if(g.map!==node.map)g.enter(node.map,...MAPS[node.map].entry);g.active=true;g.update(.02,{});continue;}
  const task=SAGA_TASKS_V25[s.task?.id];if(!task)throw Error('测试旅程缺少目标。');
  if(g.map!==task.map)g.enter(task.map,...MAPS[task.map].entry);g.active=true;
  if(task.kind==='duel'){g.hurt(100000);continue;}
  if(task.kind==='escape'){g.relocate(task.escapeAt[0],task.escapeAt[1]);g.update(.02,{});continue;}
  for(const id of task.enemyIds||[]){const enemy=g.enemies.find(e=>e.id===id);if(enemy&&!enemy.dead)g.damage(enemy,enemy.hp+100000,'enchant');}
  for(const id of task.propIds||[]){if(g.sagaV25.task?.id!==task.id)break;const prop=g.props.find(p=>p.id===id);if(!prop)throw Error('测试旅程缺少道具。');approach(g,prop);if(!g.useProp(id))throw Error('测试旅程未能完成交付。');}
  g.events=[];
 }
 // Earlier expansion chains belong to the generated test history. No prior
 // V26 quest payout is invented, replayed, or offered to the user.
 delete g._sagaTestFastForwardV26;g.sagaV26=freshSagaV26(g.sagaV25);
 const node=SAGA_NODES_V25[target];if(g.map!==node.map)g.enter(node.map,...MAPS[node.map].entry);
 g.active=true;g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;g.moveTo=null;g.target=null;g.bullets=[];g.zones=[];g.fx=[];g.texts=[];g.events=[];
 // Chapter six already has its musician scene. Later starts open naturally on
 // the next simulation frame so the real chapter card and staging run normally.
 return g;
}
