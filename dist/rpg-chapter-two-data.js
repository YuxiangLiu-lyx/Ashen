// Authored chapter-two roles: fixed budgets, existing guard bodies and attacks.
export const C2_ROLES={
 c2Front:{hp:330,damage:20,speed:146,aggro:300,reach:68,wind:.62,cooldown:1.7,leash:610,guardFront:.65,guardRear:1.12,dotMultiplier:1,rangedReach:0},
 c2Pursuer:{hp:260,damage:22,speed:192,aggro:310,reach:62,wind:.55,cooldown:1.5,leash:650,rangedReach:0},
 c2Thrower:{hp:220,damage:18,speed:145,aggro:350,reach:58,wind:.6,cooldown:1.7,leash:610,rangedReach:380,rangedWind:.9,rangedCooldown:4.8},
};
export const C2_STOCK={
 relayWeapon:{name:'驿站整修武器',slot:'weapon',atk:24,hp:0,cost:85,minLevel:5},
 relayChest:{name:'衬甲行路衣',slot:'chest',atk:0,hp:64,experienceArmor:.09,cost:75,minLevel:5},
 relayHead:{name:'加厚衬皮帽',slot:'head',atk:0,hp:30,experienceArmor:.03,cost:48,minLevel:5},
};
export const C2_SCENES={
 c2PumpRest:[['塞琳','泵修好了，我也不用一趟趟去街口提水。你们坐吧，热水自己倒。你们离开驿站之前，歇脚就不收钱了。'],['诺恩','炉子还得烧着。你上次可不是这么说的。'],['塞琳','你替我省了半天力气，我请你喝壶热水，还算得过账。坐稳些，左边那条凳腿有点晃。']],
};
export const C2_EVENTS=[
 {id:'ch2Arrival',map:'post',phases:[5],flag:'postArrival',markOnStart:false,then:'ch2_arrival'},
 {id:'ch2Bridge',map:'bridge',phases:[7],flag:'bridgeSeen',markOnStart:true},
 {id:'ch2OuterCourt',map:'manor',phases:[7],flag:'courtSeen',markOnStart:true},
 {id:'ch2TargetBefore',map:'manor',phases:[7],flag:'targetCutaway',markOnStart:true,minX:910},
 {id:'ch2Spillway',map:'spillway',fallbackMap:'exile',phases:[10],flag:'spillSeen',markOnStart:true},
 {id:'v9CellarFirst',map:'bridgecellar',phases:[6,7],flag:'v9CellarVisited',markOnStart:true},
 {id:'v9WardenFirst',map:'wellcrypt',phases:[6,7],flag:'v9WellVisited',markOnStart:true},
];
