2026-10-19界面与存档优化：药水材料图格实时显示「持有 / 需要」；商人普通脸和商旅服装融入场景，金任务标记保留灰问号同类明暗质感。手动保存、60秒安全自动保存和死亡读取最近存档已实测；六品质颜色与48种装备图标及随身细节更新。完整集成、三视口专项和离线/HTTP/手机包通过，默认入口与5174已同步、旧包保留。真人审美待验，证据见[本轮验收](docs/ui-save-polish/ACCEPTANCE.md)。未发布网站。

2026-10-16本轮：第二章0.5按第一章优化64场对白审读、任务交接和寄卖格子详情；第一章1.6普通怪生命增加50%，精英/Boss增加150%至2.5倍，旧档按残血比例迁移。实现、验收结果及默认包回执见docs/c2-optimization/ACCEPTANCE.md与docs/c1-endurance/ACCEPTANCE.md；真人文风/难度/节奏待验。原主线结果和后章保持，未发布网站。

2026-10-15试炼对白再次修订：按用户反馈明确任务风险和多年成长，诺恩直接答应；留饭、等人等日常互动承接调侃，去除流程复述。只改三场、保留页数说话人及动作节点。67项Harness、48项相关回归及三视口对白/新包通过；默认试玩入口已更新，旧包保留。文风待用户反馈，见[本轮记录](docs/c1-dialogue-voice/ACCEPTANCE.md)。

2026-10-15第一章1.4：五精英改为差异化身体起手，Boss使用克制范围提示；前三章怪物增加生命。会馆机器缩小，固定女性罗萨，商人/机器采用图标格子与点击详情；试炼三场对白自然化，救济增加5名居民及家具。技术验收、三职业正常键鼠、离线/HTTP/手机包通过，默认入口已更新且旧包保留；真人难度和文风待验。见[本轮验收](docs/c1-restraint/ACCEPTANCE.md)。后五章保留，未发布网站。以下为历史记录。

2026-10-14第一章1.2：地下三人改用清晰独立立绘，剧情支持点击任意处继续和“上一条”回看；扩写薇蕾娜与诺恩的四场交流，加入试炼缘由、熟人调侃和吃饭关心。62项Harness、215项核心与完整集成及离线/HTTP/手机包通过，默认入口已更新并保留旧包。文风与亲昵节奏的真人反馈仍待验；范围与证据见[本轮验收](docs/c1-care-ui/ACCEPTANCE.md)。

2026-10-14第一章1.1追加优化：任务先交代缘由再接交，诺恩无预设伤势，薇蕾娜因担心而安排试炼；诺恩实际离开后，鲁恩在原会馆场景走近薇蕾娜私谈，取消黑幕。默认本地和离线入口均已同步，旧包另存；验收与真人待验见docs/c1-story-flow/ACCEPTANCE.md。第二、三章保留上一轮成果，本次只修改第一章。以下记录保留历史。

2026-10-14当前交付：前三章RPG体验升级（R01—R03），第四至八章按用户最新指令暂缓。战斗成长、地下探索、任务结果、真实设施与安全剧情触发已实施；技术证据及真人待验见docs/rpg-experience/ACCEPTANCE.md。默认离线入口为qa-export/release-build/Ashen-V28.1-Play.html；旧包保存在qa-export/release-build-before-rpg-three-20261014，文件名沿用旧版。GitHub保存与网站发布分开；下面旧记录保留为历史。

# Ashen · 烬誓：圣女与影刃

当前接续开发版本：**产品 V30 · 第一章0.9分层任务与通用规则**。在0.8的22图上增加5条双向通路，地下三层与多种怪物、分区材料目标相连；常驻遭遇每次入图刷新，默认主线追踪，任务使用金叹号/灰问号/金问号，墙板贴合北墙。任务与门禁不展示数字爆率或公式条件。通用约定见[游戏设定](docs/harness/GAME_SETTINGS.md)，本轮实施和验收见[记录](docs/ch1-layer-rules/ACCEPTANCE.md)。

保留0.5对白与柔和立绘、0.6奖励及精英数值预算、后续章节和全部旧原件。历史0.6人类全过程观察与节奏验收仍独立待办。第一章0.8的[验收](docs/ch1-story-world/ACCEPTANCE.md)和[地图对照](docs/ch1-story-world/visual-review.html)保留。

原站源码服务持续返回 HTTP 500 / 超时，因此这是**已发布运行源码恢复快照**，不冒充原始开发仓库的完整 Git 历史。具体范围见 [BACKUP_STATUS.md](BACKUP_STATUS.md)。

## 2026-10-12 圣女立绘与第一章对白

圣女默认对话立绘改用封面风格的柔和形象；接委托后改为薇蕾娜与鲁恩关于禁制、带走圣女和诺恩安危的私下对话。移除新增匿名神秘人，已知角色使用原立绘，旁白没有占位人影。旧档迁移和验收见[本轮记录](docs/ch1-voice/ACCEPTANCE.md)。以下0.4相关段落保留为历史。

## 2026-10-11 前两章人物显示修复

已知人物的幕后对白恢复原立绘；未知人物用明确深色的兜帽披风黑影，避免继承字体颜色变白。修复第二章重复结算发放经验/金币的问题，正常奖励不变。范围、截图和验收见[修复记录](docs/ch12-portrait-bugs/ACCEPTANCE.md)。

## 2026-10-11 章节测试模式

标题页点击“章节测试 · 免伤秒杀”，选择职业后可直接进入第一至第八章，每章分别保存测试进度。游戏、暂停或对白界面可跳过当前主线步骤/对白；测试中主角与同行免伤，命中即可秒杀。剧情击退和角色切换保留，正式存档不被覆盖。详见[测试模式验收](docs/chapter-test/ACCEPTANCE.md)。

## 2026-10-10 第一章对话修订

按用户要求保留人物、地图、追兵图集和交互优化，撤下新增全屏分镜与对应Harness设计。新增幕后情节接回原对话框，以黑影呈现；未知人物不加身份描述，只留简短对白。旧六行尾段存档兼容；原任务、对白、地图与奖励保留。记录见 [修订验收](docs/ch1-dialogue-cleanup/ACCEPTANCE.md)。原站未发布。

以下0.3分镜记录为历史，已由上述修订替代。

## 2026-10-10 第一章局部增强

补齐中断任务的刺杀分镜、两段隐藏短场、三类独立追兵图集及局部交互提示；保留原任务、对白、地图拓扑与数值。修复井沿点击锚点，兼容旧档。第二章仍只策划。实际验收、连续新游戏范围、资源提示词与限制见 [接续验收](docs/ch1-pilot-r2/ACCEPTANCE.md)；[V29历史回执](docs/v29/RELEASE.md) 同步补齐。原站未发布。

## 2026-10-10 回滚

该次按用户要求，dist 恢复到 `1cefe80`，地图、对白、角色资源及运行规则与该版本一致。未完成重构保存在 `6b388c7` 和 `backup/reconstruction-before-rollback-20261010`；新增资源/脚本可在 `history/reconstruction-20261010/` 查阅。章稿保留，重构开发暂停。个人存档未清除；新旧档验证范围与已知限制见 [回滚验收](docs/rollback-v30/ACCEPTANCE.md)。GitHub 保存不等于网站发布。

以下两节是已撤回重构的历史记录，不属于当前运行内容。

## 已撤回：V30 第一、二章剧情与圣女形象

精修14场61行对白，强化诺恩的观察与行动、薇蕾娜的调度责任，以及艾莉娅具体的救助与原则；保留刺杀、封术、强迫同行、拒绝开门和违约后果。圣女以封面为身份参照，接入温柔与坚决两套表情；礼拜厅与庄园内门采用按剧情行号切换的远景/近景，动作仍在真实地图演出。前两章可跳过当前段落，旧档保持原游标，修复第二章重复结算奖励。

[诊断与保留理由](docs/ch12-epic/REVIEW_AND_PLAN.md) · [剧情和圣女前后对照](docs/ch12-epic/visual-review.html) · [验收与限制](docs/ch12-epic/ACCEPTANCE.md) · [长期因果台账](docs/ch12-epic/CAUSAL_LEDGER.json)。本轮资源为正式接入文件，原图保留；不等同于自然八章通关或站点发布。

## 已撤回：V30 前三章空间与角色重构

灰桥重建东西主路、查验湾、连续河岸和南沟危险支路；前三章35图采用独立的用途与空间简报，清理边界网格补树、扩大可达草地、保留室内及战术障碍。精锐与军官接入独立16帧原画对应资源，NPC按工作地点短距移动、停顿和接客。保留原剧情、敌人身份、奖励与战斗数值；布局与碰撞按本轮授权修改。

[35图前后及碰撞对照](docs/chapter123-spatial/visual-review.html) · [验收与限制](docs/chapter123-spatial/ACCEPTANCE.md) · [人物原画对照](docs/chapter123-spatial/after/role-comparison.webp)。每次地图修改分别验收可玩性、场景可信度、角色一致性，缺失或过期证据会阻止任务完成。此轮仅保存GitHub，未发布网站。

以下为之前各轮范围与原始验收，不能替代最新状态。

## V30 前三章完整覆盖与中断恢复

接续补齐前三章35图，包含会馆客房、庄园内室和两处秘密房；639处景物及119个交互/可破坏物件统一映射，水壶、秤、木楔、机芯和工具按实际用途呈现，公告栏移出屋顶遮挡并兼容旧档。原地图碰撞、敌群、战斗数值和历史原图保留。

[35图滑动对照](docs/chapter123/visual-review.html) · [验收与限制](docs/chapter123/ACCEPTANCE.md)。Harness新增阶段检查点、`.codex/progress.md`自动落盘、命令超时及恢复入口；新会话先读AGENTS、进度和git diff。GitHub保存与网站发布分开。

## V30 第二、三章接续

第二章9图和第三章14图继续统一地表、路线引导、物件与灯光表现；第二章守卫使用既有16帧图集，地狱敌人增加身体动作、收势与瞬态受击/倒地。灰桥水壶交互点移出墙体碰撞，并兼容已访问地图的旧档。保留原图、地图几何、敌群、战斗数值、任务与奖励。

[23图前后对照](docs/chapter23/visual-review.html) · [本轮验收与范围](docs/chapter23/ACCEPTANCE.md)。本轮为既有V30接续，没有发布网站。

## V30 第一章沉浸表现

开篇与磨坊支线共11图统一环境资产、地表材质和附近交互提示；库房货物、城镇摊位、祭台及机房设备使用新的手绘图集。取消V29交互读条，保留任务前置与一次性领取。第一章怪物去掉附加几何装饰，增加瞬态受击/倒地与身体动作，普通攻击采用短刀光，守卫接入正反方向的16帧行走与攻击图集。

[问题诊断与改造方向](docs/v30/REVIEW_AND_PLAN.md) · [11图前后对照](docs/v30/visual-review.html) · [范围与验收](docs/v30/RELEASE.md)。保留全部原图、战斗数值、地图拓扑和旧存档；这不是全部章节重制，也未更新原试玩网站。

## V29 世界探索示范

已重构旧王道、旧磨坊小径、回水机房与修理铺的手工路线、分区、物件比例及洛缇回声机支线；机关有环境响应（V30已取消操作等待），机芯需清场后亲手取出，返回修理铺会留下持续状态。保留旧档、原奖励与战斗公式。

其余114图已做结构诊断，8张代表图另有实际渲染审查，尚未全面重建。范围、运行检查、遗留问题见[V29验收](docs/v29/RELEASE.md)，[前后图滑动对照](docs/v29/visual-review.html)。GitHub保存与原站发布分开。

## V28.1 本轮修复

补充家具碰撞和大型敌人的脚底安全距离，统一主要角色尺寸与前后遮挡采样，修复伙伴/NPC 步态，固定怪物物种并增加 Boss 结构辨识，给主角装备补上随姿态定位的外观细节。第八章仅移除大图展示，保留小立绘、对白、任务和场景演出。

5 张透明清理后的衍生图集位于 `dist/assets/v281/`，原图仍保存在 V27 归档。不是用新画稿冒充找回的原件；也不是新增 24 套独立角色动画。验收范围、复现方法及限制见 [V28.1 说明](docs/v28.1/RELEASE.md)。

## 恢复并试玩

当前开发内容请运行本仓库的 `dist/`。下方在线试玩链接固定在历史V28.1，不会随main更新。

第一章0.6可玩开发包：`qa-export/c1-expansion-preview/Ashen-V28.1-Play.html`，源5f05e5f，离线/HTTP/手机横屏检查通过。它尚待人类完整流程观察与节奏验收；[证据及限制](docs/ch1-expansion/ACCEPTANCE.md)。该0.6包作为历史保留，当前常用入口采用下述0.9包；个人存档与旧构建保留。

本机已验收的离线包位于 `qa-export/release-build/Ashen-V28.1-Play.html`；文件名为兼容旧入口保留，实际版本看同目录 `WEB_BUILD_MANIFEST.json`。当前默认包为2026-10-14前三章RPG体验升级版（精确来源及输入哈希以同目录清单为准）；上一版0.8包保存在 `qa-export/release-build-before-layer-rules-20261013/`，`qa-export/dialogue-release-build`现在是当前包别名。新克隆仓库需按下方说明启动，或按 `docs/web-play/README.md` 构建；qa-export本地包不随Git分发。

需要 Git 和 Python 3.9+；不需要安装第三方 Python 包。

```bash
git clone https://github.com/YuxiangLiu-lyx/Ashen.git
cd Ashen
python3 tools/serve.py
```

打开终端输出的地址（默认 `http://127.0.0.1:5173`）。若5173已被其他项目占用，改用 `python3 tools/serve.py --port 5174` 并打开 `http://127.0.0.1:5174`；不要停止其他项目或误开它的页面。首次运行会自动校验并还原 116 张原始图片，再启动本地服务器。不要直接双击 `dist/index.html`；此入口使用 ES modules。

2026-10-12起，本地入口先显示加载页，再分批准备图片；资源失败会显示原因和“重新加载”。请保持终端运行。更新到此修复后需先用 Ctrl+C 停止旧的 Ashen 服务，再运行原命令并刷新网页；无需清除浏览器数据或存档。页面、脚本和样式每次读取当前代码，图片保留缓存。验证记录见 [本地启动修复](docs/local-serve/ACCEPTANCE.md)。

只恢复文件、不启动：

```bash
python3 tools/restore_archives.py
```

同时恢复全部历史原件：

```bash
python3 tools/restore_archives.py --all
```

只验证归档完整性：

```bash
python3 tools/restore_archives.py --all --verify-only
```

原件归档保留文件名和目录，不依赖临时链接或外部网盘。大文件采用普通 Git 中的分卷，脚本按 SHA-256 合并校验；不需要 Git LFS。恢复程序遇到内容不同的现有文件会停止，以保护本地修改。

## 文件位置

| 路径 | 内容 |
| --- | --- |
| `dist/` | 当前 200 个 JS、7 个 CSS 和 HTML 入口；运行代码内含当前全部剧情、对白、任务、战斗及资源映射 |
| `archives/runtime-assets.*` | 116 张当前运行图片的原始字节；恢复到 `dist/assets/` |
| `archives/library-originals.*` | 135 个历史原件，包括源码包、文案、部门交付、原图和旧资源；恢复到 `history/originals/` |
| `history/library-documents/` | 45 份历史文档的可直接阅读副本 |
| `history/platform-versions.json` | 原站 29 次平台版本及运行提交的对应记录，属于版本目录，不是完整 Git 对象历史 |
| `docs/recovery/` | 下载来源、逐文件哈希、模块及图片验证报告、原始 HTML |
| `source/` | 当前接续状态、恢复边界和项目指令 |
| `AGENTS.md` | 后续模型必须执行的开发与 GitHub 保存规则 |
| `NEXT_SESSION_PROMPT.md` | 可直接交给新会话的接续 prompt |

`game-v14.js` 是沿用的入口文件名，其实际内容导入 V25/V26/V27/V28/V28.1/V29/V30 模块，不能据此误判为 V14。最新澄璃文案在 `dist/chengli-text-v27.js`，人物资源引用含 `assets/v27/`。

## 继续开发与保存

先读 `AGENTS.md`、`source/README.md`、`source/CURRENT_STATE.json` 和 `NEXT_SESSION_PROMPT.md`。每轮修改都必须实际提交、推送 GitHub，并核验远端包含本轮提交；用户已授权正常保存，无需每次重复确认。

首次还原的 `dist/assets/` 会显示为新文件，这是从归档展开的原始资产；后续开发可将它们直接纳入 Git 跟踪。不要为了消除这些提示而忽略或删除资产。历史原件的展开目录已忽略，因为相同字节保存在已跟踪分卷中。新制作的图片、文案和资源记录应正常提交。

浏览器个人存档不属于代码备份。现有存档不会自动从线上域名迁移到本地地址。


## V28 战斗系统

V28 不覆盖 V27 的剧情与地图结构，而是在最终运行时追加 `dist/combat-overhaul-v28.js`。详细变更、数值原则与 24/24/24 内容清单见 `docs/v28/COMBAT_OVERHAUL.md`。


## 历史网页试玩入口

以下链接固定为旧版本，不包含当前第一章0.4修订。测试当前修改请用上方本地入口。

[V28.1 在线试玩](https://rawcdn.githack.com/YuxiangLiu-lyx/Ashen/8816dd2486ca0f029977f6ecb2ad800c733bc609/index.html)（公共源码预览托管，原站未覆盖）。发布与浏览器验证状态见 `docs/web-play/WEB_RELEASE.json`。

无需启动本地服务器的单文件离线版，可由 `tools/build_web_play.py` 构建，详见 `docs/web-play/README.md`。

## Agent Harness 与 Balance Lab

2026-10-14加入[叙事Harness](docs/harness/NARRATIVE_HARNESS.md)：按章节、人物和事件检索当前状态，区分角色/玩家知识、未来策划与纯风格样本，提供来源漂移检查和七维编辑审查。运行剧情、任务、存档及资产保持原样；初始化范围与验证见[交付记录](docs/narrative-harness/ACCEPTANCE.md)。

新会话可直接说“修改暗影流血连招”，按根AGENTS自动定位。结构化模块图、按任务检索、六项项目Skills、持久任务与分级CI在 `tools/harness/`、`source/harness/`、`.agents/skills/`。短流程和接续例子见 [WORKFLOW](docs/harness/WORKFLOW.md)。

```bash
python3 tools/harness/context.py --task "修改暗影流血连招"
python3 tools/harness/check.py --tier fast
node tools/balance_lab/run.mjs combat --config tools/balance_lab/examples/shadow-captain.json --trials 20
```

Lab直接调用真实RPG，支持固定种子、职业/装备/技能、AI战斗、统计、效果查询、候选Build搜索与第五章经济账本。范围及限制见 [Lab](docs/balance-lab/README.md)；本轮不改V28.1正式规则，不发布网站。验收在 `docs/harness/ACCEPTANCE.json`，历史入口原文与原QA保留。
