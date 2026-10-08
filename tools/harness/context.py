#!/usr/bin/env python3
"""Task context discovery, with reasons, bounded excerpts and explicit uncertainty."""
import argparse
import re
import sys
from common import ROOT, CONFIG, INDEX, read_json
from index import stale


def matches(task, keyword):
    # Chinese phrases are substring matches; English identifiers use word boundaries.
    return keyword.lower() in task.lower() if re.search('[\u4e00-\u9fff]', keyword) else bool(
        re.search(r'(?<![\w])' + re.escape(keyword) + r'(?![\w])', task, re.I))


def route(task, max_files=16, budget=24000, expand=False, root=ROOT):
    index = read_json(INDEX, root)
    changed = stale(index, root)
    if changed:
        return {'status': 'stale', 'changed': changed,
                'action': 'python3 tools/harness/index.py; review semantic entries for moved/new modules'}
    config = read_json(CONFIG, root)
    scored = []
    for module in config['modules']:
        hits = [k for k in module['keywords'] if matches(task, k)]
        if hits:
            scored.append((sum(len(k) for k in hits), module, hits))
    scored.sort(key=lambda x: (-x[0], x[1]['id']))
    # Exact symbols provide a fallback even without authored keyword coverage.
    symbols = [(p, s) for p, n in index['nodes'].items() for s in n['symbols']
               if len(s) > 3 and matches(task, s)]
    candidates = {}

    def add(path, reason, priority, category='current_code'):
        if path not in index['nodes']:
            raise ValueError('Missing indexed reference: ' + path)
        c = candidates.setdefault(path, {'path': path, 'reasons': [], 'priority': priority,
                                        'category': category})
        c['reasons'].append(reason)
        c['priority'] = max(priority, c['priority'])

    selected_modules = []
    for score, module, hits in scored[:3]:
        selected_modules.append(module)
        for i, path in enumerate(module['entries']):
            add(path, f"{module['id']}: task matched {', '.join(hits)}; maintained entry", 100 + score - i)
        for path in module['rules']:
            add(path, f"{module['id']}: current constraints", 120 + score, 'current_rules')
        for path in module.get('safety', []):
            add(path, f"{module['id']}: {module['risk']}", 95)
    for path, symbol in symbols:
        add(path, 'Exact code symbol: ' + symbol, 130)
    if not candidates:
        return {'status': 'no_match', 'task': task,
                'action': 'Use rg for concrete names/symbols; add verified module semantics; no historical fallback'}
    # Read one hop only; a hub such as core imports most of the game, so never fan it out.
    if expand:
        for path in list(candidates):
            imports = index['nodes'][path]['imports']
            if len(imports) <= 12:
                for dependency in imports:
                    if dependency in index['nodes']:
                        add(dependency, 'Literal import of ' + path, 40)
    ordered = sorted(candidates.values(), key=lambda c: (-c['priority'], c['path']))
    used = 0
    contexts = []
    tokens = [s for _, s in symbols] + [k for _, _, hits in scored for k in hits]
    for candidate in ordered[:max_files]:
        text = (root / candidate['path']).read_text(encoding='utf-8')
        lines = text.splitlines()
        selected = [i for i, line in enumerate(lines) if any(matches(line, k) for k in tokens)]
        if not selected:
            selected = list(range(min(8, len(lines))))
        snippets = []
        room = min(1800, budget - used)
        for i in selected:
            if room <= 0:
                break
            excerpt = lines[i][:min(room, 600)]
            snippets.append({'line': i + 1, 'text': excerpt,
                             'truncated': len(excerpt) < len(lines[i])})
            room -= len(excerpt.encode('utf-8'))
        size = sum(len(x['text'].encode('utf-8')) for x in snippets)
        if used + size > budget or not snippets:
            continue
        used += size
        contexts.append({**candidate, 'sha256': index['nodes'][candidate['path']]['sha256'],
                         'excerpts': snippets, 'full_file_bytes': index['nodes'][candidate['path']]['bytes']})
    tests = sorted({t for m in selected_modules for t in m['tests']})
    dropped = [c['path'] for c in ordered if c['path'] not in {x['path'] for x in contexts}]
    return {'status': 'ok' if not dropped else 'budget_limited', 'task': task,
            'basis_commit': index['basis_commit'], 'source_fingerprint': index['source_fingerprint'],
            'modules': [m['id'] for m in selected_modules], 'contexts': contexts,
            'excerpt_bytes': used, 'max_files': max_files, 'budget_bytes': budget,
            'deferred': dropped, 'test_suggestions': tests,
            'risks': [m['risk'] for m in selected_modules],
            'installer_order': index['core_installer_order'] if any(m['id'] in ['combat', 'classes', 'gear', 'save'] for m in selected_modules) else [],
            'conflicts': ['Historical prose and code may disagree; runtime is descriptive authority, user-approved intent is change authority'],
            'not_loaded': ['history/', 'archives/', 'FUTURE_ONLY'],
            'limits': ['Discovery excerpts are incomplete; inspect functions and callers before editing',
                       'Graph uses literal imports, not a complete JS call/prototype analysis']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--task', required=True)
    parser.add_argument('--max-files', type=int, default=16)
    parser.add_argument('--budget', type=int, default=24000, help='UTF-8 excerpt bytes')
    parser.add_argument('--expand', action='store_true')
    args = parser.parse_args()
    if args.max_files < 1 or args.budget < 128:
        parser.error('Use at least one file and 128 bytes')
    import json
    result = route(args.task, args.max_files, args.budget, args.expand)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result['status'] in ['ok', 'budget_limited'] else 2


if __name__ == '__main__':
    raise SystemExit(main())
