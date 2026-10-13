"""Check the existing local entry and the review page in isolated browser contexts."""
import json, runpy, os
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path.cwd()
out=root/'docs/ch1-story-world/local-5174'
out.mkdir(parents=True,exist_ok=True)
case=runpy.run_path(str(root/'tests/browser-local-serve.py'))
report={'url':'http://127.0.0.1:5174/','passed':False}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ['CHROME_BIN'],headless=True)
  report['results']=case['run'](browser,report['url'],out,False)
  page=browser.new_page(); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto((root/'docs/ch1-story-world/visual-review.html').as_uri())
  ids=page.locator('#maps option').evaluate_all('(es)=>es.map(e=>e.value)')
  assert len(ids)==22
  reviewed=[]
  for id in ids:
   page.select_option('#maps',id)
   for mode in ['current','collision','compare']:
    page.click('#'+mode)
    page.wait_for_function('Array.from(document.querySelectorAll("figure img")).filter(e=>!e.hidden).every(e=>e.complete&&e.naturalWidth>0)')
    if mode=='compare' and not page.locator('#slider').is_hidden():
     page.locator('#slider').fill('75');page.locator('#slider').dispatch_event('input')
     assert page.locator('#overlay').evaluate('e=>e.style.clipPath')=='inset(0px 25% 0px 0px)'
   reviewed.append(id)
  assert not errors
  report['visual_review']={'maps':reviewed,'modes':['current','collision','compare'],'slider':True,'errors':errors}
  browser.close()
 report['passed']=True
finally:
 (out/'BROWSER_QA.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(report,ensure_ascii=False),flush=True)
