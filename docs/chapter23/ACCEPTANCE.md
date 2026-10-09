# V30 第二、三章地图与敌人优化

在V29探索机制、V30首章表现之上接续开发，基线为`9eb851c9265eb80b8a770ae0ccb7e438d07d6b5e`。覆盖第二章9图、第三章14图，包括两张第二章支线室内和第三章三张中间区域。产品仍为V30；本轮没有发布网站。

## 实际变化

- 第二章：驿站、旅店、灰桥、庄园、泄水沟、流放界口、庄园内室、桥下收费室、守井石室推广既有V30建筑、家具、地板与守卫画稿；主路线改为沿既有通路绘制的磨损路面，补上桥岸、接地阴影、灯光和室内地毯。
- 第三章：保留本章原图和每张图的分路布局，地表采用镜像拼接与低对比混合，路径边缘柔化；营地暖色、盐窟青灰、焚风暖灰、裂隙偏紫，矿道新增断轨，首领场地补地面磨损痕迹。入口与交互提示沿用第一章的靠近显示方式。
- 敌人：第二章守卫接入既有16帧方向/攻击图集；第三章沿用原生物种和原画帧，补身体蓄势、受击、倒地与攻击后的收势。猎犬、亡魂、重甲采用不同身体运动幅度；取消这些地图上后来叠加的几何饰件。首领倒地只施加一次旋转。
- 修复灰桥水壶交互点落在墙体碰撞内的问题：`(1040,525)`→`(1040,495)`，新档和已经访问灰桥的旧档都适用，保留物件used、领取状态和敌人死亡结果。旧档schema仍为15。

[23图滑动对照与敌人画廊](visual-review.html) · [计划和基线诊断](REVIEW_AND_PLAN.md) · [资产复用与SHA256](ASSET_REUSE.json)。没有新增或替换原始图片字节；不是全新怪物动画图集。第二、三章使用独立的显式地图范围，不影响回忆村庄和后续章节各自的表现。

## 已执行验证

最终源码指纹：`5745f39a845d75b20f98f6a55db55f769550d5833d12296effecdbaa4ec4fb84`。检查执行期间源码保持不变。

- fast：15项Harness检查通过。
- core/integration：195个运行模块语法解析、116张原图字节校验、69项Node测试全部通过。
- 新专项：23图真实碰撞泛洪、所有可见交互点、原出口/锁定门、spawn和网格与修改前逐项对照；仅原灰桥水壶诊断被精确修复。旧导航基线原件未改。
- 战斗：三基础职业对第二、三章8类敌人的24组固定种子实验，完整伤害、资源、冷却、掉落与RNG事件和修改前一致。它们是独立合成遭遇，不是章节胜率或通关证明。
- 真实Chrome：16项通用表现检查、282次资源请求，无未捕获异常；14组浏览器/Lab完整战斗事件一致。第一章11图、磨坊四图任务链往返与保存恢复通过。
- 本轮Chrome：23图全景、8类敌人各6种姿势；真实鼠标点击灰桥水壶进入原对白、用键盘完成对白，领取flag及序列化恢复通过。回执在[CAPTURE](after/CAPTURE.json)，全景使用固定镜位、隔离静止场景。

- 打包：离线file、HTTP站点、手机横屏三个实际UI用例通过，离线用例没有运行期HTTP请求；[UI回执](qa/WEB_QA.json)、[构建输入与哈希](qa/WEB_BUILD_MANIFEST.json)。

完整日志在`docs/harness/evidence/ch23-world-20261009/`。首次测试中的JSON省略undefined字段及snapshot活引用问题已修正为实际序列化往返，失败日志保留。第一轮画面保留在`first-pass/`；早期截图期间发生源码变化的回执没有计作最终通过结果，最终以integration回执及`after/`为准。

## 范围与限制

本轮没有改变地图碰撞、敌群位置/数量、任务ID、剧情文本、AI攻击时序、战斗数值和奖励。灰桥交互锚点是坐标修复，不是地图拓扑改变。地表路线负责视觉引导，真实通行仍由原有碰撞与寻路规则决定。

现有树木、岩石、建筑轮廓仍有复用；地狱怪物仍使用原四帧画稿和身体变换，并未重画完整多方向动画。没有做第二、三章从开头到结尾的连续人工通关，不宣称全八章或完整发行验收。V29历史未完成任务保持独立，本轮没有将其补写为完成。

## 复现

```sh
python3 tools/harness/check.py --tier integration
node --test tests/chapter23-v30.test.mjs
node tests/browser-chapter23.mjs
.venv/bin/python tools/build_web_play.py --output qa-export/chapter23-build
CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' .venv/bin/python tests/browser-web-play.py --build qa-export/chapter23-build --out qa-export/chapter23-packaged-ui
```

打包依赖沿用`requirements-qa.lock.txt`。离线文件名为兼容旧下载沿用`Ashen-V28.1-Play.html`，实际内容版本以构建清单和标题的30为准。构建清单如实记录基线HEAD及dirty=true，并通过运行输入哈希关联本轮改动，不冒充已经发布的网站版本。

Git保存：实现提交[`95ddeb3`](https://github.com/YuxiangLiu-lyx/Ashen/commit/95ddeb39be5ada127a8994a0f15034ffe7660bdc)已推送GitHub main，并以ls-remote核验一致。[同步回执](GIT_SAVE.json)。后续回执/任务归档提交不改变已验收的源码指纹。未发布网站。
