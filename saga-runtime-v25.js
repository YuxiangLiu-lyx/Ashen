import {isStoryTestV25} from './story-test-v25.js';
import {GEAR_SELL_PRICE,POTION_IDS,POTIONS} from './systems-data-v14.js';
import {MAPS,ITEMS,QUESTS,DIALOGUES} from './data-v14.js';
import {clearEnemyCombatV9} from './enemy-ai-v14.js';
import {freshSagaV25,sagaStateV25 as state,sagaSceneCallbackV25 as callback,sagaMapV25,configureSagaValidationV25,validateSagaSaveV25,savedSagaV25,hashSagaV25,seededSagaV25} from './saga-state-v25.js';
import {syncSagaBuildV25,sagaWeaponBonusV25,sagaLevelCapV25} from './saga-stats-v25.js';
const copy=x=>structuredClone(x),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const ITEM_DATA={v25Bark:{name:'赤根',kind:'quest',desc:'碾细调开后，可以压暗过白的肤色。'},v25ReedDye:{name:'乌叶果',kind:'quest',desc:'捣出的深色汁液可以暂时遮住浅发，过几天便会褪去。'},v25RiverClay:{name:'细苇绒',kind:'quest',desc:'适合垫在头巾里面，挡住容易露出的浅发。'},v25SpiritShard:{name:'镜泉剑髓',kind:'material',desc:'练成一种剑路后留下的温润晶片，可在器灵处温养一次武器。'}};
const pendingOther=g=>g.memoryV13?.active||g.romanceV20?.active||g.arrivalV22?.active||g.cityMomentsV24?.active||g.saintStoryV18?.active||g.saintStoryV18?.resting||g.cityStoriesV18?.active||g.discoveryV19?.active||g.hellExpeditionsV18?.run||g.v13?.trial?.active;
const live=g=>g.p?.cls!=='saint'&&!g._mercenaryContext&&!g.memoryV13?.active&&g.p?.hp>0;
const resetEffects=g=>{g.bullets=[];g.zones=[];g.target=null;g.moveTo=null;g.p.attackAnim=0;g.p.dash=0;g.p.moving=false;g.paths?.clear();};
export function installSagaV25(RPG,{stats,loot,nodes,tasks,encounters={},spawnEncounter,talks={}}){
 const P=RPG.prototype;if(P._sagaInstalledV25)return;Object.defineProperty(P,'_sagaInstalledV25',{value:true});
 Object.assign(ITEMS,ITEM_DATA);for(const n of nodes)QUESTS[n.id]={type:'主线',name:n.title||MAPS[n.map]?.name||'旅途',description:n.objective||'',xp:0,gold:0};
 configureSagaValidationV25({nodes,tasks,maps:MAPS,talks,items:ITEMS});
 const old={};for(const k of ['snapshot','restore','enter','apply','update','useProp','choose','npcOptions','objective','trackedGoal','questGoal','ready','available','questPropNeeded','canDoor','handleHellDeath','respawn','hurt','damage','attack','skill','updateCompanion','activeMercenaries','activeMercenary','canSave','saveBlockReason','beginPrivateMemory','claimRewards','beginScene','ch5Action','restoreNoen','switchToSaint','canSell','sell','potionStock'])old[k]=P[k];
 const node=g=>nodes[state(g).stage],taskSpec=g=>tasks[state(g).task?.id],isHere=g=>sagaMapV25(g.map)||g.map==='ch5Exit'&&state(g).started;
 const sync=g=>syncSagaBuildV25(g.p,state(g));
 const isThreat=g=>g.enemies?.some(e=>!e.dead&&e.sagaV25&&!e.sagaPatrolV25);
 const origin=g=>({hero:[g.p.x,g.p.y],saint:[g.saint.x,g.saint.y]});
 function makeReward(g,key,spec={}){
  const s=state(g);if(s.rewards[key])return s.rewards[key];
  const seed=hashSagaV25('ashen-v25|'+key+'|'+g.p.cls+'|'+(g.ch5?.seed||1)),rng=seededSagaV25(seed),r={seed,claimed:false,xp:spec.xp||0,gold:spec.gold||0,ap:spec.ap||0,sp:spec.sp||0,items:{...(spec.items||{})},gear:[],ticket:false};
  if(spec.random){if(rng()<.18)r.items.mercenaryBook=(r.items.mercenaryBook||0)+1;else {const id=rng()<.5?'hpGrand':'mpGrand';r.items[id]=(r.items[id]||0)+1;}}
  const slot=spec.gearSlot||(spec.random&&rng()<.25?['head','chest','hands','feet','relic'][Math.floor(rng()*5)]:null);
  if(slot){const lv=Math.min(48,Math.max(27,g.p.level+2)),rarity=spec.quality||(rng()<.13?'legendary':'epic'),primary={shadow:'dex',oath:'str',ember:'wis'}[g.p.cls],power=rarity==='legendary'?1.24:1;
   r.gear.push(loot(g.p.cls,lv,rng,{id:'quest-v25-'+key.replace(/[^a-zA-Z0-9_-]/g,'-'),slot,rarity,name:spec.gearName||({weapon:'归路留锋',head:'芦影兜帽',chest:'远行护衣',hands:'守约腕甲',feet:'渡石短靴',relic:'未熄的路灯'}[slot]),minLevel:Math.max(23,lv-5),attrs:{[primary]:Math.round((lv*.7+4)*power),vit:Math.round((lv*.28+2)*power)},atk:slot==='weapon'?Math.round((lv*3+16)*power):slot==='hands'||slot==='relic'?Math.round((lv*.8+4)*power):0,hp:Math.round((slot==='chest'?lv*9:lv*3)*power),gearGrowthVersion:17}));
  }
  r.ticket=rng()<(spec.ticketChance||(spec.random?.15:0));s.rewards[key]=r;return r;
 }
 function grant(g,key,spec){const r=makeReward(g,key,spec);if(r.claimed)return false;r.claimed=true;
  if(r.ticket)g.grantRecruitTicketV18?.('v25:'+key);g.p.gold+=r.gold;g.p.ap+=r.ap;g.p.sp+=r.sp;for(const[id,n]of Object.entries(r.items))g.addItem(id,n);
  for(const item of r.gear){if([...g.p.bag,...Object.values(g.p.gear||{}),...g.pendingRewards,...state(g).pendingGear].some(i=>i?.id===item.id))continue;if(g.p.bag.length<60)g.p.bag.push(copy(item));else state(g).pendingGear.push(copy(item));}
  if(r.xp)g.gainXP(r.xp);if(r.gear.length)g.say(g.p.bag.length>=60?'战利品已经包好，腾出行囊后可领取。':'收下了一份谢礼，可以在行囊里看看。');return true;
 }
 function runEffects(g,n){const s=state(g);for(const effect of n.effects||[]){
  if(effect==='cloak'){s.cloak.owned=true;}
  if(effect==='disguise'){s.disguise=true;for(const id of ['v25Bark','v25ReedDye','v25RiverClay'])g.p.items[id]=Math.max(0,(g.p.items[id]||0)-1);}
  if(effect==='unmask'){s.disguise=false;}
  if(effect==='killOrder'){g.knowledge.saint=[...new Set([...(g.knowledge.saint||[]),'v25-kill-order-witnessed'])];}
  if(effect==='villageTruth'){g.knowledge.saint=[...new Set([...(g.knowledge.saint||[]),'v25-village-abuses-witnessed'])];}
  if(effect==='bloodTruth'){g.knowledge.saint=[...new Set([...(g.knowledge.saint||[]),'v25-noen-told-trio-and-blood-demon'])];}
  if(effect.startsWith('training:')){const id=effect.slice(9);if(!s.training.includes(id)){s.training.push(id);g.addItem('v25SpiritShard',1);}}
  if(effect==='spirit'){s.spirit.unlocked=true;s.spirit.level=1;s.spirit.topics=Object.keys(talks);}
  if(effect==='ticket')g.grantRecruitTicketV18?.('v25:'+n.id);
  if(effect==='finish'){g.flags.ch8Complete=true;g.flags.complete=false;}
 }sync(g);}
 function finishNode(g){const s=state(g),n=node(g);if(!n)return false;
  grant(g,'node:'+n.id,n.reward||{});runEffects(g,n);s.completed.push(n.id);g.quests[n.id]='done';s.stage++;s.phase=s.stage>=nodes.length?'finished':'awaiting';s.activeScene=null;s.task=null;g.active=true;resetEffects(g);
  const next=node(g);if(next){g.quests[next.id]='active';g.chapter=Math.max(g.chapter,next.chapter===6?30:next.chapter===7?34:38);}
  if(n.travelTo){g.enter(n.travelTo,...(MAPS[n.travelTo]?.entry||[300,760]));}
  if(!next)g.say('第八章已完成。澄璃的声音仍留在武器里，安全处可以唤她说话。');
  g.saveEvent();return true;
 }
 function spawnTask(g){const s=state(g),spec=taskSpec(g);if(!spec||g.map!==spec.map)return false;
  if(!spawnEncounter?.(g,spec.encounter||spec.id))for(const a of spec.spawns||encounters[spec.encounter||spec.id]?.spawns||[]){if(!g.enemies.some(e=>e.id===a[3]))g.enemies.push(g.enemy(a[0],a[1],a[2],a[3]));}
  for(const e of g.enemies)if((spec.enemyIds||[]).includes(e.id)){e.sagaV25=true;e.sagaTaskV25=spec.id;if(s.task.defeated.includes(e.id)){e.dead=true;e.hp=0;e.respawn=9999999;}}
  return true;
 }
 function beginTask(g,n){const s=state(g),spec=tasks[n.task];if(!spec)throw new Error('V25 task missing: '+n.task);s.phase='task';s.activeScene=null;s.task={id:spec.id||n.task,collected:[],defeated:[],elapsed:0,attempt:0};g.active=true;spawnTask(g);g.saveEvent();return true;}
 function taskReady(g){const t=state(g).task,spec=taskSpec(g);return !!t&&!!spec&&(spec.propIds||[]).every(id=>t.collected.includes(id))&&(spec.kind==='escape'||(spec.enemyIds||[]).every(id=>t.defeated.includes(id))); }
 function startScene(g){const s=state(g),n=node(g);if(!n||s.phase!=='awaiting'||g.pending||g.transition||!live(g)||g.map!==n.map||pendingOther(g)||!g.active)return false;if(g.sagaExpansionBlocksV26?.())return false;const target=n.trigger;if(target&&(distance(g.p,{x:target[0],y:target[1]})>target[2]||!g.clearLine(g.p,{x:target[0],y:target[1]},false)))return false;
  if(!n.scene)return n.task?beginTask(g,n):finishNode(g);
  s.serial++;s.phase='scene';s.activeScene={node:n.id,scene:n.scene,token:s.serial};const at=origin(g);g.beginScene(n.scene,callback(s.activeScene));g.pending.sceneOrigin=at;g.saveEvent();return true;
 }
 function setback(g){const s=state(g),spec=taskSpec(g);if(!s.task||spec?.kind!=='duel'||g.pending)return false;
  if(!isStoryTestV25(g))g.p.hp=Math.max(1,Math.min(g.p.hp,Math.round(stats(g.p).hp*.36)));g.p.invuln=2.5;resetEffects(g);for(const e of g.enemies){clearEnemyCombatV9(e,g);e.sagaRetiredV25=true;e.dead=true;e.hp=0;e.respawn=9999999;}g.events=g.events.filter(e=>e.type!=='death');finishNode(g);startScene(g);return true;
 }
 P.sagaLevelCapV25=function(){return sagaLevelCapV25(this);};P.sagaStateV25=function(){return state(this);};
 P.startSagaV25=function(){const s=state(this);if(s.started||!this.flags.ch5BossDefeated||this.map!=='ch5Exit'||!live(this)||this.pending||pendingOther(this)||this.transition)return false;s.started=true;s.visits=['ch5Exit'];this.flags.ch5Complete=true;this.quests.ch5='done';if(this.ch5){this.ch5.stage='complete';if(!this.ch5.claims['exit-reward']){this.ch5.claims['exit-reward']=true;this.gainXP(850);this.p.gold+=180;}}this.chapter=30;this.flags.complete=false;this.quests[nodes[0].id]='active';sync(this);return startScene(this);};
 P.sagaInvisibleV25=function(){return live(this)&&state(this).cloak.on&&this.map==='ch6Outpost';};
 P.sagaCloakV25=function(on=!state(this).cloak.on){const s=state(this);if(!s.cloak.owned||this.map!=='ch6Outpost'||!live(this)||this.pending)return false;s.cloak.on=!!on;resetEffects(this);for(const e of this.enemies)clearEnemyCombatV9(e,this);this.saveEvent();return true;};
 P.sagaDisguisedV25=function(){return !!state(this).disguise;};
 P.sagaObjectiveV25=function(){const s=state(this),n=node(this),t=taskSpec(this);if(!s.started)return {text:'出口附近传来了熟悉的弦声。',map:'ch5Exit'};if(s.phase==='finished')return {text:'镜泉的路仍然敞着；安全处可以唤醒武器中的澄璃。',map:this.map};return {text:t?.objective||n?.objective||n?.title||'继续这段旅程。',map:t?.map||n?.map,target:t?.propIds?.find(id=>!s.task.collected.includes(id))||n?.target||null,type:'主线任务'};};
 P.sagaClaimPendingV25=function(){const s=state(this);let count=0;while(s.pendingGear.length&&this.p.bag.length<60){this.p.bag.push(s.pendingGear.shift());count++;}if(count){this.say('已把 '+count+' 件战利品收进行囊。');this.saveEvent();}return count;};
 P.claimRewards=function(){const n=old.claimRewards.call(this);return n+this.sagaClaimPendingV25();};
 P.canSell=function(item){if(sagaMapV25(this.map)&&item?.id?.startsWith('quest-v25-')&&state(this).started)return Object.values(state(this).rewards).some(r=>r.claimed&&r.gear.some(gear=>gear.id===item.id));return old.canSell.call(this,item);};
 P.sell=function(id){if(!sagaMapV25(this.map))return old.sell.call(this,id);const item=this.p.bag.find(i=>i.id===id);if(!item||!this.canSell(item)||!MAPS[this.map]?.safe||this.pending||this.transition||!live(this)||this.enemies.some(e=>!e.dead))return false;const price=GEAR_SELL_PRICE[item.rarity]||6;this.p.bag=this.p.bag.filter(i=>i.id!==id);this.p.gold+=price;this.say('卖出 '+item.name+' · '+price+' 金');this.saveEvent();return true;};

 P.sagaSpiritInfoV25=function(){const s=state(this),sp=s.spirit,weapon=this.p.gear?.weapon||this.p.gear?.offhand;return {unlocked:sp.unlocked,name:'澄璃',level:sp.level,weapon:weapon?.name||null,bonus:sagaWeaponBonusV25(this.p),topics:sp.topics.map(id=>({id,title:talks[id]?.title})),practiceAvailable:sp.unlocked&&sp.level<4&&s.training.some(id=>!sp.practiceClaims.includes(id)),practiceCost:sp.level*160,shards:this.p.items.v25SpiritShard||0,pendingGear:s.pendingGear.length};};
 P.sagaOpenSpiritV25=function(){if(!state(this).spirit.unlocked||!live(this)||this.pending||this.transition)return false;this.active=false;this.p.moving=false;this.moveTo=null;this.emit('mechanism',{kind:'v25-spirit'});return true;};
 P.sagaSpiritTalkV25=function(id){const s=state(this),t=talks[id];if(!t||id==='companions'&&(!this.saint.visible||this.sagaSaintAbsentV25())||!s.spirit.unlocked||!s.spirit.topics.includes(id)||!MAPS[this.map]?.safe||this.pending||this.transition||isThreat(this)||!live(this)||s.task)return false;s.serial++;s.activeScene={node:'spirit',scene:t.scene,token:s.serial};s.phase='scene';this.beginScene(t.scene,callback(s.activeScene));this.pending.sceneOrigin=origin(this);this.saveEvent();return true;};
 P.sagaSpiritPracticeV25=function(){const s=state(this),sp=s.spirit,key=s.training.find(id=>!sp.practiceClaims.includes(id)),cost=sp.level*160;if(!sp.unlocked||sp.level>=4||!key||!MAPS[this.map]?.safe||this.pending||this.transition||isThreat(this)||!live(this)||this.p.gold<cost||!(this.p.items.v25SpiritShard>0))return false;sp.practiceClaims.push(key);sp.level++;this.p.gold-=cost;this.p.items.v25SpiritShard--;sync(this);this.say('澄璃替你理顺了武器里的灵息。如今握住它，已比从前稳了些。');this.saveEvent();return true;};
 for(const key of ['restoreNoen','switchToSaint'])if(old[key])P[key]=function(...args){const result=old[key].apply(this,args);sync(this);return result;};
 P.snapshot=function(){return {...old.snapshot.call(this),sagaV25:savedSagaV25(this)};};
 P.restore=function(saved){validateSagaSaveV25(saved);old.restore.call(this,saved);this.sagaV25=saved.sagaV25?copy(saved.sagaV25):freshSagaV25();sync(this);if(!this.memoryV13?.active){this.p.hp=Math.min(stats(this.p).hp,Math.max(0,saved.p?.hp||0));this.p.mp=Math.min(stats(this.p).mp,Math.max(0,saved.p?.mp||0));}if(sagaMapV25(this.map)){for(const e of this.enemies)clearEnemyCombatV9(e,this);spawnTask(this);}};
 P.beginPrivateMemory=function(){const s=state(this);if(s.started)return false;const saved=copy(s),ok=old.beginPrivateMemory.call(this);if(ok&&this.memoryV13?.active)this.memoryV13.reality.sagaV25=saved;return ok;};
 P.enter=function(id,x,y){const s=state(this);if(this.memoryV13?.active)return old.enter.call(this,id,x,y);if(s.started&&s.activeScene)return false;old.enter.call(this,id,x,y);if(this.map!==id)return;if(id!=='ch6Outpost')s.cloak.on=false;if(sagaMapV25(id)&&s.started){if(!s.visits.includes(id))s.visits.push(id);if(MAPS[id].safe)s.checkpoint={map:id,x:this.p.x,y:this.p.y};if(id==='ch6Outpost'&&s.cloak.owned){s.cloak.on=true;spawnEncounter?.(this,'ch6Patrol');for(const e of this.enemies)e.sagaPatrolV25=true;}sync(this);spawnTask(this);this.saint.visible=!this.sagaSaintAbsentV25();this.sagaClaimPendingV25();this.saveEvent();}};
 P.canDoor=function(d){if(d.gate?.startsWith('v25:route:')||sagaMapV25(d.to)){const s=state(this),n=node(this),t=taskSpec(this);if(!s.started)return '先听听出口附近那位乐师的话。';if(s.activeScene)return '先把眼前的话说完。';if(t?.kind==='duel')return '对方已经封住来路。';const allowed=new Set([...s.visits,n?.map,t?.map,...(n?.routeMaps||[])]);if(!allowed.has(d.to))return '眼下这件事还没有办完，先沿已知的路走。';return null;}if(sagaMapV25(this.map))return null;return old.canDoor.call(this,d);};
 P.objective=function(){return isHere(this)?this.sagaObjectiveV25():old.objective.call(this);};P.trackedGoal=function(){return isHere(this)?this.sagaObjectiveV25():old.trackedGoal.call(this);};
 P.questGoal=function(id){const n=nodes.find(n=>n.id===id);return n?(state(this).completed.includes(id)?{text:'已完成',completed:true,map:null}:this.sagaObjectiveV25()):old.questGoal.call(this,id);};
 P.ready=function(id){return nodes.some(n=>n.id===id)?node(this)?.id===id&&taskReady(this):old.ready.call(this,id);};P.available=function(id){return nodes.some(n=>n.id===id)?false:old.available.call(this,id);};
 P.questPropNeeded=function(id){return (taskSpec(this)?.propIds||[]).includes(id)&&!state(this).task.collected.includes(id)||old.questPropNeeded.call(this,id);};
 P.useProp=function(id,confirmed){if(this.map==='ch5Exit'&&this.flags.ch5BossDefeated&&!state(this).started&&!this.pending)return this.startSagaV25();const o=this.props.find(p=>p.id===id);if(!o?.action?.startsWith('v25:'))return old.useProp.call(this,id,confirmed);if(!live(this)||this.pending||this.transition||distance(this.p,{x:o.interactX??o.x,y:o.interactY??o.y})>115||!this.clearLine(this.p,{x:o.interactX??o.x,y:o.interactY??o.y},false))return false;
  if(o.action==='v25:rest'||['v25-guest-rest','v25-memory-listen'].includes(id)){if(isThreat(this))return false;this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;state(this).checkpoint={map:this.map,x:this.p.x,y:this.p.y};this.saveEvent();return true;}
  if(o.action==='v25:spirit')return this.sagaOpenSpiritV25();if(o.action==='v25:cloak')return this.sagaCloakV25();
  if(id.endsWith('-cache')){if(isThreat(this)){this.say('先留意四周，别在交锋中打开包裹。');return false;}const key='cache:'+id,was=state(this).rewards[key]?.claimed;if(was){this.say('包裹已经收好了。');return false;}grant(this,key,{xp:280,gold:110,random:true,items:{hpGrand:1}});o.used=true;this.saveEvent();return true;}
  if(id==='v25-guest-supply'){if(isThreat(this))return false;this.active=false;this.emit('mechanism',{kind:'ch5-shop'});return true;}
  if(id==='v25-spirit-rest')return this.sagaOpenSpiritV25();
  const flavor={'v25-outpost-track':'绳头已经割断，布里仍裹着一双备用鞋。不能在这里停太久。','v25-boundary-gate':'界石安静地立在花影里，外面的脚步声传不过来。','v25-boundary-dawn':'淡淡的纹路沿着山石往上延伸。','v25-flower-tea':'杯口还留着一点温度。晚些时候，再坐下来喝。','v25-stone-nest':'石缝里垫着细草。走得轻些，别让碎石滚进去。'};
  if(flavor[id]){this.say(flavor[id]);return true;}
  const s=state(this),t=s.task,spec=taskSpec(this);if(!t||spec.map!==this.map||!(spec.propIds||[]).includes(id)){this.say('眼下还用不到它。');return false;}if(t.collected.includes(id))return false;
  if(spec.requireClear!==false&&(spec.enemyIds||[]).some(eid=>!t.defeated.includes(eid))){this.say('得先把附近的危险清理掉。');return false;}t.collected.push(id);o.used=true;const item=spec.itemByProp?.[id];if(item)this.addItem(item,1);this.saveEvent();if(taskReady(this))finishNode(this);return true;
 };
 P.npcOptions=function(id){if(!isHere(this))return old.npcOptions.call(this,id);const n=node(this),options=[];if(n?.npc===id&&state(this).phase==='awaiting')options.push({label:n.prompt||'继续说下去。',action:'v25:continue',questState:'advance'});if(['v25Chengli','chengli','ch8Chengli'].includes(id)&&state(this).spirit.unlocked)options.push({label:'唤一声澄璃。',action:'v25:spirit',questState:'service'});if(MAPS[this.map]?.safe)options.push({label:'借这里稍歇片刻。',action:'v25:rest',questState:'service'},{label:'补充行路药品。',action:'v25:supplies',questState:'service'});return options;};
 P.choose=function(a){if(!a?.startsWith('v25:'))return old.choose.call(this,a);if(a==='v25:continue'){this.active=true;return startScene(this);}if(a==='v25:spirit')return this.sagaOpenSpiritV25();if(a==='v25:rest'&&MAPS[this.map]?.safe&&!isThreat(this)){this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;this.saveEvent();return true;}if(a==='v25:supplies'&&MAPS[this.map]?.safe){this.active=false;this.emit('mechanism',{kind:'ch5-shop'});return true;}return false;};
 P.potionStock=function(){return sagaMapV25(this.map)?POTION_IDS.filter(id=>POTIONS[id].region<=4):old.potionStock.call(this);};
 P.ch5Action=function(action,arg){if(sagaMapV25(this.map)&&MAPS[this.map]?.safe&&!isThreat(this)){if(!['buy','buy-merc-book'].includes(action))return false;const ok=action==='buy'?this.buyPotion(arg):this.buyMercenaryBook();this.emit('mechanism',{kind:'ch5-shop'});return ok;}return old.ch5Action.call(this,action,arg);};
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(!id?.startsWith('v25:sceneDone:'))return old.apply.call(this,action);const s=state(this),a=s.activeScene;if(!a||this.pending||id!==callback(a)||!live(this))return false;s.activeScene=null;if(a.node==='spirit'){s.phase=s.stage>=nodes.length?'finished':'awaiting';this.active=true;this.saveEvent();return true;}const n=node(this);if(!n||n.scene!==a.scene||this.map!==n.map)return false;if(n.startEffects)runEffects(this,{effects:n.startEffects});return n.task?beginTask(this,n):finishNode(this);};
 P.handleHellDeath=function(e){if(!sagaMapV25(this.map)||!e.sagaV25)return old.handleHellDeath.call(this,e);const s=state(this),spec=taskSpec(this);e.respawn=9999999;if(spec?.kind==='duel'){setback(this);return true;}if(!s.task||!spec?.enemyIds?.includes(e.id))return true;if(!s.task.defeated.includes(e.id)){s.task.defeated.push(e.id);grant(this,'kill:'+e.id,{xp:Math.max(90,Math.round(e.rewardXP||220)),gold:e.isBoss?110:e.elite?28:12,ticketChance:e.isBoss?0:e.elite?.09:.035,items:e.isBoss?{hpGrand:1,mpGrand:1}:{}});}if(taskReady(this))finishNode(this);this.saveEvent();return true;};
 P.damage=function(e,n,kind){if(!this._mercenaryContext&&this.sagaInvisibleV25())return false;const t=taskSpec(this);if(t?.kind==='duel'&&e.sagaV25&&!e.dead){const result=old.damage.call(this,e,Math.min(n,Math.max(1,e.hp-1)),kind);setback(this);return result;}return old.damage.call(this,e,n,kind);};
 P.hurt=function(n){if(this.sagaInvisibleV25())return false;if(taskSpec(this)?.kind==='duel'&&Number.isFinite(n)&&n>0){setback(this);return true;}return old.hurt.call(this,n);};
 P.attack=function(){if(this.sagaInvisibleV25())return false;return old.attack.call(this);};P.skill=function(k){if(this.sagaInvisibleV25())return false;return old.skill.call(this,k);};
 P.sagaCompanionsSuppressedV25=function(){return this.sagaInvisibleV25()||this.sagaSaintAbsentV25()||!!MAPS[this.map]?.noMercenaries;};
 P.activeMercenaries=function(){if(this.sagaCompanionsSuppressedV25())return [];return old.activeMercenaries.call(this);};P.activeMercenary=function(){return this.activeMercenaries()[0]||null;};
 P.sagaSaintAbsentV25=function(){return /^ch7(?:Broker|Grain|Odric|Martha|Severin)/.test(this.map)||['ch8DawnTerrace','ch8StoneTrial','ch8MirrorTrial','ch8StormTrial'].includes(this.map);};
 P.updateCompanion=function(dt){if(sagaMapV25(this.map)&&!this.pending){if(this.sagaSaintAbsentV25()){this.saint.visible=false;this.saint.moving=false;return;}old.updateCompanion.call(this,dt);this.saint.visible=true;if(this.sagaInvisibleV25()){const at=this.safePoint(this.p.x-18,this.p.y+10);Object.assign(this.saint,at);this.saint.angle=this.p.angle;this.saint.moving=this.p.moving;}return;}return old.updateCompanion.call(this,dt);};
 P.canSave=function(){if(sagaMapV25(this.map)&&!this.memoryV13?.active){const t=taskSpec(this);if(t&&(t.enemyIds||[]).some(id=>this.enemies.some(e=>e.id===id&&!e.dead)))return false;}return old.canSave.call(this);};P.saveBlockReason=function(){if(sagaMapV25(this.map)&&!this.canSave())return '这一场交锋尚未结束；上一次剧情与已经收下的奖励仍会保留。';return old.saveBlockReason.call(this);};
 P.respawn=function(){if(!sagaMapV25(this.map))return old.respawn.call(this);if(taskSpec(this)?.kind==='duel')return setback(this);const s=state(this),t=s.task;if(t)t.attempt++;for(const e of this.enemies){clearEnemyCombatV9(e,this);if(!e.dead){e.hp=e.maxHP;e.x=e.homeX;e.y=e.homeY;}}resetEffects(this);this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;this.p.emotion=0;this.p.invuln=2;this.active=true;const at=s.checkpoint||{map:'ch6ReedWild',x:310,y:760};this.enter(at.map,at.x,at.y);this.saveEvent();return true;};
 P.update=function(dt,input){old.update.call(this,dt,input);const s=state(this);if(!Number.isFinite(dt)||dt<=0||!live(this)||this.pending||this.transition||!this.active)return;if(!s.started){if(this.map==='ch5Exit'&&this.flags.ch5BossDefeated&&!pendingOther(this))this.startSagaV25();return;}if(!isHere(this)||pendingOther(this))return;const spec=taskSpec(this);if(s.task&&this.map===spec?.map){s.task.elapsed=Math.min(100000,s.task.elapsed+Math.min(dt,.25));if(spec.kind==='duel'&&s.task.elapsed>=8){setback(this);return;}if(spec.kind==='escape'&&spec.escapeAt&&distance(this.p,{x:spec.escapeAt[0],y:spec.escapeAt[1]})<=spec.escapeAt[2]){s.task.defeated=[...(spec.enemyIds||[])];s.task.collected=[...(spec.propIds||[])];finishNode(this);return;}}startScene(this);};
}
