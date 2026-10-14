"""Record the explicit editorial decisions documented in MAP_REVIEW and COMPARISON."""
from pathlib import Path
import sys,json,datetime
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,digest
from map_quality import relevant,changed
base=Path('docs/rpg-experience/c2');fp=fingerprint(inventory())
def read(p):return json.loads(Path(p).read_text())
def write(p,v):Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def art(p):return {'path':str(p),'sha256':digest(Path(p))}
def row(reason,*paths,status='pass'):return {'status':status,'reason':reason,'evidence':[art(p)for p in paths]}
normal=[f'{base}/natural-005/{c}/PLAY.json'for c in ['shadow','oath','ember']]
nav=f'{base}/maps/NAVIGATION.json';review=f'{base}/MAP_REVIEW.md';combat=f'{base}/current-isolated/COMBAT.json';comparison=f'{base}/COMPARISON.md';integration='docs/harness/evidence/rpg-c2-20261014/006-final-integration.txt'
mapreport={'task':'rpg-c2-20261014','reviewer':'Codex执行编辑，已逐图查看正式渲染、碰撞、实际路线与原画；真人审美待验','checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_fingerprint':fp,'reviewed_paths':relevant(changed('b54fdfe')),'assets':[art(p)for p in ['dist/assets/v8/chapter-world-v8.png','dist/assets/v30/guards.png']],'maps':[]}
reasons={'post':'屋前街道连接旅店与桥口，整备流程未改变旧建筑几何。','inn':'原柜台、炉边和水泵承载实际服务，塞琳修泵后位置变化仍可使用。','bridge':'河桥、北侧待检人群与南沟危险区分明，工具和暗库回路保持。','bridgecellar':'旧账桌与堆货符合收费室，药品与护符对应实际木匣，单室支路不冒充多层地下城。','manor':'西侧井绞盘与东侧内门分开，原中央战斗面容纳两波护卫，警报前后门禁正确。','wellcrypt':'铁链干扰与守井兽确实可玩，碎墙两侧和南沿有退路。','spillway':'沟道木桥供紧迫撤离，未通过加墙强迫清全图。','exile':'界碑和冷雾保持章界，延后对白按实际抵达位置演出，不回传旧图。'}
for m,reason in reasons.items():mapreport['maps'].append({'id':m,'playability':row('八图73条实际moveActor路线；三职业正常输入含暗库/井兽/突围，碰撞与实战分开验证。',nav,review,*normal,f'{base}/maps/{m}-collision.webp'),'scene_credibility':row(reason+' 沿用原几何和图像，真实观察及限制详见审阅。',f'{base}/maps/{m}.webp',review),'character_consistency':row('人物身份、服装、脚锚与原8/16帧保持；守卫为原持刀角色不同战法，非新弩手；界口对白使用实际诺恩/艾莉娅。',f'{base}/maps/chapterBodies-frames.webp',f'{base}/maps/chapterGuards-frames.webp',f'{base}/services-ui/deferred-spillway-at-exile.png',review)})
write(base/'MAP_QUALITY.json',mapreport);write('docs/map-quality/LATEST.json',mapreport)
mp=f'{base}/MAP_QUALITY.json';service=f'{base}/services-ui/QA.json';narr=[f'{base}/narrative/{s}-review.json'for s in ['c2PumpRest','v9TollFound']]
report={'schema':1,'chapter':'V01C02','kind':'chapter','source_fingerprint':fp,'scopes':{
 'combat':{
 'growth_comparison':row('同真实章首三职业/初始零点/普通/仅持有优化前后各270组；额外36组实际同级整备前后实战。优化额外收益较小照实记录。',combat,f'{base}/baseline-isolated/COMBAT.json',f'{base}/PREPARATION_COMBAT.json',comparison),
 'enemy_roles':row('前排防护与技能破势、近身追击和投射；同波组队，固定地区预算。布伦/井兽保持原预算。',integration,comparison),
 'groups':row('216组当前群战，加三职业正常两波庄园；实验未覆盖庄园两波，单体布伦不冒充该范围。',combat,*normal),
 'continuous_maps':row('灰桥—暗库—井下—泄水沟连续实验中途不补满，药品/XP/技能/掉落用生产规则。',combat,comparison),
 'elite_mechanics':row('布伦同源结果保持，初始烬术师失败而正常组成功；井链一次性控制与正常井兽战通过。',combat,integration,*normal)},
 'exploration':{'topology':row('八可玩图与内室原几何保持，73真实移动路线、原几何保护与桥下/井下自然分岔。',nav,mp,integration),'branch_value':row('旧收费室补给一次性实发，旧护符/额扣上调生命，井下链控制、击败守井兽得原奖励。',comparison,*normal),'space_and_visuals':row('已查看正式全图、碰撞、原画与演员实景，三维分别留证，真人审美待验。',mp,review)},
 'quests':{'playable_process':row('真实工具寻找、返回修泵和原奖品选择；既有桥口查验任务未绕过，暗库和井兽可选。',*normal),'repetition_cost':row('不增任务计数或新强制来回；修泵既有往返带来警报前长期免费休息。',comparison,*normal),'world_result':row('修泵改变真实收费与恢复，药品/装备和旧箱领取保存幂等。',service,integration,*normal)},
 'services':{'real_transactions':row('三个视口真实鼠标/触控购买、比较、装备、出售与三页免费休息；缺钱/满包/重购/距离/威胁单测。',service,integration),'resource_loop':row('三职业用242金起步，花133金自选行装、用药、修泵休息，章末232金；旧纯主线经济路线也重测。',comparison,*normal,integration)},
 'pacing':{'causality':row('准备与可选探井在警报前；报警后两波突围直接撤离，关键动机/结果不变。',*normal,f'{base}/TEXT_PRESERVATION.json'),'safe_triggers':row('近敌/敌弹/pending/切图不抢控制；泄水沟延后到相邻安全界口仍一次播放，已看与pending读档受保护。',service,integration),'knowledge_boundaries':row('内室独立视角不转为主角知识，修泵只谈劳力/热水；未实施A/B与原正史差异保持登记。',*narr,integration)}},
 'comparison':{'classes':['shadow','oath','ember'],'cohorts':['starter','normal','optimized'],'same_source_snapshot':True,'production_rules':True,'human_win_rate_claim':False},
 'normal_input':{c:{**row('通过原UI导入未经改动的真实第一章完成档，正常键鼠完成主线与所列支路，无状态修改钩子。',p),'input_method':'normal_ui','state_mutation_hooks':False,'ending_phase':12}for c,p in zip(['shadow','oath','ember'],normal)},
 'compatibility':row('真实第一章旧档导入；既有主线hash/门禁/奖励保持，离图死亡与HP比例、旧已领箱、旧pending及新休息页码重载通过；完整191核心/18经济和集成通过。',integration,f'{base}/TEXT_PRESERVATION.json',*normal),
 'human':{'status':'pending','remaining':['真人完整阅读与找路节奏','乐趣与难度体感','地图美学与岗位可辨识度','触控操作手感'],'playable_build':art('qa-export/rpg-c2-preview/Ashen-V28.1-Play.html'),'observation_template':art(base/'HUMAN_OBSERVATION.md')}}
write(base/'ACCEPTANCE.json',report)
freeze=read(base/'SOURCE_FINAL_VERIFICATION.json');now=inventory();diff=sorted(p for p in set(freeze['files'])|set(now)if freeze['files'].get(p)!=now.get(p));allowed={'docs/harness/CHAPTER_02.md','docs/harness/CHAPTER_02_RPG_EXPERIENCE.md','docs/harness/NARRATIVE_ARCHITECTURE.md','source/narrative/chapters/R02.json','source/narrative/sources.lock.json'};assert set(diff)==allowed,diff
for p in normal:
 for name,sha in read(p)['source']['files'].items():assert digest(Path(name))==sha,name
write(base/'VERIFICATION_EQUIVALENCE.json',{'integration_fingerprint':freeze['fingerprint'],'final_fingerprint':fp,'differences':diff,'reason':'完整集成后仅把三份采用记录/R02计划状态改为技术通过并审阅来源锁；无运行、测试、工具、技能或资产变化。当前61项fast及叙事审查再次通过。正常UI/战斗/服务/地图/包运行输入保持。','production_and_test_inputs_equal':True,'frozen_manifest':art(base/'SOURCE_FINAL_VERIFICATION.json')})
print('Current map/experience/editorial reports recorded')
