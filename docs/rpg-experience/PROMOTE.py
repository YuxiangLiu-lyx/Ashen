from pathlib import Path
import shutil,json,hashlib,subprocess,os
root=Path.cwd();candidate=root/'qa-export/rpg-c3-final-preview';target=root/'qa-export/release-build';backup=root/'qa-export/release-build-before-rpg-three-20261014'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((candidate/'WEB_BUILD_MANIFEST.json').read_text());assert sha(candidate/'Ashen-V28.1-Play.html')==m['offline_sha256']
if not backup.exists():
 assert target.exists();target.rename(backup)
if not target.exists():shutil.copytree(candidate,target,symlinks=True)
assert sha(target/'Ashen-V28.1-Play.html')==m['offline_sha256']
env=dict(os.environ,CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
subprocess.run(['.venv/bin/python','tests/browser-web-play.py','--build',str(target),'--out','docs/rpg-experience/default-package'],check=True,env=env)
Path('docs/rpg-experience/DEFAULT_BUILD.json').write_text(json.dumps({'current':str(target.relative_to(root)),'preserved':str(backup.relative_to(root)),'manifest':m,'offline_sha256':sha(target/'Ashen-V28.1-Play.html'),'site_published':False},ensure_ascii=False,indent=2)+'\n')
