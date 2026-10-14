import subprocess,os,concurrent.futures
from pathlib import Path
out=Path(os.environ.get('ASHEN_C2_NATURAL','docs/rpg-experience/c2/natural'))
def run(cls):
 folder=out/cls;folder.mkdir(parents=True,exist_ok=True)
 env=dict(os.environ,ASHEN_CLASS=cls,ASHEN_PLAY_OUTPUT=str(folder))
 with (folder/'DRIVER.log').open('w') as log:
  result=subprocess.run(['node','tests/browser-rpg-chapter-two.mjs'],env=env,stdout=log,stderr=subprocess.STDOUT)
 print(cls,result.returncode,flush=True);return result.returncode
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 results=list(pool.map(run,['shadow','oath','ember']))
raise SystemExit(1 if any(results) else 0)
