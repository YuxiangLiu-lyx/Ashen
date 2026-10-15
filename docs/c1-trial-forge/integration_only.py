import os,subprocess,json
from pathlib import Path
base='docs/c1-trial-forge/integration'
env={**os.environ,'ASHEN_QA_OUTPUT':base+'/presentation','ASHEN_LAB_QA_OUTPUT':base+'/lab','ASHEN_WORLD_OUTPUT':base+'/world','ASHEN_CAPTURE_OUTPUT':base+'/chapters','ASHEN_C1_OUTPUT':base+'/expansion','ASHEN_C1_BALANCE':base+'/balance','ASHEN_C1_ECONOMY':base+'/economy','ASHEN_C1_EVIDENCE':base+'/navigation','ASHEN_READER_OUTPUT':base+'/reader','ASHEN_HUD_OUTPUT':base+'/hud'}
try:code=subprocess.run(['python3','tools/harness/check.py','--tier','integration'],env=env,timeout=1500).returncode
finally:
 for name in ['MOVEMENT.json','NAVIGATION.json']:
  p=Path('docs/ch1-layer-rules')/name;original=subprocess.check_output(['git','show','9df5b53:'+str(p)])
  if p.read_bytes()!=original:Path(base+'/navigation/'+name).write_bytes(p.read_bytes());p.write_bytes(original)
Path('docs/c1-trial-forge/INTEGRATION.json').write_text(json.dumps({'exit_code':code,'command':'python3 tools/harness/check.py --tier integration','logs':'docs/harness/evidence/c1-trial-forge-20261014'},indent=2)+'\n');raise SystemExit(code)
