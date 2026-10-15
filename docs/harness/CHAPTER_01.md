# 第一章剧情记录 · 午钟之前

> 2026-10-15当前采用1.4：[克制表现与日常交流](CHAPTER_01_RESTRAINT.md)，IMPLEMENTED，任务c1-restraint-20261015；五精英攻击区分、简洁Boss预警、前三章耐久、格子交易、女性商人及救济场景，保留1.3顺序和结果。

> 2026-10-14采用1.3（IMPLEMENTED）：[试炼、回报与会馆整备](CHAPTER_01_TRIAL_FORGE.md)。本轮任务c1-trial-forge-20261014：库房救民切镜、回报后正式委托、五精英和独立终试Boss、会馆药水及随机符文/核心。以下1.2及更早稿保留历史；当前路线以1.3为准。

> 2026-10-14最新采用1.2：[熟人的关心与对白回看](CHAPTER_01_CARE_UI.md)，IMPLEMENTED，任务c1-care-ui-20261014；按本轮用户要求扩写薇蕾娜、修复地下人物立绘并改善阅读操作。1.1交接和私谈继续保留。

> 2026-10-14最新采用1.1：[任务缘由与场景内私谈](CHAPTER_01_STORY_FLOW.md)，IMPLEMENTED；任务c1-story-flow-20261014。诺恩没有预设肩伤，试炼因薇蕾娜担心而安排；私谈改到真实离场后。以下各稿保留历史，不再用肩伤或黑幕约束本轮。

> 2026-10-14新采用稿第一章1.0：[RPG体验试点](CHAPTER_01_RPG_EXPERIENCE.md)，IMPLEMENTED（技术已实装，真人节奏待验），任务rpg-c1-20261014。全游戏当前授权与分章实施见[体验审计](../rpg-experience/AUDIT.md)。以下0.9为历史运行基线，后续章节新改造逐章登记，不等于已实现。

> 2026-10-13当前采用第一章0.9：[分层任务与通用规则](CHAPTER_01_LAYER_RULES.md)，DEV_FROZEN，任务c1-layer-rules-20261013。下述0.8为保留基线。

> 历史0.8基线（DEV_FROZEN）：[自然场景与逐个任务交接](CHAPTER_01_STORY_WORLD.md)，任务c1-story-world-20261012。下述0.7为上一稿：[地图与任务全面优化](CHAPTER_01_MAP_QUESTS.md)。用户新要求替代下述0.6多步骤互动/几何保护；保留原刺杀、人物知识和成长预算。下文作为0.6主线与对白来源记录。
- 文学章节 V01C01，稿件0.6，状态DEV_FROZEN（SCRIPT_READY后采用）。
- 2026-10-12采用用户《第一章流程扩充与成长系统》；任务c1-expansion-20261012。
- [完整扩充规格、唯一奖励表、地图和验收](CHAPTER_01_EXPANSION.md)。[0.5原稿](../ch1-expansion/CHAPTER_01_BASELINE_0_5.md)保留原文与哈希。
- 本章phase0–4、第二章phase5–11不变；第二章0.3仍SCRIPT_READY，不实装其追加。

## 进入与结束

诺恩回到会馆，在库房处理六鼠和北墙漏口，向奥伦回报；薇蕾娜交付原委托，与鲁恩的私下对话保持0.5。上午她要求检查旧伤与行动状态，鲁恩记录警铃演练。诺恩在下午查清旧王道断车和安全路线，在城门外车棚落脚，翌日上午入城。罗萨用试织让他比较装备，托马只说明公开入口和维护班次。诺恩实地核对礼拜厅封门规则，走通北渠踏板，留下撤路记号。午钟前的准备不会泄露圣女腕印作用。

午钟刺杀仍采用原18行对白及动作：杀死卡德兰、阻止艾莉娅施救、封术、强迫撤离。她不因此谅解诺恩。沿chapel→alley→canal与追缉官交战，亲手开闸并在藏身处站稳。phase4仍可自愿补给、告别；最终离城确认后chapterEnd→post。

## 地区事件与短场

会馆：奥伦漏灯与旧伤照料、薇蕾娜复核、鲁恩记录；准备动机是执行任务和保命。郊外：阿林的投递道路与丢信、米拉药圃和蕾娜分支、磨坊旧机芯；每个事件留下可见结果。白榆：朵莉灯路、洛缇铜圈与机芯、罗萨受潮纹路和废窑通风、赛铎三种组织鉴定。污染仅归因于本地废液线索，不提前指定教会阴谋。

训练开场：

薇蕾娜：“刀带来。”
诺恩：“库房里试过了。”
薇蕾娜：“我没问老鼠。”
旁白：她看了眼他抬臂的动作。
薇蕾娜：“去后院。走完一遍再出门。”

训练反馈按职业与实际避险结果回应；失败可重试，不损失药品、不奖励刷靶。罗萨：“这条纹吃蓝，那条保命。先看你缺什么。”赛铎鉴定后封存样本，建议洛缇封废液槽、标记旧渠禁饮；不越过其知识边界。

## 保留场景与知识边界

## 2. 最终运行对白的真实来源

已只读导入 `core-v14.js` 后提取全局 `DIALOGUES`，不能只看 `data-v14.js` 的早期文本。实际链为基础表 → `EXPLORATION_DIALOGUES` / `DIALOGUE_REVISIONS` / `NEW_DIALOGUES` → `configureChapterData` → `polishDialogue` → `configureSecretData` → `applyDialogueQualityV9` → 第 238 行 `installDialogueTextV16` → 后续注册/覆盖。V27 的澄璃改稿不含这些首章 ID，V29 使用新 ID，V30 表现模块不改这些台词。

核对以下最终场景的文本均等于 `DIALOGUE_TEXT_V16`：`intro`、`ratAccept`、`ratDone`、`aside`、`contract`、`saintBrief`、`watch`、`assassination`、`canalStart`、`chapterEnd`、三段 `sister*`、`darkCommissionV9` 与 `darkExileV9`。V16 安装器保留行数/说话人并迁移历史 `pending.lines`。`StoryFlow` 使用最终表与对应 staging。

| 核心场景 | 行数 | 最终 JSON 的 SHA-256 |
|---|---:|---|
| `contract` | 20 | `40b6b3d59426e35597c325a3c820f59aec17d20dd8353409bd42832007d25747` |
| `assassination` | 18 | `d620442ef952e0c75c83a7b02682263dfd8b99a335569c6b63a9eee9ab986262` |
| `canalStart` | 9 | `30796a3bf88166814d17f5351511e2ac33d785063df27223c92d1bb350140a21` |
| `chapterEnd` | 14 | `6ff5e7d2f2c248d1e70367c6ef3a2e0d8cfb6f6bbc7e6c476a9f2a21deab6532` |

正式开发重新同步回滚后的版本，再导入真实核心复核最终表、`enter` / `finishScene` / `apply` 和 staging；若不同，更新此基线，不恢复旧大改。

## 3. 完整主线记录：引用保留，不全部替换

这是本章完整顺序。没有新增逐句稿的场景，直接采用回滚后最终运行对白；无需把旧对白再复制成一份未来必须替换的剧本。

| 地图/段落 | 真实场景与触发 | 剧情结果与本轮处理 |
|---|---|---|
| `hall` 会馆日常 | `startNew()` → `intro`；奥伦 → `ratAccept` | 接库房异响，保留任务、北墙指示和对白 |
| `warehouse` → `hall` | 六只鼠及 `crack`；回报 → `ratDone`，then `ratsDone` | 找鼠洞、回报，phase 0→1；保留数量/奖励/检查条件 |
| `hall` 幕后与委托 | `ratsDone` 后 → `aside`；薇蕾娜 → `contract`，then `contractAccept` | 通行纸、卡德兰、带圣女、封术印、驿站任务；phase 1→2，奖励不变 |
| 可选出发前 | `sisterBeforeDeparture`、`sisterIdle`、`clerkIdle`、`ch1SisterBoots` 等原选项 | 熟人关系与生活细节保留，不换长剧情 |
| `road` | 既有路线，阿林丢信、采银叶草、路牌等 | 保留旅程战斗与可选交互 |
| `town` / `chapel` 切镜 | 首进 `town` 且 phase 2 → `saintBrief` | 圣女关心老人/失踪家属，卡德兰归咎黑暗教廷；原 13 行保留，诺恩没听见切镜 |
| `town` 门卫 | 托马 `pass` → `watch`，then `pass` | 送器具通行纸验证、开放主门，奖励不变 |
| `chapel` 刺杀 | phase 2 首进 → `assassination`，then `assassinate` | 卡德兰死、治疗受阻、抵抗遭封术、挟持退向侧门；沿用原地图动作与对话框 |
| `alley` | 原侧门→小巷→水渠 | 保留路线/敌人，不加推车机关或追逐系统 |
| `canal` | phase 3 → `canalStart`，then `captain` | 她要求救人/活捉，追缉官挡闸口；保留原战斗/数值/掉落 |
| 战后/可选告别 | 原追缉官击败→phase 4；`requestDeparture`、`goodbye:*` / `farewell*` | 可补给/做已接支线/告别，也可直接离城；全部保留 |
| `canal` 章末 | 靠近 `end` 出口确认→`chapterEnd`，then `end` | 原威胁、受迫同行和许诺保持；不加披风、写信、郊外新约定 |
| 第二章衔接 | `chapterApply('end')` → `post` / phase 5 → `ch2Arrival` | 原章界不变；`end` 是出口/动作 ID，没有新的驿道地图 |

原支线 `oil`、`letter`、`herbs`、`lantern`、`copper`、`echo`、`farewell` 及全部奖励/分支保留。`sisterAfterBell`、`saintSealEarly`、`saintRoadEarly`、`saintGateWarning`、告别等待等原可选对白也保留。

## 4. 接委托后的私下对话

ID `c1HiddenPairArrangement`，接原 `contract` 收尾、原 `contractAccept` 提交前。诺恩已离开两人身边，没有听到这段话。沿用原对话框，鲁恩和薇蕾娜保留原头像；旁白只写现场动作，不画匿名黑影。

情绪走向：追问 → 鲁恩沉默回避 → 薇蕾娜要求保护诺恩 → 鲁恩道歉推辞 → 薇蕾娜动怒 → 鲁恩再次沉默，只说对不起。不新增阴谋解释，不替鲁恩辩解。

旁白：诺恩离开后，薇蕾娜仍望着门口。直到脚步声远了，她才转过身。

薇蕾娜：门上的禁制，明明有别的办法解开。为什么还要让诺恩把圣女带走？

旁白：鲁恩沉默了一会儿，才开口。

鲁恩：这是上面的安排。薇蕾娜，别再问了。

薇蕾娜：不管你们上面有什么计划，有一件事我得说清楚：别害诺恩。

鲁恩：对不起……这件事，我做不了主。

旁白：薇蕾娜盯着他，声音陡然抬高。

薇蕾娜：做不了主？鲁恩，他是我们看着长大的！

薇蕾娜：你就一点也不担心他吗？在你心里，除了服从命令，就没有别的了？

旁白：鲁恩垂下眼。薇蕾娜等着他的回答，他却迟迟没有出声。

鲁恩：对不起……

原H2 `c1HiddenSealEcho` 的全部匿名对白和黑影退出运行，不再在刺杀后追加片段。保留原18行刺杀对白和地图动作，直接接原护卫/逃离结果。

## 5. 知识与存档

玩家得知门的禁制可用其他办法解开，但不知道具体办法与上层目的。薇蕾娜担心诺恩、追问安排，并不知道更深计划；鲁恩不解释。诺恩与艾莉娅不获得这段幕后知识。第二章原 `darkCommissionV9` 位置和台词保持。

原最终 `DIALOGUES` 不插行，保留场景ID、then与一次性提交。H1新尾段revision3逐句保存；revision缺失/1/2的未完H1从新版第一句开始，之后不再重置；已看完的H1不补播。

旧H2（六行无revision与三行revision2）恢复时退出删除的片段，直接完成原刺杀动作一次，保留历史已读标记。新游戏不再创建H2或匿名标记。原 `assassinate` 的65XP、任务、护卫、phase3及位置与未追加尾段的原StoryFlow一致；重复输入、测试跳过和再次读档不得重复结算。


## 本轮验收状态

运行实现已接入，自动功能、四经济路线、三职业正常输入与构建证据见docs/ch1-expansion；人类全过程观察、首次游玩时长与内容最终审阅尚未完成，保持DEV_FROZEN。完整标准见扩充规格与任务记录；正常输入路线与快捷剧情回放分开登记。
