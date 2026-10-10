// Uses the fully installed RPG. No substitute collision/nav implementation.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {RPG,MAPS} from '../dist/core-v14.js';
import {SCENERY} from '../dist/world-v14.js';
const SPATIAL_PLANS_V30=Object.fromEntries(Object.entries(MAPS).filter(([,m])=>(m.chapterRegion??m.chapter??1)<=3).map(([id])=>[id,{}]));
export function spatialAudit(g,id,step=20){
 g.map=id;g.ensureMap(id);g.pending=null;g.active=false;g.flags.rumor=true;
 const width=Math.floor(1600/step),height=Math.floor(1080/step),size=width*height;
 const point=i=>({x:(i%width+.5)*step,y:(Math.floor(i/width)+.5)*step});
 const clear=Array.from({length:size},(_,i)=>{const p=point(i);return !g.blocked(p.x,p.y);});
 const entry=MAPS[id].doors[0]||{x:800,y:800};let start=-1,best=Infinity;
 for(let i=0;i<size;i++)if(clear[i]){const p=point(i),d=Math.hypot(p.x-entry.x,p.y-entry.y);if(d<best){best=d;start=i;}}
 const neighbors=i=>[i%width?i-1:-1,i%width<width-1?i+1:-1,i>=width?i-width:-1,i<size-width?i+width:-1].filter(j=>j>=0);
 const reachable=new Set(start<0?[]:[start]),queue=start<0?[]:[start];
 for(let n=0;n<queue.length;n++)for(const j of neighbors(queue[n]))if(clear[j]&&!reachable.has(j)&&g.clearLine(point(queue[n]),point(j))){reachable.add(j);queue.push(j);}
 // Grid clearance in world pixels; narrow strips are diagnostics, not pass/fail area scores.
 const clearance=clear.map(v=>v?Infinity:0),wave=clear.map((v,i)=>v?-1:i).filter(i=>i>=0);
 for(let n=0;n<wave.length;n++)for(const j of neighbors(wave[n]))if(clearance[j]>clearance[wave[n]]+step){clearance[j]=clearance[wave[n]]+step;wave.push(j);}
 const targets=g.targets().filter(t=>t.id!=='saint');
 for(const d of MAPS[id].doors)if(!targets.some(t=>t.kind==='door'&&t.x===d.x&&t.y===d.y))targets.push({...d,id:'door:'+d.to,kind:'door'});
 const paths=targets.map(t=>{const candidates=queue.filter(i=>{const p=point(i);return Math.hypot(p.x-t.x,p.y-t.y)<(t.kind==='door'?44:95)&&g.clearLine(p,t,false);});const approach=candidates.sort((a,b)=>Math.hypot(point(a).x-t.x,point(a).y-t.y)-Math.hypot(point(b).x-t.x,point(b).y-t.y))[0];return {id:t.id,kind:t.kind,target:{x:t.x,y:t.y},approach:approach===undefined?null:point(approach)};});
 const arenas=(SPATIAL_PLANS_V30[id]?.arenas||[]).map(rect=>{const [x,y,w,h]=rect,blocked=[];for(let yy=y;yy<=y+h;yy+=10)for(let xx=x;xx<=x+w;xx+=10)if(g.blocked(xx,yy))blocked.push([xx,yy]);return {rect,characterBoxes:[+(w/24).toFixed(1),+(h/24).toFixed(1)],blockedSamples:blocked.length,firstBlocked:blocked.slice(0,12)};});
 return {id,name:MAPS[id].name,step,width,height,scenery:SCENERY[id].length,walkable:clear.filter(Boolean).length,reachable:reachable.size,unreachable:clear.filter((v,i)=>v&&!reachable.has(i)).length,targets:paths,arenas,
  cells:clear.map((v,i)=>!v?0:!reachable.has(i)?2:clearance[i]<60?3:1),minimumArenaReference:[240,192],method:'Actual installed RPG blocked + clearLine; 20px orthogonal flood; cardinal grid clearance; arena 10px samples including props. Does not measure feel or aesthetic quality.'};
}
export function auditSVG(row){
 const colors=['#ca636877','#45bd9977','#b676ddbb','#f7b955bb'];let body='';
 for(let i=0;i<row.cells.length;i++)body+=`<rect x="${i%row.width*row.step}" y="${Math.floor(i/row.width)*row.step}" width="${row.step}" height="${row.step}" fill="${colors[row.cells[i]]}"/>`;
 for(const {rect}of row.arenas)body+=`<rect x="${rect[0]}" y="${rect[1]}" width="${rect[2]}" height="${rect[3]}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="8 5"/>`;
 for(const t of row.targets)body+=`<circle cx="${t.target.x}" cy="${t.target.y}" r="9" fill="${t.approach?'#effff9':'#ff1515'}"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1130" viewBox="0 0 1600 1130"><rect width="1600" height="1130" fill="#152229"/>${body}<text x="25" y="1110" fill="white" font-size="22">${row.id} | red=collision green=reachable violet=unreachable amber=clearance&lt;60px white=arena/target</text></svg>`;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const at=process.argv.indexOf('--output'),out=path.resolve(at>=0?process.argv[at+1]:'qa-export/spatial'),g=new RPG('shadow',null,()=>.44),rows=[];fs.mkdirSync(out,{recursive:true});
 for(const id of Object.keys(SPATIAL_PLANS_V30)){const row=spatialAudit(g,id);rows.push(row);fs.writeFileSync(path.join(out,id+'-collision.svg'),auditSVG(row));console.log(id,JSON.stringify({cells:row.reachable,unreachableTargets:row.targets.filter(t=>!t.approach).map(t=>t.id),arenas:row.arenas.map(a=>a.blockedSamples)}));}
 fs.writeFileSync(path.join(out,'AUDIT.json'),JSON.stringify({at:new Date().toISOString(),maps:rows},null,2)+'\n');
}
