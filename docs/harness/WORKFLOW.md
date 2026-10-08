# 最短开发流程

直接给 Codex 一句需求，仓库 AGENTS 和六项 Skills 会引导执行。通用 Prompt见根 NEXT_SESSION_PROMPT.md，不需要粘贴大型项目历史。

```bash
python3 tools/harness/index.py --check
python3 tools/harness/baseline.py --output qa-export/baseline-task-001
python3 tools/harness/context.py --task "修改暗影流血连招"
python3 tools/harness/context.py --task "调整第五章任务奖励" --max-files 8
python3 tools/harness/task.py list
python3 tools/harness/task.py start --id shadow-combo-001 --goal "修改暗影流血连招" --accept "保留Boss防御、旧档和无资源施法拒绝" --require core
python3 tools/harness/task.py update --id shadow-combo-001 --decision "只修改用户授权的技能行为" --next "核对调用者并验证"
# 文件改变后：重新生成，复核语义映射；过期索引会退出2，不自动假定旧映射正确
python3 tools/harness/index.py
python3 tools/harness/check.py --recommend --files dist/balance-v14.js
python3 tools/harness/task.py run --id shadow-combo-001 --label core -- python3 tools/harness/check.py --tier core
python3 tools/harness/task.py update --id shadow-combo-001 --done "验收已验证" --remaining "" --blocker "" --next "审查差异并保存"
python3 tools/harness/task.py finish --id shadow-combo-001 --summary "按任务验收完成"
```

上下文重置后执行 `task.py resume --id shadow-combo-001`。它显示目标/验收/基线SHA/模块/决定/证据/阻塞/下一步及Git状态，并核对证据哈希与基线祖先。必需检查的最新结果失败、代码已变化、检查中修改代码或还有未完成项时，finish拒绝归档。命令使用参数数组执行，不经shell；日志来自真实子进程；进行中的命令先持久化，结果未知不视为成功。任务文件原子写入，同一任务使用OS文件锁防止并发覆盖（Linux/macOS）；中断遗留日志不覆盖。任务记录不存个人游戏档。

索引保存内容SHA256、生成基线提交、静态import图、符号和core installer顺序；内容哈希决定新鲜度，不要求提交SHA自引用。文件移动、新模块/工具/Skill/规则变化都会使index失效。modules.json仅维护语义/入口/约束/关键词/测试；computed imports和prototype wrapper仍须rg检查。路由返回原因、带行号的有限摘录、遗漏到deferred的候选和限制；no_match/stale退出2。--expand只展开小模块的一跳依赖，不展开core等大枢纽。

分级验证：

| tier | 实际执行 | 用途 |
| --- | --- | --- |
| fast | 健康/索引/版本/任务证据/分卷大小、Harness unittest | 普通改动先做 |
| core | fast＋121图片相关校验＋原23项回归＋Balance Lab测试 | 战斗/经济/运行改动 |
| integration | core＋原Chrome场景/渲染器＋Lab浏览器一致性 | 跨系统或重大重构 |
| release | integration＋全部归档哈希＋现有离线构建＋真实UI文件/HTTP/移动端 | 完整发行验收，不自动部署 |

首次运行 core以上先restore_archives.py。Node22+、Python3.9+快速工具、Chrome；release验证使用Python3.13并额外安装已沿用的 `requirements-qa.lock.txt`。推荐按实际路径反向import闭包，并显式列未索引变化，不把建议当验证。CI pull_request/main实际执行fast/core/browser；release手动开启。原QA workflows保留；本Harness CI只读不写仓库/不发站点。

验收证据在 docs/harness/baseline、evidence和ACCEPTANCE.json；后续临时输出在qa-export，选定实验可复制到docs并纳入任务证据。已完成任务不默认加载；历史入口保留在history子目录。收尾按GIT_SAVE执行，源码保存与站点回执分别记录。
