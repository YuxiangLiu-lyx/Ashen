# 地图与资产约束

world/各 chapter-world 配置及 scene-geometry、presentation-physics 控制真实地图/足部碰撞；visuals/art/actor-art/equipment-art 控制绘制。地图表现任务默认不改战斗或经济。118地图和封锁出口基线在 tests/fixtures/v28-navigation.json；原本锁住的出口不能改成新增问题，也不能通过更改基线掩盖回归。

脚底排序、家具 ID、门框可通行间隙、患者搬运、坐席例外、同伴步距与真实敌人物种须保留。5张 V281衍生图使用原帧坐标；docs/v28.1/ASSET_MANIFEST.json 记录来源和哈希。原图在 archives/runtime-assets 分卷，恢复脚本拒绝覆盖已修改文件。新图必须保存字节、生成说明和角色/场景对应，不只留临时 URL。

已有回归包含图集哈希、正式渲染器画廊、地图和章节回放；它们不是完整八章人工通关。改动资产后检查 preload/HTML/离线构建与引用完整性。

2026-10-10用户收缩第一章范围，旧0.1稿的全面布局、几何和通路重设计要求已撤销。当前以回滚后的地图为底稿，进一步优化地表、灯光、景物、交互物外观、遮挡和可识别性，详见 [CHAPTER_01](CHAPTER_01.md) 与 [开发 prompt](CHAPTER_01_DEVELOPMENT_PROMPT.md)。保留出口、路线、碰撞主体、任务物ID和用途；只有实证点击困难或遮挡错误才局部微调交互锚点，记录原因并验证旧档。不能把表现任务扩大为全图重建。刺杀剧情背景依据实际圣堂门窗、祭台、家具与人物位置制作，不用新画面倒逼地图搬迁。

每次实际地图/人物美术修改继续分别执行[三维验收](MAP_QUALITY.md)。当前运行恢复1cefe80，不安装已撤回的spatial重构；现场及回滚验收见[回滚记录](../rollback-v30/ACCEPTANCE.md)。这些历史现场不构成本轮恢复开发的指令。
