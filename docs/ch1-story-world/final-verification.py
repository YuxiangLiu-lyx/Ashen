"""Record independent final checks; preserve earlier failed runs and all exit codes."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json,os,subprocess,time
out=Path('docs/ch1-story-world/final-verification');out.mkdir(parents=True,exist_ok=True)
py='qa-export/qa-venv/bin/python'
jobs=[('integration', [['python3','tools/harness/check.py','--tier','integration'],['node','docs/ch1-story-world/audit-saves.mjs'],['python3','tools/restore_archives.py','--all','--verify-only']]),
 ('package',[[py,'tools/build_web_play.py','--output','qa-export/c1-story-world-preview'],[py,'tests/browser-web-play.py','--build','qa-export/c1-story-world-preview','--out','docs/ch1-story-world/package']]),
 ('local',[[py,'docs/ch1-story-world/verify-local.py']])]
def run(job):
 name,commands=job;start=time.time();rows=[]
 with (out/(name+'.log')).open('w') as f:
  for cmd in commands:
   f.write('RUN '+repr(cmd)+'\n');f.flush()
   code=subprocess.run(cmd,env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'},stdout=f,stderr=subprocess.STDOUT).returncode
   rows.append({'command':cmd,'exit_code':code})
   if code:break
 row={'name':name,'commands':rows,'exit_code':code,'seconds':time.time()-start,'log':str(out/(name+'.log'))}
 (out/(name+'.json')).write_text(json.dumps(row,indent=2)+'\n');print(json.dumps(row),flush=True);return row
with ThreadPoolExecutor(max_workers=3) as ex:results=list(ex.map(run,jobs))
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n')
raise SystemExit(any(r['exit_code'] for r in results))
