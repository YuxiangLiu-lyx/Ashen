import {V12_PACING,V12_QUEST_ITEMS} from './pacing-data-v14.js';
import {MAPS,QUESTS,ITEMS,DIALOGUES} from './data-v14.js';
import {chapterRegion} from './quest-service-v14.js';
const clone=v=>JSON.parse(JSON.stringify(v)),defs=Object.fromEntries(V12_PACING.map(q=>[q.id,q]));
const state=g=>g.v12||(g.v12={seed:47291363,quests:{},migrations:{}});
const peek=(g,id)=>g.v12?.quests?.[id];
const maps=goal=>Array.isArray(goal.map)?goal.map:[goal.map];
const done=(h,q)=>q.goals.every((goal,i)=>(h?.counts[i]||0)>=goal.count);
const receiverMap=(g,q)=>q.receiverAfter&&g.flags[q.receiverAfter.flag]?q.receiverAfter.map:q.receiverMap;
const completion=(g,q)=>q.receiverAfter&&g.flags[q.receiverAfter.flag]?q.completeAfterRecovery:q.dialogue.complete;
const first=(h,q)=>q.goals.findIndex((goal,i)=>(h?.counts[i]||0)<goal.count);
function random(g){let x=state(g).seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;state(g).seed=x>>>0;return state(g).seed/4294967296;}
function suspended(g,q){return chapterRegion(g)!==q.chapter||q.chapter===2&&g.chapter>=8||q.chapter===1&&g.chapter>=5;}
function available(g,q){const a=q.available;return !peek(g,q.id)&&!suspended(g,q)&&(a.minChapter===undefined||g.chapter>=a.minChapter)&&(a.maxChapter===undefined||g.chapter<=a.maxChapter)&&(!a.ch3Stages||a.ch3Stages.includes(g.ch3?.stage))&&(a.flagsAll||[]).every(k=>g.flags[k])&&(a.flagsNone||[]).every(k=>!g.flags[k]);}
function talk(g,lines,then=null){if(g.pending)return false;g.beginScene('_v12Quest',then);g.pending.lines=clone(lines?.length?lines:[['旁白','事情已经记在手记里。']]);return true;}
function sync(g,id){const q=defs[id],h=peek(g,id);if(h&&!h.claimed){h.status=done(h,q)?'ready':'active';g.quests[id]='active';}}
function mark(g,q,i){const h=peek(g,q.id);if(!h||h.claimed||h.counts[i]>=q.goals[i].count)return false;h.counts[i]++;sync(g,q.id);g.text(q.name+' '+h.counts[i]+'/'+q.goals[i].count,g.p.x,g.p.y-90,'#dbc993');g.saveEvent();return true;}
export function validatePacingSave(s){if(s.version<12&&!s.v12)return;const h=s.v12;if(!h||!Number.isInteger(h.seed)||h.seed<0||h.seed>4294967295||!h.quests||!h.migrations)throw new Error('旅途差事记录不完整。');for(const[id,a]of Object.entries(h.quests)){const q=defs[id];if(!q||!['active','ready','done'].includes(a.status)||typeof a.claimed!=='boolean'||!Array.isArray(a.counts)||a.counts.length!==q.goals.length||!Array.isArray(a.misses)||a.misses.length!==q.goals.length)throw new Error('旅途差事进度不正确。');if(a.counts.some((n,i)=>!Number.isInteger(n)||n<0||n>q.goals[i].count)||a.misses.some(n=>!Number.isInteger(n)||n<0||n>10)||a.claimed!==(a.status==='done')||a.status==='ready'&&!done(a,q))throw new Error('旅途差事计数不正确。');}}

export function installPacing(RPG){
 Object.assign(ITEMS,V12_QUEST_ITEMS);MAPS.hellApproach.npcs.push({id:'mechanist',name:'芮妲',sprite:11,x:350,y:820,angle:-.5});for(const q of V12_PACING)QUESTS[q.id]={name:q.name,type:q.optional?'支线':'主线',giver:q.giver,map:q.giverMap,desc:q.route,xp:q.reward.xp,gold:q.reward.gold};
 DIALOGUES._v12Quest=[['旁白','旅途中的一件小事。']];
 const P=RPG.prototype,old={};const oldNPCs=Object.getOwnPropertyDescriptor(P,'npcs').get;Object.defineProperty(P,'npcs',{get(){return oldNPCs.call(this).filter(n=>n.id!=='mechanist'||(this.map==='hellApproach'?['arrival','road'].includes(this.ch3?.stage):this.map!=='hellWorkshop'||!['arrival','road'].includes(this.ch3?.stage)));}});for(const k of ['restore','snapshot','npcOptions','choose','apply','ready','available','damage','useProp','update','canDoor','objective','updateCompanion'])old[k]=P[k];
 P.restore=function(s){old.restore.call(this,s);this.v12=s.v12?clone(s.v12):{seed:47291363,quests:{},migrations:{legacy:true}};this.v12.hide=null;
  if(s.version<12){this.v12.migrations.bridge=gChapterPassed(s,7,'manor');this.v12.migrations.camp=!!(s.flags?.ch4Odric||s.flags?.ch4Martha||s.flags?.ch4Severin||s.flags?.ch4Complete)||['deepCourt','deepBastion','deepCloister','deepSeal'].includes(s.map);}
  if(!this.flags.ch3Started&&!this.map.startsWith('hell')&&!this.map.startsWith('deep')&&this.ch3?.stage==='arrival')this.ch3=null;
 };
 P.snapshot=function(){return {...old.snapshot.call(this),version:12,v12:{...clone(state(this)),hide:null}};};
 P.ready=function(id){return defs[id]?peek(this,id)?.status==='ready':old.ready.call(this,id);};
 P.available=function(id){return defs[id]?available(this,defs[id]):old.available.call(this,id);};
 P.pacingGoal=function(id){const q=defs[id];if(!q)return null;const h=peek(this,id);if(h?.claimed)return {text:'已完成',map:null,completed:true,type:q.optional?'支线任务':'主线任务'};if(suspended(this,q))return {text:'暂时无法回去。'+q.name+'仍留在手记里。',map:null,suspended:true,type:q.optional?'支线任务':'主线任务'};if(!h)return {text:q.route,map:q.giverMap,target:q.giver,type:q.optional?'支线任务':'主线任务'};
  if(done(h,q))return {text:'回去告诉'+npcName(q.receiver)+'：'+q.name,map:receiverMap(this,q),target:q.receiver,type:q.optional?'支线任务':'主线任务'};
  const i=first(h,q),o=q.goals[i],map=maps(o).includes(this.map)?this.map:maps(o)[0],label=o.label||({talk:'找'+npcName(o.target)+'交谈',kill:'清理路边的敌人',drop:'收集'+(ITEMS[o.item]?.name||'材料'),hide:'在长凳旁躲过巡查'}[o.kind]);
  return {text:label+' '+h.counts[i]+'/'+o.count+(state(this).hide?.id===id?' · 安静等待 '+Math.floor(state(this).hide.elapsed)+'/'+o.seconds+' 秒':''),map,target:o.target,type:q.optional?'支线任务':'主线任务',detail:q.route};
 };
 P.npcOptions=function(id){const options=this.map==='hellApproach'&&id==='mechanist'?[]:old.npcOptions.call(this,id);for(const q of V12_PACING){const h=peek(this,q.id),giver=q.giver===id&&q.giverMap===this.map,receiver=q.receiver===id&&receiverMap(this,q)===this.map;
   if(h?.claimed){if(receiver)options.push({label:q.name+'，后来呢？',action:'v12q:after:'+q.id,questState:'daily'});continue;}
   if(suspended(this,q))continue;
   if(!h){if(giver&&available(this,q))options.push({label:ACCEPT_LABELS[q.id],action:'v12q:accept:'+q.id,questState:'available'});continue;}
   const i=first(h,q),goal=q.goals[i];
   if(goal?.kind==='talk'&&goal.target===id&&maps(goal).includes(this.map))options.push({label:q.name+' · '+(goal.label||'把话带到'),action:'v12q:advance:'+q.id+':'+i,questState:'advance'});
   else if(done(h,q)&&receiver)options.push({label:q.name+' · 东西备齐了。',action:'v12q:claim:'+q.id,questState:'ready'});
   else if(receiver||giver)options.push({label:q.name+' · 再问清楚。',action:'v12q:progress:'+q.id,questState:'waiting'});
  }return options;};
 P.choose=function(action){if(!action.startsWith('v12q:'))return old.choose.call(this,action);const[,verb,id,index]=action.split(':'),q=defs[id],h=peek(this,id);if(!q||suspended(this,q))return;
  if(verb==='accept'&&available(this,q))talk(this,q.dialogue.accept,'v12q:accept:'+id);
  if(verb==='progress'&&h&&!h.claimed)talk(this,q.dialogue.progress);
  if(verb==='after'&&h?.claimed)talk(this,q.dialogue.after);
  if(verb==='claim'&&h&&done(h,q)&&!h.claimed)talk(this,completion(this,q),'v12q:claim:'+id);
  if(verb==='advance'&&h&&!h.claimed&&first(h,q)===Number(index)){const i=Number(index),goal=q.goals[i];if(goal.kind!=='talk'||!maps(goal).includes(this.map))return;const final=i===q.goals.length-1&&goal.target===q.receiver;
   talk(this,final?[...(q.dialogue.goal?.[i]||[]),...q.dialogue.complete]:(q.dialogue.goal?.[i]||q.dialogue.complete),'v12q:advance:'+id+':'+i);
  }
 };
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(!id?.startsWith('v12q:'))return old.apply.call(this,action);const[,verb,key,index]=id.split(':'),q=defs[key];if(!q)return;
  if(verb==='accept'&&available(this,q)){state(this).quests[key]={status:'active',counts:q.goals.map(()=>0),misses:q.goals.map(()=>0),claimed:false};this.quests[key]='active';this.flags.tracked=key;this.flags.mapGoal=null;this.say('记下了：'+q.name);}
  const h=peek(this,key);if(!h||h.claimed)return;
  if(verb==='advance'&&first(h,q)===Number(index)){mark(this,q,Number(index));if(done(h,q)&&q.goals[Number(index)].kind==='talk'&&q.goals[Number(index)].target===q.receiver)this.claimPacing(key);}
  if(verb==='gather')mark(this,q,Number(index));
  if(verb==='claim'&&done(h,q))this.claimPacing(key);
  this.saveEvent();
 };
 P.claimPacing=function(id){const q=defs[id],h=peek(this,id);if(!h||h.claimed||!done(h,q))return false;
  // Mark before giving rewards: replayed dialogue completion cannot duplicate payouts.
  h.claimed=true;h.status='done';this.quests[id]='done';for(const goal of q.goals)if(goal.questOnly&&goal.item)this.p.items[goal.item]=Math.max(0,(this.p.items[goal.item]||0)-goal.count);
  for(const f of q.flagsOnClaim||[])this.flags[f]=true;this.p.gold+=q.reward.gold||0;if(q.reward.xp)this.gainXP(q.reward.xp);for(const [item,n]of Object.entries(q.reward.items||{}))this.addItem(item,n);
  if(this.flags.tracked===id)this.flags.tracked=null;this.say('已办妥：'+q.name);this.saveEvent();return true;
 };
 P.damage=function(e,n,kind){const alive=this.enemies.filter(o=>!o.dead);const result=old.damage.call(this,e,n,kind);for(const enemy of alive){if(!enemy.dead||enemy.v12QuestCounted)continue;enemy.v12QuestCounted=true;
   if(enemy.v11Boss||enemy.isBoss||enemy.squadLeader||enemy.v11Add||enemy.storyTag||['captain','hellJailer'].includes(enemy.type))continue;
   for(const q of V12_PACING){const h=peek(this,q.id);if(!h||h.claimed||suspended(this,q))continue;for(let i=0;i<q.goals.length;i++){const o=q.goals[i];if(!['kill','drop'].includes(o.kind)||!maps(o).includes(this.map)||!o.enemyTypes.includes(enemy.type)||h.counts[i]>=o.count)continue;
    if(o.kind==='kill')mark(this,q,i);else{h.misses[i]++;if(h.misses[i]>=o.pity||random(this)<o.rate){h.misses[i]=0;this.addItem(o.item);mark(this,q,i);}}
   }}
  }return result;};
 P.questPropNeeded=function(id){return V12_PACING.some(q=>{const h=peek(this,q.id);return h&&!h.claimed&&!suspended(this,q)&&q.goals.some((o,i)=>['gather','hide'].includes(o.kind)&&o.target===id&&maps(o).includes(this.map)&&h.counts[i]<o.count);});};
 P.useProp=function(id,confirmed){for(const q of V12_PACING){const h=peek(this,q.id);if(!h||h.claimed||suspended(this,q))continue;for(let i=0;i<q.goals.length;i++){const o=q.goals[i];if(!['gather','hide'].includes(o.kind)||o.target!==id||!maps(o).includes(this.map)||h.counts[i]>=o.count)continue;
    const prop=this.props.find(p=>p.id===id),at=prop&&{x:prop.interactX??prop.x,y:prop.interactY??prop.y};if(!at||Math.hypot(this.p.x-at.x,this.p.y-at.y)>130||!this.clearLine(this.p,at,false)){this.say('再靠近一点。');return;}
    if(this.enemies.some(e=>!e.dead&&Math.hypot(e.x-this.p.x,e.y-this.p.y)<190&&this.clearLine(this.p,e,false))){this.say('附近还有敌人，先留意脚下。');return;}
    if(o.kind==='hide'){if(this.pending)return;state(this).hide={id:q.id,index:i,elapsed:0,hp:this.p.hp,x:this.p.x,y:this.p.y};this.flags.tracked=q.id;this.moveTo=null;this.p.moving=false;this.active=true;this.emit('sfx',{name:'wood'});this.say('门外的脚步停了下来。先别出声。');return;}
    talk(this,q.dialogue.goal?.[i]||[['旁白',o.label+'。']],'v12q:gather:'+q.id+':'+i);return;
   }}return old.useProp.call(this,id,confirmed);};
 P.update=function(dt,input){old.update.call(this,dt,input);const h=this.v12?.hide;if(!h||!this.active||this.pending)return;const q=defs[h.id],o=q.goals[h.index];if(this.p.hp<h.hp||Math.hypot(this.p.x-h.x,this.p.y-h.y)>9||this.map!==o.map||input?.attack){state(this).hide=null;this.say('脚步还没走远。可以回长凳边重新等候。');return;}h.elapsed+=dt;if(h.elapsed>=o.seconds){state(this).hide=null;talk(this,q.dialogue.goal?.[h.index],'v12q:gather:'+q.id+':'+h.index);}};
 P.updateCompanion=function(dt){if(this.map==='bridge'&&peek(this,'v12WatchHours')&&!peek(this,'v12WatchHours').claimed){this.saint.visible=false;this.saint.moving=false;return;}old.updateCompanion.call(this,dt);};
 P.canDoor=function(d){const reason=old.canDoor.call(this,d);if(reason)return reason;if(this.map==='bridge'&&d.to==='manor'&&this.chapter===7&&!this.flags.v12WatchHoursDone&&!this.v12?.migrations.bridge)return '先到旅店问塞琳，再向桥口巡卫打听今天的查验。';if(this.map==='deepCamp'&&d.to==='deepCourt'&&!this.flags.v12CleanBottlesDone&&!this.v12?.migrations.camp)return '先在营地安顿一下。北边的薇塔在找她借出去的药瓶。';return null;};
 P.objective=function(){if(chapterRegion(this)===2&&this.chapter===7&&!this.flags.v12WatchHoursDone&&!this.v12?.migrations.bridge)return this.pacingGoal('v12WatchHours');if(chapterRegion(this)===4&&this.flags.ch4EnchantUnlocked&&!this.flags.v12CleanBottlesDone&&!this.v12?.migrations.camp)return this.pacingGoal('v12CleanBottles');return old.objective.call(this);};
}
function npcName(id){return {steward:'奥伦',courier:'阿林',clerk:'鲁恩',watch:'托马',seline:'塞琳',bridgewatch:'巡卫',doctor:'莫里斯',mechanist:'芮妲',deepMerchant:'薇塔',deepEnchanter:'赫伦',deepInnkeeper:'兰恩'}[id]||id;}
function gChapterPassed(s,n,map){return s.chapter>n||s.chapter===n&&s.map===map;}

const ACCEPT_LABELS={v12Water:'那壶水还没晾好？',v12CourierRoad:'林子那边过不去？',v12NorthDelivery:'有话要带进城？',v12WatchHours:'桥口今天什么情况？',v12QuietRoom:'前廊是谁？',v12CartBuckles:'那辆送货车怎么了？',v12LoanedLamp:'找我有事？',v12WarmHerbs:'药台上还缺什么？',v12LampShields:'路边的灯怎么了？',v12CleanBottles:'你在找什么？',v12HearthStones:'炉脚怎么在晃？',v12ForgeRivets:'夹口坏了？'};
