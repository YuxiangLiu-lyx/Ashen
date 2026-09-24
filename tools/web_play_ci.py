#!/usr/bin/env python3
"""Build/publish receipts for the existing Ashen game; never modify original dist."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, os, shutil, subprocess, sys, zlib

def git(*args, **kw):
    return subprocess.check_output(['git', *args], text=True, **kw).strip()

def replace(text, old, new):
    assert text.count(old)==1, 'Unexpected source before refinement: '+old[:80]
    return text.replace(old,new,1)

def prepare():
    folder=Path('tools/web-play-transfer')
    if not folder.exists():
        assert all(Path(p).is_file() for p in ['web/launcher.html','tools/build_web_play.py','tests/browser-web-play.py'])
        return
    packed=b''.join((folder/f'part{i:02}').read_bytes() for i in range(1,7))
    assert hashlib.sha256(packed).hexdigest()=='fb29119762d5228bda187f06c4a5a2f3d5c88f7085d0aba952e9fa523ca5639c'
    files=json.loads(zlib.decompress(packed))
    assert set(files)=={'web/launcher.html','tools/build_web_play.py','tests/browser-web-play.py'}
    for name,text in files.items():
        p=Path(name);assert not p.exists(),name
        if name=='web/launcher.html':
            text=replace(text,"window.__ASHEN_WEB__={version:'28.1',","window.__ASHEN_WEB__={queue:[],running:0,run(task){return new Promise((resolve,reject)=>{this.queue.push({task,resolve,reject});this.drain();});},drain(){while(this.running<4&&this.queue.length){const {task,resolve,reject}=this.queue.shift();this.running++;Promise.resolve().then(task).then(resolve,reject).finally(()=>{this.running--;this.drain();});}},version:'28.1',")
        elif name=='tools/build_web_play.py':
            text=replace(text," async load(...args){args[1]=globalThis.__ASHEN_WEB__.asset(args[1]);try{await this.loadWebOriginal(...args);globalThis.__ASHEN_WEB__.done();}catch(error){throw new Error('素材 '+args[0]+' 未能加载：'+error.message);}}"," async load(...args){return globalThis.__ASHEN_WEB__.run(async()=>{args[1]=globalThis.__ASHEN_WEB__.asset(args[1]);try{await this.loadWebOriginal(...args);globalThis.__ASHEN_WEB__.done();}catch(error){throw new Error('素材 '+args[0]+' 未能加载：'+error.message);}});}")
        else:
            text=replace(text,"localStorage.setItem('ashen-vow-rpg-v10',JSON.stringify(g.snapshot()));return e.id;","return {enemy_id:e.id,raw:JSON.stringify(g.snapshot())};")
            text=replace(text,'    enemy_id=page.evaluate(fixture,module)\n','    test_save=page.evaluate(fixture,module);enemy_id=test_save["enemy_id"]\n    # Import through the real UI; beforeunload autosave must remain enabled.\n    page.keyboard.press("Escape");page.locator(\'[data-act="import-save"]\').click()\n    page.locator("#saveTransfer").fill(test_save["raw"]);page.locator(\'[data-act="confirm-import"]\').click()\n    page.wait_for_timeout(500)\n')
            text=replace(text,"    assert '免伤' in page.locator('#ui').inner_text() or page.locator('.dialogue-card').count()>0", "    # The chapter begins with a walking cinematic, not immediate dialogue.\n    page.wait_for_function('document.querySelector(\".dialogue-card\") || document.querySelector(\"#ui\").textContent.includes(\"免伤\")',timeout=30000)\n    assert '免伤' in page.locator('#ui').inner_text() or page.locator('.dialogue-card').count()>0")
            text=replace(text,'    context.close();return result',"    print(json.dumps(result,ensure_ascii=False),flush=True)\n    context.close();return result")
        p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8')
    print('Materialized exact builder, launcher and refined UI tests')

def publish():
    qa=json.loads(Path('qa-export/web-play/WEB_QA.json').read_text());assert qa['passed']
    ref='refs/heads/web-play';parent=None
    if git('ls-remote','origin',ref):
        subprocess.run(['git','fetch','origin',ref],check=True);parent=git('rev-parse','FETCH_HEAD')
        assert 'BUILD.json' in git('ls-tree','-r','--name-only',parent).splitlines()
    env=os.environ.copy();env['GIT_INDEX_FILE']=str(Path('/tmp/ashen-web-index').resolve())
    subprocess.run(['git','read-tree','--empty'],check=True,env=env)
    rows=[]
    for p in sorted(Path('web-build/site').rglob('*')):
        if p.is_file():rows.append('100644 '+git('hash-object','-w',str(p))+'\t'+p.relative_to('web-build/site').as_posix()+'\0')
    subprocess.run(['git','update-index','-z','--index-info'],input=''.join(rows),text=True,env=env,check=True)
    tree=git('write-tree',env=env)
    env.update(GIT_AUTHOR_NAME='Tourist',GIT_AUTHOR_EMAIL='138776726+YuxiangLiu-lyx@users.noreply.github.com',GIT_COMMITTER_NAME='Tourist',GIT_COMMITTER_EMAIL='138776726+YuxiangLiu-lyx@users.noreply.github.com')
    sha=git('commit-tree',tree,'-m','build: publish tested V28.1 playable website',*(['-p',parent] if parent else []),env=env)
    subprocess.run(['git','push','origin',sha+':'+ref],check=True)
    assert git('ls-remote','origin',ref).split()[0]==sha
    url=f'https://rawcdn.githack.com/YuxiangLiu-lyx/Ashen/{sha}/index.html'
    Path('qa-export/PUBLIC_URL.txt').write_text(url+'\n');Path('qa-export/WEB_COMMIT.txt').write_text(sha+'\n')
    with open(os.environ['GITHUB_OUTPUT'],'a') as f:f.write('url='+url+'\nsha='+sha+'\n')
    print(url)

def record():
    folder=Path('docs/web-play');folder.mkdir(parents=True,exist_ok=True)
    manifest=json.loads(Path('web-build/WEB_BUILD_MANIFEST.json').read_text())
    report={'version':'28.1','checked_at_utc':datetime.now(timezone.utc).isoformat(),'workflow_run_id':os.environ['RUN_ID'],'web_commit':Path('qa-export/WEB_COMMIT.txt').read_text().strip(),'public_preview_url':Path('qa-export/PUBLIC_URL.txt').read_text().strip(),'public_preview_verified':os.environ['PUBLIC_RESULT']=='success','local_browser_qa':json.loads(Path('qa-export/web-play/WEB_QA.json').read_text()),'offline_html_bytes':manifest['offline_html_bytes'],'offline_sha256':manifest['offline_sha256'],'original_game_modified':False,'original_site_deployed':False,'hosting':'public source preview CDN, not GitHub Pages','full_eight_chapter_playthrough':False}
    (folder/'WEB_RELEASE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    shutil.copy2('web-build/WEB_BUILD_MANIFEST.json',folder/'ASSET_MANIFEST.json')
    for file in Path('qa-export').glob('**/WEB_QA.json'):shutil.copy2(file,folder/(file.parent.name+'-QA.json'))
    (folder/'README.md').write_text('# V28.1 网页试玩\n\n网页预览：'+report['public_preview_url']+'\n\n这是公开源码 CDN 试玩，非原域名部署。首次访问可能显示确认页面。状态以 WEB_RELEASE.json 为准。\n\n离线试玩：完整下载 Ashen-V28.1-Play.html 后用桌面 Chrome 打开，无需服务器、登录或运行期联网。\n\n```bash\npython3 tools/restore_archives.py\npython3 -m pip install Pillow==12.0.0\npython3 tools/build_web_play.py --output web-build\n```\n\nWASD/方向键移动，J 普攻，1–6 技能，F 交互。剧情测试可直接选择后续章节。存档属于当前浏览器，请用游戏内导出存档保留重要进度。\n')
    p=Path('source/CURRENT_STATE.json');state=json.loads(p.read_text());state['web_play']={k:report[k] for k in ['checked_at_utc','web_commit','public_preview_url','public_preview_verified','offline_sha256']};p.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
    with Path('source/progress.txt').open('a') as f:f.write('\n'+report['checked_at_utc']+' · V28.1 网页试玩构建\n完整原游戏打包为独立网页及无运行期联网的单文件 HTML；实际文件/HTTP/移动端 Chrome 检查通过。公共预览验证：'+str(report['public_preview_verified'])+'。详见 docs/web-play/WEB_RELEASE.json。原站未部署。\n')
    p=Path('README.md');s=p.read_text();title='\n\n## 网页试玩入口\n'
    if title in s:s=s.split(title)[0]
    p.write_text(s+title+'[V28.1 在线试玩]('+report['public_preview_url']+')（公共源码预览托管，原站未覆盖）。发布与浏览器验证状态见 `docs/web-play/WEB_RELEASE.json`。\n\n无需启动本地服务器的单文件离线版，可由 `tools/build_web_play.py` 构建，详见 `docs/web-play/README.md`。\n')
    subprocess.run(['git','config','user.name','Tourist'],check=True);subprocess.run(['git','config','user.email','138776726+YuxiangLiu-lyx@users.noreply.github.com'],check=True)
    subprocess.run(['git','add','web/launcher.html','tools/build_web_play.py','tests/browser-web-play.py','docs/web-play','source/progress.txt','source/CURRENT_STATE.json','README.md'],check=True)
    if Path('tools/web-play-transfer').exists():subprocess.run(['git','rm','-r','tools/web-play-transfer'],check=True)
    subprocess.run(['git','commit','-m','feat: ship verified playable website and standalone offline HTML builder'],check=True)
    subprocess.run(['git','push','origin','HEAD:build/web-play'],check=True)
    Path('qa-export/SOURCE_COMMIT.txt').write_text(git('rev-parse','HEAD')+'\n')

if __name__=='__main__':
    {'prepare':prepare,'publish':publish,'record':record}[sys.argv[1]]()
