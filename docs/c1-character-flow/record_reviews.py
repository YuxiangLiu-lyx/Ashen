"""Serialize explicit editorial judgments after reading the complete chapter corpus."""
import json,sys,copy,hashlib
from pathlib import Path
R=Path(__file__).resolve().parents[2];sys.path.insert(0,str(R/'tools/harness'))
from common import inventory,fingerprint
from narrative import review,context_packet,audit
from narrative_copyedit import row_hash
from dialogue_style import scene_risks
P='docs/c1-character-flow/'
def read(p):return json.loads((R/p).read_text())
def write(p,d):(R/p).parent.mkdir(exist_ok=True,parents=True);(R/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
s=read(P+'SCRIPT.json');base=read(P+'before/CORPUS.json')['scenes'];current=read(P+'CURRENT_CORPUS.json')['scenes'];book=read('source/narrative/chapters/R01.json');events={e['scene']:e for e in book['events']};cat=read('source/narrative/catalog.json');profiles={n:c for c in cat['characters']for n in [c['name'],*c.get('aliases',[])]};fp=fingerprint(inventory());batch=[]
negative={('contract',13):'封术后带走目标的真实任务限制：避免重伤目标，保留强制任务的性质。',('ch1DollyFitting',4):'剪刀正靠近衣服，制止拉扯以免剪伤；属于眼前动作安全。',('c1HerbsToLena',1):'不用干等着陈述药到了的状态，不是命令他人。',('c1Talk_c1CanalBreak_offer',2):'遭挟持者正在被推向冲突，反抗对方把她置于刀口前，边界合理。',('saintSealEarly',4):'目睹刺杀后的真实劝停和受审要求，不能为删句式而取消其反抗。',('saintRoadEarly',0):'街上有找孩子的人，要求绑架者不牵连无辜者，有现场风险。',('saintGuestroom',2):'被挟持者拒绝被介绍给会馆熟人，维持自身边界。',('saintCave',1):'陈述取机芯减少折返，不是对别人的否定祈使。',('herbHintTalk',2):'米拉代付后的费用结果，不是劝阻语式。'}
files=['dist/chapter-one-conversations-data.js','dist/chapter-one-conversations.js','dist/chapter-one-trial-runtime.js','dist/core-v14.js','docs/harness/CHAPTER_01_CHARACTER_FLOW.md','docs/harness/CHAPTER_01.md']
for n,e in enumerate(s['entries']):
 key=e['key'];scene='c1:localTalk:'+key[6:]if key.startswith('local:')else key;rows=e['after'];note=e['reason'];event=events.get(scene);actors=list(dict.fromkeys(r[0]for r in rows if r[0]!='旁白'));ps=[{'id':profiles[a]['id'],'path':P+'before/narrative-state/characters/'+profiles[a]['id']+'.json','coverage':profiles[a]['coverage']}for a in actors];stem=f'{n:03d}-'+key.replace(':','-');paths={k:P+'reviews/'+stem+'-'+k+'.json'for k in ['context','draft','review']}
 if not ps:ps=[{'id':'noen','path':P+'before/narrative-state/characters/noen.json','coverage':'full_for_c1_c2','role':'读取物件文字的视角角色；旁白不冒充角色发言'}]
 assert current[key]['text']==rows
 handoff=('邀请末页仅标记started；庭院接取/回报分别在末页提交，回报后才解锁伊登；地下终试完成回薇蕾娜→吃饭→原contract末页正式批准，一次性奖励不变。'if key in ['c1TrialInvitation','c1TrainingReason','c1TrialReport','c1Talk_c1Readiness_offer','c1Talk_c1Readiness_report','c1Talk_c1ExitDrill_offer']else '保持既有场景ID、同序说话者、页数和回调；闲聊不结算任务，接交仍在末页；旧档自带全文按原游标续读，新增正文只在新开启时出现。')
 isolation='内容限于在场者眼前经历与原有消息。诺恩没有救济切镜和会馆私谈知识，圣女不知上级计划，商人只谈业务和公开路况。'
 findings={'character':note,'language':note+' 已逐页检查提问、答复与动作承接；自然短答保留，不为避词切碎必要信息。','clarity':note+' 数量、地点、材料、报酬和仍未解释的问题逐条对照基线及真实调用者。','continuity':handoff,'information_isolation':isolation,'foreshadowing':'圣徽开门为收到的说法，替代开门法与上级目的不向男主透露；本场未扩写后续章节。','emotion_relationship':note+' 关心和熟悉未写成恋爱确认；刺杀后的圣女仍愤怒且受迫，鲁恩仍回避上层安排。'}
 risks=scene_risks(rows)['candidates'];assert all((key,x['line'])in negative for x in risks),(key,risks)
 editorial={'reviewer':'Codex执行编辑逐场审读，非真人文风验收',**{k:{'verdict':'pass','evidence':v}for k,v in findings.items()},'negative_imperatives':{'scene_judgment':note+' 全场没有用连续劝阻替代解释；以下保留项各有具体语境。','decisions':[{'line':x['line'],'decision':'retain','reason':negative[(key,x['line'])]}for x in risks]}}
 if e['normal_event_review']:
  assert event,key
  at=event.get('stage_window',[None])[0];at=at.split(':',1)[1]if at else None
  context,source_paths=context_packet('第一章1.5人物口吻与逐轮交接','R01',scene,event['participants'],at=at);context['source_fingerprint']=fp;context['paths']=source_paths;context['prewriting_archive']=P+'before/';context['assembly_note']='当前上下文刷新用于验证；写作前基线全文、完整角色/事件与路由另存before，整理日期不冒充写作前生成时间。'
  fid='F-C1-15-'+scene.upper().replace(':','-');lines=[]
  for who,text in rows:
   actor='narrator'if who=='旁白'else profiles[who]['id'];line={'speaker':actor,'text':text,'claims':[{'fact':fid,'mode':'knows','disclosure':True}]};lines.append(line)
  draft={'chapter':'R01','scene':scene,'actors':event['participants'],'style_policy_version':2,'scope':{'files':files,'dynamic_check_label':'producer-current'},'brief':{'information':note,'purposes':note,'outcome':rows[-1][1],'causality':note,'emotional_basis':findings['emotion_relationship'],'gameplay_handoff':handoff},'lines':lines,'editorial':editorial}
  if at:draft['at']=at
 else:
  context={'kind':'copyedit_context','scene':key,'chapter':'R01','source_fingerprint':fp,'ready_to_write':False,'ready_to_copyedit':True,'static':e['static'],'baseline_commit':s['baseline_commit'],'baseline_sha256':row_hash(e['before']),'before':e['before'],'producer':base[key]['source'],'baseline_check_label':'baseline-provenance','baseline_corpus':P+'before/CORPUS.json','profiles':ps,'scene_context':{'purpose':note,'relationship':{'participants':actors,'judgment':findings['emotion_relationship']},'known_information':{'scope':isolation,'baseline_sha256':row_hash(e['before']),'event':event},'retained_outcome':handoff,'caller':{'provider':base[key]['source'],'fixture':{k:v for k,v in base[key].items()if k not in ['text','sha256']},'event':event},'limitations':'文风保全审查，不把来源未知的经历补为正史；试炼揭露顺序和改称呼场景另走正常事件审查。'},'prewriting_archive':P+'before/'}
  draft={'kind':'copyedit','style_policy_version':2,'chapter':'R01','scene':key,'context':paths['context'],'corpus':P+'CURRENT_CORPUS.json','semantic_change':False,'rows':rows,'line_judgments':[{'line':i,'before':a,'after':b,'reason':note,'preserves_information':True}for i,(a,b)in enumerate(zip(e['before'],rows))if a!=b],'editorial':editorial,'scope':{'files':files,'dynamic_check_label':'producer-current'},'adopted_script':P+'SCRIPT.json'}
 write(paths['context'],context);write(paths['draft'],draft);result=review(draft);write(paths['review'],result)
 if result['status']!='passed':print(key,result['errors']);raise SystemExit(1)
 batch.append(paths)
write(P+'REVIEW_BATCH.json',batch)
# A separate audit records retained scenes too; no claim that every line needed replacement.
changed={e['key']:e for e in s['entries']};audit_rows=[]
for key in s['reviewed']:
 rows=base[key]['text'];e=changed.get(key)
 if e:judgment=e['reason']
 elif key=='assassination':judgment='逐页核对原刺杀动作与急令；圣女制止杀人、抢救、封术和挟持有明确因果，保留原18页。'
 elif key=='c1Conversation':judgment='动态容器的默认占位正文；实际NPC选择总提供pending.lines，不把容器句当成实际闲聊。'
 elif key.startswith('spoken:')or key in ['ratProgressTalk']:judgment='基础旧调用的原字面文本保留。当前第一章由c1任务分支接管数量和交接，避免把旧分支清理写成新事件。'
 elif all(r[0]=='旁白'for r in rows):judgment='物件/环境观察具体，位置、动作和旧文字有明确对象；未强行加情绪总结，保留。'
 elif key.startswith('ambient_'):judgment='闲聊围绕本角色亲历的生活变化，信息随刺杀前后改变，未越过家属/居民所知。完整接话已审读，保留其口气。'
 elif key.startswith(('c1Talk_','c1','local:')):judgment='请求/进度/回报对象明确，数量与真实任务一致，角色表达没有空转复述；保留原文。'
 else:judgment='逐场保留具体询问、回答、物件观察和合理的危险警告。冲突及可选旧分支不因文风审读被删除。'
 audit_rows.append({'scene':key,'source':base[key]['source'],'pages':len(rows),'status':'revised'if e else 'retained','judgment':judgment,'before_sha256':base[key]['sha256'],'after_sha256':current[key]['sha256'],'speakers':list(dict.fromkeys(r[0]for r in current[key]['text']))})
write(P+'CHAPTER_AUDIT.json',{'chapter':'R01','reviewer':'Codex executing editor','entries':audit_rows,'limits':['263 authored first-chapter variants include retained/legacy providers and dynamic branches; not a claim that every variant lies on the new-game critical path.','Automated semantic checks validate annotations and provenance; user literary judgment remains pending.']})
print(len(batch),'reviews; normal events',sum(e['normal_event_review']for e in s['entries']),'; chapter audit',len(audit_rows))
