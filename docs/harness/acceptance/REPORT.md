# Harness / Balance Lab V1 实际交付 · 2026-10-07

实现提交：5e793cb68fc5551e52543d52f4f50298840155fc。运行代码基线：a36a66153401139474edf285015aa0da89771d2c，dist/与archives/history原件无修改，产品V28.1、原平台29与发布回执保持分开。文档/验收提交以本文件的Git提交定位，不要求SHA自引用。

Harness包括14个语义系统、251个索引输入、592条字面依赖、28个core安装调用、内容哈希失效检查、带原因/预算/摘录的Router、六项Skills、原子任务与并发锁、真实退出码/日志哈希/代码版本验收门及分级CI。静态图不替代调用者或prototype覆盖检查。

最终固定源码提交的release检查通过：15项Harness、44项Node（23原回归+21 Lab）、187模块语法、116运行图与135历史原件归档、16原Chrome场景检查、14战斗配置的Chrome/Node完整事件一致性，离线文件/HTTP/移动UI。原有23测试、地图基线和剧情/美术原文没有弱化。完整命令/退出码/日志哈希及11场景对应关系见ACCEPTANCE.json，原始日志在evidence；测试过程中代码变化的004记录明确sources_changed_during_check=true，不作为最终验收。

固定种子42–61、8级暗影、dex投入21、rare装备、q/e一阶、road地图、combo策略对captain：20/20胜，中位击杀10.625秒、p90 11.3秒、平均承伤172.2。95% Wilson胜率区间下界约0.839，20胜不保证任意局面必胜。详细事件与参数在docs/balance-lab/experiments/shadow-captain；职业矩阵共180次、候选六词条共120次；候选不改正式配置。第五章partial账本真实结算1270经验、净增360金、免费打造1主武器，额外注入3金砂被单独记录，不是假装实际采集。

发现并保留的既有边界：基础bleed四层与血刃careerBleed三十层分开；V28按max(玩家等级,敌人等级)且击杀时重新算池，故高等级玩家回旧图可掉后层装备；满包V28装备按普通ID折金币。未经授权不修正这些数值行为。

新会话只需“在Ashen按AGENTS执行：修改暗影流血连招，保留Boss与旧档兼容。”自动化Router能定位core/balance/skills/enemy-ai/V28/V17/progression/growth/equipment/enchant/save保护及现行约束，默认不读历史。中途接续用task.py list/resume；完整短命令见WORKFLOW.md与NEXT_SESSION_PROMPT.md。本次没有另开独立真人/LLM Codex会话，验收证明仓库发现和接续工具可独立工作，不声称测过模型的所有执行行为。

Balance Lab未实现全八章可达/材料来源/经济路线、真实玩家能力分布、完整弹丸技能因果归因、全装备空间最优解或任意代码无限循环证明；已实现的五条经济路径是显式前置事件账本。原始未发布source/完整Git祖先/部分未引用资产仍缺失，损坏V9 zip仍原样保留；没有用重建稿充当原件。116展开原图保持未跟踪并保留，字节已在未改的校验分卷，不以忽略/删除消除提示。GitHub保存与网站发行分开，本轮没有部署站点。

远端验收：提交1013ae77a70f957542cc9b2930ffebf3b9475a9c已推送main并由ls-remote核对。GitHub Harness CI（run 37725237762）和原Presentation QA（run 37725237734）均success，原始步骤回执与日志摘录见CI.json/CI_LOG_EXCERPTS.txt。远端执行integration与20次真实实验，release手动选项未启用；完整release以本地固定实现提交回执为证。本回执提交只更新元数据与证据，251个源码/规则输入指纹与已验证版本相同。最终保存SHA通过本文件Git历史与远端main定位，GitHub保存仍不代表网站发行。
