# 当前运行事实

本仓库是 V28.1 恢复运行快照。`dist/index.html` → `game-v14.js` → `core-v14.js`；旧文件名不是版本依据。`source/CURRENT_STATE.json` 记录产品、原平台和发布回执，描述行为以当前代码和真实测试为准。

`core-v14.js` 导入时注册地图、配置数据、安装章节和 RPG prototype 包装。自动提取的顺序见 `source/harness/index.json/core_installer_order`。V28 的 enemy/restore/dropCombatLoot 包装在 Saga V26 和文本迁移之后，V28.1 的碰撞包装随后安装。局部函数或原始数据表不一定是最终行为，必须检查调用者和后续覆盖。

Node 可以直接导入 RPG，无 DOM 依赖；浏览器游戏循环把 dt 截在 0.035 秒并调用 `RPG.update`。实验固定步长须在此范围内。正式游戏持有 `active/pending/transition`，剧情中不执行常规战斗。

完整原始 Git 祖先、未发布 source 设计和所有未引用历史资产仍缺失。恢复范围与损坏 V9 zip 以 `BACKUP_STATUS.md` 为准；已取回原件在校验过的 archives 分卷中。历史材料属于追溯证据，不能覆盖当前代码。
