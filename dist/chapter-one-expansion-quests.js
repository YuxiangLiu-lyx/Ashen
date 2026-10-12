import {C1_MAIN,C1_SIDE,C1_QUESTS,C1_PATROL,C1_CORES,C1_RUNES,C1_PARTS} from './chapter-one-expansion-data.js';
import {c1State,c1Clone} from './chapter-one-expansion-save.js';
import {c1Item} from './chapter-one-expansion-gear.js';
const near=(g,p,r=130)=>p&&Math.hypot(g.p.x-(p.interactX??p.x),g.p.y-(p.interactY??p.y))<=r&&g.clearLine(g.p,{x:p.interactX??p.x,y:p.interactY??p.y},false);
const step=(g,id)=>c1State(g).questSteps[id]||(c1State(g).questSteps[id]={});
const has=(g,id,...keys)=>keys.every(k=>step(g,id)[k]);
const finish=(g,id)=>['claimed','waived'].includes(c1State(g).mainStages[id])||g.quests[id]==='done';
const chat=(g,lines,then=null)=>{g.beginScene('c1Conversation',then);g.pending.lines=lines;};
export const C1_STEP_GUIDE={
 rats:[['hole','warehouse','c1-wall-hole','查明墙脚漏口'],['board','warehouse','c1-board','搬回挡板'],['sealed','warehouse','c1-wall-seal','扶正挡板、封住墙脚']],
 c1Readiness:[['skill','c1TrainingYard','c1-record','开始复核：用本职业战技命中练习靶'],['evade','c1TrainingYard','c1-warning-target','进入预警区域后走出危险区'],['combo','c1TrainingYard','c1-training-target','普攻后衔接战技命中']],
 c1ExitDrill:[['line','c1DrillGallery','c1-alarm-cut','从图纸辨认并断开警铃线'],['target','c1DrillGallery','c1-drill-start','处理巡查构装靶'],['route','c1DrillGallery','c1-drill-cover','选择上方掩体或下方绕行'],['exit','c1DrillGallery','c1-drill-exit','带演练负重到出口']],
 v12CourierRoad:[['sign','road','c1-road-sign','查破损路牌'],['cart','road','c1-cart','循拖痕检查断轴车'],['route','road','c1-route-mark','排除伏击，确认安全路线']],
 v12NorthDelivery:[['ledger','town','c1-duty-book','核对封套与值班簿'],['verified','town','watch','请托马核验维护班次']],
 c1GateCheck:[['entry','town','c1-entry-rule','亲自查看礼拜入口封门牌'],['verified','town','watch','向托马核实午钟后的封门规则']],
 c1CanalBreak:[['opened','canal','c1-sluice','击败追缉官后亲手打开东闸'],['sheltered','canal','c1-hideout','沿东墙走到闸后藏身处']],
 c1CanalPrep:[['water','c1NorthWalk','c1-water-sign','辨认水痕与排水方向'],['pressure','c1NorthWalk','c1-pressure','先泄压'],['plank','c1NorthWalk','c1-plank','处理阀旁敌人，再放踏板'],['crossed','c1NorthWalk','c1-mark','亲自走过踏板，留下记号']],
 oil:[['lampChecked','warehouse','c1-lamp-right','检查两盏灯，找出漏油的一盏'],['lampFixed','warehouse','c1-lamp-valve','关阀换垫'],['lampLit','warehouse','c1-lamp-light','点灯核实不再漏油']],
 v12Water:[['water','guestroom','c1-kettle','把烧好的水装进带盖壶'],['injury','hall','steward','向奥伦说明外出旧伤'],['bandage','hall','steward','复核后说明疼痛位置并换绷带']],
 letter:[['cloth','road','c1-cloth','比较断车布片'],['mud','road','c1-mud','从岔路泥迹判断搜索方向']],
 herbs:[['healthy','grove','c1-healthy','辨认污染与健康植株'],['branch','grove','c1-branch','移开倒枝，打开健康药圃']],
 lantern:[['lampWest','town','c1-lamp-west','检查西街灯路'],['lampEast','town','c1-lamp-east','检查东街灯路']],
 copper:[['transmission','millpath','c1-transmission','查看断裂传动架'],['fitted','workshop','repair-bench','在修理铺试装铜圈'],['tested','c1TrainingYard','c1-copper-test','用借用训练装验证铜圈效果']],
 c1ClockMemory:[['name','grove','c1-name','辨认石下银环的刻名']],
 c1RuneWear:[['a','c1NorthWalk','c1-wet-a','在西节点试装受潮符片'],['b','c1NorthWalk','c1-wet-b','在东节点对照偏移'],['leak','c1NorthWalk','c1-leak','处理漏压与附近干扰'],['weave','c1LoomRoom','c1-rune-board','回工坊试织验证']],
 c1RuneKiln:[['plan','c1LoomRoom','c1-kiln-plan','先看通风图'],['intake','c1ReedKiln','c1-kiln-intake','先打开低处进风口'],['exhaust','c1ReedKiln','c1-kiln-exhaust','再打开高处排烟口'],['node','c1ReedKiln','c1-kiln-node','循翼尘查看失控纹路']]
};
const owned=new Set(['v12Water','v12CourierRoad','v12NorthDelivery','c1RuneWear','c1RuneKiln','c1AlchemistSamples','c1ClockMemory']);
export function installC1Quests(RPG,{QUESTS,DIALOGUES,stats}){
 Object.assign(DIALOGUES,{c1Conversation:[['旁白','把眼前的事记清楚。']]});
 for(const q of Object.values(C1_QUESTS))QUESTS[q.id]={...QUESTS[q.id],...q,giver:q.target,desc:C1_STEP_GUIDE[q.id]?.map(v=>v[3]).join(' → ')||q.name};
 const P=RPG.prototype,old={};for(const k of ['ready','complete','apply','choose','npcOptions','useProp','canDoor','objective','questGoal','available','claimPacing','requestDeparture'])old[k]=P[k];
 P.c1Claim=function(id){
  const q=C1_QUESTS[id];if(!q)return false;const h=c1State(this),key=id==='c1RunePatrol'?'patrol:'+h.merchant.activePatrol?.sequence:'quest:'+id;
  if(h.claimLedger[key])return h.claimLedger[key];
  if(id==='c1RunePatrol'&&!h.merchant.activePatrol?.verified)return false;
  if(C1_STEP_GUIDE[id]&&!this.c1Ready(id)&&h.mainStages[id]!=='waived')return false;
  if(id==='c1LoomBrief'&&!h.worldChanges.loomGift)return false;
  const tx=this.c1Transaction(key,()=>{
   if(id==='c1AlchemistSamples'&&!Object.keys(C1_PARTS).every(k=>h.samples[k]))return false;
   const items=[];this.quests[id]='done';if(C1_MAIN.some(q=>q.id===id))h.mainStages[id]='claimed';
   if(id==='c1AlchemistSamples'){for(const k of Object.keys(C1_PARTS))h.samples[k]=false;h.samples.delivered=true;for(const template of ['c1StableChest','c1FilterCharm']){const item=c1Item(this.p.cls,template,'c1-alchemy-'+template);this.c1Deliver(item);items.push(item.id);}h.worldChanges.samplesSealed=true;}
   this.gainXP(q.xp);this.p.gold+=q.gold;
   if(['c1RuneWear','c1RuneKiln','c1RunePatrol'].includes(id))items.push(this.c1RandomCore());
   if(id==='v12Water')this.addItem('hp');if(id==='v12CourierRoad')this.addItem('mp');
   if(id==='c1RunePatrol'){h.merchant.activePatrol=null;delete this.quests.c1RunePatrol;}
   h.economy.push({event:key,xp:q.xp,gold:q.gold,items,balance:this.p.gold,level:this.p.level});
   if(this.flags.tracked===id)this.flags.tracked=null;return {xp:q.xp,gold:q.gold,items};
  });if(tx){this.say('已办妥：'+q.name+' · '+q.xp+'经验 / '+q.gold+'金');this.saveEvent();}return tx;
 };
 P.c1MainPayment=function(id){return this.c1Claim(id);};
 P.complete=function(id){if(C1_QUESTS[id]){if(this.quests[id]==='done')return false;return !!this.c1Claim(id);}return old.complete.call(this,id);};
 P.c1Ready=function(id){const h=c1State(this);if(id==='c1AlchemistSamples')return !h.samples.delivered&&Object.keys(C1_PARTS).every(k=>h.samples[k]);if(id==='c1RunePatrol')return !!h.merchant.activePatrol?.verified;const guide=C1_STEP_GUIDE[id];return guide?guide.every(([key])=>step(this,id)[key]):false;};
 P.ready=function(id){if(this.chapter<5&&C1_STEP_GUIDE[id]){
  if(owned.has(id)||['c1Readiness','c1ExitDrill','c1CanalPrep','c1GateCheck'].includes(id))return this.quests[id]!=='done'&&this.c1Ready(id);
  if(id==='rats')return old.ready.call(this,id)&&this.c1Ready('rats');
  if(['oil','letter','herbs','lantern','copper'].includes(id))return old.ready.call(this,id)&&this.c1Ready(id);
 }return id==='c1AlchemistSamples'?this.c1Ready(id):old.ready.call(this,id);};
 P.claimPacing=function(id){if(owned.has(id))return this.c1Ready(id)?this.c1Claim(id):false;return old.claimPacing.call(this,id);};
 P.c1Accept=function(id){if(this.chapter>=5||!C1_QUESTS[id]||this.quests[id]==='done')return false;if(!this.quests[id])this.quests[id]='active';step(this,id);this.flags.tracked=id;this.saveEvent();return true;};
 P.npcOptions=function(id){
  let options=old.npcOptions.call(this,id).filter(o=>!/^v12q:.*:(v12Water|v12CourierRoad|v12NorthDelivery)(:|$)/.test(o.action));
  if(this.chapter>=5)return options;
  const add=(label,action,state='advance')=>options.unshift({label,action:'c1:'+action,questState:state});
  if(id==='steward'){
   if(!this.quests.v12Water)add('外出留下的旧伤。','accept:v12Water','available');
   else if(this.quests.v12Water!=='done')add(has(this,'v12Water','water')?'水带回来了，看看旧伤。':'再问问那壶水。','waterTalk');
  }
  if(id==='sister'&&this.chapter===2&&!finish(this,'c1Readiness'))add('把刀带到后院，复核旧伤。','trainingBrief');
  if(id==='courier')add(this.c1Ready('v12CourierRoad')?'路牌、断轴和安全路线都核实了。':'旧王道还有哪段不好走？',this.c1Ready('v12CourierRoad')?'claim:v12CourierRoad':'accept:v12CourierRoad',this.c1Ready('v12CourierRoad')?'ready':'available');
  if(id==='watch'&&this.chapter===2){add('核对维护班次和封套。','northVerify');if(has(this,'c1GateCheck','entry'))add('封门牌已经看过，再核实一次。','gateVerify');}
  if(id==='oldwoman'&&this.flags.silverFound&&!this.flags.silverReturned&&!has(this,'c1ClockMemory','name'))options=options.filter(o=>o.action!=='oldReturn');
  if(id==='c1rosa'){
   add('看看T1符文与核心兑换。','shop','service');
   for(const q of ['c1RuneWear','c1RuneKiln'])if(this.quests[q]!=='done')add((this.c1Ready(q)?'交回记录：':'')+C1_QUESTS[q].name,this.c1Ready(q)?'claim:'+q:'accept:'+q,this.c1Ready(q)?'ready':this.quests[q]?'waiting':'available');
   if(this.quests.c1RuneWear==='done')add(hPatrol(this)?'核对本轮巡检记录。':'领一份线路巡检记录板。',hPatrol(this)?'patrolClaim':'patrolAccept',this.c1Ready('c1RunePatrol')?'ready':'available');
  }
  if(id==='c1saido')add(this.c1Ready('c1AlchemistSamples')?'三种组织都齐了，开始鉴定。':'附近的兽群有什么异常？',this.c1Ready('c1AlchemistSamples')?'samples':'accept:c1AlchemistSamples',this.c1Ready('c1AlchemistSamples')?'ready':'available');
  return options;
 };
 P.choose=function(action){
  if(!action.startsWith('c1:'))return old.choose.call(this,action);
  const [,verb,id]=action.split(':');
  if(verb==='accept'){
   if(this.quests[id]==='done')return;
   const lines={v12Water:[['奥伦','那壶水烧好了，拿来洗洗旧绷带。抬臂还疼不疼，别只说没事。']],v12CourierRoad:[['阿林','车轴断在东面的岔口，路牌也歪了。我得知道车往哪边拖过，才能领人过去。'],['诺恩','你留在这里。我把路看清楚再回来。']],c1RuneWear:[['罗萨','这两片符纹受潮后总往一边偏。北渠两处节点各试一次，先别怪机器。'],['诺恩','差的地方我记回来。']],c1RuneKiln:[['罗萨','废窑那根排烟绳还通着。看图，先进风、后排烟；颠倒了，翼尘会堵住窑口。']],c1AlchemistSamples:[['赛铎','渠鼠的下颌、守兽的腱束、窑蝠的翼膜，各留一份。它们都在旧水路边活动。'],['赛铎','先拿到的也算。我只想知道废液在这里留下了什么。']]};
   this.c1Accept(id);chat(this,lines[id]||[['旁白',C1_QUESTS[id]?.name||'记下手边的事。']]);return;
  }
  if(verb==='claim'&&this.c1Ready(id)){this.c1Claim(id);chat(this,[[id.startsWith('c1Rune')?'罗萨':'阿林',id==='c1RuneWear'?'偏纹修正了，试织也稳。这个核心拿去用。':id==='c1RuneKiln'?'气流图补齐了。剩下的不是靠关死烟道解决的。':'照你标出的地方走，车不会再卡在泥里。']]);return;}
  if(verb==='trainingBrief'){chat(this,[['薇蕾娜','刀带来。'],['诺恩','库房里试过了。'],['薇蕾娜','我没问老鼠。'],['旁白','她看了眼他抬臂的动作。'],['薇蕾娜','去后院。走完一遍再出门。']]);return;}
  if(verb==='waterTalk'){const s=step(this,'v12Water');if(!s.water){chat(this,[['奥伦','客房炉边，那只有盖的壶。']]);return;}if(!s.injury){s.injury=true;chat(this,[['诺恩','走久了肩膀发僵，抬手倒还行。'],['奥伦','练完再来，别拿没流血当没伤。']]);}else if(finish(this,'c1Readiness')){s.bandage=true;this.c1Claim('v12Water');chat(this,[['奥伦','疼在这里就别勒着。旧绷带换下来，这瓶药带着。']]);}return;}
  if(verb==='northVerify'){if(!has(this,'v12NorthDelivery','ledger')||!c1State(this).worldChanges.envelope){chat(this,[['托马','封套写的是维护班次，先和旁边的值班簿对照。']]);return;}step(this,'v12NorthDelivery').verified=true;this.c1Claim('v12NorthDelivery');chat(this,[['托马','班次对得上。北渠给你留检修许可，门内只准按维护路线走。']]);return;}
  if(verb==='gateVerify'){if(!has(this,'c1GateCheck','entry'))return;step(this,'c1GateCheck').verified=true;this.flags.gateTalk=true;this.flags.gateXP=true;this.c1Claim('c1GateCheck');chat(this,[['托马','午钟后正门落闩。现在去，器具从前厅登记。']]);return;}
  if(verb==='shop'){this.emit('mechanism',{kind:'c1-shop'});return;}
  if(verb==='samples'){if(!this.c1Ready('c1AlchemistSamples'))return;chat(this,[['赛铎','下颌、腱束、翼膜，沉积的颜色相同，长出来的样子却不同。'],['诺恩','从哪儿来的？'],['赛铎','沿旧槽找。让洛缇先封好废液，旧渠水别再入口。这还说明不了更远的事。'],['旁白','赛铎分别封好三份样本，把胸衣和滤雾坠放到干净的台面上。']],'c1:samples');return;}
  if(verb==='patrolAccept'){const h=c1State(this);if(h.merchant.activePatrol)return;const sequence=++h.merchant.patrolSequence;h.merchant.activePatrol={sequence,route:(sequence-1)%2,diagnosed:false,repaired:false,verified:false};this.quests.c1RunePatrol='active';chat(this,[['罗萨',(sequence%2?'旧王道到磨坊':'溪岸到废窑')+'这次沿线查。先判断故障，再修接头，最后验证，别只抄旧数。']]);this.saveEvent();return;}
  if(verb==='patrolClaim'){if(this.c1Ready('c1RunePatrol'))this.c1Claim('c1RunePatrol');else this.say('巡检尚未验完：先定位故障，修复，再检查输出。');}
 };
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;
  if(id==='c1:samples'){if(this.c1Ready('c1AlchemistSamples'))this.c1Claim('c1AlchemistSamples');return;}
  if(id==='oldReturn'&&this.chapter<5&&!has(this,'c1ClockMemory','name'))return;
  const chapter=this.chapter,silver=this.flags.silverReturned,result=old.apply.call(this,action),h=c1State(this);
  if(id==='contractAccept'&&chapter===1&&this.chapter===2){h.worldChanges.envelope=true;this.c1Accept('v12NorthDelivery');this.flags.tracked=null;}
  if(id==='oldReturn'&&!silver&&this.flags.silverReturned)this.c1Claim('c1ClockMemory');
  if(id?.startsWith('goodbye-')&&this.chapter===4&&this.flags[id])this.c1Claim('farewell');
  if(id==='assassinate'&&chapter===2&&this.chapter===3){step(this,'lantern').lampWest=false;step(this,'lantern').lampEast=false;}
  return result;
 };
 P.canDoor=function(d){
  const h=c1State(this);if(this.chapter<5){
   if(d.to==='c1DrillGallery'&&!finish(this,'c1Readiness'))return '先在练武庭完成状态复核。';
   if((this.map==='warehouse'&&d.to==='c1DrillGallery'||this.map==='c1DrillGallery'&&d.to==='warehouse')&&!h.worldChanges.drillDoor)return '便门从试炼廊内开启。';
   if(this.map==='hall'&&d.to==='road'&&this.chapter===2&&!h.legacyReadinessBypass&&!finish(this,'c1ExitDrill'))return '先复核旧伤，再走一遍撤离演练。';
   if(this.map==='road'&&d.to==='town'&&this.chapter===2&&!h.legacyReadinessBypass&&(!finish(this,'v12CourierRoad')||!h.worldChanges.morning))return '先交回道路巡查，在城门车棚落脚，天亮进城。';
   if(d.to==='chapel'&&this.chapter===2&&!h.legacyReadinessBypass){const q=C1_MAIN.filter(q=>[3,4,5,6,7,8,9].includes(q.index)).find(q=>!finish(this,q.id));if(q)return '入场前先办妥：'+q.name;}
   if(this.map==='town'&&d.to==='c1NorthWalk'&&!finish(this,'v12NorthDelivery')&&!h.legacyReadinessBypass)return '先向托马核对维护班次，取得检修许可。';
   if((this.map==='c1NorthWalk'&&d.to==='alley'||this.map==='alley'&&d.to==='c1NorthWalk')&&!h.worldChanges.northDoor)return '检修便门还没从北渠一侧打开。';
  }return old.canDoor.call(this,d);
 };
 P.requestDeparture=function(...args){if(this.chapter===4&&!c1State(this).legacyReadinessBypass&&!finish(this,'c1CanalBreak')){this.say('先亲手转动东闸绞盘，在藏身处站稳。');return false;}return old.requestDeparture.apply(this,args);};
 P.questGoal=function(id){
  const q=C1_QUESTS[id];if(!q||this.chapter>=5)return old.questGoal.call(this,id);
  if(this.quests[id]==='done'||finish(this,id))return {text:'已完成',map:null,completed:true,type:q.type+'任务'};
  if(id==='c1RunePatrol'){const p=hPatrol(this);if(!p)return {text:'向罗萨领取巡检记录板',map:'c1LoomRoom',target:'c1rosa'};const ids=p.route?['c1-patrol-grove','c1-patrol-kiln']:['c1-patrol-road','c1-patrol-mill'];return {text:p.verified?'回罗萨核对':p.repaired?'检查修复后的输出':p.diagnosed?'到线路后段修复接头':'定位线路前段故障',map:p.verified?'c1LoomRoom':C1_PATROL.routes[p.route][p.diagnosed?1:0],target:p.verified?'c1rosa':ids[p.diagnosed?1:0],type:'循环委托'};}
  const next=C1_STEP_GUIDE[id]?.find(([key])=>!step(this,id)[key]);if(next)return {text:next[3],map:next[1],target:next[2],type:q.type+'任务',detail:QUESTS[id].desc,reward:`${q.xp}经验 / ${q.gold}金`};
  if(id==='c1LoomBrief')return {text:'观察试织、比较预览，选择试作材料',map:q.map,target:q.target,type:'主线任务'};
  if(['oil','letter','herbs','lantern','copper','echo'].includes(id))return old.questGoal.call(this,id);
  return {text:id==='c1AlchemistSamples'?'收集三种首杀样本后找赛铎鉴定':'向'+(q.target==='courier'?'阿林':q.target==='watch'?'托马':q.name)+'回报',map:q.map,target:q.target,type:q.type+'任务'};
 };
 P.objective=function(){if(this.chapter===0&&this.flags.rats>=6&&!this.c1Ready('rats'))return this.questGoal('rats');if(this.chapter<5){const h=c1State(this),order=['rats','c1CommissionBrief','c1Readiness','c1ExitDrill','v12CourierRoad','c1LoomBrief','v12NorthDelivery','c1GateCheck','c1CanalPrep','c1Assassination','c1CanalBreak','c1Departure'];const id=order.find(id=>!finish(this,id));if(id&&!(h.legacyReadinessBypass&&this.chapter>=2)&&!['rats','c1CommissionBrief','c1Assassination','c1Departure'].includes(id))return this.questGoal(id);if(this.chapter===4&&!h.legacyReadinessBypass&&!finish(this,'c1CanalBreak'))return {text:'亲手打开东闸',map:'canal',target:'c1-sluice'};}return old.objective.call(this);};
 P.useProp=function(id,...args){
  const p=this.props.find(p=>p.id===id),h=c1State(this);
  if(id==='repair-bench'&&this.chapter<5&&this.flags.practiceCopper&&has(this,'copper','transmission')&&!has(this,'copper','fitted')){step(this,'copper').fitted=true;chat(this,[['洛缇','先别收起来。内院有试用架，拿借用杖走一下力，回来再装牢。']]);return true;}
  if(!p?.action?.startsWith('c1:'))return old.useProp.call(this,id,...args);
  if(!near(this,p)||this.pending||this.p.hp<=0)return false;
  const key=p.action.slice(3),mark=(q,k,text)=>{step(this,q)[k]=true;this.say(text);this.saveEvent();return true;},safe=()=>!this.enemies.some(e=>!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<220);
  switch(key){
   case 'wall-hole':return mark('rats','hole','木板下面有新鲜刮痕，漏口就在墙脚。');
   case 'board':if(!has(this,'rats','hole'))return this.say('先看看挡板该补在哪里。');return mark('rats','board','把附近的挡板抱起，沿空出的货道搬回北墙。');
   case 'wall-seal':if(!has(this,'rats','hole','board'))return this.say('先找出漏口，把挡板搬回来。');h.worldChanges.wallSealed=true;return mark('rats','sealed','扶正挡板压住墙脚。刮擦声停了，原北墙调查仍须核实。');
   case 'lamp-left':step(this,'oil').left=true;return this.say('左灯垫片干燥，没有漏油。');
   case 'lamp-right':if(!step(this,'oil').left)return this.say('右灯脚有油，和另一盏对照一下。');return mark('oil','lampChecked','右灯垫片裂了，油沿灯脚往下流。');
   case 'lamp-valve':if(!has(this,'oil','lampChecked')||!(this.p.items.oil>0))return this.say('先找到油罐，查清漏油处。');return mark('oil','lampFixed','关小阀，取下裂垫换好。灯脚不再滴油。');
   case 'lamp-light':if(!has(this,'oil','lampFixed'))return this.say('先换垫，别把火送到漏油处。');h.worldChanges.lampFixed=true;return mark('oil','lampLit','灯芯亮稳了，灯脚仍是干的。');
   case 'kettle':return mark('v12Water','water','水温刚好，扣紧盖子，把旧绷带一并带给奥伦。');
   case 'record':if(this.chapter<2)return this.say('先听完这趟委托，再做行前复核。');if(this.c1Ready('c1Readiness')){this.c1EndTraining();this.c1Claim('c1Readiness');chat(this,[['薇蕾娜',{shadow:'转身利索了，别只顾追上去。',oath:'压住重剑时肩膀还僵，收势留一点。',ember:'印落得准。别为了引爆把自己留在警铃下面。'}[this.p.cls]],['鲁恩','记下了，可执行。撤出的路再走一遍。']]);return true;}return this.c1StartTraining('readiness');
   case 'training-target':case 'warning-target':return this.say('使用现有普攻与战技；看到地面预警就走出危险区。');
   case 'drill-start':if((step(this,'c1ExitDrill').attempts||0)>=2&&!this.c1TrainingSession){this.emit('mechanism',{kind:'c1-drill-assist'});return true;}return this.c1StartTraining('drill');
   case 'alarm-cut':if(!this.c1TrainingSession)return this.say('先在门口领取演练负重，查看线路图。');return mark('c1ExitDrill','line','沿线找到铃扣，将受力绳移到空钩。警铃安静了。');
   case 'drill-cover':case 'drill-detour':if(this.c1TrainingSession?.kind!=='drill'||!has(this,'c1ExitDrill','line'))return this.say('先处理铃线再选择路线。');step(this,'c1ExitDrill').path=key==='drill-cover'?'cover':'detour';return mark('c1ExitDrill','route',key==='drill-cover'?'靠掩体穿过，没惊动另一侧的靶。':'避开构装靶的朝向，从下方巡查道绕出。');
   case 'drill-exit':if(this.c1TrainingSession?.kind!=='drill')return this.say('在入口领取负重后再演练。');if(!has(this,'c1ExitDrill','line','target','route'))return this.say('铃线、构装靶和所走路线，还要再核实。');step(this,'c1ExitDrill').exit=true;h.worldChanges.drillDoor=true;this.c1EndTraining();return this.c1Claim('c1ExitDrill');
   case 'road-sign':return mark('v12CourierRoad','sign','旧箭头被车撞歪，拖痕沿东边低处延伸。');
   case 'cart':if(!has(this,'v12CourierRoad','sign'))return this.say('先看路牌，辨认车从哪儿拐进来。');return mark('v12CourierRoad','cart','断轴上缠着湿布，狼从车尾灌木伏来。');
   case 'route-mark':if(!has(this,'v12CourierRoad','cart')||!safe())return this.say('断轴未查清，或这段路仍有伏击，先稳住附近。');return mark('v12CourierRoad','route','避开泥槽，在干岸留下两道短记号。阿林可以据此带人走。');
   case 'cloth':return mark('letter','cloth','湿布和阿林包信的外衣同色，线头朝东。');
   case 'mud':if(!has(this,'letter','cloth'))return this.say('泥里有兽爪与车辙，先找能辨认的布片。');this.emit('mechanism',{kind:'c1-search'});return true;
   case 'shelter':if(!finish(this,'v12CourierRoad')&&!h.legacyReadinessBypass)return this.say('先把安全路线交给阿林。');this.emit('mechanism',{kind:'c1-night'});return true;
   case 'duty-book':if(!h.worldChanges.envelope&&!h.legacyReadinessBypass)return this.say('先领鲁恩的维护班次封套。');return mark('v12NorthDelivery','ledger','封套上的班次和簿上相同：上午检修，午钟前退回。');
   case 'entry-rule':return mark('c1GateCheck','entry','门牌写明：午钟后正门落闩，器具先在前厅登记。');
   case 'water-sign':return mark('c1CanalPrep','water','上游水痕更高，水向东槽流。踏板的绳轮仍承着压力。');
   case 'pressure':if(!has(this,'c1CanalPrep','water'))return this.say('先顺水痕看清方向。');h.worldChanges.pressure=true;return mark('c1CanalPrep','pressure','先打开泄压口，水落向低槽，绳轮松下来了。');
   case 'plank':if(!h.worldChanges.pressure){h.worldChanges.wrongValve=true;this.effect('frost',700,550,90,'#8ccbd1',.8);return this.say('水涌上来，绳轮卡住。松回绞盘，先泄上游压力即可。');}if(!safe())return this.say('阀边还有敌人，先稳住操作处。');h.worldChanges.plank=true;this.paths?.clear();return mark('c1CanalPrep','plank','放下踏板，两侧木销都落槽了。亲自走过去看看。');
   case 'mark':if(!h.worldChanges.plank||!has(this,'c1CanalPrep','crossed'))return this.say('需要从西岸亲自走过踏板，再留下可靠记号。');h.worldChanges.northDoor=true;return this.c1Claim('c1CanalPrep');
   case 'healthy':return mark('herbs','healthy','上游叶缘清亮，旧槽旁的叶片结着灰渍。采健康的。');
   case 'branch':if(!has(this,'herbs','healthy'))return this.say('先辨认哪一片药圃还能采。');h.worldChanges.herbGarden=true;return mark('herbs','branch','移开倒枝，根部没有泡在污水里。');
   case 'lamp-west':return mark('lantern','lampWest',this.chapter>=3?'西街的追兵已经离开，重新核实这段路。':'衣架后留得出两人并行，西灯照得到路。');
   case 'lamp-east':return mark('lantern','lampEast',this.chapter>=3?'东侧路口已经安静，这次按封街后的路线回报。':'东灯到井边没有积物，带朵莉绕开水沟即可。');
   case 'transmission':return mark('copper','transmission','铜圈磨损在内缘，传动架的断口能对上。');
   case 'copper-test':if(!has(this,'copper','fitted'))return this.say('先在洛缇的工作台试装铜圈。');return this.c1StartTraining('copper');
   case 'name':if(!this.flags.rumor)return this.say('刻痕太浅，先问问井边等候的人。');return mark('c1ClockMemory','name','刻名与井沿同一个姓，银环内侧留着修钟人的旧记号。');
   case 'loom':step(this,'c1LoomBrief').observed=true;this.say('检查刀口和绑带后，把无刃样胚放进机台。试织片留在这里，只带走选好的材料。');this.c1Accept('c1LoomBrief');this.emit('mechanism',{kind:'c1-loom'});return true;
   case 'rune-board':if(!has(this,'c1RuneWear','a','b','leak'))return this.say('把两节点与漏压记录带回来，再验证试织。');h.worldChanges.runePattern=true;return mark('c1RuneWear','weave','调整线张力，试织样片不再偏移。样片留在机台。');
   case 'wet-a':return mark('c1RuneWear','a','西片亮得平稳，湿气没有侵进刻槽。');
   case 'wet-b':return mark('c1RuneWear','b','东片沿接头向外偏，漏压点就在北侧。');
   case 'leak':if(!has(this,'c1RuneWear','a','b')||!safe())return this.say('先对照两处符片，清出接头周围。');this.emit('mechanism',{kind:'c1-leak-diagnosis'});return true;
   case 'kiln-plan':return mark('c1RuneKiln','plan','图上低处进风，高处排烟；先通下口，再拉上绳。');
   case 'kiln-intake':if(!has(this,'c1RuneKiln','plan'))return this.say('先看罗萨留下的通风图。');h.worldChanges.kilnIntake=true;return mark('c1RuneKiln','intake','低口开了，苇叶向里倾，翼尘慢慢升起。');
   case 'kiln-exhaust':if(!h.worldChanges.kilnIntake){h.worldChanges.kilnBackflow=true;return this.say('烟尘倒灌。把绳子放回，先打开低处进风口。');}h.worldChanges.kilnExhaust=true;return mark('c1RuneKiln','exhaust','排烟道接通，翼尘越过窑柱，指向东边的破纹。');
   case 'kiln-node':if(!h.worldChanges.kilnExhaust)return this.say('尘土遮住了纹路，先理顺气流。');return mark('c1RuneKiln','node','破纹紧挨废液留下的沉积。记下位置，无需冒险惊动巢里的夜翼。');
   case 'kiln-ladder':h.worldChanges.kilnLadder=true;this.paths?.clear();this.saveEvent();return this.say('放下短梯，西墙浅沟已经接通。沿梯走回入口，不必再绕窑柱。');
   case 'cloth-rack':return this.say(this.quests.lantern==='done'?'朵莉把外侧衣架收起，衣物折好放在摊边。':'衣架占住一半灯路。先看清两段路，再替朵莉确认收摊方向。');
   case 'sample-tray':return this.choose('c1:samples');
   case 'sluice':if(!this.flags.captainDefeated||this.enemies.some(e=>!e.dead))return this.say('追兵还在，先稳住闸口。');h.worldChanges.sluice=true;return mark('c1CanalBreak','opened','绞盘咬住闸齿。东墙后有背风的窄窝，先带她在那里站稳。');
   case 'hideout':if(!h.worldChanges.sluice)return this.say('东闸还没开，先转动绞盘。');step(this,'c1CanalBreak').sheltered=true;this.c1Claim('c1CanalBreak');chat(this,[['旁白','闸后的石壁挡住了脚步声。诺恩松开手，艾莉娅退开半步。'],['艾莉娅','别碰我。'],['旁白','他没有回答。出口就在前面。']]);return true;
   default:if(key.startsWith('patrol-')){const s=hPatrol(this);if(!s)return this.say('设备记录仍在罗萨手里。');const front=s.route?'patrol-grove':'patrol-road',back=s.route?'patrol-kiln':'patrol-mill';if(key===front){s.diagnosed=true;this.say('沿受潮痕定位：本轮是后段接头松动。');}else if(key===back&&s.diagnosed){if(!safe())return this.say('先处理设备周围的敌人，再动接头。');if(!s.repaired){s.repaired=true;h.worldChanges[key]=s.sequence;this.say('接头修好了，沿工作面走开，再回来验证输出。');s.repairPosition={x:this.p.x,y:this.p.y};}else if(s.walkedAway){s.verified=true;this.say('输出稳定，本轮可以回罗萨核对。');}}this.saveEvent();return true;}return this.say('这里的工作已经记在手记里。');
  }
 };
 const update=P.update;
 P.update=function(dt,input){const wasActive=this.active,oldX=this.p.x,result=update.call(this,dt,input);if(!wasActive||this.pending)return result;const h=c1State(this);if(this.map==='c1NorthWalk'&&h.worldChanges.plank&&oldX<=835&&this.p.x>835&&this.p.y>400&&this.p.y<620)step(this,'c1CanalPrep').crossed=true;const p=hPatrol(this);if(p?.repaired&&p.repairPosition&&Math.hypot(this.p.x-p.repairPosition.x,this.p.y-p.repairPosition.y)>100)p.walkedAway=true;return result;};
 P.c1RepairLeak=function(choice){const p=this.props.find(p=>p.id==='c1-leak');if(this.map!=='c1NorthWalk'||!near(this,p)||!has(this,'c1RuneWear','a','b'))return false;if(choice!=='joint'){this.effect('frost',p.x,p.y,55,'#a6bccc',.6);this.say('西片没有渗痕。先松手，沿东片偏移的方向看接头，不损失符片。');return false;}if(this.enemies.some(e=>!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<220))return false;c1State(this).worldChanges.leakFixed=true;step(this,'c1RuneWear').leak=true;this.say('收紧接头后气泡停了。带记录回台试织，检查纹样是否回正。');this.saveEvent();return true;};
 P.c1SearchDirection=function(direction){if(this.map!=='road'||!has(this,'letter','cloth'))return false;if(direction==='east'){step(this,'letter').mud=true;this.say('车辙与线头都向东，信落在原弯道。');this.saveEvent();return true;}this.say('这串是狼的脚印，折回岔口即可重新判断。');return false;};
 P.c1Morning=function(){if(this.map!=='road')return false;c1State(this).worldChanges.morning=true;chat(this,[['旁白','车棚遮住了夜雨。诺恩把通行纸压进干燥的内袋。'],['旁白','天亮了。白榆城开门，离午钟还有一段时间。']]);this.saveEvent();return true;};
}
function hPatrol(g){return c1State(g).merchant.activePatrol;}
