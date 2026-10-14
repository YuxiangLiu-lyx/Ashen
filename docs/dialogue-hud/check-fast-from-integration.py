"""Reuse the fast tier already executed as the first part of current integration."""
import json,sys,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools/harness'))
from common import inventory,fingerprint,digest
record=json.loads((ROOT/'source/tasks/active/dialogue-hud-20261014.json').read_text());r=[c for c in record['checks']if c['label']=='integration'][-1];current=fingerprint(inventory())
assert r['exit_code']==0 and not r['sources_changed_during_check'] and r['source_fingerprint']==current
assert digest(ROOT/r['output'])==r['output_sha256']
results=json.loads((ROOT/'docs/dialogue-hud/final-checks/RESULTS.json').read_text());assert all(s['passed']for s in results)
log=ROOT/'docs/dialogue-hud/final-checks/integration.txt';text=log.read_text();assert 'PASS tier: integration' in text and re.search(r'Ran 67 tests in .*\n\nOK',text)
out={'passed':True,'source_fingerprint':current,'basis':'check.py integration runs health, live narrative audit and the entire Harness suite before core/browser checks. The final browser expectation import is included in this same verified fingerprint; no stale fast result is promoted.','integration_check':r,'harness_tests':67,'integration_log_sha256':digest(log)}
(ROOT/'docs/dialogue-hud/FAST_COVERAGE.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print('Current integration includes all fast-tier checks: 67 Harness tests, health and live provenance passed.')
