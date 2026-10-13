"""Resume final two browser jobs; prove every other indexed input is unchanged."""
from pathlib import Path
import json,sys,subprocess,hashlib,time
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint
out=Path('docs/ch1-layer-rules/final-verification');read=lambda p:json.loads(Path(p).read_text())
old=read(out/'011-SOURCES.json');new=inventory();changed=sorted(k for k in set(old)|set(new) if old.get(k)!=new.get(k))
assert changed==['tests/browser-chapter123.mjs'],changed
record=read('source/tasks/active/c1-layer-rules-20261013.json')
prior=next(c for c in record['checks'] if c['output'].endswith('011-integration.txt'))
assert prior['source_fingerprint']==fingerprint(old) and not prior['sources_changed_during_check']
assert hashlib.sha256(Path(prior['output']).read_bytes()).hexdigest()==prior['output_sha256']
log=(out/'integration-final.log').read_text();assert 'ℹ pass 164' in log and 'Ran 31 tests' in log and 'RUN: node tests/browser-chapter123.mjs' in log
results=read(out/'RESULTS.json');(out/'RESULTS-attempt-011.json').write_text(json.dumps(results,indent=2)+'\n')
start=time.time();rows=[];code=0
with (out/'integration-continuation.log').open('w') as f:
 for cmd in [['node','tests/browser-chapter123.mjs'],['node','tests/browser-chapter-one-expansion.mjs'],['node','docs/ch1-layer-rules/audit-saves.mjs'],['python3','tools/restore_archives.py','--all','--verify-only']]:
  f.write('RUN '+repr(cmd)+'\n');f.flush();code=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT).returncode;rows.append({'command':cmd,'exit_code':code})
  if code:break
result={'name':'integration','commands':rows,'exit_code':code,'seconds':time.time()-start,'log':str(out/'integration-continuation.log'),'reused_successful_components_from':prior['output'],'only_source_change':changed,'reuse_scope':'31 Harness, runtime audit, 164 core including 18 campaigns, 1620 snapshot encounters and first five browser groups completed before 011 final renderer assertion; failed group rerun here'}
(out/'integration-continuation.json').write_text(json.dumps(result,indent=2)+'\n')
final=[result]+[r for r in results if r['name']!='integration'];(out/'RESULTS.json').write_text(json.dumps(final,indent=2)+'\n');print(json.dumps(final,indent=2));raise SystemExit(code)
