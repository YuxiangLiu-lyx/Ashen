import {playerProjectileSourceValidV17} from './combat-input-v17.js';
import {COMBAT_BALANCE as B,BOSS_MOVES,profileForEnemy} from './balance-v14.js';

export const ENEMY_STATES=Object.freeze({IDLE:'IDLE',PATROL:'PATROL',ALERT:'ALERT',COMBAT:'COMBAT',RETURNING:'RETURNING',DEAD:'DEAD'});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const boss=e=>e.type==='captain'||e.type==='hellJailer'||!!e.isBoss||!!profileForEnemy(e.type).isBoss;
const formidable=e=>boss(e)||e.elite||e.isBoss===true;
const arenaLocked=e=>boss(e)||e.isBossArena===true||e.isBoss===true;
const point=(x,y)=>({x,y});
const insideBounds=(p,b,margin=0)=>!Array.isArray(b)||b.length!==4||p.x>=b[0]-margin&&p.y>=b[1]-margin&&p.x<=b[0]+b[2]+margin&&p.y<=b[1]+b[3]+margin;

// V15 changes effective encounter stats, never the shared immutable profiles.
// Custom authored arena encounters set v15BossStats='custom' after setting HP;
// their own damage values then remain authoritative.
export const BOSS_SCALING_V15=Object.freeze({
  standard:Object.freeze({hp:1.35,damage:1.18,basicCooldown:.9}),
  chapter5:Object.freeze({hp:1.9,damage:1.45,basicCooldown:.85}),
  memory:Object.freeze({hp:1.15,damage:1.08,basicCooldown:1})
});
const scaledBoss=e=>boss(e)||['ch2-bren','secret-warden','echo-warden'].includes(e.id);
const bossScale=e=>!scaledBoss(e)||e.v15BossStats==='custom'?{hp:1,damage:1}:
  e.type==='bloodDemon'?BOSS_SCALING_V15.memory:/^ch5/.test(e.type)||e.ch5Boss?BOSS_SCALING_V15.chapter5:BOSS_SCALING_V15.standard;
function tuneBossStats(e){
  if(!scaledBoss(e)||e.v15BossStats==='custom')return;
  const scale=bossScale(e),cfg=profileForEnemy(e.type,e.id),mark=e.v15BossStats;
  // The playable memory sets its class-specific HP immediately after creation.
  const memoryOverride=e.type==='bloodDemon'&&mark?.version===15&&e.maxHP!==mark.maxHP&&[230000,330000,400000].includes(e.maxHP);
  if(mark?.version===15&&!memoryOverride)return;
  const original=Math.max(1,e.maxHP||cfg.hp),ratio=Math.max(0,Math.min(1,(e.hp||0)/original)),profileHP=Math.round(cfg.hp*scale.hp);
  // V9 map migration can already have copied fresh scaled HP without its marker.
  const maxHP=!mark&&original===profileHP?original:Math.round(original*scale.hp);
  e.maxHP=maxHP;e.hp=e.dead||e.hp<=0?0:Math.max(1,Math.round(ratio*maxHP));
  e.v15BossStats={version:15,baseHP:original,maxHP,damageMultiplier:scale.damage};
  // Older restore migration must not reset newly tuned bosses to V13 profile HP.
  e.v13Tuned=true;
}
const attackDamage=(e,n)=>Math.round(n*bossScale(e).damage*(e.v28DamageMultiplier||1));
// Actor references belong only to this live encounter, never to a saved game.
const basicLocks=new WeakMap(),attackEncounters=new WeakMap();
const liveActor=p=>!!p&&!p.dead&&!p.downed&&Number.isFinite(p.hp)&&p.hp>0;
function attackValid(g,e,record){
  return !!record&&!e.dead&&e.hp>0&&g.active!==false&&!g.pending&&!g.transition&&
    record.map===g.map&&record.hero===g.p&&record.state===g.states?.[g.map]&&
    record.visit===g.states?.[g.map]?.visitCount&&g.enemies.includes(e)&&liveActor(g.p);
}
function beginAttackEncounter(g,e){
  attackEncounters.set(e,{map:g.map,hero:g.p,state:g.states?.[g.map],visit:g.states?.[g.map]?.visitCount});
}
function eligibleMercenary(g,p){
  return !!p&&(g.activeMercenaries?.()||[g.activeMercenary?.()]).includes(p)&&p.visible&&liveActor(p)&&(p.map==null||p.map===g.map);
}
function basicTarget(g,e,cfg,ranged){
  const reach=ranged?(cfg.rangedReach||cfg.reach+12):cfg.reach+12;
  const allowed=p=>liveActor(p)&&distance(e,p)<reach&&g.clearLine(e,p,false);
  const mercs=(g.activeMercenaries?.()||[g.activeMercenary?.()]).filter(p=>eligibleMercenary(g,p)&&allowed(p));const explicit=mercs.find(p=>p.id===e.targetId);if(explicit)return explicit;const merc=mercs.filter(p=>{const d=distance(e,g.p),along=((p.x-e.x)*(g.p.x-e.x)+(p.y-e.y)*(g.p.y-e.y))/Math.max(1,d),cross=Math.abs((p.x-e.x)*(g.p.y-e.y)-(p.y-e.y)*(g.p.x-e.x))/Math.max(1,d);return along>0&&along<d&&cross<28;}).sort((a,b)=>distance(e,a)-distance(e,b))[0],hasMerc=!!merc;
  // An explicitly assigned companion target is respected; otherwise a front-line
  // companion may take the attack only if already between enemy and hero at start.
  if(hasMerc&&e.targetId===merc.id)return merc;
  if(!allowed(g.p))return null;
  if(hasMerc){const d=distance(e,g.p),along=((merc.x-e.x)*(g.p.x-e.x)+(merc.y-e.y)*(g.p.y-e.y))/Math.max(1,d),cross=Math.abs((merc.x-e.x)*(g.p.y-e.y)-(merc.y-e.y)*(g.p.x-e.x))/Math.max(1,d);
    if(along>0&&along<d&&cross<28)return merc;
  }
  return g.p;
}
function resolveBasic(g,e,move,kind){
  const lock=basicLocks.get(e);basicLocks.delete(e);
  // Consume before defenses or death/map-transition callbacks; no second damage.
  if(!attackValid(g,e,lock)||!liveActor(lock.target))return;
  if(lock.target!==g.p&&!eligibleMercenary(g,lock.target))return;
  e.telegraph=null;e.attackAnim=.32;e.attackAttempts=(e.attackAttempts||0)+1;
  g.emit('sfx',{name:['rat','bat','wolf','hellHound'].includes(e.type)?'bite':'enemySword'});
  const target=lock.target,a=Math.atan2(target.y-e.y,target.x-e.x);
  if(lock.ranged){
    // The ordinary shot is a cosmetic release/impact, not a second colliding
    // projectile. A telegraphed special still uses the spatial bullet pipeline.
    g.effect('streak',e.x,e.y-18,Math.min(360,distance(e,target)),'#e6b081',.18,{a,hostile:true,enemyType:e.type,attackKind:kind,lockedBasic:true});
    g.effect('sparks',target.x,target.y-25,24,'#e6b081',.22,{hostile:true,enemyType:e.type,attackKind:kind,lockedBasic:true});
  }else g.effect('enemyCut',e.x,e.y-15,move.r,'#cfb9a3',.22,{a,hostile:true,enemyType:e.type,attackKind:kind,lockedBasic:true});
  if(target===g.p)g.hurt(move.damage);else g.hurtMercenary?.(target,move.damage);
}

export function createEnemyV9(g,type,x,y,id){
  const cfg=profileForEnemy(type,id),elite=type==='wolf'&&(id==='echo-warden'||id==='secret-warden'||/(?:elite|alpha)/.test(id));
  const e={id,type,elite:elite||!!cfg.elite,isBoss:!!cfg.isBoss,level:cfg.level||1,rewardXP:cfg.rewardXP,rewardGold:cfg.rewardGold,squadLeader:id==='ch2-bren',label:id==='ch2-bren'?'小队长 · 布伦':cfg.name||null,
    walkDistance:0,x,y,homeX:x,homeY:y,hp:cfg.hp,maxHP:cfg.hp,dead:false,respawn:0,
    angle:g.rng()*Math.PI*2,roamWait:g.rng()*1.4,roamTarget:null,returning:false,
    cd:.65+g.rng()*.5,wind:0,windMax:0,stun:0,slow:0,bleed:0,bleedTime:0,burn:0,dot:1,
    knock:0,anim:0,phase:1,pattern:0,aiVersion:9,aiState:'IDLE',stateSince:g.time,
    alertUntil:0,threat:{},lastDamageAt:-1000,lastSeenAt:-1000,leashOutsideSince:null,
    abilityCD:boss({type})?4.2:1.4,basicSinceSpecial:0,interruptUntil:0,telegraph:null,action:null,mechanicsUsed:{},attackAttempts:0};
  tuneBossStats(e);return e;
}

export function ensureEnemyAI(e,g){
  tuneBossStats(e);
  if(!e.threat||typeof e.threat!=='object'||Array.isArray(e.threat))e.threat={};
  if(!Number.isFinite(e.threat.player)||e.threat.player<0)delete e.threat.player;
  if(!ENEMY_STATES[e.aiState])e.aiState=e.dead?'DEAD':e.returning?'RETURNING':'IDLE';
  if(e.aiVersion===9){if(e.dead)e.aiState='DEAD';return;}
  // Add AI state to legacy entities without changing health, rewards or respawn policy.
  Object.assign(e,{aiVersion:9,aiState:e.dead?'DEAD':e.returning?'RETURNING':'IDLE',stateSince:g.time,
    threat:{},lastDamageAt:-1000,lastSeenAt:-1000,leashOutsideSince:null,abilityCD:1.4,
    interruptUntil:0,telegraph:null,action:null,mechanicsUsed:{},attackAttempts:0,bleedTime:e.bleed?B.bleedDuration:0});
}

function transition(g,e,state){
  if(e.aiState!==state){e.aiState=state;e.stateSince=g.time;}
  e.returning=state==='RETURNING';
  if(state==='COMBAT'){e.roamTarget=null;e.leashOutsideSince=null;}
  if(state==='DEAD'){e.wind=0;e.telegraph=null;e.action=null;e.moving=false;basicLocks.delete(e);attackEncounters.delete(e);}
}

function assistGroup(g,source){
  if(!source.groupId)return;
  for(const ally of g.enemies){
    if(ally===source||ally.dead||ally.groupId!==source.groupId)continue;
    if(distance(source,ally)>300&&!insideBounds(g.p,source.activationBounds))continue;
    if(!g.clearLine(source,ally,false))continue;
    ensureEnemyAI(ally,g);
    if(ally.aiState==='COMBAT')continue;
    ally.targetId='player';ally.threat.player=Math.max(1,ally.threat.player||0);
    ally.lastSeenAt=g.time;ally.alertUntil=g.time+B.aggroMemory;
    transition(g,ally,'COMBAT');
  }
}

export function registerDamageThreatV9(g,e,amount,kind='hit'){
  if(e.dead||!Number.isFinite(amount)||amount<=0)return false;
  ensureEnemyAI(e,g);
  e.threat.player=(e.threat.player||0)+amount;
  e.targetId='player';e.lastDamageAt=g.time;e.lastSeenAt=g.time;e.alertUntil=g.time+B.aggroMemory;
  const wasReturning=e.returning||e.aiState==='RETURNING';
  transition(g,e,'COMBAT');
  assistGroup(g,e);
  if(wasReturning){e.cd=Math.min(e.cd,.3);g.paths?.delete(e.id);}
  e.lastDamageKind=kind;
  return true;
}

export function interruptEnemyV9(g,e,duration){
  if(e.dead)return;
  if(formidable(e)){
    if(g.time<(e.interruptUntil||0))return;
    e.interruptUntil=g.time+B.bossInterruptCooldown;
    e.stun=Math.max(e.stun||0,B.bossInterruptDuration);
    // A short stagger delays an already telegraphed action; never erases the boss loop.
  }else e.stun=Math.max(e.stun||0,duration);
}

export function playerDamageMultiplierV9(g,e,kind){
  if(!formidable(e))return 1;if(g.time<(e.exposedUntil||0))return B.exposedMultiplier;const cfg=profileForEnemy(e.type);if(cfg.guardFront){if(kind==='dot')return cfg.dotMultiplier||.9;const front=Math.cos(Math.atan2(g.p.y-e.y,g.p.x-e.x)-e.angle)>.2;return front?cfg.guardFront:cfg.guardRear;}
  if(g.time<(e.exposedUntil||0))return B.exposedMultiplier;
  if(e.elite)return kind==='dot'?B.eliteDotMultiplier:B.eliteGuardMultiplier;
  if(kind==='dot')return e.type==='hellJailer'?.82:B.bossDotMultiplier;
  const a=Math.atan2(g.p.y-e.y,g.p.x-e.x);
  const front=Math.cos(a-e.angle)>.2;
  if(e.moveKind==='shieldBash'&&e.wind>0&&front)return B.bossShieldFront;
  return e.type==='hellJailer'?(front?.72:.90):(front?B.bossGuardFront:B.bossGuardRear);
}

function advance(g,e,target,speed,dt){
  const dir=g.pathDirection(e,target),ox=e.x,oy=e.y;
  g.moveActor(e,e.x+dir.x*speed*dt,e.y+dir.y*speed*dt,false);
  if(e.moving)e.angle=Math.atan2(e.y-oy,e.x-ox);
}

function telegraph(g,e,kind,move,target){
  basicLocks.delete(e);beginAttackEncounter(g,e);
  e.moveKind=kind;e.wind=move.wind;e.windMax=move.wind;e.tx=target.x;e.ty=target.y;
  e.angle=Math.atan2(target.y-e.y,target.x-e.x);
  e.telegraph={kind,shape:move.shape,x:move.shape==='circle'?target.x:e.x,y:move.shape==='circle'?target.y:e.y,
    r:move.r||0,arc:move.arc||.82,a:e.angle,length:move.length||0,width:move.width||0,life:move.wind,max:move.wind,label:move.label};
  e.actionSpec={...move,damage:attackDamage(e,move.damage*(profileForEnemy(e.type,e.id).specialMultiplier||1))};e.cd=move.recovery||1.3;
  e.mechanicsUsed[kind]=(e.mechanicsUsed[kind]||0)+1;
  e.pattern++;e.moving=false;
  if(formidable(e))g.text(move.label,e.x,e.y-104,'#f0b586');
}

// A basic locks one live target after the range/LoS check at attack start.
// The short contact animation is not a spatial dodge window or a telegraph.
function beginBasic(g,e,cfg,ranged=false){
  const p=basicTarget(g,e,cfg,ranged);if(!p)return false;
  const kind=ranged?(e.type==='hellSoul'?'soulBolt':e.type==='bat'?'spit':'throw'):'melee';
  const recovery=cfg.cooldown*(bossScale(e).basicCooldown||1);
  beginAttackEncounter(g,e);basicLocks.set(e,{...attackEncounters.get(e),target:p,ranged});
  e.moveKind=kind;e.angle=Math.atan2(p.y-e.y,p.x-e.x);e.tx=p.x;e.ty=p.y;
  e.wind=ranged?.16:(e.type==='rat'?.12:e.type==='wolf'||e.type==='hellHound'?.13:.18);
  e.windMax=e.wind;e.telegraph=null;e.attackAnim=.34;e.moving=false;
  e.actionSpec=ranged?{basicAttack:true,shape:'target',wind:e.wind,recovery,length:cfg.rangedReach,width:20,
    speed:cfg.projectileSpeed||(e.type==='bat'?285:310),damage:attackDamage(e,cfg.damage)}
    :{basicAttack:true,shape:'target',wind:e.wind,recovery,r:cfg.reach+22,damage:attackDamage(e,cfg.damage),arc:.95};
  e.cd=recovery;e.basicSinceSpecial=(e.basicSinceSpecial||0)+1;
  if(e.elite)e.pattern++;
  e.mechanicsUsed[kind]=(e.mechanicsUsed[kind]||0)+1;
  // On a boss abilityCD belongs to its special loop, not its basic projectile.
  if(ranged&&!boss(e))e.abilityCD=cfg.rangedCooldown||3;
  return true;
}

function beginAttack(g,e,cfg,d){
  const p=g.p;
  if(boss(e)){
    if(d>430)return false;
    const specialReady=e.abilityCD<=0&&((e.basicSinceSpecial||0)>=(cfg.basicAttacksBetweenSpecials||2)||d>cfg.reach+12);
    if(!specialReady)return d<cfg.reach+12&&g.clearLine(e,p,false)?beginBasic(g,e,cfg,cfg.basicAttack==='projectile'):false;
    const order=cfg.moveOrder|| (e.type==='hellJailer'?['chainSweep','chainSlam','chainThrow']:['shieldBash','charge','heavySlam','rangedCounter']);
    let kind=order[e.pattern%order.length];
    if(cfg.moveOrder){if(d>190&&cfg.basicAttack!=='projectile'){kind=order.find(k=>BOSS_MOVES[k].shape==='line')||kind;}}else if(e.type==='hellJailer'){
      if(d>170&&kind!=='chainThrow')kind='chainThrow';
    }else{
      if(d>155&&(kind==='shieldBash'||kind==='heavySlam'))kind=e.pattern%2?'rangedCounter':'charge';
      if(kind==='charge'&&d<100)kind='shieldBash';
    }
    const move={...BOSS_MOVES[kind]};
    if(e.phase===2)move.recovery*=.90;
    const target=move.target==='self'?e:kind==='heavySlam'||kind==='chainSlam'?point(e.x+Math.cos(e.angle)*58,e.y+Math.sin(e.angle)*58):p;
    telegraph(g,e,kind,move,target);
    e.abilityCD=cfg.specialCooldown||(e.type==='hellJailer'?6.2:5.2);e.basicSinceSpecial=0;
    return true;
  }
  if(e.elite&&cfg.specialMove&&e.abilityCD<=0&&(e.basicSinceSpecial||0)>=4&&d<160){telegraph(g,e,cfg.specialMove,{...BOSS_MOVES[cfg.specialMove],damage:cfg.specialDamageOverride||cfg.damage},p);e.abilityCD=cfg.specialCooldown||9;e.basicSinceSpecial=0;return true;}
  // Only the already-authored rare elite wolves retain special attacks.
  if(e.type==='wolf'&&e.elite&&e.abilityCD<=0){
    if(e.pattern%3===0&&d<190){
      telegraph(g,e,'wolfSweep',BOSS_MOVES.wolfSweep,e);e.abilityCD=cfg.lungeCooldown||6;return true;
    }
    if(d>95&&d<cfg.lungeRange&&g.clearLine(e,p,false)){
      telegraph(g,e,'wolfLunge',{...BOSS_MOVES.wolfLunge,wind:cfg.lungeWind,length:cfg.lungeRange,damage:21},p);
      e.abilityCD=cfg.lungeCooldown;return true;
    }
  }
  // Spit, thrown stone and soul bolt are ordinary projectiles with a normal
  // release animation. Ordinary wolves and hell hounds never use a lunge.
  if(cfg.rangedReach&&e.abilityCD<=0&&d>110&&d<cfg.rangedReach&&g.clearLine(e,p,false))return beginBasic(g,e,cfg,true);
  if(d<cfg.reach+12&&g.clearLine(e,p,false))return beginBasic(g,e,cfg);
  return false;
}

function updateAction(g,e,dt){
  const a=e.action;if(!a)return false;
  const record=attackEncounters.get(e);if(record&&!attackValid(g,e,record)){e.action=null;return false;}
  a.life-=dt;
  const ox=e.x,oy=e.y;
  g.moveActor(e,e.x+Math.cos(a.a)*a.speed*dt,e.y+Math.sin(a.a)*a.speed*dt,false);
  e.angle=a.a;
  if(!a.hit&&distance(e,g.p)<a.width/2+24&&g.clearLine(e,g.p,false)){g.hurt(a.damage);a.hit=true;}
  for(const member of g.activeMercenaries?.()||[]){if(member.visible&&!a.mercenaryHits?.includes(member.id)&&distance(e,member)<a.width/2+24&&g.clearLine(e,member,false)){(a.mercenaryHits||(a.mercenaryHits=[])).push(member.id);g.hurtMercenary?.(member,a.damage);}}
  if(a.life<=0||distance(e,point(ox,oy))<.1){e.action=null;e.cd=Math.max(e.cd,.65);if(formidable(e)){e.exposedUntil=g.time+(boss(e)?B.bossChargeOpening:B.eliteOpening);g.text('破绽',e.x,e.y-101,'#b7dfbf');}}
  return true;
}

export function tickEnemiesV9(g,dt,idleAI){
  g.inEnemyMovement=true;
  if(g.sagaInvisibleV25?.()){for(const e of g.enemies){if(e.dead)continue;clearEnemyCombatV9(e,g);g.roam(e,dt,idleAI?.[e.type]);}g.inEnemyMovement=false;return;}
  for(const e of g.enemies){
    ensureEnemyAI(e,g);
    if(e.dead){transition(g,e,'DEAD');continue;}
    const cfg=profileForEnemy(e.type,e.id),p=g.p;
    e.moving=false;e.attackAnim=Math.max(0,(e.attackAnim||0)-dt);
    if(e.type==='bat')e.anim+=dt*8;
    e.stun=Math.max(0,(e.stun||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);if(!e.slow)delete e.slowFactor;
    e.bleedTime=Math.max(0,(e.bleedTime||0)-dt);if(!e.bleedTime)e.bleed=0;
    e.dot=(e.dot||0)-dt;
    if(e.dot<=0){e.dot=1;if(e.bleed||e.burn)g.damage(e,e.bleed*B.bleedTickDamage+e.burn*B.burnTickDamage,'dot');e.burn=Math.max(0,(e.burn||0)-1);}
    if(e.dead){transition(g,e,'DEAD');continue;}
    e.abilityCD=Math.max(0,(e.abilityCD||0)-dt);
    if(e.stun>0)continue;
    if(boss(e)&&e.phase===1&&e.hp<e.maxHP*.5){e.phase=2;g.text('攻势加快',e.x,e.y-115,'#efbc87');}
    if(updateAction(g,e,dt))continue;
    if(e.wind>0&&e.actionSpec?.basicAttack&&!attackValid(g,e,basicLocks.get(e))){e.wind=0;e.telegraph=null;basicLocks.delete(e);}
    if(e.wind>0){e.wind=Math.max(0,e.wind-dt);if(e.telegraph)e.telegraph.life=e.wind;if(e.wind<=0)g.enemyHit(e);continue;}
    e.cd=Math.max(0,e.cd-dt);
    const home=point(e.homeX,e.homeY),homeDist=distance(e,home),d=distance(e,p),visible=d<cfg.aggro&&insideBounds(p,e.activationBounds)&&g.clearLine(e,p,false);
    if(e.aiState==='RETURNING'){
      if(homeDist<18){transition(g,e,'IDLE');e.threat={};e.targetId=null;e.alertUntil=0;e.roamWait=.7;}
      else advance(g,e,home,B.returnSpeed,dt);
      continue;
    }
    if(e.aiState==='IDLE'||e.aiState==='PATROL'){
      const activeNearby=g.enemies.filter(o=>o!==e&&!o.dead&&['ALERT','COMBAT'].includes(o.aiState)&&distance(o,p)<480).length;
      const groupEngaged=e.groupId&&g.enemies.some(o=>o!==e&&!o.dead&&o.groupId===e.groupId&&['ALERT','COMBAT'].includes(o.aiState));
      if(visible&&(arenaLocked(e)||groupEngaged||d<112||activeNearby<B.passivePullCap)){
        transition(g,e,'ALERT');e.alertUntil=g.time+B.aggroMemory;e.lastSeenAt=g.time;e.targetId='player';
        assistGroup(g,e);
      }else{g.roam(e,dt,idleAI?.[e.type]);transition(g,e,e.moving?'PATROL':'IDLE');continue;}
    }
    if(e.aiState==='ALERT'){
      if(visible)e.lastSeenAt=g.time;
      if(g.time-e.stateSince>=.25){transition(g,e,'COMBAT');e.threat.player=Math.max(1,e.threat.player||0);}
      else{e.angle=Math.atan2(p.y-e.y,p.x-e.x);continue;}
    }
    if(e.aiState==='COMBAT'){
      if(visible){e.lastSeenAt=g.time;e.alertUntil=g.time+B.aggroMemory;}
      const recentHit=g.time-e.lastDamageAt<B.recentDamageGrace;
      const outOfLeash=e.leashBounds?!insideBounds(e,e.leashBounds,20):cfg.leash!==null&&homeDist>(e.leashRadius||cfg.leash);
      const playerFarFromHome=e.leashBounds?!insideBounds(p,e.leashBounds,100):cfg.leash!==null&&distance(p,home)>(e.leashRadius||cfg.leash)+100;
      const genuinelyFar=playerFarFromHome&&(d>B.lostTargetDistance||g.time-e.lastSeenAt>B.aggroMemory||e.leashOutsideSince!=null);
      if(!arenaLocked(e)&&!recentHit&&genuinelyFar&&outOfLeash){
        if(e.leashOutsideSince==null)e.leashOutsideSince=g.time;
        if(g.time-e.leashOutsideSince>=B.leashGrace&&d>cfg.reach*2){transition(g,e,'RETURNING');e.telegraph=null;e.roamTarget=null;continue;}
      }else e.leashOutsideSince=null;
      e.angle=Math.atan2(p.y-e.y,p.x-e.x);
      if(e.cd<=0&&g.clearLine(e,p,false)&&beginAttack(g,e,cfg,d))continue;
      if(d>cfg.reach*.82||!g.clearLine(e,p,false))advance(g,e,p,cfg.speed*(e.slow>0?(e.slowFactor||.48):1),dt);
    }
  }
  g.inEnemyMovement=false;
}

export function resolveEnemyHitV9(g,e){
  const move=e.actionSpec||{r:85,damage:attackDamage(e,profileForEnemy(e.type,e.id).damage),arc:1};
  const kind=e.moveKind||'melee';
  if(move.basicAttack)return resolveBasic(g,e,move,kind);
  const encounter=attackEncounters.get(e);if(e.dead||e.hp<=0||encounter&&!attackValid(g,e,encounter))return;
  e.telegraph=null;e.attackAnim=.32;e.attackAttempts=(e.attackAttempts||0)+1;
  g.emit('sfx',{name:['rat','bat','wolf','hellHound'].includes(e.type)?'bite':'enemySword'});
  if(kind==='charge'||kind==='wolfLunge'||move.resolver==='charge'){
    e.action={a:e.angle,speed:move.speed,life:move.duration,width:move.width,damage:move.damage,hit:false};
    g.effect('streak',e.x,e.y-18,move.length,'#d2a57f',.24,{a:e.angle,hostile:true,enemyType:e.type,attackKind:e.moveKind});return;
  }
  if(['rangedCounter','spit','throw','soulBolt','chainThrow'].includes(kind)||move.resolver==='projectile'){
    g.bullets.push({x:e.x,y:e.y,vx:Math.cos(e.angle)*move.speed,vy:Math.sin(e.angle)*move.speed,r:8,
      life:move.length/move.speed,remaining:move.length,friendly:false,n:move.damage,color:kind==='spit'?'#b4ce8f':kind==='soulBolt'?'#95d5e1':kind==='chainThrow'?'#ddac79':'#e6b081',source:e.id,sourceMap:g.map,enemyType:e.type,attackKind:kind});return;
  }
  if(move.shape==='circle'){
    const center=kind==='wolfSweep'?e:point(e.tx,e.ty);
    g.effect('impact',center.x,center.y,move.r,'#d5ab83',.45,{hostile:true,enemyType:e.type,attackKind:e.moveKind});
    if(distance(g.p,center)<move.r&&g.clearLine(e,g.p,false))g.hurt(move.damage);
    if(formidable(e)){e.exposedUntil=g.time+(boss(e)?B.bossSlamOpening:B.eliteOpening);g.text('破绽',e.x,e.y-101,'#b7dfbf');}
  }else{
    g.effect('enemyCut',e.x,e.y-15,move.r,'#cfb9a3',.22,{a:e.angle,hostile:true,enemyType:e.type,attackKind:e.moveKind});
    const a=Math.atan2(g.p.y-e.y,g.p.x-e.x);
    if(distance(e,g.p)<move.r&&Math.cos(a-e.angle)>Math.cos(move.arc||1)&&g.clearLine(e,g.p,false))g.hurt(move.damage);
  }
}

export function clearEnemyCombatV9(e,g){
  basicLocks.delete(e);attackEncounters.delete(e);
  ensureEnemyAI(e,g);transition(g,e,e.dead?'DEAD':'IDLE');e.wind=0;e.windMax=0;e.telegraph=null;e.action=null;
  e.threat={};e.targetId=null;e.alertUntil=0;e.lastDamageAt=-1000;e.lastSeenAt=-1000;e.leashOutsideSince=null;
  e.bleed=0;e.bleedTime=0;e.burn=0;e.cd=1.2;e.abilityCD=1.4;e.exposedUntil=0;
  e.phase=1;e.pattern=0;e.basicSinceSpecial=0;e.abilityCD=boss(e)?4.2:1.4;e.interruptUntil=0;e.mechanicsUsed={};e.attackAttempts=0;
}

export function tickProjectilesV9(g,dt){
  for(const b of g.bullets){
    if(b.life<=0)continue;
    if(b.friendly&&!playerProjectileSourceValidV17(g,b)){b.life=0;continue;}
    if(!b.friendly&&(b.lockedBasic||b.sourceMap!=null&&b.sourceMap!==g.map)){b.life=0;continue;}
    const speed=Math.hypot(b.vx,b.vy),travel=Math.min(speed*dt,b.remaining??Infinity,speed*b.life);
    const pieces=Math.max(1,Math.ceil(travel/8)),dx=b.vx/Math.max(1,speed)*travel/pieces,dy=b.vy/Math.max(1,speed)*travel/pieces;
    for(let i=0;i<pieces&&b.life>0;i++){
      b.x+=dx;b.y+=dy;
      if(g.blocked(b.x,b.y,false)){b.life=0;break;}
      if(b.friendly){
        const inRange=o=>b.rangeLimit==null||distance(o,point(b.originX,b.originY))<=b.rangeLimit;
        const e=g.enemies.find(e=>!e.dead&&!b.hitIds?.includes(e.id)&&distance(e,b)<B.hitRadius+b.r&&inRange(e));
        if(e){const n=b.n*(b.holy&&e.type==='hellSoul'?1.15:1);g.damage(e,n,b.skillKey?'ch3skill':b.skill?'skill':'hit');if(b.slowDuration&&!e.dead){e.slow=Math.max(e.slow,b.slowDuration);e.slowFactor=b.slowFactor||.75;}g.effect(b.holy?'holyHit':'sparks',e.x,e.y-30,30,b.color,.3);if(b.pierce>0){b.pierce--;b.hitIds.push(e.id);b.n*=b.secondaryMultiplier||1;}else b.life=0;}
        else{const o=g.props.find(o=>!o.action&&!o.broken&&distance(o,b)<B.hitRadius+b.r&&inRange(o));if(o){g.damageProp(o,b.n);b.life=0;}}
      }else if(distance(b,g.p)<20+b.r){g.hurt(b.n);b.life=0;}
    }
    b.life-=dt;if(b.remaining!=null){b.remaining-=travel;if(b.remaining<=0)b.life=0;}
  }
  g.bullets=g.bullets.filter(b=>b.life>0);
}

// Call before MP/cooldown mutation. A selected unreachable target is a failed cast.
export function skillTargetAllowedV9(g,k){
  const p=g.p,t=g.enemies.find(e=>e.id===g.target&&!e.dead)||g.nearest(B.aimRange);
  if(k==='q'&&p.cls==='shadow')return !!t&&distance(p,t)<=B.shadowStepRange&&g.clearLine(p,t,false);
  if(k==='crash')return !t||distance(p,t)<=B.crashRange&&g.clearLine(p,t,false);
  if(k==='firebolt')return !t||distance(p,t)<=B.fireboltRange&&g.clearLine(p,t,false);
  if(k==='q'&&p.cls==='ember'){
    if(t)return distance(p,t)<=B.fireMarkRange&&g.clearLine(p,t,false);
    return g.clearLine(p,point(p.x+Math.cos(p.angle)*B.fireMarkRange,p.y+Math.sin(p.angle)*B.fireMarkRange),false);
  }
  return true;
}
