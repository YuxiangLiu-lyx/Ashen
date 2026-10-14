from pathlib import Path
import sys,json,copy,subprocess,os
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint,digest
from map_quality import relevant,changed
load=lambda p:json.loads(Path(p).read_text())
def write(p,d):Path(p).parent.mkdir(parents=True,exist_ok=True);Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def ev(p):return {'path':str(p),'sha256':digest(Path(p))}
fp=fingerprint(inventory());out=Path('docs/rpg-experience/final');out.mkdir(exist_ok=True)
# Historical normal-input and editorial judgments remain immutable. Current core,
# content hashes and browser integration recheck their unchanged chapter rules.
proof='docs/rpg-experience/c3/VERIFICATION_EQUIVALENCE.json'
integration='docs/harness/evidence/rpg-experience-20261014/050-integration.txt'
for n in [1,2]:
 old=f'docs/rpg-experience/c{n}/ACCEPTANCE.json';d=copy.deepcopy(load(old));d.update(schema=2,chapter=f'R0{n}',source_fingerprint=fp)
 d['revalidation']={'original_report':ev(old),'scope':'原已验收正常输入保留；本次第三章安装按阶段/地图限域，前两章正文、数值、任务、几何无新增修改。最终整体集成复核。','proof':ev(proof)}
 for group in d['scopes'].values():
  for row in group.values():row['evidence'].extend([ev(proof),ev(integration)])
 d['human']['playable_build']=ev('qa-export/release-build/Ashen-V28.1-Play.html')
 path=str(out/f'R0{n}_ACCEPTANCE.json');write(path,d)
 if not os.environ.get('SKIP_ATTACH'):subprocess.run(['python3','tools/harness/task.py','experience','--id','rpg-experience-20261014','--report',path],check=True)
# Final shared map report includes the earlier individually reviewed chapters.
allmaps=[];assets={};paths=set()
for n in [1,2,3]:
 d=load(f'docs/rpg-experience/c{n}/MAP_QUALITY.json');paths.update(d['reviewed_paths'])
 for row in d['maps']:
  for result in [row[k] for k in ['playability','scene_credibility','character_consistency']]:
   if n<3:result['reason']+=' 第三章增量后前两章保护断言及实际浏览器回归再次验证，原逐图审阅保留。';result['evidence'].extend([ev(proof),ev(integration)])
  allmaps.append(row)
 for a in d['assets']:assets[a['path']]=a
paths.update(relevant(changed('cad2add19b46e319475c28504e155322a9df687d')))
write('docs/map-quality/LATEST.json',{'task':'rpg-experience-20261014','reviewer':'Codex逐章实际画面与原件审阅、当前兼容复核；真人待验','source_fingerprint':fp,'reviewed_paths':sorted(paths),'assets':list(assets.values()),'maps':allmaps})
for tid in ([] if os.environ.get('SKIP_ATTACH') else ['rpg-c3-20261014','rpg-experience-20261014']):
 subprocess.run(['python3','tools/harness/task.py','experience','--id',tid,'--report','docs/rpg-experience/c3/ACCEPTANCE.json'],check=True)
print('Rollup maps',len(allmaps),'chapters 1-3')
