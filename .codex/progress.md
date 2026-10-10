# Ashen 增量执行进度

最后更新：2026-10-09。中断恢复先读 `AGENTS.md`、本文件、`git diff` 和未跟踪文件，再 `task.py resume --id ch123-spatial-20261009`。从首个未完成阶段继续，保留其他任务与历史证据。

## 当前目标

用户授权前三章35图的结构性重构：先灰桥关道，建立有地理和社会用途的空间；改善连续移动与真实战斗；独立的士兵/精锐/军官视觉、原画一致性及岗位行为。建立每次地图变更必须分别检查可玩性、场景可信度、角色一致性的长期机制。保存剧情、任务、存档和数值规则。GitHub main已授权保存；不发布网站。

## 起始现场

- 基线 HEAD `1cefe80c8f187fceda48dd5322f90affda4e13c0`，干净且已 fetch/ff origin/main。
- 工作分支 `work/ch123-spatial-20261009`；任务 `ch123-spatial-20261009`。
- 旧任务 ch123-coverage 与 harness-resume 已完成归档；旧 v29-exploration 独立保留。
- 旧验收只证明原碰撞未变和贴图覆盖，不证明本轮结构、空间和角色质量。

## 可独立验收阶段

1. **进行中：audit。** 保存真实基线、35图数据/导航和灰桥前图；追踪布局、最终碰撞、角色原图、NPC更新和存档迁移。
2. **待完成：quality-harness。** 三维独立规则、证据格式、检查入口及回归；未知/缺失证据不能通过。
3. **待完成：bridge-space。** 灰桥道路、河岸、桥头、功能分区、岗位NPC、真实足迹与调试视图；验证入口出口任务目标、旧档。
4. **待完成：characters。** 士兵/精锐/军官独立设计及原画参考、稳定脚锚/动画/比例；真实资源验证与对照。
5. **待完成：chapter-spaces。** 推广有区别的35图空间设计，保留特定瓶颈和剧情布景；至少一野外场景真实近战/远程/追击/绕障/技能/躲范围/多敌验证。
6. **待完成：verification-delivery。** fast、integration、spatial-browser、map-quality；真实截图/碰撞图/前后对比、性能、状态和回执，提交推送main并核验。

## 已确认问题与决定

- world-v14 在旧边界规则网格补树，MAPS.blocks又累加景物和水，最终physics还补足迹；必须追踪最后覆盖，建立共享布局依据。
- chapter-one-art-v30 的 guard/captain 使用同图集和滤色/高度区别，需真实独立服装轮廓，不能用放大或换色替代。
- 本轮明确授权布局/碰撞变化；保留历史基线，旧“全图几何完全不变”断言应针对授权地图改为新的可达性/实体阻挡/兼容性验证，其他地图仍守原基线。
- 场景和角色审美不可仅靠数量或碰撞百分比自动宣布通过；分别提供实际渲染图、原画对应和审查结论。
- 不改战斗数值、奖励或剧情；安全枢纽不加怪；患者/搬运/坐席rig须保留。
- 每阶段 checkpoint、保存重要决定/剩余/下一步；适时提交。失败与未知结果原样保存。

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
- 更新：2026-10-10T02:06:42.812579+00:00
- 下一步：落实灰桥及35图空间配置和真实碰撞诊断
- 任务记录：source/tasks/active/ch123-spatial-20261009.json
- 已完成：真实基线通过；35图完整数据、最终覆盖、碰撞来源、灰桥原图和人物原画已审计并落盘；三维独立报告/源码与资源证据哈希/改动覆盖门禁已实现；21项Harness回归通过
- 待完成：35图结构审计及差异化修复；灰桥连接与任务可达；野外交战走位/追击/技能实测；士兵精锐军官独立资源与原画审查；NPC岗位行为；旧档与剧情兼容；三维门禁及集成/画廊证据；GitHub main保存
- 决定：灰桥主路安全通行，保留原有南沟危险支路与任务；所有旧图/原画保留
- 阻塞：无
- 阶段 audit：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 阶段 quality-harness：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 最近检查：quality-harness，退出码 0；docs/harness/evidence/ch123-spatial-20261009/002-quality-harness.txt
<!-- /task:ch123-spatial-20261009 -->
