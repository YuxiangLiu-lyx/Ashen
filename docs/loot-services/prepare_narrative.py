import json,subprocess
from pathlib import Path
read=lambda p:json.loads(Path(p).read_text())
def write(p,x):Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
scenes=['intro','c1HuntOffer','c1HuntProgress','c1HuntReport','c1Talk_c1ExitDrill_offer']
allrows=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import './dist/core-v14.js';import {DIALOGUES} from './dist/data-v14.js';console.log(JSON.stringify(DIALOGUES));"],text=True))
rows={s:allrows[s] for s in scenes};write('docs/loot-services/STORY_BEFORE.json',rows)
for k,v in rows.items():
 if k.startswith('c1Hunt'):
  for line in v:
   if line[0]=='鲁恩':line[0]='赏金猎人'
rows['c1HuntOffer'][0][1]='这张悬赏单你看看。地下两名旧看守一直妨碍维修，郊外还有三头凶兽，运货的人吃过几次亏。'
rows['c1Talk_c1ExitDrill_offer'][4][1]=rows['c1Talk_c1ExitDrill_offer'][4][1].replace('鲁恩另外托人办的事','赏金猎人挂出的另一份悬赏')
write('docs/loot-services/SCRIPT.json',{'revision':'1.7','status':'DEV_FROZEN','scenes':rows})
p=Path('docs/harness/CHAPTER_01_LOOT_SERVICES.md');p.write_text('''# 第一章采用稿1.7：任务交接和服务角色

状态：DEV_FROZEN。任务 loot-services-20261019。方向来自2026-10-19用户需求，接续1.5人物流程、1.6耐久；原全文和主线结果保留。

开场intro仍由奥伦与诺恩原七句完成，进入剧情时直接标记rats为active；不再去奥伦处重听接取对白。旧档已经接取/完成不重置，未接取的开场旧档在恢复时接续。回看不重做奖励。

会馆新增固定赏金猎人(c1hunter)，位于中央东侧可达地面(855,385)。他发布和结算五处隐患；原鲁恩保留传令、试炼安排和幕后私谈。三场悬赏对白保留目标、页数、结果及原任务ID；说话人改为赏金猎人，开头直接展示悬赏单；伊登地下试炼说明中的另一份委托同步指向赏金猎人。五处仍是两地下看守和三郊外凶兽，不包含终试执卫。领取80经验/60金一次。

逐句采用稿：docs/loot-services/SCRIPT.json。保留完整主线以CHAPTER_01_CHARACTER_FLOW.md及实际安装DIALOGUES为准。商人/赏金猎人在各自出现地图使用固定美术；伊登/赫莎/维恩仅换衣着与绘制风格，任务与人物关系不变。

知识：悬赏目标和地点属于公开任务信息，赏金猎人负责悬赏与回报，诺恩通过现场交流获知；双方不增加私交、不获得薇蕾娜/鲁恩幕后信息。原圣女、暗杀动作、章界及后续人物认知不变。

存档：保留任务ID、已击杀集合、pending游标和奖励记录；旧正在播放的悬赏文本可继续，结束动作与新发布者兼容。服务角色按固定ID补入已访问地图，不重复添加。

验收：新开局/旧档、五目标接交不重复、鲁恩选项清除、猎人任务标记与寻路、人物原画/实际帧/肖像及地图三维；真人审美与文风待验。
''')
sources=read('source/narrative/sources.json');sources['sources']['loot-services-plan']={'path':str(p),'anchor':'# 第一章采用稿1.7','kind':'adopted_plan'}
profile=read('source/narrative/characters/iden.json');profile.update(id='bounty_hunter',name='赏金猎人',aliases=['赏金猎人','c1hunter'],sources=['loot-services-plan'],runtime_scenes=['c1HuntOffer','c1HuntProgress','c1HuntReport']);profile['identity']['summary']='受理公开精英悬赏、核对目标并结算报酬的固定赏金猎人。';profile['voice']['guidance']='直截了当谈目标、位置和工钱；与诺恩初识，没有旧交语气，不知会馆秘密。';profile['voice'].pop('chapter_one_1_1',None);profile['initial_state'].update(emotion='平静，关注悬赏进度。',goals=['把五处隐患的委托交给能处理的人。']);write('source/narrative/characters/bounty_hunter.json',profile)
cat=read('source/narrative/catalog.json');cat['characters'].append({'id':'bounty_hunter','name':'赏金猎人','aliases':['赏金猎人','c1hunter'],'path':'source/narrative/characters/bounty_hunter.json','coverage':'partial'});write('source/narrative/catalog.json',cat)
b=read('source/narrative/chapters/R01.json');write('docs/loot-services/NARRATIVE_BEFORE.json',b)
for e in b['events']:
 if e['scene'] not in scenes:continue
 k=e['scene'];e['summary']='；'.join(a+'：'+t for a,t in rows[k]);e['sources']=['loot-services-plan'];e['loot_services_revision']='1.7'
 if k.startswith('c1Hunt'):
  e['participants']=['bounty_hunter' if a=='rune' else a for a in e['participants']]
  for g in e['grants']:
   if g['actor']=='rune':g['actor']='bounty_hunter'
 for f in b['facts']:
  if f['id'] in [g['fact'] for g in e.get('grants',[])]:f['summary']=e['summary'];f['sources']=['loot-services-plan']
for f in b['facts']:
 if 'C1HUNT' in f['id']:f['summary']=f['summary'].replace('鲁恩','赏金猎人');f['sources']=['loot-services-plan']
write('source/narrative/chapters/R01.json',b);write('source/narrative/sources.json',sources)
mods=read('source/harness/modules.json');new={'economy':['dist/ground-loot.js','dist/commerce-ui.js'],'save':['dist/ground-loot.js'],'ui':['dist/commerce-ui.js'],'art':['dist/service-character-art.js'],'chapter01_plan':[str(p)]}
for m in mods['modules']:
 if m['id'] in new:m['entries']=list(dict.fromkeys(new[m['id']]+m['entries']));m['tests']=list(dict.fromkeys(m['tests']+['node --test tests/loot-services.test.mjs']))
write('source/harness/modules.json',mods)
