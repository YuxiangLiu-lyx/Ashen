# 存档兼容

产品 V28.1 与 snapshot schema 15 不等价；restore 仍兼容旧 schema 2–15。最终 snapshot/restore 被多个章节与保护层包装。不要仅更改 core 的局部实现就认定所有调用者已更新。

保留 quest/claims、actor 独立成长、共享 bag/items/gold、一次性 escrow、pendingRewards、刻印 actor.cd 和 V28 残血比例迁移。临时输入/角色引用存在 WeakMap，不进档。UI 导入验证由 save-transfer/save-protection 执行；真实 roundtrip 是必要验证。

测试用合成内存 fixture 或临时 Chrome profile；禁止把用户 localStorage、导出存档、私有 .env 或凭据提交。原域名与 localhost 的个人存档不会自动共享。
