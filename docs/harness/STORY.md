# 剧情与角色约束

当前人物文本及迁移层为 chengli-text-v27、dialogue-runtime-v16、Saga V26 和其 text/chains/staging。先查具体场景 ID、运行对白和触发条件，按 router 结果读取少量资料。历史 delivery/候选文案不是现行权威；未取回的最新 source 稿明确缺失，不凭猜测补写。

诺恩、艾莉娅、澄璃的身份、知识与关系必须遵守现有场景知识边界，圣女在场时不提前揭露角色尚未知的真相。FUTURE_ONLY 构思只有用户授权后才能实装。对白改动同时检查已存 pending/行号迁移、演出节拍、坐席和小立绘。

第八章大图在注册/展示/预加载均禁用；小立绘、对白、任务和演出保留。原 CG 不删除，保留归档原件。章节测试种子只用于验收，不把其无敌 preview 行为用于平衡实验。

## 新叙事重构的接入

用户已指定大重构方向；长期世界观是 [WORLD_VISION](WORLD_VISION.md) 的可选参考，区分确定方向、建议与待完善事项。它不是所有剧情任务的必读全文。 [NARRATIVE_ARCHITECTURE](NARRATIVE_ARCHITECTURE.md) 保存分卷分章架构和固定登记；每章开发前遵循 [NARRATIVE_WORKFLOW](NARRATIVE_WORKFLOW.md)，读取对应完整稿并记录采用版本。

第一、二章的新方案分别为 [CHAPTER_01](CHAPTER_01.md)、[CHAPTER_02](CHAPTER_02.md)，第一章开发入口为 [prompt](CHAPTER_01_DEVELOPMENT_PROMPT.md)。本轮这些资料尚未改变运行游戏。开发第一章时，以用户新方向与采用的本章稿为变更依据，允许替换该范围内的旧剧情；未开发部分继续按当前代码描述事实。不得为维护旧文本而否决已授权的新方向，也不得把第一章授权扩大成重写全游戏。

2026-10-10回滚记录：用户已明确恢复重构前V30（1cefe80），空间/对白/首章试点均暂停。以上章稿和开发方向保留为历史策划，不自动重新授权实施；现场6b388c7。
