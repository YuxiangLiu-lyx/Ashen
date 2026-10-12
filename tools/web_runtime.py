"""Shared in-memory loading hooks for local HTTP and packaged play. Stdlib only."""
from pathlib import Path


def require_replace(source: str, old: str, new: str) -> str:
    if source.count(old) != 1:
        raise ValueError(f'Expected one build hook, found {source.count(old)}: {old[:90]}')
    return source.replace(old, new, 1)


def prepare_module(name: str, source: str) -> str:
    """Keep gameplay intact; use the launcher's queue, progress and failure UI."""
    if name == 'visuals-v14.js':
        return require_replace(source, ' async load(name,url,cols=1,rows=1,key=false){',
            " async load(...args){return globalThis.__ASHEN_WEB__.run(async()=>{args[1]=globalThis.__ASHEN_WEB__.asset(args[1]);try{await this.loadWebOriginal(...args);globalThis.__ASHEN_WEB__.done();}catch(error){throw new Error('素材 '+args[0]+' 未能加载：'+error.message);}});}\n async loadWebOriginal(name,url,cols=1,rows=1,key=false){")
    if name == 'story-illustrations-v19.js':
        return source.replace('art.src', 'globalThis.__ASHEN_WEB__.asset(art.src)')
    if name != 'game-v14.js':
        return source
    source = require_replace(source, 'const rs=await Promise.allSettled([', 'const pendingLoads=[')
    source = require_replace(source, "]);if(rs.some(r=>r.status==='rejected'))", "];globalThis.__ASHEN_WEB__.begin(pendingLoads.length);const rs=await Promise.allSettled(pendingLoads);if(rs.some(r=>r.status==='rejected'))")
    source = require_replace(source, "toast('有场景未能载入，请刷新重试。');return;", "throw new Error(rs.filter(r=>r.status==='rejected').map(r=>r.reason?.message||String(r.reason)).join('\\n'));")
    source = require_replace(source, 'warmPaintedFX(bank);assetsReady=true;', 'warmPaintedFX(bank);assetsReady=true;globalThis.__ASHEN_WEB__.finish();')
    source = require_replace(source, 'init();requestAnimationFrame(loop);', 'init().catch(error=>globalThis.__ASHEN_WEB__.fail(error));requestAnimationFrame(loop);')
    return require_replace(source, 'async function shareGame(){const url=', "async function shareGame(){if(location.protocol==='file:'){toast('这是离线试玩网页。请直接分享下载的 HTML 文件。');return;}const url=")


def source_modules(dist: Path) -> dict[str, str]:
    return {p.name: prepare_module(p.name, p.read_text(encoding='utf-8'))
            for p in sorted(dist.glob('*.js'))}
