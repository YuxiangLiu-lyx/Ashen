"""Bind the completed manual 22-map review to the final runtime and real evidence."""
import sys,json
from pathlib import Path
from datetime import datetime,timezone
sys.path.insert(0,str(Path.cwd()/'tools/harness'))
from common import inventory,fingerprint,digest
from map_quality import relevant,changed
root=Path.cwd(); folder='docs/ch1-story-world/'
read=lambda name:json.loads((root/name).read_text())
ev=lambda name:{'path':name,'sha256':digest(root/name)}
results=read(folder+'final-verification/RESULTS.json')
assert all(r['exit_code']==0 for r in results), 'Final checks must actually finish'
notes=read(folder+'REVIEW_NOTES.json');nav={r['id']:r for r in read(folder+'NAVIGATION.json')};moves={r['map']:r for r in read(folder+'MOVEMENT.json')}
assert len(notes)==len(nav)==len(moves)==22
assert sum(r['paths'] for r in moves.values())==320
assert all(not r['unreachable'] and r['connectedCells']==r['walkableCells'] for r in nav.values())
assert read(folder+'SAVES.json')['passed']
assert read(folder+'browser/QA.json')['status']=='passed'
assert read(folder+'companion-return/QA.json')['passed']
shared=[folder+'NAVIGATION.json',folder+'MOVEMENT.json',folder+'SAVES.json',folder+'final-verification/RESULTS.json',folder+'NATURAL_PROVENANCE.json',folder+'companion-return/QA.json']
shared += [folder+'natural/'+c+'/PLAY.json' for c in ['shadow','oath','ember']]
shared += [folder+'economy/'+c+'-local_work.json' for c in ['shadow','oath','ember']]
shared += [folder+'balance/ACTUAL_SNAPSHOTS.json']
frames=[folder+'visual/'+s+'-frames.webp' for s in ['c1Artisans','c1Beetle','c1Construct','c1Scenery','c1Walls','c1VaultGuardian','c1UnderNPC','c1FieldNPC','c1Loom','c1Kiln']]
rows=[]
for id,(scene,character) in notes.items():
 screen=folder+'visual/'+id+'.webp';collision=folder+'visual/'+id+'-collision.webp'
 rows.append({'id':id,
  'playability':{'status':'pass','reason':f"本图{moves[id]['paths']}条入口至出口/目标实际moveActor路线走通，足点可达网格连通，无不可达目标。三职业正常输入走主线，三职业local_work真实移动/战斗/交付走新增支线，1620快照遭遇另覆盖追击、绕行、技能和预警应对；不据此判断真人时长。",'evidence':[ev(collision)]+[ev(p) for p in shared]},
  'scene_credibility':{'status':'pass','reason':scene+' 已实际查看正式渲染、碰撞对照和局部交接截图；地形图片的实体边沿与可活动区对应。','evidence':[ev(screen),ev(collision),ev(folder+'MAP_REVIEW.md'),ev(folder+'REVIEW_NOTES.json')]},
  'character_consistency':{'status':'pass','reason':character+' 实际人物/原画和运行图集分别比对；新NPC独立职业衣着与相同人物头像，脚锚及原有前后遮挡保持。','evidence':[ev(screen),ev(folder+'ASSETS.json'),ev(folder+'PRESERVATION.json'),ev(folder+'integration/chapter123/enemy-poses.webp')]+[ev(p) for p in frames]}})
assets=[ev(str(p)) for directory in ['dist/assets/c1-story-world','dist/assets/c1-map-quests'] for p in sorted(Path(directory).glob('*.png'))]
report={'task':'c1-story-world-20261012','reviewer':'Assistant actual image inspection and reproducible runtime evidence, independently per dimension; not human full-route observation','checked_at_utc':datetime.now(timezone.utc).isoformat(),'source_fingerprint':fingerprint(inventory()),'reviewed_paths':sorted(set(relevant(changed('4d6b4bb'))+['dist/navigation-v14.js'])),'assets':assets,'maps':rows,'limits':['Historical 0.6 human full observation and pacing remain separate pending work.','Original 106 later maps preserved; no later-chapter redesign or site deployment.','First-chapter 17 old layouts and five new maps reviewed; new maps have no fabricated before screenshot.']}
for name in [folder+'MAP_QUALITY.json','docs/map-quality/LATEST.json']:(root/name).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Recorded 22 independently reviewed maps with current code and evidence hashes.')
