#!/usr/bin/env python3
"""Repeatable baseline before runtime changes; never replace historical evidence."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import subprocess
import sys
from common import ROOT, write_json, git, digest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True, help='New evidence directory')
    args = parser.parse_args()
    out = Path(args.output).resolve()
    if out.exists():
        parser.error('Choose a new directory; historical baseline will not be overwritten')
    out.mkdir(parents=True)
    env = os.environ.copy()
    env['ASHEN_QA_OUTPUT'] = str(out / 'browser')
    mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    if os.path.isfile(mac) and 'CHROME_BIN' not in env:
        env['CHROME_BIN'] = mac
    commands = [[sys.executable, 'tools/restore_archives.py'],
                [sys.executable, 'tools/restore_archives.py', '--all', '--verify-only'],
                [sys.executable, 'tools/harness/runtime_audit.py'],
                ['node', '--test', 'tests/presentation-v281.test.mjs'],
                ['node', 'tests/browser-presentation-v281.mjs']]
    checks = []
    baseline = git('rev-parse', 'HEAD')
    runtime = {p.relative_to(ROOT).as_posix(): digest(p) for p in sorted((ROOT / 'dist').glob('*.js'))}
    for i, command in enumerate(commands):
        log = out / f'{i + 1:02}-output.txt'
        with log.open('w') as handle:
            code = subprocess.run(command, cwd=ROOT, env=env, stdout=handle, stderr=subprocess.STDOUT).returncode
        checks.append({'command': command, 'exit_code': code, 'output': str(log), 'output_sha256': digest(log)})
        write_json(out / 'RESULT.json', {'baseline_commit': baseline, 'runtime_file_sha256': runtime,
                   'checked_at_utc': datetime.now(timezone.utc).isoformat(), 'checks': checks,
                   'passed': len(checks) == len(commands) and all(x['exit_code'] == 0 for x in checks)})
        print(json.dumps(checks[-1]), flush=True)
        if code:
            raise SystemExit(code)
