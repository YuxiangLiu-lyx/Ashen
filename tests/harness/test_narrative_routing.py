"""Narrative context scope: specific chapters, optional vision, and bounded reads."""
from pathlib import Path
import json
import re
import sys
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from context import route


class NarrativeRoutingTests(unittest.TestCase):
    def paths(self, result):
        self.assertIn(result['status'], ['ok', 'budget_limited'])
        return {c['path'] for c in result['contexts']}

    def test_specific_chapters_find_separate_full_script_entries(self):
        for task, chapter, other in [
                ('第一章剧情', 'CHAPTER_01.md', 'CHAPTER_02.md'),
                ('第1章剧情', 'CHAPTER_01.md', 'CHAPTER_02.md'),
                ('chapter 1', 'CHAPTER_01.md', 'CHAPTER_02.md'),
                ('V01C01 剧情', 'CHAPTER_01.md', 'CHAPTER_02.md'),
                ('第二章剧情', 'CHAPTER_02.md', 'CHAPTER_01.md'),
                ('第2章剧情', 'CHAPTER_02.md', 'CHAPTER_01.md'),
                ('chapter2', 'CHAPTER_02.md', 'CHAPTER_01.md'),
                ('V01C02 剧情', 'CHAPTER_02.md', 'CHAPTER_01.md')]:
            with self.subTest(task=task):
                files = self.paths(route(task))
                self.assertIn('docs/harness/' + chapter, files)
                self.assertIn('docs/harness/NARRATIVE_WORKFLOW.md', files)
                self.assertNotIn('docs/harness/' + other, files)
                self.assertNotIn('docs/harness/WORLD_VISION.md', files)

    def test_vision_is_available_only_on_explicit_matching_intent(self):
        vision = route('长期世界观')
        self.assertIn('world_vision', vision['modules'])
        self.assertIn('docs/harness/WORLD_VISION.md', self.paths(vision))
        for task in ['修改剧情对白', '修改地图表现', '修改暗影流血连招']:
            with self.subTest(task=task):
                self.assertNotIn('docs/harness/WORLD_VISION.md', self.paths(route(task)))

    def test_architecture_and_character_aliases_are_discoverable(self):
        files = self.paths(route('设计分卷分章整体架构'))
        self.assertIn('docs/harness/NARRATIVE_ARCHITECTURE.md', files)
        self.assertNotIn('docs/harness/WORLD_VISION.md', files)
        character = route('优化圣女封术印演出')
        self.assertIn('story', character['modules'])
        self.assertIn('docs/harness/STORY.md', self.paths(character))

    def test_budget_defers_chapter_instead_of_claiming_it_was_read(self):
        result = route('第一章剧情', max_files=1, budget=512)
        self.assertEqual(result['status'], 'budget_limited')
        self.assertIn('docs/harness/CHAPTER_01.md', result['deferred'])
        self.assertNotIn('docs/harness/CHAPTER_01.md', self.paths(result))

    def test_new_narrative_links_resolve_within_repository(self):
        names = ['NARRATIVE_WORKFLOW.md', 'NARRATIVE_ARCHITECTURE.md',
                 'WORLD_VISION.md', 'CHAPTER_01.md', 'CHAPTER_02.md',
                 'CHAPTER_01_DEVELOPMENT_PROMPT.md']
        for name in names:
            path = ROOT / 'docs/harness' / name
            for target in re.findall(r'\]\(([^)]+)\)', path.read_text(encoding='utf-8')):
                if target.startswith(('https://', 'http://', '#')):
                    continue
                resolved = (path.parent / target.split('#')[0]).resolve()
                self.assertTrue(resolved.is_relative_to(ROOT.resolve()), target)
                self.assertTrue(resolved.is_file(), name + ': ' + target)

    def test_registry_and_state_reference_same_script_revisions(self):
        state = json.loads((ROOT / 'source/CURRENT_STATE.json').read_text())['narrative_rebuild']
        registry = (ROOT / state['architecture_registry']).read_text()
        for key in ['chapter01', 'chapter02']:
            chapter = state[key]
            self.assertIn(chapter['id'], registry)
            self.assertIn(Path(chapter['script']).name, registry)
            row = next(line for line in registry.splitlines()
                       if line.startswith('| ' + chapter['id'] + ' |'))
            self.assertIn(chapter['script_revision'], row)
            self.assertIn(chapter['script_status'], row)
            script = (ROOT / chapter['script']).read_text()
            self.assertIn(chapter['id'], script)
            self.assertIn(chapter['script_revision'], script.splitlines()[2])
            self.assertIn(chapter['script_status'], script.splitlines()[2])
            self.assertIn(chapter['script_status'],
                          ['OUTLINE', 'SCRIPT_READY', 'DEV_FROZEN', 'IMPLEMENTED'])
            self.assertTrue(chapter['implementation'])


if __name__ == '__main__':
    unittest.main()
