"""Rebuild and exercise the local offline/HTTP package; never publish."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
env = os.environ.copy()
env.setdefault('CHROME_BIN', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
if '--ui-only' in sys.argv:
    report=json.loads((ROOT/'qa-export/dialogue-release-build/WEB_BUILD_MANIFEST.json').read_text())
    sha=lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
    inputs={p.name:sha(p) for p in sorted((ROOT/'dist').glob('*')) if p.suffix in {'.js','.css','.html'}}
    for asset in report['assets']:
        h=sha(ROOT/'dist'/asset['original']);assert h==asset['original_sha256'];inputs[asset['original']]=h
    assert hashlib.sha256(json.dumps(inputs,sort_keys=True).encode()).hexdigest()==report['runtime_input_sha256']
    assert sha(ROOT/'qa-export/dialogue-release-build'/report['offline_filename'])==report['offline_sha256']
    print('Reuse verified build from010: runtime/assets/offline artifact unchanged; retry only failed UI check',flush=True)
else:
    for command in [
        [sys.executable,'tools/restore_archives.py','--all','--verify-only'],
        [sys.executable,'tools/build_web_play.py','--output','qa-export/dialogue-release-build'],
    ]:
        print('RUN:', ' '.join(command),flush=True);subprocess.run(command,cwd=ROOT,env=env,check=True)
command=[sys.executable,'tests/browser-web-play.py','--build','qa-export/dialogue-release-build','--out','docs/ch1-dialogue-cleanup/packaged']
print('RUN:', ' '.join(command),flush=True);subprocess.run(command,cwd=ROOT,env=env,check=True)
report = json.loads((ROOT / 'qa-export/dialogue-release-build/WEB_BUILD_MANIFEST.json').read_text())
assert report['module_count'] == 199 and report['image_count'] == 128
print('Package counts:199 modules,128 images; four retired chapter-one CGs excluded', flush=True)
