# Ashen 增量执行进度

最后更新：2026-10-09。会话中断后先读 `AGENTS.md`、本文件、`git diff`（含未跟踪文件清单），再 resume 下方任务，从首个未完成阶段继续。不要重新覆盖已有工作。

## 目标与验收

完善 harness 的落盘、分阶段和中断恢复；接续前三章地图、敌人与交互物表现优化。运行代码以 `dist/` 为准，保留地图导航、存档、剧情、奖励和战斗数值。通过 fast、相关 Node/浏览器检查及 integration，保存到授权 GitHub main；本轮不发布网站。

## 当前现场

- 分支 `work/ch123-coverage-20261009`，起始 HEAD `0d4183fe55a9baf28562dd1c78196cc9deac0004`；已 fetch origin/main。
- 接续任务 `ch123-coverage-20261009`：原有 5 个已修改文件、1 个新运行模块、4 张新图集及浏览器脚本/证据已保留。原任务已有基线和 35 图截图；首次新增浏览器检查失败，尚待诊断。
- 新任务 `harness-resume-20261009`：负责增量执行机制，不重建旧任务。
- 索引起初过期，已重建；还需补齐新模块的语义映射。
- 独立历史任务 `v29-exploration-20261008` 保留，不冒充本轮完成。

## 阶段

1. **已完成：现场与 harness 恢复机制。** 已保存真实基线；新增阶段检查点、进度自动落盘、限时子进程与中断记录、恢复入口；18项Harness回归通过。
2. **进行中：前三章缺口审计与修复。** 从运行注册和调用确认 35 图范围；检查已有图集映射、敌人动作、交互语义/碰撞/遮挡/点击，修复真实遗漏，保存审计与代码。
3. **待做：浏览器与集成验收。** 正式渲染器 35 图画廊、交互及旧档专项，fast/core/integration 和离线打包 UI；保留失败及重跑记录。
4. **待做：交付保存。** 更新 CURRENT_STATE、文档、任务与本文件，审查 diff/untracked/ignore/staged，提交并推送 main，核验远端 SHA。

## 重要决定

- “长链接报错”暂按长会话/连接中断造成状态丢失处理：减少单次长调用依赖，用持久任务、阶段检查点、明确失败/未完成状态恢复；不能承诺消除外部服务断线。
- 复用现有美术工作和原始图片；优先修复覆盖缺口，敌人只处理表现问题，不自行调整游戏平衡。
- 每完成阶段更新本文件与任务的 completed/remaining/decisions/next；逻辑完整的阶段独立提交。

## 恢复命令

```bash
cat AGENTS.md .codex/progress.md
git status --short --branch
git diff
python3 tools/harness/task.py resume --id harness-resume-20261009
python3 tools/harness/task.py resume --id ch123-coverage-20261009
```

<!-- task:harness-resume-20261009 -->
## 任务 harness-resume-20261009
- 状态：in_progress
- 更新：2026-10-10T01:20:17.981073+00:00
- 下一步：审计前三章表现与交互
- 任务记录：source/tasks/active/harness-resume-20261009.json
- 已完成：进度自动落盘、阶段检查点、限时命令与恢复入口已实现；18项Harness回归通过
- 待完成：最终代码上的fast复核及GitHub保存
- 决定：保留手写计划与其他任务区块；未知结果保持未通过；不自动提交或部署
- 阻塞：无
- 阶段 recovery：complete；HEAD 0d4183fe55a9baf28562dd1c78196cc9deac0004
- 最近检查：fast，退出码 0；docs/harness/evidence/harness-resume-20261009/002-fast.txt
<!-- /task:harness-resume-20261009 -->
