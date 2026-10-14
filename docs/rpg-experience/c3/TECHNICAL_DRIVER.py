import os,subprocess,json
from pathlib import Path
env=dict(os.environ,ASHEN_INTEGRATION_OUTPUT='docs/rpg-experience/c3/integration-final',CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
subprocess.run(['python3','docs/rpg-experience/c1/INTEGRATION_DRIVER.py'],env=env,check=True)
p=Path('qa-export/rpg-c3-preview');p.mkdir(exist_ok=True)
cache=p/'asset-cache'
if not cache.exists():cache.symlink_to(Path('qa-export/rpg-c1-preview/asset-cache').resolve(),target_is_directory=True)
subprocess.run(['.venv/bin/python','tools/build_web_play.py','--output',str(p)],env=env,check=True)
subprocess.run(['.venv/bin/python','tests/browser-web-play.py','--build',str(p),'--out','docs/rpg-experience/c3/package-ui'],env=env,check=True)
m=json.loads((p/'WEB_BUILD_MANIFEST.json').read_text());Path('docs/rpg-experience/c3/WEB_BUILD_MANIFEST.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
Path('docs/rpg-experience/c3/BUILD.json').write_text((p/'BUILD.json').read_text())
