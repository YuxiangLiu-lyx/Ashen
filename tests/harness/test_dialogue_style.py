import copy,json,sys,unittest,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];sys.path.insert(0,str(ROOT/'tools/harness'))
from dialogue_style import occurrences,scene_risks,corpus_report
from narrative_copyedit import validate,row_hash
from task import narrative_evidence

class DialogueStyleTests(unittest.TestCase):
    def test_batch_evidence_rejects_missing_duplicate_and_outside_paths(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            for name in ['a','b','c','d']:(root/name).write_text('{}')
            rows=[{'context':'a','draft':'b','review':'c'},{'context':'a','draft':'d','review':'c'}]
            got=narrative_evidence(rows,root);self.assertEqual(len(got),2);self.assertEqual(got[0]['context_sha256'],got[1]['context_sha256'])
            for bad in [[],rows+[rows[0]],[{'context':'../outside','draft':'b','review':'c'}],[{'context':'a','draft':'missing','review':'c'}]]:
                with self.assertRaises((ValueError,OSError)):narrative_evidence(bad,root)

    def test_search_does_not_misread_common_words_or_questions(self):
        self.assertEqual(occurrences('别人告别时特别高兴。要不要去？不要紧。别扭。'),[])
        self.assertEqual([r['form'] for r in occurrences('诺恩，别逞强。别总熬夜。别再问。别把它扔了。别让我担心。不要动。不必硬撑。无需动手。不用逞能。')],['别','别总','别再','别把','别让我','不要','不必','无需','不用'])
    def test_emergency_commands_are_candidates_not_automatic_failures(self):
        r=scene_risks([['卫兵','别动！'],['医师','别拔，链头还在里面！']]);self.assertEqual(len(r['candidates']),2);self.assertTrue(r['repeated_across_speakers']);self.assertTrue(r['clusters']);self.assertNotIn('status',r);self.assertNotIn('score',r)
    def test_corpus_counts_include_scenes_without_candidates(self):
        r=corpus_report({'a':[['甲','东西到了吗？']],'b':[['乙','不用，我已经吃过。']]});self.assertEqual((r['scene_count'],r['line_count'],r['candidate_line_count']),(2,2,1));self.assertEqual(r['purpose'],'risk_discovery_only')
    def test_copyedit_cannot_be_general_readiness_or_change_speakers_pages_or_unreviewed_lines(self):
        baseline=json.loads((ROOT/'docs/dialogue-hud/baseline/full-corpus.json').read_text())['scenes'];before=baseline['ratDone']['text'];after=copy.deepcopy(before);after[-1][1]='保住粮食当然算大事。她还在里面等你呢。'
        context={'kind':'copyedit_context','scene':'ratDone','ready_to_write':False,'ready_to_copyedit':True,'before':before,'static':True,'baseline_sha256':row_hash(before),'baseline_commit':'e82ca67c6693900b83ee58ea031933047f3a531f','profiles':['oren'],'scene_context':{k:'测试场景保全反例，不用于文学验收。'for k in ['purpose','relationship','known_information','retained_outcome','caller','limitations']}}
        draft={'kind':'copyedit','scene':'ratDone','style_policy_version':2,'rows':after,'semantic_change':False,'line_judgments':[{'line':9,'reason':'测试保留粮仓结果','preserves_information':True}],'editorial':{'reviewer':'test fixture',**{k:{'verdict':'pass','evidence':'counterexample fixture'}for k in ['character','language','clarity','continuity','information_isolation','foreshadowing','emotion_relationship']},'negative_imperatives':{'scene_judgment':'无剩余候选','decisions':[]}}}
        runtime={'ratDone':{'sha256':row_hash(after)}};self.assertEqual(validate(draft,context,runtime)[0],[])
        for field,value in [('rows',['bad-row']),('semantic_change',True),('line_judgments',[]),('rows',after[:-1]),('style_policy_version',1)]:
            d=copy.deepcopy(draft);d[field]=value;self.assertTrue(validate(d,context,runtime)[0],field)
        c=copy.deepcopy(context);c['baseline_commit']='nonexistent-commit';self.assertTrue(validate(draft,c,runtime)[0])
        c=copy.deepcopy(context);c['ready_to_write']=True;self.assertTrue(validate(draft,c,runtime)[0])
        c=copy.deepcopy(context);c['before'][0][1]='篡改旧稿';self.assertTrue(validate(draft,c,runtime)[0])
        d=copy.deepcopy(draft);d['rows'][0][0]='薇蕾娜';self.assertTrue(validate(d,context,runtime)[0])
if __name__=='__main__':unittest.main()
