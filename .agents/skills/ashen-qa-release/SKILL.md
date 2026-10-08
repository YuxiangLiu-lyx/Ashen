---
name: ashen-qa-release
description: 执行 Ashen 集成测试、构建恢复、发布验收或交付保存时使用；单一内容修改只使用其领域 Skill。
---

执行根 AGENTS.md，先运行 `python3 tools/harness/context.py --task "用户的具体需求"`；示例领域：集成 发布 验收。索引过期先更新并复核语义，再读取返回入口与调用者。

按需读 [领域约束](../../../docs/harness/WORKFLOW.md)，存档受影响时读 [SAVE](../../../docs/harness/SAVE.md)。check.py --recommend 后执行适当 tier；release 做原件校验、离线构建与真实 UI 浏览器测试。read GIT_SAVE.md，核对产品/平台/运行源码/备份提交；失败日志保留，不能将旧QA当本轮结果。只有用户请求发行才部署站点；正常GitHub保存已有授权。

用 task.py 持续记录验收、决定、下一步和真实子进程证据；按 router/test recommendations 验证。本 Skill 不扩展用户授权范围，不把未执行检查写成通过。
