"""Only two recommended-command strings changed after the complete integration run."""
import json,hashlib,sys
from pathlib import Path
sys.path.insert(0,'tools/harness');from common import inventory,fingerprint
P=Path('docs/c1-restraint');read=lambda p:json.loads(Path(p).read_text());prior=read(P/'INTEGRATION_INPUTS.json');current=inventory()
changes=sorted(k for k in set(current)|set(prior['files'])if current.get(k)!=prior['files'].get(k));assert changes==['source/harness/modules.json'],changes
old=read(P/'modules-before-command-fix.json');new=read('source/harness/modules.json')
for m in old['modules']:m['tests']=['node --test tests/c1-restraint.test.mjs'if t=='tests/c1-restraint.test.mjs'else t for t in m['tests']]
assert old==new
record=read('source/tasks/active/c1-restraint-20261015.json');check=next(r for r in record['checks']if r['output'].endswith('020-integration.txt'))
assert check['exit_code']==0 and check['source_fingerprint']==prior['fingerprint'] and not check['sources_changed_during_check']
assert hashlib.sha256(Path(check['output']).read_bytes()).hexdigest()==check['output_sha256']
fast=[r for r in record['checks']if r['label']=='fast'][-1];assert fast['exit_code']==0 and fast['source_fingerprint']==fingerprint(current) and not fast['sources_changed_during_check']
result={'passed':True,'source_fingerprint':fingerprint(current),'full_integration':check,'current_fast':fast,'only_change':changes,'reason':'Two bare test filenames in recommendations now have node --test. Every runtime module, asset mapping, test, oracle and narrative source is byte-identical to the complete passing integration. Current Harness/health/narrative checks were rerun; the recommendation correction cannot alter runtime execution.'};(P/'INTEGRATION_REUSE.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'passed':True,'only_change':changes}))
