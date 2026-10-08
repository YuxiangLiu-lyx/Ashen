---
name: ashen-art-maps
description: 修改 Ashen 美术、地图表现、碰撞、寻路、图集、动画或角色外观时使用。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：地图表现。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/WORLD.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。先区分 world/physics 与 renderer/art；保留118地图封锁出口基线、足部遮挡、搬运坐席例外和原生物种。保存原图、衍生哈希、生成说明及角色映射。执行图集/地图 Node 回归及正式渲染器浏览器画廊；不擅自改战斗经济。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。
