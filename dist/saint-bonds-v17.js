import {DIALOGUES,MAPS} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {SAINT_BOND_DIALOGUES_V17,SAINT_BOND_PRACTICE_V17} from './saint-bonds-story-v17.js';

const copy=v=>JSON.parse(JSON.stringify(v));
const IDS=['drink','game','practice'];
const places={drink:'ch5Tavern',game:'ch5Arcade',practice:'ch5GrandSquare'};
const seats={drink:{hero:[940,660],saint:[1030,655],ch5Barkeep:[980,750]},game:{hero:[625,620],saint:[745,620],ch5GameHost:[820,690]},practice:{hero:[440,690],saint:[540,690]}};
const fresh=()=>({schema:1,seed:175103221,serial:0,claims:{},runs:{},active:null,milestone:false,lastResult:null});
const state=g=>g.saintBondV17||(g.saintBondV17=fresh());
const random=g=>{const s=state(g);let x=s.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;s.seed=x>>>0;return s.seed/4294967296;};
const shuffle=(g,a)=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(random(g)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const count=g=>IDS.filter(id=>state(g).claims[id]===true).length;
const sync=g=>{if(g.memoryV13?.active||g.p.cls==='saint')return;const completed=IDS.filter(id=>state(g).claims[id]===true);g.p.saintBondV17={schema:1,completed};};
const allowed=g=>!g.memoryV13?.active&&g.p.cls!=='saint'&&g.flags.ch5CitySeen&&g.p.hp>0&&MAPS[g.map]?.safe&&!g.pending&&!g.enemies.some(e=>!e.dead);
const reachable=(g,kind)=>Math.hypot(g.p.x-seats[kind].hero[0],g.p.y-seats[kind].hero[1])<220;
const phase=g=>count(g)===3&&(g.activityCompletionsV17?.()||0)>=2?2:count(g)>0?1:0;
const open=g=>{g.active=false;g.p.moving=false;g.moveTo=null;g.emit('mechanism',{kind:'v17-saint-bond'});};
const play=(g,id,action)=>{if(g.pending)return false;g.beginScene(id,action);return true;};
const token=(a,verb)=>'v17bond:'+verb+':'+a.token;
const cap=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;

function validate(s){
 if(s===undefined)return;
 if(!object(s)||s.schema!==1||!cap(s.seed,4294967295)||!cap(s.serial,1000000)||!object(s.claims)||!object(s.runs)||typeof s.milestone!=='boolean')throw new Error('灯下相处记录不完整。');
 for(const [id,v]of Object.entries(s.claims))if(!IDS.includes(id)||typeof v!=='boolean')throw new Error('灯下相处的完成记录不正确。');
 for(const [id,n]of Object.entries(s.runs))if(!IDS.includes(id)||!cap(n,1000000))throw new Error('灯下相处的次数不正确。');
 if(IDS.some(id=>!!s.claims[id]!==((s.runs[id]||0)>0))||s.milestone&&IDS.some(id=>!s.claims[id]))throw new Error('灯下相处的里程记录不一致。');
 if(s.lastResult!==null&&(!object(s.lastResult)||!IDS.includes(s.lastResult.kind)||typeof s.lastResult.first!=='boolean'))throw new Error('灯下相处的结算记录不正确。');
 const a=s.active;if(a===null)return;if(!object(a))throw new Error('正在进行的相处片段不完整。');
 if(!IDS.includes(a.kind)||!cap(a.token,1000000)||a.token<1||a.token>s.serial||!['intro','cup','topic','ready','playing','pair','feedback','closing','milestone'].includes(a.phase)||!cap(a.tone,2))throw new Error('正在进行的相处片段不完整。');
 const phases={drink:['intro','cup','topic','feedback','closing','milestone'],game:['intro','playing','pair','closing','milestone'],practice:['intro','ready','playing','feedback','closing','milestone']};
 if(!phases[a.kind].includes(a.phase))throw new Error('正在进行的活动步骤不匹配。');
 if(a.kind==='drink'&&(a.cup!==null&&!['wine','flower'].includes(a.cup)||a.topic!==null&&!['quiet','wound'].includes(a.topic)))throw new Error('桌边的饮品记录不正确。');
 if(a.kind==='drink'&&(['feedback','topic','closing','milestone'].includes(a.phase)&&!a.cup||['closing','milestone'].includes(a.phase)&&!a.topic))throw new Error('桌边谈话的选择记录不完整。');
 if(a.kind==='game'){
  if(!Array.isArray(a.deck)||a.deck.length!==6||![0,1,2].every(n=>a.deck.filter(v=>v===n).length===2)||!Array.isArray(a.flipped)||a.flipped.length>2||!Array.isArray(a.matched)||a.matched.length>6||!cap(a.attempts,1000000))throw new Error('筹牌局记录不完整。');
  for(const list of [a.flipped,a.matched])if(new Set(list).size!==list.length||list.some(n=>!cap(n,5)))throw new Error('筹牌位置记录不正确。');
  if(a.matched.length%2||![0,1,2].every(v=>[0,2].includes(a.matched.filter(i=>a.deck[i]===v).length)))throw new Error('筹牌配对记录不正确。');
  if(a.phase==='intro'&&(a.flipped.length||a.matched.length)||a.phase==='playing'&&(a.flipped.length>1||a.flipped.some(i=>a.matched.includes(i)))||a.phase==='pair'&&a.flipped.length!==2||['closing','milestone'].includes(a.phase)&&a.matched.length!==6)throw new Error('筹牌局步骤与牌面不一致。');
 }
 if(a.kind==='practice'&&(!Array.isArray(a.order)||a.order.length!==3||new Set(a.order).size!==3||a.order.some(id=>!SAINT_BOND_PRACTICE_V17[id])||!cap(a.round,3)||!cap(a.misses,1000000)||!Number.isFinite(a.elapsed)||a.elapsed<0||a.elapsed>3))throw new Error('共同练习记录不完整。');
 if(a.kind==='practice'&&(a.phase==='intro'&&a.round!==0||['ready','playing'].includes(a.phase)&&a.round>=3||['closing','milestone'].includes(a.phase)&&a.round!==3))throw new Error('共同练习的轮次与步骤不一致。');
}
export function validateSaintBondSaveV17(save){
 validate(save?.saintBondV17);
 for(const p of [save?.p,save?.ch3?.frozenHero,save?.ch3?.saintBuild,...Object.values(save?.mercenariesV14?.roster||{})].filter(Boolean)){
  const b=p.saintBondV17;if(b===undefined)continue;
  if(!b||b.schema!==1||!Array.isArray(b.completed)||b.completed.length>3||new Set(b.completed).size!==b.completed.length||b.completed.some(id=>!IDS.includes(id))||Object.keys(b).some(k=>!['schema','completed'].includes(k)))throw new Error('人物相处加成记录不正确。');
 }
 const b=save?.p?.saintBondV17;if(b){const completed=IDS.filter(id=>save.saintBondV17?.claims[id]===true);if(b.completed.length!==completed.length||b.completed.some(id=>!completed.includes(id)))throw new Error('人物相处加成与旅程记录不一致。');}
 const a=save?.saintBondV17?.active;if(a&&['intro','feedback','closing','milestone'].includes(a.phase)){
  const pending=save.pending;if(!pending||!pending.id?.startsWith('v17Bond')||typeof pending.then!=='string'||!pending.then.startsWith('v17bond:')||Number(pending.then.split(':')[2])!==a.token)throw new Error('相处谈话的接续记录不完整。');
 }
}

function stage(id,kind){
 const actors=copy(seats[kind]);
 const actorMeta={hero:{renderAs:'hero'},saint:{sprite:0},...(actors.ch5Barkeep?{ch5Barkeep:{sprite:12}}:{}),...(actors.ch5GameHost?{ch5GameHost:{sprite:5}}:{})};
 const scene={map:places[kind],actors,actorMeta,initiallyHidden:[],commitActor:'hero',focus:[(actors.hero[0]+actors.saint[0])/2,actors.hero[1]-40],faceTargets:{hero:'saint',saint:'hero',...(actors.ch5Barkeep?{ch5Barkeep:'hero'}:{}),...(actors.ch5GameHost?{ch5GameHost:'hero'}:{})},beats:[{line:0,moves:[]}]};
 if(id.includes('Intro')){actors.hero[1]+=36;actors.saint[1]+=26;scene.beats=[{line:0,moves:[['hero',seats[kind].hero[0],seats[kind].hero[1],.45],['saint',seats[kind].saint[0],seats[kind].saint[1],.4]]}];}
 if(id==='v17BondDrinkWine'||id==='v17BondDrinkFlower')scene.beats=[{line:0,moves:[['ch5Barkeep',980,710,.5]]},{line:3,moves:[['ch5Barkeep',980,750,.5]]}];
 if(id==='v17BondPracticeGuard')scene.beats=[{line:0,moves:[],cue:'holy_ward'}];
 if(id==='v17BondPracticeStep')scene.beats=[{line:0,moves:[['hero',410,690,.3]]},{line:2,moves:[['hero',440,690,.4]]}];
 if(id==='v17BondPracticeStrike')scene.beats=[{line:0,moves:[],actorMeta:{hero:{attackUntil:.55}}}];
 STAGING.scenes[id]=CHAPTER_STAGING[id]=scene;CINEMATIC_SCENES.add(id);
}
function register(){
 Object.assign(DIALOGUES,copy(SAINT_BOND_DIALOGUES_V17));
 for(const id of Object.keys(SAINT_BOND_DIALOGUES_V17))if(id!=='v17BondMilestone')stage(id,id.includes('Drink')?'drink':id.includes('Game')?'game':'practice');
 // The last completed activity may be any of the three; use a stable scene per place.
 for(const kind of IDS){const id='v17BondMilestone'+kind;DIALOGUES[id]=copy(SAINT_BOND_DIALOGUES_V17.v17BondMilestone);stage(id,kind);}
 delete DIALOGUES.v17BondMilestone;
 const props=[
  {map:'ch5Arcade',prop:{id:'v17-bond-game-table',action:'v17bond:game',label:'和艾莉娅配筹牌',x:685,y:535,interactX:685,interactY:620,art:{sheet:'cityWorld',index:8,w:160,h:112}}},
  {map:'ch5GrandSquare',prop:{id:'v17-bond-practice-mark',action:'v17bond:practice',label:'与艾莉娅共同练习',x:470,y:585,interactX:470,interactY:680,art:{sheet:'cityWorld',index:11,w:65,h:100}}}
 ];
 for(const {map,prop}of props)if(!MAPS[map].props.some(p=>p.id===prop.id))MAPS[map].props.push(prop);
}

export function installSaintBondsV17(RPG){
 register();const P=RPG.prototype,old={};
 for(const k of ['restore','snapshot','useProp','npcOptions','choose','apply','enter'])old[k]=P[k];
 P.saintBondProgressV17=function(){const s=state(this);return {completed:IDS.filter(id=>s.claims[id]),count:count(this),phase:phase(this),active:s.active?copy(s.active):null};};
 P.openSaintBondV17=function(kind){
  if(!allowed(this)||places[kind]!==this.map)return false;
  if(!reachable(this,kind)){this.say(kind==='drink'?'先到靠窗的双人桌旁坐下。':kind==='game'?'筹牌桌在游艺厅中央，先走近一些。':'练习的位置在广场西侧，靠近那面小石标。');return false;}
  const s=state(this);
  if(s.active){if(s.active.kind!==kind){this.say('还有一段相处没有结束。可以回到原处继续，或先收起它。');open(this);return false;}open(this);return true;}
  s.lastResult=null;open(this);return true;
 };
 P.startSaintBondV17=function(kind){
  if(!allowed(this)||places[kind]!==this.map||!reachable(this,kind)||state(this).active)return false;
  const s=state(this);if(s.serial>=1000000)return false;s.serial++;
  const a={kind,token:s.serial,tone:s.claims[kind]?phase(this):0,phase:'intro'};
  if(kind==='drink')Object.assign(a,{cup:null,topic:null});
  if(kind==='game')Object.assign(a,{deck:shuffle(this,[0,0,1,1,2,2]),flipped:[],matched:[],attempts:0});
  if(kind==='practice')Object.assign(a,{order:shuffle(this,['guard','step','strike']),round:0,misses:0,elapsed:0});
  s.active=a;s.lastResult=null;
  return play(this,'v17Bond'+{drink:'Drink',game:'Game',practice:'Practice'}[kind]+'Intro'+a.tone,token(a,'intro'));
 };
 P.finishSaintBondV17=function(a){
  const s=state(this);if(s.active!==a||a.phase!=='closing')return false;
  const first=!s.claims[a.kind];s.claims[a.kind]=true;s.runs[a.kind]=Math.min(1000000,(s.runs[a.kind]||0)+1);sync(this);
  s.lastResult={kind:a.kind,first};
  if(first)this.say('相处渐渐有了默契 · 生命上限 +10，受到伤害减免 +0.5%。本项不会重复增加。');
  else this.say('又一起度过了一小段时间。相处加成已经获得，不会重复增加。');
  if(count(this)===3&&!s.milestone){s.milestone=true;a.phase='milestone';play(this,'v17BondMilestone'+a.kind,token(a,'milestone'));}
  else {s.active=null;open(this);}
  this.saveEvent();return true;
 };
 P.saintBondActionV17=function(action,arg=''){
  if(!allowed(this))return false;
  const s=state(this),a=s.active;
  if(action==='start')return this.startSaintBondV17(arg);
  if(action==='legacy-talk'&&!a&&this.map==='ch5Tavern'&&reachable(this,'drink'))return old.choose.call(this,'v14ch5:saint-table');
  if(action==='suspend'){open(this);return true;}
  if(action==='abandon'){if(a){s.active=null;s.lastResult=null;this.saveEvent();}open(this);return true;}
  if(!a||places[a.kind]!==this.map||!reachable(this,a.kind))return false;
  if(action==='cup'&&a.kind==='drink'&&a.phase==='cup'&&['wine','flower'].includes(arg)){
   a.cup=arg;a.phase='feedback';return play(this,arg==='wine'?'v17BondDrinkWine':'v17BondDrinkFlower',token(a,'cup'));
  }
  if(action==='topic'&&a.kind==='drink'&&a.phase==='topic'&&['quiet','wound'].includes(arg)){
   a.topic=arg;a.phase='closing';return play(this,'v17BondDrink'+(arg==='quiet'?'Quiet':'Wound')+(s.claims.drink?1:0),token(a,'finish'));
  }
  if(action==='flip'&&a.kind==='game'&&a.phase==='playing'){
   const i=Number(arg);if(!cap(i,5)||a.matched.includes(i)||a.flipped.includes(i))return false;
   a.flipped.push(i);
   if(a.flipped.length===2){a.attempts=Math.min(1000000,a.attempts+1);a.phase='pair';if(a.deck[a.flipped[0]]===a.deck[a.flipped[1]])a.matched.push(...a.flipped);}
   this.saveEvent();open(this);return true;
  }
  if(action==='fold'&&a.kind==='game'&&a.phase==='pair'){
   if(a.matched.length===6){a.phase='closing';return play(this,a.attempts<=5?'v17BondGameWin':'v17BondGamePatient',token(a,'finish'));}
   a.flipped=[];a.phase='playing';this.saveEvent();open(this);return true;
  }
  if(action==='practice-ready'&&a.kind==='practice'&&a.phase==='ready'&&a.round<3){a.phase='playing';a.elapsed=0;open(this);return true;}
  if(action==='practice'&&a.kind==='practice'&&a.phase==='playing'&&a.round<3&&['guard','step','strike'].includes(arg)){
   const cue=SAINT_BOND_PRACTICE_V17[a.order[a.round]],at=a.elapsed/3,onTime=at>=cue.window[0]&&at<=cue.window[1],correct=arg===cue.answer&&onTime;
   const failure=arg!==cue.answer?cue.failure:at<cue.window[0]?'v17BondPracticeTooSoon':'v17BondPracticeTooLate';
   if(correct)a.round++;else a.misses=Math.min(1000000,a.misses+1);
   a.phase='feedback';a.elapsed=0;return play(this,correct?cue.success:failure,token(a,'practice'));
  }
  return false;
 };
 P.advanceSaintBondPracticeV17=function(dt){const a=state(this).active;if(!allowed(this)||a?.kind!=='practice'||a.phase!=='playing'||this.map!==places.practice||!Number.isFinite(dt)||dt<0)return false;a.elapsed=(a.elapsed+Math.min(dt,.1))%3;return true;};
 P.useProp=function(id,confirmed){
  if(id==='ch5-tavern-table'&&this.flags.ch5CitySeen){if(!this.ch5?.claims?.tavernTalk)return old.useProp.call(this,id,confirmed);return this.openSaintBondV17('drink');}
  const p=this.props.find(p=>p.id===id);if(p?.action?.startsWith('v17bond:'))return this.openSaintBondV17(p.action.slice(8));
  return old.useProp.call(this,id,confirmed);
 };
 P.npcOptions=function(id){const out=old.npcOptions.call(this,id)||[];
  if(this.flags.ch5CitySeen&&id==='saint'&&Object.values(places).includes(this.map))out.push({label:{ch5Tavern:'去窗边一起歇一会儿。',ch5Arcade:'一起玩一局筹牌？',ch5GrandSquare:'找块空地一起练练。'}[this.map],action:'v17bond:open:'+IDS.find(k=>places[k]===this.map),questState:'daily'});
  return out;
 };
 P.choose=function(action){if(action?.startsWith('v17bond:open:'))return this.openSaintBondV17(action.slice(13));return old.choose.call(this,action);};
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(!id?.startsWith('v17bond:'))return old.apply.call(this,action);
  const [,verb,n]=id.split(':'),a=state(this).active;if(!a||Number(n)!==a.token||places[a.kind]!==this.map)return false;
  if(verb==='intro'&&a.phase==='intro'){a.phase=a.kind==='drink'?'cup':a.kind==='practice'?'ready':'playing';open(this);}
  else if(verb==='cup'&&a.phase==='feedback'&&a.kind==='drink'){a.phase='topic';open(this);}
  else if(verb==='practice'&&a.phase==='feedback'&&a.kind==='practice'){
   if(a.round===3){a.phase='closing';play(this,'v17BondPracticeDone',token(a,'finish'));}
   else {a.phase='ready';open(this);}
  }
  else if(verb==='finish'&&a.phase==='closing')return this.finishSaintBondV17(a);
  else if(verb==='milestone'&&a.phase==='milestone'){state(this).active=null;open(this);}
  else return false;
  this.saveEvent();return true;
 };
 P.restore=function(saved){
  validateSaintBondSaveV17(saved);old.restore.call(this,saved);
  this.saintBondV17=saved.saintBondV17?copy(saved.saintBondV17):fresh();sync(this);
  // Earlier saves have already-instantiated map prop lists; add only our new props.
  for(const map of ['ch5Arcade','ch5GrandSquare'])if(this.states[map])for(const p of MAPS[map].props.filter(p=>p.id.startsWith('v17-bond-')))if(!this.states[map].props.some(v=>v.id===p.id))this.states[map].props.push(copy(p));
 };
 P.snapshot=function(){sync(this);const s=copy(state(this));if(s.active?.kind==='practice'&&s.active.phase==='playing'){s.active.phase='ready';s.active.elapsed=0;}return {...old.snapshot.call(this),saintBondV17:s};};
 P.enter=function(id,x,y){old.enter.call(this,id,x,y);if(this.memoryV13?.active)return;
  if(this.states[this.map])for(const p of MAPS[this.map].props.filter(p=>p.id.startsWith('v17-bond-')))if(!this.states[this.map].props.some(v=>v.id===p.id))this.states[this.map].props.push(copy(p));
 };
}
