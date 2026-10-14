// Fixture-backed real pointer input and live HUD rendering; does not rate human aesthetics.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
const out=process.env.ASHEN_HUD_OUTPUT||'qa-export/dialogue-hud';fs.mkdirSync(out,{recursive:true});
const hook=`window.__TARGET={ready:()=>assetsReady,setup:()=>{flow=null;cine=null;flowPending=null;g=new RPG('shadow');g.chapter=2;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];g.enter('c1TrainingYard',800,650);g.pending=null;g.events=[];g.active=false;g.enemies.splice(0,g.enemies.length,g.enemy('rat',720,650,'hud-rat'),g.enemy('captain',880,650,'hud-boss'));g.enemies[0].label='苔壳爬兽';g.enemies[1].label='试炼守卫';for(const e of g.enemies){e.aiState='IDLE';e.alertUntil=0;e.wind=0;e.hp=e.maxHP*.64;}g.target=null;chapterCards.attach(g,{restored:true});mode='play';buildHUD();draw();},point:i=>{const e=g.enemies[i];return{x:(e.x-view.x)*scale+w/2,y:(e.y-30-view.y)*scale+h/2};},change:kind=>{const e=g.enemies.find(e=>e.id===g.target);if(kind==='damage')e.hp=e.maxHP*.3;if(kind==='dead'){e.dead=true;e.hp=0;g.target=null;auto=false;}if(kind==='engaged'){g.enemies[0].aiState='COMBAT';}if(kind==='disengaged')for(const e of g.enemies){e.aiState='IDLE';e.alertUntil=0;e.wind=0;}if(kind==='map'){g.enter('hall');g.pending=null;g.events=[];g.active=false;}updateHUD();},state:()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};};return{hidden:document.querySelector('#boss').hidden,name:document.querySelector('#bossname').textContent,hp:parseFloat(document.querySelector('#bosshp').style.width),target:g.target,locHidden:document.querySelector('#loc').hidden,tellHidden:document.querySelector('#bosstell').hidden,bar:rect('#boss'),nav:rect('.top-nav'),status:rect('.status'),miniLabel:document.querySelector('#miniLabel').textContent,expectedMap:MAPS[g.map].name};},miniText:()=>{const c=document.querySelector('#minimap').getContext('2d'),old=c.fillText,seen=[];c.fillText=function(t,...a){seen.push(t);return old.call(this,t,...a)};try{drawMini();}finally{c.fillText=old;}return seen;}};`;
const b=await browserSession(process.cwd(),hook),rows=[];
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
try{
 await b.wait('window.__TARGET?.ready()',120000);
 for(const [width,height]of [[1440,980],[844,390],[390,844]]){
  await b.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});await delay(160);await b.evaluate('__TARGET.setup()');await delay(160);
  assert.ok((await b.evaluate('__TARGET.state()')).hidden);
  for(const i of [0,1]){
   const p=await b.evaluate(`__TARGET.point(${i})`);
   if(width===390){await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   else await b.click(p.x,p.y);
   await b.wait(`__TARGET.state().target==='hud-${i?'boss':'rat'}'`);await delay(80);
   const r=await b.evaluate('__TARGET.state()');assert.equal(r.hidden,false);assert.equal(r.name,i?'试炼守卫':'苔壳爬兽');assert.ok(Math.abs(r.hp-64)<.01);assert.ok(r.locHidden);assert.ok(r.tellHidden);assert.equal(r.miniLabel,r.expectedMap);
   assert.ok(Math.abs(r.bar.x+r.bar.w/2-width/2)<2);assert.ok(r.bar.y<=12);assert.ok(r.bar.w>=220&&r.bar.w<=360);assert.ok(!overlap(r.bar,r.nav),JSON.stringify({width,height,...r}));assert.ok(!overlap(r.bar,r.status));
   assert.deepEqual(await b.evaluate('__TARGET.miniText()'),[],'minimap draws spatial markers, no connected-map names');
   rows.push({viewport:[width,height],input:width===390?'touch':'mouse',enemy:i?'boss':'ordinary',...r});await b.shot(path.join(out,`${width}-${i?'boss':'ordinary'}.png`));
  }
  await b.evaluate('__TARGET.change("damage")');assert.equal((await b.evaluate('__TARGET.state()')).hp,30);
  await b.evaluate('__TARGET.change("dead")');assert.ok((await b.evaluate('__TARGET.state()')).hidden);
  await b.evaluate('__TARGET.change("engaged")');assert.equal((await b.evaluate('__TARGET.state()')).name,'苔壳爬兽');
  await b.evaluate('__TARGET.change("disengaged")');assert.ok((await b.evaluate('__TARGET.state()')).hidden);
  await b.evaluate('__TARGET.change("map")');assert.ok((await b.evaluate('__TARGET.state()')).hidden);
 }
 assert.deepEqual(b.errors,[]);fs.writeFileSync(path.join(out,'QA.json'),JSON.stringify({status:'passed',rows,checks:['real pointer selects ordinary then boss','health update','death hides bar','engaged fallback','disengaged hides bar','map change clears stale target','three viewports, target/nav/status no overlap','minimap text absent'],limits:'Actors and damage injected to isolate UI. Not a complete human playthrough or aesthetic acceptance.',errors:b.errors},null,2));console.log('HUD: six real mouse/touch selections, health/death/engagement/map changes and three viewport layouts passed.');
}finally{await b.close();}
