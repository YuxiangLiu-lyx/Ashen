"""Bounded current-source integration, extra story checks and a rebuilt package."""
import concurrent.futures,json,os,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2];out=root/'docs/dialogue-hud/final-checks';out.mkdir(exist_ok=True)
base='docs/dialogue-hud/integration'
env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','ASHEN_QA_OUTPUT':base+'/presentation','ASHEN_LAB_QA_OUTPUT':base+'/lab','ASHEN_WORLD_OUTPUT':base+'/world','ASHEN_CAPTURE_OUTPUT':base+'/chapters','ASHEN_C1_OUTPUT':base+'/expansion','ASHEN_C1_BALANCE':base+'/balance','ASHEN_C1_ECONOMY':base+'/economy','ASHEN_C1_EVIDENCE':base+'/navigation','ASHEN_READER_OUTPUT':'docs/dialogue-hud/reader-final','ASHEN_HUD_OUTPUT':'docs/dialogue-hud/browser-final','ASHEN_FLOW_OUTPUT':'docs/dialogue-hud/flow-browser','ASHEN_PORTRAIT_OUTPUT':'docs/dialogue-hud/portrait-regression'}
commands={
 'integration':[['python3','tools/harness/check.py','--tier','integration']],
 'focused':[['node','--test','tests/ch12-bugs.test.mjs'],['node','docs/dialogue-hud/map-integrity.mjs'],['node','docs/c1-care-ui/capture.mjs','docs/dialogue-hud/maps-final'],['node','docs/dialogue-hud/capture-ui.mjs','docs/dialogue-hud/marks-final'],['node','docs/dialogue-hud/capture-copyedits.mjs'],['node','tests/browser-c1-story-flow.mjs'],['node','tests/browser-ch12-portraits.mjs']],
 'package':[['.venv/bin/python','tools/build_web_play.py','--output','qa-export/dialogue-hud-preview'],['.venv/bin/python','tests/browser-web-play.py','--build','qa-export/dialogue-hud-preview','--out','docs/dialogue-hud/package']]
}
movement=root/'docs/ch1-layer-rules/MOVEMENT.json';original=movement.read_bytes()
def run(name):
 results=[]
 with (out/(name+'.txt')).open('w') as log:
  for cmd in commands[name]:
   print('RUN',name,cmd,flush=True)
   try:r=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=1200);code=r.returncode
   except subprocess.TimeoutExpired:code=124
   results.append({'command':cmd,'exit_code':code})
   if code:break
 return {'name':name,'steps':results,'passed':len(results)==len(commands[name])and all(r['exit_code']==0 for r in results)}
try:
 with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(run,commands))
finally:
 if movement.read_bytes()!=original:(out/'MOVEMENT.json').write_bytes(movement.read_bytes());movement.write_bytes(original)
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results),flush=True)
raise SystemExit(not all(r['passed']for r in results))
