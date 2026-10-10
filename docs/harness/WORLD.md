# 地图与资产约束

world/各 chapter-world 配置及 scene-geometry、presentation-physics 控制真实地图/足部碰撞；visuals/art/actor-art/equipment-art 控制绘制。地图表现任务默认不改战斗或经济。118地图和封锁出口基线在 tests/fixtures/v28-navigation.json；原本锁住的出口不能改成新增问题，也不能通过更改基线掩盖回归。

脚底排序、家具 ID、门框可通行间隙、患者搬运、坐席例外、同伴步距与真实敌人物种须保留。5张 V281衍生图使用原帧坐标；docs/v28.1/ASSET_MANIFEST.json 记录来源和哈希。原图在 archives/runtime-assets 分卷，恢复脚本拒绝覆盖已修改文件。新图必须保存字节、生成说明和角色/场景对应，不只留临时 URL。

已有回归包含图集哈希、正式渲染器画廊、地图和章节回放；它们不是完整八章人工通关。改动资产后检查 preload/HTML/离线构建与引用完整性。

每次地图改动独立执行[三维验收](MAP_QUALITY.md)。前三章最终布局由 spatial-world-v30 在全部历史注册之后装配，spatial-design-v30声明空间用途/路线/交战留白/地形/NPC岗位，spatial-ground-v30复用同一地形。禁止修改旧补树器后误以为改变了最终地图；检查core安装顺序。旧几何原件保留于docs/chapter123-spatial/BASELINE_MAPS.json；授权重构的35图用新真实可达/实体阻挡/实战检查，其他83图保留旧导航断言。

第一章重构试点的用户方向是地图场景全面优化，详见 [CHAPTER_01](CHAPTER_01.md) 与 [开发 prompt](CHAPTER_01_DEVELOPMENT_PROMPT.md)。该任务可以重设计第一章地图布局、场景构图与必要通路，不受旧 V30“仅表现、几何不变”的历史范围限制。先列本章地图清单与空间契约；旧导航基线保留作对照，将获授权的变化逐项记录并建立新的可达性验收，不能静默改断言或影响其他章节。地图平面与剧情背景图必须使用同一门窗、祭台、家具、人物位置及退路依据。
