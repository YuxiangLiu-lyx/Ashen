---
name: ashen-classes-gear
description: 设计或修改 Ashen 职业成长、属性、装备、词条、套装与 Build 时使用。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：职业 装备 词条。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/COMBAT.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。检查 stats/skillNumbers/成长和装备 ID 归一化、主副手、刻印 proc 排除及 actor.cd；查看 ECONOMY.md 的 V28 tier 和排重。比较候选 Build 用 Lab search，保留技能点/激活上限/存档兼容。设计意图先写任务 decisions，未经需求授权不改正式数值。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。
