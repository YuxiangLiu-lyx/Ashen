#!/usr/bin/env python3
"""Verify the requested V30 snapshot and preserved reconstruction byte for byte."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
TARGET = '1cefe80c8f187fceda48dd5322f90affda4e13c0'
PRESERVED = '6b388c7bf07b531bdf39b924ef8e6ab2b8851357'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def sha(data):
    return hashlib.sha256(data).hexdigest()


expected = {}
for line in git('ls-tree', '-r', TARGET, '--', 'dist').decode().splitlines():
    meta, name = line.split('\t')
    expected[name] = sha(git('cat-file', 'blob', meta.split()[2]))
# Some original assets are materialized from the immutable recovery archive.
manifest = json.loads((ROOT / 'archives/runtime-assets.manifest.json').read_text())
for row in manifest['files']:
    expected[str(Path(manifest['restore_directory']) / row['path'])] = row['sha256']
actual = {p.relative_to(ROOT).as_posix(): sha(p.read_bytes())
          for p in (ROOT / 'dist').rglob('*') if p.is_file() and p.name != '.DS_Store'}
assert actual == expected, {
    'missing': sorted(expected.keys() - actual.keys()),
    'unexpected': sorted(actual.keys() - expected.keys()),
    'changed': sorted(k for k in expected.keys() & actual.keys() if expected[k] != actual[k]),
}
preserved = []
for p in (ROOT / 'history/reconstruction-20261010').rglob('*'):
    if not p.is_file() or p.name == 'README.md':
        continue
    old_path = p.relative_to(ROOT / 'history/reconstruction-20261010').as_posix()
    digest = sha(p.read_bytes())
    assert digest == sha(git('show', PRESERVED + ':' + old_path)), old_path
    preserved.append({'path': p.relative_to(ROOT).as_posix(), 'original_path': old_path, 'sha256': digest})
assert preserved, 'Missing reconstruction originals'
state = json.loads((ROOT / 'source/CURRENT_STATE.json').read_text())
assert state['rollback']['target_commit'] == TARGET
assert state['runtime_modules'] == len(list((ROOT / 'dist').glob('*.js'))) == 196
assert state['runtime_stylesheets'] == len(list((ROOT / 'dist').glob('*.css'))) == 7
report = {'status': 'pass', 'target_commit': TARGET, 'preserved_commit': PRESERVED,
          'runtime_files': len(actual), 'sha256': actual, 'preserved_originals': preserved,
          'scope': 'Exact target runtime plus immutable original assets; no changes to personal browser saves.'}
out = ROOT / 'docs/rollback-v30/PARITY.json'
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': 'pass', 'runtime_files': len(actual), 'preserved_originals': len(preserved)}))
