// Domain diagnostic built on the game's actual collision and interaction queries.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {RPG,MAPS} from '../dist/core-v14.js';
import {SCENERY} from '../dist/world-v14.js';
import {WORLD_REGIONS_V29} from '../dist/world-design-v29.js';
export function inspectWorldMap(g,id,step=40){
 g.map=id;g.ensureMap(id);g.pending=null;g.active=false;g.flags.rumor=true;
 const nx=Math.floor(1600/step),ny=Math.floor(1080/step),cells=[];
 const at=(i)=>({x:(i%nx+.5)*step,y:(Math.floor(i/nx)+.5)*step});
 for(let i=0;i<nx*ny;i++){const p=at(i);cells[i]=!g.blocked(p.x,p.y,false);}
 const entry=WORLD_REGIONS_V29[id]?.entry||[MAPS[id].doors[0]?.x??800,MAPS[id].doors[0]?.y??800];
 let start=-1,best=Infinity;for(let i=0;i<cells.length;i++)if(cells[i]){const p=at(i),d=Math.hypot(p.x-entry[0],p.y-entry[1]);if(d<best){best=d;start=i;}}
 const seen=new Set(start<0?[]:[start]),queue=start<0?[]:[start];
 for(let q=0;q<queue.length;q++){const i=queue[q],p=at(i);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=i%nx+dx,y=Math.floor(i/nx)+dy,j=y*nx+x;if(x<0||x>=nx||y<0||y>=ny||!cells[j]||seen.has(j)||!g.clearLine(p,at(j),false))continue;seen.add(j);queue.push(j);}}
 const targets=g.targets().filter(t=>t.id!=='saint');for(const p of MAPS[id].props.filter(p=>p.id==='v29-echo-core'||p.id==='v29-repair-core'))if(!targets.some(t=>t.id===p.id))targets.push({...p,x:p.interactX??p.x,y:p.interactY??p.y,kind:'prop'});const unreachable=[],activity=targets.filter(t=>t.kind!=='door');
 for(const t of targets){if(!queue.some(i=>{const p=at(i);return Math.hypot(p.x-t.x,p.y-t.y)<(t.kind==='door'?45:95)&&g.clearLine(p,t,false);}))unreachable.push({id:t.id,kind:t.kind,x:t.x,y:t.y});}
 activity.push(...g.enemies.filter(e=>!e.dead));
 let covered=0,maxQuiet=0;for(const i of queue){const p=at(i),d=activity.length?Math.min(...activity.map(a=>Math.hypot(a.x-p.x,a.y-p.y))):1600;if(d<170)covered++;maxQuiet=Math.max(maxQuiet,d);}
 return {id,name:MAPS[id].name,kind:WORLD_REGIONS_V29[id]?.kind||'existing',gridStep:step,walkableCells:cells.filter(Boolean).length,connectedCells:seen.size,connectedRatio:+(seen.size/Math.max(1,cells.filter(Boolean).length)).toFixed(3),scenery:SCENERY[id].length,targets:targets.length,enemies:g.enemies.filter(e=>!e.dead).length,activityCoverage:+(covered/Math.max(1,seen.size)).toFixed(3),maxDistanceToActivity:+maxQuiet.toFixed(1),estimatedQuietSeconds:+(maxQuiet/180).toFixed(2),unreachable};
}
if(process.argv[1]&&fs.existsSync(process.argv[1])&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){
 const g=new RPG('shadow',null,()=>.44),maps=Object.keys(MAPS).map(id=>inspectWorldMap(g,id));
 const i=process.argv.indexOf('--output'),output=i<0?'qa-export/world-v29/MAP_AUDIT.json':process.argv[i+1];fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify({schema:1,at:new Date().toISOString(),method:'Actual blocked/clearLine, 40px four-neighbour flood. Coverage uses a 170px radius. Quiet seconds is straight-line distance / nominal 180px/s, not measured playtime. Hidden exits are inspected with rumor enabled; progression locks and non-demo pre-existing issues need separate review.',maps},null,2)+'\n');
 console.log(JSON.stringify({maps:maps.length,demo:maps.filter(a=>WORLD_REGIONS_V29[a.id]),diagnostic:output},null,2));
}
