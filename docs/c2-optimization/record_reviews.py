"""Serialize the chapter editor's explicit judgments; not a human prose approval."""
import json,sys
from pathlib import Path
R=Path(__file__).resolve().parents[2];sys.path.insert(0,str(R/'tools/harness'))
from common import inventory,fingerprint
from narrative import review
from narrative_copyedit import row_hash
from dialogue_style import scene_risks
P='docs/c2-optimization/'
def read(p):return json.loads((R/p).read_text())
def write(p,d):
 (R/p).parent.mkdir(exist_ok=True,parents=True);(R/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
s=read(P+'SCRIPT.json');base=read(P+'before/CORPUS.json')['scenes'];current=read(P+'CURRENT_CORPUS.json')['scenes'];book=read(P+'before/narrative-state/chapters/R02.json');events={e['scene']:e for e in book['events']};cat=read('source/narrative/catalog.json');profiles={n:c for c in cat['characters']for n in [c['name'],*c.get('aliases',[])]};fp=fingerprint(inventory());batch=[]
negative={('ch2Arrival',4):'艾莉娅正扶老人，被诺恩拉拽，要求停止真实的身体控制。',('ch2OuterCourt',4):'当值巡卫要求同队离开屋檐观察运柴门，属于现场岗位命令。',('ch2InnerDoor',6):'诺恩试图阻止她拉铃求救，保留加害者的控制行为而非美化。',('ch2InnerDoor',9):'圣女阻止开门让刺客靠近目标，同时要求活捉，有直接危险。',('ch2Breakout',5):'追捕中的封路命令，有明确逃跑对象与地点。',('ch2Spillway',9):'搜索队对石壁后方的实际搜索要求。',('selineIdleBefore',4):'不要钥匙描述诺恩没有投宿的行为，不是祈使句。',('v9CellarOpen',2):'第三阶破损，提醒不要突然压上去以免跌落。'}
files=['dist/chapter-two-conversations-data.js','dist/chapter-two-conversations.js','dist/core-v14.js','docs/harness/CHAPTER_02_CHARACTER_FLOW.md','docs/harness/CHAPTER_02.md','docs/harness/CHAPTER_01_ENDURANCE.md']
for n,e in enumerate(s['entries']):
 key=e['key'];rows=e['after'];note=e['reason'];event=events.get(key);actors=list(dict.fromkeys(w for w,t in rows if w!='旁白'));ps=[{'id':profiles[a]['id'],'path':P+'before/narrative-state/characters/'+profiles[a]['id']+'.json','coverage':profiles[a]['coverage']}for a in actors];stem=f'{n:03d}-'+key.replace(':','-');paths={k:P+'reviews/'+stem+'-'+k+'.json'for k in ['context','draft','review']}
 assert current[key]['text']==rows,key
 handoff='同页数、同说话者序列与原动作/结算回调。主线顺序不变；水泵/问路/铜扣在原末页提交；旧pending自带全文保留，静态游标同页对应。章界只结算一次。'
 isolation='艾莉娅仍是被挟持者，求助不等于亲密；两位主角没有会馆及内室切镜的知识。鲁恩和薇蕾娜只能知道急信到界碑的报告。旧0.3追加A/B仍未实装。'
 findings={'character':note,'language':note+' 逐页检查提问和回应，不用换同义祈使或拆短句规避风格要求。','clarity':note+' 核对目标、路线、材料数、原报酬及未得到答案的部分。','continuity':handoff,'information_isolation':isolation,'foreshadowing':'玩家独享的观察安排和内室恶行保持各自视角；替代开门法及无接应作者方向不借润色成为主角知识。','emotion_relationship':note+' 行动与情绪以当前被迫同行、旅店生计或急报为依据，不加新童年、恋爱或幕后真相。'}
 risks=scene_risks(rows)['candidates'];assert all((key,x['line'])in negative for x in risks),(key,risks)
 editorial={'reviewer':'Codex执行编辑，已阅读全文；真人文风反馈待验',**{k:{'verdict':'pass','evidence':v}for k,v in findings.items()},'negative_imperatives':{'scene_judgment':note+' 合理制止、拒绝和警报命令保留，不追求否定词清零。','decisions':[{'line':x['line'],'decision':'retain','reason':negative[(key,x['line'])]}for x in risks]}}
 context={'kind':'copyedit_context','scene':key,'chapter':'R02','source_fingerprint':fp,'ready_to_write':False,'ready_to_copyedit':True,'static':e['static'],'baseline_commit':s['baseline_commit'],'baseline_sha256':row_hash(e['before']),'before':e['before'],'producer':base[key]['source'],'baseline_check_label':'baseline-provenance','baseline_corpus':P+'before/CORPUS.json','profiles':ps,'scene_context':{'purpose':note,'relationship':{'participants':actors,'judgment':findings['emotion_relationship']},'known_information':{'scope':isolation,'event':event,'baseline_sha256':row_hash(e['before'])},'retained_outcome':handoff,'caller':{'provider':base[key]['source'],'fixture':{k:v for k,v in base[key].items()if k not in ['text','sha256']},'event':event,'runtime':'dist/chapter-runtime-v14.js; dist/pacing-runtime-v14.js; dist/secrets-v14.js; dist/rpg-chapter-two.js'},'limitations':'同事件结果的保全文风修订，不补未登记的身世；第一章1.6同批采用文档只改数值，不改第一章正文。'},'prewriting_archive':P+'before/'}
 draft={'kind':'copyedit','style_policy_version':2,'chapter':'R02','scene':key,'context':paths['context'],'corpus':P+'CURRENT_CORPUS.json','semantic_change':False,'rows':rows,'line_judgments':[{'line':i,'before':a,'after':b,'reason':note,'preserves_information':True}for i,(a,b)in enumerate(zip(e['before'],rows))if a!=b],'editorial':editorial,'scope':{'files':files,'dynamic_check_label':'producer-current'},'adopted_script':P+'SCRIPT.json'}
 write(paths['context'],context);write(paths['draft'],draft);result=review(draft);write(paths['review'],result)
 if result['status']!='passed':print(key,result['errors']);raise SystemExit(1)
 batch.append(paths)
write(P+'REVIEW_BATCH.json',batch)
retained={
'ch2SearchAside':'巡卫质疑夜班、布伦要求换岗不断岗，指令具体；保留玩家独享的追捕部署。',
'ch2Bridge':'查货、艾莉娅提醒车轴、诺恩阻止暴露身份有连续动作；圣女拒绝继续被拖走，保留。',
'ch2TargetBefore':'赫斯特强迫伤者继续跳舞、压下粮税回执，逐句与原演出动作相符；不把罪证授给不在场主角。',
'ch2Alarm':'报警后的封门、求活捉、禁放箭和搬柴居民处于直接危险，保留必要现场命令。',
'ch2TargetAfter':'明确布伦死亡、赫斯特存活及追捕；侍女受辱动作与乐声延续，保留原独立视角。',
'ch2PursuitStops':'前线巡卫没有越界搜人的授权，只守出口并回报，合理制止无需改写。',
'selinePoleFound':'坏车、蓝布、直连杆和店名对应真实任务物品，取回动作明确。',
'selineWorkLockedByAlarm':'桥口增援导致旧支线暂停，提示如实解释原门禁。',
'innRestTalk':'二十金包含热水床位，诺恩只坐一会仍按原价，三句已自然说明服务。',
'v9PostWheel':'塞木楔、提醒卸货人让开构成具体救助；不是人物道德宣言。',
'v9CartRope':'断轴麻绳与墙下铁环建立可观察的探索用途，不额外添加秘密。',
'v9TollScale':'账本文字具体记录过桥赊账，保留二十年前最后记录而不虚构后续命运。',
'v9BridgeWater':'圣女分半囊水给老人、诺恩问她后面喝什么，分歧落在真实水量与赶路。',
'v9WellRim':'井字提示绳圈和壁孔，观察即线索，保留真实机关条件。',
'v9WardenFirst':'兽在井下做窝，石柱可挡、避免角落是对应实战地形的合理危险提示。',
'v9WardenChain':'拉链、石落、兽扑向声音对应一次性控制效果，无需加解释台词。',
'v9Waterline':'放水后可取物是实际前置，先放水表述在此是必要操作关系。',
'pacing:v12WatchHours:complete':'问铁件如何过桥，巡卫说明正桥排队、小件南沟、运柴门开包；原目的与可走方向清楚。',
'pacing:v12QuietRoom:after':'巡卫已走和门轴松动均是当前环境信息，轻关门属于实际日常提醒。',
'pacing:v12CartBuckles:after':'车夫重新绑货且收好带子，交付后的具体地方结果保持。',
'inline:ch2:sign':'路牌东向灰桥与查验规矩是公开信息，保留。'}
edits={e['key']:e for e in s['entries']};audit=[]
for key in s['reviewed']:
 e=edits.get(key);note=e['reason']if e else retained[key]
 audit.append({'scene':key,'status':'revised'if e else 'retained','pages':len(current[key]['text']),'reason':note,'before_sha256':base[key]['sha256'],'after_sha256':current[key]['sha256']})
write(P+'CHAPTER_AUDIT.json',{'chapter':'R02','scenes':audit,'editor':'Codex','human_status':'pending','limits':['64 variants include retained legacy branch selineFoundFirst; no claim that every branch occurs in one playthrough.','Same-page textual invariants are technical checks; information-preservation judgments above are explicit editorial assessments.']})
print(len(batch),'reviews; full chapter',len(audit),'scenes')
