import subprocess,json,tempfile,tarfile,io
from pathlib import Path
sha='875c1855d37b398d2ca4a8b83586037553a5399d'
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',sha,'dist'],text=True).splitlines();paths=[p for p in paths if p.endswith('.js')];paths+=['tools/harness/dialogue_corpus.mjs','package.json']
with tempfile.TemporaryDirectory(prefix='ashen-character-baseline-') as root:
 archive=subprocess.check_output(['git','archive','--format=tar',sha,*paths])
 with tarfile.open(fileobj=io.BytesIO(archive))as t:t.extractall(root,filter='data')
 actual=json.loads(subprocess.check_output(['node','tools/harness/dialogue_corpus.mjs'],cwd=root,text=True));saved=json.loads(Path('docs/c1-character-flow/before/CORPUS.json').read_text());assert actual==saved
 print('All',len(actual['scenes']),'installed/static/dynamic variants match isolated committed baseline',sha)
