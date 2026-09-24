import {applyMemoryCareerPreview,migrateCareerProgression} from './progression-runtime-v14.js';
import {MEMORY_HP} from './memory-combat-v14.js';
import {ensureEnemyAI} from './enemy-ai-v14.js';
import {MAPS,DIALOGUES,SKILLS,QUESTS,CLASSES} from './data-v14.js';
import {SCENERY,BOUNDARIES,WATERS,BRIDGES} from './world-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {SPEAKER_ACTOR} from './orientation-v14.js';
import {MEMORY_STORY} from './memory-story-v14.js';
import {drawBossWarning} from './telegraphs-v14.js';
import {paintedFX} from './combat-visuals-v14.js';
const clone=v=>JSON.parse(JSON.stringify(v));
const scenes=['ch4V13Private','ch4V13Village','ch4V13Orders','ch4V13Summon','ch4V13Rescue','ch4V13BloodReady','battle','ch4V13BloodAfter','ch4V14Investigation','ch4V13Notice','ch4V13PrivateAfter'];
const next={ch4V13Private:'ch4V13Village',ch4V13Village:'ch4V13Orders',ch4V13Orders:'ch4V13Summon',ch4V13Summon:'ch4V13Rescue',ch4V13Rescue:'ch4V13BloodReady',ch4V13BloodReady:'battle',ch4V13BloodAfter:'ch4V14Investigation',ch4V14Investigation:'ch4V13Notice',ch4V13Notice:'ch4V13PrivateAfter'};
const memoryMaps=['deepConfluence','hellMemoryVillage','memoryNotice'];
const boundary=[[0,0,1600,155],[0,965,1600,115],[0,155,135,810],[1465,155,135,810]];
const prop=(id,sheet,asset,x,y,w,h,box=null)=>({id,sheet,asset,x,y,w,h,box});
function register(){
 Object.assign(DIALOGUES,clone(MEMORY_STORY.DIALOGUES));Object.assign(SPEAKER_ACTOR,MEMORY_STORY.SPEAKER_ACTOR);
 for(const [id,rows] of Object.entries(MEMORY_STORY.CONTINUITY_PATCHES.dialogue_rows))for(const [i,line]of Object.entries(rows))DIALOGUES[id][i]=line;
 for(const[id,stage]of Object.entries(MEMORY_STORY.STAGING)){STAGING.scenes[id]=CHAPTER_STAGING[id]=clone(stage);CINEMATIC_SCENES.add(id);}
 // V14 staging is authored with the complete dialogue, never patched by old line numbers.
 const sideRock=SCENERY.deepSeal.find(o=>o.id==='v11-ds-approach-right');if(sideRock){const previous=sideRock.box;sideRock.x=1190;sideRock.y=845;sideRock.box=[1125,810,130,35];MAPS.deepSeal.blocks=MAPS.deepSeal.blocks.map(b=>b===previous||JSON.stringify(b)===JSON.stringify(previous)?sideRock.box:b);}
 const names={deepConfluence:['隔界灰庭','声音止在灰雾里，门仍留在外头'],hellMemoryVillage:['回忆 · 邻国边村','三人的记忆'],memoryNotice:['回忆 · 数日后的城中','诺恩亲眼见过的告示']};
 for(const id of memoryMaps){MAPS[id]={name:names[id][0],sub:names[id][1],chapterRegion:4,safe:id!=='hellMemoryVillage',entry:[745,730],size:[1600,1080],blocks:clone(boundary),doors:[],npcs:[],props:[],spawns:[],noCompanion:true,privateMemory:true};SCENERY[id]=[];BOUNDARIES[id]=clone(boundary);WATERS[id]=[];BRIDGES[id]=[];}
 V11_GROUND_STYLE.deepConfluence=clone(V11_GROUND_STYLE.deepSeal);
 SCENERY.deepConfluence=SCENERY.deepSeal.filter(s=>s.x<400||s.x>1100||s.y<360||s.y>820).map(s=>({...clone(s),id:'memory-'+s.id}));
 SCENERY.hellMemoryVillage=[prop('memory-west-house','world',0,350,365,320,285,[205,255,285,110]),prop('memory-east-house','world',0,1190,320,300,260,[1055,235,270,85]),prop('memory-south-house','world',0,1220,985,300,280,[1080,925,275,60]),prop('memory-water-pot','details',1,495,452,38,44),prop('memory-seed-sacks','chapterProps',6,760,480,110,76,[710,455,95,25]),prop('memory-woodpile','details',10,320,452,48,60),prop('memory-lantern','world',14,1120,790,42,125,[1110,773,20,17]),prop('memory-garden','details',6,265,530,58,50),prop('memory-garden2','details',6,293,550,48,46),prop('memory-tree-west','world',4,200,855,190,240,[172,827,55,28]),prop('memory-tree-east','world',4,1400,585,190,240,[1372,557,55,28])];
 SCENERY.memoryNotice=[prop('memory-square-house','world',0,360,350,330,290,[210,230,300,120]),prop('memory-square-shop','world',0,1220,350,330,290,[1070,230,300,120]),prop('memory-notice','details',4,825,385,100,140,[800,363,50,22]),prop('memory-square-lamp','world',14,1040,410,42,125,[1030,393,20,17]),prop('memory-bread','world',3,560,580,175,145,[490,535,140,45])];
 for(const id of memoryMaps)MAPS[id].blocks.push(...SCENERY[id].filter(p=>p.box).map(p=>p.box));
 DIALOGUES.ch4V13DoorAfter=[['艾莉娅','门还是没有动静。先回有炉火的地方吧。']];
}
export function validMemoryResume(s){const m=s.memoryV13;if(m===undefined)return true;return m&&m.schema===1&&scenes.includes(m.phase)&&s.map==='deepSeal'&&s.p.level<=32&&(!m.scene||m.scene.id===m.phase)&&(!m.scene||Number.isInteger(m.scene.line)&&m.scene.line>=0&&m.scene.line<(DIALOGUES[m.phase]?.length||1));}
export function installMemoryV13(RPG,{stats,loot}){
 register();const P=RPG.prototype,old={};for(const k of ['snapshot','restore','apply','useProp','npcOptions','choose','objective','canSave','saveBlockReason','handleHellDeath','update','respawn','potion','enter','gainXP','complete','syncJournal','updateCompanion'])old[k]=P[k];
 P.snapshot=function(){if(!this.memoryV13?.active)return old.snapshot.call(this);const s=clone(this.memoryV13.reality);s.memoryV13={schema:1,phase:this.memoryV13.phase,scene:this.pending?{id:this.pending.id,line:this.pending.line||0,phase:this.pending.phase||'action',closing:!!this.pending.closing}:null};return s;};
 P.restore=function(s){this.memoryV13=null;old.restore.call(this,s);if(s.memoryV13&&validMemoryResume(s)){const real=clone(s),resume=clone(s.memoryV13);delete real.memoryV13;real.version=15;for(const p of [real.p,real.ch3?.frozenHero,real.ch3?.saintBuild,...Object.values(real.mercenariesV14?.roster||{})].filter(Boolean))if(p.career&&!p.career.preview&&!Array.isArray(p.career.unlockedStages))migrateCareerProgression(p,SKILLS);this.memoryV13={active:true,reality:real,phase:resume.phase};this.enterMemoryPhase(resume.phase,resume.scene);}};
 P.canSave=function(){return this.memoryV13?.active?true:old.canSave.call(this);};
 P.saveBlockReason=function(){return this.memoryV13?.active?'回忆进度会单独保存；战斗中断后从交战前重试。':old.saveBlockReason.call(this);};
 P.syncJournal=function(){if(this.memoryV13?.active)return this.v13?.history||{};return old.syncJournal.call(this);};
 P.updateCompanion=function(dt){if(this.memoryV13?.active){this.saint.visible=false;return;}return old.updateCompanion.call(this,dt);};
 P.gainXP=function(n){if(this.memoryV13?.active)return;return old.gainXP.call(this,n);};
 P.complete=function(q){if(this.memoryV13?.active)return false;return old.complete.call(this,q);};
 P.enter=function(id,x,y){if(this.memoryV13?.active)return false;return old.enter.call(this,id,x,y);};
 P.beginPrivateMemory=function(){if(this.memoryV13?.active||this.flags.ch4V13MemoryComplete)return false;const s=clone(old.snapshot.call(this));s.pending=null;s.map='deepSeal';s.flags.ch4SealSeen=true;this.memoryV13={active:true,reality:s,phase:'ch4V13Private'};this.enterMemoryPhase('ch4V13Private');return true;};
 P.makeMemoryHero=function(){const p=clone(this.memoryV13.reality.p);p.level=100;p.xp=0;p.ap=p.sp=0;p.attrs={str:90,dex:90,vit:p.cls==='shadow'?210:p.cls==='ember'?130:100,wis:90};p.skills={q:5,e:5,crash:3,ashWard:3,boneBreak:3,edge:5,heart:5};for(const k in p.skills)p.skills[k]=Math.min(p.skills[k],SKILLS[k].rank);p.activeSkills=['q','e','crash','ashWard','boneBreak'];p.skillSpent={};p.skillOrigins=Object.fromEntries(Object.keys(p.skills).map(k=>[k,'innate']));p.knownBooks=['ashWard','boneBreak'];p.items={hpGrand:2};p.bag=[];p.gold=0;p.gear={};for(const slot of ['weapon','head','chest','hands','feet','relic'])p.gear[slot]=loot(p.cls,20,()=>.6,{id:'memory-'+slot,slot,rarity:'legendary'});p.bar=[['q','e','crash','ashWard','boneBreak','hpGrand'],[null,null,null,null,null,'resonance']];p.page=0;p.cd={};p.x=745;p.y=730;p.angle=-.4;p.moving=false;p.invuln=1;p.guard=0;p.shield=0;p.shieldTime=0;p.counterBrand=0;p.emotion=100;p.resonance=0;p.dash=0;p.battleTempo=0;p.stoneSkin=0;p.focusBreath=0;p.memoryEmpowered=true;if(p.cls==='shadow')p.gear.offhand=loot('shadow',20,()=>.6,{id:'memory-offhand',slot:'weapon',rarity:'legendary'});applyMemoryCareerPreview(p);p.hp=stats(p).hp;p.mp=stats(p).mp;return p;};
 P.enterMemoryPhase=function(phase,savedScene=null){const m=this.memoryV13;if(!m?.active||!scenes.includes(phase))return false;m.phase=phase;m.hazards=[];m.bloodAdds=false;m.burstCD=8;m.sideBattleTime=0;this.pending=null;this.fx=[];this.texts=[];this.bullets=[];this.zones=[];this.manaMotes=[];this.target=null;this.moveTo=null;this.paths=new Map();this.saint={x:-1000,y:-1000,visible:false,moving:false};if(this.ch3){this.ch3.lantern=null;this.ch3.escortActive=false;}
  this.map=phase==='battle'?'hellMemoryVillage':STAGING.scenes[phase].map;this.ensureMap(this.map);this.states[this.map].enemies=[];this.states[this.map].qualityVersion=9;this.p=clone(m.reality.p);if(['ch4V13BloodReady','battle','ch4V13BloodAfter'].includes(phase))this.p=this.makeMemoryHero();this.p.x=745;this.p.y=730;this.p.attackAnim=0;this.p.moving=false;this.emit('actor');this.emit('map',{id:this.map});
  if(phase==='battle'){const b=this.enemy('bloodDemon',990,535,'v13MemoryBloodDemon');b.hp=b.maxHP=MEMORY_HP[this.p.cls];ensureEnemyAI(b,this);b.storyTag='v13-memory';b.label='血魔 · 饥渴的降临者';b.abilityCD=3;b.leashRadius=1800;this.enemies.push(b);this.active=true;this.emit('resume');this.say('回忆 · 诺恩 Lv.100｜1–5 战技，6 疗伤（两次），第二页可共鸣。离开或刷新后从交战前重试。');}
  else{this.active=false;this.beginScene(phase,'v13:memoryNext');if(savedScene)Object.assign(this.pending,savedScene);}
  this.saveEvent();return true;};
 P.finishPrivateMemory=function(){const real=clone(this.memoryV13.reality);this.memoryV13=null;old.restore.call(this,real);this.p=clone(real.p);this.ch3=real.ch3?clone(real.ch3):null;this.flags=clone(real.flags);this.quests=clone(real.quests);this.map='deepSeal';this.relocate(800,640);this.saint={x:935,y:620,visible:true,moving:false,angle:Math.PI};this.fx=[];this.bullets=[];this.zones=[];this.texts=[];this.manaMotes=[];this.target=null;this.moveTo=null;for(const id of memoryMaps)delete this.states[id];this.flags.ch4V13MemoryComplete=true;this.flags.ch4V13SaintTruthKnown=false;this.flags.ch4SealSeen=true;this.knowledge.player=[...new Set([...(this.knowledge.player||[]),'trio-betrayal-memory'])];this.emit('actor');this.emit('map',{id:this.map});this.beginScene('ch4V13Return');this.saveEvent();};
 P.apply=function(a){const id=typeof a==='string'?a:a?.id;if(id==='v11:seal'){this.flags.ch4SealSeen=true;return this.beginPrivateMemory();}if(id==='v13:memoryNext'){if(this.memoryV13?.phase==='ch4V13PrivateAfter')return this.finishPrivateMemory();return this.enterMemoryPhase(next[this.memoryV13?.phase]);}return old.apply.call(this,a);};
 P.useProp=function(id,confirmed){if(this.memoryV13?.active)return false;if(id==='v11-deep-seal'){if(this.flags.ch4V13MemoryComplete){this.beginScene('ch4V13DoorAfter');return;}if(!['ch4Odric','ch4Martha','ch4Severin'].every(k=>this.flags[k])){this.say('路上的三道残响还没有平息。');return;}this.beginScene('ch4SealedDoor','v11:seal');return;}return old.useProp.call(this,id,confirmed);};
 P.npcOptions=function(id){if(this.memoryV13?.active)return [];return old.npcOptions.call(this,id).filter(o=>o.action!=='v11:endTalk'||this.flags.ch4V13MemoryComplete);};
 P.choose=function(a){if(a==='v11:endTalk'&&!this.flags.ch4V13MemoryComplete){this.say('还没有查清缄门深庭里的动静。');return;}return old.choose.call(this,a);};
 P.objective=function(){if(this.memoryV13?.active)return {text:this.memoryV13.phase==='battle'?'回忆 · 阻止血魔离开村庄。重击聚光时绕开落点，收招后反击。':'回忆 · 聆听三人留下的往事',map:this.map};if(this.map.startsWith('deep')&&this.flags.ch4SealSeen&&!this.flags.ch4V13MemoryComplete)return {text:'无钟回廊东北 → 缄门深庭，再查看石门旁的动静',map:'deepSeal',target:'v11-deep-seal'};return old.objective.call(this);};
 P.handleHellDeath=function(e){if(this.memoryV13?.active){if(e.id==='v13MemoryBloodDemon'){this.memoryV13.battleResult={hp:this.p.hp,maxHP:stats(this.p).hp,potionsLeft:this.p.items.hpGrand||0};this.enterMemoryPhase('ch4V13BloodAfter');}return true;}return old.handleHellDeath.call(this,e);};
 P.respawn=function(){if(this.memoryV13?.active)return this.enterMemoryPhase('battle');return old.respawn.call(this);};
 P.potion=function(id){if(!this.memoryV13?.active)return old.potion.call(this,id);const kind=id==='hpGrand'?'hp':id==='mpGrand'?'mp':null,p=this.p,key=kind==='hp'?'hpPotion':'mpPotion';if(this.memoryV13.phase!=='battle'||!kind||p.hp<=0||p[kind]>=stats(p)[kind]||p.cd[key]>0||!p.items[id])return false;p.items[id]--;p.cd[key]=7;const n=Math.round(stats(p)[kind]*.35);if(kind==='hp')this.heal(n);else{p.mp=Math.min(stats(p).mp,p.mp+n);this.text('法力 +'+n,p.x,p.y-65,'#94d2f4');}this.effect('holyHeal',p.x,p.y,110,'#ffe8b0',.7);return true;};
 P.update=function(dt,input){const m=this.memoryV13;if(!m?.active)return old.update.call(this,dt,input);this.saint.visible=false;old.update.call(this,dt,input);this.saint.visible=false;if(!this.active||this.pending||m!==this.memoryV13||m.phase!=='battle')return;const b=this.enemies.find(e=>e.id==='v13MemoryBloodDemon'&&!e.dead);if(!b)return;m.sideBattleTime+=dt;
  if(b.hp/b.maxHP<.65){m.burstCD-=dt;if(m.burstCD<=0){m.burstCD=12;for(let i=0;i<3;i++){const a=i*2.094,t={x:this.p.x+Math.cos(a)*95,y:this.p.y+Math.sin(a)*95};m.hazards.push({type:'bloodDemon',x:t.x,y:t.y,wind:1.05+i*.25,windMax:1.05+i*.25,telegraph:{shape:'circle',x:t.x,y:t.y,r:60,label:'血焰余波'}});}}}
  for(const h of m.hazards){h.wind-=dt;if(h.wind<=0&&!h.done){h.done=true;this.effect('flame',h.x,h.y,65,'#ff946b',.7);if(Math.hypot(this.p.x-h.x,this.p.y-h.y)<60)this.hurt(520);}}m.hazards=m.hazards.filter(h=>!h.done);
  if(b.hp/b.maxHP<.30&&!m.bloodAdds){m.bloodAdds=true;for(let i=0;i<4;i++){const at=this.safePoint(b.x+Math.cos(i*1.571)*170,b.y+Math.sin(i*1.571)*170),e=this.enemy('hellSoul',at.x,at.y,'v13BloodEcho-'+i);e.hp=e.maxHP=500;e.storyTag='v13-memory';e.label='血魔溢出的血团';this.enemies.push(e);}this.say('血团正在聚拢。用范围战技打散它们！');}
 };
}
export function drawMemoryGround(c,bank,g,cine){const phase=g.memoryV13?.phase||cine?.id,id=cine?.map||g.map;if(id==='deepConfluence'||cine?.id==='ch4SealedDoor'&&cine.closing){for(let i=0;i<20;i++){const a=i*Math.PI/10;paintedFX(c,bank,'spirit',Math.floor(g.time*6+i)%4,750+Math.cos(a)*285,620+Math.sin(a)*220,50,80,a,.48);}return;}
 if(id==='hellMemoryVillage'&&!['ch4V13Village','ch4V13Orders'].includes(phase)){c.save();c.globalAlpha=.32;c.fillStyle='#4d1f24';c.beginPath();c.ellipse(955,555,155,83,0,0,7);c.fill();c.restore();for(let i=0;i<8;i++){const a=i*Math.PI/4;paintedFX(c,bank,'fire',Math.floor(g.time*5+i)%4,955+Math.cos(a)*138,555+Math.sin(a)*77,34,48,a,.4);}}
 for(const h of g.memoryV13?.hazards||[])drawBossWarning(c,bank,h,g.time);
}

export function memoryBodies(g){
 if(g.memoryV13?.phase!=='battle')return [];
 const st=STAGING.scenes.ch4V13BloodReady,base=['odric','martha','severin','villagerWoman','villagerMan'].map(id=>({kind:st.actorMeta[id].renderAs==='enemy'?'enemy':'npc',a:{...st.actorMeta[id],id,x:st.actors[id][0],y:st.actors[id][1],fall:1,memoryCorpse:true,angle:0}}));
 const court=MEMORY_STORY.SIDE_COURT,t=g.memoryV13.sideBattleTime||0,ends={bodyguard1:4,bodyguard2:6,bodyguard3:8,envoy:11.3,leon:12};
 const positions={};for(const[id,start]of Object.entries(court.start)){const end=court.dead[id],k=Math.min(1,t/ends[id]);positions[id]={x:start[0]+(end[0]-start[0])*k,y:start[1]+(end[1]-start[1])*k};}
 for(const[id,at]of Object.entries(positions)){const dead=t>=ends[id],target=id==='leon'?(t<4?'bodyguard1':t<6?'bodyguard2':t<8?'bodyguard3':'envoy'):'leon',to=positions[target],meta=id==='leon'?court.worldLeon:st.actorMeta[id]||{sprite:5};base.push({kind:meta.renderAs==='enemy'?'enemy':'npc',a:{...meta,id,...at,memoryCorpse:true,fall:dead?1:0,moving:!dead&&t<ends[id]-1,walkDistance:t*54,anim:t*3.5,angle:Math.atan2(to.y-at.y,to.x-at.x),attackAnim:!dead&&t%1.1<.28?.28:0,wind:0}});}
 return base;
}
