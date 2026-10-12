# 本地 HTTP 启动修复 · 2026-10-12

用户命令为 `python3 tools/serve.py --port 5174`，症状为整页空白或黑屏。本轮使用这个实际 CLI 和独立 Chrome 浏览器上下文验收，不使用其他 QA 静态服务器替代。

## 复现与范围

原入口在全新浏览器可以正常启动，未读取用户个人浏览器资料，因此未确定用户当时具体是哪个请求或缓存失败。故障注入确认：任意必需模块请求失败时，原入口只有空的 `#ui`，没有错误说明；图集失败时会停在“正在整理行装”，没有重试按钮。证据在 [基线报告](baseline-confirmed/BROWSER_QA.json) 和 [空白截图](baseline-confirmed/module-failure.png)。

修复将已有离线/打包网页的启动器接入本地服务器：

- HTML 自带加载页，模块完成前也有可见界面；加载失败显示原因和重试按钮。
- 沿用已验收的四路图集加载队列、进度统计和错误处理。
- 页面、JS、CSS 响应不再复用旧缓存；带旧条件请求仍读取当前代码。图片保留原缓存行为。
- 包装只发生在 HTTP 响应中；每次请求读取当前代码。原始 dist 文件、人物、美术、地图、剧情与存档格式不变。
- `tools/web_runtime.py`仅抽取既有打包逻辑。与基线 `c195c96021b6d35105e38223b00009e6ee69acd1` 比较，200个打包模块的输出全部逐字节相同。本地启动仍仅需 Python 标准库。

## 验证

实际命令：

```bash
python3 -S tests/test_local_serve.py
.venv/bin/python tests/browser-local-serve.py --port 5174 --out qa-export/local-serve
python3 tools/harness/check.py --tier fast
node --test tests/presentation-v281.test.mjs
```

HTTP专项覆盖两个入口、旧条件缓存、修改代码后刷新、JS MIME/HEAD、图片原字节与304、缺失模块404。浏览器覆盖正常新游戏、八章测试选单、第一/二章直达与任务跳过、返回正常存档、刷新续玩、模块和图片两种失败后的按钮重试、移动横屏。失败注入和重试都保持合成正式存档不变。

真实浏览器结果见 [修复后报告](fixed/BROWSER_QA.json)，截图包括 [标题](fixed/title.png)、[第一章](fixed/chapter1.png)、[第二章](fixed/chapter2.png)、[模块错误可重试](fixed/module-failure.png)、[图片错误可重试](fixed/image-failure.png)、[移动端](fixed/mobile.png)。本机本轮主菜单就绪为3.5秒，不作为其他设备的耗时承诺。

所有命令和退出码由任务 Harness 保存至 [证据目录](../harness/evidence/serve-loading-20261012)。首次基线测试在暂停自动存档之前取比较值，造成测试夹具误报；修正为进入测试菜单后取值并重跑，旧失败日志和截图保留在baseline目录，不计为产品通过证据。

本次验证本地入口与故障恢复，不包含八章自然通关、用户个人旧缓存环境或网站发布。打包输出逻辑保持逐字节一致，未替换现有离线包。GitHub保存状态见同目录GIT_SAVE.json。

## 使用

旧的 Ashen 服务需在原终端 Ctrl+C 后重启相同命令，再打开 <http://127.0.0.1:5174/>。保持终端运行；不清除浏览器数据和游戏存档。若出现错误，页面可直接重试并保留失败原因。
