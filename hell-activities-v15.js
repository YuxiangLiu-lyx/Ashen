import {MAPS,QUESTS,DIALOGUES,CLASSES} from './data-v14.js';
import {SCENERY} from './world-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {CH5_MAPS,CH5_SCENERY,CH5_GROUND_STYLE,CH5_ENEMY_PROFILES,CH5_VISUAL_FAMILIES} from './chapter5-world-v14.js';
import {V11_DEEP_ENEMY_PROFILES} from './combat-data-v14.js';
import {WORLD_ADDITIONS} from './exploration-v14.js';
import {baseCombatPower,totalAttributes} from './growth-v14.js';
import {createHellRouteGearV15,hellRouteGearBonuses} from './hell-route-gear-v15.js';

const copy=x=>JSON.parse(JSON.stringify(x));
const HOST='ch5V15Warden',HOME='ch5Forge',PREFIX='v15activity:';
export const HELL_ACTIVITIES_V15={
 breach:{id:'breach',stage:2,name:'裂灯巡猎',map:'ch5V15Hunt',kind:'hunt',xp:600,gold:100,
  summary:'去练场侧庭清理失控的空甲，一共两批、6名。完成后带回巡猎记录。',
  waves:[['hound','guard','archer'],['guard','hound','archer']]},
 salvage:{id:'salvage',stage:3,name:'矿庭寻宝',map:'ch5V15Salvage',kind:'salvage',xp:750,gold:130,
  summary:'三处旧矿藏都有人看守。清理守卫后，依次打开西、北、东三个矿匣，不需要金砂或钥匙。',
  waves:[['hound','guard'],['archer','guard'],['elite','hound']]},
 deathmatch:{id:'deathmatch',stage:4,name:'无赎死斗',map:'ch5V15Deathmatch',kind:'deathmatch',xp:1100,gold:160,
  summary:'连续打赢三轮角斗，每轮之间都可以休息补给。中途退出或倒下，也能免费重新挑战。',
  waves:[['guard','archer'],['hound','guard','archer'],['elite','guard','archer']]},
 trial:{id:'trial',stage:5,name:'三灯试炼',map:'ch5V15Trial',kind:'trial',xp:1500,gold:210,
  summary:'完成三轮战斗，依次点亮西、北、东三盏试炼灯。最后一轮要对付守灯像，当心它的重扫。',
  waves:[['guard','archer'],['elite','hound','archer'],['champion']]}
};
const IDS=Object.keys(HELL_ACTIVITIES_V15),questId=id=>'ch5V15-'+id;
const fresh=()=>({schema:1,jobs:{},run:null,scenes:{}});
const state=g=>g.hellActivitiesV15||(g.hellActivitiesV15=fresh());
const activityMap=id=>IDS.some(k=>HELL_ACTIVITIES_V15[k].map===id);
const current=g=>state(g).run;
const entitled=g=>!g.memoryV13?.active&&!g.p.career?.preview&&g.p.hp>0&&!!g.p.career?.id&&g.flags.ch5CitySeen;
const clear=g=>!g.enemies.some(e=>!e.dead);
const hostNear=g=>g.map===HOME&&Math.hypot(g.p.x-835,g.p.y-710)<=145;
const checkpoint=(id,i,kind)=>({id:'ch5V15-'+id+'-check-'+i,action:PREFIX+'check:'+i,label:(kind==='trial'?'试炼灯 · ':'矿匣 · ')+['西','北','东'][i],
 x:[465,800,1140][i],y:[545,340,545][i],interactX:[465,800,1140][i],interactY:[615,410,615][i],
 art:{sheet:kind==='trial'?'cityWorld':'hellWorld',index:kind==='trial'?5:13,w:90,h:110},box:[[440,520,50,25],[775,315,50,25],[1115,520,50,25]][i]});
function register(){
 if(!MAPS[HOME].npcs.some(n=>n.id===HOST))MAPS[HOME].npcs.push({id:HOST,name:'巡灯官 · 伊芙',x:835,y:710,sprite:12,angle:Math.PI/2,interactionRadius:100});
 const profiles={hound:{base:'ch5Hound',hp:1150,damage:44,speed:163},guard:{base:'ch5Guard',hp:1500,damage:49,speed:138},archer:{base:'ch5Archer',hp:1120,damage:40,speed:112},elite:{base:'ch5Elite',hp:3400,damage:62,speed:137},champion:{base:'ch5Elite',isBoss:true,hp:13800,damage:82,speed:122,specialMultiplier:2.1,specialCooldown:7.5,basicAttack:'melee',basicAttacksBetweenSpecials:3,moveOrder:['furnaceSweep','furnaceSlam','furnaceBolt'],leash:null}};
 for(const[k,p]of Object.entries(profiles)){const id='ch5V15-'+k,base=CH5_ENEMY_PROFILES[p.base];V11_DEEP_ENEMY_PROFILES[id]={...base,...p,name:k==='champion'?'三灯守卫 · 试炼像':base.name,aggro:1000,leash:1800};delete V11_DEEP_ENEMY_PROFILES[id].base;CH5_VISUAL_FAMILIES[id]=base.visualFamily;WORLD_ADDITIONS.idleAI[id]={radius:25,pause:[.5,1],speed:25};}
 IDS.forEach((id,index)=>{
  const a=HELL_ACTIVITIES_V15[id],props=['salvage','trial'].includes(a.kind)?[0,1,2].map(i=>checkpoint(id,i,a.kind)):[];
  const decor=[{id:a.map+'-lamp-l',sheet:'cityWorld',asset:5,x:370,y:255,w:70,h:140,box:[353,232,34,23]},
   {id:a.map+'-lamp-r',sheet:'cityWorld',asset:5,x:1230,y:255,w:70,h:140,box:[1213,232,34,23]}];
  const map={name:a.name,sub:a.summary,chapterRegion:5,floor:'stone',width:1600,height:1080,entry:[285,730],
   doors:[{x:170,y:730,to:HOME,tx:835,ty:810,label:'退出 / 返回巡灯官',direction:'西'}],npcs:[],props,spawns:[],
   blocks:[[0,0,1600,150],[0,965,1600,115],[1470,150,130,815],[0,150,130,470],[0,840,130,125],...props.map(p=>p.box),...decor.map(o=>o.box)],scenery:decor};
  MAPS[a.map]=copy(map);CH5_MAPS[a.map]=copy(map);SCENERY[a.map]=copy(decor);CH5_SCENERY[a.map]=copy(decor);
  const ground={sheet:'cityGround',base:a.kind==='salvage'?3:1,paths:[{asset:1,width:150,points:[[150,730],[480,730],[800,645],[1200,730]]}],patches:[]};
  V11_GROUND_STYLE[a.map]=copy(ground);CH5_GROUND_STYLE[a.map]=copy(ground);
  if(!MAPS[HOME].doors.some(d=>d.to===a.map))MAPS[HOME].doors.push({x:205,y:370+index*145,to:a.map,tx:285,ty:730,label:a.name+' · 先向巡灯官报名',direction:'西',gate:PREFIX+id});
  QUESTS[questId(id)]={name:a.name,type:'支线',giver:HOST,map:HOME,xp:a.xp,gold:a.gold,desc:a.summary};
 });
}
function jobReady(g,id){const a=HELL_ACTIVITIES_V15[id],s=state(g).jobs[id];return !!a&&s?.status==='ready'&&s.kills===a.waves.reduce((n,w)=>n+w.length,0)&&(!['salvage','trial'].includes(a.kind)||s.checks?.length===3);}
function prepare(g){const s=g._hellActivityStats(g.p);g.p.hp=s.hp;g.p.mp=s.mp;g.p.emotion=0;g.p.shield=0;g.p.shieldTime=0;g.p.invuln=1;g.p.cd={};g.p.careerState&&(g.p.careerState.timers={});g.pending=null;g.active=true;g.bullets=[];g.zones=[];g.target=null;g.moveTo=null;}
function spawnWave(g){
 const r=current(g);if(!r)return false;const a=HELL_ACTIVITIES_V15[r.id],wave=a.waves[r.wave];if(!wave)return false;
 g.states[g.map].enemies=[];r.awaiting=false;r.wait=0;
 for(let i=0;i<wave.length;i++){const at=g.safePoint(850+(i%2)*240,575+Math.floor(i/2)*150),e=g.enemy('ch5V15-'+wave[i],at.x,at.y,'v15-'+r.id+'-'+r.attempt+'-'+r.wave+'-'+i);
  e.maxHP=V11_DEEP_ENEMY_PROFILES[e.type].hp;e.hp=e.maxHP;e.v15BossStats='custom';e.v13Tuned=true;
  e.hellActivityV15={id:r.id,wave:r.wave};e.groupId='v15-wave-'+r.wave;e.leashRadius=2000;e.isBossArena=true;e.activationBounds=[130,150,1340,815];e.alertUntil=g.time+999;e.threat={player:1};e.targetId='player';e.cd=2+i*.3;if(wave[i]==='champion'){e.abilityCD=1.2;e.basicSinceSpecial=3;}g.enemies.push(e);}
 g.say(a.name+' · 第'+(r.wave+1)+'/'+a.waves.length+'轮');return true;
}
function completeRun(g){const r=current(g);if(!r)return;const s=state(g),j=s.jobs[r.id],a=HELL_ACTIVITIES_V15[r.id];
 if(j.kills!==a.waves.flat().length||j.checks.length!==(['salvage','trial'].includes(a.kind)?3:0)){abort(g);g.say('委托记录未完成，请返回巡灯官免费重试。');return;}
 j.status='ready';s.run=null;g.bullets=[];g.zones=[];g.target=null;g.p.hp=Math.max(1,g.p.hp);g.say(a.name+'完成。向西返回金缕工坊，找巡灯官领取第'+a.stage+'阶技法与专属装备。');g.saveEvent();}
function nextWave(g){const r=current(g);if(!r)return;const a=HELL_ACTIVITIES_V15[r.id];r.wave++;if(r.wave>=a.waves.length){completeRun(g);return;}const s=g._hellActivityStats(g.p);g.p.hp=Math.min(s.hp,g.p.hp+s.hp*.5);g.p.mp=s.mp;g.p.invuln=1;spawnWave(g);}
function abort(g){const s=state(g),r=s.run;if(!r)return;const j=s.jobs[r.id];j.status='active';j.kills=0;j.checks=[];s.run=null;g.states[HELL_ACTIVITIES_V15[r.id].map].enemies=[];g.bullets=[];g.zones=[];}

export function validateHellActivitiesSaveV15(save){
 const h=save.hellActivitiesV15;if(h===undefined)return true;
 const obj=v=>!!v&&typeof v==='object'&&!Array.isArray(v),integer=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
 const fail=()=>{throw new Error('阙灯城职业委托记录不完整。');};
 if(!obj(h)||h.schema!==1||!obj(h.jobs)||!obj(h.scenes)||h.run!==null||Object.keys(h.jobs).length>4)fail();
 if(Object.keys(h.scenes).some(k=>!['c5-saint-after-job','c5-saint-after-treasure','c5-saint-night-talk'].includes(k)||h.scenes[k]!==true))fail();
 for(const[id,j]of Object.entries(h.jobs)){
  const a=HELL_ACTIVITIES_V15[id],previous=IDS[IDS.indexOf(id)-1];
  if(!a||!obj(j)||!['active','ready','claimed'].includes(j.status)||!integer(j.attempts,1,99999)||!integer(j.kills,0,a.waves.flat().length)||!Array.isArray(j.checks)||j.checks.length>3||new Set(j.checks).size!==j.checks.length||j.checks.some((n,i)=>n!==i))fail();
  if(previous&&h.jobs[previous]?.status!=='claimed')fail();
  if(j.status==='active'&&(j.kills!==0||j.checks.length!==0))fail();
  if(['ready','claimed'].includes(j.status)&&(j.kills!==a.waves.flat().length||j.checks.length!==(['salvage','trial'].includes(a.kind)?3:0)))fail();
  if(j.status==='claimed'&&(!save.p?.career?.unlockedStages?.includes(a.stage)||save.p.career.activityRewards?.[a.stage]!==id))fail();
 }
 return true;
}

export function installHellActivitiesV15(RPG,{stats}){
 register();const P=RPG.prototype;if(P._hellActivitiesV15Installed)return;P._hellActivitiesV15Installed=true;P._hellActivityStats=stats;
 const old={};for(const k of ['snapshot','restore','enter','canDoor','npcOptions','choose','useProp','handleHellDeath','update','respawn','canSave','saveBlockReason','questGoal','ready','available','trackedGoal','objective','questPropNeeded','damage','chapter5Action','startChapterFive'])old[k]=P[k];
 P.hellActivityStatusV15=function(id){return state(this).jobs[id]?.status||'unavailable';};
 P.startHellActivityV15=function(id){
  const a=HELL_ACTIVITIES_V15[id],s=state(this);if(!a||!entitled(this)||!hostNear(this)||s.run||!clear(this))return false;
  const previous=IDS[IDS.indexOf(id)-1];if(previous&&s.jobs[previous]?.status!=='claimed'){this.say('先完成并领取'+HELL_ACTIVITIES_V15[previous].name+'的报酬。');return false;}
  if(['ready','claimed'].includes(s.jobs[id]?.status))return false;
  const attempts=(s.jobs[id]?.attempts||0)+1;s.jobs[id]={status:'active',kills:0,checks:[],attempts};this.quests[questId(id)]='active';this.flags.tracked=questId(id);this.flags.mapGoal=null;
  prepare(this);this._hellStartingV15=true;try{this.enter(a.map,285,730);}finally{this._hellStartingV15=false;}if(this.map!==a.map)return false;
  this.emit('resume');return true;
 };
 P.claimHellActivityV15=function(id){
  const a=HELL_ACTIVITIES_V15[id],s=state(this);if(!a||!entitled(this)||!hostNear(this)||s.run||!jobReady(this,id)||!clear(this)||typeof this.grantCareerActivity!=='function')return false;
  // Claim marker is written before side effects; all rewards remain one transaction.
  const j=s.jobs[id];j.status='claimed';
  const granted=this.grantCareerActivity(a.stage,id);if(!granted&&!(this.p.career?.unlockedStages?.includes(a.stage)&&this.p.career.activityRewards?.[a.stage]===id)){j.status='ready';return false;}
  this.quests[questId(id)]='done';this.obtainGear(createHellRouteGearV15(this.p.cls,this.p.career.id,a.stage));this.gainXP(a.xp);this.p.gold+=a.gold;
  this.addItem('hpLarge',2);this.addItem('mpLarge',2);this.addItem('ch5GoldSand',3);this.addItem('ch5LampCore',2);
  const next=IDS[IDS.indexOf(id)+1];if(next){this.quests[questId(next)]='active';this.flags.tracked=questId(next);}else this.flags.tracked=null;
  this.say(a.name+'报酬已领取：第'+a.stage+'阶技法、转职专属装备（在行囊装备）、经验'+a.xp+'、金币'+a.gold+'。');
  const scene=a.stage===2?'c5-saint-after-job':a.stage===3?'c5-saint-after-treasure':'c5-saint-night-talk';
  if(!s.scenes[scene]&&DIALOGUES[scene]&&!this.pending){s.scenes[scene]=true;this.beginScene(scene);}
  this.saveEvent();return true;
 };
 P.npcOptions=function(id){
  const result=old.npcOptions.call(this,id);if(id!==HOST||this.map!==HOME)return result;
  if(!entitled(this))return [{label:'城里有哪些磨练技法的委托？',action:PREFIX+'info',questState:'daily'}];
  const s=state(this),idNext=IDS.find(k=>s.jobs[k]?.status!=='claimed');
  if(!idNext)return [{label:'四份委托都结清了。查看装备与补给。',action:PREFIX+'done',questState:'daily'},{label:'在灯下休整（免费恢复生命、法力）',action:PREFIX+'rest',questState:'service'}];
  const a=HELL_ACTIVITIES_V15[idNext],ready=jobReady(this,idNext);
  return [{label:ready?'领取 '+a.name+' · 技法心得与专属装备':(s.jobs[idNext]?'免费重试 ':'接取并进入 ')+a.name+' · 技法心得与专属装备',action:PREFIX+(ready?'claim:':'start:')+idNext,questState:ready?'ready':'available'},
   {label:'委托目标、奖励与退出规则',action:PREFIX+'info:'+idNext,questState:'daily'},
   {label:'在灯下休整（免费恢复生命、法力）',action:PREFIX+'rest',questState:'service'}];
 };
 P.choose=function(action){if(typeof action!=='string'||!action.startsWith(PREFIX))return old.choose.call(this,action);if(!hostNear(this))return false;
  const [verb,id]=action.slice(PREFIX.length).split(':');if(verb==='start')return this.startHellActivityV15(id);if(verb==='claim')return this.claimHellActivityV15(id);
  if(verb==='rest'&&entitled(this)&&clear(this)){prepare(this);this.saveEvent();this.say('已经休整好了。参加委托不收入场费，哪场没打过，都可以再来报名。');return true;}
  const a=HELL_ACTIVITIES_V15[id];this.say(a?a.summary+' 完成后向西回来领取技法心得与'+({2:'主武器',3:'胸甲',4:'护手',5:'饰品'}[a.stage])+'；报酬只发一次。':'城里有些委托可以磨练战法，也有合用的装备作为报酬。不收入场费，失败也不扣金币或材料，休整好就能再试。');return true;
 };
 P.canDoor=function(d){if(d.gate?.startsWith(PREFIX)){const id=d.gate.slice(PREFIX.length);return !entitled(this)?'先完成转职并在阙灯城落脚。':state(this).jobs[id]?.status==='active'?null:'先到工坊中央找巡灯官报名；完成的委托无需再入场。';}if(activityMap(this.map)&&d.to===HOME)return null;return old.canDoor.call(this,d);};
 P.enter=function(id,x,y){const r=current(this);if(r&&id!==this.map){abort(this);this.say('已退出本次委托，没有扣费。想重新挑战，可以再找巡灯官报名。');}
  const isEntry=activityMap(id);if(isEntry&&!state(this).run){const a=Object.values(HELL_ACTIVITIES_V15).find(v=>v.map===id);if(!entitled(this)||state(this).jobs[a.id]?.status!=='active')return false;}
  old.enter.call(this,id,x,y);
  // Walking through a registered side door also restarts the accepted contract.
  if(this.map===id&&isEntry&&!state(this).run){const a=Object.values(HELL_ACTIVITIES_V15).find(v=>v.map===id),j=state(this).jobs[a.id];if(j?.status==='active'){j.kills=0;j.checks=[];prepare(this);state(this).run={id:a.id,wave:0,attempt:j.attempts||1,awaiting:false,wait:0};for(const p of this.props)p.used=false;spawnWave(this);}}
 };
 P.useProp=function(id,confirmed){const p=this.props.find(o=>o.id===id);if(!p?.action?.startsWith(PREFIX))return old.useProp.call(this,id,confirmed);
  const r=current(this);if(!r||!entitled(this)||Math.hypot(this.p.x-p.interactX,this.p.y-p.interactY)>120)return false;
  const a=HELL_ACTIVITIES_V15[r.id],index=Number(p.action.split(':').at(-1));if(!r.awaiting||!clear(this)||r.wave!==index){this.say('先清理当前守卫，再处理标记的'+(a.kind==='trial'?'试炼灯。':'矿匣。'));return false;}
  const j=state(this).jobs[r.id];if(j.checks.includes(index))return false;j.checks.push(index);p.used=true;this.say(a.kind==='trial'?'试炼灯亮起。':'矿匣里的刻纹已经记下。');nextWave(this);return true;
 };
 P.handleHellDeath=function(e){if(!e.hellActivityV15)return old.handleHellDeath.call(this,e);const r=current(this);if(!r||!e.dead||e.hp>0||!this.enemies.includes(e)||e.hellActivityCountedV15||e.hellActivityV15.id!==r.id||e.hellActivityV15.wave!==r.wave)return true;
  e.hellActivityCountedV15=true;e.respawn=9999999;state(this).jobs[r.id].kills++;return true;};
 P.update=function(dt,input){old.update.call(this,dt,input);const r=current(this);if(!r||!this.active||this.pending||this.p.hp<=0)return;
  if(clear(this)&&!r.awaiting){const a=HELL_ACTIVITIES_V15[r.id];if(['salvage','trial'].includes(a.kind)){r.awaiting=true;this.say('本轮已清理。前往'+['西','北','东'][r.wave]+(a.kind==='trial'?'侧试炼灯':'侧矿匣')+'交互。');}else{r.wait+=dt;if(r.wait>=1.6)nextWave(this);}}
 };
 P.respawn=function(){if(!activityMap(this.map))return old.respawn.call(this);abort(this);this.events=this.events.filter(e=>e.type!=='death');prepare(this);this.enter(HOME,835,810);this.say('巡灯官已将你带回工坊，装备和金币都在。休整后可以免费重新挑战。');this.saveEvent();return true;};
 P.canSave=function(){return !current(this)&&old.canSave.call(this);};
 P.saveBlockReason=function(){return current(this)?'委托进行中不能保存；退出、完成或倒下后可保存。':old.saveBlockReason.call(this);};
 P.snapshot=function(){const s=old.snapshot.call(this),h=copy(this.memoryV13?.active?(this.memoryV13.reality.hellActivitiesV15||state(this)):state(this));if(h.run){const j=h.jobs[h.run.id];j.status='active';j.kills=0;j.checks=[];h.run=null;}return {...s,hellActivitiesV15:h};};
 P.restore=function(saved){validateHellActivitiesSaveV15(saved);old.restore.call(this,saved);const raw=saved.hellActivitiesV15;this.hellActivitiesV15=raw?.schema===1?{...fresh(),...copy(raw),run:null}:fresh();
  for(const[id,j]of Object.entries(state(this).jobs)){if(!HELL_ACTIVITIES_V15[id]||!['active','ready','claimed'].includes(j.status)){delete state(this).jobs[id];continue;}if(j.status==='active'){j.kills=0;j.checks=[];}j.attempts=Math.max(0,Number(j.attempts)||0);}
  if(activityMap(this.map)){this.states[this.map]&&(this.states[this.map].enemies=[]);this.map=HOME;this.p.x=835;this.p.y=810;this.pending=null;this.active=true;this.p.hp=Math.max(1,this.p.hp);}
 };
 P.startChapterFive=function(preview=false){const result=old.startChapterFive.call(this,preview);if(preview&&result)this.hellActivitiesV15=fresh();return result;};
 P.hellActivityGoalV15=function(id=null){id=id||current(this)?.id||IDS.find(k=>state(this).jobs[k]?.status!=='claimed');const a=HELL_ACTIVITIES_V15[id];if(!a)return null;
  const j=state(this).jobs[id],r=current(this);if(j?.status==='claimed')return {text:'已完成',completed:true,map:null,type:'职业委托'};
  if(jobReady(this,id))return {text:a.name+'已完成 → 工坊中央巡灯官领取第'+a.stage+'阶技法与专属装备',map:HOME,target:HOST,type:'职业委托'};
  if(r?.id===id){const target=r.awaiting?'ch5V15-'+id+'-check-'+r.wave:null;return {text:a.name+' · 第'+(r.wave+1)+'/'+a.waves.length+'轮 · '+(r.awaiting?'前往'+['西','北','东'][r.wave]+'侧'+(a.kind==='trial'?'点灯':'开矿匣'):'清理守卫（'+j.kills+'/'+a.waves.flat().length+'）'),map:a.map,target,type:'职业委托'};}
  return {text:'工坊中央巡灯官 → '+a.name+'（免费；第'+a.stage+'阶技法＋职业'+({2:'主武器',3:'胸甲',4:'护手',5:'饰品'}[a.stage])+'）',detail:a.summary,map:HOME,target:HOST,type:'职业委托'};
 };
 P.objective=function(){if(entitled(this)&&this.map.startsWith('ch5')&&!this.flags.ch5BossDefeated&&IDS.some(id=>state(this).jobs[id]?.status!=='claimed'))return this.hellActivityGoalV15();return old.objective.call(this);};
 P.questGoal=function(id){return id?.startsWith('ch5V15-')?this.hellActivityGoalV15(id.slice(7)):old.questGoal.call(this,id);};
 P.ready=function(id){return id?.startsWith('ch5V15-')?jobReady(this,id.slice(7)):old.ready.call(this,id);};
 P.available=function(id){if(!id?.startsWith('ch5V15-'))return old.available.call(this,id);const key=id.slice(7),i=IDS.indexOf(key);return entitled(this)&&i>=0&&!state(this).jobs[key]&&(i===0||state(this).jobs[IDS[i-1]]?.status==='claimed');};
 P.trackedGoal=function(){if(current(this))return this.hellActivityGoalV15();if(this.flags.tracked?.startsWith('ch5V15-'))return this.questGoal(this.flags.tracked);return old.trackedGoal.call(this);};
 P.questPropNeeded=function(id){return this.hellActivityGoalV15()?.target===id||old.questPropNeeded?.call(this,id);};
 P.damage=function(e,n,kind='hit'){
  if(this.memoryV13?.active||this.p.hp<=0)return old.damage.call(this,e,n,kind);const b=hellRouteGearBonuses(this.p),before=e.hp;
  if(kind==='hit')n*=1+b.basicDamage;else if(kind==='dot')n*=1+b.dotDamage;else if(['skill','ch3skill','career'].includes(kind))n*=1+b.skillDamage;
  if(['hit','skill','ch3skill','career'].includes(kind)){if(e.hp<e.maxHP*.35)n*=1+b.executeDamage;if(e.slow>0||e.stun>0||e.root>0)n*=1+b.slowDamage;}
  const result=old.damage.call(this,e,n,kind);
  // A separate proc cannot recursively activate itself, leech, bleed, or career hits.
  if(kind==='hit'&&before>e.hp&&!e.dead&&(b.onHitPower||b.onHitWis))old.damage.call(this,e,baseCombatPower(this.p,CLASSES[this.p.cls])*b.onHitPower+totalAttributes(this.p).wis*b.onHitWis,'proc');
  return result;
 };
}
