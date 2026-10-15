"""Rerun only failed capture fixtures; all runtime sources remain frozen."""
import json,subprocess,os
from pathlib import Path
P=Path('docs/c1-restraint');out=P/'recovered-checks';out.mkdir(exist_ok=True)
cmds={'c3-bosses':['env','ASHEN_C3_SAVES=docs/c1-restraint/C3_SOURCES.json','node','docs/rpg-experience/c3/BOSSES_FINAL.mjs','docs/c1-restraint/c3-bosses'], 'combat-visual':['node','docs/c1-restraint/combat-visual.mjs']}
rows=[]
for name,cmd in cmds.items():
 with (out/(name+'.txt')).open('w')as f:
  try:code=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,timeout=300).returncode
  except subprocess.TimeoutExpired:code=124
 rows.append({'name':name,'command':cmd,'exit_code':code});print(name,code,flush=True)
(out/'RESULTS.json').write_text(json.dumps(rows,indent=2)+'\n');raise SystemExit(any(r['exit_code']for r in rows))
