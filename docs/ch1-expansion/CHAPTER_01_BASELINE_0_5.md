# 第一章剧情记录 · 原对话形式

- 文学章节：`V01C01`，版本：`0.5`，状态：`IMPLEMENTED`；工作名《午钟之前》。
- 采用记录：2026-10-12，任务 `ch1-voice-20261012`，基线 `71dcfce`。用户要求移除第一章新增神秘人的对白和形象，重写接委托后的薇蕾娜/鲁恩对话，并将圣女默认立绘换为封面柔和形象。
- 现行形式：原地图内动作和普通对话框；已知人物使用原立绘，旁白没有人物占位。仅恢复与封面一致的柔和圣女资产，不恢复旧重构。
- 保留：原主线对白、任务、奖励、章界、存档schema15、地图与追兵/交互优化；第二章0.3只策划。0.4旧稿和尾段实现保存在 `history/c1-backstage-20261012/`。

## 1. 本章故事与范围

诺恩完成会馆日常事务，接受刺杀委托，经旧王道进入白榆城。艾莉娅的善良仍由原 `saintBrief` 的援助和照护表现。诺恩刺杀卡德兰、阻止救治、封术并强迫圣女同行；圣女仍抗拒，要求救人和审判。沿原侧门、小巷、水渠撤离，保留追缉官战斗、可选告别与闸口章末。

不改变原18行刺杀对白及原staging节拍，不新增圣女实战或任务。移除专用全屏分镜、附加等待、剧情大图和新增回看入口；对应旧开发prompt从现行Harness移出，旧字节仅在历史归档保留。

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

## 6. 美术与验收

圣女默认肖像使用封面身份的柔和立绘，银金长发、蓝眼、星冠、白金外袍与蓝宝石对应封面；后期便装和所有世界身体/动作保留。资产仅从已保留历史原件复制，不改旧图，不恢复旧场景/剧情模块。

验收：原地图/景物/任务/对白/STAGING哈希不变；三职业正常完成、旧pending逐行、H1新旧游标、H2全部旧游标及重复提交；普通浏览器逐句、三视口继续按钮、圣女原画对照、前两章主线、测试跳过、离线HTTP移动端；三维分别记录。实测证据落盘 `docs/ch1-voice/`，通过后登记IMPLEMENTED。
