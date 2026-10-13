"""Preserve the previous default build and promote the verified byte-identical preview."""
from pathlib import Path
import json,hashlib,shutil,subprocess
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
root=Path.cwd();preview=Path('qa-export/c1-story-world-preview');default=Path('qa-export/release-build');backup=Path('qa-export/release-build-before-story-world-20261013')
results=read('docs/ch1-story-world/final-verification/RESULTS.json');assert all(r['exit_code']==0 for r in results)
assert read('docs/ch1-story-world/local-5174/BROWSER_QA.json')['passed']
assert read('docs/ch1-story-world/package/WEB_QA.json')['passed']
m=read(preview/'WEB_BUILD_MANIFEST.json');old=read(default/'WEB_BUILD_MANIFEST.json')
assert not m['source_dirty'] and m['module_count']==213 and m['image_count']==140
subprocess.run(['git','diff','--exit-code',m['source_commit'],'--','dist','web','tools/build_web_play.py','tools/web_runtime.py'],check=True)
current={a['original']:a for a in m['assets']}
for a in old['assets']:
 assert current[a['original']]['original_sha256']==a['original_sha256']
 assert current[a['original']]['web_sha256']==a['web_sha256']
for a in m['assets']:
 assert sha(Path('dist')/a['original'])==a['original_sha256']
 assert sha(preview/'site'/a['web_path'])==a['web_sha256']
assert sha(preview/m['offline_filename'])==m['offline_sha256']
assert not backup.exists(), 'Never overwrite an earlier preserved build'
shutil.move(str(default),str(backup));shutil.copytree(preview,default)
files=[p.relative_to(preview) for p in preview.rglob('*') if p.is_file()]
assert set(files)=={p.relative_to(default) for p in default.rglob('*') if p.is_file()}
assert all(sha(preview/p)==sha(default/p) for p in files)
assert Path('qa-export/dialogue-release-build').resolve()==default.resolve()
out=Path('docs/ch1-story-world/package');out.mkdir(exist_ok=True)
shutil.copy2(preview/'WEB_BUILD_MANIFEST.json',out/'WEB_BUILD_MANIFEST.json')
report={'passed':True,'source_commit':m['source_commit'],'source_dirty':False,'runtime_modules':m['module_count'],'images':m['image_count'],'original_packaged_assets_preserved':len(old['assets']),'default_package':str(default),'previous_package':str(backup),'preview_package':str(preview),'offline_sha256':m['offline_sha256'],'runtime_input_sha256':m['runtime_input_sha256'],'all_packaged_files_byte_equal':True,'files_verified':len(files),'visual_review_22_images_and_controls':'passed','site_deployed':False}
Path('docs/ch1-story-world/PACKAGE.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
