import {DIALOGUES,MAPS} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {ROMANCE_EPISODES_V20} from './romance-text-v20.js';
import {installRomanceStagingV20} from './romance-staging-v20.js';

const copy=v=>structuredClone(v),prefix='v20romance:';
const fresh=()=>({schema:1,serial:0,completed:[],active:null});
const state=g=>g.romanceV20||(g.romanceV20=fresh());
const episode=id=>ROMANCE_EPISODES_V20.find(e=>e.id===id);
const atMap=map=>ROMANCE_EPISODES_V20.find(e=>e.map===map);
const thenFor=a=>prefix+a.event+':'+a.part+':'+a.token;
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const city=g=>g.flags.ch5CitySeen&&!g.memoryV13?.active&&g.p.cls!=='saint'&&g.p.hp>0&&MAPS[g.map]?.safe&&!g.enemies.some(e=>!e.dead);
const quiet=g=>city(g)&&g.active&&!g.pending&&!g.transition&&!g.saintStoryV18?.active&&!g.saintStoryV18?.resting&&!g.saintBondV17?.active&&!g.cityStoriesV18?.active&&!g.discoveryBusyV19?.()&&!g.hellExpeditionsV18?.run;

export function validateRomanceSaveV20(save){
 const s=save?.romanceV20;if(s===undefined){if(save.pending?.id?.startsWith('v20Romance'))throw new Error('同行片刻缺少续播记录。');return;}
 const fail=()=>{throw new Error('同行片刻的记录不完整。');};
 if(!plain(s)||s.schema!==1||Object.keys(s).some(k=>!['schema','serial','completed','active'].includes(k))||!Number.isInteger(s.serial)||s.serial<0||s.serial>1000000||!Array.isArray(s.completed)||new Set(s.completed).size!==s.completed.length||s.completed.some(id=>!episode(id))||s.completed.length>ROMANCE_EPISODES_V20.length)fail();
 if(s.serial<s.completed.length+(s.active?1:0))fail();
 const a=s.active;
 if(a===null){if(save.pending?.id?.startsWith('v20Romance'))fail();return;}
 const e=episode(a?.event);
 if(!plain(a)||!e||Object.keys(a).some(k=>!['event','part','token'].includes(k))||s.completed.includes(e.id)||!Number.isInteger(a.part)||a.part<0||a.part>=e.parts.length||!Number.isInteger(a.token)||a.token<1||a.token>s.serial)fail();
 const id=e.parts[a.part];
 if(save.memoryV13||save.pending?.id!==id||save.pending?.then!==thenFor(a)||save.map!==STAGING.scenes[id]?.map||save.saintStoryV18?.active||save.saintStoryV18?.resting)fail();
}

export function installRomanceV20(RPG){
 const P=RPG.prototype;if(P._romanceV20Installed)return;
 installRomanceStagingV20();Object.defineProperty(P,'_romanceV20Installed',{value:true});
 const old={};for(const k of ['restore','snapshot','enter','apply','update','beginPrivateMemory','saintStoryJournalV19'])old[k]=P[k];
 const arm=g=>{const e=atMap(g.map);g._romanceEntryV20=e&&!state(g).completed.includes(e.id)?{map:g.map,event:e.id}:null;};
 P.romanceV20Enabled=function(){return true;};
 P.romancePendingV20=function(){return !!state(this).active||!!this._romanceEntryV20&&this._romanceEntryV20.map===this.map;};
 P.romanceJournalV20=function(){return state(this).completed.map(id=>{const e=episode(id);return {id,title:e.title,place:MAPS[e.map].name};});};
 P.saintStoryJournalV19=function(){const prior=old.saintStoryJournalV19.call(this);return {...prior,memories:[...prior.memories,...this.romanceJournalV20()]};};
 P.playRomancePartV20=function(){
  const a=state(this).active,e=episode(a?.event);if(!e||this.pending)return false;
  const id=e.parts[a.part],stage=STAGING.scenes[id];
  if(this.map!==stage.map){this.enter(stage.map,...MAPS[stage.map].entry);if(this.map!==stage.map)return false;}
  const origin={hero:[this.p.x,this.p.y],saint:[this.saint.x,this.saint.y]};
  this.beginScene(id,thenFor(a));this.pending.sceneOrigin=origin;this.saveEvent();return true;
 };
 P.startRomanceV20=function(id){
  const e=episode(id),s=state(this);if(!quiet(this)||!e||e.map!==this.map||s.active||s.completed.includes(id)||s.serial>=1000000)return false;
  s.serial++;s.active={event:id,part:0,token:s.serial};this._romanceEntryV20=null;return this.playRomancePartV20();
 };
 P.apply=function(action){
  const id=typeof action==='string'?action:action?.id;if(!id?.startsWith(prefix))return old.apply.call(this,action);
  const s=state(this),a=s.active,e=episode(a?.event);if(!e||this.pending||id!==thenFor(a)||!city(this)||this.map!==STAGING.scenes[e.parts[a.part]].map)return false;
  if(a.part+1<e.parts.length){a.part++;return this.playRomancePartV20();}
  // The story adds memories, never a second copy of the earlier bond rewards.
  s.completed.push(e.id);s.active=null;this._romanceEntryV20=null;this.active=true;this.saveEvent();return true;
 };
 P.enter=function(id,x,y){old.enter.call(this,id,x,y);if(this.map===id)arm(this);};
 P.restore=function(saved){validateRomanceSaveV20(saved);old.restore.call(this,saved);this.romanceV20=saved.romanceV20?copy(saved.romanceV20):fresh();arm(this);};
 P.snapshot=function(){return {...old.snapshot.call(this),romanceV20:copy(this.memoryV13?.active?(this.memoryV13.reality.romanceV20||state(this)):state(this))};};
 P.beginPrivateMemory=function(){const s=state(this);if(s.active||this.pending)return false;const ok=old.beginPrivateMemory.call(this);if(ok&&this.memoryV13?.active)this.memoryV13.reality.romanceV20=copy(s);return ok;};
 P.update=function(dt,input){
  old.update.call(this,dt,input);
  if(!Number.isFinite(dt)||dt<=0)return;
  // An entry remains queued through main-story dialogue, menus and doorway
  // cooldown. It is consumed only when the actual optional episode begins.
  const queued=this._romanceEntryV20;
  if(queued&&queued.map===this.map&&this.portCD<=0&&quiet(this))this.startRomanceV20(queued.event);
 };
}
