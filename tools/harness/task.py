#!/usr/bin/env python3
"""Persistent tasks and subprocess evidence. Resumes without conversation history."""
import argparse
from contextlib import contextmanager
import fcntl
from datetime import datetime, timezone
import json
import os
import re
import signal
import subprocess
from pathlib import Path
from common import ROOT, read_json, write_json, write_text, git, inventory, fingerprint, digest
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


def sync_progress(record, root=ROOT):
    """Replace only this task's generated block; preserve the human recovery plan."""
    with task_lock('progress-file', root):
        path = root / '.codex/progress.md'
        content = path.read_text() if path.exists() else '# Ashen 增量执行进度\n\n恢复先读 AGENTS.md、本文件和 git diff。\n'
        begin, end = '<!-- task:' + record['id'] + ' -->', '<!-- /task:' + record['id'] + ' -->'
        lines = [begin, '## 任务 ' + record['id'],
                 '- 状态：' + record.get('status', 'in_progress'),
                 '- 更新：' + record.get('updated_at_utc', now()),
                 '- 下一步：' + record.get('next', 'Inspect task record'),
                 '- 任务记录：source/tasks/' + ('archive/' if record.get('status') == 'complete' else 'active/') + record['id'] + '.json']
        for name, title in [('completed', '已完成'), ('remaining', '待完成'), ('decisions', '决定'), ('blockers', '阻塞')]:
            lines.append('- ' + title + '：' + ('；'.join(record.get(name, [])) or '无'))
        for stage in record.get('stages', []):
            lines.append('- 阶段 ' + stage['name'] + '：' + stage['status'] + '；HEAD ' + stage['head_commit'])
        if record.get('running_check'):
            lines.append('- 检查结果尚未知，不能视为通过：' + record['running_check']['label'])
        elif record.get('checks'):
            check = record['checks'][-1]
            lines.append('- 最近检查：' + check['label'] + '，退出码 ' + str(check['exit_code']) + '；' + check['output'])
        block = '\n'.join(lines + [end])
        if begin in content and end in content:
            start = content.index(begin)
            stop = content.index(end, start) + len(end)
            content = content[:start] + block + content[stop:]
        else:
            content = content.rstrip() + '\n\n' + block + '\n'
        write_text(path, content)


def stop_process(process):
    """A timed-out test may have children; terminate its whole process group."""
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        return
    try:
        process.wait(timeout=3)
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    process.wait()


def execute(record, command, label, root=ROOT, timeout=None):
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
    print('Running ' + label + '; log: ' + output.relative_to(root).as_posix(), flush=True)
    termination = None
    # No shell interpolation; exit status always comes from the real subprocess.
    with output.open('x', encoding='utf-8') as log:
        try:
            process = subprocess.Popen(command, cwd=root, stdout=log, stderr=subprocess.STDOUT,
                                       start_new_session=True)
            try:
                code = process.wait(timeout=timeout)
            except (subprocess.TimeoutExpired, KeyboardInterrupt) as exc:
                termination = 'timeout' if isinstance(exc, subprocess.TimeoutExpired) else 'interrupted'
                stop_process(process)
                code = 124 if termination == 'timeout' else 130
                log.write('\nHarness: ' + termination + '; verification did not complete.\n')
        except OSError as exc:
            log.write(str(exc) + '\n')
            code = 127
    after = inventory(root)
    check = {'label': label, 'command': command, 'exit_code': code,
             'started_at_utc': began, 'finished_at_utc': now(),
             'head_commit': git('rev-parse', 'HEAD', root=root),
             'source_fingerprint': fingerprint(before), 'sources_changed_during_check': before != after,
             'output': output.relative_to(root).as_posix(), 'output_sha256': digest(output)}
    if timeout is not None:
        check['timeout_seconds'] = timeout
    if termination:
        check['termination'] = termination
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
    if any(s['status'] != 'complete' for s in record.get('stages', [])):
        errors.append('All recorded stages must be complete')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    start = sub.add_parser('start')
    start.add_argument('--id', required=True)
    start.add_argument('--goal', required=True)
    start.add_argument('--accept', action='append', required=True)
    start.add_argument('--require', action='append', default=[])
    for name in ['resume', 'update', 'checkpoint', 'run', 'finish']:
        p = sub.add_parser(name)
        p.add_argument('--id', required=True)
        if name in ['update', 'checkpoint']:
            p.add_argument('--decision', action='append', default=[])
            p.add_argument('--done', action='append', default=[])
            p.add_argument('--remaining', action='append')
            p.add_argument('--blocker', action='append')
            p.add_argument('--next')
        if name == 'checkpoint':
            p.add_argument('--stage', required=True)
            p.add_argument('--state', choices=['in_progress', 'complete'], required=True)
        if name == 'run':
            p.add_argument('--label', default='verification')
            p.add_argument('--timeout', type=float, help='Optional seconds; timeout records exit 124')
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
        progress = ROOT / '.codex/progress.md'
        if progress.exists():
            print(progress.read_text())
        print('Resume: read AGENTS.md, .codex/progress.md and git diff before continuing.')
        print(json.dumps(record, ensure_ascii=False, indent=2))
        print(git('status', '--short', '--branch'))
        errors = validate(record)
        print('Evidence integrity: ' + ('; '.join(errors) if errors else 'ok'))
        print('Current fingerprint: ' + fingerprint(inventory()))
        return 1 if errors else 0
    if args.action in ['update', 'checkpoint']:
        record['decisions'].extend(args.decision)
        record['completed'].extend(args.done)
        if args.remaining is not None:
            record['remaining'] = [x for x in args.remaining if x]
        if args.blocker is not None:
            record['blockers'] = [x for x in args.blocker if x]
        if args.next:
            record['next'] = args.next
    if args.action == 'checkpoint':
        stages = record.setdefault('stages', [])
        stage = next((s for s in stages if s['name'] == args.stage), None)
        if stage is None:
            stage = {'name': args.stage}
            stages.append(stage)
        stage.update(status=args.state, updated_at_utc=now(), head_commit=git('rev-parse', 'HEAD'),
                     source_fingerprint=fingerprint(inventory()), worktree=git('status', '--short'))
    code = 0
    if args.action == 'run':
        if not re.fullmatch(r'[a-z0-9-]+', args.label):
            parser.error('Unsafe check label')
        command = args.command[1:] if args.command[:1] == ['--'] else args.command
        if not command or (args.timeout is not None and args.timeout <= 0):
            parser.error('Expected a command and a positive timeout')
        record['running_check'] = {'label': args.label, 'command': command, 'started_at_utc': now(), 'timeout_seconds': args.timeout}
        write_json(path, record)
        sync_progress(record)
        code = execute(record, command, args.label, timeout=args.timeout)
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
        sync_progress(record)
        print(str(archive.relative_to(ROOT)))
        return 0
    record['updated_at_utc'] = now()
    write_json(path, record)
    sync_progress(record)
    print(f"{args.id}: {record['status']}")
    return code


if __name__ == '__main__':
    raise SystemExit(main())
