"""Resume the failed browser check without repeating already-passed identical sources.

The original 028 run remains failed. Reuse is permitted only if the sole source
change is an explicit DOM-ready wait in that failed browser script.
"""
from pathlib import Path
import json,sys,subprocess,time,re
sys.path.insert(0,str(Path.cwd()/'tools/harness'))
from common import inventory,fingerprint,digest
base=Path('docs/ch1-story-world');out=base/'final-verification';prior=base/'verification-attempt-028'
old=json.loads((base/'028-SOURCE_INVENTORY.json').read_text());current=inventory()
assert old.keys()==current.keys()
delta=[p for p in old if old[p]!=current[p]]
assert delta==['tests/browser-world-v29.mjs'],delta
p=Path(delta[0]);wait='await browser.wait(`!!document.querySelector(${JSON.stringify(selector)})`,5000);'
assert p.read_text().count(wait)==1
import hashlib
assert hashlib.sha256(p.read_bytes().replace(wait.encode(),b'')).hexdigest()==old[str(p)]
record=json.loads(Path('source/tasks/active/c1-story-world-20261012.json').read_text())
attempt=next(c for c in record['checks'] if c['output'].endswith('/028-integration.txt'))
assert attempt['exit_code']==1 and not attempt['sources_changed_during_check']
assert attempt['source_fingerprint']==fingerprint(old)
assert digest(Path(attempt['output']))==attempt['output_sha256']
oldlog=(prior/'integration.log').read_text();commands=re.findall(r'^RUN: (.+)$',oldlog,re.M)
assert len(commands)==7 and commands[-1]=='node tests/browser-world-v29.mjs',commands
assert 'ℹ pass 153' in oldlog and '14,"exactFullEventParity":true' in oldlog
assert 'Missing button [data-act="transition-confirm"]' in oldlog
balance=json.loads((base/'balance/ACTUAL_SNAPSHOTS.json').read_text())
assert sum(len(g['runs']) for g in balance['groups'])==1620
reuse={'previous_overall_exit_code':1,'original_failure_preserved':str(prior),'source_fingerprint_before':fingerprint(old),'source_fingerprint_after':fingerprint(current),'changed_paths':delta,'allowed_change':'Wait up to 5s for actual button presence; all pointer, gameplay and result assertions unchanged','reused_passed_commands':commands[:-1],'evidence':{'path':str(prior/'integration.log'),'sha256':digest(prior/'integration.log')}}
(out/'REUSED_COMPONENTS.json').write_text(json.dumps(reuse,indent=2)+'\n')
todo=[['node','tests/browser-world-v29.mjs'],['node','tests/browser-chapter-one-v30.mjs'],['node','tests/browser-chapter23.mjs'],['node','tests/browser-chapter123.mjs'],['node','tests/browser-chapter-one-expansion.mjs'],['node','docs/ch1-story-world/audit-saves.mjs'],['python3','tools/restore_archives.py','--all','--verify-only']]
start=time.time();runs=[];code=1
with (out/'integration.log').open('w') as log:
 log.write('Source equivalence verified. Reused six successful components; original 028 failure retained. See REUSED_COMPONENTS.json.\n');log.flush()
 for cmd in todo:
  log.write('RUN: '+' '.join(cmd)+'\n');log.flush()
  code=subprocess.run(cmd,stdout=log,stderr=subprocess.STDOUT).returncode
  runs.append({'command':cmd,'exit_code':code});print(json.dumps(runs[-1]),flush=True)
  if code:break
 row={'name':'integration','exit_code':code,'seconds':time.time()-start,'commands':runs,'reused_components':str(out/'REUSED_COMPONENTS.json'),'log':str(out/'integration.log')}
 (out/'integration.json').write_text(json.dumps(row,indent=2)+'\n')
results=[row]
for name in ['package','local']:
 r=json.loads((prior/(name+'.json')).read_text());assert r['exit_code']==0
 r['revalidated_by_source_equivalence']=str(out/'REUSED_COMPONENTS.json');results.append(r)
(out/'RESULTS.json').write_text(json.dumps(results,indent=2)+'\n')
raise SystemExit(code)
