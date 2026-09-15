# Ashen 已发布 V27 运行文件恢复说明

本目录从既有公开游戏地址 `https://ashen-vow-qingzhou.chickchickman4.chatgpt.site/` 的实际 HTML、ES module 导入、CSS 和图片加载数据逐层恢复。没有创建、发布或修改站点，也没有生成替代图片或重写剧情/游戏代码。

已取回 305 个原始发布资源，共 257,436,740 字节（约 245.51 MiB）：182 个 JavaScript 源模块、7 个 CSS、111 张 PNG、5 张 WebP。全部请求返回 HTTP 200；各文件保留原始响应字节。入口文件名仍然是 `game-v14.js`，其当前内容导入 V25/V26/V27 模块；`core-v14.js` 实际导入并安装 `chengli-text-v27.js`，角色美术含 `assets/v27/` 的最新资源。因此不能仅凭文件名中的 v14 将此快照判断为旧版。

## 本地打开

在仓库根目录运行 `python3 tools/serve.py`，用浏览器访问 `http://127.0.0.1:5173/`。脚本先还原图片，然后从 `dist/` 提供 HTTP 服务。游戏使用 ES modules，应经 HTTP 服务打开。

`dist/index.html` 以公开响应为基础，仅移除一个由 Cloudflare 注入的 challenge 脚本。完整原始 HTML 保存为 `index.deployed.raw.html`；两份 HTML 的 SHA-256 与具体差异记录在 `index-restoration.json`。其余代码、文案、CSS 和图片没有改写。

## 已核验

- `fetch-manifest.json`：每个已获取路径、公开来源 URL、HTTP 状态、字节数、SHA-256、引用来源。构建元数据里的旧 `/workspace/...` 路径明确标记为本地来源信息，没有将其当成网站接口访问。
- `SHA256SUMS`：305 个发布资源及两份 HTML 的校验和，当前资源实际存放在仓库 `dist/`，HTML 原始响应位于本报告同目录；以 `fetch-manifest.json` 的路径及 SHA-256 对照两处文件校验。
- `module-validation.json`：182 个 JS 经 Node 原生 ES module 解析，530 条模块依赖完整，0 语法错误、0 缺失导入；入口成功完成模块链接。仅求值 7 个纯图片注册模块，验证其计算得到的 59 个资源路径全部存在，未执行浏览器游戏入口。
- `integrity-validation.json`：所有资源的字节数和 SHA-256 匹配；116 张图片全部通过 Pillow 格式完整性验证。
- 动态路径经过独立语义审计：`game-v14.js` 的 V4/V5 加载数组，以及 `presentation-v22.js`、`character-art-v24.js`、`city-moments-art-v24.js` 的插画工厂均已完整展开、核对。

## 恢复边界

这是一份实际已发布前端源码、当前引用图片和样式的完整依赖快照，包含源码中仍留存的版本模块与改写前后文本。它不等同于原始开发 Git 仓库的提交历史。未发布的工具、测试、源绘图工程、未被当前发布文件引用的历史资产，以及玩家浏览器 localStorage 中的个人存档，不能由本次公开静态恢复证明已取回；其他档案应从已恢复的历史备份和文档另行保留。尚未做浏览器交互试玩，本目录提供的是字节完整性、原生模块链接和资源依赖完整性验证。
