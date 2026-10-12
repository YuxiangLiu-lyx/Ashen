# 第一章剧情记录 · 原对话形式

- 文学章节：`V01C01`，版本：`0.4`，状态：`IMPLEMENTED`；工作名《午钟之前》。
- 采用记录：2026-10-10，用户撤销0.3新增的分镜式表现和对应Harness设计；保留人物形象、地图/交互优化及新增幕后情节。任务 `ch1-dialogue-cleanup-20261010`，修改前基线 `0f3c9f9`。
- 现行形式：沿用最初的地图内剧情动作和普通对话框。新增幕后段只用同一个对话框与黑影立绘；未知人不标姓名、年龄、性别、职衔或场所介绍，每人一句暗语。第二章0.3继续只策划。
- 保留：三类独立追兵图集、同等成人高度与脚锚、现有地图表现、近身热点和井沿修复；全部原对白、任务、奖励、章节边界、存档schema15。

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

## 4. 新增幕后对白

两段均接在原场景结尾、原 `then` 提交之前；主角不会获得幕后知识，原追兵不会先生成再被强行暂停。复用原 `dialogue-wrap` / `dialogue-card` / 继续按钮。新增段的立绘统一为不显示五官的黑影，不绘制新场所或大图；不能从头像alt、说话者栏或场景标签泄露未知人的身份。

### H1 · 原委托结束后

ID `c1HiddenPairArrangement`，原 `contract` 尾段。已知的薇蕾娜与鲁恩仍使用已知名字和下列六句，头像显示黑影；诺恩不在这段对话中。

鲁恩：只为杀卡德兰，不必把她也带出来。

薇蕾娜：上面要的，不止他的死。还要让诺恩和她同行一段。

鲁恩：你觉得会有结果？

薇蕾娜：我不知道。她不会顺着他，他也没学过怎么跟这样的人相处。

鲁恩：他回来问你呢？

薇蕾娜：我会答。先把答应我的退路留好，两个人都得回来。

薇蕾娜知道安排接触，参与隐瞒，仍相信有人接应；她不知后续骗局。保留第二章既有 `darkCommissionV9` 的原位置和对白。

### H2 · 原刺杀结束后

ID `c1HiddenSealEcho`，原 `assassination` 尾段。以下三句分别来自不同的未知说话者；运行中说话者栏和场景标签留空，只有黑影与台词，没有旁白介绍。各自仅察觉有限变化，不是在同一场会谈，不全知主角去处。

> 印启用了。把旧记录取来。

> 是结果变了。旧案先留着，再算一次。

> 这次只响了一声。先记下来，别把人都叫来。

不再出现“女性”“青年”“老人”“助手”“军吏”等身份描述，不新增专属地点画面或幕后人物世界模型。

## 5. 知识与存档

原最终 `DIALOGUES` 不插行，不改pending场景ID与 `then`。保留一次性 `flags.c1Viewed` 与 `pending.c1Tail`；新尾段记录 `revision:2`。旧H1六行游标原样恢复，旧H2六行按两句一组映射到新三行；新档不重复映射。已完成的旧事件不强制补播。

两段结束后各自只调用一次原场景完成动作。`assassinate` 仍给原65XP、完成contract、开始escape、生成原护卫并进入phase3；幕后信息不写主角knowledge。正常播放、旧尾段恢复与重复点击均不得重复结算。

原0.3回看仅是临时状态，不是正式存档字段；本轮移除其标题入口、控件和运行分支。原有第三章以后独立试演与剧情测试保留。

## 6. 验收与接续

对照 `docs/ch1-dialogue-cleanup/BASELINE.json` 验地图、景物、原对白、任务、原STAGING和保留资源哈希。三职业、原pending逐行/阶段、旧六行H2、新三行H2与H1读档；实际浏览器原对话控件、匿名黑影、移动端可推进、奖励只结算一次；原图不再预加载/打包，追兵/交互优化仍在。

0.4已实现并通过原对话、匿名黑影、保存恢复和真实浏览器回放；最终集成、打包及交付状态以 `docs/ch1-dialogue-cleanup/ACCEPTANCE.md` 和任务结果为准。历史0.3分镜设计在 `history/c1-cinematic-20261010/`，不进入现行Harness路由、不自动恢复。通用剧情/存档/地图验收继续遵循原规范。
