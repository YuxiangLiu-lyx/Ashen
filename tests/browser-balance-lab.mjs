// Real Chrome runs the same installed game and driver; compare full events to Node.
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import http from 'node:http';
import {spawn,execFileSync} from 'node:child_process';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {simulate} from '../tools/balance_lab/simulator.mjs';
import {CAREERS} from '../dist/progression-data-v14.js';
import {provenance} from '../tools/balance_lab/provenance.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(process.env.ASHEN_LAB_QA_OUTPUT||path.join(root,'qa-export/balance-browser'));
fs.mkdirSync(out,{recursive:true});
const fixtures=[
  ...['shadow','oath','ember'].map(cls=>({cls,enemy:'captain',seed:42,gearRarity:'common'})),
  {cls:'shadow',enemy:'deepElite',seed:77,strategy:'defensive'},
  ...Object.values(CAREERS).map(c=>({cls:c.cls,career:c.id,enemy:'captain',level:16,seed:71,
    skills:Object.fromEntries(c.skills.slice(0,2).map(s=>[s,1]))})),
  {cls:'oath',enemy:'captain',seed:5,gear:{weapon:{affix:'storm',enchantment:{schema:1,defId:'emberTouch',quality:'common',value:7,nonce:'fixture'}}}},
];
const expected=fixtures.map(c=>simulate(c));
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
  let file;try{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);file=path.resolve(root,'.'+rel);}
  catch{res.writeHead(400).end();return;}
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let executable=process.env.CHROME_BIN;
if(!executable){const mac='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';if(fs.existsSync(mac))executable=mac;}
if(!executable)for(const name of ['google-chrome','google-chrome-stable','chromium','chromium-browser'])try{executable=execFileSync('which',[name],{encoding:'utf8'}).trim();break;}catch{}
if(!executable)throw Error('Real Chrome required; set CHROME_BIN');
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ashen-balance-chrome-'));
const chrome=spawn(executable,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='',ws;chrome.stderr.on('data',d=>stderr+=d.toString());const errors=[];
try{
  let port;for(let i=0;i<120;i++){const p=path.join(profile,'DevToolsActivePort');if(fs.existsSync(p)){port=fs.readFileSync(p,'utf8').split('\n')[0];break;}await delay(250);}
  if(!port)throw Error('Chrome startup failed: '+stderr.slice(-1000));
  const page=await(await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json();
  ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
  let seq=0;const waiting=new Map();
  ws.addEventListener('message',event=>{const item=JSON.parse(event.data);if(item.id){const entry=waiting.get(item.id);if(entry){clearTimeout(entry.timer);waiting.delete(item.id);item.error?entry.reject(Error(JSON.stringify(item.error))):entry.resolve(item.result);}}
    else if(item.method==='Runtime.exceptionThrown')errors.push(item.params.exceptionDetails.exception?.description||item.params.exceptionDetails.text);});
  function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{waiting.delete(id);reject(Error('CDP timeout '+method));},45000);waiting.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
  async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
  await call('Runtime.enable');await call('Page.enable');
  await call('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/dist/index.html'});
  let ready=false;for(let i=0;i<240;i++){ready=await evaluate("document.querySelector('#loadNote')?.textContent==='行装已备好。'");if(ready)break;await delay(250);}
  assert.ok(ready,'Unmodified game must start and load runtime images');
  const actual=await evaluate(`(async()=>{const {simulate}=await import('/tools/balance_lab/simulator.mjs');return ${JSON.stringify(fixtures)}.map(c=>simulate(c));})()`);
  assert.deepEqual(actual,expected,'Browser and Node full metrics/events must agree');
  const replay=await evaluate(`(async()=>{const {simulate}=await import('/tools/balance_lab/simulator.mjs');return simulate(${JSON.stringify(fixtures[0])});})()`);
  assert.deepEqual(replay,actual[0],'Browser replay is deterministic');assert.deepEqual(errors,[]);
  const report={passed:true,checkedAtUTC:new Date().toISOString(),code:provenance(),
    gameEntry:'dist/index.html',fixtureCount:fixtures.length,exactFullEventParity:true,uncaughtErrors:errors,
    fixtures:fixtures.map((config,i)=>({config,outcome:actual[i].outcome,ttk:actual[i].ttk,
      eventsSHA256:crypto.createHash('sha256').update(JSON.stringify(actual[i].events)).digest('hex')})),
    limitations:actual[0].limits};
  fs.writeFileSync(path.join(out,'BROWSER_PARITY.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({passed:true,fixtureCount:fixtures.length,exactFullEventParity:true}));
}catch(error){fs.writeFileSync(path.join(out,'FAILURE.json'),JSON.stringify({passed:false,error:error.stack,uncaughtErrors:errors},null,2)+'\n');throw error;}
finally{ws?.close();chrome.kill('SIGTERM');await new Promise(r=>server.close(r));await delay(300);fs.rmSync(profile,{recursive:true,force:true});}
