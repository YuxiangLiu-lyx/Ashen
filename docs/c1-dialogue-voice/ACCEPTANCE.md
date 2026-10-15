# 第一章试炼对白口吻修订

任务c1-dialogue-voice-20261015；基线bafee2e；本次是1.4三场对白的口吻修订。用户指出原文仍像任务流程复述，当前按Harness范例B的自然接话方式重写。完整采用文字见 [SCRIPT.json](SCRIPT.json)，原文及写作前上下文保存在before。

薇蕾娜明确说明进城带人的风险、想看看多年训练的成果，然后安排鲁恩和伊登负责的试炼；诺恩答“知道了”。后半由留饭和等他回来接日常玩笑。试炼期间说明人员安排；回报简述执卫，薇蕾娜关心有无受伤，两人吃饭后说明装备材料。没有把风格样本中的宴会和衣服加入故事。

只有c1TrialInvitation、c1TrainingReason、c1TrialReport变化，另外723个静态/动态语料条目精确保持。16/5/19页、说话人、木屑/吃饭/回桌的动作节点、提交点保持。旧档已经在播的自带全文继续原段；新触发的对白使用修订稿。后续章节、地图、战斗、奖励和设施逻辑未改。

本轮技术结果：

- 67项Harness检查、48项相关回归通过，包含当前采用稿精确对照、试炼授权顺序、回看只读、事务一次性及前一版真实全文旧档接续。
- 153页×三视口（1440×980、844×390、390×844）实际对话框检查通过；鼠标、触摸、键盘、回看、重新载入及动作不可跳过通过。实际截图位于reader。
- 三场写作前上下文和修改后七维审查已挂接任务；非机械“先/再”表达、简单答应和日常调侃的原则补入DIALOGUE_STYLE。编辑判断不代替用户对文风的评价。
- 新包离线/HTTP/手机验证通过。默认入口已提升至`qa-export/release-build/Ashen-V28.1-Play.html`，旧包完整保留在`qa-export/release-build-before-dialogue-voice-20261015`。5174服务的241个JS、7个CSS与当前源码逐字节一致。

证据见 [CHECKS.json](CHECKS.json)、[CORPUS_COMPARISON.json](CORPUS_COMPARISON.json)、[DEFAULT_BUILD.json](DEFAULT_BUILD.json)、[LOCAL_SERVER.json](LOCAL_SERVER.json) 和任务日志。最终源码指纹`104360d298474baa90041b7e609d77907f868807b30bdf1de778a9d3c4a44366`。

范围只涉及一个对白数据文件；推荐器因反向导入提示的全战斗、地图及发行集成不代表本次需要重做所有系统验收。本次执行fast、实际对白/旧档专项、浏览器和新包验证，未宣称重跑完整integration或真人通关。文风是否符合用户预期仍待试玩反馈；历史0.6人工门禁保持，网站未发布。GitHub保存回执见GIT_SAVE.json。
