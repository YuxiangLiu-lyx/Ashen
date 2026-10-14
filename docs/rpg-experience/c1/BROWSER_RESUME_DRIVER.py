import os,sys,subprocess
from pathlib import Path
for name in ['browser-chapter123','browser-chapter-one-expansion']:
 env=dict(os.environ);out='docs/rpg-experience/c1/integration-resumed/'+name
 for key in ['ASHEN_CAPTURE_OUTPUT','ASHEN_C1_OUTPUT']:env[key]=out
 env['CHROME_BIN']='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
 command=['node','tests/'+name+'.mjs'];print('RUN:',*command,flush=True)
 r=subprocess.run(command,env=env)
 if r.returncode:sys.exit(r.returncode)
