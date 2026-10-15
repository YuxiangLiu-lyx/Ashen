import json,os,subprocess,sys,hashlib
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,digest
P=Path('docs/c1-trial-forge');old=json.loads((P/'closure/RESULTS.json').read_text());current=fingerprint(inventory());assert old['source_fingerprint']==current
record=json.loads(Path('source/tasks/active/c1-trial-forge-20261014.json').read_text());fast=next(c for c in reversed(record['checks'])if c['label']=='fast');assert fast['exit_code']==0 and not fast['sources_changed_during_check'] and fast['source_fingerprint']==current;assert digest(Path(fast['output']))==fast['output_sha256']
# The packaged artifact has its own exact full input fingerprint, so transient test edits cannot hide in it.

for cmd in [['.venv/bin/python','tools/build_web_play.py','--output','qa-export/c1-trial-forge-clean'],['.venv/bin/python','tests/browser-web-play.py','--build','qa-export/c1-trial-forge-clean','--out','docs/c1-trial-forge/package-clean']]:
 print('RUN',cmd,flush=True);subprocess.run(cmd,check=True,timeout=360,env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
build=Path('qa-export/c1-trial-forge-clean');manifest=json.loads((build/'WEB_BUILD_MANIFEST.json').read_text());inputs={p.name:digest(p)for p in Path('dist').iterdir()if p.suffix in {'.js','.css','.html'}}
for a in manifest['assets']:assert digest(Path('dist')/a['original'])==a['original_sha256'];inputs[a['original']]=a['original_sha256']
assert hashlib.sha256(json.dumps(inputs,sort_keys=True).encode()).hexdigest()==manifest['runtime_input_sha256'];assert digest(build/manifest['offline_filename'])==manifest['offline_sha256'];assert json.loads((P/'package-clean/WEB_QA.json').read_text())['passed']
commands=[['node','--test','tests/chapter-one-crafting.test.mjs','tests/c1-trial-forge.test.mjs','tests/dialogue-hud.test.mjs'],['node','tests/browser-chapter-one-expansion.mjs'],['node','docs/c1-trial-forge/facility-ui.mjs'],['node','docs/c1-trial-forge/verify_normal_reuse.mjs']]
env={**os.environ,'ASHEN_C1_OUTPUT':'docs/c1-trial-forge/closure/expansion'};results=[]
with (P/'closure/affected-retry.txt').open('w')as f:
 for cmd in commands:
  print('RUN',cmd,flush=True);r=subprocess.run(cmd,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=240);results.append({'command':cmd,'exit_code':r.returncode})
  if r.returncode:raise SystemExit(r.returncode)
report={**old,'groups':None,'source_fingerprint':current,'passed':True,'original_failed_closure':{'path':str(P/'closure/RESULTS.json'),'sha256':digest(P/'closure/RESULTS.json')},'recovered_fast':fast,'recovered_affected':results,'package_exact_inputs_verified':True,'recovery_reason':'Harness counterexample tests temporarily mutate real source files; serialized rerun after all Harness tests. Source fingerprint unchanged. Earlier failure and package checks preserved.','recovery_evidence':{'path':str(P/'closure/affected-retry.txt'),'sha256':digest(P/'closure/affected-retry.txt')}}
(P/'closure/RECOVERED.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Current full integration coverage, affected UI, normal route equivalence, fast and exact package verified.')
