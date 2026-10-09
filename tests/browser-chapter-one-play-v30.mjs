// Continuous mouse/keyboard play from the title. No teleports, damage, stats or immunity hooks.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
const out=path.resolve('qa-export/chapter-one-play-v30'),steps=[];
const hook=`window.__PLAY={ready:()=>assetsReady,state:()=>({mode,map:g?.map,p:g?{x:g.p.x,y:g.p.y,hp:g.p.hp,mp:g.p.mp,level:g.p.level}:null,pending:g?.pending,quests:g?.quests,flags:g?.flags,transition:g?.transition}),targets:()=>g.targets(),enemies:()=>g.enemies.filter(e=>!e.dead).map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp,wind:e.wind,attack:e.attackAnim})),point:(x,y)=>({x:w/2+(x-view.x)*scale,y:h/2+(y-view.y)*scale})};`;
const b=await browserSession(process.cwd(),hook),state=()=>b.evaluate('__PLAY.state()');
async function button(selector){
 const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 assert.ok(p,'Missing '+selector);await b.click(p.x,p.y);await delay(180);
}
async function dialogue(){
 for(let i=0;i<140;i++){
  const s=await state();if(s.mode==='play'&&!s.pending)return;
  if(s.mode==='transition'){await button('[data-act=transition-confirm]');continue;}
  if(await b.evaluate('!!document.querySelector("[data-act=next]")'))await button('[data-act=next]');
  else if(await b.evaluate('!!document.querySelector(".chapter-card button")'))await button('.chapter-card button');
  else await delay(180);
 }throw Error('Dialogue stalled');
}
async function world(x,y){const p=await b.evaluate(`__PLAY.point(${x},${y})`);await b.click(p.x,p.y);}
async function walk(x,y){
 const initialMap=(await state()).map;
 for(let i=0;i<36;i++){
  let s=await state();if(s.map!==initialMap)return;if(s.mode==='dialogue'||s.mode==='transition')await dialogue();
  if(s.mode==='npc')await button('[data-act=resume]');s=await state();if(s.map!==initialMap)return;
  if(s.mode==='death')throw Error('Player died walking');
  const d=Math.hypot(s.p.x-x,s.p.y-y);if(d<55)return;
  const q={x:s.p.x+(x-s.p.x)*Math.min(1,200/d),y:s.p.y+(y-s.p.y)*Math.min(1,200/d)};
  const p=await b.evaluate(`__PLAY.point(${q.x},${q.y})`);await b.click(Math.max(40,Math.min(1390,p.x)),Math.max(180,Math.min(760,p.y)));await delay(700);
  if((await state()).map!==s.map)return;
 }throw Error('Could not walk to '+x+','+y);
}
async function target(id){
 const initialMap=(await state()).map;
 const t=await b.evaluate(`__PLAY.targets().find(t=>t.id===${JSON.stringify(id)})`);assert.ok(t,id);
 await walk(t.x,t.y+(t.kind==='npc'?60:0));if((await state()).map!==initialMap)return;await world(t.drawX??t.x,(t.drawY??t.y)-25);await delay(500);
 if((await state()).mode==='transition')await dialogue();
}
async function fight(ms=35000,range=600){
 const end=Date.now()+ms;let n=0;
 while(Date.now()<end){
  const s=await state();if(s.mode==='death')return 'loss';
  if(s.mode==='dialogue'||s.mode==='transition'){await dialogue();continue;}
  const es=(await b.evaluate('__PLAY.enemies()')).filter(e=>Math.hypot(e.x-s.p.x,e.y-s.p.y)<range).sort((a,b)=>Math.hypot(a.x-s.p.x,a.y-s.p.y)-Math.hypot(b.x-s.p.x,b.y-s.p.y));
  if(!es.length)return 'clear';const e=es[0];await world(e.x,e.y-25);
  for(const key of (n%3===0?['1','2']:['j'])){await b.key(key);await b.key(key,false);}
  if(s.p.hp<90){await b.key('4');await b.key('4',false);}
  if(s.p.mp<18){await b.key('5');await b.key('5',false);}
  await delay(450);n++;
 }return 'timeout';
}
async function record(name,extra={}){await b.shot(path.join(out,name+'.png'));steps.push({name,...extra,state:await state()});console.log(name,steps.at(-1).state.map);}
try{
 await b.wait('window.__PLAY?.ready()',120000);await button('[data-act=select]');await button('[data-act=begin]');await dialogue();await record('01-hall');
 await target('steward');await button('[data-choice=ratsAccept]');await dialogue();await target('warehouse');await record('02-warehouse');
 await walk(680,420);const rats=await fight(45000,950);await record('03-rat-combat',{outcome:rats});assert.equal(rats,'clear');
 await target('crack');await dialogue();await target('hall');await target('steward');await button('[data-choice=ratsDone]');await dialogue();
 await target('sister');await button('[data-choice=contractAccept]');await dialogue();await target('road');await record('04-road');
 await target('courier');await button('[data-choice=letterAccept]');await dialogue();await walk(900,560);const wolves=await fight(45000,800);await record('05-wolves',{outcome:wolves});assert.equal(wolves,'clear');
 await target('letter');await dialogue();await target('town');await target('watch');await button('[data-choice=pass]');await dialogue();await record('06-town');
 await target('chapel');await dialogue();await record('07-chapel');await target('alley');await dialogue();await record('08-alley');await target('canal');await dialogue();await record('08-canal');
 const boss=await fight(50000,1400);await record('09-captain',{outcome:boss});
 assert.deepEqual(b.errors,[]);
 fs.writeFileSync(path.join(out,'PLAY.json'),JSON.stringify({at:new Date().toISOString(),scope:'Continuous new-game mouse/keyboard route through commission, rats, road, town, chapel and captain attempt. Boss outcome recorded; no claim of full campaign completion.',steps,errors:b.errors},null,2)+'\n');
}catch(error){
 await record('failure',{error:error.message});fs.writeFileSync(path.join(out,'FAILURE.json'),JSON.stringify({steps,errors:b.errors,error:error.stack},null,2)+'\n');throw error;
}finally{await b.close();}
