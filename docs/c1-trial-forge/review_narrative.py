"""Scene judgments by the executing editor; automated validation is not a literary score."""
import json,sys
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import write_json,inventory,fingerprint
from narrative import context_packet,review,audit,acknowledge
from dialogue_style import scene_risks
read=lambda p:json.loads(Path(p).read_text())
script=read('docs/c1-trial-forge/SCRIPT.json')['scenes'];book=read('source/narrative/chapters/R01.json');events={e['scene']:e for e in book['events']};names={c['name']:c['id']for c in read('source/narrative/catalog.json')['characters']};names['旁白']='narrator'
notes={
'c1SaintAid':'朵莉送热食时解释旧施粥点变动，艾莉娅询问份数、热水和送老人回家的车；两人分别解决认字、走路和吃饭的具体困难。温柔通过接碗、记住住处体现，未用劝阻或总结代替帮助。诺恩此时在库房。',
'c1TrialInvitation':'薇蕾娜从木屑逗到靠近，再看通行纸而暂缓交付；诺恩认真解释墨水和墙洞。她说明围堵、带人撤离风险，安排庭院/地下并约好回来吃饭。开放亲昵有身体动作依据，担忧有危险依据，没有虚构伤势。',
'c1TrialReport':'诺恩描述抬盾、绕正面、留退路，薇蕾娜据此肯定判断能力；看账时频频望门使等待具体。饭后解释随机核心订单与符文商品，再明确无法应付时撤回。她仍担心，却尊重他的决定，诺恩答应先来报平安，关系没有突然升级。',
'c1HuntOffer':'鲁恩为维修班和运货人求助，给出地下两处和城外三处位置；诺恩询问工人安危及回报方式。五处齐备一次结算有组织维修的理由，最终Boss没有混入名单。',
'c1HuntProgress':'鲁恩复述剩余工作和汇总报酬的原因，手记承载位置；不重复整场接取说明或催促玩家冒险。',
'c1HuntReport':'诺恩回报五处已清，鲁恩安排捎话给工人；钱是五处总报酬，世界结果是维修和运货得以继续。',
'c1SupplyIntro':'罗萨先区分疗伤、提神与装置配药，再回答用法和瓶子工费；说明缀纹尚未启用及薇蕾娜安排，初期不会预告固定核心或符文奖励。',
'c1CoreOrderOffer':'罗萨解释回收核心需精粹稳定，诺恩确认接单后再凑材料；承诺保留本单、交完换单，准确对应保存和刷新行为。不同核心由实际面板列出，不用含糊文案隐藏已发生的交易成本。',
'c1TownDolly':'朵莉从正在运送的食篮说到老人等饭、父亲送人回家；诺恩询问圣女是否亲自做事。赞赏来自具体见闻，诺恩在这时才听说，未默认看过库房切镜。',
'c1TownLena':'蕾娜因弟弟夜咳和缺药感激圣女，诺恩问探访频率；她说明后续探病和问药师的帮助，口气不同于朵莉谈街坊运输。',
'c1TrainingReason':'诺恩追问为何选两种练习，薇蕾娜解释冲撞与构装体的区别，再把他认真问训练和答应吃饭放在一起打趣；不把担忧变成反复禁止。',
'c1Talk_c1Readiness_offer':'鲁恩承接薇蕾娜安排，也说明棚柱被撞、工人待清场；诺恩问追踪转向，鲁恩给出低头预警和回报流程，任务来源与教学相接。',
'c1Talk_c1ExitDrill_offer':'伊登逐层说明维修阻碍、八具哨兵、八只鼠与终试执卫；诺恩追问鲁恩单上的两名看守，回答明确可选精英、主线Boss及维修支线的区别。最后由诺恩确认回报薇蕾娜。',
'c1Talk_c1ExitDrill_progress':'伊登给出两层清理后到东厅的路线，说明看守另属讨伐，最后指向会馆；信息完整，没有只甩下一句命令。',
'c1Talk_c1ExitDrill_report':'这是旧存档可接续的伊登交接。诺恩说明终试已过、将回馆；伊登安排维修并提醒亲口说明。新旅程实际直接找薇蕾娜，不让玩家绕回伊登结算。',
'c1Talk_c1LoomBrief_offer':'罗萨承接薇蕾娜已讲解的装置，只说明现货、核心订单与工费；诺恩决定先看货，不承诺购买或固定器物。',
'c1Talk_c1LoomBrief_report':'诺恩复述组成，罗萨指出会馆西侧及制作前比较；新流程在汇报时结算教学，保留旧档单独交接入口。',
'c1RepairReturn':'赫莎从线路和水槽损坏说明要一起修，诺恩确认看守停机后是否能施工；她指向维恩的账册求助，不再把维修说成强制打开三层的步骤。',
'c1VaultAccept':'维恩为搬出旧账请人停下西侧看守、取东厅北墙清册；诺恩先问阻碍、再问位置。定位与移动后的精英对应，不假设玩家尚未打过终试Boss。',
'sisterBeforeDeparture':'薇蕾娜借新披肩要一句夸奖，诺恩解释注意力在门闩图；随后谈退路和已经吃过饭的水囊。她坦承仍担心，约定回馆见面，不用反复“别让我担心”施压。',
'contract':'正式委托集中交代卡德兰、侧门、封术印、圣徽说法、驿站和维护封套；诺恩逐项核实疑点。保留薇蕾娜隐瞒接头身份的停顿与理由，亲昵段前置到回报，不冲淡任务风险。',
'assassination':'18页的行动及说话人顺序保持。艾莉娅先喊止血，再争取施术和医师；封术后质问为何连救人都阻止，抓住刚才仍在说话的事实请求救治；最后阻止放箭、求护卫查看伤者。急切、愤怒、不解和悲伤依次由具体事件引出，不插入抽象抒情或原谅。'
}
files=['dist/chapter-one-trial-dialogues.js','dist/chapter-one-trial-runtime.js','dist/chapter-one-trial-save.js','dist/story-test-v31.js','dist/core-v14.js','docs/harness/CHAPTER_01_TRIAL_FORGE.md','docs/harness/CHAPTER_01.md']
negativeReasons={('contract',13):'实际任务限制：制住圣女并带出，需要制止重伤目标，不承担模板化关心功能。',('assassination',8):'刺杀者明确阻止对方接近和举起法器，现实冲突中的强制命令；保留原行动因果。',('assassination',16):'弩手已经抬手，艾莉娅紧急制止放箭以争取救人，是眼前危险警告。'}
r=audit();assert all(e['code']=='SOURCE_DRIFT'for e in r['errors']),r['errors']
if r['errors']:write_json(Path('docs/c1-trial-forge/PROVENANCE_ACK_FINAL.json'),acknowledge([e['where']for e in r['errors']],'Reviewed 1.3 chapter pointer, original scene conservation and final script registration; patrol guard is physically present in unchanged assassination event.'))
out=Path('docs/c1-trial-forge/reviews');out.mkdir(exist_ok=True);batch=[];results=[]
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
 'clarity':note+' 地点、任务对象和结果对照1.3调用者。','continuity':handoff,
 'information_isolation':isolation,'foreshadowing':'原委托隐瞒、圣徽疑问及幕后私谈保留；本场新增内容服务眼前行动，没有提前回答原伏笔。',
 'emotion_relationship':note+' 亲近或信任仅止于既有关系：薇蕾娜关怀诺恩，圣女救民；刺杀后仍愤怒且受迫。'}
 editorial={k:{'verdict':'pass','evidence':v}for k,v in edits.items()};editorial['reviewer']='Codex执行编辑，阅读实际全文与事件、角色、调用者；真人文风和节奏另待验。'
 editorial['negative_imperatives']={'scene_judgment':note+' 只保留真实冲突/警告中的否定祈使，没有同场机械关怀或同声说教。','decisions':[{'line':x['line'],'decision':'retain','reason':negativeReasons[(scene,x['line'])]}for x in scene_risks(lines)['candidates']]}
 draft={'chapter':'R01','scene':scene,'actors':actors,'style_policy_version':2,'scope':{'files':files},'brief':{'information':note,'purposes':note,'outcome':rows[-1][1],'causality':note,'emotional_basis':edits['emotion_relationship'],'gameplay_handoff':handoff},'lines':lines,'editorial':editorial}
 if at:draft['at']=at
 context,paths=context_packet('第一章1.3剧情整改逐场复核','R01',scene,actors,at=at);context['paths']=paths;context['source_fingerprint']=fingerprint(inventory());context['prewriting_context_archive']='docs/c1-trial-forge/contexts-before';result=review(draft)
 item={}
 for kind,data in [('context',context),('draft',draft),('review',result)]:p=out/(scene+'-'+kind+'.json');write_json(p,data);item[kind]=str(p)
 batch.append(item);results.append({'scene':scene,'ready':context['ready_to_write'],'status':result['status'],'errors':result['errors'],'warnings':result['warnings']})
write_json(out/'INDEX.json',results);write_json(Path('docs/c1-trial-forge/REVIEW_BATCH.json'),batch)
print(json.dumps([{'scene':r['scene'],'ready':r['ready'],'status':r['status'],'errors':r['errors']}for r in results],ensure_ascii=False,indent=2));assert all(r['ready']and r['status']=='passed'for r in results)
