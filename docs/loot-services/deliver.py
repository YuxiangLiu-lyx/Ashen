import hashlib,json,shutil,urllib.request
from pathlib import Path
import sys
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'tools'));from web_runtime import prepare_module
source=root/'qa-export/loot-services-preview';target=root/'qa-export/release-build';old=root/'qa-export/release-build-before-loot-services-20261019'
manifest=json.loads((source/'WEB_BUILD_MANIFEST.json').read_text());qa=json.loads((root/'docs/loot-services/package/WEB_QA.json').read_text());assert qa['passed']
if not old.exists():target.rename(old)
shutil.copytree(source,target,dirs_exist_ok=True)
files=[]
for p in source.rglob('*'):
 if not p.is_file():continue
 q=target/p.relative_to(source);assert q.is_file();digest=hashlib.sha256(p.read_bytes()).hexdigest();assert digest==hashlib.sha256(q.read_bytes()).hexdigest();files.append({'path':str(p.relative_to(source)),'sha256':digest})
(root/'docs/loot-services/DEFAULT_BUILD.json').write_text(json.dumps({'status':'verified-default','current':str(target.relative_to(root)),'preserved':str(old.relative_to(root)),'files':len(files),'manifest':manifest},ensure_ascii=False,indent=2)+'\n')
rows=[]
for p in sorted((root/'dist').glob('*')):
 if p.suffix not in ['.js','.css']:continue
 expected=prepare_module(p.name,p.read_text()).encode() if p.suffix=='.js' else p.read_bytes()
 with urllib.request.urlopen('http://127.0.0.1:5174/'+p.name,timeout=30) as r:actual=r.read();cache=r.headers.get('Cache-Control')
 assert actual==expected,p.name
 rows.append({'file':p.name,'sha256':hashlib.sha256(actual).hexdigest(),'cache':cache})
for rel in [str(p.relative_to(root/'dist')) for p in (root/'dist/assets/loot-services').glob('*.png')]:
 data=urllib.request.urlopen('http://127.0.0.1:5174/'+rel,timeout=30).read();assert data==(root/'dist'/rel).read_bytes();rows.append({'file':rel,'sha256':hashlib.sha256(data).hexdigest()})
(root/'docs/loot-services/LOCAL_SERVER.json').write_text(json.dumps({'status':'passed','url':'http://127.0.0.1:5174/','rows':rows},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'default_files':len(files),'local_server_files':len(rows),'preserved':str(old)}))
