import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {migrateTrialSave} from './chapter-one-trial-save.js';
import {C1_TRIAL_DIALOGUES} from './chapter-one-trial-dialogues.js';
import {C1_QUESTS,C1_SIDE,C1_ELITES,C1_RUNES,C1_CORES} from './chapter-one-expansion-data.js';
import {C1_OBJECTIVES,C1_GIVERS} from './chapter-one-objectives.js';
import {C1_MAPS} from './chapter-one-layout.js';
import {c1State,c1Clone} from './chapter-one-expansion-save.js';
import {EXPERIENCE_ROLES} from './rpg-experience-data.js';
import {experienceSceneSafe} from './rpg-experience-triggers.js';
import {STAGING} from './staging-v14.js';
import {POTIONS} from './systems-data-v14.js';
export const C1_FINAL_BOSS='c1-final-examiner';
export const C1_MEDICINE='c1MedicinalEssence';
export const C1_BREWS={hp:{amount:2,fee:1},mp:{amount:2,fee:1},hpMedium:{amount:4,fee:2},mpMedium:{amount:4,fee:2}};
const prep=g=>c1State(g).preparation;
const done=(g,id)=>g.quests[id]==='done'||['claimed','waived'].includes(c1State(g).mainStages[id]);
const pick=(g,list)=>list[Math.floor(random(g)*list.length)];
function random(g){let x=prep(g).seed;x^=x<<13;x^=x>>>17;x^=x<<5;prep(g).seed=x>>>0;return prep(g).seed/4294967296;}
const at=(g,p)=>p&&g.p.hp>0&&!g.pending&&!g.transition&&!g.enemies.some(e=>!e.dead)&&Math.hypot(g.p.x-(p.interactX??p.x),g.p.y-(p.interactY??p.y))<150&&g.clearLine(g.p,{x:p.interactX??p.x,y:p.interactY??p.y},false);
function stock(g,slot){const s=prep(g),others=s.stock.filter((_,i)=>i!==slot).map(x=>x.id);s.stock[slot]={serial:++s.stockSequence,id:pick(g,Object.keys(C1_RUNES).filter(id=>!others.includes(id)))};}
function order(g){const s=prep(g);s.order={serial:++s.orderSequence,core:pick(g,Object.keys(C1_CORES)),amount:3+Math.floor(random(g)*3),accepted:false};}
export function installC1Trial(RPG,{MAPS,QUESTS,ITEMS,DIALOGUES}){
 Object.assign(DIALOGUES,C1_TRIAL_DIALOGUES);
 ITEMS[C1_MEDICINE]={name:'药用精粹',category:'material',desc:'从野兽与旧构装体中收集的通用炼制原料，可在会馆装置配药；缀纹启用后也用于核心加工。'};
 C1_OBJECTIVES.c1ExitDrill.cause=C1_FINAL_BOSS;C1_OBJECTIVES.c1ExitDrill.map='c1TrialVault';
 C1_QUESTS.c1ExitDrill.name='地下试炼';QUESTS.c1ExitDrill.name='地下试炼';QUESTS.c1ExitDrill.desc='清理旧廊八具哨兵、蓄能廊八只啃线鼠，再挑战三层东厅的终试执卫，最后回会馆向薇蕾娜汇报。';QUESTS.c1VaultWatch.desc='停下西侧封存看守，取回东厅北墙的清册，交给入口账桌旁的维恩。';QUESTS.c1LoomBrief.desc='薇蕾娜介绍了会馆装置：材料订单换核心，罗萨出售符文，两者加上工费可以制作装备。';
 C1_QUESTS.c1LoomBrief.map='hall';C1_QUESTS.c1LoomBrief.requires=['c1CommissionBrief'];
 const hunt={id:'c1EliteHunt',name:'五处隐患',type:'支线',xp:80,gold:60,map:'hall',target:'clerk',requires:[]};
 C1_SIDE.push(hunt);C1_QUESTS[hunt.id]=hunt;QUESTS[hunt.id]={...hunt,giver:'clerk',desc:'为维修班和运货人清除两名地下看守、三头郊外凶兽，五处齐备后向鲁恩回报。'};C1_GIVERS[hunt.id]='clerk';
 const coreQ={id:'c1CoreOrder',name:'装置的核心订单',type:'支线',xp:0,gold:0,map:'hall',target:'c1-loom',requires:['c1CommissionBrief']};C1_QUESTS[coreQ.id]=coreQ;QUESTS[coreQ.id]=coreQ;
 // Use the existing machine and merchant, with a clear approach from the hall's centre.
 const room=MAPS.c1LoomRoom,loom=room.props.find(p=>p.id==='c1-loom'),rosa=room.npcs.find(p=>p.id==='c1rosa');
 room.props=room.props.filter(p=>p!==loom);room.npcs=room.npcs.filter(p=>p!==rosa);room.blocks=room.blocks.filter(b=>JSON.stringify(b)!==JSON.stringify(loom.c1Box));room.c1Layout=11;
 Object.assign(loom,{x:370,y:480,interactX:370,interactY:535,c1Art:['loom',0,80,100],c1Box:[338,445,64,35],c1Layout:12});MAPS.hall.props.push(loom);MAPS.hall.blocks.push(loom.c1Box);Object.assign(rosa,{x:610,y:360,angle:Math.PI/2});MAPS.hall.npcs.push(rosa);MAPS.hall.c1Layout=12;
 // Separate west archival elite and east final arena. The passage remains open.
 const vault=MAPS.c1TrialVault;vault.spawns.find(s=>s[3]==='c1-vault-warden').splice(1,2,670,395);
 vault.spawns=vault.spawns.filter(s=>!['c1-vault-sentry-5','c1-vault-sentry-6'].includes(s[3]));vault.spawns.push(['wolf',1250,500,C1_FINAL_BOSS]);vault.c1Layout=11;
 EXPERIENCE_ROLES.trialFinal={...EXPERIENCE_ROLES.vaultWarden,hp:2970,damage:25,xp:65,gold:18,speed:125,aggro:320,reach:78,specialCooldown:5.2,moveOrder:['shieldBash','charge','heavySlam'],specialMultiplier:1.2};
 const pair={map:'hall',actors:{hero:[1080,735],sister:[1180,635]},beats:[{line:0,moves:[['hero',1080,670,.7]]}],conversationPairs:[[0,'hero','sister',110]]};
 STAGING.scenes.c1TrialLegacyContract=c1Clone(STAGING.scenes.contract);
 STAGING.scenes.c1TrialInvitation={...c1Clone(pair),beats:[...pair.beats,{line:5,moves:[['sister',1140,660,.5]]}]};
 STAGING.scenes.c1TrialReport={...c1Clone(pair),beats:[...pair.beats,{line:9,moves:[['hero',500,770,1],['sister',600,740,1]]},{line:18,moves:[['hero',1080,670,1],['sister',1180,635,1]]}],conversationPairs:[[0,'hero','sister',110],[9,'hero','sister',105],[18,'hero','sister',110]]};STAGING.scenes.contract=c1Clone(pair);
 STAGING.scenes.c1SaintAid={map:'town',actors:{saint:[710,620],dolly:[845,690],aidElder:[630,650],aidNeighbour:[580,700]},actorMeta:{aidElder:{sprite:7,faceTo:'saint'},aidNeighbour:{sprite:6,faceTo:'saint'}},commitActor:null,beats:[{line:0,moves:[['dolly',800,650,.8]]}],conversationPairs:[[0,'saint','dolly',100]]};
 // A working food station: service table, resting elders, queue and supplies.
 const relief=STAGING.scenes.c1SaintAid;
 relief.actors={saint:[605,555],dolly:[735,535],aidElder:[425,595],aidNeighbour:[370,650],aidSeated:[510,610],aidWorker:[660,650],aidMother:[725,715],aidResident:[790,770],aidCook:[450,470]};
 relief.actorMeta={aidElder:{sprite:7,pose:'seated',faceTo:'saint'},aidNeighbour:{sprite:6,faceTo:'aidElder'},aidSeated:{sprite:2,pose:'seated',faceTo:'saint'},aidWorker:{sprite:4,faceTo:'saint'},aidMother:{sprite:6,faceTo:'saint'},aidResident:{sprite:3,faceTo:'saint'},aidCook:{sprite:5,faceTo:'dolly'}};
 relief.conversationPairs=[];relief.focus=[620,580];relief.faceTargets={saint:'dolly',dolly:'saint'};
 relief.beats=[{line:0,moves:[['dolly',700,535,.8]]},{line:4,moves:[['saint',550,570,.7]],faceTargets:{saint:'aidElder',dolly:'aidWorker'}},{line:9,moves:[['dolly',600,610,.8],['saint',475,595,.7]],faceTargets:{saint:'aidElder',dolly:'aidSeated'}}];
 const pieces=[['table','Objects',9,565,505,160,80,[505,480,120,25]],['bench','Furnishings',1,465,630,160,55,[405,610,120,20]],['stool','Objects',6,375,680,48,44,[358,665,34,15]],['water','Settlement',7,390,505,46,48,[373,485,34,20]],['supplies','Furnishings',5,315,515,85,42,[280,495,70,20]]];
 for(const [key,sheet,index,x,y,w,h,box]of pieces){MAPS.town.props.push({id:'c1-aid-'+key,label:'',type:'scenery',x,y,c1Art:[sheet,index,w,h],c1Box:box,c1Layout:12,geometryV26:false,collisionV281:false});MAPS.town.blocks.push(box);}
 MAPS.town.c1Layout=12;
 for(const [id,index,x,y,w,h,depth]of [['aidBread',5,565,465,47,32,506],['aidCloth',6,515,471,33,26,506]]){relief.actors[id]=[x,y];relief.actorMeta[id]={renderAs:'prop',autoFace:false,v25Raster:{sheet:'romancePropsV20',index,w,h},depthY:depth};}
 for(const [scene,npc]of Object.entries({c1HuntOffer:'clerk',c1HuntProgress:'clerk',c1HuntReport:'clerk',c1SupplyIntro:'c1rosa',c1CoreOrderOffer:'c1rosa'})){
  const n=MAPS.hall.npcs.find(n=>n.id===npc);STAGING.scenes[scene]={map:'hall',actors:{hero:[n.x+80,n.y+70],[npc]:[n.x,n.y]},conversationPairs:[[0,'hero',npc,110]]};
 }
 for(const [scene,npc]of [['c1TownDolly','dolly'],['c1TownLena','woman']]){const n=MAPS.town.npcs.find(n=>n.id===npc);STAGING.scenes[scene]={map:'town',actors:{hero:[n.x+80,n.y+50],[npc]:[n.x,n.y]},conversationPairs:[[0,'hero',npc,100]]};}
 for(const id of ['c1TrialInvitation','c1TrialReport','contract','c1SaintAid','c1HuntOffer','c1HuntProgress','c1HuntReport','c1SupplyIntro','c1CoreOrderOffer','c1TownDolly','c1TownLena']){const stage=STAGING.scenes[id];if(!stage)continue;stage.beats||=[];for(const b of stage.beats)b.moves||=[];stage.actorMeta||={};for(const key of Object.keys(stage.actors)){const npc=MAPS[stage.map].npcs.find(n=>n.id===key);if(npc)stage.actorMeta[key]={...stage.actorMeta[key],sprite:npc.sprite};}CINEMATIC_SCENES.add(id);}
 const rat=MAPS.warehouse.spawns.find(s=>s[3]==='c1-grain-rat-1');rat[1]=580;rat[2]=270;MAPS.warehouse.c1Layout=11;
 const P=RPG.prototype,old={};for(const k of ['restore','enemy','ensureMap','enter','update','choose','apply','npcOptions','canDoor','c1CanOffer','c1Ready','questGoal','objective','c1AtService','c1PropInteractive','useProp','c1Craft','c1FreeMaterials','c1Exchange','handleHellDeath','beginScene'])old[k]=P[k];
 function tuneBoss(e){if(e.id!==C1_FINAL_BOSS)return;const cfg=EXPERIENCE_ROLES.trialFinal;if(e.c1FinalRevision!==2){const ratio=e.hp/Math.max(1,e.maxHP);e.maxHP=cfg.hp;e.hp=e.dead?0:Math.max(1,Math.round(cfg.hp*ratio));e.c1FinalRevision=2;}Object.assign(e,{label:'终试执卫',c1Species:'vaultwarden',experienceRole:'trialFinal',experienceRevision:1,isBoss:true,elite:false,c1Custom:false,storyTag:'c1-final-trial',v15BossStats:'custom',v28DamageMultiplier:1,v28RewardXP:65,v28RewardGold:18});}
 P.enemy=function(...args){const e=old.enemy.apply(this,args);tuneBoss(e);return e;};
 P.ensureMap=function(id){const r=old.ensureMap.call(this,id);for(const e of this.states[id]?.enemies||[])tuneBoss(e);return r;};
 P.restore=function(saved){const r=old.restore.call(this,migrateTrialSave(saved));for(const st of Object.values(this.states))for(const e of st.enemies)tuneBoss(e);return r;};
 P.c1TrialComplete=function(){return done(this,'c1ExitDrill')||this.c1Ready('c1ExitDrill');};
 P.c1EnsureOffers=function(){const s=prep(this);if(!s.approved)return false;if(!s.stock.length)for(let i=0;i<3;i++)stock(this,i);if(!s.order)order(this);return true;};
 P.c1AtService=function(which){if(['loom','rosa'].includes(which))return this.map==='hall'&&at(this,which==='loom'?this.props.find(p=>p.id==='c1-loom'):MAPS.hall.npcs.find(n=>n.id==='c1rosa'));return old.c1AtService.call(this,which);};
 P.c1PropInteractive=function(p){return p?.id==='c1-loom'?this.chapter<5:old.c1PropInteractive.call(this,p);};
 P.c1CanOffer=function(id){const s=prep(this);if(this.chapter<5){if(id==='c1Readiness'&&!done(this,id))return s.started;if(id==='c1ExitDrill'&&!done(this,id))return s.started&&done(this,'c1Readiness');if(['c1LoomBrief','c1RuneWear','c1RuneKiln','c1RunePatrol','c1CoreOrder'].includes(id)&&!s.approved)return false;}return old.c1CanOffer.call(this,id);};
 P.c1Ready=function(id){if(id==='c1ExitDrill'&&prep(this).legacy&&this.quests[id]==='active'){const h=c1State(this),o=C1_OBJECTIVES[id];return !!h.questSteps[id]?.legacyEvidence||o.parts.every(p=>(h.journey.parts[id]?.[p.id]||0)>=p.count)&&Object.values(this.states).some(st=>st.enemies.some(e=>e.id==='c1-trial-warden'&&e.dead));}if(id==='c1EliteHunt')return this.quests[id]==='active'&&Object.keys(C1_ELITES).every(k=>prep(this).kills.includes(k));if(id==='c1CoreOrder'){const o=prep(this).order;return !!(o?.accepted&&(this.p.items[C1_MEDICINE]||0)>=o.amount);}if(id==='c1LoomBrief'&&!prep(this).legacy)return this.quests[id]==='active'&&prep(this).approved;return !!old.c1Ready.call(this,id);};
 P.npcOptions=function(id){let rows=old.npcOptions.call(this,id);if(this.chapter>=5)return rows;const s=prep(this),add=(label,action,state='daily')=>rows.push({label,action,questState:state});
  if(id==='sister'&&this.chapter===1){rows=rows.filter(x=>x.action!=='contractAccept');add(s.started?(this.c1TrialComplete()?'试炼完成了，我想和你说说经过。':'我想再问问试炼的安排。'):'奥伦说你在等我。','contractAccept',s.started?(this.c1TrialComplete()?'ready':'waiting'):'available');}
  if(id==='c1iden'&&!s.legacy)rows=rows.filter(x=>x.action!=='c1:claim:c1ExitDrill');
  if(id==='c1rosa'){rows=rows.map(x=>x.action==='c1:shop'?{...x,label:s.approved?'看看这次到的符文和药水。':'看看药水。'}:x);add('会馆这台装置能做什么？','trial:supplies');}
  if(this.map==='town'&&this.chapter===2&&['dolly','woman'].includes(id))add('问问圣女在街坊的事。',id==='dolly'?'trial:dolly':'trial:lena');
  return rows;
 };
 P.choose=function(action){if(this.pending||this.transition||this.p.hp<=0)return false;
  if(action==='contractAccept'&&this.chapter===1&&!prep(this).legacy){if(!prep(this).started)this.beginScene('c1TrialInvitation','trial:start');else if(this.c1TrialComplete())this.beginScene('c1TrialReport','trial:report');else this.beginScene('c1TrainingReason');return true;}
  if(action==='trial:supplies'){this.beginScene(prep(this).approved?'c1Talk_c1LoomBrief_offer':'c1SupplyIntro');return true;}
  if(['trial:dolly','trial:lena'].includes(action)&&this.map==='town'&&this.chapter===2){this.beginScene(action==='trial:dolly'?'c1TownDolly':'c1TownLena');return true;}
  if(action==='c1:shop'){if(!this.c1AtService('rosa'))return false;this.c1EnsureOffers();this.saveEvent();}
  if(action==='c1:claim:c1ExitDrill'&&!prep(this).legacy){if(this.map!=='hall'||!this.c1TrialComplete())return false;this.beginScene('c1TrialReport','trial:report');return true;}
  if(action.startsWith('c1:')&&action.endsWith(':c1EliteHunt')){const verb=action.split(':')[1];if(verb==='accept'&&!this.quests.c1EliteHunt)this.beginScene('c1HuntOffer','trial:huntAccept');else if(verb==='claim'&&this.c1Ready('c1EliteHunt'))this.beginScene('c1HuntReport','trial:huntClaim');else if(verb==='progress'&&this.quests.c1EliteHunt==='active')this.beginScene('c1HuntProgress');return true;}
  return old.choose.call(this,action);
 };
 P.apply=function(action){const id=typeof action==='string'?action:action?.id,s=prep(this);
  if(id==='trial:start'){if(this.chapter===1)s.started=true;this.saveEvent();return;}
  if(id==='trial:report'){if(this.chapter===1&&this.c1TrialComplete())this.beginScene('contract','contractAccept');return;}
  if(id==='trial:huntAccept'){if(!this.quests.c1EliteHunt){this.c1Accept('c1EliteHunt');s.hunt='active';}this.saveEvent();return;}
  if(id==='trial:huntClaim'){if(this.c1Ready('c1EliteHunt')){this.c1Claim('c1EliteHunt');s.hunt='done';}this.saveEvent();return;}
  if(id?.startsWith('trial:orderAccept:')){const serial=Number(id.split(':')[2]);if(s.approved&&s.order?.serial===serial){s.order.accepted=true;this.quests.c1CoreOrder='active';this.saveEvent();}return;}
  if(id==='contractAccept'&&this.chapter===1){if(!s.legacy&&(!s.started||!this.c1TrialComplete()))return false;if(!s.legacy)this.c1Claim('c1ExitDrill');const result=old.apply.call(this,action);if(this.chapter===2){s.approved=true;s.started=true;this.c1EnsureOffers();if(!s.legacy){this.c1Accept('c1LoomBrief');this.c1Claim('c1LoomBrief');}this.saveEvent();}return result;}
  return old.apply.call(this,action);
 };
 P.canDoor=function(d){if(this.chapter<5&&!prep(this).legacy){if(d.to==='road'&&this.map==='hall'&&!prep(this).approved)return '薇蕾娜还没有交给你出行的通行纸。她在会馆里等你。';if(d.to==='c1TrialVault')return done(this,'c1Readiness')?null:'伊登正在等鲁恩确认庭院试炼的结果。';}return old.canDoor.call(this,d);};
 P.questGoal=function(id){if(id==='c1EliteHunt'){const missing=Object.entries(C1_ELITES).filter(([k])=>!prep(this).kills.includes(k));if(this.quests[id]==='done')return {text:'五处隐患已清除',completed:true};if(this.quests[id]!=='active')return {text:'向鲁恩了解五处清路委托',map:'hall',target:'clerk'};return missing.length?{text:'清除'+missing.map(([,e])=>e.name).join('、'),map:missing[0][1].map,target:missing[0][0]}:{text:'五处已清 · 回报鲁恩',map:'hall',target:'clerk'};}
  if(id==='c1CoreOrder'){const o=prep(this).order;return {text:o?.accepted?`装置订单：药用精粹 ${this.p.items[C1_MEDICINE]||0}/${o.amount}，换取${C1_CORES[o.core].name}`:'查看装置当前的核心订单',map:'hall',target:'c1-loom'};}
  if(id==='c1ExitDrill'&&!prep(this).legacy&&this.c1TrialComplete())return {text:'试炼完成 · 回会馆向薇蕾娜汇报',map:'hall',target:'sister'};
  const r=old.questGoal.call(this,id);if(id==='c1ExitDrill'&&r?.target===C1_FINAL_BOSS)r.text=r.text.replace('undefined','终试执卫');return r;
 };
 P.objective=function(){if(this.chapter===1&&!prep(this).legacy){if(!prep(this).started)return {text:'回会馆和薇蕾娜交谈',map:'hall',target:'sister'};return this.questGoal(done(this,'c1Readiness')?'c1ExitDrill':'c1Readiness');}return old.objective.call(this);};
 P.c1SaintAidTick=function(){const s=prep(this);if(s.saintSeen||this.chapter!==0||this.map!=='warehouse'||this.quests.rats!=='active'||!experienceSceneSafe(this))return false;s.saintSeen=true;this.beginScene('c1SaintAid');this.saveEvent();return true;};
 P.enter=function(...args){const result=old.enter.apply(this,args);this.c1SaintAidTick();return result;};
 P.update=function(...args){if(this.c1SaintAidTick())return;return old.update.apply(this,args);};
 P.useProp=function(id,...args){if(id==='c1-loom'){if(!this.c1AtService('loom'))return false;this.c1EnsureOffers();this.saveEvent();this.emit('mechanism',{kind:'c1-loom'});return true;}return old.useProp.call(this,id,...args);};
 P.c1BuyRune=function(id,serial){if(!prep(this).approved||!this.c1AtService('rosa'))return false;this.c1EnsureOffers();const s=prep(this),slot=s.stock.findIndex(x=>x.id===id&&x.serial===serial),r=C1_RUNES[id];if(slot<0||!r||this.p.gold<r.price)return false;
  return this.c1Transaction('rune-stock:'+serial,()=>{this.p.gold-=r.price;this.addItem(id);stock(this,slot);return {gold:0,items:[id]};});};
 P.c1BuySupply=function(id){const p=POTIONS[id];if(!C1_BREWS[id]||!this.c1AtService('rosa')||this.p.gold<p.cost)return false;this.p.gold-=p.cost;this.addItem(id);this.saveEvent();return true;};
 P.c1Brew=function(id,serial){const b=C1_BREWS[id],s=prep(this);if(!b||!this.c1AtService('loom')||serial!==s.potionSequence+1||(this.p.items[C1_MEDICINE]||0)<b.amount||this.p.gold<b.fee)return false;return this.c1Transaction('brew:'+serial,()=>{this.p.items[C1_MEDICINE]-=b.amount;this.p.gold-=b.fee;this.addItem(id);s.potionSequence=serial;return {items:[id]};});};
 P.c1AcceptCoreOrder=function(serial){const s=prep(this);if(!s.approved||!this.c1AtService('loom')||s.order?.serial!==serial||s.order.accepted)return false;this.beginScene('c1CoreOrderOffer','trial:orderAccept:'+serial);return true;};
 P.c1CompleteCoreOrder=function(serial){const s=prep(this),o=s.order;if(!s.approved||!this.c1AtService('loom')||!o?.accepted||o.serial!==serial||(this.p.items[C1_MEDICINE]||0)<o.amount)return false;
  return this.c1Transaction('core-order:'+serial,()=>{this.p.items[C1_MEDICINE]-=o.amount;this.addItem(o.core);delete this.quests.c1CoreOrder;order(this);return {items:[o.core]};});};
 P.c1Craft=function(...args){return prep(this).approved?old.c1Craft.apply(this,args):false;};
 P.c1FreeMaterials=function(...args){return prep(this).legacy&&prep(this).approved?old.c1FreeMaterials.apply(this,args):false;};
 P.c1Exchange=function(...args){return prep(this).approved?old.c1Exchange.apply(this,args):false;};
 P.handleHellDeath=function(e){if(this.chapter<5&&C1_MAPS.includes(this.map)&&!e.c1Training&&!e.c1NoReward){const s=prep(this),key=this.map+':'+e.id,gen=e.c1QuestGeneration||e.c1Generation||1;if((s.drops[key]||0)<gen){s.drops[key]=gen;if(random(this)<.7){this.addItem(C1_MEDICINE);this.text('药用精粹 +1',e.x,e.y-100,'#b9cbb0');}if(this.quests.c1EliteHunt==='active'&&C1_ELITES[e.id]&&!s.kills.includes(e.id))s.kills.push(e.id);}}
  return old.handleHellDeath.call(this,e);
 };
}
