import {installV11Staging} from './staging-extension-v14.js';
import {V11_MAPS,V11_SCENERY,V11_ENEMY_GROUPS,V11_DOOR_PATCHES,V11_BOSS_LAYOUTS} from './chapter34-world-v14.js';
import {MAPS,SKILLS,ITEMS,QUESTS,DIALOGUES} from './data-v14.js';
import {SCENERY} from './world-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {WORLD_ADDITIONS} from './exploration-v14.js';
import {V11_BOSS_PROFILES,V11_BOSS_REWARDS,V11_ECONOMY} from './combat-data-v14.js';
import {ENCHANT_RULES,ENCHANT_DEFS,rollEnchantment} from './enchantments-v14.js';
import {normalizeGear} from './equipment-v14.js';
import {migrateAttunement} from './attunement-v14.js';
const clone=v=>JSON.parse(JSON.stringify(v));
const extended=id=>!!V11_MAPS[id],deep=id=>V11_MAPS[id]?.chapterRegion===4;
const fresh=()=>({seed:1864439841,claims:{},visits:{},bossWins:{},activeBoss:null,pendingEnchant:null,enchantRolls:0,tutorialUsed:false});
const state=g=>g.v11||(g.v11=fresh());
const rand=g=>{const h=state(g);let x=h.seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;h.seed=x>>>0;return h.seed/4294967296;};
const deepType=t=>({hellHound:'deepHound',hellSoul:'deepSoul',hellGuard:'deepGuard'}[t]||t);
const bossScene={ironScuttler:['ch3AdvanceBoss1Before','ch3AdvanceBoss1After'],furnaceSentinel:['ch3AdvanceBoss2Before','ch3AdvanceBoss2After'],odric:['ch4Boss1Before','ch4Boss1After'],martha:['ch4Boss2Before','ch4Boss2After'],severin:['ch4Boss3Before','ch4Boss3After']};
const bossFlag={ironScuttler:'ch3Advance1',furnaceSentinel:'ch3Advance2',odric:'ch4Odric',martha:'ch4Martha',severin:'ch4Severin'};
const gateFlag={'v11-quarry-cleared':'ch3Advance1','v11-sluice-cleared':'ch3Advance2','v11-court-cleared':'ch4Odric','v11-bastion-cleared':'ch4Martha','v11-cloister-cleared':'ch4Severin'};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const pay=(g,cost)=>{for(const [k,n]of Object.entries(cost))if((k==='gold'?g.p.gold:g.p.items[k]||0)<n){g.say('还缺'+(k==='gold'?'金币':ITEMS[k]?.name||k)+'。');return false;}for(const[k,n]of Object.entries(cost)){if(k==='gold')g.p.gold-=n;else g.p.items[k]=(g.p.items[k]||0)-n;}return true;};
const claim=(g,key,fn)=>{const h=state(g);if(h.claims[key])return false;h.claims[key]=true;fn();g.saveEvent();return true;};
function open(g,kind){g.active=false;g.p.moving=false;g.moveTo=null;g.emit('mechanism',{kind:'v11-'+kind});}
export const enchantPrice=g=>state(g).tutorialUsed?ENCHANT_RULES.price:ENCHANT_RULES.tutorialPrice;
function addStage(id,map,actors,meta={},thenFocus){const st={map,actors,actorMeta:meta,initiallyHidden:[],beats:[{line:0,moves:[]}],commitActor:'hero',focus:thenFocus||[actors.hero[0]+35,actors.hero[1]-20],faceTargets:{hero:actors.boss?'boss':actors.deepEnchanter?'deepEnchanter':'saint',saint:actors.boss?'boss':actors.deepEnchanter?'deepEnchanter':'hero',...(actors.boss?{boss:'hero'}:{}),...(actors.deepEnchanter?{deepEnchanter:'hero'}:{})}};STAGING.scenes[id]=CHAPTER_STAGING[id]=st;CINEMATIC_SCENES.add(id);}
function register(){
 for(const [id,m]of Object.entries(V11_MAPS)){MAPS[id]=clone(m);SCENERY[id]=clone(V11_SCENERY[id]);MAPS[id].blocks=[...m.blocks,...SCENERY[id].filter(x=>x.box).map(x=>x.box),...m.props.filter(x=>x.box).map(x=>x.box)];if(deep(id))MAPS[id].spawns=MAPS[id].spawns.map(s=>[deepType(s[0]),...s.slice(1)]);}
 for(const patch of V11_DOOR_PATCHES){const m=MAPS[patch.map],i=m.doors.findIndex(d=>d.to===patch.matchTo);if(i>=0)m.doors[i]=clone(patch.replacement);}
 for(const [id,m]of Object.entries(V11_MAPS))for(const t of MAPS[id].spawns||[])WORLD_ADDITIONS.idleAI[t[0]]={radius:45,pause:[.8,1.8],speed:t[0].endsWith('Hound')?52:38};
 for(const b of Object.values(V11_MAPS).filter(m=>m.bossType))V11_BOSS_PROFILES[b.bossType].name=b.bossName;
 ITEMS.ashGlass={...V11_ECONOMY.materials.ashGlass,desc:V11_ECONOMY.materials.ashGlass.description};
 QUESTS.ch4={name:'地狱深处',type:'主线',giver:'deepEnchanter',xp:0,gold:0,desc:'循着营地外的旧路穿过灰冕前庭、残旗行馆与无钟回廊，寻找出口。'};
 const ns=MAPS.deepCamp.npcs;ns.find(n=>n.id==='deepEnchanter').name='赫伦';ns.find(n=>n.id==='deepMerchant').name='薇塔';ns.find(n=>n.id==='deepInnkeeper').name='兰恩';
 for(const [map,b]of Object.entries(V11_BOSS_LAYOUTS)){const a=b.cinematicStage;for(const id of bossScene[b.bossType])addStage(id,map,a,{hero:{renderAs:'hero'},saint:{sprite:0},boss:{renderAs:'enemy',type:b.bossType,isBoss:true,angle:Math.PI,fall:id.endsWith('After')?.85:0}},[(a.hero[0]+a.boss[0])/2,a.hero[1]-30]);}
 addStage('ch3AdvanceIntro','hellApproach',{hero:[340,750],saint:[425,795]});
 addStage('ch4Arrival','deepGate',{hero:[315,795],saint:[380,845]});
 addStage('ch4SmithLesson','deepCamp',{hero:[1090,545],saint:[995,590],deepEnchanter:[1050,465]});
 addStage('ch4SealedDoor','deepSeal',{hero:[1070,520],saint:[965,555]}, {},[1070,450]);
 addStage('ch4End','deepCamp',{hero:[600,730],saint:[675,775]});
}
function tune(g,id){for(const grp of V11_ENEMY_GROUPS[id]||[])for(const e of g.states[id]?.enemies||[]){if(!grp.members.includes(e.id))continue;e.groupId=grp.id;e.leashRadius=grp.leash;if(grp.eliteIds.includes(e.id)&&(!e.v11Elite||!e.elite)){e.elite=true;e.label='精英 · '+(deep(id)?'葬誓近卫':'灰甲守卫');e.hp=e.maxHP=Math.round(e.maxHP*1.3);e.v11Elite=true;}}}
function inSafe(g){return !!MAPS[g.map]?.safe&&!g.enemies.some(e=>!e.dead)&&g.p.hp>0;}
export function installChapter4(RPG,{stats,loot}){
 register();installV11Staging();const P=RPG.prototype,old={};for(const key of ['restore','snapshot','enter','ensureMap','canDoor','objective','apply','choose','npcOptions','useProp','update','handleHellDeath','respawn','sell','hellAction','canSave','saveBlockReason'])old[key]=P[key];
 P.ensureMap=function(id){old.ensureMap.call(this,id);if(extended(id))tune(this,id);};
 P.restore=function(s){old.restore.call(this,s);this.v11=s.v11?clone(s.v11):fresh();if(s.version<11&&s.flags?.ch3Complete){this.flags.complete=false;this.flags.ch4Started=true;this.quests.ch4='active';this.chapter=21;this.map='deepGate';this.p.x=280;this.p.y=820;this.pending={id:'ch4Arrival',then:'v11:arrived4'};this.ensureMap('deepGate');}if(this.v11.activeBoss&&!this.states[this.map]?.enemies.some(e=>(e.v11Boss===this.v11.activeBoss||e.v11Add===this.v11.activeBoss)&&!e.dead))this.v11.activeBoss=null;};
 P.snapshot=function(){return {...old.snapshot.call(this),v11:clone(state(this))};};
 P.enter=function(id,x,y){const h=state(this),visited=!!this.states[id];old.enter.call(this,id,x,y);if(this.map!==id||!extended(id))return;h.visits[id]=(h.visits[id]||0)+1;
  if(visited&&!MAPS[id].safe){this.states[id].enemies=(this.states[id].enemies||[]).filter(e=>e.v11Boss&&!e.dead);for(const a of MAPS[id].spawns){const at=this.safePoint(a[1]+(rand(this)-.5)*38,a[2]+(rand(this)-.5)*38);this.enemies.push(this.enemy(a[0],at.x,at.y,a[3]));}for(const p of this.props)if(p.refresh)p.used=rand(this)<.2;}
  tune(this,id);if(this.pending)return;
  if(id==='hellApproach'&&!h.claims.advanceIntro)this.beginScene('ch3AdvanceIntro','v11:advanceIntro');
  if(id==='deepCamp'&&!h.claims.camp){h.claims.camp=true;this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;this.say('铁火营地 · 首次歇脚。生命与法力恢复。');this.beginScene('ch4CampWelcome');}
  this.saveEvent();};
 P.startChapterFour=function(preview=false){if(preview){this.startChapterThree(true);this.pending=null;this.events=[];this.flags.ch3HeroRecovered=true;this.flags.ch3TreatmentApplied=true;this.flags.ch3Advance1=true;this.flags.ch3Advance2=true;this.ch3.stage='exit';this.p.level=14;this.p.ap=9;this.p.sp=7;this.p.gold=350;this.p.items={hp:10,mp:10,soulAsh:8,ashGlass:8};this.p.skills={q:3,e:3,crash:2,ashWard:1,boneBreak:1};this.p.knownBooks=['ashWard','boneBreak'];this.p.activeSkills=['q','e','crash','ashWard','boneBreak'];this.p.bar=[['q','e','crash','ashWard','hp','mp'],['boneBreak',null,null,null,null,'resonance']];for(const slot of Object.keys(this.p.gear))this.p.gear[slot]=loot(this.p.cls,12,()=>.4,{id:'ch4-preview-'+slot,slot,rarity:'rare'});this.ch3.saintBuild={...clone(this.p),cls:'saint',skills:{saintRay:1,saintMend:1,saintAegis:1,saintNova:1,saintChime:1},knownBooks:[],skillOrigins:{saintRay:'innate',saintMend:'innate',saintAegis:'innate',saintNova:'innate',saintChime:'innate'},activeSkills:['saintRay','saintMend','saintAegis','saintNova','saintChime'],bar:[['saintRay','saintMend','saintAegis','saintNova','saintChime','hp'],['mp',null,null,null,null,null]],skillSpent:{},gear:Object.fromEntries(Object.keys(this.p.gear).map(k=>[k,null]))};this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;}
  this.flags.complete=false;this.flags.ch3Complete=true;this.flags.ch4Started=true;this.quests.ch3='done';this.quests.ch4='active';this.chapter=21;this.active=true;this.enter('deepGate',280,820);this.beginScene('ch4Arrival','v11:arrived4');};
 P.canDoor=function(d){if(state(this).activeBoss)return '先解决挡路的首领和它的随从。';if(d.to==='hellWall'&&!this.flags.ch3Advance2)return '闸道上的炉卫还挡着路。';const flag=gateFlag[d.gate];if(flag&&!this.flags[flag])return '前面的道路被守门的亡魂挡住了。';if(extended(this.map))return null;return old.canDoor.call(this,d);};
 P.objective=function(){if(deep(this.map)){if(!this.flags.ch4EnchantUnlocked)return {text:'黑曜阶道东北 → 铁火营地，找炉边的赫伦打听道路与刻印',map:'deepCamp',target:'deepEnchanter'};for(const[type,map]of [['odric','deepCourt'],['martha','deepBastion'],['severin','deepCloister']])if(!this.flags[bossFlag[type]])return {text:`从铁火营地${type==='odric'?'东':type==='martha'?'北':'南'}口去${MAPS[map].name}，穿过西侧废墟，到东面的石坪`,map,target:MAPS[map].props.find(p=>p.action.startsWith('v11-boss'))?.id};if(!this.flags.ch4SealSeen)return {text:'无钟回廊东北出口 → 缄门深庭，查看尽头的石门',map:'deepSeal',target:'v11-deep-seal'};return {text:this.flags.ch4Complete?'深层探索继续：祭痕可挑战残响；回铁火营地补给、刻印':'沿原路返回铁火营地，和艾莉娅商量接下来的路',map:'deepCamp',target:'saint'};}
  if(this.flags.ch3Started&&this.map.startsWith('hell')&&this.ch3&&['arrival','road'].includes(this.ch3.stage)&&!this.flags.ch3Advance2){const map=this.flags.ch3Advance1?'hellSluice':'hellQuarry';return {text:this.flags.ch3Advance1?'断镐采场东北 → 烬潮闸道，击败东侧石坪的失控炉卫':'灰烬渡口东北 → 焚骨坡道 → 断镐采场，清理路障并击败噬铁螯兽',map,target:MAPS[map].props.find(p=>p.action.startsWith('v11-boss'))?.id};}return old.objective.call(this);};
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(id==='ch3:end'){this.startChapterFour();return;}if(!id?.startsWith('v11:'))return old.apply.call(this,action);const h=state(this),a=id.slice(4);
  if(a==='advanceIntro')h.claims.advanceIntro=true;
  else if(a==='arrived4')h.claims.arrived4=true;
  else if(a==='smith'){claim(this,'smith',()=>{this.flags.ch4EnchantUnlocked=true;this.addItem('ashGlass',3);this.addItem('soulAsh',2);});open(this,'enchant');}
  else if(a.startsWith('fight:'))this.spawnV11Boss(a.slice(6));
  else if(a.startsWith('after:')){const type=a.slice(6);h.claims['after:'+type]=true;if(type==='ironScuttler'){open(this,'roadReward');}else if(type==='furnaceSentinel')this.say('闸道已经通了。可以先整理装备，再往哭墙走。');}
  else if(a==='teaching'){h.claims.teachingIntro=true;open(this,'teaching');}
  else if(a==='seal'){this.flags.ch4SealSeen=true;this.saveEvent();}
  else if(a==='end'){this.flags.ch4Complete=true;this.flags.complete=false;this.chapter=24;this.quests.ch4='done';this.emit('ending');}
  this.saveEvent();};
 P.startV11Boss=function(type){const h=state(this),b=V11_BOSS_LAYOUTS[this.map];if(!b||b.bossType!==type||h.activeBoss||this.p.cls==='saint')return false;if(this.enemies.some(e=>!e.dead&&e.v11Boss))return false;if(!this.flags[bossFlag[type]])this.beginScene(bossScene[type][0],'v11:fight:'+type);else this.spawnV11Boss(type);return true;};
 P.spawnV11Boss=function(type){const h=state(this),b=V11_BOSS_LAYOUTS[this.map];if(!b||b.bossType!==type||h.activeBoss)return false;this.states[this.map].enemies=this.enemies.filter(e=>!e.v11Boss&&!e.v11Add);const e=this.enemy(type,...b.bossAnchor,'v11-boss-'+type);e.v11Boss=type;e.label=b.bossName;e.abilityCD=5;e.groupId='v11-boss-group';this.enemies.push(e);h.activeBoss=type;
  const guards=this.enemies.filter(v=>!v.dead&&b.storyGuards.includes(v.id));for(const v of guards){v.v11Add=type;v.groupId=e.groupId;}const count=Math.max(0,2-guards.length);for(let i=0;i<count;i++){const at=b.reinforcementPoints[i],v=this.enemy(deep(this.map)?i?'deepElite':'deepSoul':'hellHound',...at,'v11-add-'+type+'-'+i);v.v11Add=type;v.groupId=e.groupId;v.cd=2;this.enemies.push(v);}this.active=true;this.emit('resume');this.saveEvent();return true;};
 P.handleHellDeath=function(e){if(!extended(this.map))return old.handleHellDeath.call(this,e);const h=state(this),type=e.v11Boss;
  if(type){const first=!this.flags[bossFlag[type]],r=V11_BOSS_REWARDS[type],win=first?r.first:r.repeat;h.pendingBossAfter={type,first:!h.claims['after:'+type]};h.bossWins[type]=(h.bossWins[type]||0)+1;this.flags[bossFlag[type]]=true;this.gainXP(win.xp);this.p.gold+=Array.isArray(win.gold)?win.gold[0]+Math.floor(rand(this)*(win.gold[1]-win.gold[0]+1)):win.gold;for(const[k,n]of Object.entries(win.items||{}))this.addItem(k,Array.isArray(n)?n[0]+Math.floor(rand(this)*(n[1]-n[0]+1)):n);
   if(first&&type==='ironScuttler')h.roadReward=true;
   this.dropCombatLoot(e);
   this.finishV11Encounter();this.saveEvent();return true;}
  const deepMap=deep(this.map),level=e.level||8,gap=this.p.level-level,mult=gap<=2?1:gap<=4?.75:gap<=6?.5:.25;this.gainXP(Math.round((e.rewardXP||34)*(deepMap?mult:1)));this.p.gold+=e.elite?10:5;
  if(deepMap&&rand(this)<(e.elite?1:.27))this.addItem('ashGlass',e.elite?2:1);
  if(rand(this)<.25)this.addItem(deepMap?'soulAsh':e.type==='hellGuard'?'cinderIron':'soulAsh');
  this.dropCombatLoot(e);this.finishV11Encounter();this.saveEvent();return true;};
 P.finishV11Encounter=function(){const h=state(this),a=h.pendingBossAfter;if(!a||this.enemies.some(e=>!e.dead&&(e.v11Boss===a.type||e.v11Add===a.type)))return false;h.pendingBossAfter=null;h.activeBoss=null;if(a.first)this.beginScene(bossScene[a.type][1],'v11:after:'+a.type);else this.say('残响散去。战利品已收好。');this.saveEvent();return true;};
 P.update=function(dt,input){old.update.call(this,dt,input);if(!this.active||this.pending||state(this).activeBoss)return;const b=V11_BOSS_LAYOUTS[this.map];if(b&&!this.flags[bossFlag[b.bossType]]&&dist(this.p,{x:b.bossAnchor[0],y:b.bossAnchor[1]})<250)this.startV11Boss(b.bossType);};
 P.npcOptions=function(id){const a=(label,action)=>({label,action});if(id==='saint'&&this.flags.ch3HeroRecovered){return [...(deep(this.map)&&this.flags.ch4SealSeen&&!this.flags.ch4Complete&&this.map==='deepCamp'?[a('这条路走不通，先在营地落脚。','v11:endTalk')]:[]),a('教我你会的那些技法。','v11:teachingTalk'),a('绷带还要再换吗？','ch3:saintIdle')];}if(id==='deepEnchanter')return [a(this.flags.ch4EnchantUnlocked?'替装备刻一道纹。':'你怎么把灰留在铁里？','v11:smithTalk'),a('这一带的路怎么走？','v11:directions')];if(id==='deepMerchant')return [a('看看药品。','v11:shop'),a('你的货从哪儿来？','v11:merchantTalk')];if(id==='deepInnkeeper')return [a('歇一会儿。 · 25 金','v11:rest'),a('这炉火能撑多久？','v11:innTalk')];return old.npcOptions.call(this,id);};
 P.choose=function(a){if(!a.startsWith('v11:'))return old.choose.call(this,a);const k=a.slice(4);if(k==='smithTalk'){if(!this.flags.ch4EnchantUnlocked)this.beginScene('ch4SmithLesson','v11:smith');else open(this,'enchant');}else if(k==='shop')open(this,'shop');else if(k==='rest')this.v11Action('rest');else if(k==='teachingTalk'){if(!inSafe(this)){this.say('先到营地坐下，再练习这些技法。');return;}this.beginScene(state(this).claims.teachingIntro?'ch3TeachingRepeat':'ch3TeachingIntro','v11:teaching');}else if(k==='endTalk')this.beginScene('ch4End','v11:end');else if(k==='directions')this.hellTalk('赫伦','东边就是旧城的前庭，穿过去是行馆，再往里走就是回廊。北边、南边的小道都能绕回营地，沿途认着炉灯，别走岔了。');else if(k==='merchantTalk')this.hellTalk('薇塔','药归兰恩熬，瓶子归我找。为了挑出这些没裂的瓶子，我可跑了三趟，你别嫌贵。用完的空瓶记得带回来，洗干净还能装。');else if(k==='innTalk')this.hellTalk('兰恩','有赫伦守着添炭，这炉火熄不了。有时他都睡着了，手里还攥着火钳，我费半天劲才能拿出来。');};
 P.useProp=function(id,confirmed){const p=this.props.find(p=>p.id===id);if(!p?.action?.startsWith('v11-'))return old.useProp.call(this,id,confirmed);const a=p.action,h=state(this);
  if(a.startsWith('v11-boss-')){this.startV11Boss(V11_MAPS[this.map].bossType);return;}
  if(a==='v11-deep-enchant')return this.choose('v11:smithTalk');if(a==='v11-deep-shop')return open(this,'shop');if(a==='v11-deep-rest')return this.v11Action('rest');if(a==='v11-deep-seal'){this.beginScene('ch4SealedDoor','v11:seal');return;}if(a==='v11-deep-return'){this.enter('deepCamp',600,730);return;}
  if(p.refresh){if(!p.used){p.used=true;this.addItem(a==='v11-deep-ore'?'ashGlass':'cinderIron',1+Math.floor(rand(this)*2));this.saveEvent();}return;}
  const key=p.limitedClaim||p.id;if(h.claims[key]){if(a==='v11-quarry-winch')open(this,'roadReward');else this.say('这里已经收拾过了。');return;}
  if(a==='v11-quarry-winch'){claim(this,key,()=>{this.addItem('hp',2);this.addItem('mp',2);this.gainXP(100);});this.hellTalk('诺恩','绞盘下面压着几瓶药，还没漏，可以带走。');}
  else if(a==='v11-sluice-pump'){claim(this,key,()=>{this.addItem('emberLanceBook');this.addItem('cinderIron',3);this.gainXP(90);});this.hellTalk('诺恩','泵壳里藏着一份练习页，上面还标着握杖的位置。');}
  else if(a==='v11-cloister-font'){claim(this,key,()=>{this.addItem('skillReset');this.addItem('ashGlass',4);});this.hellTalk('艾莉娅','盆底放着几支封好的药管。那支已经裂了，先别碰。');}
  else claim(this,key,()=>{this.addItem('hp',3);this.addItem('mp',2);this.p.gold+=15;});this.saveEvent();};
 P.teachableSkills=function(){const b=this.ch3?.saintBuild||this.ch3?.saintActor;return b?Object.keys(b.skills).filter(k=>SKILLS[k]&&b.skills[k]>0):[];};
 P.v11Action=function(a,arg,arg2){const h=state(this);if(this.p.hp<=0)return false;
  if(a==='teach'){if(!this.flags.ch3HeroRecovered||this.p.cls==='saint'||!inSafe(this)||!this.teachableSkills().includes(arg))return false;if(this.p.skills[arg]>0){this.say('这项技法已经会了。继续提升要用自己的技能点。');return false;}this.p.skills[arg]=1;this.p.skillOrigins=this.p.skillOrigins||{};this.p.skillOrigins[arg]='taught';if(SKILLS[arg].book&&!this.p.knownBooks.includes(arg))this.p.knownBooks.push(arg);this.p.skillSpent[arg]=0;this.say('学会 '+SKILLS[arg].name+' · 请自行选择是否激活');this.saveEvent();open(this,'teaching');return true;}
  if(a==='roadReward'){if(!h.roadReward||!['boneBreakBook','emberLanceBook','ashWardBook'].includes(arg))return false;h.roadReward=false;this.addItem(arg);this.saveEvent();return true;}
  if(this.map!=='deepCamp'||!inSafe(this))return false;
  if(a==='buy'){const row=V11_ECONOMY.shop[Number(arg)];if(!row||!pay(this,{gold:row.price}))return false;this.addItem(row.item,row.bundle);this.saveEvent();open(this,'shop');return true;}
  if(a==='rest'){if(!pay(this,{gold:25}))return false;this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;this.say('靠着炉边歇了一会儿，生命与法力恢复。');this.saveEvent();return true;}
  if(a==='enchant'){if(!this.flags.ch4EnchantUnlocked||h.pendingEnchant)return false;const target=[...this.p.bag,...Object.values(this.p.gear).filter(Boolean)].find(i=>i.id===arg);if(!target||!ENCHANT_RULES.allowedItemRarity.includes(target.rarity))return false;if(!['all','stat','element','skill'].includes(arg2||'all'))return false;if(!Object.values(ENCHANT_DEFS).some(d=>d.slots.includes(target.slot)&&(!arg2||arg2==='all'||d.kind===arg2)))return false;if(!pay(this,enchantPrice(this)))return false;const result=rollEnchantment(target.slot,()=>rand(this),'v11-'+(h.enchantRolls+1),arg2||'all');h.enchantRolls++;h.tutorialUsed=true;h.pendingEnchant={gearId:target.id,slot:target.slot,result};this.saveEvent();open(this,'enchant');return true;}
  if(a==='adopt'||a==='keep'){const offer=h.pendingEnchant;if(!offer)return false;const target=[...this.p.bag,...Object.values(this.p.gear).filter(Boolean)].find(i=>i.id===offer.gearId);if(!target)return false;if(a==='adopt')target.enchantment=clone(offer.result);h.pendingEnchant=null;this.p.hp=Math.min(this.p.hp,stats(this.p).hp);this.p.mp=Math.min(this.p.mp,stats(this.p).mp);this.saveEvent();open(this,'enchant');return true;}return false;};
 P.canSave=function(){return !state(this).activeBoss&&old.canSave.call(this);};
 P.saveBlockReason=function(){return state(this).activeBoss?'首领与随从仍在战斗，结束后可保存。':old.saveBlockReason.call(this);};
 P.sell=function(id){if(state(this).pendingEnchant?.gearId===id){this.say('先决定是否采用这件装备的新刻印。');return false;}return old.sell.call(this,id);};
 P.hellAction=function(a,arg){if(a==='dismantle'&&state(this).pendingEnchant?.gearId===arg){this.say('先决定是否采用这件装备的新刻印。');return false;}return old.hellAction.call(this,a,arg);};
 P.respawn=function(){if(!extended(this.map))return old.respawn.call(this);const h=state(this);h.activeBoss=null;h.pendingBossAfter=null;for(const st of Object.values(this.states))st.enemies=st.enemies.filter(e=>!e.v11Boss&&!e.v11Add);this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;this.p.emotion=0;this.bullets=[];this.zones=[];this.active=true;this.enter(deep(this.map)?'deepCamp':'hellGate',deep(this.map)?600:340,deep(this.map)?730:835);this.saveEvent();};
}
