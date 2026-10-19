"""Retain this run's generated integration evidence without rewriting historical receipts."""
import hashlib,json,subprocess,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/ui-save-polish/integration';out.mkdir(exist_ok=True)
rows=[]
paths=subprocess.check_output(['git','diff','--name-only'],cwd=root,text=True).splitlines()
for rel in paths:
 if not rel.startswith('docs/') or rel.startswith(('docs/ui-save-polish/','docs/harness/evidence/ui-save-polish-20261019/')):continue
 source=root/rel;data=source.read_bytes();target=out/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
 old=subprocess.check_output(['git','show','HEAD:'+rel],cwd=root);source.write_bytes(old)
 rows.append({'original_path':rel,'retained_path':str(target.relative_to(root)),'current_sha256':hashlib.sha256(data).hexdigest(),'historical_sha256':hashlib.sha256(old).hexdigest(),'bytes':len(data)})
(root/'docs/ui-save-polish/INTEGRATION_OUTPUTS.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'retained':len(rows),'bytes':sum(r['bytes'] for r in rows)}))
