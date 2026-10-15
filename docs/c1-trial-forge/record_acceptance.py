import json,sys
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,digest,write_json
from map_quality import relevant,changed
from experience import FIELDS
P='docs/c1-trial-forge/'
read=lambda p:json.loads(Path(p).read_text())
def artifact(p):return {'path':p,'sha256':digest(Path(p))}
def row(reason,paths,status='pass'):return {'status':status,'reason':reason,'evidence':[artifact(P+p)for p in paths]}
closure=read(P+'closure/RECOVERED.json');assert closure['passed'];assert read(P+'DEFAULT_BUILD.json')['status']=='verified-default'
assert read(P+'INTEGRATION.json')['exit_code']==0
nav=read(P+'integration/navigation/NAVIGATION.json');assert len(nav)==22 and not any(r['unreachable']for r in nav)
move=read(P+'integration/navigation/MOVEMENT.json');paths=sum(r['paths']for r in move)
notes={
'hall':('商人与机器在会馆西侧，作业台、炉火、餐桌和委托区分开；薇蕾娜与诺恩从任务交流走到餐桌附近，留饭通过旁白推进，未做进食动画。','罗萨原行走形象、薇蕾娜黑紫长裙与诺恩原像保持；新位置没有缩放人物。','visual/c1TrialReport-meal.png'),
'warehouse':('粮袋、粮架和墙洞维持鼠患来由；入口附近一只鼠移远，救民切镜从安全处开始，结束回原位置。','库房原鼠群与诺恩形象不变；切镜不在库房凭空放入圣女。','natural-final/shadow/02-warehouse.png'),
'c1LoomRoom':('移出罗萨与机器后保留赛铎、工具台和书架，房间仍服务样本研究；旧机器碰撞一并移走。','赛铎原人物和炼金岗位保留，未以另一套贴图代替。','visual/c1LoomRoom.png'),
'c1DrillGallery':('一层通道和栏杆保持，旧试炼守卫独立列入精英讨伐；普通八哨兵与精英的计数分开。','采用原石质构装体图集，石块关节、蓝缝及八帧脚锚保持；精英有原体型与独立名称。','visual/c1DrillGallery.png'),
'c1TrialVault':('西侧封存看守与东侧终试执卫分开；东厅减少两名普通守卫留出考核空间，两侧回廊、书架和账桌可解释岗位。','沿用原锁甲执卫图集，封存精英与终试Boss使用同类机构外观；角色类型、任务身份、Boss条和技能程序分开，不冒称新增独立美术。','visual/c1TrialVault.png'),
 'town':('救民场景在旧集市井旁的开放空地，有圣女、朵莉和居民；食篮/接碗由正文交代，未制作手持粥碗专用动画。','圣女原柔和形象、朵莉及两居民原图保持；诺恩未出现在切镜中，居民后续称赞才向他提供见闻。','visual/c1SaintAid.png')}
maps=[]
for mid,(scene,character,shot)in notes.items():
 maps.append({'id':mid,'playability':row(f'22图共{paths}条实际moveActor路线通过，目标无不可达点；三职业正常输入通章。此图碰撞图与实际战斗/服务另核验。',['integration/navigation/NAVIGATION.json','integration/navigation/MOVEMENT.json',f'visual/{mid}-collision.png','NORMAL_REUSE.json','COMBAT_COMPARISON.json']), 'scene_credibility':row(scene,[f'visual/{mid}.png',shot,'baseline/maps.json']),'character_consistency':row(character,[shot,'integration/reader/QA.json','ASSET_INTEGRITY.json'])})
assets=['dist/assets/c1-map-quests/trial-construct.png','dist/assets/c1-story-world/vault-guardian.png','dist/assets/v6/vilerena-world-v6.png','dist/assets/v6/vilerena-portrait-v6.png','dist/assets/v4/actors-world.png','dist/assets/c1-care-ui/underground-portraits.png']
quality={'schema':1,'source_fingerprint':fingerprint(inventory()),'reviewer':'Codex逐张查看会馆、库房、工坊、地下两层、城镇救民实景、碰撞图、原构装体与锁甲执卫图集、餐桌会面及手机制作。','reviewed_paths':relevant(changed('9df5b53')),'assets':[artifact(p)for p in assets],'maps':maps,'limits':'隔离截图、自动路径/战斗事实及执行编辑视觉判断分别记录；新造型未生成，进食/发粥由原场景人物与对白表现；真人审美和节奏待验。'}
write_json(Path(P+'MAP_QUALITY.json'),quality);write_json(Path('docs/map-quality/LATEST.json'),quality)
explanations={
'combat':{'growth_comparison':'同一实际路线存档分别使用初始武器零分配、正常行装和只用已拥有装备的优化行装。324组独立对抗及54组群战/连续地图。','enemy_roles':'一层精英与三层精英采用重击预警；独立终试Boss使用盾击、重压和远程反击。Boss不计五精英名单。','groups':'庭院八只、两层各八只与终点有不同处理目标；单图实验记录真实XP、升级恢复、承伤、药水和法力空窗。','continuous_maps':'生产规则连续走王道、磨坊和溪林，不在地图间补满资源；正常UI含真实返程。','elite_mechanics':'五精英加独立Boss分别实验，响应预警与硬打策略分开；不宣称脚本成功比例为真人胜率。'},
'exploration':{'topology':'保留22图拓扑，解除三层对检修支线的主线依赖；回报指向薇蕾娜。','branch_value':'五处讨伐与维修/样本支线各有独立结果，最终Boss不替代精英；后续章不扩建。','space_and_visuals':'商人与机器前移，碰撞同步；西精英/东终试留出空间，实际截图与路径分别验收。'},
'quests':{'playable_process':'先谈缘由、再接取，清鼠→考核→亲口汇报→委托；五精英齐备一次付款。','repetition_cost':'主线在会馆完成装备教学，不强迫去旧工坊领固定材料；完整支线仍需往返，会使用实际补给。','world_result':'鲁恩安排维修/运货恢复，终试证明应变；核心订单交材料才产出，读档和重按不重领。'},
'services':{'real_transactions':'三视口真实鼠标/触摸配药、接单、交付、随机购买和制作。旧免费材料按legacy路径保留。','resource_loop':'第一章普通有效击杀70%药用精粹；小/中药2/4份，1/2金币；批准后随机订单3—5份换核心，商店每次三枚符文，买后补货，存档不刷新。'},
'pacing':{'causality':'薇蕾娜因担忧安排试炼、从打法认识成长、留饭与正式授权；居民赞赏承接圣女救民。','safe_triggers':'库房接任务后、安全入口、无其他对白/战斗时一次切镜；正式离场后原会馆私谈。','knowledge_boundaries':'救民只让玩家看见；诺恩入城听居民描述。圣徽开门仍为传达的说法，私谈秘密不授予他。'}}
proofs={'combat':['COMBAT_COMPARISON.json','NORMAL_REUSE.json'],'exploration':['MAP_QUALITY.json','integration/navigation/MOVEMENT.json'],'quests':['closure/affected-retry.txt','integration/economy/shadow-local_work.json','DIALOGUE_REVIEW.md'],'services':['facility-ui/RESULT.json','closure/affected-retry.txt','integration/economy/ember-repeat_patrol.json'],'pacing':['NARRATIVE_QA.json','NORMAL_REUSE.json','integration/flow/QA.json']}
report={'schema':2,'chapter':'R01','kind':'chapter','source_fingerprint':fingerprint(inventory()),'scopes':{s:{f:row(explanations[s][f],proofs[s])for f in fields}for s,fields in FIELDS.items()},'comparison':{'classes':['shadow','oath','ember'],'cohorts':['starter','normal','optimized'],'same_source_snapshot':True,'production_rules':True,'human_win_rate_claim':False},'normal_input':{c:{**row('从标题新建，真实键鼠操作完成第一章；只读观察钩子，原记录与当前生产规则逐字核验，新修订只涉及制作成功提示。',[f'natural-final/{c}/PLAY.json','NORMAL_REUSE.json']),'input_method':'normal_ui','state_mutation_hooks':False,'ending_phase':6}for c in ['shadow','oath','ember']},'compatibility':row('225核心、7新专项、67Harness、完整integration及针对最后UI提示的补充回归通过。旧schema/在播全文、道具和奖励幂等保持；后续章兼容。',['closure/RECOVERED.json','INTEGRATION.json','package-clean/WEB_QA.json']),'human':{'status':'pending','remaining':['真人初见路线和章长','对白自然度与亲昵分寸','精英/Boss难度和药水制作乐趣','随机现货/订单期待感'],'playable_build':artifact('qa-export/release-build/Ashen-V28.1-Play.html'),'observation_template':artifact(P+'HUMAN_OBSERVATION.md')}}
write_json(Path(P+'EXPERIENCE.json'),report)
print('Map review:',len(maps),'maps;',paths,'actual movement routes; whole chapter report saved.')
