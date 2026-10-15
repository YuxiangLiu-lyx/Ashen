import subprocess
for p in ['promote.py','verify_local.py']:
 subprocess.run(['python3','docs/c1-dialogue-voice/'+p],check=True,timeout=180)
