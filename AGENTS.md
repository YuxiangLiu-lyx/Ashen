# Ashen Agent 入口

本仓库为《烬誓：圣女与影刃》V30（基于V29世界探索及V28.1恢复运行快照），运行代码在dist。旧文件名不能判版本；具体状态以CURRENT_STATE与验收为准。原始开发历史与最新未发布source仍缺失；保留原图、剧情、角色、地图、存档和历史原件。

增量执行：每次开工或中断恢复，首先读本文件、`.codex/progress.md`、`git diff`，并检查未跟踪文件；从首个未完成阶段继续。修改代码前先检查仓库并建立/更新进度文件，将任务拆成可独立完成的阶段。每阶段保存代码，使用 `task.py checkpoint` 更新已完成/待完成/重要决定/下一步，合适时提交检查点。任务和证据必须落盘，不仅留在会话。长检查通过 `task.py run --timeout <秒数>` 限时并记录日志；超时或断线后结果未知不能当作成功。

1. 开工先检查 `git status --short --branch`、remote、HEAD并fetch GitHub Ashen/main；保留现场，干净可快进时merge --ff-only。大型修改用分支/worktree。读README、BACKUP_STATUS、source/README、source/CURRENT_STATE.json及source/GLOBAL_PROMPT；恢复范围不能仅凭聊天记忆判断。
2. 当前用户授权决定目标；当前代码＋可重复测试描述实际行为；CURRENT_STATE及发布回执描述版本/发行；按需规则在docs/harness。历史档案仅追溯，FUTURE_ONLY不自动实装。冲突/缺失须明确报告并搜索调用者，不能猜测或把设计稿当运行事实。
3. 无论需求长短，先运行 `python3 tools/harness/context.py --task "用户需求"`。索引过期先运行index.py再复核modules.json中的语义映射。看返回原因、入口、风险、测试和deferred，预算不足用--expand/--max-files/--budget；不要默认读全剧情/美术/历史。用rg检查实际代码和覆盖关系。
4. 使用 `.agents/skills/` 中与改动直接相关的Skill，只读选中项；简单任务不触发全部Skills。跨系统、存档、重构或发布任务先写简短执行计划和验收；小改动可直接实施。所有实际改动用 `python3 tools/harness/task.py start --id <ID> --goal "需求" --accept "可验证标准"`，先list/resume已有任务避免重建状态。
5. 修改前保存真实基线；不擅自平衡游戏、不弱化有效测试、不覆盖用户/其他Agent工作。RPG安装顺序及存档是兼容边界。Lab复用真实运行规则，假设/限制明确，优化候选不直接覆盖正式游戏。
6. 用check.py --recommend读取按改动范围建议，执行fast及相关专项；重大集成做integration，完整发行做release。记录子进程结果：task.py run --id <ID> -- <命令>。失败不能写成成功，未做的检查/发行不能宣称完成。跨上下文先task.py resume及Git状态，持续更新decisions/progress/next。
7. 收尾更新CURRENT_STATE、progress、任务和docs验收；审查diff/未跟踪/ignore/staged，提交真实内容并推送授权的GitHub main，无需重复确认。禁止force push、reset --hard或clean。推送后ls-remote核对HEAD或fetch确认祖先才说已上传；失败保留本地SHA/文件并记未完成远端同步。详细资产、归档、版本与Git规则见[Git保存细则](docs/harness/GIT_SAVE.md)。GitHub保存不等于网站发布。

短命令及任务接续：[WORKFLOW](docs/harness/WORKFLOW.md)。source/tasks/active只放未完成任务，历史已完成任务按需读取。

每次修改地图必须分别验收可玩性、场景可信度、角色一致性；一项通过不能替代另一项。执行[三维地图验收](docs/harness/MAP_QUALITY.md)，保存实际游戏截图、碰撞/可达图、实战和原画对照证据。未验证/资源未完成必须显式记录；task.py finish 自动阻止缺失、过期或失败的三维证据。
