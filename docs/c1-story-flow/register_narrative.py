"""Register this authored chapter revision, preserving all previous events and sources."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
def read(p): return json.loads((root/p).read_text())
def write(p,d): (root/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
script=read('docs/c1-story-flow/SCRIPT.json');src=read('source/narrative/sources.json');book=read('source/narrative/chapters/R01.json');catalog=read('source/narrative/catalog.json');names={x['name']:x['id'] for x in catalog['characters']}
src['sources']['c1-story-flow']={'path':'docs/harness/CHAPTER_01_STORY_FLOW.md','anchor':'# 第一章采用稿1.1','kind':'adopted_plan'}
src['sources']['c1-current']={'path':'docs/harness/CHAPTER_01_STORY_FLOW.md','anchor':'# 第一章采用稿1.1','kind':'adopted_plan'}
src['sources']['runtime-c1-trigger']={'path':'dist/chapter-one-expansion-quests.js','anchor':'P.c1PrivateTalkTick','kind':'runtime','note':'新私谈在contract提交后真实离开hall触发；旧c1Tail由ChapterOneStoryFlow接续。'}
book['plan']={'path':'docs/harness/CHAPTER_01_STORY_FLOW.md','revision':'1.1','status':'IMPLEMENTED','implementation':'任务交代与真实离场私谈已接入；技术证据及真人待验见docs/c1-story-flow/ACCEPTANCE.md。'}
book['facts']=[f for f in book['facts'] if not f['id'].startswith('F-C1-FLOW-')]
book['events']=[e for e in book['events'] if not e.get('c1_flow_revision')]
for n,(scene,rows) in enumerate(script['scenes'].items()):
 if scene in ['contract','c1HiddenPairArrangement']:continue
 sid='flow:'+scene;fact='F-C1-FLOW-'+scene.upper();actors=list(dict.fromkeys(names[s] for s,t in rows if s!='旁白'))
 src['sources'][sid]={'path':'dist/chapter-one-quest-dialogues.js','anchor':'export const C1_QUEST_DIALOGUES','kind':'runtime','runtime_scene':scene}
 summary='；'.join(s+'：'+t for s,t in rows)
 book['facts'].append({'id':fact,'summary':summary,'truth':'world_fact','plane':'runtime','status':'RUNTIME','sources':[sid],'risk_terms':[]})
 at='R01:intro' if scene.startswith('c1Talk_rats_') else 'R01:canalStart' if scene.startswith(('c1Talk_c1CanalBreak_','c1CanalAlreadyClear')) else 'R01:contract'
 book['events'].append({'id':'R01:'+scene,'scene':scene,'order':100+n,'summary':summary,'participants':actors,'sources':[sid,'runtime-c1-actions'],'optional':True,'stage_window':[at,'R01:chapterEnd'],'grants':[{'actor':a,'fact':fact,'mode':'knows'} for a in [*actors,'player']],'state_changes':{},'relationship_changes':{},'trigger':'第一章对应NPC与任务前置下的choose；offer在最后一页接受、report在最后一页一次性结算。进度只提醒已接任务。具体前置见C1_QUESTS/C1_GIVERS及专项，不能按事件排列默认经历。','c1_flow_revision':'1.1'})
fact='F-C1-FLOW-PREPARATION';book['facts'].append({'id':fact,'summary':'诺恩无既定肩伤。薇蕾娜担心带人撤离时应付围堵的能力，安排鲁恩和伊登的试炼；另交代鲁恩封套交北街托马核对维护班次。','truth':'world_fact','plane':'runtime','status':'RUNTIME','sources':['scene:contract'],'risk_terms':[]})
for e in book['events']:
 if e['scene']=='contract':
  e['grants']=[g for g in e['grants'] if g['fact']!=fact]+[{'actor':a,'fact':fact,'mode':'knows'} for a in ['noen','vilerena','player']]
  e['grants'] += [{'actor':'vilerena','fact':f,'mode':m} for f,m in [('F-C1-COMMISSION','knows'),('F-C1-SEAL-INSTRUCTION','knows'),('F-C1-DOOR-CLAIM','heard')] if not any(g['actor']=='vilerena' and g['fact']==f for g in e['grants'])]
  e['state_changes']['noen']['goals']=['先进行庭院与地下试炼，核对维护身份和退路，再执行委托。']
 if e['scene']=='c1HiddenPairArrangement':
  e['trigger']='新旅程完成contract并真实从hall离场后，安全时切回hall；鲁恩走到薇蕾娜身边，诺恩不在场。旧contract.c1Tail保持原提交接续。'
  e['summary']='诺恩真实离开会馆后，鲁恩走到薇蕾娜身边；两人在会馆私谈，玩家看见，主角均未听到。'
book['gaps']=[g for g in book['gaps'] if '六鼠' not in g]
book['gaps'].append('1.1逐项登记任务事件；可选与条件事件需带真实完成时点，任务清单不表示所有NPC消息在章末自动共享。')
for who,guide in {'noen':'开场没有预设伤病；追问试炼目的并说明实战观察，接受准备不等于毫无判断。','vilerena':'关心源于此次带人撤离的风险，明确要求试炼；不以诺恩肩伤或泛泛规矩推动。','rune':'听薇蕾娜安排检验能力；说明观察目标、地下联系人，对上层计划仍回避，不假设全知。','oren':'围绕粮食、灯油、药箱和开销讲实事，关心出门准备；药材是补公共药箱，不假定诺恩受伤。','iden':'安排地下试炼并协调维修班，交代两层哨兵、鼠群、看守与零件用途；不当作全知任务终端。'}.items():
 p='source/narrative/characters/'+who+'.json';d=read(p);d['voice']['chapter_one_1_1']=guide
 d['sources']=list(dict.fromkeys(d['sources']+['c1-story-flow','scene:contract','runtime-c1-actions']));write(p,d)
conflicts=read('source/narrative/conflicts.json')
for row in conflicts['conflicts']:
 if row['id']=='DIFF-C1-RATS':row['status']='CONFIRMED';row['resolved']=True;row['resolution']='第一章1.1按用户当前任务叙事授权统一contract八鼠；旧章稿与历史运行保留，当前试炼无肩伤。'
book['facts'].append({'id':'F-C1-FLOW-CONTRACT-SURFACE','summary':'清鼠后在会馆会面，诺恩肩上只有库房木屑；薇蕾娜递交通行纸与画像，说明午钟、换岗、路线和接头保密要求。这是收到的委托安排，不证明上层理由真实。','truth':'instruction','plane':'runtime','status':'RUNTIME','sources':['scene:contract'],'risk_terms':[]})
for e in book['events']:
 if e['scene']=='contract':e['grants'] += [{'actor':a,'fact':'F-C1-FLOW-CONTRACT-SURFACE','mode':'knows'} for a in ['noen','vilerena','player']]
book['facts'].append({'id':'F-C1-FLOW-IDENLOCAL','summary':script['local_talks']['c1iden'],'truth':'world_fact','plane':'runtime','status':'RUNTIME','sources':['runtime-c1-local'],'risk_terms':[]})
for e in book['events']:
 if e['scene']=='c1:localTalk:c1iden':e['grants']=[{'actor':a,'fact':'F-C1-FLOW-IDENLOCAL','mode':'knows'} for a in ['iden','noen','player']]
for i,e in enumerate(book['events'],1):e['order']=i
write('source/narrative/conflicts.json',conflicts);write('source/narrative/chapters/R01.json',book);write('source/narrative/sources.json',src)
print('Registered',len(script['scenes']),'authored scenes; retained original private-knowledge grants.')
