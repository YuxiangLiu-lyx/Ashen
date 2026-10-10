# 地图与资产约束

world/各 chapter-world 配置及 scene-geometry、presentation-physics 控制真实地图/足部碰撞；visuals/art/actor-art/equipment-art 控制绘制。地图表现任务默认不改战斗或经济。118地图和封锁出口基线在 tests/fixtures/v28-navigation.json；原本锁住的出口不能改成新增问题，也不能通过更改基线掩盖回归。

脚底排序、家具 ID、门框可通行间隙、患者搬运、坐席例外、同伴步距与真实敌人物种须保留。5张 V281衍生图使用原帧坐标；docs/v28.1/ASSET_MANIFEST.json 记录来源和哈希。原图在 archives/runtime-assets 分卷，恢复脚本拒绝覆盖已修改文件。新图必须保存字节、生成说明和角色/场景对应，不只留临时 URL。

已有回归包含图集哈希、正式渲染器画廊、地图和章节回放；它们不是完整八章人工通关。改动资产后检查 preload/HTML/离线构建与引用完整性。

每次地图改动独立执行[三维验收](MAP_QUALITY.md)。2026-10-10用户已要求回滚到1cefe80：当前运行不安装spatial-world-v30、spatial-design-v30或spatial-ground-v30，35图恢复原布局，所有118图继续执行原导航断言。空间重构源码/图片保留在history/reconstruction-20261010，真实旧现场为6b388c7。当前回滚验收见../rollback-v30/ACCEPTANCE.md。

第一章重构章稿与开发prompt仅保留为策划；本次用户指令已暂停重构，不因旧计划自动继续实施。
