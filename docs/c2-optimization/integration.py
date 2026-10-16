import os,subprocess,json
from pathlib import Path
base='docs/c2-optimization/integration';Path(base).mkdir(parents=True,exist_ok=True)
env={**os.environ,'ASHEN_QA_OUTPUT':base+'/presentation','ASHEN_LAB_QA_OUTPUT':base+'/lab','ASHEN_WORLD_OUTPUT':base+'/world','ASHEN_CAPTURE_OUTPUT':base+'/chapters','ASHEN_C1_OUTPUT':base+'/expansion','ASHEN_C1_BALANCE':base+'/balance','ASHEN_C1_ECONOMY':base+'/economy','ASHEN_C1_EVIDENCE':base+'/navigation','ASHEN_READER_OUTPUT':base+'/reader','ASHEN_HUD_OUTPUT':base+'/hud'}
prior={Path('docs/ch1-layer-rules')/n:(Path('docs/ch1-layer-rules')/n).read_bytes()for n in ['MOVEMENT.json','NAVIGATION.json']};code=124
try:code=subprocess.run(['python3','tools/harness/check.py','--tier','integration'],env=env,timeout=1500).returncode
finally:
 for p,data in prior.items():
  if p.read_bytes()!=data:
   q=Path(base)/'navigation'/p.name;q.parent.mkdir(exist_ok=True,parents=True);q.write_bytes(p.read_bytes());p.write_bytes(data)
 Path('docs/c2-optimization/INTEGRATION.json').write_text(json.dumps({'exit_code':code,'command':'python3 tools/harness/check.py --tier integration','historical_navigation_restored':True},indent=2)+'\n')
raise SystemExit(code)
