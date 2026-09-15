import {DIALOGUES,MAPS,QUESTS} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {SAINT_STORY_TEXT_V18,SAINT_STORY_EVENTS_V18} from './saint-story-text-v18.js';

const copy=x=>JSON.parse(JSON.stringify(x));
const EVENTS=SAINT_STORY_EVENTS_V18,ids=EVENTS.map(e=>e.id);
const PREFIX='v18saint:',propPrefix='v18-saint-story-';
const fresh=()=>({schema:2,serial:0,completed:[],choices:{},active:null,rested:[],resting:null});
const state=g=>g.saintStoryV18||(g.saintStoryV18=fresh());
const eventById=id=>EVENTS.find(e=>e.id===id);
const current=g=>eventById(state(g).active?.event);
const dependencies={past:['cups'],care:['past'],morning:['care'],lantern:['workshop']};
const eligible=(s,e)=>!s.completed.includes(e.id)&&(dependencies[e.id]||[]).every(id=>s.completed.includes(id))&&(e.id!=='morning'||s.rested.includes('care'))&&(e.id!=='past'||s.completed.length>=3);
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
const integer=(n,max)=>Number.isInteger(n)&&n>=0&&n<=max;
const city=g=>g.flags.ch5CitySeen&&!g.memoryV13?.active&&g.p.cls!=='saint'&&g.p.hp>0&&!!MAPS[g.map]?.safe&&!g.enemies.some(e=>!e.dead);
const sceneFor=(part,s)=>typeof part==='string'?part:part.variant?part[s.choices[part.variant]]:part.options.find(o=>o.value===s.choices[part.choice])?.scene;
const thenFor=a=>PREFIX+'part:'+a.event+':'+a.part+':'+a.token;
const sceneMap=id=>STAGING.scenes[id]?.map;
const here=(g,e)=>g.map===e.map&&Math.hypot(g.p.x-e.actors.hero[0],g.p.y-e.actors.hero[1])<=230&&g.clearLine(g.p,{x:e.actors.hero[0],y:e.actors.hero[1]},false);
const choiceOptions=(g,e,a)=>e.parts[a.part].options.map(o=>({label:o.label,action:PREFIX+'choose:'+a.token+':'+o.value,questState:'daily'}));
const mapName=id=>MAPS[id]?.name||id;
const restNeeded=s=>s.completed.includes('care')&&!s.rested.includes('care')?'care':null;
const restThen=a=>PREFIX+'rest:'+a.after+':'+a.token;

function milestone(g,key){
 if(!key||g.memoryV13?.active||g.p.cls==='saint')return;
 // Keep the existing V17 maximum. Reading the new narrative never adds a fourth reward.
 const old=g.saintBondV17||(g.saintBondV17={schema:1,seed:175103221,serial:0,claims:{},runs:{},active:null,milestone:false,lastResult:null});
 old.claims[key]=true;old.runs[key]=Math.max(1,old.runs[key]||0);
 const completed=['drink','game','practice'].filter(id=>old.claims[id]===true);
 g.p.saintBondV17={schema:1,completed};
 if(completed.length===3)old.milestone=true;
}

function register(){
 Object.assign(DIALOGUES,copy(SAINT_STORY_TEXT_V18));
 // Retain the old identifier for imported quest histories; no future objective is registered in the live journal.
 QUESTS.ch5V18SaintTime={name:'灯火间的小事',type:'支线',giver:'saint',map:null,desc:'那些已经一起经历过的小事。'};
 for(const event of EVENTS)for(const part of event.parts){
  const scenes=typeof part==='string'?[part]:part.variant?[part.wine,part.flower]:part.options.map(o=>o.scene);
  for(const id of scenes){
   const actors=copy(event.actors),meta={hero:{renderAs:'hero'},saint:{sprite:0}};
   if(event.map==='ch5Tavern'&&['cups','care'].includes(event.id)){actors.ch5Barkeep=[1050,760];meta.ch5Barkeep={sprite:12};}
   const stage={map:event.map,actors,actorMeta:meta,initiallyHidden:[],commitActor:'hero',focus:[(actors.hero[0]+actors.saint[0])/2,actors.hero[1]-50],faceTargets:{hero:'saint',saint:'hero',ch5Barkeep:'saint'},beats:[{line:0,moves:[]}]};
   if(['cards','bread','rain','cups','past'].includes(event.id)){meta.hero.pose='seated';meta.saint.pose='seated';}
   if(id==='v18SaintMarketA')stage.beats=[{line:0,moves:[['hero',850,660,.5],['saint',940,650,.65]]}];
   if(id==='v18SaintRiddleB')stage.beats=[{line:4,moves:[['saint',890,650,.55]]},{line:8,moves:[['saint',940,650,.45]]}];
   if(id==='v18SaintPracticeA')stage.beats=[{line:10,moves:[],cue:'holy_ward'},{line:12,moves:[['hero',440,620,.9],['saint',540,640,.9]]}];
   if(id==='v18SaintPracticeB')stage.beats=[{line:0,moves:[],cue:'holy_ward'},{line:9,moves:[['saint',485,640,.6]]}];
   if(id==='v18SaintRainA')stage.beats=[{line:8,moves:[['hero',485,345,.6]]}];
   if(id==='v18SaintRoofA')stage.faceTargets={hero:'saint',saint:[870,230]};
   if(id==='v18SaintRoofB')stage.beats=[{line:5,moves:[['saint',835,570,.6]]},{line:10,moves:[['saint',870,570,.5]]}];
   if(id==='v18SaintCareA'||id==='v18SaintCareB'){
    stage.map='ch5GuestRooms';stage.actors={hero:[850,580],saint:[940,580],ch5Barkeep:[1080,620]};stage.actorMeta={hero:{renderAs:'hero'},saint:{sprite:0,pose:'seated'},ch5Barkeep:{sprite:12}};stage.focus=[1030,500];
    if(id==='v18SaintCareA')stage.beats=[{line:3,moves:[['hero',890,585,.5]]},{line:6,moves:[['hero',900,590,.5],['saint',915,580,.5]],actorMeta:{hero:{pose:'carry'},saint:{pose:'carried',poseFlip:false}}},{line:7,moves:[['hero',1040,545,1.4],['saint',1055,535,1.4]]},{line:9,moves:[['hero',1020,550,.5],['saint',1100,455,.5]],actorMeta:{hero:{pose:'stand'},saint:{pose:'lying',depthY:531,angle:Math.PI,autoFace:false,poseFlip:true}}},{line:12,moves:[['hero',990,545,.4]]}];
    else {stage.actors={hero:[1020,550],saint:[1100,455],ch5Barkeep:[1160,580]};Object.assign(stage.actorMeta.saint,{pose:'lying',depthY:531,angle:Math.PI,autoFace:false,poseFlip:true});stage.beats=[{line:8,moves:[['hero',800,625,1.1]]},{line:10,moves:[['ch5Barkeep',885,625,.8]]}];}
   }
   if(id==='v18SaintMorningA'){stage.actorMeta.saint.pose='seated';stage.initiallyHidden=['hero'];stage.beats=[{line:3,moves:[['saint',940,580,.55],['hero',850,580,.5]],actorMeta:{saint:{pose:'stand'}}}];}
   if(id==='v18SaintLanternA')stage.beats=[{line:8,moves:[['hero',1040,800,.5],['saint',1120,800,.5]]},{line:11,moves:[],cue:'holy_ward'}];
   if(id==='v18SaintLanternB')stage.beats=[{line:14,moves:[],actorMeta:{hero:{pose:'seated'},saint:{pose:'seated'}}}];
   STAGING.scenes[id]=CHAPTER_STAGING[id]=stage;CINEMATIC_SCENES.add(id);
  }
 }
 const restScenes={bread:[['旁白','两人各自回到客房。楼下的曲子渐渐停了，走廊里只剩瑟琳娜收好水壶的轻响。'],['旁白','一夜过去，窗外的灯换成偏白的光。艾莉娅已经收好东西，和诺恩约在广场的石标旁碰面。']],care:[['旁白','诺恩回到自己的房间，放下行囊。客房走廊渐渐安静，床边留着的水杯一夜未动。'],['旁白','等窗外的灯色转白，楼下重新传来杯盘声。诺恩先起身收拾行李，在门外等艾莉娅醒来。']]};
 for(const [after,text]of Object.entries(restScenes)){const id='v18SaintRest'+after;DIALOGUES[id]=text;const stage={map:'ch5GuestRooms',actors:{hero:[850,580]},actorMeta:{hero:{renderAs:'hero'}},initiallyHidden:[],commitActor:'hero',focus:[900,470],faceTargets:{hero:[850,400]},beats:[{line:0,moves:[]}]};STAGING.scenes[id]=CHAPTER_STAGING[id]=stage;CINEMATIC_SCENES.add(id);}

}

export function validateSaintStorySaveV18(save){
 const s=save?.saintStoryV18;if(s===undefined)return;
 const fail=()=>{throw new Error('灯火间的相处记录不完整。');};
 if(!plain(s)||![1,2].includes(s.schema)||!integer(s.serial,1000000)||!Array.isArray(s.completed)||s.completed.length>ids.length||new Set(s.completed).size!==s.completed.length||s.completed.some(id=>!ids.includes(id))||!plain(s.choices)||Object.keys(s).some(k=>!['schema','serial','completed','choices','active','rested','resting'].includes(k)))fail();
 // V18 imported rows are the original prefix; V19 records are an order of encounters, not an index into a route.
 if(s.schema===1&&s.completed.some((id,i)=>id!==ids[i]))fail();
 if(!Array.isArray(s.rested)||s.rested.length>2||new Set(s.rested).size!==s.rested.length||s.rested.some(id=>!['bread','care'].includes(id)||!s.completed.includes(id)))fail();
 if(s.schema===1&&(s.completed.length>4&&!s.rested.includes('bread')||s.completed.length>10&&!s.rested.includes('care')))fail();
 for(const id of s.completed)if((dependencies[id]||[]).some(k=>!s.completed.includes(k))||id==='morning'&&!s.rested.includes('care'))fail();
 if(Object.entries(s.choices).some(([k,v])=>k==='card'?!['left','right'].includes(v):k==='drink'?!['wine','flower'].includes(v):true))fail();
 for(const [key,id]of [['card','cards'],['drink','cups']]){
  if(s.completed.includes(id)&&s.choices[key]===undefined)fail();
  if(s.choices[key]!==undefined&&!s.completed.includes(id)&&s.active?.event!==id)fail();
 }
 const a=s.active;
 if(s.serial<s.completed.length+s.rested.length+(a?1:0)+(s.resting?1:0))fail();
 if(s.resting!==null){
  const r=s.resting;if(!plain(r)||Object.keys(r).some(k=>!['after','token'].includes(k))||!['bread','care'].includes(r.after)||!s.completed.includes(r.after)||s.rested.includes(r.after)||!integer(r.token,s.serial)||r.token<1||a!==null||save.pending?.id!=='v18SaintRest'+r.after||save.pending?.then!==restThen(r)||save.map!=='ch5GuestRooms')fail();return;
 }
 if(a===null){if(save.pending?.id?.startsWith('v18Saint'))fail();return;}
 const e=eventById(a?.event);
 if(!plain(a)||!e||s.completed.includes(e.id)||!integer(a.part,e.parts.length-1)||!integer(a.token,s.serial)||a.token<1||!['scene','choice'].includes(a.phase)||Object.keys(a).some(k=>!['event','part','token','phase','scene'].includes(k))||(dependencies[e.id]||[]).some(k=>!s.completed.includes(k))||e.id==='morning'&&!s.rested.includes('care'))fail();
 if(s.schema===1&&e.id!==ids[s.completed.length])fail();
 const part=e.parts[a.part];
 for(const [i,p]of e.parts.entries())if(typeof p!=='string'&&p.choice&&(a.part<i&&s.choices[p.choice]!==undefined||a.part>i&&s.choices[p.choice]===undefined))fail();
 if(a.phase==='choice'){
  if(typeof part==='string'||!part.choice||s.choices[part.choice]!==undefined||a.scene!==null||save.pending?.id?.startsWith('v18Saint'))fail();
 }else{
  const id=sceneFor(part,s);if(!id||a.scene!==id||save.pending?.id!==id||save.pending?.then!==thenFor(a)||save.map!==sceneMap(id))fail();
 }
}

export function installSaintStoryV18(RPG,{stats}){
 const P=RPG.prototype;if(P._saintStoryV18Installed)return;register();Object.defineProperty(P,'_saintStoryV18Installed',{value:true});
 const old={};for(const k of ['restore','snapshot','enter','useProp','choose','npcOptions','apply','questPropNeeded','openSaintBondV17','beginPrivateMemory','questGoal','trackedGoal','journalEntries','syncJournal','update'])old[k]=P[k];
 const retired=p=>p.id?.startsWith(propPrefix)||p.id?.startsWith('v17-bond-');
 // Imported map states retain their independent loot and NPC state; only the retired story invitation objects disappear.
 const cleanInvitations=g=>{
  for(const map of Object.values(MAPS))map.props=map.props.filter(p=>!retired(p));
  for(const st of Object.values(g.states||{}))st.props=st.props.filter(p=>!retired(p));
  delete g.quests.ch5V18SaintTime;if(g.flags.tracked==='ch5V18SaintTime'){g.flags.tracked=null;g.flags.mapGoal=null;}
 };
 const anchors=g=>{
  const s=state(g),active=current(g);
  const story=(s.active? s.active.phase==='choice'&&active?[active]:[] :s.resting?[]:EVENTS.filter(e=>!g.romanceV20Enabled?.()&&eligible(s,e))).map(e=>({id:'saint:'+e.id,event:e.id,map:e.map,x:e.actors.hero[0],y:e.actors.hero[1],radius:105,exitRadius:155,priority:100+EVENTS.length-EVENTS.indexOf(e),type:'saint'}));
  if(s.active||s.resting)return story;
  return [...story,...(g.discoveryCandidatesV19?.()||[]).map(e=>({...e,id:'discovery:'+e.id,discovery:e.id,radius:e.radius||105,exitRadius:e.exitRadius||155,priority:e.priority??50,type:'discovery'}))];
 };
 const quiet=g=>city(g)&&!g.romancePendingV20?.()&&g.active&&!g.pending&&!g.transition&&!g.saintBondV17?.active&&!g.cityStoriesV18?.active&&!g.discoveryBusyV19?.()&&!g.hellExpeditionsV18?.run&&!g.p.career?.preview;
 const markPosition=g=>{g._encounterWalkV19={map:g.map,x:g.p.x,y:g.p.y,entered:new Set(anchors(g).filter(e=>e.map===g.map&&e.event!=='morning'&&Math.hypot(e.x-g.p.x,e.y-g.p.y)<=e.radius).map(e=>e.id))};};
 P.saintStoryProgressV18=function(){const s=state(this);return {completed:[...s.completed],next:null,active:copy(s.active),timeOfDay:this.saintStoryTimeV18()};};
 P.saintStoryJournalV19=function(){const s=state(this),e=current(this);return {memories:s.completed.map(id=>({id,title:eventById(id).title,place:mapName(eventById(id).map)})),unfinished:s.active?.phase==='choice'&&e?{id:e.id,title:e.title,map:e.map,place:mapName(e.map),text:'刚才的话还没说完。'}:null};};
 P.saintStoryTimeV18=function(){const s=state(this);return s.rested.includes('care')&&!s.completed.includes('morning')?'morning':s.completed.includes('cups')?'night':'evening';};
 P.questGoal=function(id){if(id!=='ch5V18SaintTime')return old.questGoal.call(this,id);return {text:'一起经历的小事留在手记里。',map:null,completed:true,type:'旅途回忆'};};
 P.trackedGoal=function(){if(this.flags.tracked==='ch5V18SaintTime'){this.flags.tracked=null;this.flags.mapGoal=null;}return old.trackedGoal.call(this);};
 P.journalEntries=function(history=false){return old.journalEntries.call(this,history).filter(e=>e.id!=='ch5V18SaintTime');};
 P.syncJournal=function(){if(this.quests)delete this.quests.ch5V18SaintTime;return old.syncJournal.call(this);};
 P.restSaintStoryV18=function(){
  const s=state(this),after=restNeeded(s);if(!city(this)||this.pending||this.transition||s.active||s.resting||this.saintBondV17?.active||this.discoveryBusyV19?.()||!after||this.map!=='ch5GuestRooms'||Math.hypot(this.p.x-1100,this.p.y-600)>180||s.serial>=1000000)return false;
  s.serial++;s.resting={after,token:s.serial};this.beginScene('v18SaintRest'+after,restThen(s.resting));return true;
 };
 P.startSaintEncounterV19=function(id){
  const s=state(this),e=eventById(id);if(!quiet(this)||!e||!here(this,e))return false;
  if(s.active?.phase==='choice'&&s.active.event===id)return this.saintStoryResumeV18();
  if(s.active||s.resting||!eligible(s,e)||s.serial>=1000000)return false;
  s.serial++;s.active={event:e.id,part:0,token:s.serial,phase:'scene',scene:null};return this.playSaintStoryPartV18();
 };
 // Legacy invitation calls may resume an existing choice. They no longer reveal or start an undiscovered story.
 P.saintStoryResumeV18=function(){
  const s=state(this),e=current(this);if(!city(this)||this.pending||this.transition||this.saintBondV17?.active||!e||s.active?.phase!=='choice'||!here(this,e))return false;
  this.active=false;this.p.moving=false;this.moveTo=null;this.emit('npc',{id:'saint'});return true;
 };
 P.playSaintStoryPartV18=function(){
  const s=state(this),a=s.active,e=current(this);if(!a||!e||this.pending)return false;
  const part=e.parts[a.part];
  if(typeof part!=='string'&&part.choice&&s.choices[part.choice]===undefined){a.phase='choice';a.scene=null;this.active=false;this.emit('npc',{id:'saint'});this.saveEvent();return true;}
  const id=sceneFor(part,s);if(!id)return false;a.phase='scene';a.scene=id;
  const stage=STAGING.scenes[id];if(this.map!==stage.map){const pos=stage.actors.hero;this.enter(stage.map,pos[0],pos[1]);if(this.map!==stage.map)return false;}
  const origin=a.part===0?{hero:[this.p.x,this.p.y],saint:[this.saint.x,this.saint.y]}:null;
  this.beginScene(id,thenFor(a));if(origin)this.pending.sceneOrigin=origin;return true;
 };
 P.npcOptions=function(id){
  let out=old.npcOptions.call(this,id)||[];if(id!=='saint'||!city(this)||this.saintBondV17?.active)return out;
  out=out.filter(o=>!o.action?.startsWith('v17bond:open:')&&o.action!=='v14ch5:saint-table'&&!o.action?.startsWith(PREFIX+'open'));
  const s=state(this),e=current(this);if(s.active?.phase==='choice'&&e&&here(this,e))return choiceOptions(this,e,s.active);
  return out;
 };
 P.choose=function(action){
  if(!action?.startsWith(PREFIX))return old.choose.call(this,action);
  if(action===PREFIX+'open')return this.saintStoryResumeV18();
  if(action.startsWith(PREFIX+'choose:')){
   const pieces=action.split(':'),s=state(this),a=s.active,e=current(this);if(pieces.length!==4)return false;const [,verb,t,value]=pieces;
   if(!city(this)||this.pending||this.transition||!a||a.phase!=='choice'||Number(t)!==a.token||!e||!here(this,e))return false;
   const part=e.parts[a.part];if(!part.options?.some(o=>o.value===value)||s.choices[part.choice]!==undefined)return false;
   s.choices[part.choice]=value;return this.playSaintStoryPartV18();
  }return false;
 };
 P.apply=function(action){
  const id=typeof action==='string'?action:action?.id;if(!id?.startsWith(PREFIX))return old.apply.call(this,action);
  const s=state(this),a=s.active,e=current(this);
  if(s.resting&&id===restThen(s.resting)&&!this.pending&&city(this)&&this.map==='ch5GuestRooms'){s.rested.push(s.resting.after);s.resting=null;const full=stats(this.p);this.p.hp=full.hp;this.p.mp=full.mp;this.active=true;markPosition(this);this.saveEvent();return true;}
  if(!a||!e||a.phase!=='scene'||id!==thenFor(a)||this.pending||!city(this)||this.map!==sceneMap(a.scene))return false;
  if(a.part+1<e.parts.length){a.part++;return this.playSaintStoryPartV18();}
  s.completed.push(e.id);s.active=null;milestone(this,e.milestone);this.active=true;markPosition(this);this.saveEvent();return true;
 };
 P.useProp=function(id,confirmed){
  if(id==='v18-city-guest-bed'&&restNeeded(state(this)))return this.restSaintStoryV18();
  if(id.startsWith(propPrefix))return false;
  return old.useProp.call(this,id,confirmed);
 };
 P.openSaintBondV17=function(kind){if(this.saintBondV17?.active)return old.openSaintBondV17.call(this,kind);return this.saintStoryResumeV18();};
 P.beginPrivateMemory=function(){const s=state(this);if(s.active||s.resting||this.pending)return false;const ok=old.beginPrivateMemory.call(this);if(ok&&this.memoryV13?.active)this.memoryV13.reality.saintStoryV18=copy(s);return ok;};
 P.questPropNeeded=function(id){if(id.startsWith(propPrefix)||id.startsWith('v17-bond-'))return false;return old.questPropNeeded?.call(this,id);};
 P.enter=function(id,x,y){old.enter.call(this,id,x,y);cleanInvitations(this);markPosition(this);if(MAPS[this.map]?.safe&&this.map.startsWith('ch5')&&this.p.cls!=='saint'&&!this.memoryV13?.active)this.saint.visible=true;};
 P.restore=function(saved){validateSaintStorySaveV18(saved);old.restore.call(this,saved);this.saintStoryV18=saved.saintStoryV18?{...copy(saved.saintStoryV18),schema:2}:fresh();cleanInvitations(this);markPosition(this);};
 P.snapshot=function(){return {...old.snapshot.call(this),saintStoryV18:copy(state(this))};};
 P.maybeEncounterV19=function(before,dt){
  const walk=this._encounterWalkV19;if(!walk||walk.map!==this.map||before.map!==this.map){markPosition(this);return false;}
  const moved=Math.hypot(this.p.x-before.x,this.p.y-before.y),jump=Math.hypot(before.x-walk.x,before.y-walk.y);
  if(jump>28||moved>Math.max(28,dt*850)){markPosition(this);return false;}
  if(this.portCD>0||moved<.15){walk.x=this.p.x;walk.y=this.p.y;return false;}
  const candidates=anchors(this).filter(e=>e.map===this.map),crossed=[];
  for(const e of candidates){const d=Math.hypot(e.x-this.p.x,e.y-this.p.y);if(d>e.exitRadius)walk.entered.delete(e.id);if(d<=e.radius&&!walk.entered.has(e.id)&&this.clearLine(this.p,{x:e.x,y:e.y},false)){walk.entered.add(e.id);crossed.push({...e,d});}}
  walk.x=this.p.x;walk.y=this.p.y;
  if(!before.active||!quiet(this)||this.portCD>0||moved<.15||this.p.dash>0||!crossed.length)return false;
  // A single arbiter owns both authored Saint scenes and incidental discoveries; no same-frame queue.
  crossed.sort((a,b)=>a.d-b.d||b.priority-a.priority||a.id.localeCompare(b.id));
  for(const e of crossed){const ok=e.type==='saint'?this.startSaintEncounterV19(e.event):this.beginDiscoveryV19?.(e.discovery);if(ok){markPosition(this);return true;}}
  return false;
 };
 P.update=function(dt,input){const before={map:this.map,x:this.p.x,y:this.p.y,active:this.active};old.update.call(this,dt,input);if(Number.isFinite(dt)&&dt>0)this.maybeEncounterV19(before,dt);};
}
