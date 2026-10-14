"""Reuse the successful, current integration step; retry only missing Chrome setup.

The earlier combined command remains failed. This continuation verifies its
source fingerprint and successful integration exit before testing the package.
"""
import json,os,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'tools/harness'))
from common import inventory,fingerprint,digest
record=json.loads((root/'source/tasks/active/c1-story-flow-20261014.json').read_text())
previous=next(c for c in record['checks'] if c['output'].endswith('/018-integration.txt'))
assert previous['source_fingerprint']==fingerprint(inventory()) and not previous['sources_changed_during_check']
assert digest(root/previous['output'])==previous['output_sha256']
results=json.loads((root/'docs/c1-story-flow/final-checks/RESULTS.json').read_text())
integration=next(r for r in results if r['name']=='integration');assert integration['passed'] and integration['steps'][0]['exit_code']==0
assert 'PASS tier: integration' in (root/'docs/c1-story-flow/final-checks/integration.txt').read_text()
package=next(r for r in results if r['name']=='package');assert package['steps'][0]['exit_code']==0
assert 'Chrome or Chromium is required' in (root/'docs/c1-story-flow/final-checks/package.txt').read_text()
print('Verified fresh full integration exit 0 in original combined receipt; only package browser setup is retried.',flush=True)
command=['.venv/bin/python','tests/browser-web-play.py','--build','qa-export/c1-story-flow-preview','--out','docs/c1-story-flow/package-002']
r=subprocess.run(command,cwd=root,env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'},timeout=600)
if r.returncode:raise SystemExit(r.returncode)
out={'status':'passed','source_fingerprint':fingerprint(inventory()),'integration_reused_receipt':previous,'integration_log':{'path':'docs/c1-story-flow/final-checks/integration.txt','sha256':digest(root/'docs/c1-story-flow/final-checks/integration.txt')},'package_browser':{'command':command,'exit_code':r.returncode},'limits':['Original combined command exit 1 remains recorded; package failed before Chrome launch, now retested with installed Chrome.']}
(root/'docs/c1-story-flow/FINAL_INTEGRATION.json').write_text(json.dumps(out,indent=2)+'\n')
