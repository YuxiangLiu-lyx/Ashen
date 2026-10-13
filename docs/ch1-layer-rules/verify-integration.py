"""Continue failed integration; reuse separately passed package/local with exact inputs."""
from pathlib import Path
import json,hashlib,subprocess,time
out=Path('docs/ch1-layer-rules/final-verification')
prior=json.loads((out/'RESULTS.json').read_text())
assert {r['name']:r['exit_code'] for r in prior}=={'integration':1,'package':0,'local':0}
(out/'RESULTS-attempt-010.json').write_text(json.dumps(prior,indent=2)+'\n')
m=json.loads(Path('qa-export/c1-layer-rules-preview/WEB_BUILD_MANIFEST.json').read_text())
subprocess.run(['git','diff','--exit-code',m['source_commit'],'--','dist','web','tools/build_web_play.py','tools/web_runtime.py'],check=True)
start=time.time();rows=[];code=0
with (out/'integration-final.log').open('w') as f:
 for cmd in [['python3','tools/harness/check.py','--tier','integration'],['node','docs/ch1-layer-rules/audit-saves.mjs'],['python3','tools/restore_archives.py','--all','--verify-only']]:
  f.write('RUN '+repr(cmd)+'\n');f.flush();code=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT).returncode;rows.append({'command':cmd,'exit_code':code})
  if code:break
result={'name':'integration','commands':rows,'exit_code':code,'seconds':time.time()-start,'log':str(out/'integration-final.log')}
(out/'integration-final.json').write_text(json.dumps(result,indent=2)+'\n')
final=[result]+[r for r in prior if r['name']!='integration']
(out/'RESULTS.json').write_text(json.dumps(final,indent=2)+'\n')
print(json.dumps(final,indent=2));raise SystemExit(code)
