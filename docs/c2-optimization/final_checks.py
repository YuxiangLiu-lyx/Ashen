import subprocess,sys
jobs=[
 ('c2-optimization-20261016','baseline-provenance',120,['python3','docs/c2-optimization/check_baseline.py']),
 ('c2-optimization-20261016','producer-current',120,['node','docs/c2-optimization/verify_current.mjs']),
 ('c2-optimization-20261016','special',180,['node','--test','tests/c1-endurance.test.mjs','tests/c2-optimization.test.mjs','tests/c1-restraint.test.mjs','tests/c1-character-flow.test.mjs','tests/rpg-chapter-two.test.mjs']),
 ('c2-optimization-20261016','services-browser',240,['env','ASHEN_SERVICE_OUTPUT=docs/c2-optimization/services-final','node','tests/browser-rpg-chapter-two-services.mjs']),
 ('c2-optimization-20261016','c1-visual',240,['env','ASHEN_RESTRAINT_VISUAL=docs/c1-endurance/visual','node','docs/c1-restraint/capture.mjs']),
 ('c2-optimization-20261016','fast',300,['python3','tools/harness/check.py','--tier','fast']),
 ('c1-endurance-20261016','baseline-provenance',120,['python3','docs/c2-optimization/reuse_check.py','baseline-provenance']),
 ('c1-endurance-20261016','producer-current',120,['node','docs/c2-optimization/verify_current.mjs']),
 ('c1-endurance-20261016','fast',120,['python3','docs/c2-optimization/reuse_check.py','fast']),
 ('c1-endurance-20261016','core',120,['python3','docs/c2-optimization/reuse_check.py','core']),
]
for task,label,timeout,cmd in jobs:
 if len(sys.argv)>1 and task!=sys.argv[1]:continue
 r=subprocess.run(['python3','tools/harness/task.py','run','--id',task,'--label',label,'--timeout',str(timeout),'--',*cmd],timeout=timeout+60)
 if r.returncode:raise SystemExit(r.returncode)
