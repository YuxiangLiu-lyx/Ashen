"""Resume only the failed supplemental browser group; preserve the original run."""
import json, os, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from common import inventory, fingerprint, digest

folder = ROOT / 'docs/dialogue-hud/final-checks'
task = json.loads((ROOT / 'source/tasks/active/dialogue-hud-20261014.json').read_text())
old = next(c for c in task['checks'] if c['output'].endswith('/023-integration.txt'))
assert old['exit_code'] == 1 and not old['sources_changed_during_check']
assert old['source_fingerprint'] == fingerprint(inventory())
assert digest(ROOT / old['output']) == old['output_sha256']
initial = folder / 'RESULTS.initial.json'
assert not initial.exists(), 'Keep original recovery records; do not overwrite'
initial.write_bytes((folder / 'RESULTS.json').read_bytes())
results = json.loads(initial.read_text())
for group in results:
    if group['name'] in ('integration', 'package'):
        assert group['passed'] and all(s['exit_code'] == 0 for s in group['steps'])
focused = next(r for r in results if r['name'] == 'focused')
assert len(focused['steps']) == 5 and all(s['exit_code'] == 0 for s in focused['steps'][:4])
assert focused['steps'][4]['command'] == ['node', 'docs/dialogue-hud/capture-copyedits.mjs']
assert focused['steps'][4]['exit_code'] == 1
commands = [
    ['node', 'docs/dialogue-hud/capture-copyedits.mjs'],
    ['node', 'tests/browser-c1-story-flow.mjs'],
    ['node', 'tests/browser-ch12-portraits.mjs'],
]
env = {**os.environ, 'CHROME_BIN': '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
       'ASHEN_FLOW_OUTPUT': 'docs/dialogue-hud/flow-browser',
       'ASHEN_PORTRAIT_OUTPUT': 'docs/dialogue-hud/portrait-regression'}
extra = []
with (folder / 'focused-retry.txt').open('w') as log:
    for cmd in commands:
        print('RUN', cmd, flush=True)
        r = subprocess.run(cmd, cwd=ROOT, env=env, stdout=log, stderr=subprocess.STDOUT, timeout=300)
        extra.append({'command': cmd, 'exit_code': r.returncode})
        if r.returncode:
            raise SystemExit(r.returncode)
focused['steps'] = focused['steps'][:4] + extra
focused['passed'] = True
(folder / 'RESULTS.json').write_text(json.dumps(results, indent=2) + '\n')
receipt = {'source_fingerprint': fingerprint(inventory()), 'original_run': old,
           'preserved_results': str(initial.relative_to(ROOT)),
           'reason': 'Supplemental capture hook had one missing closing brace. Only this unindexed QA driver changed. Runtime, Harness, tests, and build inputs remain identical.',
           'evidence_hashes': {p.name: digest(p) for p in [initial, folder / 'integration.txt', folder / 'package.txt', folder / 'focused.txt', folder / 'focused-retry.txt']},
           'passed': all(r['passed'] for r in results)}
assert receipt['passed']
(folder / 'RECOVERY.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print('Current integration and package results retained; supplemental browser checks passed.')
