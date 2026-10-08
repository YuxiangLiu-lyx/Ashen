#!/usr/bin/env python3
"""Parse every recovered JS module, including renderer modules not imported by Node tests."""
from concurrent.futures import ThreadPoolExecutor
import subprocess
from common import ROOT


def parse(path):
    result = subprocess.run(['node', '--check', str(path)], stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT, text=True)
    return path, result


if __name__ == '__main__':
    files = sorted((ROOT / 'dist').glob('*.js'))
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(parse, files))
    failed = [(p, r) for p, r in results if r.returncode]
    for path, result in failed:
        print(str(path.relative_to(ROOT)) + '\n' + result.stdout)
    print(f'Parsed {len(files)} runtime modules; failures: {len(failed)}')
    raise SystemExit(1 if failed else 0)
