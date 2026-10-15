"""Byte-verified archive of repeated integration outputs; --pack is for this delivery."""
from pathlib import Path,PurePosixPath
import argparse,tarfile,tempfile,hashlib,json,shutil
ROOT=Path(__file__).resolve().parents[2];FOLDER=ROOT/'archives/c1-trial-forge-evidence';MANIFEST=FOLDER/'manifest.json'
PREFIXES=['docs/c1-trial-forge/integration','docs/c1-trial-forge/economy']
def digest(p):
 h=hashlib.sha256()
 with p.open('rb')as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def verify(archive,manifest,restore=False):
 expected={r['path']:r for r in manifest['members']}
 with tarfile.open(archive,'r:gz')as t:
  members=t.getmembers();assert set(m.name for m in members)==set(expected)
  for m in members:
   rel=PurePosixPath(m.name);assert m.isfile() and not rel.is_absolute() and '..'not in rel.parts and any(m.name.startswith(p+'/')for p in PREFIXES)
   r=expected[m.name];stream=t.extractfile(m);h=hashlib.sha256();size=0;target=ROOT/m.name;handle=None
   if restore and target.exists():assert digest(target)==r['sha256'],'Existing changed file: '+m.name
   elif restore:target.parent.mkdir(parents=True,exist_ok=True);handle=target.open('wb')
   try:
    for b in iter(lambda:stream.read(1024*1024),b''):
     h.update(b);size+=len(b)
     if handle:handle.write(b)
   finally:
    stream.close()
    if handle:handle.close()
   assert size==r['bytes'] and h.hexdigest()==r['sha256'],m.name
args=argparse.ArgumentParser();args.add_argument('--pack',action='store_true');args.add_argument('--verify-only',action='store_true');a=args.parse_args()
with tempfile.TemporaryDirectory(prefix='ashen-rpg-evidence-')as tmp:
 arc=Path(tmp)/'evidence.tar.gz'
 if a.pack:
  assert not MANIFEST.exists(),'Archive already exists; preserve it'
  files=sorted(p for prefix in PREFIXES for p in (ROOT/prefix).rglob('*')if p.is_file() and p.suffix=='.json');assert files
  records=[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':digest(p)}for p in files]
  with tarfile.open(arc,'w:gz',compresslevel=6)as t:
   for p in files:t.add(p,arcname=p.relative_to(ROOT).as_posix(),recursive=False)
  spec={'schema':1,'description':'Original large integration JSON snapshots; screenshots, logs and key acceptance remain directly tracked. Restore exact bytes with docs/c1-trial-forge/RESTORE_EVIDENCE.py.','prefixes':PREFIXES,'members':records,'archive_sha256':digest(arc),'parts':[]}
  verify(arc,spec);FOLDER.mkdir(parents=True,exist_ok=True)
  with arc.open('rb')as f:
   n=0
   for b in iter(lambda:f.read(30*1024*1024),b''):
    n+=1;p=FOLDER/f'evidence.tar.gz.part{n:03}';p.write_bytes(b);spec['parts'].append({'path':p.relative_to(ROOT).as_posix(),'bytes':len(b),'sha256':digest(p)})
  MANIFEST.write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
 else:
  spec=json.loads(MANIFEST.read_text())
  with arc.open('wb')as f:
   for r in spec['parts']:
    p=ROOT/r['path'];assert p.stat().st_size==r['bytes'] and digest(p)==r['sha256']
    with p.open('rb')as s:shutil.copyfileobj(s,f)
  assert digest(arc)==spec['archive_sha256'];verify(arc,spec,not a.verify_only)
 print(json.dumps({'verified':True,'members':len(spec['members']),'original_bytes':sum(r['bytes']for r in spec['members']),'archive_bytes':sum(r['bytes']for r in spec['parts']),'restored':not a.pack and not a.verify_only},indent=2))
