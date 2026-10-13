from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json,os,subprocess,time
out=Path('docs/ch1-layer-rules/verification');out.mkdir(parents=True,exist_ok=True)
jobs=[('integration',[['python3','tools/harness/check.py','--tier','integration']],{}),('visual',[['node','tests/browser-chapter-one-map-quests.mjs'],['node','tests/browser-chapter-one-layer-rules.mjs'],['node','docs/ch1-layer-rules/audit-saves.mjs']],{})]
for cls in ['shadow','oath','ember']:jobs.append(('natural-'+cls,[['node','tests/browser-chapter-one-natural.mjs']],{'ASHEN_CLASS':cls}))
def run(job):
 name,cmds,env=job;rows=[];start=time.time();code=0
 with (out/(name+'.log')).open('w') as f:
  for cmd in cmds:
   f.write('RUN '+repr(cmd)+'\n');f.flush();code=subprocess.run(cmd,env={**os.environ,**env},stdout=f,stderr=subprocess.STDOUT).returncode;rows.append({'command':cmd,'exit_code':code})
   if code:break
 row={'name':name,'commands':rows,'exit_code':code,'seconds':time.time()-start,'log':str(out/(name+'.log'))};(out/(name+'.json')).write_text(json.dumps(row,indent=2)+'\n');print(json.dumps(row),flush=True);return row
with ThreadPoolExecutor(max_workers=5) as ex:rows=list(ex.map(run,jobs))
(out/'RESULTS.json').write_text(json.dumps(rows,indent=2)+'\n')
raise SystemExit(any(r['exit_code'] for r in rows))
