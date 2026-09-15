import {isStoryTestV25} from './story-test-v25.js';
import {reconcileSkillUnlocks} from './systems-runtime-v14.js';
import {QUEST_PROGRESS_DIALOGUE_V16} from './quest-dialogue-v16.js';
import {MAPS,ITEMS,QUESTS,SKILLS,DIALOGUES} from './data-v14.js';
import {SCENERY} from './world-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {WORLD_ADDITIONS} from './exploration-v14.js';
import {V11_BOSS_PROFILES,V11_DEEP_ENEMY_PROFILES} from './combat-data-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {normalizeGear} from './equipment-v14.js';
import {CH5_MAPS,CH5_SCENERY,CH5_ENEMY_PROFILES,CH5_GROUND_STYLE,CH5_STAGE_ANCHORS} from './chapter5-world-v14.js';
import {CH5_MATERIALS,CH5_QUESTS,CH5_SETS,CH5_SET_RECIPES,CH5_ALCHEMY,CH5_DRINKS,chapter5SetBonuses,chapter5DrinkModifiers} from './chapter5-economy-v14.js';
import {CH5_STORY} from './chapter5-story-v14.js';
const clone=v=>JSON.parse(JSON.stringify(v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const is5=id=>!!CH5_MAPS[id]&&!CH5_MAPS[id].privateMemory;
const fresh=()=>({schema:1,seed:15939131,stage:'arrival',claims:{},visits:{},quests:{},crafts:{},killCount:0,activeBoss:false,attempts:0,arcade:null,bookOffer:null,bookDraws:0});
const h=g=>g.ch5||(g.ch5=fresh());
const roll=g=>{let x=h(g).seed|0;x^=x<<13;x^=x>>>17;x^=x<<5;h(g).seed=x>>>0;return h(g).seed/4294967296;};
const safe=g=>is5(g.map)&&MAPS[g.map].safe&&g.p.hp>0&&!g.enemies.some(e=>!e.dead)&&!h(g).activeBoss;
const pay=(g,cost)=>{for(const [key,n]of Object.entries(cost))if((key==='gold'?g.p.gold:g.p.items[key]||0)<n){g.say('还缺'+(key==='gold'?'金币':ITEMS[key]?.name||key)+'。');return false;}for(const[key,n]of Object.entries(cost))if(key==='gold')g.p.gold-=n;else g.p.items[key]-=n;return true;};
function open(g,kind){g.active=false;g.p.moving=false;g.p.attackAnim=0;g.moveTo=null;g.emit('mechanism',{kind:'ch5-'+kind});}
const once=(g,key,reward)=>{if(h(g).claims[key])return false;h(g).claims[key]=true;reward();g.saveEvent();return true;};
const sideReady=(g,id)=>{const q=CH5_QUESTS[id],s=h(g).quests[id];return !!q&&!!s&&!s.claimed&&(s.kills||0)>=(q.kills||0)&&Object.entries(q.required).every(([k,n])=>(g.p.items[k]||0)>=n);};
const QUEST_SCENES={ch5ForgeWork:['ch5SmithWork','ch5SmithReturn','ch5SmithDaily'],ch5DewWork:['ch5AlchemyWork','ch5AlchemyReturn','ch5AlchemyDaily'],ch5Names:['ch5ArchiveWork','ch5ArchiveReturn','ch5ArchiveDaily']};
function talk(g,id,then=null,lines=null){if(g.pending)return false;if(!DIALOGUES[id])DIALOGUES[id]=lines||[['旁白','灯火在石墙上缓缓晃动。']];g.beginScene(id,then);return true;}
function stage(id,map,actors=CH5_STAGE_ANCHORS[map],extra={}){if(!actors)return;const meta=Object.fromEntries(Object.keys(actors).map(k=>[k,k==='hero'?{renderAs:'hero'}:k==='boss'?{renderAs:'enemy',type:'ch5Gatekeeper',isBoss:true}:{sprite:k==='saint'?0:k==='mentor'?5:12}]));const target=actors.mentor?'mentor':actors.boss?'boss':actors.ch5Barkeep?'ch5Barkeep':actors.ch5Archivist?'ch5Archivist':'saint';const stage={map,actors,actorMeta:meta,initiallyHidden:[],commitActor:'hero',focus:[actors.hero[0]+35,actors.hero[1]-65],faceTargets:{hero:target,saint:actors.mentor?'mentor':'hero',[target]:'hero'},beats:[{line:0,moves:[]}],...extra};STAGING.scenes[id]=CHAPTER_STAGING[id]=stage;CINEMATIC_SCENES.add(id);}
function register(){
 Object.assign(ITEMS,CH5_MATERIALS,CH5_DRINKS);QUESTS.ch5={name:'灯火之后',type:'主线',giver:'mentor',map:'ch5Memorial',xp:0,gold:0,desc:'沿白槲旧道寻找出口，听雷昂说完当年的事，带着新的身份离开禁地。'};
 for(const [id,q]of Object.entries(CH5_QUESTS))QUESTS[id]={...q,desc:q.route};
 for(const [id,map]of Object.entries(CH5_MAPS)){MAPS[id]=clone(map);SCENERY[id]=clone(CH5_SCENERY[id]);MAPS[id].blocks=[...map.blocks,...SCENERY[id].filter(o=>o.box).map(o=>o.box),...map.props.filter(o=>o.box).map(o=>o.box)];}
 Object.assign(V11_GROUND_STYLE,clone(CH5_GROUND_STYLE));
 for(const[id,p]of Object.entries(CH5_ENEMY_PROFILES)){(p.isBoss?V11_BOSS_PROFILES:V11_DEEP_ENEMY_PROFILES)[id]={...p};WORLD_ADDITIONS.idleAI[id]={radius:55,pause:[.7,1.7],speed:id==='ch5Hound'?54:38};}
 // The old future-return door remains closed. This road starts at the camp.
 if(!MAPS.deepCamp.doors.some(d=>d.to==='ch5AshRoad'))MAPS.deepCamp.doors.push({x:1425,y:835,to:'ch5AshRoad',tx:280,ty:760,label:'白槲旧道',direction:'东南',gate:'ch5-start'});
 MAPS.deepCamp.blocks=MAPS.deepCamp.blocks.flatMap(b=>{if(b[0]!==1470||b[2]!==130)return [b];const start=b[1],end=start+b[3],out=[];if(start<725)out.push([1470,start,130,Math.min(end,725)-start]);if(end>945)out.push([1470,Math.max(start,945),130,end-Math.max(start,945)]);return out.filter(v=>v[3]>0);});
 MAPS.ch5Tavern.npcs.find(n=>n.id==='ch5Barkeep').name='瑟琳娜';
 const stageBy={ch5Arrival:'ch5AshRoad',ch5MentorBefore:'ch5Memorial',ch5MentorAfter:'ch5Memorial',ch5FirstGate:'ch5Gate',ch5ReturnGate:'ch5Gate',ch5Setback:'ch5Crossroads',ch5CityArrival:'ch5CityGate',ch5TavernFirst:'ch5Tavern',ch5TavernSaint:'ch5Tavern',ch5TavernDrink:'ch5Tavern',ch5TavernRefuse:'ch5Tavern',ch5TavernMusic:'ch5Tavern',ch5BossVictory:'ch5Gate',ch5Exit:'ch5Exit',ch5CityFarewell:'ch5GrandSquare'};
 for(const[id,map]of Object.entries(stageBy))stage(id,map);
 for(const [id,q]of Object.entries(CH5_QUESTS)){DIALOGUES[id+'Accept']=q.accept;DIALOGUES[id+'Return']=q.complete;}
 // Environments without a named speaker stay observations, not fake new portraits.
 DIALOGUES.ch5RoadLetter=[['旁白','信封上只剩半个名字。里面的纸折得很齐，写信的人说：春天回来，把东边的篱笆修好。'],['艾莉娅','有人一直在等他。'],['诺恩','……收好吧。']];
 DIALOGUES.ch5HomeMark=[['旁白','门柱上刻着六条短线，最下面的一条旁边画了颗歪歪的星。'],['艾莉娅','我以前也替孩子们量过身高。每次都有人偷偷踮脚。'],['诺恩','这几道刻得很深。'],['艾莉娅','是啊。怕被雨洗掉吧。']];
 DIALOGUES.ch5QuarryCache=[['诺恩','匣子卡在石缝里。锁已经锈断了。'],['艾莉娅','先看看里面是不是有人留下的信。'],['诺恩','是练习册。空白页都磨毛了。']];
 Object.assign(DIALOGUES,CH5_STORY.DIALOGUES);Object.assign(STAGING.scenes,CH5_STORY.STAGING);Object.assign(CHAPTER_STAGING,CH5_STORY.STAGING);for(const id of Object.keys(CH5_STORY.STAGING))CINEMATIC_SCENES.add(id);
}
export function validateChapter5Save(s){if(!s.ch5)return;const a=s.ch5;if(a.schema!==1||!Number.isInteger(a.seed)||a.seed<0||a.seed>4294967295||!a.claims||!a.visits||!a.quests||!a.crafts||a.activeBoss)throw new Error('阙灯城旅程记录不完整。');for(const[id,q]of Object.entries(a.quests))if(!CH5_QUESTS[id]||typeof q.claimed!=='boolean'||!Number.isInteger(q.kills)||q.kills<0||q.kills>99999)throw new Error('第五章差事记录不完整。');if(a.bookOffer&&(!Array.isArray(a.bookOffer.items)||a.bookOffer.items.length<1||a.bookOffer.items.length>3))throw new Error('技法换取记录不完整。');}
export function installChapter5(RPG,{stats,loot}){
 register();const P=RPG.prototype,old={};for(const k of ['restore','snapshot','enter','canDoor','objective','apply','choose','npcOptions','useProp','update','handleHellDeath','respawn','canSave','saveBlockReason','hurt','damage','ready','available','questGoal','trackedGoal','updateCompanion','questPropNeeded'])old[k]=P[k];
 P.restore=function(s){old.restore.call(this,s);this.ch5=s.ch5?{...fresh(),...clone(s.ch5)}:fresh();this.ch5.activeBoss=false;if(is5(this.map)){this.flags.ch5Started=true;this.chapter=Math.max(25,this.chapter);this.quests.ch5=this.flags.ch5Complete?'done':'active';}this.p.ch5Drink=this.p.ch5Drink&&CH5_DRINKS[this.p.ch5Drink.id]?this.p.ch5Drink:null;};
 P.snapshot=function(){return {...old.snapshot.call(this),version:15,ch5:{...clone(h(this)),activeBoss:false}};};
 P.startChapterFive=function(preview=false){if(this.memoryV13?.active)return false;if(preview){this.startChapterFour(true);this.pending=null;this.events=[];this.flags.ch4Complete=true;this.flags.ch4SealSeen=true;this.flags.ch4Odric=true;this.flags.ch4Martha=true;this.flags.ch4Severin=true;this.flags.ch4EnchantUnlocked=true;this.quests.ch4='done';this.flags.ch5Preview=true;this.p.level=20;this.p.xp=0;this.p.gold=360;this.p.ap=12;this.p.sp=8;this.p.items={hpLarge:4,mpLarge:4,ashGlass:8,soulAsh:10,ch5GoldSand:2,ch5LampCore:2};this.p.attrs={str:this.p.cls==='oath'?14:5,dex:this.p.cls==='shadow'?15:5,vit:13,wis:this.p.cls==='ember'?15:5};delete this.p.career;delete this.p.careerState;this.p.skills={q:3,e:3,crash:2,ashWard:2,boneBreak:2};this.p.skillOrigins={q:'innate',e:'innate',crash:'innate',ashWard:'book',boneBreak:'book'};this.p.skillSpent={q:2,e:2,crash:1,ashWard:1,boneBreak:1};this.p.activeSkills=['q','e','crash','ashWard','boneBreak'];this.p.knownBooks=['ashWard','boneBreak'];reconcileSkillUnlocks(this.p,SKILLS);this.p.bar=[['q','e','crash','ashWard','hpLarge','mpLarge'],['boneBreak',null,null,null,null,'resonance']];for(const slot of Object.keys(this.p.gear))this.p.gear[slot]=slot==='offhand'?null:loot(this.p.cls,18,()=>.4,{id:'ch5-preview-'+this.p.cls+'-'+slot,slot,rarity:'rare'});this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;this.ch5=fresh();}
  if(!this.flags.ch4Complete)return false;this.flags.ch5Started=true;this.flags.complete=false;this.chapter=25;this.quests.ch5='active';this.flags.tracked=null;this.flags.mapGoal=null;this.enter('ch5AshRoad',280,760);return true;};
 P.enter=function(id,x,y){const visited=!!this.states[id];old.enter.call(this,id,x,y);if(this.map!==id||!is5(id))return;const s=h(this);s.visits[id]=(s.visits[id]||0)+1;
  if(visited){if(!MAPS[id].safe&&id!=='ch5Gate'){this.states[id].enemies=[];for(const spawn of MAPS[id].spawns){const at=this.safePoint(spawn[1]+(roll(this)-.5)*42,spawn[2]+(roll(this)-.5)*42);this.enemies.push(this.enemy(spawn[0],at.x,at.y,spawn[3]));}}
   for(const p of this.props)if(p.refresh)p.used=roll(this)<.16;}
  if(!this.flags.ch5Started){this.flags.ch5Started=true;this.flags.complete=false;this.chapter=25;this.quests.ch5='active';this.flags.tracked=null;this.flags.mapGoal=null;}
  for(const e of this.enemies){e.groupId=e.id.replace(/-\d+$/,'');e.leashRadius=550;}
  if(id==='ch5Gate')this.states[id].enemies=this.enemies.filter(e=>!e.ch5Boss);
  if(!this.pending){if(id==='ch5AshRoad'&&!s.claims.arrival)talk(this,'ch5Arrival','v14ch5:arrived');else if(id==='ch5CityGate'&&!s.claims.city)talk(this,'ch5CityArrival','v14ch5:city-seen');}
  this.saveEvent();};
 P.canDoor=function(d){if(h(this).activeBoss)return '光还封着桥面。先设法脱离守日者的攻势。';if(d.gate==='ch5-start'&&!this.flags.ch4Complete)return '先和艾莉娅谈完，再决定接下来的路。';if(d.gate==='ch5-career'&&(!this.p.career?.id||!this.flags.ch5MentorDone))return '先听雷昂把话说完，再熟悉他教的技法。';if(d.gate==='ch5-city'&&!this.flags.ch5CityUnlocked)return '这里仍是一整面石壁，钟声像是从很远的地方传来。';if(d.gate==='ch5-boss-clear'&&!this.flags.ch5BossDefeated)return '守日者仍在断桥上，去不了出口。';if(is5(this.map)||is5(d.to))return null;return old.canDoor.call(this,d);};
 P.objective=function(){if(!is5(this.map)&&!(this.flags.ch4Complete&&!this.flags.ch5Started&&this.map==='deepCamp'))return old.objective.call(this);
  if(!this.flags.ch5Started)return {text:'铁火营地东南 → 白槲旧道。先整顿行囊，去看看那盏远处的灯。',map:'deepCamp',target:null};
  if(!this.flags.ch5MentorReady)return {text:'白槲旧道东北 → 老宅庭院，找台阶边的雷昂。',map:'ch5Memorial',target:'mentor'};
  if(!this.p.career?.id)return {text:'在老宅庭院听雷昂讲解传承，选择一条转职道路。',map:'ch5Memorial',target:'mentor'};
  if(!this.flags.ch5MentorDone)return {text:'和雷昂说完临行前的话，再从庭院东口离开。',map:'ch5Memorial',target:'mentor'};
  if(!this.flags.ch5CityUnlocked)return {text:'老宅东口 → 裂灯岔道，沿东北的中央道路去白昼断桥。',map:'ch5Gate',target:'ch5-gate-seal'};
  if(!this.flags.ch5CitySeen)return {text:'返回裂灯岔道，南侧新开的铜门通向阙灯城。',map:'ch5CityGate',target:null};
  if(!this.flags.ch5BossDefeated)return {text:'阙灯城可铸套装、配药、练级、雇佣同伴。准备好后，从城门北口回断桥再战守日者。',map:this.p.level<23?'ch5Training':'ch5Gate',target:this.p.level<23?'ch5-training-bell':'ch5-gate-seal'};
  return {text:this.flags.ch5Complete?'地狱的旅程暂告一段落。阙灯城仍可探索与补给。':'穿过白昼断桥东北端，查看禁地出口的车辙与遗物。',map:'ch5Exit',target:'ch5-exit-track'};};
 P.trackedGoal=function(){if(is5(this.map)&&this.flags.tracked&&CH5_QUESTS[this.flags.tracked]&&this.quests[this.flags.tracked]==='active')return this.questGoal(this.flags.tracked);if(is5(this.map))return {...this.objective(),type:'主线任务'};return old.trackedGoal.call(this);};
 P.questGoal=function(id){const q=CH5_QUESTS[id];if(!q)return old.questGoal.call(this,id);if(this.quests[id]==='done')return {text:'已完成',map:null,completed:true,type:'支线任务'};if(this.quests[id]==='expired')return {text:'这件事暂时留在阙灯城。',map:null,suspended:true,type:'支线任务'};const ready=sideReady(this,id),requirements=Object.entries(q.required).map(([key,n])=>ITEMS[key].name+' '+Math.min(n,this.p.items[key]||0)+'/'+n);if(q.kills)requirements.unshift('清理空甲 '+Math.min(q.kills,h(this).quests[id]?.kills||0)+'/'+q.kills);return {text:ready?'回去见'+MAPS[q.map].npcs.find(n=>n.id===q.giver).name+'，交付'+q.name:requirements.join(' · '),detail:q.route,map:ready?q.map:id==='ch5DewWork'?'ch5Reservoir':id==='ch5Names'?'ch5Training':'ch5Quarry',target:ready?q.giver:null,type:'支线任务'};};
 P.ready=function(id){return CH5_QUESTS[id]?this.quests[id]==='active'&&sideReady(this,id):old.ready.call(this,id);};
 P.available=function(id){return CH5_QUESTS[id]?this.flags.ch5CitySeen&&!this.quests[id]:old.available.call(this,id);};
 P.npcOptions=function(id){if(!is5(this.map))return old.npcOptions.call(this,id);const option=(label,action,questState='service')=>({label,action:'v14ch5:'+action,questState});let out=[];
  if(id==='mentor'){if(!this.flags.ch5MentorReady)out.push(option('你怎么会在这里？','mentor-before','advance'));else if(!this.p.career?.id)out.push(option('教我你留下的技法。','career','advance'));else if(!this.flags.ch5MentorDone)out.push(option('这些力量，我会用好。','mentor-after','advance'));else out.push(option('出发前，再请教几句。','mentor-idle','daily'));return out;}
  for(const[qid,q]of Object.entries(CH5_QUESTS))if(q.giver===id&&this.map===q.map){const s=h(this).quests[qid];if(!s&&this.flags.ch5CitySeen)out.push(option(qid==='ch5ForgeWork'?'你在检查这批空甲？':qid==='ch5DewWork'?'这几只瓶子需要帮忙吗？':'你在抄什么？','quest-accept:'+qid,'available'));else if(s&&!s.claimed)out.push(option(sideReady(this,qid)?'东西备好了。':'还有什么要留意？',sideReady(this,qid)?'quest-claim:'+qid:'quest-progress:'+qid,sideReady(this,qid)?'ready':'waiting'));}
  if(id==='ch5Smith')out.push(option('替我铸一件合用的装备。','forge'),option('借我看一份练习册。','books'));
  if(id==='ch5Alchemist')out.push(option('看看调配机。','alchemy'),option('补充一些药水。','shop'));
  if(id==='ch5Barkeep')out.push(option('看看酒单。','tavern'),option('找张安静的桌子。','saint-table','daily'));
  if(id==='ch5Recruiter')out.push(option('有人愿意和我们同行吗？','mercenaries'));
  if(id==='ch5Archivist')out.push(option('这座城从哪里来？','archive-idle','daily'));
  if(id==='ch5Merchant')out.push(option('补充药品和同伴练习册。','shop'));
  if(id==='ch5GameHost')out.push(option('试试三盏回铃。','arcade'));
  if(id==='ch5GateHost')out.push(option('看看城里的告示。','city-notice','daily'));
  if(id==='ch5SquareMusician')out.push(option('在琴声里停一会儿。','music','daily'));
  if(id==='saint')out.push(option('去找个地方坐坐？','saint-table','daily'),option('教我你在路上学会的技法。','teaching'));
  return out.sort((a,b)=>({ready:0,advance:0,available:1,waiting:2,service:3,daily:4}[a.questState]-{ready:0,advance:0,available:1,waiting:2,service:3,daily:4}[b.questState]));};
 P.choose=function(action){if(!action.startsWith('v14ch5:'))return old.choose.call(this,action);const a=action.slice(7);if(a==='mentor-before')return talk(this,'ch5MentorBefore','v14ch5:mentor-unlocked');if(a==='mentor-after')return this.finishChapter5Career();if(a==='mentor-idle')return talk(this,'ch5MentorDaily');if(a==='career'){if(!this.flags.ch5MentorReady)return;this.active=false;this.emit('mechanism',{kind:'v14-career'});return;}
  if(a.startsWith('quest-')){const[verb,id]=a.split(':'),q=CH5_QUESTS[id];if(!q||this.map!==q.map)return;if(verb==='quest-accept'&&this.available(id))return talk(this,QUEST_SCENES[id][0],'v14ch5:accept:'+id);if(verb==='quest-claim'&&sideReady(this,id))return talk(this,QUEST_SCENES[id][1],'v14ch5:claim:'+id);if(verb==='quest-progress'){const spoken=QUEST_PROGRESS_DIALOGUE_V16[id];return this.hellTalk(spoken?.speaker||(q.giver==='ch5Smith'?'格蕾娜':q.giver==='ch5Alchemist'?'弥娅':'维兰'),spoken?.text||q.route);}return;}
  if(a==='mercenaries'){if(!this.flags.ch5CitySeen)return;if(!h(this).claims['intro:mercenaries'])return talk(this,'ch5RecruiterFirst','v14ch5:open:mercenaries');return this.openMercenaries?.();}if(a==='teaching')return old.choose.call(this,'v11:teachingTalk');
  if(['forge','alchemy','shop','tavern','arcade','books'].includes(a)){if(!safe(this))return;const intro={forge:'ch5SmithFirst',alchemy:'ch5AlchemyFirst',tavern:'ch5TavernFirst',arcade:'ch5ArcadeFirst'}[a];if(intro&&!h(this).claims['intro:'+a])return talk(this,intro,'v14ch5:open:'+a);return open(this,a);}
  if(a==='saint-table'){if(this.map!=='ch5Tavern'){this.say('长夜酒馆在万灯广场南边，那里有安静的座位。');return;}return talk(this,h(this).claims.tavernTalk?'ch5TavernSaint':'ch5TavernFirst','v14ch5:tavern-talk');}
  if(a==='music'){if(this.map==='ch5Tavern')return talk(this,'ch5TavernMusic');return this.hellTalk('艾莉娅','这首曲子我听孩子们哼过……可他们唱的后半段，好像不是这样。');}
  if(a==='archive-idle')return talk(this,'ch5ArchiveFirst');if(a==='city-notice')return this.say('告示：往北可到金缕工坊与练场，往南是长夜酒馆，往东是回廊集市。城内不得拔刀；本城不替活人保管名字。');};
 P.finishChapter5Career=function(){if(this.map!=='ch5Memorial'||!this.p.career?.id)return false;return talk(this,'ch5MentorAfter','v14ch5:mentor-finished');};
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(!id?.startsWith('v14ch5:'))return old.apply.call(this,action);const a=id.slice(7),s=h(this);
  if(a==='arrived')s.claims.arrival=true;
  else if(a==='mentor-unlocked'){for(const[who,keys]of Object.entries({saint:['hell-is-baihu-village','blood-demon-existed','mentor-alleges-masterminds','seek-world-anonymously'],hero:['leon-remains-here','see-salt-town-next']})){this.knowledge[who]=[...new Set([...(this.knowledge[who]||[]),...keys])];}this.flags.ch5MentorReady=true;s.stage='career';this.active=false;this.emit('mechanism',{kind:'v14-career'});}
  else if(a==='mentor-finished'){this.flags.ch5MentorDone=true;s.stage='gate';this.chapter=26;}
  else if(a==='boss-start')this.spawnChapter5Boss();
  else if(a.startsWith('open:')){const kind=a.slice(5);s.claims['intro:'+kind]=true;if(kind==='mercenaries')this.openMercenaries?.();else open(this,kind);}
  else if(a==='exterior-seen'){s.claims.exterior=true;this.knowledge.player=[...new Set([...(this.knowledge.player||[]),'exit-kill-order-even-saint','coverup-higher-chain'])];talk(this,'ch5Exit','v14ch5:exit-done');}
  else if(a==='setback')s.claims.setback=true;
  else if(a==='city-seen'){this.flags.ch5CitySeen=true;s.claims.city=true;s.stage='city';this.chapter=27;once(this,'city-welcome',()=>{this.p.gold+=80;this.addItem('ch5GoldSand',3);this.addItem('ch5LampCore',2);this.addItem('hpLarge',2);this.addItem('mpLarge',2);});}
  else if(a==='tavern-talk')s.claims.tavernTalk=true;
  else if(a==='exit-done'){this.knowledge.saint=[...new Set([...(this.knowledge.saint||[]),'church-banner-at-exit','bodies-suspected'])];this.knowledge.hero=[...new Set([...(this.knowledge.hero||[]),'exit-ambush-suspected'])];this.flags.ch5Complete=true;this.flags.complete=false;this.chapter=29;this.quests.ch5='done';s.stage='complete';once(this,'exit-reward',()=>{this.gainXP(850);this.p.gold+=180;});this.say('第五章 · 灯火之后，已完成。可以继续探索阙灯城。');}
  else if(a.startsWith('accept:')){const qid=a.slice(7);if(this.available(qid)){s.quests[qid]={claimed:false,kills:0,misses:0};this.quests[qid]='active';this.flags.tracked=qid;this.flags.mapGoal=null;}}
  else if(a.startsWith('claim:'))this.claimChapter5Quest(a.slice(6));
  this.saveEvent();};
 P.claimChapter5Quest=function(id){const q=CH5_QUESTS[id],s=h(this).quests[id];if(!q||!s||!sideReady(this,id))return false;s.claimed=true;this.quests[id]='done';for(const[key,n]of Object.entries(q.required))this.p.items[key]-=n;this.gainXP(q.xp);this.p.gold+=q.gold;
  if(id==='ch5ForgeWork'){h(this).claims.freeCraft=true;this.addItem('ch5GoldSand',6);this.addItem('ch5LampCore',3);this.say('格蕾娜免去下一件职业装备的金币工费。材料已经放在行囊里。');}
  if(id==='ch5DewWork'){this.addItem('hpGrand',2);this.addItem('mpGrand',2);this.addItem('ch5LampCore',3);}
  if(id==='ch5Names'){const pool=this.chapter5BookPool();if(pool.length)this.addItem(pool[Math.floor(roll(this)*pool.length)]);else this.addItem('ch5LampCore',6);this.obtainGear(loot(this.p.cls,23,()=>roll(this),{id:'quest-ch5-names-ring',slot:'relic',rarity:'epic',name:'不灭之名'}));}
  if(this.flags.tracked===id)this.flags.tracked=null;this.saveEvent();return true;};
 P.questPropNeeded=function(id){return id==='ch5-water-still'||old.questPropNeeded?.call(this,id);};
 P.useProp=function(id,confirmed){const p=this.props.find(x=>x.id===id);if(!p?.action?.startsWith('ch5:'))return old.useProp.call(this,id,confirmed);const a=p.action.slice(4),s=h(this);
  if(a==='gate-fight')return this.startChapter5Boss();if(a==='rest')return this.restAtBed(0);
  if(a==='gather'||a==='water'){if(p.used){this.say('容器还没积满，过一阵再来看看。');return;}p.used=true;const key=a==='water'?'ch5Dew':p.resource;this.addItem(key,a==='water'?2:1+Math.floor(roll(this)*2));this.saveEvent();return;}
  if(a==='letter'){if(once(this,'road-letter',()=>this.addItem('ch5LampCore',2)))return talk(this,'ch5RoadLetter');return this.say('信已妥善收好。');}
  if(a==='home-mark')return talk(this,'ch5HomeMark');
  if(a==='quarry-cache'){if(once(this,'quarry-cache',()=>{this.addItem('counterBrandBook');this.addItem('ch5GoldSand',3);}))return talk(this,'ch5QuarryCache');return this.say('匣子已经空了。');}
  if(a==='supplies'){once(this,'forge-supplies',()=>{this.addItem('ch5GoldSand',2);this.addItem('ch5LampCore');});return;}
  if(a==='font'){once(this,'fountain',()=>{this.addItem('ch5Dew',2);this.gainXP(90);});this.say('泉水映着灯，却没有映出人的脸。');return;}
  if(a==='training'){this.say('这里的空甲每次离开再回来都会重新聚成。经验较高，普通攻击与灵弹都要小心。');return;}
  if(a==='sign'){this.say(this.flags.ch5CityUnlocked?'路牌后面，原本的石壁开出了一扇铜门。南边传来音乐。':'字被磨得只剩一半。中间那一行还能辨出“出口”。');return;}
  if(a==='board'){this.say('工坊的格蕾娜需要金砂，水院的弥娅正在调药，广场东侧的维兰在找名册。');return;}
  if(a==='exit'){if(!this.flags.ch5BossDefeated)return;if(!this.flags.ch5Complete)return s.claims.exterior?talk(this,'ch5Exit','v14ch5:exit-done'):talk(this,'ch5ExteriorOrder','v14ch5:exterior-seen');this.say('出路已经找到。先把接下来要带走的东西准备好。');return;}
  if(a==='arcade-prize')return open(this,'prizes');return this.choose('v14ch5:'+a);};
 P.startChapter5Boss=function(){if(this.map!=='ch5Gate'||!this.flags.ch5MentorDone||h(this).activeBoss||this.flags.ch5BossDefeated)return false;return talk(this,this.flags.ch5CityUnlocked?'ch5ReturnGate':'ch5FirstGate','v14ch5:boss-start');};
 P.spawnChapter5Boss=function(){if(this.map!=='ch5Gate'||h(this).activeBoss)return false;const s=h(this);s.activeBoss=true;s.attempts++;this.states.ch5Gate.enemies=[];const e=this.enemy('ch5Gatekeeper',1090,510,'ch5-gatekeeper');e.ch5Boss=true;e.abilityCD=4.6;e.label=CH5_ENEMY_PROFILES.ch5Gatekeeper.name;this.enemies.push(e);this.active=true;this.emit('resume');return true;};
 P.chapter5Setback=function(){const s=h(this);if(this.map!=='ch5Gate'||this.flags.ch5CityUnlocked)return false;s.activeBoss=false;this.flags.ch5CityUnlocked=true;s.stage='city-road';this.states.ch5Gate.enemies=[];this.pending=null;this.bullets=[];this.zones=[];this.target=null;this.moveTo=null;if(!isStoryTestV25(this))this.p.hp=Math.max(1,Math.round(stats(this.p).hp*.42));this.p.mp=Math.max(this.p.mp,stats(this.p).mp*.3);this.p.invuln=0;this.events=this.events.filter(e=>e.type!=='death');this.active=true;this.enter('ch5Crossroads',760,700);talk(this,'ch5Setback','v14ch5:setback');this.saveEvent();return true;};
 P.hurt=function(n){const first=this.map==='ch5Gate'&&h(this).activeBoss&&!this.flags.ch5CityUnlocked;if(first&&isStoryTestV25(this)&&this.active&&!this.pending&&Number.isFinite(n)&&n>0){this.chapter5Setback();return true;}const result=old.hurt.call(this,n);if(first&&this.p.hp<=0)this.chapter5Setback();return result;};
 P.damage=function(e,n,kind='hit'){if(!this.memoryV13?.active&&this.p.hp>0){const drink=chapter5DrinkModifiers(this.p),set=chapter5SetBonuses(this.p);if(!['dot','enchant','proc','mercenary'].includes(kind))n*=1+(drink.damage||0)+(kind==='hit'?set.basicDamage:0);}const first=e.ch5Boss&&!this.flags.ch5CityUnlocked;const result=old.damage.call(this,e,n,kind);if(first&&this.map==='ch5Gate'&&e.hp<=e.maxHP/3)this.chapter5Setback();return result;};
 P.handleHellDeath=function(e){if(!is5(this.map))return old.handleHellDeath.call(this,e);if(e.ch5Boss){if(!this.flags.ch5CityUnlocked){this.chapter5Setback();return true;}h(this).activeBoss=false;this.flags.ch5BossDefeated=true;h(this).stage='exit';this.bullets=[];this.zones=[];once(this,'gate-boss',()=>{this.gainXP(1700);this.p.gold+=260;this.addItem('ch5LampCore',8);this.obtainGear(loot(this.p.cls,26,()=>roll(this),{id:'quest-ch5-gatekeeper',slot:'weapon',rarity:'legendary',name:'守日者的遗刃'}));});talk(this,'ch5BossVictory');this.saveEvent();return true;}
  const s=h(this);s.killCount++;const gap=this.p.level-(e.level||20),mult=gap<=3?1:gap<=6?.65:.35;this.gainXP(Math.round((e.rewardXP||125)*(this.map==='ch5Training'?1.3:1)*mult));this.p.gold+=e.elite?17:7;
  for(const[id,q]of Object.entries(CH5_QUESTS)){const v=s.quests[id];if(!v||v.claimed)continue;if(q.killMaps?.includes(this.map))v.kills++;
   if(id==='ch5Names'&&['ch5Training','ch5Quarry'].includes(this.map)&&(this.p.items.ch5CourierPage||0)<4){v.misses++;if(roll(this)<.35||v.misses>=5){v.misses=0;this.addItem('ch5CourierPage');}}}
  if(roll(this)<(e.elite?1:.42))this.addItem('ch5GoldSand',e.elite?2:1);if(roll(this)<(e.elite?.8:.27))this.addItem('ch5LampCore');this.dropCombatLoot(e);this.saveEvent();return true;};
 P.update=function(dt,input){old.update.call(this,dt,input);if(!this.active||this.pending)return;const p=this.p;if(p.ch5Drink?.remaining>0)p.ch5Drink.remaining=Math.max(0,p.ch5Drink.remaining-dt);if(this.map==='ch5Gate'&&!h(this).activeBoss&&!this.flags.ch5BossDefeated&&this.flags.ch5MentorDone&&dist(p,{x:1090,y:510})<280)this.startChapter5Boss();};
 P.updateCompanion=function(dt){old.updateCompanion.call(this,dt);if(is5(this.map)&&MAPS[this.map].safe&&this.p.cls!=='saint'&&!this.pending)this.saint.visible=true;};
 P.canSave=function(){return !h(this).activeBoss&&old.canSave.call(this);};
 P.saveBlockReason=function(){return h(this).activeBoss?'守日者的战斗尚未结束；结束或倒下后可以保存。':old.saveBlockReason.call(this);};
 P.respawn=function(){if(!is5(this.map))return old.respawn.call(this);if(this.map==='ch5Gate'&&!this.flags.ch5CityUnlocked)return this.chapter5Setback();h(this).activeBoss=false;this.states.ch5Gate&&(this.states.ch5Gate.enemies=[]);this.bullets=[];this.zones=[];this.p.hp=stats(this.p).hp;this.p.mp=stats(this.p).mp;this.p.emotion=0;this.active=true;this.enter(this.flags.ch5CitySeen?'ch5Tavern':'ch5Memorial',this.flags.ch5CitySeen?700:740,this.flags.ch5CitySeen?790:740);this.saveEvent();return true;};
 P.chapter5BookPool=function(){return Object.entries(ITEMS).filter(([id,b])=>b.kind==='book'&&b.skill&&SKILLS[b.skill]&&!SKILLS[b.skill].saintOnly&&!SKILLS[b.skill].summon&&(b.region||1)<=5&&(b.level||1)<=26&&!this.knowsOrHolds(id)).map(([id])=>id);};
 P.ch5Action=function(action,arg){const s=h(this);if(!safe(this))return false;
  if(action==='craft'){if(this.map!=='ch5Forge'||!this.p.career?.id)return false;const r=CH5_SET_RECIPES.find(v=>v.id===arg),set=CH5_SETS[this.p.cls];if(!r||!set)return false;const cost={...r.cost};if(s.claims.freeCraft)cost.gold=0;if(!pay(this,cost))return false;if(s.claims.freeCraft)s.claims.freeCraft=false;s.crafts[arg]=(s.crafts[arg]||0)+1;const quality=roll(this)<.15?'legendary':'epic',name=set.name+' · '+({weapon:{shadow:'双刃',oath:'重剑',ember:'法杖'}[this.p.cls],chest:'旅衣',hands:'护腕',feet:'长靴'}[r.slot]);
   const gear=loot(this.p.cls,23,()=>roll(this),{id:'quest-ch5-set-'+this.p.cls+'-'+arg+'-'+s.crafts[arg],slot:r.slot,rarity:quality,name,setId:set.id,setName:set.name,source:'阙灯城职业铸炉'});this.obtainGear(normalizeGear(gear,this.p.cls));this.saveEvent();open(this,'forge');return true;}
  if(action==='alchemy'){if(this.map!=='ch5Reservoir')return false;const r=CH5_ALCHEMY.find(v=>v.id===arg);if(!r||!pay(this,r.cost))return false;this.addItem(r.item,r.count);this.saveEvent();open(this,'alchemy');return true;}
  if(action==='buy'){if(!['ch5Market','ch5Reservoir'].includes(this.map))return false;return this.buyPotion(arg);}
  if(action==='buy-merc-book'){if(this.map!=='ch5Market'||!this.buyMercenaryBook?.())return false;this.saveEvent();open(this,'shop');return true;}
  if(action==='drink'){if(this.map!=='ch5Tavern'||!CH5_DRINKS[arg])return false;const drink=CH5_DRINKS[arg];if(!pay(this,{gold:drink.cost}))return false;this.p.ch5Drink={id:arg,remaining:drink.duration};this.saveEvent();open(this,'tavern');return true;}
  if(action==='tavern-talk'){if(this.map!=='ch5Tavern')return false;return talk(this,'ch5TavernDrink','v14ch5:tavern-talk');}
  if(action==='tavern-refuse'){if(this.map!=='ch5Tavern')return false;return talk(this,'ch5TavernRefuse','v14ch5:tavern-talk');}
  if(action==='book-draw'){if(this.map!=='ch5Forge')return false;if(s.bookOffer){open(this,'books');return true;}const pool=this.chapter5BookPool();if(!pool.length){this.say('这里能换到的练习册你都已经学过或带着了。');return false;}if(!pay(this,{gold:75,ch5LampCore:3}))return false;const selected=[];while(pool.length&&selected.length<3)selected.push(pool.splice(Math.floor(roll(this)*pool.length),1)[0]);s.bookDraws++;s.bookOffer={items:selected};this.saveEvent();open(this,'books');return true;}
  if(action==='book-claim'){if(this.map!=='ch5Forge'||!s.bookOffer?.items.includes(arg))return false;s.bookOffer=null;this.addItem(arg);this.saveEvent();open(this,'books');return true;}
  if(action==='arcade-start'){if(this.map!=='ch5Arcade')return false;if(s.arcade&&!['won','lost'].includes(s.arcade.phase)){open(this,'arcade');return true;}if(!pay(this,{gold:10}))return false;s.arcade={phase:'show',pattern:Array.from({length:3},()=>Math.floor(roll(this)*3)),answers:[],paid:true};this.saveEvent();open(this,'arcade');return true;}
  if(action==='arcade-hide'){if(this.map!=='ch5Arcade'||s.arcade?.phase!=='show')return false;s.arcade.phase='guess';this.saveEvent();open(this,'arcade');return true;}
  if(action==='arcade-answer'){const a=s.arcade,n=Number(arg);if(this.map!=='ch5Arcade'||a?.phase!=='guess'||!Number.isInteger(n)||n<0||n>2)return false;a.answers.push(n);if(a.pattern[a.answers.length-1]!==n){a.phase='lost';this.say('铜铃轻轻一响，顺序错了。');}else if(a.answers.length===3){a.phase='won';this.p.gold+=18;this.addItem('ch5PrizeCoin');once(this,'first-arcade-win',()=>{this.addItem('ch5LampCore',2);this.gainXP(110);});this.say('三盏灯依次亮起。获得 18 金与一枚铜券。');}this.saveEvent();open(this,'arcade');return true;}
  if(action==='prize'){if(this.map!=='ch5Arcade')return false;const choices={potions:{cost:2,reward:()=>{this.addItem('hpGrand');this.addItem('mpGrand');}},book:{cost:5,reward:()=>{const pool=this.chapter5BookPool();if(pool.length)this.addItem(pool[Math.floor(roll(this)*pool.length)]);else this.addItem('ch5LampCore',7);}},relic:{cost:7,reward:()=>this.obtainGear(loot(this.p.cls,23,()=>roll(this),{rarity:roll(this)<.12?'legendary':'epic',slot:'relic',name:'回铃纪念坠'}))}};const c=choices[arg];if(!c||!pay(this,{ch5PrizeCoin:c.cost}))return false;c.reward();this.saveEvent();open(this,'prizes');return true;}
  return false;};
}
