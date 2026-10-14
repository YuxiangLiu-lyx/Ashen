# 任务物品来源核对

核对实际安装顺序：core → 各章 → V12 旅途差事 → Saga V25/V26 → 第一章扩展/体验层。不能只看 core 中旧的先捡后接逻辑。用户本轮要求以接取为专属任务物品的获取条件；原库存、任务奖励和通用制作材料保留。

| 来源 | 专属物品/计数 | 当前门禁与处理 |
| --- | --- | --- |
| 第一章目标层 | 灯油、信件、银叶草、清心苔、铜片、铆钉、绝缘丝及全部 C1_OBJECTIVES 的掉落/采集计数 | c1CreditKill 每个目标要求 active；c1PropVisible、c1SeedResources 和 useProp 共同检查已接目标。未接击杀不补记，普通怪按原规则刷新。 |
| 第一章精英 | 颚骨、筋腱、翼膜三份鉴别样本 | **本轮修复**：c1AlchemistSamples active 才登记 firstPartGranted/sample。未接首杀仍给原金币经验与装备，之后实际重新入图仍能取样。完成后不重复给。 |
| 第一章交互 | 修钟旧物、旧机芯、三型工艺核心、试作免工费券 | stone/echo 的最终 c1PropInteractive 要求对应 active；核心与券为 loom 已接交付奖励，由事务账本保证一次性。历史 core/world 的先捡后接分支被最终交互层限制。 |
| 第二章旅店 | 蓝布包连杆 pumpPole | **本轮修复**：ch2-tools 交互和 pump_take 回调均检查 pump active；未接不消耗道具点。旧版已拿连杆仍可接续交付。 |
| 第二/四章 V12 | 铜扣 v12HarnessBuckle、旧甲扣 v12ForgeJaw | damage 要求已有未领取的 V12 任务，章节仍有效，地图/敌种符合且数量未满。接取对话结束后才建进度。 |
| 第三章救治 | 白盐苔 saltMoss、乳白凝晶 milkCrystal | 医师交代结束才进入 medicine；对应采集交互只在此阶段开启，claim 防重。 |
| 第三章支线 | 缓冲铜簧 copperSpring、旧灯芯架 wickFrame | ch3Machine/ch3Ferry active 后才触发取物场景。 |
| 第三章借物 | 工坊矿灯 borrowedLamp | 在借灯对白结束时交给玩家；这是本人明确借用，归还后可再借，不是怪物随机掉落。 |
| 第五章名册 | ch5CourierPage | handleHellDeath 只在 ch5Names 进度存在且未 claimed 时累加 misses/发放，最多四页。 |
| 第六章伪装 | v25Bark、v25ReedDye、v25RiverClay | Saga 当前 task 存在、地图/propIds 相符且危险清除后，才可收集；task 在引导对白完成后创建。 |
| 第六至八章扩展任务链 | 各步骤 collect 中的采集物/战斗掉落，存于 sagaV26.active.bag | prepare 与 handleHellDeath 要求 active.phase 为 task，步骤和地图一致；未交代完时不生成目标物/掉落。useProp 再查阶段、距离、视线与一次性拾取。 |

`resonanceShard` 虽沿用旧 category:quest，实际是炼洗台制作原料；`cinderIron/soulAsh/blackGlass/emberHerb/ashGlass/ch5GoldSand/ch5LampCore/ch5Dew` 为通用制作或服务资源，可正常获得。`v9Rope` 是探索石墙时主动取用的机关工具：先读坏车与铁环的交代，再收绳开墙，没有 NPC 任务或怪物掉落。按真实用途审计，未靠更改分类标签来掩盖任务专属掉落。

旧档处理：已有物品、样本、prop.used 和领奖账本保留；不回收旧库存，不补发曾经提前击杀的样本。此次没有改变怪物掉落率、普通装备奖励或地图刷新条件。测试覆盖见当前任务日志及 `tests/dialogue-hud.test.mjs`，整章交付与原探索路线由完整集成核对。
