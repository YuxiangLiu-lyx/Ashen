// Isolated rendering/transaction diagnostics; normal input route is checked separately.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
import {C1_QUEST_DIALOGUES} from '../dist/chapter-one-quest-dialogues.js';
const out=path.resolve(process.env.ASHEN_FLOW_OUTPUT||'docs/c1-story-flow/browser');fs.mkdirSync(out,{recursive:true});
const hook=`
window.__FLOW={ready:()=>assetsReady,
 reset:()=>{flow=null;cine=null;flowPending=null;toastList=[];g=new RPG('shadow',null,()=>.44);g.chapter=2;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});SAVE='ashen-flow-isolated';g.events=[];play();},
 state:()=>({mode,map:g.map,x:g.p.x,y:g.p.y,phase:flow?.phase,index:flow?.index,pending:g.pending,flags:g.flags,actors:flow?.cine?.actors,stage:flow?.cine?.map,knowledge:g.knowledge}),
 scene:async(id,line=0)=>{__FLOW.reset();g.beginScene(id);g.pending.line=line;g.events=[];showScene();flow.cine?.fastForward();flow.update(0);renderScene();draw();await Promise.all([...document.querySelectorAll('img.portrait-art')].map(i=>i.decode()));return __FLOW.layout();},
 leave:()=>{__FLOW.reset();g.flags.c1PrivateTalk='awaitingExit';g.enter('c1TrainingYard',800,850);g.events=[];showScene();draw();return __FLOW.state();},
 restore:()=>{const save=JSON.parse(JSON.stringify(g.snapshot()));start(save);return __FLOW.state();},
 layout:()=>{const card=document.querySelector('.dialogue-card'),line=card?.querySelector('.line'),r=card?.getBoundingClientRect();return {rect:r?{x:r.x,y:r.y,w:r.width,h:r.height}:null,overflow:line?line.scrollHeight>line.clientHeight:false,portrait:[...document.querySelectorAll('img.portrait-art')].map(x=>({alt:x.alt,loaded:x.complete&&x.naturalWidth>0})),black:!!document.querySelector('.backstage-dialogue'),text:line?.textContent};},
 hall:(collision=false)=>{__FLOW.reset();g.active=false;cam={x:800,y:540};scale=Math.min(w/1600,h/1080);ui.style.visibility='hidden';notice.style.visibility='hidden';draw();const cells=[];if(collision){ctx.save();ctx.translate(w/2-view.x*scale,h/2-view.y*scale);ctx.scale(scale,scale);for(let y=10;y<1080;y+=20)for(let x=10;x<1600;x+=20){const blocked=g.blocked(x,y,false);cells.push({x,y,blocked});ctx.fillStyle=blocked?'#d4484866':'#39c68544';ctx.fillRect(x-10,y-10,20,20);}ctx.restore();}const image=canvas.toDataURL('image/png').split(',')[1];ui.style.visibility='visible';notice.style.visibility='visible';return {image,cells};}
};`;
const b=await browserSession(process.cwd(),hook),report={status:'running',scope:'Actual renderer with isolated saves; real next-button input; no geometry or actor asset changes.',layouts:[],meeting:[],errors:[]};
const persist=()=>fs.writeFileSync(path.join(out,'QA.json'),JSON.stringify(report,null,2)+'\n');
async function next(){const p=await b.evaluate("(()=>{const r=document.querySelector('[data-act=next]')?.getBoundingClientRect();return r?{x:r.x+r.width/2,y:r.y+r.height/2}:null;})()");assert.ok(p);await b.click(p.x,p.y);await delay(280);}
try{
 await b.wait('window.__FLOW?.ready()',120000);
 for(const collision of [false,true]){const d=await b.evaluate(`__FLOW.hall(${collision})`);fs.writeFileSync(path.join(out,collision?'hall-collision.png':'hall.png'),Buffer.from(d.image,'base64'));if(collision)fs.writeFileSync(path.join(out,'hall-cells.json'),JSON.stringify(d.cells));}
 await b.evaluate('__FLOW.leave()');report.meeting.push(await b.evaluate('__FLOW.state()'));await b.shot(path.join(out,'meeting-walk.png'));
 await b.wait("__FLOW.state().phase==='dialogue'",15000);let s=await b.evaluate('__FLOW.state()');assert.equal(s.map,'c1TrainingYard');assert.equal(s.stage,'hall');assert.deepEqual(s.actors.map(a=>a.id).sort(),['clerk','sister']);await b.shot(path.join(out,'meeting-arrival.png'));
 const original={map:s.map,x:s.x,y:s.y,knowledge:s.knowledge};await next();await b.shot(path.join(out,'meeting-vilerena.png'));assert.equal((await b.evaluate('__FLOW.layout()')).black,false);
 const restored=await b.evaluate('__FLOW.restore()');assert.equal(restored.index,1);report.restored=restored;
 for(let n=0;n<15&&(await b.evaluate('__FLOW.state()')).pending;n++){await next();await delay(30);}
 s=await b.evaluate('__FLOW.state()');assert.equal(s.pending,null);assert.equal(s.flags.c1Viewed.c1HiddenPairArrangement,true);assert.deepEqual({map:s.map,x:s.x,y:s.y,knowledge:s.knowledge},original);report.meeting.push(s);await b.shot(path.join(out,'back-to-yard.png'));
 for(const [width,height]of [[1440,980],[844,390],[390,844]]){
  await b.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await delay(200);
  let pages=0;
  for(const [id,rows]of Object.entries(C1_QUEST_DIALOGUES))for(let i=0;i<rows.length;i++){
   const l=await b.evaluate(`__FLOW.scene(${JSON.stringify(id)},${i})`);assert.ok(l.rect,id);assert.equal(l.overflow,false,id);assert.ok(l.rect.y>=0&&l.rect.y+l.rect.h<=height+1,id+JSON.stringify(l));assert.ok(l.portrait.every(p=>p.loaded),id);assert.equal(l.text,rows[i][1]);pages++;
  }
  report.layouts.push({width,height,scenes:Object.keys(C1_QUEST_DIALOGUES).length,pages});
  await b.evaluate("__FLOW.scene('c1Talk_c1Readiness_offer',4)");await b.shot(path.join(out,`trial-${width}.png`));
  await b.evaluate("__FLOW.scene('c1Talk_herbs_offer',4)");await b.shot(path.join(out,`herbs-${width}.png`));
  await b.evaluate("__FLOW.scene('c1HiddenPairArrangement',3)");await b.shot(path.join(out,`meeting-rune-${width}.png`));
 }
 assert.deepEqual(b.errors,[]);report.status='passed';report.errors=b.errors;persist();console.log(JSON.stringify({status:report.status,layouts:report.layouts,meeting:'real hall; two actors; returns to actual yard; exact saved page'}));
}catch(e){report.status='failed';report.error=e.stack;report.errors=b.errors;persist();throw e;}finally{await b.close();}
