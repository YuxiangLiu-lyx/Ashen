---
name: ashen-story-characters
description: 修改 Ashen 剧情、对白、章节文本或角色关系与知识边界时使用。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：剧情 澄璃 对白。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/STORY.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。按具体场景 ID 检查当前文本覆盖、触发、pending 行号迁移、知识边界与 staging。历史候选稿和 FUTURE_ONLY 不能覆盖现行剧情。保留第八章小立绘与对白，做章节/演出回放；需要视效时跑真实浏览器。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。
