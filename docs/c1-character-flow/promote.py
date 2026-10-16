"""Promote the verified local package, preserving the complete previous build."""
import hashlib,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[2]
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
assert json.loads((root/'docs/c1-character-flow/package/WEB_QA.json').read_text())['passed']
preview=root/'qa-export/c1-character-flow-preview';current=root/'qa-export/release-build';old=root/'qa-export/release-build-before-character-flow-20261016'
manifest=json.loads((preview/'WEB_BUILD_MANIFEST.json').read_text())
inputs={p.name:sha(p) for p in sorted((root/'dist').glob('*')) if p.suffix in {'.js','.css','.html'}}
for a in manifest['assets']:
 assert sha(root/'dist'/a['original'])==a['original_sha256'];inputs[a['original']]=a['original_sha256']
assert hashlib.sha256(json.dumps(inputs,sort_keys=True).encode()).hexdigest()==manifest['runtime_input_sha256']
assert sha(preview/manifest['offline_filename'])==manifest['offline_sha256']
assert not old.exists(),'Preserve existing archive; choose a new name instead'
current.rename(old);preview.rename(current)
assert sha(current/manifest['offline_filename'])==manifest['offline_sha256']
receipt={'status':'verified-default','current':str(current.relative_to(root)),'preserved':str(old.relative_to(root)),'manifest':manifest,'runtime_basis':'uncommitted working tree; all input bytes verified; Git receipt recorded separately','verification':'All JS/CSS/HTML and all bundled original images match build input fingerprint; offline bytes unchanged by promotion. Build input matches the current verified working tree.','website_published':False}
(root/'docs/c1-character-flow/DEFAULT_BUILD.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in receipt.items() if k!='manifest'},ensure_ascii=False))
