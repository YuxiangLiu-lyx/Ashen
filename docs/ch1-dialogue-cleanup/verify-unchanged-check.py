"""Reuse completed checks only when their entire input set is unchanged.
The only allowed delta is the packaged UI test's safe-save wait, which neither
of these commands executes. Logs and runtime/data inputs are checked exactly.
"""
import argparse
import json
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools/harness'))
from common import digest,fingerprint,inventory
p=argparse.ArgumentParser();p.add_argument('label',choices=['browser','integration']);a=p.parse_args()
old=json.loads((ROOT/'docs/ch1-dialogue-cleanup/INTEGRATION_INPUTS.json').read_text());current=inventory()
delta={p for p in set(old)|set(current) if old.get(p)!=current.get(p)}
assert delta=={'tests/browser-web-play.py'},delta
record=next(p for folder in ['active','archive'] if (p:=ROOT/'source/tasks'/folder/'ch1-dialogue-cleanup-20261010.json').exists())
r=json.loads(record.read_text())
expected={'browser':['node','tests/browser-chapter-one-incremental.mjs'], 'integration':['.venv/bin/python','tools/harness/check.py','--tier','integration']}[a.label]
c=next(c for c in reversed(r['checks']) if c['label']==a.label and c['command']==expected)
assert c['exit_code']==0 and not c['sources_changed_during_check']
assert c['source_fingerprint']==fingerprint(old)
assert digest(ROOT/c['output'])==c['output_sha256']
if a.label=='integration':assert 'PASS tier: integration' in (ROOT/c['output']).read_text()
else:
 q=json.loads((ROOT/'docs/ch1-dialogue-cleanup/browser/QA.json').read_text());assert q['status']=='passed' and len(q['fullScenes'])==2
print(json.dumps({'verified':a.label,'reused_execution':c['output'],'log_sha256':c['output_sha256'],'only_changed_input':sorted(delta),'current_source_fingerprint':fingerprint(current),'reason':'Only the separate packaged UI test changed; all inputs used by this execution are byte-identical.'},indent=2))
