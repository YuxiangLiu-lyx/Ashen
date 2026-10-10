import contextlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from common import INDEX, inventory, fingerprint, write_json
from index import generate, stale, javascript_code, IMPORT
from context import route
from task import execute, can_finish, validate, path_for, task_lock, sync_progress
from check import recommend


class RoutingTests(unittest.TestCase):
    def test_multiline_imports_and_embedded_browser_hooks_are_distinct(self):
        source = '''import {foo,
            bar} from './actual.js';
            const hook = `import {RPG} from './browser-only.js';`;
            const prose = "import './fake.js'";
            // import './comment.js';
            export {foo} from './export.js';
            const load = () => import('./dynamic.js');'''
        imports = [m.group(1) or m.group(2) for m in IMPORT.finditer(javascript_code(source))]
        self.assertEqual(imports, ['./actual.js', './export.js', './dynamic.js'])

    def test_shadow_combo_discovers_actual_overlays_career_and_save(self):
        result = route('修改暗影流血连招')
        self.assertIn(result['status'], ['ok', 'budget_limited'])
        found = {c['path'] for c in result['contexts']}
        self.assertTrue({'dist/core-v14.js','dist/balance-v14.js','dist/skills-v14.js',
                         'dist/enemy-ai-v14.js','dist/combat-overhaul-v28.js',
                         'dist/progression-data-v14.js','dist/progression-runtime-v14.js',
                         'dist/save-protection-v23.js','docs/harness/COMBAT.md'} <= found)
        order = [i['name'] for i in result['installer_order']]
        self.assertLess(order.index('installSagaV26'), order.index('installCombatOverhaulV28'))
        self.assertLess(order.index('installCombatOverhaulV28'), order.index('installPresentationPhysicsV281'))
        self.assertTrue(all(c['reasons'] for c in result['contexts']))

    def test_chapter5_rewards_does_not_load_story_art_or_history(self):
        result = route('调整第五章任务奖励', max_files=8)
        self.assertEqual(result['modules'], ['economy'])
        files = {c['path'] for c in result['contexts']}
        self.assertIn('dist/chapter5-economy-v14.js', files)
        self.assertIn('dist/chapter5-runtime-v14.js', files)
        self.assertFalse(any('story' in p or 'art-' in p or p.startswith('history/') for p in files))
        self.assertLessEqual(len(files), 8)

    def test_map_presentation_excludes_combat_economy(self):
        result = route('修改地图表现')
        self.assertTrue({'maps','art'} <= set(result['modules']))
        self.assertFalse({'combat','economy'} & set(result['modules']))
        files = {c['path'] for c in result['contexts']}
        self.assertIn('dist/presentation-physics-v281.js', files)
        self.assertNotIn('dist/balance-v14.js', files)
        self.assertNotIn('dist/chapter5-economy-v14.js', files)

    def test_precise_symbol_search_and_unknown(self):
        exact = route('修复 playerProjectileSourceValidV17')
        self.assertIn('dist/combat-input-v17.js', {c['path'] for c in exact['contexts']})
        self.assertEqual(route('未知天际量子系统')['status'], 'no_match')
        self.assertEqual(route('recommend') ['status'], 'no_match')

    def test_budget_defers_explicitly(self):
        result = route('暗影流血连招', max_files=2, budget=1600)
        self.assertEqual(result['status'], 'budget_limited')
        self.assertLessEqual(result['excerpt_bytes'], 1600)
        self.assertLessEqual(len(result['contexts']), 2)
        self.assertTrue(result['deferred'])

    def test_scope_recommends_runtime_regression_and_lab(self):
        result = recommend(['dist/balance-v14.js'])
        self.assertIn('combat', result['affected_modules'])
        self.assertIn('node --test tests/balance-lab.test.mjs', result['commands'])

    def test_six_discoverable_scoped_skills_and_valid_references(self):
        files = list((ROOT / '.agents/skills').glob('*/SKILL.md'))
        self.assertEqual(len(files), 6)
        import re
        for path in files:
            text = path.read_text()
            self.assertTrue(text.startswith('---\nname: ' + path.parent.name + '\ndescription: '))
            for target in re.findall(r'\]\(([^)]+)\)', text):
                self.assertTrue((path.parent / target).is_file(), target)


class IsolatedStateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='ashen-harness-test-')
        self.root = Path(self.temp.name)
        for name in inventory():
            destination = self.root / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / name, destination)
        for command in [['git','init','-q'],['git','add','.'],
                        ['git','-c','user.name=Harness Test','-c','user.email=test@example.invalid','commit','-qm','fixture']]:
            subprocess.run(command, cwd=self.root, check=True, stdout=subprocess.DEVNULL)
        self.index = generate(self.root)
        write_json(self.root / INDEX, self.index)
        self.record = {'id':'fixture','baseline_commit':self.index['basis_commit'],
                       'checks':[], 'required_checks':['core'], 'remaining':[], 'blockers':[]}

    def tearDown(self):
        self.temp.cleanup()

    def test_modified_moved_new_files_never_use_stale_index(self):
        target = self.root / 'dist/balance-v14.js'
        target.write_text(target.read_text() + '\n// changed\n')
        self.assertIn('dist/balance-v14.js', stale(self.index, self.root))
        self.assertEqual(route('暗影流血', root=self.root)['status'], 'stale')
        target.rename(self.root / 'dist/moved-balance.js')
        changed = stale(self.index, self.root)
        self.assertIn('dist/moved-balance.js', changed)
        self.assertIn('dist/balance-v14.js', changed)
        new = self.root / 'dist/new-system.js';new.write_text('export const newSymbol=1;')
        self.assertIn('dist/new-system.js', stale(self.index, self.root))
        regenerated = generate(self.root)
        self.assertIn('dist/new-system.js', regenerated['unmapped_runtime'])
        self.assertIn('dist/balance-v14.js', regenerated['missing_imports'])

    def test_failure_is_real_not_passed_prose(self):
        code = execute(self.record, [sys.executable,'-c',"print('passed'); raise SystemExit(7)"], 'core', self.root)
        self.assertEqual(code, 7)
        self.assertTrue(can_finish(self.record, self.root))
        self.assertFalse(validate(self.record, self.root))
        execute(self.record, [sys.executable,'-c',"print('actual success')"], 'core', self.root)
        self.assertFalse(can_finish(self.record, self.root))

    def test_resume_integrity_code_version_and_tamper(self):
        execute(self.record, [sys.executable,'-c',"print('fixture checked')"], 'core', self.root)
        saved = self.root / 'source/tasks/active/fixture.json';write_json(saved, self.record)
        restored = json.loads(saved.read_text())
        self.assertFalse(can_finish(restored, self.root))
        (self.root / 'dist/skills-v14.js').write_text('// changed')
        self.assertIn('Check predates current code: core', can_finish(restored, self.root))
        output = self.root / restored['checks'][0]['output'];output.write_text('forged success')
        self.assertTrue(validate(restored, self.root))

    def test_changes_during_command_invalidate_evidence(self):
        execute(self.record,[sys.executable,'-c',"from pathlib import Path; Path('dist/balance-v14.js').write_text('// modified')"],'core',self.root)
        self.assertTrue(self.record['checks'][0]['sources_changed_during_check'])
        self.assertTrue(can_finish(self.record, self.root))

    def test_task_path_rejects_traversal(self):
        with self.assertRaises(ValueError):
            path_for('../../unsafe', self.root)

    def test_concurrent_task_writers_cannot_overwrite_results(self):
        with task_lock('fixture', self.root):
            with self.assertRaisesRegex(RuntimeError, 'busy'):
                with task_lock('fixture', self.root):
                    self.fail('Second writer acquired a held task lock')
        with task_lock('fixture', self.root):
            pass

    def test_interrupted_check_not_assumed_success_or_overwritten(self):
        execute(self.record, [sys.executable, '-c', "print('checked')"], 'core', self.root)
        self.record['running_check'] = {'label': 'core', 'command': ['interrupted']}
        self.assertTrue(can_finish(self.record, self.root))
        orphan = self.root / 'docs/harness/evidence/fixture/002-core.txt'
        orphan.write_text('partial historical output')
        execute(self.record, [sys.executable, '-c', "print('recheck')"], 'core', self.root)
        self.assertEqual(orphan.read_text(), 'partial historical output')
        self.assertTrue(self.record['checks'][-1]['output'].endswith('003-core.txt'))

    def test_timeout_preserves_partial_log_and_requires_successful_rerun(self):
        code = execute(self.record, [sys.executable, '-u', '-c',
                       "import time; print('partial output'); time.sleep(30)"],
                       'core', self.root, timeout=.2)
        self.assertEqual(code, 124)
        check = self.record['checks'][-1]
        self.assertEqual(check['termination'], 'timeout')
        self.assertIn('partial output', (self.root / check['output']).read_text())
        self.assertTrue(can_finish(self.record, self.root))
        execute(self.record, [sys.executable, '-c', 'print("rerun")'], 'core', self.root)
        self.assertFalse(can_finish(self.record, self.root))

    def test_progress_survives_reload_and_preserves_other_tasks_and_manual_plan(self):
        progress = self.root / '.codex/progress.md'
        progress.parent.mkdir()
        progress.write_text('# Manual plan\nDo not overwrite existing art.\n')
        self.record.update(next='Review clicks', completed=['Baseline saved'], remaining=['Browser QA'],
                           decisions=['Keep combat numbers'], status='in_progress')
        sync_progress(self.record, self.root)
        other = dict(self.record, id='other', next='Other task')
        sync_progress(other, self.root)
        saved = self.root / 'source/tasks/active/fixture.json'
        write_json(saved, self.record)
        restored = json.loads(saved.read_text())
        restored['next'] = 'Save reviewed changes'
        sync_progress(restored, self.root)
        content = progress.read_text()
        self.assertIn('Do not overwrite existing art.', content)
        self.assertIn('Other task', content)
        self.assertIn('Save reviewed changes', content)
        self.assertNotIn('Review clicks', content)
        self.assertEqual(content.count('<!-- task:fixture -->'), 1)

    def test_unfinished_stage_prevents_completion(self):
        execute(self.record, [sys.executable, '-c', 'print("ok")'], 'core', self.root)
        self.record['stages'] = [{'name': 'review', 'status': 'in_progress'}]
        self.assertIn('All recorded stages must be complete', can_finish(self.record, self.root))
        self.record['stages'][0]['status'] = 'complete'
        self.assertFalse(can_finish(self.record, self.root))


if __name__ == '__main__':
    unittest.main()
