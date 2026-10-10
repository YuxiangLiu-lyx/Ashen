# Ashen 增量执行进度

最后更新：2026-10-10。中断恢复先读 `AGENTS.md`、本文件、`git diff` 和未跟踪文件，再 `task.py resume --id ch12-epic-20261009`。从首个未完成阶段继续，保留其他任务与历史证据。

## 当前目标

当前主任务：用户明确授权第一、二章整体重构与封面圣女替换一并推进，接续下述35图空间工作。审计和分阶段计划见docs/ch12-epic/REVIEW_AND_PLAN.md，所有旧原件保留。

用户授权前三章35图的结构性重构：先灰桥关道，建立有地理和社会用途的空间；改善连续移动与真实战斗；独立的士兵/精锐/军官视觉、原画一致性及岗位行为。建立每次地图变更必须分别检查可玩性、场景可信度、角色一致性的长期机制。保存剧情、任务、存档和数值规则。GitHub main已授权保存；不发布网站。

## 起始现场

- 基线 HEAD `1cefe80c8f187fceda48dd5322f90affda4e13c0`，干净且已 fetch/ff origin/main。
- 工作分支 `work/ch123-spatial-20261009`；任务 `ch123-spatial-20261009`。
- 旧任务 ch123-coverage 与 harness-resume 已完成归档；旧 v29-exploration 独立保留。
- 旧验收只证明原碰撞未变和贴图覆盖，不证明本轮结构、空间和角色质量。

## 可独立验收阶段

1. **已完成：audit。** 保存真实基线、35图数据/导航和灰桥前图；追踪布局、最终碰撞、角色原图、NPC更新和存档迁移。
2. **已完成：quality-harness。** 三维独立规则、证据格式、检查入口及回归；未知/缺失证据不能通过。
3. **实现完成、最终复测中：bridge-space。** 灰桥道路、河岸、桥头、功能分区、岗位NPC、真实足迹与调试视图；验证入口出口任务目标、旧档。
4. **资源已生成并接入、帧审查迭代中：characters。** 士兵/精锐/军官独立设计及原画参考、稳定脚锚/动画/比例；真实资源验证与对照。
5. **实现与初测完成、集成待验：chapter-spaces。** 推广有区别的35图空间设计，保留特定瓶颈和剧情布景；至少一野外场景真实近战/远程/追击/绕障/技能/躲范围/多敌验证。
6. **待完成：verification-delivery。** fast、integration、spatial-browser、map-quality；真实截图/碰撞图/前后对比、性能、状态和回执，提交推送main并核验。

## 已确认问题与决定

- world-v14 在旧边界规则网格补树，MAPS.blocks又累加景物和水，最终physics还补足迹；必须追踪最后覆盖，建立共享布局依据。
- chapter-one-art-v30 的 guard/captain 使用同图集和滤色/高度区别，需真实独立服装轮廓，不能用放大或换色替代。
- 本轮明确授权布局/碰撞变化；保留历史基线，旧“全图几何完全不变”断言应针对授权地图改为新的可达性/实体阻挡/兼容性验证，其他地图仍守原基线。
- 场景和角色审美不可仅靠数量或碰撞百分比自动宣布通过；分别提供实际渲染图、原画对应和审查结论。
- 不改战斗数值、奖励或剧情；安全枢纽不加怪；患者/搬运/坐席rig须保留。
- 每阶段 checkpoint、保存重要决定/剩余/下一步；适时提交。失败与未知结果原样保存。

## 本轮实现/检查状态（接续必读）

- 已提交4551500：三维独立Harness门禁与审计基线；当前未提交实现包括4个spatial/role模块、3张PNG、渲染/地图装配/NPC岗位迁移以及新回归。
- 实际35图20px碰撞/可达扫描、26块交战留白；其他83图旧基线不变。仓库、街镇、林地、关道与地底各有用途简报；清除规则边树网格，保留原物件/任务ID与剧情rig。
- 灰桥55→15景物、14→6环境人；保留7南沟敌人，主路不会主动拉怪。真实实战发现并修复敌人进入安全查验区仍追击的问题，采用该两组敌人的显式归沟规则。
- 原画第6/8索引对照；新officer、elite独立16帧各一张；普通兵原图保留。桥图另制。原图保留，提示词GENERATION.json。48帧画廊审查发现背面帧混入下一行剑尖，已修分区，须复测新版截图。
- 当前最近完成：81项Node通过（005日志）；浏览器35图421条实际移动路径、8实战案例、48人物帧及NPC岗位通过（006日志）。之后又修正图集分区、桥前景护栏深度/碰撞和河岸表现，故需要重新跑最终检查，不能把旧结果冒充最终。
- 旧战斗精确回放因地形改变影响出生safePoint；用tests/spatial-legacy-control.mjs仅在测试中还原真实旧布局，保留36套原事件精确断言；正式游戏和Lab仍只使用新布局。新空间实战单独验证，未改战斗数值。
- qa-export/spatial-baseline-checkout 是基线1cefe80的detached工作树，用其真实RPG产生before-collision；不要删除原件或误认为当前代码。before-collision已落盘docs/chapter123-spatial。
- 视觉复核追加：移除看似空地却被整片封锁的林缘色块，林间只按树干占地碰撞；溪林河道延伸至边界；岩壁改为有高度的石质台地。修复debug截图被RAF覆盖，改为绘制当帧导出；010集成失败是新增独立桥护栏未列入旧图集白名单，补显式断言，保留失败日志。
- 后续：最终fast/integration/spatial-browser → 查看35图及48帧对比、记录三维报告/资产哈希/差异与限制 → map-quality门禁 → checkpoint/commit → main快进推送核验。运行日志与失败保留。

<!-- task:harness-resume-20261009 -->
## 任务 harness-resume-20261009
- 状态：complete
- 更新：2026-10-10T01:32:15.944968+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/harness-resume-20261009.json
- 已完成：进度自动落盘、阶段检查点、限时命令与恢复入口已实现；18项Harness回归通过；最终代码上的18项Harness回归通过；两任务进度区块保留并可恢复；GitHub main已核验包含harness实现及全部验收
- 待完成：无
- 决定：保留手写计划与其他任务区块；未知结果保持未通过；不自动提交或部署
- 阻塞：无
- 阶段 recovery：complete；HEAD 0d4183fe55a9baf28562dd1c78196cc9deac0004
- 最近检查：package-build，退出码 0；docs/harness/evidence/harness-resume-20261009/004-package-build.txt
<!-- /task:harness-resume-20261009 -->

<!-- task:ch123-coverage-20261009 -->
## 任务 ch123-coverage-20261009
- 状态：complete
- 更新：2026-10-10T01:32:15.905766+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/ch123-coverage-20261009.json
- 已完成：保留并接续上轮图集、统一映射和35图基线；完成35图639景物119交互/可破坏物覆盖；公告栏移出屋顶遮挡并兼容旧档；原118图导航与战斗基线保持；7项新增Node回归通过；浏览器35图、6次鼠标交互、77敌人姿态、遮挡和2段剧情画面初验通过；最终fast/integration、35图专项、离线/HTTP/移动端UI全部通过；画廊及QA已落盘；实现与验收已推送GitHub main，ls-remote核验9a455ef；无站点发布
- 待完成：无
- 决定：以运行注册元数据独立推导35图，包含guestroom、chamber和2秘密房；hellMemoryVillage经剧情调用确认属第四章，不按前缀猜测。统一地面/景物/交互映射，用新图集补齐实际物件，保留碰撞坐标与剧情规则。；医疗床/推车保留患者承托rig；原敌人帧复用，图集和怪物数值不混改
- 阻塞：无
- 阶段 coverage：complete；HEAD 993d7c73f969e1bac97d780c925725b756619d97
- 阶段 verification：complete；HEAD 2d991b3503268241f3931ccde53d0f4c3092a1d7
- 阶段 delivery：complete；HEAD 9a455efb34de36614d5fa7930f807227b1849eda
- 最近检查：packaged-ui，退出码 0；docs/harness/evidence/ch123-coverage-20261009/013-packaged-ui.txt
<!-- /task:ch123-coverage-20261009 -->

<!-- task:ch123-spatial-20261009 -->
## 任务 ch123-spatial-20261009
- 状态：in_progress
- 更新：2026-10-10T04:23:00.811632+00:00
- 下一步：落实灰桥及35图空间配置和真实碰撞诊断
- 任务记录：source/tasks/active/ch123-spatial-20261009.json
- 已完成：真实基线通过；35图完整数据、最终覆盖、碰撞来源、灰桥原图和人物原画已审计并落盘；三维独立报告/源码与资源证据哈希/改动覆盖门禁已实现；21项Harness回归通过
- 待完成：35图结构审计及差异化修复；灰桥连接与任务可达；野外交战走位/追击/技能实测；士兵精锐军官独立资源与原画审查；NPC岗位行为；旧档与剧情兼容；三维门禁及集成/画廊证据；GitHub main保存
- 决定：灰桥主路安全通行，保留原有南沟危险支路与任务；所有旧图/原画保留
- 阻塞：无
- 阶段 audit：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 阶段 quality-harness：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 最近检查：integration，退出码 0；docs/harness/evidence/ch123-spatial-20261009/016-integration.txt
<!-- /task:ch123-spatial-20261009 -->


## 2026-10-09 新授权：第一、二章整体重构与封面圣女立绘

用户已确认两项一并推进。当前分支保留并接续空间重构，独立worktree仅保存了画像基线，后续统一在主工作区集成。阶段：正史/运行审计→第一章→第二章→演出/人物资产→地图三维与任务/存档/跳过验收→GitHub保存。当前两章14场61行对白精修、关键镜头、4张正式资源、存档迁移、跳过与奖励重试修复已实现。第一二章任务链及89项Node回归通过；最后集成与三维视觉复核进行中。

<!-- task:ch12-epic-20261009 -->
## 任务 ch12-epic-20261009
- 状态：in_progress
- 更新：2026-10-10T04:23:00.753104+00:00
- 下一步：最终验收与保存
- 任务记录：source/tasks/active/ch12-epic-20261009.json
- 已完成：最终两章对白和staging快照、历史冲突、因果台账和分阶段方案落盘；14场对白精修、关键镜头、圣女双表情正式资源、旧档文本迁移与一次性结算修复；两章任务链专项通过；35图421条路径、8实战、48人物帧通过，重点修正仓储用途、干岸树位与旧雾叠层
- 待完成：最终全套验收和GitHub保存
- 决定：保持实际正史、演员及动作行号；补抓重复ch2_end奖励的真实缺陷
- 阻塞：无
- 阶段 audit：complete；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
- 阶段 narrative：complete；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
- 阶段 spaces：complete；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
- 最近检查：integration，退出码 0；docs/harness/evidence/ch12-epic-20261009/017-integration.txt
<!-- /task:ch12-epic-20261009 -->

<!-- task:saint-cover-20261009 -->
## 任务 saint-cover-20261009
- 状态：in_progress
- 更新：2026-10-10T04:23:39.133347+00:00
- 下一步：最终专项证据与GitHub保存
- 任务记录：source/tasks/active/saint-cover-20261009.json
- 已完成：封面身份与当前立绘已审计；真实基线、4张正式资源和生成记录保存
- 待完成：基线、封面衍生立绘、接入、浏览器验收和GitHub保存
- 决定：独立worktree保存，不混入主工作区未完成地图改动；先完成明确的圣女替换需求
- 阻塞：无
- 阶段 audit：complete；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
- 最近检查：packaged-ui，退出码 0；docs/harness/evidence/saint-cover-20261009/008-packaged-ui.txt
<!-- /task:saint-cover-20261009 -->

<!-- task:ch1-pilot-20261010 -->
## 任务 ch1-pilot-20261010
- 状态：in_progress
- 更新：2026-10-10T05:24:06.132710+00:00
- 下一步：保存现场后合并origin/main
- 任务记录：source/tasks/active/ch1-pilot-20261010.json
- 已完成：无
- 待完成：合并远端章稿；审计冻结；地图与剧情；战斗与迁移；原创资产；集成验收与保存
- 决定：保存开工已有未提交改动为独立现场检查点；第二章既有实现保留，本次新章稿不实装第二章
- 阻塞：无
- 阶段 preserve-sync：in_progress；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
<!-- /task:ch1-pilot-20261010 -->
