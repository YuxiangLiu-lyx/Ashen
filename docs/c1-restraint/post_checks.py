import concurrent.futures,json,subprocess,os
from pathlib import Path
out=Path('docs/c1-restraint/post-checks');out.mkdir(exist_ok=True)
commands={
 'natural':['python3','docs/c1-restraint/normal_inputs.py'],
 'combat':['env','ASHEN_RESTRAINT_COMBAT=docs/c1-restraint/COMBAT.json','node','docs/c1-restraint/compare_combat.mjs'],
 'c2':['node','docs/rpg-experience/c2/BASELINE_DRIVER.mjs','docs/c1-restraint/c2'],
 'c3-groups':['node','docs/rpg-experience/c3/ISOLATED_COMBAT.mjs','docs/c1-restraint/c3-groups'],
 'c3-bosses':['node','docs/rpg-experience/c3/BOSSES_FINAL.mjs','docs/c1-restraint/c3-bosses'],
 'facility':['node','docs/c1-restraint/facility-ui.mjs'],
 'visual':['env','ASHEN_RESTRAINT_VISUAL=docs/c1-restraint/visual','node','docs/c1-restraint/capture.mjs'],
 'combat-visual':['node','docs/c1-restraint/combat-visual.mjs'],
 'package':['python3','docs/c1-restraint/build_package.py'],
 'targeted':['node','--test','tests/c1-restraint.test.mjs','tests/c1-trial-forge.test.mjs','tests/chapter-one-elites.test.mjs','tests/rpg-experience.test.mjs','tests/rpg-chapter-two.test.mjs','tests/rpg-chapter-three.test.mjs']}
def run(name):
 with (out/(name+'.txt')).open('w')as log:
  try:code=subprocess.run(commands[name],stdout=log,stderr=subprocess.STDOUT,timeout=1250 if name=='natural' else 700 if name=='package' else 300).returncode
  except subprocess.TimeoutExpired:code=124
 print(name,code,flush=True);return {'name':name,'command':commands[name],'exit_code':code}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(run,commands))
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n');raise SystemExit(any(r['exit_code']for r in results))
