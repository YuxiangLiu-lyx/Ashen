# 经济与奖励约束

第五章配置在 chapter5-economy；执行在 chapter5-runtime 的 quest-claim、handleHellDeath、chapter5Action。三条支线有资源、击杀和领取条件；主线奖励在 apply 分支和 Saga 接续中，不能只汇总配置表就声称模拟整章。使用运行方法核对支付、一次性 claims、满包队列、材料消耗和领取后重试。

V28 1%是在原 loot 方法后追加的独立抽样，不取代普通掉落。storyTag/trialFloor/v11Add排除；bag/gear/pendingRewards 的同 ID 排重；每敌人只 roll 一次。tier=max(玩家等级,敌人等级)；生成时 v28Tier 可能与击杀时重新计算的掉落池不同。池只含重新计算层和前层，但不保证按章节封顶。满包普通 gear 会折10金，专属 ID 的处理须看 obtainGear 的真实判断。

章节拥有自己的持久 RNG seed，战斗用 g.rng。经济 Lab 的路径是明确列出的事件序列与资源假设；只分析真实 reward/pay/XP/loot 结算，不声称已验证任务可达、所有材料来源或八章通关。失败消耗由路径配置指定，再交给真实 potion/action 方法执行。
