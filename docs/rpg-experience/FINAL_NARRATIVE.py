from pathlib import Path
import json,subprocess
out=Path('docs/rpg-experience/current-narrative');out.mkdir(exist_ok=True)
rows=[]
for tid in ['rpg-c1-20261014','rpg-c2-20261014']:
 rows+=json.loads((Path('source/tasks/archive')/(tid+'.json')).read_text())['narrative_reviews']
rows+=json.loads(Path('source/tasks/active/rpg-c3-20261014.json').read_text())['narrative_reviews']
for row in rows:
 d=json.loads(Path(row['draft']).read_text());scene=d['scene'];base=str(out/scene);Path(base+'-draft.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
 args=['python3','tools/harness/narrative.py','context','--chapter',d['chapter'],'--scene',scene,'--at',d.get('at',scene),'--output',base+'-context.json']
 for actor in d['actors']:args+=['--actor',actor]
 subprocess.run(args,check=True,stdout=subprocess.DEVNULL)
 subprocess.run(['python3','tools/harness/narrative.py','review','--draft',base+'-draft.json','--output',base+'-review.json'],check=True,stdout=subprocess.DEVNULL)
 tids=['rpg-experience-20261014']+(['rpg-c3-20261014','rpg-delivery-20261014'] if scene.startswith('c3') else [])
 for tid in tids:subprocess.run(['python3','tools/harness/task.py','narrative','--id',tid,'--context',base+'-context.json','--draft',base+'-draft.json','--review',base+'-review.json'],check=True,stdout=subprocess.DEVNULL)
print('Refreshed',len(rows),'editorial reviews; original records retained')
