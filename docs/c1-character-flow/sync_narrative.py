import json
from pathlib import Path
R=Path(__file__).resolve().parents[2]
def read(p):return json.loads((R/p).read_text())
def write(p,d):(R/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
s=read('docs/c1-character-flow/SCRIPT.json');b=read('source/narrative/chapters/R01.json');sources=read('source/narrative/sources.json');events={e['scene']:e for e in b['events']};facts={f['id']:f for f in b['facts']}
for entry in s['entries']:
 key=entry['key'];scene='c1:localTalk:'+key[6:]if key.startswith('local:')else key
 if scene not in events:continue
 event=events[scene];summary='；'.join(a+'：'+t for a,t in entry['after']);source='character-flow:'+scene
 spec={'path':'dist/chapter-one-conversations-data.js','anchor':'export const C1_CONVERSATIONS','kind':'runtime'}
 if entry['static']:spec['runtime_scene']=scene
 sources['sources'][source]=spec
 event['summary']=summary;event['c1_character_flow_revision']='1.5'
 if source not in event['sources']:event['sources'].append(source)
 # Only whole-scene generated facts are synchronized; core secret/claim facts stay distinct.
 for f in b['facts']:
  if f['id'].startswith(('F-C1-FLOW-','F-C1-13-','F-C1-CARE-')) and any(sources['sources'].get(k,{}).get('runtime_scene')==scene for k in f['sources']):
   f['summary']=summary
   if source not in f['sources']:f['sources'].append(source)
 if entry['normal_event_review']:
  fid='F-C1-15-'+scene.upper().replace(':','-')
  if fid not in facts:
   fact={'id':fid,'summary':summary,'truth':'world_fact','plane':'runtime','status':'RUNTIME','sources':[source],'risk_terms':[]};b['facts'].append(fact);facts[fid]=fact
  else:facts[fid]['summary']=summary
  for actor in [*event['participants'],'player']:
   grant={'actor':actor,'fact':fid,'mode':'knows'}
   if grant not in event['grants']:event['grants'].append(grant)
b['plan']={'path':'docs/harness/CHAPTER_01_CHARACTER_FLOW.md','revision':'1.5','status':'DEV_FROZEN'}
write('source/narrative/chapters/R01.json',b);write('source/narrative/sources.json',sources)
cat=read('source/narrative/catalog.json')
for c in cat['characters']:
 if c['id']=='rosa':
  c['name']='商人';c['aliases']=list(dict.fromkeys([*c.get('aliases',[]),'罗萨','商人']))
write('source/narrative/catalog.json',cat)
p=read('source/narrative/characters/rosa.json');p['name']='商人';p['aliases']=list(dict.fromkeys([*p.get('aliases',[]),'罗萨','商人']));p['voice']['chapter_one_1_5']='固定女性商人，用户要求显示职业称呼商人；稳定ID rosa/c1rosa保持。业务表达平常利落，不用玩法术语代替说话。';write('source/narrative/characters/rosa.json',p)
for who,text in [('vilerena','熟悉他的大姐姐，会因眼前小事逗他，也担心这次任务风险；邀请只叫他找鲁恩，不提前列全套试炼。关心可以直问，避免用考核点评或反复劝阻表达。'),('noen','有判断、能正常交谈，明确安排可只答知道了，不复述先做什么再做什么；面对薇蕾娜的玩笑认真朴实，偶有关心，不熟练反调情。')]:
 p=read('source/narrative/characters/'+who+'.json');p['voice']['chapter_one_1_5']=text;write('source/narrative/characters/'+who+'.json',p)
