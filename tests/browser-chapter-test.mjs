import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {browserSession,delay} from '../tools/browser_session.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=process.env.ASHEN_QA_OUTPUT||path.join(root,'docs/chapter-test/browser');fs.mkdirSync(out,{recursive:true});
const hook=`
window.QA={get game(){return g},get mode(){return mode},get ready(){return assetsReady},get key(){return SAVE},
 normal(){const p=new RPG('oath');localStorage.setItem(MAIN_SAVE,JSON.stringify(p.snapshot()));title();return localStorage.getItem(MAIN_SAVE);},
 main(){return localStorage.getItem(MAIN_SAVE)},testText(){return storyTestSaveTextV25(g)},
 combat(){g.enter('road',800,750);g.pending=null;g.active=true;g.states.road.enemies=[];g.p.cd={};g.p.invuln=0;const e=g.enemy('wolf',g.p.x+50,g.p.y,'browser-test-wolf');g.enemies.push(e);g.target=e.id;flow=null;cine=null;g.events=[];play();return {hp:g.p.hp,enemyHP:e.hp};}
};`;
const b=await browserSession(root,hook),report={passed:false,entries:[],screenshots:[]};
async function click(selector){
 await b.wait(`!!document.querySelector(${JSON.stringify(selector)})`);
 const r=await b.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await b.click(r.x,r.y);await delay(100);
}
async function shot(name){await b.shot(path.join(out,name+'.png'));report.screenshots.push(name+'.png');}
try{
 await b.wait('window.QA?.ready',120000);const main=await b.evaluate('QA.normal()');
 await click('[data-act="story-test"]');
 assert.equal(await b.evaluate('document.querySelectorAll("[data-test-chapter]:not([data-test-resume])").length'),8);
 await shot('chapter-menu-desktop');
 for(let chapter=1;chapter<=8;chapter++){
  await click(`[data-test-chapter="${chapter}"]:not([data-test-resume])`);
  await b.wait('!!QA.game && QA.key.includes("chapter")');
  const entry=await b.evaluate('({map:QA.game.map,chapter:QA.game.chapter,pending:QA.game.pending?.id,key:QA.key})');
  assert.ok(entry.key.endsWith('chapter'+chapter));report.entries.push({selectedChapter:chapter,...entry});
  await click('[data-act="test-skip"]');
  for(let i=0;i<6&&await b.evaluate('QA.mode==="dialogue"');i++)await click('[data-act="test-skip"]');
  await b.wait('QA.mode==="play"');
  assert.equal(await b.evaluate('QA.main()'),main);
  if(chapter===1){
   const combat=await b.evaluate('QA.combat()');
   await click('[data-combat="attack"]');await b.wait('QA.game.enemies[0].dead');
   assert.equal(await b.evaluate('QA.game.p.hp'),combat.hp);
   await shot('chapter-one-combat');
  }
  if(chapter===3){
   for(let i=0;i<10&&await b.evaluate('QA.game.p.cls!=="saint"');i++)await click('[data-act="test-skip"]');
   assert.equal(await b.evaluate('QA.game.p.cls'),'saint');await shot('chapter-three-rescue');
  }
  await click('[data-act="pause"]');await click('[data-act="story-test"]');
 }
 // Return to an earlier per-chapter slot through real UI, then refresh and continue it.
 await click('[data-test-chapter="1"][data-test-resume]');await b.wait('QA.mode==="play"');
 assert.equal(await b.evaluate('QA.game.map'),'road');assert.ok(await b.evaluate('QA.game.enemies.some(e=>e.id==="browser-test-wolf"&&e.dead)'));
 const testText=await b.evaluate('QA.testText()');
 await b.call('Page.reload');await b.wait('window.QA?.ready',120000);
 await click('[data-act="story-test"]');await click('[data-test-chapter="3"][data-test-resume]');
 await b.wait('!!QA.game');assert.equal(await b.evaluate('QA.game.p.cls'),'saint');
 assert.equal(await b.evaluate('QA.main()'),main);
 await click('[data-act="pause"]');await click('[data-act="title"]');await click('[data-act="import-save"]');
 await b.evaluate(`document.querySelector('#saveTransfer').value=${JSON.stringify(testText)}`);
 await click('[data-act="confirm-import"]');assert.match(await b.evaluate('document.querySelector("#saveStatus").textContent'),/测试存档/);
 assert.equal(await b.evaluate('QA.main()'),main);
 await click('[data-act="title"]');await click('[data-act="continue"]');await b.wait('QA.mode==="play"');
 assert.equal(await b.evaluate('document.querySelectorAll("[data-act=test-skip]").length'),0);
 assert.equal(await b.evaluate('QA.game.storyTestModeV25===true'),false);
 await click('[data-act="pause"]');await click('[data-act="title"]');
 const mobileMain=await b.evaluate('QA.main()');
 await b.call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
 await click('[data-act="story-test"]');await shot('chapter-menu-mobile');
 await click('[data-test-chapter="2"]:not([data-test-resume])');await click('[data-act="test-skip"]');
 await b.wait('QA.mode==="play"');await shot('chapter-two-mobile');
 await click('[data-act="test-skip"]');assert.equal(await b.evaluate('QA.game.chapter'),7);
 assert.equal(await b.evaluate('QA.main()'),mobileMain);
 assert.deepEqual(b.errors,[]);report.passed=true;report.normalSaveUnchanged=true;report.reload=true;report.mobile=true;
 console.log(JSON.stringify(report,null,2));
}catch(error){report.failure=error.message;report.lastState=await b.evaluate('({mode:QA.mode,map:QA.game?.map,pending:QA.game?.pending,key:QA.key})');await shot('failure');throw error;}finally{report.errors=b.errors;fs.writeFileSync(path.join(out,'RESULT.json'),JSON.stringify(report,null,2)+'\n');await b.close();}
