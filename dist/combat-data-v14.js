// V11 design inputs. Pure ESM data: no imports, globals, DOM, or Site mutation.
// Distances are world pixels. Numbers are design recommendations, not a claim
// that the current V10 runtime already supports the described mechanics.
export const V11_RULES = {
  levelCap:22, chapter3ExpectedEntryLevel:[7,9], chapter3BeforeRescueLevel:[10,12],
  chapter4ExpectedEntryLevel:[13,15], chapter4ExpectedExitLevel:[18,20],
  activeSkillLimit:5, pages:2, pageSize:6, levelRewards:{attributePoints:3,skillPoints:1},
  bossBasicsBetweenSpecials:3, bossInitialSpecialDelay:4.8,
  normalTelegraphs:false, ordinaryPackSize:[2,4], ordinaryMapCount:[9,13],
  onlyMinorityEliteSpecials:true, eliteSpecialCooldown:8,
  bossArenaInitialAdds:{ordinary:2,elite:1}, bossArenaMaxConcurrentAdds:3,
  bossArenaAddsRespawnDuringFight:false, bossSummonWaves:0,
  mapReentryRefresh:true, idleRespawn:false, clearSpawnRadius:220,
  noManualActorSwitch:true, noDodge:true,
  collisionRules:['Every projectile stops at solid geometry.','Bosses ignore knockback/root, not ordinary slow.','A charged attack locks its direction or ground point once; no homing warning.'],
  damageOrder:'skill base and rank -> equipment/skill multipliers -> crit/resonance once -> target defence once -> apply; independent enchant damage never re-enters this chain',
};

export const V11_BOSS_PROFILES = {
  ironScuttler:{name:'铁壳伏行者',chapter:3,level:9,hp:4300,damage:33,speed:158,aggro:410,reach:78,wind:.17,cooldown:1.75,leash:null,isBoss:true,attack:'threeBasicsThenSpecial',basicAttack:'melee',basicAnimation:'lowBite',specialCooldown:6.8,firstSpecialDelay:4.8,basicAttacksBetweenSpecials:3,moveOrder:['ironClaw','ironBurrow','ironCharge'],guardFront:.80,guardRear:.95,dotMultiplier:.9,phase2At:.45,phase2RecoveryMultiplier:.92,rewardXP:180,rewardGold:[45,45],visualFamily:'hellHound',purpose:'第一段成长后的完整首领；咬击三次，再抬前肢或压低身体蓄力。'},
  furnaceSentinel:{name:'熔炉监守',chapter:3,level:11,hp:5600,damage:39,speed:148,aggro:410,reach:84,wind:.19,cooldown:1.85,leash:null,isBoss:true,attack:'threeBasicsThenSpecial',basicAttack:'melee',basicAnimation:'heavySword',specialCooldown:7.2,firstSpecialDelay:4.8,basicAttacksBetweenSpecials:3,moveOrder:['furnaceSweep','furnaceSlam','furnaceBolt'],guardFront:.78,guardRear:.94,dotMultiplier:.88,phase2At:.45,phase2RecoveryMultiplier:.92,rewardXP:230,rewardGold:[55,55],visualFamily:'hellGuard',purpose:'第二个前置首领；用高热剑与落点裂火区分，击败后再进入保护圣女的剧情。'},
  odric:{name:'奥德里克',chapter:4,level:14,hp:9800,damage:51,speed:164,aggro:440,reach:87,wind:.18,cooldown:1.72,leash:null,isBoss:true,attack:'threeBasicsThenSpecial',basicAttack:'melee',basicAnimation:'swordShield',specialCooldown:7.0,firstSpecialDelay:5,basicAttacksBetweenSpecials:3,moveOrder:['odricBash','odricCharge','odricSlam'],guardFront:.76,guardRear:.93,dotMultiplier:.88,phase2At:.45,phase2RecoveryMultiplier:.90,rewardXP:400,rewardGold:[85,85],visualFamily:'hellGuard',identity:'生前有身份、公开被称死于黑暗教会、真实死于教廷骗局后的献祭的武官，姓名与生前职务以文案为准。',purpose:'首个深层首领，普攻节奏清晰。两名普通陪战者与一名精英分散在两翼，可先处理。'},
  martha:{name:'玛莎',chapter:4,level:16,hp:11400,damage:54,speed:139,aggro:450,reach:285,rangedReach:310,rangedWind:.18,rangedCooldown:1.95,projectileSpeed:290,wind:.18,cooldown:1.95,leash:null,isBoss:true,attack:'threeBasicsThenSpecial',basicAttack:'projectile',basicAnimation:'oneHandCast',specialCooldown:7.5,firstSpecialDelay:5,basicAttacksBetweenSpecials:3,moveOrder:['marthaCensure','marthaBell','marthaLance'],guardFront:.85,guardRear:.95,dotMultiplier:.9,phase2At:.45,phase2RecoveryMultiplier:.90,rewardXP:460,rewardGold:[100,100],visualFamily:'hellSoul',identity:'生前有身份、公开被称死于黑暗教会、真实死于教廷骗局后的献祭的教会人物，圣女认识；圣女在场时不补全真相，私密章末回忆另行揭示。',purpose:'以有飞行时间的灵弹为普攻；每三发后的蓄力法术给出法器聚光和地面细裂光。'},
  severin:{name:'塞维林',chapter:4,level:18,hp:14500,damage:60,speed:162,aggro:450,reach:91,wind:.20,cooldown:1.80,leash:null,isBoss:true,attack:'threeBasicsThenSpecial',basicAttack:'melee',basicAnimation:'executionBlade',specialCooldown:7.5,firstSpecialDelay:5.3,basicAttacksBetweenSpecials:3,moveOrder:['severinSentence','severinChains','severinRend'],guardFront:.76,guardRear:.93,dotMultiplier:.88,phase2At:.40,phase2RecoveryMultiplier:.88,rewardXP:540,rewardGold:[120,120],visualFamily:'hellJailer',identity:'生前有身份、公开被称死于黑暗教会、真实死于教廷骗局后的献祭的审判或治安高层，具体身份以文案为准。',purpose:'三个清楚的重刃普攻接一招特殊；半血后只缩短破绽12%，不同时增加攻击数和持续小怪。'},
};

export const V11_BOSS_MOVES = {
  ironClaw:{label:'抬爪横掠',shape:'cone',wind:.85,recovery:1.5,r:145,arc:.8,damage:43,vfx:'raisedClawDust',resolver:'cone',warning:'前爪抬高，铁屑从关节落下；爪端拖一小段残光。'},
  ironBurrow:{label:'碎壳震地',shape:'circle',wind:1.08,recovery:1.8,r:118,damage:48,vfx:'hairlineCracks',resolver:'circle',target:'lockedPlayerPosition',warning:'前足点地，细裂纹在落点蔓延，最后0.35秒发亮。'},
  ironCharge:{label:'贴地冲撞',shape:'line',wind:.95,recovery:1.8,length:255,width:50,duration:.40,speed:590,damage:45,vfx:'lowDustTrail',resolver:'charge',warning:'身体压低，双足刨地；冲锋固定方向，撞墙即停。'},
  furnaceSweep:{label:'熔刃横斩',shape:'cone',wind:.95,recovery:1.6,r:155,arc:.85,damage:53,vfx:'hotBladeEmbers',resolver:'cone',warning:'剑身由暗红烧成亮橙，抬肩后再横斩。'},
  furnaceSlam:{label:'炉火落锤',shape:'circle',wind:1.20,recovery:1.9,r:128,damage:61,vfx:'crackedFloorGlow',resolver:'circle',target:'lockedPlayerPosition',warning:'剑尖烧红，地上不是色块而是短小裂火纹。'},
  furnaceBolt:{label:'抛掷炉渣',shape:'line',wind:.95,recovery:1.6,length:380,width:28,speed:285,damage:49,vfx:'handfulOfSlag',resolver:'projectile',warning:'手上聚起一团炽热炉渣；单发、固定方向、受墙遮挡。'},
  odricBash:{label:'盾缘重击',shape:'cone',wind:.88,recovery:1.6,r:138,arc:.76,damage:68,vfx:'shieldRimSparks',resolver:'cone',warning:'盾边擦地带火星，肩膀后撤。'},
  odricCharge:{label:'最后冲锋',shape:'line',wind:1.05,recovery:2.0,length:340,width:56,duration:.5,speed:630,damage:74,vfx:'bootDustChain',resolver:'charge',warning:'盾前倾、剑收身侧；道路上只有扬尘流向。'},
  odricSlam:{label:'断旗重斩',shape:'circle',wind:1.22,recovery:2.0,r:135,damage:79,vfx:'brokenFlagLight',resolver:'circle',target:'lockedPlayerPosition',warning:'剑举到头顶，落点的细裂纹逐渐发白。'},
  marthaCensure:{label:'缄声火印',shape:'circle',wind:1.25,recovery:1.9,r:132,damage:76,vfx:'fadingLettersOnAsh',resolver:'circle',target:'lockedPlayerPosition',warning:'地灰中浮出断续字迹，围在目标附近；不施加沉默，避免药品与全部战技同时失效。'},
  marthaBell:{label:'空庭钟鸣',shape:'circle',wind:1.32,recovery:2.1,r:178,damage:85,vfx:'bellWisps',resolver:'circle',target:'self',warning:'法器两侧出现三缕流光，音调渐升；抬杖后向自身四周震开。'},
  marthaLance:{label:'审辞贯矛',shape:'line',wind:1.04,recovery:1.8,length:440,width:30,speed:325,damage:69,vfx:'narrowSoulLance',resolver:'projectile',warning:'手中法器拉出纤细蓝白光束，锁方向后发射。'},
  severinSentence:{label:'处刑落刃',shape:'circle',wind:1.34,recovery:2.1,r:148,damage:92,vfx:'chainRaisedBlade',resolver:'circle',target:'lockedPlayerPosition',warning:'锁链将巨刃吊起，地面灰烬向一处聚拢。'},
  severinChains:{label:'裂链横扫',shape:'cone',wind:1.06,recovery:1.8,r:175,arc:.82,damage:81,vfx:'linkedEmberTrail',resolver:'cone',warning:'刃端锁链拉紧，火星沿链节向外跑动。'},
  severinRend:{label:'断罪掷刃',shape:'line',wind:1.10,recovery:1.9,length:450,width:34,speed:315,damage:76,vfx:'spinningChainBlade',resolver:'projectile',warning:'手臂后拉、链刃在身侧转半周，之后单向飞出。'},
};

export const V11_DEEP_ENEMY_PROFILES = {
  deepHound:{name:'裂炉猎犬',level:13,hp:760,damage:40,speed:182,aggro:255,reach:62,wind:.13,cooldown:1.72,leash:560,rewardXP:48,rewardGold:[4,7],attack:'melee',visualFamily:'hellHound'},
  deepSoul:{name:'灰庭游魂',level:14,hp:740,damage:42,speed:130,aggro:285,reach:56,rangedReach:280,rangedWind:.17,rangedCooldown:2.8,projectileSpeed:265,wind:.16,cooldown:1.95,leash:560,rewardXP:52,rewardGold:[4,7],attack:'ordinarySoulBolt',visualFamily:'hellSoul'},
  deepGuard:{name:'葬誓卫士',level:15,hp:1080,damage:47,speed:154,aggro:265,reach:78,wind:.19,cooldown:2.0,leash:600,rewardXP:64,rewardGold:[5,8],attack:'melee',visualFamily:'hellGuard'},
  deepElite:{name:'持印近卫',level:16,hp:1880,damage:51,speed:149,aggro:275,reach:81,wind:.19,cooldown:2.0,leash:600,rewardXP:95,rewardGold:[10,14],elite:true,attack:'meleeWithRareSpecial',specialMove:'furnaceSweep',specialDamageOverride:62,specialCooldown:9,basicAttacksBetweenSpecials:4,visualFamily:'hellGuard'},
};

export const V11_BOSS_REWARDS = {
  ironScuttler:{first:{xp:180,gold:45,items:{hp:2,mp:1},bookChoice:['boneBreakBook','emberLanceBook','ashWardBook']},repeat:{xp:50,gold:[12,16],rareGearChance:.16,epicGearChance:0},gearLevel:9,claimKey:'v11:first:ironScuttler',respawn:'explicitAltarAfterFirstClear'},
  furnaceSentinel:{first:{xp:230,gold:55,items:{hp:2,mp:2},guaranteedRareGear:true},repeat:{xp:65,gold:[15,20],rareGearChance:.18,epicGearChance:.01},gearLevel:10,claimKey:'v11:first:furnaceSentinel',respawn:'explicitAltarAfterFirstClear'},
  odric:{first:{xp:400,gold:85,items:{ashGlass:5,hp:2},guaranteedRareGear:true},repeat:{xp:95,gold:[24,32],items:{ashGlass:[1,2]},guaranteedOneGear:true,rarityWeights:{common:72,rare:26,epic:2}},gearLevel:14,claimKey:'v11:first:odric',respawn:'explicitAltarAfterFirstClear'},
  martha:{first:{xp:460,gold:100,items:{ashGlass:6,mp:2},guaranteedRareGear:true},repeat:{xp:115,gold:[28,36],items:{ashGlass:[1,2]},guaranteedOneGear:true,rarityWeights:{common:68,rare:29,epic:3}},gearLevel:16,claimKey:'v11:first:martha',respawn:'explicitAltarAfterFirstClear'},
  severin:{first:{xp:540,gold:120,items:{ashGlass:8,hp:2,mp:2},guaranteedRareGear:true,firstEpicUpgradeChance:.20},repeat:{xp:140,gold:[32,42],items:{ashGlass:[2,3]},guaranteedOneGear:true,rarityWeights:{common:65,rare:31,epic:4}},gearLevel:18,claimKey:'v11:first:severin',respawn:'explicitAltarAfterFirstClear'},
};

export const V11_ECONOMY = {
  materials:{ashGlass:{name:'烬晶砂',kind:'material',stack:999,sell:1,renewable:true,description:'地狱深处的火与残魂压出的细晶。炉师用它为装备刻下新的纹路。'}},
  ordinaryDrops:{ashGlassChance:.27,ashGlassCount:[1,1],soulAshChance:.20,gearChance:.10,bookChance:.035},
  eliteDrops:{ashGlassChance:1,ashGlassCount:[1,2],soulAshChance:.35,gearChance:.28,bookChance:.05},
  gearRarityWeights:{common:76,rare:22,epic:2},
  gearLevel:'enemy.level; do not raise old-map drops to current player level',
  xpLevelGap:[{gapMax:2,multiplier:1},{gapMax:4,multiplier:.75},{gapMax:6,multiplier:.5},{gapMax:null,multiplier:.25}],
  goldDoesNotScaleWithPlayerLevel:true, noVisitPenaltyBeforeLevelGap:true,
  shop:[{item:'hp',price:8,bundle:1},{item:'mp',price:10,bundle:1},{item:'hp',price:38,bundle:5},{item:'mp',price:48,bundle:5}],
  rest:{price:25,hpFraction:1,mpFraction:1,allowed:'safeCampNoCombat',doesNotResetCooldowns:true,firstArrivalFree:true},
  projectedFirstClear:{ordinaryKills:[45,60],eliteKills:[5,8],bossKills:3,xp:[4500,6000],gold:[680,920],ashGlass:[35,50],paidEnchants:[8,12]},
  notes:['等级差只降低经验，不突然禁掉掉落。','首胜物品从有限奖励队列发放，满包不折价丢掉。','刷首领有固定等级装备；不能用低级首领按玩家等级刷满级装。','重复首领不再给一次性技能点/剧情奖励。','没有真钱抽奖或付费货币。']
};

export const V11_SAINT_GROWTH = {
  initialLevel:'hero.level at first unseal; no clamp to 14',
  initialAttributes:{str:0,dex:0,vit:0,wis:0}, initialUnspent:{ap:6,sp:2},
  startingSkills:['saintRay','saintMend','saintAegis','saintNova','saintChime'],
  startingSkillRank:1, saintSkillRankCap:3,
  classGrowth:{initial:{str:1,dex:2,vit:5,wis:7},perLevel:{str:0,dex:0,vit:1,wis:2}},
  attributesPerNewLevel:3, skillPointsPerNewLevel:1,
  learnBooks:true, trainSkills:true, allocateAttributes:true, resetOwnPoints:true,
  activeCombatSkills:5, materialSkillBooksConsumedOnce:true,
  xpPolicy:'active actor receives XP immediately; Noen receives no copy of new saint XP',
  teaching:{unlock:'Noen recovered and in safe scene',rankGranted:1,costGold:0,costSkillPoints:0,existingRankPolicy:'keep existing rank; never copy teacher rank',sourceIncludes:'all saint skills with positive learned rank, including innate holy skills',autoActivate:false,barUnchanged:true},
  save:{schema:11,shared:['items','bag','gold','pendingRewards'],actor:['level','xp','attrs','ap','sp','skills','skillOrigins','knownBooks','skillSpent','activeSkills','gear','bar','page','hp','mp','cd'],legacyEscrow:'V10 escrow captured once as legacyHeroXpEscrow and paid to Noen once; V11 saint XP never enters it'},
  restoreNoen:'save saint actor first; restore frozen Noen build; carry live shared inventory; apply legacy XP at most once; treatment HP55% MP35% only once',
};

export const ENCHANT_RULES = {
  schema:1, property:'enchantment', independentOf:['affix','uniqueEffect','attrs'],
  countPerItem:1, maxPendingOffers:1, unlockedInChapter:4,
  allowedItemRarity:['common','uncommon','rare','epic','legendary','abyssal'],
  qualityWeights:{common:70,rare:26,epic:4}, qualityNames:{common:'微光',rare:'清晰',epic:'炽明'},
  categoryWeights:{stat:50,element:25,skill:25},
  price:{gold:60,ashGlass:3,soulAsh:2}, tutorialPrice:{gold:0,ashGlass:1,soulAsh:0}, tutorialCount:1,
  offerRule:'validate location/resources/item -> pay once -> roll eligible id/quality/value -> save pending with target item ID -> display',
  resolution:['adopt new enchantment','retain current enchantment'], retainingRefund:false,
  pendingRule:'no second roll, sale, dismantle or gear-ID replacement for reserved target until resolved; closing panel leaves offer pending',
  repeatedModifierStacking:'stat flats add; same element or same skill modifier uses strongest compatible roll, never multiplicative copies',
  procTrigger:'positive direct player-originated attack or skill hit only',
  excludedTriggers:['damageOverTime','enchant','equipmentProc','reflectedDamage','selfCost','environment','heal','shield','miss','blockedByWall'],
  procCooldownStorage:'actor.cd[enchantFamily] so unequip/re-equip and import cannot reset it',
  procCanCrit:false, procCanTriggerOtherProcs:false, procCanGrantEmotion:false, procCanHealOrRestoreMana:false,
  procDamageOrder:'rolledFlat + basePower * coefficient, then target defence once; no crit/resonance/skill factor again',
  skillMinimumMp:4, skillMinimumCdFraction:.85, noGrantSkillOnEnchant:true,
};

// Each enchantment has one randomly rolled integer `value`. UI substitutes it
// in `display`. Percentage rolls are percentages, not fractions, in storage.
// Runtime stores only {schema:1, defId, quality, value, nonce}; never trust a
// saved executable formula, description, coefficient, or arbitrary effect key.
export const ENCHANT_DEFS = {
  ironSinew:{id:'ironSinew',name:'铁筋',kind:'stat',slots:['weapon','hands','relic'],stat:'str',weight:10,range:{common:[1,2],rare:[3,4],epic:[5,5]},display:'力量 +{value}。'},
  lightStep:{id:'lightStep',name:'轻影',kind:'stat',slots:['weapon','feet','relic'],stat:'dex',weight:10,range:{common:[1,2],rare:[3,4],epic:[5,5]},display:'敏捷 +{value}。'},
  lucidMind:{id:'lucidMind',name:'明识',kind:'stat',slots:['weapon','head','relic'],stat:'wis',weight:10,range:{common:[1,2],rare:[3,4],epic:[5,5]},display:'精神 +{value}。'},
  deepRoot:{id:'deepRoot',name:'深根',kind:'stat',slots:['head','chest','feet'],stat:'vit',weight:10,range:{common:[1,1],rare:[2,3],epic:[4,4]},display:'体质 +{value}。'},
  warmBlood:{id:'warmBlood',name:'温血',kind:'stat',slots:['head','chest','relic'],stat:'maxHp',weight:10,range:{common:[10,16],rare:[17,24],epic:[25,32]},display:'最大生命 +{value}。更换装备不会恢复当前生命。'},
  stillReservoir:{id:'stillReservoir',name:'静泉',kind:'stat',slots:['head','relic'],stat:'maxMp',weight:9,range:{common:[10,16],rare:[17,25],epic:[26,34]},display:'最大法力 +{value}。更换装备不会恢复当前法力。'},
  honedEdge:{id:'honedEdge',name:'磨锋',kind:'stat',slots:['weapon','hands'],stat:'basePower',weight:9,range:{common:[2,3],rare:[4,5],epic:[6,7]},display:'基础战力 +{value}。会计入使用基础战力加成的技能。'},
  roadWorn:{id:'roadWorn',name:'行灰',kind:'stat',slots:['feet'],stat:'sprintBoost',weight:9,range:{common:[3,5],rare:[6,8],epic:[9,11]},display:'疾行期间的移速增幅额外 +{value} 个百分点（仍受70%上限限制）；常规移速不变。'},
  emberTouch:{id:'emberTouch',name:'余火',kind:'element',slots:['weapon'],element:'fire',weight:12,range:{common:[7,11],rare:[12,17],epic:[18,22]},basePowerCoefficient:.08,cooldown:1.2,targets:1,procFamily:'enchant:weaponElement',display:'直接命中时额外造成 {value} + 基础战力×0.08 火焰伤害，每1.2秒一次。附伤不会暴击或触发装备。'},
  frostVein:{id:'frostVein',name:'霜脉',kind:'element',slots:['weapon'],element:'frost',weight:10,range:{common:[5,8],rare:[9,13],epic:[14,18]},basePowerCoefficient:.06,cooldown:1.8,targets:1,slow:{duration:1.2,normalFactor:.85,bossFactor:.95},procFamily:'enchant:weaponElement',display:'直接命中时额外造成 {value} + 基础战力×0.06 寒霜伤害，并减速15%持续1.2秒，首领为5%；每1.8秒一次。'},
  thunderThread:{id:'thunderThread',name:'弧丝',kind:'element',slots:['weapon'],element:'lightning',weight:8,range:{common:[4,7],rare:[8,11],epic:[12,15]},basePowerCoefficient:.05,cooldown:2.8,targets:2,secondaryMultiplier:.6,jumpRange:105,requiresLineOfSight:true,procFamily:'enchant:weaponElement',display:'直接命中时附加 {value} + 基础战力×0.05 雷电伤害，向105范围内另一个敌人跳一次，第二目标伤害60%；每2.8秒一次，不能穿墙。'},
  sweepingNotch:{id:'sweepingNotch',name:'展刃',kind:'skill',slots:['weapon','hands'],skills:['cleave','boneBreak','ferrymanCut'],modifier:'rangePct',weight:10,range:{common:[8,11],rare:[12,16],epic:[17,20]},damageMultiplier:.95,stackGroup:'enchant:arcRange',display:'暴砍、碎骨杖击、渡客斩的作用距离 +{value}%，伤害 −5%；最多目标数不变。'},
  focusedRune:{id:'focusedRune',name:'聚芒',kind:'skill',slots:['weapon','hands','relic'],skills:['firebolt','emberLance','saintRay'],modifier:'damagePct',weight:10,range:{common:[6,9],rare:[10,13],epic:[14,17]},mpAdd:2,stackGroup:'enchant:boltDamage',display:'火矢、熔烬矛、圣辉矢伤害 +{value}%，每次额外消耗2法力。'},
  wovenWard:{id:'wovenWard',name:'密织',kind:'skill',slots:['head','chest'],skills:['ashWard','saintAegis'],modifier:'shieldPct',weight:10,range:{common:[7,10],rare:[11,14],epic:[15,18]},preserveMaxHpCap:true,stackGroup:'enchant:shieldPower',display:'灰烬护壳、庇护圣幕的护盾量 +{value}%；原有最大生命比例上限不变，护盾不叠加。'},
  mercifulScript:{id:'mercifulScript',name:'抚伤',kind:'skill',slots:['head','relic'],skills:['saintMend'],modifier:'healPct',weight:8,range:{common:[7,10],rare:[11,14],epic:[15,18]},mpAdd:3,preserveMaxHpCap:true,stackGroup:'enchant:mendPower',display:'愈合祷言治疗量 +{value}%，额外消耗3法力；单次治疗仍不超过最大生命22%。'},
  resonantRim:{id:'resonantRim',name:'广鸣',kind:'skill',slots:['hands','relic'],skills:['graveBell','saintNova'],modifier:'radiusPct',weight:9,range:{common:[8,11],rare:[12,16],epic:[17,20]},damageMultiplier:.92,stackGroup:'enchant:bellRadius',display:'坟钟余震、驱暗环的半径 +{value}%，伤害 −8%；最多目标数不变。'},
  quietGlyph:{id:'quietGlyph',name:'省语',kind:'skill',slots:['head','relic'],skills:['firebolt','emberLance','saintRay','ashWard','saintAegis','saintMend','graveBell','saintNova','soulBind','saintChime'],modifier:'mpFlatReduction',weight:9,range:{common:[1,1],rare:[2,2],epic:[3,3]},cdAdd:.8,minimumMp:4,stackGroup:'enchant:manaCost',display:'火矢、熔烬矛、圣辉矢、灰烬护壳、庇护圣幕、愈合祷言、坟钟余震、驱暗环、缚魂结、静心钟的消耗 −{value} 法力（最低4），冷却 +0.8秒。具体技能页显示结算后的数值。'},
  patientKnot:{id:'patientKnot',name:'从容结',kind:'skill',slots:['feet','relic'],skills:['soulBind','saintChime'],modifier:'cooldownTenthsReduction',weight:9,range:{common:[4,6],rare:[7,9],epic:[10,12]},minimumCdFraction:.85,stackGroup:'enchant:knotCd',display:'缚魂结、静心钟冷却 −{decimal} 秒。对首领仍只有减速，不延长控制时间。'},
};

export const ENCHANT_UI = {
  tabs:['选择装备','当前刻印','待选刻印'],
  header:'余烬刻印',unlockHint:'炉师用烬晶砂把地底残留的力量压入装备。每件装备能留住一道刻印。',
  brief:'属性、附伤、技能变化都会随机出现；部位不同，可出现的刻印不同。',
  rollButton:'刻下一道新纹',adoptButton:'采用新刻印',keepButton:'保留原刻印',
  paymentHint:'生成结果时扣除材料；保留原刻印也不退回。关闭后会保留这次结果。',
  unavailableSkillHint:'这项刻印不会直接教会技能。学会对应战技后才生效。',
  comparisonFields:['装备名与部位','原属性/特性保持不变','旧刻印完整数值','新刻印完整数值','影响的已学技能及当前效果','金币/材料余额'],
  neverShowAs:'putting a second random affix into the old affix field',
};
