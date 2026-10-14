#!/usr/bin/env python3
"""Event-scoped narrative context, provenance and annotated editorial review.

Only reads the game. Canonical prose stays in chapter scripts and installed JS.
A rule pass is not a claim that arbitrary Chinese prose has been understood.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from common import ROOT, read_json, write_json, digest, git, inventory, fingerprint

BASE = 'source/narrative/'
CATALOG = BASE + 'catalog.json'
RUNTIME = BASE + 'runtime-index.json'
LOCK = BASE + 'sources.lock.json'
STATUSES = {'RUNTIME', 'CONFIRMED', 'ADOPTED_PLAN', 'PROVISIONAL', 'PROPOSED', 'UNRESOLVED', 'WITHDRAWN'}
SOURCE_KINDS = {'runtime', 'user_confirmed', 'adopted_plan', 'provisional', 'proposal', 'unresolved', 'withdrawn', 'style_only'}
MODES = {'knows', 'believes', 'suspects', 'heard', 'misunderstands'}
DIMENSIONS = ['character', 'language', 'clarity', 'continuity', 'information_isolation', 'foreshadowing', 'emotion_relationship']


def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')


def safe_file(path, root=ROOT):
    resolved = (root / path).resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError('Path outside repository: ' + path)
    return resolved


def runtime_snapshot(root=ROOT):
    run = subprocess.run(['node', 'tools/harness/narrative_runtime.mjs'], cwd=root,
                         capture_output=True, text=True, timeout=60)
    if run.returncode:
        raise ValueError('Installed runtime export failed: ' + run.stderr[-1800:])
    data = json.loads(run.stdout)
    data['source_hashes'] = {p.relative_to(root).as_posix(): digest(p)
                             for p in sorted((root / 'dist').glob('*.js'))}
    return data


def refresh_runtime(root=ROOT):
    data = runtime_snapshot(root)
    write_json(root / RUNTIME, data)
    return data


def catalog(root=ROOT):
    return read_json(CATALOG, root)


def books(root=ROOT):
    return [read_json(c['path'], root) for c in catalog(root)['chapters']]


def normalize_chapter(value, root=ROOT):
    if value is None:
        return None
    value = str(value)
    for c in catalog(root)['chapters']:
        if value.upper() in {c['id'], c['literary_id'], str(c['runtime_chapter'])}:
            return c['id']
    raise ValueError('Unknown chapter; runtime R03–R08 have no new literary ID: ' + value)


def query(task, chapter=None, scene=None, actors=None, root=ROOT, at=None):
    cat = catalog(root)
    requested = bool(chapter or scene or actors or re.search(
        r'剧情|对白|对话|文案|伏笔|真相|人物|角色关系|知识边界|日常互动|叙事|章节策划|章节规划|分卷|分章|世界观', task, re.I))
    ids = []
    for c in cat['characters']:
        # Names alone may refer to art/combat; only opt in if dialogue intent exists.
        if any(a in task for a in [c['name'], c['id']] if len(a) > 1):
            ids.append(c['id'])
    if re.search(r'圣女', task) and 'elyria' not in ids:
        ids.append('elyria')
    for value in actors or []:
        found = next((c['id'] for c in cat['characters'] if value == c['id'] or value in c['aliases']), None)
        if not found:
            raise ValueError('Unknown character: ' + value)
        if found not in ids:
            ids.append(found)
    cs = []
    for c in cat['chapters']:
        n = c['runtime_chapter']; zh = '一二三四五六七八'[n-1]
        if re.search(rf'第(?:{n}|{zh})章|(?<!\w)chapter\s*{n}(?!\d)|(?<!\w){c["id"]}(?!\w)', task, re.I) or (c['literary_id'] and c['literary_id'].lower() in task.lower()):
            cs.append(c['id'])
    if chapter:
        cs = [normalize_chapter(chapter, root)]
    all_books = books(root) if requested else []
    if not scene:
        scenes = [e['scene'] for b in all_books for e in b['events'] if e['scene'] in task]
        if scenes:
            scene = max(scenes, key=len)
        elif (root / RUNTIME).exists():
            candidates = [s for s in read_json(RUNTIME, root)['scenes'] if re.search(r'(?<![\w])'+re.escape(s)+r'(?![\w])', task)]
            if candidates:
                scene = max(candidates, key=len)
    event = next((e for b in all_books for e in b['events'] if e['scene'] == scene or e['id'] == scene), None)
    if event:
        owner = event['id'].split(':')[0]
        if cs and owner not in cs:
            raise ValueError('Scene/chapter mismatch: ' + event['id'])
        cs = [owner]
        scene = event['scene']
        if not ids:
            ids = list(event['participants'])
    candidates = [{'event':e['id'],'scene':e['scene'],'summary':e['summary']}
                  for b in all_books if not cs or b['id'] in cs
                  for e in b['events'] if not ids or set(ids)<=set(e['participants'])]
    return {'requested': requested or bool(event), 'chapters': cs, 'scene': scene,
            'actors': ids, 'stage_candidates': candidates[:12] if not event else [],
            'needs': ([] if len(cs)==1 else ['明确单一章节']) +
            ([] if event else ['定位场景调用者与事件时点；不默认章末状态']) +
            (['重复/可选场景需 --at 指定此前的主线事件'] if event and event.get('stage_window') and not at else [])}


def resolve(chapter, scene=None, actors=None, position='before', completed=None, root=ROOT, at=None):
    chapter = normalize_chapter(chapter, root)
    all_books = books(root)
    owner = next(b for b in all_books if b['id']==chapter)
    event = next((e for e in owner['events'] if scene in [e['scene'], e['id']]), None) if scene else None
    if scene and not event:
        raise ValueError('Unmapped scene/stage: ' + scene + '; inspect callers and register its event first')
    if position not in ['before', 'after']:
        raise ValueError('position must be before/after')
    completion_specs=list(completed or [])
    actors = actors or (event['participants'] if event else ['noen', 'elyria'])
    entries = {c['id']:c for c in catalog(root)['characters']}
    if set(actors)-entries.keys():
        raise ValueError('Unknown actor')
    profiles = {a:read_json(entries[a]['path'], root) for a in actors}
    states = {a:copy.deepcopy(p['initial_state']) for a,p in profiles.items()}
    relationships = {a:copy.deepcopy(p['relationships']) for a,p in profiles.items()}
    knowledge = {a:{} for a in [*actors, 'player']}
    facts = {f['id']:f for b in all_books for f in b['facts']}
    all_events={e['id']:e for b in all_books for e in b['events']}
    positions={e['id']:(b['runtime_chapter'],e['order']) for b in all_books for e in b['events']}
    anchor=None
    if event and event.get('stage_window'):
        anchor=next((e for e in owner['events'] if at in [e['id'],e['scene']] and not e['optional']),None)
        if not anchor:raise ValueError('Repeatable scene requires --at with a mainline event: '+scene)
        lower,upper=event['stage_window']
        if not positions[lower] <= positions[anchor['id']] < positions[upper]:
            raise ValueError('Repeatable scene is unavailable at this progress')
    elif at:
        raise ValueError('--at is only for repeatable scenes; mainline scenes already have an exact time')
    main=anchor or event
    n,order=positions[main['id']] if main else (owner['runtime_chapter'],0)
    # (chapter, mainline order, mainline/optional, optional sequence).
    cutoff=(n,order,1,len(completion_specs)+1) if anchor else (n,order,0,1 if position=='after' else -1)
    schedule=[]
    for b in all_books:
        schedule.append(((b['runtime_chapter'],0,-1,0),{'id':b['id']+':initial','grants':b['initial_knowledge']}))
        for e in b['events']:
            if not e['optional']:schedule.append(((*positions[e['id']],0,0),e))
    completed_ids=set()
    for i,spec in enumerate(completion_specs):
        eid,sep,anchor_id=spec.partition('@')
        e=all_events.get(eid);when=all_events.get(anchor_id)
        if not sep or not e or not e['optional'] or not when or when['optional']:
            raise ValueError('Completed optional event requires EVENT@MAINLINE_EVENT: '+spec)
        if eid in completed_ids:raise ValueError('Duplicate optional completion: '+eid)
        completed_ids.add(eid)
        lower,upper=e['stage_window']
        if not positions[lower] <= positions[anchor_id] < positions[upper]:raise ValueError('Optional completion outside availability window: '+spec)
        key=(*positions[anchor_id],1,i)
        if key>cutoff:raise ValueError('Completed event is later than requested progress: '+spec)
        schedule.append((key,e))
    if anchor and position=='after':schedule.append((cutoff,event))
    applied=[];seen=set()
    for key,e in sorted(schedule,key=lambda x:x[0]):
        if key>cutoff:continue
        if not set(e.get('requires',[]))<=seen:
            raise ValueError('Unmet event prerequisites: '+e['id'])
        seen.add(e['id']);applied.append(e['id'])
        for g in e['grants']:
            if g['actor'] in knowledge:
                knowledge[g['actor']][g['fact']]={'mode':g['mode'],'via':e['id']}
        for a,delta in e.get('state_changes',{}).items():
            if a in states:
                states[a].update(delta);states[a]['last_change']=e['id']
        for a,changes in e.get('relationship_changes',{}).items():
            if a in relationships:
                for other,delta in changes.items():
                    relationships[a].setdefault(other,{}).update({k:v for k,v in delta.items() if v!='UNRESOLVED'})
    return {'chapter':chapter,'scene':scene,'position':position,'at':anchor['id'] if anchor else None,'stage_exact':bool(event),
            'coverage':owner['coverage'],'profiles':profiles,'states':states,'relationships':relationships,
            'knowledge':knowledge,'facts':facts,'events_applied':applied,'gaps':owner['gaps'],
            'event':event,'plan':owner['plan']}


def context_packet(task, chapter=None, scene=None, actors=None, position='before', completed=None, root=ROOT, at=None):
    q = query(task, chapter, scene, actors, root, at)
    if not q['requested']:
        return None, []
    cat = catalog(root); paths = [cat['authority'], cat['style_guide'], cat['style_samples']]
    for b in books(root):
        if b['id'] in q['chapters'] and b['plan']:
            paths.append(b['plan']['path'])
            if b['id']=='R01':paths.append('docs/harness/CHAPTER_01.md')
    entries = {c['id']:c for c in cat['characters']}
    paths += [entries[a]['path'] for a in q['actors']]
    paths += [c['path'] for c in cat['chapters'] if c['id'] in q['chapters']]
    packet = {'selection':q, 'ready_to_write':False, 'style':{'guide':cat['style_guide'], 'samples':cat['style_samples'],
              'classification':'STYLE_ONLY; events, objects and shared memories cannot be used as canon'},
              'characters':{},'knowledge':{},'facts':{}, 'seeds':[], 'conflicts':[],
              'required_scene_brief':['实际传达的信息','每个说话人的目的','预期剧情结果','因果与情绪依据','任务/动作/对话框交接'],
              'limits':['登记事件不是完整语义理解；未登记信息不得推为已知。']}
    result = None
    if len(q['chapters'])==1:
        selected_event = next((e for b in books(root) for e in b['events'] if e['scene']==q['scene']),None)
        known=bool(selected_event and (not selected_event.get('stage_window') or at))
        result = resolve(q['chapters'][0], q['scene'] if known else None, q['actors'] or None, position, completed, root,at if known else None)
        q['actors'] = list(result['profiles'])
        for a in q['actors']:
            paths.append(entries[a]['path'])
        packet['stage'] = {k:result[k] for k in ['chapter','scene','position','at','stage_exact','coverage','gaps','plan']}
        runtime=read_json(RUNTIME,root)
        if q['scene'] in runtime['scenes']:
            packet['runtime_reader']=['node','tools/harness/narrative_runtime.mjs','--scene',q['scene'],'--text']
        elif q['scene'] and q['scene'].startswith('c1:localTalk:') and q['scene'].split(':')[-1] in runtime['local_talk']:
            packet['runtime_reader']=['node','tools/harness/narrative_runtime.mjs','--action',q['scene'],'--text']
        elif q['scene']:
            packet['runtime_lookup']={'scene':q['scene'],'instruction':'查找实际动作、任务条件和 pending.lines；尚无通用读取命令。'}
        packet['ready_to_write'] = not q['needs'] and result['coverage']=='curated_mainline'
        packet['knowledge'] = result['knowledge']
        for a,p in result['profiles'].items():
            packet['characters'][a] = {'name':p['name'],'base':p['identity']['summary'],'voice':p['voice']['guidance'],
                                      'state':result['states'][a], 'relationships':{k:v for k,v in result['relationships'][a].items() if k in q['actors']},
                                      'sources':p['sources'],'profile':entries[a]['path']}
        relevant_ids = {f for grants in result['knowledge'].values() for f in grants}
        if result['event']:
            relevant_ids |= {g['fact'] for g in result['event']['grants']}
        packet['facts'] = {k:result['facts'][k] for k in relevant_ids}
        packet['seeds'] = [s for s in read_json(BASE+'foreshadowing.json', root)['seeds'] if set(s['fact_ids']) & relevant_ids]
        packet['reveal_ceiling'] = {'this_event_only':[g for g in result['event']['grants']] if result['event'] else [],
                                   'author_secrets_do_not_grant_knowledge':True}
    else:
        for a in q['actors']:
            p=read_json(entries[a]['path'], root)
            packet['characters'][a]={'name':p['name'],'base':p['identity']['summary'],'voice':p['voice']['guidance'],
                                     'state':'UNRESOLVED: choose chapter and event','profile':entries[a]['path'],'sources':p['sources']}
    selected = set(q['chapters'])
    packet['conflicts'] = [c for c in read_json(BASE+'conflicts.json', root)['conflicts']
                           if (not selected or ('R01' in selected and ('C1' in c['id'] or 'WORLD' in c['id'])) or ('R02' in selected and 'C2' in c['id']))]
    if re.search('大纲|世界观|长期|分卷|真相|伏笔', task):
        packet['author_outline'] = read_json(BASE+'outline.json', root)['items']
        packet['author_only_facts']=[f for b in books(root) if not selected or b['id'] in selected
                                    for f in b['facts'] if f['plane']!='runtime']
        seeds=read_json(BASE+'foreshadowing.json',root)['seeds']
        for seed in seeds:
            if (not selected or seed['payoff'].get('chapter') in selected or
                    (seed['planted_at'] or '').split(':')[0] in selected) and seed not in packet['seeds']:
                packet['seeds'].append(seed)
        paths += [BASE+'outline.json', BASE+'foreshadowing.json']
    sources=read_json(BASE+'sources.json',root)['sources']
    referenced=set()
    def find_refs(value):
        if isinstance(value,dict):
            referenced.update(value.get('sources',[]))
            for v in value.values():find_refs(v)
        elif isinstance(value,list):
            for v in value:find_refs(v)
    find_refs(packet)
    packet['provenance']={s:sources[s] for s in sorted(referenced) if s in sources}
    problems=audit(root)['errors']
    if problems:
        packet['ready_to_write']=False
        packet['provenance_errors']=problems
    return packet, list(dict.fromkeys(paths))


def bound_packet(packet, budget):
    """Never disguise omitted context as read. Budget is actual UTF-8 serialized bytes."""
    if packet is None:
        return None,0
    if len(encoded(packet))<=budget:
        return packet,len(encoded(packet))
    result={'selection':packet['selection'],'ready_to_write':False,'budget_limited':True,'deferred_sections':[]}
    for key,value in packet.items():
        if key in ['selection','ready_to_write']:
            continue
        trial={**result,key:value}
        # Reserve room to enumerate every omitted section.
        if len(encoded(trial))+600<=budget:
            result[key]=value
        else:
            result['deferred_sections'].append(key)
    if len(encoded(result))>budget:
        result={'ready_to_write':False,'budget_limited':True,'action':'Increase --budget; narrative context deferred'}
    return result,len(encoded(result))


def source_signature(source, runtime, root=ROOT):
    path=safe_file(source['path'],root)
    if not path.is_file():
        raise ValueError('Missing source: '+source['path'])
    if source['anchor'] not in path.read_text(encoding='utf-8'):
        raise ValueError('Missing anchor: '+source['path']+' :: '+source['anchor'])
    result={'file_sha256':digest(path)}
    if source.get('runtime_scene'):
        scene=runtime['scenes'].get(source['runtime_scene'])
        if not scene:
            raise ValueError('Missing installed scene: '+source['runtime_scene'])
        result['scene_sha256']=scene['sha256']
    return result


def acknowledge(source_ids, note, root=ROOT):
    if not note.strip():
        raise ValueError('A maintenance note explaining the source review is required')
    sources=read_json(BASE+'sources.json',root)['sources'];runtime=read_json(RUNTIME,root)
    lock=read_json(LOCK,root) if (root/LOCK).exists() else {'schema':1,'sources':{},'history':[]}
    selected=list(sources) if source_ids==['all'] else source_ids
    for sid in selected:
        if sid not in sources:raise ValueError('Unknown source: '+sid)
        lock['sources'][sid]=source_signature(sources[sid],runtime,root)
    lock['history'].append({'commit':git('rev-parse','HEAD',root=root),'sources':selected,'note':note})
    write_json(root/LOCK,lock)
    return {'acknowledged':selected,'note':note}


def audit(root=ROOT, live=False):
    errors=[];warnings=[]
    def error(code,where,message):errors.append({'code':code,'where':where,'message':message})
    try:
        cat=catalog(root); all_books=books(root); runtime=read_json(RUNTIME,root)
        sources=read_json(BASE+'sources.json',root)['sources'];lock=read_json(LOCK,root)
    except (OSError,KeyError,ValueError) as exc:
        return {'status':'failed','errors':[{'code':'MISSING_DATA','message':str(exc)}],'warnings':[]}
    actual_hashes={p.relative_to(root).as_posix():digest(p) for p in sorted((root/'dist').glob('*.js'))}
    if actual_hashes!=runtime.get('source_hashes'):
        error('RUNTIME_INDEX_STALE',RUNTIME,'Run index.py; then review affected curated records. Reindexing does not acknowledge source drift.')
    if live:
        observed=runtime_snapshot(root)
        if observed!=runtime:error('RUNTIME_EXPORT_DIFF',RUNTIME,'Installed runtime differs from registered snapshot')
    for sid,s in sources.items():
        if s.get('kind') not in SOURCE_KINDS:error('SOURCE_KIND',sid,'Unknown authority class')
        try:
            current=source_signature(s,runtime,root)
            if lock['sources'].get(sid)!=current:
                error('SOURCE_DRIFT',sid,{'source':s['path'],'anchor':s['anchor'],'action':'review records, then acknowledge --source '+sid+' --note ...'})
        except ValueError as exc:error('SOURCE_MISSING',sid,str(exc))
    def refs(obj,where,allow_plan=True):
        if isinstance(obj,dict):
            if 'sources' in obj:
                if not isinstance(obj['sources'],list) or not obj['sources']:error('SOURCE_REQUIRED',where,'Nonempty source IDs required')
                else:
                    for sid in obj['sources']:
                        s=sources.get(sid)
                        if not s:error('SOURCE_REF',where,sid)
                        elif s['kind']=='style_only':error('STYLE_CANON',where,'Style sample cannot support canonical records: '+sid)
                        elif s['kind']=='withdrawn' and obj.get('status')!='WITHDRAWN':error('WITHDRAWN_CANON',where,sid)
                        elif not allow_plan and s['kind']!='runtime':error('NON_RUNTIME_EVENT',where,sid)
            if 'status' in obj and obj['status'] not in STATUSES|{'OPEN','ISOLATED','DEV_FROZEN','SCRIPT_READY','OUTLINE','IMPLEMENTED'}:error('STATUS',where,str(obj['status']))
            for k,v in obj.items():
                if k!='sources':refs(v,where+'/'+k)
        elif isinstance(obj,list):
            for i,v in enumerate(obj):refs(v,where+'/'+str(i))
    ids=[c['id'] for c in cat['characters']]
    if len(set(ids))!=len(ids):error('DUPLICATE_ID',CATALOG,'character')
    profiles={}
    required={'identity','values','long_term_goal','fears','strengths','limits','flaws','voice','initial_state','relationships','future_growth','gaps','sources'}
    for c in cat['characters']:
        try:
            p=read_json(c['path'],root);profiles[c['id']]=p
            if p['id']!=c['id'] or p['name']!=c['name']:error('PROFILE_ID',c['path'],'Catalog mismatch')
            if not required<=p.keys():error('PROFILE_FIELDS',c['path'],sorted(required-p.keys()))
            refs(p,c['path'])
            for other in p['relationships']:
                if other not in ids:error('RELATION_ACTOR',c['path'],other)
        except (OSError,ValueError,KeyError) as exc:error('PROFILE_INVALID',c['path'],str(exc))
    registered_names={alias for p in profiles.values() for alias in p['aliases']}
    for scene,s in runtime['scenes'].items():
        for speaker in s['speakers']:
            if speaker!='旁白' and speaker not in registered_names:error('UNREGISTERED_CHARACTER',scene,speaker)
    for npc,record in runtime['npcs'].items():
        if record['name'] not in registered_names and record['name']!='主祭卡德兰':error('UNREGISTERED_NPC',npc,record['name'])
    facts={};events={};order={};seen_scenes=set()
    for b in all_books:
        refs(b,b['id'])
        if b['runtime_chapter']>2 and b['literary_id'] is not None:error('LITERARY_MAPPING',b['id'],'Later literary chapters unresolved')
        for f in b['facts']:
            if f['id'] in facts:error('DUPLICATE_ID',b['id'],f['id'])
            facts[f['id']]=f
            if f['plane'] not in ['runtime','intent','plan']:error('FACT_PLANE',f['id'],f['plane'])
            if f['plane']=='runtime' and (f['status']!='RUNTIME' or any(sources.get(s,{}).get('kind')!='runtime' for s in f['sources'])):error('PLAN_AS_RUNTIME',f['id'],'Runtime fact requires observed runtime provenance')
        for i,e in enumerate(b['events']):
            if e['id'] in events or e['scene'] in seen_scenes:error('DUPLICATE_ID',b['id'],e['id'])
            if e['order']!=i+1:error('EVENT_ORDER',e['id'],'Orders must be contiguous within chapter')
            events[e['id']]=e;seen_scenes.add(e['scene']);order[e['id']]=(b['runtime_chapter'],e['order'])
            refs(e,e['id'],allow_plan=False)
            if e['scene'] not in runtime['scenes'] and not (e['scene'].startswith('c1:') and e.get('trigger')):error('SCENE_MISSING',e['id'],e['scene'])
            for actor in set(e['participants'])|set(e['state_changes'])|set(e['relationship_changes']):
                if actor not in profiles:error('EVENT_ACTOR',e['id'],actor)
            for a,changes in e['relationship_changes'].items():
                for other in changes:
                    if other not in profiles:error('RELATION_ACTOR',e['id'],other)
    for b in all_books:
        for e in [{'id':b['id']+':initial','grants':b['initial_knowledge']},*b['events']]:
            for g in e['grants']:
                f=facts.get(g['fact'])
                if g['actor'] not in profiles and g['actor']!='player':error('KNOWLEDGE_ACTOR',e['id'],g['actor'])
                if 'participants' in e and g['actor'] not in [*e['participants'],'player']:error('ABSENT_LISTENER',e['id'],g['actor'])
                if g['mode'] not in MODES:error('KNOWLEDGE_MODE',e['id'],g['mode'])
                if not f:error('FACT_REF',e['id'],g['fact'])
                elif f['plane']!='runtime':error('FUTURE_KNOWLEDGE',e['id'],g['fact'])
                elif f['truth'] in ['reported_claim','unreliable_report'] and g['mode']=='knows':error('REPORT_AS_TRUTH',e['id'],g['fact'])
                if f and e['id'].endswith(':initial') and g['actor'] not in f.get('initial_holders',[]):
                    error('UNSUPPORTED_INITIAL_KNOWLEDGE',e['id'],g['fact'])
                if f and not e['id'].endswith(':initial'):
                    source_scenes={sources.get(s,{}).get('runtime_scene') for s in f['sources']}
                    origins=[order[k] for k,v in events.items() if v['scene'] in source_scenes]
                    if origins and order[e['id']]<min(origins):error('EARLY_KNOWLEDGE',e['id'],{'fact':g['fact'],'sources':f['sources']})
            for predecessor in e.get('requires',[]):
                if predecessor not in order or order[predecessor]>=order[e['id']]:error('EVENT_CAUSALITY',e['id'],predecessor)
            if e.get('optional'):
                window=e.get('stage_window',[])
                if (len(window)!=2 or any(k not in events for k in window) or
                    any(events[k]['optional'] for k in window) or order[window[0]]>=order[window[1]] or
                    any(k.split(':')[0]!=b['id'] for k in window)):
                    error('OPTIONAL_WINDOW',e['id'],'Two ordered mainline anchors in the same chapter are required')
    seeds=read_json(BASE+'foreshadowing.json',root)['seeds']
    for s in seeds:
        refs(s,s['id'])
        if s['state'] not in ['planned','planted','partially_revealed','paid_off','abandoned']:error('SEED_STATE',s['id'],s['state'])
        if not set(s['fact_ids'])<=facts.keys():error('SEED_FACT',s['id'],'Unknown fact')
        if s['state'] in ['planted','partially_revealed','paid_off'] and s['planted_at'] not in events:error('SEED_EVENT',s['id'],'Needs actual planted event')
        if s['state'] in ['planted','partially_revealed','paid_off'] and any(facts.get(f,{}).get('plane')!='runtime' for f in s['fact_ids']):error('PLANNED_SEED_AS_SHOWN',s['id'],'Unimplemented secrets have not been shown')
    if len({s['id'] for s in seeds})!=len(seeds):error('DUPLICATE_ID','seeds','Duplicate seed')
    outline=read_json(BASE+'outline.json',root)
    refs(outline,'outline')
    for item in outline['items']:
        if item.get('applies_to_runtime'):error('OUTLINE_AS_IMPLEMENTED',item['id'],'Use verified runtime events instead')
        if item['status']=='CONFIRMED' and not any(sources.get(s,{}).get('kind')=='user_confirmed' for s in item['sources']):error('PROPOSAL_AS_CONFIRMED',item['id'],'Confirmed author direction needs user-confirmed provenance')
    refs(read_json(BASE+'conflicts.json',root),'conflicts')
    warnings+=read_json(BASE+'conflicts.json',root)['conflicts']
    for contract in cat.get('knowledge_contracts',[]):
        e=events[contract['event']]
        grants={g['actor'] for g in e['grants'] if g['fact']==contract['fact']}
        if grants!=set(contract['recipients']):error('KNOWLEDGE_BOUNDARY',e['id'],{'fact':contract['fact'],'required':contract['recipients'],'sources':contract['sources']})
        if contract.get('runtime_token'):
            probe=runtime['knowledge'][e['scene']]
            aliases={'hero':'noen','saint':'elyria','player':'player'}
            actual={aliases[a] for a,fs in probe.items() if contract['runtime_token'] in fs}
            if actual!=set(contract['runtime_recipients']):error('RUNTIME_KNOWLEDGE_CHANGED',e['id'],sorted(actual))
    return {'status':'failed' if errors else 'passed','errors':errors,'warnings':warnings,
            'counts':{'characters':len(profiles),'chapters':len(all_books),'events':len(events),'facts':len(facts),'seeds':len(seeds)},
            'limits':['Literary quality and unannotated implications require contextual editorial review.',
                      'Known runtime/intent differences are reported, not silently rewritten.']}


def review(draft, root=ROOT):
    report=audit(root)
    errors=list(report['errors']);warnings=[]
    def err(code,where,message):errors.append({'code':code,'where':where,'message':message})
    required={'chapter','scene','actors','lines','brief','editorial'}
    if not required<=draft.keys():
        return {'status':'failed','errors':[{'code':'DRAFT_FIELDS','message':sorted(required-draft.keys())}],'warnings':[]}
    for key in ['information','purposes','outcome','causality','emotional_basis','gameplay_handoff']:
        if not draft['brief'].get(key):err('SCENE_BRIEF',key,'Explain this scene in context')
    try:
        state=resolve(draft['chapter'],draft['scene'],draft['actors'],draft.get('position','before'),draft.get('completed'),root,draft.get('at'))
        after=resolve(draft['chapter'],draft['scene'],draft['actors'],'after',draft.get('completed'),root,draft.get('at'))
    except (KeyError,ValueError) as exc:
        return {'status':'failed','errors':[{'code':'STAGE','message':str(exc)}],'warnings':[]}
    if not state['stage_exact']:err('STAGE','scene','An exact event is required')
    if state['coverage']!='curated_mainline':warnings.append({'code':'PARTIAL_STATE','message':'Later chapter state is incomplete; review and register missing event changes before writing.'})
    facts=state['facts'];known=copy.deepcopy(state['knowledge'])
    for i,line in enumerate(draft['lines']):
        if not isinstance(line,dict) or not {'speaker','text','claims'}<=line.keys():
            err('LINE_FORMAT',i,'Each line requires speaker,text,claims');continue
        speaker=line['speaker'];text=line['text']
        if speaker not in [*draft['actors'],'narrator']:err('SPEAKER',i,speaker)
        if speaker!='narrator' and speaker not in state['event']['participants']:
            err('ABSENT_SPEAKER',i,{'speaker':speaker,'scene':state['event']['id'],'sources':state['event']['sources']})
        if not line['claims'] and not line.get('no_fact_reason'):err('UNANNOTATED_LINE',i,'Explain why this line carries no factual claim')
        for claim in line['claims']:
            fid=claim.get('fact');f=facts.get(fid);mode=claim.get('mode','knows')
            if not f:err('FACT_REF',i,fid);continue
            if f['plane']!='runtime':err('FUTURE_KNOWLEDGE',i,{'fact':fid,'sources':f['sources']});continue
            actor='player' if speaker=='narrator' else speaker
            available=known.get(actor,{}).get(fid)
            # Explicit disclosures only at this event's registered reveal ceiling.
            if not available and claim.get('disclosure'):
                available=next(({'mode':g['mode'],'via':state['event']['id']} for g in state['event']['grants'] if g['actor']==actor and g['fact']==fid),None)
            if not available:err('KNOWLEDGE_LEAK',i,{'actor':actor,'fact':fid,'sources':f['sources']})
            elif mode=='knows' and available['mode']!='knows':err('BELIEF_AS_FACT',i,{'fact':fid,'actual':available['mode']})
            if mode not in MODES:err('CLAIM_MODE',i,mode)
            if f['truth'] in ['reported_claim','unreliable_report'] and mode=='knows':err('REPORT_AS_TRUTH',i,fid)
            if fid not in after['knowledge']['player']:err('PLAYER_REVEAL',i,{'fact':fid,'sources':f['sources']})
        for g in line.get('learns',[]):
            if g not in state['event']['grants']:err('UNREGISTERED_DISCLOSURE',i,g)
            elif g['actor'] in known:known[g['actor']][g['fact']]={'mode':g['mode'],'via':state['event']['id']}
        for fid,f in facts.items():
            if any(t in text for t in f['risk_terms']) and fid not in [x.get('fact') for x in line['claims']]:
                warnings.append({'code':'UNANNOTATED_INFORMATION','line':i,'fact':fid,'sources':f['sources'],'advice':'This may imply a fact; annotate and inspect its knowledge boundary.'})
        if re.search(r'不是.+而是|真正的.+从来|先立下规矩|命运|救赎|深渊',text):
            warnings.append({'code':'STYLE_ABSTRACTION','line':i,'advice':'核对人物此刻的交流目的；若只是作者总结，换成他要说明的具体问题。有充分身份情境依据可保留。'})
        if re.fullmatch(r'[你我可是对不起知道别说了够不知道、，。！!？?…\s]{1,14}',text):
            warnings.append({'code':'STYLE_PAUSE','line':i,'advice':'核对停顿/短答是否有情绪或无需解释的依据；不要机械缩短或补长。'})
    supplied=draft['editorial']
    if not supplied.get('reviewer'):err('EDITORIAL_REVIEWER','editorial','Record agent/editor identity and contextual judgment')
    for dimension in DIMENSIONS:
        entry=supplied.get(dimension,{})
        if entry.get('verdict') not in ['pass','revise'] or not entry.get('evidence'):
            err('EDITORIAL_REQUIRED',dimension,'Contextual finding with concrete evidence required; no numeric score')
        elif entry['verdict']=='revise':err('EDITORIAL_REVISION',dimension,entry['evidence'])
    return {'status':'failed' if errors else 'passed','errors':errors,'warnings':warnings,
            'source_fingerprint':fingerprint(inventory(root)), 'draft_sha256':hashlib.sha256(encoded(draft)).hexdigest(),
            'stage':{k:state[k] for k in ['chapter','scene','position','at','coverage']},'editorial':supplied,
            'limits':['Claims are author annotations, not automated natural-language entailment.',
                      'Style diagnostics request contextual judgment; they do not ban phrases or score literature.']}


def task_errors(record,root=ROOT):
    """Require fresh writing context and review only for creative content changes."""
    paths=git('diff','--name-only',record['baseline_commit'],root=root).splitlines()
    paths+=git('ls-files','--others','--exclude-standard',root=root).splitlines()
    report=audit(root)
    errors=['Narrative data/provenance audit failed'] if report['errors'] else []
    # Installed dialogue can change in generic data/registration files too.
    # Inspect final scene signatures before the filename-based early return.
    previous=subprocess.run(['git','show',record['baseline_commit']+':'+RUNTIME],cwd=root,capture_output=True,text=True)
    try:before=json.loads(previous.stdout) if previous.returncode==0 else None
    except ValueError:before=None
    runtime=read_json(RUNTIME,root)
    changed_scenes={s for s in set(before['scenes'])|set(runtime['scenes'])
                    if before['scenes'].get(s)!=runtime['scenes'].get(s)} if before else set()
    creative=[p for p in paths if re.match(r'docs/harness/CHAPTER_.*\.md$',p) or
              (p.startswith('dist/') and re.search(r'dialogue|story|narrative|chengli-text|chapter-one-expansion-quests|chapter-one-objectives',p))]
    if 'dist/core-v14.js' in paths:
        changed=git('diff','--unified=0',record['baseline_commit'],'--','dist/core-v14.js',root=root)
        if any(line.startswith(('+','-')) and re.search(r'knowledge|DIALOGUES|finishScene',line) for line in changed.splitlines()):
            creative.append('dist/core-v14.js')
    if not creative and not changed_scenes:return errors
    evidence_list=record.get('narrative_reviews',[])
    if not evidence_list:return errors+['Narrative content changed: attach fresh context/draft/review via task.py narrative; '+', '.join(creative+sorted(changed_scenes))]
    covered_files=set();covered_scenes=set()
    for evidence in evidence_list:
        try:
            for kind in ['context','draft','review']:
                path=safe_file(evidence[kind],root)
                if digest(path)!=evidence[kind+'_sha256']:errors.append('Narrative evidence changed: '+kind)
            context=read_json(evidence['context'],root)
            draft=read_json(evidence['draft'],root)
            result=read_json(evidence['review'],root)
            current=fingerprint(inventory(root))
            if context['source_fingerprint']!=current:errors.append('Narrative context predates current sources')
            if result.get('source_fingerprint')!=current:errors.append('Narrative review predates current sources')
            if not context['ready_to_write']:errors.append('Narrative context has unresolved stage/coverage')
            if result.get('status')!='passed' or review(draft,root).get('status')!='passed':errors.append('Narrative review failed')
            if result.get('draft_sha256')!=hashlib.sha256(encoded(draft)).hexdigest():errors.append('Narrative review belongs to another draft')
            if (context['stage']['chapter']!=normalize_chapter(draft['chapter'],root) or context['stage']['scene']!=draft['scene'] or context['stage'].get('at')!=result['stage'].get('at')):errors.append('Narrative context/draft scene mismatch')
            scope=draft.get('scope',{})
            covered_files.update(scope.get('files',[]));covered_scenes.add(draft['scene'])
            for path in scope.get('files',[]):
                match=re.search(r'CHAPTER_(\d+)',path)
                if match and normalize_chapter(int(match[1]),root)!=normalize_chapter(draft['chapter'],root):
                    errors.append('Narrative review covers the wrong chapter document: '+path)
            if draft['scene'] in changed_scenes or any(p.startswith('dist/') for p in scope.get('files',[])):
                if draft['scene'] in runtime['scenes']:
                    entries={c['id']:c['name'] for c in catalog(root)['characters']}
                    rows=[[entries.get(line['speaker'],'旁白'),line['text']] for line in draft['lines']]
                    actual=hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
                    if actual!=runtime['scenes'][draft['scene']]['sha256']:errors.append('Draft is not the installed final dialogue: '+draft['scene'])
                else:
                    checks=[c for c in record.get('checks',[]) if c['label']==scope.get('dynamic_check_label')]
                    if not checks or checks[-1]['exit_code']!=0 or checks[-1]['source_fingerprint']!=current or checks[-1]['sources_changed_during_check']:
                        errors.append('Dynamic dialogue requires a successful current task.py run check for caller/quest/flags')
        except (OSError,ValueError,KeyError) as exc:errors.append('Invalid narrative evidence: '+str(exc))
    if set(creative)-covered_files:errors.append('Narrative changed files lack review coverage: '+','.join(sorted(set(creative)-covered_files)))
    if changed_scenes-covered_scenes:errors.append('Installed scenes lack narrative review: '+','.join(sorted(changed_scenes-covered_scenes)))
    return errors


def main():
    p=argparse.ArgumentParser(description=__doc__);sub=p.add_subparsers(dest='command',required=True)
    sub.add_parser('index')
    a=sub.add_parser('audit');a.add_argument('--live',action='store_true');a.add_argument('--output')
    a=sub.add_parser('acknowledge');a.add_argument('--source',action='append',required=True);a.add_argument('--note',required=True)
    a=sub.add_parser('context');a.add_argument('--task',default='剧情对白');a.add_argument('--chapter');a.add_argument('--scene');a.add_argument('--actor',action='append');a.add_argument('--position',choices=['before','after'],default='before');a.add_argument('--completed',action='append');a.add_argument('--at');a.add_argument('--output')
    a=sub.add_parser('review');a.add_argument('--draft',required=True);a.add_argument('--output')
    args=p.parse_args()
    try:
        if args.command=='index':
            result=refresh_runtime();print('Indexed installed scenes: '+str(len(result['scenes'])));return 0
        if args.command=='acknowledge':result=acknowledge(args.source,args.note)
        elif args.command=='audit':result=audit(live=args.live)
        elif args.command=='review':result=review(read_json(args.draft))
        else:
            from index import stale
            if stale(read_json('source/harness/index.json')):raise ValueError('Stale index; run index.py')
            result,paths=context_packet(args.task,args.chapter,args.scene,args.actor,args.position,args.completed,at=args.at)
            if result is None:raise ValueError('No narrative intent')
            result['paths']=paths;result['source_fingerprint']=fingerprint(inventory())
            issues=audit()['errors']
            if issues:result['ready_to_write']=False;result['provenance_errors']=issues
        if getattr(args,'output',None):write_json(safe_file(args.output),result)
        print(json.dumps(result,ensure_ascii=False,indent=2))
        return 1 if result.get('status')=='failed' else 0
    except (OSError,ValueError,KeyError,TypeError,subprocess.SubprocessError) as exc:
        print(json.dumps({'status':'failed','error':str(exc)},ensure_ascii=False));return 2


if __name__=='__main__':raise SystemExit(main())
