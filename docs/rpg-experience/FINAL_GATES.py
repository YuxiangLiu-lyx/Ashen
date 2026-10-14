"""Check immutable process receipts, final sources, normal-input chains and actual package."""
from pathlib import Path
import json,sys,hashlib
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,digest
from narrative import task_errors as narrative
from experience import task_errors as experience
from map_quality import task_errors as maps
load=lambda p:json.loads(Path(p).read_text())
def task(tid):
 p=Path('source/tasks/active')/(tid+'.json');return load(p if p.exists()else Path('source/tasks/archive')/(tid+'.json'))
fp=fingerprint(inventory());master=task('rpg-experience-20261014');checks={c['label']:c for c in master['checks']}
for name in ['integration','fast']:
 c=checks[name];assert c['exit_code']==0 and not c['sources_changed_during_check'];assert c['source_fingerprint']==fp;assert digest(Path(c['output']))==c['output_sha256']
for tid in ['rpg-experience-20261014','rpg-c3-20261014','rpg-delivery-20261014']:
 for fn in [narrative,experience,maps]:
  errors=fn(task(tid));assert not errors,(tid,errors)
base='docs/rpg-experience/c3/'
proof=load(base+'VERIFICATION_EQUIVALENCE.json');old=load(base+'SOURCE_FINAL_VERIFICATION.json');cur=inventory();diff=sorted(p for p in set(cur)|set(old['files'])if cur.get(p)!=old['files'].get(p));assert diff==proof['differences'] and fp==proof['final_fingerprint']
def current_production(d):
 source=d.get('provenance',d.get('source'));assert source and source['files']
 for p,sha in source['files'].items():assert digest(Path(p))==sha,p
for name in ['current-entry-final/COMBAT.json','bosses-final/COMBAT.json','forge-current-final/COMBAT.json','maps-delivery/NAVIGATION.json','maps-delivery/RENDER.json','services-delivery/QA.json']:
 current_production(load(base+name))
for cls,pre in [('shadow','natural-015'),('oath','natural-013'),('ember','natural-014')]:
 raw=load(base+'natural-016/'+cls+'/PLAY.json');assert raw['status']=='chapter-three-complete' and raw['steps'][-1]['state']['chapter']==21 and not raw['errors'];current_production(raw)
 for d in [raw,load(base+pre+'/'+cls+'/PROGRESS.json')]+([load(base+'natural-013/shadow/PROGRESS.json')] if cls=='shadow'else []):
  current_production(d);ref=d['source']['importedSave'];assert digest(Path(ref['path']))==ref['sha256'];saved=load(ref['path']);assert not saved['flags'].get('storyTestV25');assert all(not s['state']['flags'].get('storyTestV25') for s in d['steps'])
 for p in load(base+'SAVE_SOURCES.json')[cls].values():assert Path(p).is_file()
normal=load(base+'NORMAL_INPUT_CHAIN.json');assert normal['status']=='passed' and not normal['state_mutation_hooks']
assert len(load(base+'current-entry-final/COMBAT.json')['groups'])==270
for r in load(base+'current-entry-final/COMBAT.json')['groups']:assert r['outcome']in ['win','loss']
bosses=load(base+'bosses-final/COMBAT.json')['bosses'];assert len(bosses)==81 and all(r['outcome']in ['win','loss']for r in bosses)
for f in ['forge-current-final','forge-before-final']:assert len(load(base+f+'/COMBAT.json')['forge'])==54
nav=load(base+'maps-delivery/NAVIGATION.json');assert len(nav['rows'])==14 and len(nav['movement'])==182
svc=load(base+'services-delivery/QA.json');assert svc['status']=='passed' and not svc['errors'] and len(svc['viewports'])==3
assert load(base+'TEXT_COMPARISON.json')=={'baseline_scenes':532,'unchanged':532,'added':['c3BrewMedicine','c3HerbMedicine']}
manifest=load('docs/rpg-experience/DEFAULT_BUILD.json')['manifest'];inputs={p.name:digest(p)for p in sorted(Path('dist').glob('*'))if p.suffix in ['.js','.css','.html']}
for item in manifest['assets']:
 p=Path('dist')/item['original'];assert digest(p)==item['original_sha256'];inputs[item['original']]=item['original_sha256']
assert hashlib.sha256(json.dumps(inputs,sort_keys=True).encode()).hexdigest()==manifest['runtime_input_sha256']
assert digest(Path('qa-export/release-build/Ashen-V28.1-Play.html'))==manifest['offline_sha256'];assert load('docs/rpg-experience/default-package/WEB_QA.json')['passed']
assert Path('qa-export/release-build-before-rpg-three-20261014/Ashen-V28.1-Play.html').is_file()
r={'passed':True,'source_fingerprint':fp,'integration':checks['integration']['output'],'fast':checks['fast']['output'],'chapters':['R01','R02','R03'],'c3_normal_input':'3 classes, original-save segments; death/retry preserved','c3_maps':14,'c3_movement_paths':182,'c3_group_pairs':540,'c3_bosses':81,'c3_forge_pairs':108,'human':'pending','chapters4to8':'deferred_by_user','site_published':False}
Path('docs/rpg-experience/FINAL_VERIFICATION.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps(r,ensure_ascii=False,indent=2))
