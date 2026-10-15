import json,os,subprocess
from pathlib import Path
out=Path('docs/c1-dialogue-voice/package');out.mkdir(exist_ok=True)
env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}
steps=[]
for name,cmd in [('build',['.venv/bin/python','tools/build_web_play.py','--output','qa-export/c1-dialogue-voice-preview']),('browser',['.venv/bin/python','tests/browser-web-play.py','--build','qa-export/c1-dialogue-voice-preview','--out',str(out)])]:
 with (out/(name+'.txt')).open('w')as f:
  try:code=subprocess.run(cmd,env=env,stdout=f,stderr=subprocess.STDOUT,timeout=600).returncode
  except subprocess.TimeoutExpired:code=124
 steps.append({'name':name,'command':cmd,'exit_code':code});print(name,code,flush=True)
 if code:break
(out/'RESULTS.json').write_text(json.dumps(steps,indent=2)+'\n');raise SystemExit(len(steps)!=2 or any(s['exit_code']for s in steps))
