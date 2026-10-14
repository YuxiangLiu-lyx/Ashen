import subprocess,os
from pathlib import Path
root=Path.cwd();driver=str(root/'docs/rpg-experience/c3/FORGE_FINAL.mjs');env=dict(os.environ,ASHEN_C3_SAVES='docs/rpg-experience/c3/SAVE_SOURCES.json',ASHEN_FORGE_ONLY='1')
subprocess.run(['node',driver,str(root/'docs/rpg-experience/c3/forge-current-final')],env=env,check=True)
subprocess.run(['node',driver,str(root/'docs/rpg-experience/c3/forge-before-final')],cwd='/tmp/ashen-c3-before-9d',env=env,check=True)
