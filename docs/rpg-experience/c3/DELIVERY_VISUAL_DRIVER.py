import subprocess,os
for cmd in [['node','docs/rpg-experience/c3/CURRENT_MAPS_DELIVERY.mjs'],['node','docs/rpg-experience/c3/SERVICES_UI_DELIVERY.mjs'],['python3','tools/restore_archives.py','--all','--verify-only']]:
 subprocess.run(cmd,check=True,env=dict(os.environ,CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'))
