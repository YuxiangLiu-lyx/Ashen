"""Verify the user's already-running serve.py :5174 in isolated browsers."""
import importlib.util
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/ch1-voice/local-5174'
OUT.mkdir(exist_ok=True)

def module(name, file):
    spec = importlib.util.spec_from_file_location(name, ROOT / file)
    value = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(value)
    return value

entry = module('entry', 'tests/browser-local-serve.py')
packaged = module('packaged', 'tests/browser-web-play.py')
packaged.expected_version = str(json.loads((ROOT/'source/CURRENT_STATE.json').read_text())['product_version'])
report = {'url':'http://127.0.0.1:5174/', 'passed':False}
try:
    report['server_processes'] = [line for line in subprocess.check_output(['ps','-axo','pid,command'], text=True).splitlines() if 'tools/serve.py --port 5174' in line]
    assert report['server_processes']
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless=True)
        report['entry'] = entry.run(browser, report['url'], OUT, False)
        report['story'] = packaged.run_case(browser, report['url'], 'local-5174', OUT)
        browser.close()
    report['passed'] = True
finally:
    (OUT/'RESULT.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(report, ensure_ascii=False))
