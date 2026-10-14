# 复核入口

在仓库根目录使用现有锁定依赖环境。不要运行章节测试来代替下面的正常输入证据。旧检查点、失败日志和截图保持原样。

- 当前完整集成：`ASHEN_INTEGRATION_OUTPUT=docs/rpg-experience/recheck python3 docs/rpg-experience/c1/INTEGRATION_DRIVER.py`。这会运行原integration全部检查并将输出分区，避免覆盖旧QA。
- 快速检查：`python3 tools/harness/check.py --tier fast`。
- 可玩包：`.venv/bin/python tools/build_web_play.py --output qa-export/rebuilt`；`.venv/bin/python tests/browser-web-play.py --build qa-export/rebuilt --out qa-export/rebuilt-ui`。离线入口为输出目录中的Ashen-V28.1-Play.html，文件名为兼容保留。
- 第三章群战：`node docs/rpg-experience/c3/ENTRY_COMBAT.mjs qa-export/recheck-groups`。使用正式enter、AI和三种培养，初始补满及两瓶药属于显式Lab条件。
- 第三章首领：`ASHEN_C3_SAVES=docs/rpg-experience/c3/SAVE_SOURCES.json ASHEN_BOSS_ONLY=1 node docs/rpg-experience/c3/BOSSES_FINAL.mjs qa-export/recheck-bosses`。
- 第三章制作：`ASHEN_C3_SAVES=docs/rpg-experience/c3/SAVE_SOURCES.json ASHEN_FORGE_ONLY=1 node docs/rpg-experience/c3/FORGE_FINAL.mjs qa-export/recheck-forge`。held与crafted保存独立深拷贝，支付原配方成本，不改物品数值。

旧版对照在9d352b17ee7d40ed963e3315aae007f13481f08b的独立工作树运行同一份当前实验脚本。此轮实际工作树为/tmp/ashen-c3-before-9d；复现时可用git worktree add --detach创建独立目录，切换该目录后以绝对路径执行当前ENTRY_COMBAT.mjs/FORGE_FINAL.mjs。脚本按cwd加载生产模块，按脚本位置读取同一份原始存档，避免比较不同输入。

第三章正常输入按NORMAL_INPUT_CHAIN.json追踪：natural-013、natural-014、natural-015前段的PROGRESS、原保存档、导入哈希，再接natural-016三职业PLAY。没有只保留最终通过结果：死亡、驱动失败和每次修改前脚本都在目录中。重跑NORMAL_DRIVER须指定新的ASHEN_C3_NATURAL输出目录；章末驱动016还需ASHEN_RESUME_SAVE指向实际17-jailer原档，不得编辑该存档以让测试通过。

docs/map-quality/LATEST.json和当前验收回执绑定本次源码；后续修改要按新任务重新核对，不能直接改旧报告的指纹。最终FINAL_GATES.py用于本次交付审计，验证源码、过程回执、原档链和包哈希，并非永久适用于后来所有版本。

较大的四轮集成JSON已逐字节压缩保存在archives/rpg-three-evidence/manifest.json及分卷。截图仍直接跟踪。需要查看原始大JSON时运行 `python3 docs/rpg-experience/RESTORE_EVIDENCE.py`；只核验分卷和每个成员用 `--verify-only`。已有同路径文件若内容不同会停止，不覆盖后续工作。本地原JSON未删除。
