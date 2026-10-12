"""Verify and promote the tested local package, retaining the previous build."""
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'docs/ch1-voice'
NEW = ROOT/'qa-export/voice-release-build'
LIVE = ROOT/'qa-export/release-build'
OLD = ROOT/'qa-export/release-build-before-voice-20261012'
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
current = json.loads((NEW/'WEB_BUILD_MANIFEST.json').read_text())
previous = json.loads((LIVE/'WEB_BUILD_MANIFEST.json').read_text())
qa = json.loads((OUT/'packaged/WEB_QA.json').read_text())
assert qa['passed'] and len(qa['results']) == 3
assert current['source_dirty'] is False
assert current['module_count'] == 200 and current['image_count'] == 129
assert current['offline_sha256'] == sha(NEW/current['offline_filename'])
runtime_inputs = {p.name:sha(p) for p in (ROOT/'dist').glob('*') if p.suffix in {'.js','.css','.html'}}
runtime_inputs.update({a['original']:sha(ROOT/'dist'/a['original']) for a in current['assets']})
assert hashlib.sha256(json.dumps(runtime_inputs, sort_keys=True).encode()).hexdigest() == current['runtime_input_sha256']
old_assets = {a['original']:a['original_sha256'] for a in previous['assets']}
new_assets = {a['original']:a['original_sha256'] for a in current['assets']}
assert all(new_assets[k] == value for k, value in old_assets.items())
assert set(new_assets)-set(old_assets) == {'assets/c1-voice/elyria-gentle.png'}
assert not OLD.exists()
shutil.copy2(NEW/'WEB_BUILD_MANIFEST.json', OUT/'WEB_BUILD_MANIFEST.json')
LIVE.rename(OLD)
NEW.rename(LIVE)
assert sha(LIVE/current['offline_filename']) == current['offline_sha256']
assert (ROOT/'qa-export/dialogue-release-build').resolve() == LIVE.resolve()
receipt = {'passed':True, 'source_commit':current['source_commit'],
    'source_dirty':False, 'runtime_inputs_verified':len(runtime_inputs),
    'original_packaged_assets_preserved':len(old_assets), 'new_asset':'assets/c1-voice/elyria-gentle.png',
    'default_package':str(LIVE.relative_to(ROOT)), 'previous_package':str(OLD.relative_to(ROOT)),
    'offline_sha256':current['offline_sha256'], 'qa':'docs/ch1-voice/packaged/WEB_QA.json',
    'site_deployed':False}
(OUT/'PACKAGE.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(receipt, ensure_ascii=False))
