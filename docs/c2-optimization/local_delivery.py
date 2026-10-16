import subprocess
for script in ['promote.py','verify_local.py']:
 code=subprocess.run(['python3','docs/c2-optimization/'+script],timeout=120).returncode
 if code:raise SystemExit(code)
