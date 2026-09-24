import {MAPS,DIALOGUES,QUESTS} from './data-v14.js';
import {SCENERY} from './world-v14.js';
import {CH5_MAPS,CH5_SCENERY,CH5_GROUND_STYLE} from './chapter5-world-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {registerCityWorldV18} from './city-world-v18.js';
import {CITY_STORIES_V18,CITY_STORY_PLACES_V18} from './city-story-v18.js';

const PREFIX='v18city:',copy=v=>JSON.parse(JSON.stringify(v)),IDS=['bread','chime','mint'];
const END={bread:3,chime:5,mint:3};
const QUEST_IDS={bread:'ch5V18CityBread',chime:'ch5V18CityChime',mint:'ch5V18CityMint'};
const questKey=id=>IDS.find(k=>QUEST_IDS[k]===id);
const fresh=()=>({schema:1,serial:0,quests:{bread:{step:0,roll:null},chime:{step:0,roll:null,choice:null},mint:{step:0,roll:null,found:[]}},active:null});
const state=g=>g.cityStoriesV18||(g.cityStoriesV18=fresh());
const alive=g=>g.flags.ch5CitySeen&&g.p.cls!=='saint'&&!g.p.career?.preview&&!g.memoryV13?.active&&g.p.hp>0&&MAPS[g.map]?.safe&&!g.enemies.some(e=>!e.dead);
const allowed=g=>alive(g)&&!g.pending&&!state(g).active;
const near=(g,p,r=150)=>p&&Math.hypot(g.p.x-p.x,g.p.y-p.y)<r&&g.clearLine(g.p,p,false);
const npcNear=(g,key)=>{const a=CITY_STORY_PLACES_V18[key];return g.map===a.home&&near(g,g.npcs.find(n=>n.id===a.npc));};
const propNear=(g,id)=>{const p=g.props.find(p=>p.id===id);return p&&near(g,{x:p.interactX??p.x,y:p.interactY??p.y},125);};
const ready=(g,key)=>state(g).quests[key].step===(key==='chime'?4:2);
function stage(id,map,actors){const meta=Object.fromEntries(Object.keys(actors).map(k=>[k,k==='hero'?{renderAs:'hero'}:{sprite:k==='saint'?0:k==='v18-bread-vendor'?5:k==='ch5Smith'||k==='ch5Alchemist'?11:12}]));const target=Object.keys(actors).find(k=>!['hero','saint'].includes(k))||'saint';const s={map,actors:copy(actors),actorMeta:meta,initiallyHidden:[],commitActor:'hero',focus:[actors.hero[0]+40,actors.hero[1]-50],faceTargets:{hero:target,saint:target,[target]:'hero'},beats:[{line:0,moves:[]}]};STAGING.scenes[id]=CHAPTER_STAGING[id]=s;CINEMATIC_SCENES.add(id);}
function register(){
 registerCityWorldV18({MAPS,SCENERY,CH5_MAPS,CH5_SCENERY,CH5_GROUND_STYLE,V11_GROUND_STYLE});
 Object.assign(DIALOGUES,copy(CITY_STORIES_V18));
 const elsewhere={v18CityBreadFound:['ch5NightMarket',{hero:[530,705],saint:[620,710],'v18-bread-vendor':[475,650]}],v18CityChimeFound:['ch5BellTerrace',{hero:[1020,470],saint:[1115,480]}],v18CityChimeInstalled:['ch5BellTerrace',{hero:[1035,480],saint:[1120,485]}],v18CityMintLeaves:['ch5LanternQuay',{hero:[380,420],saint:[485,430]}],v18CityMintDew:['ch5LanternQuay',{hero:[1130,490],saint:[1235,500]}]};
 for(const[id,lines]of Object.entries(CITY_STORIES_V18)){
  if(elsewhere[id]){stage(id,...elsewhere[id]);continue;}
  const key=id.includes('Bread')?'bread':id.includes('Chime')?'chime':id.includes('Mint')?'mint':null;
  if(key){const place=CITY_STORY_PLACES_V18[key];stage(id,place.home,place.actors);}
 }
 for(const [id,name]of Object.entries({bread:'写错的酒单',chime:'不肯响的风铃',mint:'太苦的好药'})){const a=CITY_STORY_PLACES_V18[id];QUESTS[QUEST_IDS[id]]={name,type:'支线',giver:a.npc,map:a.home,desc:{bread:'替瑟琳娜弄清夜市送错饼的原因。',chime:'看看格蕾娜做的风铃出了什么问题。',mint:'和艾莉娅一起为弥娅找一种更容易服药的办法。'}[id]};}
}
const expect={
 v18CityBreadStart:['bread',0,1],v18CityBreadFound:['bread',1,2],v18CityBreadFinish:['bread',2,3],
 v18CityChimeStart:['chime',0,1],v18CityChimeFound:['chime',1,2],v18CityChimeSoft:['chime',2,3],v18CityChimeClear:['chime',2,3],v18CityChimeInstalled:['chime',3,4],v18CityChimeFinish:['chime',4,5],
 v18CityMintStart:['mint',0,1],v18CityMintLeaves:['mint',1,null],v18CityMintDew:['mint',1,null],v18CityMintFinish:['mint',2,3]
};
const sceneForProp={
 'v18-city-quay-rail':'v18CityQuayRail','v18-city-rain-basin':'v18CityRainBasin','v18-city-market-ribbons':'v18CityRibbons','v18-city-market-mender':'v18CityMender','v18-city-market-samples':'v18CitySamples','v18-city-star-chart':'v18CityStars','v18-city-bell-rope':'v18CityBellRope','v18-city-guest-wash':'v18CityGuestWash','v18-city-guest-window':'v18CityGuestWindow','v18-city-guest-ledger':'v18CityGuestLedger','v18-city-guest-bed':'v18CityGuestBed'
};
function begin(g,scene){
 if(!allowed(g)||!DIALOGUES[scene])return false;const transition=expect[scene];
 if(!transition){g.beginScene(scene);return true;}
 const [key,from,to]=transition,s=state(g),q=s.quests[key];if(q.step!==from||s.serial>=1000000)return false;
 if(scene==='v18CityMintLeaves'&&q.found.includes('leaves')||scene==='v18CityMintDew'&&q.found.includes('dew'))return false;
 s.serial++;s.active={scene,key,from,to,token:s.serial};g.beginScene(scene,PREFIX+'done:'+s.serial);return true;
}
const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const integer=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
export function validateCitySaveV18(saved){
 const s=saved.cityStoriesV18;if(s===undefined)return true;const fail=()=>{throw new Error('阙灯城人物差事记录不完整。');};
 if(!object(s)||s.schema!==1||!integer(s.serial,0,1000000)||!object(s.quests)||Object.keys(s.quests).length!==3||IDS.some(k=>!object(s.quests[k]))||Object.keys(s).some(k=>!['schema','serial','quests','active'].includes(k)))fail();
 for(const key of IDS){const q=s.quests[key];if(!integer(q.step,0,END[key])||(q.step===0?q.roll!==null:!integer(q.roll,0,2)))fail();
  if(Object.keys(q).some(k=>!['step','roll',...(key==='chime'?['choice']:key==='mint'?['found']:[])].includes(k)))fail();
  if(key==='chime'&&(q.step<3?q.choice!==null:!['soft','clear'].includes(q.choice)))fail();
  if(key==='mint'&&(!Array.isArray(q.found)||q.found.length>2||new Set(q.found).size!==q.found.length||q.found.some(x=>!['leaves','dew'].includes(x))||q.step===0&&q.found.length||q.step===1&&q.found.length>1||q.step>=2&&q.found.length!==2))fail();
  const qstate=saved.quests?.[QUEST_IDS[key]];if(q.step>0&&qstate!==(q.step===END[key]?'done':'active'))fail();
 }
 if(s.active!==null){const a=s.active,e=expect[a?.scene];if(!object(a)||!e||Object.keys(a).some(k=>!['scene','key','from','to','token'].includes(k))||a.key!==e[0]||a.from!==e[1]||a.to!==e[2]||s.quests[a.key].step!==a.from||!integer(a.token,1,s.serial)||saved.map!==STAGING.scenes[a.scene]?.map||!saved.pending||saved.pending.id!==a.scene||saved.pending.then!==PREFIX+'done:'+a.token)fail();}
 return true;
}
function reward(g,key){
 // This outcome was fixed when the request was accepted; it is not re-rolled
 // at the last dialogue or when a save is reopened. Consumables cannot fill bags.
 const q=state(g).quests[key];g.p.gold+=25;
 if(key==='bread'){g.addItem('hpLarge',1);g.addItem('mpLarge',1);}
 if(key==='chime')g.addItem('ch5LampCore',2);
 if(key==='mint')g.addItem('hpLarge',2);
 const random=[['mpLarge',1],['ch5GoldSand',2],['ch5LampCore',1]][q.roll];g.addItem(...random);
 g.gainXP(150);g.say('完成：'+QUESTS[QUEST_IDS[key]].name+'。'+CITY_STORY_PLACES_V18[key].speaker+'把准备好的谢礼交给了你。');
 g.emit('city-story-completed',{id:key});g.onCityStoryCompleteV18?.(key);g.rollRecruitTicketV18?.('city-quest:'+key,{chance:.22});
}
export function installCityV18(RPG){
 const P=RPG.prototype;if(P._cityV18Installed)return;P._cityV18Installed=true;register();
 const old={};for(const k of ['restore','snapshot','npcOptions','choose','apply','useProp','available','ready','questGoal','trackedGoal','questPropNeeded'])old[k]=P[k];
 P.restore=function(s){validateCitySaveV18(s);old.restore.call(this,s);this.cityStoriesV18=s.cityStoriesV18?copy(s.cityStoriesV18):fresh();};
 P.snapshot=function(){return {...old.snapshot.call(this),cityStoriesV18:copy(state(this))};};
 P.npcOptions=function(id){const out=old.npcOptions.call(this,id)||[];if(!alive(this))return out;const key=IDS.find(k=>CITY_STORY_PLACES_V18[k].npc===id&&CITY_STORY_PLACES_V18[k].home===this.map);if(!key)return out;const q=state(this).quests[key];
  const add=(label,verb,questState)=>out.push({label,action:PREFIX+verb+':'+key,questState});
  if(q.step===0)add({bread:'这一篮饼怎么了？',chime:'你还做风铃？',mint:'这一瓶有什么不对？'}[key],'accept','available');
  else if(key==='chime'&&q.step===2){add('只留一片铜，声音会不会更轻？','clear','advance');add('能做个睡觉时收起风铃的小扣吗？','soft','advance');}
  else if(ready(this,key))add({bread:'送错饼的原因找到了。',chime:'扣件装好了。',mint:'薄荷和凝露都带回来了。'}[key],'finish','ready');
  else if(q.step===END[key])add({bread:'新菜卖得怎么样？',chime:'守钟人睡得还好吗？',mint:'他愿意把药带走了吗？'}[key],'after','daily');
  else add(key==='chime'&&q.step===3?'新扣件要装在哪里？':'我再确认一下要去哪里。','progress','waiting');
  const priority={ready:0,advance:1,available:2,waiting:3,service:4,daily:5};return out.sort((a,b)=>(priority[a.questState]??4)-(priority[b.questState]??4));
 };
 P.choose=function(action){if(typeof action!=='string'||!action.startsWith(PREFIX))return old.choose.call(this,action);const [verb,key]=action.slice(PREFIX.length).split(':');if(!IDS.includes(key)||!allowed(this)||!npcNear(this,key))return false;const q=state(this).quests[key],name={bread:'Bread',chime:'Chime',mint:'Mint'}[key];
  if(verb==='accept'&&q.step===0)return begin(this,'v18City'+name+'Start');
  if(verb==='finish'&&ready(this,key))return begin(this,'v18City'+name+'Finish');
  if(key==='chime'&&q.step===2&&['soft','clear'].includes(verb))return begin(this,verb==='soft'?'v18CityChimeSoft':'v18CityChimeClear');
  if(verb==='after'&&q.step===END[key])return begin(this,'v18City'+name+'After');
  if(verb==='progress'){this.say(this.questGoal(QUEST_IDS[key]).text);return true;}return false;
 };
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(!id?.startsWith(PREFIX+'done:'))return old.apply.call(this,action);const s=state(this),a=s.active;if(!a||id!==PREFIX+'done:'+a.token||!alive(this)||this.map!==STAGING.scenes[a.scene]?.map||s.quests[a.key].step!==a.from)return false;
  const q=s.quests[a.key];s.active=null;
  if(a.from===0){q.roll=Math.min(2,Math.floor(Math.max(0,this.rng())*3));this.quests[QUEST_IDS[a.key]]='active';this.flags.tracked=QUEST_IDS[a.key];}
  if(a.scene==='v18CityChimeSoft'||a.scene==='v18CityChimeClear')q.choice=a.scene==='v18CityChimeSoft'?'soft':'clear';
  if(a.scene==='v18CityMintLeaves'||a.scene==='v18CityMintDew'){q.found.push(a.scene==='v18CityMintLeaves'?'leaves':'dew');q.step=q.found.length===2?2:1;}
  else q.step=a.to;
  if(q.step===END[a.key]){this.quests[QUEST_IDS[a.key]]='done';if(this.flags.tracked===QUEST_IDS[a.key])this.flags.tracked=null;reward(this,a.key);}
  this.saveEvent();return true;
 };
 P.useProp=function(id,confirmed){const p=this.props.find(p=>p.id===id);if(!p?.action?.startsWith(PREFIX))return old.useProp.call(this,id,confirmed);if(!allowed(this)||!propNear(this,id))return false;
  if(sceneForProp[id])return begin(this,sceneForProp[id]);
  const s=state(this);
  if(id==='v18-city-bread-note'){if(s.quests.bread.step===1)return begin(this,'v18CityBreadFound');this.say('便签上的字沾了油。先去问问长夜酒馆的瑟琳娜，她认得自己的笔迹。');return true;}
  if(id==='v18-city-chime'){if(s.quests.chime.step===1)return begin(this,'v18CityChimeFound');if(s.quests.chime.step===3)return begin(this,'v18CityChimeInstalled');this.say(s.quests.chime.step>=4?'新扣件已经挂好，可以收住碰响的铜片。':'铜片裹着软布，背面刻着格蕾娜的名字。可以先去工坊问她。');return true;}
  if(id==='v18-city-mint'||id==='v18-city-dew'){const part=id==='v18-city-mint'?'leaves':'dew',q=s.quests.mint;if(q.step===1&&!q.found.includes(part))return begin(this,part==='leaves'?'v18CityMintLeaves':'v18CityMintDew');this.say(q.found.includes(part)?'需要的那份已经收好了。':part==='leaves'?'嫩叶长在雨棚里侧。弥娅熟悉这里的草，可以先去问她。':'瓶身刻着弥娅的名字。先问过她，再碰这只接露瓶。');return true;}
  return false;
 };
 P.available=function(id){const key=questKey(id);return key?!!this.flags.ch5CitySeen&&state(this).quests[key].step===0:old.available.call(this,id);};
 P.ready=function(id){const key=questKey(id);return key?ready(this,key):old.ready.call(this,id);};
 P.questGoal=function(id){const key=questKey(id);if(!key)return old.questGoal.call(this,id);const q=state(this).quests[key],place=CITY_STORY_PLACES_V18[key];if(q.step===END[key])return {text:'已完成',map:null,completed:true,type:'支线任务'};
  if(q.step===0)return {text:'去找'+place.speaker+'聊聊。',map:place.home,target:place.npc,type:'支线任务'};
  if(ready(this,key)||key==='chime'&&q.step===2)return {text:'返回'+MAPS[place.home].name+'，把情况告诉'+place.speaker+'。',map:place.home,target:place.npc,type:'支线任务'};
  const text=key==='bread'?'绮灯夜市西侧 → 看看烤炉旁的送货便签。':key==='chime'?q.step===3?'听风钟台东北栏杆 → 装上格蕾娜做的扣件。':'听风钟台东北栏杆 → 查看缠着布条的风铃。':q.found.includes('leaves')?'穿过水灯河岸的桥，到东岸取弥娅的接露瓶。':q.found.includes('dew')?'水灯河岸西岸雨棚 → 挑几片温薄荷的新叶。':'水灯河岸 → 西岸雨棚的温薄荷、东岸屋檐下的接露瓶。';
  return {text,map:place.goal,target:key==='mint'&&q.found.includes('leaves')?'v18-city-dew':place.prop,type:'支线任务'};
 };
 P.trackedGoal=function(){const key=questKey(this.flags.tracked);return key?this.questGoal(QUEST_IDS[key]):old.trackedGoal.call(this);};
 P.questPropNeeded=function(id){const s=state(this);if(id==='v18-city-bread-note'&&s.quests.bread.step===1||id==='v18-city-chime'&&[1,3].includes(s.quests.chime.step)||id==='v18-city-mint'&&s.quests.mint.step===1&&!s.quests.mint.found.includes('leaves')||id==='v18-city-dew'&&s.quests.mint.step===1&&!s.quests.mint.found.includes('dew'))return true;return old.questPropNeeded.call(this,id);};
}
