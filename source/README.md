# 当前接续入口

当前产品 V30（已按用户要求回滚到1cefe80的前三章表现覆盖版，继承V29探索与V28.1修复），运行代码在 ../dist/；CURRENT_STATE.json 记录产品/平台/发布状态，BACKUP_STATUS.md记录恢复边界。先按根AGENTS执行，不按v14文件名回退版本。

- 用户任务 → ../tools/harness/context.py → harness/modules.json语义与index.json自动依赖/内容哈希。
- 未完成任务 → tasks/active；先task.py list/resume，再对照Git现场；完成任务归档到tasks/archive。
- 按需约束 → ../docs/harness；工具/短示例 → WORKFLOW.md；数值实验 → ../docs/balance-lab/README.md。
- 叙事架构与章节登记 → ../docs/harness/NARRATIVE_ARCHITECTURE.md；剧情开发先记录对应章节 → NARRATIVE_WORKFLOW.md；长期世界观 WORLD_VISION.md 为可选参考。用户回滚大改后，0.3稿只授权第一章地图/交互表现、隐藏短场与刺杀封印演出；保留任务对白和拓扑，第二章只记录。旧0.1全面重构要求已撤销，本轮资料更新不改运行代码。
- 版本历史/原件 → ../history与../archives，默认不加载。原始完整Git祖先和最新未发布source仍缺失。

V28.1表现约束与旧QA保留在 ../docs/v28.1/，原站/网页回执保留在 ../docs/web-play/。原图由restore_archives.py还原，5张衍生图直接跟踪。GitHub保存不是站点发布。

V29当前四图范围、设计决定与实际验收见 ../docs/v29/RELEASE.md；其余114图仅审计。新状态flags.worldV29与原echo任务接续约束在 ../docs/harness/EXPLORATION.md。

V30开篇11图表现范围、即时交互、资产说明与本轮实测见../docs/v30/RELEASE.md；地图拓扑及战斗数值保持。V29原任务仍独立保留，不能把本轮验收写回成历史发行成功。

第二、三章23图V30接续见../docs/chapter23/ACCEPTANCE.md：地图地表与敌人表现推广，灰桥水壶交互坐标修复；原碰撞、出口、敌群和数值保留。

空间与对白重构已撤回；当前运行内容逐文件恢复1cefe80，存档schema15。重构历史在6b388c7和history/reconstruction-20261010保留；当前验收见../docs/rollback-v30/ACCEPTANCE.md。三维独立门禁继续保留。用户最新局部增强采用新稿0.3，不恢复旧试点任务。
