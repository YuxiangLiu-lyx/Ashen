#!/usr/bin/env python3
"""Build an online static site and a self-contained offline HTML from Ashen dist.
No runtime libraries/CDNs. Original code/art remains untouched in dist/archives.
Run after restore_archives.py; Pillow is the only build-time dependency.
"""
from __future__ import annotations
import argparse, base64, concurrent.futures, hashlib, io, json, re, shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHA = lambda b: hashlib.sha256(b).hexdigest()

def require_replace(source: str, old: str, new: str) -> str:
    if source.count(old) != 1:
        raise ValueError(f'Expected one build hook, found {source.count(old)}: {old[:90]}')
    return source.replace(old, new, 1)

def source_modules(dist: Path) -> dict[str, str]:
    modules = {p.name: p.read_text(encoding='utf-8') for p in sorted(dist.glob('*.js'))}
    v = modules['visuals-v14.js']
    v = require_replace(v, ' async load(name,url,cols=1,rows=1,key=false){',
        " async load(...args){return globalThis.__ASHEN_WEB__.run(async()=>{args[1]=globalThis.__ASHEN_WEB__.asset(args[1]);try{await this.loadWebOriginal(...args);globalThis.__ASHEN_WEB__.done();}catch(error){throw new Error('素材 '+args[0]+' 未能加载：'+error.message);}});}\n async loadWebOriginal(name,url,cols=1,rows=1,key=false){")
    modules['visuals-v14.js'] = v
    modules['story-illustrations-v19.js'] = modules['story-illustrations-v19.js'].replace('art.src', 'globalThis.__ASHEN_WEB__.asset(art.src)')
    g = modules['game-v14.js']
    g = require_replace(g, 'const rs=await Promise.allSettled([', 'const pendingLoads=[')
    g = require_replace(g, "]);if(rs.some(r=>r.status==='rejected'))", "];globalThis.__ASHEN_WEB__.begin(pendingLoads.length);const rs=await Promise.allSettled(pendingLoads);if(rs.some(r=>r.status==='rejected'))")
    g = require_replace(g, "toast('有场景未能载入，请刷新重试。');return;", "throw new Error(rs.filter(r=>r.status==='rejected').map(r=>r.reason?.message||String(r.reason)).join('\\n'));")
    g = require_replace(g, 'warmPaintedFX(bank);assetsReady=true;', 'warmPaintedFX(bank);assetsReady=true;globalThis.__ASHEN_WEB__.finish();')
    g = require_replace(g, 'init();requestAnimationFrame(loop);', 'init().catch(error=>globalThis.__ASHEN_WEB__.fail(error));requestAnimationFrame(loop);')
    g = require_replace(g, 'async function shareGame(){const url=', "async function shareGame(){if(location.protocol==='file:'){toast('这是离线试玩网页。请直接分享下载的 HTML 文件。');return;}const url=")
    modules['game-v14.js'] = g
    return modules

def encode_asset(p: Path, dist: Path, cache: Path) -> tuple[str, bytes, str, dict]:
    rel = p.relative_to(dist).as_posix(); raw = p.read_bytes(); digest = SHA(raw)
    # Lossless atlas compression preserves all frame pixels, keyed colors and alpha.
    # Existing standalone story paintings may use high quality WebP; no resizing.
    painting = rel.startswith('assets/v23-reconstruction/') or rel.startswith('assets/v24/v24-') or rel in {'assets/keyart.png','assets/v24/stars-looking.png'}
    mode = 'q94' if painting else 'lossless'
    cached = cache / f'{digest}-{mode}.webp'
    image = Image.open(io.BytesIO(raw)); dimensions = list(image.size)
    if p.suffix.lower() == '.webp':
        encoded = raw; mode = 'original-webp'
    elif cached.exists():
        encoded = cached.read_bytes()
    else:
        out = io.BytesIO()
        image.save(out, 'WEBP', lossless=not painting, quality=94, method=2)
        encoded = out.getvalue(); cached.write_bytes(encoded)
    output = str(Path(rel).with_suffix('.webp'))
    record = {'original':rel,'original_sha256':digest,'web_path':output,'web_sha256':SHA(encoded),'dimensions':dimensions,'encoding':mode,'original_bytes':len(raw),'web_bytes':len(encoded)}
    return rel, encoded, output, record

def build(output: Path, workers: int = 4) -> dict:
    dist = ROOT / 'dist'; output.mkdir(parents=True,exist_ok=True)
    site = output / 'site'; site.mkdir(exist_ok=True)
    cache = output / 'asset-cache'; cache.mkdir(exist_ok=True)
    modules = source_modules(dist)
    template = (ROOT / 'web/launcher.html').read_text(encoding='utf-8')
    styles = re.findall(r'href="([^"]+\.css)"', (dist/'index.html').read_text())
    css = '\n'.join((dist/name).read_text(encoding='utf-8') for name in styles)
    # C8 CGs deliberately disabled in V28.1 stay only in the preserved originals.
    assets = sorted(p for p in (dist/'assets').rglob('*') if p.is_file() and p.suffix.lower() in {'.png','.webp','.jpg','.jpeg'} and not (p.parent.name=='v26' and p.name.startswith('c8-')))
    mapping, embedded, manifest = {}, {}, []
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
        for n,(rel,data,web_path,record) in enumerate(pool.map(lambda p: encode_asset(p,dist,cache), assets),1):
            target=site/web_path;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
            mapping[rel]=web_path;embedded[rel]={'mime':'image/webp','data':base64.b64encode(data).decode('ascii')};manifest.append(record)
            if n%20==0: print(f'Assets prepared: {n}/{len(assets)}',flush=True)
    for name,code in modules.items():
        # Hosted atlases may redirect to an image CDN; request CORS permission
        # before assigning src so legitimate pixel reads remain origin-clean.
        # This changes online output only. Offline Blob images stay unchanged.
        if name == 'visuals-v14.js':
            code = require_replace(code, 'im.src=url;await im.decode();', "im.crossOrigin='anonymous';im.src=url;await im.decode();")
        (site/name).write_text(code,encoding='utf-8')
    css_online=re.sub(r'''url\((['"]?)(assets/[^)'"\s]+)\1\)''',lambda m:'url("'+mapping.get(m[2],m[2])+'")',css)
    (site/'play.css').write_text(css_online,encoding='utf-8')
    (site/'asset-map.js').write_text('window.__ASHEN_WEB__.mapping='+json.dumps(mapping,ensure_ascii=False)+';\n',encoding='utf-8')
    online_payload='<script src="asset-map.js"></script><script type="module">import("./game-v14.js").catch(error=>window.__ASHEN_WEB__.fail(error));</script>'
    (site/'index.html').write_text(template.replace('<!--GAME_STYLES-->','<link rel="stylesheet" href="play.css">').replace('<!--GAME_PAYLOAD-->',online_payload),encoding='utf-8')
    (site/'.nojekyll').write_text('')
    (site/'BUILD.json').write_text(json.dumps({'game_version':'28.1','format':'web-play','source_commit':'74365109dd289c1f6ce09890e69a7873868c902e','modules':len(modules),'images':len(assets)},indent=2)+'\n')
    # Import maps allow genuine ES modules (including circular/live bindings) from
    # Blob URLs, without fetch(), eval(), a local server, or an external bundler.
    for name,code in list(modules.items()):
        modules[name]=re.sub(r'''((?:from\s*|import\s*\(\s*|import\s*)['"])\./([^'"]+)(['"])''',lambda m:m[1]+'@ashen/'+m[2]+m[3],code)
    data_json=json.dumps({'modules':modules,'assets':embedded,'css':css},ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
    bootstrap=r'''<script type="application/json" id="ashen-packed">PACKED_DATA</script>
<script>
(async()=>{try{
 const packed=document.getElementById('ashen-packed'),data=JSON.parse(packed.textContent);packed.remove();
 const app=window.__ASHEN_WEB__;app.assets=data.assets;app.offline=true;
 const style=document.createElement('style');style.textContent=data.css.replace(/url\((['"]?)(assets\/[^)'"\s]+)\1\)/g,(_,q,p)=>'url("'+app.asset(p)+'")');document.head.appendChild(style);
 const imports={};for(const[name,code]of Object.entries(data.modules)){imports['@ashen/'+name]=URL.createObjectURL(new Blob([code],{type:'text/javascript'}));}
 const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports});document.head.appendChild(map);
 await import('@ashen/game-v14.js');
}catch(error){window.__ASHEN_WEB__.fail(error);}})();
</script>'''.replace('PACKED_DATA',data_json)
    offline=output/'Ashen-V28.1-Play.html'
    offline.write_text(template.replace('<!--GAME_STYLES-->','').replace('<!--GAME_PAYLOAD-->',bootstrap),encoding='utf-8')
    report={'version':'28.1','source_commit':'74365109dd289c1f6ce09890e69a7873868c902e','module_count':len(modules),'image_count':len(assets),'original_images_bytes':sum(x['original_bytes'] for x in manifest),'web_images_bytes':sum(x['web_bytes'] for x in manifest),'offline_html_bytes':offline.stat().st_size,'offline_sha256':SHA(offline.read_bytes()),'original_dist_modified':False,'assets':manifest}
    (output/'WEB_BUILD_MANIFEST.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k!='assets'},ensure_ascii=False,indent=2),flush=True)
    return report

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',type=Path,default=ROOT/'web-build');parser.add_argument('--workers',type=int,default=4)
    args=parser.parse_args();build(args.output.resolve(),args.workers)
