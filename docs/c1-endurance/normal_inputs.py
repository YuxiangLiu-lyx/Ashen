import concurrent.futures,json,os,subprocess
from pathlib import Path
out=Path(os.environ.get('ASHEN_ENDURANCE_NATURAL','docs/c1-endurance/natural-initial'));out.mkdir(parents=True,exist_ok=True)
def run(cls):
 env={**os.environ,'ASHEN_STOP_CHAPTER_ONE':'1','ASHEN_CLASS':cls,'ASHEN_PLAY_OUTPUT':str(out/cls)}
 with (out/(cls+'.txt')).open('w')as f:
  try:code=subprocess.run(['node','tests/browser-chapter-one-natural.mjs'],env=env,stdout=f,stderr=subprocess.STDOUT,timeout=1500).returncode
  except subprocess.TimeoutExpired:code=124
 print(cls,code,flush=True);return {'class':cls,'exit_code':code}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(run,os.environ.get('ASHEN_ENDURANCE_CLASSES','shadow,oath,ember').split(',')))
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n');raise SystemExit(any(r['exit_code']for r in results))
