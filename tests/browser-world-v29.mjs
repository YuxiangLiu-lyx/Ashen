import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseline=process.argv.includes('--baseline'),auditOnly=process.argv.includes('--audit-only');
const outputArg=process.argv.indexOf('--output');
const out=path.resolve(outputArg<0?(process.env.ASHEN_WORLD_OUTPUT||'qa-export/world-v29'):process.argv[outputArg+1]);
const hook=`
let worldTravel={distance:0,moving:0,quiet:0,maxQuiet:0,samples:[],interactions:0,last:null};
const oldWorldUpdate=RPG.prototype.update;RPG.prototype.update=function(dt,input){const p={x:this.p.x,y:this.p.y,map:this.map};const result=oldWorldUpdate.call(this,dt,input);if(this===g&&p.map===this.map){const d=Math.hypot(p.x-this.p.x,p.y-this.p.y);if(d>.01){worldTravel.distance+=d;worldTravel.moving+=dt;worldTravel.quiet+=dt;worldTravel.maxQuiet=Math.max(worldTravel.maxQuiet,worldTravel.quiet);if(!worldTravel.last||Math.hypot(worldTravel.last.x-this.p.x,worldTravel.last.y-this.p.y)>70){worldTravel.last={map:this.map,x:this.p.x,y:this.p.y};worldTravel.samples.push({...worldTravel.last,time:this.time});}}if(this.events.some(e=>['npc','scene','map','mechanism','toast'].includes(e.type))||this.enemies.some(e=>!e.dead&&Math.hypot(e.x-this.p.x,e.y-this.p.y)<160))worldTravel.quiet=0;}return result;};
const oldWorldInteract=RPG.prototype.interact;RPG.prototype.interact=function(...args){if(this===g)worldTravel.interactions++;return oldWorldInteract.apply(this,args);};
window.__WORLD_QA={ready:()=>assetsReady,
 setup(map='road',x=800,y=540){
  flow=null;cine=null;flowPending=null;g=new RPG('shadow',null,()=>.44);g.chapter=1;
  g.enter(map,x,y);g.pending=null;g.events=[];g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});SAVE='ashen-world-qa-isolated';play();g.active=false;
  cam={x:g.p.x,y:g.p.y};return this.state();
 },
 overview(){scale=Math.min(w/1600,h/1080);ui.style.visibility='hidden';notice.style.visibility='hidden';draw();},
 live(){resize();ui.style.visibility='visible';notice.style.visibility='visible';play();g.active=true;},
 state(){return {mode,map:g?.map,x:g?.p.x,y:g?.p.y,hp:g?.p.hp,mp:g?.p.mp,active:g?.active,pending:g?.pending,flags:g?.flags,quests:g?.quests,world:g?.flags.worldV29,transition:g?.transition,moveTo:g?.moveTo,target:g?.target,auto};},
 point(x,y){return {x:w/2+(x-view.x)*scale,y:h/2+(y-view.y)*scale};},
 snapshot(){return structuredClone(g.snapshot());},
 load(s){start(s);return this.state();},
 data(){return {map:MAPS[g.map],scenery:SCENERY[g.map],targets:g.targets(),enemy:g.enemies.map(e=>({id:e.id,type:e.type,x:e.x,y:e.y,hp:e.hp,dead:e.dead}))};},
 walk(x,y){if(g.pending||mode!=='play')return false;auto=false;pendingWalk=null;g.target=null;g.moveTo={x,y};g.portCD=999;g.active=true;return true;},
 journey(){this.setup('road',850,570);g.gainXP(260);g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;g.flags.lottiMet=true;worldTravel={distance:0,moving:0,quiet:0,maxQuiet:0,samples:[],interactions:0,last:null};this.live();return {level:g.p.level,stats:stats(g.p),gear:g.p.gear,items:g.p.items};},
 travel(){return worldTravel;},
 interactPoint(id){const t=g.targets().find(t=>t.id===id);return t?this.point(t.drawX??t.x,(t.drawY??t.y)-25):null;},
 enemies(){return g.enemies.filter(e=>!e.dead).map(e=>({id:e.id,x:e.x,y:e.y,hp:e.hp,maxHP:e.maxHP}));},
 distance(x,y){return Math.hypot(g.p.x-x,g.p.y-y);},
 door(to){return MAPS[g.map].doors.find(d=>d.to===to);},
 safeLoad(){const text=JSON.stringify(g.snapshot());const restored=parseSave(text);start(restored);return this.state();},
};
`;
const browser=await browserSession(root,hook),results=[];
try{
  await browser.wait('window.__WORLD_QA?.ready()',120000);
  for(const map of (auditOnly?['hall','town','grove','post','inn','bridgecellar','hellGrotto','ch5Square']:['road','millpath','echo','workshop'])){
    const state=await browser.evaluate(`window.__WORLD_QA.setup(${JSON.stringify(map)})`);
    await browser.evaluate('window.__WORLD_QA.overview()');
    await browser.shot(path.join(out,map+'.png'));
    results.push({map,state,data:await browser.evaluate('window.__WORLD_QA.data()')});
  }
  const journey={};
  if(!baseline&&!auditOnly){
   const Q='window.__WORLD_QA';journey.fixture=await browser.evaluate(Q+'.journey()');
   const state=()=>browser.evaluate(Q+'.state()');
   async function button(selector){const p=await browser.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);assert.ok(p,'Missing button '+selector);await browser.click(p.x,p.y);await delay(130);}
   async function dialogue(){for(let i=0;i<24;i++){const s=await state();if(s.mode!=='dialogue')break;await button('[data-act="next"]');}assert.notEqual((await state()).mode,'dialogue');}
   async function walk(x,y,expectedMap=null){
    if((await state()).mode==='dialogue')await dialogue();
    const original=(await state()).map;
    if(expectedMap){const door=await browser.evaluate(`${Q}.door(${JSON.stringify(expectedMap)})`);assert.ok(door);x=door.x;y=door.y;}
    const p=await browser.evaluate(`${Q}.point(${x},${y})`);
    if(p.x>50&&p.x<1390&&p.y>80&&p.y<860)await browser.click(p.x,p.y);else await browser.evaluate(`${Q}.walk(${x},${y})`);
    for(let attempt=0;attempt<6;attempt++){
     try{await browser.wait(`${Q}.distance(${x},${y})<${expectedMap?25:42}||${Q}.state().map!==${JSON.stringify(original)}||${Q}.state().transition||${Q}.state().pending`,3000);}catch(error){if(attempt===5)throw error;}
     const s=await state();if(s.pending){await dialogue();await browser.evaluate(`${Q}.walk(${x},${y})`);continue;}
     if(s.map!==original||s.transition||Math.hypot(s.x-x,s.y-y)<(expectedMap?25:42))break;
     if(s.mode==='npc')await button('[data-act="resume"]');
     await browser.evaluate(`${Q}.walk(${x},${y})`);
    }
    if(expectedMap&&(await state()).map===original&&!(await state()).transition){const p=await browser.evaluate(`${Q}.point(${x},${y-25})`);await browser.click(p.x,p.y);await delay(150);}
    if((await state()).transition)await button('[data-act="transition-confirm"]');
    if(expectedMap)await browser.wait(`${Q}.state().map===${JSON.stringify(expectedMap)}`,8000);
   }
   async function object(id){const p=await browser.evaluate(`${Q}.interactPoint(${JSON.stringify(id)})`);assert.ok(p,id);await browser.click(p.x,p.y);await delay(1100);}
   async function fight(range=520){const deadline=Date.now()+65000;let n=0;while(Date.now()<deadline){const s=await state();let enemies=(await browser.evaluate(Q+'.enemies()')).filter(e=>Math.hypot(e.x-s.x,e.y-s.y)<range);if(!enemies.length)return;assert.ok(s.hp>0,'Player died in real combat');const e=enemies.sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];const p=await browser.evaluate(`${Q}.point(${e.x},${e.y-30})`);await browser.click(p.x,p.y);if(n%3===0){await browser.key('1');await browser.key('1',false);}if(n%7===0){await browser.key('2');await browser.key('2',false);}if(s.hp<100){await browser.key('4');await browser.key('4',false);}await delay(650);n++;}throw Error('Combat timed out');}
   await walk(925,710);await object('v29-road-sign');assert.equal((await state()).pending?.id,'v29RoadSign');await dialogue();await browser.shot(path.join(out,'journey-road.png'));await fight();
   await walk(1010,770);await walk(1050,860,'millpath');journey.millEntry=await state();console.log("Journey: entered millpath");
   await walk(820,440);await walk(885,535);await object('v29-mill-tracks');assert.equal((await state()).pending?.id,'v29MillTracks');await dialogue();
   await walk(1080,670);await fight(350);await walk(1180,865,'echo');journey.echoEntry=await state();console.log("Journey: entered echo");
   await walk(420,700);await walk(450,390);await fight(250);await object('echo-notes');assert.equal((await state()).pending?.id,'v29EchoNotes');await dialogue();
   await walk(540,590);await walk(835,585);await walk(850,480);await object('echo-valve');assert.equal((await state()).flags.echoValve,true);await browser.shot(path.join(out,'journey-valve.png'));
   await walk(1080,580);await fight();assert.ok(!(await state()).flags.echoCoreFound);await browser.shot(path.join(out,'journey-clear.png'));
   await walk(1150,460);await object('v29-echo-core');assert.equal((await state()).pending?.id,'v29EchoCoreTaken');await dialogue();journey.coreTaken=await state();console.log("Journey: manually extracted core");
   await object('echo-machine');await dialogue();await button('[data-echo-reward="gear"]');await dialogue();journey.rewardTaken=await state();
   await walk(900,590);await walk(540,590);await walk(300,780);await walk(300,885,'millpath');await walk(1080,700);await walk(850,485);await walk(800,230,'road');
   await walk(1120,620);await walk(1350,570);await walk(1430,540,'town');await walk(1000,690);await walk(1180,620);await walk(1180,520,'workshop');
   await walk(890,690);await object('lotti');await browser.wait(`${Q}.state().mode==='npc'`);await button('[data-choice="echoReturn"]');await dialogue();assert.equal((await state()).quests.echo,'done');journey.completed=await state();console.log("Journey: returned core to Lotti");
   await browser.evaluate(Q+'.overview()');await browser.shot(path.join(out,'workshop-completed.png'));await browser.evaluate(Q+'.live()');
   const loaded=await browser.evaluate(Q+'.safeLoad()');assert.equal(loaded.quests.echo,'done');assert.equal(loaded.flags.echoChoice,'gear');journey.reloaded=loaded;journey.telemetry=await browser.evaluate(Q+'.travel()');
   journey.scope='Level-3 starter fixture created once on road; mouse/keyboard dialogue, navigation, ordinary combat, valve, extraction, exclusive reward, return and save/reload. Offscreen waypoints use the same moveTo runtime, no damage/teleport/immune hooks. Not a campaign playthrough.';
  }
  assert.deepEqual(browser.errors,[]);
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'BROWSER_WORLD.json'),JSON.stringify({schema:1,baseline,head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),checkedAt:new Date().toISOString(),browser:await browser.evaluate('navigator.userAgent'),scope:'Actual runtime renderer: staged overviews and separate continuous gameplay fixture',results,journey,errors:browser.errors},null,2)+'\n');
  console.log('World visual capture:',results.length,'maps; baseline:',baseline);
}catch(error){await browser.shot(path.join(out,'failure.png'));fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'FAILURE.json'),JSON.stringify({error:error.stack,state:await browser.evaluate('window.__WORLD_QA.state()'),data:await browser.evaluate('window.__WORLD_QA.data()')},null,2)+'\n');throw error;}finally{await browser.close();}
