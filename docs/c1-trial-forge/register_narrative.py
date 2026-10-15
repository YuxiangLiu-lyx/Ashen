import json,subprocess
from pathlib import Path
read=lambda p:json.loads(Path(p).read_text())
def write(p,x):Path(p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
rows=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{C1_TRIAL_DIALOGUES}from './dist/chapter-one-trial-dialogues.js';console.log(JSON.stringify(C1_TRIAL_DIALOGUES))"],text=True))
write('docs/c1-trial-forge/SCRIPT.json',{'revision':'1.3','scenes':rows})
r=read('docs/c1-trial-forge/planned-events.json');sources=read('source/narrative/sources.json');sources['sources']['c1-trial-runtime']={'path':'dist/chapter-one-trial-dialogues.js','anchor':'export const C1_TRIAL_DIALOGUES','kind':'runtime'}
for e in r['events']:
 if e['scene'] not in rows:continue
 scene=e['scene'];sid='trial:'+scene;sources['sources'][sid]={'path':'dist/chapter-one-trial-dialogues.js','anchor':'export const C1_TRIAL_DIALOGUES','kind':'runtime','runtime_scene':scene}

 if scene=='assassination' and 'role_4ae25552de' not in e['participants']:e['participants'].append('role_4ae25552de')
 e['sources']=[sid,'c1-trial-runtime'];e['summary']='；'.join(a+'：'+t for a,t in rows[scene]);e['c1_trial_revision']='1.3';e['trigger']='第一章1.3按trial-runtime实际地图/进度/任务条件触发，pending.then末页结算。旧schema≤5在播正文单独保留。'
 if scene=='c1TrainingReason':e['stage_window']=['R01:c1TrialInvitation','R01:contract']
 if scene in ['c1Talk_c1Readiness_offer','c1Talk_c1ExitDrill_offer','c1Talk_c1ExitDrill_progress','c1RepairReturn','c1VaultAccept']:e['stage_window']=['R01:c1TrialInvitation','R01:chapterEnd']
 fid='F-C1-13-'+scene.upper();r['facts'].append({'id':fid,'summary':e['summary'],'truth':'world_fact','plane':'runtime','status':'RUNTIME','sources':[sid],'risk_terms':[]})
 # Keep the distinct mission's reported claim, seal instruction, and observed abduction facts.
 if scene not in ['contract','assassination']:e['grants']=[]
 else:e['grants']=[g for g in e['grants'] if not g['fact'].startswith(('F-C1-CARE-','F-C1-FLOW-'))]
 e['grants']+=[{'actor':a,'fact':fid,'mode':'knows'} for a in e['participants']+['player']]
for f in r['facts']:
 if f['id'].startswith('F-C1-TRIAL-'):f['sources']=['c1-trial-runtime']
 elif f['id'].startswith(('F-C1-CARE-','F-C1-FLOW-','F-EXP-')):
  ids=[sources['sources'].get(s,{}).get('runtime_scene') for s in f['sources']];scene=next((x for x in ids if x in rows),None)
  if scene:f['summary']='第一章1.3当前内容：'+'；'.join(a+'：'+t for a,t in rows[scene]);f['sources']=['trial:'+scene]
for i,e in enumerate(r['events']):e['order']=i+1
r['events']=sorted(r['events'],key=lambda e:e['order'])
write('source/narrative/chapters/R01.json',r);write('source/narrative/sources.json',sources)
mods=read('source/harness/modules.json')
entries={'story':['dist/chapter-one-trial-dialogues.js','dist/chapter-one-trial-runtime.js'],'chapter01_expansion':['dist/chapter-one-trial-runtime.js','dist/chapter-one-preparation-state.js','dist/chapter-one-preparation-ui.js'],'chapter01_plan':['docs/harness/CHAPTER_01_TRIAL_FORGE.md'],'save':['dist/chapter-one-trial-save.js','dist/chapter-one-preparation-state.js'],'ui':['dist/chapter-one-preparation-ui.js']}
for m in mods['modules']:
 m['entries']=list(dict.fromkeys(entries.get(m['id'],[])+m['entries']))
 if m['id'] in entries:m['tests']=list(dict.fromkeys(m['tests']+['node --test tests/c1-trial-forge.test.mjs']))
write('source/harness/modules.json',mods)
s=read('source/CURRENT_STATE.json');s['runtime_modules']=len(list(Path('dist').glob('*.js')));s['c1_trial_forge']={'revision':'1.3','status':'implementation_in_progress','task':'c1-trial-forge-20261014','scope':'Chapter1 only; report before approval; 5 elites + separate final trial Boss; hall potion/rune/core services; schema6'};write('source/CURRENT_STATE.json',s)
