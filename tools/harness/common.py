"""Small shared repository primitives. No network, dependencies, or import side effects."""
import hashlib
import json
import os
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG = 'source/harness/modules.json'
INDEX = 'source/harness/index.json'


def read_json(path, root=ROOT):
    return json.loads((root / path).read_text(encoding='utf-8'))


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=path.parent,
                                         suffix='.harness-tmp', delete=False) as handle:
            temporary = Path(handle.name)
            handle.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def git(*args, root=ROOT):
    return subprocess.check_output(['git', *args], cwd=root, text=True).strip()


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def inventory(root=ROOT):
    """Versioned discovery inputs; excludes generated index, receipts and task records."""
    files = set()
    for pattern in ['dist/*.js', 'dist/*.css', 'dist/*.html', 'tools/**/*.py',
                    'tools/**/*.mjs', 'tests/**/*.py', 'tests/**/*.mjs', 'tests/fixtures/*.json',
                    '.agents/skills/*/SKILL.md', '.github/workflows/*.yml',
                    'docs/harness/*.md', 'docs/balance-lab/*.md', 'source/harness/modules.json',
                    'AGENTS.md', 'NEXT_SESSION_PROMPT.md', 'source/README.md', 'source/GLOBAL_PROMPT.md']:
        files.update(p for p in root.glob(pattern) if p.is_file())
    # Explicit current rule references, never automatically ingest historical archives.
    for pattern in ['package.json', 'requirements-qa*.txt', 'tools/balance_lab/examples/*.json']:
        files.update(p for p in root.glob(pattern) if p.is_file())
    if (root / CONFIG).is_file():
        for module in read_json(CONFIG, root)['modules']:
            files.update(root / p for p in module['rules'] if (root / p).is_file())
    return {p.relative_to(root).as_posix(): digest(p) for p in sorted(files)}


def fingerprint(files):
    return hashlib.sha256(json.dumps(files, sort_keys=True).encode()).hexdigest()
