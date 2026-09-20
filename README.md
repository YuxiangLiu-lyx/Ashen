# Ashen · 烬誓：圣女与影刃

当前接续开发版本：**产品 V28**。V27（原站平台版本 29）仍是完整恢复基线；V28 在该基线上接入 2026-09-19 战斗系统优化，包括怪物多样化、难度曲线、24 件进度限定稀有装备与约 1% 的专属掉落。仓库同时保留历史制作档案、原图和交接资料，可用于离线恢复并继续开发。

原站源码服务持续返回 HTTP 500 / 超时，因此这是**已发布运行源码恢复快照**，不冒充原始开发仓库的完整 Git 历史。具体范围见 [BACKUP_STATUS.md](BACKUP_STATUS.md)。

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
| `dist/` | 当前 183 个 JS、7 个 CSS 和 HTML 入口；运行代码内含当前全部剧情、对白、任务、战斗及资源映射 |
| `archives/runtime-assets.*` | 116 张当前运行图片的原始字节；恢复到 `dist/assets/` |
| `archives/library-originals.*` | 135 个历史原件，包括源码包、文案、部门交付、原图和旧资源；恢复到 `history/originals/` |
| `history/library-documents/` | 45 份历史文档的可直接阅读副本 |
| `history/platform-versions.json` | 原站 29 次平台版本及运行提交的对应记录，属于版本目录，不是完整 Git 对象历史 |
| `docs/recovery/` | 下载来源、逐文件哈希、模块及图片验证报告、原始 HTML |
| `source/` | 当前接续状态、恢复边界和项目指令 |
| `AGENTS.md` | 后续模型必须执行的开发与 GitHub 保存规则 |
| `NEXT_SESSION_PROMPT.md` | 可直接交给新会话的接续 prompt |

`game-v14.js` 是沿用的入口文件名，其实际内容导入 V25/V26/V27/V28 模块，不能据此误判为 V14。最新澄璃文案在 `dist/chengli-text-v27.js`，人物资源引用含 `assets/v27/`。

## 继续开发与保存

先读 `AGENTS.md`、`source/README.md`、`source/CURRENT_STATE.json` 和 `NEXT_SESSION_PROMPT.md`。每轮修改都必须实际提交、推送 GitHub，并核验远端包含本轮提交；用户已授权正常保存，无需每次重复确认。

首次还原的 `dist/assets/` 会显示为新文件，这是从归档展开的原始资产；后续开发可将它们直接纳入 Git 跟踪。不要为了消除这些提示而忽略或删除资产。历史原件的展开目录已忽略，因为相同字节保存在已跟踪分卷中。新制作的图片、文案和资源记录应正常提交。

浏览器个人存档不属于代码备份。现有存档不会自动从线上域名迁移到本地地址。


## V28 战斗系统

V28 不覆盖 V27 的剧情与地图结构，而是在最终运行时追加 `dist/combat-overhaul-v28.js`。详细变更、数值原则与 24/24/24 内容清单见 `docs/v28/COMBAT_OVERHAUL.md`。
