# Ashen 增量执行进度

最后更新：2026-10-10。中断恢复先读 `AGENTS.md`、本文件、`git diff` 和未跟踪文件，先 `task.py list`。回滚任务已完成；重构任务按用户要求暂停，不得自动接续。保留其他任务与历史证据。

## 当前目标与范围

本轮 narrative-incremental-20261010：只修订前两章剧情记录、局部增强prompt与harness；不改运行代码/图片。当前采用0.3，区别于已回滚试点的冻结0.2。第一章保留任务对白、拓扑和章界，只优化地图交互表现、少量隐藏短场及刺杀封术演出；交手是剧情动作，第二章只记录。

已接收最新GitHub回滚提交0988489：运行恢复1cefe80，重构现场6b388c7及相关暂停任务完整保留。此新需求不恢复这些任务。本轮起点曾为60d8，远端保存前发现回滚提交并正常合入；资料须在最新回滚基线上重新核验。

## 历史目标（保留现场）

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
- 状态：paused
- 更新：2026-10-10T05:58:36.899918+00:00
- 下一步：用户已回滚V30；仅在重新明确授权重构时恢复。完整现场：6b388c7。
- 任务记录：source/tasks/active/ch123-spatial-20261009.json
- 已完成：真实基线通过；35图完整数据、最终覆盖、碰撞来源、灰桥原图和人物原画已审计并落盘；三维独立报告/源码与资源证据哈希/改动覆盖门禁已实现；21项Harness回归通过
- 待完成：35图结构审计及差异化修复；灰桥连接与任务可达；野外交战走位/追击/技能实测；士兵精锐军官独立资源与原画审查；NPC岗位行为；旧档与剧情兼容；三维门禁及集成/画廊证据；GitHub main保存
- 决定：灰桥主路安全通行，保留原有南沟危险支路与任务；所有旧图/原画保留；2026-10-10 用户明确回滚到1cefe80；原实现与未完成验收保留，不再自动继续。
- 阻塞：无
- 阶段 audit：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 阶段 quality-harness：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 最近检查：integration，退出码 0；docs/harness/evidence/ch123-spatial-20261009/016-integration.txt
<!-- /task:ch123-spatial-20261009 -->


## 2026-10-09 新授权：第一、二章整体重构与封面圣女立绘

用户已确认两项一并推进。当前分支保留并接续空间重构，独立worktree仅保存了画像基线，后续统一在主工作区集成。阶段：正史/运行审计→第一章→第二章→演出/人物资产→地图三维与任务/存档/跳过验收→GitHub保存。当前两章14场61行对白精修、关键镜头、4张正式资源、存档迁移、跳过与奖励重试修复已实现。第一二章任务链及89项Node回归通过；最后集成与三维视觉复核进行中。

<!-- task:ch12-epic-20261009 -->
## 任务 ch12-epic-20261009
- 状态：paused
- 更新：2026-10-10T05:58:36.905256+00:00
- 下一步：用户已回滚V30；仅在重新明确授权重构时恢复。完整现场：6b388c7。
- 任务记录：source/tasks/active/ch12-epic-20261009.json
- 已完成：最终两章对白和staging快照、历史冲突、因果台账和分阶段方案落盘；14场对白精修、关键镜头、圣女双表情正式资源、旧档文本迁移与一次性结算修复；两章任务链专项通过；35图421条路径、8实战、48人物帧通过，重点修正仓储用途、干岸树位与旧雾叠层
- 待完成：最终全套验收和GitHub保存
- 决定：保持实际正史、演员及动作行号；补抓重复ch2_end奖励的真实缺陷；2026-10-10 用户明确回滚到1cefe80；原实现与未完成验收保留，不再自动继续。
- 阻塞：无
- 阶段 audit：complete；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
- 阶段 narrative：complete；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
- 阶段 spaces：complete；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
- 最近检查：integration，退出码 0；docs/harness/evidence/ch12-epic-20261009/017-integration.txt
<!-- /task:ch12-epic-20261009 -->

<!-- task:saint-cover-20261009 -->
## 任务 saint-cover-20261009
- 状态：paused
- 更新：2026-10-10T05:58:36.910247+00:00
- 下一步：用户已回滚V30；仅在重新明确授权重构时恢复。完整现场：6b388c7。
- 任务记录：source/tasks/active/saint-cover-20261009.json
- 已完成：封面身份与当前立绘已审计；真实基线、4张正式资源和生成记录保存
- 待完成：基线、封面衍生立绘、接入、浏览器验收和GitHub保存
- 决定：独立worktree保存，不混入主工作区未完成地图改动；先完成明确的圣女替换需求；2026-10-10 用户明确回滚到1cefe80；原实现与未完成验收保留，不再自动继续。
- 阻塞：无
- 阶段 audit：complete；HEAD db78728e39f2dae3c7f17abefc3f7cc2a6f98f56
- 最近检查：packaged-ui，退出码 0；docs/harness/evidence/saint-cover-20261009/008-packaged-ui.txt
<!-- /task:saint-cover-20261009 -->

<!-- task:ch1-pilot-20261010 -->
## 任务 ch1-pilot-20261010
- 状态：paused
- 更新：2026-10-10T05:58:36.915228+00:00
- 下一步：用户已回滚V30；仅在重新明确授权重构时恢复。完整现场：6b388c7。
- 任务记录：source/tasks/active/ch1-pilot-20261010.json
- 已完成：现场1f1a928已保存；合并60d8a2e；全文审读两章；第一章0.2冻结，第二章只策划
- 待完成：合并远端章稿；审计冻结；地图与剧情；战斗与迁移；原创资产；集成验收与保存
- 决定：保存开工已有未提交改动为独立现场检查点；第二章既有实现保留，本次新章稿不实装第二章；2026-10-10 用户明确回滚到1cefe80；原实现与未完成验收保留，不再自动继续。
- 阻塞：无
- 阶段 preserve-sync：complete；HEAD a8f3fc2956594e5162fae21996a11f057d924ea5
- 阶段 implementation：in_progress；HEAD a8f3fc2956594e5162fae21996a11f057d924ea5
- 最近检查：baseline，退出码 0；docs/harness/evidence/ch1-pilot-20261010/001-baseline.txt
<!-- /task:ch1-pilot-20261010 -->

<!-- task:narrative-harness-20261010 -->
## 任务 narrative-harness-20261010
- 状态：complete
- 更新：2026-10-10T05:11:30.729639+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/narrative-harness-20261010.json
- 已完成：长期愿景按三层记录；分卷分章登记与流程齐全；前两章逐场稿与第一章prompt已保存；最终fast通过24项；索引281文件无问题；剧情审稿问题已校准；dist与tools未改；策划/harness内容已保存GitHub main并ls-remote核验b6a35a5；元数据回执将随最终保存
- 待完成：无
- 决定：本轮只改harness与设计文档；开发prompt先记录两章后仅实现第一章；长期愿景可选而非默认必读
- 阻塞：无
- 阶段 planning：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 阶段 verification：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 阶段 delivery：complete；HEAD b6a35a5d306f4e162f12f2f091163cd3fadbe77b
- 最近检查：verification，退出码 0；docs/harness/evidence/narrative-harness-20261010/003-verification.txt
<!-- /task:narrative-harness-20261010 -->

<!-- task:rollback-v30-20261010 -->
## 任务 rollback-v30-20261010
- 状态：complete
- 更新：2026-10-10T06:11:16.588573+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/rollback-v30-20261010.json
- 已完成：全部未提交与未跟踪重构现场保存为6b388c7；安全分支backup/reconstruction-before-rollback-20261010；基线索引三个未映射试点模块已记录；dist逐文件恢复1cefe80；恢复对应历史测试断言；新版Harness与章稿保留；重构新文件移至历史目录，四个任务暂停；334文件完全匹配目标；26个归档原件哈希匹配；27项Harness、76项Node、16项通用浏览器、14组战斗一致性、35图/6交互/77姿态/2演出及磨坊实战往返通过；离线file、HTTP与移动端UI全部通过；35图碰撞/截图、角色原画与77姿态已复核；三维回滚一致性记录通过哈希门禁；GitHub main已推送并ls-remote核验e3c4e36，包含重构备份6b388c7与完整回滚内容；未发布网站
- 待完成：无
- 决定：用户已明确选择恢复重构前已验收V30（1cefe80）；暂停空间、两章对白、圣女与首章试点继续开发；不发布网站；用户指定1cefe80原样回滚优先：三维通过范围为恢复一致性；旧军官共用图集、原画披风差异、旧树阵水面和town/well采样局限显式保留，不声称重构质量达标，不改门禁或旧测试
- 阻塞：无
- 阶段 preserve：complete；HEAD 6b388c7bf07b531bdf39b924ef8e6ab2b8851357
- 阶段 restore：complete；HEAD 6b388c7bf07b531bdf39b924ef8e6ab2b8851357
- 阶段 verification：complete；HEAD 4571029438993d346c101dfc5d12c3a23b60fbd6
- 阶段 delivery：complete；HEAD e3c4e360725e9d1611bd9aa3a9785b086356eda6
- 最近检查：github-verify，退出码 0；docs/harness/evidence/rollback-v30-20261010/011-github-verify.txt
<!-- /task:rollback-v30-20261010 -->

<!-- task:narrative-incremental-20261010 -->
## 任务 narrative-incremental-20261010
- 状态：complete
- 更新：2026-10-10T06:29:48.605589+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/narrative-incremental-20261010.json
- 已完成：所有当前harness入口已撤销全面重构授权；新版prompt已收缩；第二章0.2记录与现有17幕状态回放已落盘；前两章0.2完整主线引用与增量稿、12镜头刺杀演出、2段章1短幕后与章2未来2窗口已审稿；范围入口已统一；fast24项通过；索引281文件无问题；6路由探针与链接版本检查通过；dist/tools/tests差异为空；已正常合并最新回滚0988489；运行保持1cefe80，保留6b388c7现场、暂停任务和三维验收规则；合并后fast27项通过；286文件索引无问题；334运行文件与回滚目标1cefe80完全一致，26撤回原件已核验保留；0.3局部策划与harness已保存GitHub main，fetch与ls-remote核验eb332bc；保留最新回滚与暂停历史，运行未改
- 待完成：无
- 决定：交手仅剧情演出，保留任务奖励、原18行刺杀对白与原章界；只读状态回放不代表完整游玩；独立审查修正取消接应/从未派出及未存在的亲口承诺；旧0.1要求由0.2替代；变更仅资料、路由和状态证据；不将当前章2固定场景回放当新游戏通关；新局部稿升0.3以区别已回滚冻结0.2；原有0.2测试属于合并前，不作为最终验收；新的27项验收替代合并前24项为本轮最终结果；旧PARITY回执字节保持，新对照证据另存
- 阻塞：无
- 阶段 planning：complete；HEAD 60d8a2eb1bee55f069ca6190d278e7bb6f5abf2f
- 阶段 verification：complete；HEAD 71521251c27bacc1f0cceb09ca41ae9a6fce3e7d
- 阶段 sync：complete；HEAD 71521251c27bacc1f0cceb09ca41ae9a6fce3e7d
- 阶段 delivery：complete；HEAD eb332bc4ec887722238f97da8d94f9a0695d9ff7
- 最近检查：verification，退出码 0；docs/harness/evidence/narrative-incremental-20261010/006-verification.txt
<!-- /task:narrative-incremental-20261010 -->
