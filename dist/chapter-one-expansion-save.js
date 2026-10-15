import {c1PrepFresh,validatePreparation} from './chapter-one-preparation-state.js';
import {C1_OBJECTIVES,C1_LEGACY_PARTS} from './chapter-one-objectives.js';
import {C1_MAIN,C1_SIDE,C1_ELITES,C1_PARTS,C1_QUESTS,C1_RECIPES,C1_RUNES,C1_CORES,C1_GEAR} from './chapter-one-expansion-data.js';
export const c1Clone=v=>JSON.parse(JSON.stringify(v));
export const c1Journey=()=>({revision:10,counts:{},parts:{},kills:{},resources:{},clock:0,refresh:{},seed:3266489917});
export function c1Fresh(){return {schema:6,preparation:c1PrepFresh(),journey:c1Journey(),mainStages:{},questSteps:{},claimLedger:{},crafting:{sequence:0,rngState:1597463007,transactions:{}},merchant:{patrolSequence:0,activePatrol:null},elite:{},samples:{c1PartJaw:false,c1PartTendon:false,c1PartMembrane:false,delivered:false},worldChanges:{},legacyReadinessBypass:false,escrow:[],economy:[],lootSeed:2654435769,materialSeed:2246822519};}
export const c1State=g=>{if(g.c1Expansion)return g.c1Expansion;const h=c1Fresh();
 // New saves get independent seeds without drawing from the combat RNG. Restores
 // and legacy migrations keep their serialized/deterministic seed values.
 if(globalThis.crypto?.getRandomValues){const seeds=crypto.getRandomValues(new Uint32Array(4));h.lootSeed=seeds[0]||1;h.materialSeed=seeds[1]||1;h.crafting.rngState=seeds[2]||1;h.journey.seed=seeds[3]||1;h.preparation.seed=(seeds[0]^seeds[2])>>>0||1;}
 return g.c1Expansion=h;};
const object=v=>v&&typeof v==='object'&&!Array.isArray(v),uint=v=>Number.isInteger(v)&&v>=0&&v<=4294967295;
export function validateC1Save(s){
 const h=s.c1Expansion;if(h===undefined){if(s.version>=16)throw Error('第一章扩充记录缺失，原存档已保留。');return;}
 const exact=(v,keys)=>object(v)&&Object.keys(v).every(k=>keys.includes(k))&&keys.every(k=>k in v);
 const finite=v=>Number.isFinite(v)&&v>=0;
 const allowed=Object.keys(c1Fresh()).filter(k=>(h?.schema!==1||k!=='journey')&&(h?.schema>=6||k!=='preparation'));
 if(!object(h)||![1,2,3,4,5,6].includes(h.schema)||Object.keys(h).some(k=>!allowed.includes(k))||allowed.some(k=>!(k in h)))throw Error('第一章扩充记录格式不正确。');
 if(h.schema>=6)validatePreparation(h.preparation);
 for(const k of ['mainStages','questSteps','claimLedger','crafting','merchant','elite','samples','worldChanges'])if(!object(h[k]))throw Error('第一章记录不完整：'+k);
 if(!uint(h.crafting.rngState)||!h.crafting.rngState||!uint(h.lootSeed)||!h.lootSeed||!uint(h.materialSeed)||!h.materialSeed||!uint(h.crafting.sequence)||!object(h.crafting.transactions)||!uint(h.merchant.patrolSequence)||typeof h.legacyReadinessBypass!=='boolean'||!Array.isArray(h.escrow)||!Array.isArray(h.economy))throw Error('第一章事务或随机记录不正确。');
 if(!exact(h.crafting,['sequence','rngState','transactions'])||!exact(h.merchant,['patrolSequence','activePatrol'])||!exact(h.samples,[...Object.keys(C1_PARTS),'delivered']))throw Error('第一章嵌套记录含未知字段。');
 for(const [id,steps]of Object.entries(h.questSteps))if(!C1_QUESTS[id]||!object(steps)||Object.entries(steps).some(([k,v])=>!['hole','board','sealed','skill','evade','combo','line','target','route','exit','path','attempts','sign','cart','ledger','verified','water','pressure','plank','crossed','entry','observed','previewed','opened','sheltered','name','a','b','leak','weave','plan','intake','exhaust','node','legacyEvidence','injury','bandage','cloth','mud','healthy','branch','transmission','fitted','tested','lampChecked','lampFixed','lampLit','lampWest','lampEast','left','cleared'].includes(k)||(k==='path'?!['cover','detour'].includes(v):k==='attempts'?!uint(v):typeof v!=='boolean')))throw Error('调查步骤格式不正确。');
 const patrol=h.merchant.activePatrol;if(patrol!==null&&(!object(patrol)||Object.keys(patrol).some(k=>!['sequence','route','diagnosed','repaired','verified','walkedAway','repairPosition'].includes(k))||!uint(patrol.sequence)||patrol.sequence!==h.merchant.patrolSequence||![0,1].includes(patrol.route)||['diagnosed','repaired','verified'].some(k=>typeof patrol[k]!=='boolean')||patrol.walkedAway!==undefined&&typeof patrol.walkedAway!=='boolean'||patrol.repairPosition&&(!exact(patrol.repairPosition,['x','y'])||!finite(patrol.repairPosition.x)||!finite(patrol.repairPosition.y))))throw Error('巡检记录不正确。');
 const changes=['wallSealed','lampFixed','morning','envelope','drillDoor','pressure','plank','wrongValve','northDoor','herbGarden','runePattern','leakFixed','kilnIntake','kilnExhaust','kilnBackflow','kilnLadder','samplesSealed','sluice','loomGift'];
 for(const [k,v]of Object.entries(h.worldChanges))if(k.startsWith('patrol-')?!['patrol-road','patrol-mill','patrol-grove','patrol-kiln'].includes(k)||!uint(v):!changes.includes(k)||typeof v!=='boolean')throw Error('场景变更记录不正确。');
 if(h.schema>=2){const j=h.journey;if(!exact(j,['revision','counts','kills','resources','clock','refresh','seed',...(h.schema>=4?['parts']:[])])||j.revision!==(h.schema===2?7:h.schema===3?8:h.schema===4?9:10)||!uint(j.seed)||!j.seed||!finite(j.clock))throw Error('首章任务记录不正确。');
  for(const k of ['counts','kills','resources','refresh'])if(!object(j[k]))throw Error('首章任务记录缺失。');
  if(h.schema>=4){if(!object(j.parts))throw Error('分层目标记录缺失。');for(const [id,parts]of Object.entries(j.parts))if(!(C1_OBJECTIVES[id]?.parts||C1_LEGACY_PARTS[id])||!object(parts)||Object.entries(parts).some(([key,n])=>!(C1_OBJECTIVES[id]?.parts||C1_LEGACY_PARTS[id]).some(p=>p.id===key&&uint(n)&&n<=p.count)))throw Error('分层目标数量不正确。');}
  for(const [id,n]of Object.entries(j.counts))if(!C1_QUESTS[id]||!uint(n)||n>1000)throw Error('任务数量不正确。');
  for(const [id,n]of Object.entries(j.kills))if(!/^[A-Za-z0-9:_-]{1,160}$/.test(id)||!uint(n))throw Error('任务击杀序列不正确。');
  for(const [id,n]of Object.entries(j.refresh))if(!/^[A-Za-z0-9:_-]{1,160}$/.test(id)||!finite(n))throw Error('怪物恢复时间不正确。');
  for(const [map,r]of Object.entries(j.resources))if(!['road','grove'].includes(map)||!exact(r,['present','taken','cycle','next'])||!uint(r.cycle)||!finite(r.next)||!Array.isArray(r.present)||!Array.isArray(r.taken)||[...r.present,...r.taken].some(n=>!Number.isInteger(n)||n<0||n>(h.schema===2?5:9))||new Set(r.present).size!==r.present.length||new Set(r.taken).size!==r.taken.length||r.taken.some(n=>!r.present.includes(n)))throw Error('药草生长记录不正确。');
 }
 const equipment=i=>object(i)&&typeof i.id==='string'&&i.id===i.instanceId&&(C1_GEAR[i.c1Template]||C1_RECIPES[i.c1Template])&&finite(i.atk)&&finite(i.hp)&&(!i.c1Rune||C1_RUNES[i.c1Rune.id]&&Number.isInteger(i.c1Rune.value)&&i.c1Rune.value>=C1_RUNES[i.c1Rune.id].min&&i.c1Rune.value<=C1_RUNES[i.c1Rune.id].max);
 for(const i of [...(s.p?.bag||[]),...Object.values(s.p?.gear||{}),...h.escrow])if(i?.c1Template&&!equipment(i))throw Error('首章装备实例或符文范围不正确。');
 for(const [key,tx]of Object.entries(h.crafting.transactions))if(!/^craft:[1-9][0-9]*$/.test(key)||Number(key.split(':')[1])>h.crafting.sequence||!exact(tx,['id','item','cost'])||!equipment(tx.item)||!exact(tx.cost,['core','rune','gold','coupon'])||!C1_CORES[tx.cost.core]||!C1_RUNES[tx.cost.rune]||![0,6].includes(tx.cost.gold)||typeof tx.cost.coupon!=='boolean')throw Error('制作支付记录不正确。');
 if(Object.keys(h.crafting.transactions).length!==h.crafting.sequence)throw Error('制作序列不连续。');
 for(const e of h.economy)if(!object(e)||typeof e.event!=='string'||!Number.isFinite(e.gold)||!finite(e.balance))throw Error('经济记录不正确。');
 for(const [id,v]of Object.entries(h.mainStages))if(!C1_MAIN.some(q=>q.id===id)||!['active','ready','claimed','waived'].includes(v))throw Error('第一章阶段不正确。');
 for(const [key,tx]of Object.entries(h.claimLedger))if(!object(tx)||Object.keys(tx).some(k=>!['id','status','xp','gold','items','draw','legacy'].includes(k))||tx.legacy!==undefined&&typeof tx.legacy!=='boolean'||tx.draw!==undefined&&![-1,0,1].includes(tx.draw)||Array.isArray(tx.items)&&tx.items.some(i=>typeof i!=='string')||tx.id!==key||tx.status!=='committed'||!Array.isArray(tx.items)||!Number.isFinite(tx.xp)||tx.xp<0||!Number.isFinite(tx.gold)||tx.gold<0)throw Error('第一章结算记录不正确。');
 for(const [id,e]of Object.entries(h.elite))if(!C1_ELITES[id]||!object(e)||Object.keys(e).some(k=>!['killSequence','aliveGeneration','lastKill','outsideActiveSeconds','leftAfterKill','firstPartGranted','lootResult','legacy'].includes(k))||!finite(e.lastKill)||![null,-1,0,1].includes(e.lootResult)||!uint(e.killSequence)||!uint(e.aliveGeneration)||e.aliveGeneration<1||e.legacy!==undefined&&typeof e.legacy!=='boolean'||!Number.isFinite(e.outsideActiveSeconds)||e.outsideActiveSeconds<0||typeof e.firstPartGranted!=='boolean'||typeof e.leftAfterKill!=='boolean')throw Error('精英挑战记录不正确。');
 for(const k of [...Object.keys(C1_PARTS),'delivered'])if(typeof h.samples[k]!=='boolean')throw Error('样本记录不正确。');
 for(const item of h.escrow)if(!object(item)||typeof item.id!=='string'||item.id!==item.instanceId||!Number.isFinite(item.atk)||!Number.isFinite(item.hp))throw Error('待领取装备不正确。');
 for(const [key,tx]of Object.entries(h.crafting.transactions))if(!object(tx)||tx.id!==key||!object(tx.item)||tx.item.instanceId!==tx.item.id||!object(h.claimLedger[key]))throw Error('制作事务不完整。');
}
export function c1Random(g,stream='lootSeed'){
 const h=c1State(g),owner=stream==='crafting'?h.crafting:h,key=stream==='crafting'?'rngState':stream;
 let x=owner[key]>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;owner[key]=x>>>0;return owner[key]/4294967296;
}
export function c1Migrate(g,s){
 if(s.c1Expansion){g.c1Expansion=c1Clone(s.c1Expansion);const h=g.c1Expansion;if(h.schema===1){h.schema=2;h.journey=c1Journey();const counts=h.journey.counts,qs=h.questSteps;
  for(const [id,item,max]of [['oil','oil',1],['letter','letter',1],['herbs','herb',3]])counts[id]=Math.min(max,s.p?.items?.[item]||0);
  if(s.flags?.practiceCopper)counts.copper=2;
  if(qs.c1Readiness)counts.c1Readiness=Math.min(3,['skill','evade','combo'].filter(k=>qs.c1Readiness[k]).length);
  if(qs.c1ExitDrill?.target)counts.c1ExitDrill=1;
  if(qs.v12CourierRoad?.route)counts.v12CourierRoad=4;
  if(qs.c1CanalPrep?.crossed||h.worldChanges.northDoor)counts.c1CanalPrep=4;
  if(qs.c1RuneWear?.weave)counts.c1RuneWear=3;
  if(qs.c1RuneKiln?.node)counts.c1RuneKiln=3;
  if(qs.v12Water?.water)counts.v12Water=1;
  if(qs.lantern?.lampWest&&qs.lantern?.lampEast)counts.lantern=3;
  // Old valid investigation evidence substitutes for the removed puzzle, no reward here.
  if(qs.c1ClockMemory?.name)qs.c1ClockMemory.legacyEvidence=true;
  if(h.merchant.activePatrol?.verified)counts.c1RunePatrol=5;
 }
 if(h.schema<3){
  const oldCounts={rats:6,c1Readiness:3,c1ExitDrill:1,v12CourierRoad:4,c1CanalPrep:4,oil:1,v12Water:1,copper:2,lantern:3,c1RunePatrol:5};
  for(const [id,n]of Object.entries(oldCounts)){const credit=id==='rats'?(s.flags?.rats||0):h.journey.counts[id]||0;
   if(s.quests?.[id]==='active'&&credit>=n&&(id!=='rats'||s.flags?.crack)){h.questSteps[id]||={};h.questSteps[id].legacyEvidence=true;}
  }
  for(const r of Object.values(h.journey.resources))for(const i of [6,7,8,9])if(!r.present.includes(i))r.present.push(i);
  h.schema=3;h.journey.revision=8;
  // Keep previously unlocked paths. No reward is paid by migration.
  if((s.chapter||0)>=3)for(const q of C1_MAIN.filter(q=>q.index<=10))if(!h.mainStages[q.id])h.mainStages[q.id]='waived';
 }
 if(h.schema<4){
  const j=h.journey;j.parts={};
  const oldLimits={c1ExitDrill:8,c1CryptRepair:8,c1VaultWatch:8,c1CampHunt:8,c1TrialSalvage:5,c1CampHerbs:4};
  for(const [id,limit]of Object.entries(oldLimits)){
   const o=C1_OBJECTIVES[id],n=j.counts[id]||0;j.parts[id]={};let left=n;
   for(const p of (o.parts||C1_LEGACY_PARTS[id])){j.parts[id][p.id]=Math.min(left,p.count);left=Math.max(0,left-p.count);}
   const legacyCause=id==='c1ExitDrill'?'c1-trial-warden':o.cause;
   const cause=id==='c1CryptRepair'||!legacyCause||Object.values(s.states||{}).some(st=>st.enemies?.some(e=>e.id===legacyCause&&e.dead))||Object.keys(j.kills).some(key=>key.endsWith(':'+legacyCause)&&j.kills[key]>0);
   if(s.quests?.[id]==='active'&&n>=limit&&cause&&o.kind!=='gather'){h.questSteps[id]||={};h.questSteps[id].legacyEvidence=true;}
  }
  // Evidence stays valid when the ordinary patrol is repopulated on a later entry.
  if(s.flags?.captainDefeated&&s.states?.canal&&!s.states.canal.enemies.some(e=>!e.dead)){h.questSteps.c1CanalBreak||={};h.questSteps.c1CanalBreak.cleared=true;}
  h.schema=4;j.revision=9;
 }
 if(h.schema<5){
  for(const [id,parts]of Object.entries(C1_LEGACY_PARTS)){
   const cause=id!=='c1VaultWatch'||Object.values(s.states||{}).some(st=>st.enemies?.some(e=>e.id==='c1-vault-warden'&&e.dead))||Object.keys(h.journey.kills).some(k=>k.endsWith(':c1-vault-warden')&&h.journey.kills[k]>0);
   if(s.quests?.[id]==='active'&&cause&&parts.every(p=>(h.journey.parts[id]?.[p.id]||0)>=p.count)){h.questSteps[id]||={};h.questSteps[id].legacyEvidence=true;}
  }
  if(s.quests?.c1CryptRepair==='done')h.worldChanges.leakFixed=true;
  h.schema=5;h.journey.revision=10;
 }
 if(h.schema<6){h.preparation=c1PrepFresh();h.preparation.legacy=true;h.preparation.approved=(s.chapter||0)>=2;h.preparation.started=h.preparation.approved;h.preparation.saintSeen=(s.chapter||0)>=1;h.preparation.seed=(h.materialSeed^362436069)>>>0||1;h.schema=6;}
 return;}
 const h=g.c1Expansion=c1Fresh(),phase=s.chapter||0;h.legacyReadinessBypass=phase>=2;Object.assign(h.preparation,{legacy:true,approved:phase>=2,started:phase>=2,saintSeen:phase>=1});
 // Existing facts remain authoritative. Waivers pay nothing and do not pretend completion.
 const past=phase>=5?C1_MAIN:phase>=3?C1_MAIN.filter(q=>q.index<=10):phase>=2?C1_MAIN.filter(q=>q.index<=9):phase>=1?C1_MAIN.slice(0,1):[];
 for(const q of past)h.mainStages[q.id]='waived';
 for(const q of [...C1_MAIN,...C1_SIDE])if(s.quests?.[q.id]==='done'||s.v12?.quests?.[q.id]?.claimed){if(C1_MAIN.includes(q))h.mainStages[q.id]='claimed';h.claimLedger['quest:'+q.id]={id:'quest:'+q.id,status:'committed',xp:0,gold:0,items:[],legacy:true};}
 for(const [flag,id]of [['silverReturned','c1ClockMemory'],['gateXP','c1GateCheck']])if(s.flags?.[flag])h.claimLedger['quest:'+id]={id:'quest:'+id,status:'committed',xp:0,gold:0,items:[],legacy:true};
 if(phase<5&&(s.flags?.echoWardenDefeated||s.flags?.echoCoreFound)){
  h.samples.c1PartTendon=true;h.elite['echo-warden']={killSequence:1,aliveGeneration:1,lastKill:0,outsideActiveSeconds:0,leftAfterKill:false,firstPartGranted:true,lootResult:null,legacy:true};
 }
 const old={oil:['lampChecked','lampFixed','lampLit'],letter:['cloth','mud'],herbs:['healthy','branch'],lantern:['lampWest','lampEast'],copper:['transmission','fitted','tested'],v12Water:['water','injury','bandage']};
 for(const [id,keys]of Object.entries(old))if(s.quests?.[id]==='active'){h.questSteps[id]=Object.fromEntries(keys.map(k=>[k,true]));h.questSteps[id].legacyEvidence=true;}
 if(s.flags?.crack)h.worldChanges.wallSealed=true;
}
export function installC1Save(RPG){
 const P=RPG.prototype,restore=P.restore,snapshot=P.snapshot,claim=P.claimRewards;
 P.restore=function(s){validateC1Save(s);c1Migrate(this,s);const result=restore.call(this,s.version===16?{...s,version:15}:s);this.c1Expansion=c1Clone(this.c1Expansion);return result;};
 P.snapshot=function(){const s=snapshot.call(this);return {...s,version:16,c1Expansion:c1Clone(c1State(this))};};
 P.c1Transaction=function(id,perform){
  const h=c1State(this);if(h.claimLedger[id])return h.claimLedger[id];
  // JS callbacks are synchronous. A save event is observed only after the entire
  // mutation succeeds, so every durable snapshot contains both costs and escrow.
  const before=c1Clone({p:this.p,c1Expansion:h,quests:this.quests,flags:this.flags,pendingRewards:this.pendingRewards});
  try{const value=perform();if(value===false){Object.assign(this,before);return false;}const record={id,status:'committed',xp:0,gold:0,items:[],...value};h.claimLedger[id]=record;this.saveEvent();return record;}
  catch(error){Object.assign(this,before);throw error;}
 };
 P.c1Deliver=function(item){
  const h=c1State(this);if([...this.p.bag,...Object.values(this.p.gear),...h.escrow].some(i=>i?.id===item.id))return false;
  if(this.p.bag.length<60)this.p.bag.push(c1Clone(item));else h.escrow.push(c1Clone(item));return true;
 };
 P.c1Collect=function(){const h=c1State(this);while(h.escrow.length&&this.p.bag.length<60)this.p.bag.push(h.escrow.shift());this.saveEvent();return h.escrow.length;};
 if(claim)P.claimRewards=function(...args){const out=claim.apply(this,args);this.c1Collect();return out;};
}
