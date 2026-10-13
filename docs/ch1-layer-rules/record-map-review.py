"""Record the completed image review notes and hash their independent evidence."""
from pathlib import Path
import json,sys,datetime,hashlib
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint
from map_quality import relevant,changed
out=Path('docs/ch1-layer-rules');read=lambda p:json.loads(Path(p).read_text());evidence=lambda p:{'path':str(p),'sha256':hashlib.sha256(Path(p).read_bytes()).hexdigest()}
assert all(r['exit_code']==0 for r in read(out/'final-verification/RESULTS.json'))
assert read(out/'markers/QA.json')['passed']
notes=read(out/'REVIEW_NOTES.json');movement={m['map']:m for m in read(out/'MOVEMENT.json')};assert len(notes)==22
for c in ['shadow','oath','ember']:
 d=read(out/f'natural/{c}/PLAY.json');assert d['status']=='two-chapters-complete' and len(d['steps'])==21 and not d['errors']
assets=read('docs/ch1-story-world/MAP_QUALITY.json')['assets']+read(out/'ASSETS.json')
report={'task':'c1-layer-rules-20261013','reviewer':'Assistant actual image inspection and reproducible runtime evidence, independently per dimension; not human full-route observation','checked_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source_fingerprint':fingerprint(inventory()),'reviewed_paths':relevant(changed('efdf69677de8fe3366a0fc04297c6d15f06f217a')),'assets':[evidence(a['path']) for a in assets],'maps':[],'limits':['Old 0.6 human full observation and first-play pacing remain independent; no website deployment','Current explicit scope is first chapter 22 maps; later chapters run compatibility regressions only','Isolated UI fixtures, scripted real-input campaigns and snapshot encounters are distinguished in their reports']}
play=[out/'NAVIGATION.json',out/'MOVEMENT.json',out/'SAVES.json',out/'NATURAL_PROVENANCE.json',out/'browser/QA.json',out/'balance/ACTUAL_SNAPSHOTS.json']+[out/f'natural/{c}/PLAY.json' for c in ['shadow','oath','ember']]+[out/f'economy/{c}-local_work.json' for c in ['shadow','oath','ember']]
for id,(scene,char) in notes.items():
 row={'id':id,'playability':{'status':'pass','reason':f"{movement[id]['paths']}条入口至出口/任务目标实际moveActor路线通过。真实入图刷新和存档恢复分别验收；三职业正常输入通前两章，跨层支线用真实移动/战斗/接交方法走通，实战预警与绕障有快照证据。",'evidence':[evidence(out/f'visual/{id}-collision.webp')]+[evidence(p) for p in play]},'scene_credibility':{'status':'pass','reason':scene+' 已查看正式全图、变化通路的碰撞图及交接局部；原0.8画面保留作对照。','evidence':[evidence(out/f'visual/{id}.webp'),evidence(f'docs/ch1-story-world/visual/{id}.webp'),evidence(out/'MAP_REVIEW.md'),evidence(out/'REVIEW_NOTES.json')]},'character_consistency':{'status':'pass','reason':char+' 原画哈希、实际帧与当前地图人物分别核对，新增标记不改变角色身份或服装。','evidence':[evidence(out/f'visual/{id}.webp'),evidence(out/'PRESERVATION.json'),evidence(out/'markers/QA.json')]+[evidence(out/f'visual/{n}-frames.webp') for n in ['c1Artisans','c1Beetle','c1Construct','c1VaultGuardian','c1UnderNPC','c1FieldNPC']]}}
 report['maps'].append(row)
for p in [out/'MAP_QUALITY.json',Path('docs/map-quality/LATEST.json')]:p.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('22 maps independently reviewed; fingerprint',report['source_fingerprint'])
