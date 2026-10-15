import concurrent.futures,json,os,subprocess
from pathlib import Path
out=Path('docs/c1-trial-forge/final-checks-02');out.mkdir(exist_ok=True)
base='docs/c1-trial-forge/integration'
env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','ASHEN_QA_OUTPUT':base+'/presentation','ASHEN_LAB_QA_OUTPUT':base+'/lab','ASHEN_WORLD_OUTPUT':base+'/world','ASHEN_CAPTURE_OUTPUT':base+'/chapters','ASHEN_C1_OUTPUT':base+'/expansion','ASHEN_C1_BALANCE':base+'/balance','ASHEN_C1_ECONOMY':base+'/economy','ASHEN_C1_EVIDENCE':base+'/navigation','ASHEN_READER_OUTPUT':base+'/reader','ASHEN_HUD_OUTPUT':base+'/hud','ASHEN_FLOW_OUTPUT':base+'/flow','ASHEN_PORTRAIT_OUTPUT':base+'/portraits'}
commands={
'integration':[['python3','tools/harness/check.py','--tier','integration']],
'focused':[['node','--test','tests/c1-trial-forge.test.mjs'],['node','tests/browser-c1-story-flow.mjs'],['node','docs/c1-trial-forge/capture.mjs']],
'package':[['.venv/bin/python','tests/browser-web-play.py','--build','qa-export/c1-trial-forge-preview','--out','docs/c1-trial-forge/package']]}
original={p:p.read_bytes()for p in [Path('docs/ch1-layer-rules/MOVEMENT.json'),Path('docs/ch1-layer-rules/NAVIGATION.json')]}
def run(name):
 results=[]
 with (out/(name+'.txt')).open('w')as log:
  for cmd in commands[name]:
   print('RUN',name,cmd,flush=True)
   try:code=subprocess.run(cmd,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=1500).returncode
   except subprocess.TimeoutExpired:code=124
   results.append({'command':cmd,'exit_code':code})
   if code:break
 return {'name':name,'steps':results,'passed':len(results)==len(commands[name])and not any(r['exit_code']for r in results)}
try:
 with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(run,commands))
finally:
 for p,b in original.items():
  if p.read_bytes()!=b:(out/p.name).write_bytes(p.read_bytes());p.write_bytes(b)
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results),flush=True);raise SystemExit(not all(r['passed']for r in results))
