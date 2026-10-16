"""Serialize explicitly reviewed technical evidence; human quality remains pending."""
import json,sys,hashlib
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint
from map_quality import relevant,changed
P=Path('docs/c2-optimization');fp=fingerprint(inventory())
def read(p):return json.loads(Path(p).read_text())
def write(p,v):Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def art(p):return {'path':str(p),'sha256':hashlib.sha256(Path(p).read_bytes()).hexdigest()}
def evidence(reason,*paths,status='pass'):return {'status':status,'reason':reason,'evidence':[art(p)for p in paths]}
normal=read(P/'NORMAL_EQUIVALENCE.json');assert normal['passed']
map_notes={'post':'旅店门檐、货车和路牌围绕驿道布置，入口和旅店不被货物遮住。','inn':'炉火、长凳、水泵和账桌用途可辨，塞琳柜台可从中央走道抵达。','bridge':'查验人群在上方岗哨两侧，南沟绕路与水道桥位可辨；原通路保持。','bridgecellar':'旧账桌、货物与石室对应废弃收费处，入口保留且物品有实体位置。','manor':'围墙、运柴口、井和内门形成进院后检查内门的路线；报警波次有原遮挡物。','wellcrypt':'石柱、旧链与守井兽区域对应战斗和机关，地面空隙与碰撞叠层一致。','spillway':'泄水装置、旧桥和守卫分布对应撤离路线，场地与门位保持。','exile':'界碑与右侧雾林区分城界和禁地，越界后去石阶的路径明确。','chamber':'桌椅、壁炉、书架围出独立内室，演出专用，不把隔离截图中测试英雄的位置称运行正史。'}
rows=[]
for name,note in map_notes.items():
 path=P/'maps';rows.append({'id':name,'playability':evidence('完整128图生产定义与基线相等；八张可玩图73条实际移动路径与三职业正常输入覆盖主路、支路、撤离。内室仅是独立切镜，不纳入玩家寻路通过率。',P/'MAP_PRESERVATION.json',path/'NAVIGATION.json',P/'NORMAL_EQUIVALENCE.json'), 'scene_credibility':evidence(note,path/(name+'.webp'),path/(name+'-collision.webp')), 'character_consistency':evidence('塞琳栗发红披肩灰蓝裙与原角色帧一致；巡卫盔甲、盾、脚锚及站/走/攻帧一致。沿用原资源，无新增角色美术。',path/(name+'.webp'),path/'chapterBodies-frames.webp',path/'chapterGuards-frames.webp','dist/assets/v8/chapter-world-v8.png','dist/assets/v30/guards.png')})
for name in ['hall','warehouse','c1LoomRoom','c1DrillGallery','c1TrialVault','town']:
 path=Path('docs/c1-endurance/visual');rows.append({'id':name,'playability':evidence('本轮仅血量改变；完整地图定义与基线相等，当前实际碰撞格/画面、第一章22图移动回归及三职业正常路线相互验证。',P/'MAP_PRESERVATION.json',path/(name+'-collision.json'),P/'integration/navigation/MOVEMENT.json',P/'NORMAL_EQUIVALENCE.json'), 'scene_credibility':evidence('实际画面和碰撞叠层核对原建筑、家具和入口；没有因本轮HP迁移产生占路物件。试炼区保留构装体和独立终试区域，会馆/救济沿用当前1.5布置。',path/(name+'.png'),path/(name+'-collision.png')), 'character_consistency':evidence('本轮增血沿用五精英身体起手和Boss细线提示；当前角色形态、体量、脚锚与原图一致，商人仍是第一章固定女性形象。',path/(name+'.png'),'dist/assets/c1-map-quests/trial-construct.png','dist/assets/c1-story-world/vault-guardian.png','dist/assets/c1-character-flow/merchant.png')})
report={'schema':1,'source_fingerprint':fp,'reviewed_paths':relevant(changed('d57ae25f73e97e8002bbb6a3f9e42646714b8bdf')),'assets':[art(p)for p in ['dist/assets/v8/chapter-world-v8.png','dist/assets/v30/guards.png','dist/assets/c1-map-quests/trial-construct.png','dist/assets/c1-story-world/vault-guardian.png']],'maps':rows,'limits':['Conservative installer/renderer gate; no authored map geometry or assets changed. Current movement, renderer and combat evidence are distinct checks.','Automatic input is not human map credibility or difficulty approval; visual judgments are the executing editor’s inspection.']}
write(P/'MAP_QUALITY.json',report);write('docs/map-quality/LATEST.json',report)
human={'status':'pending','remaining':['真人文风、第一章增血后的招式轮次/补给负担、第二章节奏与乐趣'],'playable_build':art('qa-export/release-build/Ashen-V28.1-Play.html'),'observation_template':art(P/'HUMAN_OBSERVATION.md')}
comparison={'classes':['shadow','oath','ember'],'cohorts':['starter','normal','optimized'],'same_source_snapshot':True,'production_rules':True,'human_win_rate_claim':False}
for ch in [1,2]:
 r={'schema':2,'chapter':f'R{ch:02}','kind':'chapter'if ch==2 else 'scoped','source_fingerprint':fp,'comparison':comparison,'human':human,'scopes':{}}
 c='docs/c1-endurance/COMBAT.json'if ch==1 else str(P/'combat/COMBAT.json')
 r['scopes']['combat']={k:evidence(reason,c,P/'NORMAL_EQUIVALENCE.json')for k,reason in {
 'growth_comparison':'同源合法初装/常规/现有装备优化三组，各三职业。保留失败；隔离Lab不限为全胜，不当真人胜率。',
 'enemy_roles':'第一章普通怪1.5倍、精英Boss2.5倍；既有岗位、伤害和奖励保持。第二章敌人预算与岗位保持，仍使用真实战斗验证。',
 'groups':'普通与精英群战记录耗时、胜负和资源消耗；孤立满资源对照与真实路线分别列出。',
 'continuous_maps':'连续遭遇共享资源；正常UI使用已有配药/休息/商店，失败死亡档保留。资源没有通过测试钩子补充。',
 'elite_mechanics':'第一章增加招式轮数机会，原攻击模式和克制提示保持；第二章守卫/布伦与井兽沿用既有机制。无固定分钟数或真人难度通过承诺。'}.items()}
 if ch==2:
  r['normal_input']={a['class']:{**evidence('真实UI导入第一章完结档，三职业走主线与可选支路到第三章入口；最终两句文风清理有严格生产输入等价核对。',a['path'],P/'NORMAL_EQUIVALENCE.json'),'input_method':'normal_ui','state_mutation_hooks':False,'ending_phase':a['ending_phase']}for a in normal['runs']if a['chapter']==2}
  r['compatibility']=evidence('完整旧正文游标、末页提交、章界奖励幂等与后章构造/存档回归通过；原全图定义保持。',P/'CHECKS.json',P/'INTEGRATION.json',P/'MAP_PRESERVATION.json')
  for scope,fields in {
   'exploration':{'topology':'原主路和两处暗室完整保留，八图73条真实移动路线覆盖入口到目标。','branch_value':'修泵免费休息、桥下补给、井兽奖励与旧链控制有真实效果；三职业实际使用。','space_and_visuals':'当前全景/碰撞/角色帧分别审查；原128图定义相等。'},
   'quests':{'playable_process':'查验任务分接取/待问/问毕目标，水泵与铜扣先接再收集/交付，末页才结算。','repetition_cost':'菜单任务优先，同级主线在前，已知信息不再反复完整讲解；不新增强制跑腿。','world_result':'泵修复换免费休息，报警暂停旅店任务，布伦死/赫斯特活和越界结果保持。'},
   'services':{'real_transactions':'寄卖格子只选择不扣款，真实购买/装备/出售与回执覆盖缺钱/满包/等级/远离/重载；三视口实际UI通过。','resource_loop':'装备、药物、休息与支线报酬构成既有资源循环，不凭空加钱；第一章补给费用纳入经济账本。'},
   'pacing':{'causality':'64场全文审读，43场104句修订；接头、查岗、验门拒绝、报警、突围和越界顺序保持。','safe_triggers':'0.4安全延迟触发及跨图兜底回归，正常UI没有对话覆盖正在进行的任务提交。','knowledge_boundaries':'独立内室和会馆切镜属于玩家视角；主角不凭润色得知幕后来历，旧0.3追加A/B继续未采用。'}
  }.items():
   paths=[P/'NORMAL_EQUIVALENCE.json',P/'MAP_QUALITY.json']if scope=='exploration'else [P/'CHAPTER_AUDIT.json',P/'CHECKS.json',P/'NORMAL_EQUIVALENCE.json']if scope in ['quests','pacing']else [P/'services-final/QA.json',P/'NORMAL_EQUIVALENCE.json']
   r['scopes'][scope]={k:evidence(v,*paths)for k,v in fields.items()}
 write(P/f'EXPERIENCE_R{ch:02}.json',r)
print('15 maps, R01 combat and full R02 technical judgments recorded; human pending.')
