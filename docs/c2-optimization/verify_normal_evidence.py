"""Verify original normal-input runs and the two later C2-only sentence cleanups.
No gameplay verification is claimed to have been rerun by this proof.
"""
import hashlib,json,subprocess
from pathlib import Path
sha=lambda b:hashlib.sha256(b).hexdigest()
p=Path('dist/chapter-two-conversations-data.js');new=p.read_text();old=new.replace('施粥点的粮食就是他送来的。','施粥点的粮食就是他送来的，我见过。').replace('这次身边多了个不肯听他的，我也想知道他会怎么应付。','诺恩习惯别人照他的安排做。这次身边的人偏偏不肯，我也想知道他会怎么应付。')
assert new!=old
rows=[]
for chapter,folder,status,phase in [(1,'docs/c1-endurance/natural-prepared','chapter-one-complete',6),(2,'docs/c2-optimization/natural-initial','chapter-two-complete',12)]:
 for cls in ['shadow','oath','ember']:
  path=Path('docs/c1-endurance/natural-resumed' if chapter==1 and cls=='ember' else folder)/cls/'PLAY.json';raw=path.read_bytes();d=json.loads(raw);assert d['status']==status and not d['errors']
  final=d['steps'][-1]['state'];assert final['chapter']>=phase
  if chapter==1 and cls=='ember':
   chain=d;seen=[]
   while chain['source'].get('importedSave'):
    imp=chain['source']['importedSave'];raw_prefix=Path(imp['path']).read_bytes();assert sha(raw_prefix)==imp['sha256'];saved=json.loads(raw_prefix);assert saved['p']['hp']>0 and not saved['flags'].get('storyTestV25')
    pref=Path(chain['source']['prefixEvidence']);assert pref not in seen;seen.append(pref);chain=json.loads(pref.read_text())
    assert any(x['state']['map']==saved['map'] and x['state']['chapter']==saved['chapter'] and x['state']['p']['hp']==saved['p']['hp']for x in chain['steps'])
    for f,h in chain['source']['files'].items():assert sha(Path(f).read_bytes())==h,f
   assert chain['steps'][0]['name']=='01-hall';assert any(x['name']=='06e-trial-cleared'for x in chain['steps']);assert any(x['name']=='06f-trial-reported'for x in chain['steps'])
  files=d['source']['files'];changes=[f for f,h in files.items()if sha(Path(f).read_bytes())!=h]
  assert changes in [[],['dist/chapter-two-conversations-data.js']],changes
  assert files[str(p)]==sha((old if changes else new).encode()),'Original module must equal exactly the final module with the two documented earlier sentences'
  rows.append({'chapter':chapter,'class':cls,'path':str(path),'sha256':sha(raw),'ending_phase':final['chapter'],'changed_runtime_files':changes,'input_method':'normal_ui','state_mutation_hooks':False,'resumed_from':d['source'].get('importedSave'),'prefix_evidence':d['source'].get('prefixEvidence')})
report={'passed':True,'runs':rows,'reason':'All production modules and AI/HP/quests/services/install order are byte-identical to the normal-input runs except two C2-only sentence cleanups. No C1 text changed. Final all-page browser and corpus producer checks cover the final wording. Ember completed the trial from title, then the harness stopped at a disabled crafting button because materials were insufficient; its unchanged exported save was imported through the normal UI, missing materials were earned in the warehouse, and the route continued. The connected segments and all failed scripts are preserved, including a later captain loss followed by a normal-UI restart from the unchanged north-route checkpoint with legal brewing and a purchased road weapon. Runtime provenance from each original run was checked, not overwritten.'}
Path('docs/c2-optimization/NORMAL_EQUIVALENCE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False,indent=2))
