---
name: ashen-quests-economy
description: 修改 Ashen 任务奖励、经验金币、价格、制作、材料、掉落或第五章经济时使用。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：第五章任务奖励。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/ECONOMY.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。查配置和真正 claim/pay/handleHellDeath 入口；覆盖领取重试、资源不足、满包、分层掉落和章节 RNG。经济实验使用真实运行方法，说明路径的资源和任务前置假设。无需默认加载全文剧情/美术。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。
