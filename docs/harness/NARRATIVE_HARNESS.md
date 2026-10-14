# 叙事 Harness：资料、检索与审查

2026-10-14，schema 1。扩展现有 Harness，游戏只被读取。原章节稿继续保存正文；新增 JSON 保存索引、来源、事件差异和知识视角。不要把结构化记录当作可脱离章稿独立改写的正史。

## 资料位置与确定程度

| 路径 | 用途 |
| --- | --- |
| `source/narrative/catalog.json` | 稳定角色 ID、称呼、八个运行章节和知识边界契约 |
| `source/narrative/characters/` | 诺恩、艾莉娅、薇蕾娜的前两章完整档案；其余角色的现行来源与明确缺口 |
| `source/narrative/chapters/R01.json`、`R02.json` | 事实、角色获知、玩家获知、事件、状态及单向关系变化 |
| `source/narrative/chapters/R03.json`–`R08.json` | 已核对的少量运行节点，`basic_runtime_only`；不是新文学章稿 |
| `source/narrative/outline.json` | 对现有架构/世界观的索引，确定、暂定、提议、未定、撤回分开 |
| `source/narrative/foreshadowing.json` | 稳定伏笔 ID、种下事件、线索、各方理解、保留信息、回收状态及未知项 |
| `source/narrative/conflicts.json` | 运行与采用稿差异、旧条款被替代、已发现文案漂移 |
| `source/narrative/sources.json`、`sources.lock.json` | 路径、锚点、来源类别、复核时哈希与维护原因历史 |
| `source/narrative/runtime-index.json` | 导入完整 RPG 后提取的场景哈希/说话人、地图NPC与实际知识标记探针；由 index.py 更新 |

`RUNTIME` 描述当前运行；`CONFIRMED` 表示用户已确定的方向，仍须看 `plane` 是否只在作者层；`ADOPTED_PLAN` 尚非运行事实；`PROVISIONAL` 暂定；`PROPOSED` 提议；`UNRESOLVED` 未知；`WITHDRAWN` 隔离保留。来源分类 `style_only` 不能支持任何正史记录。

人物的教育、童年、恐惧、身世等没有依据时保留 UNRESOLVED。声音指引是从实际场景提炼的编辑判断，不是新口头禅。轻量称谓如“巡卫”可能指不同人，不能默认是跨章共享记忆的同一人。重要人物持续写作前须补足有关状态，不能靠轻量登记跳过研究。

当前已确认：第一章0.9任务与0.5私谈在运行；第二章原路线在运行，0.3追加A/B未实施；第一章私谈的观众是玩家，诺恩和艾莉娅不在场。已记录四类差异：第二章接应解释与作者方向不同、薇蕾娜替代开门知识表滞后、旧匿名幕后表现已被替代、八鼠任务与保留委托中的“六只”不一致。它们没有被本轮偷偷改掉。

## 检索与写作

```bash
python3 tools/harness/context.py --task "重写第一章诺恩和艾莉娅的对白"
python3 tools/harness/context.py --task "重写第一章水渠离城对白" --scene chapterEnd --actor noen --actor elyria
python3 tools/harness/context.py --task "薇蕾娜与诺恩日常互动" --chapter R01 --scene sisterIdle --at contract --actor noen --actor vilerena
python3 tools/harness/context.py --task "第二章真相揭露" --scene darkExileV9 --budget 48000 --max-files 24
python3 tools/harness/context.py --task "修复地图碰撞Bug"
```

前四类任务自动提供对白规范、纯风格样本、相关人物文件、章节事实与事件状态；碰撞任务不载入这些内容。指定时点后只重放此前的必经事件，不默认采用未来成长。`--position after` 包含选中事件的结果；默认 `before`。未给时点时返回候选场景、章首下界和待定位项，`ready_to_write=false`。预算不足列出 deferred 文件/section，不能当作已读完整上下文；扩大预算或分别读取所需资料。

可重复场景使用 `--at` 表示它发生在某个主线事件之后。若角色确实完成过可选事件，用 `--completed 'R01:sisterIdle@R01:contract'` 指定发生时点；工具按时间插入，而不是把可选内容都算成章末发生。声明未来完成、跨章不匹配或不在可用窗口会失败。新场景先建有来源的事件与前置，不能随便借一个接近的旧 ID。

读取完整安装后的单场实际台词，可运行 `node tools/harness/narrative_runtime.mjs --scene contract --text`；不会只读早期覆盖表。动态公共ID必须改查具体action调用者。

完整上下文回执用下列入口生成，不受摘录预算截断。写作前保存一次；完成同步后再生成最新回执，保留旧文件，finish 验证最新资料。

```bash
python3 tools/harness/narrative.py context --chapter R01 --scene chapterEnd --actor noen --actor elyria --output docs/my-task/context-before.json
```

随后按 NARRATIVE_WORKFLOW 读本章、必要相邻章、角色完整档案和来源。工具给的是路由和状态，不能用一段摘要冒充读过全章。幕后秘密只放在 author/plan 层；`knowledge.player`、`knowledge.noen` 等分别记录 `knows / believes / suspects / heard / misunderstands`，并保留获知事件。谎言或传言被听到，不会自动变成真相。

## 数据写法与维护

章节拥有 `facts` 和 `events`。事实必须有稳定 ID、summary、truth、plane、status、sources；来源必须能定位到当前文件锚点或最终安装场景。事件有唯一 ID、scene、order、participants、sources、optional、grants、state_changes、relationship_changes。人物基础状态保持不变，用事件的局部差异恢复每一时点；关系按 A→B 分别更新，未写维度保留原值。可选事件另写 stage_window，不能仅靠文件里的排列猜发生时间。

新增人物：登记 catalog、创建完整或适当轻量档案、给明确来源；真实导出出现未登记说话人/NPC会失败。重要改变：新增事件并记录具体变化及获知者，不给全队自动同步。新事实或伏笔：补台账及本场揭露上限；只有实际展示过才能标 planted / partially_revealed / paid_off。未来回收章允许未知。废弃项保留 WITHDRAWN/abandoned，不作为新事实的证据。

先修改章稿与对应事件，再重新索引。索引会更新最终运行摘要，**不会**认可人工资料仍然正确。来源哈希漂移会继续失败；先查输出列出的文件、锚点与差异，修好受影响的人物/知识/后续章节，或在 conflicts 中明确记录未实施差异，再记录复核原因：

```bash
python3 tools/harness/index.py
python3 tools/harness/narrative.py audit --live
python3 tools/harness/narrative.py acknowledge --source scene:contract --note "说明具体修改、受影响事件及核对结果"
python3 tools/harness/index.py
python3 tools/harness/check.py --tier narrative
```

`--source` 可重复。首次初始化可用 `all`；日常维护应尽量只确认实际复核过的来源。acknowledge 仅记录人的/Agent的复核声明，不会修复矛盾、补造事实或赋予角色知识。章节旧状态通过事件和 Git 历史重建；来源确认历史在 sources.lock 中保留。

## 修改后的审查与任务门禁

`narrative.py review --draft <JSON> --output <JSON>` 检查带标注的候选对白。draft 的 schema 如下（结构示意，不是新剧情）：

```json
{
  "chapter": "R01",
  "scene": "chapterEnd",
  "position": "before",
  "actors": ["noen", "elyria"],
  "scope": {"files": ["dist/dialogue-text-v16.js"]},
  "brief": {
    "information": "本场实际传达的信息",
    "purposes": "每位说话者想做什么",
    "outcome": "保持或改变的剧情结果",
    "causality": "行动和决定的因果依据",
    "emotional_basis": "情绪及关系变化依据",
    "gameplay_handoff": "触发、动作、then、pending及存档影响"
  },
  "lines": [{"speaker": "noen", "text": "在此放真实候选台词", "claims": [], "no_fact_reason": "没有传递事实的理由"}],
  "editorial": {"reviewer": "执行编辑/Agent名称；其余七项按正文补全"}
}
```

每行 `claims` 使用 `{fact, mode}`，无事实行写 `no_fact_reason`。本场新揭露用 `disclosure:true`，仅允许本事件已登记的获知范围；`learns` 为本事件 grants 中的原样条目，表示该行之后人物才获得消息。旁白 speaker 用 `narrator`，也受玩家揭露上限约束。事实标注不是自由通行证：未发生计划、角色未知、把传言当确定事实均失败。

editorial 必须填写 `character`、`language`、`clarity`、`continuity`、`information_isolation`、`foreshadowing`、`emotion_relationship`，各项有 `verdict: pass/revise` 和具体 `evidence`。这是执行 Agent 的上下文编辑判断，不要求用户审批每句话。文风规则只提出位置和建议，允许有根据地保留长句、短句或华丽表达。

```bash
python3 tools/harness/narrative.py review --draft docs/my-task/draft.json --output docs/my-task/review.json
python3 tools/harness/task.py narrative --id TASK --context docs/my-task/context-after.json --draft docs/my-task/draft.json --review docs/my-task/review.json
python3 tools/harness/task.py run --id TASK --label narrative --timeout 180 -- python3 tools/harness/check.py --tier narrative
```

多场逐个挂接；同一 draft 路径重新挂接会替换旧引用，原回执文件应另名保留。finish 检查全部改动文件覆盖、基线之后的已安装场景变化、上下文/审查指纹、证据哈希，以及 draft 是否等于最终运行对白。动态 c1Conversation 需在 scope.dynamic_check_label 指向一个本任务已成功且指纹相同的 task.py run 专项（具体 action/quest/flags）；共享 ID 本身无法定位真实文本。文档/数据维护不改运行章稿时不需要编造候选对白。

工具的能力边界：不是中文语义证明器；未标注暗示、双关、人格魅力需要逐场编辑。少量风险词会提示遗漏标注，不能保证发现所有泄密。后六章资料是明确不完整的起点；不允许据此自动宣称长线人物状态已全覆盖。真实路径/演出/存档测试仍由现有检查承担，不能拿文件存在或文风提示代替端到端验收。
