"""Two independent verification lanes; every command retains its real exit/log."""
from pathlib import Path
import os,sys,json,subprocess,time,concurrent.futures,hashlib
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/loot-services/verification';OUT.mkdir(exist_ok=True)
base=os.environ.copy();base.update(ASHEN_C1_ECONOMY='docs/loot-services/economy',ASHEN_C1_OUTPUT='docs/loot-services/integration-c1',ASHEN_READER_OUTPUT='docs/loot-services/reader',ASHEN_HUD_OUTPUT='docs/loot-services/hud',ASHEN_WORLD_OUTPUT='docs/loot-services/world')
rows=[]
def run(name,command,extra=None,timeout=900):
 env={**base,**(extra or {})};start=time.time();p=OUT/(name+'.txt')
 with p.open('w')as f:
  try:code=subprocess.run(command,cwd=ROOT,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=timeout).returncode
  except subprocess.TimeoutExpired:code=124
 row={'name':name,'command':command,'extra_environment':extra or {},'exit_code':code,'seconds':round(time.time()-start,2),'output':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()};rows.append(row);print(json.dumps(row),flush=True);return code

def integrated():return run('integration',[sys.executable,'tools/harness/check.py','--tier','integration'])
def focused():
 checks=[('supplemental',['node','--test',*['tests/'+n+'.test.mjs' for n in ['loot-services','ui-save-polish','c1-character-flow','c1-endurance','c1-restraint','c1-trial-forge','c2-optimization','ch12-bugs']]],{}),('commerce-ground',['node','tests/browser-loot-services.mjs'],{}),('c1-services',['node','tests/browser-rpg-experience-services.mjs'],{'ASHEN_SERVICE_OUTPUT':'docs/loot-services/c1-services'}),('c2-services',['node','tests/browser-rpg-chapter-two-services.mjs'],{'ASHEN_SERVICE_OUTPUT':'docs/loot-services/c2-services'})]
 for name,cmd,env in checks:
  code=run(name,cmd,env)
  if code:return code
 return 0
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:
 codes=list(pool.map(lambda f:f(),[integrated,focused,lambda:run('package',[sys.executable,'docs/loot-services/build.py'])]))
(OUT/'RESULTS.json').write_text(json.dumps({'status':'passed' if not any(codes)else'failed','runs':rows},ensure_ascii=False,indent=2)+'\n')
sys.exit(1 if any(codes)else 0)
