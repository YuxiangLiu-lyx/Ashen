"""Materialize the manually authored draft; this is not a sentence rewrite rule."""
import json,runpy
from pathlib import Path
root=Path(__file__).resolve().parents[2]
edits=runpy.run_path(str(root/'docs/dialogue-hud/revisions.py'))['EDITS']
base=json.loads((root/'docs/dialogue-hud/baseline/full-corpus.json').read_text())['scenes']
static=json.loads((root/'docs/dialogue-hud/baseline/runtime.json').read_text())['scenes']
entries=[]
for key,changes in edits.items():
 before=base[key]['text'];after=[row[:] for row in before]
 for i,text in changes.items():
  assert text!=before[i][1],(key,i)
  after[i][1]=text
 entry={'key':key,'id':key if key in static else '_v12Quest' if key.startswith('pacing:') else 'c1Conversation' if key.startswith('local:') else '_spoken' if key.startswith('spoken:') else '_hellTalk','before':before,'after':after,'static':key in static}
 entries.append(entry)
 if key.startswith(('inline:','spoken:')):
  file='dist/core-v14.js' if key.startswith('spoken:') else 'dist/chapter'+key.split(':')[1][2:]+'-runtime-v14.js'
  p=root/file;s=p.read_text()
  for i,text in changes.items():
   if before[i][1] in s:
    assert s.count(before[i][1])==1,(key,'ambiguous source')
    s=s.replace(before[i][1],text)
   else:assert text in s,(key,'source drift')
  p.write_text(s)
(root/'dist/dialogue-copyedits-data.js').write_text('// Authored 2026-10-14 scene revisions. Original rows preserve exact save migration and review evidence.\nexport const DIALOGUE_COPYEDITS = '+json.dumps(entries,ensure_ascii=False,indent=1)+';\n')
(root/'docs/dialogue-hud/SCRIPT.json').write_text(json.dumps({'baseline_commit':'e82ca67c6693900b83ee58ea031933047f3a531f','status':'DEV_FROZEN','entries':entries},ensure_ascii=False,indent=2)+'\n')
print(len(entries),'authored scene revisions')
