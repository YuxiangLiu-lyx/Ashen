"""Audit a documentation-only acceptance update without replaying unchanged runtime."""
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, 'tools/harness')
from common import inventory, fingerprint, digest

base = '6d4f4e0c3adad463cf93a97884c059177fe0310e'
current = inventory()
previous = {}
for path in current:
    data = subprocess.check_output(['git', 'show', base + ':' + path])
    previous[path] = hashlib.sha256(data).hexdigest()
changed = [p for p in current if current[p] != previous[p]]
assert changed == ['docs/harness/CHAPTER_01_EXPANSION.md'], changed
assert not subprocess.check_output(['git', 'diff', base, '--name-only', '--', 'dist', 'tests', 'tools'])

report = {
    'baseline_commit': base,
    'checked_at_utc': datetime.now(timezone.utc).isoformat(),
    'previous_fingerprint': fingerprint(previous),
    'current_fingerprint': fingerprint(current),
    'changed_source_inputs': changed,
    'runtime_tests_tools_changed': False,
    'scope': 'Existing play/map/balance results retained; this does not rerun those checks or pass final content acceptance.'
}
out = Path('docs/ch1-expansion/ELITE_DECISION_VALIDATION.json')
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False))
