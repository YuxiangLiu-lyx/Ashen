# 本轮复核入口

- 当前完整集成：使用 `python3 tools/harness/check.py --tier integration`，输出环境变量参照final_integration.py并换成新目录，避免覆盖历史QA。
- 任务专项：`node --test tests/c1-story-flow.test.mjs tests/chapter-one-incremental.test.mjs tests/chapter-one-story-world.test.mjs tests/rpg-experience.test.mjs tests/ch12-bugs.test.mjs`。
- 正常UI：`ASHEN_STOP_CHAPTER_ONE=1 ASHEN_NATURAL_OUTPUT=qa-export/c1-new-run node tests/browser-chapter-one-natural-batch.mjs`。只读观察钩子，真实键鼠。当前驱动末端正确检查post/phase6。
- 本轮实际正常UI原始记录在natural-001，终端旧期望失败保留；`node docs/c1-story-flow/verify_normal_end.mjs`核对三职业全过程及未修改终点存档，不覆盖失败报告。
- 实景和三视口：`ASHEN_FLOW_OUTPUT=qa-export/c1-scenes node tests/browser-c1-story-flow.mjs`。这是隔离场景诊断，不冒充连续游玩。
- 原始经济大JSON：`python3 docs/c1-story-flow/RESTORE_EVIDENCE.py`；`--verify-only`只核验每个成员和分卷，不恢复。已有不同内容会停止。
- 新包：`.venv/bin/python tools/build_web_play.py --output qa-export/new-build`，然后 `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' .venv/bin/python tests/browser-web-play.py --build qa-export/new-build --out qa-export/new-build-ui`。
- narrative-current保存78场精确对白、上下文、事实标注及七维编辑判断；STYLE_PAUSE唯一提示是鲁恩最后的“对不起……”，按其回避与愧疚语境保留。

本轮最终源码指纹和任务回执是一次交付的证据，不适用于之后的改版。不要重跑promote.py覆盖既有旧包；它遇到已存在的旧包会停止。GitHub保存不等于站点发布。
