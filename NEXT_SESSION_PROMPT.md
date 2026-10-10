# 新任务模板

在 Ashen 仓库按 AGENTS.md 执行：<本次需求及验收标准>。
首先读取 `AGENTS.md`、`.codex/progress.md` 和 `git diff`，检查未跟踪文件，从进度中首个未完成阶段继续。代码修改前更新计划，每阶段保存代码与进度，合适时提交检查点。
若已有未完成任务，先用 `python3 tools/harness/task.py list` 和 `resume --id <ID>` 接续。完成验证、更新状态、提交并推送 GitHub main，给出证据和 SHA；保存与网站发布分开。

直接输入自然语言需求也有效，不需要重新粘贴大型 Prompt。
