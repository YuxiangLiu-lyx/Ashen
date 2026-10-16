"""Recover observed macOS stale reads by replacing identical bytes, never test inputs.
Only archived task/evidence files, with their existing hashes preserved.
"""
import hashlib,json,os,stat,subprocess,tempfile,time
from pathlib import Path
root=Path.cwd();pid='28300';seen={};done=set();rows=[];out=root/'docs/c2-optimization/READ_RECOVERY.json'
for _ in range(90):
 r=subprocess.run(['lsof','-Fn','-a','-p',pid,'-d','3,4'],capture_output=True,text=True)
 if r.returncode:break
 for line in r.stdout.splitlines():
  if not line.startswith('n'):continue
  p=Path(line[1:])
  if not p.is_relative_to(root):continue
  rel=str(p.relative_to(root))
  if not (rel.startswith('source/tasks/archive/')or rel.startswith('docs/harness/evidence/'))or 'c2-optimization-20261016' in rel or 'c1-endurance-20261016'in rel:continue
  seen[rel]=seen.get(rel,0)+1
  if seen[rel]<4 or rel in done:continue
  raw=p.read_bytes();before=hashlib.sha256(raw).hexdigest();mode=stat.S_IMODE(p.stat().st_mode)
  with tempfile.NamedTemporaryFile(dir=p.parent,delete=False)as f:f.write(raw);tmp=f.name
  os.chmod(tmp,mode);os.replace(tmp,p);assert hashlib.sha256(p.read_bytes()).hexdigest()==before
  rows.append({'path':rel,'bytes':len(raw),'before_and_after_sha256':before});done.add(rel);out.write_text(json.dumps(rows,indent=2)+'\n');print(rel,flush=True)
 time.sleep(2)
