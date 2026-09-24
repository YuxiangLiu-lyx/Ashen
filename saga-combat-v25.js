// V25 continuation only. Old enemy profiles and moves remain byte-for-byte untouched.
import {V11_BOSS_PROFILES,V11_DEEP_ENEMY_PROFILES} from './combat-data-v14.js';
import {CH5_VISUAL_FAMILIES} from './chapter5-world-v14.js';
import {WORLD_ADDITIONS} from './exploration-v14.js';
const melee=(name,level,hp,damage,visualFamily='guard',extra={})=>({name,level,hp,damage,speed:160,aggro:320,reach:76,wind:.18,cooldown:1.65,leash:680,rewardXP:170+level*4,rewardGold:[12,19],attack:'melee',visualFamily,...extra});
const elite=(name,level,hp,damage,visualFamily='captain',extra={})=>melee(name,level,hp,damage,visualFamily,{elite:true,specialMove:'odricBash',specialDamageOverride:Math.round(damage*1.3),specialCooldown:8,basicAttacksBetweenSpecials:4,rewardGold:[25,39],...extra});
const chief=(name,level,hp,damage,visualFamily='captain',extra={})=>melee(name,level,hp,damage,visualFamily,{isBoss:true,leash:null,aggro:430,reach:87,attack:'threeBasicsThenSpecial',basicAttack:'melee',cooldown:1.55,basicAttacksBetweenSpecials:3,specialCooldown:7,firstSpecialDelay:4.8,moveOrder:['odricBash','odricCharge','odricSlam'],specialMultiplier:damage/51,guardFront:.84,guardRear:1,dotMultiplier:.94,rewardGold:[100,140],rewardXP:1400,...extra});
export const SAGA_ENEMY_PROFILES_V25={
 v25Watchman:melee('封路卫兵',27,3600,88),
 v25ReedWolf:melee('芦滩灰狼',27,3000,86,'wolf',{speed:181,reach:64,cooldown:1.5}),
 v25TaxGuard:melee('盐税护卫',28,4600,96),
 v25RoadHunter:melee('巡缉投刃卫',28,3400,86,'guard',{attack:'ordinarySoulBolt',rangedReach:320,rangedCooldown:1.8,projectileSpeed:340}),
 v25ConvoyOfficer:elite('押运执事',29,7200,110),
 v25BrokerBlade:melee('私契刀客',29,4300,101,'guard',{speed:171,cooldown:1.55}),
 v25BrokerChief:chief('私契监押人 · 维伦',30,34000,114),
 v25GrainGuard:melee('粮船看守',29,5200,106),
 v25GrainOfficer:elite('私仓军吏',30,8900,116),
 v25GrainChief:elite('私仓总管 · 卢铎',31,15500,123,'captain',{rewardXP:1450,rewardGold:[95,130]}),
 v25RidgeRaider:melee('截道劫匪',29,4700,103,'guard'),
 v25MoorWolf:melee('饥饿的山狼',30,4200,98,'wolf',{speed:182,reach:65,cooldown:1.5}),
 v25BridgeMarshal:elite('越境缉骑',31,9700,121),
 v25PursuitKnight:chief('裁誓骑士 · 维瑟',38,210000,195,'captain',{rewardXP:0,rewardGold:[0,0],scriptedSetbackOnly:true}),
 v25PursuitGuard:melee('裁誓追卫',32,6600,119,'guard',{speed:175}),
 v25StoneWarden:melee('守阶剑侍',32,6900,116,'hellGuard',{speed:154}),
 v25PoolWisp:melee('镜潭残影',32,5400,105,'hellSoul',{attack:'ordinarySoulBolt',rangedReach:310,rangedCooldown:1.75,projectileSpeed:325}),
 v25WindHound:melee('岚影兽',33,6100,120,'hellHound',{speed:183,reach:66,cooldown:1.5}),
 v25TrialMaster:chief('悬台守剑像',34,51000,134,'odric',{speed:157,specialMultiplier:2.65,rewardXP:2200}),
 v25SealGuard:elite('掌印近卫',34,11800,138,'guard',{cooldown:1.55,specialMove:'severinChains',specialDamageOverride:178}),
 v25FinalJudge:chief('掌印审判使 · 赫洛恩',36,220000,185,'captain',{speed:228,reach:110,cooldown:1.3,specialCooldown:6.6,moveOrder:['odricCharge','severinSentence','severinChains','severinRend'],specialMultiplier:2.5,phase2At:.4,phase2RecoveryMultiplier:.94,rewardXP:4800,rewardGold:[380,420]})
};
// V15's shared standard boss multipliers (HP ×1.35, damage ×1.18) remain in force.
// Viser is staged, never a mandatory high-stat combat encounter.
export function registerSagaCombatV25(){
 for(const[id,p]of Object.entries(SAGA_ENEMY_PROFILES_V25)){
  const table=p.isBoss?V11_BOSS_PROFILES:V11_DEEP_ENEMY_PROFILES;
  if(!table[id])table[id]={...p};
  CH5_VISUAL_FAMILIES[id]=p.visualFamily;
  WORLD_ADDITIONS.idleAI[id]={radius:34,pause:[.9,1.9],speed:p.visualFamily==='wolf'?38:24};
 }
}
