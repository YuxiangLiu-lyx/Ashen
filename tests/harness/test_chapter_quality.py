import copy
import sys
import tempfile
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from common import inventory, fingerprint, digest
from chapter_quality import validate_report, task_errors, REVIEW_FIELDS, CLASSES, ROUTES
from context import route

class ChapterQualityTests(unittest.TestCase):
    def test_no_state_replay_or_missing_evidence_can_pass(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            path = root / 'proof.json'
            path.write_text('{}')
            row = {'status': 'pass', 'reason': 'fixture for gate validation, not gameplay proof',
                   'evidence': [{'path': 'proof.json', 'sha256': digest(path)}]}
            report = {'source_fingerprint': fingerprint(inventory(root)),
                      'human_full_observation': {**row, 'observer_kind': 'human', 'scope': 'entire_normal_input_route'},
                      'review': {k: copy.deepcopy(row) for k in REVIEW_FIELDS},
                      'natural_play': {k: {**row, 'input_method': 'normal_ui', 'ending_phase': 12,
                                           'state_mutation_hooks': False} for k in CLASSES},
                      'economy': {k: {**row, 'basis': 'runtime_events', 'actual_snapshot': 'proof.json'} for k in ROUTES},
                      'balance': {**row, 'minimum_seeds_per_class_encounter': 12}, 'compatibility': row}
            self.assertEqual(validate_report(report, root), [])
            bad = copy.deepcopy(report)
            bad['human_full_observation']['observer_kind'] = 'assistant'
            self.assertTrue(validate_report(bad, root))
            for cls in CLASSES:
                bad = copy.deepcopy(report)
                bad['natural_play'][cls]['state_mutation_hooks'] = True
                self.assertTrue(validate_report(bad, root))
            bad = copy.deepcopy(report)
            bad['review']['pacing']['status'] = 'unverified'
            self.assertTrue(validate_report(bad, root))
            self.assertTrue(task_errors({'chapter_quality': 'V01C01'}, root))
            path.write_text('modified')
            self.assertTrue(validate_report(report, root))

    def test_expansion_routing_and_real_core_commands(self):
        result = route('第一章扩充 缀纹 符文 精英掉落')
        paths = {c['path'] for c in result['contexts']}
        self.assertIn('dist/chapter-one-expansion-data.js', paths)
        self.assertIn('dist/chapter-one-expansion-save.js', paths)
        check = (ROOT / 'tools/harness/check.py').read_text()
        for name in ['expansion', 'crafting', 'elites']:
            self.assertIn('tests/chapter-one-' + name + '.test.mjs', check)
        self.assertIn('tests/browser-chapter-one-expansion.mjs', check)
