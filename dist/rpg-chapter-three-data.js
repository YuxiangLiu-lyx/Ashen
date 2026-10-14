// Runtime R03. Literary volume/chapter assignment remains separate.
export const C3_GEAR_UPGRADES={
 'ch3-ashfang':{atk:30,attrs:{dex:4}},'ch3-burden':{atk:34,attrs:{str:4}},'ch3-wickstaff':{atk:32,attrs:{wis:4}},
 'ch3-kilngloves':{atk:8,hp:18},'ch3-ashboots':{hp:32},'ch3-pilgrimknot':{hp:24},'ch3-lastember':{hp:32}
};
export const C3_SCENES={
 c3HerbMedicine:[['莫里斯','苔窟那包先晾着，渡岸这包得再洗一遍。'],['诺恩','上面还有盐？'],['莫里斯','嗯，叶背也沾着。以后你有余温草，可以带过来，我替你配浓些。两份草、八枚金币，配一瓶。'],['诺恩','草我带，钱是算什么？'],['莫里斯','瓶子、塞子，还有守着炉子的工夫。你要嫌贵，旁边也有现成的小瓶，出门前自己挑好。']],
 c3BrewMedicine:[['莫里斯','药装好了。塞子按紧些，别又跟那些带尖的铁片挤在一起。']]
};
// The permitted completion action is fixed by the scene, never imported as arbitrary code.
export const C3_DEFERRED={
 ch3Arrival:['hellGate','ch3:arrived'],ch3AdvanceIntro:['hellApproach','v11:advanceIntro'],
 ch3AdvanceBoss1Before:['hellQuarry','v11:fight:ironScuttler'],ch3AdvanceBoss1After:['hellQuarry','v11:after:ironScuttler'],
 ch3AdvanceBoss2Before:['hellSluice','v11:fight:furnaceSentinel'],ch3AdvanceBoss2After:['hellSluice','v11:after:furnaceSentinel'],
 ch3Souls:['hellWall','ch3:ambush'],ch3Wound:['hellWall','ch3:wound'],ch3RescueCart:['hellWall','ch3:rescue'],
 ch3SaltGrotto:['hellGrotto',null],ch3SaltGather:['hellGrotto','ch3:salt'],ch3MineCrystal:['hellMine','ch3:crystal'],
 ch3WorkshopLamp:['hellWorkshop','ch3:lampLoan'],ch3Pass:['hellPass',null],ch3ArenaAfter:['hellArena','ch3:bossReward']
};
