# 叙事 Harness 工作分支最终只读审查

审查时间：2026-10-10。工作目录 `/workspace/scratch/62a1a0827eeb/Ashen-review`，分支 `work/narrative-harness-20261010`。本代理未修改仓库。

**状态：最终只读审查完成。最小接入方案成立；配置、索引、路由与记录一致性检查通过。第二章场 12 的旧时间导语已由根代理修正，本代理已重新读取确认。** 本轮是策划与 harness 接入，不是游戏内容已实装。

## 最终检查结论（覆盖下方历史预审）

- 长期参考保持可选：world_vision 的 rules/patterns 为空，其他模块规则没有 WORLD_VISION；普通剧情、地图和战斗路由没有加载它。链接不被自动递归加载。
- 章节记录流程明确 OUTLINE → SCRIPT_READY → DEV_FROZEN → IMPLEMENTED；冻结是采用稿版的执行记录，不是新的权限申请；STATE 明示不是自动代码门禁。
- 两章 header、NARRATIVE_ARCHITECTURE 登记表和 CURRENT_STATE.narrative_rebuild 的 ID、0.1、SCRIPT_READY 一致。implementation 为 not_started，runtime/product/deployment 变化均为 false。`git diff --name-only -- dist` 为空。
- 第一章抵达灰石驿站仅验证通行纸，第二任务信、画像与路图尚未领取；第二章前厅短谈可选，再到后屋正式领信。没有重复初次到达与核验。第一章仍是拘押、敌意、圣术被封；第二章保留目标活着、内门未开与圣女主动阻止。
- 章节 modules 是设计入口，不宣称完整定位运行触发；prompt 要求审计最终覆盖层、StoryFlow/Cinematic、staging、pending 与迁移，不能只改底层 DIALOGUES。
- 第二章明确新接应是被故意取消的承诺，与旧 exile-was-unplanned 不同，未将策划稿声称为旧运行事实。
- 数字与英文别名、带空格稳定 ID、引用 resolve 不得离开 ROOT、章稿/registry/STATE 版本状态一致性均已补齐并通过新测试。

## 工作分支实际验证

以下均为当前工作分支实测，未再次运行旧候选配置模拟：

| 检查 | 实际结果 |
| --- | --- |
| `python3 tools/harness/index.py --check` | 退出 0；Indexed 281 files，30 core installers，problems=[] |
| 新 `test_narrative_routing.py` | 6/6 通过，退出 0 |
| 现有 `test_harness.py` | 18/18 通过，退出 0 |
| 六份新文档链接 | 均位于 ROOT 内且目标存在；测试通过 |
| 两章 header / registry / STATE | ID、版本、SCRIPT_READY 一致；测试通过 |
| `git diff --name-only -- dist` | 空 |

| 路由查询 | 结果 |
| --- | --- |
| 第一章剧情 / 第1章剧情 / V01C01 剧情 | 含首章稿、流程及 prompt；不含第二章稿与 WORLD_VISION |
| 第二章剧情 | 含第二章稿与流程；不含第一章稿与 WORLD_VISION；受旧 maps 关键词影响为 budget_limited |
| chapter2 / V01C02 剧情 | 第二章设计模块命中，章稿正常提供 |
| 设计分卷分章整体架构 | 含架构登记表与流程；不含 WORLD_VISION |
| 长期世界观 | world_vision 命中，包含 WORLD_VISION |
| 优化圣女封术印演出 | story + lab，含 STORY 与流程 |
| 修改暗影流血连招 | combat，未加载新章稿与 WORLD_VISION |

这些是资料接入验证，不替代根代理 task.py 的正式任务证据，也不代表新剧情已实现或正常通关。上述测试先于根代理最后三处文本修正；根代理已告知重建索引并进行最终 fast 验证。本代理不重复全部测试。

## 发现后已修正的文本问题

第二章场 12 曾同时要求“稍早，切回刚入境”与“同夜，时间继续向后”。本代理定位并回报，根代理已删除旧“稍早”导语。本代理重新读取场 12，现只有“同夜 · 界碑内”，两人已经探索一段时间，叙事不倒回刚越界瞬间。该问题已经关闭。

本代理也通过只读搜索确认首章已补外披取得/自行穿衣动作，第二章摘要与知识表统一“门开即解印”，不附加刺杀成功条件。最终正式证据由根任务记录。

## 非阻塞边界

router 最多选择三个模块，混合查询可能挤掉某模块，而且未入选模块不进 deferred；文档已要求两章分别定位与全文读取，解决方式合理。第二章中文关键词沿用旧 maps 命中带来的额外资料，但章稿已在 contexts；无须扩大为路由算法重写。

世界观是关键词触发，不会理解全部否定意图；稳定 ID 与中文之间应留空格。文档与测试不应声称自然语言意图识别。脚本长于默认摘录预算，全文读取规则已明确。登记表“第一章终点是离开灰石驿站前”可进一步精确为“抵达、验证通行纸，但未领取第二任务信”；完整章稿已经清楚，不构成阻塞。

**没有发现尚未关闭、需要修改配置算法、扩大授权范围或加入审批的阻塞问题。**

---

## 历史预审记录（以下尚待事项已由上方最终结果覆盖）

## 当前可确认的结论

1. **长期世界观保持可选。** `world_vision` 只有 `entries: WORLD_VISION.md`、`rules: []`；story/章 modules 的 rules 只有 STORY 与短流程。AGENTS、STORY、WORKFLOW、NARRATIVE_WORKFLOW、开发 prompt 都明确按需阅读 WORLD。Markdown 链接不会被现有 router 自动递归，所以这些链接没有造成强加载。
2. **章前记录流程没有假称机器门禁。** NARRATIVE_WORKFLOW 把 OUTLINE/SCRIPT_READY/DEV_FROZEN/IMPLEMENTED 分开；DEV_FROZEN 是执行采用记录，明确不要求重复授权。CURRENT_STATE limits 明示不是自动 code gate。
3. **文档没有把新设计宣称为已实装。** AGENTS 明确首章先开发、第二章策划；STORY 和 prompt 区分本轮资料与 V30 运行事实；CURRENT_STATE 记录 implementation=not_started、runtime_changed=false、site_deployed=false。最终落盘后还需确认章稿 header、registry、state 三者一致。
4. **设计入口与运行入口的责任区分正确。** chapter01_plan/chapter02_plan 目前只提供对应策划与首章 prompt，不假称它们自动完整定位所有实际触发。开发 prompt 第 5 节明确检查最终对白覆盖层、StoryFlow/Cinematic、staging、pending 迁移，禁止只改底层 DIALOGUES。这与当前恢复运行快照的真实限制相符。
5. **首次重构范围明确。** prompt 要求先记录两章，再实施首章；第二章保持 SCRIPT_READY；允许首章必要的地图/几何改造，但要求新基线、理由和旧档迁移。未将首章任务扩大成所有后续章节改写。
6. **关键词漏路由已有补正。** story 添加圣女、薇蕾娜、封术印、演出等，预计修复旧“优化圣女封术印演出→只有lab”问题；新增五项测试覆盖两章分开、WORLD显式与负例、架构/角色别名、预算递延及新文档链接。最终结果须待索引更新后实测。

## 最终验收前应处理的事项

### 必须核对：文档状态与跨章边界

- CHAPTER_01、CHAPTER_02 落盘后，应确认两份实际稿版都是 0.1、状态 SCRIPT_READY，且与 NARRATIVE_ARCHITECTURE 登记和 CURRENT_STATE.narrative_rebuild 完全一致。不能仅因 STATE 先写了 SCRIPT_READY 就认为不存在的章稿已经完成。
- NARRATIVE_ARCHITECTURE 把第一章结束位置设为“离开灰石驿站前”，开发 prompt 也把灰石驿站纳入首章优化。这是**新文学分章**，不等同当前运行第一章离城结束；两份章稿必须明确衔接事件与 phase 映射，避免两章重复播放接头/幕后会馆或遗漏任务提交。它本身可以是合法重构选择，不能按旧 phase 自动纠正。
- 第一章稿应明确完成、开始、封印、任务提交等分别如何表达；第二章稿要明确“第二次刺杀任务”目标是否仍活着，以及薇蕾娜知道/不知道的接应层次。当前运行知识 `exile-was-unplanned` 与新安排冲突，prompt 已要求迁移，但对应章稿也必须承认基线差异。

### 建议补强：别名覆盖与测试诚实性

目前 chapter01/02 只配置“第一章/第一章节/V01C01”“第二章/第二章节/V01C02”。建议至少补 **第1章/第2章**，如需要英文使用，再补 `chapter1/chapter2/chapter 1/chapter 2`。测试至少涵盖数字写法和带空格的稳定 ID。

现有工具对 English identifier 使用 `\w` 词边界。`V01C01 剧情` 可以命中；`V01C01剧情` 因中文也属于 `\w`，不会命中固定 ID。无需为了这一点修改底层 router；可以文档示例要求 ID 与中文间空格，或增加明确组合别名。不要宣称所有编号写法均已覆盖。

`test_vision_is_available_only_on_explicit_matching_intent` 测的是**关键词匹配范围**，不是自然语言意图识别。任务“不要读取世界观”仍会触发世界观模块；文档已用“显式关键词查询”解释即可，不应声称 router 会理解否定。

### 建议补强：引用与记录一致性

新链接测试检查目标 is_file，足够发现当前缺文档；但未验证 resolve 后仍在 ROOT，也不验证 registry / STATE 的章节 ID、revision、status、prompt 引用一致。建议加小而有意义的断言：

- 路径 resolve 后属于 ROOT；只允许预期外部 HTTP 链接。
- CURRENT_STATE 的 chapter IDs、script 路径、script revision 与真实章稿和登记表一致。
- 章稿当前不是 IMPLEMENTED；CURRENT_STATE.runtime_changed=false；world_vision 不在任一 modules.rules / safety 中。
- 首章查询返回首章稿、第二章查询返回第二章稿、普通剧情/战斗查询没有 WORLD。

不需要把这些检查扩展为笨重的审批系统，也不必测试稿件的每一句具体台词。

## 尚待执行的最终只读检查

待两章落盘和根代理更新索引后：

1. 阅读六份新文档全文，比较三处状态和第一/二章衔接。
2. `index.py --check` 确认 fresh；当前生成索引之前的 stale 是编辑过程预期，不能当最终通过。
3. 分别实测“第一章剧情”“第二章剧情”“分卷分章”“长期世界观”“优化圣女封术印演出”“修改暗影流血连招”，并验证 aliases、contexts、deferred。
4. 跑 NarrativeRoutingTests 及现有 RoutingTests，记录真实子进程退出码。候选模拟或此前 baseline 路由不替代工作分支结果。
5. 核对 `git diff -- dist` 为空及产品版本没有被改，确保“未实装”声明真实。

预审未发现需改变整体方案的阻塞。后续只需补齐章稿、确认边界与状态，按最终索引/测试完成验证。
