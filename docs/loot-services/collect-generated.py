"""Preserve generated outputs here and restore original historical bytes only."""
import hashlib,json,subprocess,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/loot-services/integration-history';out.mkdir(exist_ok=True)
rows=[]
for rel in subprocess.check_output(['git','diff','--name-only'],cwd=root,text=True).splitlines():
 if not rel.startswith('docs/ch1-layer-rules/'):continue
 source=root/rel;data=source.read_bytes();target=out/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 old=subprocess.check_output(['git','show','1559519:'+rel],cwd=root);source.write_bytes(old)
 rows.append({'original_path':rel,'retained_path':str(target.relative_to(root)),'current_sha256':hashlib.sha256(data).hexdigest(),'historical_sha256':hashlib.sha256(old).hexdigest(),'bytes':len(data)})
for source in (root/'docs/ch1-layer-rules/economy/failures').glob('*.json'):
 rel=source.relative_to(root);target=out/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
 # These failed synthetic route files were created only by this task.
 rows.append({'original_path':str(rel),'retained_path':str(target.relative_to(root)),'current_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'bytes':source.stat().st_size,'untracked_task_output':True});source.unlink()
(root/'docs/loot-services/INTEGRATION_OUTPUTS.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n');print('Preserved',len(rows),'generated historical outputs')
