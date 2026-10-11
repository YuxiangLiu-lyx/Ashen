# 剧情与角色约束

当前人物文本及迁移层为 chengli-text-v27、dialogue-runtime-v16、Saga V26 和其 text/chains/staging。先查具体场景 ID、运行对白和触发条件，按 router 结果读取少量资料。历史 delivery/候选文案不是现行权威；未取回的最新 source 稿明确缺失，不凭猜测补写。

诺恩、艾莉娅、澄璃的身份、知识与关系必须遵守现有场景知识边界，圣女在场时不提前揭露角色尚未知的真相。FUTURE_ONLY 构思只有用户授权后才能实装。对白改动同时检查已存 pending/行号迁移、演出节拍、坐席和小立绘。

第八章大图在注册/展示/预加载均禁用；小立绘、对白、任务和演出保留。原 CG 不删除，保留归档原件。章节测试种子只用于验收，不把其无敌 preview 行为用于平衡实验。

## 当前剧情记录与局部增强

用户已确定宏大叙事的长期方向，当前实施范围已经收缩；长期世界观是 [WORLD_VISION](WORLD_VISION.md) 的可选参考，区分确定方向、建议与待完善事项。它不是所有剧情任务的必读全文。 [NARRATIVE_ARCHITECTURE](NARRATIVE_ARCHITECTURE.md) 保存分卷分章架构和固定登记；每章开发前遵循 [NARRATIVE_WORKFLOW](NARRATIVE_WORKFLOW.md)，读取对应完整稿并记录采用版本。

第一章现行0.4见 [CHAPTER_01](CHAPTER_01.md)，第二章0.3见 [CHAPTER_02](CHAPTER_02.md)。用户已撤下0.3新增分镜表现：原刺杀对白/地图内动作保持，新增幕后片段复用普通对话框、黑影与简短台词，未知人物没有身份描述；人物/地图/交互优化保留。旧开发prompt不再是现行入口。必须兼容原pending与旧尾段游标、只执行一次原提交，不新增圣女实战，不扩大到第二章。
