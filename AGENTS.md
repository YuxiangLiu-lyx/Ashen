# Ashen Agent 入口

RPG内容设计按需使用docs/harness/RPG_DESIGN.md；现有六项Skill覆盖成长、探索、任务、设施与节奏。task.py experience挂接分章技术证据，真人待验必须附可玩构建与观察表；旧0.6人工门禁保持独立。普通故障修复不自动加载整套体验资料。

2026-10-14当前用户授权全游戏RPG体验升级：先八章真实审计、第一章完整试点，再按章推广到现有第二至八章。需求原文docs/rpg-experience/USER_REQUEST.txt；审计docs/rpg-experience/AUDIT.md；首章新采用稿docs/harness/CHAPTER_01_RPG_EXPERIENCE.md（1.0，IMPLEMENTED；真人节奏待验）。允许重评精英、成长、空间、任务顺序与服务；旧0.1/0.2不恢复，原关键剧情、知识边界、历史证据和旧档保留。下述0.9及“第二章只策划”为本次之前的保留基线，不阻止此次明确授权的逐章改造。人工乐趣/节奏未完成时必须保留待验，不能冒充实测。

2026-10-14已授权叙事Harness升级，限工具、资料、索引与验证，不主动改运行剧情/任务/存档。以后所有人物、对白、日常/NPC事件、伏笔和认知关系任务执行docs/harness/NARRATIVE_WORKFLOW.md及NARRATIVE_HARNESS.md；context.py按章/角色/事件取状态，风格样本STYLE_ONLY。用narrative审查和task.py叙事证据门禁保存写作前上下文及修改后七维编辑判断；只改碰撞/数值不加载全部叙事。新资料不替代原章稿，未实施第二章追加与已撤回稿不能作运行正史。

当前用户进一步授权第一章0.9跨层多怪目标、互通通路、入图刷新与通用规则。采用稿docs/harness/CHAPTER_01_LAYER_RULES.md；固定游戏设定docs/harness/GAME_SETTINGS.md纳入Harness：默认主线、金叹号/灰问号/金问号、无明面爆率、自然门禁、任务无关常驻刷新。0.8以下内容为保留基线，0.6独立人工节奏验收仍待办。

本仓库当前为《烬誓：圣女与影刃》V30表现版，运行代码在dist。2026-10-10已按用户要求回滚到验收版1cefe80，撤回现场保存在6b388c7。2026-10-12用户进一步授权第一章0.7地图与任务全面整理，2026-10-12进一步授权0.8自然场景图片、NPC逐个交接与22图扩展，当前稿docs/harness/CHAPTER_01_STORY_WORLD.md；在0.6成长预算上重做17图与目标，清理点击机关，第二章以后保持。0.6人工节奏验收仍单独待完成。保留0.5：圣女默认立绘改为封面柔和形象；接委托后改为薇蕾娜与鲁恩的私下对话，删除新增匿名神秘人；保留人物/地图优化和原对话形式；前次0.3/0.4验收仅为历史；旧0.1及冻结0.2的大重构仍暂停，不能自动恢复。状态见source/CURRENT_STATE.json。旧文件名不能判版本；保留原图、剧情、角色、地图、存档、回滚与历史原件。

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

章节/剧情开发先按 [章节记录流程](docs/harness/NARRATIVE_WORKFLOW.md) 找到并记录本章稿，再实施。长期世界观与尚未完善的设想见 [可选参考](docs/harness/WORLD_VISION.md)，不要求普通任务阅读全文；分卷分章及当前稿件登记见 [叙事架构](docs/harness/NARRATIVE_ARCHITECTURE.md)。当前范围：第一章采用0.8自然图片与任务交接，22图、6新增本地NPC及支线、普通击杀8个/概率掉落/采集与接取后交互，保留0.6制作精英炼金和固定奖励；第二章只保留原运行路线与兼容回归。新增幕后只保留接委托后的薇蕾娜/鲁恩对话，采用原对话框和原立绘；删除新增匿名神秘人，旁白无占位人影；原刺杀保留原动作和对白。交手仍是原剧情动作，不新增圣女实战系统；第二章暂只策划。旧0.1及冻结0.2稿的全面地图重设计、任务重排与新非致死战斗要求已撤销。
