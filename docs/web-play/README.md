# V28.1 网页试玩

网页预览：https://rawcdn.githack.com/YuxiangLiu-lyx/Ashen/8816dd2486ca0f029977f6ecb2ad800c733bc609/index.html

这是公开源码 CDN 试玩，非原域名部署。首次访问可能显示确认页面。状态以 WEB_RELEASE.json 为准。

离线试玩：完整下载 Ashen-V28.1-Play.html 后用桌面 Chrome 打开，无需服务器、登录或运行期联网。

```bash
python3 tools/restore_archives.py
python3 -m pip install Pillow==12.0.0
python3 tools/build_web_play.py --output web-build
```

WASD/方向键移动，J 普攻，1–6 技能，F 交互。剧情测试可直接选择后续章节。存档属于当前浏览器，请用游戏内导出存档保留重要进度。
