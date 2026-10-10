#!/usr/bin/env python3
"""Scope recommendations and tiered real checks, stopping on failures."""
import argparse
import json
import os
import subprocess
import sys
from common import ROOT, INDEX, CONFIG, read_json, git, digest
from index import stale
from task import validate


def health():
    index = read_json(INDEX)
    assert not stale(index), 'Index is stale: run index.py and review modules.json'
    assert not index['missing_imports'], index['missing_imports']
    assert not index['unmapped_runtime'], index['unmapped_runtime']
    modules = read_json(CONFIG)['modules']
    for module in modules:
        for p in module['entries'] + module['rules'] + module.get('safety', []):
            assert (ROOT / p).is_file(), 'Missing context reference: ' + p
    state = read_json('source/CURRENT_STATE.json')
    assert state['runtime_modules'] == len(list((ROOT / 'dist').glob('*.js')))
    assert state['runtime_stylesheets'] == len(list((ROOT / 'dist').glob('*.css')))
    assert state['product_version'] == read_json(CONFIG)['product_version']
    for folder in ['active', 'archive']:
        for path in (ROOT / 'source/tasks' / folder).glob('*.json'):
            record = json.loads(path.read_text())
            assert not validate(record), f'Task evidence/baseline mismatch: {path}'
    for spec in ['archives/runtime-assets.manifest.json', 'archives/library-originals.manifest.json']:
        for part in read_json(spec)['parts']:
            assert (ROOT / part['path']).stat().st_size == part['bytes'], part['path']
    print('Health: live references, module inventory, version, task evidence and archive part sizes verified')


def assets():
    manifest = read_json('archives/runtime-assets.manifest.json')
    for item in manifest['files']:
        path = ROOT / manifest['restore_directory'] / item['path']
        assert path.is_file() and digest(path) == item['sha256'], 'Missing/modified original asset: ' + str(path)
    print(f"Verified {len(manifest['files'])} materialized original assets; derivative hashes covered by Node regressions")


def recommend(paths):
    index = read_json(INDEX)
    if stale(index):
        raise ValueError('Stale index; regenerate and review semantic map before recommendations')
    config = read_json(CONFIG)
    impacted = set()
    # Reverse import closure, computed rather than guessed from filenames.
    queue = list(paths)
    dependents = {}
    for name, node in index['nodes'].items():
        for dep in node['imports']:
            dependents.setdefault(dep, []).append(name)
    seen = set(queue)
    while queue:
        name = queue.pop()
        impacted.update(index['nodes'].get(name, {}).get('modules', []))
        for caller in dependents.get(name, []):
            if caller not in seen:
                seen.add(caller)
                queue.append(caller)
    tests = {t for m in config['modules'] if m['id'] in impacted for t in m['tests']}
    tests.add('python3 tools/harness/check.py --tier fast')
    from map_quality import relevant
    if relevant(paths):
        tests.add('python3 tools/harness/map_quality.py')
    unknown = [p for p in paths if p not in index['nodes']]
    if unknown:
        tests.add('python3 tools/harness/check.py --tier integration')
    return {'changed_paths': paths, 'affected_modules': sorted(impacted),
            'commands': sorted(tests), 'unindexed_changes': unknown,
            'limits': ['Reverse literal imports are conservative; prototype/data mutation requires inspection']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--tier', choices=['fast', 'core', 'integration', 'release'], default='fast')
    parser.add_argument('--recommend', action='store_true')
    parser.add_argument('--files', nargs='*')
    parser.add_argument('--base', help='Recommend from git diff against this commit')
    args = parser.parse_args()
    if args.recommend:
        paths = args.files
        if paths is None:
            paths = git('diff', '--name-only', args.base or 'HEAD').splitlines()
            paths += git('ls-files', '--others', '--exclude-standard').splitlines()
        print(json.dumps(recommend(sorted(set(paths))), ensure_ascii=False, indent=2))
        return 0
    health()
    commands = [[sys.executable, '-m', 'unittest', 'discover', '-s', 'tests/harness', '-v']]
    if args.tier in ['core', 'integration', 'release']:
        assets()
        commands += [[sys.executable, 'tools/harness/runtime_audit.py'],
                     ['node', '--test', 'tests/presentation-v281.test.mjs', 'tests/balance-lab.test.mjs', 'tests/world-v29.test.mjs', 'tests/chapter-one-v30.test.mjs', 'tests/chapter23-v30.test.mjs', 'tests/chapter123-v30.test.mjs']]
    if args.tier in ['integration', 'release']:
        commands += [['node', 'tests/browser-presentation-v281.mjs'], ['node', 'tests/browser-balance-lab.mjs'],
                     ['node', 'tests/browser-world-v29.mjs'], ['node', 'tests/browser-chapter-one-v30.mjs'], ['node', 'tests/browser-chapter23.mjs'], ['node', 'tests/browser-chapter123.mjs']]
    if args.tier == 'release':
        commands += [[sys.executable, 'tools/restore_archives.py', '--all', '--verify-only'],
                     [sys.executable, 'tools/build_web_play.py', '--output', 'qa-export/release-build'],
                     [sys.executable, 'tests/browser-web-play.py', '--build', 'qa-export/release-build']]
    env = os.environ.copy()
    chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    if 'CHROME_BIN' not in env and os.path.isfile(chrome):
        env['CHROME_BIN'] = chrome
    for command in commands:
        print('RUN: ' + ' '.join(command), flush=True)
        code = subprocess.run(command, cwd=ROOT, env=env).returncode
        if code:
            print('FAILED with exit ' + str(code), file=sys.stderr)
            return code
    print('PASS tier: ' + args.tier)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
