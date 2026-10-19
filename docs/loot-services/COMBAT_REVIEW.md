# 现有战斗基线与本轮差异

基线源：1559519；三职业、12 个第一章和 24 个第二/三章既有真实规则场景。原始 fixture 保留，新期望另存 loot-services-*。

普通怪近战起手范围覆盖主角近战边缘，升级恢复满血；HP、招式伤害和精英/Boss规则保持。脚本输入为固定策略，不能替代真人难度体验。

- c1 / oath / wolf：remainingMP: 55.055338 → 35.055338
- c1 / oath / guard：remainingMP: 55.055338 → 35.055338
- c1 / ember / rat：仅事件时间/地面结算记录变化
- c1 / ember / wolf：elapsed: 5.575 → 5.675；ttk: 5.575 → 5.675；dps: 118.923767 → 116.828194；remainingMP: 142.2625 → 116.838625
- c1 / ember / guard：elapsed: 5.6 → 5.675；ttk: 5.6 → 5.675；dps: 120.535714 → 118.942731；remainingMP: 142.28 → 116.838625
- c23 / oath / hellHound：remainingMP: 68.013362 → 57.013362
- c23 / oath / hellSoul：remainingMP: 70.013362 → 59.013362
- c23 / ember / guard：仅事件时间/地面结算记录变化
- c23 / ember / wolf：仅事件时间/地面结算记录变化
- c23 / ember / hellHound：elapsed: 7.2 → 7.55；ttk: 7.2 → 7.55；dps: 130.138889 → 124.10596；peakOneSecondDamage: 684 → 590；remainingMP: 276.564425 → 259.935425；mpSpent: 41 → 58；uses: {'q': 2, 'attack': 10, 'e': 1} → {'q': 2, 'attack': 10, 'e': 2}；damageByKind: {'dot': 333, 'proc': 137, 'skill': 467} → {'dot': 412, 'proc': 137, 'skill': 388}；damageBySource: {'dot': 333, 'e': 416, 'unattributed-projectile': 188} → {'dot': 412, 'e': 431, 'unattributed-projectile': 94}
- c23 / ember / hellSoul：elapsed: 1.075 → 1.175；ttk: 1.075 → 1.175；dps: 786.046512 → 719.148936；remainingMP: 316.152825 → 316.266825
- c23 / ember / hellGuard：elapsed: 4.1 → 4.175；ttk: 4.1 → 4.175；dps: 414.878049 → 407.42515；remainingMP: 329.58345 → 329.67045；damageByKind: {'dot': 113, 'hit': 987, 'proc': 163, 'skill': 438} → {'dot': 119, 'hit': 981, 'proc': 163, 'skill': 438}；damageBySource: {'dot': 113, 'unattributed-projectile': 1097, 'e': 491} → {'dot': 119, 'unattributed-projectile': 1091, 'e': 491}
