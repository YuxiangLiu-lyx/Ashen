import copy
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from common import digest, fingerprint, inventory, write_json
from experience import FIELDS, requested, validate_report, task_errors
from context import route
from task import can_finish


class ExperienceTests(unittest.TestCase):
    def fixture(self, root):
        # Deliberately synthetic receipts for validator tests; not game evidence.
        p = root / 'proof.json'
        p.write_text('{"fixture":true}')
        item = {'path': 'proof.json', 'sha256': digest(p)}
        row = {'status': 'pass', 'reason': 'validator fixture', 'evidence': [item]}
        return {'schema': 1, 'kind': 'chapter', 'chapter': 'V01C01',
                'source_fingerprint': fingerprint(inventory(root)),
                'scopes': {s: {f: copy.deepcopy(row) for f in fields} for s, fields in FIELDS.items()},
                'comparison': {'classes': ['shadow', 'oath', 'ember'], 'cohorts': ['starter', 'normal', 'optimized'],
                               'same_source_snapshot': True, 'production_rules': True, 'human_win_rate_claim': False},
                'normal_input': {cls: {**copy.deepcopy(row), 'input_method': 'normal_ui',
                                      'state_mutation_hooks': False, 'ending_phase': 12} for cls in ['shadow', 'oath', 'ember']},
                'compatibility': copy.deepcopy(row),
                'human': {'status': 'pending', 'remaining': ['human observation'],
                          'playable_build': item, 'observation_template': item}}

    def test_missing_stale_tampered_or_synthetic_play_cannot_pass(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            report = self.fixture(root)
            self.assertEqual(validate_report(report, root), [])
            cases = [(['source_fingerprint'], 'old'),
                     (['comparison', 'same_source_snapshot'], False),
                     (['comparison', 'human_win_rate_claim'], True),
                     (['comparison', 'cohorts'], ['unarmed', 'normal', 'optimized']),
                     (['normal_input', 'ember', 'state_mutation_hooks'], True),
                     (['normal_input', 'shadow', 'ending_phase'], 2),
                     (['scopes', 'exploration', 'branch_value', 'evidence'], []),
                     (['human', 'playable_build'], {}), (['human', 'observation_template'], {})]
            for keys, value in cases:
                bad = copy.deepcopy(report)
                row = bad
                for key in keys[:-1]:
                    row = row[key]
                row[keys[-1]] = value
                self.assertTrue(validate_report(bad, root), keys)
            (root / 'proof.json').write_text('modified')
            self.assertTrue(validate_report(report, root))

    def test_human_pending_and_final_chapter_cannot_be_misrepresented(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            report = self.fixture(root)
            report['chapter'] = 'V01C08'
            for row in report['normal_input'].values():
                row['ending_phase'] = 38
            self.assertTrue(validate_report(report, root))
            for row in report['normal_input'].values():
                row['ending_flags'] = {'ch8Complete': True}
            self.assertEqual(validate_report(report, root), [])
            report['human'] = {**report['compatibility'], 'observer_kind': 'agent', 'observer': 'fixture', 'observed_at': 'fixture'}
            self.assertTrue(validate_report(report, root))

    def test_task_finish_requires_requested_chapters_and_retained_report_hash(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            record = {'experience_requirement': requested('全游戏RPG体验升级'), 'experience_reviews': [],
                      'checks': [], 'required_checks': [], 'remaining': [], 'blockers': []}
            self.assertTrue(task_errors(record, root))
            report = self.fixture(root)
            write_json(root / 'report.json', report)
            record['experience_reviews'] = [{'path': 'report.json', 'sha256': digest(root / 'report.json')}]
            self.assertTrue(task_errors(record, root), 'one chapter cannot replace eight')
            record['experience_requirement'] = requested('第一章RPG体验试点')
            self.assertEqual(task_errors(record, root), [])
            with patch('task.validate', return_value=[]), patch('map_quality.task_errors', return_value=[]), patch('chapter_quality.task_errors', return_value=[]), patch('narrative.task_errors', return_value=[]):
                self.assertEqual(can_finish(record, root), [])
                report['scopes']['combat']['groups']['status'] = 'failed'
                write_json(root / 'report.json', report)
                self.assertTrue(can_finish(record, root), 'finish must independently reject changed report')
                record['experience_reviews'][0]['sha256'] = digest(root / 'report.json')
                self.assertTrue(can_finish(record, root), 'reattaching cannot turn a failed group test into a pass')

    def test_runtime_chapters_keep_legacy_receipts_without_assigning_literary_chapters(self):
        self.assertEqual(requested('第三章RPG体验升级')['chapters'], ['R03'])
        self.assertEqual(requested('R03 RPG体验升级')['chapters'], ['R03'])
        self.assertEqual(requested('V01C03 RPG体验升级')['chapters'], [])
        self.assertEqual(requested('全游戏RPG体验升级')['chapters'], [f'R{i:02}' for i in range(1, 9)])
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            report = self.fixture(root)
            report['chapter'] = 'R03'
            for row in report['normal_input'].values():
                row['ending_phase'] = 21
            self.assertEqual(validate_report(report, root), [])
            write_json(root / 'report.json', report)
            record = {'experience_requirement': {'chapters': ['V01C03']},
                      'experience_reviews': [{'path': 'report.json', 'sha256': digest(root / 'report.json')}]}
            self.assertEqual(task_errors(record, root), [])
            report['chapter'] = 'R08'
            for row in report['normal_input'].values():
                row['ending_phase'] = 38
            self.assertTrue(validate_report(report, root))
            for row in report['normal_input'].values():
                row['ending_flags'] = {'ch8Complete': True}
            self.assertEqual(validate_report(report, root), [])

    def test_design_routing_and_ordinary_fix_boundaries(self):
        for task, module, source in [
            ('装备收益设计', 'design_combat', 'tools/balance_lab/experience-audit.mjs'),
            ('地下城设计', 'design_exploration', 'dist/chapter-one-layout.js'),
            ('任务深度改造', 'design_quests', 'dist/chapter-one-objectives.js'),
            ('世界服务规划', 'design_services', 'dist/rpg-experience-services.js'),
            ('章节节奏设计', 'design_pacing', 'dist/rpg-experience-triggers.js')]:
            result = route(task)
            self.assertIn(module, result['modules'])
            paths = {c['path'] for c in result['contexts']}
            self.assertIn('docs/harness/RPG_DESIGN.md', paths)
            self.assertIn(source, paths)
        for task in ['修复碰撞卡点', '修复剧情触发空指针', '调整第五章任务奖励', '修改对白错字']:
            self.assertEqual(requested(task)['scopes'], [])
        result = route('修复碰撞卡点')
        self.assertNotIn('rpg_experience', result['modules'])
        self.assertNotIn('docs/harness/RPG_DESIGN.md', {c['path'] for c in result['contexts']})
        self.assertEqual(requested('第一章RPG体验试点')['chapters'], ['R01'])


if __name__ == '__main__':
    unittest.main()
