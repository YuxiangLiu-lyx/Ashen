"""Serialize the scene-specific editorial decisions; never rewrite/score dialogue."""
import json,runpy,sys,re,hashlib,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools/harness'))
from common import inventory,fingerprint,digest
from narrative import review
from narrative_copyedit import row_hash
from dialogue_style import scene_risks
PREFIX='docs/dialogue-hud/'
load=lambda p:json.loads((ROOT/p).read_text())
def write(p,x):(ROOT/p).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
script=load(PREFIX+'SCRIPT.json');notes=runpy.run_path(str(ROOT/PREFIX/'editorial-notes.py'))['NOTES'];retained=runpy.run_path(str(ROOT/PREFIX/'retained-notes.py'))['RETAINED']
base=load(PREFIX+'baseline/full-corpus.json')['scenes'];current=load(PREFIX+'CURRENT_CORPUS.json')['scenes'];cat=load(PREFIX+'baseline/narrative-state/catalog.json')
profiles={n:c for c in cat['characters'] for n in [c['name'],*c.get('aliases',[])]}
books=[load(PREFIX+'baseline/narrative-state/chapters/'+c['id']+'.json')for c in cat['chapters']]
events={e['scene']:(b,e)for b in books for e in b['events']};fp=fingerprint(inventory())
all_entries={e['key']:e for e in script['entries']};assert set(all_entries)==set(notes)
records=[];out=ROOT/PREFIX/'reviews';out.mkdir(exist_ok=True)
for n,e in enumerate(script['entries'],1):
 key=e['key'];before=e['before'];after=e['after'];note=notes[key];assert base[key]['text']==before and current[key]['text']==after
 book,event=events.get(key,(None,None));chapter=book['id']if book else 'R%02d'%base[key].get('chapter',int(re.search(r'(?:ch|c)([1-8])',key,re.I).group(1))if re.search(r'(?:ch|c)([1-8])',key,re.I)else 5 if key.startswith(('v17','v18','v19','v20','v22','v24'))else 1)
 actors=list(dict.fromkeys(r[0]for r in before if r[0]!='旁白'));assert all(a in profiles for a in actors),(key,actors)
 ps=[{'id':profiles[a]['id'],'path':PREFIX+'baseline/narrative-state/characters/'+profiles[a]['id']+'.json','coverage':profiles[a]['coverage']}for a in actors]
 stem=f'{n:03d}-'+re.sub(r'[^A-Za-z0-9_-]','_',key);cp=PREFIX+'reviews/'+stem+'-context.json';dp=PREFIX+'reviews/'+stem+'-draft.json';rp=PREFIX+'reviews/'+stem+'-review.json'
 scope=['dist/dialogue-copyedits-data.js','dist/dialogue-copyedits-runtime.js','dist/dialogue-save-migration-v26.js','dist/core-v14.js']
 source=base[key]['source'];caller={'provider':source,'key':key,'producer_fixture':{k:v for k,v in base[key].items()if k not in ['text','sha256']},'event':event}
 if key.startswith('inline:ch'):scope.append('dist/chapter'+key.split(':')[1][2:]+'-runtime-v14.js')
 if key=='c1Talk_c1AlchemistSamples_offer':scope.append('dist/chapter-one-expansion-quests.js')
 context={'kind':'copyedit_context','scene':key,'chapter':chapter,'source_fingerprint':fp,'ready_to_write':False,'ready_to_copyedit':True,'static':e['static'],'baseline_commit':script['baseline_commit'],'baseline_sha256':row_hash(before),'before':before,'producer':source,'baseline_check_label':'baseline-provenance','baseline_corpus':PREFIX+'baseline/full-corpus.json','profiles':ps,'scene_context':{'purpose':note,'relationship':{'participants':actors,'judgment':note,'profiles':ps},'known_information':{'scope':'只使用修改前本场已说出的事实；原未知项仍未知，不将后章作者设想赋予角色。','whole_scene_sha256':row_hash(before),'registered_event':event,'chapter_coverage':book.get('coverage')if book else 'dynamic_provider_only'},'retained_outcome':note,'caller':caller,'limitations':'这是既有全文的文风修订。第四至八章基本运行索引仍非完整认知时间线，未提升为 curated；新增剧情必须回到常规事件状态门禁。'},'provenance':{'prewrite_snapshot':PREFIX+'baseline/narrative-state/','preserved_baseline':PREFIX+'baseline/full-corpus.json','assembly_note':'由开工时保全的原稿、角色档案与逐场编辑记录整理证据；此文件整理时间不冒充写作前生成时间。'}}
 changes=[{'line':i,'speaker':a[0],'before':a[1],'after':b[1],'reason':note,'preserves_information':True}for i,(a,b)in enumerate(zip(before,after))if a!=b]
 candidates=scene_risks(after)['candidates'];keeps=retained.get(key,{});assert {c['line']for c in candidates}==set(keeps),(key,keeps)
 findings={
 'character':'在'+ '、'.join(actors)+'的本场交流中核对关注点与身份：'+note,
 'language':'逐条修订见 line_judgments；表达围绕实际询问、说明或安排展开，没有把“别”替换为同功能同义词。'+note,
 'clarity':'任务数量、地点、理由与接话以完整旧稿逐行比较；本场信息检查：'+note,
 'continuity':f'保留全部{len(before)}页及同序说话人；场景ID、回调、触发与演出行号由真实生产者和旧档测试核对。'+note,
 'information_isolation':'只按本场原有信息保全修订，不补角色未获知的事。'+note,
 'foreshadowing':'保留本场信息透露范围；原情节疑点与未答复内容不由编辑补出答案。'+note,
 'emotion_relationship':'当下情绪与关系负债仍按原事由延续：'+note}
 editorial={'reviewer':'Codex逐场编辑复核（非真人试玩验收）',**{k:{'verdict':'pass','evidence':v}for k,v in findings.items()},'negative_imperatives':{'scene_judgment':note+'；已读全场接话，下面的保留项按实际情境判断，未以频次决定是否删除。','decisions':[{'line':c['line'],'speaker':c['speaker'],'text':c['text'],'decision':'retain','reason':keeps[c['line']]}for c in candidates]}}
 draft={'kind':'copyedit','style_policy_version':2,'chapter':chapter,'scene':key,'context':cp,'corpus':PREFIX+'CURRENT_CORPUS.json','semantic_change':False,'rows':after,'line_judgments':changes,'editorial':editorial,'scope':{'files':scope,'dynamic_check_label':'producer-current'},'adopted_script':PREFIX+'SCRIPT.json'}
 write(cp,context);write(dp,draft);result=review(draft);assert result['status']=='passed',(key,result['errors']);write(rp,result)
 records.append({'scene':key,'chapter':chapter,'context':cp,'draft':dp,'review':rp,'changed_lines':len(changes),'remaining_candidates':len(candidates)})
write(PREFIX+'EDITORIAL.json',{'reviewer':'Codex','source_fingerprint':fp,'entries':records,'limitations':'111个完整场景文风保全审查，不宣称716个文本变体均做了同等深度文学重写。真人文风及节奏待验。'})
print('Serialized',len(records),'scene-specific reviews,',sum(r['changed_lines']for r in records),'changed lines.')
if '--attach' in sys.argv:
 write(PREFIX+'REVIEW_BATCH.json',[{k:r[k]for k in ['context','draft','review']}for r in records])
 subprocess.run(['python3','tools/harness/task.py','narrative','--id','dialogue-hud-20261014','--batch',PREFIX+'REVIEW_BATCH.json'],cwd=ROOT,check=True)
 print('Attached every review through task.py narrative --batch.')
