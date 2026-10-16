import json,os,subprocess
from pathlib import Path
rows=[]
commands=[('corpus-provenance',['python3','docs/c2-optimization/check_baseline.py'],120),('producer',['node','docs/c2-optimization/verify_current.mjs'],120),('dialogue-browser',['node','docs/c2-optimization/dialogue_ui.mjs'],240),('map-browser',['node','docs/c2-optimization/map_driver.mjs'],300),('combat',['node','docs/c2-optimization/combat_driver.mjs'],300)]
for label,cmd,timeout in commands:
 p=Path('docs/c2-optimization/checks');p.mkdir(exist_ok=True)
 with (p/(label+'.txt')).open('w')as f:
  try:code=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,timeout=timeout).returncode
  except subprocess.TimeoutExpired:code=124
 rows.append({'label':label,'command':cmd,'exit_code':code});print(label,code,flush=True)
 Path('docs/c2-optimization/CHECKS.json').write_text(json.dumps(rows,indent=2)+'\n')
 if code:raise SystemExit(code)
