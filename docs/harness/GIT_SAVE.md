# Git 保存与恢复细则

GitHub `https://github.com/YuxiangLiu-lyx/Ashen` 的 main 已长期授权正常推送，不重复询问。保留别的平台 origin，可以另设 github。开工检查 status、remote、HEAD，fetch该远端；干净可快进才 merge --ff-only，有未提交工作/分叉先保护并整合。大型改动用安全分支或 worktree，主整合者统一提交。禁止 force push、reset --hard、clean 覆盖现场。

保存运行代码、工具、锁文件、全部文案、状态与 QA，以及图片原件、衍生图、映射和生成说明。校验过的现有分卷已保存对应字节，展开的原始图片无需重复打包，但不能因显示未跟踪而删除/忽略；修改或新增字节必须单独跟踪。超限使用已验证 LFS 或完整外置固定版本、哈希与恢复说明，不静默排除。凭据、私有 env、个人存档不入库。

结束更新 source 状态/限制/progress、任务证据和 docs 验收，保留旧记录；审查 diff、untracked、ignore 及 staged 内容后提交真实改动，整合到 main并推送。推送后用 ls-remote核对HEAD；若远端又前进则fetch并检查本轮提交是其祖先。只有这项验证通过才报告“已上传”。没有新增内容不造空提交。

失败保留本地提交和所有文件，记录原因、待上传分支/SHA，必要时 git bundle（LFS另存），明确“未完成远端同步”。产品/平台/运行源码/文档备份提交分别记；GitHub保存、CI、浏览器QA、站点发布互不替代。未请求站点发布时不运行 tools/web_play_ci.py 的 publish/record。

原版本入口的完整规则保留于 docs/harness/history/AGENTS.md，供追溯，不是另一套现行入口。本流程不是后台自动同步配置。
