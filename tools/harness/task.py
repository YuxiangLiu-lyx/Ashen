#!/usr/bin/env python3
"""Persistent tasks and subprocess evidence. Resumes without conversation history."""
import argparse
from contextlib import contextmanager
import fcntl
from datetime import datetime, timezone
import json
import re
import subprocess
from pathlib import Path
from common import ROOT, read_json, write_json, git, inventory, fingerprint, digest
from context import route


def now():
    return datetime.now(timezone.utc).isoformat()


def path_for(task_id, root=ROOT):
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,79}', task_id):
        raise ValueError('Task ID must use lowercase letters/digits/hyphens')
    return root / 'source/tasks/active' / (task_id + '.json')


@contextmanager
def task_lock(task_id, root=ROOT):
    """Hold one writer per task throughout verification; OS releases on exit."""
    path_for(task_id, root)
    directory = root / git('rev-parse', '--git-path', 'ashen-task-locks', root=root)
    directory.mkdir(parents=True, exist_ok=True)
    with (directory / (task_id + '.lock')).open('a') as handle:
        try:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as exc:
            raise RuntimeError('Task is busy; wait for its current command to finish: ' + task_id) from exc
        try:
            yield
        finally:
            fcntl.flock(handle, fcntl.LOCK_UN)


def validate(record, root=ROOT):
    errors = []
    try:
        git('merge-base', '--is-ancestor', record['baseline_commit'], 'HEAD', root=root)
    except subprocess.CalledProcessError:
        errors.append('baseline_commit is not an ancestor of HEAD')
    for check in record.get('checks', []):
        log = root / check['output']
        if not log.is_file() or digest(log) != check['output_sha256']:
            errors.append('Missing or changed evidence: ' + check['output'])
    return errors


def execute(record, command, label, root=ROOT):
    if not command:
        raise ValueError('Expected executable command after --')
    before = inventory(root)
    folder = root / 'docs/harness/evidence' / record['id']
    folder.mkdir(parents=True, exist_ok=True)
    number = len(record['checks']) + 1
    output = folder / f"{number:03}-{label}.txt"
    while output.exists():
        number += 1
        output = folder / f"{number:03}-{label}.txt"
    began = now()
    # No shell interpolation; exit status always comes from the real subprocess.
    with output.open('x', encoding='utf-8') as log:
        try:
            result = subprocess.run(command, cwd=root, stdout=log, stderr=subprocess.STDOUT)
            code = result.returncode
        except OSError as exc:
            log.write(str(exc) + '\n')
            code = 127
    after = inventory(root)
    check = {'label': label, 'command': command, 'exit_code': code,
             'started_at_utc': began, 'finished_at_utc': now(),
             'head_commit': git('rev-parse', 'HEAD', root=root),
             'source_fingerprint': fingerprint(before), 'sources_changed_during_check': before != after,
             'output': output.relative_to(root).as_posix(), 'output_sha256': digest(output)}
    record['checks'].append(check)
    record['updated_at_utc'] = now()
    return code


def can_finish(record, root=ROOT):
    errors = validate(record, root)
    if record.get('running_check'):
        errors.append('Interrupted or running check has no final exit status; rerun verification')
    current = fingerprint(inventory(root))
    latest = {x['label']: x for x in record['checks']}
    for label in record['required_checks']:
        check = latest.get(label)
        if not check or check['exit_code'] != 0 or check['sources_changed_during_check']:
            errors.append('Required successful check: ' + label)
        elif check['source_fingerprint'] != current:
            errors.append('Check predates current code: ' + label)
    if record['remaining'] or record['blockers']:
        errors.append('Remaining work or blockers must be explicitly resolved')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    start = sub.add_parser('start')
    start.add_argument('--id', required=True)
    start.add_argument('--goal', required=True)
    start.add_argument('--accept', action='append', required=True)
    start.add_argument('--require', action='append', default=[])
    for name in ['resume', 'update', 'run', 'finish']:
        p = sub.add_parser(name)
        p.add_argument('--id', required=True)
        if name == 'update':
            p.add_argument('--decision', action='append', default=[])
            p.add_argument('--done', action='append', default=[])
            p.add_argument('--remaining', action='append')
            p.add_argument('--blocker', action='append')
            p.add_argument('--next')
        if name == 'run':
            p.add_argument('--label', default='verification')
            p.add_argument('command', nargs=argparse.REMAINDER)
        if name == 'finish':
            p.add_argument('--summary', required=True)
    sub.add_parser('list')
    args = parser.parse_args()
    if args.action == 'list':
        return dispatch(args, parser)
    try:
        with task_lock(args.id):
            return dispatch(args, parser)
    except RuntimeError as exc:
        parser.error(str(exc))


def dispatch(args, parser):
    if args.action == 'list':
        for path in sorted((ROOT / 'source/tasks/active').glob('*.json')):
            record = json.loads(path.read_text())
            print(json.dumps({k: record[k] for k in ['id', 'goal', 'status', 'next']}, ensure_ascii=False))
        return 0
    path = path_for(args.id)
    if args.action == 'start':
        if path.exists() or (ROOT / 'source/tasks/archive' / path.name).exists():
            parser.error('Existing task: use resume/update, or a new unique ID')
        context = route(args.goal)
        if context['status'] not in ['ok', 'budget_limited']:
            parser.error('Repair context discovery first: ' + context['status'])
        record = {'schema': 1, 'id': args.id, 'goal': args.goal, 'acceptance': args.accept,
                  'baseline_commit': git('rev-parse', 'HEAD'), 'modules': context['modules'],
                  'status': 'in_progress', 'created_at_utc': now(), 'updated_at_utc': now(),
                  'decisions': [], 'completed': [], 'remaining': args.accept,
                  'blockers': [], 'next': 'Inspect routed code and capture baseline',
                  'required_checks': args.require or ['verification'], 'checks': []}
    else:
        if not path.is_file():
            parser.error('No active task with this ID; check tasks/archive')
        record = json.loads(path.read_text())
    if args.action == 'resume':
        print(json.dumps(record, ensure_ascii=False, indent=2))
        print(git('status', '--short', '--branch'))
        errors = validate(record)
        print('Evidence integrity: ' + ('; '.join(errors) if errors else 'ok'))
        print('Current fingerprint: ' + fingerprint(inventory()))
        return 1 if errors else 0
    if args.action == 'update':
        record['decisions'].extend(args.decision)
        record['completed'].extend(args.done)
        if args.remaining is not None:
            record['remaining'] = [x for x in args.remaining if x]
        if args.blocker is not None:
            record['blockers'] = [x for x in args.blocker if x]
        if args.next:
            record['next'] = args.next
    code = 0
    if args.action == 'run':
        if not re.fullmatch(r'[a-z0-9-]+', args.label):
            parser.error('Unsafe check label')
        command = args.command[1:] if args.command[:1] == ['--'] else args.command
        record['running_check'] = {'label': args.label, 'command': command, 'started_at_utc': now()}
        write_json(path, record)
        code = execute(record, command, args.label)
        del record['running_check']
        print(json.dumps(record['checks'][-1], ensure_ascii=False, indent=2))
    if args.action == 'finish':
        errors = can_finish(record)
        if errors:
            print('\n'.join(errors))
            return 1
        record.update(status='complete', summary=args.summary, completed_at_utc=now(),
                      verified_source_fingerprint=fingerprint(inventory()), next='No required task work remains')
        archive = ROOT / 'source/tasks/archive' / path.name
        write_json(archive, record)
        path.unlink()
        print(str(archive.relative_to(ROOT)))
        return 0
    record['updated_at_utc'] = now()
    write_json(path, record)
    print(f"{args.id}: {record['status']}")
    return code


if __name__ == '__main__':
    raise SystemExit(main())
