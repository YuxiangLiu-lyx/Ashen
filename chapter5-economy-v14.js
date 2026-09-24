// Pure data; safe to import from growth without a runtime/data circular import.
export const CH5_MATERIALS={
 ch5GoldSand:{name:'残温金砂',kind:'material',desc:'星屑矿庭与空甲中留下的细金砂，用于铸造职业套装。',sell:3,stack:999},
 ch5LampCore:{name:'凝灯芯',kind:'material',desc:'亡灵的灯火凝成的芯，用于调药、换取技法与契约。',sell:3,stack:999},
 ch5Dew:{name:'穹顶凝露',kind:'material',desc:'凝露水院收集的净露。再回到水院时，收集器可能重新积满。',sell:2,stack:999},
 ch5PrizeCoin:{name:'回铃铜券',kind:'currency',desc:'三盏回铃的奖券；仅在游艺厅兑换物品，没有现金用途。',sell:0,stack:999},
 ch5CourierPage:{name:'沾灰的名册页',kind:'quest',desc:'练场空甲携带的名册页。维兰正在清点这些名字。',sell:0,stack:99}
};
export const CH5_SETS={
 shadow:{id:'ch5-nightthread',name:'夜行金缕',pieces:4,two:'两件：攻击 +6，最大生命 +40。',four:'四件：普攻伤害 +8%。与技能独立，不提高流血和附伤。'},
 oath:{id:'ch5-lamplord',name:'守灯重誓',pieces:4,two:'两件：攻击 +6，最大生命 +40。',four:'四件：敌方伤害额外减免4%；与其他减免相加，总上限60%。'},
 ember:{id:'ch5-amberstar',name:'琥珀星火',pieces:4,two:'两件：攻击 +6，最大生命 +40。',four:'四件：最大法力 +30，每秒法力恢复 +0.4。'}
};
export const CH5_SET_RECIPES=[
 {id:'weapon',slot:'weapon',name:'职业主武器',cost:{gold:145,ch5GoldSand:6,ch5LampCore:3}},
 {id:'chest',slot:'chest',name:'职业上衣',cost:{gold:120,ch5GoldSand:5,ch5LampCore:2}},
 {id:'hands',slot:'hands',name:'职业护手',cost:{gold:105,ch5GoldSand:4,ch5LampCore:2}},
 {id:'feet',slot:'feet',name:'职业长靴',cost:{gold:100,ch5GoldSand:4,ch5LampCore:2}}
];
export const CH5_ALCHEMY=[
 {id:'hpLarge',name:'大型疗伤药 ×2',item:'hpLarge',count:2,cost:{gold:18,emberHerb:3,ch5Dew:1}},
 {id:'mpLarge',name:'大型清醒药 ×2',item:'mpLarge',count:2,cost:{gold:20,ch5LampCore:2,ch5Dew:1}},
 {id:'hpGrand',name:'特制疗伤药',item:'hpGrand',count:1,cost:{gold:18,emberHerb:3,ch5Dew:2}},
 {id:'mpGrand',name:'特制清醒药',item:'mpGrand',count:1,cost:{gold:20,ch5LampCore:3,ch5Dew:2}},
 {id:'attributeReset',name:'澄心盐',item:'attributeReset',count:1,cost:{gold:130,ch5LampCore:8,ch5Dew:5}},
 {id:'skillReset',name:'回响墨',item:'skillReset',count:1,cost:{gold:130,ch5GoldSand:8,ch5Dew:5}}
];
export const CH5_DRINKS={
 emberWine:{name:'温烬酒',kind:'consumable',desc:'300秒内造成的直接伤害 +8%；同类酒水不能叠加。只用游戏内金币购买。',cost:36,duration:300,damage:.08},
 ironTea:{name:'铁叶热饮',kind:'consumable',desc:'300秒内敌方伤害减免 +4%；与其他减免相加，总上限60%。覆盖上一杯酒水效果。',cost:32,duration:300,reduction:.04},
 clearCordial:{name:'澄星蜜饮',kind:'consumable',desc:'300秒内每秒恢复额外0.7法力。覆盖上一杯酒水效果。',cost:34,duration:300,manaRegen:.7}
};
export const CH5_QUESTS={
 ch5ForgeWork:{name:'让炉火认得你的手',giver:'ch5Smith',map:'ch5Forge',type:'支线',xp:420,gold:100,required:{ch5GoldSand:6},kills:8,killMaps:['ch5Training','ch5Quarry'],route:'工坊东门 → 铸魂练场；再往东进星屑矿庭。清理8个空甲或亡灵，采集6份残温金砂。',accept:[['格蕾娜','你拿刀的手倒稳。可你身上这点铁，扛不住断桥上的光。'],['诺恩','你能改？'],['格蕾娜','能。东边练场里捡些金砂，再替我拆掉八副发疯的空甲。材料你出，第一件的工钱我出。']],complete:[['格蕾娜','这些裂口不是乱砍出来的。行，我知道该给你留多厚的刃口了。'],['诺恩','多谢。'],['格蕾娜','先别谢。真想谢我，就活着回来，告诉我它用着顺不顺手。']]},
 ch5DewWork:{name:'灯下的净水',giver:'ch5Alchemist',map:'ch5Reservoir',type:'支线',xp:330,gold:85,required:{ch5Dew:4,emberHerb:3},route:'水院北侧分流器可收凝露，西南温草可采。缺少时离开水院，再回来查看。',accept:[['弥娅','别拧最上面的阀，烫。那只瓶子我已经摔过两回了。'],['艾莉娅','你的手受伤了？我来扶着。'],['弥娅','只是被烫了一下。你们若不赶路，替我凑四瓶凝露、三束温草，剩下的我自己来。']],complete:[['弥娅','都接得很干净。你以前也熬过药？'],['艾莉娅','教堂的孩子不肯喝苦药，我试过往里面加一点蜂蜜。'],['弥娅','这里没有蜂蜜。这份药你拿好，至少不会比原来更苦。']]},
 ch5Names:{name:'不要擦掉名字',giver:'ch5Archivist',map:'ch5GrandSquare',type:'支线',xp:450,gold:95,required:{ch5CourierPage:4},route:'广场北门 → 工坊东门 → 铸魂练场。留意空甲与执灯弩手身上散落的名册页，找齐四张后带回给维兰。',accept:[['维兰','那边练场里的甲，有些在胸口刻了名字。我抄到一半，纸就被风卷走了。'],['诺恩','你要找谁？'],['维兰','还记不清。先把名字留住吧。等我想起来，总不能连纸也没了。']],complete:[['维兰','字还在。谢天谢地，字还在。'],['艾莉娅','这一个字褪色了。我替你描上，好吗？'],['维兰','轻一点。那是她自己写的。']]}
};
export function chapter5SetBonuses(p){
 const set=CH5_SETS[p.cls];if(!set)return {count:0,attack:0,hp:0,basicDamage:0,reduction:0,mp:0,manaRegen:0};
 // Count distinct slots; copied IDs or a second weapon cannot create an extra set piece.
 const slots=new Set(Object.entries(p.gear||{}).filter(([slot,item])=>item?.setId===set.id&&['weapon','chest','hands','feet'].includes(slot)).map(([slot])=>slot)),count=slots.size;
 return {count,attack:count>=2?6:0,hp:count>=2?40:0,basicDamage:count>=4&&p.cls==='shadow'?.08:0,reduction:count>=4&&p.cls==='oath'?.04:0,mp:count>=4&&p.cls==='ember'?30:0,manaRegen:count>=4&&p.cls==='ember'?.4:0};
}
export function chapter5DrinkModifiers(p){return p.ch5Drink?.remaining>0?CH5_DRINKS[p.ch5Drink.id]||{}:{};}
export function applyChapter5Stats(p,s){const b=chapter5SetBonuses(p),d=chapter5DrinkModifiers(p);return {...s,atk:s.atk+b.attack,hp:s.hp+b.hp,mp:s.mp+b.mp,reduction:Math.min(.60,(s.reduction||0)+b.reduction+(d.reduction||0)),manaRegen:(s.manaRegen||0)+b.manaRegen+(d.manaRegen||0)};}
