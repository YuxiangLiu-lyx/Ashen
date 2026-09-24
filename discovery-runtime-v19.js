import {DIALOGUES,MAPS,ITEMS} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {createGear} from './equipment-v14.js';
import {DISCOVERY_TEXT_V19,DISCOVERIES_V19} from './discovery-text-v19.js';

const copy=v=>JSON.parse(JSON.stringify(v)),PREFIX='v19discovery:',PROP='v19-discovery-parcel-';
const IDS=DISCOVERIES_V19.map(e=>e.id),MAP_IDS=[...new Set(DISCOVERIES_V19.map(e=>e.map))];
const event=id=>DISCOVERIES_V19.find(e=>e.id===id),plain=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const int=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max,keys=(o,a)=>Object.keys(o).every(k=>a.includes(k));
const fresh=g=>({schema:1,seed:Math.min(4294967295,Math.floor(Math.max(0,Math.min(.9999999999,g.rng()))*4294967296)),serial:0,visits:Object.fromEntries(MAP_IDS.map(m=>[m,0])),jobs:Object.fromEntries(IDS.map(id=>[id,{step:0,returnAfter:0,roll:null,claimed:false}])),active:null});
const state=g=>g.discoveryV19||(g.discoveryV19=fresh(g));
const city=g=>!!g.flags.ch5CitySeen&&g.p.cls!=='saint'&&!g.p.career?.preview&&!g.memoryV13?.active&&g.p.hp>0&&MAPS[g.map]?.safe&&!g.enemies.some(e=>!e.dead);
const competing=g=>!!(g.pending||g.transition||g.cityStoriesV18?.active||g.saintStoryV18?.active||g.saintStoryV18?.resting||g.saintBondV17?.active||g.saintEncountersV19?.active||g.saintEncountersV19?.resting);
const near=(g,e,r=130)=>g.map===e.map&&Math.hypot(g.p.x-e.x,g.p.y-e.y)<=r&&g.clearLine(g.p,{x:e.x,y:e.y},false);
const then=a=>PREFIX+'done:'+a.token;
function roll(seed,id){let h=(seed^2166136261)>>>0;for(const c of id)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;h^=h>>>16;return (h>>>0)%3;}
function units(g){return [...g.p.bag,...Object.values(g.p.gear||{}),...(g.pendingRewards||[]),...Object.values(g.mercenariesV14?.roster||{}).flatMap(a=>Object.values(a.gear||{}))].filter(Boolean);}
function parcel(g,id){
 const q=state(g).jobs[id],base={gold:0,items:{},book:null,gear:null};
 if(id==='tune')base.book='tetherBook';
 if(id==='forge')base.gear=createGear(g.p.cls,18,()=>.42,{id:'quest-v19-discovery-forge-hands',slot:'hands',rarity:'rare',name:'细针缝合的护手',affix:null});
 if(id==='market')base.items.hpLarge=2;
 if(id==='water')base.book='frostBook';
 if(id==='basket'){base.items.hpLarge=1;base.items.mpLarge=1;}
 if(id==='bell')base.gold=35;
 const add=(k,n)=>base.items[k]=(base.items[k]||0)+n;
 if(q.roll===0){add('mpLarge',1);add('ch5LampCore',1);}else if(q.roll===1){add('hpLarge',1);base.gold+=18;}else add('ch5GoldSand',2);
 if(base.book){if(g.knowsOrHolds(base.book)){add('mpLarge',1);base.gold+=12;}else add(base.book,1);}
 if(base.gear&&units(g).some(v=>v.id===base.gear.id)){base.gear=null;add('ch5LampCore',2);}
 return base;
}
function syncProps(g){
 for(const e of DISCOVERIES_V19){const st=g.states[e.map];if(!st)continue;const q=state(g).jobs[e.id];st.props=st.props.filter(p=>p.id!==PROP+e.id);if(!g.memoryV13?.active&&q.step===e.scenes.length&&!q.claimed)st.props.push({id:PROP+e.id,action:PREFIX+'claim:'+e.id,label:e.label,x:e.prop[0],y:e.prop[1]-40,interactX:e.prop[0],interactY:e.prop[1],art:{sheet:'details',index:9,w:48,h:38},hp:999,used:false,broken:false});}
}
function register(){
 Object.assign(DIALOGUES,copy(DISCOVERY_TEXT_V19));
 const speakers={'诺恩':'hero','艾莉娅':'saint','乐师':'ch5SquareMusician','格蕾娜':'ch5Smith','赛芙':'ch5Recruiter','弥娅':'ch5Alchemist','瑟琳娜':'ch5Barkeep','卖饼人':'v18-bread-vendor','修钟匠':'v19Clockwright'};
 for(const e of DISCOVERIES_V19)for(const id of e.scenes){
  const actorMeta={hero:{renderAs:'hero'},saint:{sprite:0},ch5SquareMusician:{sprite:4},ch5Smith:{sprite:11},ch5Recruiter:{sprite:1},ch5Alchemist:{sprite:5},ch5Barkeep:{sprite:6},'v18-bread-vendor':{sprite:5},v19Clockwright:{sprite:3}};
  const target=Object.keys(e.actors).find(k=>k!=='hero'&&k!=='saint');
  const s={map:e.map,actors:copy(e.actors),actorMeta,initiallyHidden:[],commitActor:'hero',focus:[e.x,e.y-60],speaker_actor_per_line:Object.fromEntries(DISCOVERY_TEXT_V19[id].map((row,i)=>[i,speakers[row[0]]]).filter(([,v])=>v)),faceTargets:{hero:target,saint:target,[target]:'hero'},beats:copy(e.moves[id]||[])};
  STAGING.scenes[id]=CHAPTER_STAGING[id]=s;CINEMATIC_SCENES.add(id);
 }
}
export function getDiscoveryCandidatesV19(g){
 if(!city(g)||competing(g)||state(g).active)return [];
 const s=state(g);return DISCOVERIES_V19.filter(e=>{const q=s.jobs[e.id];return e.map===g.map&&q.step<e.scenes.length&&(q.step===0||s.visits[e.map]>=q.returnAfter);}).map(e=>({id:e.id,map:e.map,x:e.x,y:e.y,radius:e.radius,exitRadius:e.radius+55,priority:50}));
}
export function beginDiscoveryV19(g,id){
 const e=event(id);if(!e||!city(g)||competing(g)||state(g).active||!near(g,e,e.radius+8))return false;
 const s=state(g),q=s.jobs[id];if(q.step>=e.scenes.length||q.step>0&&s.visits[e.map]<q.returnAfter||s.serial>=1000000)return false;
 if(q.roll===null)q.roll=roll(s.seed,id);
 const safeSaint=g.saint?.visible&&Math.hypot(g.saint.x-g.p.x,g.saint.y-g.p.y)<180&&!g.blocked(g.saint.x,g.saint.y)&&g.clearLine(g.p,g.saint,false)?g.saint:g.safePoint(g.p.x+70,g.p.y+30);
 const origin={hero:[g.p.x,g.p.y],saint:[safeSaint.x,safeSaint.y]};
 s.serial++;s.active={id,step:q.step,scene:e.scenes[q.step],token:s.serial};g.beginScene(s.active.scene,then(s.active));g.pending.sceneOrigin=origin;return true;
}
export function claimDiscoveryV19(g,id){
 const e=event(id);if(!e||!city(g)||g.pending||state(g).active||!near(g,{...e,x:e.prop[0],y:e.prop[1]},140))return false;
 const q=state(g).jobs[id];if(q.step!==e.scenes.length||q.claimed)return false;
 const p=parcel(g,id);
 if(p.gear&&g.p.bag.length>=60||Object.entries(p.items).some(([k,n])=>(g.p.items[k]||0)+n>100000)||g.p.gold+p.gold>10000000){syncProps(g);g.say('这份东西先替你留在原处。整理好行囊，再来收起。');return false;}
 // Commit the claim before any notifications. All resources are preflighted as
 // one parcel; inventory-full cannot pay gold now and reroll an item later.
 q.claimed=true;if(p.gear)g.p.bag.push(copy(p.gear));g.p.gold+=p.gold;for(const [k,n]of Object.entries(p.items))g.p.items[k]=(g.p.items[k]||0)+n;
 syncProps(g);if(p.gear)g.say('收好 '+p.gear.name+' · 尚未装备');for(const [k,n]of Object.entries(p.items))g.say('收好 '+ITEMS[k].name+' ×'+n);if(p.gold)g.say('收好金币 ×'+p.gold);
 g.emit('discovery-claimed',{id});g.saveEvent();return true;
}
export function validateDiscoverySaveV19(save){
 const s=save?.discoveryV19,ownPending=save?.pending?.id?.startsWith('v19Discovery');
 const fail=()=>{throw new Error('阙灯城偶遇记录不完整。');};
 if(s===undefined){if(ownPending)fail();return true;}
 if(!plain(s)||s.schema!==1||!int(s.seed,4294967295)||!int(s.serial,1000000)||!plain(s.visits)||!keys(s.visits,MAP_IDS)||Object.keys(s.visits).length!==MAP_IDS.length||Object.values(s.visits).some(v=>!int(v,1000000))||!plain(s.jobs)||!keys(s.jobs,IDS)||Object.keys(s.jobs).length!==IDS.length||!keys(s,['schema','seed','serial','visits','jobs','active']))fail();
 for(const e of DISCOVERIES_V19){const q=s.jobs[e.id];if(!plain(q)||!keys(q,['step','returnAfter','roll','claimed'])||!int(q.step,e.scenes.length)||!int(q.returnAfter,1000000)||typeof q.claimed!=='boolean'||q.claimed&&q.step!==e.scenes.length||q.step>0&&q.roll!==roll(s.seed,e.id)||q.roll!==null&&q.roll!==roll(s.seed,e.id)||q.step===0&&q.returnAfter!==0||e.scenes.length===1&&q.returnAfter!==0||e.scenes.length>1&&q.step>0&&(q.returnAfter<1||q.returnAfter>s.visits[e.map]+1)||q.step===e.scenes.length&&e.scenes.length>1&&s.visits[e.map]<q.returnAfter)fail();if(q.step===0&&q.roll!==null&&s.active?.id!==e.id)fail();}
 if(s.serial!==Object.values(s.jobs).reduce((n,q)=>n+q.step,0)+(s.active===null?0:1))fail();
 const a=s.active;if(a===null){if(ownPending)fail();return true;}
 const e=event(a?.id),q=s.jobs[a?.id];
 if(!plain(a)||!keys(a,['id','step','scene','token'])||!e||!q||a.step!==q.step||q.roll===null||q.step>=e.scenes.length||a.scene!==e.scenes[a.step]||a.token!==s.serial||a.token<1||save.map!==e.map||save.pending?.id!==a.scene||save.pending?.then!==then(a)||save.memoryV13||a.step>0&&s.visits[e.map]<q.returnAfter)fail();
 if(save.pending.lines&&JSON.stringify(save.pending.lines)!==JSON.stringify(DISCOVERY_TEXT_V19[a.scene]))fail();return true;
}
export function installDiscoveryV19(RPG){
 const P=RPG.prototype;if(P._discoveryV19Installed)return;P._discoveryV19Installed=true;register();
 const old={};for(const k of ['restore','snapshot','enter','apply','useProp','beginPrivateMemory'])old[k]=P[k];
 P.discoveryCandidatesV19=function(){return getDiscoveryCandidatesV19(this);};
 P.discoveryBusyV19=function(){return !!state(this).active;};
 P.beginDiscoveryV19=function(id){return beginDiscoveryV19(this,id);};
 P.claimDiscoveryV19=function(id){return claimDiscoveryV19(this,id);};
 P.restore=function(saved){validateDiscoverySaveV19(saved);old.restore.call(this,saved);this.discoveryV19=saved.discoveryV19?copy(saved.discoveryV19):fresh(this);syncProps(this);};
 P.snapshot=function(){return {...old.snapshot.call(this),discoveryV19:copy(this.memoryV13?.active?(this.memoryV13.reality.discoveryV19||state(this)):state(this))};};
 P.enter=function(id,x,y){const before=this.map;old.enter.call(this,id,x,y);if(!this.memoryV13?.active&&this.p.cls!=='saint'&&this.flags.ch5CitySeen&&this.map===id&&before!==id&&MAP_IDS.includes(id)){const s=state(this);s.visits[id]=Math.min(1000000,s.visits[id]+1);}syncProps(this);};
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(!id?.startsWith(PREFIX+'done:'))return old.apply.call(this,action);const s=state(this),a=s.active,e=event(a?.id);if(!a||id!==then(a)||this.pending||!city(this)||this.map!==e.map||s.jobs[a.id].step!==a.step)return false;
  const q=s.jobs[a.id];q.step++;s.active=null;if(q.step<e.scenes.length)q.returnAfter=Math.min(1000000,s.visits[e.map]+1);syncProps(this);
  if(q.step===e.scenes.length){const [px,py]=e.prop;if(Math.hypot(this.p.x-px,this.p.y-py)<=140)claimDiscoveryV19(this,e.id);}
  this.emit('discovery-completed',{id:e.id,step:q.step});this.saveEvent();return true;
 };
 P.useProp=function(id,confirmed){if(!id?.startsWith(PROP))return old.useProp.call(this,id,confirmed);return claimDiscoveryV19(this,id.slice(PROP.length));};
 P.beginPrivateMemory=function(){const s=state(this);if(s.active||this.pending)return false;const ok=old.beginPrivateMemory.call(this);if(ok&&this.memoryV13?.active)this.memoryV13.reality.discoveryV19=copy(s);return ok;};
}
