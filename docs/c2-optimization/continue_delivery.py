"""Wait for the current recorded integration, then run dependent local checks."""
import json,time,subprocess
from pathlib import Path
p=Path('source/tasks/active/c2-optimization-20261016.json');deadline=time.time()+1200
while True:
 r=json.loads(p.read_text())
 if not r.get('running_check'):break
 if time.time()>deadline:raise SystemExit('Integration wait expired; no success assumed')
 time.sleep(5)
c=[x for x in r['checks']if x['label']=='integration'][-1]
assert c['exit_code']==0 and not c['sources_changed_during_check'],c
for cmd in [
 ['python3','docs/c2-optimization/final_checks.py','c2-optimization-20261016'],
]:
 code=subprocess.run(cmd,timeout=1500).returncode
 if code:raise SystemExit(code)
