"""Resume the successful prefix of 013 without changing its failed receipt."""
import json,hashlib,sys,subprocess,os
from pathlib import Path
sys.path.insert(0,'tools/harness')
from common import inventory,fingerprint
P=Path('docs/c2-optimization');old=json.loads((P/'INTEGRATION_INPUTS.json').read_text());now=inventory()
changed=[p for p in set(old['files'])|set(now)if old['files'].get(p)!=now.get(p)]
assert changed==['tests/browser-world-v29.mjs'],changed
r=json.loads(Path('source/tasks/active/c2-optimization-20261016.json').read_text());c=next(c for c in r['checks']if c['output'].endswith('/013-integration.txt'))
assert not c['sources_changed_during_check'] and c['source_fingerprint']==old['fingerprint']
log=Path(c['output']).read_bytes();assert hashlib.sha256(log).hexdigest()==c['output_sha256']
text=log.decode();prefix=text.split('RUN: node tests/browser-world-v29.mjs')[0]
assert 'Ran 67 tests' in prefix and 'ℹ pass 225' in prefix and 'ℹ fail 0' in prefix and '"exactFullEventParity":true' in prefix
commands=[l[5:]for l in prefix.splitlines()if l.startswith('RUN: ')]
assert len(commands)==7,commands
print('REUSED actual successful prefix from '+c['output']+'; only changed input is the later browser-world test.',flush=True)
for cmd in commands:print('REUSED RUN: '+cmd,flush=True)
base=str(P/'integration');env={**os.environ,'CHROME_BIN':'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','ASHEN_QA_OUTPUT':base+'/presentation','ASHEN_LAB_QA_OUTPUT':base+'/lab','ASHEN_WORLD_OUTPUT':base+'/world','ASHEN_CAPTURE_OUTPUT':base+'/chapters','ASHEN_C1_OUTPUT':base+'/expansion','ASHEN_C1_BALANCE':base+'/balance','ASHEN_C1_ECONOMY':base+'/economy','ASHEN_C1_EVIDENCE':base+'/navigation','ASHEN_READER_OUTPUT':base+'/reader','ASHEN_HUD_OUTPUT':base+'/hud'}
prior={Path('docs/ch1-layer-rules')/n:(Path('docs/ch1-layer-rules')/n).read_bytes()for n in ['MOVEMENT.json','NAVIGATION.json']};checks=[];code=124
try:
 for file in ['browser-world-v29','browser-chapter-one-v30','browser-chapter23','browser-chapter123','browser-chapter-one-expansion','browser-dialogue-reader','browser-dialogue-hud']:
  cmd=['node','tests/'+file+'.mjs'];print('RUN: '+' '.join(cmd),flush=True)
  code=subprocess.run(cmd,env=env,timeout=600).returncode;checks.append({'command':cmd,'exit_code':code})
  if code:break
finally:
 for p,data in prior.items():
  if p.read_bytes()!=data:
   q=Path(base)/'navigation'/p.name;q.parent.mkdir(exist_ok=True,parents=True);q.write_bytes(p.read_bytes());p.write_bytes(data)
 report={'exit_code':code,'scope':'Full integration command coverage: exact successful prefix from 013 plus rerun of world and every subsequent browser command','reused_check':c,'reused_commands':commands,'changed_inputs':changed,'source_fingerprint':fingerprint(now),'checks':checks,'historical_navigation_restored':True}
 (P/'INTEGRATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
if code==0:print('PASS tier: integration (verified successful prefix plus full remaining commands)',flush=True)
raise SystemExit(code)
