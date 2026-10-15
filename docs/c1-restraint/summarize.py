import json,statistics,hashlib,subprocess
from pathlib import Path
P=Path('docs/c1-restraint')
read=lambda p:json.loads(Path(p).read_text())
def stats(rows):
 return {'n':len(rows),'outcomes':{k:sum(r['outcome']==k for r in rows)for k in ['win','loss','timeout','interrupted']},'seconds_mean':round(statistics.mean(r.get('elapsed',r.get('seconds',0)) for r in rows),2) if rows else None}
old=read(P/'before/COMBAT.json');new=read(P/'COMBAT.json');assert old['sources']==new['sources']
result={'same_source_saves':True,'human_win_rate_claim':False,'before':{},'after':{},'limits':new['limits']}
for cls in ['shadow','oath','ember']:
 for label,data in [('before',old),('after',new)]:
  result[label][cls]={kind:{id:stats([r for r in data['runs']if r['cls']==cls and r['kind']==kind and r['policy']=='responsive' and r['id']==id])for id in sorted({r['id']for r in data['runs']})}for kind in ['starter','normal','optimized']}
result['after_groups']={cls:stats([r for r in new['groups']if r['cls']==cls and r['kind']=='normal'])for cls in ['shadow','oath','ember']}
for name in ['c2','c3-groups','c3-entry','c3-bosses']:
 d=read(P/name/'COMBAT.json');result[name]={key:{cls:stats([r for r in d[key]if r.get('cls')==cls and r.get('kind','normal')=='normal' and r.get('policy','responsive')=='responsive'])for cls in ['shadow','oath','ember']}for key in ['groups','bren','bosses','forge'] if key in d}
d=read(P/'C2_PREPARATION_COMBAT.json');result['c2_preparation']={cls:{stage:{kind:stats([r for r in d['runs']if r['cls']==cls and r['stage']==stage and r['kind']==kind])for kind in ['normal','bren']}for stage in ['01-post-import','02-relay-outfit']}for cls in ['shadow','oath','ember']}
result['sampling_limits']=['c3-groups direct ensureMap diagnostics retain collision timeouts; c3-entry uses production enter() and resolves every sample.', 'C2 before-preparation mage loses 3/3 Bren cases; after real UI weapon/hat purchases and earned-point allocation wins 3/3. No invented gear or money.', 'C3 normal responsive entry groups: shadow 14/15, oath 15/15, ember 10/15 wins. Failures remain failures. These are scripted finite-supply cases, not human win rates.']
(P/'COMBAT_COMPARISON.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
manifest=read('archives/runtime-assets.manifest.json');assert all(hashlib.sha256((Path(manifest['restore_directory'])/a['path']).read_bytes()).hexdigest()==a['sha256']for a in manifest['files'])
(P/'ASSET_INTEGRITY.json').write_text(json.dumps({'originals_verified':len(manifest['files']),'new_assets':0,'reused':'Existing original merchant, creature, actor, food and furniture atlases; no original bytes overwritten'},indent=2)+'\n')
print('Same-source combat summary and original asset hashes verified.')
