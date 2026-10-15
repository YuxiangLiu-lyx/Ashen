import subprocess,json,concurrent.futures,os
from pathlib import Path
P=Path('docs/c1-dialogue-voice');(P/'checks').mkdir(exist_ok=True)
def run(item):
 name,cmd,env,timeout=item
 with (P/'checks'/(name+'.txt')).open('w')as f:
  try:code=subprocess.run(cmd,env={**os.environ,**env},stdout=f,stderr=subprocess.STDOUT,timeout=timeout).returncode
  except subprocess.TimeoutExpired:code=124
 row={'name':name,'command':cmd,'exit_code':code};print(json.dumps(row),flush=True);return row
rows=[]
for item in [('fast',['python3','tools/harness/check.py','--tier','fast'],{},300),('dialogue',['node','--test','tests/chapter-one-incremental.test.mjs','tests/c1-trial-forge.test.mjs','tests/c1-restraint.test.mjs','tests/dialogue-reader.test.mjs','tests/dialogue-hud.test.mjs','tests/c1-story-flow.test.mjs'],{},180)]:
 rows.append(run(item))
 if rows[-1]['exit_code']:break
if all(r['exit_code']==0 for r in rows):
 jobs=[('reader',['node','tests/browser-dialogue-reader.mjs'],{'ASHEN_READER_OUTPUT':'docs/c1-dialogue-voice/reader'},600),('package',['python3','docs/c1-dialogue-voice/build_package.py'],{},900)]
 with concurrent.futures.ThreadPoolExecutor(max_workers=2)as ex:rows.extend(ex.map(run,jobs))
(P/'CHECKS.json').write_text(json.dumps(rows,indent=2)+'\n')
raise SystemExit(len(rows)!=4 or any(r['exit_code']for r in rows))
