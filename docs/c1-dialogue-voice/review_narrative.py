"""Scene judgments by the executing editor; automated validation is not a literary score."""
import json,sys
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import write_json,inventory,fingerprint
from narrative import context_packet,review,audit,acknowledge
from dialogue_style import scene_risks
read=lambda p:json.loads(Path(p).read_text())
script=read('docs/c1-dialogue-voice/SCRIPT.json')['scenes'];book=read('source/narrative/chapters/R01.json');events={e['scene']:e for e in book['events']};names={c['name']:c['id']for c in read('source/narrative/catalog.json')['characters']};names['旁白']='narrator'
notes={'c1TrialInvitation': '第7页明确进城带人的危险与检查多年训练成果，第9页直接安排鲁恩和伊登负责的试炼，第10页诺恩只答知道了；前半木屑互助，后半留饭及怕找不到我的玩笑承接实际问答。不让男主复述流程，不用试炼考核腔反复解释。', 'c1TrainingReason': '只问鲁恩是否同行，薇蕾娜说明鲁恩留在庭院、地下由伊登照应；诺恩答应找伊登，末尾以已约好的饭轻轻打趣。不再次解释先训练再决定，也不质疑男主智力。', 'c1TrialReport': '报告简述绕盾机会，薇蕾娜问有没有受伤而非逐步盘问战术；确认本事后交付任务，等待与吃饭有实际承接。饭后完整说明精粹换核心、罗萨卖符文及工费；末尾直接提醒遇阻撤回，诺恩答应小心。未替玩家新增伤势或升级为恋爱关系。'}
files=['dist/chapter-one-trial-dialogues.js','docs/harness/CHAPTER_01_RESTRAINT.md','docs/harness/DIALOGUE_STYLE.md']
negativeReasons={('contract',13):'实际任务限制：制住圣女并带出，需要制止重伤目标，不承担模板化关心功能。',('assassination',8):'刺杀者明确阻止对方接近和举起法器，现实冲突中的强制命令；保留原行动因果。',('assassination',16):'弩手已经抬手，艾莉娅紧急制止放箭以争取救人，是眼前危险警告。'}
r=audit();assert all(e['code']=='SOURCE_DRIFT'for e in r['errors']),r['errors']
if r['errors']:write_json(Path('docs/c1-dialogue-voice/PROVENANCE_ACK_FINAL.json'),acknowledge([e['where']for e in r['errors']],'User rejected 1.4 procedural voice. Reviewed only three scene changes against bafee2e full corpus and before/trial-dialogues.js.txt; pages, speakers, beats and all other dialogue unchanged. Style examples remain STYLE_ONLY.'))
out=Path('docs/c1-dialogue-voice/reviews');out.mkdir(exist_ok=True);batch=[];results=[]
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
 note=notes[scene];handoff={'c1SaintAid':'接鼠患后入库房、安全入口一次切镜，末页返回原地图，不给诺恩救民见闻。','c1TrialInvitation':'末页只标记试炼已安排，phase1；尚无委托道具。','c1TrainingReason':'试炼尚未完成时重复交谈；不发任务或物品，读完回到游戏，phase及库存不因阅读改变。','c1TrialReport':'试炼完成后由薇蕾娜报告场进入正式contract；后者末页phase2、原奖励与整备解锁一次。','contract':'末页正式批准、支付、发物并开启整备；实际离场才原会馆私谈。','assassination':'原动作与then保持，旁白和演出按保全回归；后续仍强迫圣女撤离。'}.get(scene,'按实际NPC/任务/phase条件进入；接取和交付在末页提交，查看状态不重复支付。旧存档在播全文及游标由迁移单独保留。')
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
 context,paths=context_packet('第一章1.4口吻修订逐场复核','R01',scene,actors,at=at);context['paths']=paths;context['source_fingerprint']=fingerprint(inventory());context['prewriting_context_archive']='docs/c1-dialogue-voice/before/'+scene+'-context.json';result=review(draft)
 item={}
 for kind,data in [('context',context),('draft',draft),('review',result)]:p=out/(scene+'-'+kind+'.json');write_json(p,data);item[kind]=str(p)
 batch.append(item);results.append({'scene':scene,'ready':context['ready_to_write'],'status':result['status'],'errors':result['errors'],'warnings':result['warnings']})
write_json(out/'INDEX.json',results);write_json(Path('docs/c1-dialogue-voice/REVIEW_BATCH.json'),batch)
print(json.dumps([{'scene':r['scene'],'ready':r['ready'],'status':r['status'],'errors':r['errors']}for r in results],ensure_ascii=False,indent=2));assert all(r['ready']and r['status']=='passed'for r in results)
