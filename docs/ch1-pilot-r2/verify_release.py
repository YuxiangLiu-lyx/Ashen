#!/usr/bin/env python3
"""Verify and reuse this recovery's completed release evidence, without rerunning it.

The release tier executes all integration commands plus the packaged browser test.
Reject stale code, missing commands, changed logs/assets and incomplete UI cases.
This is receipt validation; the actual browser executions are in the linked log.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from common import digest, fingerprint, inventory

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('section', choices=['integration', 'packaged-ui'])
args = p.parse_args()
paths = [ROOT / 'source/tasks' / folder / 'v29-exploration-20261008.json'
         for folder in ['active', 'archive']]
record = json.loads(next(path for path in paths if path.is_file()).read_text())
release = next(c for c in reversed(record['checks']) if c['label'] == 'release')
assert release['exit_code'] == 0 and not release['sources_changed_during_check']
assert release['source_fingerprint'] == fingerprint(inventory())
assert release['command'][-3:] == ['tools/harness/check.py', '--tier', 'release']
log = ROOT / release['output']
assert digest(log) == release['output_sha256']
text = log.read_text()
assert 'PASS tier: release' in text
for test in ['presentation-v281', 'balance-lab', 'world-v29',
             'chapter-one-v30', 'chapter23', 'chapter123']:
    assert 'RUN: node tests/browser-' + test + '.mjs' in text
manifest_path = ROOT / 'docs/ch1-pilot-r2/packaged/WEB_BUILD_MANIFEST.json'
manifest = json.loads(manifest_path.read_text())
inputs = {p.name: digest(p) for p in sorted((ROOT / 'dist').glob('*'))
          if p.suffix in {'.js', '.css', '.html'}}
inputs.update({asset['original']: digest(ROOT / 'dist' / asset['original'])
               for asset in manifest['assets']})
runtime_hash = hashlib.sha256(json.dumps(inputs, sort_keys=True).encode()).hexdigest()
assert manifest['runtime_input_sha256'] == runtime_hash
assert manifest['runtime_input_sha256'] in text and manifest['offline_sha256'] in text
for asset in manifest['assets']:
    assert digest(ROOT / 'dist' / asset['original']) == asset['original_sha256']
if args.section == 'packaged-ui':
    qa_path = ROOT / 'docs/ch1-pilot-r2/packaged/WEB_QA.json'
    qa = json.loads(qa_path.read_text())
    assert qa['passed']
    assert json.dumps(qa, ensure_ascii=False, indent=2) in text
    assert {r['case'] for r in qa['results']} == {'offline-file', 'http-site', 'mobile-landscape'}
    for case in qa['results']:
        if case['case'] == 'mobile-landscape':
            assert case['touch_controls_visible']
        else:
            assert not case['uncaught_errors']
            assert {'chapter1_cinematic_replay', 'skip_replay', 'replay_preserves_main_save'} <= set(case['checks'])
print(json.dumps({'verified': args.section, 'reused_release_log': release['output'],
                  'release_log_sha256': release['output_sha256'],
                  'source_fingerprint': release['source_fingerprint'],
                  'build_manifest_sha256': digest(manifest_path),
                  'note': 'Actual integration/packaged execution recorded in release; no duplicate browser run.'}, indent=2))
