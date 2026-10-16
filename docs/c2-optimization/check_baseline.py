import subprocess,json,tempfile,tarfile,io
from pathlib import Path
sha='d57ae25f73e97e8002bbb6a3f9e42646714b8bdf'
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',sha,'dist'],text=True).splitlines();paths=[p for p in paths if p.endswith('.js')];paths+=['tools/harness/dialogue_corpus.mjs','package.json']
with tempfile.TemporaryDirectory(prefix='ashen-c2-baseline-')as root:
 archive=subprocess.check_output(['git','archive','--format=tar',sha,*paths])
 with tarfile.open(fileobj=io.BytesIO(archive))as t:t.extractall(root,filter='data')
 actual=json.loads(subprocess.check_output(['node','tools/harness/dialogue_corpus.mjs'],cwd=root,text=True));saved=json.loads(Path('docs/c2-optimization/before/CORPUS.json').read_text());assert actual==saved
 # Compare full map definitions; HP changes live in combat data, not map geometry.
 before=subprocess.check_output(['node','--input-type=module','-e',"import{MAPS}from'./dist/core-v14.js';console.log(JSON.stringify(MAPS))"],cwd=root,text=True)
 after=subprocess.check_output(['node','--input-type=module','-e',"import{MAPS}from'./dist/core-v14.js';console.log(JSON.stringify(MAPS))"],text=True)
 assert json.loads(before)==json.loads(after)
 Path('docs/c2-optimization/MAP_PRESERVATION.json').write_text(json.dumps({'baseline_commit':sha,'maps':len(json.loads(before)),'all_map_definitions_equal':True,'method':'isolated committed production install compared to current complete production install'},indent=2)+'\n')
 print('Committed baseline matches all',len(actual['scenes']),'dialogue variants; all map definitions equal.')
