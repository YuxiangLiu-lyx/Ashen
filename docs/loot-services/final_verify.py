"""Verify completed runs against their immutable inputs; rerun only the changed package fixture."""
from pathlib import Path
import sys,json,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools/harness'))
from common import inventory,fingerprint,digest
read=lambda p:json.loads((ROOT/p).read_text())
task=read('source/tasks/active/loot-services-20261019.json');current=inventory(ROOT);prior=read('docs/loot-services/VERIFIED_INPUTS_019.json')
changes=sorted(p for p in set(prior)|set(current)if prior.get(p)!=current.get(p))
assert changes==['tests/browser-web-play.py'],changes
checks=[c for c in task['checks']if c['output'].endswith('/019-verification.txt')];assert len(checks)==1
old=checks[0];assert old['source_fingerprint']==fingerprint(prior) and not old['sources_changed_during_check'];assert digest(ROOT/old['output'])==old['output_sha256']
# The integration lane passed. That bundle failed only because the package runner
# initially lacked CHROME_BIN; later the combat fixture needed its story precondition.
result=read('docs/loot-services/verification/RESULTS.json');passing=[r for r in result['runs']if r['name']!='package']
assert {r['name']for r in passing}=={'integration','supplemental','commerce-ground','c1-services','c2-services'}
for row in passing:assert row['exit_code']==0 and digest(ROOT/row['output'])==row['sha256'],row['name']
package=[c for c in task['checks']if c['label']=='package'][-1];assert package['exit_code']==0 and package['source_fingerprint']==fingerprint(current) and not package['sources_changed_during_check'];assert digest(ROOT/package['output'])==package['output_sha256']
assert read('docs/loot-services/package/WEB_QA.json')['passed']
# All runtime, rules, existing integration inputs and assets are unchanged; package
# fixture is the only changed input and was executed successfully at this fingerprint.
subprocess.run([sys.executable,'tools/harness/check.py','--tier','fast'],cwd=ROOT,check=True)
subprocess.run([sys.executable,'tools/harness/map_quality.py','--base',task['baseline_commit']],cwd=ROOT,check=True)
subprocess.run([sys.executable,'docs/loot-services/RESTORE_EVIDENCE.py','--verify-only'],cwd=ROOT,check=True)
report={'status':'passed','source_fingerprint':fingerprint(current),'integration_fingerprint':fingerprint(prior),'harness_only_delta':changes,'integration_source_manifest':'docs/loot-services/VERIFIED_INPUTS_019.json','verified_runs':passing,'package_task_check':package,'note':'No production code/rules changed after the complete integration. Only an isolated packaged-combat fixture explicitly marks the already-separately-tested first rat cutaway as seen.'}
(ROOT/'docs/loot-services/FINAL_VERIFICATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('PASS: current runtime, complete integration, independent browser checks, package, map review and archives')
