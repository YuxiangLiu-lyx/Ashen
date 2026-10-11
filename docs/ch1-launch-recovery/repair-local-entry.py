"""Promote the already verified local package without rebuilding or deleting history."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
source=ROOT/'qa-export/dialogue-release-build'
target=ROOT/'qa-export/release-build'
backup=ROOT/'qa-export/release-build-before-dialogue-20261011'
manifest=json.loads((source/'WEB_BUILD_MANIFEST.json').read_text())
inputs={p.name:sha(p) for p in sorted((ROOT/'dist').glob('*')) if p.suffix in {'.js','.css','.html'}}
for asset in manifest['assets']:
    original=ROOT/'dist'/asset['original']
    assert sha(original)==asset['original_sha256'],original
    assert sha(source/'site'/asset['web_path'])==asset['web_sha256'],asset['web_path']
    inputs[asset['original']]=asset['original_sha256']
assert hashlib.sha256(json.dumps(inputs,sort_keys=True).encode()).hexdigest()==manifest['runtime_input_sha256']
assert sha(source/manifest['offline_filename'])==manifest['offline_sha256']
assert (source/'site/chapter-one-dialogues-v31.js').exists()
assert not (source/'site/chapter-one-cinematic-v31.js').exists()
assert 'data-act="c1-replay"' not in (source/'site/game-v14.js').read_text()
if not source.is_symlink():
    assert not backup.exists(),'Backup already exists: inspect before replacing anything'
    target.rename(backup)
    source.rename(target)
    source.symlink_to('release-build',target_is_directory=True)
assert source.resolve()==target.resolve()
assert (backup/'site/chapter-one-cinematic-v31.js').is_file()
result={'status':'promoted','current_path':str(target.relative_to(ROOT)),'compatible_alias':str(source.relative_to(ROOT)),
        'preserved_old_build':str(backup.relative_to(ROOT)),'runtime_input_sha256':manifest['runtime_input_sha256'],
        'offline_sha256':sha(target/manifest['offline_filename']),'personal_saves_touched':False,'runtime_code_changed':False,
        'user_reported_entry':'not yet provided; this repairs the observed stale default package'}
(ROOT/'docs/ch1-launch-recovery/ENTRY.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
