# Game Balance Lab v1

Node22+即可执行，无第三方运行依赖。浏览器与Node共享simulator，直接导入完整已安装的RPG；无第二套伤害/AI解释器，正式dist本轮不改。支持三基础职业与九转职的显式Build、实际敌人、真实地图、随机种子、基础/新手/连招/防御四种输入策略、资源/冷却/状态/伤害事件、统计与可解释候选搜索。

```bash
node tools/balance_lab/run.mjs combat --config tools/balance_lab/examples/shadow-captain.json --seed 42 --trials 20 --output qa-export/shadow-captain
node tools/balance_lab/run.mjs combat --matrix --trials 20 --output qa-export/class-matrix
node tools/balance_lab/run.mjs effects --query bleed --output qa-export/bleed
node tools/balance_lab/run.mjs search --config tools/balance_lab/examples/shadow-captain.json --evaluation tools/balance_lab/examples/evaluation.json --trials 20 --output qa-export/candidates
node tools/balance_lab/run.mjs economy --path partial --seed 42 --output qa-export/economy
```

result.json保存HEAD、dist Git tree、全部runtime/Lab文件内容SHA256、Node版本、参数、每次种子、策略、事件与指标。未提交代码由内容哈希追溯，不把HEAD伪装成包含修改。REPORT.md及JSON校验值便于阅读/核查。固定参数/种子时，实验数据可重复（元数据的执行时间/HEAD/dirty可能变化）。普通装备含Date.now生成ID，Lab仅在获得时规范随机ID，不改属性/随机次数；固定任务与稀有ID保留。

战斗统计含胜率及Wilson95区间、胜场TTK的p10/median/p90、伤害/承伤/DPS/一秒爆发/MP/护盾/技能次数/状态和失败超时。有效伤害去除过杀，嵌套proc只计一次；飞行弹技能来源尚未完全归属，标为unattributed-projectile，不假装技能收益精确归因。新手/防御仅脚本策略，不能冒充真实人群水平；固定dt含真实hitstop，瞬时击杀量化到一个dt，不把其高DPS外推。

effects从实际skill/enchant/career/set/drink/rareGear表导出效果、施加消耗边、冷却组、条件伤害和已知递归护栏。基础技能语义标注不完整；静态图不能证明未来任意联动没有无限循环，行为测试覆盖已知storm/enchant/reprisal排除和冷却。阴影基础bleed四层与血刃careerBleed三十层分别输出。

search用相同种子范围枚举候选，默认六个主武器词条，或--candidates传显式配置列表。evaluation可配置胜率、TTK、生存权重及byClass权重，不强制职业同DPS。candidate.json仅输出建议，不写dist。矩阵场景可改等级/装备/技能，但不声明这些起始Build已由任务路线验证取得；激活五项限制、职业/技能rank及属性预算会被检查。

economy是第五章事件账本基础：main仅城市/出口奖励子集，partial一条支线，collection三支线和套装尝试，grind六十次真实击杀奖励，failures二十次伤势/药水尝试。奖励、claim重试、支付、物品、掉落和gainXP实际调用RPG。提供路径明确注入的材料前置、表内价格/制作/消耗品及1–32升级曲线，记录资源不足和未成功动作。它未模拟八章路线可达、完整主线奖励、全部材料采集、失败概率或全部装备最优组合，不能用结果替代真实通关。

V28测试覆盖tier分界、高等级玩家回旧图、生成层与击杀层不同、持有/队列排重、剧情/试炼排除、每敌人一次、满包和旧档残血迁移。实际高等级玩家可在旧图掉后层装备，本轮保留并记录，未授权不重新平衡。

代表性证据：docs/balance-lab/experiments；测试：tests/balance-lab.test.mjs和browser-balance-lab.mjs。已知范围之外包括：自动全八章路径、真实玩家能力模型、完整技能因果归因、任意代码的循环证明、全装备组合优化、直接应用候选数值。新增场景优先扩展同一运行核心。
