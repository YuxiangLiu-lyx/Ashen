import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession} from '../tools/browser_session.mjs';
import {RPG,stats} from '../dist/core-v14.js';
import {SPATIAL_PLANS_V30} from '../dist/spatial-design-v30.js';
import {spatialAudit,auditSVG} from '../tools/spatial_audit.mjs';
import {runSpatialScenarios} from './spatial-scenarios.mjs';
const out=path.resolve(process.env.ASHEN_SPATIAL_OUTPUT||'qa-export/spatial-final'),audits=Object.keys(SPATIAL_PLANS_V30).map(id=>spatialAudit(new RPG('shadow',null,()=>.44),id));
fs.mkdirSync(out,{recursive:true});
const hook=`
import {exactRouteV26 as physicalRoute} from './scene-geometry-v26.js';
import {roleAtlasV30 as reviewedRole} from './role-art-v30.js';
const spatialScenarios=${runSpatialScenarios.toString()};
window.__SPATIAL={ready:()=>assetsReady,
 fixture:(id,x=800,y=540)=>{flow=null;cine=null;flowPending=null;toastList=[];pendingWalk=null;g=new RPG('shadow',null,()=>.44);g.chapter=MAPS[id].chapterRegion||2;g.enter(id,x,y);g.pending=null;g.events=[];g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});SAVE='ashen-spatial-isolated';play();g.active=false;cam={x:g.p.x,y:g.p.y};scale=Math.min(w/1600,h/1080);ui.style.visibility='hidden';notice.style.visibility='hidden';draw();},
 routes:(audit)=>{const results=[];for(const entrance of MAPS[g.map].doors.length?MAPS[g.map].doors:[{x:800,y:800}])for(const target of audit.targets){if(!target.approach)throw Error('Unreachable '+target.id);g.relocate(entrance.x,entrance.y);const end=target.approach,route=physicalRoute(g,g.p,end);let moved=0;
  for(const p of route){for(let i=0;i<1000&&Math.hypot(g.p.x-p.x,g.p.y-p.y)>.5;i++){const dx=p.x-g.p.x,dy=p.y-g.p.y,d=Math.hypot(dx,dy),at={x:g.p.x,y:g.p.y};g.moveActor(g.p,g.p.x+dx/d*Math.min(8,d),g.p.y+dy/d*Math.min(8,d));moved+=Math.hypot(g.p.x-at.x,g.p.y-at.y);if(g.blocked(g.p.x,g.p.y))throw Error('Solid penetration '+g.map+target.id);if(Math.hypot(g.p.x-at.x,g.p.y-at.y)<.001)throw Error('Stalled '+g.map+target.id);}}
  if(Math.hypot(g.p.x-end.x,g.p.y-end.y)>2)throw Error('Route incomplete '+g.map+':'+target.id);results.push({from:entrance.to||'stage',to:target.id,distance:moved});}return results;},
 fight:()=>{const captures=[];const result=spatialScenarios({RPG,stats,onScene:(name,game)=>{g=game;g.active=false;cam={x:g.p.x,y:g.p.y};scale=Math.min(w/1600,h/1080);draw();captures.push({name,image:ctx.canvas.toDataURL('image/webp',.91).split(',')[1]});}});return {result,captures};},
 overlay:(audit)=>{draw();ctx.save();ctx.translate(w/2-view.x*scale,h/2-view.y*scale);ctx.scale(scale,scale);const colors=['#cf444457','#22cb8366','#b870e6bb','#f4a93988'];for(let i=0;i<audit.cells.length;i++){ctx.fillStyle=colors[audit.cells[i]];ctx.fillRect(i%audit.width*audit.step,Math.floor(i/audit.width)*audit.step,audit.step,audit.step);}ctx.strokeStyle='#fff';ctx.lineWidth=3;for(const a of audit.arenas)ctx.strokeRect(...a.rect);ctx.restore();return ctx.canvas.toDataURL('image/webp',.94).split(',')[1];},
 roles:()=>{const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=870;const c=canvas.getContext('2d');c.fillStyle='#34413b';c.fillRect(0,0,1600,870);const entries=[{type:'guard',name:'Soldier',portrait:6},{type:'guard',elite:true,name:'Elite',portrait:6},{type:'captain',name:'Officer',portrait:8}],frames=[];
  entries.forEach((entry,row)=>{bank.draw(c,'npcPortraits5',entry.portrait,70,row*290+170,100,140);c.fillStyle='#e6ddc6';c.font='16px sans-serif';c.fillText(entry.name,22,row*290+205);const role=reviewedRole(entry),sources=bank.frames[role.sheet];
   for(let i=0;i<16;i++){const phase=i%8,x=195+(i%8)*190,y=row*290+(i<8?120:255),a={...entry,id:'review-'+row,x,y,angle:i<8?0:-1.2,moving:phase<4,walkDistance:phase*38,wind:phase===4?.4:phase===5?.1:0,windMax:.45,attackAnim:phase===6?.3:phase===7?.08:0};c.strokeStyle='#a8b598';c.beginPath();c.moveTo(x-65,y);c.lineTo(x+70,y);c.stroke();drawMonster(c,bank,a,0,{natural:true});const f=sources[i];frames.push({role:entry.name,index:i,source:{x:f.x,y:f.y,w:f.w,h:f.h},cell:f.cell,foot:f.foot,bodyScale:role.height/Math.max(...sources.slice(0,4).map(f=>f.h))});}
  });return {frames,image:canvas.toDataURL('image/webp',.95).split(',')[1]};},
 npc:()=>{g.active=true;g.portCD=999;g.p.x=900;g.p.y=560;const a=()=>g.npcs.map(n=>({id:n.id,x:n.x,y:n.y,moving:n.moving,walk:n.walkDistance})),before=a();for(let i=0;i<1800;i++)g.update(1/60,{});g.active=false;draw();return {before,after:a()};},
 performance:()=>{const times=[];for(let i=0;i<120;i++){const t=performance.now();draw();times.push(performance.now()-t);}times.sort((a,b)=>a-b);return {drawFrames:120,median:times[60],p95:times[114],resolution:[w,h],limit:'Headless isolated draw cost; not complete device frame time'};}
};`;
const b=await browserSession(process.cwd(),hook);
const report={at:new Date().toISOString(),status:'running',maps:[],scope:'Actual renderer, every entrance to every target using installed route/move/collision; original gate logic separately covered by integration. Isolated combat fixtures, not continuous campaign play.'};
const persist=()=>fs.writeFileSync(path.join(out,'BROWSER.json'),JSON.stringify(report,null,2)+'\n');
async function shot(name){const r=await b.call('Page.captureScreenshot',{format:'webp',quality:91});fs.writeFileSync(path.join(out,name+'.webp'),Buffer.from(r.data,'base64'));}
try{
 await b.wait('window.__SPATIAL?.ready()',120000);
 for(const audit of audits){await b.evaluate(`__SPATIAL.fixture(${JSON.stringify(audit.id)})`);const routes=await b.evaluate(`__SPATIAL.routes(${JSON.stringify(audit)})`);await b.evaluate(`__SPATIAL.fixture(${JSON.stringify(audit.id)})`);await shot(audit.id);const collision=await b.evaluate(`__SPATIAL.overlay(${JSON.stringify(audit)})`);fs.writeFileSync(path.join(out,audit.id+'-collision.webp'),Buffer.from(collision,'base64'));fs.writeFileSync(path.join(out,audit.id+'-collision.svg'),auditSVG(audit));report.maps.push({id:audit.id,routes});persist();}
 const combat=await b.evaluate('__SPATIAL.fight()');report.combat=combat.result;for(const c of combat.captures)fs.writeFileSync(path.join(out,'combat-'+c.name+'.webp'),Buffer.from(c.image,'base64'));assert.deepEqual(report.combat,runSpatialScenarios({RPG,stats}));
 const roles=await b.evaluate('__SPATIAL.roles()');fs.writeFileSync(path.join(out,'role-comparison.webp'),Buffer.from(roles.image,'base64'));report.roles=roles.frames;assert.equal(roles.frames.length,48);
 for(const f of roles.frames){assert.ok(f.source.w>30&&f.source.h>160);assert.ok(f.foot&&Number.isFinite(f.foot.x));assert.ok(f.foot.y>=f.source.y+f.source.h-2);}
 await b.evaluate("__SPATIAL.fixture('bridge')");report.npc=await b.evaluate('__SPATIAL.npc()');assert.ok(report.npc.after[0].walk>30);await shot('bridge-duties');report.performance=await b.evaluate('__SPATIAL.performance()');
 assert.deepEqual(b.errors,[]);report.errors=b.errors;report.status='pass';fs.writeFileSync(path.join(out,'AUDIT.json'),JSON.stringify({maps:audits},null,2)+'\n');persist();console.log(JSON.stringify({maps:report.maps.length,routes:report.maps.reduce((n,m)=>n+m.routes.length,0),combat:report.combat.scenarios.length,roles:report.roles.length,performance:report.performance}));
}catch(error){report.status='failed';report.error=String(error);persist();throw error;}finally{await b.close();}
