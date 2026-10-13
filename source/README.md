# 当前接续入口

2026-10-11新增八章独立测试入口、主线步骤/对白跳过及免伤秒杀。各章测试存档独立，正式旅程不启用测试能力；详见../docs/chapter-test/ACCEPTANCE.md。原站未发布。

当前产品 V30（第一章0.7地图与任务整理DEV_FROZEN，保留0.5对白/立绘与既有后续章节），运行代码在 ../dist/；CURRENT_STATE.json 记录产品/平台/发布状态，BACKUP_STATUS.md记录恢复边界。先按根AGENTS执行，不按v14文件名回退版本。

- 用户任务 → ../tools/harness/context.py → harness/modules.json语义与index.json自动依赖/内容哈希。
- 未完成任务 → tasks/active；先task.py list/resume，再对照Git现场；完成任务归档到tasks/archive。
- 按需约束 → ../docs/harness；工具/短示例 → WORKFLOW.md；数值实验 → ../docs/balance-lab/README.md。
- 叙事架构与章节登记 → ../docs/harness/NARRATIVE_ARCHITECTURE.md；剧情开发先记录对应章节 → NARRATIVE_WORKFLOW.md；长期世界观 WORLD_VISION.md 为可选参考。用户回滚大改后，0.5稿保留人物/地图/交互优化，撤下新增全屏分镜与专用Harness设计；幕后只保留接委托后的薇蕾娜/鲁恩对白，原立绘配原对话框；新增匿名神秘人删除；圣女默认立绘改用封面柔和形象；0.6新增五图、主支线和成长系统；当前0.7进一步按用户授权重整第一章17图和击杀/掉落/采集目标，见../docs/ch1-map-quests/ACCEPTANCE.md；第二章提案仍只记录，原运行流程继续回归。旧0.1全面重构要求已撤销。当前修订记录见../docs/ch1-voice/ACCEPTANCE.md；旧0.3/0.4仅作历史。
- 版本历史/原件 → ../history与../archives，默认不加载。原始完整Git祖先和最新未发布source仍缺失。

V28.1表现约束与旧QA保留在 ../docs/v28.1/，原站/网页回执保留在 ../docs/web-play/。原图由restore_archives.py还原，5张衍生图直接跟踪。GitHub保存不是站点发布。

V29当前四图范围、设计决定与实际验收见 ../docs/v29/RELEASE.md；其余114图仅审计。新状态flags.worldV29与原echo任务接续约束在 ../docs/harness/EXPLORATION.md。

V30开篇11图表现范围、即时交互、资产说明与本轮实测见../docs/v30/RELEASE.md；地图拓扑及战斗数值保持。V29原任务的缺失回执已于2026-10-10补齐，记录现在的验收，不倒写历史发行日期。

第二、三章23图V30接续见../docs/chapter23/ACCEPTANCE.md：地图地表与敌人表现推广，灰桥水壶交互坐标修复；原碰撞、出口、敌群和数值保留。

空间与对白重构已撤回；回滚基线逐文件恢复1cefe80；其上原0.5对白修订为上一发行版；本轮0.6新增扩充，存档schema16，兼容旧档。重构历史在6b388c7和history/reconstruction-20261010保留；当前验收见../docs/rollback-v30/ACCEPTANCE.md。三维独立门禁继续保留。当前采用0.6，任务c1-expansion-20261012。源码与可玩开发包已备；人类完整观察、节奏目标和内容最终验收待完成，见../docs/ch1-expansion。旧试点任务不恢复。
