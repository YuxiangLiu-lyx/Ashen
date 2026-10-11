// Actual game/renderer, isolated scenes and input. Continuous play is a separate check.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
const out=path.resolve(process.env.ASHEN_C1_OUTPUT||'docs/ch1-pilot-r2/browser');fs.mkdirSync(out,{recursive:true});
const hook=`
import {pursuitSheet as reviewSheet} from './chapter-one-pursuit-v31.js';
import {exactRouteV26 as reviewRoute} from './scene-geometry-v26.js';
window.__C1={ready:()=>assetsReady,
 state:()=>({mode,map:g?.map,phase:flow?.phase,index:flow?.index,tail:flow?.c1Tail,pending:g?.pending,chapter:g?.chapter,flags:g?.flags,quests:g?.quests,knowledge:g?.knowledge,items:g?.p.items,notices:toastList.map(t=>t.text)}),
 fixture:(id)=>{flow=null;cine=null;flowPending=null;toastList=[];g=new RPG('shadow',null,()=>.44);g.chapter=MAPS[id].chapterRegion||2;g.enter(id,800,850);g.pending=null;g.events=[];g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});SAVE='ashen-qa-c1-isolated';play();g.active=false;cam={x:800,y:540};scale=Math.min(w/1600,h/1080);ui.style.visibility='hidden';notice.style.visibility='hidden';draw();},
 capture:()=>{draw();return canvas.toDataURL('image/webp',.91).split(',')[1];},
 collision:()=>{draw();ctx.save();ctx.translate(w/2-view.x*scale,h/2-view.y*scale);ctx.scale(scale,scale);const step=20,nx=80,ny=54,cells=[];
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)cells.push(!g.blocked(x*step+10,y*step+10,false));
  const starts=MAPS[g.map].doors,visited=new Set(),queue=[];const nearest=(a)=>{let best=-1,d=Infinity;cells.forEach((v,i)=>{if(v){const z=Math.hypot(i%nx*20+10-a.x,Math.floor(i/nx)*20+10-a.y);if(z<d){d=z;best=i;}}});return best;};
  const first=nearest(starts[0]||{x:800,y:850});visited.add(first);queue.push(first);
  for(let j=0;j<queue.length;j++){const i=queue[j],x=i%nx,y=Math.floor(i/nx);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,k=yy*nx+xx;if(xx>=0&&xx<nx&&yy>=0&&yy<ny&&cells[k]&&!visited.has(k)&&g.clearLine({x:x*20+10,y:y*20+10},{x:xx*20+10,y:yy*20+10},false)){visited.add(k);queue.push(k);}}}
  for(let i=0;i<cells.length;i++){ctx.fillStyle=!cells[i]?'#d448485c':visited.has(i)?'#39c68555':'#e4bd3977';ctx.fillRect(i%nx*20,Math.floor(i/nx)*20,20,20);}ctx.restore();
  const routes=[],unverified=[];for(const entrance of starts)for(const target of g.targets().filter(t=>t.id!=='saint')){
   const approach=queue.map(i=>({x:i%nx*20+10,y:Math.floor(i/nx)*20+10})).filter(p=>Math.hypot(p.x-target.x,p.y-target.y)<(target.kind==='door'?48:95)&&g.clearLine(p,target,false)).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];
   if(!approach){unverified.push({from:entrance.to,to:target.id,reason:'No sampled approach; retained geometry, investigate separately'});continue;}
   g.relocate(entrance.x,entrance.y);const route=reviewRoute(g,g.p,approach);let stalled=false;
   for(const p of route){for(let n=0;n<1000&&Math.hypot(g.p.x-p.x,g.p.y-p.y)>.5;n++){const dx=p.x-g.p.x,dy=p.y-g.p.y,d=Math.hypot(dx,dy),old={x:g.p.x,y:g.p.y};g.moveActor(g.p,g.p.x+dx/d*Math.min(6,d),g.p.y+dy/d*Math.min(6,d));if(g.blocked(g.p.x,g.p.y,false)||Math.hypot(g.p.x-old.x,g.p.y-old.y)<.001){stalled=true;break;}}if(stalled)break;}
   if(stalled||Math.hypot(g.p.x-approach.x,g.p.y-approach.y)>2)unverified.push({from:entrance.to,to:target.id,reason:'Route did not complete'});else routes.push({from:entrance.to,to:target.id});
  }return {image:canvas.toDataURL('image/webp',.9).split(',')[1],routes,unverified,walkable:cells.filter(Boolean).length,reachable:visited.size};},
 roles:()=>{const p=document.createElement('canvas');p.width=1760;p.height=930;const c=p.getContext('2d');c.fillStyle='#34413b';c.fillRect(0,0,p.width,p.height);const frames=[];
  [{type:'guard',label:'Soldier',portrait:6},{type:'guard',elite:true,label:'Elite',portrait:6},{type:'captain',label:'Officer',portrait:8}].forEach((v,row)=>{bank.draw(c,'npcPortraits5',v.portrait,70,row*310+220,120,180);c.fillStyle='#eee3c9';c.font='16px sans-serif';c.fillText(v.label,15,row*310+250);
   const sheet=reviewSheet(v);for(let i=0;i<16;i++){const phase=i%8,x=235+i%8*200,y=row*310+(i<8?135:285),a={...v,x,y,angle:i<8?0:-1.2,moving:phase<4,walkDistance:phase*38,wind:phase===4?.4:phase===5?.1:0,windMax:.45,attackAnim:phase===6?.3:phase===7?.08:0};c.strokeStyle='#a8b598';c.beginPath();c.moveTo(x-60,y);c.lineTo(x+70,y);c.stroke();drawMonster(c,bank,a,0,{natural:true,chapterOne:true});const f=bank.frames[sheet]?.[i];if(!f)throw Error('Missing '+sheet+i);frames.push({role:v.label,sheet,index:i,...f});}
  });return {frames,image:p.toDataURL('image/webp',.96).split(',')[1]};},
 scene:(id,line=0,time=null,tail=null)=>{flow=null;cine=null;flowPending=null;toastList=[];g=new RPG('shadow',null,()=>.44);g.chapter=id==='contract'?1:2;g.enter(id==='contract'?'hall':'chapel',800,850);g.events=[];g.beginScene(id,id==='contract'?'contractAccept':'assassinate');g.pending.line=line;g.events=[];chapterCards.attach(g,{restored:true});showScene();if(time!==null){flow.c1BeatAt=flow.mainCine.time;flow.update(time);}else{flow.cine?.fastForward();flow.update(0);}if(tail!==null){flow.openTail(tail);}renderScene();ui.style.visibility='visible';draw();return __C1.state();},
 roundtrip:()=>{const before=__C1.state();start(JSON.parse(JSON.stringify(g.snapshot())));return {before,after:__C1.state()};},
 controls:()=>{const r=document.querySelector('.c1-dialogue')?.getBoundingClientRect(),line=document.querySelector('.c1-dialogue .line'),button=document.querySelector('[data-act=next]');return {w,h,dialogue:r?{x:r.x,y:r.y,width:r.width,height:r.height}:null,overflow:line?line.scrollHeight>line.clientHeight:false,next:!!button,loaded:C1_CINEMATIC_LOADS.concat(C1_PURSUIT_LOADS).every(([s])=>bank.images[s]&&bank.frames[s].length)};},
 aim:(id)=>{const t=g.targets().find(t=>t.id===id);if(!t)throw Error('Missing '+id);g.relocate(t.x,t.y);g.enemies.forEach(e=>e.dead=true);g.active=true;cam={x:g.p.x,y:g.p.y};resize();ui.style.visibility='visible';notice.style.visibility='visible';draw();return {x:t.drawX??t.x,y:(t.drawY??t.y)-25};},
 point:(x,y)=>({x:w/2+(x-view.x)*scale,y:h/2+(y-view.y)*scale})
};`;
const b=await browserSession(process.cwd(),hook);const report={status:'running',maps:[],scenes:[],clicks:[],viewports:[],errors:[]};
const persist=()=>fs.writeFileSync(path.join(out,'QA.json'),JSON.stringify(report,null,2)+'\n');
const save=(name,data)=>fs.writeFileSync(path.join(out,name+'.webp'),Buffer.from(data,'base64'));
async function shot(name){const r=await b.call('Page.captureScreenshot',{format:'webp',quality:92});fs.writeFileSync(path.join(out,name+'.webp'),Buffer.from(r.data,'base64'));}
try{
 await b.wait('window.__C1?.ready()',120000);
 for(const id of ['hall','warehouse','road','town','chapel','alley','canal','grove','guestroom','millpath','echo','workshop','post','inn','bridge','manor','spillway','exile']){
  await b.evaluate(`__C1.fixture('${id}')`);save(id,await b.evaluate('__C1.capture()'));
  const {image,...audit}=await b.evaluate('__C1.collision()');save(id+'-collision',image);report.maps.push({id,...audit});persist();
 }
 const roles=await b.evaluate('__C1.roles()');save('role-comparison',roles.image);report.roles=roles.frames;assert.equal(roles.frames.length,48);
 for(const f of roles.frames)assert.ok(f.w>20&&f.h>150&&Number.isFinite(f.foot.x),f.sheet+f.index);
 for(const [name,id,line,time,tail]of [['commission','contract',19,null,0],['before','assassination',0],['approach','assassination',2],['stab','assassination',4],['fallen','assassination',6],['heal','assassination',9],['shield','assassination',10,.4],['resist','assassination',10,4.2],['seal','assassination',10,8.5],['defiance','assassination',12],['door','assassination',13],['guards','assassination',15],['outro','assassination',17],['echo-old','assassination',17,null,0],['echo-study','assassination',17,null,2],['echo-post','assassination',17,null,4]]){
  report.scenes.push({name,state:await b.evaluate(`__C1.scene('${id}',${line},${time??null},${tail??null})`)});await shot(name);
 }
 for(const [width,height]of [[844,390],[390,844],[1440,980]]){
  await b.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});
  await b.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await b.evaluate("__C1.scene('assassination',10,8.5)");await delay(150);const controls=await b.evaluate('__C1.controls()');assert.ok(controls.loaded);assert.ok(controls.dialogue.y>=0);assert.ok(controls.dialogue.y+controls.dialogue.height<=height+1);report.viewports.push(controls);await shot('viewport-'+width);await b.evaluate("__C1.scene('assassination',12)");await delay(250);const dialog=await b.evaluate('__C1.controls()');assert.ok(dialog.next);await shot('dialogue-'+width);const next=await b.evaluate("(()=>{const r=document.querySelector('[data-act=next]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");await b.click(next.x,next.y);assert.equal((await b.evaluate('__C1.state()')).index,13);
 }
 await b.evaluate("__C1.scene('assassination',17,null,3)");const rt=await b.evaluate('__C1.roundtrip()');assert.equal(rt.after.tail.line,3);report.roundtrip=rt;
 for(const [map,id,expected]of [['town','townbook','礼拜通知'],['hall','hallbook','获得 研习札记'],['town','well','井沿刻着']]){
  await b.evaluate(`__C1.fixture('${map}')`);const p=await b.evaluate(`__C1.aim('${id}')`);await delay(160);await shot('hotspot-'+id);const screen=await b.evaluate(`__C1.point(${p.x},${p.y})`);await b.click(screen.x,screen.y);await delay(200);const s=await b.evaluate('__C1.state()');report.clicks.push({map,id,expected,state:s});assert.ok(s.notices.some(t=>t.includes(expected)),'Click failed '+id);await shot('clicked-'+id);
 }
 assert.ok(report.maps.every(m=>m.unverified.length===0));assert.deepEqual(b.errors,[]);report.errors=b.errors;report.status='passed';persist();console.log(JSON.stringify({maps:report.maps.length,paths:report.maps.reduce((n,m)=>n+m.routes.length,0),unverified:report.maps.flatMap(m=>m.unverified.map(x=>({map:m.id,...x}))),frames:report.roles.length,scenes:report.scenes.length,viewports:report.viewports.length}));
}catch(e){report.status='failed';report.error=String(e);report.errors=b.errors;persist();throw e;}finally{await b.close();}
