# 当前接续入口

当前产品 V29（世界探索示范版，继承V28.1表现修复），运行代码在 ../dist/；CURRENT_STATE.json 记录产品/平台/发布状态，BACKUP_STATUS.md记录恢复边界。先按根AGENTS执行，不按v14文件名回退版本。

- 用户任务 → ../tools/harness/context.py → harness/modules.json语义与index.json自动依赖/内容哈希。
- 未完成任务 → tasks/active；先task.py list/resume，再对照Git现场；完成任务归档到tasks/archive。
- 按需约束 → ../docs/harness；工具/短示例 → WORKFLOW.md；数值实验 → ../docs/balance-lab/README.md。
- 版本历史/原件 → ../history与../archives，默认不加载。原始完整Git祖先和最新未发布source仍缺失。

V28.1表现约束与旧QA保留在 ../docs/v28.1/，原站/网页回执保留在 ../docs/web-play/。原图由restore_archives.py还原，5张衍生图直接跟踪。GitHub保存不是站点发布。

V29当前四图范围、设计决定与实际验收见 ../docs/v29/RELEASE.md；其余114图仅审计。新状态flags.worldV29与原echo任务接续约束在 ../docs/harness/EXPLORATION.md。
