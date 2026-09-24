import {isStoryTestV25} from './story-test-v25.js';
import {sagaLevelCapV25,sagaSavedLevelCapV25} from './saga-stats-v25.js';
import {SKILLS} from './data-v14.js';
import {MERCENARY_QUALITIES_V18,mercenaryQualityV18} from './mercenary-quality-v18.js';
import {careerSkillUnlocked} from './progression-data-v14.js';
// Up to three independently owned companions; dialogue actors and the Saint remain separate.
// All growth, equipment validation and combat skill formulas are provided by the game.
const clone=x=>JSON.parse(JSON.stringify(x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const finite=(n,f=0)=>Number.isFinite(n)?n:f;
const slots=['weapon','offhand','head','chest','hands','feet','relic'];
export const MERCENARY_ROSTER={
 bastion:{id:'bastion',name:'布莱克',role:'前卫',cls:'oath',price:180,desc:'在近处挡住敌人。先稳住伤势，再护身、压制成群目标。',starter:['q','e','fieldMend','stoneSkin'],color:'#ceb886',quality:'uncommon',visualIdentity:'bastion'},
 outrider:{id:'outrider',name:'洛伊',role:'游侠',cls:'shadow',price:180,desc:'双刃近身游击。保持攻势，优先牵制聚集的敌人；不是弓手。',starter:['q','e','battleTempo','frost'],color:'#a4c9b4',quality:'common',visualIdentity:'outrider'},
 arcanist:{id:'arcanist',name:'伊萨',role:'奥术师',cls:'ember',price:210,desc:'在后方用法杖与法术支援。法力不足时先调息，有危险时张开护盾。',starter:['firebolt','ashWard','focusBreath','iceShard'],color:'#c0afda',quality:'rare',visualIdentity:'arcanist'},
 vyra:{id:'vyra',name:'薇菈',role:'寻路双刃',cls:'shadow',quality:'rare',visualIdentity:'vyra',desc:'她习惯先看好退路，再笑着问敌人要不要让一让。擅长近身牵制与连续出手。',starter:['q','e','battleTempo','fieldMend'],color:'#b7a5dd'},
 linet:{id:'linet',name:'莉奈',role:'巡灯护卫',cls:'oath',quality:'uncommon',visualIdentity:'linet',desc:'说好守住的位置，她就不会轻易让开。擅长格挡、护身与重击。',starter:['q','e','stoneSkin','counterBrand'],color:'#a2cbbb'},
 serin:{id:'serin',name:'薇瑟',role:'观星术师',cls:'ember',quality:'epic',visualIdentity:'serin',desc:'她能耐心解释半夜的星位，却常常忘记茶已经凉了。擅长冰火法术与自我防护。',starter:['iceShard','firebolt','ashWard','focusBreath'],color:'#b9c9ec'}
};
export const MERCENARY_BOOK_POOL=['fieldMend','battleTempo','stoneSkin','focusBreath','bladeRain','chainFetters','ashBurst','iceShard','cleave','firebolt','frost','crash','boneBreak','soulBind','ashWard','graveBell','emberLance','wispLantern','counterBrand','bloodPact','soulTithe'];
export const MERCENARY_RECRUIT_ODDS_V23=Object.freeze({common:.55,uncommon:.30,rare:.12,epic:.03});
export const MERCENARY_STUDY_V23=Object.freeze({price:180,duplicateThreshold:5,odds:Object.freeze({common:.60,uncommon:.28,rare:.10,epic:.02}),insight:Object.freeze({common:1,uncommon:2,rare:3,epic:5})});
export const MERCENARY_BOOK_TIERS_V23=Object.freeze({
 common:['fieldMend','focusBreath','cleave','firebolt','iceShard'],
 uncommon:['battleTempo','stoneSkin','frost','ashWard','boneBreak'],
 rare:['bladeRain','chainFetters','ashBurst','crash','soulBind','counterBrand'],
 epic:['graveBell','emberLance','wispLantern','bloodPact','soulTithe']
});
const MAX_ROSTER=60,CLASSES_V23=['shadow','oath','ember'];
const fresh=()=>({schema:3,seed:16091611,activeId:null,activeIds:[],selectedId:null,roster:{},bookDraws:0,initialContractUsed:false,ticketCount:0,ticketEvents:{},ticketMisses:0,combatSerial:0,recruitSerial:0,lastRecruitResult:null,lastBookResult:null});
function migrateParty(h){
 if(h.schema===1){h.schema=2;h.activeIds=h.activeId?[h.activeId]:[];h.initialContractUsed=Object.keys(h.roster||{}).length>0;h.ticketCount=0;h.ticketEvents={};h.ticketMisses=0;h.combatSerial=0;}
 if(h.schema===2){h.schema=3;h.recruitSerial=0;h.lastRecruitResult=null;h.lastBookResult=null;
  for(const [id,p]of Object.entries(h.roster)){p.templateId=id;p.quality=Object.hasOwn(MERCENARY_QUALITIES_V18,p.quality)?p.quality:MERCENARY_ROSTER[id].quality;p.studyInsightV23=0;}}
 return h;
}
const state=g=>migrateParty(g.mercenariesV14||(g.mercenariesV14=fresh()));
const inMemory=g=>!!(g.memoryV13?.active||g.memoryV14?.active||g.p?.memoryPreview);
const unlocked=g=>!!g.flags?.ch5CitySeen;
const safe=g=>g.p.cls!=='saint'&&!g._mercenaryContext&&!!g._mercenaryDeps.MAPS[g.map]?.safe&&!g.enemies.some(e=>!e.dead)&&!inMemory(g)&&!g.pending&&g.p.hp>0;
const random=g=>{const s=state(g);let x=(s.seed||16091611)|0;x^=x<<13;x^=x>>>17;x^=x<<5;s.seed=x>>>0;return s.seed/4294967296;};
const savedActor=p=>{const out=clone(p);for(const k of ['bullets','zones','spellState','dotTargets','route','routeGoal','routeUntil','targetId','thinkAt','stuck','map','visible'])delete out[k];return out;};
const serialize=g=>{const h=state(g);return {...clone(h),roster:Object.fromEntries(Object.entries(h.roster).map(([id,p])=>[id,savedActor(p)]))};};
const actorState=p=>{p.bullets=[];p.zones=[];p.dotTargets={};p.spellState={pulses:[],lantern:null};p.moving=false;p.attackAnim=0;p.anim=0;p.visible=false;p.route=[];p.routeUntil=0;p.thinkAt=0;p.targetId=null;};
function blockedMercenary(g){return !!g.sagaCompanionsSuppressedV25?.()||!unlocked(g)||inMemory(g)||g._mercenaryDeps.MAPS[g.map]?.privateMemory||g._mercenaryDeps.MAPS[g.map]?.noMercenaries||g.v13?.trial?.active||g.p.cls==='saint';}
function deployedAll(g){if(blockedMercenary(g))return [];const h=state(g);return h.activeIds.map(id=>h.roster[id]).filter(p=>p&&!p.downed&&p.hp>0);}
function deployed(g){return deployedAll(g)[0]||null;}
function undeploy(g,id){const h=state(g);h.activeIds=h.activeIds.filter(k=>k!==id);h.activeId=h.activeIds[0]||null;}
export function mercenarySupportFactorV18(g){return [0,.52,.34,.26][deployedAll(g).length]||0;}
const controlTimes=new WeakMap();
function castSkill(g,p,target,k){const before=g.enemies.filter(e=>!e.dead&&e.isBoss).map(e=>[e,{stun:e.stun||0,slow:e.slow||0,slowFactor:e.slowFactor||1,fractureTime:e.fractureTime||0,fractureMultiplier:e.fractureMultiplier||1}]);const ctx=actorContext(g,p,target),used=!!g.skill.call(ctx,k);p.bullets=ctx.bullets;p.zones=ctx.zones;p.spellState=ctx.ch3;for(const [e,v]of before){if(e.stun>v.stun){const last=controlTimes.get(e)??-100;const allowed=g.time-last>=3;e.stun=allowed?Math.max(v.stun,Math.min(.25,e.stun)):v.stun;if(allowed)controlTimes.set(e,g.time);}if(e.slow>v.slow){e.slow=Math.max(v.slow,Math.min(2,e.slow));e.slowFactor=Math.min(v.slowFactor,Math.max(.8,e.slowFactor||1));}if(e.fractureMultiplier>v.fractureMultiplier){e.fractureMultiplier=Math.max(v.fractureMultiplier,Math.min(1.06,e.fractureMultiplier));e.fractureTime=Math.max(v.fractureTime,Math.min(2,e.fractureTime));}}return used;}
function notify(g,text){g.say(text);g.saveEvent();}
function availableSkill(g,p,k){const v=g._mercenaryDeps.SKILLS[k];return !!v&&!v.passive&&!v.summon&&p.skills[k]>0&&p.activeSkills.includes(k);}
function makeActor(g,templateId,id=templateId,cls=MERCENARY_ROSTER[templateId].cls,quality='uncommon'){
 const d=MERCENARY_ROSTER[templateId],level=clamp(g.p.level,1,sagaLevelCapV25(g)),p={id:'merc-'+id,mercenaryId:id,templateId,name:d.name,visualIdentity:d.visualIdentity,quality,cls,studyInsightV23:0,level,xp:0,gold:0,x:g.p.x,y:g.p.y,attrs:{str:0,dex:0,vit:0,wis:0},ap:6,sp:3,skills:{},activeSkills:[],skillSpent:{},skillOrigins:{},knownBooks:[],items:{},bag:[],gear:Object.fromEntries(slots.map(k=>[k,null])),bar:[Array(6).fill(null),Array(6).fill(null)],page:0,angle:0,moving:false,anim:0,attackAnim:0,attackKind:'attack',emotion:0,invuln:0,dash:0,guard:0,empower:0,shield:0,shieldTime:0,resonance:0,sprint:0,combo:0,comboLife:0,cd:{attack:0,action:0},downed:false};
 for(const k of [cls==='ember'?'firebolt':'q'])if(g._mercenaryDeps.SKILLS[k]){p.skills[k]=1;p.skillSpent[k]=0;p.skillOrigins[k]='mercenary-training';p.knownBooks.push(k);p.activeSkills.push(k);}
 for(const k of ['edge','heart'])if(g._mercenaryDeps.SKILLS[k]){p.skills[k]=1;p.skillSpent[k]=0;p.skillOrigins[k]='mercenary-training';}
 for(const slot of ['weapon','chest','feet'])p.gear[slot]=g._mercenaryDeps.loot(cls,Math.max(1,level-3),()=>.4,{id:'merc-'+id+'-start-'+slot,slot,rarity:'uncommon',affix:null});
 p.hp=g._mercenaryDeps.stats(p).hp;p.mp=g._mercenaryDeps.stats(p).mp;actorState(p);return p;
}
function nearestTarget(g,p){let best=null,score=Infinity;for(const e of g.enemies){if(e.dead||distance(e,g.p)>440||distance(e,p)>430)continue;const d=distance(e,p);if(d<score&&g.clearLine(p,e,false)){best=e;score=d;}}return best;}
function moveToward(g,p,goal,dt,speed=205){
 if(distance(p,goal)<16){p.moving=false;return;}
 let target=goal;
 if(g.time>=(p.routeUntil||0)||!p.routeGoal||distance(p.routeGoal,goal)>110){p.routeUntil=g.time+1.0;p.routeGoal={x:goal.x,y:goal.y};p.route=g.clearLine(p,goal,false)?[{...goal}]:g.routeTo(goal,p);}
 while(p.route?.length&&distance(p,p.route[0])<17)p.route.shift();if(p.route?.length)target=p.route[0];
 const d=distance(p,target);if(d<1)return;const ox=p.x,oy=p.y;p.angle=Math.atan2(target.y-p.y,target.x-p.x);g.moveActor(p,p.x+(target.x-p.x)/d*speed*dt,p.y+(target.y-p.y)/d*speed*dt);const travel=Math.hypot(p.x-ox,p.y-oy);p.anim+=travel/18;p.walkDistance=(p.walkDistance||0)+travel;p.moving=travel>.02;p.stuck=travel<.02?(p.stuck||0)+dt:0;
}
function effect(g,p,type,x=p.x,y=p.y,r=48,life=.45){g.effect(type,x,y,r,(MERCENARY_ROSTER[p.templateId||p.mercenaryId]?.color||'#d8cab0'),life,{ownerClass:p.cls,skillKey:p.attackKind,mercenary:true});}
function healMercenary(g,p,n){const delta=Math.min(g._mercenaryDeps.stats(p).hp-p.hp,Math.max(0,n));if(delta>0){p.hp+=delta;g.text('+'+Math.round(delta),p.x,p.y-83,'#a7dfb5');effect(g,p,'holyHeal');}return delta;}
function damageMercenary(g,p,n){
 if(!p||p.downed||p.hp<=0||p.invuln>0||!Number.isFinite(n)||n<=0)return false;const s=g._mercenaryDeps.stats(p);
 if(p.guard>0){p.guard=0;p.empower=5;p.invuln=.25;effect(g,p,'guard');return true;}
 if(isStoryTestV25(g))return false;
 n*=1-s.reduction;if(p.bloodPact>0)n*=1.12;let absorbed=Math.min(p.shield||0,n);p.shield=Math.max(0,(p.shield||0)-absorbed);n=Math.max(0,Math.round(n-absorbed));p.hp=Math.max(0,p.hp-n);p.invuln=.3;if(n)g.text('-'+n,p.x,p.y-82,'#eba5a5');
 if(n>0&&p.hp>0&&p.hp<s.hp*.5&&s.affixes.has('ward')&&!(p.cd.ward>0)){p.cd.ward=12;p.shield=Math.max(p.shield,18);p.shieldTime=3;effect(g,p,'guard');}
 if(p.counterBrand>0&&p.counterDamage){const enemy=nearestTarget(g,p);if(enemy&&distance(enemy,p)<170){deal(g,p,enemy,p.counterDamage,'ch3skill');p.counterBrand=0;}}
 if(p.hp<=0){p.downed=true;p.moving=false;p.visible=false;p.bullets=[];p.zones=[];p.spellState={pulses:[],lantern:null};undeploy(g,p.mercenaryId);notify(g,p.name+'负伤撤回了阙灯城。安全处可用30金治疗。');}return true;
}
function deal(g,p,e,n,kind='hit'){
 if(!e||e.dead||inMemory(g)||!Number.isFinite(n)||n<=0)return;const s=g._mercenaryDeps.stats(p),crit=!['dot','proc','enchant'].includes(kind)&&g.rng()<s.crit;
 // The owner receives quest/loot credit. An explicit resolved damage kind avoids
 // borrowing the owner's crit, lifesteal, resonance, enchantments or mana-mote rolls.
 let value=n*mercenarySupportFactorV18(g)*(crit?s.critMultiplier||1.5:1)*(p.bloodPact>0?1.24:1)*(e.fractureTime>0?e.fractureMultiplier||1:1);
 g.damage(e,Math.round(value),'enchant');effect(g,p,'sparks',e.x,e.y-25,24,.22);p.combo++;p.comboLife=2.5;
 const direct=!['dot','enchant','proc'].includes(kind);if(direct){p.emotion=Math.min(100,p.emotion+(s.affixes.has('echo')?3:2));if(s.affixes.has('blood')||s.affixes.has('fire')||kind==='hit'&&p.cls==='shadow'){const dot=p.dotTargets[e.id]||(p.dotTargets[e.id]={bleed:0,bleedTime:0,burn:0,tick:1});if(s.affixes.has('blood')||kind==='hit'&&p.cls==='shadow'){dot.bleed=Math.min(4,dot.bleed+1);dot.bleedTime=g._mercenaryDeps.combatBalance?.bleedDuration||5;}if(s.affixes.has('fire'))dot.burn=3;}if(e.dead&&s.affixes.has('mercy'))healMercenary(g,p,5);}
 if(['skill','ch3skill'].includes(kind)&&s.affixes.has('storm')&&!(p.cd.storm>0)){p.cd.storm=8;effect(g,p,'lightning',e.x,e.y,115,.35);for(const other of g.enemies)if(!other.dead&&distance(other,e)<115&&g.clearLine(e,other,false))deal(g,p,other,s.atk*.9,'proc');}
 if(direct&&!e.dead&&g._mercenaryDeps.enchantProc){const ctx=actorContext(g,p,e),base=g._mercenaryDeps.basePower?g._mercenaryDeps.basePower(p,g._mercenaryDeps.CLASSES[p.cls]):s.atk;g._mercenaryDeps.enchantProc(ctx,e,kind,base,()=>1);}
 if(kind==='hit'&&p.cls==='ember'){p.emberHits=(p.emberHits||0)+1;if(p.emberHits>=3){p.emberHits=0;p.emberReady=true;}}
}
function actorContext(g,p,target){
 const ctx=Object.create(g);ctx.p=p;ctx.target=target?.id||null;ctx.active=true;ctx.pending=null;ctx.transition=null;ctx.ch3=p.spellState;ctx.bullets=p.bullets;ctx.zones=p.zones;ctx._mercenaryContext=true;
 ctx.saveEvent=()=>{};ctx.say=()=>{};ctx.emit=(type,data={})=>{if(type==='sfx')g.emit(type,data);};ctx.damage=(e,n,kind)=>deal(g,p,e,n,kind);ctx.damageProp=()=>{};ctx.heal=n=>healMercenary(g,p,n);ctx.hurt=n=>damageMercenary(g,p,n);
 ctx.aim=()=>{if(target&&!target.dead)p.angle=Math.atan2(target.y-p.y,target.x-p.x);return target;};ctx.relocate=(x,y)=>{const at=g.safePoint(x,y);p.x=at.x;p.y=at.y;p.route=[];};ctx.effect=(type,x,y,r,color,life,extra={})=>g.effect(type,x,y,r,color,life,{...extra,ownerClass:p.cls,mercenary:true});
 ctx.gainXP=()=>{};ctx.addItem=()=>false;ctx.obtainGear=()=>false;return ctx;
}
function classify(p,k,s){
 if(s.heal>0&&s.damage===0||['fieldMend','saintMend'].includes(k))return 'heal';
 if(s.shield>0||['ashWard','stoneSkin','saintWard','counterBrand'].includes(k)||k==='e'&&p.cls==='oath')return 'defence';
 if(['focusBreath','soulTithe'].includes(k))return 'mana';
 if(['battleTempo','bloodPact'].includes(k))return 'buff';
 if(['frost','crash','bladeRain','ashBurst','graveBell','wispLantern','tether','saintNova'].includes(k)||k==='e'||k==='q'&&p.cls==='ember')return 'area';
 return 'attack';
}
function selectSkill(g,p,target){
 const stats=g._mercenaryDeps.stats(p),d=target?distance(p,target):Infinity,near=g.enemies.filter(e=>!e.dead&&distance(e,p)<180).length;
 const choices=p.activeSkills.filter(k=>availableSkill(g,p,k)&&!(p.cd[k]>0)).map((k,index)=>{let n=g._mercenaryDeps.skillNumbers(p,k,g._mercenaryDeps.CLASSES[p.cls]);if(!n)return null;return {k,n,index,type:classify(p,k,n)};}).filter(Boolean);
 const order=['heal','defence','mana','buff','area','attack'];
 for(const type of order)for(const c of choices.filter(c=>c.type===type)){
  if(p.mp<c.n.cost)continue;
  if(type==='heal'&&p.hp>=stats.hp*.5)continue;
  if(type==='defence'&&(!target||d>160||p.shield>0||p.guard>0||p.stoneSkin>0))continue;
  if(type==='mana'&&(p.mp>=stats.mp*.4||p.focusBreath>0||c.k==='soulTithe'&&p.hp<stats.hp*.65))continue;
  if(type==='buff'&&(!target||d>200||p.battleTempo>0||p.bloodPact>0||p.hp<stats.hp*.55))continue;
  if(type==='area'&&(near<2||!target))continue;
  if(type==='attack'&&(!target||d>(c.n.range||(/firebolt|Lance|Shard|Ray/.test(c.k)?320:170))))continue;
  if(c.k==='q'&&p.cls==='shadow'&&d>225)continue;
  return c.k;
 }
 return null;
}
function tickSpellFields(g,p,dt){
 for(const [id,dot]of Object.entries(p.dotTargets||{})){const e=g.enemies.find(e=>e.id===id&&!e.dead);if(!e){delete p.dotTargets[id];continue;}dot.bleedTime=Math.max(0,dot.bleedTime-dt);if(!dot.bleedTime)dot.bleed=0;dot.tick-=dt;if(dot.tick<=0){dot.tick=1;const b=g._mercenaryDeps.combatBalance;deal(g,p,e,dot.bleed*(b?.bleedTickDamage||2)+dot.burn*(b?.burnTickDamage||2),'dot');dot.burn=Math.max(0,dot.burn-1);}if(!dot.bleed&&!dot.burn)delete p.dotTargets[id];}
 const kept=[];for(const b of p.bullets){const travel=Math.min(Math.hypot(b.vx,b.vy)*dt,b.remaining??Infinity),pieces=Math.max(1,Math.ceil(travel/8)),len=Math.hypot(b.vx,b.vy)||1;
  for(let i=0;i<pieces&&b.life>0;i++){b.x+=b.vx/len*travel/pieces;b.y+=b.vy/len*travel/pieces;if(g.blocked(b.x,b.y,false)){b.life=0;break;}const e=g.enemies.find(e=>!e.dead&&!b.hitIds?.includes(e.id)&&distance(e,b)<(b.r||6)+20);if(e){deal(g,p,e,b.n,b.skill?'skill':'hit');if(b.slowDuration){const duration=e.isBoss?Math.min(2,b.slowDuration):b.slowDuration,factor=e.isBoss?Math.max(.8,b.slowFactor||.75):b.slowFactor||.75;e.slow=Math.max(e.slow||0,duration);e.slowFactor=Math.min(e.slowFactor||1,factor);}if(b.pierce>0){b.pierce--;b.hitIds=b.hitIds||[];b.hitIds.push(e.id);b.n*=b.secondaryMultiplier||1;}else b.life=0;}}
  b.life-=dt;if(b.remaining!=null)b.remaining-=travel;if(b.life>0&&(b.remaining==null||b.remaining>0))kept.push(b);
 }p.bullets=kept;
 for(const z of p.zones){z.life-=dt;z.tick-=dt;if(z.tick<=0){z.tick=1;for(const e of g.enemies)if(!e.dead&&distance(e,z)<z.r&&g.clearLine(z,e,false))deal(g,p,e,z.n,'dot');}}p.zones=p.zones.filter(z=>z.life>0);
 const h=p.spellState;for(const pulse of h.pulses||[])if(pulse.at<=g.time&&pulse.map===g.map){for(const e of g.enemies.filter(e=>!e.dead&&distance(e,pulse)<pulse.r).slice(0,pulse.max||5))if(g.clearLine(pulse,e,false))deal(g,p,e,pulse.n,'ch3skill');pulse.done=true;}h.pulses=(h.pulses||[]).filter(z=>!z.done);
 if(h.lantern){const z=h.lantern;z.life-=dt;z.tick-=dt;if(z.tick<=0){z.tick=1;for(const e of g.enemies.filter(e=>!e.dead&&distance(e,z)<z.r).slice(0,z.maxTargets||3))if(g.clearLine(z,e,false))deal(g,p,e,z.n,'dot');effect(g,p,'graveBell',z.x,z.y,z.r,.45);}if(z.life<=0)h.lantern=null;}
}
function basicAttack(g,p,target){
 if(p.cd.attack>0||p.cd.action>0||!p.gear.weapon&&!p.gear.offhand||!target)return;const s=g._mercenaryDeps.stats(p),ranged=p.cls==='ember',reach=ranged?300:90;if(distance(p,target)>reach||!g.clearLine(p,target,false))return;
 p.angle=Math.atan2(target.y-p.y,target.x-p.x);p.attackKind='attack';p.attackAnim=p.cls==='oath'?.44:.36;p.attackDuration=p.attackAnim;p.cd.attack=s.attackRate;p.cd.action=.2;
 const n=s.atk*(g._mercenaryDeps.damageModifier?.(p,'attack')??1)*(g._mercenaryDeps.hellDamageFactor?.(p,'attack')??1);
 if(ranged){p.bullets.push({x:p.x,y:p.y-15,vx:Math.cos(p.angle)*410,vy:Math.sin(p.angle)*410,r:6,life:.8,remaining:320,friendly:true,n,color:'#e8b478',mercenary:true});effect(g,p,'flame',p.x,p.y-35,24,.25);}else {deal(g,p,target,n*(p.empower>0?2:1));p.empower=0;effect(g,p,'cut',p.x,p.y-20,90,.18);}
}
function tick(g,p,dt,index=0){
 if(!p)return;p.visible=true;if(!g.active||g.pending||g.transition){p.moving=false;p.attackAnim=0;return;}if(p.map!==g.map){const at=g.safePoint(g.p.x-60+(index%2)*120,g.p.y+70+Math.floor(index/2)*70);Object.assign(p,at);actorState(p);p.map=g.map;p.visible=true;}
 if(p.downed||p.hp<=0)return;dt=Math.min(.05,dt);const st=g._mercenaryDeps.stats(p);for(const k of Object.keys(p.cd))p.cd[k]=Math.max(0,p.cd[k]-dt);for(const k of ['attackAnim','invuln','guard','empower','shieldTime','resonance','sprint','comboLife','battleTempo','stoneSkin','focusBreath','bloodPact','counterBrand'])p[k]=Math.max(0,(p[k]||0)-dt);if(!p.shieldTime)p.shield=0;if(p.focusBreath>0)p.mp=Math.min(st.mp,p.mp+dt*(p.focusRegen||4));p.mp=Math.min(st.mp,p.mp+dt*st.manaRegen);tickSpellFields(g,p,dt);
 if(g.time>=(p.thinkAt||0)){p.thinkAt=g.time+.18;p.targetId=nearestTarget(g,p)?.id||null;}
 const target=g.enemies.find(e=>e.id===p.targetId&&!e.dead);if(target&&distance(target,g.p)<440){const range=p.cls==='ember'?235:72;if(distance(p,target)>range)moveToward(g,p,target,dt);else p.moving=false;
  if(!(p.cd.action>0)){const k=selectSkill(g,p,target);let used=false;if(k){used=castSkill(g,p,target,k);}if(!used)basicAttack(g,p,target);}
 }else {const gap=distance(p,g.p);if(gap>85){const a=g.p.angle||0,goal=g.safePoint(g.p.x-Math.cos(a)*(85+Math.floor(index/2)*55)-Math.sin(a)*(index===0?-55:index===1?55:0),g.p.y-Math.sin(a)*(85+Math.floor(index/2)*55)+Math.cos(a)*(index===0?-55:index===1?55:0));moveToward(g,p,goal,dt,gap>240?235:205);}else p.moving=false;const k=selectSkill(g,p,null);if(k&&!(p.cd.action>0)){castSkill(g,p,null,k);}if((p.stuck||0)>2.5&&gap>230&&!g.enemies.some(e=>!e.dead&&distance(e,g.p)<400)){const at=g.safePoint(g.p.x-60,g.p.y+55);Object.assign(p,at);p.stuck=0;}}
}
function separateParty(g){const members=deployedAll(g);for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++){const a=members[i],b=members[j],d=distance(a,b);if(d<38){const angle=d>.1?Math.atan2(b.y-a.y,b.x-a.x):(i+j)*2.1,step=Math.min(7,(38-d)/2);g.moveActor(a,a.x-Math.cos(angle)*step,a.y-Math.sin(angle)*step);g.moveActor(b,b.x+Math.cos(angle)*step,b.y+Math.sin(angle)*step);}}}
function segmentHit(a,b,p,r){const vx=b.x-a.x,vy=b.y-a.y,l=vx*vx+vy*vy,t=l?clamp(((p.x-a.x)*vx+(p.y-a.y)*vy)/l,0,1):0;return Math.hypot(p.x-a.x-t*vx,p.y-a.y-t*vy)<r?t:null;}
function intercept(g,p,dt){if(!p||p.downed||!p.visible||!g.active||g.pending)return;for(const b of g.bullets){if(b.friendly||b.lockedBasic||b.life<=0||b.sourceMap!=null&&b.sourceMap!==g.map)continue;const travel=Math.min(dt,b.life,(b.remaining??Infinity)/(Math.hypot(b.vx,b.vy)||1)),end={x:b.x+b.vx*travel,y:b.y+b.vy*travel},t=segmentHit(b,end,p,20+(b.r||8)),hero=segmentHit(b,end,g.p,20+(b.r||8));if(t!==null&&(hero===null||t<hero)&&g.clearLine(b,p,false)){damageMercenary(g,p,b.n);b.life=0;}}}
function skillText(g,p,k){const v=g._mercenaryDeps.SKILLS[k],s=g._mercenaryDeps.skillNumbers(p,k,g._mercenaryDeps.CLASSES[p.cls]);return {name:v?.name||g._mercenaryDeps.CLASSES[p.cls]?.[k]||k,rank:p.skills[k]||0,description:s?`${s.cost} MP · ${s.cd}秒冷却 · ${s.value||Math.round(s.damage||0)+'伤害'}。${s.formula||''} ${s.extra||v.desc||''}`:v?.desc||''};}
function studyTiers(g,p){return Object.entries(MERCENARY_BOOK_TIERS_V23).map(([quality,keys])=>({quality,probability:MERCENARY_STUDY_V23.odds[quality],keys:keys.filter(k=>g._mercenaryDeps.SKILLS[k]&&!g._mercenaryDeps.SKILLS[k].summon&&!g._mercenaryDeps.SKILLS[k].passive&&(g._mercenaryDeps.SKILLS[k].lv||1)<=p.level&&g._mercenaryDeps.skillNumbers({...p,skills:{...p.skills,[k]:1}},k,g._mercenaryDeps.CLASSES[p.cls]))})).filter(t=>t.keys.length);}
function weighted(g,entries){const total=entries.reduce((n,e)=>n+e.probability,0),value=random(g)*total;let cumulative=0;for(const entry of entries){cumulative+=entry.probability;if(value<cumulative)return entry;}return entries[entries.length-1];}
function finishRecruit(g,templateId,{randomRecruit=false,cls=MERCENARY_ROSTER[templateId].cls,quality='uncommon'}={}){
 const h=state(g);let id=templateId;if(randomRecruit){do{id=templateId+'~'+(++h.recruitSerial);}while(h.roster[id]);}
 const p=makeActor(g,templateId,id,cls,quality);if(randomRecruit)h.ticketCount--;else h.initialContractUsed=true;
 h.roster[id]=p;h.selectedId=id;h.tab='growth';if(h.activeIds.length<3){h.activeIds.push(id);h.activeId=h.activeIds[0];}
 h.lastRecruitResult={actorId:id,templateId,quality,cls,random:randomRecruit,serial:h.recruitSerial};
 notify(g,p.name+'收好了契约，答应与你们同行。');return true;
}
export function validateMercenarySave(save){
 const h=save.mercenariesV14;if(!h)return true;const fail=()=>{throw new Error('同行成长记录不完整。');},obj=v=>!!v&&typeof v==='object'&&!Array.isArray(v),integer=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
 if(!obj(h)||![1,2,3].includes(h.schema)||!integer(h.seed,0,4294967295)||!obj(h.roster)||Object.keys(h.roster).length>(h.schema===3?MAX_ROSTER:Object.keys(MERCENARY_ROSTER).length)||!integer(h.bookDraws,0,1e9))fail();
 if(h.activeId&&!Object.hasOwn(h.roster,h.activeId))fail();
 if(h.schema>=2){if(!Array.isArray(h.activeIds)||h.activeIds.length>3||new Set(h.activeIds).size!==h.activeIds.length||h.activeIds.some(id=>!Object.hasOwn(h.roster,id))||h.activeId!==(h.activeIds[0]||null)||typeof h.initialContractUsed!=='boolean'||Object.keys(h.roster).length&&!h.initialContractUsed||!integer(h.ticketCount,0,999)||!integer(h.ticketMisses,0,h.schema===3?40:15)||!integer(h.combatSerial,0,1e9)||!obj(h.ticketEvents)||Object.keys(h.ticketEvents).length>25000||Object.entries(h.ticketEvents).some(([k,v])=>k.length>180||!k.length||typeof v!=='boolean'))fail();}
 if(h.schema===3&&!integer(h.recruitSerial,0,1e9))fail();
 if(h.selectedId!==null&&h.selectedId!==undefined&&!Object.hasOwn(h.roster,h.selectedId))fail();
 const gearIds=new Set();for(const [id,p]of Object.entries(h.roster)){
  if(!obj(p))fail();const templateId=h.schema===3?p.templateId:id,d=Object.hasOwn(MERCENARY_ROSTER,templateId)?MERCENARY_ROSTER[templateId]:null;
  if(!d||h.schema<3&&p.cls!==d.cls||h.schema===3&&(!CLASSES_V23.includes(p.cls)||!Object.hasOwn(MERCENARY_QUALITIES_V18,p.quality)||!integer(p.studyInsightV23,0,4)||!new RegExp('^'+p.templateId+'(?:~[1-9][0-9]*)?$').test(id)||id.includes('~')&&Number(id.split('~')[1])>h.recruitSerial)||p.mercenaryId!==id||p.id!=='merc-'+id||!integer(p.level,1,sagaSavedLevelCapV25(save))||!Number.isFinite(p.hp)||p.hp<0||!Number.isFinite(p.mp)||p.mp<0||!obj(p.gear)||!obj(p.skills)||!obj(p.attrs)||!Array.isArray(p.activeSkills)||p.activeSkills.length>5||new Set(p.activeSkills).size!==p.activeSkills.length||p.activeSkills.some(k=>!(p.skills[k]>0)||SKILLS[k]?.passive)||['ap','sp','xp'].some(k=>!integer(p[k],0,1e7))||['str','dex','vit','wis'].some(k=>!integer(p.attrs[k],0,10000))||Object.entries(p.skills).some(([k,v])=>!SKILLS[k]||!integer(v,0,SKILLS[k].rank))||p.career)fail();
  if(p.skillSpent&&(!obj(p.skillSpent)||Object.entries(p.skillSpent).some(([k,v])=>!SKILLS[k]||!integer(v,0,SKILLS[k].rank*SKILLS[k].cost))))fail();
  if(p.cd&&(!obj(p.cd)||Object.values(p.cd).some(n=>!Number.isFinite(n)||n<0||n>10000)))fail();
  for(const [slot,i]of Object.entries(p.gear)){if(!slots.includes(slot))fail();if(i){if(!obj(i)||typeof i.id!=='string'||!i.id.length||gearIds.has(i.id)||!slots.includes(i.slot)||!Number.isFinite(i.atk)||i.atk<0||!Number.isFinite(i.hp)||i.hp<0||Object.values(i.attrs||{}).some(v=>!Number.isFinite(v)))fail();gearIds.add(i.id);}}
 }
 for(const p of [save.p,save.ch3?.frozenHero,save.ch3?.saintBuild].filter(Boolean))for(const i of [...(p.bag||[]),...Object.values(p.gear||{}).filter(Boolean)])if(gearIds.has(i.id))fail();
 for(const i of save.pendingRewards||[])if(gearIds.has(i.id))fail();
 if(h.schema===3){
  const r=h.lastRecruitResult;if(r!==null&&r!==undefined&&(!obj(r)||typeof r.actorId!=='string'||!Object.hasOwn(MERCENARY_ROSTER,r.templateId)||!Object.hasOwn(MERCENARY_QUALITIES_V18,r.quality)||!CLASSES_V23.includes(r.cls)||typeof r.random!=='boolean'||!integer(r.serial,0,h.recruitSerial)))fail();
  const b=h.lastBookResult;if(b!==null&&b!==undefined&&(!obj(b)||typeof b.actorId!=='string'||!MERCENARY_BOOK_TIERS_V23[b.quality]?.includes(b.skillId)||typeof b.duplicate!=='boolean'||!integer(b.draw,1,h.bookDraws)||!integer(b.insightGained,0,5)||!integer(b.skillPointsGained,0,1)))fail();
 }return true;
}
export function installMercenariesV14(RPG,deps){
 const P=RPG.prototype;if(P._mercenariesV14Installed)return;P._mercenariesV14Installed=true;P._mercenaryDeps=deps;
 deps.ITEMS.mercenaryBook={name:'同行研习卷',kind:'book',mercenary:true,region:5,desc:'在安全处交给同行研读，随机获得一种战技。可能与已学战技重复，重复时积累本人的研习心得；每5点心得换1技能点。不占主角的技能。'};
 const old={};for(const k of ['snapshot','restore','update','gainXP','enter','enemyHit','respawn','beginScene','restAtBed','useBook'])old[k]=P[k];
 P.mercenaryState=function(){return state(this);};P.mercenaryUnlocked=function(){return unlocked(this);};P.mercenarySafe=function(){return safe(this);};P.activeMercenary=function(){return deployed(this);};P.activeMercenaries=function(){return deployedAll(this);};P.hurtMercenary=function(p,n){if(!deployedAll(this).includes(p)||!p.visible||!this.active||this.pending)return false;return damageMercenary(this,p,n);};P.mercenarySkillText=function(id,k){const p=state(this).roster[id];return p?skillText(this,p,k):null;};
 P.openMercenaries=function(id=null){if(!unlocked(this)||inMemory(this)){this.say('先去阙灯城见赛芙。');return false;}if(id&&state(this).roster[id]){state(this).selectedId=id;state(this).tab='growth';}else if(!Object.keys(state(this).roster).length)state(this).tab='roster';this.active=false;this.p.moving=false;this.moveTo=null;this.emit('mechanism',{kind:'v14-mercenaries'});return true;};P.openMercenary=P.openMercenaries;
 P.useBook=function(id){if(id==='mercenaryBook'){state(this).tab='skills';return this.openMercenaries();}return old.useBook.call(this,id);};
 P.canRecruitMercenaryV18=function(id){const h=state(this);return Object.hasOwn(MERCENARY_ROSTER,id)&&!h.initialContractUsed&&Object.keys(h.roster).length<MAX_ROSTER&&unlocked(this)&&safe(this);};
 P.recruitMercenary=function(id){if(!this.canRecruitMercenaryV18(id))return false;return finishRecruit(this,id);};
 P.canRecruitRandomMercenaryV23=function(){const h=state(this);return unlocked(this)&&safe(this)&&h.initialContractUsed&&h.ticketCount>0&&Object.keys(h.roster).length<MAX_ROSTER&&h.recruitSerial<1e9;};
 P.recruitRandomMercenaryV23=function(){if(!this.canRecruitRandomMercenaryV23())return false;const templates=Object.keys(MERCENARY_ROSTER),templateId=templates[Math.floor(random(this)*templates.length)],cls=CLASSES_V23[Math.floor(random(this)*CLASSES_V23.length)],quality=weighted(this,Object.entries(MERCENARY_RECRUIT_ODDS_V23).map(([quality,probability])=>({quality,probability}))).quality;return finishRecruit(this,templateId,{randomRecruit:true,cls,quality});};
 P.mercenaryDismissInfoV23=function(id){const p=state(this).roster[id],equipmentCount=p?Object.values(p.gear).filter(Boolean).length:0,freeSlots=Math.max(0,60-this.p.bag.length),reason=!p?'这位同行不在名册中。':!safe(this)?'先在安全处安顿下来。':freeSlots<equipmentCount?'需要腾出'+equipmentCount+'格行囊，才能收回同行身上的全部装备。':'';return {canDismiss:!reason,reason,equipmentCount,requiredSlots:equipmentCount,freeSlots};};
 P.dismissMercenaryV23=function(id){const info=this.mercenaryDismissInfoV23(id);if(!info.canDismiss){this.say(info.reason);return false;}const h=state(this),p=h.roster[id],gear=Object.values(p.gear).filter(Boolean).map(i=>({...i,slot:i.slot==='offhand'?'weapon':i.slot}));this.p.bag.push(...gear);actorState(p);undeploy(this,id);delete h.roster[id];if(h.selectedId===id)h.selectedId=Object.keys(h.roster)[0]||null;if(!h.selectedId)h.tab='roster';notify(this,p.name+'与你们道别了。随身装备已经收回行囊，培养记录随契约结束。');return true;};
 P.deployMercenary=function(id){const h=state(this),p=id?h.roster[id]:null;if(!safe(this)||id&&(!p||p.downed))return false;if(!id){for(const member of deployedAll(this))actorState(member);h.activeIds=[];h.activeId=null;}else if(!h.activeIds.includes(id)){if(h.activeIds.length>=3){this.say('同行队伍已经满了。先让一位回城休息。');return false;}h.activeIds.push(id);h.activeId=h.activeIds[0];actorState(p);p.map=null;}this.saveEvent();return true;};
 P.withdrawMercenaryV18=function(id){const h=state(this);if(!safe(this)||!h.activeIds.includes(id))return false;actorState(h.roster[id]);undeploy(this,id);this.saveEvent();return true;};
 P.rollRecruitTicketV18=function(sourceId,{chance=.15,guaranteed=false}={}){const h=state(this);if(!unlocked(this)||inMemory(this)||this._mercenaryContext||this.p.cls==='saint'||typeof sourceId!=='string'||!sourceId.length||sourceId.length>180||Object.hasOwn(h.ticketEvents,sourceId)||Object.keys(h.ticketEvents).length>=25000)return {processed:false,awarded:false,tickets:h.ticketCount};const value=random(this),awarded=!!guaranteed||h.ticketMisses>=40||value<clamp(Number(chance)||0,0,1);h.ticketEvents[sourceId]=awarded;h.ticketMisses=awarded?0:Math.min(40,h.ticketMisses+1);if(awarded){h.ticketCount=Math.min(999,h.ticketCount+1);this.say('报酬里夹着一张盖好印的同行契约。可以带回阙灯城找赛芙。');}this.saveEvent();return {processed:true,awarded,tickets:h.ticketCount};};
 P.grantRecruitTicketV18=function(sourceId){return this.rollRecruitTicketV18(sourceId,{guaranteed:true});};
 P.treatMercenary=function(id){const p=state(this).roster[id];if(!p||!safe(this)||this.p.gold<30)return false;const s=deps.stats(p);if(!p.downed&&p.hp>=s.hp&&p.mp>=s.mp)return false;this.p.gold-=30;p.downed=false;p.hp=s.hp;p.mp=s.mp;this.saveEvent();return true;};
 P.mercenaryStudyInfoV23=function(id){const h=state(this),p=h.roster[id],tiers=p?studyTiers(this,p):Object.entries(MERCENARY_STUDY_V23.odds).map(([quality,probability])=>({quality,probability})),total=tiers.reduce((n,t)=>n+t.probability,0);return {price:MERCENARY_STUDY_V23.price,odds:tiers.map(t=>({quality:t.quality,name:MERCENARY_QUALITIES_V18[t.quality].name,probability:t.probability/total})),duplicateThreshold:MERCENARY_STUDY_V23.duplicateThreshold,insight:p?.studyInsightV23||0,lastResult:h.lastBookResult||null};};
 P.buyMercenaryBook=function(){if(!unlocked(this)||!safe(this)||this.p.gold<MERCENARY_STUDY_V23.price||(this.p.items.mercenaryBook||0)>=100000)return false;this.p.gold-=MERCENARY_STUDY_V23.price;this.addItem('mercenaryBook');return true;};
 P.teachMercenary=function(id){
  const h=state(this),p=h.roster[id];if(!p||!safe(this)||!(this.p.items.mercenaryBook>0)||h.bookDraws>=1e9)return false;
  const tiers=studyTiers(this,p);if(!tiers.length){this.say('这份研习卷的招式还太难，等同行再积累些经验。');return false;}
  const tier=weighted(this,tiers),k=tier.keys[Math.floor(random(this)*tier.keys.length)],duplicate=!!p.skills[k];this.p.items.mercenaryBook--;h.bookDraws++;
  const insightGained=duplicate?MERCENARY_STUDY_V23.insight[tier.quality]:0,insight=(p.studyInsightV23||0)+insightGained,skillPointsGained=Math.floor(insight/MERCENARY_STUDY_V23.duplicateThreshold);p.studyInsightV23=insight%MERCENARY_STUDY_V23.duplicateThreshold;p.sp+=skillPointsGained;
  if(!duplicate){p.skills[k]=1;p.skillSpent[k]=0;p.skillOrigins[k]='mercenary-book';if(!p.knownBooks.includes(k))p.knownBooks.push(k);if(p.activeSkills.length<5)p.activeSkills.push(k);}
  h.lastBookResult={actorId:id,skillId:k,quality:tier.quality,duplicate,insightGained,skillPointsGained,draw:h.bookDraws};
  notify(this,duplicate?p.name+'重读了「'+deps.SKILLS[k].name+'」，记下'+insightGained+'点研习心得。'+(skillPointsGained?'积累的心得换成了1技能点。':''):p.name+'学会了「'+deps.SKILLS[k].name+'」。');return k;
 };
 P.activateMercenarySkill=function(id,k,replace=null){const p=state(this).roster[id];if(!p||!safe(this)||!p.skills[k]||!careerSkillUnlocked(p,k)||deps.SKILLS[k]?.passive)return false;if(p.activeSkills.includes(k))return true;if(replace!==null&&Number.isInteger(replace)&&replace>=0&&replace<p.activeSkills.length)p.activeSkills[replace]=k;else if(p.activeSkills.length<5)p.activeSkills.push(k);else return false;this.saveEvent();return true;};
 P.deactivateMercenarySkill=function(id,k){const p=state(this).roster[id];if(!p||!safe(this))return false;p.activeSkills=p.activeSkills.filter(v=>v!==k);this.saveEvent();return true;};
 P.allocateMercenary=function(id,key){const p=state(this).roster[id];if(!p||!safe(this)||!['str','dex','vit','wis'].includes(key)||p.ap<1)return false;p.ap--;p.attrs[key]++;this.saveEvent();return true;};
 P.trainMercenary=function(id,k){const p=state(this).roster[id],v=deps.SKILLS[k];if(!p||!safe(this)||!p.skills[k]||!careerSkillUnlocked(p,k)||!v||p.skills[k]>=v.rank||p.sp<v.cost||p.level<Math.max(v.lv||1,p.skills[k]+1)||v.requires&&(p.skills[v.requires[0]]||0)<v.requires[1])return false;p.sp-=v.cost;p.skills[k]++;p.skillSpent[k]=(p.skillSpent[k]||0)+v.cost;this.saveEvent();return true;};
 P.resetMercenary=function(id,item){const p=state(this).roster[id];if(!p||!safe(this)||!['attributeReset','skillReset'].includes(item)||!(this.p.items[item]>0))return false;const ctx=actorContext(this,p,null),beforeItems=p.items;p.items=this.p.items;ctx.say=t=>this.say(t);let ok=false;try{ok=this.resetPoints.call(ctx,item);}finally{this.p.items=p.items;p.items=beforeItems;}if(ok)this.saveEvent();return ok;};
 P.equipMercenary=function(id,gearId,slot){const p=state(this).roster[id];if(!p||!safe(this))return false;const item=this.p.bag.find(i=>i.id===gearId);if(!item||item.minLevel>p.level)return false;const ctx=actorContext(this,p,null);ctx.p.bag=this.p.bag;ctx.say=t=>this.say(t);let ok=false;try{ok=this.equip.call(ctx,gearId,slot);}finally{this.p.bag=ctx.p.bag;p.bag=[];}if(ok)this.saveEvent();return ok;};
 P.unequipMercenary=function(id,slot){const p=state(this).roster[id];if(!p||!safe(this)||!slots.includes(slot))return false;const ctx=actorContext(this,p,null);ctx.p.bag=this.p.bag;ctx.say=t=>this.say(t);let ok=false;try{ok=this.unequip.call(ctx,slot);}finally{this.p.bag=ctx.p.bag;p.bag=[];}if(ok)this.saveEvent();return ok;};
 P.snapshot=function(){const s=old.snapshot.call(this);if(inMemory(this)){s.mercenariesV14=s.mercenariesV14||serialize(this);return s;}s.mercenariesV14=serialize(this);return s;};
 P.restore=function(s){validateMercenarySave(s);this.mercenariesV14=s.mercenariesV14?migrateParty(clone(s.mercenariesV14)):fresh();old.restore.call(this,s);for(const p of Object.values(state(this).roster)){const d=MERCENARY_ROSTER[p.templateId];p.name=d.name;p.visualIdentity=d.visualIdentity;p.gear=Object.fromEntries(slots.map(k=>[k,deps.normalizeGear(p.gear[k],p.cls)]));p.cd=p.cd||{};p.items={};p.bag=[];p.skillSpent=p.skillSpent||{};p.skillOrigins=p.skillOrigins||{};p.knownBooks=p.knownBooks||[];p.hp=clamp(p.hp,0,deps.stats(p).hp);p.mp=clamp(p.mp,0,deps.stats(p).mp);p.downed=p.downed||p.hp===0;actorState(p);}for(const id of [...state(this).activeIds])if(state(this).roster[id]?.downed)undeploy(this,id);};
 P.update=function(dt,input){if(this._mercenaryContext)return old.update.call(this,dt,input);for(const b of this.bullets.filter(b=>!b.friendly&&b.life>0&&!b.lockedBasic)){const candidates=deployedAll(this).filter(p=>p.visible).map(p=>({p,t:segmentHit(b,{x:b.x+b.vx*dt,y:b.y+b.vy*dt},p,20+(b.r||8))})).filter(v=>v.t!==null).sort((a,b)=>a.t-b.t);if(candidates[0])intercept(this,candidates[0].p,dt);}old.update.call(this,dt,input);deployedAll(this).forEach((p,i)=>tick(this,p,dt,i));if(this.active&&!this.pending)separateParty(this);};
 P.gainXP=function(n){const eligible=deployedAll(this).filter(p=>!p.downed&&this.active&&!inMemory(this)&&Number.isFinite(n)&&n>0),result=old.gainXP.call(this,n);for(const p of eligible){p.xp+=Math.max(1,Math.round(n*.65));while(p.level<Math.min(sagaLevelCapV25(this),this.p.level)&&p.xp>=70+p.level*40){p.xp-=70+p.level*40;p.level++;p.ap+=3;p.sp++;this.text(p.name+' Lv.'+p.level,p.x,p.y-112,'#dad19e');}if(p.level>=sagaLevelCapV25(this))p.xp=0;}if(eligible.length)this.saveEvent();return result;};
 P.enter=function(...args){const result=old.enter.apply(this,args);for(const p of Object.values(state(this).roster))actorState(p);return result;};
 P.enemyHit=function(e){if(e.actionSpec?.basicAttack)return old.enemyHit.call(this,e);const m=e.actionSpec||{};for(const p of deployedAll(this)){if(p.visible&&this.active&&!this.pending&&!p.downed){if(m.shape==='circle'){const center=e.moveKind==='wolfSweep'?e:{x:e.tx,y:e.ty};if(distance(p,center)<m.r&&this.clearLine(e,p,false))damageMercenary(this,p,m.damage);}else if(m.shape==='cone'||!m.shape){const a=Math.atan2(p.y-e.y,p.x-e.x);if(distance(p,e)<(m.r||85)&&Math.cos(a-e.angle)>Math.cos(m.arc||1)&&this.clearLine(e,p,false))damageMercenary(this,p,m.damage||20);}}}return old.enemyHit.call(this,e);};
 P.beginScene=function(...args){for(const p of deployedAll(this)){p.moving=false;p.attackAnim=0;p.visible=false;}return old.beginScene.apply(this,args);};
 P.respawn=function(...args){for(const p of deployedAll(this)){p.downed=true;p.hp=0;p.visible=false;undeploy(this,p.mercenaryId);}return old.respawn.apply(this,args);};
 // Rest restores the hero via the existing bed rules; companion treatment is an
 // explicit fee. Neither deployment, dismissal, map entry nor save loading heals.
}
export function mercenaryActors(g){return !g.pending&&!inMemory(g)?deployedAll(g).filter(p=>p.visible&&!p.downed).map(a=>({kind:'mercenary',a})):[];}
export function mercenaryProjectiles(g){return !g.pending&&!inMemory(g)?deployedAll(g).flatMap(p=>p.bullets||[]):[];}
export function drawMercenary(c,bank,p,time,{drawHero,footShadow,drawIdentityActorV18}){
 footShadow(c,p.x,p.y,24,.28);if(!drawIdentityActorV18?.(c,bank,p,time,{size:82}))drawHero(c,bank,p,p.x,p.y,time,{size:79,attack:p.attackAnim,moving:p.moving,anim:p.anim,angle:p.angle});
 c.save();c.textAlign='center';c.font='12px sans-serif';c.lineWidth=3;c.strokeStyle='#15191e';c.fillStyle=MERCENARY_ROSTER[p.templateId||p.mercenaryId]?.color||'#d8cab0';c.strokeText(p.name,p.x,p.y-94);c.fillText(p.name,p.x,p.y-94);c.restore();
}

// Installed after all content modules, so event hooks cover actual chapter-five paths.
export function installPartyRewardHooksV18(RPG){
 const P=RPG.prototype;if(P._partyRewardHooksV18)return;P._partyRewardHooksV18=true;
 const oldDamage=P.damage,deadHandled=new WeakMap();P.damage=function(e,...args){const living=e&&!e.dead&&e.hp>0,result=oldDamage.call(this,e,...args);if(living&&e.dead&&deadHandled.get(e)!==e.respawn&&unlocked(this)&&!inMemory(this)&&!this._mercenaryContext&&!e.isBoss&&!e.ch5Boss&&/^ch5/.test(this.map)&&!this.hellExpeditionsV18?.run&&!e.expeditionV18){deadHandled.set(e,e.respawn);const h=state(this);h.combatSerial++;this.rollRecruitTicketV18('battle:'+this.map+':'+e.id+':'+h.combatSerial,{chance:e.elite?.13:.045});}return result;};
 for(const method of ['claimChapter5Quest','complete','claimHellActivityV15','claimHellActivityV17']){const old=P[method];if(typeof old!=='function')continue;P[method]=function(id,...args){const expeditionId=method==='claimHellActivityV17'&&id==='salvage'?'mining':id,expeditionParcel=!!this.hellExpeditionsV18?.jobs?.[expeditionId]?.parcel,beforeQuest=this.quests?.[id],result=old.call(this,id,...args),completed=result||method==='complete'&&beforeQuest!=='done'&&this.quests?.[id]==='done';if(completed&&!expeditionParcel&&unlocked(this)&&!this.hellExpeditionsV18?.run&&!String(id).includes('expeditionV18')&&!String(id).startsWith('expedition:')){const ordinal=method==='claimHellActivityV17'?this.hellActivitiesV17?.jobs?.[id]?.clears||1:1;this.rollRecruitTicketV18('reward:'+method+':'+id+':'+ordinal,{chance:method.includes('Activity')?.2:.22});}return result;};}
}
