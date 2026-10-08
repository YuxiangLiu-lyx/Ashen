# 已验证示范区的接续约束

V29仅重新设计road/millpath/echo/workshop，地图与出口坐标系仍1600×1080。其他114图不据此认定已经重构。配置在configureWorld最后执行；world-runtime在表现/碰撞installer之后安装。布局/路线/地标在world-design，渲染在world-art，新对白在world-dialogues；不得在核心循环重复堆特例。

新增交互采用worldInteractionV29显式接入，站在interactX/Y附近且clearLine才开始，朝向物件，短操作结束再调用原useProp；移动、技能、攻击、受伤和切图可中断。临时操作保存在WeakMap，不保存半完成领奖。纯装饰仍不加入targets。向其他图推广前要验证交互点在物件碰撞外、实际截图和既有结果；本轮仅另接入客房的三项既有交互。

echo任务ID、机芯物品、原XP/金、炼洗章门槛、前槽卷筒/指环二选一保持。新档击败warden只标记清场进度，清稳周围并读检修簿后亲手取后槽机芯，先取机芯才能开前槽。旧echoCoreFound/items.echoCore/echo done档免除新条件。不得给旧档补领第二份机芯、改动echoChoice或强行重播新对白。新文本用新ID，保留旧对白游标。

flags.worldV29仅有schema:1和seen线索ID列表，状态读自原flag/quest。布局迁移按稳定spawn ID只在首次ensure/restore运行，旧死亡结果保留；移除的多余刷怪标记退休，不发击杀奖。echo遭遇never刷新，完成后返回仍安静。schema15兼容范围不变；不要为了内部小状态随意升档或重命名任务。

验证：world-v29.test.mjs + browser-world-v29.mjs。后者在隔离档中一次建立Lv3旧短刃起点，后续真实更新、普通战斗、鼠标/键盘交互、地图门与读档；不得偷偷伤害敌人或免伤后声称正常通关。--baseline仅全景截图，--audit-only抓其他代表图，不运行任务。world_audit用真实碰撞的网格泛洪和活动半径作诊断，quiet估计不是实测游玩时间；不能用最大密度优化覆盖率。所有视觉验收另看图，错误/初稿也保留在docs/v29。
