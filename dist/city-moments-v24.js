import {MAPS} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CITY_MOMENTS_EPISODES_V24 as EPISODES} from './city-moments-text-v24.js';
import {installCityMomentsStagingV24} from './city-moments-staging-v24.js';
const copy=x=>structuredClone(x),PREFIX='v24moment:';
const fresh=()=>({schema:1,serial:0,completed:[],active:null});
const state=g=>g.cityMomentsV24||(g.cityMomentsV24=fresh());
const episode=id=>EPISODES.find(e=>e.id===id);
const callback=a=>PREFIX+a.event+':'+a.part+':'+a.token;
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const overlap=s=>s.romanceV20?.active||s.arrivalV22?.active||s.saintStoryV18?.active||s.saintStoryV18?.resting||s.saintBondV17?.active||s.cityStoriesV18?.active||s.discoveryV19?.active||s.hellExpeditionsV18?.run;
const inCity=g=>g.flags.ch5CitySeen&&!g.memoryV13?.active&&!g.p.career?.preview&&g.p.cls!=='saint'&&g.p.hp>0&&MAPS[g.map]?.safe&&!g.enemies.some(e=>!e.dead);
const quiet=g=>inCity(g)&&g.active&&!g.pending&&!g.transition&&g.portCD<=0&&!overlap(g)&&!g.discoveryBusyV19?.();
const within=(g,e)=>e.map===g.map&&Math.hypot(g.p.x-e.trigger[0],g.p.y-e.trigger[1])<=e.trigger[2]&&g.clearLine(g.p,{x:e.trigger[0],y:e.trigger[1]},false);
export function validateCityMomentsSaveV24(save){
 const s=save?.cityMomentsV24,p=save?.pending;
 const bad=()=>{throw Error('城中漫步的记录不完整，已保留原始存档。');};
 if(s===undefined){if(p?.id?.startsWith('v24Moment'))bad();return;}
 if(!plain(s)||s.schema!==1||Object.keys(s).some(k=>!['schema','serial','completed','active'].includes(k))||!Number.isInteger(s.serial)||s.serial<0||s.serial>EPISODES.length||!Array.isArray(s.completed)||s.completed.length>EPISODES.length||new Set(s.completed).size!==s.completed.length||s.completed.some(id=>!episode(id))||s.serial!==s.completed.length+(s.active?1:0))bad();
 if(s.active===null){if(p?.id?.startsWith('v24Moment'))bad();return;}
 const a=s.active,e=episode(a?.event);
 if(!plain(a)||!e||Object.keys(a).some(k=>!['event','part','token'].includes(k))||!Number.isInteger(a.part)||a.part<0||a.part>=e.parts.length||!Number.isInteger(a.token)||a.token!==s.serial||s.completed.includes(e.id))bad();
 if(save.memoryV13||overlap(save)||!save.flags?.ch5CitySeen||save.map!==e.map||p?.id!==e.parts[a.part]||p?.then!==callback(a))bad();
}
export function installCityMomentsV24(RPG){
 const P=RPG.prototype;if(P._cityMomentsV24Installed)return;
 installCityMomentsStagingV24();Object.defineProperty(P,'_cityMomentsV24Installed',{value:true});
 const old={};for(const key of ['restore','snapshot','apply','update','beginPrivateMemory','saintStoryJournalV19'])old[key]=P[key];
 P.cityMomentsJournalV24=function(){return state(this).completed.map(id=>{const e=episode(id);return {id:'v24-'+id,title:e.title,place:MAPS[e.map].name,description:e.memento};});};
 P.saintStoryJournalV19=function(){const previous=old.saintStoryJournalV19.call(this);return {...previous,memories:[...previous.memories,...this.cityMomentsJournalV24()]};};
 P.playCityMomentPartV24=function(){
  const a=state(this).active,e=episode(a?.event);if(!e||this.pending||this.map!==e.map)return false;
  const origin={hero:[this.p.x,this.p.y],saint:[this.saint.x,this.saint.y]};
  this.beginScene(e.parts[a.part],callback(a));this.pending.sceneOrigin=origin;this.saveEvent();return true;
 };
 P.startCityMomentV24=function(id){
  const e=episode(id),s=state(this);if(!e||!quiet(this)||!within(this,e)||s.active||s.completed.includes(id)||s.serial>=EPISODES.length)return false;
  s.serial++;s.active={event:id,part:0,token:s.serial};return this.playCityMomentPartV24();
 };
 P.apply=function(action){
  const id=typeof action==='string'?action:action?.id;if(!id?.startsWith(PREFIX))return old.apply.call(this,action);
  const s=state(this),a=s.active,e=episode(a?.event);if(!e||this.pending||!inCity(this)||this.map!==e.map||id!==callback(a))return false;
  if(a.part+1<e.parts.length){a.part++;return this.playCityMomentPartV24();}
  // Only an experienced memory is stored. No coins, gear, tickets, skills or
  // permanent Saint-bond bonuses are copied from other episode reward systems.
  s.completed.push(e.id);s.active=null;this.active=true;this.saveEvent();return true;
 };
 P.restore=function(saved){validateCityMomentsSaveV24(saved);old.restore.call(this,saved);this.cityMomentsV24=saved.cityMomentsV24?copy(saved.cityMomentsV24):fresh();};
 P.snapshot=function(){return {...old.snapshot.call(this),cityMomentsV24:copy(this.memoryV13?.active?(this.memoryV13.reality.cityMomentsV24||fresh()):state(this))};};
 P.beginPrivateMemory=function(){if(state(this).active||this.pending)return false;const s=copy(state(this)),ok=old.beginPrivateMemory.call(this);if(ok&&this.memoryV13?.active)this.memoryV13.reality.cityMomentsV24=s;return ok;};
 P.update=function(dt,input){
  old.update.call(this,dt,input);if(!Number.isFinite(dt)||dt<=0||!quiet(this)||state(this).active)return;
  const e=EPISODES.find(e=>!state(this).completed.includes(e.id)&&within(this,e));if(e)this.startCityMomentV24(e.id);
 };
}
