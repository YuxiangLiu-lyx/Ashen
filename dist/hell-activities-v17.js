import {MAPS,QUESTS} from './data-v14.js';
import {SCENERY} from './world-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {CH5_MAPS,CH5_SCENERY,CH5_GROUND_STYLE,CH5_VISUAL_FAMILIES} from './chapter5-world-v14.js';
import {V11_DEEP_ENEMY_PROFILES} from './combat-data-v14.js';
import {WORLD_ADDITIONS} from './exploration-v14.js';
import {createActivityGearV17} from './activity-gear-v17.js';

const HOME='ch5Forge',HOST='ch5V17Steward',PREFIX='v17activity:',copy=x=>JSON.parse(JSON.stringify(x));
export const HELL_ACTIVITIES_V17={
 escort:{id:'escort',name:'送灯机护送',map:'ch5V17Escort',slot:'head',xp:360,gold:28,
  summary:'护送送灯机经过三处路标。靠近它才会前进，空甲接近时会夺走灯火；先把它们引开或击倒。灯火耗尽就回工坊重试。'},
 calibration:{id:'calibration',name:'回路校准',map:'ch5V17Calibration',slot:'feet',xp:400,gold:32,
  summary:'在八十秒内清除空甲，再按提示依次校准四次灯柱。顺序每轮不同，点错会失去八秒。倒下或超时都可以免费再试。'},
 salvage:{id:'salvage',name:'余烬采掘',map:'ch5V17Salvage',slot:'relic',xp:440,gold:35,
  summary:'在九十秒内采出三块矿样，再选一只封匣。采掘时须留在矿脉旁；地面亮红圈时先退开，喷火过后继续。'}
};
const IDS=Object.keys(HELL_ACTIVITIES_V17),SLOTS=['head','feet','relic'],NAMES=['西','北','东'];
const fresh=()=>({schema:1,jobs:{},seen:[],pity:0,run:null});
const state=g=>g.hellActivitiesV17||(g.hellActivitiesV17=fresh());
const current=g=>state(g).run,definition=id=>HELL_ACTIVITIES_V17[id];
const activityMap=id=>IDS.some(k=>definition(k).map===id),questId=id=>'ch5V17-'+id;
const near=(a,b,n)=>Math.hypot(a.x-b.x,a.y-b.y)<=n;
const entitled=g=>g.p.hp>0&&g.p.cls!=='saint'&&!!g.p.career?.id&&!g.p.career.preview&&!g.memoryV13?.active&&!!g.flags.ch5CitySeen;
const hostNear=g=>g.map===HOME&&near(g.p,{x:1160,y:850},145);
const clear=g=>!g.enemies.some(e=>!e.dead);
const hash=s=>{let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const rand=(id,career,ordinal,salt)=>hash([id,career,ordinal,salt].join(':'))/4294967296;
const stamp=(slot,variant)=>slot+':'+variant;
const owned=g=>new Set([...g.p.bag,...Object.values(g.p.gear),...g.pendingRewards].filter(Boolean).map(x=>x.id));
const prop=(id,kind,label,x,y,sheet='cityWorld',index=5,w=80,h=130)=>({id,action:PREFIX+kind,label,x,y,interactX:x,interactY:y+62,art:{sheet,index,w,h},box:[x-22,y-18,44,18]});
function register(){
 if(!MAPS[HOME].npcs.some(n=>n.id===HOST))MAPS[HOME].npcs.push({id:HOST,name:'领班 · 乔安',x:1160,y:850,sprite:9,angle:Math.PI,interactionRadius:100});
 const bases={guard:{base:'ch5V15-guard',hp:1250,damage:41},hound:{base:'ch5V15-hound',hp:980,damage:36},archer:{base:'ch5V15-archer',hp:980,damage:35}};
 for(const [id,p] of Object.entries(bases)){const type='ch5V17-'+id,base=V11_DEEP_ENEMY_PROFILES[p.base];V11_DEEP_ENEMY_PROFILES[type]={...base,...p,aggro:1200,leash:2000};delete V11_DEEP_ENEMY_PROFILES[type].base;CH5_VISUAL_FAMILIES[type]=base.visualFamily;WORLD_ADDITIONS.idleAI[type]={radius:18,pause:[.5,1],speed:20};}
 for(const id of IDS){const a=definition(id),props=id==='escort'?[prop('ch5V17-machine','machine','送灯机',380,715,'cityWorld',9,115,135)]:id==='calibration'?[0,1,2].map(i=>prop('ch5V17-lamp-'+i,'lamp:'+i,NAMES[i]+'灯柱',[455,800,1145][i],[610,370,610][i])):[0,1,2].flatMap(i=>[prop('ch5V17-ore-'+i,'ore:'+i,NAMES[i]+'矿脉',[460,800,1140][i],[590,345,590][i],'hellWorld',4,108,85),prop('ch5V17-cache-'+i,'cache:'+i,['厚铁匣 · 金砂','药纹匣 · 药品','刻印匣 · 灯芯'][i],[580,800,1020][i],835,'hellWorld',13,88,75)]);
  if(id==='escort'){delete props[0].box;props[0].interactY=715;}
  const decor=[{id:a.map+'-left',sheet:'cityWorld',asset:5,x:285,y:280,w:65,h:135,box:[271,265,28,15]},{id:a.map+'-right',sheet:'cityWorld',asset:5,x:1325,y:280,w:65,h:135,box:[1311,265,28,15]}];
  const m={name:a.name,sub:a.summary,chapterRegion:5,floor:'stone',width:1600,height:1080,entry:[280,745],doors:[{x:165,y:745,to:HOME,tx:1080,ty:870,label:'退出并返回工坊',direction:'西'}],npcs:[],props,spawns:[],blocks:[[0,0,1600,150],[0,965,1600,115],[1470,150,130,815],[0,150,130,480],[0,845,130,120],...props.filter(p=>p.box).map(p=>p.box),...decor.map(p=>p.box)],scenery:decor};
  MAPS[a.map]=copy(m);CH5_MAPS[a.map]=copy(m);SCENERY[a.map]=copy(decor);CH5_SCENERY[a.map]=copy(decor);
  const ground={sheet:'cityGround',base:id==='salvage'?3:1,paths:[{asset:1,width:150,points:[[165,745],[450,745],[800,660],[1170,745]]}],patches:[]};
  V11_GROUND_STYLE[a.map]=copy(ground);CH5_GROUND_STYLE[a.map]=copy(ground);
  QUESTS[questId(id)]={name:a.name,type:'支线',giver:HOST,map:HOME,desc:a.summary};
 }
 // One honest entrance to each yard; these also make every activity visible on the map.
 for(const [i,id] of IDS.entries())if(!MAPS[HOME].doors.some(d=>d.to===definition(id).map))MAPS[HOME].doors.push({x:1320,y:240+i*130,to:definition(id).map,tx:280,ty:745,label:definition(id).name+' · 先向领班报名',direction:'东北',gate:PREFIX+id,manualOnly:true});
}
function prepare(g,stats){const s=stats(g.p);g.p.hp=s.hp;g.p.mp=s.mp;g.p.emotion=0;g.p.shield=0;g.p.shieldTime=0;g.p.invuln=1;g.p.cd={};g.pending=null;g.transition=null;g.active=true;g.target=null;g.moveTo=null;g.bullets=[];g.zones=[];if(g.p.careerState)g.p.careerState.timers={};}
function spawn(g,types,x,y){const r=current(g);for(const [i,type] of types.entries()){const at=g.safePoint(x+(i%2)*100,y+Math.floor(i/2)*105),e=g.enemy('ch5V17-'+type,at.x,at.y,'v17-'+r.id+'-'+r.wave+'-'+r.spawned++);e.maxHP=V11_DEEP_ENEMY_PROFILES[e.type].hp;e.hp=e.maxHP;e.v15BossStats='custom';e.v13Tuned=true;e.hellActivityV17={id:r.id};e.groupId='v17-'+r.id;e.leashRadius=2000;e.isBossArena=true;e.activationBounds=[130,150,1340,815];e.alertUntil=g.time+999;e.threat={player:1};e.targetId='player';e.cd=1.8+i*.25;g.enemies.push(e);}}
function beginRun(g,id){const j=state(g).jobs[id],ordinal=j.claims+1;state(g).run={id,ordinal,elapsed:0,wave:0,spawned:0,kills:0,check:0,channel:null,ore:[],hazard:null,hazardAt:3,pressure:0,cargo:100,cartX:380,cartY:715};
 const r=current(g);g.states[g.map].enemies=[];for(const p of g.props){p.used=false;p.broken=false;}
 if(id==='escort')spawn(g,['guard','hound'],625,645);
 if(id==='calibration'){r.pattern=Array.from({length:4},(_,i)=>Math.floor(rand(id,g.p.career.id,ordinal,'pattern'+i)*3));for(let i=1;i<4;i++)if(r.pattern[i]===r.pattern[i-1])r.pattern[i]=(r.pattern[i]+1)%3;spawn(g,['guard','archer','hound'],780,610);}
 if(id==='salvage')spawn(g,['guard','hound'],850,570);
 g.say(definition(id).summary);
}
function discard(g){const r=current(g);if(!r)return;state(g).run=null;if(g.states[definition(r.id).map])g.states[definition(r.id).map].enemies=[];g.bullets=[];g.zones=[];g.target=null;g.moveTo=null;}
function parcel(g,id,choice){const s=state(g),j=s.jobs[id],first=j.claims===0,ordinal=j.claims+1,a=definition(id),hit=first||s.pity>=3||rand(id,g.p.career.id,ordinal,'gear')<.25;let gear=null;
 if(hit){const pool=SLOTS.flatMap(slot=>[0,1,2].map(variant=>({slot,variant}))).filter(v=>!s.seen.includes(stamp(v.slot,v.variant)));if(first)gear={slot:a.slot,variant:0};else if(pool.length)gear=pool[Math.floor(rand(id,g.p.career.id,ordinal,'pick')*pool.length)];}
 s.pity=hit?0:Math.min(3,s.pity+1);
 return {ordinal,first,choice,gear:gear?{...gear,quality:!first&&rand(id,g.p.career.id,ordinal,'quality')<.15?'legendary':'epic'}:null,duplicate:hit&&!gear};
}
function finish(g,choice=0){const s=state(g),r=s.run;if(!r||!entitled(g))return false;const valid=r.id==='escort'?r.wave===3&&clear(g)&&r.cartX>=1170:r.id==='calibration'?r.check===4&&clear(g):r.ore.length===3&&clear(g)&&Number.isInteger(choice)&&choice>=0&&choice<3;
 if(!valid)return false;const id=r.id,j=s.jobs[id];j.parcel=parcel(g,id,choice);j.clears++;s.run=null;g.bullets=[];g.zones=[];g.target=null;g.moveTo=null;g.flags.tracked=questId(id);g.say(definition(id).name+'完成了。报酬已经登记，返回工坊找领班领取。');g.emit('activity-completed',{id,first:j.clears===1,ordinal:j.clears});g.onHellActivityCompletedV17?.(id,{first:j.clears===1,ordinal:j.clears});g.saveEvent();return true;}

export function validateHellActivitiesSaveV17(saved){
 const s=saved.hellActivitiesV17;if(s===undefined)return true;const obj=v=>!!v&&typeof v==='object'&&!Array.isArray(v),integer=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b,fail=()=>{throw new Error('阙灯城活动记录不完整。');};
 if(!obj(s)||s.schema!==1||!obj(s.jobs)||s.run!==null||!Array.isArray(s.seen)||s.seen.length>9||new Set(s.seen).size!==s.seen.length||s.seen.some(x=>!SLOTS.flatMap(slot=>[0,1,2].map(v=>stamp(slot,v))).includes(x))||!integer(s.pity,0,3)||Object.keys(s.jobs).some(id=>!definition(id)))fail();
 let pending=0;for(const [id,j] of Object.entries(s.jobs)){if(!obj(j)||!integer(j.clears,0,99999)||!integer(j.claims,0,j.clears)||j.clears-j.claims>1)fail();const p=j.parcel;if(p===null){if(j.clears!==j.claims)fail();continue;}if(!obj(p)||j.clears!==j.claims+1||p.ordinal!==j.clears||p.first!==(j.claims===0)||!integer(p.choice,0,2)||typeof p.duplicate!=='boolean'||(id!=='salvage'&&p.choice!==0))fail();if(p.gear!==null&&(!obj(p.gear)||!SLOTS.includes(p.gear.slot)||!integer(p.gear.variant,0,2)||!['epic','legendary'].includes(p.gear.quality)||p.duplicate))fail();pending++;}
 if(pending>1)fail();return true;
}

export function installHellActivitiesV17(RPG,{stats}){
 register();const P=RPG.prototype;if(P._hellActivitiesV17Installed)return;P._hellActivitiesV17Installed=true;
 const old={};for(const k of ['snapshot','restore','enter','canDoor','npcOptions','choose','useProp','handleHellDeath','update','respawn','canSave','saveBlockReason','questGoal','ready','available','trackedGoal','objective','questPropNeeded','startChapterFive'])old[k]=P[k];
 P.activityCompletionsV17=function(id){return id?(state(this).jobs[id]?.clears||0):Object.values(state(this).jobs).reduce((n,j)=>n+j.clears,0);};
 P.startHellActivityV17=function(id){if(!definition(id)||!entitled(this)||!hostNear(this)||!clear(this)||current(this)||this.hellActivitiesV15?.run||Object.values(state(this).jobs).some(j=>j.parcel))return false;
  const s=state(this);if(s.jobs[id]?.claims>=99999)return false;s.jobs[id]||={clears:0,claims:0,parcel:null};this.quests[questId(id)]='active';this.flags.tracked=questId(id);this.flags.mapGoal=null;prepare(this,stats);this._startingActivityV17=id;try{this.enter(definition(id).map,280,745);}finally{this._startingActivityV17=null;}if(this.map!==definition(id).map)return false;this.emit('resume');return true;};
 P.claimHellActivityV17=function(id){const j=state(this).jobs[id];if(!definition(id)||!entitled(this)||!hostNear(this)||!clear(this)||current(this)||!j?.parcel)return false;const reward=j.parcel,a=definition(id),item=reward.gear?createActivityGearV17(this.p.cls,this.p.career.id,reward.gear.slot,reward.gear.variant,reward.gear.quality):null;
  if(reward.gear&&!item)return false;
  if(item&&!owned(this).has(item.id)&&this.p.bag.length>=60&&this.pendingRewards.length>=32){this.say('行囊和暂存处都满了。先整理一格，封匣会替你留着，内容不会改变。');return false;}
  j.claims=j.clears;j.parcel=null;
  // Persisted claim marker and all economic changes execute in one JS task. All
  // nested save events are consumed by the UI only after this call returns.
  if(reward.gear){const key=stamp(reward.gear.slot,reward.gear.variant);if(!state(this).seen.includes(key))state(this).seen.push(key);if(!owned(this).has(item.id))this.obtainGear(item);else this.addItem('ch5LampCore',3);}else if(reward.duplicate)this.addItem('ch5LampCore',3);
  this.p.gold+=a.gold;this.addItem('ch5GoldSand',2);this.addItem('ch5LampCore');this.addItem('hpLarge');if(id==='salvage'){if(reward.choice===0)this.addItem('ch5GoldSand',2);if(reward.choice===1){this.addItem('hpLarge');this.addItem('mpLarge');}if(reward.choice===2)this.addItem('ch5LampCore',2);}if(reward.first)this.gainXP(a.xp);
  this.quests[questId(id)]='done';if(this.flags.tracked===questId(id))this.flags.tracked=null;this.say(a.name+'报酬已结清。'+(reward.gear?'装备放进行囊了，记得看看是否合用。':reward.duplicate?'同样的装具已经登记过，换成了灯芯。':'这回封匣里是补给和材料。')+'想再接一趟，随时来找我。');this.saveEvent();return true;};
 P.npcOptions=function(id){if(id!==HOST||this.map!==HOME)return old.npcOptions.call(this,id);if(!entitled(this))return [{label:'工坊外面有什么差事？',action:PREFIX+'info',questState:'daily'}];const s=state(this),ready=IDS.find(k=>s.jobs[k]?.parcel);if(ready)return [{label:'领取 '+definition(ready).name+' 的封匣与报酬',action:PREFIX+'claim:'+ready,questState:'ready'},{label:'报酬怎么算？',action:PREFIX+'rewards',questState:'daily'}];return [...IDS.map(k=>({label:(s.jobs[k]?.claims?'再接一趟：':'报名：')+definition(k).name,action:PREFIX+'start:'+k,questState:'available'})),...IDS.map(k=>({label:definition(k).name+' · 先听说明',action:PREFIX+'info:'+k,questState:'daily'})),{label:'报酬怎么算？',action:PREFIX+'rewards',questState:'daily'},{label:'免费休整',action:PREFIX+'rest',questState:'service'}];};
 P.choose=function(action){if(typeof action!=='string'||!action.startsWith(PREFIX))return old.choose.call(this,action);if(!hostNear(this))return false;const [verb,id]=action.slice(PREFIX.length).split(':');if(verb==='start')return this.startHellActivityV17(id);if(verb==='claim')return this.claimHellActivityV17(id);if(verb==='rest'&&entitled(this)&&!current(this)&&clear(this)){prepare(this,stats);this.saveEvent();this.say('药水和热水都在边上。歇好了再走，不收入场费。');return true;}if(verb==='rewards'){this.say('每项首次完成都给一件合用的装具和经验，以后每趟给金币、药品与材料。封匣有四分之一机会开出装具，连续三次没有，下一次必有；优先给你没拿过的款式，集齐后换成灯芯。失败不扣金币，报酬要回工坊领取。');return true;}this.say(definition(id)?.summary||'有护送、校灯和采矿三种活。各有各的做法，不必按顺序来。先完成转职，在城里安顿好，我再给你登记。');return true;};
 P.enter=function(id,x,y){const r=current(this);if(r&&id!==this.map){discard(this);this.say('这一趟先撤回来了，没有扣费。准备好后可以重新报名。');}if(activityMap(id)&&this._startingActivityV17!==IDS.find(k=>definition(k).map===id)){if(this.map!==id)return false;}old.enter.call(this,id,x,y);if(this.map===id&&this._startingActivityV17&&!current(this))beginRun(this,this._startingActivityV17);};
 P.canDoor=function(d){if(d.gate?.startsWith(PREFIX))return '先找工坊东南的领班报名，他会带你去。';if(activityMap(this.map)&&d.to===HOME)return null;return old.canDoor.call(this,d);};
 P.useProp=function(id,confirmed){const p=this.props.find(o=>o.id===id);if(!p?.action?.startsWith(PREFIX))return old.useProp.call(this,id,confirmed);const r=current(this);if(!r||!entitled(this)||!this.active||!near(this.p,{x:p.interactX,y:p.interactY},120))return false;const [verb,n]=p.action.slice(PREFIX.length).split(':'),i=Number(n);
  if(verb==='machine'){this.say('站在送灯机旁，它就会沿路标继续走。空甲靠近时会夺走灯火。');return true;}
  if(verb==='lamp'&&r.id==='calibration'){if(!clear(this)){this.say('回路被空甲干扰，先把它们清掉。');return false;}if(r.pattern[r.check]!==i){r.elapsed+=8;this.effect('sparks',p.x,p.y-55,25,'#e39673',.4);this.say('灯芯没有接上。先校准'+NAMES[r.pattern[r.check]]+'灯柱。');return false;}r.check++;this.effect('holyChime',p.x,p.y,65,'#e9d88b',.7);this.emit('sfx',{name:'guard'});if(r.check===4)return finish(this);this.say('这一段接通了。接下来是'+NAMES[r.pattern[r.check]]+'灯柱。');return true;}
  if(verb==='ore'&&r.id==='salvage'){if(r.ore.includes(i))return false;if(r.channel?.index===i)return true;r.channel={index:i,time:0};this.moveTo=null;this.say('正在采掘，留在矿脉旁；看到红圈就先退开。');return true;}
  if(verb==='cache'&&r.id==='salvage'){if(r.ore.length<3||!clear(this)){this.say('先采齐三块矿样，清理剩下的空甲，再挑一只封匣。');return false;}if(finish(this,i)){p.used=true;return true;}}
  return false;};
 P.handleHellDeath=function(e){if(!e.hellActivityV17)return old.handleHellDeath.call(this,e);const r=current(this);if(r&&e.dead&&e.hp<=0&&this.enemies.includes(e)&&e.hellActivityV17.id===r.id&&!e.hellActivityCountedV17){e.hellActivityCountedV17=true;e.respawn=9999999;r.kills++;}return true;};
 P.failHellActivityV17=function(reason){if(!current(this))return false;discard(this);this.events=this.events.filter(e=>e.type!=='death');prepare(this,stats);this.enter(HOME,1080,870);this.say(reason+' 已回工坊，金币和装备都没扣，可以免费再试。');this.saveEvent();this.emit('resume');return true;};
 P.update=function(dt,input){old.update.call(this,dt,input);const r=current(this);if(!r||!this.active||this.pending||this.transition||this.p.hp<=0)return;r.elapsed+=dt;
  if(r.id==='escort'){const cart=this.props.find(p=>p.id==='ch5V17-machine');if(!cart)return;const threatened=this.enemies.filter(e=>!e.dead&&near(e,cart,155));r.pressure+=dt;if(r.pressure>=2){r.pressure-=2;if(threatened.length){r.cargo=Math.max(0,r.cargo-Math.min(3,threatened.length)*8);this.effect('impact',cart.x,cart.y-45,35,'#dd9075',.4);this.text('灯火 -'+Math.min(3,threatened.length)*8,cart.x,cart.y-115,'#e9a088');}}
   if(r.cargo<=0){this.failHellActivityV17('灯火熄灭了，送灯机已被拖回。');return;}
   const end=[630,900,1170][Math.min(2,r.wave)];if(near(this.p,cart,160)&&!threatened.length)r.cartX=Math.min(end,r.cartX+62*dt);cart.x=r.cartX;cart.interactX=r.cartX;cart.y=r.cartY;cart.interactY=r.cartY;
   if(r.cartX>=end&&clear(this)){r.wave++;if(r.wave>=3){finish(this);return;}spawn(this,r.wave===1?['guard','archer']:['guard','hound','archer'],r.cartX+145,540);this.say('送灯机经过了第'+r.wave+'处路标。前面又有空甲，留意灯火。');}}
  if(r.id==='calibration'&&r.elapsed>=80){this.failHellActivityV17('回路再次熄灭，校准时间到了。');return;}
  if(r.id==='salvage'){if(r.elapsed>=90){this.failHellActivityV17('矿庭升温太快，这一趟必须撤离。');return;}
   if(!r.hazard&&r.elapsed>=r.hazardAt&&r.ore.length<3){const index=r.channel?.index??[0,1,2].find(i=>!r.ore.includes(i)),p=this.props.find(p=>p.id==='ch5V17-ore-'+index);r.hazard={x:p.interactX,y:p.interactY,left:1.7,radius:130};this.emit('sfx',{name:'guard'});}
   if(r.hazard){r.hazard.left-=dt;if(r.hazard.left<=0){const z=r.hazard;if(near(this.p,z,z.radius)){this.hurt(95);r.channel=null;}this.effect('flame',z.x,z.y,z.radius,'#df875a',.7);r.hazard=null;r.hazardAt=r.elapsed+5.3;}}
   if(r.channel){const p=this.props.find(p=>p.id==='ch5V17-ore-'+r.channel.index);if(!near(this.p,{x:p.interactX,y:p.interactY},108)){r.channel=null;}else{r.channel.time+=dt;if(r.channel.time>=3.5){r.ore.push(r.channel.index);p.used=true;r.channel=null;this.effect('sparks',p.x,p.y-35,45,'#efcf95',.6);this.say('矿样 '+r.ore.length+'/3 已收好。'+(r.ore.length===3?'清理剩下的空甲后，到南边挑一只封匣。':''));}}}}
 };
 P.respawn=function(){if(activityMap(this.map)&&current(this))return this.failHellActivityV17('你在差事途中倒下，领班把你接了回来。');return old.respawn.call(this);};
 P.canSave=function(){return !current(this)&&old.canSave.call(this);};
 P.saveBlockReason=function(){return current(this)?'活动进行中不能保存；完成或退出后会保存报酬与进度。':old.saveBlockReason.call(this);};
 P.snapshot=function(){const s=old.snapshot.call(this),h=copy(this.memoryV13?.active?(this.memoryV13.reality.hellActivitiesV17||state(this)):state(this));h.run=null;return {...s,hellActivitiesV17:h};};
 P.restore=function(saved){validateHellActivitiesSaveV17(saved);old.restore.call(this,saved);this.hellActivitiesV17=saved.hellActivitiesV17?copy(saved.hellActivitiesV17):fresh();if(activityMap(this.map)){if(this.states[this.map])this.states[this.map].enemies=[];this.map=HOME;this.ensureMap(HOME);this.p.x=1080;this.p.y=870;this.pending=null;this.active=true;this.p.hp=Math.max(1,this.p.hp);this.bullets=[];this.zones=[];}};
 P.startChapterFive=function(preview=false){const result=old.startChapterFive.call(this,preview);if(preview&&result)this.hellActivitiesV17=fresh();return result;};
 P.hellActivityGoalV17=function(id=null){const r=current(this);id=id||r?.id||IDS.find(k=>state(this).jobs[k]?.parcel);const a=definition(id);if(!a)return null;const j=state(this).jobs[id];if(j?.parcel)return {text:a.name+'完成 → 工坊东南领班领取封匣',map:HOME,target:HOST,type:'城中差事'};if(r?.id===id){let detail,target=null;if(id==='escort'){detail='路标 '+Math.min(3,r.wave)+'/3 · 灯火 '+Math.ceil(r.cargo)+'% · 靠近送灯机护送';target='ch5V17-machine';}if(id==='calibration'){detail='剩 '+Math.max(0,Math.ceil(80-r.elapsed))+'秒 · '+(clear(this)?'校准 '+NAMES[r.pattern[r.check]]+'灯柱（'+r.check+'/4）':'先清理空甲');target=clear(this)?'ch5V17-lamp-'+r.pattern[r.check]:null;}if(id==='salvage'){detail='剩 '+Math.max(0,Math.ceil(90-r.elapsed))+'秒 · 矿样 '+r.ore.length+'/3'+(r.channel?' · 采掘 '+Math.round(r.channel.time/3.5*100)+'%':'')+(r.ore.length===3?' · 清场后选择南侧封匣':' · 红圈亮起就退开');target=r.ore.length<3?'ch5V17-ore-'+[0,1,2].find(i=>!r.ore.includes(i)):null;}return {text:a.name+' · '+detail,map:a.map,target,type:'城中差事'};}return {text:'金缕工坊东南领班 → '+a.name+'（免费报名，可重复）',detail:a.summary,map:HOME,target:HOST,type:'城中差事'};};
 P.trackedGoal=function(){if(current(this))return this.hellActivityGoalV17();if(this.flags.tracked?.startsWith('ch5V17-'))return this.hellActivityGoalV17(this.flags.tracked.slice(7));return old.trackedGoal.call(this);};
 P.objective=function(){if(current(this))return this.hellActivityGoalV17();return old.objective.call(this);};
 P.questGoal=function(id){return id?.startsWith('ch5V17-')?this.hellActivityGoalV17(id.slice(7)):old.questGoal.call(this,id);};
 P.ready=function(id){return id?.startsWith('ch5V17-')?!!state(this).jobs[id.slice(7)]?.parcel:old.ready.call(this,id);};
 P.available=function(id){return id?.startsWith('ch5V17-')?entitled(this)&&!!definition(id.slice(7))&&!state(this).jobs[id.slice(7)]:old.available.call(this,id);};
 P.questPropNeeded=function(id){const r=current(this);if(r&&this.hellActivityGoalV17()?.target===id)return true;return old.questPropNeeded?.call(this,id);};
}

// Draw inside the existing world transform. Ground circles communicate a
// genuine delayed hazard; numerical objectives are also available as HUD text.
export function drawHellActivitiesV17(c,g){const r=g?.hellActivitiesV17?.run;if(!r||g.map!==definition(r.id)?.map)return;c.save();c.font='bold 17px sans-serif';c.textAlign='center';
 if(r.hazard){const z=r.hazard;c.fillStyle='rgba(190,55,32,.20)';c.strokeStyle='#ff9d6d';c.lineWidth=3;c.beginPath();c.arc(z.x,z.y,z.radius,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#ffe2bd';c.fillText('退开',z.x,z.y-12);}
 if(r.id==='escort'){c.fillStyle='rgba(16,18,25,.85)';c.fillRect(r.cartX-65,r.cartY-155,130,13);c.fillStyle=r.cargo<35?'#e29177':'#e2c378';c.fillRect(r.cartX-64,r.cartY-154,128*r.cargo/100,11);c.fillStyle='#f1e1bc';c.fillText('灯火 '+Math.ceil(r.cargo)+'%',r.cartX,r.cartY-164);}
 if(r.id==='calibration'){const i=r.pattern[r.check],p=g.props.find(p=>p.id==='ch5V17-lamp-'+i);if(p){c.strokeStyle='#efda96';c.lineWidth=3;c.beginPath();c.ellipse(p.interactX,p.interactY,52,24,0,0,Math.PI*2);c.stroke();c.fillStyle='#f6e7bd';c.fillText('下一处',p.x,p.y-138);}}
 if(r.channel){const p=g.props.find(p=>p.id==='ch5V17-ore-'+r.channel.index);if(p){c.fillStyle='#e5d497';c.fillText('采掘 '+Math.round(r.channel.time/3.5*100)+'%',p.x,p.y-105);}}
 c.restore();}
