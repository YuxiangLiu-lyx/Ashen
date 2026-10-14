import json,runpy
from pathlib import Path
p=Path(__file__).resolve().parent
before=json.loads((p/'baseline/FULL_SCAN.json').read_text());after=json.loads((p/'CURRENT_SCAN.json').read_text());entries=json.loads((p/'SCRIPT.json').read_text())['entries'];notes=runpy.run_path(str(p/'editorial-notes.py'))['NOTES']
lines=['# 全部现有对白：否定祈使专项记录','', '范围为第一至八章当前安装的主线、支线、日常和动态对白。扫描 609 个静态登记场景与 107 个动态提供者变体，共 716 个键、5436 行；部分内联调用有同文别名，不能称为 716 个独立剧情事件。旧迁移文本不计入当前对白。', '', '完整前后稿见 SCRIPT.json；111 个采用场景共修订 167 行，其中 99 个静态场景、12 个动态提供者。两个调用别名随真实提供者同步，导出差异共113个键/169行。只改说法，页数、说话人、事件结果、任务奖励与知识范围保留。', '', '统计用来找风险，不能作为文学评分。重点处理关心、教学、送别、任务收尾中的重复训诫。正常拒绝、操作要求、危险警告、陈述和询问均可保留，不追求清零。', '', '## 分布', '', '| 指标 | 修改前 | 修改后 |','| --- | ---: | ---: |']
for label,k in [('含候选的场景变体','candidate_scene_count'),('候选行','candidate_line_count')]:lines.append(f'| {label} | {before[k]} | {after[k]} |')
lines+=['','| 句式候选次数（单行可多次） | 修改前 | 修改后 |','| --- | ---: | ---: |']
for k in ['别','别总','别再','别把','别让我','不要','不必','无需','不用']:lines.append(f'| {k} | {before["forms"].get(k,0)} | {after["forms"].get(k,0)} |')
lines+=['','| 说话人候选行 | 修改前 | 修改后 |','| --- | ---: | ---: |']
for name,n in sorted(before['speakers'].items(),key=lambda x:-x[1])[:12]:lines.append(f'| {name} | {n} | {after["speakers"].get(name,0)} |')
lines+=['','完整逐场分布和邻近/跨说话人重复记录见 baseline/FULL_SCAN.json 与 CURRENT_SCAN.json。原稿高频与修订后的残余都保留，方便继续按场景评读。','','## 典型修订','']
for key in ['sisterBeforeDeparture','ch5CareerTeach','ch5SmithDaily','c6v26BorrowedRoofIntro','v25C8Table']:
 e=next(e for e in entries if e['key']==key);lines+=['### '+key,'',notes[key],'','| 人物 | 原句 | 修订句 |','| --- | --- | --- |']
 for a,b in zip(e['before'],e['after']):
  if a!=b:lines.append(f'| {a[0]} | {a[1]} | {b[1]} |')
 lines+=['']
lines+=['## 集中出现但保留的场景','', '| 场景 | 判断 |','| --- | --- |','| ch4V13Rescue | 救援中撤退、保留伤者体力和拒绝掩盖死亡责任各有实际目的；玛尔塔并非日常说教。 |','| c7v25Odric | 断轴车将倾覆，阻止推车、调换拆门顺序、让人散开都是即时救援指令。 |','| ch3RescueCart | 取链会使黑灰恶化，移上车板时需托肩抬腿、固定身体；同一医护操作者连续发指令合理。 |','| ch2InnerDoor | 诺恩和艾莉娅正在争夺开门/拉铃的行动权，拒绝、警告、命令体现冲突。 |','| ch3SaltGrotto | 盐壳下方空洞且有敌人，双方需要互相制止危险移动。 |','', '已修改场景的每条剩余候选均有具体保留理由，见 retained-notes.py 与 reviews 中的 negative_imperatives。上述高频场景保留不是因字数达标，也不意味着日常段落可套用同样语气。', '', '## 全部改句索引','']
for e in entries:
 lines+=['### '+e['key'],'',notes[e['key']],'','| 页（从1计） | 人物 | 原句 | 修订句 |','| --- | --- | --- | --- |']
 for i,(a,b) in enumerate(zip(e['before'],e['after']),1):
  if a!=b:lines.append(f'| {i} | {a[0]} | {a[1]} | {b[1]} |')
 lines+=['']
lines+=['## 验收边界','', '全库扫描、生产者精确对照、旧全文迁移、逐场编辑判断与真人文学评价是不同证据。111场已按完整上下文编辑；其余通过扫描定位、重点查看高密度风险，不宣称全部逐句重新创作。后续章原有认知记录的缺口保持明确，未把文风审查当成新正史。人类文风、亲昵分寸、游戏节奏与视觉偏好仍待玩家反馈。','']
(p/'DIALOGUE_REVIEW.md').write_text('\n'.join(lines))
