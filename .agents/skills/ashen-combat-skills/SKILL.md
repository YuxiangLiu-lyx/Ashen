---
name: ashen-combat-skills
description: 修改 Ashen 战斗、技能、暗影流血连招、敌人 AI 或 Boss 机制时使用。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：战斗 技能 连招。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/COMBAT.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。检查 core 的最终 prototype 包装、技能消耗/激活/冷却、目标与墙体、Boss 直接伤害和 DOT 防御；按实际代码区分状态施加和消耗。修改后做真实 RPG 实验、原存档 roundtrip 和 Node 回归；涉及输入/弹丸做浏览器一致性。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。
