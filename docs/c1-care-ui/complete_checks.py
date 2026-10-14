"""Keep the initial inventory failure; resume only the still-required integration."""
import json,os,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'tools/harness'))
from common import inventory,fingerprint
task=json.loads((root/'source/tasks/active/c1-care-ui-20261014.json').read_text())
prior=next(x for x in task['checks']if x['output'].endswith('/007-integration.txt'))
assert prior['source_fingerprint']==fingerprint(inventory()) and not prior['sources_changed_during_check']
completed=json.loads((root/'docs/c1-care-ui/final-checks/RESULTS.json').read_text())
assert all(x['passed']for x in completed if x['name']in ['focused','package'])
base='docs/c1-care-ui/integration'
env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','ASHEN_QA_OUTPUT':base+'/presentation','ASHEN_LAB_QA_OUTPUT':base+'/lab','ASHEN_WORLD_OUTPUT':base+'/world','ASHEN_CAPTURE_OUTPUT':base+'/chapters','ASHEN_C1_OUTPUT':base+'/expansion','ASHEN_C1_BALANCE':base+'/balance','ASHEN_C1_ECONOMY':base+'/economy','ASHEN_C1_EVIDENCE':base+'/navigation','ASHEN_READER_OUTPUT':'docs/c1-care-ui/browser-final'}
movement=root/'docs/ch1-layer-rules/MOVEMENT.json';original=movement.read_bytes()
try:
 with (root/'docs/c1-care-ui/final-checks/integration-resumed.txt').open('w')as log:r=subprocess.run(['python3','tools/harness/check.py','--tier','integration'],cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=1200)
finally:
 if movement.read_bytes()!=original:(root/'docs/c1-care-ui/final-checks/MOVEMENT.json').write_bytes(movement.read_bytes());movement.write_bytes(original)
result={'integration_exit_code':r.returncode,'reused_passed_steps':['focused','package'],'reuse_basis':'007 integration source fingerprint unchanged; only CURRENT_STATE module inventory corrected from 229 to 232','source_fingerprint':fingerprint(inventory())}
(root/'docs/c1-care-ui/final-checks/COMPLETED.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result));raise SystemExit(r.returncode)
