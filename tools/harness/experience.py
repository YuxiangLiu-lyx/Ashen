#!/usr/bin/env python3
"""Scoped RPG design evidence; technical acceptance never implies human approval."""
import argparse
import json
import re
from common import ROOT, read_json, digest, inventory, fingerprint, write_json

FIELDS = {
    'combat': ('growth_comparison', 'enemy_roles', 'groups', 'continuous_maps', 'elite_mechanics'),
    'exploration': ('topology', 'branch_value', 'space_and_visuals'),
    'quests': ('playable_process', 'repetition_cost', 'world_result'),
    'services': ('real_transactions', 'resource_loop'),
    'pacing': ('causality', 'safe_triggers', 'knowledge_boundaries'),
}
KEYWORDS = {
    'combat': ('战斗成长', '成长收益', '装备收益', '培养对照'),
    'exploration': ('地下城设计', '探索深度', '探索设计'),
    'quests': ('任务深度', '任务质量', '内容重复'),
    'services': ('世界服务', '设施规划', '经济循环'),
    'pacing': ('章节节奏', '剧情触发', '地点触发'),
}
CHAPTER_END = dict(zip([f'V01C{i:02}' for i in range(1, 9)], [5, 12, 21, 25, 30, 34, 38, 38]))


def requested(goal):
    broad = bool(re.search(r'RPG.*(体验|试点|升级)|全游戏|全章节|章节改造', goal, re.I))
    design = bool(re.search('设计|规划|升级|优化|改造|重做|试点|新增', goal))
    scopes = list(FIELDS) if broad else [s for s, words in KEYWORDS.items() if design and any(w in goal for w in words)]
    chapters = []
    if re.search('全游戏|全八章|全章节', goal):
        chapters = list(CHAPTER_END)
    else:
        for n, word in enumerate('一二三四五六七八', 1):
            if re.search(f'第{word}章|V01C{n:02}|(?<![A-Za-z0-9])C{n}(?![0-9])', goal, re.I):
                chapters.append(f'V01C{n:02}')
    return {'scopes': scopes, 'chapters': chapters, 'kind': 'chapter' if broad else 'scoped'}


def artifact(item, root):
    path = (root / item.get('path', '')).resolve()
    return path.is_relative_to(root.resolve()) and path.is_file() and digest(path) == item.get('sha256')


def validate_report(report, root=ROOT):
    errors = []
    if report.get('source_fingerprint') != fingerprint(inventory(root)):
        errors.append('RPG review predates current sources')
    if report.get('chapter') not in CHAPTER_END:
        errors.append('Explicit implemented chapter required')
    if report.get('kind') not in ('chapter', 'scoped'):
        errors.append('Explicit chapter/scoped review kind required')
    scopes = report.get('scopes', {})
    if not scopes or set(scopes) - set(FIELDS):
        errors.append('Explicit supported design scopes required')

    def evidence(row, label):
        if row.get('status') not in ('pass', 'unchanged') or not row.get('reason') or not row.get('evidence'):
            errors.append(label + ': missing judgment/evidence')
        if any(not artifact(item, root) for item in row.get('evidence', [])):
            errors.append(label + ': missing/changed artifact')

    for scope, fields in FIELDS.items():
        if scope in scopes:
            for field in fields:
                evidence(scopes[scope].get(field, {}), scope + '/' + field)
    if 'combat' in scopes:
        comparison = report.get('comparison', {})
        if set(comparison.get('classes', [])) != {'shadow', 'oath', 'ember'}:
            errors.append('Combat comparison must cover three classes')
        if not {'starter', 'normal', 'optimized'} <= set(comparison.get('cohorts', [])):
            errors.append('Keep legal starter/normal/owned optimized cohorts distinct from unarmed')
        if comparison.get('same_source_snapshot') is not True or comparison.get('production_rules') is not True:
            errors.append('Comparison requires identical source saves and production rules')
        if comparison.get('human_win_rate_claim') is not False:
            errors.append('Script outcomes cannot be called human win rates')
    if report.get('kind') == 'chapter':
        if set(scopes) != set(FIELDS):
            errors.append('Whole chapter review must cover all five design scopes')
        for cls in ('shadow', 'oath', 'ember'):
            row = report.get('normal_input', {}).get(cls, {})
            evidence(row, 'normal_input/' + cls)
            if row.get('input_method') != 'normal_ui' or row.get('state_mutation_hooks') is not False:
                errors.append('normal_input/' + cls + ': normal input without mutation hooks required')
            if row.get('ending_phase', -1) < CHAPTER_END.get(report.get('chapter'), 999):
                errors.append('normal_input/' + cls + ': chapter end not reached')
            if report.get('chapter') == 'V01C08' and row.get('ending_flags', {}).get('ch8Complete') is not True:
                errors.append('normal_input/' + cls + ': final saga completion flag required')
        evidence(report.get('compatibility', {}), 'compatibility')
    human = report.get('human', {})
    if human.get('status') == 'pending':
        if not human.get('remaining') or not artifact(human.get('playable_build', {}), root) or not artifact(human.get('observation_template', {}), root):
            errors.append('Pending human review needs a playable build, observation template and explicit remaining work')
    elif human.get('status') == 'pass':
        evidence(human, 'human')
        if human.get('observer_kind') != 'human' or not human.get('observer') or not human.get('observed_at'):
            errors.append('Human pass needs an identified human observation, never an agent/script')
    else:
        errors.append('Human quality must be explicitly pending or evidenced by a human')
    return errors


def task_errors(record, root=ROOT):
    requirement = record.get('experience_requirement', {})
    reviews = record.get('experience_reviews', [])
    if not requirement and not reviews:
        return []
    if not reviews:
        return ['RPG content design requires task.py experience --report evidence']
    errors, reports = [], []
    for item in reviews:
        if not artifact(item, root):
            errors.append('Missing/changed RPG report: ' + item.get('path', ''))
            continue
        report = read_json(item['path'], root)
        reports.append(report)
        errors += validate_report(report, root)
        if not set(requirement.get('scopes', [])) <= set(report.get('scopes', {})):
            errors.append('RPG review omits requested scope')
        if requirement.get('kind') == 'chapter' and report.get('kind') != 'chapter':
            errors.append('A scoped review cannot replace whole chapter acceptance')
    if set(requirement.get('chapters', [])) - {r.get('chapter') for r in reports}:
        errors.append('RPG review omits requested chapters')
    return errors


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--report', required=True)
    p.add_argument('--template', action='store_true')
    p.add_argument('--chapter', choices=list(CHAPTER_END), default='V01C01')
    p.add_argument('--scope', choices=list(FIELDS), action='append')
    args = p.parse_args()
    if args.template:
        path = (ROOT / args.report).resolve()
        if not path.is_relative_to(ROOT.resolve()) or path.exists():
            p.error('Use a new report path inside the repository')
        scopes = args.scope or list(FIELDS)
        write_json(path, {'schema': 1, 'chapter': args.chapter, 'kind': 'scoped' if args.scope else 'chapter',
                         'source_fingerprint': fingerprint(inventory()),
                         'scopes': {s: {f: {'status': 'unverified', 'reason': '', 'evidence': []} for f in FIELDS[s]} for s in scopes},
                         'normal_input': {}, 'compatibility': {}, 'comparison': {},
                         'human': {'status': 'pending', 'remaining': ['真人首次流程、找路、节奏与乐趣'], 'playable_build': {}, 'observation_template': {}}})
        return 0
    report = read_json(args.report)
    errors = validate_report(report)
    print(json.dumps({'technical_pass': not errors, 'human_status': report.get('human', {}).get('status'), 'errors': errors}, ensure_ascii=False, indent=2))
    return bool(errors)


if __name__ == '__main__':
    raise SystemExit(main())
