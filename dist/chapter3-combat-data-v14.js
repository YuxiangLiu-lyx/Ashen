import {SYSTEM_SKILLS} from './systems-data-v14.js';
// V10 chapter-three design data. Pure ESM: no imports, globals or runtime mutation.
// damage = (base * basePower + str * STR + dex * DEX + vit * VIT + wis * WIS)
//          * (1 + 0.25 * (rank - 1)); cap rank at 3 unless specified.
// Healing/shields below are explicit formulas, never damage() with a negative value.
export const CH3_RULES = {
  levelCap: 16, expectedEntryLevel: [7, 9], expectedExitLevel: [12, 14],
  activeCombatSkills: 5, hotbarPages: 2, hotbarSlotsPerPage: 6,
  ordinaryGroupSize: [2, 4], normalMapEnemies: [8, 12], simultaneousAggroSoftCap: 4,
  safeEntryRadius: 220, refillResourcesOnlyOnReentry: true,
  ordinaryHasTelegraph: false, dodgeInvulnerability: false,
  firstSpecialDelay: 4.2, bossSpecialCooldown: 6.2,
  bossBasicAttacksBetweenSpecials: 2,
  ordinaryBookChance: 0.04, eliteBookChance: 0.04,
  bossFirstClearChoiceBook: true, bossRepeatBookChance: 0,
  chapterRandomLearnedBookCap: null, // Unknown books only; learning is still gated by level and skill points.
  randomDropPityKills: null, // Guaranteed unknown-book choice comes from the teaching machine.
  randomRewardSeedScope: 'saved chapter xorshift seed advanced and committed per reward',
  chapterResourceBudget: {gold: [700, 1050], xp: [3900, 4500], directSkillPoints: 2},
  notes: ['首领的移速/伤害不按每次入图动态抬升。', '随机书掉落不替代固定主线救援物资。', '普通怪无大型预警；攻击接触帧仍允许0.12–0.18秒自然动作时间。']
};

export const HELL_ENEMY_PROFILES = {
  hellHound: {name:'焦骨猎犬',level:8,hp:470,damage:30,speed:183,aggro:255,reach:60,wind:.13,cooldown:1.65,leash:570,rewardXP:34,rewardGold:[3,5],elite:false,attack:'melee',notes:'2–3只成组。四足交替迈步，短咬合，不扑击蓄力。'},
  hellSoul: {name:'迷失亡魂',level:9,hp:430,damage:32,speed:132,aggro:285,reach:56,wind:.15,cooldown:1.85,leash:560,rangedReach:265,rangedWind:.16,rangedCooldown:2.8,projectileSpeed:260,rewardXP:36,rewardGold:[2,4],elite:false,attack:'ordinarySoulBolt',notes:'普通灵弹可被墙挡住；抬手即发，有飘动但无闪现。'},
  hellGuard: {name:'流放守卫',level:11,hp:760,damage:37,speed:160,aggro:265,reach:77,wind:.18,cooldown:1.9,leash:600,rewardXP:49,rewardGold:[4,7],elite:false,attack:'melee',notes:'沉重斩击为普攻。每组最多两只，不能与入口相邻。'},
  hellJailer: {name:'锁链狱卒',level:13,hp:8000,damage:46,speed:168,aggro:420,reach:88,wind:.18,cooldown:1.65,leash:null,rewardXP:240,rewardGold:[65,65],elite:false,isBoss:true,attack:'twoBasicsThenSpecial',notes:'普通链刃必须穿插；特殊技能结束留1.4–1.8秒破绽；不无限召小怪。'}
};

export const HELL_BOSS_MOVES = {
  chainSweep:{label:'拖链横扫',shape:'cone',wind:.95,recovery:1.5,r:152,damage:60,arc:.82,vfx:'raisedChainWithEmberTrail',notes:'身上火星沿抬起的链条跑动，脚下只有淡尘痕，不能实心三角涂层。'},
  chainSlam:{label:'锁链砸落',shape:'circle',wind:1.15,recovery:1.8,r:122,damage:69,vfx:'fallingAshAndGroundCracks',notes:'锁定落点后不继续追踪；裂纹在最后0.4秒变亮。'},
  chainThrow:{label:'掷链',shape:'line',wind:.95,recovery:1.6,length:400,width:32,speed:300,damage:55,vfx:'chainHandSparks',notes:'锁定方向，不穿墙；远程反制有6.2秒独立间隔。'}
};

// Each entry can populate SKILLS (skillPointCost → cost), SKILL_SPEC.common (mp → cost)
// and ITEMS[bookId].skill. Never use the same key `cost` for skill points and MP.
export const HELL_SKILL_BOOKS = [
 ...SYSTEM_SKILLS,
  {id:'boneBreak',bookId:'boneBreakBook',name:'碎骨杖击',bookName:'《碎骨杖击》残页',level:7,rank:3,skillPointCost:1,mp:18,cd:6,base:.55,str:3.2,vit:.8,mechanic:{kind:'meleeArc',range:125,arc:1.0,maxTargets:3,breakGuard:{duration:3,incomingMultiplier:1.15,bossMultiplier:1.08,doesNotStack:true}},requiresWeapon:true,school:'melee',vfx:'boneGoldArc',description:'近身横击；接下来3秒该敌人承受伤害提高15%，首领为8%。'},
  {id:'emberLance',bookId:'emberLanceBook',name:'熔烬矛',bookName:'《熔烬矛》',level:7,rank:3,skillPointCost:1,mp:23,cd:7,base:.65,wis:3.3,dex:.3,mechanic:{kind:'projectile',range:340,speed:420,radius:8,pierce:1,secondaryMultiplier:.6},school:'spell',vfx:'thinEmberSpear',description:'发射火矛穿透最多2个目标；第二目标伤害为60%，不能穿墙。'},
  {id:'soulBind',bookId:'soulBindBook',name:'缚魂结',bookName:'《缚魂结》',level:7,rank:3,skillPointCost:1,mp:21,cd:11,base:.3,wis:1.1,dex:.7,mechanic:{kind:'target',range:245,rootDuration:1.8,bossRootDuration:0,bossSlowDuration:1.2,bossSlowFactor:.8},school:'control',vfx:'blueThreadKnots',description:'短暂束缚一个普通目标；精英和首领仅受轻度减速，不取消其招式。'},
  {id:'ashWard',bookId:'ashWardBook',name:'灰烬护壳',bookName:'《灰烬护壳》',level:7,rank:3,skillPointCost:1,mp:24,cd:16,base:0,mechanic:{kind:'selfShield',shieldFormula:{constant:16,vit:1.6,wis:.9},duration:5,maxHpCap:.24,stack:'takeMax'},school:'protection',vfx:'layeredAshShell',description:'获得持续5秒的护盾。护盾最多为最大生命24%，重复施放不叠加。'},
  {id:'bloodPact',bookId:'bloodPactBook',name:'血炭契',bookName:'《血炭契》',level:9,rank:3,skillPointCost:1,mp:10,cd:21,base:0,mechanic:{kind:'riskBuff',hpCostMaxFraction:.10,minHpFractionToCast:.25,duration:6,damageMultiplier:1.24,incomingDamageMultiplier:1.12,rankDamageIncrement:.03},school:'risk',vfx:'redCoalVeins',description:'另付最大生命10%，6秒内伤害+24%、受伤+12%。生命不足25%不能施放。'},
  {id:'graveBell',bookId:'graveBellBook',name:'坟钟余震',bookName:'《坟钟余震》',level:8,rank:3,skillPointCost:1,mp:26,cd:12,base:.4,str:.8,wis:2.0,mechanic:{kind:'selfPulse',radius:170,pulses:2,pulseInterval:.65,secondMultiplier:.65,slowDuration:2.4,slowFactor:.7,maxTargets:4},school:'control',vfx:'dustBellRipple',description:'两次余震，第二次为65%伤害；令最多4个附近敌人减速。'},
  {id:'wispLantern',bookId:'wispLanternBook',name:'浮灯术',bookName:'《浮灯术》',level:8,rank:3,skillPointCost:1,mp:27,cd:14,base:.15,wis:.8,mechanic:{kind:'groundZone',range:245,radius:83,duration:4,tick:1,maxTargets:3,activeLimit:1,requiresLineOfSight:true},school:'spell',vfx:'lanternWisps',description:'放置持续4秒的地面浮灯法印，每秒灼伤至多3个敌人，只能存在一道。这是持续法术，不是召唤生物。'},
  {id:'counterBrand',bookId:'counterBrandBook',name:'还刃印',bookName:'《还刃印》',level:9,rank:3,skillPointCost:1,mp:19,cd:13,base:.45,str:2.0,vit:1.4,mechanic:{kind:'retaliation',duration:4,blockedDamageFraction:.35,consumeOn:'firstPositiveHostileHit',retaliationRange:135,retaliationTargetLimit:1,reflectSelfCost:false},school:'melee',vfx:'amberBladeSigil',description:'4秒内下一次来袭伤害减少35%，并反击近处的攻击者一次。自付生命不触发。'},
  {id:'ferrymanCut',bookId:'ferrymanCutBook',name:'渡客斩',bookName:'《渡客斩》',level:10,rank:3,skillPointCost:1,mp:22,cd:9,base:.55,str:1.5,dex:2.4,mechanic:{kind:'meleeArc',range:145,arc:.75,maxTargets:3,finisherBelowHpFraction:.30,finisherMultiplier:1.25,noInstantExecute:true},requiresWeapon:true,school:'melee',vfx:'paleDoubleCrescent',description:'窄面斩击；目标生命低于30%时伤害提高25%，没有秒杀判定。'},
  {id:'echoExchange',bookId:'echoExchangeBook',name:'回声换息',bookName:'《回声换息》',level:9,rank:3,skillPointCost:1,mp:0,cd:20,base:0,mechanic:{kind:'resourceTrade',hpCostMaxFraction:.08,minHpFractionToCast:.35,manaFormula:{constant:14,wis:.25},maxManaFraction:.15,noCastAtFullMana:true},school:'risk',vfx:'violetBreath',description:'付出最大生命8%，恢复少量法力。法力满或生命低于35%时不能施放。'}
];

export const SAINT_CONTROL = {
  internalClass:'saint',publicClassSelectable:false,
  derivedLevel:'max(hero.level, 7)',
  classData:{name:'圣女',tag:'圣光 · 救援',hp:205,mp:125,atk:17,speed:195,reach:315,rate:.72,color:'#f2dfa4',q:'圣辉矢',e:'愈合祷言'},
  growth:{initial:{str:1,dex:2,vit:5,wis:7},perLevel:{str:0,dex:0,vit:1,wis:2}},
  skillKeys:['saintRay','saintMend','saintAegis','saintNova','saintChime'],
  initialSkillRank:1,initialManaFraction:1,initialHpFraction:1,
  initialItems:'inheritSharedItems',inventoryIsolated:false,
  xpPolicy:'earnForSaintPersistBuild',goldPolicy:'sharedCarryInventory',
  pickupsPolicy:'sharedItemsBagAndGoldEquippedBuildSeparate',
  switchingPolicy:'storyOnlyNoManualSwap',
  heroRestorePolicy:'restoreExactFrozenPThenApplySingleAuthoredTreatment',
  treatmentOnce:{hpFraction:.55,mpFraction:.35,flag:'ch3TreatmentApplied'},
  doNotCopy:['attrs','ap','sp','skills','knownBooks','activeSkills','skillSpent','bar','page','gear','cd','lastCombatSkill','hp','mp','emotion','resonance','shield','guard','empower'],
  persist:['controlActor','frozenHero','saintActor','saintBuild','xpEscrowLegacyOnly','ch3TreatmentApplied'],
  notes:['女主治疗只能治疗当前女主；无法隔空治疗昏迷诺恩。', '治疗材料与报酬均保底，不随机抽取；返还男主由一次性剧情治疗结算。', '女主重试保留已消耗药品/材料，不能靠角色切换重置补给。', '圣女阶段可独立升级、学书、加点；恢复诺恩时保留圣女培养。旧版暂存经验只迁移一次。']
};

export const SAINT_SKILLS = [
  {id:'saintRay',name:'圣辉矢',rank:3,skillPointCost:1,mp:12,cd:3.8,base:.6,wis:2.6,mechanic:{kind:'projectile',range:320,speed:450,radius:7,undeadMultiplier:1.15},vfx:'ivoryGoldRay',description:'圣光弹道，亡魂受到额外15%伤害。'},
  {id:'saintMend',name:'愈合祷言',rank:3,skillPointCost:1,mp:28,cd:13,base:0,mechanic:{kind:'selfHeal',healFormula:{constant:22,wis:1.2},maxHpCap:.22,noCastAtFullHp:true},vfx:'goldWhitePetals',description:'恢复自己的生命，单次不超过最大生命22%。'},
  {id:'saintAegis',name:'庇护圣幕',rank:3,skillPointCost:1,mp:24,cd:16,base:0,mechanic:{kind:'selfShield',shieldFormula:{constant:18,wis:.95,vit:.7},duration:5,maxHpCap:.20,stack:'takeMax'},vfx:'wingedLightShield',description:'获得持续5秒的圣光护盾，不与旧盾相加。'},
  {id:'saintNova',name:'驱暗环',rank:3,skillPointCost:1,mp:26,cd:10,base:.4,wis:1.7,mechanic:{kind:'selfPulse',radius:160,pulses:1,maxTargets:4,knockback:42,bossKnockback:0,slowDuration:2,slowFactor:.7},vfx:'goldenFeatherWave',description:'圣光向外荡开，推离普通敌人；精英和首领不被推走。'},
  {id:'saintChime',name:'静心钟',rank:3,skillPointCost:1,mp:22,cd:12,base:.3,wis:1.0,mechanic:{kind:'target',range:250,rootDuration:2,bossRootDuration:0,slowDuration:2,slowFactor:.6},vfx:'suspendedLightBell',description:'使一名普通敌人短暂停步，首领仅减速。'}
];

export const HELL_MATERIALS = {
  cinderIron:{name:'烬铁屑',kind:'material',stack:99,sell:2,sources:['hellGuard:0.28','scrapNodes'],renewable:true},
  soulAsh:{name:'魂灰',kind:'material',stack:99,sell:1,sources:['hellSoul:0.24','choiceMachineDuplicate'],renewable:true},
  blackGlass:{name:'黑曜碎片',kind:'material',stack:99,sell:3,sources:['hellHound:0.15','oreNodes'],renewable:true},
  emberHerb:{name:'余温草',kind:'material',stack:99,sell:1,sources:['herbNodes'],renewable:true,mainQuestCopiesGuaranteed:3},
  memoryThread:{name:'记忆丝',kind:'material',stack:20,sell:0,sources:['firstSidequests','firstChallengeTier'],renewable:false,chapterBudget:5},
  gateToken:{name:'裂门铜契',kind:'currency',stack:20,sell:0,sources:['authoredSecrets','firstChallengeTier'],renewable:false,chapterBudget:6}
};

export const HELL_UNIQUES = {
  kilnGrip:{name:'引热',effect:'持杖时：碎骨杖击、还刃印伤害+22%；熔烬矛与烬印伤害−12%。',keys:['boneBreak','counterBrand'],positive:1.22,negative:0.88,condition:'weaponType=staff',proc:false},
  lastEmber:{name:'余烬未灭',effect:'生命低于35%且受到敌人伤害后，获得最大生命8%的护盾，持续3秒，每30秒一次。',trigger:'positiveHostileDamage',threshold:.35,shieldMaxHp:.08,duration:3,cooldown:30,sharedCooldownKey:'unique:lastEmber'},
  pilgrimKnot:{name:'留灯',effect:'引魂灯持续时间+1秒，但每次伤害−12%。',skill:'wispLantern',durationAdd:1,damageMultiplier:.88,proc:false},
  measuredDebt:{name:'欠账',effect:'血炭契的额外承伤从12%降到6%，但持续时间从6秒降到5秒。',skill:'bloodPact',incomingDamageMultiplier:1.06,durationOverride:5,proc:false}
};

export const HELL_EQUIPMENT = [
  {id:'ch3-ashfang',name:'灰牙双刃',slot:'weapon',weaponType:'daggers',minLevel:7,rarity:'rare',atk:8,hp:0,attrs:{dex:2},affix:null,source:'forgeClassChoice',uniqueEffect:null},
  {id:'ch3-burden',name:'负铁重剑',slot:'weapon',weaponType:'greatsword',minLevel:7,rarity:'rare',atk:11,hp:0,attrs:{str:2},affix:null,source:'forgeClassChoice',uniqueEffect:null},
  {id:'ch3-wickstaff',name:'残灯法杖',slot:'weapon',weaponType:'staff',minLevel:7,rarity:'rare',atk:7,hp:0,attrs:{wis:2},affix:null,source:'forgeClassChoice',uniqueEffect:null},
  {id:'ch3-soothood',name:'避灰兜帽',slot:'head',minLevel:8,rarity:'rare',atk:0,hp:18,attrs:{vit:1},affix:null,source:'sidequestChoice'},
  {id:'ch3-rivetedcoat',name:'流放铆衣',slot:'chest',minLevel:9,rarity:'rare',atk:0,hp:35,attrs:{vit:2},affix:null,source:'challengeFirstTier'},
  {id:'ch3-kilngloves',name:'窑工护手',slot:'hands',minLevel:9,rarity:'rare',atk:3,hp:0,attrs:{str:1},affix:null,source:'hiddenForge',uniqueEffect:'kilnGrip'},
  {id:'ch3-ashboots',name:'走灰短靴',slot:'feet',minLevel:9,rarity:'rare',atk:0,hp:12,attrs:{dex:2},affix:null,source:'navigationSecret'},
  {id:'ch3-lastember',name:'余烬扣',slot:'relic',minLevel:10,rarity:'epic',atk:0,hp:12,attrs:{vit:1},affix:null,source:'jailerFirstClearChoice',uniqueEffect:'lastEmber'},
  {id:'ch3-pilgrimknot',name:'留灯绳结',slot:'relic',minLevel:9,rarity:'rare',atk:0,hp:0,attrs:{wis:2},affix:null,source:'lanternQuestChoice',uniqueEffect:'pilgrimKnot'},
  {id:'ch3-debtring',name:'欠账铜环',slot:'relic',minLevel:10,rarity:'rare',atk:2,hp:0,attrs:{str:1},affix:null,source:'debtMachineChoice',uniqueEffect:'measuredDebt'}
];

export const HELL_FACILITIES = [
  {id:'ch3-ember-forge',name:'余温锻炉',kind:'craft',unlock:'ch3Stage>=15',recipes:[
    {id:'forge-class-weapon',cost:{gold:90,cinderIron:5,blackGlass:3},outputsByClass:{shadow:'ch3-ashfang',oath:'ch3-burden',ember:'ch3-wickstaff'},lifetimeLimit:1},
    {id:'forge-kiln-gloves',cost:{gold:65,cinderIron:4,memoryThread:1},output:'ch3-kilngloves',lifetimeLimit:1,requires:'hiddenForgeFound'},
    {id:'forge-attribute-reset',cost:{gold:110,soulAsh:6,memoryThread:1},outputItem:'attributeReset',lifetimeLimit:1},
    {id:'forge-skill-reset',cost:{gold:110,soulAsh:6,memoryThread:1},outputItem:'skillReset',lifetimeLimit:1},
    {id:'forge-heal',cost:{gold:10,emberHerb:2},outputItem:'hp',lifetimeLimit:8,questReserve:{emberHerb:3,until:'doctorPaid'}}
  ]},
  {id:'ch3-soul-draw',name:'渡口签筒',kind:'targetedRandomChoice',unlock:'ch3Stage>=16',cost:{gateToken:1,soulAsh:3},lifetimeLimit:6,paidCurrency:false,
    targetSchools:['melee','spell','protectionControl'],offerCount:3,offerPersistsBeforeChoice:true,
    poolBySchool:{melee:['boneBreakBook','ferrymanCutBook','counterBrandBook'],spell:['emberLanceBook','wispLanternBook','graveBellBook'],protectionControl:['ashWardBook','soulBindBook','echoExchangeBook']},
    weights:{unknownBook:70,usefulMaterialBundle:30},pity:{afterConsecutiveNoBook:2,nextDraw:'unknownBookInSelectedPool',scope:'chapterTotalNotPerSchool'},
    duplicates:{action:'replaceWithUnlearnedIfAvailable',allKnown:'returnTokenAndOfferMaterialOnlyWithoutCharge'},
    notes:['付材料时立即提交结果和计数到存档，再打开三选一。', '关闭、换页、重进入、重启后显示同一份未领取结果。', '抽签不会给剧情必需品，不用真钱，预先显示奖池和保底剩余次数。']},
  {id:'ch3-lock-trial',name:'锁井试炼',kind:'challenge',unlock:'ch3Stage>=18',tiers:[
    {id:'trial1',recommendedLevel:9,waves:[['hellHound','hellHound'],['hellSoul','hellHound']],firstReward:{xp:130,gold:35,gateToken:1,memoryThread:1},gearChoice:['ch3-rivetedcoat','ch3-soothood']},
    {id:'trial2',recommendedLevel:11,waves:[['hellGuard','hellSoul'],['hellHound','hellHound','hellSoul']],firstReward:{xp:170,gold:45,gateToken:1,memoryThread:1},bookChoice:['bloodPactBook','ashWardBook']},
    {id:'trial3',recommendedLevel:13,waves:[['hellGuard','hellHound','hellSoul'],['hellGuard','hellGuard','hellSoul']],firstReward:{xp:220,gold:55,gateToken:1},bookChoice:['ferrymanCutBook','echoExchangeBook']}
  ],repeatReward:{xp:35,gold:6,soulAsh:1},suppressNormalWaveDrops:true,repeatXpGoldMultiplier:.15,repeatFirstTimeItems:false,
    entranceSupply:'useOwnItems',entryDamagePreview:true,exitBetweenWaves:true,oneShotFirstClaimKeys:true}
];

// Root integration chose the facility names below. The challenge is separate
// from the three permanent facilities, and lamp contracts never occupy a skill.
export const SOUL_LAMP_SYSTEM = {
  id:'ch3-camp-lamp',name:'营地灵灯',unlock:'ch3Stage>=17',activeLimit:1,
  initialChoiceFree:true,subsequentRetuneCost:{soulAsh:4,gold:30},
  switchingAllowed:'safeCampOnly',restoreHealthOnSwitch:false,resetCooldownOnSwitch:false,
  choices:[
    {id:'warmWick',name:'守烛契',benefit:{maxHpFlat:24},cost:{damageMultiplier:.95},description:'最大生命+24；造成伤害−5%。只提高上限，不补充当前生命。'},
    {id:'sharpWick',name:'燃刃契',benefit:{damageMultiplier:1.07},cost:{incomingDamageMultiplier:1.07},description:'造成伤害+7%，受到伤害+7%。'},
    {id:'clearWick',name:'澄息契',benefit:{manaRegenFlat:.35},cost:{healingReceivedMultiplier:.9},description:'每秒法力恢复+0.35；获得的治疗−10%。'}
  ],
  scope:'heroOnly',persistFields:['lampContract','lampUnlocked'],
  notes:['女主救援段不读取男主灵灯。', '所有伤害/治疗来源走统一修正函数，不能只改变面板。', '离开营地仍保留灯契，不能重复领取首次选择奖励。']
};

export const FACILITY_NAME_OVERRIDES = {
  'ch3-ember-forge':'余温工坊', 'ch3-soul-draw':'魂签轮',
  'ch3-lock-trial':'回声裂隙'
};

export const CH3_REWARD_BUDGET = {
  includesKillXP:true,
  mandatory:{xp:2700,gold:480,fixedBooks:1,fixedEquipmentChoices:1,hp:4,mp:4,guaranteedDoctorMaterials:true},
  optional:{xp:[1200,1800],gold:[220,570],fixedBookChoices:2,randomNewBooksMax:3,rareEquipmentChoices:[2,4],epicEquipmentChoicesMax:1,bonusSkillPointsMax:2},
  pacing:[
    {phase:'边界→初遇亡魂',stage:[12,13],expectedLevel:[7,8],pack:[2,3],normalDamage:[30,32],hint:'每组之后保留明显安全空隙。'},
    {phase:'伤势→医生→圣女寻药',stage:[14,16],expectedLevel:[8,10],pack:[2,3],normalDamage:[27,34],hint:'女主支路普通怪伤害×0.9，固定治疗技能教程只出现一次。'},
    {phase:'余温锻炉→废旧支路',stage:[17,18],expectedLevel:[10,12],pack:[3,4],normalDamage:[30,37],hint:'奖励来自有限探索，随机书用于换构筑而非单向数值升级。'},
    {phase:'狱卒门庭→锁井出口',stage:[19,20],expectedLevel:[12,14],pack:[3,4],normalDamage:[37,46],specialDamage:[55,69],hint:'最后主路不同时放首领与三只守卫；首领支援最多2只低血猎犬且仅一次。'}
  ],
  antiFarm:{xpNeedFormula:'70 + 40 * level',chapterEntryLevel:'doNotForceLevel',
    randomSourceIdentity:'stable authored spawn ID + visit index committed on map enter',
    repeatKillLoot:'lower gold and gear chance after third clear of same map; keep small material chance',
    limitedRewardClaim:'set rewardId claimed atomically with costs and items; pending queue on bag full',
    saveReload:'store PRNG state + pendingChoice + drawCounter + pityCounter',
    importOldSave:'cannot prevent deliberate manual save rollback in an offline game; guarantee normal actions do not reroll'}
};
