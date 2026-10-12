// Real dialogue DOM, original portrait bank and isolated saved scenes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
const baseline=false; // Historical baseline evidence is preserved under docs/ch1-voice/baseline.
const out=path.resolve(process.env.ASHEN_PORTRAIT_OUTPUT||'docs/ch12-portrait-bugs/browser');
fs.mkdirSync(out,{recursive:true});
const hook=`
import {C1_HIDDEN as portraitHidden} from './chapter-one-dialogues-v31.js';
import {STAGING as portraitStages} from './staging-v14.js';
const portraitMaps=['hall','warehouse','road','town','chapel','alley','canal','grove','guestroom','millpath','echo','workshop','post','inn','bridge','manor','spillway','exile','chamber','bridgecellar','wellcrypt'];
window.__PORTRAIT={ready:()=>assetsReady,
 hidden:()=>portraitHidden.c1HiddenPairArrangement,
 portraits:()=>({gentle:bank.portrait('艾莉娅')===bank.cropped('saintCoverV31',0),changed:bank.portrait('艾莉娅')!==bank.cropped('portraits',1)}),
 retire:()=>{__PORTRAIT.show('assassination',17);const s=JSON.parse(JSON.stringify(g.snapshot()));Object.assign(s.pending,{closing:true,c1Tail:{id:'c1HiddenSealEcho',line:3}});start(s);return {pending:g.pending,chapter:g.chapter,finished:flow?.finished,shadow:ui.querySelectorAll('.backstage-shadow').length};},
 scenes:()=>Object.keys(DIALOGUES).filter(id=>portraitMaps.includes(portraitStages.scenes[id]?.map)||id.startsWith('ch2')||['intro','contract','assassination','darkCommissionV9','darkExileV9','aside'].includes(id)).map(id=>({id,lines:DIALOGUES[id]})),
 show:(id,line,tail=null)=>{flow=null;cine=null;flowPending=null;toastList=[];g=new RPG('shadow',null,()=>.44);g.chapter=id.startsWith('ch2')?7:id==='contract'?1:2;g.enter(portraitStages.scenes[id]?.map||'hall',800,850);g.pending={id,line,phase:'dialogue',then:id==='contract'?'contractAccept':id==='assassination'?'assassinate':null};g.events=[];g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});SAVE='ashen-qa-portrait';showScene();flow.cine?.fastForward();flow.update(0);if(tail!==null)flow.openTail(tail);renderScene();g.active=false;draw();},
 inspect:()=>{const el=ui.querySelector('.portrait-art'),img=el?.tagName==='IMG'?el:null,[speaker,line]=flow.current,src=sagaPortraitV25(bank,speaker,g,cine),r=ui.querySelector('.dialogue-card')?.getBoundingClientRect(),button=ui.querySelector('[data-act=next]')?.getBoundingClientRect();return {speaker,line,scene:flow.id,tail:flow.c1Tail,kind:el?.tagName||null,hasOriginal:!!src,matchesOriginal:!!img&&img.getAttribute('src')===src,loaded:!!img&&img.complete&&img.naturalWidth>0,fill:el?.querySelector('path')?getComputedStyle(el.querySelector('path')).fill:null,anonymousLabels:ui.querySelectorAll('.speaker,.scene-label').length,card:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,button:button?{x:button.x,y:button.y,width:button.width,height:button.height}:null};},
 reload:()=>{const s=JSON.parse(JSON.stringify(g.snapshot()));start(s);return __PORTRAIT.inspect();},
 state:()=>({pending:g.pending,chapter:g.chapter,flags:g.flags,mode})
};`;
const b=await browserSession(process.cwd(),hook);
const report={baseline,scenes:[],knownTails:[],retired:[],viewports:[],errors:[]};
const save=()=>fs.writeFileSync(path.join(out,'RESULT.json'),JSON.stringify(report,null,2)+'\n');
async function inspect(){await b.wait("(()=>{const i=document.querySelector('img.portrait-art');return !i||i.complete&&i.naturalWidth>0;})()");return b.evaluate('__PORTRAIT.inspect()');}
async function next(){await delay(250);const r=(await inspect()).button;assert.ok(r);await b.click(r.x+r.width/2,r.y+r.height/2);}
try{
 await b.wait('window.__PORTRAIT?.ready()',120000);
 const scenes=await b.evaluate('__PORTRAIT.scenes()');
 const pictured=new Set();
 for(const {id,lines}of scenes){
  for(let line=0;line<lines.length;line++){
   // Inspect every dialogue line; capture each original character once.
   await b.evaluate(`__PORTRAIT.show(${JSON.stringify(id)},${line})`);
   const row=await inspect();report.scenes.push({...row,index:line});
   if(row.hasOriginal){assert.equal(row.matchesOriginal,true,id+'/'+line);assert.equal(row.loaded,true);
    if(!pictured.has(row.speaker)){pictured.add(row.speaker);await b.shot(path.join(out,'known-'+pictured.size+'.png'));}
   }
  }
 }
 report.portrait=await b.evaluate('__PORTRAIT.portraits()');assert.equal(report.portrait.gentle,true);assert.equal(report.portrait.changed,true);
 const hidden=await b.evaluate('__PORTRAIT.hidden()');
 for(let line=0;line<hidden.length;line++){
  await b.evaluate(`__PORTRAIT.show('contract',19,${line})`);const row=await inspect();report.knownTails.push(row);
  assert.deepEqual([row.speaker,row.line],hidden[line]);
  if(row.speaker==='旁白')assert.equal(row.kind,null);
  else{assert.equal(row.matchesOriginal,true);assert.equal(row.loaded,true);assert.equal(row.kind,'IMG');}
  if([1,3,8,10].includes(line))await b.shot(path.join(out,'backstage-known-'+line+'.png'));
 }
 for(const [width,height]of [[1440,980],[844,390],[390,844]]){
  await b.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});
  await b.evaluate("__PORTRAIT.show('contract',19,8)");const row=await inspect();
  assert.ok(row.card.y>=0&&row.card.y+row.card.height<=height+1);assert.ok(row.button.y>=0&&row.button.y+row.button.height<=height+1);
  assert.equal(row.matchesOriginal,true);await b.shot(path.join(out,'exchange-'+width+'.png'));
  const restored=await b.evaluate('__PORTRAIT.reload()');assert.equal(restored.tail.line,8);assert.equal(restored.tail.revision,3);
  report.viewports.push({width,height,restored});await next();assert.equal((await inspect()).speaker,'旁白');
  await next();assert.equal((await inspect()).speaker,'鲁恩');await next();assert.equal((await b.evaluate('__PORTRAIT.state()')).chapter,2);
  const retired=await b.evaluate('__PORTRAIT.retire()');assert.equal(retired.pending,null);assert.equal(retired.chapter,3);assert.equal(retired.shadow,0);report.retired.push(retired);
 }
 assert.deepEqual(b.errors,[]);report.passed=true;report.errors=b.errors;save();
 console.log(JSON.stringify({baseline,scenes:scenes.length,lines:report.scenes.length,speakers:pictured.size,knownTailMatches:report.knownTails.map(x=>x.matchesOriginal),gentlePortrait:report.portrait,retired:report.retired.length,errors:b.errors}));
}catch(e){report.passed=false;report.error=String(e);report.errors=b.errors;save();await b.shot(path.join(out,'failure.png'));throw e;}finally{await b.close();}
