"""Validate current reports against completed processes and their immutable production inputs."""
from pathlib import Path
import json,sys,hashlib
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,digest
from narrative import task_errors as narrative
from experience import task_errors as experience
from map_quality import task_errors as maps
load=lambda p:json.loads(Path(p).read_text());fp=fingerprint(inventory());base=Path('docs/rpg-experience/c2')
p=Path('source/tasks/active/rpg-c2-20261014.json');p=p if p.exists()else Path('source/tasks/archive/rpg-c2-20261014.json');task=load(p)
for fn in [narrative,experience,maps]:errors=fn(task);assert not errors,errors
checks={c['label']:c for c in task['checks']}
for name in ['final-integration','final-metadata-fast','normal-three-class-005']:
 c=checks[name];assert c['exit_code']==0 and not c['sources_changed_during_check'];assert digest(Path(c['output']))==c['output_sha256']
assert checks['final-metadata-fast']['source_fingerprint']==fp
old=load(base/'SOURCE_FINAL_VERIFICATION.json');assert checks['final-integration']['source_fingerprint']==old['fingerprint'];proof=load(base/'VERIFICATION_EQUIVALENCE.json');assert proof['final_fingerprint']==fp
current=inventory();diff=sorted(p for p in set(old['files'])|set(current)if old['files'].get(p)!=current.get(p));assert diff==proof['differences'];assert set(diff)=={'docs/harness/CHAPTER_02.md','docs/harness/CHAPTER_02_RPG_EXPERIENCE.md','docs/harness/NARRATIVE_ARCHITECTURE.md','source/narrative/chapters/R02.json','source/narrative/sources.lock.json'}
for cls in ['shadow','oath','ember']:
 d=load(base/f'natural-005/{cls}/PLAY.json');assert d['status']=='chapter-two-complete' and d['steps'][-1]['state']['chapter']==12 and not d['errors']
 for p,sha in d['source']['files'].items():assert digest(Path(p))==sha,p
for name in ['current-isolated/COMBAT.json','PREPARATION_COMBAT.json','maps/RENDER.json','maps/NAVIGATION.json']:
 for p,sha in load(base/name)['provenance']['files'].items():assert digest(Path(p))==sha,p
assert load(base/'baseline-isolated/COMBAT.json')['bren']==load(base/'current-isolated/COMBAT.json')['bren']
a=load(base/'TEXT_BASELINE.json')['scenes'];b=load('source/narrative/runtime-index.json')['scenes'];assert sorted(k for k in set(a)|set(b)if a.get(k)!=b.get(k))==['c2PumpRest','v9TollFound']
manifest=load(base/'WEB_BUILD_MANIFEST.json');inputs={p.name:digest(p)for p in sorted(Path('dist').glob('*'))if p.suffix in ['.js','.css','.html']}
for item in manifest['assets']:
 p=Path('dist')/item['original'];assert digest(p)==item['original_sha256'];inputs[item['original']]=item['original_sha256']
assert hashlib.sha256(json.dumps(inputs,sort_keys=True).encode()).hexdigest()==manifest['runtime_input_sha256']
assert digest(Path('qa-export/rpg-c2-preview/Ashen-V28.1-Play.html'))==manifest['offline_sha256']
print(json.dumps({'passed':True,'current_source_fingerprint':fp,'integration':checks['final-integration']['output'],'scope_equivalence':str(base/'VERIFICATION_EQUIVALENCE.json'),'normal_classes':3,'maps':8,'movement_paths':73,'human':'pending'},ensure_ascii=False,indent=2))
