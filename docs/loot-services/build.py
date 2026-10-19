from pathlib import Path
import subprocess,sys,json,time,hashlib,os
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'docs/loot-services/package';OUT.mkdir(exist_ok=True)
os.environ.setdefault('CHROME_BIN','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
rows=[]
checks=[('build',['.venv/bin/python','tools/build_web_play.py','--output','qa-export/loot-services-preview']),('browser',['.venv/bin/python','tests/browser-web-play.py','--build','qa-export/loot-services-preview','--out','docs/loot-services/package']),('original-archives',[sys.executable,'tools/restore_archives.py','--all','--verify-only'])]
if '--reuse-build' in sys.argv:checks=checks[1:]
for name,cmd in checks:
 p=OUT/(name+'.txt');start=time.time()
 with p.open('w')as f:
  try:code=subprocess.run(cmd,cwd=ROOT,stdout=f,stderr=subprocess.STDOUT,timeout=500).returncode
  except subprocess.TimeoutExpired:code=124
 rows.append({'name':name,'command':cmd,'exit_code':code,'seconds':round(time.time()-start,2),'output':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()});print(json.dumps(rows[-1]),flush=True)
 if code:break
(OUT/'CHECKS.json').write_text(json.dumps(rows,indent=2)+'\n');sys.exit(rows[-1]['exit_code'])
