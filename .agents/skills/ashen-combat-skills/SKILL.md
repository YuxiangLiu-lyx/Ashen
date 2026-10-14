---
name: ashen-combat-skills
description: 修改 Ashen 战斗、技能、暗影流血连招、敌人 AI 或 Boss 机制时使用；也用于战斗成长和培养对照设计。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：战斗 技能 连招。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/COMBAT.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。检查 core 的最终 prototype 包装、技能消耗/激活/冷却、目标与墙体、Boss 直接伤害和 DOT 防御；按实际代码区分状态施加和消耗。修改后做真实 RPG 实验、原存档 roundtrip 和 Node 回归；涉及输入/弹丸做浏览器一致性。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。

战斗成长、怪物岗位与连续遭遇设计时按需读 [RPG内容设计](../../../docs/harness/RPG_DESIGN.md)。用同一真实存档比较三职业初始武器零加点、普通行装、仅拥有物品的优化行装；群战、连续地图、精英分开验收，记录承伤、用药、法力空窗和预警回合。升级恢复和重复入图收益不可从实验中隐去。普通故障修复不因此加载全游戏资料。
