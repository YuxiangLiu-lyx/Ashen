#!/usr/bin/env python3
"""Exercise the actual stdlib serve.py CLI in isolated Chrome contexts."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import time
import traceback
from urllib.request import urlopen

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def ready(page):
    page.wait_for_function("window.__ASHEN_WEB__?.ready || document.querySelector('#loadNote')?.textContent==='行装已备好。'", timeout=90000)


def gameplay(page):
    for _ in range(100):
        if page.locator('.hud').count():
            return
        if page.locator('[data-act="next"]').count():
            page.locator('[data-act="next"]').click()
        page.wait_for_timeout(350)
    raise AssertionError('Opening dialogue did not reach playable HUD')


def run(browser, url, out, baseline):
    results = []
    context = browser.new_context(viewport={'width':1440, 'height':900})
    page = context.new_page()
    errors, failed, bad = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('requestfailed', lambda r: failed.append(r.url))
    page.on('response', lambda r: bad.append(r.url) if r.status >= 400 and not r.url.endswith('/favicon.ico') else None)
    start = time.monotonic()
    page.goto(url, wait_until='domcontentloaded')
    ready(page)
    elapsed = round(time.monotonic() - start, 2)
    page.screenshot(path=str(out/'title.png'))
    page.locator('[data-act="select"]').click()
    page.locator('[data-class="shadow"]').click()
    page.locator('[data-act="begin"]').click()
    gameplay(page)
    page.locator('[data-act="manual-save"]').click()
    page.locator('[data-act="pause"]').click()
    page.locator('[data-act="story-test"]').click()
    # Pausing performs a legitimate final autosave of the normal game.
    normal = page.evaluate("localStorage.getItem('ashen-vow-rpg-v10')")
    assert normal
    assert page.locator('[data-test-chapter]:not([data-test-resume])').count() == 8
    for chapter, map_id in [(1, 'hall'), (2, 'post')]:
        page.locator(f'[data-test-chapter="{chapter}"]:not([data-test-resume])').click()
        key = 'ashen-vow-rpg-v10-story-test-v25-chapter'+str(chapter)
        page.wait_for_function('(key)=>!!localStorage.getItem(key)', arg=key)
        seed = page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))', key)
        assert seed['save']['map'] == map_id
        page.locator('[data-act="test-skip"]').click()
        page.locator('.hud').wait_for()
        page.screenshot(path=str(out/f'chapter{chapter}.png'))
        page.locator('[data-act="pause"]').click()
        assert page.evaluate("localStorage.getItem('ashen-vow-rpg-v10')") == normal
        page.locator('[data-act="story-test"]').click()
    page.reload(wait_until='domcontentloaded')
    ready(page)
    page.locator('[data-act="continue"]').click()
    gameplay(page)
    assert page.evaluate("localStorage.getItem('ashen-vow-rpg-v10')") == normal
    assert not errors and not failed and not bad, (errors, failed, bad)
    results.append({'case':'real-cli-gameplay', 'first_load_seconds':elapsed,
                    'normal_game':True, 'chapter_choices':8, 'chapter1_and_2_skip':True,
                    'normal_save_preserved_after_reload':True, 'errors':errors,
                    'failed_requests':failed, 'http_errors':bad})
    context.close()

    for kind, resource in [('module', 'story-test-v31.js'), ('image', 'assets/v4/main-portraits.png')]:
        context = browser.new_context(viewport={'width':1440, 'height':900})
        page = context.new_page()
        page.add_init_script("if(!localStorage.getItem('ashen-vow-rpg-v10'))localStorage.setItem('ashen-vow-rpg-v10',"+json.dumps(normal)+");")
        page.route('**/'+resource, lambda route: route.abort())
        page.goto(url, wait_until='domcontentloaded')
        if baseline:
            if kind == 'module':
                page.wait_for_timeout(1200)
                assert not page.locator('#ui').inner_text().strip()
            else:
                page.wait_for_function("document.querySelector('.toast-stack')?.textContent.includes('有场景未能载入')", timeout=90000)
            assert page.locator('#boot-retry').count() == 0
        else:
            page.locator('#boot-error').wait_for(timeout=90000)
            assert page.locator('#boot-retry').is_visible()
            assert not page.evaluate('window.__ASHEN_WEB__.ready')
            if kind == 'image':
                assert '素材 portraits' in page.locator('#boot-error').inner_text()
        page.screenshot(path=str(out/(kind+'-failure.png')))
        result = {'case':kind+'-failure', 'injected_resource':resource,
                  'visible_error_and_retry':not baseline,
                  'body_excerpt':page.locator('body').inner_text()[:1000]}
        if not baseline:
            page.unroute('**/'+resource)
            page.locator('#boot-retry').click()
            ready(page)
            assert page.evaluate("localStorage.getItem('ashen-vow-rpg-v10')") == normal
            assert page.locator('[data-act="continue"]').is_visible()
            result['retry_recovers_without_clearing_save'] = True
        results.append(result)
        context.close()
    if not baseline:
        context = browser.new_context(viewport={'width':844, 'height':390}, is_mobile=True, has_touch=True)
        page = context.new_page()
        page.goto(url, wait_until='domcontentloaded')
        ready(page)
        page.locator('[data-act="story-test"]').click()
        assert page.locator('[data-test-chapter]:not([data-test-resume])').count() == 8
        page.locator('[data-test-chapter="1"]').click()
        page.locator('[data-act="test-skip"]').click()
        page.locator('.hud').wait_for()
        assert page.locator('#joystick').is_visible()
        page.screenshot(path=str(out/'mobile.png'))
        results.append({'case':'mobile-landscape', 'chapter1_playable':True})
        context.close()
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=5174)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--baseline', action='store_true')
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    url = f'http://127.0.0.1:{args.port}/'
    report = {'baseline':args.baseline, 'url':url, 'command':['python3','tools/serve.py','--port',str(args.port)]}
    process = None
    try:
        with (args.out/'server.log').open('w') as log:
            process = subprocess.Popen(report['command'], cwd=ROOT, stdout=log, stderr=subprocess.STDOUT)
            for _ in range(100):
                assert process.poll() is None, 'serve.py exited; inspect server.log (port may be occupied)'
                try:
                    with urlopen(url, timeout=1) as response:
                        if response.status == 200:
                            break
                except OSError:
                    time.sleep(.1)
            else:
                raise AssertionError('Server did not become ready')
            executable = os.environ.get('CHROME_BIN') or shutil.which('google-chrome') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
            with sync_playwright() as p:
                browser = p.chromium.launch(executable_path=executable, headless=True)
                report['results'] = run(browser, url, args.out, args.baseline)
                browser.close()
            report['passed'] = True
    except Exception:
        report.update(passed=False, error=traceback.format_exc())
        raise
    finally:
        if process is not None and process.poll() is None:
            process.terminate()
            process.wait(timeout=10)
        report['serve_sha256'] = hashlib.sha256((ROOT/'tools/serve.py').read_bytes()).hexdigest()
        (args.out/'BROWSER_QA.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
        print(json.dumps(report, ensure_ascii=False, indent=2), flush=True)


if __name__ == '__main__':
    main()
