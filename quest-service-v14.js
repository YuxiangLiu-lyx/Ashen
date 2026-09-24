import {MAPS,QUESTS} from './data-v14.js';
import {FAREWELL_IDS} from './mechanisms-v14.js';

// This is the final presentation resolver, installed after all chapter modules.
// Markers and menu priority use the SAME semantic option state, never label text.
export const QUEST_PRIORITY={ready:0,advance:0,available:1,waiting:2,service:3,daily:4};
export function mapRegion(map){return map.startsWith('ch5')?5:map.startsWith('deep')?4:map.startsWith('hell')?3:['post','inn','bridge','manor','chamber','spillway','exile','bridgecellar','wellcrypt'].includes(map)?2:1;}
export function chapterRegion(g){return mapRegion(g.map);}
export function questRegion(id){return id.startsWith('ch5')?5:id==='ch4'?4:id.startsWith('ch3')?3:['relay','breakout','exile','pump'].includes(id)?2:1;}
const returning={rats:'steward',oil:'steward',letter:'courier',herbs:'herbalist',lantern:'dolly',echo:'lotti',pump:'seline',ch3Machine:'mechanist',ch3Ferry:'ferryman'};
const accepts=new Set(['ratsAccept','oilAccept','letterAccept','herbsAccept','lanternAccept','echoAccept','ch2:pumpAccept']);
const submits=new Set(['ratsDone','oilDone','letterDone','herbsMira','herbsWoman','oldReturn','lanternReturn','echoReturn','ch2:pumpReturn','ch2:pumpReward','ch3:ferryChoice']);
const progress=new Set(['ratProgress','letterProgress','lanternUnclear','scene:selineWorkProgress']);
export function optionState(g,npc,option){
 if(option.questState)return option.questState;
 const a=option.action;
 if(submits.has(a))return 'ready';
 if(a==='contractAccept'&&g.chapter===1||a==='pass'&&g.chapter===2&&!g.flags.gateTalk||a==='ch2:relay'&&g.chapter===6)return 'advance';
 if(a==='lanternVerify'&&g.quests.lantern==='active'&&!g.ready('lantern'))return 'advance';
 if(a.startsWith('goodbye:'))return g.flags['goodbye-'+a.slice(8)]?'daily':'advance';
 if(accepts.has(a))return 'available';
 if(a==='ch3:doctorTalk')return g.ch3?.stage==='medicine'?(g.p.items.saltMoss&&g.p.items.milkCrystal?'ready':'waiting'):g.ch3?.stage==='doctor'?'advance':'daily';
 if(a==='ch3:borrow')return g.ch3?.stage==='medicine'&&!g.p.items.borrowedLamp&&!g.p.items.milkCrystal?'advance':'service';
 if(a==='ch3:machineTalk'||a==='ch3:ferryTalk'){const id=a==='ch3:machineTalk'?'ch3Machine':'ch3Ferry';return g.ready(id)?'ready':g.quests[id]==='active'?'waiting':g.quests[id]==='done'?'daily':'available';}
 if(a==='v11:smithTalk')return g.flags.ch4EnchantUnlocked?'service':'advance';
 if(a==='v11:endTalk')return 'ready';
 if(a==='lottiWorkState')return g.quests.echo==='active'?'waiting':'daily';
 if(progress.has(a))return 'waiting';
 if(/buy|shop|rest|openForge|openDraw|teachingTalk|returnLamp/.test(a))return 'service';
 return 'daily';
}
export function sortQuestOptions(g,npc,options){return options.map((o,index)=>({...o,questState:optionState(g,npc,o),index})).sort((a,b)=>QUEST_PRIORITY[a.questState]-QUEST_PRIORITY[b.questState]||a.index-b.index).map(({index,...o})=>o);}

export function legacyQuestGoal(g,id){
 const q=QUESTS[id];if(!q)return null;
 if(g.quests[id]==='done')return {text:'已完成',map:null,type:q.type+'任务',completed:true};
 if(questRegion(id)!==chapterRegion(g))return {text:'这件事留在了之前的旅程中。',map:null,type:q.type+'任务',suspended:true};
 const ready=g.ready(id),goal=(text,map,target)=>({text,map,target,type:q.type+'任务'});
 if(q.type==='主线')return {...g.objective(),type:'主线任务'};
 if(id==='ch3Machine')return goal(ready?'把铜簧交给芮妲':'到无灯矿道断轨西侧的检修柜取铜簧',ready?'hellWorkshop':'hellMine',ready?'mechanist':'ch3-machine-spring');
 if(id==='ch3Ferry')return goal(ready?'把灯芯架交给乌洛':'到黑潮渡岸北侧的搁浅小船取灯芯架','hellFerry',ready?'ferryman':'ch3-wick-frame');
 if(id==='pump')return g.chapter>=8?{text:'桥口封锁，修泵的事暂时搁置',map:null,suspended:true,type:'支线任务'}:goal(g.flags.pumpFixed?'和塞琳商量报酬':g.flags.pumpTool?'回旅店后院把连杆装好':'去灰桥南沟坏车旁找蓝布包',g.flags.pumpTool?'inn':'bridge',g.flags.pumpTool?'seline':'bridge-tools');
 if(id==='echo')return goal(ready?'把机芯交给洛缇':'从磨坊东南检修洞进入机房寻找机芯',ready?'workshop':'echo',ready?'lotti':'echo-machine');
 if(id==='copper')return goal(ready?'回修理铺装好旧练武环':'寻找旧磨坊西墙边的油布包',ready?'workshop':'millpath',ready?'repair-bench':'mill-copper');
 if(id==='lantern')return goal(ready?'把巡守路线告诉朵莉':'向北街的托马核实今晚巡守路线','town',ready?'dolly':'watch');
 if(id==='farewell'){const id=FAREWELL_IDS.find(n=>!g.flags['goodbye-'+n]),names={sister:'薇蕾娜',steward:'奥伦',lotti:'洛缇',dolly:'朵莉'};return id?{text:'临行前，和'+names[id]+'道别',map:['sister','steward'].includes(id)?'hall':id==='lotti'?'workshop':'town',target:id,type:'可选告别'}:{text:'已经和熟人道别',map:null,type:'可选告别',completed:true};}
 const names={steward:'奥伦',courier:'阿林',herbalist:'米拉'};
 return goal(ready?'回去见'+(names[q.giver]||q.giver):id==='oil'?'在旧库房寻找备用灯油':id==='letter'?'在王道东侧弯道找回信件':`采集银叶草 ${Math.min(3,g.p.items.herb||0)}/3`,ready?q.map:id==='oil'?'warehouse':'road',ready?q.giver:id==='oil'?'oil':id==='letter'?'letter':g.states.road?.props.find(o=>o.action==='herb'&&!o.used)?.id||'herb1');
}
export function installQuestService(RPG){
 const P=RPG.prototype,oldOptions=P.npcOptions;
 P.npcOptions=function(id){return sortQuestOptions(this,id,oldOptions.call(this,id));};
 P.marker=function(id){
  if(this.props.some(p=>p.id===id)){
   if(id==='repair-bench')return this.ready('copper')?'gold?':this.quests.copper==='active'?'?':!this.quests.copper?'!':'';
   if(id==='echo-machine'&&this.flags.echoWardenDefeated&&!this.flags.echoChoice)return 'gold?';
   const goals=[this.objective(),...Object.keys(QUESTS).filter(q=>this.quests[q]==='active').map(q=>this.questGoal(q))];return goals.some(goal=>goal&&!goal.completed&&!goal.suspended&&goal.map===this.map&&goal.target===id)?'gold?':'';
  }
  const options=this.npcOptions(id),kinds=options.map(o=>o.questState);
  if(kinds.some(k=>k==='ready'||k==='advance'))return 'gold?';
  if(kinds.includes('available'))return '!';
  if(kinds.includes('waiting'))return '?';
  if(Object.entries(returning).some(([q,n])=>n===id&&questRegion(q)===chapterRegion(this)&&this.quests[q]==='active'&&!this.ready(q)))return '?';
  return '';
 };
 P.questGoal=function(id){return this.pacingGoal?.(id)||legacyQuestGoal(this,id);};
 P.trackedGoal=function(){
  const id=this.flags.tracked;
  if(id&&this.quests[id]==='active'){const goal=this.questGoal(id);if(goal&&!goal.suspended&&!goal.completed)return goal;}
  const map=this.flags.mapGoal;
  if(map&&MAPS[map]&&chapterRegion(this)===mapRegion(map))return {text:'前往 '+MAPS[map].name,map,type:'探索目的地'};
  return {...this.objective(),type:'主线任务'};
 };
}
