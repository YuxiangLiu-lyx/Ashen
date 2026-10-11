#!/usr/bin/env python3
"""Compare current registered world/story data with the actual task baseline."""
import hashlib,json,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE='68d508e41a878afbb278093275cba9518fd831e8'
query="""import {RPG,MAPS,QUESTS} from './dist/core-v14.js';
import {DIALOGUES} from './dist/data-v14.js';
import {SCENERY,WATERS,BRIDGES} from './dist/world-v14.js';
console.log(JSON.stringify({MAPS,QUESTS,DIALOGUES,SCENERY,WATERS,BRIDGES}));"""
def run(cwd):return json.loads(subprocess.check_output(['node','--input-type=module','-e',query],cwd=cwd,text=True))
with tempfile.TemporaryDirectory(prefix='ashen-test-baseline-') as d:
    tmp=Path(d);(tmp/'dist').mkdir();(tmp/'package.json').write_text('{"type":"module"}')
    paths=subprocess.check_output(['git','ls-tree','-r','--name-only',BASE,'dist'],cwd=ROOT,text=True).splitlines()
    unchanged=[]
    for name in paths:
        if not name.endswith('.js'):continue
        data=subprocess.check_output(['git','show',BASE+':'+name],cwd=ROOT)
        (tmp/name).write_bytes(data)
        if (ROOT/name).read_bytes()==data:unchanged.append(name)
    old=run(tmp);new=run(ROOT)
    assert old==new,'Registered maps, quests, dialogues or scenery changed'
    before=(tmp/'dist/core-v14.js').read_text()
    after=(ROOT/'dist/core-v14.js').read_text().replace('if(isStoryTestV25(this))n=Math.max(1,n,e.hp);','')
    assert before==after,'Core changes exceed test-only damage'
    assets=subprocess.check_output(['git','diff','--name-only',BASE,'--','dist/assets'],cwd=ROOT,text=True).strip()
    assert not assets,assets
    report={'passed':True,'baseline':BASE,'unchanged_registered_data':{key:{'count':len(value),'sha256':hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False).encode()).hexdigest()} for key,value in new.items()},'unchanged_runtime_files':unchanged,'core_change':'single isStoryTestV25 damage floor; all other bytes equal','art_assets_changed':False,'limits':'Test entry/skip teleports are test operations, not proof of natural map navigation. Existing spatial/art limitations remain unchanged.'}
    (ROOT/'docs/chapter-test/SCOPE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='unchanged_runtime_files'},ensure_ascii=False,indent=2))
