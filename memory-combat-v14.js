export const MEMORY_BOSS={name:'血魔 · 饥渴的降临者',hp:120000,guardFront:1,guardRear:1,dotMultiplier:1,damage:225,speed:176,aggro:1200,reach:100,wind:.46,cooldown:1.45,leash:1800,isBoss:true,level:100,basicAttacksBetweenSpecials:2,specialCooldown:5.8,moveOrder:['bloodCleave','bloodFall','bloodBolt']};
export const MEMORY_MOVES={
 bloodCleave:{label:'裂血重劈',shape:'cone',wind:1.05,recovery:1.5,r:180,arc:.84,damage:570,resolver:'cone'},
 bloodFall:{label:'血焰坠落',shape:'circle',wind:1.1,recovery:1.6,r:132,damage:620,resolver:'circle',target:'lockedPlayerPosition'},
 bloodBolt:{label:'撕裂血矛',shape:'line',wind:.95,recovery:1.4,length:480,width:32,speed:350,damage:520,resolver:'projectile'}
};

export const MEMORY_HP={shadow:400000,oath:330000,ember:230000};
