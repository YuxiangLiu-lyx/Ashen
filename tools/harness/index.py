#!/usr/bin/env python3
"""Generate/check literal ES-module dependencies, symbols and installer order."""
import argparse
import re
import sys
from pathlib import PurePosixPath
from common import ROOT, CONFIG, INDEX, read_json, write_json, inventory, fingerprint, git

IMPORT = re.compile(r"(?:\b(?:import|export)\s+(?:[^;]*?\s+from\s*)?[\"']([^\"']+)[\"']|\bimport\s*\(\s*[\"']([^\"']+)[\"']\s*\))")


def javascript_code(text):
    """Ignore comments/embedded source templates, keep only import-specifier strings.

    This is a lexical discovery scanner, not a JS parser. Computed/template imports
    are deliberately unsupported and must be inspected in their runtime context.
    """
    output = []
    i = 0
    while i < len(text):
        if text.startswith('//', i):
            end = text.find('\n', i)
            end = len(text) if end < 0 else end
            output.append(' ' * (end - i))
            i = end
        elif text.startswith('/*', i):
            end = text.find('*/', i + 2)
            end = len(text) if end < 0 else end + 2
            output.append(re.sub(r'[^\n]', ' ', text[i:end]))
            i = end
        elif text[i] in "\"'`":
            quote = text[i]
            end = i + 1
            while end < len(text):
                if text[end] == '\\':
                    end += 2
                elif text[end] == quote:
                    end += 1
                    break
                else:
                    end += 1
            prefix = ''.join(output[-160:])[-160:]
            module_literal = quote != '`' and bool(re.search(r'\b(?:from|import)\s*$|\bimport\s*\(\s*$', prefix))
            output.append(text[i:end] if module_literal else re.sub(r'[^\n]', ' ', text[i:end]))
            i = end
        else:
            output.append(text[i])
            i += 1
    return ''.join(output)


def generate(root=ROOT):
    config = read_json(CONFIG, root)
    files = inventory(root)
    nodes = {}
    for name in files:
        text = (root / name).read_text(encoding='utf-8')
        dependencies = []
        if name.endswith(('.js', '.mjs')):
            scanned = javascript_code(text)
            for match in IMPORT.finditer(scanned):
                target = match.group(1) or match.group(2)
                if target.startswith('.'):
                    resolved = (root / name).parent.joinpath(target).resolve()
                    try:
                        dependencies.append(resolved.relative_to(root.resolve()).as_posix())
                    except ValueError:
                        dependencies.append('OUTSIDE_ROOT:' + target)
        nodes[name] = {
            'sha256': files[name], 'bytes': (root / name).stat().st_size,
            'imports': sorted(set(dependencies)),
            'symbols': sorted(set(re.findall(r'\b(?:function|class|const)\s+([A-Za-z_$][\w$]*)',
                                             scanned if name.endswith(('.js', '.mjs')) else text))),
            'modules': [m['id'] for m in config['modules']
                        if name in m['entries'] or any(PurePosixPath(name).match(p) for p in m['patterns'])],
        }
    core = (root / 'dist/core-v14.js').read_text(encoding='utf-8')
    installers = [{'name': m.group(1), 'line': core[:m.start()].count('\n') + 1}
                  for m in re.finditer(r'\b(install\w+)\(RPG\s*[,)]', core)]
    missing = sorted({d for n in nodes.values() for d in n['imports'] if not (root / d).is_file()})
    uncovered = [p for p, n in nodes.items() if p.startswith('dist/') and p.endswith('.js') and not n['modules']]
    return {'schema': 1, 'basis_commit': git('rev-parse', 'HEAD', root=root),
            'source_fingerprint': fingerprint(files), 'nodes': nodes,
            'core_installer_order': installers, 'missing_imports': missing,
            'unmapped_runtime': uncovered,
            'limits': ['Literal imports only; computed imports and prototype wrappers need code inspection',
                       'basis_commit identifies generation; content hashes decide freshness']}


def stale(index, root=ROOT):
    current = inventory(root)
    old = {p: n['sha256'] for p, n in index['nodes'].items()}
    return sorted(p for p in set(current) | set(old) if current.get(p) != old.get(p))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.check:
        if not (ROOT / INDEX).is_file():
            print('Missing index: run python3 tools/harness/index.py', file=sys.stderr)
            return 2
        result = read_json(INDEX)
        changed = stale(result)
        if changed:
            print('STALE index: ' + ', '.join(changed), file=sys.stderr)
            return 2
    else:
        result = generate()
        write_json(ROOT / INDEX, result)
    problems = result['missing_imports'] + result['unmapped_runtime']
    print(f"Indexed {len(result['nodes'])} files; {len(result['core_installer_order'])} core installers; problems: {problems}")
    return 1 if problems else 0


if __name__ == '__main__':
    raise SystemExit(main())
