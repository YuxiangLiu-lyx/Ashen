import copy
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/harness'))
from common import inventory, fingerprint, digest
from map_quality import DIMENSIONS, validate_report, relevant


class MapQualityTests(unittest.TestCase):
    def test_each_dimension_independent_and_artifact_integrity(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            evidence = root / 'review.txt'
            evidence.write_text('actual reviewed evidence')
            report = {'source_fingerprint': fingerprint(inventory(root)), 'reviewed_paths': ['dist/world-v14.js'],
                      'maps': [{'id': 'bridge', **{dimension: {'status': 'pass', 'reason': dimension,
                      'evidence': [{'path': 'review.txt', 'sha256': digest(evidence)}]} for dimension in DIMENSIONS}}]}
            self.assertEqual(validate_report(report, root, ['dist/world-v14.js']), [])
            for dimension in DIMENSIONS:
                failed = copy.deepcopy(report)
                failed['maps'][0][dimension]['status'] = 'unverified'
                self.assertTrue(any(dimension in e for e in validate_report(failed, root)))
            self.assertTrue(validate_report(report, root, ['dist/new-map.js']))
            evidence.write_text('changed evidence')
            self.assertTrue(validate_report(report, root))

    def test_geometry_renderer_resources_trigger_but_text_does_not(self):
        paths = ['dist/world-v14.js', 'dist/spatial-layout-v30.js', 'dist/assets/new.png', 'docs/notes.md']
        self.assertEqual(relevant(paths), sorted(paths[:3]))

    def test_empty_and_stale_reviews_fail(self):
        self.assertGreaterEqual(len(validate_report({'source_fingerprint': 'obsolete', 'maps': []})), 2)
