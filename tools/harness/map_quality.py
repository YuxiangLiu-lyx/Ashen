#!/usr/bin/env python3
"""Three independent map quality gates. Evidence is reviewed, never inferred from density."""
import argparse
import fnmatch
import json
from pathlib import Path
from common import ROOT, CONFIG, read_json, inventory, fingerprint, digest, git

DIMENSIONS = ('playability', 'scene_credibility', 'character_consistency')
REPORT = 'docs/map-quality/LATEST.json'


def relevant(paths, root=ROOT):
    config = read_json(CONFIG, root)
    patterns = ['dist/assets/*', 'dist/game-v14.js', 'dist/data-v14.js', 'dist/core-v14.js']
    for module in config['modules']:
        if module['id'] in ('maps', 'art'):
            patterns += module['patterns'] + module['entries']
    return sorted(p for p in paths if any(fnmatch.fnmatch(p, pattern) for pattern in patterns))


def changed(base, root=ROOT):
    return sorted(set(git('diff', '--name-only', base, root=root).splitlines() +
                      git('ls-files', '--others', '--exclude-standard', root=root).splitlines()))


def validate_report(report, root=ROOT, required_paths=()):
    errors = []
    if report.get('source_fingerprint') != fingerprint(inventory(root)):
        errors.append('Map quality review predates current code')
    missing = set(required_paths) - set(report.get('reviewed_paths', []))
    if missing:
        errors.append('Unreviewed map changes: ' + ', '.join(sorted(missing)))
    maps = report.get('maps', [])
    if not maps or len({m.get('id') for m in maps}) != len(maps):
        errors.append('Explicit unique affected maps required')
    for row in maps:
        for dimension in DIMENSIONS:
            result = row.get(dimension, {})
            if result.get('status') != 'pass' or not result.get('reason') or not result.get('evidence'):
                errors.append(f"{row.get('id')}: {dimension} is missing, failed or unverified")
            for evidence in result.get('evidence', []):
                path = (root / evidence.get('path', '')).resolve()
                if not path.is_relative_to(root.resolve()) or not path.is_file() or digest(path) != evidence.get('sha256'):
                    errors.append(f"{row.get('id')}: {dimension} evidence missing/changed: {evidence.get('path')}")
    for asset in report.get('assets', []):
        path = root / asset['path']
        if not path.is_file() or digest(path) != asset['sha256']:
            errors.append('Reviewed asset changed: ' + asset['path'])
    return errors


def task_errors(record, root=ROOT):
    paths = relevant(changed(record['baseline_commit'], root), root)
    if not paths:
        return []
    if not (root / REPORT).is_file():
        return ['Map changes require independent three-dimension review: ' + REPORT]
    return validate_report(read_json(REPORT, root), root, paths)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--report', default=REPORT)
    p.add_argument('--base', help='Verify coverage of all map files changed since this commit')
    args = p.parse_args()
    if not (ROOT / args.report).is_file():
        p.error('Review missing: ' + args.report + '; follow docs/harness/MAP_QUALITY.md')
    errors = validate_report(read_json(args.report), required_paths=relevant(changed(args.base)) if args.base else ())
    print(json.dumps({'passed': not errors, 'dimensions': DIMENSIONS, 'errors': errors}, ensure_ascii=False, indent=2))
    return bool(errors)


if __name__ == '__main__':
    raise SystemExit(main())
