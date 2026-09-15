import {CH5_BOSS_MOVES} from './chapter5-world-v14.js';
import {MEMORY_BOSS,MEMORY_MOVES} from './memory-combat-v14.js';
import {TRIAL_FLOORS} from './systems-data-v14.js';
import {V11_BOSS_PROFILES,V11_BOSS_MOVES,V11_DEEP_ENEMY_PROFILES} from './combat-data-v14.js';
import {HELL_ENEMY_PROFILES,HELL_BOSS_MOVES} from './chapter3-combat-data-v14.js';
// V9 combat numbers. Distances are world pixels; player artwork is 84px tall.
export const COMBAT_BALANCE = Object.freeze({
  mageAttackRange:336, mageAttackSpeed:500, mageAttackRate:.64,
  fireboltRange:350, fireboltSpeed:490, fireMarkRange:320,
  fireMarkRadius:84, fireMarkDuration:4.2, fireMarkTick:.7,
  detonationRadius:112, novaRange:240, novaSpeed:290,
  shadowStepRange:255, crashRange:230, aimRange:350,
  hitRadius:24, attackLock:.2, skillLock:.24,
  aggroMemory:7, recentDamageGrace:6, leashGrace:2.5,
  lostTargetDistance:490, returnSpeed:155,
  bleedDuration:5, bleedTickDamage:2, burnTickDamage:2,
  bossInterruptDuration:.16, bossInterruptCooldown:3,
  ordinaryStun:.5, crashStun:.7, shieldFrontMultiplier:.62,
  bossGuardFront:.46,bossGuardRear:.8,bossDotMultiplier:.62,bossShieldFront:.30,
  eliteGuardMultiplier:.62,eliteDotMultiplier:.7,exposedMultiplier:1.12,
  bossChargeOpening:1.7,bossSlamOpening:2,eliteOpening:1.1,
  passivePullCap:3, allyAssistRadius:160
});

export const ENEMY_PROFILES = Object.freeze({
  rat:{hp:84,damage:8,speed:165,aggro:250,reach:53,wind:.38,cooldown:1.35,leash:530},
  bat:{hp:100,damage:10,speed:176,aggro:285,reach:61,wind:.48,cooldown:1.6,leash:570,rangedReach:250,rangedWind:.65,rangedCooldown:4.8},
  wolf:{hp:180,damage:14,speed:184,aggro:280,reach:62,wind:.46,cooldown:1.45,leash:590,lungeRange:220,lungeWind:.66,lungeCooldown:6.5},
  guard:{hp:240,damage:17,speed:170,aggro:265,reach:66,wind:.55,cooldown:1.55,leash:610,rangedReach:290,rangedWind:.82,rangedCooldown:7},
  captain:{hp:1850,damage:22,speed:180,aggro:410,reach:85,wind:.65,cooldown:1.45,leash:null},
  bren:{hp:2100,damage:23,speed:183,aggro:410,reach:85,wind:.65,cooldown:1.45,leash:null},
  secretWolf:{hp:1450,damage:21,speed:190,aggro:315,reach:72,wind:.56,cooldown:1.5,leash:null,lungeRange:285,lungeWind:.78,lungeCooldown:6},
  eliteWolf:{hp:680,damage:19,speed:188,aggro:315,reach:72,wind:.56,cooldown:1.5,leash:680,lungeRange:275,lungeWind:.78,lungeCooldown:6}
});

export const BOSS_MOVES = Object.freeze({
  ...HELL_BOSS_MOVES,...V11_BOSS_MOVES,...MEMORY_MOVES,...CH5_BOSS_MOVES,
  shieldBash:{label:'盾击',shape:'cone',wind:.72,recovery:1.2,r:112,damage:22,arc:.8},
  charge:{label:'冲锋',shape:'line',wind:.9,recovery:1.4,length:350,width:64,duration:.48,speed:650,damage:25},
  heavySlam:{label:'蓄力重击',shape:'circle',wind:1.08,recovery:1.6,r:116,damage:31},
  rangedCounter:{label:'掷刃',shape:'line',wind:.92,recovery:1.35,length:430,width:32,speed:340,damage:21},
  wolfLunge:{label:'扑击',shape:'line',wind:.66,recovery:1.1,length:220,width:55,duration:.32,speed:550,damage:16},
  wolfSweep:{label:'裂地爪',shape:'circle',wind:.92,recovery:1.55,r:136,damage:23}
});

// UI and runtime consume the same skill spec through skills-v9.js.
export const SKILL_SPEC = {
  shadow:{q:{cost:12,cd:5,base:1.65,dex:3,str:1.2,label:'首次伤害',extra:'255距离内突进命中，附加2层流血；没有无敌帧。'},e:{cost:17,cd:7,base:1.1,dex:2,str:1.5,label:'基础伤害',extra:'消耗目标流血，每层额外13伤害（最多4层）；把握收割时机。'}},
  oath:{q:{cost:12,cd:5,base:2.1,str:3,vit:1.5,label:'斩击伤害',extra:'格挡后的这次斩击×1.5；每次施放最多恢复6+体质×0.5生命。普通敌人短暂震慑，首领只短暂打断且有抗性间隔。'},e:{cost:17,cd:7,label:'格挡时长',extra:'只格挡一次伤害；随后普攻×2或断誓斩×1.5，强化保留5秒。'}},
  ember:{q:{cost:12,cd:5,base:.45,wis:1.15,label:'每次灼烧',extra:'320距离内布置火印，每0.7秒灼烧一次，持续4.2秒；敌人会立即追击来源。'},e:{cost:17,cd:7,base:2.35,wis:3,label:'火印爆炸',extra:'引爆仍在320距离内的火印，爆炸半径112；另发射8枚短程火弹，射程240。'}},
  common:{tether:{cost:20,cd:11,base:.5,str:1.4,wis:1.4,label:'牵引伤害',extra:'作用距离210；把普通敌人拉到身前75距离，减速2秒。墙后无效，精英不被拉动。'},cleave:{cost:14,cd:5.5,base:.7,str:4,dex:.5,label:'斩击伤害',extra:'前方125距离近身横扫，可打碎木箱。持法杖时仍是近身杖击。'},firebolt:{cost:12,cd:4,base:.7,wis:4,dex:.3,label:'火矢伤害',extra:'向目标发射一枚火矢，严格最大射程350。'},crash:{cost:19,cd:8,base:2,str:2,dex:1.5,label:'重击伤害',extra:'230距离内跳向目标并重击。普通敌人震慑0.7秒；首领有打断抗性。'},frost:{cost:18,cd:9,base:.8,wis:2,dex:.5,label:'冰环伤害',extra:'令160距离内敌人减速52%；用于重新拉开距离。'},sprint:{cost:10,cd:12,label:'移速增幅',extra:'消耗法力，短时加速；没有无敌帧。敏捷提高加速效果，最高70%。'}}
};

export function configureCombatData(classes){
  classes.ember.reach=COMBAT_BALANCE.mageAttackRange;
  classes.ember.rate=COMBAT_BALANCE.mageAttackRate;
}

const trialProfiles=Object.fromEntries(TRIAL_FLOORS.map((f,i)=>['trialBoss'+(i+1),{...V11_BOSS_PROFILES[f.type],name:f.name,level:f.level,hp:f.hp,damage:f.damage,speed:150+i*3,visualFamily:f.type,specialMultiplier:f.damage/V11_BOSS_PROFILES[f.type].damage}]));
export function profileForEnemy(type,id=''){if(type==='bloodDemon')return MEMORY_BOSS;
  if(trialProfiles[type])return trialProfiles[type];
  if(V11_BOSS_PROFILES[type])return V11_BOSS_PROFILES[type];if(V11_DEEP_ENEMY_PROFILES[type])return V11_DEEP_ENEMY_PROFILES[type];
  if(HELL_ENEMY_PROFILES[type])return HELL_ENEMY_PROFILES[type];
  if(id==='ch2-bren')return ENEMY_PROFILES.bren;
  if(id==='secret-warden')return ENEMY_PROFILES.secretWolf;
  if(id==='echo-warden'||(type==='wolf'&&/(?:elite|alpha)/.test(id)))return ENEMY_PROFILES.eliteWolf;
  return ENEMY_PROFILES[type]||ENEMY_PROFILES.guard;
}
