"""Run the unchanged integration tier, partitioning each tool's generated outputs."""
import os, sys, subprocess
from pathlib import Path
sys.path.insert(0, str(Path.cwd()/'tools/harness'))
import check
base=Path(os.environ.get('ASHEN_INTEGRATION_OUTPUT','docs/rpg-experience/c1/integration-final'))
original=subprocess.run
def run(command,*args,**kwargs):
 env=dict(kwargs.get('env',os.environ))
 if isinstance(command,list) and len(command)>1 and str(command[1]).startswith(('tests/','tools/balance_lab/')):
  name=Path(command[1]).stem
  env.update(ASHEN_C1_EVIDENCE=str(base/'geometry'),ASHEN_C1_ECONOMY=str(base/'economy'),ASHEN_C1_BALANCE=str(base/'balance'))
  for key in ['ASHEN_QA_OUTPUT','ASHEN_LAB_QA_OUTPUT','ASHEN_WORLD_OUTPUT','ASHEN_CAPTURE_OUTPUT','ASHEN_C1_OUTPUT']:
   env[key]=str(base/name)
  kwargs['env']=env
 return original(command,*args,**kwargs)
check.subprocess.run=run
os.environ.update(ASHEN_C1_EVIDENCE=str(base/'geometry'),ASHEN_C1_ECONOMY=str(base/'economy'),ASHEN_C1_BALANCE=str(base/'balance'))
sys.argv=['check.py','--tier','integration']
raise SystemExit(check.main())
