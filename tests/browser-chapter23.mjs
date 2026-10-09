import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
const root=path.resolve(process.env.ASHEN_CAPTURE_ROOT||'.'),out=path.resolve(process.env.ASHEN_CAPTURE_OUTPUT||'qa-export/chapter23/after');
const hook=`window.__REVIEW={ready:()=>assetsReady,state:()=>({mode,map:g?.map,p:g?{x:g.p.x,y:g.p.y,hp:g.p.hp,mp:g.p.mp,level:g.p.level,gear:g.p.gear}:null,quests:g?.quests,flags:g?.flags,pending:g?.pending,transition:g?.transition,moveTo:g?.moveTo,active:g?.active,auto,scale,view,cam,flow:flow?{id:flow.id,index:flow.index}:null}),data:()=>g?({map:MAPS[g.map],scenery:SCENERY[g.map],targets:g.targets(),enemies:g.enemies.map(e=>({id:e.id,type:e.type,x:e.x,y:e.y,hp:e.hp,maxHP:e.maxHP,dead:e.dead,aiState:e.aiState,action:e.action,attackAnim:e.attackAnim,wind:e.wind}))}):null,point:(x,y)=>({x:w/2+(x-view.x)*scale,y:h/2+(y-view.y)*scale}),fixture:(map,x,y)=>{flow=null;cine=null;flowPending=null;g=new RPG('shadow',null,()=>.44);g.chapter=map.startsWith('hell')?3:2;g.enter(map,x,y);g.pending=null;g.events=[];g.p.invuln=0;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});SAVE='ashen-review-fixture-isolated';play();g.active=false;cam={x:g.p.x,y:g.p.y};return window.__REVIEW.state();},overview:()=>{scale=Math.min(w/1600,h/1080);ui.style.visibility='hidden';notice.style.visibility='hidden';draw();},live:()=>{resize();ui.style.visibility='visible';notice.style.visibility='visible';play();g.active=true;}};`;

const atlasHook=`window.__REVIEW.atlases=()=>Object.fromEntries(['chapterArchitecture','chapterFurnishings','chapterSettlement','chapterGuards'].filter(n=>bank.images[n]).map(n=>[n,bank.frames[n].map(f=>({x:f.x,y:f.y,w:f.w,h:f.h}))]));`;
const guardHook=`window.__REVIEW.guards=()=>{if(!bank.images.chapterGuards)return null;const p=document.createElement('canvas');p.width=960;p.height=700;const c=p.getContext('2d');c.fillStyle='#20292d';c.fillRect(0,0,960,700);for(let row=0;row<4;row++)for(let col=0;col<4;col++){const x=110+col*240,y=165+row*170,attack=row%2;const a={type:row<2?'guard':'captain',id:'gallery',x,y,angle:row<2?0:-1,moving:!attack,walkDistance:col*38,wind:attack&&col<2?(col===0?.4:.1):0,windMax:.45,attackAnim:attack&&col>=2?(col===2?.3:.1):0};c.strokeStyle='#73807d';c.beginPath();c.moveTo(x-70,y);c.lineTo(x+70,y);c.stroke();drawMonster(c,bank,a,0,{natural:true});c.fillStyle='#d9d5c8';c.font='14px sans-serif';c.fillText((row<2?'front':'back')+' '+(attack?'attack':'walk')+' '+(col+1),x-60,y+22);}return p.toDataURL('image/png').split(',')[1]};`;
const chapter23Hook=`window.__REVIEW.creatures=()=>{const p=document.createElement('canvas');p.width=1200;p.height=1430;const c=p.getContext('2d');c.fillStyle='#303b40';c.fillRect(0,0,p.width,p.height);const types=['wolf','guard','hellHound','hellSoul','hellGuard','hellJailer','ironScuttler','furnaceSentinel'];for(let row=0;row<types.length;row++)for(let col=0;col<6;col++){const a={id:'gallery-'+row,type:types[row],x:95+col*200,y:145+row*170,angle:0,level:10,moving:col===1,walkDistance:72,wind:col===2?.1:0,windMax:.4,attackAnim:col===3?.25:col===4?.07:0,fall:col===5?.8:0};c.strokeStyle='#71827b';c.beginPath();c.moveTo(a.x-75,a.y);c.lineTo(a.x+75,a.y);c.stroke();drawMonster(c,bank,a,1,{natural:true});c.fillStyle='#e7d8b9';c.font='12px sans-serif';c.fillText(types[row]+' '+['idle','walk','windup','strike','recovery','fall'][col],a.x-83,a.y+19);}return p.toDataURL('image/png').split(',')[1]};window.__REVIEW.roundtrip=()=>{const saved=JSON.stringify(g.snapshot()),before={map:g.map,x:g.p.x,y:g.p.y,water:g.flags.v9WaterShared},restored=new RPG('shadow',JSON.parse(saved),()=>.44);return {before,after:{map:restored.map,x:restored.p.x,y:restored.p.y,water:restored.flags.v9WaterShared},anchor:restored.targets().find(p=>p.id==='v9-bridge-water')?.y}};`;
const b=await browserSession(root,hook+atlasHook+guardHook+chapter23Hook);
try{
 await b.wait('window.__REVIEW?.ready()',120000);
 const results=[];
 for(const map of ['post','inn','bridge','manor','spillway','exile','chamber','bridgecellar','wellcrypt','hellGate','hellApproach','hellQuarry','hellSluice','hellWall','hellCamp','hellGrotto','hellWorkshop','hellMine','hellFerry','hellPass','hellArena','hellTomb','hellRift']){
  await b.evaluate(`__REVIEW.fixture('${map}',800,540);__REVIEW.overview()`);
  await b.shot(path.join(out,map+'.png'));
  const data=await b.evaluate('__REVIEW.state()');
  results.push(data);
 }
 const atlases=await b.evaluate('__REVIEW.atlases()');if(atlases.chapterFurnishings)assert.ok(atlases.chapterFurnishings[3].w/atlases.chapterFurnishings[3].h<.6,'lamp sampling includes neighbouring furniture');
 if(atlases.chapterGuards){assert.equal(atlases.chapterGuards.length,16);assert.ok(atlases.chapterGuards.every(f=>f.w>50&&f.h>200));const png=await b.evaluate('__REVIEW.guards()');fs.writeFileSync(path.join(out,'guard-frames.png'),Buffer.from(png,'base64'));}
 const png=await b.evaluate('__REVIEW.creatures()');fs.writeFileSync(path.join(out,'enemy-poses.png'),Buffer.from(png,'base64'));
 // Isolated interaction fixture through real DOM input. No combat outcome claimed.
 await b.evaluate("__REVIEW.fixture('bridge',1040,495);__REVIEW.live()");await delay(250);
 const water=await b.evaluate('__REVIEW.point(1010,435)');await b.click(water.x,water.y);
 await b.wait("__REVIEW.state().flow?.id==='v9BridgeWater'",10000);
 const waterScene=await b.evaluate('__REVIEW.state()');await b.shot(path.join(out,'water-interaction.png'));
 for(let i=0;i<20;i++){if((await b.evaluate('__REVIEW.state()')).mode==='play')break;await b.key('Enter');await b.key('Enter',false);await delay(160);}
 await b.wait('__REVIEW.state().flags.v9WaterShared===true',10000);
 const roundtrip=await b.evaluate('__REVIEW.roundtrip()');assert.deepEqual(roundtrip.after,roundtrip.before);assert.equal(roundtrip.anchor,495);
 assert.deepEqual(b.errors,[]);
 fs.writeFileSync(path.join(out,'CAPTURE.json'),JSON.stringify({at:new Date().toISOString(),scope:'23 staged maps through the actual game renderer; no claim of continuous playthrough',results,atlases,waterScene,roundtrip,errors:b.errors},null,2)+'\n');
 console.log('Captured 23 chapter-two/three maps; browser errors:',b.errors.length);
}finally{await b.close();}
