"""Task acceptance: all dist bytes and fully installed dialogue equal the saved baseline."""
import hashlib
import json
from pathlib import Path
import subprocess

root=Path(__file__).resolve().parents[2]
folder=root/'docs/narrative-harness'
baseline=json.loads((folder/'BASELINE.json').read_text())
actual={p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()
        for p in sorted((root/'dist').rglob('*')) if p.is_file()}
changed=sorted(p for p in set(actual)|set(baseline['files']) if actual.get(p)!=baseline['files'].get(p))
run=subprocess.run(['node','tools/harness/narrative_runtime.mjs','--text'],cwd=root,capture_output=True,text=True,check=True,timeout=60)
installed=json.loads(run.stdout)
old=json.loads((folder/'RUNTIME_BASELINE.json').read_text())
before={**old['dialogues'],**old['hidden']}
after={id:s['text'] for id,s in installed['scenes'].items()}
dialogue_changed=sorted(id for id in set(before)|set(after) if before.get(id)!=after.get(id))
report={'status':'passed' if not changed and not dialogue_changed else 'failed',
        'baseline_commit':baseline['commit'],'dist_files':len(actual),'installed_scenes':len(after),
        'changed_dist':changed,'changed_dialogues':dialogue_changed,
        'scope':'Includes all runtime JS, HTML, CSS and assets. No personal browser saves accessed.',
        'limits':'Equality plus existing integration regressions; no new human pacing acceptance or website deployment.'}
(folder/'PRESERVATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
raise SystemExit(0 if report['status']=='passed' else 1)
