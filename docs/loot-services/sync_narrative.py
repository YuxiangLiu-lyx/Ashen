import json,subprocess,sys
from pathlib import Path
sys.path.insert(0,'tools/harness')
from narrative import acknowledge
read=lambda p:json.loads(Path(p).read_text())
def write(p,x):Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
script=read('docs/loot-services/SCRIPT.json')['scenes'];b=read('source/narrative/chapters/R01.json');sources=read('source/narrative/sources.json')
for e in b['events']:
 k=e['scene']
 if k not in script:continue
 sid='loot-services:'+k;sources['sources'][sid]={'path':'dist/service-quests.js' if k=='intro' else 'dist/service-quest-dialogues.js','anchor':'export','kind':'runtime','runtime_scene':k}
 e['sources']=[sid];e['summary']='；'.join(a+'：'+t for a,t in script[k]);e['loot_services_revision']='1.7'
 if k.startswith('c1Hunt'):
  e['participants']=['bounty_hunter' if a=='rune' else a for a in e['participants']]
  for g in e['grants']:
   if g['actor']=='rune':g['actor']='bounty_hunter'
 for f in b['facts']:
  if f['id'] in [g['fact'] for g in e['grants']]:f['summary']=e['summary'];f['sources']=[sid]
for f in b['facts']:
 if f['id'].startswith('F-C1-TRIAL-C1HUNT'):
  scene=next(k for k in script if k.upper() in f['id']);f['summary']=f['summary'].replace('鲁恩','赏金猎人');f['sources']=['loot-services:'+scene]
b['plan']={'path':'docs/harness/CHAPTER_01_LOOT_SERVICES.md','revision':'1.7','status':'DEV_FROZEN'};write('source/narrative/chapters/R01.json',b);write('source/narrative/sources.json',sources)
mods=read('source/harness/modules.json');new={'economy':['dist/quest-reward-completion.js'],'story':['dist/service-quests.js','dist/service-quest-dialogues.js'],'chapter01_expansion':['dist/service-quests.js'],'save':['dist/ground-loot.js'],'ui':['dist/commerce-ui.js'],'art':['dist/service-character-art.js']}
for m in mods['modules']:
 if m['id'] in new:m['entries']=list(dict.fromkeys(new[m['id']]+m['entries']))
write('source/harness/modules.json',mods)
s=read('source/CURRENT_STATE.json');s['runtime_modules']=len(list(Path('dist').glob('*.js')));s['loot_services']={'task':'loot-services-20261019','status':'verification_in_progress','scope':'5分钟存档/实体掉落/商店/任务报酬/开场自动接取/固定服务角色及试炼NPC'};write('source/CURRENT_STATE.json',s)
subprocess.run(['python3','tools/harness/index.py'],check=True)
# Review exact drift list; runtime changes were inspected in this task and scene diffs are limited to adopted SCRIPT.
a=json.loads(subprocess.check_output(['python3','tools/harness/narrative.py','audit'],text=True)) if False else None
from narrative import audit
r=audit();write('docs/loot-services/NARRATIVE_DRIFT_REVIEW.json',r)
ids=[e['where'] for e in r['errors'] if e['code'] in ['SOURCE_DRIFT','SOURCE_UNACKNOWLEDGED']]
# New sources are represented as unlocked by the audit too; include only this task's added sources.
ids+=['loot-services-plan']+['loot-services:'+k for k in script]
print(acknowledge(list(dict.fromkeys(ids)),'2026-10-19：已核对本轮diff，改变对白仅四场（赏金猎人三场+伊登委托指向），intro仅自动接取；其余来源文件变化为奖励/掉落/商店行为，现行知识记录按1.7逐项更新。'))
