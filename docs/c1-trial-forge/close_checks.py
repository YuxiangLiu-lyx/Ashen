"""Retain full successful integration; rerun affected UI checks and rebuild after a receipt-only fix."""
import json,sys,os,subprocess,concurrent.futures
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,digest
out=Path('docs/c1-trial-forge/closure');out.mkdir(exist_ok=True)
old=json.loads(Path('docs/c1-trial-forge/INTEGRATION_INPUTS.json').read_text());now=inventory();changed=[p for p in set(old['files'])|set(now)if old['files'].get(p)!=now.get(p)]
allowed={'dist/chapter-one-expansion-ui.js','docs/harness/NARRATIVE_ARCHITECTURE.md','source/narrative/runtime-index.json','source/narrative/sources.lock.json'}
assert set(changed)<=allowed,changed
record=json.loads(Path('source/tasks/active/c1-trial-forge-20261014.json').read_text());prior=next(c for c in record['checks']if c['output'].endswith('/012-integration.txt'));assert prior['exit_code']==0 and not prior['sources_changed_during_check'];assert prior['source_fingerprint']==old['source_fingerprint'];assert digest(Path(prior['output']))==prior['output_sha256']
assert 'PASS tier: integration' in Path(prior['output']).read_text()
env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','ASHEN_C1_OUTPUT':'docs/c1-trial-forge/closure/expansion'}
commands={
'fast':[['python3','tools/harness/check.py','--tier','fast']],
'affected':[['node','--test','tests/chapter-one-crafting.test.mjs','tests/c1-trial-forge.test.mjs','tests/dialogue-hud.test.mjs'],['node','tests/browser-chapter-one-expansion.mjs'],['node','docs/c1-trial-forge/facility-ui.mjs'],['node','docs/c1-trial-forge/verify_normal_reuse.mjs']],
'package':[['.venv/bin/python','tools/build_web_play.py','--output','qa-export/c1-trial-forge-final'],['.venv/bin/python','tests/browser-web-play.py','--build','qa-export/c1-trial-forge-final','--out','docs/c1-trial-forge/package-final']]}
def run(name):
 rows=[]
 with (out/(name+'.txt')).open('w')as f:
  for cmd in commands[name]:
   print(name,cmd,flush=True)
   try:code=subprocess.run(cmd,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=480).returncode
   except subprocess.TimeoutExpired:code=124
   rows.append({'command':cmd,'exit_code':code})
   if code:break
 return {'name':name,'steps':rows,'passed':len(rows)==len(commands[name])and not any(r['exit_code']for r in rows)}
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:results=list(pool.map(run,commands))
report={'source_fingerprint':fingerprint(inventory()),'original_full_integration':prior,'changed_since_full_integration':sorted(changed),'reason':'Only completion feedback when the last rune is consumed and current architecture description changed. Combat, quests, maps, saves, narrative and all test drivers are byte-identical to full successful integration. Rechecked actual crafting UI on three viewports and legacy gift; rebuilt package.','groups':results,'evidence':{str(p):digest(p)for p in out.glob('*.txt')},'passed':all(r['passed']for r in results)}
(out/'RESULTS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(results),flush=True);assert report['passed']
