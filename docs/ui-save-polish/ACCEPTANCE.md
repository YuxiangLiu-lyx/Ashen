# 2026-10-19 界面、存档与装备优化

任务：`ui-save-polish-20261019`。基线：`1af137a1b64c862bbea09982588409b335d30be0`。

- 会馆四种药水配方显示材料图格和金币图格，数字统一为「持有 / 需要」。连续制作后重读实际库存；不足标红并禁用按钮。原配方和价格保持。
- 商人换成与场景视角接近的普通成年女性：橄榄色外衣、皮袋、腰袋。新透明8帧图集，地图/货柜/对白头像使用同一角色，原图保留。
- 金叹号与金问号保留灰问号同类金属明暗和纹理；取消旧的压缩亮度换色。三态规则和24像素高度保持。
- 顶部保存按钮及暂停菜单「保存当前位置」保存完整进度。每60秒有效游玩时间尝试自动保存；战斗、剧情或临时练习时延后。交易/任务原有事件保存保留。暂停本身不覆盖记录，离开页面仍尝试保存。
- 普通死亡读取最近成功存档的位置、物品、任务和装备；死亡状态不会覆盖有效存档。旧死亡档按原档位置补回生命后接续。剧情败退与回忆战原有重试保持；正式/测试档隔离保持。
- 六品质使用明显边框、底色、名称和文字标签；48种手绘装备图标，命名装备映射和职业武器类型稳定。人物护肩、冠饰、护腕、靴片和武器细节与新设计对应；装备数值及存档字段保持。

当前已完成的技术证据：

- [浏览器专项](browser/QA.json)：1440×980、844×390、390×844，真实点击制作15→13→11、材料不足、手动/自动保存后死亡读档、写入失败和档位隔离。真实游戏循环自动保存耗时60.059秒。
- [图标图集](browser/equipment-atlas.png)、[装备界面](browser/equipment-1440.png)、[手机材料界面](browser/potion-before-390.png)、[会馆](browser/hall.png)、[任务标记](browser/markers.png)。
- 67项Harness、225项核心回归、39项专项/表现回归、完整integration均通过。含18经济路线、1620独立战斗快照、35场景与正式渲染器、浏览器战斗一致性、真实磨坊探索/战斗/返程、三视口153页对白及HUD回归。机器和商人会馆9条路径及三维验收通过；详见任务日志008—012与 [MAP_QUALITY.json](MAP_QUALITY.json)。
- 初次专项失败涉及测试fixture未传敌人ID、浏览器测试跨模块访问，以及两组图标同形；失败日志001—003完整保留，已修正并复验。第一版代码图标被最终手绘图集替换。

图片通过内置 `image_gen.imagegen` 生成，原始字节保存为 [merchant.png](../../dist/assets/ui-save-polish/merchant.png) 和 [equipment.png](../../dist/assets/ui-save-polish/equipment.png)。完整提示、来源和SHA256见 [ASSETS.json](ASSETS.json)。

离线、HTTP与手机横屏新包检查全部通过（[WEB_QA.json](package/WEB_QA.json)），无未捕获浏览器错误。默认入口 `qa-export/release-build/Ashen-V28.1-Play.html` 已更新，546个交付文件逐字节核对；旧包保存在 `qa-export/release-build-before-ui-save-polish-20261019`，见 [默认包回执](DEFAULT_BUILD.json)。本地 `http://127.0.0.1:5174/` 的247个模块、7个样式和两张新图均与当前文件核对，见 [本地服务回执](LOCAL_SERVER.json)。

构建记录保留真实来源：基线提交 `1af137a` 加本轮未提交改动（`source_dirty: true`），运行输入SHA256为 `2d5d0adddd31ef92c5f06fea96ef21ca6d77df029752725449cea20069e27fb0`；离线文件SHA256为 `f1f078b8fb7d0226f8d15625df2a901666aaf35871e909c89796c1574a9e1f7f`。Git保存提交与构建输入对应关系见 [Git回执](GIT_SAVE.json)，构建记录保留原始生成时间的状态。

集成产生的历史默认输出已逐字节保存到本轮目录，历史原件恢复，详见 [INTEGRATION_OUTPUTS.json](INTEGRATION_OUTPUTS.json)。大JSON原始字节存于 [分卷清单](../../archives/ui-save-polish-evidence/manifest.json)，打包及独立校验通过；运行 `python3 docs/ui-save-polish/RESTORE_EVIDENCE.py` 可恢复。`.gitignore`仅列出已经归档校验的具体文件，原图、截图和小报告直接入库。

实现与完整证据 `2d4a43102b4758958fcc9a68b96ca55700ffd42f` 已推送 GitHub main，`ls-remote` 核对一致；见 [Git回执](GIT_SAVE.json)。未发布网站。真人审美及操作舒适度见 [观察表](HUMAN_OBSERVATION.md)，旧章节人工门禁保持独立。
