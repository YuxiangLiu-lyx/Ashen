import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
import {C1_CARE_DIALOGUES} from '../dist/chapter-one-care-dialogues.js';
const out=path.resolve(process.env.ASHEN_READER_OUTPUT||'docs/c1-care-ui/browser');fs.mkdirSync(out,{recursive:true});
const hook=`window.__READER={ready:()=>assetsReady,
 reset:()=>{flow=null;cine=null;flowPending=null;g=new RPG('shadow',null,()=>.44);g.chapter=2;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];g.events=[];toastList=[];chapterCards.attach(g,{restored:true});SAVE='ashen-reader-isolated';play();},
 scene:async(id,line=0,action=false)=>{__READER.reset();if(id==='contract')g.chapter=1;g.beginScene(id,id==='contract'?'contractAccept':null);g.pending.line=line;g.events=[];showScene();if(!action){flow.cine?.fastForward();flow.update(0);renderScene();}draw();await Promise.all([...document.querySelectorAll('img')].map(i=>i.decode()));return __READER.state();},
 state:()=>({mode,phase:flow?.phase,live:flow?.readingIndex,shown:dialogueReader?.index,total:flow?.readingRows.length,review:dialogueReader?.reviewing,text:document.querySelector('.dialogue-card .line')?.textContent,pending:g.pending,map:g.map,x:g.p.x,y:g.p.y,chapter:g.chapter,flags:g.flags,ledger:g.c1Expansion.claimLedger,move:g.moveTo}),
 restore:()=>{start(JSON.parse(JSON.stringify(g.snapshot())));return __READER.state();},
 layout:()=>{const line=document.querySelector('.line'),card=document.querySelector('.dialogue-card');const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {card:rect(card),line:rect(line),overflow:line.scrollHeight>line.clientHeight,buttons:[...document.querySelectorAll('.dialogue-bottom button')].map(b=>({text:b.textContent,...rect(b)})),images:[...document.querySelectorAll('img.portrait-art')].map(i=>({loaded:i.complete&&i.naturalWidth>0,w:i.naturalWidth,h:i.naturalHeight,alt:i.alt}))};},
 npc:async(id,map)=>{__READER.reset();g.enter(map,800,850);g.pending=null;g.events=[];npc(id);draw();await Promise.all([...document.querySelectorAll('img')].map(i=>i.decode()));return [...document.querySelectorAll('img.portrait-art')].map(i=>({w:i.naturalWidth,h:i.naturalHeight}));},
 quest:(kind)=>{__READER.reset();g.quests.rats='done';if(kind==='claim'){g.quests.oil='active';g.p.items.oil=5;g.c1Expansion.journey.counts.oil=5;}g.choose('c1:'+kind+':oil');g.events=[];showScene();return __READER.state();},
 snapshot:()=>{const s=g.snapshot();delete s.time;return JSON.stringify(s);}};`;
const b=await browserSession(process.cwd(),hook),report={status:'running',input:[],layouts:[],portraits:[]};
const state=()=>b.evaluate('__READER.state()');
async function button(action){const p=await b.evaluate(`(()=>{const r=document.querySelector('[data-act="${action}"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);await b.click(p.x,p.y);await delay(260);}
async function click(x=1100,y=250){await b.click(x,y);await delay(260);}
async function setup(id='sisterIdle',line=0,action=false){await b.evaluate(`__READER.scene('${id}',${line},${action})`);await delay(260);}
try{
 await b.wait('window.__READER?.ready()',120000);
 await setup();assert.equal((await state()).live,0);
 // Disabled Previous must not bubble into a next-page click.
 await button('previous');assert.equal((await state()).live,0);
 await click();assert.equal((await state()).live,1);report.input.push('background click');
 const line=await b.evaluate("(()=>{const r=document.querySelector('.line').getBoundingClientRect();return{x:r.x+20,y:r.y+15}})()");await click(line.x,line.y);assert.equal((await state()).live,2);report.input.push('text click');
 await click(180,450);assert.equal((await state()).live,3);report.input.push('portrait area');
 const original=await b.evaluate('__READER.snapshot()');await button('previous');assert.equal((await state()).shown,2);assert.equal(await b.evaluate('__READER.snapshot()'),original);
 await button('previous');assert.equal((await state()).shown,1);assert.equal((await state()).live,3);
 await click();assert.equal((await state()).shown,2);assert.equal((await state()).live,3);await button('next');assert.equal((await state()).review,false);assert.equal((await state()).live,3);
 await button('previous');assert.equal((await b.evaluate('__READER.restore()')).live,3);assert.equal((await state()).review,false);report.input.push('history is read only; reload uses live cursor');
 await setup();await b.click(1100,250);await b.click(1100,250);await delay(260);assert.equal((await state()).live,1);report.input.push('rapid double click advances once');
 await setup();await b.call('Input.dispatchMouseEvent',{type:'mousePressed',x:1000,y:250,button:'left',clickCount:1});await b.call('Input.dispatchMouseEvent',{type:'mouseMoved',x:1080,y:300,button:'left',buttons:1});await b.call('Input.dispatchMouseEvent',{type:'mouseReleased',x:1080,y:300,button:'left',clickCount:1});assert.equal((await state()).live,0);report.input.push('drag does not advance');
 await setup('sisterIdle',2);await b.evaluate("document.querySelector('[data-act=previous]').focus()");await b.key('Enter');await b.key('Enter',false);await delay(260);assert.equal((await state()).shown,1);assert.equal((await state()).live,2);report.input.push('keyboard activates focused Previous');
 await b.key('ArrowRight');await b.key('ArrowRight',false);await delay(260);assert.equal((await state()).shown,2);await b.key('ArrowLeft');await b.key('ArrowLeft',false);await delay(260);assert.equal((await state()).shown,1);report.input.push('left/right keyboard');
 await setup('contract',0,true);const act=await state();if(act.phase==='action'){await click();assert.equal((await state()).live,0);}await b.wait("__READER.state().phase==='dialogue'",15000);assert.equal((await state()).live,0);report.input.push('cinematic action cannot be skipped by click');
 for(let n=0;n<90&&(await state()).pending?.id==='contract';n++){if((await state()).phase==='action')await b.wait("__READER.state().phase!=='action'",15000);else await click();}assert.equal((await state()).chapter,2);assert.equal((await state()).flags.c1PrivateTalk,'awaitingExit');assert.equal((await state()).move,null);report.input.push('entire commission with actual clicks and uninterrupted cinematic beats');
 for(const kind of ['accept','claim']){await b.evaluate(`__READER.quest('${kind}')`);await delay(260);for(let i=0;i<20;i++){const s=await state();if(s.live===s.total-1)break;await click();}const before=await b.evaluate('__READER.snapshot()');await button('previous');await button('next');assert.equal(await b.evaluate('__READER.snapshot()'),before);await click();assert.equal((await state()).pending,null);assert.equal((await state()).move,null);report.input.push(kind+' transaction commits at live final page only');}
 for(const [width,height]of [[1440,980],[844,390],[390,844]]){
  await b.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await delay(200);
  let pages=0;
  for(const [id,rows]of Object.entries(C1_CARE_DIALOGUES))for(let i=0;i<rows.length;i++){
   await b.evaluate(`__READER.scene('${id}',${i})`);const l=await b.evaluate('__READER.layout()');assert.equal(l.overflow,false,id+':'+i);assert.ok(l.card.y>=0&&l.card.y+l.card.h<=height+1,JSON.stringify(l));for(const button of l.buttons)assert.ok(button.x>=0&&button.x+button.w<=width+1&&button.y+button.h<=height+1,JSON.stringify(l));assert.ok(l.images.every(p=>p.loaded));pages++;
  }
  report.layouts.push({width,height,pages});await setup('contract',33);await b.shot(path.join(out,`care-${width}.png`));await button('previous');await b.shot(path.join(out,`review-${width}.png`));
  for(const [id,map]of [['c1iden','c1TrialFoyer'],['c1hesha','c1TrialCrypt'],['c1venn','c1TrialVault']]){const imgs=await b.evaluate(`__READER.npc('${id}','${map}')`);assert.ok(imgs.every(i=>i.w>=470&&i.h>=900),JSON.stringify(imgs));report.portraits.push({id,width,height,imgs});await b.shot(path.join(out,`${id}-${width}.png`));}
 }
 await setup();await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:200}]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(300);assert.equal((await state()).live,1);report.input.push('real touch tap');
 for(const id of ['ch2Arrival','ch3Arrival','v25C8Dawn']){await setup(id,1);await button('previous');assert.equal((await state()).shown,0);await click(300,200);assert.equal((await state()).live,1);assert.equal((await state()).shown,1);report.input.push('later chapter '+id);}
 assert.deepEqual(b.errors,[]);report.status='passed';console.log(JSON.stringify(report));
}catch(e){report.status='failed';report.error=e.stack;await b.shot(path.join(out,'failure.png'));throw e;}finally{report.errors=b.errors;fs.writeFileSync(path.join(out,'QA.json'),JSON.stringify(report,null,2));await b.close();}
