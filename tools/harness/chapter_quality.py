"""Require current, auditable chapter content/play evidence before task completion."""
import argparse
from common import ROOT, read_json, digest, fingerprint, inventory

REVIEW_FIELDS = ('causality', 'world_feedback', 'pacing', 'character_voice')
CLASSES = ('shadow', 'oath', 'ember')
ROUTES = ('main_only', 'typical', 'all_once', 'repeat_patrol')


def validate_report(report, root=ROOT):
    errors = []
    if report.get('source_fingerprint') != fingerprint(inventory(root)):
        errors.append('Chapter content evidence predates current code')
    def evidence(row, label):
        if row.get('status') != 'pass' or not row.get('reason') or not row.get('evidence'):
            errors.append(label + ': missing, failed or unverified')
        for item in row.get('evidence', []):
            path = (root / item.get('path', '')).resolve()
            if not path.is_relative_to(root.resolve()) or not path.is_file() or digest(path) != item.get('sha256'):
                errors.append(label + ': missing/changed artifact')
    for field in REVIEW_FIELDS:
        evidence(report.get('review', {}).get(field, {}), field)
    for cls in CLASSES:
        row = report.get('natural_play', {}).get(cls, {})
        evidence(row, 'natural_play/' + cls)
        if row.get('input_method') != 'normal_ui' or row.get('ending_phase', 0) < 12 or row.get('state_mutation_hooks') is not False:
            errors.append('natural_play/' + cls + ': normal two-chapter input required')
    human = report.get('human_full_observation', {})
    evidence(human, 'human_full_observation')
    if human.get('observer_kind') != 'human' or human.get('scope') != 'entire_normal_input_route':
        errors.append('One entire route must be observed by a human; automation/screenshots do not substitute')
    for route in ROUTES:
        row = report.get('economy', {}).get(route, {})
        evidence(row, 'economy/' + route)
        if row.get('basis') != 'runtime_events' or not row.get('actual_snapshot'):
            errors.append('economy/' + route + ': actual events and snapshot required')
    evidence(report.get('balance', {}), 'balance')
    if report.get('balance', {}).get('minimum_seeds_per_class_encounter', 0) < 12:
        errors.append('Balance requires at least twelve seeds per class/encounter')
    evidence(report.get('compatibility', {}), 'compatibility')
    return errors


def task_errors(record, root=ROOT):
    chapter = record.get('chapter_quality')
    if not chapter:
        return []
    if chapter != 'V01C01':
        return ['Register the requested chapter quality report schema first']
    path = 'docs/ch1-expansion/CONTENT_ACCEPTANCE.json'
    if not (root / path).is_file():
        return ['Missing chapter content review: ' + path]
    return validate_report(read_json(path, root), root)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--report', default='docs/ch1-expansion/CONTENT_ACCEPTANCE.json')
    args = p.parse_args()
    errors = validate_report(read_json(args.report)) if (ROOT / args.report).is_file() else ['Missing chapter content evidence']
    print('\n'.join(errors) if errors else 'Chapter content evidence complete and current')
    raise SystemExit(bool(errors))
