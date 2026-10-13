// Isolated renderer/UI/geometry evidence. Never counted as natural completion.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
const out=path.resolve(process.env.ASHEN_C1_OUTPUT||'docs/ch1-layer-rules/browser');fs.mkdirSync(out,{recursive:true});
const hook=`window.__C1QA={ready:()=>assetsReady,fixture:(id)=>{flow=null;cine=null;flowPending=null;g=new RPG('shadow',null,()=>.44);g.chapter=2;g.enter(id,780,850);g.pending=null;g.events=[];SAVE='ashen-c1-expansion-qa';g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});play();g.active=false;cam={x:800,y:540};scale=Math.min(w/1600,h/1080);ui.style.visibility='hidden';notice.style.visibility='hidden';draw();},capture:()=>{draw();return canvas.toDataURL('image/webp',.92).split(',')[1];},collision:()=>{draw();ctx.save();ctx.translate(w/2-view.x*scale,h/2-view.y*scale);ctx.scale(scale,scale);for(let y=170;y<990;y+=20)for(let x=150;x<1450;x+=20){ctx.fillStyle=g.blocked(x,y,false)?'#f5474566':'#45c98135';ctx.fillRect(x-10,y-10,20,20);}ctx.restore();return canvas.toDataURL('image/webp',.9).split(',')[1];},loom:()=>{g.relocate(780,560);g.quests.v12CourierRoad='done';g.c1Accept('c1LoomBrief');g.c1Expansion.questSteps.c1LoomBrief={observed:true};ui.style.visibility='visible';mechanismPanel('c1-loom');},state:()=>({mode,map:g?.map,quests:g?.quests,expansion:g?.c1Expansion,bag:g?.p.bag,items:g?.p.items}),interactionReady:(id)=>{const p=g.props.find(p=>p.id===id);g.relocate(p.x,p.y+40);ui.style.visibility='visible';play();},touchReady:()=>{ui.style.visibility='visible';play();},check:(expression)=>eval(expression),position:()=>({x:g.p.x,y:g.p.y,blocked:g.blocked(g.p.x,g.p.y)}),touchPoint:()=>{const at=Array.from({length:16},(_,i)=>({x:g.p.x+Math.cos(i*Math.PI/8)*100,y:g.p.y+Math.sin(i*Math.PI/8)*100})).find(p=>!g.blocked(p.x,p.y,false)&&g.clearLine(g.p,p,false)&&!g.targets().some(t=>Math.hypot(t.x-p.x,t.y-p.y)<65)&&!g.enemies.some(e=>!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<75));if(!at)throw Error('No clear touch destination '+g.map);return {x:w/2+(at.x-view.x)*scale,y:h/2+(at.y-view.y)*scale};},change:()=>{g.quests.lantern='done';Object.assign(g.c1Expansion.worldChanges,{pressure:true,plank:true,kilnIntake:true,kilnExhaust:true,samplesSealed:true,wallSealed:true,lampFixed:true,kilnLadder:true,herbGarden:true,runePattern:true,leakFixed:true});draw();}};`;
import {C1_OBJECTIVES} from '../dist/chapter-one-objectives.js';
const b=await browserSession(process.cwd(),hook),report={scope:'isolated fixtures; no natural playtime/completion claim',maps:[],ui:[],errors:[]};
const image=(name,data)=>fs.writeFileSync(path.join(out,name+'.webp'),Buffer.from(data,'base64'));
let touch=false;async function tap(x,y){if(touch){await b.call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await b.call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else await b.click(x,y);await delay(100);}
async function click(selector){const p=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);assert.ok(p,selector);await tap(p.x,p.y);}
try{
 await b.wait('window.__C1QA?.ready()',120000);
 for(const id of ['c1TrainingYard','c1DrillGallery','c1LoomRoom','c1NorthWalk','c1ReedKiln','hall','warehouse','road','grove','millpath','echo','town','workshop','alley','canal','guestroom','chapel','c1TrialFoyer','c1TrialCrypt','c1TrialVault','c1RiversideCamp','c1KilnCourt']){await b.evaluate(`__C1QA.fixture('${id}')`);image(id,await b.evaluate('__C1QA.capture()'));image(id+'-collision',await b.evaluate('__C1QA.collision()'));await b.evaluate('__C1QA.change()');image(id+'-after',await b.evaluate('__C1QA.capture()'));report.maps.push(id);}
 // Isolated ready-state boundaries use the actual NPC menu, click handler, portrait and payment.
 report.handoffs=[];
 for(const [map,npcID,qid,count,requires,cause]of [
  ['c1TrialFoyer','c1iden','c1TrialSalvage',5,'c1Readiness'],
  ['c1TrialCrypt','c1hesha','c1CryptRepair',8,'c1Readiness'],
  ['c1TrialVault','c1venn','c1VaultWatch',8,'c1CryptRepair','c1-vault-warden'],
  ['c1RiversideCamp','c1blake','c1CampHunt',8,'c1ExitDrill'],
  ['c1RiversideCamp','c1eve','c1CampHerbs',4,'c1ExitDrill'],
  ['c1KilnCourt','c1mada','c1KilnRoost',8,'c1ExitDrill']]){
  await b.evaluate(`__C1QA.fixture('${map}')`);
  const prepare=`g.quests['${requires}']='done';g.c1Accept('${qid}');g.c1Expansion.journey.counts['${qid}']=${count};${C1_OBJECTIVES[qid]?.parts?`g.c1Expansion.journey.parts['${qid}']=${JSON.stringify(Object.fromEntries(C1_OBJECTIVES[qid].parts.map(p=>[p.id,p.count])))};`:''}${cause?`g.enemies.find(e=>e.id==='${cause}').dead=true;`:''}const n=g.npcs.find(n=>n.id==='${npcID}');g.relocate(n.x,n.y+65);draw();`;
  await b.evaluate(`__C1QA.check(${JSON.stringify(prepare)})`);
  assert.equal(await b.evaluate(`__C1QA.check("g.marker('${npcID}')")`),'gold?');
  image(npcID+'-ready',await b.evaluate('__C1QA.capture()'));
  const before=(await b.evaluate('__C1QA.state()')).expansion.claimLedger['quest:'+qid];assert.equal(before,undefined);
  await b.evaluate(`__C1QA.check("ui.style.visibility='visible';npc('${npcID}')")`);
  await b.shot(path.join(out,npcID+'-menu.png'));
  await click(`[data-choice="c1:claim:${qid}"]`);await delay(180);
  assert.equal((await b.evaluate('__C1QA.state()')).quests[qid],'done');
  assert.notEqual(await b.evaluate(`__C1QA.check("g.marker('${npcID}')")`),'gold?');
  await b.shot(path.join(out,npcID+'-report.png'));
  report.handoffs.push({map,npcID,qid,passed:true,scope:'ready fixture + actual click and payment'});
 }
 for(const [width,height]of [[1440,980],[844,390],[390,844]]){touch=width<900;await b.call('Emulation.setTouchEmulationEnabled',{enabled:touch,maxTouchPoints:1});await b.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:touch});await b.evaluate("__C1QA.fixture('c1LoomRoom');__C1QA.loom()");await click('[data-c1=preview]');await click('[data-c1=gift]');await click('[data-c1=craft]');const s=await b.evaluate('__C1QA.state()');assert.equal(s.bag.length,1);assert.equal(s.expansion.crafting.sequence,1);await b.shot(path.join(out,'loom-'+width+'.png'));report.ui.push({width,height,template:s.bag[0].c1Template,rune:s.bag[0].c1Rune});}
 report.touch=[];for(const id of ['c1TrainingYard','c1DrillGallery','c1LoomRoom','c1NorthWalk','c1ReedKiln','c1TrialFoyer','c1TrialCrypt','c1TrialVault','c1RiversideCamp','c1KilnCourt']){await b.evaluate(`__C1QA.fixture('${id}');__C1QA.touchReady()`);await delay(250);const before=await b.evaluate('__C1QA.position()'),point=await b.evaluate('__C1QA.touchPoint()');await tap(point.x,point.y);await delay(1400);const after=await b.evaluate('__C1QA.position()');assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>25,id+' touch movement');assert.ok(!after.blocked,id);await b.shot(path.join(out,id+'-touch.png'));report.touch.push({id,before,after});}
 // Quest prompts appear only for accepted objectives; removed puzzle controls never return.
 report.interactions=[];await b.evaluate("__C1QA.fixture('road')");assert.ok(!(await b.evaluate("__C1QA.check(\"g.targets().some(t=>t.id.startsWith('c1-herb-'))\")")));await b.evaluate("__C1QA.check(\"g.c1Accept('herbs')\")");const herb=await b.evaluate("__C1QA.check(\"g.targets().find(t=>t.id.startsWith('c1-herb-')).id\")");await b.evaluate(`__C1QA.interactionReady('${herb}')`);await delay(200);await click('[data-act=interact]');await delay(200);assert.equal(await b.evaluate("__C1QA.check(\"g.c1Count('herbs')\")"),1);report.interactions.push({map:'road',id:herb,passed:true});await b.shot(path.join(out,'herb-interaction.png'));
 assert.deepEqual(b.errors,[]);report.status='passed';
}catch(e){report.status='failed';report.failure=e.stack;throw e;}finally{report.errors=b.errors;fs.writeFileSync(path.join(out,'QA.json'),JSON.stringify(report,null,2)+'\n');await b.close();}
