import {spawn} from 'node:child_process';
const results=await Promise.all(['shadow','oath','ember'].map(cls=>new Promise(resolve=>{const p=spawn(process.execPath,['tests/browser-chapter-one-natural.mjs'],{stdio:'inherit',env:{...process.env,ASHEN_CLASS:cls,ASHEN_PLAY_OUTPUT:(process.env.ASHEN_NATURAL_OUTPUT||'docs/ch1-expansion/natural')+'/'+cls}});p.on('exit',code=>resolve({cls,code}));})));
console.log(JSON.stringify(results));if(results.some(r=>r.code!==0))process.exitCode=1;
