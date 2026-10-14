"""Real CLI retrieval plus counterexamples for provenance and information isolation."""
import copy
from contextlib import contextmanager
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tools/harness'))
from common import inventory, write_json, fingerprint, digest
from index import generate
from narrative import audit, resolve, review, context_packet, DIMENSIONS, task_errors


def cli(*args,root=ROOT):
    p=subprocess.run([sys.executable,*args],cwd=root,capture_output=True,text=True,timeout=45)
    return p.returncode,json.loads(p.stdout)


def draft():
    return {'chapter':'R01','scene':'chapterEnd','actors':['noen','elyria'],
            'brief':{k:'测试原有水渠交接：拒绝释放与受迫同行，角色仍有冲突。' for k in
                     ['information','purposes','outcome','causality','emotional_basis','gameplay_handoff']},
            'lines':[{'speaker':'elyria','text':'让我回去。','claims':[], 'no_fact_reason':'提出请求，不新增世界事实。'}],
            'editorial':{'reviewer':'test fixture; not a production literary review',
                         **{k:{'verdict':'pass','evidence':'仅用于规则反例；不声称真实新对白已通过文学验收。'} for k in DIMENSIONS}}}


@contextmanager
def sandbox():
    with tempfile.TemporaryDirectory(prefix='ashen-narrative-') as td:
        root=Path(td)
        for name in inventory():
            path=root/name;path.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/name,path)
        for command in [['git','init','-q'],['git','add','.'],['git','-c','user.name=Narrative Test','-c','user.email=test@example.invalid','commit','-qm','fixture']]:
            subprocess.run(command,cwd=root,check=True,stdout=subprocess.DEVNULL)
        write_json(root/'source/harness/index.json',generate(root))
        yield root


class NarrativeEndToEndTests(unittest.TestCase):
    def test_real_cli_locates_requested_characters_and_style(self):
        code,result=cli('tools/harness/context.py','--task','重写第一章诺恩和艾莉娅的这段对白')
        self.assertEqual(code,0)
        p=result['narrative'];self.assertEqual(set(p['characters']),{'noen','elyria'})
        self.assertFalse(p['ready_to_write']);self.assertTrue(p['selection']['stage_candidates'])
        paths={c['path'] for c in result['contexts']}
        self.assertIn('docs/harness/DIALOGUE_STYLE.md',paths)
        self.assertIn('docs/harness/DIALOGUE_STYLE_SAMPLES.md',paths)
        self.assertNotIn('source/narrative/characters/chengli.json',paths)

    def test_real_cli_daily_context_requires_time_then_resolves(self):
        _,unknown=cli('tools/harness/context.py','--task','新增薇蕾娜与诺恩的日常互动')
        self.assertFalse(unknown['narrative']['ready_to_write'])
        self.assertEqual(set(unknown['narrative']['characters']),{'vilerena','noen'})
        self.assertTrue(unknown['narrative']['selection']['stage_candidates'])
        both,_=context_packet('薇蕾娜、蕾娜与诺恩的对话')
        self.assertEqual(set(both['characters']),{'vilerena','lena','noen'})
        code,known=cli('tools/harness/narrative.py','context','--chapter','R01','--scene','sisterIdle','--at','contract','--actor','noen','--actor','vilerena')
        self.assertEqual(code,0);self.assertTrue(known['ready_to_write'])
        self.assertNotIn('F-C1-ABDUCTION',known['knowledge']['noen'])
        self.assertIn('F-C1-COMMISSION',known['knowledge']['noen'])
        self.assertEqual(known['stage']['at'],'R01:contract')

    def test_chapter_states_and_directional_relationships_change_by_events(self):
        before=resolve('R01','contract',['noen','elyria'])
        after=resolve('R02','ch2Spillway',['noen','elyria'],'after')
        self.assertNotEqual(before['states']['noen'],after['states']['noen'])
        self.assertIn('承认违约',after['states']['noen']['conflicts'][0])
        self.assertNotEqual(after['relationships']['elyria']['noen'],after['relationships']['noen']['elyria'])
        self.assertEqual(after['relationships']['elyria']['noen']['trust'],'承诺已经破裂')

    def test_player_sees_private_scene_heroes_do_not(self):
        s=resolve('R01','c1HiddenPairArrangement',['noen','elyria','vilerena','rune'],'after')
        for actor in ['player','vilerena','rune']:self.assertIn('F-C1-ALT-DOOR',s['knowledge'][actor])
        for actor in ['noen','elyria']:self.assertNotIn('F-C1-ALT-DOOR',s['knowledge'][actor])
        s2=resolve('R02','ch2TargetBefore',['noen','elyria'],'after')
        self.assertIn('F-C2-ABUSE',s2['knowledge']['player'])
        self.assertNotIn('F-C2-ABUSE',s2['knowledge']['noen'])

    def test_same_characters_do_not_receive_planned_betrayal(self):
        code,p=cli('tools/harness/narrative.py','context','--task','第二章真相揭露','--scene','darkExileV9','--position','after')
        self.assertEqual(code,0)
        self.assertIn('F-C2-EXILE-ACCOUNT',p['knowledge']['vilerena'])
        self.assertNotIn('F-INTENT-NO-RESCUE',p['knowledge']['vilerena'])
        self.assertTrue(any(c['id']=='DIFF-C2-EXILE' for c in p['conflicts']))
        self.assertTrue(all(not i['applies_to_runtime'] for i in p['author_outline']))

    def test_collision_task_does_not_load_narrative(self):
        code,p=cli('tools/harness/context.py','--task','修复一个地图碰撞Bug')
        self.assertEqual(code,0);self.assertNotIn('narrative',p)
        self.assertFalse(any(c['path'].startswith('source/narrative/') or 'DIALOGUE_STYLE' in c['path'] for c in p['contexts']))

    def test_budget_reports_omissions_and_honors_utf8_bytes(self):
        _,p=cli('tools/harness/context.py','--task','第一章剧情','--max-files','1','--budget','512')
        self.assertEqual(p['status'],'budget_limited')
        self.assertLessEqual(p['total_context_bytes'],512)
        self.assertFalse(p['narrative']['ready_to_write'])
        self.assertTrue(p['deferred'])

    def test_invalid_chapter_scene_pair_fails_cli(self):
        code,p=cli('tools/harness/context.py','--task','剧情','--chapter','R01','--scene','ch2Spillway')
        self.assertEqual(code,2);self.assertEqual(p['status'],'invalid_selection')
        code,p=cli('tools/harness/narrative.py','context','--chapter','V01C08','--scene','v25C8Bind')
        self.assertEqual(code,2)

    def test_later_runtime_is_partial_and_not_a_new_literary_plan(self):
        code,p=cli('tools/harness/narrative.py','context','--chapter','R08','--scene','v25C8Bind','--position','after')
        self.assertEqual(code,0);self.assertFalse(p['ready_to_write'])
        self.assertEqual(p['stage']['coverage'],'basic_runtime_only')
        self.assertIn('害怕疼',p['characters']['chengli']['state']['emotion'])

    def test_optional_episodes_require_timestamp_and_do_not_advance_plot(self):
        with self.assertRaises(ValueError):resolve('R01','sisterIdle',['noen'])
        with self.assertRaises(ValueError):resolve('R01','contract',['noen'],completed=['R01:sisterIdle'])
        s=resolve('R01','assassination',['noen'],completed=['R01:sisterIdle@R01:contract'])
        self.assertIn('R01:sisterIdle',s['events_applied'])
        self.assertNotIn('R01:chapterEnd',s['events_applied'])
        with self.assertRaises(ValueError):resolve('R01','intro',['noen'],completed=['R01:sisterIdle@R01:contract'])

    def test_live_export_matches_current_records(self):
        code,p=cli('tools/harness/narrative.py','audit','--live')
        self.assertEqual(code,0,p);self.assertEqual(p['status'],'passed')
        self.assertGreaterEqual(p['counts']['characters'],80)
        self.assertEqual(p['counts']['chapters'],8)


class NarrativeCounterexampleTests(unittest.TestCase):
    def codes(self,result):return {e['code'] for e in result['errors']}

    def test_review_blocks_hero_leak_and_premature_player_reveal(self):
        d=draft();d['lines'][0]={'speaker':'noen','text':'门还有别的办法解开。','claims':[{'fact':'F-C1-ALT-DOOR','mode':'knows'}]}
        self.assertIn('KNOWLEDGE_LEAK',self.codes(review(d)))
        d['scene']='intro';d['lines'][0]['speaker']='narrator'
        self.assertIn('PLAYER_REVEAL',self.codes(review(d)))

    def test_review_blocks_future_plan_and_report_as_truth(self):
        d=draft();d.update(chapter='R02',scene='darkExileV9',actors=['vilerena','rune'],position='after')
        d['lines']=[{'speaker':'vilerena','text':'接应从未派出。','claims':[{'fact':'F-INTENT-NO-RESCUE','mode':'knows'}]}]
        self.assertIn('FUTURE_KNOWLEDGE',self.codes(review(d)))
        d['lines'][0]['claims']=[{'fact':'F-C2-EXILE-ACCOUNT','mode':'knows'}]
        self.assertIn('REPORT_AS_TRUTH',self.codes(review(d)))

    def test_absent_character_cannot_speak_even_without_fact_claim(self):
        d=draft();d['scene']='c1HiddenPairArrangement'
        self.assertIn('ABSENT_SPEAKER',self.codes(review(d)))

    def test_exact_runtime_reader_uses_final_overrides(self):
        p=subprocess.run(['node','tools/harness/narrative_runtime.mjs','--scene','intro','--text'],cwd=ROOT,capture_output=True,text=True,check=True,timeout=30)
        result=json.loads(p.stdout)
        self.assertIn('八只',json.dumps(result['text'],ensure_ascii=False))
        self.assertNotIn('六只',json.dumps(result['text'],ensure_ascii=False))

    def test_dynamic_context_reader_executes_actual_local_actions(self):
        runtime=json.loads((ROOT/'source/narrative/runtime-index.json').read_text())
        for npc,text in runtime['local_talk'].items():
            packet,_=context_packet('第一章NPC对白',scene='c1:localTalk:'+npc,at='contract')
            self.assertIn('--action',packet['runtime_reader'])
            p=subprocess.run(packet['runtime_reader'],cwd=ROOT,capture_output=True,text=True,check=True,timeout=30)
            result=json.loads(p.stdout)
            self.assertEqual(result['id'],'c1Conversation')
            self.assertEqual(result['text'][0][1],text)
            self.assertNotIn('把眼前的事记清楚',result['text'][0][1])
        packet,_=context_packet('第一章对白',chapter='R01',scene='unmappedAction')
        self.assertFalse(packet['ready_to_write']);self.assertNotIn('runtime_reader',packet)
        self.assertIn('runtime_lookup',packet)

    def test_style_warning_is_not_a_literary_failure(self):
        d=draft();d['lines'][0]['text']='先立下规矩，才能更好地走下去。'
        result=review(d)
        self.assertEqual(result['status'],'passed',result)
        self.assertTrue(any(w['code']=='STYLE_ABSTRACTION' for w in result['warnings']))
        del d['editorial']['clarity']
        self.assertIn('EDITORIAL_REQUIRED',self.codes(review(d)))

    def test_source_drift_survives_reindex_and_blocks_context(self):
        with sandbox() as root:
            path=root/'docs/harness/CHAPTER_02.md';path.write_text(path.read_text()+'\n修改后的新决定。\n')
            code,p=cli('tools/harness/context.py','--task','第二章剧情',root=root)
            self.assertEqual(code,2);self.assertEqual(p['status'],'stale')
            subprocess.run([sys.executable,'tools/harness/index.py'],cwd=root,check=True,capture_output=True)
            self.assertIn('SOURCE_DRIFT',self.codes(audit(root)))
            code,p=cli('tools/harness/narrative.py','context','--chapter','R02','--scene','darkExileV9',root=root)
            self.assertEqual(code,0);self.assertFalse(p['ready_to_write']);self.assertTrue(p['provenance_errors'])
            code,p=cli('tools/harness/narrative.py','acknowledge','--source','c2-plan','--source','c2-difference','--note','测试确认此来源改变，差异已人工核对。',root=root)
            self.assertEqual(code,0);self.assertNotIn('SOURCE_DRIFT',self.codes(audit(root)))

    def test_examples_and_withdrawn_sources_cannot_support_canon(self):
        with sandbox() as root:
            path=root/'source/narrative/chapters/R01.json';book=json.loads(path.read_text())
            original=copy.deepcopy(book)
            book['facts'][0]['sources']=['style-B'];book['facts'][0]['summary']='两人参加样本中的宴会。'
            write_json(path,book);self.assertIn('STYLE_CANON',self.codes(audit(root)))
            book=original;book['facts'][0]['sources']=['withdrawn-rebuild'];write_json(path,book)
            self.assertIn('WITHDRAWN_CANON',self.codes(audit(root)))

    def test_grant_to_absent_hero_and_plan_promotion_fail(self):
        with sandbox() as root:
            path=root/'source/narrative/chapters/R01.json';book=json.loads(path.read_text())
            e=next(e for e in book['events'] if e['scene']=='c1HiddenPairArrangement')
            e['grants'].append({'actor':'noen','fact':'F-C1-ALT-DOOR','mode':'knows'})
            write_json(path,book);codes=self.codes(audit(root))
            self.assertIn('ABSENT_LISTENER',codes);self.assertIn('KNOWLEDGE_BOUNDARY',codes)
            e['grants'][-1]['fact']='F-INTENT-NO-RESCUE';write_json(path,book)
            self.assertIn('FUTURE_KNOWLEDGE',self.codes(audit(root)))

    def test_new_unregistered_npc_and_invalid_source_are_reported(self):
        with sandbox() as root:
            path=root/'source/narrative/runtime-index.json';data=json.loads(path.read_text())
            data['scenes']['intro']['speakers'].append('未登记来客');write_json(path,data)
            self.assertIn('UNREGISTERED_CHARACTER',self.codes(audit(root)))
            path=root/'source/narrative/characters/noen.json';p=json.loads(path.read_text());p['sources']=['missing-source'];write_json(path,p)
            self.assertIn('SOURCE_REF',self.codes(audit(root)))

    def test_future_event_and_outline_cannot_be_promoted(self):
        with sandbox() as root:
            path=root/'source/narrative/chapters/R01.json';book=json.loads(path.read_text())
            book['events'][0]['grants'].append({'actor':'noen','fact':'F-C2-BREN-DEAD','mode':'knows'})
            write_json(path,book);self.assertIn('EARLY_KNOWLEDGE',self.codes(audit(root)))
            path=root/'source/narrative/outline.json';outline=json.loads(path.read_text())
            item=next(i for i in outline['items'] if i['status']=='PROPOSED');item.update(status='CONFIRMED',applies_to_runtime=True)
            write_json(path,outline);codes=self.codes(audit(root))
            self.assertIn('OUTLINE_AS_IMPLEMENTED',codes);self.assertIn('PROPOSAL_AS_CONFIRMED',codes)

    def test_real_task_attach_finish_and_tampered_evidence_gate(self):
        with sandbox() as root:
            def command(*args,expected=0):
                p=subprocess.run([sys.executable,*args],cwd=root,capture_output=True,text=True,timeout=45)
                self.assertEqual(p.returncode,expected,p.stdout+p.stderr);return p
            command('tools/harness/task.py','start','--id','narrative-fixture','--goal','第一章对白编辑测试','--accept','fixture only')
            path=root/'docs/harness/CHAPTER_01.md';path.write_text(path.read_text()+'\n本条仅为独立测试副本的维护注记。\n')
            command('tools/harness/narrative.py','acknowledge','--source','c1-retained','--note','Test-only chapter note; runtime and state retained.')
            command('tools/harness/index.py')
            out=root/'qa-export';out.mkdir()
            d=draft();d['scope']={'files':['docs/harness/CHAPTER_01.md']}
            write_json(out/'draft.json',d)
            command('tools/harness/narrative.py','context','--chapter','R01','--scene','chapterEnd','--actor','noen','--actor','elyria','--output','qa-export/context.json')
            command('tools/harness/narrative.py','review','--draft','qa-export/draft.json','--output','qa-export/review.json')
            command('tools/harness/task.py','narrative','--id','narrative-fixture','--context','qa-export/context.json','--draft','qa-export/draft.json','--review','qa-export/review.json')
            record=json.loads((root/'source/tasks/active/narrative-fixture.json').read_text())
            self.assertEqual(task_errors(record,root),[])
            original=(out/'review.json').read_text();(out/'review.json').write_text(original+' ')
            self.assertTrue(any('evidence changed' in s for s in task_errors(record,root)))
            (out/'review.json').write_text(original)
            command('tools/harness/task.py','run','--id','narrative-fixture','--label','verification','--timeout','30','--',sys.executable,'-c','print("fixture verified")')
            command('tools/harness/task.py','update','--id','narrative-fixture','--remaining','')
            command('tools/harness/task.py','finish','--id','narrative-fixture','--summary','Independent task lifecycle fixture')
            self.assertTrue((root/'source/tasks/archive/narrative-fixture.json').is_file())

    def test_changed_chapter_cannot_finish_without_review_but_tools_can(self):
        with sandbox() as root:
            baseline=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
            record={'baseline_commit':baseline}
            self.assertEqual(task_errors(record,root),[])
            p=root/'docs/harness/CHAPTER_02.md';p.write_text(p.read_text()+'\nnew scene\n')
            self.assertTrue(any('attach fresh' in e for e in task_errors(record,root)))

    def test_generic_data_dialogue_change_also_requires_review(self):
        with sandbox() as root:
            baseline=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
            p=root/'dist/data-v14.js'
            p.write_text(p.read_text()+"\nDIALOGUES.narrativeGateFixture=[['诺恩','仅用于独立副本的对白门禁测试。']];\n")
            subprocess.run([sys.executable,'tools/harness/index.py'],cwd=root,check=True,capture_output=True)
            errors=task_errors({'baseline_commit':baseline},root)
            self.assertTrue(any('attach fresh' in e and 'narrativeGateFixture' in e for e in errors),errors)

    def test_data_only_canon_error_also_blocks_task_finish(self):
        with sandbox() as root:
            baseline=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
            p=root/'source/narrative/chapters/R01.json';book=json.loads(p.read_text())
            book['facts'][0]['sources']=['style-A'];write_json(p,book)
            self.assertIn('Narrative data/provenance audit failed',task_errors({'baseline_commit':baseline},root))


if __name__=='__main__':unittest.main()
