---
name: ashen-quests-economy
description: 修改 Ashen 任务奖励、经验金币、价格、制作、材料、掉落或第五章经济时使用；也用于任务深度、世界服务和经济循环设计。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：第五章任务奖励。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/ECONOMY.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。查配置和真正 claim/pay/handleHellDeath 入口；覆盖领取重试、资源不足、满包、分层掉落和章节 RNG。经济实验使用真实运行方法，说明路径的资源和任务前置假设。无需默认加载全文剧情/美术。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。

第一章0.6开发按[扩充规格](../../../docs/harness/CHAPTER_01_EXPANSION.md)核对单一数值源、事务和真实输入证据；其历史范围不覆盖根AGENTS记录的最新用户授权；后续章仍按各自独立任务实施。

任务深度、世界服务与经济循环时按需读 [RPG内容设计](../../../docs/harness/RPG_DESIGN.md)。逐项检查实际过程、重复往返和世界结果；把已有事实重复计数、同NPC立即接交拆单列为审计点。购买/比较/装备/出售/休息/制作要走真实事务并验证满包、缺钱、读档与幂等；用主线/典型/完整/重复路线验证补给负担。普通故障修复不因此加载全游戏资料。
