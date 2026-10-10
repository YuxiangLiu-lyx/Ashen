# Ashen · 烬誓：圣女与影刃

当前接续开发版本：**产品 V30 · 第一章0.3局部增强（基于回滚验收版1cefe80）**。V27（原站平台版本 29）仍是完整恢复基线；V28 在该基线上接入 2026-09-19 战斗系统优化，包括怪物多样化、难度曲线、24 件进度限定稀有装备与约 1% 的专属掉落。仓库同时保留历史制作档案、原图和交接资料，可用于离线恢复并继续开发。

原站源码服务持续返回 HTTP 500 / 超时，因此这是**已发布运行源码恢复快照**，不冒充原始开发仓库的完整 Git 历史。具体范围见 [BACKUP_STATUS.md](BACKUP_STATUS.md)。

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

需要 Git 和 Python 3.9+；不需要安装第三方 Python 包。

```bash
git clone https://github.com/YuxiangLiu-lyx/Ashen.git
cd Ashen
python3 tools/serve.py
```

打开 `http://127.0.0.1:5173`。首次运行会自动校验并还原 116 张原始图片，再启动本地服务器。不要直接双击 HTML；游戏使用 ES modules。

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
| `dist/` | 当前 196 个 JS、7 个 CSS 和 HTML 入口；运行代码内含当前全部剧情、对白、任务、战斗及资源映射 |
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


## 网页试玩入口
[V28.1 在线试玩](https://rawcdn.githack.com/YuxiangLiu-lyx/Ashen/8816dd2486ca0f029977f6ecb2ad800c733bc609/index.html)（公共源码预览托管，原站未覆盖）。发布与浏览器验证状态见 `docs/web-play/WEB_RELEASE.json`。

无需启动本地服务器的单文件离线版，可由 `tools/build_web_play.py` 构建，详见 `docs/web-play/README.md`。

## Agent Harness 与 Balance Lab

新会话可直接说“修改暗影流血连招”，按根AGENTS自动定位。结构化模块图、按任务检索、六项项目Skills、持久任务与分级CI在 `tools/harness/`、`source/harness/`、`.agents/skills/`。短流程和接续例子见 [WORKFLOW](docs/harness/WORKFLOW.md)。

```bash
python3 tools/harness/context.py --task "修改暗影流血连招"
python3 tools/harness/check.py --tier fast
node tools/balance_lab/run.mjs combat --config tools/balance_lab/examples/shadow-captain.json --trials 20
```

Lab直接调用真实RPG，支持固定种子、职业/装备/技能、AI战斗、统计、效果查询、候选Build搜索与第五章经济账本。范围及限制见 [Lab](docs/balance-lab/README.md)；本轮不改V28.1正式规则，不发布网站。验收在 `docs/harness/ACCEPTANCE.json`，历史入口原文与原QA保留。
