#!/usr/bin/env python3
"""Scene-level Chinese negative-imperative risk discovery, never a quality score."""
import argparse
import collections
import json
import re
from pathlib import Path

PATTERN = re.compile(r'别(?!人|的|处|样|扭|致|离|国|家|名|种|有)|不要(?!紧)|不必|无需|不用')
NON_DIRECTIVE_PREFIX = ('特', '区', '分', '识', '告', '离', '差', '辨', '级', '个', '永')


def occurrences(text):
    found = []
    for match in PATTERN.finditer(text):
        token = match.group()
        before = text[:match.start()]
        if token == '别' and before.endswith(NON_DIRECTIVE_PREFIX):
            continue
        if token == '不要' and before.endswith('要'):
            continue  # 要不要 is a question, not a prohibition.
        following = text[match.end():]
        form = token
        if token == '别':
            form += next((x for x in ['让我', '总', '再', '把'] if following.startswith(x)), '')
        # This identifies an address-shaped clause, not the addressee's identity.
        address = re.search(r'(?:^|[。！？!?])([^，,：:。！？!?]{1,8})[，,：:]\s*$', before)
        found.append({'start': match.start(), 'end': match.end(), 'token': token,
                      'form': form, 'address_before': address.group(1) if address else None})
    return found


def scene_risks(rows):
    candidates = []
    for i, row in enumerate(rows):
        speaker, text = (row['speaker'], row['text']) if isinstance(row, dict) else row[:2]
        hits = occurrences(text)
        if hits:
            candidates.append({'line': i, 'speaker': speaker, 'text': text, 'occurrences': hits})
    clusters = []
    for row in candidates:
        nearby = [r for r in candidates if row['line'] <= r['line'] <= row['line'] + 4]
        if len(nearby) >= 2 and not any(set(x['lines']) >= {r['line'] for r in nearby} for x in clusters):
            clusters.append({'lines': [r['line'] for r in nearby],
                             'speakers': sorted({r['speaker'] for r in nearby})})
    return {'lines': len(rows), 'candidates': candidates, 'clusters': clusters,
            'repeated_across_speakers': len({r['speaker'] for r in candidates}) > 1,
            'instruction': '逐场核对关系、实际交流目的和正在阻止的动作。候选可能是陈述、询问或合理警告；数量不判定质量，不要求清零。'}


def corpus_report(scenes):
    results = {key: scene_risks(value.get('text', value) if isinstance(value, dict) else value)
               for key, value in scenes.items()}
    tokens = collections.Counter()
    speakers = collections.Counter()
    for result in results.values():
        for row in result['candidates']:
            speakers[row['speaker']] += 1
            tokens.update(hit['form'] for hit in row['occurrences'])
    return {'schema': 1, 'purpose': 'risk_discovery_only', 'scene_count': len(results),
            'line_count': sum(r['lines'] for r in results.values()),
            'candidate_scene_count': sum(bool(r['candidates']) for r in results.values()),
            'candidate_line_count': sum(len(r['candidates']) for r in results.values()),
            'forms': dict(tokens), 'speakers': dict(speakers), 'scenes': results,
            'limits': ['Statistics cannot decide whether a line is natural.',
                       'No synonym replacement, deletion or automatic rewrite is performed.']}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--runtime', required=True, help='Full installed runtime export with --text, including audited dynamic scenes')
    p.add_argument('--output', required=True)
    args = p.parse_args()
    source = json.loads(Path(args.runtime).read_text())
    report = corpus_report(source['scenes'])
    Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'scenes'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
