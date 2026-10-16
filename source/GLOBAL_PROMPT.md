2026-10-16本轮：第二章0.5按第一章优化64场对白审读、任务交接和寄卖格子详情；第一章1.6普通怪生命增加50%，精英/Boss增加150%至2.5倍，旧档按残血比例迁移。实现、验收结果及默认包回执见docs/c2-optimization/ACCEPTANCE.md与docs/c1-endurance/ACCEPTANCE.md；真人文风/难度/节奏待验。原主线结果和后章保持，未发布网站。

2026-10-14当前交付：前三章RPG体验升级（R01—R03），第四至八章按用户最新指令暂缓。战斗成长、地下探索、任务结果、真实设施与安全剧情触发已实施；技术证据及真人待验见../docs/rpg-experience/ACCEPTANCE.md。默认离线入口为qa-export/release-build/Ashen-V28.1-Play.html；旧包保存在qa-export/release-build-before-rpg-three-20261014，文件名沿用旧版。GitHub保存与网站发布分开；下面旧记录保留为历史。

# 项目指令定位

当前用户进一步授权第一章0.9跨层多怪目标、互通通路、入图刷新与通用规则。采用稿docs/harness/CHAPTER_01_LAYER_RULES.md；固定游戏设定docs/harness/GAME_SETTINGS.md纳入Harness：默认主线、金叹号/灰问号/金问号、无明面爆率、自然门禁、任务无关常驻刷新。0.8以下内容为保留基线，0.6独立人工节奏验收仍待办。

唯一执行入口为根 AGENTS.md。当前状态在 CURRENT_STATE.json，按任务检索 docs/harness规则和 .agents/skills；不要求每次读完整历史。恢复范围以 BACKUP_STATUS.md为准，版本以当前代码与发布回执为准。旧入口原文保留在 docs/harness/history，不作为重复权威。

叙事工作统一执行NARRATIVE_WORKFLOW与NARRATIVE_HARNESS：先明确当前事件，再恢复人物与关系、各自知识及玩家揭露上限；STYLE_ONLY参考不可正史化；源码/章稿改变后重新索引、审查漂移并保存七维编辑证据。2026-10-14本轮升级仅改Harness资料与工具，不授权顺带重写运行剧情。


当前第一章新增授权：0.6，任务c1-expansion-20261012，DEV_FROZEN。允许五图、任务与成长系统，须遵守docs/harness/CHAPTER_01_EXPANSION.md；第二章策划不实装，旧大重构暂停。

上次授权为0.7，任务c1-map-quests-20261012，采用docs/harness/CHAPTER_01_MAP_QUESTS.md：全面整理第一章17图，清理杂乱交互，击杀/70%掉落/随机采集，接任务后出现交互，实际可交付才显示金问号。保留0.6固定成长奖励与用户接受的三精英短战，不重做第二章；旧0.6人工观察与节奏验收独立待办。

2026-10-12追加、当前最新授权为0.8，任务c1-story-world-20261012，采用docs/harness/CHAPTER_01_STORY_WORLD.md：第一章22图，扩建地下试炼与安全营地，6位新NPC及支线，生成的场景图片与文字方位，显式接取/回报、可交付金问号，普通讨伐8个。保留原0.6成长预算/三精英与0.5剧情，新增支线奖励另列；0.6人工验收仍独立，不自动恢复旧重构。
