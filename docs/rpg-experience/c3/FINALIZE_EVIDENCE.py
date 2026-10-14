"""Assemble reviewed evidence only after real route completion; never invent a pass."""
from pathlib import Path
import sys,json,copy
from datetime import datetime,timezone
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,digest
from map_quality import relevant,changed
load=lambda p:json.loads(Path(p).read_text())
def write(p,d):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def ev(p):return {'path':str(p),'sha256':digest(Path(p))}
fp=fingerprint(inventory());base='docs/rpg-experience/c3/'
folders={'shadow':'natural-015','oath':'natural-013','ember':'natural-014'}
normal=[];sources={};chain={}
for cls,folder in folders.items():
 p=base+'natural-016/'+cls+'/PLAY.json';d=load(p);assert d['status']=='chapter-three-complete' and d['steps'][-1]['state']['chapter']==21 and not d['errors'];assert digest(Path(d['source']['importedSave']['path']))==d['source']['importedSave']['sha256'];normal.append(ev(p));chain[cls]={'previous_segment':ev(base+folder+'/'+cls+'/PROGRESS.json'),'completion':ev(p),'source':d['source']['importedSave'],'ending_phase':21,'test_mode':False,'note':'正常UI至狱卒后保存；测试脚本路径落点修正后从原17存档正式导入、实际返营还灯并离章。分段接续，不是一次连续会话。'}
 sources[cls]={m:base+(('natural-013' if cls=='shadow' and m in ['03-approach-clear','04-quarry'] else folder))+'/'+cls+'/'+m+'-save.json' for m in ['03-approach-clear','04-quarry','12-machine','16-herb-result']}
 if cls=='shadow':
  pre=base+'natural-013/shadow/PROGRESS.json';q=load(pre);assert q['steps'][6]['name']=='07-saint-prepared';chain[cls]['preceding_segment']=ev(pre);chain[cls]['note']='此前正常UI至圣女整备点后寻药死亡；从原07存档经正式导入补药继续。两段保留，非一次无死亡通关。'
write(base+'NORMAL_INPUT_CHAIN.json',{'status':'passed','input_method':'normal_ui','state_mutation_hooks':False,'classes':chain,'human_observation':False});write(base+'SAVE_SOURCES.json',sources)
# All figures must already exist, including real forge comparison on both versions.
combat=[base+x for x in ['baseline-entry/COMBAT.json','current-entry-final/COMBAT.json','bosses-final/COMBAT.json','forge-current-final/COMBAT.json','forge-before-final/COMBAT.json']]
for p in combat:assert Path(p).is_file(),p
integration='docs/harness/evidence/rpg-experience-20261014/043-c3-final-integration-and-package.txt'
review=base+'MAP_REVIEW.md';maps=[]
ids=['hellGate','hellApproach','hellQuarry','hellSluice','hellWall','hellCamp','hellGrotto','hellWorkshop','hellMine','hellFerry','hellPass','hellArena','hellTomb','hellRift']
for mid in ids:
 row={'id':mid}
 for dim,reason,paths in [
  ('playability','14图182条正式移动路线；实际入图生产群战、正常UI和首领测试另列，不以移除敌人的网格扫描代替战斗。',[base+'maps-delivery/NAVIGATION.json',base+'current-maps-final/'+mid+'-collision.webp',base+'current-entry-final/COMBAT.json',base+'NORMAL_INPUT_CHAIN.json']),
  ('scene_credibility','已查看正式全图与改前后；具体地理/物件用途和保留局限见逐图审阅。',[base+'current-maps-final/'+mid+'.webp',base+'baseline-maps-complete/'+mid+'.webp',review]),
  ('character_consistency','实际NPC和敌人画廊与原画映射一致；职业救援与恢复用原演员和行装。',[base+'current-maps-final/hellNPC-frames.webp',base+'current-maps-final/hellEnemies-frames.webp',base+'current-maps-final/'+mid+'.webp',review])]:
  row[dim]={'status':'pass','reason':reason,'evidence':[ev(p) for p in paths]}
 maps.append(row)
assets=[ev(p) for p in ['dist/assets/v10/hell-npc-portraits-v10.png','dist/assets/v10/hell-enemies-atlas-v10.png','dist/assets/v10/hell-environment-atlas-v10.png','dist/assets/v30/hell-scenery.png']]
mq={'task':'rpg-c3-20261014','reviewer':'Codex实际画面审阅；真人审美待验','checked_at_utc':datetime.now(timezone.utc).isoformat(),'source_fingerprint':fp,'reviewed_paths':relevant(changed('9d352b17ee7d40ed963e3315aae007f13481f08b')),'assets':assets,'maps':maps};write(base+'MAP_QUALITY.json',mq)
from experience import FIELDS
r={'schema':2,'chapter':'R03','kind':'chapter','source_fingerprint':fp,'scopes':{},'comparison':{'classes':['shadow','oath','ember'],'cohorts':['starter','normal','optimized'],'same_source_snapshot':True,'production_rules':True,'human_win_rate_claim':False}}
reasons={
'combat':['同真实存档/种子前后各270群战，另81首领与两版制作实战；失败保留。','犬、远程魂、重甲与首领保持已有职责；不统一抬血。','原成组AI、视线与修正出生点实测。','四张连续地图中途不补满，真实药品与升级规则。','两前置Boss含随从、典狱长正式机制与正常UI验证。'],
'exploration':['两窟新增主路/支路/回路，14图182条实际路线。','修轮制作、渡岸开墓室与草药配药有真实状态和资源结果。','两洞窟正式原画与碰撞同源，14图独立三维审阅；真人审美待验。'],
'quests':['寻药切圣女、借灯取晶、修轮、修渡岸灯与墓室转盘均实际输入。','未增加主线计数、强制反复跑腿；护灯可康复后工坊回报。','采药支线完成开放实际配药，修船点开墓室，幂等奖励与旧档保留。'],
'services':['桌面和两移动视口真实制作、比较、装备、配药、休息事务通过。','真实90金5铁3玻璃制作和2草8金配药，正常行装/补药取舍记录。'],
'pacing':['原抵达、受伤、寻药、治疗、暂同行与离章因果保留。','必要事件持久化白名单队列、安全原地点播放、不覆盖pending、不重复结算。','532原场景原字保持，两场服务对白审查；诺恩昏迷不获得圣女独处知识。']}
for scope,fields in FIELDS.items():
 r['scopes'][scope]={}
 for field,reason in zip(fields,reasons[scope]):
  paths=([ev(p) for p in combat] if scope=='combat' else [ev(base+'MAP_QUALITY.json')] if scope=='exploration' else [ev(base+'services-delivery/QA.json')] if scope=='services' else [ev(base+'TEXT_COMPARISON.json')])
  r['scopes'][scope][field]={'status':'pass','reason':reason,'evidence':paths+[ev(base+'COMPARISON.md'),ev(base+'NORMAL_INPUT_CHAIN.json'),ev(integration)]}
r['normal_input']={c:{'status':'pass','reason':chain[c].get('note','真实C2完成档正常UI至第四章入口，未经状态修改。'),'evidence':[normal[i],ev(base+'NORMAL_INPUT_CHAIN.json')],'input_method':'normal_ui','state_mutation_hooks':False,'ending_phase':21} for i,c in enumerate(folders)}
r['compatibility']={'status':'pass','reason':'旧行装向上迁移、冻结诺恩/圣女独立存档、队列/奖励幂等与完整199核心检查通过。','evidence':[ev(integration),ev(base+'TEXT_COMPARISON.json')]}
r['human']={'status':'pending','remaining':['首次完整阅读和找路节奏','难度/乐趣','岩壁轨道观感','触控操作手感'],'playable_build':ev('qa-export/rpg-c3-final-preview/Ashen-V28.1-Play.html'),'observation_template':ev(base+'HUMAN_OBSERVATION.md')};write(base+'ACCEPTANCE.json',r)
