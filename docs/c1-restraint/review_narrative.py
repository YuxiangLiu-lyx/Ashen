"""Scene judgments by the executing editor; automated validation is not a literary score."""
import json,sys
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import write_json,inventory,fingerprint
from narrative import context_packet,review,audit,acknowledge
from dialogue_style import scene_risks
read=lambda p:json.loads(Path(p).read_text())
script=read('docs/c1-restraint/SCRIPT.json')['scenes'];book=read('source/narrative/chapters/R01.json');events={e['scene']:e for e in book['events']};names={c['name']:c['id']for c in read('source/narrative/catalog.json')['characters']};names['旁白']='narrator'
notes={'c1TrialInvitation': '从库房木屑转到城中差事，薇蕾娜承认放心不下；诺恩问原因与安排，她说明护卫、窄路和陌生对手，约好试炼后吃饭。删除点评学生和每轮调情，关心由等人、留饭和拈木屑表达。', 'c1TrainingReason': '诺恩追问鲁恩平时已看他训练为何还去地下；薇蕾娜说明熟悉的陪练和陌生构装体不同，并托伊登传消息。话题仍是眼前安排，诺恩答应回来吃饭，没有多余打趣或总结。', 'c1TrialReport': '薇蕾娜先看袖口灰迹再问东厅位置，诺恩说盾前受阻、把执卫引到中间；她根据实际经过决定委托。望门与留饭承接等待，饭后解释服务，最后具体约定遇阻回来商量，没有教师式表扬或新增伤势。'}
files=['dist/chapter-one-trial-dialogues.js','dist/chapter-one-trial-runtime.js','dist/story-test-v31.js','dist/core-v14.js','docs/harness/CHAPTER_01_RESTRAINT.md','docs/harness/CHAPTER_01.md','dist/encounter-restraint.js']
negativeReasons={('contract',13):'实际任务限制：制住圣女并带出，需要制止重伤目标，不承担模板化关心功能。',('assassination',8):'刺杀者明确阻止对方接近和举起法器，现实冲突中的强制命令；保留原行动因果。',('assassination',16):'弩手已经抬手，艾莉娅紧急制止放箭以争取救人，是眼前危险警告。'}
r=audit();assert all(e['code']=='SOURCE_DRIFT'for e in r['errors']),r['errors']
if r['errors']:write_json(Path('docs/c1-restraint/PROVENANCE_ACK_FINAL.json'),acknowledge([e['where']for e in r['errors']],'Reviewed 1.4 adopted pointer and three trial-scene replacements against before/runtime.json and full original trial-dialogues.js.txt; all other scenes and original assassination preserved.'))
out=Path('docs/c1-restraint/reviews');out.mkdir(exist_ok=True);batch=[];results=[]
for scene,rows in script.items():
 e=events[scene];actors=e['participants'];at=e.get('stage_window',[None])[0];at=at.split(':',1)[1]if at else None
 fid='F-C1-13-'+scene.upper();lines=[]
 for i,(speaker,text)in enumerate(rows):
  actor=names[speaker];line={'speaker':actor,'text':text,'claims':[]}
  if text.endswith('？') and actor=='noen':line['no_fact_reason']='针对本场刚听到的安排追问，不断言未获知秘密。'
  else:
   fact,mode=fid,'knows'
   if scene=='contract' and i==6:fact,mode='F-C1-DOOR-CLAIM','heard'
   elif scene=='contract' and i==13:fact='F-C1-SEAL-INSTRUCTION'
   line['claims']=[{'fact':fact,'mode':mode,'disclosure':True}]
  lines.append(line)
 note=notes[scene];handoff={'c1SaintAid':'接鼠患后入库房、安全入口一次切镜，末页返回原地图，不给诺恩救民见闻。','c1TrialInvitation':'末页只标记试炼已安排，phase1；尚无委托道具。','c1TrialReport':'试炼完成后由薇蕾娜报告场进入正式contract；后者末页phase2、原奖励与整备解锁一次。','contract':'末页正式批准、支付、发物并开启整备；实际离场才原会馆私谈。','assassination':'原动作与then保持，旁白和演出按保全回归；后续仍强迫圣女撤离。'}.get(scene,'按实际NPC/任务/phase条件进入；接取和交付在末页提交，查看状态不重复支付。旧存档在播全文及游标由迁移单独保留。')
 isolation='本场在场者和玩家获得可观察交流；不传播薇蕾娜与鲁恩私谈、替代开门法、作者真相。'+('圣女/朵莉/玩家在场，诺恩没有救民事件知识；居民之后亲口告知才构成他的见闻。'if scene=='c1SaintAid'else '')+('“圣徽开门”按heard标注为收到的说法，不能升级为真相。'if scene=='contract'else '')
 edits={
 'character':note,'language':note+' 已逐句阅读问答和承接；必要短问/急令由交流情境决定，不用词频代替编辑判断。',
 'clarity':note+' 地点、任务对象和结果对照1.4调用者。','continuity':handoff,
 'information_isolation':isolation,'foreshadowing':'原委托隐瞒、圣徽疑问及幕后私谈保留；本场新增内容服务眼前行动，没有提前回答原伏笔。',
 'emotion_relationship':note+' 亲近或信任仅止于既有关系：薇蕾娜关怀诺恩，圣女救民；刺杀后仍愤怒且受迫。'}
 editorial={k:{'verdict':'pass','evidence':v}for k,v in edits.items()};editorial['reviewer']='Codex执行编辑，阅读实际全文与事件、角色、调用者；真人文风和节奏另待验。'
 editorial['negative_imperatives']={'scene_judgment':note+' 只保留真实冲突/警告中的否定祈使，没有同场机械关怀或同声说教。','decisions':[{'line':x['line'],'decision':'retain','reason':negativeReasons[(scene,x['line'])]}for x in scene_risks(lines)['candidates']]}
 draft={'chapter':'R01','scene':scene,'actors':actors,'style_policy_version':2,'scope':{'files':files},'brief':{'information':note,'purposes':note,'outcome':rows[-1][1],'causality':note,'emotional_basis':edits['emotion_relationship'],'gameplay_handoff':handoff},'lines':lines,'editorial':editorial}
 if at:draft['at']=at
 context,paths=context_packet('第一章1.4剧情整改逐场复核','R01',scene,actors,at=at);context['paths']=paths;context['source_fingerprint']=fingerprint(inventory());context['prewriting_context_archive']='docs/c1-restraint/before/invitation-context.json; other existing 1.3 scenes/role boundaries retained from docs/c1-trial-forge/contexts-before';result=review(draft)
 item={}
 for kind,data in [('context',context),('draft',draft),('review',result)]:p=out/(scene+'-'+kind+'.json');write_json(p,data);item[kind]=str(p)
 batch.append(item);results.append({'scene':scene,'ready':context['ready_to_write'],'status':result['status'],'errors':result['errors'],'warnings':result['warnings']})
write_json(out/'INDEX.json',results);write_json(Path('docs/c1-restraint/REVIEW_BATCH.json'),batch)
print(json.dumps([{'scene':r['scene'],'ready':r['ready'],'status':r['status'],'errors':r['errors']}for r in results],ensure_ascii=False,indent=2));assert all(r['ready']and r['status']=='passed'for r in results)
