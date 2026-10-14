"""Fresh full integration and independently rebuilt playable package."""
import concurrent.futures,json,os,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/c1-story-flow/final-checks';out.mkdir(exist_ok=True)
base='docs/c1-story-flow/integration-final'
env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','ASHEN_QA_OUTPUT':base+'/presentation','ASHEN_LAB_QA_OUTPUT':base+'/lab','ASHEN_WORLD_OUTPUT':base+'/world','ASHEN_CAPTURE_OUTPUT':base+'/chapters','ASHEN_C1_OUTPUT':base+'/expansion','ASHEN_C1_BALANCE':base+'/balance','ASHEN_C1_ECONOMY':base+'/economy','ASHEN_C1_EVIDENCE':base+'/navigation'}
commands={'integration':[['python3','tools/harness/check.py','--tier','integration']],
 'package':[['.venv/bin/python','tools/build_web_play.py','--output','qa-export/c1-story-flow-preview'],['.venv/bin/python','tests/browser-web-play.py','--build','qa-export/c1-story-flow-preview','--out','docs/c1-story-flow/package']]}
def run(name):
 results=[]
 with (out/(name+'.txt')).open('w') as log:
  for cmd in commands[name]:
   print('RUN',name,cmd,flush=True);r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=1500);results.append({'command':cmd,'exit_code':r.returncode})
   if r.returncode:break
 return {'name':name,'steps':results,'passed':len(results)==len(commands[name]) and all(r['exit_code']==0 for r in results)}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(run,commands))
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results),flush=True)
raise SystemExit(not all(r['passed'] for r in results))
