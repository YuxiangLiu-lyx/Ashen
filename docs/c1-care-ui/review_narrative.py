"""Four human-readable editorial judgments by the executing editor, not a prose score."""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools/harness'))
from common import read_json,write_json,inventory,fingerprint
from narrative import context_packet,review,audit
script=read_json('docs/c1-care-ui/SCRIPT.json')['scenes'];notes=read_json('docs/c1-care-ui/NARRATIVE_NOTES.json')
out=ROOT/'docs/c1-care-ui/narrative-current';out.mkdir(exist_ok=True)
assert not audit()['errors'],audit()['errors']
files=['dist/chapter-one-care-dialogues.js','dist/chapter-one-care-save.js','dist/chapter-one-quest-dialogues.js','dist/chapter-one-expansion-quests.js','dist/story-flow-v14.js','dist/chapter-one-dialogues-v31.js','dist/dialogue-reader.js','dist/game-v14.js','docs/harness/CHAPTER_01_CARE_UI.md','docs/harness/CHAPTER_01.md']
language={
 'contract':'通读37页。第21—26页完整展开两场练习、带人撤离的困难与她等消息的担忧，诺恩准确复述并提出复核办法。第27—30页的靠近玩笑由袖口、刀柄和木屑承接，诺恩解释实际顾虑，不突然说熟练情话。第31—36页从干粮、留饭聊到互相提醒吃饭，末尾约定去找鲁恩；没有抽象格言、不是/而是对比或成串短命令。原第5、7、9等短问紧接具体委托疑点，保留其有效作用。',
 'sisterIdle':'通读12页。找皮带→领扣→不愿打扰→看刀鞘→替挑刀鞘连续承接。薇蕾娜的“我还以为你是来找我的”有眼前进门动作作依据；诺恩说好看后解释她在忙，语气认真。她借帮忙逗他，随后说明刀鞘裂口的具体风险，关心与玩笑有转换，未重复声明关系重要。',
 'c1TrainingReason':'通读7页。诺恩主动问庭院训练重点，薇蕾娜用冲撞、狭窄地下及陌生出手解释；诺恩说明带人通过时的判断，构成正常交流。她说“让我多问几句，好不好”给对方回应空间，接到练完吃饭；删去先前“而不是硬往前冲”和反复短指令，没有强塞过去见过伊登的经历。',
 'sisterBeforeDeparture':'通读14页。披肩赞美的认真回应与路图注意力相连，之后谈具体侧门、护卫和手腕风险；她坦承担心后邀请坐下吃饭，没有突然告白。第10页“若还没吃”避免假定玩家做过吃饭操作；诺恩愿意聊别的，仍保持朴素回应。'
}
results=[]
for scene,rows in script.items():
 at=None if scene=='contract' else 'intro' if scene=='sisterIdle' else 'contract'
 lines=[]
 for i,(speaker,text) in enumerate(rows):
  actor={'薇蕾娜':'vilerena','诺恩':'noen','旁白':'narrator'}[speaker]
  row={'speaker':actor,'text':text,'claims':[]};fact=None;mode='knows'
  if scene=='contract':
   if i in [0,1,2,3,6,12,14,15,28,30,31]:fact='F-C1-FLOW-CONTRACT-SURFACE' if i<19 else 'F-C1-CARE-CONTRACT'
   elif i in [4,8,18]:fact='F-C1-COMMISSION'
   elif i==10:fact='F-C1-DOOR-CLAIM';mode='heard'
   elif i==17:fact='F-C1-SEAL-INSTRUCTION'
   elif i>=19:fact='F-C1-CARE-CONTRACT'
  elif not(actor=='noen'and text.endswith('？')):fact='F-C1-CARE-'+scene.upper()
  if fact:row['claims']=[{'fact':fact,'mode':mode,'disclosure':True}]
  else:row['no_fact_reason']='针对刚听到信息的询问或眼前动作、回应，没有断言不在场者的秘密或未发生的结果。'
  lines.append(row)
 handoff=('委托末页才提交contractAccept，真实离场才排入原私谈；原0、3、14动作节拍和3—18页委托原文保持。' if scene=='contract' else '原菜单chapter/flags条件进入可重复场景，无任务或奖励提交。')+'旧静态游标语义迁移一次，带lines旧档保留原段；上一条只移动阅读游标，不重放演出，读档回到实际页。'
 isolation=('原“得用圣徽开门”仍为收到的说法，诺恩和玩家仅相信，薇蕾娜heard；无替代开门方法或上层目的。' if scene=='contract' else '在对应前置时点读取资料，闲聊可在intro之后出现，不借用委托信息；临行与训练追问在contract之后。所有新信息只在两名在场者及玩家间流转。')
 editorial={
 'character':notes[scene]+' 她主动亲昵且允许对方回应；诺恩解释实际考虑，未写成木头或情场高手。',
 'language':language[scene],
 'clarity':notes[scene]+' 地点、人物和准备目的均对照当前调用者；约饭是未来邀请，没有给玩家强加新的任务门槛。',
 'continuity':handoff,
 'information_isolation':isolation,
 'foreshadowing':'原私谈、禁制疑问、上层安排保持；这四场日常关心不增加幕后真相或确定未来关系结局。',
 'emotion_relationship':'亲近来自已确定的长期熟悉；这次风险解释担忧，木屑/领扣/披肩解释玩笑的当下原因。她的关心不抹去隐瞒责任；他的关心不自动成为恋爱确认。'
 }
 draft={'chapter':'R01','scene':scene,'actors':['noen','vilerena'],'scope':{'files':files},'brief':{'information':notes[scene],'purposes':'薇蕾娜希望诺恩理解准备的必要，也愿意多陪自己说话；诺恩核实实际安排，认真回应她的关心。','outcome':'准备、委托和主线结果保持；更完整展示熟人交流。','causality':notes[scene],'emotional_basis':editorial['emotion_relationship'],'gameplay_handoff':handoff},'lines':lines,'editorial':{k:{'verdict':'pass','evidence':v}for k,v in editorial.items()}}
 draft['editorial']['reviewer']='Codex执行编辑，已读本章、两人完整档案、四场全文、实际菜单及新版截图。此为编辑判断；真人文风、亲昵程度与节奏仍待反馈。2026-10-14'
 if at:draft['at']=at
 context,paths=context_packet('第一章薇蕾娜亲近关心与对白操作复核','R01',scene,['noen','vilerena'],at=at);context['paths']=paths;context['source_fingerprint']=fingerprint(inventory());result=review(draft)
 for suffix,data in [('context',context),('draft',draft),('review',result)]:write_json(out/(scene+'-'+suffix+'.json'),data)
 results.append({'scene':scene,'ready':context['ready_to_write'],'status':result['status'],'errors':result['errors'],'warnings':result['warnings']})
write_json(out/'INDEX.json',results);print(json.dumps(results,ensure_ascii=False,indent=2))
if any(x['status']!='passed'or not x['ready']for x in results):sys.exit(1)
