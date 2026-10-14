"""Record actual shared-HUD visual inspection, independently from geometry checks."""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools/harness'))
from common import inventory,fingerprint,digest
from map_quality import relevant,changed
P='docs/dialogue-hud/'
def ev(p):return {'path':p,'sha256':digest(ROOT/p)}
def check(reason,paths):return {'status':'pass','reason':reason,'evidence':[ev(p)for p in paths]}
assert json.loads((ROOT/P/'final-checks/RESULTS.json').read_text()) and all(x['passed']for x in json.loads((ROOT/P/'final-checks/RESULTS.json').read_text()))
assert json.loads((ROOT/P/'MAP_INTEGRITY.json').read_text())['status']=='passed'
rows=[]
for mid,npc,scene,identity in [
('c1TrialFoyer','c1iden','候场长凳、登记桌和册架围着通路摆放，任务标记落在岗位人物上方。','伊登黑发胡须、青蓝外衣、钢肩甲与旧行走图一致。'),
('c1TrialCrypt','c1hesha','蓄能槽、机械轴和工具桌沿作业区布置，标记没有变成场景中的金色发光物体。','赫莎红褐盘发、暗红衣与工具围裙保留。'),
('c1TrialVault','c1venn','封存物架和木箱仍位于房间两侧，维恩守登记桌，入口和主廊保持。','维恩白发白须、赭色长衣与灰围巾保留。')]:
 rows.append({'id':mid,'playability':check('本轮世界数据与基线逐地图完全相等；当前完整集成含实际走图、碰撞和敌人回归。下方碰撞图由真实blocked逐格采样，未用视觉判断替代可达性。',[P+'MAP_INTEGRITY.json',P+'final-checks/RESULTS.json',P+'maps-final/'+mid+'-collision.json',P+'maps-final/'+mid+'-collision.png']), 'scene_credibility':check(scene,[P+'maps-final/'+mid+'.png','docs/c1-care-ui/baseline/'+mid+'.png']), 'character_consistency':check(identity+' 此次只统一标点材质；三人的清晰立绘及原世界小人均保留。',[P+'maps-final/'+npc+'-dialogue.png',P+'reader-final/'+npc+'-390.png','docs/c1-care-ui/baseline/'+npc+'-dialogue.png'])})
rows.append({'id':'hall','playability':check('真实点击离场私谈、保存原页、回到原练武庭坐标和知识记录通过；对话回看保持只读，任务末页只结算一次。',[P+'flow-browser/QA.json',P+'reader-final/QA.json',P+'MAP_INTEGRITY.json']),'scene_credibility':check('会馆炉火和家具可见，诺恩离开后鲁恩走向薇蕾娜；私谈沿用实景，不出现黑幕。',[P+'flow-browser/hall.png',P+'flow-browser/meeting-vilerena.png']),'character_consistency':check('薇蕾娜与鲁恩仍用原形象、原位置演出；改句表达她对安排的不满和担心，不赋予鲁恩原稿未披露的消息。',[P+'flow-browser/meeting-rune-390.png',P+'flow-browser/meeting-vilerena.png',P+'NARRATIVE_QA.json'])})
rows.append({'id':'c1TrainingYard','playability':check('普通怪与Boss经真实鼠标/触摸选择切换，血量、死亡、脱战和换图更新；三视口目标条不与状态栏/菜单相交。真实地图和战斗规则沿用。',[P+'browser-final/QA.json',P+'MAP_INTEGRITY.json',P+'final-checks/RESULTS.json']),'scene_credibility':check('实际查看练武庭路面、门口与木障；上方目标条保持适中长度，地图标题在交战期间隐藏以避让，右上是空间小地图而非出口名单。',[P+'browser-final/1440-ordinary.png',P+'browser-final/844-boss.png',P+'browser-final/390-ordinary.png']),'character_consistency':check('两种敌人均用原世界形象；顶部名字和血量跟随当前目标。金问号采用灰问号轮廓，金叹号压低亮部；原任务图集逐字节保留。',[P+'marks-final/marks.png',P+'baseline/ui/marks.png',P+'browser-final/1440-boss.png'])})
r={'schema':1,'source_fingerprint':fingerprint(inventory()),'reviewer':'Codex查看当前三视口目标条、地下三图与NPC、会馆私谈及灰/金标记对照；真人审美待验。','reviewed_paths':relevant(changed('e82ca67c6693900b83ee58ea031933047f3a531f')),'assets':[ev(p)for p in ['dist/assets/c1-layer-rules/quest-marks.png','dist/assets/c1-care-ui/underground-portraits.png','dist/assets/c1-story-world/underground-npcs.png','dist/assets/v6/vilerena-portrait-v6.png']],'maps':rows,'limits':'共享HUD适用于全部地图；安装后全部地图定义逐字比较。视觉判断为上列实际代表场景，未宣称逐图真人通关或全八章审美验收。'}
for p in [ROOT/P/'MAP_QUALITY.json',ROOT/'docs/map-quality/LATEST.json']:p.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print(r['source_fingerprint'])
