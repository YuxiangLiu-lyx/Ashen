---
name: ashen-story-characters
description: 修改 Ashen 剧情、对白、章节文本或角色关系与知识边界时使用；也用于章节节奏与地点触发设计。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：剧情 澄璃 对白。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/STORY.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。按具体场景 ID 检查当前文本覆盖、触发、pending 行号迁移、知识边界与 staging。历史候选稿和 FUTURE_ONLY 不能覆盖现行剧情。保留第八章小立绘与对白，做章节/演出回放；需要视效时跑真实浏览器。

人物对白、日常、NPC事件、争执/情感/政治对话、伏笔与剧情交接，均执行 [叙事流程](../../../docs/harness/NARRATIVE_WORKFLOW.md) 和 [工具与数据说明](../../../docs/harness/NARRATIVE_HARNESS.md)。context.py 自动按人物/章节选择资料；用 --scene 定时点，可重复闲聊还需 --at。没有时点时查调用者，不默认最后状态。读取相关完整人物档案、本章及必要相邻章、状态差异、双向关系、各自知识和揭露上限；未登记部分先补来源。

写作前读 [中文对白规范](../../../docs/harness/DIALOGUE_STYLE.md) 和 [风格样本](../../../docs/harness/DIALOGUE_STYLE_SAMPLES.md)。正常完整交流是默认；短句、停顿、华丽语言均由人物与情境决定。样本是STYLE_ONLY，不把其事件、物品、经历或关系进展转成正史。诺恩能观察和解释，不是木头或情场高手；薇蕾娜能正常谈事务，不句句调情；艾莉娅的善良与反抗来自具体经历。

写入剧情后同步事件差异、获知者与伏笔，重新索引并执行 narrative 检查。来源漂移须先核对后 acknowledge 并写原因，不能用重建索引消除矛盾。保存 context、带事实标注的 draft、七维编辑审查，用 task.py narrative 挂入任务；finish 对实际剧情改动检查资料新鲜度。编辑判断由执行 Agent 完成并记录依据，不额外要求用户逐句批准。没有改运行剧情的 Harness 维护任务只需数据与工具验收。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。

第一章0.6开发按[扩充规格](../../../docs/harness/CHAPTER_01_EXPANSION.md)核对单一数值源、事务和真实输入证据；其历史范围不覆盖根AGENTS记录的最新用户授权；后续章仍按各自独立任务实施。

章节节奏与地点触发设计时按需读 [RPG内容设计](../../../docs/harness/RPG_DESIGN.md)。先区分整备窗口与紧迫冲突，再排事件。触发核对地点/进度/在场者/视角/已看/控制权/结算与安全兜底；战斗、弹丸、已有对白和切图不能覆盖pending。必要信息不因推迟永久丢失，玩家私谈知识不传给不在场角色。普通故障修复不因此加载全游戏资料。
