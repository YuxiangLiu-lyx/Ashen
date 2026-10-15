import concurrent.futures,json,os,subprocess
from pathlib import Path
out=Path('docs/c1-trial-forge/natural-final');out.mkdir(exist_ok=True)
def run(cls):
 env={**os.environ,'ASHEN_STOP_CHAPTER_ONE':'1','ASHEN_CLASS':cls,'ASHEN_PLAY_OUTPUT':str(out/cls)}
 with (out/(cls+'.txt')).open('w')as f:
  try:code=subprocess.run(['node','tests/browser-chapter-one-natural.mjs'],env=env,stdout=f,stderr=subprocess.STDOUT,timeout=1200).returncode
  except subprocess.TimeoutExpired:code=124
 print(cls,code,flush=True);return {'class':cls,'exit_code':code}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(run,['shadow','oath','ember']))
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n');raise SystemExit(any(r['exit_code']for r in results))
