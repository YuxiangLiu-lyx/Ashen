import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {browserSession,delay} from '../tools/browser_session.mjs';
import {MAPS} from '../dist/core-v14.js';
// Independent runtime inventory, NOT the presentation allowlist under test.
const maps=Object.entries(MAPS).filter(([,m])=>(m.chapterRegion??m.chapter??1)<=3).map(([id])=>id);
const out=path.resolve(process.env.ASHEN_CAPTURE_OUTPUT||'qa-export/chapter123/after');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'CAPTURE.json.tmp'),JSON.stringify({at:new Date().toISOString(),status:'starting',expectedMaps:maps.length})+'\n');
fs.renameSync(path.join(out,'CAPTURE.json.tmp'),path.join(out,'CAPTURE.json'));
const hook=`
import {chapter123SceneryV30 as reviewedScenery,CHAPTER123_HOSTS_V30 as reviewedHosts} from './chapter123-presentation-v30.js';
window.__CHECK={ready:()=>assetsReady,
 state:()=>({mode,map:g.map,pending:g.pending,flow:flow?{id:flow.id,index:flow.index}:null,flags:g.flags,quests:g.quests,events:g.events,notices:toastList.map(t=>t.text),player:{x:g.p.x,y:g.p.y},pendingWalk,moveTo:g.moveTo}),
 fixture:(id,x=800,y=540)=>{flow=null;cine=null;flowPending=null;toastList=[];pendingWalk=null;g=new RPG('shadow',null,()=>.44);g.chapter=MAPS[id].chapterRegion||2;g.enter(id,x,y);g.pending=null;g.events=[];g.p.invuln=0;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];chapterCards.attach(g,{restored:true});SAVE='ashen-qa-ch123-isolated';play();g.active=false;cam={x:g.p.x,y:g.p.y};scale=Math.min(w/1600,h/1080);ui.style.visibility='hidden';notice.style.visibility='hidden';draw();},
 audit:()=>{const original=bank.draw,scenery=[],props=[];let calls=[];bank.draw=function(c,sheet,index,...args){calls.push({sheet,index});return original.call(this,c,sheet,index,...args);};try{for(const o of SCENERY[g.map]){calls=[];drawScenery(ctx,bank,o,[],g.map);scenery.push({id:o.id,fitted:reviewedScenery(bank,o,g.map),calls});}for(const p of g.props){calls=[];drawActor('prop',p);props.push({id:p.id,label:p.label||p.type,action:p.action,host:reviewedHosts[p.id]||null,art:chapter123PropArtV30(p,g.map,actionPropArt(p,g),g),calls});}}finally{bank.draw=original;draw();}return {id:g.map,name:MAPS[g.map].name,scenery,props};},
 atlases:()=>Object.fromEntries(['chapterUtilities','chapterObjects','chapterHell','chapterHellMaterials'].map(n=>[n,bank.frames[n].map(f=>({x:f.x,y:f.y,w:f.w,h:f.h,cell:f.cell}))])),
 gallery:(name)=>{const p=document.createElement('canvas'),cols=4,cell=220;p.width=cols*cell;p.height=Math.ceil(bank.frames[name].length/cols)*cell;const c=p.getContext('2d');c.fillStyle='#39413e';c.fillRect(0,0,p.width,p.height);bank.frames[name].forEach((f,i)=>{const x=(i%cols)*cell+110,y=Math.floor(i/cols)*cell+186,k=Math.min(180/f.w,170/f.h);c.imageSmoothingEnabled=true;bank.draw(c,name,i,x,y,f.w*k,f.h*k);c.fillStyle='#eddfc8';c.font='15px sans-serif';c.fillText(name+' '+i,x-100,y+26);});return p.toDataURL('image/webp',.92).split(',')[1];},
 point:(x,y)=>({x:w/2+(x-view.x)*scale,y:h/2+(y-view.y)*scale}),
 aim:(id)=>{const t=g.targets().find(t=>t.id===id);if(!t)throw Error('target missing '+id);g.relocate(t.x,t.y);g.pending=null;g.active=true;g.enemies.forEach(e=>e.dead=true);cam={x:g.p.x,y:g.p.y};resize();ui.style.visibility='visible';notice.style.visibility='visible';draw();return {x:t.drawX??t.x,y:(t.drawY??t.y)-25};},
 occlusion:()=>{const o=SCENERY.town.find(o=>o.id==='south-shop'),fit=reviewedScenery(bank,o,'town');return {behind:sceneryAlphaV26(bank,fit,[{x:o.x,y:o.y-35}]),front:sceneryAlphaV26(bank,fit,[{x:o.x,y:o.y+40}]),fitted:fit};},
 enemies:()=>{const types=['rat','wolf','bat','guard','captain','hellHound','hellSoul','hellGuard','hellJailer','ironScuttler','furnaceSentinel'],poses=[['idle',{}],['walk',{moving:true,walkDistance:48}],['wind',{wind:.1,windMax:.45}],['strike',{attackAnim:.2}],['recovery',{attackAnim:.07}],['hit',{}],['fall',{fall:.8}]],p=document.createElement('canvas');p.width=1540;p.height=types.length*240;const c=p.getContext('2d'),samples=[];c.fillStyle='#283234';c.fillRect(0,0,p.width,p.height);types.forEach((type,row)=>poses.forEach(([pose,extra],col)=>{const x=col*220+110,y=row*240+200,a={...g.enemy(type,x,y,'qa-'+type),angle:0,wind:0,moving:false,attackAnim:0,fall:0,...extra};drawMonster(c,bank,a,1,{natural:true,...(pose==='hit'?{reaction:{life:.12,dx:4,dy:2}}:{})});const bytes=c.getImageData(col*220,row*240,220,210).data;let count=0;for(let i=0;i<bytes.length;i+=4)if(bytes[i]!==40||bytes[i+1]!==50||bytes[i+2]!==52)count++;samples.push({type,pose,pixels:count});c.fillStyle='#ddd5bc';c.font='12px sans-serif';c.fillText(type+' '+pose,col*220+4,row*240+230);}));return {samples,image:p.toDataURL('image/webp',.94).split(',')[1]};},
 stage:(scene)=>{g.beginScene(scene);showScene();draw();return {scene,map:cine?.map,gameMap:g.map,mode};}
};`;
const b=await browserSession(process.cwd(),hook);
async function shot(file){await delay(160);const r=await b.call('Page.captureScreenshot',{format:'webp',quality:90});fs.writeFileSync(path.join(out,file+'.webp'),Buffer.from(r.data,'base64'));}
try{
 await b.wait('window.__CHECK?.ready()',120000);
 const coverage=[],clicks=[],stages=[];let atlases={},enemySamples=[],occlusion={};
 const persist=(status)=>{const target=path.join(out,'CAPTURE.json');fs.writeFileSync(target+'.tmp',JSON.stringify({at:new Date().toISOString(),status,scope:'35 independently enumerated maps; renderer provenance and isolated pointer fixtures; enemy factory poses include story bosses; not continuous campaign playthrough',coverage,atlases,clicks,stages,enemySamples,occlusion,errors:b.errors},null,2)+'\n');fs.renameSync(target+'.tmp',target);};
 persist('running');
 for(const map of maps){
  await b.evaluate(`__CHECK.fixture(${JSON.stringify(map)})`);
  const row=await b.evaluate('__CHECK.audit()');
  for(const s of row.scenery){assert.ok(s.fitted,map+'/'+s.id);assert.ok(s.calls.length,map+'/'+s.id+' was not drawn');assert.ok(s.calls.every(c=>c.sheet.startsWith('chapter')||(map==='warehouse'&&s.id.startsWith('stock-')&&c.sheet==='narrativeStores')||(s.id==='spatial-bridge-front'&&c.sheet==='spatialBridgeFront')),map+'/'+s.id+' unreviewed scenery');}
  for(const p of row.props){assert.ok(p.art||p.host,map+'/'+p.id+' missing artwork/host');assert.ok(p.calls.every(c=>c.sheet.startsWith('chapter')),map+'/'+p.id+' old prop');if(p.host)assert.ok(row.scenery.some(s=>s.id===p.host),map+'/'+p.id+' host missing');else assert.ok(p.calls.length,map+'/'+p.id+' not drawn');}
  coverage.push(row);await shot(map);persist('running');
 }
 atlases=await b.evaluate('__CHECK.atlases()');
 for(const [name,count]of [['chapterUtilities',20],['chapterObjects',12],['chapterHell',17],['chapterHellMaterials',4]]){assert.equal(atlases[name].length,count);assert.ok(atlases[name].every(f=>f.w>15&&f.h>15));fs.writeFileSync(path.join(out,name+'.webp'),Buffer.from(await b.evaluate(`__CHECK.gallery('${name}')`),'base64'));}

 // Real pointer handling, isolated fixtures. These don't simulate an entire quest.
 for(const [map,id,expected]of [['town','townbook','礼拜通知'],['guestroom','guest-basin','guestWash'],['post','v9-post-wedge','v9PostWheel'],['bridge','v9-bridge-water','v9BridgeWater'],['bridgecellar','v9-toll-scale','v9TollScale'],['wellcrypt','v9-warden-chain','现在用不着再拉']]){
  await b.evaluate(`__CHECK.fixture('${map}')`);const at=await b.evaluate(`__CHECK.aim('${id}')`);await delay(180);const p=await b.evaluate(`__CHECK.point(${at.x},${at.y})`);await b.click(p.x,p.y);await delay(200);
  const state=await b.evaluate('__CHECK.state()');clicks.push({map,id,state});await shot('click-'+id);persist('running');assert.ok(state.flow?.id===expected||state.pending?.id===expected||state.notices.some(t=>t.includes(expected)),'wrong click response '+id+': '+JSON.stringify(state));
 }
 occlusion=await b.evaluate('__CHECK.occlusion()');assert.equal(occlusion.behind,.3);assert.equal(occlusion.front,1);
 const enemies=await b.evaluate('__CHECK.enemies()');enemySamples=enemies.samples;assert.equal(enemySamples.length,77);assert.ok(enemySamples.every(v=>v.pixels>100));fs.writeFileSync(path.join(out,'enemy-poses.webp'),Buffer.from(enemies.image,'base64'));persist('running');
 for(const [map,scene,stageMap]of [['manor','ch2TargetBefore','chamber'],['hellCamp','ch3Treatment','hellCamp']]){
  await b.evaluate(`__CHECK.fixture('${map}')`);const state=await b.evaluate(`__CHECK.stage('${scene}')`);stages.push(state);persist('running');assert.equal(state.map,stageMap);assert.equal(state.mode,'dialogue');await shot('scene-'+scene);
 }
 assert.deepEqual(b.errors,[]);
 persist('passed');
 console.log(JSON.stringify({maps:coverage.length,scenery:coverage.reduce((n,m)=>n+m.scenery.length,0),props:coverage.reduce((n,m)=>n+m.props.length,0),clicks:clicks.length,errors:b.errors}));
}finally{await b.close();}
