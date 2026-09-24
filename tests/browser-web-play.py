#!/usr/bin/env python3
"""End-to-end smoke test of the packaged game, not a replacement mini-game.
Fixtures touch only isolated browser contexts. No QA hooks in production modules.
"""
from __future__ import annotations
import argparse, functools, http.server, json, os, shutil, threading, time, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]

def advance_intro(page):
    for _ in range(100):
        if page.locator('.hud').count():return
        nxt=page.locator('[data-act="next"]')
        if nxt.count():nxt.click()
        page.wait_for_timeout(350)
    raise AssertionError('Intro did not reach playable HUD')

def ready(page):
    page.wait_for_function('window.__ASHEN_WEB__?.ready===true',timeout=180000)

def run_case(browser,url,label,out,offline=False,remote=False):
    context=browser.new_context(viewport={'width':1440,'height':900},accept_downloads=True)
    if remote:
        # rawgit.hack documents this cookie for automated access to an owned page.
        from urllib.parse import urlparse
        context.add_cookies([{'name':'__Http-phish','value':'1','domain':urlparse(url).hostname,'path':'/','secure':True,'httpOnly':True}])
    page=context.new_page();errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(r.url))
    start=time.monotonic();page.goto(url,wait_until='domcontentloaded',timeout=180000)
    try:ready(page)
    except Exception:
        (out/(label+'-load-failure.json')).write_text(json.dumps({'url':page.url,'errors':errors,'text':page.locator('body').inner_text()[:9000]},ensure_ascii=False,indent=2))
        page.screenshot(path=str(out/(label+'-load-failure.png')))
        raise
    checks=['all_assets_loaded'];first_load=round(time.monotonic()-start,2)
    page.screenshot(path=str(out/(label+'-title.png')))
    assert '0.28.1' in page.locator('#ui').inner_text()
    page.locator('[data-act="select"]').click()
    assert page.locator('[data-class]').count()==3
    page.locator('[data-class="shadow"]').click();page.locator('[data-act="begin"]').click();advance_intro(page)
    checks += ['three_class_choices','start_new_journey','intro_to_live_game']
    page.locator('[data-act="manual-save"]').click();page.wait_for_timeout(200)
    before=page.evaluate("JSON.parse(localStorage.getItem('ashen-vow-rpg-v10')).p")
    page.keyboard.down('d');page.wait_for_timeout(650);page.keyboard.up('d')
    page.locator('[data-act="manual-save"]').click();page.wait_for_timeout(200)
    after=page.evaluate("JSON.parse(localStorage.getItem('ashen-vow-rpg-v10')).p")
    assert abs(after['x']-before['x'])+abs(after['y']-before['y'])>2
    checks += ['keyboard_movement','browser_save']
    page.locator('[data-tab="bag"]').first.click();assert page.locator('.panel').count()>0
    page.keyboard.press('Escape');page.wait_for_timeout(100)
    page.screenshot(path=str(out/(label+'-game.png')))
    checks += ['inventory_ui']
    module='@ashen/core-v14.js' if offline else './core-v14.js'
    fixture="""async (module)=>{const {RPG,stats}=await import(module);const g=new RPG('shadow',null,()=>.4);g.ensureMap('warehouse');g.map='warehouse';const e=g.enemies[0];for(const other of g.enemies)if(other!==e){other.dead=true;other.hp=0;}const p=g.safePoint(e.x-40,e.y+22);g.relocate(p.x,p.y);g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;g.pending=null;g.events=[];g.active=true;return {enemy_id:e.id,raw:JSON.stringify(g.snapshot())};}"""
    test_save=page.evaluate(fixture,module);enemy_id=test_save["enemy_id"]
    # Import through the real UI; beforeunload autosave must remain enabled.
    page.keyboard.press("Escape");page.locator('[data-act="import-save"]').click()
    page.locator("#saveTransfer").fill(test_save["raw"]);page.locator('[data-act="confirm-import"]').click()
    page.wait_for_timeout(500)
    page.reload(wait_until='domcontentloaded',timeout=180000);ready(page);page.locator('[data-act="continue"]').click()
    page.keyboard.down('j');page.wait_for_timeout(6500);page.keyboard.up('j')
    page.keyboard.press('Escape');page.wait_for_timeout(250)
    saved=page.evaluate("JSON.parse(localStorage.getItem('ashen-vow-rpg-v10'))")
    enemy=next(e for e in saved['states']['warehouse']['enemies'] if e['id']==enemy_id)
    assert enemy['dead'], 'Real attack input must defeat the seeded warehouse enemy'
    assert saved['p']['xp']>0 or saved['p']['level']>1
    checks += ['continue_saved_journey','attack_kills_enemy','combat_rewards']
    page.locator('[data-act="export-save"]').click();assert len(page.locator('#saveTransfer').input_value())>100
    checks += ['export_save_text']
    page.locator('[data-act="pause"]').click();page.locator('[data-act="story-test"]').click()
    page.locator('[data-test-chapter="8"]').last.click();page.wait_for_timeout(1700)
    # The chapter begins with a walking cinematic, not immediate dialogue.
    page.wait_for_function('document.querySelector(".dialogue-card") || document.querySelector("#ui").textContent.includes("免伤")',timeout=30000)
    assert '免伤' in page.locator('#ui').inner_text() or page.locator('.dialogue-card').count()>0
    assert page.locator('.story-illustration-v19').count()==0
    checks += ['chapter8_checkpoint','no_chapter8_large_cg']
    page.screenshot(path=str(out/(label+'-chapter8.png')))
    assert not errors, errors
    forbidden=[u for u in requests if '/assets/v26/c8-' in u];assert not forbidden,forbidden
    if offline:assert not [u for u in requests if u.startswith(('https://','http://'))], 'Offline HTML must not need network'
    result={'case':label,'url':url if remote else label,'checks':checks,'first_load_seconds':first_load,'uncaught_errors':errors,'network_requests':len([u for u in requests if u.startswith(('http://','https://'))]),'chapter8_cg_requests':forbidden}
    print(json.dumps(result,ensure_ascii=False),flush=True)
    context.close();return result

if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--build',type=Path,default=ROOT/'web-build');a.add_argument('--remote');a.add_argument('--out',type=Path,default=ROOT/'qa-export/web-play');args=a.parse_args()
    args.out.mkdir(parents=True,exist_ok=True)
    executable=os.environ.get('CHROME_BIN') or next((shutil.which(s) for s in ['google-chrome','chromium','google-chrome-stable'] if shutil.which(s)),None)
    if not executable:raise RuntimeError('Chrome or Chromium is required')
    server=None;results=[]
    try:
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
            if args.remote:results.append(run_case(browser,args.remote,'public-web',args.out,remote=True))
            else:
                results.append(run_case(browser,(args.build/'Ashen-V28.1-Play.html').resolve().as_uri(),'offline-file',args.out,offline=True))
                handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(args.build/'site'))
                server=http.server.ThreadingHTTPServer(('127.0.0.1',0),handler);threading.Thread(target=server.serve_forever,daemon=True).start()
                results.append(run_case(browser,f'http://127.0.0.1:{server.server_port}/index.html','http-site',args.out))
                context=browser.new_context(viewport={'width':844,'height':390},has_touch=True,is_mobile=True)
                page=context.new_page();page.goto(f'http://127.0.0.1:{server.server_port}/index.html');ready(page)
                page.locator('[data-act="select"]').click();page.locator('[data-class="ember"]').click();page.locator('[data-act="begin"]').click();advance_intro(page)
                assert page.locator('#joystick').is_visible();assert page.locator('.attack').is_visible()
                page.screenshot(path=str(args.out/'mobile-landscape.png'));results.append({'case':'mobile-landscape','touch_controls_visible':True,'viewport':[844,390]});context.close()
            browser.close()
        report={'version':'28.1','passed':True,'results':results,'scope':'Packaged file/HTTP entry, start, movement, combat, inventory, save/export and chapter test. Not an eight-chapter playthrough.'}
        (args.out/'WEB_QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps(report,ensure_ascii=False,indent=2))
    except Exception as e:
        (args.out/'WEB_FAILURE.json').write_text(json.dumps({'error':traceback.format_exc(),'partial_results':results},ensure_ascii=False,indent=2)+'\n')
        raise
    finally:
        if server:server.shutdown()
