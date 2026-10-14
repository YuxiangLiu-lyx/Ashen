"""Validate current reviewed evidence and the completed integration process, without rerunning immutable browser/combat inputs."""
import json,hashlib,subprocess,sys
from pathlib import Path
sys.path.insert(0,str(Path.cwd()/'tools/harness'))
from common import fingerprint,inventory,digest
from map_quality import validate_report as maps,relevant,changed
from experience import validate_report as experience
from narrative import task_errors as narrative
root=Path.cwd();fp=fingerprint(inventory());load=lambda p:json.loads(Path(p).read_text())
master=load('source/tasks/active/rpg-experience-20261014.json')
check=[x for x in master['checks'] if x['label']=='c1-final-integration'][-1]
assert check['exit_code']==0 and not check['sources_changed_during_check'],check
assert check['source_fingerprint']==fp and digest(root/check['output'])==check['output_sha256']
assert not maps(load('docs/map-quality/LATEST.json'),required_paths=relevant(changed('cad2add')))
assert not experience(load('docs/rpg-experience/c1/ACCEPTANCE.json'))
for task in ['rpg-c1-20261014','rpg-harness-20261014']:
 p=root/'source/tasks/active'/f'{task}.json'
 if not p.exists():p=root/'source/tasks/archive'/f'{task}.json'
 errors=narrative(load(p));assert not errors,errors
freeze=load('docs/rpg-experience/c1/SOURCE_FINAL_VERIFICATION.json')['files']
# Same production/browser/Skill inputs as the separately completed specialist checks.
for p,sha in freeze.items():
 if p.startswith(('dist/','.agents/skills/','tools/')) or p in ['tests/browser-chapter-one-natural.mjs','tests/browser-rpg-experience-services.mjs','tests/browser-web-play.py']:
  assert digest(root/p)==sha,p
for cls in ['shadow','oath','ember']:
 d=load(f'docs/rpg-experience/c1/natural-final/{cls}/PLAY.json');assert d['status']=='two-chapters-complete' and not d['errors']
 for p,sha in d['source']['files'].items():assert digest(root/p)==sha,p
assert all(x['exit_code']==0 for x in load('docs/rpg-experience/harness/SKILL_VALIDATION.json')['results'])
print(json.dumps({'passed':True,'source_fingerprint':fp,'integration_receipt':check['output'],'normal_input_classes':3,'map_dimensions':3,'human':'pending'},ensure_ascii=False,indent=2))
