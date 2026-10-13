import {C1_MAIN,C1_SIDE,C1_QUESTS,C1_PATROL,C1_PARTS} from './chapter-one-expansion-data.js';
import {C1_OBJECTIVES,C1_GIVERS,C1_NPC_NAMES,C1_ACCEPT_TEXT} from './chapter-one-objectives.js';
import {C1_MAPS,C1_RESOURCE_SITES,c1Map} from './chapter-one-layout.js';
import {c1State} from './chapter-one-expansion-save.js';
import {c1Item} from './chapter-one-expansion-gear.js';
import {STORY} from './story-data-v14.js';
import {normalizeGear} from './equipment-v14.js';
import {sortQuestOptions} from './quest-service-v14.js';
const near=(g,p,r=135)=>p&&Math.hypot(g.p.x-(p.interactX??p.x),g.p.y-(p.interactY??p.y))<=r&&g.clearLine(g.p,{x:p.interactX??p.x,y:p.interactY??p.y},false);
const steps=(g,id)=>c1State(g).questSteps[id]||(c1State(g).questSteps[id]={});
const done=(g,id)=>['claimed','waived'].includes(c1State(g).mainStages[id])||['done','expired'].includes(g.quests[id]);
const active=(g,id)=>g.quests[id]==='active'&&!done(g,id);
const count=(g,id)=>c1State(g).journey.counts[id]||0;
const chat=(g,lines,then=null)=>{g.beginScene('c1Conversation',then);g.pending.lines=lines;};
const roll=g=>{const j=c1State(g).journey;let x=j.seed>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;j.seed=x>>>0;return j.seed/4294967296;};
const causeDone=(g,id)=>!!c1State(g).elite[id]?.firstPartGranted||g.states[C1_OBJECTIVES[id]?.map]?.enemies.some(e=>e.id===id&&e.dead)||id==='echo-warden'&&!!g.flags.echoWardenDefeated;
export const C1_STEP_GUIDE={rats:[['sealed','warehouse','crack','清除六鼠后查看北墙鼠洞']],c1ClockMemory:[['name','grove','stone','除掉裂齿渠鼠后取回刻名石下的银环']]};
const acceptAliases={oilAccept:'oil',letterAccept:'letter',herbsAccept:'herbs',lanternAccept:'lantern',copperAccept:'copper',echoAccept:'echo'};
const submitAliases={oilDone:'oil',letterDone:'letter',herbsMira:'herbs',herbsWoman:'herbs',lanternReturn:'lantern',lanternReward:'lantern',copperComplete:'copper',echoReturn:'echo',oldReturn:'c1ClockMemory'};
export function installC1Quests(RPG,{QUESTS,DIALOGUES,MAPS}){
 DIALOGUES.c1Conversation=[['旁白','把眼前的事记清楚。']];
 const names={c1Readiness:'庭院实战',c1ExitDrill:'旧廊的试炼守卫',v12Water:'缓解旧伤的药',c1CanalPrep:'清除渠鼠，确认退路',c1CanalBreak:'闸口已清',c1RunePatrol:'沿线讨伐'};
 for(const q of Object.values(C1_QUESTS)){if(names[q.id])q.name=names[q.id];if(q.id==='copper')q.target='lotti';if(q.id==='c1Readiness')q.target='c1-moss-1';if(q.id==='c1ExitDrill')q.target='c1-trial-warden';if(q.id==='c1CanalPrep')q.target='c1-valve-rat';QUESTS[q.id]={...QUESTS[q.id],...q,giver:C1_GIVERS[q.id]||q.target,desc:C1_ACCEPT_TEXT[q.id]||q.name};}
 const P=RPG.prototype,old={};for(const k of ['ready','complete','apply','choose','npcOptions','useProp','canDoor','objective','questGoal','available','claimPacing','requestDeparture','targets','marker','ensureMap','enter','update','damage','restore'])old[k]=P[k];
 P.c1Count=function(id){return id==='rats'?Math.min(6,this.flags.rats||0):count(this,id);};
 P.c1Ready=function(id){if(!active(this,id))return false;const h=c1State(this),o=C1_OBJECTIVES[id];
  if(id==='rats')return this.flags.rats>=6&&!!this.flags.crack;
  if(id==='c1LoomBrief')return !!h.worldChanges.loomGift;
  if(id==='c1AlchemistSamples')return !h.samples.delivered&&Object.keys(C1_PARTS).every(k=>h.samples[k]);
  if(id==='echo')return !!this.flags.echoCoreFound;
  if(id==='c1ClockMemory')return !!this.flags.silverFound&&!this.flags.silverReturned;
  if(id==='v12NorthDelivery')return !!h.worldChanges.envelope;
  if(id==='c1GateCheck')return done(this,'v12NorthDelivery');
  if(id==='c1CanalBreak')return !!this.flags.captainDefeated&&!this.states.canal?.enemies.some(e=>!e.dead);
  if(o)return this.c1Count(id)>=o.count&&(!o.cause||causeDone(this,o.cause)||steps(this,id).legacyEvidence);
  return false;
 };
 P.ready=function(id){return this.chapter<5&&C1_QUESTS[id]?this.c1Ready(id):old.ready.call(this,id);};
 P.c1Accept=function(id){if(this.chapter>=5||!C1_QUESTS[id]||done(this,id))return false;if(!this.quests[id])this.quests[id]='active';steps(this,id);this.flags.tracked=id;
  if(id==='echo')this.flags.echoLog=true;
  if(id==='c1ClockMemory')this.flags.rumor=true;
  if(id==='herbs'){for(const map of Object.keys(C1_RESOURCE_SITES))this.c1SeedResources(map);}
  this.saveEvent();return true;
 };
 P.c1Claim=function(id,choice){const q=C1_QUESTS[id];if(!q)return false;const h=c1State(this),key=id==='c1RunePatrol'?'patrol:'+h.merchant.activePatrol?.sequence:'quest:'+id;
  if(h.claimLedger[key])return h.claimLedger[key];
  const event=['c1CommissionBrief','c1Assassination','c1Departure','farewell'].includes(id);
  if(!event&&!this.c1Ready(id))return false;
  const tx=this.c1Transaction(key,()=>{const items=[];
   if(id==='oil'){this.p.items.oil=Math.max(0,(this.p.items.oil||0)-1);this.addItem('hp',2);h.worldChanges.lampFixed=true;}
   if(id==='v12Water')this.addItem('hp');
   if(id==='letter'){this.p.items.letter=Math.max(0,(this.p.items.letter||0)-1);this.addItem('sprintBook');}
   if(id==='herbs'){this.p.items.herb=Math.max(0,(this.p.items.herb||0)-3);this.flags.herbChoice=choice==='woman'?'woman':'mira';if(choice==='woman'){this.addItem('pointBook');this.flags.oldLead=true;}else this.addItem('hp',3);}
   if(id==='copper'){this.flags.practiceCopper=false;this.flags.practiceCopperTaken=true;this.flags.practiceNote=true;this.flags.practiceComplete=true;this.flags.copperComplete=true;this.flags.copperTaken=true;const item=normalizeGear({id:'quest-copper-practice-ring',name:'缠铜练武环',slot:'relic',rarity:'rare',atk:0,hp:8,uniqueEffect:'copperPractice',affix:null},this.p.cls);item.instanceId=item.id;this.c1Deliver(item);items.push(item.id);if(!this.knowsOrHolds('cleaveBook'))this.addItem('cleaveBook');}
   if(id==='lantern'){this.flags.lanternRoute=this.chapter<3?'before':'after';const item=normalizeGear({...STORY.quest.reward},this.p.cls);item.instanceId=item.id;this.c1Deliver(item);items.push(item.id);}
   if(id==='echo')this.p.items.echoCore=Math.max(0,(this.p.items.echoCore||0)-1);
   if(id==='c1ClockMemory'){old.apply.call(this,'oldReturn');}
   if(id==='c1ExitDrill')h.worldChanges.drillDoor=true;
   if(id==='c1CanalPrep')Object.assign(h.worldChanges,{plank:true,pressure:true,northDoor:true});
   if(id==='c1CanalBreak')h.worldChanges.sluice=true;
   if(id==='c1RuneWear')h.worldChanges.runePattern=true;
   if(id==='c1RuneKiln')Object.assign(h.worldChanges,{kilnIntake:true,kilnExhaust:true});
   if(id==='c1AlchemistSamples'){for(const k of Object.keys(C1_PARTS))h.samples[k]=false;h.samples.delivered=true;for(const template of ['c1StableChest','c1FilterCharm']){const item=c1Item(this.p.cls,template,'c1-alchemy-'+template);this.c1Deliver(item);items.push(item.id);}h.worldChanges.samplesSealed=true;}
   this.quests[id]='done';if(C1_MAIN.some(q=>q.id===id))h.mainStages[id]='claimed';this.gainXP(q.xp);this.p.gold+=q.gold;
   if(['c1RuneWear','c1RuneKiln','c1RunePatrol'].includes(id))items.push(this.c1RandomCore());if(id==='v12CourierRoad')this.addItem('mp');
   if(id==='c1RunePatrol'){h.merchant.activePatrol=null;delete this.quests.c1RunePatrol;delete h.journey.counts.c1RunePatrol;}
   h.economy.push({event:key,xp:q.xp,gold:q.gold,items,balance:this.p.gold,level:this.p.level});if(this.flags.tracked===id)this.flags.tracked=null;return {xp:q.xp,gold:q.gold,items};
  });if(tx){this.say('已完成：'+q.name+' · '+q.xp+'经验 / '+q.gold+'金');this.saveEvent();}return tx;
 };
 P.c1MainPayment=function(id){return this.c1Claim(id);};
 P.complete=function(id){if(C1_QUESTS[id])return this.quests[id]!=='done'&&!!this.c1Claim(id);return old.complete.call(this,id);};
 P.claimPacing=function(id){return C1_QUESTS[id]?this.c1Claim(id):old.claimPacing.call(this,id);};
 P.c1SyncQuests=function(){if(this.chapter>=5)return;if(active(this,'echo'))this.flags.echoLog=true;const h=c1State(this),accept=id=>{if(!this.quests[id]&&!done(this,id)){this.quests[id]='active';steps(this,id);}};
  if(this.chapter===2&&!h.legacyReadinessBypass){accept('c1Readiness');if(done(this,'c1Readiness'))accept('c1ExitDrill');if(done(this,'v12CourierRoad'))accept('c1LoomBrief');accept('v12NorthDelivery');if(done(this,'v12NorthDelivery')){accept('c1GateCheck');accept('c1CanalPrep');}}
  if(this.chapter>=3)accept('c1CanalBreak');
  for(const id of ['c1Readiness','c1ExitDrill','c1CanalPrep','c1CanalBreak'])if(this.c1Ready(id))this.c1Claim(id);
 };
 P.npcOptions=function(id){let options=old.npcOptions.call(this,id);if(this.chapter>=5||!c1Map(this.map))return options;
  options=options.filter(o=>!acceptAliases[o.action]&&!submitAliases[o.action]&&!['lanternVerify','lanternUnclear','letterProgress','lottiWorkState','herbHint','pass'].includes(o.action)&&!/^v12q:.*:(v12Water|v12CourierRoad|v12NorthDelivery)(:|$)/.test(o.action));
  const add=(label,action,state='daily')=>options.push({label,action,questState:state});
  for(const [qid,giver]of Object.entries(C1_GIVERS)){if(giver!==id||['rats','c1RunePatrol'].includes(qid)||done(this,qid))continue;
   const q=C1_QUESTS[qid],isActive=active(this,qid),ready=this.c1Ready(qid);if(!isActive&&qid==='v12CourierRoad'&&this.chapter<2)continue;
   add((ready?'交付：':isActive?'进度：':'接取：')+q.name,'c1:'+(ready?'claim':isActive?'progress':'accept')+':'+qid,ready?'ready':isActive?'waiting':'available');
  }
  if(id==='woman'&&this.c1Ready('herbs'))add('把三株银叶草先送给蕾娜。','c1:herbsWoman','ready');
  if(id==='sister'&&this.chapter===2&&!done(this,'c1ExitDrill'))add('庭院实战与旧廊试炼怎么走？','c1:trainingBrief');
  if(id==='watch'&&this.chapter===2){if(!done(this,'v12NorthDelivery'))add('交付维护班次封套，核对礼拜门禁。','c1:northVerify',this.c1Ready('v12NorthDelivery')?'ready':'waiting');else if(!this.flags.gateTalk)add('核对礼拜厅入口。','c1:gateVerify','advance');}
  if(id==='c1rosa'){add('符文商店与核心兑换。','c1:shop','service');if(this.quests.c1RuneWear==='done'){const p=hPatrol(this);add(p?'沿线讨伐 · '+count(this,'c1RunePatrol')+'/5':'接取轮换地区讨伐。','c1:'+(this.c1Ready('c1RunePatrol')?'patrolClaim':p?'patrolProgress':'patrolAccept'),this.c1Ready('c1RunePatrol')?'ready':p?'waiting':'available');}}
  // Advancing dialogue is distinct from handing in a completed quest.
  return sortQuestOptions(this,id,options.map(o=>({...o,questState:o.questState==='advance'?'daily':o.questState})));
 };
 P.marker=function(id){if(this.chapter>=5||!c1Map(this.map))return old.marker.call(this,id);
  const p=this.props.find(p=>p.id===id);if(p){if(id==='repair-bench'&&this.c1Ready('copper'))return 'gold?';return this.c1PropInteractive(p)&&[this.trackedGoal(),this.objective()].some(goal=>goal?.map===this.map&&goal.target===id)?'objective':'';}
  const options=this.npcOptions(id);if(options.some(o=>o.questState==='ready'))return 'gold?';if(options.some(o=>o.questState==='available'))return '!';if(options.some(o=>o.questState==='waiting'))return '?';return '';
 };
 P.choose=function(action){if(this.chapter<5&&acceptAliases[action])return this.choose('c1:accept:'+acceptAliases[action]);if(this.chapter<5&&submitAliases[action])return this.choose(action==='herbsWoman'?'c1:herbsWoman':'c1:claim:'+submitAliases[action]);
  if(!action.startsWith('c1:'))return old.choose.call(this,action);const [,verb,id]=action.split(':');
  if(verb==='accept'){if(!this.c1Accept(id))return;const o=C1_OBJECTIVES[id],extra=o?.chance?'每只目标有70%概率掉落，收到'+o.count+'份后回报。':o?.count&&o.kind==='kill'?'击杀数量记入手记，完成后回来交付。':'';chat(this,[[C1_NPC_NAMES[C1_GIVERS[id]]||'旁白',C1_ACCEPT_TEXT[id]||C1_QUESTS[id]?.name],...(extra?[['旁白',extra]]:[])]);return;}
  if(verb==='progress'){chat(this,[[C1_NPC_NAMES[C1_GIVERS[id]]||'旁白',this.questGoal(id)?.text||'这件事已经记下。']]);return;}
  if(verb==='claim'){if(!this.c1Ready(id))return false;const tx=this.c1Claim(id);if(tx)chat(this,[[C1_NPC_NAMES[C1_GIVERS[id]]||'旁白',({c1RuneWear:'符片边上全是齿印，是渠鼠拖走的。修好后这个核心给你。',c1RuneKiln:'翼尘和巢里的沉积一致。夜翼已除，烟道可以重新清通了。',echo:'传动带是守兽撕坏的。机芯还完好，修理铺能重新开工。',c1ClockMemory:'是哥哥的刻名。谢谢你替我把它带回来。',v12CourierRoad:'车道安全了。你到城门车棚歇一晚，天亮再进城。',c1AlchemistSamples:'三份样本有相同沉积。请洛缇先封好废液，旧渠水别再入口。'})[id]||'东西与情况都对得上。报酬收好。']]);this.c1SyncQuests();return tx;}
  if(verb==='herbsWoman'){if(this.c1Ready('herbs')){this.c1Claim('herbs','woman');chat(this,[['蕾娜','有这些药就能先熬过今晚。谢谢你。']]);}return;}
  if(verb==='trainingBrief'){chat(this,[['薇蕾娜','肩膀还僵，就先从后院的苔壳兽练起。'],['鲁恩','三只足够复核。东边旧廊还有封存构装体，击败内室的守卫，这趟实战就算完成。'],['薇蕾娜','看它起手再侧移，别站着硬接。']]);return;}
  if(verb==='northVerify'||verb==='gateVerify'){if(this.chapter!==2)return false;this.c1SyncQuests();if(!done(this,'v12NorthDelivery')){if(!this.c1Ready('v12NorthDelivery'))return false;this.c1Claim('v12NorthDelivery');}this.c1SyncQuests();this.flags.gateTalk=true;this.flags.gateXP=true;if(!done(this,'c1GateCheck'))this.c1Claim('c1GateCheck');chat(this,[['托马','封套与班次对得上。午钟后正门落闩，现在可以从前厅登记进去。'],['托马','北渠那几只鼠正啃检修木料。清掉四只，退路才稳妥；检修道的入口在北侧。']]);this.saveEvent();return true;}
  if(verb==='shop'){this.emit('mechanism',{kind:'c1-shop'});return;}
  if(verb==='samples')return this.choose('c1:claim:c1AlchemistSamples');
  if(verb==='waterTalk')return this.choose('c1:'+(this.c1Ready('v12Water')?'claim':'progress')+':v12Water');
  if(verb==='patrolAccept'){const h=c1State(this);if(h.merchant.activePatrol||this.quests.c1RuneWear!=='done')return;const sequence=++h.merchant.patrolSequence;h.merchant.activePatrol={sequence,route:(sequence-1)%2,diagnosed:false,repaired:false,verified:false};h.journey.counts.c1RunePatrol=0;this.quests.c1RunePatrol='active';this.flags.tracked='c1RunePatrol';chat(this,[['罗萨',(sequence%2?'旧王道与磨坊':'溪边林地与废窑')+'沿线清除五只野兽。数量记满后回来领核心。']]);this.saveEvent();return;}
  if(verb==='patrolClaim')return this.c1Claim('c1RunePatrol');
  if(verb==='patrolProgress')return this.choose('c1:progress:c1RunePatrol');
 };
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(this.chapter<5&&submitAliases[id])return this.c1Claim(submitAliases[id],id==='herbsWoman'?'woman':null);if(id==='c1:samples')return this.c1Claim('c1AlchemistSamples');
  const phase=this.chapter,result=old.apply.call(this,action),h=c1State(this);
  if(id==='contractAccept'&&phase===1&&this.chapter===2)h.worldChanges.envelope=true;
  if((id==='oldClue'||id==='oldReturn')&&this.flags.rumor&&!done(this,'c1ClockMemory'))this.c1Accept('c1ClockMemory');
  if(id?.startsWith('goodbye-')&&this.chapter===4&&this.flags[id])this.c1Claim('farewell');
  this.c1SyncQuests();return result;
 };
 P.canDoor=function(d){const h=c1State(this);if(this.chapter<5&&!h.legacyReadinessBypass){
  if(d.to==='c1DrillGallery'&&!done(this,'c1Readiness'))return '先在练武庭击败三只苔壳爬兽。';
  if((this.map==='warehouse'&&d.to==='c1DrillGallery'||this.map==='c1DrillGallery'&&d.to==='warehouse')&&!done(this,'c1ExitDrill'))return '击败旧廊内室的试炼守卫后开启便门。';
  if(this.map==='hall'&&d.to==='road'&&this.chapter===2&&!done(this,'c1ExitDrill'))return '完成庭院三兽与旧廊守卫的实战后出发。';
  if(this.map==='road'&&d.to==='town'&&this.chapter===2&&(!done(this,'v12CourierRoad')||!h.worldChanges.morning))return '清除四只袭路野兽，向阿林回报后在车棚休息到天亮。';
  if(d.to==='chapel'&&this.chapter===2){const id=['c1Readiness','c1ExitDrill','v12CourierRoad','c1LoomBrief','v12NorthDelivery','c1GateCheck','c1CanalPrep'].find(id=>!done(this,id));if(id)return '入场前：'+C1_QUESTS[id].name+'。';}
  if(this.map==='town'&&d.to==='c1NorthWalk'&&!done(this,'v12NorthDelivery'))return '先向托马交付封套，领取检修许可。';
  if((this.map==='c1NorthWalk'&&d.to==='alley'||this.map==='alley'&&d.to==='c1NorthWalk')&&!done(this,'c1CanalPrep'))return '先清除检修道的四只啃木渠鼠。';
 }return old.canDoor.call(this,d);};
 P.requestDeparture=function(...args){this.c1SyncQuests();if(this.chapter===4&&!c1State(this).legacyReadinessBypass&&!done(this,'c1CanalBreak')){this.say('清除东闸剩余追兵后即可离城。');return false;}return old.requestDeparture.apply(this,args);};
 P.questGoal=function(id){const q=C1_QUESTS[id];if(!q||this.chapter>=5)return old.questGoal.call(this,id);const reward=`${q.xp}经验 / ${q.gold}金`,base={type:q.type+'任务',reward};if(done(this,id))return {...base,text:'已完成',map:null,completed:true};
  const giver=C1_GIVERS[id]||q.target;if(!active(this,id))return {...base,text:'向'+(C1_NPC_NAMES[giver]||q.name)+'接取「'+q.name+'」',map:q.map,target:giver};
  if(this.c1Ready(id))return {...base,text:'完成：回报'+(C1_NPC_NAMES[giver]||q.name),map:q.map,target:giver};
  const o=C1_OBJECTIVES[id];if(o){let map=o.map;if(o.patrol){const p=hPatrol(this);map=C1_PATROL.routes[p?.route||0][this.map===C1_PATROL.routes[p?.route||0][1]?1:0];}
   const n=this.c1Count(id),suffix=o.chance?' · '+Math.round(o.chance*100)+'%掉落':'';
   if(o.cause&&!causeDone(this,o.cause)&&!(steps(this,id).legacyEvidence))return {...base,text:(n<o.count&&o.kind==='drop'?`${o.name} ${n}/${o.count}${suffix}；再`:'')+'击败'+({'c1-elite-rat':'裂齿渠鼠','c1-elite-bat':'苇窑夜翼','echo-warden':'灰脊守兽'})[o.cause],map,target:o.cause};
   if(o.inspect&&(id!=='rats'||this.flags.rats>=6))return {...base,text:id==='rats'?'六只灰鼠已清除 · 查看北墙鼠洞':'怪物已除 · 取回'+o.name,map,target:o.inspect};
   if(o.kind==='gather'){const here=o.maps.includes(this.map)?this.map:map,r=c1State(this).journey.resources[here],i=r?.present.find(i=>!r.taken.includes(i));return {...base,text:`采集${o.name} ${n}/${o.count} · 草丛随机生长`,map:here,target:i===undefined?null:'c1-herb-'+i};}
   const live=this.states[map]?.enemies.find(e=>!e.dead&&this.c1EnemyMatches(o,e,map));return {...base,text:`${o.kind==='drop'?'收集'+o.name+'（'+o.monster+'）':'击杀'+o.name} ${n}/${o.count}${suffix}${!live&&this.states[map]?' · 清场后离开并活动45秒可再来':''}`,map,target:live?.id,area:true};
  }
  if(id==='c1LoomBrief')return {...base,text:'在缀纹机比较装备，领取试作材料',map:'c1LoomRoom',target:'c1-loom'};
  if(id==='c1AlchemistSamples'){const h=c1State(this),missing=Object.entries(C1_PARTS).filter(([k])=>!h.samples[k]);return {...base,text:'收集精英首杀样本：'+missing.map(([,n])=>n).join('、'),map:missing[0]?.[0]==='c1PartJaw'?'grove':missing[0]?.[0]==='c1PartTendon'?'echo':'c1ReedKiln',target:missing[0]?.[0]==='c1PartJaw'?'c1-elite-rat':missing[0]?.[0]==='c1PartTendon'?'echo-warden':'c1-elite-bat'};}
  if(id==='c1CanalBreak')return {...base,text:'击败追缉官，清除闸口追兵',map:'canal',target:'captain'};
  return {...base,text:q.name,map:q.map,target:q.target};
 };
 P.objective=function(){if(this.chapter>=5)return old.objective.call(this);if(this.chapter===0)return !active(this,'rats')?{text:'和奥伦交谈，接取库房异响',map:'hall',target:'steward'}:this.questGoal('rats');
  if(this.chapter===2&&!c1State(this).legacyReadinessBypass){const id=['c1Readiness','c1ExitDrill','v12CourierRoad','v12NorthDelivery','c1LoomBrief','c1CanalPrep'].find(id=>!done(this,id));if(id)return this.questGoal(id);}
  if(this.chapter===4&&!done(this,'c1CanalBreak')&&!c1State(this).legacyReadinessBypass)return this.questGoal('c1CanalBreak');return old.objective.call(this);
 };
 P.c1SeedResources=function(map){if(!C1_RESOURCE_SITES[map]||!active(this,'herbs'))return;const j=c1State(this).journey,r=j.resources[map];if(r)return r;const present=C1_RESOURCE_SITES[map].map((_,i)=>i).filter(()=>roll(this)<.7);for(let i=0;present.length<3;i++)if(!present.includes(i))present.push(i);return j.resources[map]={present,taken:[],cycle:1,next:0};};
 P.c1PropVisible=function(p){if(!p.c1Resource)return true;if(!active(this,'herbs')||count(this,'herbs')>=3)return false;const r=c1State(this).journey.resources[this.map],i=Number(p.id.split('-').at(-1));return !!r?.present.includes(i)&&!r.taken.includes(i);};
 P.c1PropInteractive=function(p){if(!p?.action||p.broken||p.used&&!this.questPropNeeded?.(p.id))return false;if(!c1Map(this.map))return true;
  if(p.c1Resource)return this.c1PropVisible(p);
  if(p.id==='crack')return active(this,'rats')&&this.flags.rats>=6&&!this.flags.crack;
  if(p.id==='stone')return active(this,'c1ClockMemory')&&!this.flags.silverFound&&(causeDone(this,'c1-elite-rat')||steps(this,'c1ClockMemory').legacyEvidence);
  if(['v29-echo-core','echo-machine','echo-valve'].includes(p.id))return active(this,'echo')&&(p.id==='echo-valve'?!this.flags.echoValve:!!this.flags.echoWardenDefeated)&&(p.id!=='v29-echo-core'||!this.flags.echoCoreFound);
  if(p.id==='repair-bench')return active(this,'copper');
  if(p.id==='v29-repair-core')return this.quests.echo==='done';
  if(p.id==='c1-shelter')return this.chapter===2&&done(this,'v12CourierRoad')&&!c1State(this).worldChanges.morning;
  return true;
 };
 P.targets=function(){return old.targets.call(this).filter(t=>t.kind!=='prop'||this.c1PropInteractive(this.props.find(p=>p.id===t.id)));};
 P.useProp=function(id,...args){const p=this.props.find(p=>p.id===id);if(c1Map(this.map)&&(!this.c1PropInteractive(p)||!near(this,p)||this.pending||this.p.hp<=0))return false;
  if(p?.c1Resource){const j=c1State(this).journey,r=j.resources[this.map],i=Number(id.split('-').at(-1));if(!r||r.taken.includes(i))return false;r.taken.push(i);j.counts.herbs=Math.min(3,count(this,'herbs')+1);this.addItem('herb');this.text('银叶草 '+j.counts.herbs+'/3',p.x,p.y-45,'#aee0b4');this.saveEvent();return true;}
  if(id==='c1-loom'){steps(this,'c1LoomBrief').observed=true;if(!done(this,'c1LoomBrief'))this.c1Accept('c1LoomBrief');this.emit('mechanism',{kind:'c1-loom'});return true;}
  if(id==='c1-shelter'){this.emit('mechanism',{kind:'c1-night'});return true;}
  if(id==='repair-bench')return this.choose('c1:'+(this.c1Ready('copper')?'claim':'progress')+':copper');
  const result=old.useProp.call(this,id,...args);if(id==='crack'&&this.flags.crack){steps(this,'rats').sealed=true;c1State(this).worldChanges.wallSealed=true;}return result;
 };
 P.c1EnemyMatches=function(o,e,map=this.map){if(e.c1Training||e.c1NoReward||e.storyTag||e.id==='captain')return false;if(o.patrol){const p=hPatrol(this);return !!p&&C1_PATROL.routes[p.route].includes(map);}return o.map===map&&(!o.enemy||e.id===o.enemy)&&(!o.prefix||e.id.startsWith(o.prefix))&&(!o.types||o.types.includes(e.type))&&(!e.c1Custom||o.enemy===e.id);};
 P.c1CreditKill=function(e){if(this.chapter>=5||!c1Map(this.map)||e.c1Training||e.c1NoReward||e.storyTag)return;const h=c1State(this),j=h.journey,key=this.map+':'+e.id,generation=e.c1QuestGeneration||1;if((j.kills[key]||0)>=generation)return;j.kills[key]=generation;j.refresh[key]=j.clock+45;
  for(const [id,o]of Object.entries(C1_OBJECTIVES)){if(!active(this,id)||['gather','investigate'].includes(o.kind)||!this.c1EnemyMatches(o,e)||count(this,id)>=o.count||id==='rats')continue;
   if(o.chance&&roll(this)>=o.chance)continue;j.counts[id]=Math.min(o.count,count(this,id)+1);if(o.item)this.addItem(o.item);this.text((o.kind==='drop'?'获得 ':'')+o.name+' '+j.counts[id]+'/'+o.count,e.x,e.y-65,'#b9e6bb');if(id==='copper')this.flags.practiceCopper=j.counts[id]>=2;
   if(id==='c1RunePatrol'&&j.counts[id]>=5)h.merchant.activePatrol.verified=true;
  }this.c1SyncQuests();this.saveEvent();
 };
 P.damage=function(e,...args){const alive=!e.dead,rats=this.flags.rats,result=old.damage.call(this,e,...args);if(alive&&e.dead){if(this.map==='warehouse'&&!active(this,'rats'))this.flags.rats=rats;this.c1CreditKill(e);}return result;};
 P.ensureMap=function(id){const r=old.ensureMap.call(this,id);if(c1Map(id)&&active(this,'herbs'))this.c1SeedResources(id);return r;};
 P.enter=function(id,...args){const previous=this.map,result=old.enter.call(this,id,...args);if(this.map!==id||!c1Map(id))return result;this.c1SyncQuests();const j=c1State(this).journey;
  if(previous!==id)for(const e of [...this.enemies]){const key=id+':'+e.id;if(!e.dead||e.c1Custom||e.c1Training||e.c1NoReward||e.storyTag||e.id==='captain'||!j.refresh[key]||j.clock<j.refresh[key])continue;
   const replacement=this.enemy(e.type,e.homeX,e.homeY,e.id);replacement.c1QuestGeneration=(e.c1QuestGeneration||1)+1;this.states[id].enemies[this.enemies.indexOf(e)]=replacement;}
  this.repairEntities();return result;
 };
 P.restore=function(...args){const r=old.restore.apply(this,args);this.c1SyncQuests();return r;};
 P.update=function(dt,input={}){const running=this.active&&!this.pending&&!this.transition,before={x:this.p.x,y:this.p.y},r=old.update.call(this,dt,input);if(running&&this.chapter<5){const moving=Math.hypot(this.p.x-before.x,this.p.y-before.y)>.01,combat=this.p.attackAnim>0&&this.enemies.some(e=>!e.dead&&Math.hypot(e.x-this.p.x,e.y-this.p.y)<450);if(moving||combat)c1State(this).journey.clock+=dt;this.c1SyncQuests();}return r;};
 P.c1Morning=function(){if(this.map!=='road'||!done(this,'v12CourierRoad'))return false;c1State(this).worldChanges.morning=true;chat(this,[['旁白','车棚挡住夜雨。诺恩把通行纸收进干燥的内袋。'],['旁白','天亮，白榆城开门。离午钟还有一段时间。']]);this.saveEvent();return true;};
}
function hPatrol(g){return c1State(g).merchant.activePatrol;}
