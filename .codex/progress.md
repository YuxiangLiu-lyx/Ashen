# Ashen 增量执行进度

最后更新：2026-10-10。会话中断后先读 `AGENTS.md`、本文件、`git diff`（含未跟踪文件清单），若有未完成任务再 resume，从首个未完成阶段继续。不要重新覆盖已有工作。

## 当前目标与范围

本轮 `narrative-harness-20261010`：记录大重构的长期世界观可选参考、分卷分章架构、前两章完整策划与第一章开发 prompt，并接入 harness。本轮修改开发资料与路由，不改游戏运行代码；第一章内容由开发者按 prompt 实现，第二章先只记录剧情。章节稿未完善的远期设定不阻塞首章局部实现，冻结记录不代表用户逐句审批。详见 docs/harness/NARRATIVE_WORKFLOW.md 与下方本任务区块。

## 上轮目标与验收（历史）

完善 harness 的落盘、分阶段和中断恢复；接续前三章地图、敌人与交互物表现优化。运行代码以 `dist/` 为准，保留地图导航、存档、剧情、奖励和战斗数值。通过 fast、相关 Node/浏览器检查及 integration，保存到授权 GitHub main；本轮不发布网站。

## 起始现场（已保护并接续）

- 分支 `work/ch123-coverage-20261009`，起始 HEAD `0d4183fe55a9baf28562dd1c78196cc9deac0004`；已 fetch origin/main。
- 接续任务 `ch123-coverage-20261009`：原有 5 个已修改文件、1 个新运行模块、4 张新图集及浏览器脚本/证据已保留。原任务已有基线和35图截图；首次点击检查失败已诊断为toast取证问题，实际屋顶遮挡也已修复。
- 新任务 `harness-resume-20261009`：负责增量执行机制，不重建旧任务。
- 索引起初过期，现已重建并补齐新模块语义映射。
- 独立历史任务 `v29-exploration-20261008` 保留，不冒充本轮完成。

## 阶段

1. **已完成：现场与 harness 恢复机制。** 已保存真实基线；新增阶段检查点、进度自动落盘、限时子进程与中断记录、恢复入口；18项Harness回归通过。
2. **已完成：前三章缺口审计与修复。** 35图639景物119物件覆盖；公告栏从屋后迁到街旁，含旧档迁移；补齐剧情地图表现和图集语义；7项新增Node回归通过，118图导航不变。
3. **已完成：浏览器与集成验收。** 18项Harness、76项Node、118图导航、35图画廊、6次鼠标交互、77敌人姿态、2段剧情、遮挡和旧档专项通过；fast/integration及离线/HTTP/移动端打包UI通过，失败日志保留。
4. **已完成：交付保存。** 代码、图集、画廊、状态及QA已推送GitHub main并用ls-remote核验；本轮两任务已归档，同步回执见 docs/chapter123/GIT_SAVE.json。

## 重要决定

- “长链接报错”暂按长会话/连接中断造成状态丢失处理：减少单次长调用依赖，用持久任务、阶段检查点、明确失败/未完成状态恢复；不能承诺消除外部服务断线。
- 复用现有美术工作和原始图片；优先修复覆盖缺口，敌人只处理表现问题，不自行调整游戏平衡。
- 每完成阶段更新本文件与任务的 completed/remaining/decisions/next；逻辑完整的阶段独立提交。

## 恢复命令

```bash
cat AGENTS.md .codex/progress.md
git status --short --branch
git diff
python3 tools/harness/task.py list
# 本轮两任务已归档；新中断任务按list结果resume。历史V29任务不自动重启。
```

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

<!-- task:narrative-harness-20261010 -->
## 任务 narrative-harness-20261010
- 状态：in_progress
- 更新：2026-10-10T05:07:38.663232+00:00
- 下一步：提交并正常推送main，核验远端SHA
- 任务记录：source/tasks/active/narrative-harness-20261010.json
- 已完成：长期愿景按三层记录；分卷分章登记与流程齐全；前两章逐场稿与第一章prompt已保存；最终fast通过24项；索引281文件无问题；剧情审稿问题已校准；dist与tools未改
- 待完成：GitHub保存与远端核验
- 决定：本轮只改harness与设计文档；开发prompt先记录两章后仅实现第一章；长期愿景可选而非默认必读
- 阻塞：无
- 阶段 planning：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 阶段 verification：complete；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 阶段 delivery：in_progress；HEAD 1cefe80c8f187fceda48dd5322f90affda4e13c0
- 最近检查：verification，退出码 0；docs/harness/evidence/narrative-harness-20261010/003-verification.txt
<!-- /task:narrative-harness-20261010 -->
