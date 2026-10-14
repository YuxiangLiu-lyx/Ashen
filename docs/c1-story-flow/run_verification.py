"""Run independent integration and three-career UI checks; retain both exit codes."""
import concurrent.futures, json, os, subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2]
out=root/'docs/c1-story-flow/verification';out.mkdir(exist_ok=True)
base='docs/c1-story-flow/integration-003'
env={**os.environ,'ASHEN_QA_OUTPUT':base+'/presentation','ASHEN_LAB_QA_OUTPUT':base+'/lab','ASHEN_WORLD_OUTPUT':base+'/world','ASHEN_CAPTURE_OUTPUT':base+'/chapters','ASHEN_C1_OUTPUT':base+'/expansion','ASHEN_C1_BALANCE':base+'/balance','ASHEN_C1_ECONOMY':base+'/economy','ASHEN_C1_EVIDENCE':base+'/navigation','ASHEN_STOP_CHAPTER_ONE':'1','ASHEN_NATURAL_OUTPUT':'docs/c1-story-flow/natural-001'}
commands={'integration':['python3','tools/harness/check.py','--tier','integration'],'normal-input':['node','tests/browser-chapter-one-natural-batch.mjs']}
def run(name):
 print('START',name,commands[name],flush=True)
 with (out/(name+'.txt')).open('w') as log:
  r=subprocess.run(commands[name],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=1800)
 result={'name':name,'command':commands[name],'exit_code':r.returncode,'log':str((out/(name+'.txt')).relative_to(root))}
 print(json.dumps(result),flush=True);return result
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(run,commands))
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n')
raise SystemExit(any(r['exit_code'] for r in results))
