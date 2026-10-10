import {C1_DIALOGUES} from './ch1-script-v31.js';
import {C1_CHAPEL as L,C1_MAPS} from './ch1-layout-v31.js';
const copy=v=>structuredClone(v),d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const c1State=g=>g.flags?.c1Pilot;
export const c1Active=g=>!!c1State(g)&&!c1State(g).handedOff;
export const c1Fighting=g=>c1Active(g)&&g.map==='chapel'&&c1State(g).fight?.status==='active';
const fresh=()=>({revision:1,adopted:'V01C01/0.2',commits:{},entered:{},inspected:{},history:[],failures:0,sealCharges:0});
const commit=(g,key)=>{const s=c1State(g);if(s.commits[key])return false;s.commits[key]=true;return true;};
const fact=(g,who,key)=>{const list=g.knowledge[who]||=[];if(!list.includes(key))list.push(key);};
const legacy={intro:'c1Intro',ratDone:'c1RatDone',contract:'c1Contract',saintBrief:'c1Morning',watch:'c1Watch',courierAccept:'c1CourierAccept',courierDone:'c1CourierDone',canalStart:'c1Canal',chapterEnd:'c1RoadTerms'};
const sceneMap={c1Intro:'hall',c1RatDone:'hall',c1Contract:'hall',c1Receipt:'hall',c1Morning:'chapel',c1Murder:'chapel',c1Rescue:'chapel',c1Confront:'chapel',c1Seal:'chapel',c1Alley:'alley',c1AlleyCry:'alley',c1Canal:'canal',c1Bandage:'canal',c1RoadTerms:'c1Approach',c1Cloak:'c1Approach',c1Station:'c1Station'};
export function migrateC1Save(saved){
 if(saved.flags?.c1Pilot||saved.chapter>=5||saved.flags?.chapterOneComplete||saved.p?.cls==='saint'||saved.memoryV13?.active||saved.p?.career?.preview)return saved;
 // Only real first-chapter progress, never unrelated synthetic later-scene fixtures.
 if(!['hall','guestroom','warehouse','road','town','chapel','alley','canal','grove','millpath','echo','workshop'].includes(saved.map))return saved;
 if(saved.pending&&!Object.hasOwn(legacy,saved.pending.id)&&saved.pending.id!=='assassination')return saved;
 const out=copy(saved),s=out.flags.c1Pilot=fresh(),phase=Number(out.chapter)||0;
 s.migratedFrom={version:out.version,chapter:phase,scene:out.pending?.id||null,line:out.pending?.line||0};
 if(phase>=2){s.commits.contract=true;s.sealCharges=1;s.commits.c1Contract=true;s.commits.c1Receipt=true;}
 if(out.flags.cityIntro)s.commits.c1Morning=true;
 const p=out.pending;
 if(p?.id==='assassination'){
  const line=p.line||0;
  if(line>=4){s.commits.murder=true;out.flags.assassination=true;}
  if(line>=10){s.fight={status:'won',legacy:true};out.pending={id:'c1Seal',then:'c1:finish:c1Seal',line:0};}
  else out.pending={id:line>=4?'c1Rescue':'c1Murder',then:'c1:finish:'+(line>=4?'c1Rescue':'c1Murder'),line:0};
  s.inspected={rack:true,latch:true};
 }else if(p&&legacy[p.id])out.pending={id:legacy[p.id],then:'c1:finish:'+legacy[p.id],line:0};
 if(phase>=3){s.commits.murder=true;s.commits.seal=true;s.sealCharges=0;s.sealed=true;s.custody=true;s.fight={status:'won',legacy:true};}
 if(phase>=4)s.commits.captain=true;
 // An early legacy flag meant only "scene started". It never proves murder or seal.
 if(!s.commits.murder)delete out.flags.assassination;
 if(out.map==='chapel'&&phase===2&&!out.pending){out.p.x=800;out.p.y=890;}
 if(p?.id==='chapterEnd'){out.map='c1Approach';out.states.c1Approach={enemies:[],props:[],visited:true};out.p.x=780;out.p.y=650;s.commits.escape=true;}
 return out;
}
export function installC1Runtime(RPG,{MAPS,DIALOGUES,QUESTS,ITEMS,stats}){
 Object.assign(DIALOGUES,C1_DIALOGUES);
 Object.assign(ITEMS,{c1Medicine:{name:'米拉配好的药',desc:'送到南街蕾娜家。',category:'quest'},c1Seal:{name:'封术印片',desc:'护身回路失衡时近身使用；只限制主动圣术。',category:'quest'},c1Receipt:{name:'双印接应回执',desc:'灰石驿站核验用。右边缺角，内侧一道细线。',category:'quest'}});
 QUESTS.c1Pilot={name:'午钟之前',type:'主线',map:'hall',desc:'核对任务材料，刺杀卡德兰；活着带走艾莉娅，抵达灰石驿站。'};
 const P=RPG.prototype,old={};for(const key of ['startNew','beginScene','finishScene','apply','enter','npcOptions','choose','objective','canDoor','requestDoor','useProp','targets','interact','damage','hurt','update','updateCompanion','canSave','saveBlockReason','restore','snapshot','requestDeparture','confirmDeparture'])old[key]=P[key];
 P.startNew=function(){this.flags.c1Pilot=fresh();this.quests.c1Pilot='active';this.active=true;this.emit('toast',{text:'先在会馆走走。走近奥伦，或到议事桌见薇蕾娜。'});this.saveEvent();};
 P.beginC1=function(id){if(!C1_DIALOGUES[id])throw Error('Unknown chapter one scene '+id);return this.beginScene(id,'c1:finish:'+id);};
 P.beginScene=function(id,then){
  if(c1Active(this)){
   if(id==='assassination')return; // Entering the chapel only permits reconnaissance.
   if(id==='aside')return this.beginC1('c1Receipt');
   if(legacy[id])return this.beginC1(legacy[id]);
   if(id==='c1Murder'){c1State(this).entered.murder=true;}
  }
  return old.beginScene.call(this,id,then);
 };
 P.c1CommitMurder=function(){if(!c1Active(this)||!commit(this,'murder'))return;this.flags.assassination=true;fact(this,'hero','c1-kadran-killed');fact(this,'saint','c1-kadran-killed');fact(this,'player','c1-kadran-killed');this.saveEvent();};
 P.c1Line=function(id,index){
  if(!c1Active(this))return;
  const s=c1State(this);s.cursor={id,index};
  if(id==='c1Murder'&&index>=3)this.c1CommitMurder();
  const row=C1_DIALOGUES[id]?.[index];if(row&&!s.history.some(v=>v.id===id&&v.index===index))s.history.push({id,index});
 };
 P.finishScene=function(){const id=this.pending?.id;if(c1Active(this)&&C1_DIALOGUES[id]){
   for(let i=0;i<C1_DIALOGUES[id].length;i++)this.c1Line(id,i);
   this.pending=null;this.active=true;this.apply('c1:finish:'+id);this.saveEvent();return;
  }return old.finishScene.call(this);};
 P.apply=function(action){
  const a=typeof action==='string'?action:action?.id,s=c1State(this);
  if(!c1Active(this))return old.apply.call(this,action);
  if(a==='assassinate'||a==='end')return; // Legacy callbacks cannot bypass the encounter.
  if(a==='ratsDone'){
   if(this.ready('rats'))this.complete('rats');return;
  }
  if(!a?.startsWith('c1:finish:'))return old.apply.call(this,action);
  const id=a.slice(10);if(!C1_DIALOGUES[id]||!commit(this,id))return;
  switch(id){
   case 'c1RatDone':if(this.ready('rats'))this.complete('rats');break;
   case 'c1Contract':
    if(commit(this,'contract')){this.chapter=2;this.flags.pass=true;this.quests.contract='active';s.sealCharges=1;this.p.items.c1Seal=1;this.p.items.c1Receipt=1;this.gainXP(15);this.addItem('mp',1);}break;
   case 'c1Watch':this.flags.gateTalk=true;if(!this.flags.gateXP){this.flags.gateXP=true;this.gainXP(20);}break;
   case 'c1CourierDone':old.apply.call(this,'letterDone');break;
   case 'c1Murder':this.c1CommitMurder();this.beginC1('c1Rescue');break;
   case 'c1Rescue':s.rescueFailed=true;this.beginC1('c1Confront');break;
   case 'c1Confront':this.startC1Fight();break;
   case 'c1Seal':
    if(!s.fight||s.fight.status!=='won'){delete s.commits[id];return;}
    if(commit(this,'seal')){s.sealCharges=0;this.p.items.c1Seal=0;s.sealed=true;s.custody=true;this.chapter=3;this.quests.contract='done';this.quests.escape='active';this.gainXP(65);for(const who of ['hero','saint'])fact(this,who,'saint-specific-seal');}
    this.states.chapel.enemies=this.enemies.filter(e=>!e.c1Ward);this.bullets=[];this.zones=[];this.relocate(1110,535);this.saint={x:1055,y:540,visible:true,moving:false};break;
   case 'c1Captured':this.active=false;this.emit('c1-captured');break;
   case 'c1Canal':
    if(!this.flags.captainStarted){this.flags.captainStarted=true;const e=this.enemy('captain',1080,520,'captain');e.c1Detain=true;this.enemies.push(e);}
    s.canalCheckpoint=copy(this.p);break;
   case 'c1Bandage':s.bandaged=true;break;
   case 'c1RoadTerms':this.beginC1('c1Cloak');break;
   case 'c1Cloak':s.cloak=true;break;
   case 'c1Station':
    s.letter='writing';s.stationVerified=true;this.beginC1('c1ShadowOld');break;
   case 'c1ShadowOld':this.beginC1('c1ShadowWoman');break;
   case 'c1ShadowWoman':this.beginC1('c1ShadowYoung');break;
   case 'c1ShadowYoung':this.beginC1('c1End');break;
   case 'c1End':
    if(commit(this,'chapter')){s.complete=true;this.flags.chapterOneComplete=true;this.quests.c1Pilot='done';this.quests.escape='done';if(!this.flags.legacyV6Completed){this.gainXP(100);this.p.gold+=45;}}
    this.saint={x:1030,y:735,visible:true,moving:false};this.emit('toast',{text:'第一章完成。圣女仍被封术；后屋的信尚未领取。可保存、休整或继续。'});break;
   case 'c1Dossier':fact(this,'hero','c1-local-dossier');fact(this,'player','c1-local-dossier');break;
   case 'c1Missing':fact(this,'hero','c1-missing-record');fact(this,'player','c1-missing-record');break;
   case 'c1HerbDelivery':if(this.ready('herbs')&&!s.medicineGiven){s.medicineGiven=true;this.p.items.herb-=3;this.p.items.c1Medicine=1;}break;
   case 'c1MedicineGiven':this.p.items.c1Medicine=0;s.medicineDelivered=true;break;
   case 'c1ReturnReward':if(s.medicineDelivered&&this.quests.herbs!=='done'){this.complete('herbs');this.flags.herbChoice='mira';this.addItem('hp',3);}break;
  }
  this.saveEvent();
 };
 P.handleC1Entry=function(id){
  if(!c1Active(this)||!C1_MAPS.includes(id))return false;
  const s=c1State(this);s.entered[id]=true;
  if(id==='town'&&s.commits.contract&&!s.commits.c1Morning)this.beginC1('c1Morning');
  if(id==='alley'&&s.sealed&&!s.commits.c1Alley)this.beginC1('c1Alley');
  if(id==='canal'&&s.sealed&&!s.commits.c1Canal){
   // First-chapter pursuit uses one real officer, not six unrelated random guards.
   this.states.canal.enemies=this.enemies.filter(e=>e.dead);this.beginC1('c1Canal');
  }
  if(id==='c1Approach'&&!s.commits.c1RoadTerms)this.beginC1('c1RoadTerms');
  if(id==='c1Station'&&!s.stationVerified)this.beginC1('c1Station');
  return true;
 };
 P.enter=function(id,...args){const s=c1State(this),from=this.map;
  if(c1Active(this)&&id==='road'&&from==='hall'&&s.commits.contract&&!s.commits.c1Receipt){s.departAfterReceipt=true;this.beginC1('c1Receipt');return;}
  return old.enter.call(this,id,...args);
 };
 P.npcOptions=function(id){if(!c1Active(this))return old.npcOptions.call(this,id);const s=c1State(this),opt=(label,action)=>({label,action,questState:'advance'});
  if(id==='sister'&&!s.commits.contract)return [opt('核对画像、封术印和撤离安排','c1:contract')];
  if(id==='steward'&&!s.commits.c1Intro)return [opt('奥伦在炉边招呼你','c1:intro'),...old.npcOptions.call(this,id)];
  if(id==='saint')return [opt(s.sealed?'她还在看出口。':'她正在照护民众。','c1:saint')];
  if(id==='prelate')return [opt('观察长桌与主通道','c1:observe')];
  if(id==='c1-attendant')return [opt('把铜件放到器具架','c1:recon')];
  if(id==='seline'&&this.map==='c1Station')return [opt('核验通行纸','c1:station'),opt('借床铺休整 · 20 金','c1:rest')];
  let options=old.npcOptions.call(this,id);
  if(id==='herbalist'){
   options=options.filter(o=>o.action!=='herbsMira');
   if(this.ready('herbs')&&!s.medicineGiven)options.unshift(opt('先替米拉送现成的药，再取报酬','c1:medicine'));
   if(s.medicineDelivered&&this.quests.herbs!=='done')options.unshift(opt('药送到了，领取报酬','c1:medicineReward'));
  }
  if(id==='woman'&&this.p.items.c1Medicine)options.unshift(opt('把米拉配好的药交给蕾娜','c1:medicineDeliver'));
  if(id==='dolly'&&!s.commits.murder)options.unshift(opt('这件裙子有人订了？','c1:dolly'));
  return options;
 };
 P.choose=function(a){if(!c1Active(this)||!a.startsWith('c1:'))return old.choose.call(this,a);
  const s=c1State(this),key=a.slice(3),ids={intro:'c1Intro',contract:'c1Contract',dolly:'c1Dolly',recon:'c1Recon',medicine:'c1HerbDelivery',medicineDeliver:'c1MedicineGiven',medicineReward:'c1ReturnReward'};
  if(ids[key]){if(key==='contract'&&s.commits.contract)return;if(key==='recon')s.inspected.rack=true;this.beginC1(ids[key]);return;}
  if(key==='station'){if(!s.stationVerified)this.beginC1('c1Station');else this.say('后屋的灰蜡信尚未领取。');return;}
  if(key==='saint'){this.beginScene('_c1Saint',null);this.pending.lines=[['艾莉娅',s.sealed?'我没有答应你。把封印解开。':'请让开过道，医师还要进来。']];return;}
  if(key==='observe')return this.useProp('c1-commit');
  if(key==='rest'){if(this.p.gold<20){this.say('床铺要二十金。炉边的热水可以自取。');return;}this.p.gold-=20;this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;this.beginC1('c1Rest');return;}
 };
 P.objective=function(){if(!c1Active(this))return old.objective.call(this);const s=c1State(this),goal=(text,map,target)=>({text,map,target});
  if(!s.commits.contract)return goal('到议事桌核对行动安排 · 库房教学可选','hall','sister');
  if(!this.flags.gateTalk)return goal('持通行纸前往白榆圣堂','town','watch');
  if(!s.commits.murder)return goal(s.inspected.rack&&s.inspected.latch?'走到长桌东南角，确认行动':'送铜件，检查东准备室和后门门闩','chapel',s.inspected.rack?'c1-latch':'c1-rack');
  if(!s.sealed){const f=s.fight;return goal(f?.window>0?'术式失衡：靠近艾莉娅，按 F 使用封术印':'打断两侧护身回路 · 躲开预警光环与光带','chapel',f?.window>0?'c1-seal':this.enemies.find(e=>e.c1Ward&&!e.dead)?.id);}
  if(!s.commits.escape)return goal(s.commits.captain?'转动东岸绞盘，打开北闸':'沿东后门、小巷前往北门水渠','canal',s.commits.captain?'c1-winch':'captain');
  if(!s.cloak)return goal('沿驿道前行，回望城门','c1Approach','c1-lookback');
  if(!s.complete)return goal('到灰石驿站消息桌核验通行纸','c1Station','c1-station-desk');
  return goal('第一章完成 · 保存休整，准备好后去后屋领信','c1Station','inn');
 };
 P.canDoor=function(door){if(!c1Active(this))return old.canDoor.call(this,door);const s=c1State(this);
  if(c1Fighting(this))return '护身回路挡住退路。先打断术式并近身封印。';
  if(this.map==='chapel'){
   if(door.to==='town')return s.commits.murder?'巡卫正在南门疏散旁观者，退路在东准备室。':null;
   if(door.to==='alley')return s.sealed?null:'行动前只检查门闩，别从后门离开。';
  }
  if(this.map==='town'&&door.to==='chapel')return s.commits.murder?'圣堂仍封锁，医师从侧廊进出。':this.flags.gateTalk?null:'先让托马核验通行纸。';
  if(s.sealed&&!s.commits.escape&&this.map==='alley'&&['town','chapel'].includes(door.to))return '巡卫在街口呼喊圣女的名字。转入东边通水渠的侧巷。';
  if(this.map==='alley'&&door.to==='canal'&&s.sealed&&!s.cartMoved)return '空推车卡在侧缝前。先挪开它。';
  if(this.map==='canal'){
   if(door.to==='alley'&&!s.commits.escape)return '追兵封住小巷入口，先过北闸。';
   if(door.to==='end')return s.commits.escape?null:'北闸尚未升起，绞盘在东岸。';
  }
  if(this.map==='c1Approach')return null;
  if(this.map==='post'&&door.to==='inn')return !s.complete?'先到前厅的消息桌核验通行纸。':null;
  if(this.map==='post'&&door.to==='bridge')return '后屋的信还没领。先问清下一段路。';
  if(this.map==='c1Station'&&door.to==='inn')return s.complete?null:'先在消息桌核验身份。';
  return old.canDoor.call(this,door);
 };
 P.requestDoor=function(door,automatic=false){if(!c1Active(this))return old.requestDoor.call(this,door,automatic);const s=c1State(this),why=this.canDoor(door);if(why){this.say(why);return false;}
  if(this.map==='canal'&&door.to==='end'){this.enter('c1Approach',230,690);return true;}
  if((this.map==='c1Station'||this.map==='post')&&door.to==='inn'&&s.complete){s.handedOff=true;this.chapter=6;this.flags.postArrival=true;this.quests.relay='active';this.enter('inn',800,850);return true;}
  if(this.map==='c1Approach'&&door.to==='road'&&!s.commits.c1Return){this.beginC1('c1Return');return false;}
  if(C1_MAPS.includes(door.to)){this.enter(door.to,door.tx,door.ty);return true;}
  return old.requestDoor.call(this,door,automatic);
 };
 P.requestDeparture=function(){if(!c1Active(this))return old.requestDeparture.call(this);const door=MAPS.canal.doors.find(v=>v.to==='end');return this.requestDoor(door);};
 P.confirmDeparture=function(){if(c1Active(this))return this.requestDeparture();return old.confirmDeparture.call(this);};
 P.useProp=function(id,...args){if(!c1Active(this)||!id.startsWith('c1-'))return old.useProp.call(this,id,...args);const s=c1State(this),p=this.props.find(v=>v.id===id);
  if(!p||!this.active||this.pending||d(p,this.p)>135)return false;
  const ids={'c1-dossier':'c1Dossier','c1-paper':'c1Pass','c1-route':'c1Route','c1-relief':'c1Supply','c1-missing':'c1Missing','c1-care':'c1CareRoom','c1-rack':'c1Recon','c1-latch':'c1Latch'};
  if(ids[id]){if(id==='c1-rack')s.inspected.rack=true;if(id==='c1-latch')s.inspected.latch=true;this.beginC1(ids[id]);return true;}
  if(id==='c1-commit'){
   if(s.commits.murder)return false;
   if(!s.inspected.rack||!s.inspected.latch){this.say('先把铜件送到东准备室，检查后门门闩。');return false;}
   this.emit('c1-confirm');this.active=false;return true;
  }
  if(id==='c1-cart'){s.cartMoved=true;this.beginC1('c1Cart');return true;}
  if(id==='c1-winch'){
   if(!s.commits.captain){this.beginC1('c1GateClosed');return false;}
   if(commit(this,'escape')){this.chapter=4;this.flags.departureReady=true;s.gateLift=0;this.emit('sfx',{name:'door'});this.beginC1('c1Bandage');}return true;
  }
  if(id==='c1-foyer'){this.enter('c1Station',800,870);return true;}
  if(id==='c1-station-desk'){if(!s.stationVerified)this.beginC1('c1Station');return true;}
  if(id==='c1-station-rest')return this.choose('c1:rest');
  if(id==='c1-save'){this.manualSave();this.say('旅人手记已保存。');return true;}
  if(id==='c1-lookback'&&!s.commits.c1RoadTerms)return this.beginC1('c1RoadTerms');
  if(id==='c1-hide')return this.beginC1('c1Return');
 };
 P.confirmC1Action=function(){if(!c1Active(this)||this.map!=='chapel'||c1State(this).commits.murder||!c1State(this).inspected.latch||!c1State(this).inspected.rack)return false;this.beginC1('c1Murder');return true;};
 P.targets=function(){let list=old.targets.call(this);if(!c1Active(this))return list;
  if(c1Fighting(this))return c1State(this).fight.window>0?[{id:'c1-seal',kind:'c1-seal',name:'近身使用封术印',x:this.saint.x,y:this.saint.y}]:[];
  return list;
 };
 P.interact=function(target){if(c1Fighting(this)){
   const s=c1State(this);if(this.active&&s.fight.window>0&&d(this.p,this.saint)<=100&&this.clearLine(this.p,this.saint,false)){s.fight.status='won';this.bullets=[];this.zones=[];this.beginC1('c1Seal');return true;}
   this.say('打断两侧回路，在光消退时近身使用封术印。');return false;
  }return old.interact.call(this,target);};
 function wards(g,hp=72){
  g.states.chapel.enemies=g.states.chapel.enemies.filter(e=>!e.c1Ward);
  for(const [i,at]of [L.wardWest,L.wardEast].entries()){
   const e=g.enemy('guard',...at,'c1-ward-'+i);Object.assign(e,{c1Ward:true,hp,maxHP:72,stun:999,aiState:'IDLE',label:'护身回路',bleed:0,bleedTime:0,burn:0,respawn:0});g.enemies.push(e);
  }
 }
 P.startC1Fight=function(){const s=c1State(this);if(!s?.commits.murder||s.sealed)return false;
  s.fight={status:'active',elapsed:0,cycle:0,window:0,warning:null,hits:0,casts:0};s.retryPlayer=copy(this.p);
  this.relocate(...L.fightHero);Object.assign(this.saint,{x:L.fightSaint[0],y:L.fightSaint[1],visible:true,moving:false,sealed:false});wards(this);this.active=true;this.bullets=[];this.zones=[];this.emit('c1-fight');this.saveEvent();return true;
 };
 P.retryC1Fight=function(){const s=c1State(this);if(!s?.retryPlayer||s.sealed||s.fight?.status!=='captured')return false;
  this.p=copy(s.retryPlayer);delete s.commits.c1Captured;this.pending=null;this.startC1Fight();return true;
 };
 P.damage=function(e,n,kind='hit'){
  if(c1Active(this)&&(e===this.saint||e?.id==='saint'))return false;
  if(c1Active(this)&&e?.c1Ward){
   if(!c1Fighting(this)||this._mercenaryContext||e.dead||!Number.isFinite(n)||n<=0||!['hit','skill','ch3skill'].includes(kind))return false;
   const f=c1State(this).fight;if(f.elapsed%5<1.5){this.text('护身',e.x,e.y-65,'#dfcda1');return false;}
   e.hp=Math.max(0,e.hp-Math.min(18,n));this.text('术式 −'+Math.min(18,Math.round(n)),e.x,e.y-65,'#f2d89c');this.effect('sparks',e.x,e.y-40,30,'#edcb8f',.25);
   if(e.hp===0){e.dead=true;e.stun=0;this.target=null;}
   return true;
  }
  if(c1Active(this)&&this.map==='canal'&&e?.id==='captain'){
   const before=e.hp,was=e.dead,result=old.damage.call(this,e,n,kind);
   if(!was&&e.dead){const s=c1State(this);s.commits.captain=true;s.officerWounded=true;e.c1Incapacitated=true;this.chapter=4;}
   if(before>e.hp)c1State(this).canalDamage=(c1State(this).canalDamage||0)+(before-e.hp);
   return result;
  }return old.damage.call(this,e,n,kind);
 };
 P.hurt=function(n){
  if(!c1Fighting(this))return old.hurt.call(this,n);
  if(!this.active||this.p.invuln>0||!Number.isFinite(n)||n<=0)return false;
  const f=c1State(this).fight;f.hits++;
  if(this.p.hp-this.p.shield<=n||f.hits>=5){const s=c1State(this);s.failures++;f.status='captured';this.p.hp=Math.max(1,this.p.hp);this.pending=null;this.bullets=[];this.zones=[];this.beginC1('c1Captured');return false;}
  return old.hurt.call(this,n);
 };
 P.updateCompanion=function(dt){
  if(!c1Active(this))return old.updateCompanion.call(this,dt);const s=c1State(this);
  if(c1Fighting(this)){Object.assign(this.saint,{x:L.fightSaint[0],y:L.fightSaint[1],visible:true,moving:false});return;}
  if(!s.sealed){this.saint.visible=false;return;}
  if(this.map==='canal'&&!s.commits.captain){Object.assign(this.saint,{x:620,y:550,visible:true,moving:false});return;}
  if(this.map==='c1Station'){Object.assign(this.saint,{x:1030,y:735,visible:true,moving:false});return;}
  this.saint.visible=true;this.saint.sealed=true;this.saint.cloak=s.cloak;this.saint.moving=false;
  if(d(this.saint,this.p)>110){const dir=this.pathDirection(this.saint,this.p);this.moveActor(this.saint,this.saint.x+dir.x*190*dt,this.saint.y+dir.y*190*dt);this.saint.angle=Math.atan2(dir.y,dir.x);}
 };
 P.update=function(dt,input){const s=c1State(this);if(!c1Active(this))return old.update.call(this,dt,input);
  const fighting=c1Fighting(this);
  if(fighting)for(const e of this.enemies.filter(e=>e.c1Ward)){e.stun=999;e.bleed=0;e.bleedTime=0;e.careerBleed=0;e.burn=0;e.burnTime=0;e.wind=0;e.action=null;e.telegraph=null;}
  const result=old.update.call(this,dt,input);
  if(!this.active||this.pending)return result;
  if(s.departAfterReceipt&&s.commits.c1Receipt){delete s.departAfterReceipt;this.enter('road',230,550);return result;}
  if(this.map==='hall'&&!s.commits.c1Intro&&d(this.p,{x:600,y:500})<115){this.beginC1('c1Intro');return result;}
  if(this.map==='alley'&&s.sealed&&this.p.x>940&&!s.commits.c1AlleyCry){this.beginC1('c1AlleyCry');return result;}
  if(s.commits.escape)s.gateLift=Math.min(1,(s.gateLift||0)+dt*.5);
  if(fighting&&c1Fighting(this)){
   const f=s.fight;f.elapsed+=dt;
   if(f.window>0){f.window=Math.max(0,f.window-dt);if(!f.window){wards(this,36);this.say('回路重新收拢。再打断一次，靠近使用印片。');}return result;}
   if(this.enemies.filter(e=>e.c1Ward).every(e=>e.dead)){f.window=9;f.warning=null;this.say('术式失衡 · 靠近艾莉娅，按 F 或触屏交互使用封术印');return result;}
   const cycle=Math.floor(f.elapsed/5),phase=f.elapsed%5;
   if(cycle!==f.cycle||!f.warning&&phase<1.5){f.cycle=cycle;f.casts++;f.warning={kind:cycle%2?'band':'ring',x:this.p.x,y:this.p.y,until:(cycle*5)+1.5};
    if(f.casts===1)this.say('艾莉娅：离他们远一点！');if(f.casts===2)this.say('艾莉娅：把刀放下。医师要过来。');}
   if(f.warning&&f.elapsed>=f.warning.until){const w=f.warning,hit=w.kind==='ring'?d(this.p,w)<100:Math.abs(this.p.x-w.x)<65&&this.p.y>450;
    f.warning=null;if(hit)this.hurt(Math.max(10,Math.round(stats(this.p).hp*.18)));this.effect('frost',w.x,w.y,100,'#e8d7ad',.5);
   }
  }return result;
 };
 P.canSave=function(){if(c1Active(this)&&(C1_DIALOGUES[this.pending?.id]||c1Fighting(this)||c1State(this).fight?.status==='captured'))return true;return old.canSave.call(this);};
 P.saveBlockReason=function(){if(c1Active(this)&&this.canSave())return '';return old.saveBlockReason.call(this);};
 P.restore=function(saved){const migrated=migrateC1Save(saved),result=old.restore.call(this,migrated);
  if(c1Active(this)){
   const s=c1State(this);for(const id of C1_MAPS)if(this.states[id])this.ensureMap(id);
   // Saved object use/quest flags stay intact; only invalid feet are moved.
   if(this.states[this.map]&&this.blocked(this.p.x,this.p.y))this.relocate(this.p.x,this.p.y);
   if(s.sealed){this.p.items.c1Seal=0;s.sealCharges=0;}
   if(s.fight?.status==='active'&&this.map==='chapel'&&!this.enemies.some(e=>e.c1Ward))wards(this);
  }return result;
 };
 P.snapshot=function(){const out=old.snapshot.call(this);return out;};
}
