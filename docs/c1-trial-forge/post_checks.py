import concurrent.futures,json,subprocess
from pathlib import Path
out=Path('docs/c1-trial-forge/post-checks');out.mkdir(exist_ok=True)
commands={'normal-reuse':['node','docs/c1-trial-forge/verify_normal_reuse.mjs'],'combat':['node','docs/c1-trial-forge/compare_combat.mjs'],'facilities':['node','docs/c1-trial-forge/facility-ui.mjs'],'visual':['node','docs/c1-trial-forge/capture.mjs']}
def run(name):
 with (out/(name+'.txt')).open('w')as log:
  try:code=subprocess.run(commands[name],stdout=log,stderr=subprocess.STDOUT,timeout=240).returncode
  except subprocess.TimeoutExpired:code=124
 print(name,code,flush=True);return {'name':name,'command':commands[name],'exit_code':code}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(run,commands))
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n');raise SystemExit(any(r['exit_code']for r in results))
