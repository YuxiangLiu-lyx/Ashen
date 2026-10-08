import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
export function provenance(){
  const files={};
  for(const dir of ['dist','tools/balance_lab'])for(const name of fs.readdirSync(path.join(ROOT,dir)).sort())
    if(/\.(js|mjs)$/.test(name))files[dir+'/'+name]=sha(fs.readFileSync(path.join(ROOT,dir,name)));
  const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
  return {headCommit:git('rev-parse','HEAD'),runtimeTree:git('rev-parse','HEAD:dist'),
    workingTreeDirty:!!git('status','--porcelain'),contentSHA256:sha(JSON.stringify(files)),files,
    node:process.version,productVersion:'28.1'};
}
