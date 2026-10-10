// Shared real-HTTP Chrome driver for game acceptance. Hooks exist only in QA responses.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import {spawn, execFileSync} from 'node:child_process';
export const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export async function browserSession(root, hook, {width=1440,height=980}={}) {
  const dist=path.join(root,'dist'), errors=[], requests=[];
  const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp'};
  const server=http.createServer((req,res)=>{
    const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html'; requests.push(rel);
    const file=path.resolve(dist,rel);
    if(!file.startsWith(dist+path.sep)){res.writeHead(403).end();return;}
    try {
      let data=fs.readFileSync(file);
      if(rel==='game-v14.js')data=Buffer.from(data.toString()+hook);
      res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);
    } catch {res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ashen-world-'));
  let executable=process.env.CHROME_BIN;
  if(!executable)for(const p of ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','google-chrome','google-chrome-stable','chromium','chromium-browser']) {
    if(fs.existsSync(p)){executable=p;break;}
    try{executable=execFileSync('which',[p],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();break;}catch{}
  }
  if(!executable){server.close();throw Error('Chrome is required');}
  const chrome=spawn(executable,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=0','--user-data-dir='+profile,`--window-size=${width},${height}`,'about:blank'],{stdio:['ignore','ignore','ignore']});
  let ws,seq=0;const pending=new Map();
  async function close(){ws?.close();chrome.kill('SIGTERM');server.close();await delay(100);fs.rmSync(profile,{recursive:true,force:true});}
  try {
    let port;for(let i=0;i<120;i++){const file=path.join(profile,'DevToolsActivePort');if(fs.existsSync(file)){port=fs.readFileSync(file,'utf8').split('\n')[0];break;}await delay(250);}
    if(!port)throw Error('Chrome did not start');
    const page=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();
    ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
    ws.addEventListener('message',event=>{const value=JSON.parse(event.data);if(value.id){const p=pending.get(value.id);if(p){clearTimeout(p.timer);pending.delete(value.id);value.error?p.reject(Error(JSON.stringify(value.error))):p.resolve(value.result);}}else if(value.method==='Runtime.exceptionThrown')errors.push(value.params.exceptionDetails.exception?.description||value.params.exceptionDetails.text);});
    const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>reject(Error('CDP timeout: '+method)),90000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});
    const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
    await call('Page.enable');await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
    return {call,evaluate,errors,requests,close,
      async wait(expression,timeout=60000){const end=Date.now()+timeout;while(Date.now()<end){if(await evaluate(expression))return;await delay(100);}throw Error('Timed out: '+expression);},
      async click(x,y){await call('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await call('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});},
      async key(key,down=true){await call('Input.dispatchKeyEvent',{type:down?'keyDown':'keyUp',key,code:key.length===1?'Key'+key.toUpperCase():key,windowsVirtualKeyCode:key.length===1?key.toUpperCase().charCodeAt(0):13});},
      async shot(file){await delay(120);const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,Buffer.from(r.data,'base64'));}
    };
  } catch(error){await close();throw error;}
}
