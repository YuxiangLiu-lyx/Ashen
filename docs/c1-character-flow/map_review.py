"""Persist the three independent judgments made from the inspected game screenshots."""
import json,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'tools/harness'))
from common import digest,inventory,fingerprint
from map_quality import relevant,changed
P='docs/c1-character-flow/'
def ev(p):return {'path':p,'sha256':digest(root/p)}
def result(reason,paths):return {'status':'pass','reason':reason,'evidence':[ev(p)for p in paths]}
report={'schema':1,'source_fingerprint':fingerprint(inventory()),'reviewed_paths':relevant(changed('875c1855d37b398d2ca4a8b83586037553a5399d')),'assets':[ev('dist/assets/c1-character-flow/merchant.png'),ev(P+'merchant-original.png')],'maps':[{'id':'hall','playability':result('当前真实RPG九条moveActor路线到四门、四人和装置全部走通；实际碰撞图对照会馆截图，商人脚下可达，地图布局和碰撞未改。安全会馆没有战斗，本轮人物立绘不涉及野外实战。',[P+'browser/QA.json',P+'browser/hall-cells.json',P+'browser/hall-collision.png']),'scene_credibility':result('实际会馆全景中商人在壁炉旁的原整备位置，机器、会客桌、书桌各有空间，四门和中央通路保持；新人物是携账本的常驻商人，没有发光背景或巨型展示。',[P+'browser/hall.png',P+'browser/hall-collision.png']),'character_consistency':result('逐图对照新原画、会馆角色、对白头像及货柜：同一栗色波浪长发、绿色裙装、白衬衣和成年女性五官；地图脚锚与原82像素成年身高保持。左右视图独立裁切、真透明边缘。该NPC固定站立，仅新增站姿及头像，不宣称新增行走或战斗帧。',[P+'browser/hall.png',P+'browser/c1rosa-menu-390.png',P+'browser/merchant-grid-1440.png','dist/assets/c1-character-flow/merchant.png'])}],'limits':['编辑已分别查看实际画面、碰撞图和人物原画；用户审美评价仍待反馈。','本轮只更换会馆商人显示形象，不改变地图结构或战斗。']}
for p in [root/P/'MAP_QUALITY.json',root/'docs/map-quality/LATEST.json']:p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(report['source_fingerprint'])
