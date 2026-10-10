# 地图与资产约束

world/各 chapter-world 配置及 scene-geometry、presentation-physics 控制真实地图/足部碰撞；visuals/art/actor-art/equipment-art 控制绘制。地图表现任务默认不改战斗或经济。118地图和封锁出口基线在 tests/fixtures/v28-navigation.json；原本锁住的出口不能改成新增问题，也不能通过更改基线掩盖回归。

脚底排序、家具 ID、门框可通行间隙、患者搬运、坐席例外、同伴步距与真实敌人物种须保留。5张 V281衍生图使用原帧坐标；docs/v28.1/ASSET_MANIFEST.json 记录来源和哈希。原图在 archives/runtime-assets 分卷，恢复脚本拒绝覆盖已修改文件。新图必须保存字节、生成说明和角色/场景对应，不只留临时 URL。

已有回归包含图集哈希、正式渲染器画廊、地图和章节回放；它们不是完整八章人工通关。改动资产后检查 preload/HTML/离线构建与引用完整性。

每次地图改动独立执行[三维验收](MAP_QUALITY.md)。前三章最终布局由 spatial-world-v30 在全部历史注册之后装配，spatial-design-v30声明空间用途/路线/交战留白/地形/NPC岗位，spatial-ground-v30复用同一地形。禁止修改旧补树器后误以为改变了最终地图；检查core安装顺序。旧几何原件保留于docs/chapter123-spatial/BASELINE_MAPS.json；授权重构的35图用新真实可达/实体阻挡/实战检查，其他83图保留旧导航断言。
