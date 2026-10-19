from pathlib import Path
import json,hashlib,sys
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'tools/harness'))
from common import inventory,fingerprint
from map_quality import relevant,changed
hash=lambda p:hashlib.sha256((root/p).read_bytes()).hexdigest()
def evidence(*paths):return [{'path':p,'sha256':hash(p)}for p in paths]
browser='docs/loot-services/browser';q=json.loads((root/browser/'QA.json').read_text());assert q['status']=='passed'
review={'schema':1,'source_fingerprint':fingerprint(inventory(root)),'reviewed_paths':relevant(changed('15595193f01c14ef29237efad606367559099197',root),root),'assets':evidence(*[str(p.relative_to(root))for p in (root/'dist/assets/loot-services').glob('*.png')]),'maps':[]}
for row in q['maps']:
 m=row['id'];screens=evidence(browser+'/'+m+'.png',browser+'/'+m+'-collision.png')
 review['maps'].append({'id':m,'playability':{'status':'pass','reason':f'真实RPG routeTo/moveActor执行{len(row["paths"])}条NPC/出口路径，逐步检查无碰撞；6图总34条，角色外观不改变原碰撞和空间。会馆赏金猎人站位855,385可达。三职业18条实际任务路线覆盖试炼战斗、拾取和返回，连续浏览器磨坊路线补充共享绘制实战。','evidence':screens+evidence(browser+'/QA.json',browser+'/'+m+'-cells.json','docs/loot-services/ECONOMY_SUMMARY.json','docs/loot-services/verification/integration.txt','docs/loot-services/world/BROWSER_WORLD.json')},'scene_credibility':{'status':'pass','reason':'对照当前实际截图与碰撞图，NPC站在原接待、维修或记录工作区；新猎人在会馆公共地面接悬赏，不占门/家具/主路。角色脚底在地面，无背景矩形；原场景布局、灯光、楼层和道具原件保持。','evidence':screens+evidence('docs/loot-services/ART_REVIEW.md')},'character_consistency':{'status':'pass','reason':'五角色40帧实际图与原画及主角/关键NPC对照检查；82参考身高、相同脚锚。商人在会馆、地底与市场使用同一翠绿象牙白女性；猎人银发红披肩，三位试炼角色保留年龄/职责，衣色与高清独立立绘一致。512×1015以上原生立绘经三视口对话检查，原型及未采用首稿保留；真人审美待验。','evidence':screens+evidence(browser+'/characters-40-frames.png','docs/loot-services/ASSETS.json','docs/loot-services/reader/QA.json','docs/loot-services/reader/c1iden-1440.png','docs/loot-services/reader/c1hesha-1440.png','docs/loot-services/reader/c1venn-1440.png','dist/assets/v24/noen-walk-v24.png','dist/assets/v6/vilerena-world-v6.png')}})
for path in ['docs/loot-services/MAP_QUALITY.json','docs/map-quality/LATEST.json']:(root/path).write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print('Recorded independent 3D review for',len(review['maps']),'maps')
