import concurrent.futures,subprocess,json
from pathlib import Path
jobs={'c3-entry':['node','docs/rpg-experience/c3/ENTRY_COMBAT.mjs','docs/c1-restraint/c3-entry'],'c2-prepared':['node','docs/c1-restraint/prepared-combat.mjs']}
def run(item):
 name,cmd=item
 p=subprocess.run(cmd,capture_output=True,text=True,timeout=300)
 Path(f'docs/c1-restraint/post-checks/{name}.log').write_text(p.stdout+p.stderr)
 return {'name':name,'exit_code':p.returncode,'command':cmd}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as ex:rows=list(ex.map(run,jobs.items()))
Path('docs/c1-restraint/ENTRY_CHECKS.json').write_text(json.dumps(rows,indent=2)+'\n')
print(json.dumps(rows));raise SystemExit(any(r['exit_code']for r in rows))
