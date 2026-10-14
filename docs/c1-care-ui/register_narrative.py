import json
from pathlib import Path
def read(p):return json.loads(Path(p).read_text())
def write(p,x):Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
sources=read('source/narrative/sources.json');sources['sources']['c1-care-plan']={'path':'docs/harness/CHAPTER_01_CARE_UI.md','anchor':'# 第一章采用稿1.2','kind':'adopted_plan'}
sources['sources']['c1-care-runtime']={'path':'dist/chapter-one-care-dialogues.js','anchor':'export const C1_CARE_DIALOGUES','kind':'runtime'}
write('source/narrative/sources.json',sources)
book=read('source/narrative/chapters/R01.json');book['plan']={'path':'docs/harness/CHAPTER_01_CARE_UI.md','revision':'1.2','status':'IMPLEMENTED','implementation':'四场关键人物交流与阅读操作已接入，正在进行本轮验收；1.1任务交代与实际离场私谈保留。'}
book['gaps']=list(dict.fromkeys(book['gaps']))
notes={
 'contract':'保留目标、圣徽说法、封术印与封套；诺恩追问两场试炼的目的，薇蕾娜担心他带人撤离时忽略自身安全。熟人之间靠近和木屑的玩笑，接到练完留饭、出发前再见的约定；约饭是计划，未断言已经吃饭或完成试炼。',
 'sisterIdle':'可选日常：诺恩找皮带固定松裂的刀鞘，薇蕾娜借新领扣逗他、说晚些见客；他解释没打扰她的原因，她关心刀鞘可靠性。未提尚未接取的委托，不新增童年记忆或恋爱确认。',
 'sisterBeforeDeparture':'可选临行：看披肩与路图，核对侧门及带人撤离风险；薇蕾娜坦承担心，问是否吃饭，邀请坐下来聊。未预设已吃、已练、已成功；诺恩愿意回应她，关系仍为亲近熟人。',
 'c1TrainingReason':'诺恩问庭院练习重点；薇蕾娜解释鲁恩观察冲撞应对、伊登安排地下陌生哨兵；诺恩说明带人通过的判断。她请求多问几句，并约练完吃饭，不假定诺恩已见过伊登。'
}
facts={}
for scene,note in notes.items():
 fid='F-C1-CARE-'+scene.upper();facts[scene]=fid
 if not any(f['id']==fid for f in book['facts']):book['facts'].append({'id':fid,'summary':note,'truth':'world_fact','plane':'runtime','status':'RUNTIME','sources':['c1-care-runtime','scene:'+scene if scene!='c1TrainingReason' else 'flow:c1TrainingReason'],'risk_terms':[]})
 for e in book['events']:
  if e['scene']!=scene:continue
  e['summary']=note;e['c1_care_revision']='1.2';e['sources']=list(dict.fromkeys(e['sources']+['c1-care-runtime']))
  for actor in ['noen','vilerena','player']:
   grant={'actor':actor,'fact':fid,'mode':'knows'}
   if grant not in e['grants']:e['grants'].append(grant)
  if scene=='contract':
   e['relationship_changes']['vilerena']={'noen':{'affection':'主动亲近、调侃并坦承担心，安排试炼和饭后出发；仍未确认恋爱。'}}
   e['relationship_changes']['noen']={'vilerena':{'affection':'认真回答并顾及她的手和吃饭，愿意回来见面；不代表已知幕后隐瞒。'}}
  else:
   e['trigger']='会馆sister菜单：sisterIdle为chapter<3；sisterBeforeDeparture为chapter=2；trainingBrief为chapter=2且c1ExitDrill未交付。可重复对话不代表已经完成试炼或吃饭。'
   if scene=='sisterIdle':e['stage_window']=['R01:intro','R01:assassination']
for f in book['facts']:
 if f['id']=='F-C1-FLOW-C1TRAININGREASON':f['summary']=notes['c1TrainingReason']
write('source/narrative/chapters/R01.json',book)
for name in ['vilerena','noen']:
 p='source/narrative/characters/'+name+'.json';profile=read(p);profile['sources']=list(dict.fromkeys(profile['sources']+['c1-care-runtime']))
 profile['voice']['chapter_one_1_2']=('按用户明确性格：开放主动，能调侃、亲近诺恩，也肯多说几句试炼担忧和留饭安排；自然问答取代连串命令，不用每句暧昧维持形象。' if name=='vilerena' else '能认真解释任务判断，也会顾及薇蕾娜的手和吃饭；朴素回应她的亲近，保留不擅长熟练调情的一面。')
 write(p,profile)
mods=read('source/harness/modules.json')
for m in mods['modules']:
 entries={'story':['dist/chapter-one-care-dialogues.js','dist/chapter-one-care-save.js','dist/dialogue-reader.js'],'art':['dist/chapter-one-natural-art.js'],'ui':['dist/dialogue-reader.js'],'save':['dist/chapter-one-care-save.js'],'chapter01_plan':['docs/harness/CHAPTER_01_CARE_UI.md']}.get(m['id'],[])
 m['entries']=list(dict.fromkeys(entries+m['entries']))
 if m['id']=='chapter01_plan':m['risk']='第一章1.2扩写亲昵关心，1.1任务交代与离场私谈保留；对白回看不改变实际剧情进度，保留旧档和原奖励。'
 if m['id']in ['story','ui','save']:m['tests']=list(dict.fromkeys(m['tests']+['node --test tests/dialogue-reader.test.mjs']))
write('source/harness/modules.json',mods)
write('docs/c1-care-ui/NARRATIVE_NOTES.json',notes)
