import subprocess
for script in ['summarize.py','promote.py','verify_local.py']:
 subprocess.run(['python3','docs/c1-restraint/'+script],check=True,timeout=180)
