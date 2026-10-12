# Ashen 增量执行进度

最后更新：2026-10-12。中断恢复先读 `AGENTS.md`、本文件、`git diff` 和未跟踪文件，先 `task.py list`。回滚任务已完成；重构任务按用户要求暂停，不得自动接续。保留其他任务与历史证据。

## 当前目标与范围

2026-10-12当前任务 `ch1-voice-20261012`：采用章稿0.5，柔和圣女默认立绘，接委托后的薇蕾娜/鲁恩私下对话，删除新增匿名神秘人；实现8cd49f8及全部本轮验收通过，常用离线包更新并保留旧包；完整验收dab57a7已推送GitHub main并ls-remote核对；任务完成归档，未发布网站。下方0.4匿名黑影规则为历史，第二章仍只策划。

2026-10-11前两章人物与缺陷修复 `ch12-portrait-bugs-20261011`：已知幕后人物恢复原立绘，匿名兜帽/披风黑影固定深色；第二章章界经验金币只结算一次。26场263行/15角色/三视口、18图221路径/48帧/完整对白、18章节回归、fast28、integration及离线HTTP手机包均通过。实现c6980d5、完整验收bdbb15a已推送main并ls-remote核对；常用包已更新且旧包保留，任务归档。验收docs/ch12-portrait-bugs/ACCEPTANCE.md；旧图/对白/地图与暂停重构保留。

2026-10-11章节测试 `chapter-test-20261011`：八章直接进入、各章独立保存、免伤/命中秒杀、跳过当前主线和对白已完成。最终fast28、integration76与浏览器/地图回归、新功能7组与八章UI、离线/HTTP/手机包全部通过；正常存档与原图/118图/99任务/518对白保持。实现95d1bde、完整验收ed193e1已推送main并ls-remote核对；常用离线包已更新且旧包保留。任务完成归档，原站未发布。验收见docs/chapter-test/ACCEPTANCE.md。

2026-10-11入口修复 `ch1-launch-recovery-20261011`：用户运行未见回改。发现默认qa-export/release-build仍为旧0.3，而已验收0.4在另一目录；已校验并提升至原默认路径，旧包另存且别名保持，未改运行代码/存档。fast28及默认入口离线/HTTP/移动端实测通过，旧档恢复与黑影对白已核验；bc2be23已推送main并核对，任务已归档。用户实际地址尚未提供，不声称已确认其具体入口。验收见docs/ch1-launch-recovery/ACCEPTANCE.md。

当前任务 `ch1-dialogue-cleanup-20261010`已完成并归档：0.4实现与全部验收通过，fdffaca已推送GitHub main并ls-remote核对，任务记录位于archive；交付回执见docs/ch1-dialogue-cleanup/GIT_SAVE.json。保留0f3c9f9的人物/地图/交互优化，撤下新增全屏分镜和现行Harness设计；幕后改原对话框＋黑影，未知人无身份标签，每人一句。009集成、008浏览器通过；只改打包测试等待后013/014核验复用，最终011 fast28、012 dialogue9、015离线/HTTP/移动端、016三维通过。失败日志和范围限制落盘docs/ch1-dialogue-cleanup/ACCEPTANCE.md。原动作/对白/任务/奖励及保留文件哈希相等；旧H2六行游标兼容。下方0.3完成记录为修改前历史。


第一章0.3局部增强 `ch1-pilot-r2-20261010` 与V29历史收尾已完成本地验收并保存GitHub main（49614e0，ls-remote已核对），任务归档。第二章只策划；旧0.1/0.2大重构任务继续暂停。

保留中断起点5a156c6的审计/冻结/有效改动；c502534保存三张追兵图集，232cd31保存实现。补齐演出资源与两短场/存档/回看，三类独立追兵48帧同等成人体量；修复井沿旧目标落在碰撞内，仅目标南移35px。原118图/对白/任务/数值哈希保持。

最终指纹9b273efd：fast27；integration76回归/14组完整事件/35图；chapter01专项15含新8；18图221路径、16演出、3视口；新游戏标题至水渠（追缉官尝试loss）；离线/HTTP/移动端打包全部通过。三维已分别看图并核验。V29四图实际返程/交付/重载与12项world通过，RELEASE补齐114图后续优先级。资源、失败和成功日志、限制落盘docs/ch1-pilot-r2与docs/v29；原站未发布。

下方手写历史计划仅追溯；以各任务状态及最新区块为准。

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

<!-- task:ch1-pilot-r2-20261010 -->
## 任务 ch1-pilot-r2-20261010
- 状态：complete
- 更新：2026-10-10T10:34:41.832629+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/ch1-pilot-r2-20261010.json
- 已完成：两章全文与主支线、最终对白、真实12图、原提交和知识边界已审计；334文件基线与浏览器检查通过；用户已明确选0.3局部方案，第一章DEV_FROZEN，第二章SCRIPT_READY；原任务对白/118图/任务定义哈希、三职业逐句及跳过结果、228处旧pending恢复、12幕后游标续播、回看零奖励等7项逻辑专项通过；原Git工作区和任务证据已恢复；三张追兵原图检查点c502534；三张缺失剧情图已补入本地；不重做已完成审计和基线；三种追兵原画独立16帧已接入，成人身高统一；缺失动作A/B与三处感应图补齐，局部连通像素分帧清除邻帧剑尖；保留所有原图与生成记录；缺图/分帧/回看章卡已修；H1/H2和12镜头接入，井沿点击修复；18图221条实际移动路径无未验证，48帧、16演出画面、3尺寸低动效和继续按钮通过；integration通过27 Harness、76 Node、16通用浏览器、14一致性和35图回归；连续新游戏013通过：标题到鼠患/委托H1/道路/圣女切镜/刺杀H2/小巷/水渠；追缉官战斗尝试为loss，不冒称通关。；最终指纹9b273efd上fast(27 Harness)、chapter01(15项含新8)、chapter01-browser(18图221路径48帧16场3视口)通过。；18图实际场景/碰撞图与48帧原画分别人工复核；三维门禁018通过；井沿修复、磨坊6格装饰孤岛和灰桥旧布局局限写明。；最终指纹9b273efd全部必需检查完成：fast27、chapter01 15、18图221路径/48帧/16镜头/3视口、连续新游戏、release全量原件/构建/集成/打包UI；同指纹成功日志与构建资源哈希复用校验020/021通过。；49614e0已正常推送GitHub main并ls-remote核对；新增资源/完整证据/失败记录/状态均保存，未发布网站。
- 待完成：无
- 决定：开工已从0988489同步至5e289bc；发现远端0.3局部增强稿与用户本次完整重构prompt冲突，已请求范围澄清；先完整审读两章和审计稳定运行，不恢复旧试点；用户回答按仓库0.3稿，只做局部增强；保留原18行、任务、地图几何与章界；交手仅演出，不新增圣女实战；不恢复旧试点；CG遵循原礼拜厅空间，原角色母版；原任务对白保留，原文件字节不覆盖；生成资产尚待视觉与游戏内验收；用户确认重点为追兵外观、动作与整体质感；serve入口正确，前轮停于资产草稿未接入；本轮补齐0.3演出与首章护卫/追缉官独立表现，保持战斗和地图几何；2026-10-10接续：完成0.3未完工作与V29历史验收收尾；新增用户要求覆盖战斗普通兵/精锐/军官，按人物原画独立造型，统一成人身高，不恢复冻结大重构。；2026-10-10断流恢复：HEAD 5a156c6领先origin/main三次保存；保留三张已生成追兵图集与REQUESTS修改。发现演出模块引用三张缺失资源，先修复不一致，再按角色/剧情/浏览器/交付小阶段验收。已有审计与基线不重做，旧冻结任务不恢复。；浏览器首轮发现两项需修：相邻列攻击剑尖污染，以及回看fixture章卡遮挡输入；失败日志保留。town/well原锚点20px采样无可达点，原几何未改，单独核验。；井沿实测目标在碰撞内，按0.3允许范围将交互点从900,700移至900,735，绘制和存档原件不变；118图几何及任务对白仍哈希一致，针对井沿加强新旧档可达断言。；连续试玩012在刺杀第14行动段触发旧140次循环时限；无运行异常。保留失败截图/状态，仅改90秒显式时限，断言不减少。打包测试新增实际标题回看、两段跳过与主档逐字不变验证。；标题回看结束按钮会一次跳过整个回看，打包断言据实际行为命名skip_replay。；014-fast发现新章节记录链接的QA回执尚未创建；已建立如实标注pending的QA回执，015通过；未弱化链接测试。；最终release含完整integration和packaged-ui执行。用持久verify_release.py核对同指纹成功日志、命令、原资源哈希、构建runtime哈希和UI报告再复用，避免同一最终版本重复浏览器测试。
- 阻塞：无
- 阶段 audit-and-freeze：complete；HEAD 5e289bc90d3e79a5e7d44236bb229a43b05cce87
- 阶段 original-art：complete；HEAD c502534fbdcc452bb83a48bdb7bf33132b5b1b37
- 阶段 implementation：complete；HEAD c502534fbdcc452bb83a48bdb7bf33132b5b1b37
- 阶段 recovery：complete；HEAD c502534fbdcc452bb83a48bdb7bf33132b5b1b37
- 阶段 verification：complete；HEAD 232cd31eb99b2aa3e4f42731a06b12fb4ead6105
- 阶段 review：complete；HEAD 232cd31eb99b2aa3e4f42731a06b12fb4ead6105
- 阶段 delivery：complete；HEAD 49614e0d2678d413852b2a50449e9f315d6e7d5c
- 最近检查：map-quality，退出码 0；docs/harness/evidence/ch1-pilot-r2-20261010/022-map-quality.txt
<!-- /task:ch1-pilot-r2-20261010 -->

<!-- task:v29-exploration-20261008 -->
## 任务 v29-exploration-20261008
- 状态：complete
- 更新：2026-10-10T10:34:42.019328+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/v29-exploration-20261008.json
- 已完成：四图第一轮布局、物件缩放与管路反馈实现；9项领域测试通过，水槽交互点碰撞已修复；四图现状与真实支线往返/旧档重载通过；118图原审计与114图推广优先级补齐RELEASE；world12、完整release及三维门禁通过；旧失败/布局限制保留。；V29历史RELEASE回执、当前四图证据、114图优先级与真实限制已包含于49614e0；GitHub main ls-remote核验相等。
- 待完成：无
- 决定：以四张正式渲染器基线和23项回归为起点；手工布局与短交互接入原系统，新对白ID保留旧档游标，flags.worldV29仅存线索发现；按ch1-pilot-r2最新用户授权收尾历史验收；四图实现及后续V30修改已被批准回滚基线保留，不重新实施。补失链RELEASE回执、当前四图交互/实战往返与release检查，保留旧失败和历史限制。
- 阻塞：无
- 阶段 historical-closeout：complete；HEAD 232cd31eb99b2aa3e4f42731a06b12fb4ead6105
- 阶段 delivery：complete；HEAD 49614e0d2678d413852b2a50449e9f315d6e7d5c
- 最近检查：map-quality，退出码 0；docs/harness/evidence/v29-exploration-20261008/003-map-quality.txt
<!-- /task:v29-exploration-20261008 -->

<!-- task:ch1-dialogue-cleanup-20261010 -->
## 任务 ch1-dialogue-cleanup-20261010
- 状态：complete
- 更新：2026-10-11T03:56:40.745963+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/ch1-dialogue-cleanup-20261010.json
- 已完成：已检查干净main并fetch，保存0f3c9f9的地图/对白/任务/景物/原STAGING和保留资源哈希，计划落盘。；原对话与黑影接入、匿名三句和旧游标迁移完成；九项专项通过，10个保留文件及原地图/对白/任务/STAGING哈希相等。现行分镜Harness删除，历史原件保留。；最终fast28项、dialogue9项、浏览器两完整场景/18图221路径/48帧/三视口、integration76项与14事件/35图均通过。015打包离线/HTTP/移动端通过，旧尾段实际导入/刷新/出门安全保存无重复；三维门禁通过。；fdffacae9f8625c4079130625a90ea144bb47f4d已正常推送GitHub main，ls-remote与本地HEAD相等；实现、资源归档、截图、全部成功及失败日志已保存。未发布网站。
- 待完成：无
- 决定：0.4采用原对话UI；H1保留6句，H2匿名黑影3人各一句；旧H2六行游标按组映射，明确版本避免二次迁移。；010打包UI失败是早于既有封闭战斗结束读安全存档；只修测试等待，保留运行规则。013/014逐文件及日志哈希核验复用未变的008/009检查，015核验复用010已完成构建，避免重做。
- 阻塞：无
- 阶段 baseline：complete；HEAD 0f3c9f9f08cd71befe20b22da7c74e5f6482b674
- 阶段 implementation：complete；HEAD 0f3c9f9f08cd71befe20b22da7c74e5f6482b674
- 阶段 verification：complete；HEAD 0f3c9f9f08cd71befe20b22da7c74e5f6482b674
- 阶段 delivery：complete；HEAD fdffacae9f8625c4079130625a90ea144bb47f4d
- 最近检查：map-quality，退出码 0；docs/harness/evidence/ch1-dialogue-cleanup-20261010/016-map-quality.txt
<!-- /task:ch1-dialogue-cleanup-20261010 -->

<!-- task:ch1-launch-recovery-20261011 -->
## 任务 ch1-launch-recovery-20261011
- 状态：complete
- 更新：2026-10-11T04:17:17.775440+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/ch1-launch-recovery-20261011.json
- 已完成：干净acda140已fetch/ff；默认release-build含旧c1-replay和cinematic模块，新包位于另一目录；基线与计划落盘。实际用户地址待提供。；旧默认包保留至release-build-before-dialogue-20261011，已验收0.4包经128资源/运行输入/HTML哈希核验后接入默认路径，原目录保留别名；入口文档与遗漏的WORKFLOW稿版指向已修正。；默认入口离线/HTTP/移动端实测通过；旧分镜入口消失，匿名黑影和旧尾段迁移/刷新/安全保存通过；fast28通过，截图与验收落盘。；本地常用包入口修复与实际浏览器证据已保存；bc2be236e5a928c03432c55ebc41dcf181d5c2c1已推送GitHub main，ls-remote与本地HEAD相等。
- 待完成：无
- 决定：修复已证实的默认包陈旧；用户实际地址未提供，不声称已确认其具体入口。不改运行代码、不清理个人存档、不重复此前完整集成。
- 阻塞：无
- 阶段 audit：complete；HEAD acda1409636c40ee82cbf240b5002a1b865209f1
- 阶段 entry-repair：complete；HEAD acda1409636c40ee82cbf240b5002a1b865209f1
- 阶段 verification：complete；HEAD acda1409636c40ee82cbf240b5002a1b865209f1
- 阶段 delivery：complete；HEAD bc2be236e5a928c03432c55ebc41dcf181d5c2c1
- 最近检查：entry，退出码 0；docs/harness/evidence/ch1-launch-recovery-20261011/003-entry.txt
<!-- /task:ch1-launch-recovery-20261011 -->

<!-- task:chapter-test-20261011 -->
## 任务 chapter-test-20261011
- 状态：complete
- 更新：2026-10-11T09:30:43.319943+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/chapter-test-20261011.json
- 已完成：原件归档、运行审计、基线Node和浏览器均通过；实现及验收计划已落盘；八章三职业入口、隔离测试存档、免伤秒杀与主线/对白跳过完成；7项专项通过含三职业全链及逐步存档校验；最终新功能Node7与桌面/移动端UI已通过；118图/任务/对白/景物注册数据与基线完全相等，core仅新增测试伤害下限；最终011 fast28、012完整integration、013新功能7组、014八章实际浏览器与手机操作、015三维范围门禁全部通过；当前源码与证据指纹一致；95d1bde实现检查点已保存；016干净源码构建200模块与128图片、017离线/HTTP/手机打包UI全部通过，常用路径已更新、旧包保留；运行实现95d1bde和完整验收ed193e1已推送GitHub main，ls-remote与本地HEAD相等；默认离线包/历史保留/回执/状态完成，未发布网站
- 待完成：无
- 决定：扩展已有V25/V26独立测试模式；只增加测试工具，不修改章稿、地图、正常剧情或平衡；阶段为审计基线、实现、验证交付；任务跳过在独立RPG副本执行，失败保持原会话；V26采集/交付仅本次测试调用忽略距离视线，不改地图；剧情击退与救援保持；首项失败仅为测试忽略parseSave默认游标，已修断言；010集成76回归通过，浏览器旧QA hook引用game已撤下的V26绑定失败；改为hook明确动态导入原生成器，不改原测试内容或断言
- 阻塞：无
- 阶段 audit：complete；HEAD 68d508e41a878afbb278093275cba9518fd831e8
- 阶段 implementation：complete；HEAD 68d508e41a878afbb278093275cba9518fd831e8
- 阶段 verification：complete；HEAD 68d508e41a878afbb278093275cba9518fd831e8
- 阶段 delivery：complete；HEAD ed193e1bae88bb1e58a881e856437d2d06f5f0dd
- 最近检查：packaged-ui，退出码 0；docs/harness/evidence/chapter-test-20261011/017-packaged-ui.txt
<!-- /task:chapter-test-20261011 -->

<!-- task:ch12-portrait-bugs-20261011 -->
## 任务 ch12-portrait-bugs-20261011
- 状态：complete
- 更新：2026-10-11T10:04:16.910202+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/ch12-portrait-bugs-20261011.json
- 已完成：26个前两章主要场景逐行检查及基线截图保存：普通已知人物映射正确；幕后H1错误遮为黑影，currentColor覆盖成白会改变人影；第二章重复结算经验金币已复现并红测；已知幕后人物原图分支恢复；匿名兜帽披风明确深色填充；章界结算加既有stage/ch3Started保护；新2组回归与26场263行实际UI初测通过；最终007 fast28、008章节18项、009前两章26场263行15原角色及三视口、010十八图221路径48帧两完整场景、011 integration全部通过；012人物三维门禁通过；c6980d5实现检查点保存；013干净源码构建及014离线/HTTP/手机包全部通过，原图与打包图片128项哈希不变，常用包已更新且旧包保留；实现c6980d5与完整包验收bdbb15a已正常推送GitHub main，ls-remote与本地HEAD一致；状态/截图/角色映射/原图哈希/旧包/默认入口/回执均保存
- 待完成：无
- 决定：只修前两章实际缺陷与人物对白表现；已知后台人物恢复原图；不开发第二章策划新增内容，不恢复暂停重构，不改章稿/任务/数值；第二章结算重复可额外取得100经验/35金币；只在阶段11且未进入第三章时允许发放与交接，复用已有进度标志兼容旧档；006仅旧0.4 core哈希与上一轮授权测试秒杀一行冲突；改为精确识别这一行并校验剩余核心完整旧哈希，保留旧基线及所有原世界/资源断言
- 阻塞：无
- 阶段 audit：complete；HEAD cd630f46be5f3aafdbce99147c10c5da327d6928
- 阶段 implementation：complete；HEAD cd630f46be5f3aafdbce99147c10c5da327d6928
- 阶段 verification：complete；HEAD cd630f46be5f3aafdbce99147c10c5da327d6928
- 阶段 delivery：complete；HEAD bdbb15a3a4d67aa6dbdc99ef7075ec05b41ca85f
- 最近检查：packaged-ui，退出码 0；docs/harness/evidence/ch12-portrait-bugs-20261011/014-packaged-ui.txt
<!-- /task:ch12-portrait-bugs-20261011 -->

<!-- task:serve-loading-20261012 -->
## 任务 serve-loading-20261012
- 状态：complete
- 更新：2026-10-12T06:14:39.425254+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/serve-loading-20261012.json
- 已完成：真实5174入口基线通过正常新游戏/前两章测试；注入模块请求失败复现整页空白，图片失败无可见重试。首次基线fixture在暂停自动保存前取值导致误报，已修正并保留失败日志。；本地入口共享既有加载器，源码响应禁用旧缓存；4项HTTP回归与真实5174桌面/移动端浏览器故障恢复通过，200个打包模块与原实现逐字节相同；fast含28项Harness检查通过；23项表现回归通过；4项HTTP与真实5174桌面/移动端和双故障恢复通过；打包200模块与原实现逐字节一致；实现和验收提交f060ab9已推送GitHub main，ls-remote与本地HEAD一致；修复后的5174服务已启动；当前状态与Git回执已落盘
- 待完成：无
- 决定：全新Chrome可加载原始入口：292响应无失败；用户原始卡点尚未复现。发现serve直接使用无启动提示的dist入口，并发解码全部图集；离线/打包入口已有4路加载队列与错误提示。采用共享现有启动包装，不改游戏规则与美术。；用户确认整页空白/黑屏；故障注入复现同类症状，但不声称已确定其浏览器原始网络/缓存原因。；本轮仅修改本地服务器和共享打包入口；无dist/地图/美术改动，采用fast＋HTTP＋实际CLI浏览器＋原表现回归，不执行完整release或网站发布。
- 阻塞：无
- 阶段 reproduce：complete；HEAD c195c96021b6d35105e38223b00009e6ee69acd1
- 阶段 implementation：complete；HEAD c195c96021b6d35105e38223b00009e6ee69acd1
- 阶段 validation：complete；HEAD c195c96021b6d35105e38223b00009e6ee69acd1
- 阶段 delivery：complete；HEAD f060ab99b22a1d7c004893cc2508034d328bb0e1
- 最近检查：presentation，退出码 0；docs/harness/evidence/serve-loading-20261012/007-presentation.txt
<!-- /task:serve-loading-20261012 -->

<!-- task:ch1-voice-20261012 -->
## 任务 ch1-voice-20261012
- 状态：complete
- 更新：2026-10-12T07:01:26.680827+00:00
- 下一步：No required task work remains
- 任务记录：source/tasks/archive/ch1-voice-20261012.json
- 已完成：保存26场263行浏览器基线；完整读取第一章0.4并记录0.5采用稿、逐句稿和角色知识边界；旧稿与代码保留历史；核对封面与柔和原件；11行接委托对白、柔和立绘、旧H1/H2迁移已实现；19项Node初测通过，保留迁移测试fixture失败日志；最终fast28、story20、26场263行加新11行/三视口、18图221路径48帧、完整integration、三维及真实5174都通过；实现与全部本地验收检查点8cd49f8已保存；012干净运行源码构建200模块129图；013离线HTTP手机包通过；014核验337输入与旧128图并提升常用入口，旧包保留；实现8cd49f8、完整验收dab57a7已推送GitHub main并ls-remote核对相等；原件/对白/默认包与旧包/全部证据均保留；未发布网站
- 待完成：无
- 决定：当前用户授权优先于旧0.4匿名黑影条款；只取回符合封面的elyria-gentle原件，不恢复暂停重构或其他旧剧情。；新增段11行含4处简短动作/沉默旁白，薇蕾娜先问禁制再要求保护诺恩，鲁恩两次道歉；移除H2；旁白无人物占位。；迁移控制组采用相同存档和读取次数，保留完整结果深比较；无游戏规则调整
- 阻塞：无
- 阶段 audit：complete；HEAD 71dcfce51938b8d3e0a35dd803d78120bb0ce688
- 阶段 implementation：complete；HEAD 71dcfce51938b8d3e0a35dd803d78120bb0ce688
- 阶段 verification：complete；HEAD 71dcfce51938b8d3e0a35dd803d78120bb0ce688
- 阶段 package：complete；HEAD 8cd49f8ea6b922b85d8306f4ce409e8f1a21dd8c
- 阶段 delivery：complete；HEAD dab57a758979d7905ba4f351877c6097385f6f97
- 最近检查：package-promote，退出码 0；docs/harness/evidence/ch1-voice-20261012/014-package-promote.txt
<!-- /task:ch1-voice-20261012 -->

<!-- task:c1-expansion-20261012 -->
## 任务 c1-expansion-20261012
- 状态：in_progress
- 更新：2026-10-12T09:21:01.799747+00:00
- 下一步：重新真实输入避险并继续零支线主线，逐段观察截图
- 任务记录：source/tasks/active/c1-expansion-20261012.json
- 已完成：Git干净、fetch核对38bf430、独立分支、需求和两章及相关领域规则已读；完整需求、两章路由、0.5原稿、118图清单、改前全部dist哈希已保存；0.6从SCRIPT_READY采用为DEV_FROZEN；机器奖励/配方/掉落数据已写；123图与schema16接入；十二主线支线和制作精英事务初步实现；31项状态/制作/精英/0.5保护回归通过；原118图几何保护及新目标可达扫描通过
- 待完成：真实输入三职业前两章；支线玩法与四经济路线；真实快照Lab；地图角色审阅；内容门禁与标准全部检查；构建GitHub
- 决定：采用新授权0.6；保留0.5刺杀与幕后、第二章0.3仅策划、旧重构继续暂停；六阶段按用户Prompt推进；基线子命令全部退出0，但期间新增未接入模块使sources_changed_during_check=true，仅作改前运行证据，不作最终门禁；最终需重新验证；真实输入影刃首轮到训练：六鼠/委托通过，避险脚本在预警尾段启动失败；保留009失败及截图，不计通关。新场景错误书柜贴图已换成器械、石墩与水槽。
- 阻塞：无
- 阶段 specification：complete；HEAD 38bf430a05422030d4a7ddf37e115160b3b2fe70
- 阶段 main-route：in_progress；HEAD 38bf430a05422030d4a7ddf37e115160b3b2fe70
- 最近检查：expansion-state-recheck，退出码 0；docs/harness/evidence/c1-expansion-20261012/010-expansion-state-recheck.txt
<!-- /task:c1-expansion-20261012 -->
