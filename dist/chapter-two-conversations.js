import {C2_CONVERSATIONS} from './chapter-two-conversations-data.js';
import {V12_PACING} from './pacing-data-v14.js';
import {sortQuestOptions,QUEST_PRIORITY,mapRegion} from './quest-service-v14.js';

// Preserve pages, staging and saved full text. New conversations use this edition.
export function installC2Conversations(RPG,{DIALOGUES}){
 for(const entry of C2_CONVERSATIONS){
  let rows;
  if(entry.static)rows=DIALOGUES[entry.key];
  else if(entry.key.startsWith('pacing:')){
   const [,id,part,index]=entry.key.split(':'),q=V12_PACING.find(q=>q.id===id);
   rows=part==='goal'?q.dialogue.goal[index]:q.dialogue[part];
  }
  if(!rows||rows.length!==entry.rows.length||rows.some((r,i)=>r[0]!==entry.rows[i][0]))throw Error('Chapter-two dialogue contract: '+entry.key);
  rows.splice(0,rows.length,...entry.rows.map(r=>r.slice()));
 }
 const P=RPG.prototype,old={npcOptions:P.npcOptions,objective:P.objective,canDoor:P.canDoor};
 const needsWatch=g=>g.chapter===7&&!g.flags.v12WatchHoursDone&&!g.v12?.migrations.bridge;
 const watchGoal=g=>g.v12?.quests?.v12WatchHours
  ?{text:'到灰桥北侧岗哨，向巡卫打听小件货物怎么进庄园',map:'bridge',target:'bridgewatch',type:'主线任务'}
  :{text:'问塞琳：今天桥口加岗，运柴门还能怎么走',map:'inn',target:'seline',type:'主线任务'};
 const main=o=>o.action==='ch2:relay'||o.action?.split(':')[2]==='v12WatchHours';
 P.npcOptions=function(id){
  const rows=old.npcOptions.call(this,id);if(mapRegion(this.map)!==2)return rows;
  return sortQuestOptions(this,id,rows).map((o,index)=>({o,index})).sort((a,b)=>QUEST_PRIORITY[a.o.questState]-QUEST_PRIORITY[b.o.questState]||Number(main(b.o))-Number(main(a.o))||a.index-b.index).map(x=>x.o);
 };
 P.objective=function(){return mapRegion(this.map)===2&&needsWatch(this)?watchGoal(this):old.objective.call(this);};
 P.canDoor=function(d){
  const reason=old.canDoor.call(this,d);
  if(this.map==='bridge'&&d.to==='manor'&&needsWatch(this))return this.v12?.quests?.v12WatchHours?'运柴门加了岗，桥口的巡卫知道今天怎么通行。':'今天的查验变了，塞琳应该听到了消息，可以回旅店问问她。';
  return reason;
 };
}
