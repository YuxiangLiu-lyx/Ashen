import {spawn} from 'node:child_process';
const results=await Promise.all(['shadow','oath','ember'].map(cls=>new Promise(resolve=>{const p=spawn(process.execPath,['tests/browser-chapter-one-natural.mjs'],{stdio:'inherit',env:{...process.env,ASHEN_CLASS:cls,ASHEN_PLAY_OUTPUT:'docs/ch1-expansion/natural/'+cls+'-restored-training'}});p.on('exit',code=>resolve({cls,code}));})));
console.log(JSON.stringify(results));if(results.some(r=>r.code!==0))process.exitCode=1;
