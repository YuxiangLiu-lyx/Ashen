本轮0.6开发试玩包位于 `qa-export/c1-expansion-preview/Ashen-V28.1-Play.html`，文件名沿用历史，构建身份见同目录报告及site/BUILD.json。它尚未通过人类全过程观察与节奏验收；默认release-build仍保留上一0.5包。源码dist为0.6开发版；下方旧入口说明按历史理解。可玩内容与限制见[开发版摘要](../ch1-expansion/CHANGE_SUMMARY.md)。

# 当前本地试玩与历史在线入口

当前第一章0.4修订运行代码在 `dist/`。用 `python3 tools/serve.py` 启动；端口占用时指定 `--port 5174`，打开终端显示的地址。不要用固定历史链接核对当前代码。

本工作区当前离线入口为 `qa-export/release-build/Ashen-V28.1-Play.html`（名称沿用旧版，内容为0.4）。2026-10-11修复了该路径仍指向旧分镜构建的问题；旧包移至 `qa-export/release-build-before-dialogue-20261011/`，原新版目录 `qa-export/dialogue-release-build`保留为别名。离线HTML需完整下载，用桌面Chrome打开；普通 `dist/index.html`仍需HTTP服务器。

本地构建目录不跟随Git上传。其他机器可使用下方命令重新构建当前版本。保存并关闭旧页面后重新打开当前入口；不需要清除浏览器数据或删除存档。

以下为固定提交的历史V28.1页面，不包含第一章0.4回改：

网页预览：https://rawcdn.githack.com/YuxiangLiu-lyx/Ashen/8816dd2486ca0f029977f6ecb2ad800c733bc609/index.html

这是公开源码 CDN 试玩，非原域名部署。首次访问可能显示确认页面。状态以 WEB_RELEASE.json 为准。

离线试玩：完整下载 Ashen-V28.1-Play.html 后用桌面 Chrome 打开，无需服务器、登录或运行期联网。

```bash
python3 tools/restore_archives.py
python3 -m pip install Pillow==12.0.0
python3 tools/build_web_play.py --output web-build
```

WASD/方向键移动，J 普攻，1–6 技能，F 交互。剧情测试可直接选择后续章节。存档属于当前浏览器，请用游戏内导出存档保留重要进度。
