import json,sys,subprocess
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import write_json,inventory,fingerprint
from narrative import context_packet,review
from dialogue_style import scene_risks
read=lambda p:json.loads(Path(p).read_text())
script=read('docs/loot-services/SCRIPT.json')['scenes'];book=read('source/narrative/chapters/R01.json');events={e['scene']:e for e in book['events']};names={c['name']:c['id'] for c in read('source/narrative/catalog.json')['characters']}
notes={
'intro':'原七句保持：奥伦因粮袋受损求助，诺恩答应取钥匙；任务随剧情进入标记active，省去重复接取对话。八鼠与北墙调查仍须实际完成。猫和钥匙的日常玩笑不改变旧关系。',
'c1HuntOffer':'赏金猎人以悬赏单开口，列出两地下看守和三郊外凶兽；诺恩问伤者与回报方式。首次相见不叫熟悉的名字或假装旧交，工人和运货是公开委托的因果。',
'c1HuntProgress':'赏金猎人报已完成记录并指向手记里的剩余地点，沿用一并结算的约定；不追加新的目标或把终试执卫算入五处。',
'c1HuntReport':'诺恩汇报五处已清，赏金猎人捎话给维修班和运货人，交付一次总报酬；双方仍为业务关系，没有无据熟络或秘密知识。',
'c1Talk_c1ExitDrill_offer':'伊登仍接鲁恩的试炼安排信，明确八哨兵、八鼠和东厅终试执卫；只有内室两名看守的另一份委托改指赏金猎人，回报仍找薇蕾娜。鲁恩的原职责和逐轮流程保持。'}
for scene in script:
 e=events[scene];fid='F-C1-17-'+scene.upper();book['facts']=[f for f in book['facts'] if f['id']!=fid];book['facts'].append({'id':fid,'summary':e['summary'],'truth':'world_fact','plane':'runtime','status':'RUNTIME','sources':['loot-services:'+scene],'risk_terms':[]})
 e['grants']=[g for g in e['grants'] if g['fact']!=fid]+[{'actor':a,'fact':fid,'mode':'knows'} for a in [*e['participants'],'player']]
write_json(Path('source/narrative/chapters/R01.json'),book)
subprocess.run(['python3','tools/harness/index.py'],check=True,stdout=open('/tmp/ashen-narrative-index.txt','w'))
out=Path('docs/loot-services/reviews');out.mkdir(exist_ok=True);batch=[];results=[]
files=['dist/service-quests.js','dist/service-quest-dialogues.js','dist/core-v14.js','docs/harness/CHAPTER_01_LOOT_SERVICES.md']
for scene,rows in script.items():
 e=events[scene];at=e.get('stage_window',[None])[0];at=at.split(':',1)[1] if at else None;note=notes[scene]
 lines=[{'speaker':names[s],'text':t,'claims':[{'fact':'F-C1-17-'+scene.upper(),'mode':'knows','disclosure':True}]} for s,t in rows]
 handoff='intro进入即接取且旧档幂等；其他接交保持末页then提交、任务ID和页数，旧在播正文兼容；金币经验只结算一次。'
 edits={'character':note,'language':'逐句对照原1.5全文；悬赏开头展示纸单符合初识，问答承接清晰；仅四场授权变化。','clarity':note,'continuity':handoff,'information_isolation':'只公开任务地点、危险与工钱，不引用薇蕾娜/鲁恩私谈及圣徽秘密；诺恩未被赋予后章认知。','foreshadowing':'未增加伏笔或解答隐藏线索，原主线圣徽与委托保留。','emotion_relationship':note}
 editorial={k:{'verdict':'pass','evidence':v} for k,v in edits.items()};editorial['reviewer']='Codex逐句编辑；真人文风待验。';editorial['negative_imperatives']={'scene_judgment':'本轮无否定祈使新增，保留原任务警告和日常玩笑，未套用统一关怀模板。','decisions':[{'line':r['line'],'decision':'retain','reason':'原对白针对眼前任务或猫的日常情境，保持角色和原页数。'}for r in scene_risks(lines)['candidates']]}
 draft={'chapter':'R01','scene':scene,'actors':e['participants'],'style_policy_version':2,'scope':{'files':files},'brief':{'information':note,'purposes':note,'outcome':rows[-1][1],'causality':note,'emotional_basis':note,'gameplay_handoff':handoff},'lines':lines,'editorial':editorial}
 if at:draft['at']=at
 context,paths=context_packet('第一章任务交接','R01',scene,e['participants'],at=at);context['paths']=paths;context['source_fingerprint']=fingerprint(inventory());context['prewriting_context_archive']='docs/loot-services/context-hunt-before-ready.json';result=review(draft);item={}
 for kind,data in [('context',context),('draft',draft),('review',result)]:p=out/(scene+'-'+kind+'.json');write_json(p,data);item[kind]=str(p)
 batch.append(item);results.append({'scene':scene,'ready':context['ready_to_write'],'status':result['status'],'errors':result['errors']})
write_json(out/'INDEX.json',results);write_json(Path('docs/loot-services/REVIEW_BATCH.json'),batch);print(json.dumps(results,ensure_ascii=False));assert all(r['ready'] and r['status']=='passed' for r in results)
