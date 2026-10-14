// Authored regional roles. Fixed budgets do not rise with the player's level.
// Values are shared by production AI and the real-runtime Balance Lab.
export const EXPERIENCE_ROLES={
 grainRat:{hp:84,damage:9,speed:155,aggro:225,reach:48,cooldown:1.45,leash:480,xp:7,gold:2},
 mossBeetle:{hp:145,damage:13,speed:115,aggro:240,reach:58,cooldown:1.65,leash:450,xp:9,gold:2,guardFront:.7,guardRear:1.1,dotMultiplier:1},
 drillSentry:{hp:245,damage:18,speed:105,aggro:270,reach:64,cooldown:1.6,leash:480,xp:12,gold:3,guardFront:.58,guardRear:1.1,dotMultiplier:.9},
 cableRat:{hp:145,damage:14,speed:188,aggro:270,reach:50,cooldown:1.3,leash:480,xp:10,gold:2},
 vaultSentry:{hp:300,damage:22,speed:105,aggro:270,reach:65,cooldown:1.7,leash:470,xp:14,gold:3,guardFront:.55,guardRear:1.1,dotMultiplier:.9},
 vaultThrower:{hp:180,damage:19,speed:100,aggro:330,reach:48,cooldown:1.9,leash:470,rangedReach:360,rangedCooldown:3.4,projectileSpeed:250,xp:14,gold:3},
 roadWolf:{hp:230,damage:19,speed:186,aggro:260,reach:62,cooldown:1.4,leash:520,xp:12,gold:3},
 millWolf:{hp:295,damage:23,speed:191,aggro:280,reach:62,cooldown:1.4,leash:540,xp:14,gold:3},
 canalRat:{hp:175,damage:17,speed:166,aggro:250,reach:51,cooldown:1.35,leash:480,xp:10,gold:2},
 kilnBat:{hp:195,damage:21,speed:154,aggro:300,reach:54,cooldown:1.7,leash:510,rangedReach:340,rangedCooldown:3.8,projectileSpeed:250,xp:12,gold:3},
 trialWarden:{hp:1050,damage:23,speed:130,aggro:350,reach:80,cooldown:1.8,leash:null,xp:45,gold:10,isBoss:true,guardFront:.65,guardRear:1.1,dotMultiplier:.85,basicAttacksBetweenSpecials:1,specialCooldown:4.8,moveOrder:['shieldBash','heavySlam','rangedCounter'],specialMultiplier:1.15},
 vaultWarden:{hp:1550,damage:28,speed:135,aggro:360,reach:85,cooldown:1.7,leash:null,xp:60,gold:15,isBoss:true,guardFront:.6,guardRear:1.15,dotMultiplier:.85,basicAttacksBetweenSpecials:1,specialCooldown:4.5,moveOrder:['charge','heavySlam','rangedCounter'],specialMultiplier:1.3},
};
export const experienceProfile=e=>EXPERIENCE_ROLES[e?.experienceRole]||null;
