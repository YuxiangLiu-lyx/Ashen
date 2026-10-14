"""Persist the editor's scene-specific judgments and exact installed dialogue.

This builds receipts, not an automatic claim of literary quality. The judgments
below were made while reading the chapter, character records and full script.
"""
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools/harness'))
from common import read_json,write_json,inventory,fingerprint
from narrative import context_packet,review,audit
out=ROOT/'docs/c1-story-flow/narrative-current';out.mkdir(exist_ok=True)
script=read_json('docs/c1-story-flow/SCRIPT.json')
book=read_json('source/narrative/chapters/R01.json')
names={c['name']:c['id'] for c in read_json('source/narrative/catalog.json')['characters']};names['旁白']='narrator'
events={e['scene']:e for e in book['events']}
# Specific causal and voice judgments, shared only across stages of the same job.
notes={
 'rats':'奥伦急着保粮、收粮，抱怨落在粮袋和墙板上；诺恩追问具体洞口。提醒查北墙使鼠患有缘由和收尾。',
 'c1Readiness':'鲁恩先承接薇蕾娜的担心，再交代甲壳冲撞与围堵；诺恩会问试炼目的，并在回报时解释自己的判断。没有把试炼写成治伤。',
 'c1ExitDrill':'伊登负责维修班安全，解释哨兵、鼠群和两层通路；诺恩复述路线，清路同时检验应变。回报引向阿林，不凭空派发下一项。',
 'v12CourierRoad':'阿林先确认车夫平安，再担心货车；诺恩问人是否回来，表现务实而非只接数量。收车后过夜入城承接时间。',
 'c1LoomBrief':'罗萨先让诺恩比较手头装备，提供试作材料但允许保留；诺恩自己决定是否制作，服务不强迫消费。',
 'v12NorthDelivery':'封套在委托中已有来由，托马核蜡与翻册才谈入口；普通路线复用一场完整北门交接，旧档仍可补听。',
 'c1CanalPrep':'渠鼠咬坏支木导致工人无法上桥，诺恩追问清路与侧门的关系；回报让托马安排检修，具体退路有因果。',
 'c1CanalBreak':'诺恩要先突破围堵；艾莉娅要求自己走并追究挟持，不因提供任务就认同绑架者。闸口清理只服务眼前求生。',
 'oil':'奥伦既心疼灯油又怕诺恩摔伤，把关心藏在开销和牢骚里；油囊的绳和油味给出可辨认物件。',
 'v12Water':'奥伦补公共药箱，以搬箱修棚时的擦伤解释备用药，明确不假定诺恩已经受伤。挑掉碎壳承接药材用途。',
 'letter':'阿林更着急未送达的信件，接取说清皮囊、狼群和地址；诺恩回报信未散，报酬来自信使自己的步法札页。',
 'herbs':'米拉走不开又有人等药，诺恩主动问采集地点和送交处；允许先给蕾娜的急需者分支，救急不是突然换任务。',
 'lantern':'朵莉是收铺晚的人，忧虑从自己过桥的生活说起；护腕是她缝的谢礼，诺恩看针脚而非空泛赞美。',
 'copper':'洛缇在意工具能否装回，诺恩问铜圈会否损坏；完整铜圈用于修理和练武环，奖励与手艺相连。',
 'echo':'洛缇说明修理受机芯与守兽阻碍，诺恩区分前后槽，先读检修记录；机芯到手才确认修理能继续。',
 'c1ClockMemory':'妹妹对拖延多年的旧物有遗憾，也担心诺恩冒险；诺恩承诺找不找得到都回来。回报沿用原银环、纸页与哥哥的细节。',
 'c1RuneWear':'罗萨按符线断口和受潮程度判断维修，三片不是无来由材料额度；后续运料求助接在维修工作之后。',
 'c1RuneKiln':'罗萨分清比对翼尘和处理夜翼两件事；相同沉积只能支持继续调查，不凭样本宣布幕后真相。',
 'c1AlchemistSamples':'赛铎明确光听描述不够，拒绝没证据猜主使；诺恩追问结论并确认边界，旧样本可用，不要求再杀一头。',
 'c1CampHunt':'布莱克关心背柴同伴腾不出手，两处危险各堵一端；诺恩问可绕回的路，数量与实际往返路线相连。',
 'c1CampHerbs':'艾芙急着给孩子退热，说明两产地各两株的配方；诺恩提出分开放，关心通过行动体现。',
 'c1KilnRoost':'玛妲要取回工具，梯子妨碍自卫，求清普通蝠群；主动把大夜翼调查交给罗萨，两个委托有清楚边界。',
 'c1TrialSalvage':'伊登修护栏灯架，说明铆钉和导线来源；诺恩问什么能用，伊登嫌坏零件背着沉，符合维修岗位口气。',
 'c1CryptRepair':'赫莎提醒两个具体故障点及既有停机证据，不把旧看守复活当新额度；完整接取与调查回报沿用1.0。',
 'c1VaultWatch':'维恩指出北墙清册与看守的遮堵危险，提醒服务于取物；完整接取和归还沿用1.0。',
 'c1Patrol':'罗萨为运料车队联系安全通路，每轮先说明实际路线，诺恩据此答应；回报才叫车夫动身，不直接发一条计数命令。',
 'c1TrainingReason':'薇蕾娜担心带人撤离和围堵，既认可诺恩会打又要求他会判断；诺恩理解练习要看起手与空当。关心不依赖伤势。',
 'c1HerbsToLena':'诺恩说明米拉同意先送急用的草药，蕾娜马上熬药；两人交换具体谢意和家中札记，不突然升温成亲密关系。',
 'c1CanalAlreadyClear':'仅在闸口已清的存档/路线使用，诺恩不再声称前面有活追兵；艾莉娅仍要求说清绑架缘由。',
 'contract':'开场熟人的玩笑和拂木屑动作保留；委托后的新段让诺恩追问为何试炼，薇蕾娜说明带人撤离风险并提醒吃饭，关心落在具体处境。',
 'c1HiddenPairArrangement':'鲁恩实际走近后开谈，薇蕾娜先问另有开门办法为何还带走圣女，再要求保护诺恩；鲁恩回避上层并道歉。压抑与发怒有连续原因，不新增匿名旁观者。',
 'c1:localTalk:c1iden':'伊登交代自己负责安全、鲁恩负责庭院检验、赫莎负责检修，岗位清晰；自然顺接地下试炼，不提预设伤势。',
}
files=['dist/chapter-one-quest-dialogues.js','dist/chapter-one-dialogues-v31.js','dist/chapter-one-expansion-quests.js','dist/chapter-one-story-world.js','dist/chapter-one-objectives.js','docs/harness/CHAPTER_01.md','docs/harness/CHAPTER_01_STORY_FLOW.md']
scenes={**script['scenes'],'c1:localTalk:c1iden':[['伊登',script['local_talks']['c1iden']]]}
assert not audit()['errors'],audit()['errors']
results=[]
for scene,rows in scenes.items():
 e=events[scene];actors=e['participants'];at=e.get('stage_window',[None])[0];at=at.split(':',1)[1] if at else None
 q=scene[len('c1Talk_'):].rsplit('_',1)[0] if scene.startswith('c1Talk_') else 'c1Patrol' if scene.startswith('c1Patrol') else scene
 note=notes[q];kind=scene.rsplit('_',1)[-1]
 handoff=('最终页才接受，重载仍停在原页；未接受不计新目标。' if kind=='offer' else '目标达标后才展示，最终页提交一次，重载或重复调用不重复支付。' if kind=='report' else '进度场不提交奖励；真实动作/任务/flags决定可用窗口。')
 if scene=='contract':handoff='contractAccept在合同对白结束提交；这里只设置等待离场，不在本场尾部播放新私谈。原刺杀、目标、奖励不变。'
 if scene=='c1HiddenPairArrangement':handoff='新旅程真实离开hall、到达安全后回切hall，两演员走近并交谈；结束只标记已看，回到真实到达地点。旧c1Tail保持原主线提交。'
 annotated=[]
 for i,(speaker,text) in enumerate(rows):
  speaker=names[speaker];line={'speaker':speaker,'text':text,'claims':[]}
  fact=None;mode='knows'
  if scene=='contract':
   if i in [0,1,2,3,6,12,14,15]:fact='F-C1-FLOW-CONTRACT-SURFACE'
   elif i in [4,8,18]:fact='F-C1-COMMISSION'
   elif i==10:fact='F-C1-DOOR-CLAIM';mode='heard'
   elif i==17:fact='F-C1-SEAL-INSTRUCTION'
   elif i>=19 and i!=21:fact='F-C1-FLOW-PREPARATION'
  elif scene=='c1HiddenPairArrangement':
   if i==1:fact='F-C1-ALT-DOOR'
   elif speaker!='narrator':fact='F-C1-PROTECT'
  elif scene=='c1:localTalk:c1iden':fact='F-C1-FLOW-IDENLOCAL'
  elif not(speaker=='noen' and '？' in text):fact='F-C1-FLOW-'+scene.upper()
  if fact:line['claims']=[{'fact':fact,'mode':mode,'disclosure':True}]
  else:line['no_fact_reason']='本句是现场可见的走位/表情，或人物的询问、判断与回应；没有将未发生的计划或幕后秘密断言为已知事实。'
  annotated.append(line)
 isolation='本场只提供本地请求/进展/回报，获知者限定在场的'+','.join(actors)+'及玩家；没有开门内幕、上层主使或圣女后续认知。'
 if scene=='contract':isolation='“必须圣徽开门”登记为收到的说法；不把它升级为真相。诺恩此时仍不知道另有开门办法，也不知道之后会发生什么。'
 if scene=='c1HiddenPairArrangement':isolation='薇蕾娜和鲁恩在场，诺恩与艾莉娅均不在；玩家知道另有解法和保护诉求，但上层目的仍保密。运行knowledge未给主角添加私谈信息。'
 editorial={
  'character':note,
  'language':'逐句通读本场'+str(len(rows))+'行。开句“'+rows[0][1]+'”提出具体处境，末句“'+rows[-1][1]+'”完成当前交代；问答有承接，保留有依据的短答与停顿。',
  'clarity':note+' 精确物件、地点和对象与C1_OBJECTIVES/实际调用者核对。',
  'continuity':handoff+' 原任务ID、前置、数值和原非contract静态场景经过基线比对；原pending.lines继续使用原文本。',
  'information_isolation':isolation,
  'foreshadowing':('保留原开门疑问与鲁恩回避，不公布新主使或解法。' if scene in ['contract','c1HiddenPairArrangement'] else '本地工作和生活处境不扩成全知阴谋；样本只作现场比对，尚未确定的远因不在这里揭露。'),
  'emotion_relationship':note+' 关系变化限本场关心、担忧、求助或谢意，没有无经历的信任/恋爱跃升。'
 }
 draft={'chapter':'R01','scene':scene,'actors':actors,'scope':{'files':files,'dynamic_check_label':'story-regression'},'brief':{'information':note,'purposes':note,'outcome':rows[-1][1],'causality':note,'emotional_basis':note,'gameplay_handoff':handoff},'lines':annotated,'editorial':{k:{'verdict':'pass','evidence':v} for k,v in editorial.items()}}
 draft['editorial']['reviewer']='Codex执行编辑；已读取采用章稿、角色档案、调用者及本场全文。此为编辑判断，不冒充真人阅读/乐趣实测。2026-10-14'
 if at:draft['at']=at
 context,paths=context_packet('第一章人物对白、任务交代与私谈复核','R01',scene,actors,at=at)
 context['paths']=paths;context['source_fingerprint']=fingerprint(inventory())
 result=review(draft);slug=scene.replace(':','-')
 for suffix,data in [('context',context),('draft',draft),('review',result)]:write_json(out/(slug+'-'+suffix+'.json'),data)
 results.append({'scene':scene,'slug':slug,'status':result['status'],'ready':context['ready_to_write'],'errors':result['errors'],'warnings':result['warnings']})
write_json(out/'INDEX.json',results)
print(json.dumps({'scenes':len(results),'failed':[r for r in results if r['status']!='passed' or not r['ready']]},ensure_ascii=False,indent=2))
if any(r['status']!='passed' or not r['ready'] for r in results):sys.exit(1)
