"""Run isolated check processes, retaining every exit code and child log."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import os,subprocess,json,time
out=Path('docs/ch1-story-world/verification');out.mkdir(parents=True,exist_ok=True)
jobs=[('integration',['python3','tools/harness/check.py','--tier','integration'],{}),('render',['node','tests/browser-chapter-one-map-quests.mjs'],{}),('handoffs-touch',['node','tests/browser-chapter-one-expansion.mjs'],{})]+[(name,['node','tests/browser-chapter-one-natural.mjs'],{'ASHEN_CLASS':name}) for name in ['shadow','oath','ember']]
def run(job):
 name,cmd,extra=job;start=time.time()
 with (out/(name+'.log')).open('w') as f:r=subprocess.run(cmd,env={**os.environ,**extra},stdout=f,stderr=subprocess.STDOUT)
 row={'name':name,'command':cmd,'exit_code':r.returncode,'seconds':time.time()-start,'log':str(out/(name+'.log'))};(out/(name+'.json')).write_text(json.dumps(row,indent=2)+'\n');print(json.dumps(row),flush=True);return row
with ThreadPoolExecutor(max_workers=4) as ex:results=list(ex.map(run,jobs))
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n')
raise SystemExit(1 if any(r['exit_code'] for r in results) else 0)
