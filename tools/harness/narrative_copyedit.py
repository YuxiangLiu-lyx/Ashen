"""Narrow review for existing full-scene copyedits; never grants new canon/knowledge."""
import hashlib
import json
import subprocess
from pathlib import Path
from common import ROOT, read_json, git, inventory, fingerprint
from dialogue_style import scene_risks
DIMENSIONS=['character','language','clarity','continuity','information_isolation','foreshadowing','emotion_relationship']

def row_hash(rows):
    return hashlib.sha256(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()

def validate(draft,context,runtime,root=ROOT):
    errors=[]
    def fail(message):errors.append(message)
    if draft.get('kind')!='copyedit' or context.get('kind')!='copyedit_context':fail('Explicit copyedit context and draft required')
    if context.get('ready_to_write') is not False:fail('Copyedit context must not claim general narrative readiness')
    if not context.get('ready_to_copyedit'):fail('Copyedit context is unresolved')
    if draft.get('style_policy_version',0)<2:fail('Copyedits require style policy 2')
    before=context.get('before',[]);after=draft.get('rows',[])
    valid_rows=lambda rows:isinstance(rows,list) and all(isinstance(r,list) and len(r)==2 and all(isinstance(v,str) for v in r) for r in rows)
    if not valid_rows(before) or not valid_rows(after):return ['Copyedit requires speaker/text row pairs'],{}
    if not before or len(before)!=len(after):fail('Copyedit cannot add/remove pages')
    elif any(a[0]!=b[0] for a,b in zip(before,after)):fail('Copyedit cannot change speakers')
    if context.get('scene')!=draft.get('scene'):fail('Copyedit scene mismatch')
    if context.get('baseline_sha256')!=row_hash(before):fail('Copyedit baseline was altered')
    commit=context.get('baseline_commit','')
    commit_ok=bool(commit) and subprocess.run(['git','cat-file','-t',commit],cwd=root,capture_output=True,text=True).stdout.strip()=='commit'
    if not commit_ok:fail('Copyedit baseline commit missing')
    if context.get('static') and commit_ok:
        try:
            baseline=json.loads(git('show',commit+':source/narrative/runtime-index.json',root=root))
            if baseline['scenes'][draft['scene']]['sha256']!=row_hash(before):fail('Before-text differs from committed installed dialogue')
        except (KeyError,ValueError,subprocess.CalledProcessError):fail('Missing committed static baseline')
    elif not context.get('static'):
        if not context.get('producer') or not context.get('baseline_check_label'):fail('Dynamic baseline requires producer and recorded baseline check')
        try:
            original=read_json(context['baseline_corpus'],root)['scenes'][draft['scene']]
            if original['sha256']!=row_hash(before):fail('Dynamic before-text differs from verified baseline corpus')
        except (KeyError,OSError,ValueError):fail('Dynamic baseline corpus missing')
    actual=runtime.get(draft.get('scene'),{})
    if actual.get('sha256')!=row_hash(after):fail('Draft is not the installed whole scene')
    for key in ['purpose','relationship','known_information','retained_outcome','caller','limitations']:
        if not context.get('scene_context',{}).get(key):fail('Missing scene context: '+key)
    if not context.get('profiles'):fail('Read the participating character profiles')
    if draft.get('semantic_change') is not False:fail('Story/knowledge changes require normal event-scoped review')
    judgments=draft.get('line_judgments',[])
    changes={i for i,(a,b)in enumerate(zip(before,after))if a!=b}
    if {j.get('line') for j in judgments}!=changes or len(judgments)!=len(changes):fail('Each changed line requires one editorial comparison')
    for j in judgments:
        if not j.get('reason') or j.get('preserves_information') is not True:fail('Changed line lacks preservation judgment')
    editorial=draft.get('editorial',{})
    if not editorial.get('reviewer'):fail('Named editorial reviewer required')
    for key in DIMENSIONS:
        finding=editorial.get(key,{})
        if finding.get('verdict')!='pass' or not finding.get('evidence'):fail('Missing contextual editorial judgment: '+key)
    # Every remaining candidate receives a contextual decision. There is no ban/score.
    candidates=scene_risks(after)
    decisions=editorial.get('negative_imperatives',{}).get('decisions',[])
    expected={c['line']for c in candidates['candidates']}
    if {d.get('line')for d in decisions}!=expected or len(decisions)!=len(expected):fail('Review every remaining negative-imperative candidate')
    if any(d.get('decision')!='retain' or not d.get('reason') for d in decisions):fail('Explain the actual warning/refusal/statement in context')
    if not editorial.get('negative_imperatives',{}).get('scene_judgment'):fail('Whole-scene repetition judgment missing')
    return errors,candidates

def review(draft,root=ROOT):
    from narrative import safe_file,encoded
    context=read_json(str(safe_file(draft['context'],root)),root)
    runtime=read_json(str(safe_file(draft['corpus'],root)),root)['scenes']
    errors,risks=validate(draft,context,runtime,root)
    return {'status':'failed' if errors else 'passed','errors':errors,'warnings':risks,
            'source_fingerprint':fingerprint(inventory(root)),
            'draft_sha256':hashlib.sha256(encoded(draft)).hexdigest(),
            'stage':{'chapter':draft['chapter'],'scene':draft['scene'],'position':'existing_full_scene','at':context['baseline_commit'],'coverage':'copyedit_only'},
            'editorial':draft['editorial'],'limits':['No new facts, character progression, event order or future knowledge is authorized by this review.','Later-chapter missing knowledge remains unresolved; this is a before/after preservation review, not curated chapter coverage.']}
