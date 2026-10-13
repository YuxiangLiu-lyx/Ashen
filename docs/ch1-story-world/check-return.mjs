// Reopen real normal-input milestones; no invented rewards, position or quest state.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {browserSession} from '../../tools/browser_session.mjs';
const out='docs/ch1-story-world/companion-return';fs.mkdirSync(out,{recursive:true});
const hook=`window.__RETURN={ready:()=>assetsReady,restore:(s)=>{flow=null;cine=null;flowPending=null;g=new RPG(s.p.cls,s);g.pending=null;SAVE='ashen-qa-companion-return';chapterCards.attach(g,{restored:true});play();cam={x:g.p.x,y:g.p.y};draw();return g.objective();},state:()=>({goal:g.objective(),visible:g.saint.visible,marker:g.marker('saint'),map:g.map,quest:g.quests.c1CanalBreak,hint:routeHint(g,g.objective())}),capture:()=>{updateHUD();draw();}};`;
const b=await browserSession(process.cwd(),hook),rows=[];
try{await b.wait('window.__RETURN?.ready()',120000);
 for(const cls of ['shadow','oath','ember']){
  const file=path.join('docs/ch1-story-world/natural',cls,'13-captain-save.json'),save=JSON.parse(fs.readFileSync(file));
  const immediate=await b.evaluate(`__RETURN.restore(${JSON.stringify(save)})`);assert.equal(immediate.map,'canal');
  await b.wait('__RETURN.state().visible',12000);const after=await b.evaluate('__RETURN.state()');assert.equal(after.marker,'gold?');assert.equal(after.goal.map,'canal');assert.equal(after.quest,'active');assert.match(after.hint,/就在身边/);
  await b.evaluate('__RETURN.capture()');await b.shot(path.join(out,cls+'.png'));rows.push({cls,source:file,immediate,after});
 }
 assert.deepEqual(b.errors,[]);fs.writeFileSync(path.join(out,'QA.json'),JSON.stringify({passed:true,rows,errors:b.errors},null,2)+'\n');
 console.log('Three real post-captain saves keep current-map guidance while the follower reappears, with payable gold marks.');
}finally{await b.close();}
