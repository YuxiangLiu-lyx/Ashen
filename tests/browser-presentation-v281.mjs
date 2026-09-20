// Full HTTP browser smoke test. Test hooks exist only in the in-memory QA response,
// never in the shipped game module. Uses Node 22 and a locally installed Chrome.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';
import os from 'node:os';import {spawn,execFileSync} from 'node:child_process';import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=path.join(root,'dist');
const out=path.resolve(process.env.ASHEN_QA_OUTPUT||path.join(root,'qa-export/browser'));fs.mkdirSync(out,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const hook=`
window.__ASHEN_QA={ready:()=>assetsReady,state:()=>({mode,map:g?.map,version:'28.1'}),
 async gallery(){
  const {loot}=await import('./core-v14.js');
  const panel=document.createElement('canvas');panel.id='qa-presentation-gallery';panel.width=1440;panel.height=980;
  Object.assign(panel.style,{position:'fixed',inset:'0',zIndex:'99999',width:'1440px',height:'980px'});document.body.appendChild(panel);
  const c=panel.getContext('2d');c.fillStyle='#182428';c.fillRect(0,0,1440,980);
  const label=(text,x,y,size=17)=>{c.font=size+'px "Noto Sans CJK SC",sans-serif';c.fillStyle='#e8dfc8';c.textAlign='center';c.fillText(text,x,y);};
  const divider=y=>{c.strokeStyle='#405154';c.beginPath();c.moveTo(30,y);c.lineTo(1410,y);c.stroke();};
  label('V28.1 · 实际游戏渲染验收',720,36,25);label('同一脚底基准 · 职业武器与装备层 · 原生物种与首领轮廓',720,65,16);
  let col=0;for(const cls of ['shadow','oath','ember'])for(const rarity of ['common','abyssal']){
   const p=new RPG(cls).p;p.level=24;p.gear={};
   for(const slot of ['weapon','head','chest','hands','feet','relic'])p.gear[slot]=loot(cls,23,()=>.4,{slot,rarity,id:rarity==='common'?'qa-'+slot:({weapon:'v28-ashen-vow',chest:'v28-last-guard',relic:'v28-nameless-echo',head:'v28-greycrown',hands:'v28-bloodwell',feet:'v28-black-iron-step'})[slot]});
   const x=120+col++*240;c.save();c.translate(x,275);c.scale(1.7,1.7);drawHero(c,bank,p,0,0,1,{angle:0,moving:false});c.restore();label(({shadow:'刺客',oath:'战士',ember:'法师'})[cls]+' · '+(rarity==='common'?'普通装备':'黑曜装备'),x,306);
  }
  divider(332);label('重点稀有武器与角色比例（均调用正式渲染器）',720,362,19);
  const named=[['v28-greyfang-edge','灰牙磨刃'],['v28-bonebrand','焦骨刻刃'],['v28-oath-ember','断誓余烬刃'],['v28-ashen-vow','烬誓']];
  for(let i=0;i<named.length;i++){
   const p=new RPG('shadow').p;p.gear={weapon:loot('shadow',23,()=>.4,{slot:'weapon',rarity:'abyssal',id:named[i][0]})};
   c.save();c.translate(120+i*240,550);c.scale(1.7,1.7);drawHero(c,bank,p,0,0,1,{angle:0,moving:false});c.restore();label(named[i][1],120+i*240,580);
  }
  c.save();c.translate(1080,550);c.scale(1.7,1.7);drawNPC(c,bank,{id:'saint',x:0,y:0,angle:0,moving:true,walkDistance:22},1,{size:80});c.restore();label('艾莉娅 · 80',1080,580);
  c.save();c.translate(1320,550);c.scale(1.7,1.7);drawSagaActorV25(c,bank,'npc',{id:'ch8Chengli',x:0,y:0,angle:0,moving:true,walkDistance:22},g);c.restore();label('澄璃 · 81',1320,580);
  divider(612);label('不同物种与首领 · 非单纯换色',720,646,19);
  const enemies=[['rat','灰鼠'],['wolf','狼'],['hellSoul','亡魂'],['ironScuttler','铁壳伏行者'],['furnaceSentinel','熔炉监守'],['odric','奥德里克'],['martha','玛尔塔'],['v25FinalJudge','终审者']];
  for(let i=0;i<enemies.length;i++){const [type,name]=enemies[i];c.save();c.translate(90+i*180,895);c.scale(1.3,1.3);drawMonster(c,bank,{type,id:type,isBoss:i>=3,level:16,x:0,y:0,angle:0,moving:true,walkDistance:22},1);c.restore();label(name,90+i*180,929,16);}
  return {name:'presentation-gallery',hero_loadouts:6,rare_weapon_details:4,lead_characters:2,enemy_silhouettes:8};
 },

 checkpoint(ch){beginChapterTestV26(ch);return {map:g.map,stage:g.sagaV25?.stage};},
 async preview(map,cls='shadow'){
  const {loot}=await import('./core-v14.js');
  g=/^ch[678]/.test(map)?createStoryChapterTestV26(RPG,stats,8,cls):new RPG(cls);
  g.flags.complete=false;g.p.level=24;g.p.gear={};
  for(const slot of ['weapon','head','chest','hands','feet','relic'])g.p.gear[slot]=loot(cls,23,()=>.4,{slot,rarity:'epic',id:slot==='weapon'?'v28-oath-ember':'qa-'+slot});
  g.enter(map,800,740);g.pending=null;g.events=[];flow=null;cine=null;flowPending=null;g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;
  const at=g.safePoint(800,740);g.relocate(at.x,at.y);g.saint={...g.saint,x:g.p.x+64,y:g.p.y+18,visible:true};
  SAVE='ashen-qa-isolated';play();g.active=false;cam={x:g.p.x,y:g.p.y-100};draw();return {map:g.map,cls:g.p.cls};
 },
 async scene(id,line=0){
  const {STAGING}=await import('./staging-v14.js');if(!g)beginChapterTestV26(8);
  g.enter(STAGING.scenes[id].map,...(MAPS[STAGING.scenes[id].map].entry||[800,740]));
  flow=null;cine=null;flowPending=null;g.pending=null;g.events=[];g.beginScene(id);showScene();
  let guard=0;while(flow&&flow.index<Math.min(line,flow.lines.length-1)&&guard++<200){flow.cine?.fastForward();flow.update(0);flow.advance();}
  flow.cine?.fastForward();flow.update(0);renderScene();draw();return {id:flow.id,line:flow.index,phase:flow.phase,speaker:flow.current?.[0],text:flow.current?.[1],portraits:document.querySelectorAll('.portrait-art').length,largeArt:document.querySelectorAll('.story-illustration-v19').length};
 }};
`;
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp'};
const requests=[],server=http.createServer((req,res)=>{
 const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';requests.push(rel);
 if(rel==='qa-game-v281.js'){res.setHeader('Content-Type','text/javascript');res.end(fs.readFileSync(path.join(dist,'game-v14.js'),'utf8')+hook);return;}
 const file=path.resolve(dist,rel);if(!file.startsWith(dist+path.sep)){res.writeHead(403).end();return;}
 try{let data=fs.readFileSync(file);if(rel==='index.html')data=Buffer.from(data.toString().replace('src="game-v14.js"','src="qa-game-v281.js"'));res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}
});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const port=server.address().port,profile=fs.mkdtempSync(path.join(os.tmpdir(),'ashen-chrome-'));
let executable=process.env.CHROME_BIN;
if(!executable){for(const p of ['google-chrome','google-chrome-stable','chromium','chromium-browser'])try{executable=execFileSync('which',[p],{encoding:'utf8'}).trim();break;}catch{}}
if(!executable)throw Error('A Chrome executable is required for full browser QA.');
const chrome=spawn(executable,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--user-data-dir='+profile,'--window-size=1440,980','about:blank'],{stdio:['ignore','ignore','pipe']});
let browserLog='';chrome.stderr.on('data',b=>browserLog+=b.toString());
let ws;const errors=[],results=[];
try{
 let debugPort;for(let i=0;i<120;i++){const file=path.join(profile,'DevToolsActivePort');if(fs.existsSync(file)){debugPort=fs.readFileSync(file,'utf8').split('\n')[0];break;}await delay(250);}if(!debugPort)throw Error('Chrome debugger did not start. '+browserLog.slice(-2000));
 const page=await(await fetch('http://127.0.0.1:'+debugPort+'/json/new?about:blank',{method:'PUT'})).json();
 ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
 let seq=0;const pending=new Map();
 ws.addEventListener('message',event=>{const v=JSON.parse(event.data);if(v.id){const q=pending.get(v.id);if(q){clearTimeout(q.timer);pending.delete(v.id);v.error?q.reject(Error(JSON.stringify(v.error))):q.resolve(v.result);}}else if(v.method==='Runtime.exceptionThrown')errors.push(v.params.exceptionDetails.exception?.description||v.params.exceptionDetails.text);});
 function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout: '+method));},90000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
 await call('Page.enable');await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width:1440,height:980,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:'+port+'/'});
 let ready=false;for(let i=0;i<240;i++){ready=await evaluate('!!window.__ASHEN_QA?.ready()');if(ready)break;await delay(500);}assert.ok(ready,'all runtime images must load');
 async function shot(name){await delay(300);const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));}
 await shot('01-title');results.push({name:'title',...(await evaluate('window.__ASHEN_QA.state()'))});
 for(const cls of ['shadow','oath','ember']){results.push({name:'hall-'+cls,...await evaluate(`window.__ASHEN_QA.preview('hall',${JSON.stringify(cls)})`)});await shot('02-hall-'+cls);}
 for(const chapter of [6,7,8])results.push({name:'checkpoint-'+chapter,...await evaluate(`window.__ASHEN_QA.checkpoint(${chapter})`)});
 await evaluate("window.__ASHEN_QA.preview('ch8GuestHouse')");await shot('03-ch8-guesthouse');
 // Narration deliberately has no character portrait. Verify a narration beat AND
 // the following named-speaker beat; never weaken the actual portrait assertion.
 for(const [id,narration,line,speaker]of [['v25C8Sanctuary',14,15,'诺恩'],['v25C8Dawn',12,13,'澄璃'],['v25C8Bind',10,11,'澄璃'],['v25C8After',13,14,'澄璃']]){
  const narrated=await evaluate(`window.__ASHEN_QA.scene(${JSON.stringify(id)},${narration})`);
  assert.equal(narrated.phase,'dialogue','narration must finish its stage movement');
  assert.equal(narrated.speaker,'旁白');assert.ok(narrated.text?.length>0);
  assert.equal(narrated.largeArt,0,'chapter 8 narration must not display a CG');
  assert.equal(narrated.portraits,0,'do not invent a portrait for the narrator');
  results.push({name:'narration',...narrated});
  const state=await evaluate(`window.__ASHEN_QA.scene(${JSON.stringify(id)},${line})`);
  assert.equal(state.phase,'dialogue');assert.equal(state.speaker,speaker);
  assert.equal(state.largeArt,0,'chapter 8 CG panel must not appear');
  assert.ok(state.portraits>0,'chapter 8 speaker portraits must remain');
  await delay(150);assert.ok(await evaluate("[...document.querySelectorAll('.portrait-art')].every(i=>i.complete&&i.naturalWidth>0)"),'retained portraits must load');
  results.push({name:'scene',...state});await shot('04-'+id);
 }
 results.push(await evaluate('window.__ASHEN_QA.gallery()'));await shot('05-presentation-gallery');await evaluate("document.getElementById('qa-presentation-gallery').remove()");
 const oldCG=requests.filter(p=>/assets\/v26\/c8-(first|dawn|rescue|binding|spirit)-v26\.webp/.test(p));assert.deepEqual(oldCG,[],'old chapter 8 CGs must not be fetched');
 assert.deepEqual(errors,[],'no uncaught runtime exceptions');
 fs.writeFileSync(path.join(out,'BROWSER_QA.json'),JSON.stringify({version:'28.1',tested_at:new Date().toISOString(),browser:await evaluate('navigator.userAgent'),results,chapter8_cg_requests:oldCG,uncaught_errors:errors,scope:'Real HTTP Chromium title, class previews, chapter checkpoints and four chapter 8 scenes; not a complete eight-chapter playthrough.'},null,2)+'\n');
 console.log('Browser QA passed:',results.length,'checks,',requests.length,'resource requests, no runtime exceptions.');
}catch(e){fs.writeFileSync(path.join(out,'BROWSER_FAILURE.json'),JSON.stringify({error:e.stack,uncaught:errors,browserLog:browserLog.slice(-4000)},null,2));throw e;}
finally{ws?.close();chrome.kill('SIGTERM');server.close();}
