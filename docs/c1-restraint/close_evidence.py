"""Record reviewed, scoped technical evidence; human judgment stays pending."""
import json, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from common import inventory, fingerprint, digest
from map_quality import relevant, changed, validate_report
from experience import validate_report as validate_experience
P = Path('docs/c1-restraint')
def read(p): return json.loads(Path(p).read_text())
def write(p, data): Path(p).write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
def art(p): return {'path': str(p), 'sha256': digest(Path(p))}
def judgment(reason, *paths): return {'status':'pass', 'reason':reason, 'evidence':[art(p) for p in paths]}
fp = fingerprint(inventory())
assert fp == 'd25ac2a89037cf078a1d9a83efe7613863e7d40b802697c294d3d18797a02add'
checks = read(P/'post-checks/RESULTS.json')
recovered = {r['name']:r for r in read(P/'recovered-checks/RESULTS.json')}
for row in checks:
    assert (recovered.get(row['name'], row))['exit_code'] == 0
assert all(r['exit_code']==0 for r in read(P/'ENTRY_CHECKS.json'))
assert read(P/'package/WEB_QA.json')['passed']
assert read(P/'LOCAL_SERVER.json')['status']=='passed'
write(P/'FINAL_CHECKS.json', {'source_fingerprint':fp, 'technical_pass':True,
    'initial_batch':art(P/'post-checks/RESULTS.json'), 'initial_batch_exit_code':1,
    'recovery':art(P/'recovered-checks/RESULTS.json'), 'supplemental_entry':art(P/'ENTRY_CHECKS.json'),
    'integration':art(P/'INTEGRATION_REUSE.json'), 'default_build':art(P/'DEFAULT_BUILD.json'),
    'local_server':art(P/'LOCAL_SERVER.json'),
    'limits':['023 remains failed: missing historical C3 snapshot and unguarded capture hook; 024 fixes only fixtures and passes both branches.',
              'Combat sample losses remain losses; driver completion does not mean all cohorts win.',
              'No human difficulty, prose or fun approval is inferred.']})
nav=P/'integration/navigation/MOVEMENT.json'
combat=P/'COMBAT_COMPARISON.json'
asset=P/'ASSET_INTEGRITY.json'
natural=P/'natural-final/RESULTS.json'
maps=[]
descriptions={
 'hall':('装置80×100，接近家具尺度；商人、工作台、餐桌分区，四门及交互点保留通行。','罗萨场景与面板固定同一女性原帧；薇蕾娜及主角沿用原图与成年尺度。'),
 'town':('发饭桌、面包与布、长凳、小凳、水罐和粮袋围成救济角；9名演出人物分散等候，井边及主路留空。','厨娘绿围裙与朵莉红裙分开；老人/居民/母亲保留原人物图集。圣女用原柔和形象，无新增坐下或递碗专用动画。'),
 'warehouse':('原粮袋箱笼和通道保持，库房安全切镜无战斗突入。','原鼠、诺恩及安全剧情保留；普通怪仅提高耐久。'),
 'c1LoomRoom':('原工坊陈设与通路保留；会馆是初期服务入口。','原工匠角色不替换；格子制作界面三视口通过。'),
 'c1DrillGallery':('原旧廊通道不改，精英提盾横击依靠身体动作；无地面巨型图案。','木石构装体原画、脚锚及宽肩轮廓保持；盾击与重锤职责分开。'),
 'c1TrialVault':('原书架、箱笼、连接廊保留；西室精英守位重击，东厅独立终试Boss有细线扇面和落点。','封存守卫与终试执卫各保留原图；未拿新特效替代角色差异。')}
for key,(scene,character) in descriptions.items():
    files=[P/f'visual/{key}.png',P/f'visual/{key}-collision.png']
    if key=='town':files.append(P/'visual/c1SaintAid.png')
    maps.append({'id':key,
      'playability':judgment('22图389条实际moveActor路线通过；三职业正常键鼠第一章完成。红绿碰撞图与实际游戏截图分别检查，正文限制保留。',nav,natural,*files),
      'scene_credibility':judgment(scene,*files),
      'character_consistency':judgment(character,*files,asset)})
for row in read(P/'combat-visual/RESULTS.json')['rows']:
    if row['map'] in descriptions:continue
    pic=P/f"combat-visual/{row['id']}.png"
    maps.append({'id':row['map'],
      'playability':judgment('仅改敌人耐久与攻击表现；使用生产AI采集起手、同源三职业战斗与原入口放置修正，战斗失败保留。',combat,pic),
      'scene_credibility':judgment('原场景和碰撞未改；精英无地面特效，Boss细线沿真实攻击几何；截图没有大面积发光填充。',pic),
      'character_consistency':judgment('原敌人图集及比例保留，狼压肩、蝠收翼、追缉官持盾、蟹钳与炉刃可由身体识别。',pic,asset)})
report={'schema':1,'source_fingerprint':fp,'reviewed_paths':relevant(changed('0b8c198')),'maps':maps,
 'assets':[art(p) for p in ['dist/assets/c1-map-quests/artisans.png','dist/assets/c1-map-quests/loom.png','dist/assets/c1-map-quests/trial-construct.png','dist/assets/c1-story-world/vault-guardian.png','dist/assets/v4/actors-world.png']],
 'reviewer':'Codex visual inspection and production runtime evidence, not human acceptance',
 'limits':['Physical layout edits are hall and town; shared combat rendering reviewed with nine actual attack windups.',
           'Navigation is actual movement in isolated fixtures; normal-input and production battle evidence are separate.',
           'C3 direct ensureMap diagnostic timeouts are not map-entry evidence; c3-entry resolves every sample without moving enemies manually.']}
assert not validate_report(report,required_paths=report['reviewed_paths'])
write(P/'MAP_QUALITY.json',report);write('docs/map-quality/LATEST.json',report)
build=Path('qa-export/release-build/Ashen-V28.1-Play.html')
human={'status':'pending','remaining':['真人文风、精英动作可读性、Boss提示、增血后的节奏及设施手感'],
       'playable_build':art(build),'observation_template':art(P/'HUMAN_OBSERVATION.md')}
for chapter in ['R01','R02','R03']:
    evidence=[combat,P/'COMBAT.json'] if chapter=='R01' else [combat,P/'c2/COMBAT.json',P/'C2_PREPARATION_COMBAT.json'] if chapter=='R02' else [combat,P/'c3-entry/COMBAT.json',P/'c3-bosses/COMBAT.json']
    scopes={'combat':{
      'growth_comparison':judgment('同源真实存档，starter/normal/optimized三职业生产规则对照；失败不剔除，统计不是玩家胜率。',*evidence),
      'enemy_roles':judgment('普通怪、精英、Boss分别增加生命；保留伤害/奖励及原第三章怪物分工，第四至八章不改。',*evidence),
      'groups':judgment('群怪对照保留输赢和资源消耗；第三章采用真实enter入口修正的270样本，旧ensureMap诊断单列。',*evidence),
      'continuous_maps':judgment('连续路线共享有限药水与法力；三职业经济路线通过，第三章低准备连续遭遇仍有失败，难度真人待验。',*evidence),
      'elite_mechanics':judgment('五精英追咬/肩撞/扑落/横盾/重锤有不同起手与恢复；Boss保留准确范围细线、短冲击。',P/'combat-visual/RESULTS.json',P/'MAP_QUALITY.json')}}
    if chapter=='R01':
      scopes['services']={
       'real_transactions':judgment('鼠标和触摸三视口：选择只显示详情，购买符文/接交核心订单/选配方并实际制作；原有费用及持久库存保持。',P/'facility-ui/RESULT.json'),
       'resource_loop':judgment('18条三职业经济路线通过；补给使用已获金币/精粹和真实配药，未注入资源。旧对照与失败快照保留。','docs/harness/evidence/c1-restraint-20261015/020-integration.txt')}
      scopes['pacing']={
       'causality':judgment('三场邀请/追问/回报因果不变，保留16/5/19页与原动作索引；只去除点评和连续调情。',P/'CORPUS_COMPARISON.json',P/'REVIEW_BATCH.json'),
       'safe_triggers':judgment('库房安全切镜、终试后回会馆吃饭及批准、真实离馆后私谈通过生产测试与三职业正常输入。',natural,'docs/harness/evidence/c1-restraint-20261015/023-final-browser-combat-package.txt'),
       'knowledge_boundaries':judgment('未透露圣女身份、刺杀结果或幕后超前知识；其余全量对白字节保持，旧进行中全文保全。',P/'CORPUS_COMPARISON.json',P/'REVIEW_BATCH.json')}
    review={'schema':2,'chapter':chapter,'kind':'scoped','source_fingerprint':fp,'scopes':scopes,
      'comparison':{'classes':['shadow','oath','ember'],'cohorts':['starter','normal','optimized'],'same_source_snapshot':True,'production_rules':True,'human_win_rate_claim':False},'human':human}
    assert not validate_experience(review),validate_experience(review)
    write(P/f'EXPERIENCE_{chapter}.json',review)
print('Scoped experience, map review and final closure recorded; human review pending.')
