"""Attach every exact scene through the normal task CLI; do not edit task JSON."""
import json,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2];folder='docs/c1-story-flow/narrative-current'
rows=json.loads((root/folder/'INDEX.json').read_text());assert len(rows)==78
with (root/'docs/c1-story-flow/NARRATIVE_ATTACHMENTS.txt').open('w') as log:
 for i,r in enumerate(rows,1):
  assert r['status']=='passed' and r['ready']
  cmd=['python3','tools/harness/task.py','narrative','--id','c1-story-flow-20261014']
  for kind in ['context','draft','review']:cmd+=['--'+kind,folder+'/'+r['slug']+'-'+kind+'.json']
  log.write('\nSCENE '+r['scene']+'\n');log.flush();subprocess.run(cmd,cwd=root,stdout=log,stderr=subprocess.STDOUT,check=True,timeout=120)
  print(str(i)+'/78 '+r['scene'],flush=True)
sys.path.insert(0,str(root/'tools/harness'))
from narrative import task_errors
record=json.loads((root/'source/tasks/active/c1-story-flow-20261014.json').read_text());errors=task_errors(record)
assert not errors,errors
print('All 78 current context/draft/review receipts attached; coverage and knowledge gate passed.')
