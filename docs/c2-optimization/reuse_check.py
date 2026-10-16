"""Reuse a completed, byte-identical verification across the two delivery tasks."""
import hashlib,json,sys
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import fingerprint,inventory
label=sys.argv[1];source='c2-optimization-20261016';path=Path('source/tasks/active')/(source+'.json')
r=json.loads(path.read_text());lookup='integration'if label=='core'else label
check=[c for c in r['checks']if c['label']==lookup][-1]
assert check['exit_code']==0 and not check['sources_changed_during_check']
assert check['source_fingerprint']==fingerprint(inventory())
log=Path(check['output']).read_bytes();assert hashlib.sha256(log).hexdigest()==check['output_sha256']
if label=='core':
 assert b'PASS tier: integration'in log and b'tests/presentation-v281.test.mjs'in log and b'RUN: node tools/balance_lab/chapter-one.mjs'in log
print(json.dumps({'passed':True,'reused_actual_check':check,'scope':'Integration includes complete fast/core plus browser integration'if label=='core'else label},ensure_ascii=False,indent=2))
