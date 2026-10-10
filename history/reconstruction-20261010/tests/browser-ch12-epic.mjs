import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
const baseline=process.env.ASHEN_CH12_BASELINE==='1';
const out=path.resolve(process.env.ASHEN_CH12_OUTPUT||`docs/ch12-epic/${baseline?'before':'after'}`);
fs.mkdirSync(out,{recursive:true});
const hook=`
window.__EPIC={ready:()=>assetsReady,
 scene:async(id,line=0)=>{
  const {STAGING}=await import('./staging-v14.js');
  g=new RPG('shadow',null,()=>.44);g.chapter=id.startsWith('ch2')?7:['assassination','saintBrief','contract'].includes(id)?2:4;
  g.enter(STAGING.scenes[id].map,800,750);g.flags.targetCutaway=true;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});g.pending=null;g.events=[];flow=null;cine=null;flowPending=null;toastList=[];
  SAVE='ashen-ch12-isolated';g.beginScene(id);g.pending.line=line;showScene();flow.cine?.fastForward();flow.update(0);renderScene();draw();return {id:flow.id,line:flow.index,speaker:flow.current?.[0],map:g.map,stageMap:cine?.map};
 },
 state:()=>({mode,id:flow?.id,line:flow?.index,phase:flow?.phase,pending:g.pending,chapter:g.chapter,map:g.map,portrait:document.querySelector('.portrait-art')?.naturalWidth||0,shot:document.querySelector('[data-director-shot]')?.dataset.directorShot}),
 save:()=>g.snapshot(),
 restore:save=>{g=new RPG('shadow',save,()=>.44);g.events=[];flow=null;cine=null;flowPending=null;showScene();return {line:flow.index,phase:flow.phase};},
 cutouts:()=>['elyriaGentleV30','elyriaResoluteV30'].map(id=>{const c=bank.images[id];if(!c)return {id,missing:true};const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let clear=0,opaque=0;for(let i=3;i<data.length;i+=4){if(!data[i])clear++;else opaque++;}return {id,clear,opaque,width:c.width,height:c.height};})
};`;
const b=await browserSession(process.cwd(),hook),report={baseline,at:new Date().toISOString(),scenes:[],checks:[]};
try{
 await b.wait('window.__EPIC?.ready()',120000);
 for(const [id,line]of [['contract',6],['saintBrief',8],['assassination',9],['assassination',12],['chapterEnd',12],['ch2InnerDoor',5],['ch2Spillway',7]]){
  report.scenes.push(await b.evaluate(`__EPIC.scene(${JSON.stringify(id)},${line})`));await delay(300);
  await b.shot(path.join(out,`${id}-${line}.png`));
 }
 if(!baseline){
  report.cutouts=await b.evaluate('__EPIC.cutouts()');for(const p of report.cutouts){assert.ok(p.clear>p.width*p.height*.12,p.id+' transparency');assert.ok(p.opaque>p.width*p.height*.35);}
  await b.evaluate("__EPIC.scene('assassination',12)");await delay(350);
  const saved=await b.evaluate('__EPIC.save()');assert.equal((await b.evaluate(`__EPIC.restore(${JSON.stringify(saved)})`)).line,12);
  await delay(300);assert.equal((await b.evaluate('__EPIC.state()')).shot,'close');report.checks.push('save/resume preserves authored shot and dialogue row');
  await b.call('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});
  await b.evaluate("__EPIC.scene('ch2InnerDoor',5)");await delay(300);await b.shot(path.join(out,'mobile-inner-door.png'));
  const boxes=await b.evaluate(`(()=>{const selectors=['.dialogue-card','[data-act="next"]','[data-act="skip-scene-v30"]'];return selectors.map(s=>{const r=document.querySelector(s)?.getBoundingClientRect();return {s,x:r?.x,y:r?.y,right:r?.right,bottom:r?.bottom};});})()`);
  for(const r of boxes){assert.ok(r.x>=0&&r.y>=0&&r.right<=845&&r.bottom<=391,JSON.stringify(r));}report.checks.push('mobile controls in viewport');
  const next=await b.evaluate(`(()=>{const r=document.querySelector('[data-act="next"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];})()`);await b.click(...next);await delay(350);assert.equal((await b.evaluate('__EPIC.state()')).line,6);report.checks.push('real pointer advances dialogue');
  const skip=await b.evaluate(`(()=>{const r=document.querySelector('[data-act="skip-scene-v30"]').getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2];})()`);await b.click(...skip);await delay(200);assert.equal((await b.evaluate('__EPIC.state()')).pending,null);report.checks.push('real pointer skips current scene and returns to play');
 }
 assert.deepEqual(b.errors,[]);report.errors=b.errors;report.status='pass';fs.writeFileSync(path.join(out,'BROWSER.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({baseline,scenes:report.scenes.length,checks:report.checks}));
}finally{await b.close();}
