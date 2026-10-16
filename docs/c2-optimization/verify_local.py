"""Verify that the existing 5174 development server serves every current module."""
import concurrent.futures,json,sys,urllib.request,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[2];sys.path.insert(0,str(root/'tools'))
from web_runtime import prepare_module
def check(p):
 with urllib.request.urlopen('http://127.0.0.1:5174/'+p.name,timeout=30) as r:body=r.read();cache=r.headers.get('Cache-Control')
 expected=(prepare_module(p.name,p.read_text()).encode() if p.suffix=='.js' else p.read_bytes())
 assert body==expected,p.name;assert cache=='no-store',p.name
 return {'file':p.name,'sha256':hashlib.sha256(body).hexdigest(),'cache':cache}
files=sorted([* (root/'dist').glob('*.js'),*(root/'dist').glob('*.css')])
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:rows=list(pool.map(check,files))
asset=root/'dist/assets/c1-character-flow/merchant.png'
with urllib.request.urlopen('http://127.0.0.1:5174/assets/c1-character-flow/merchant.png',timeout=30) as r:assert r.read()==asset.read_bytes()
out={'merchant_asset_sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'status':'passed','url':'http://127.0.0.1:5174/','modules':sum(p.suffix=='.js' for p in files),'styles':sum(p.suffix=='.css' for p in files),'rows':rows}
(root/'docs/c2-optimization/LOCAL_SERVER.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:v for k,v in out.items() if k!='rows'}))
