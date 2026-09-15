# 《烬誓》移动端与 Steam 迁移核查

核查日期：2026-09-10。范围：现有 V5 源码只读检查、官方资料核实。本报告没有创建安装包，也没有执行真机或商店提交测试。

**可以沿用现在的开发方式。** 剧情、地图、战斗、装备和技能逻辑可以继续保持一份 JavaScript 代码；Android/iOS 添加 Capacitor 容器，Steam 首发 Windows 添加 Electron 容器。主要新增工作在平台适配、安装分发和测试，不需要为了上手机或 Steam 先把游戏重写成 Unity。这个结论来自当前代码结构与官方容器工作流的工程判断，尚不是打包验证结果。

| 目标 | 核心代码复用方式 | 实际新增工作 |
|---|---|---|
| Android | 将 `dist` 作为 Capacitor 的 `webDir`，资源随包提供 | Android Studio/SDK、原生存储接口、返回键与横屏适配、真机性能回归、签名 APK；Google Play 使用 AAB 并完成后台材料 |
| iPhone/iPad | 同一 `dist` 放入 Capacitor 的 WKWebView | Mac/Xcode 构建环境、签名与开发者账号、刘海和底部手势区避让、音频中断恢复、真机测试、TestFlight/审核 |
| Steam Windows | Electron 打包同一网页与资源，生成可离线启动的桌面程序 | 窗口/全屏与缩放、稳定存档目录、Windows 实机回归、商店素材、SteamPipe 上传与审核；成就、云存档、手柄支持分别接入 |

Capacitor 官方工作流支持同步 Web 资源到 Android/iOS 项目后编译签名包；iOS 由 Xcode 管理。Electron 官方推荐使用打包工具完成桌面分发。Steam 接收可运行构建并通过 SteamPipe 分发，因此交付对象应是桌面游戏包，不能只提交试玩网址。[Capacitor 工作流](https://capacitorjs.com/docs/basics/workflow)、[环境要求](https://capacitorjs.com/docs/getting-started/environment-setup)、[iOS 运行时](https://capacitorjs.com/docs/ios)、[Electron 打包](https://www.electronjs.org/docs/latest/tutorial/application-distribution)、[Steam 构建上传](https://partner.steamgames.com/doc/sdk/uploading)。

当前源码已经具备 Canvas 2D、ES modules、程序音效、指针摇杆、触屏攻击、多种屏幕尺寸样式、DPR 上限、失焦暂停与首次操作解锁音频。`package.json` 没有服务端运行依赖，游戏内容使用本地资源；V5 的 `dist` 文件总大小约 41 MiB。剧情和系统本身没有发现必须依赖网页托管服务的结构性障碍。

本轮优先做的兼容修正：

1. **存档导出/导入。** 保留版本号和迁移函数，导入前校验文件大小、结构、职业、地图及数值；失败时保留原存档。`localStorage` 按 origin 隔离，从现有域名改到 `ashen-vow-qingzhou.com` 后不会自动读到旧站存档。旧站导出、新站导入是本阶段最低工作量的迁移办法。[MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)。
2. **平台存储接口。** 将读写封装起来，网页继续使用现有存储，移动包改接 Preferences 或应用数据文件，桌面包存入稳定的用户数据目录。Capacitor 官方明确提醒移动系统可能清理 WebView 的 localStorage；Preferences 适合轻量键值数据，卸载应用仍会清除存储，不应承诺永久保存或自动跨设备同步。[Capacitor Preferences](https://capacitorjs.com/docs/apis/preferences)。
3. **触屏可用性。** 在已有 `viewport-fit=cover` 基础上实际使用安全区边距；详情不能只依靠鼠标悬停；手机横屏下检查背包、快捷栏、对话按钮是否互相遮挡。保持暂停时清除移动/攻击输入，并测试切后台、锁屏后恢复。
4. **控制地图缓存。** V5 会保留每张 1600×1080 底图 Canvas；11 张底图的原始 RGBA 就约 72.5 MiB，尚未计图集和画布副本。建议限制底图缓存为最近 2–3 张，随后在真实手机观察帧率、内存与温升。桌面流畅不能代替手机验收。

以上是建议项；具体哪些已在 V6 落实，应以 V6 代码和测试记录为准。

开发者账号和商店步骤有独立成本，截至核查日：

| 渠道 | 官方公开费用或时间条件 | 对本项目的意义 |
|---|---|---|
| Google Play | 开发者注册费一次性 US$25；2023-11-13 后创建的新个人账号，目前须至少 12 名测试者连续加入封闭测试 14 天后申请生产权限 | AI 测试岗位不能替代这些真实测试者；签名、材料、生产权限申请仍需完成 |
| Apple App Store | Apple Developer Program 通常 US$99/会员年，地区价格可能不同 | 需要账号、签名、构建环境和 App Review；“网页能运行”不代表已获商店批准 |
| Steam | 每个新应用 US$100 等值费用；商店页与构建均需审核，官方通常各为 3–5 个工作日并建议至少预留 7 个工作日 | 首次发布还有入驻和发布条件，不能把打包完成日等同于上架日 |

来源：[Google 注册](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en)、[Google 新个人账号测试](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)、[Android 签名](https://developer.android.com/studio/publish/app-signing)、[Apple 注册](https://developer.apple.com/programs/enroll/)、[Steam Direct](https://partner.steamgames.com/doc/gettingstarted/appfee)、[Steam 审核](https://partner.steamgames.com/doc/store/review_process)。本轮没有支付这些费用，不能写入实际支出台账。

**工作量判断：** 在账号、构建环境和设备齐备、首章先稳定的条件下，单个平台“能启动的验证包”可按数个工程工作日估算；把首个目标平台做到可公开测试，应预留约 1–2 周适配和回归空间。这里是规划区间，不是工时保证；不包含招募测试者、商店等待、账号验证和未知性能问题。首次建议只验证 Windows 或 Android 一个目标，通过后再扩到 iOS。复杂联网、内购、云存档、完整手柄导航不应塞进第一次打包范围。

因此，当前继续完善首章不会浪费核心开发投入。下一阶段的验收顺序应为：稳定网页首章 → 一个目标平台的离线验证包 → 真机/桌面回归 → 商店发行准备。能迁移、能安装、能顺畅玩、能通过商店审核是四个不同的验收结果。
