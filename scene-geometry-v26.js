import {supplementalFootprintsV281} from './presentation-physics-v281.js';
import {actorHeightV281} from './presentation-metrics-v281.js';
// Shared foot-space navigation and alpha-aware foreground cutaway. Raster artwork remains unchanged.
let worldMaps={},worldScenery={};
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),seated=new Set(['sit','seated','drink','listen','seated-listen','bench-wood','bench-stone']),resting=new Set(['lying','sleep','sleep-bed','carried']);
const extraCache=new Map();
export function invalidateSceneGeometryV281(map=null){if(map==null)extraCache.clear();else extraCache.delete(map);}
export function furnitureFootprintV26(o){
 if(o.geometryV26===false||o.romanceWaterV20||o.flat&&['details'].includes(o.sheet))return null;
 if(o.footprintV26)return {id:o.id,box:o.footprintV26,seat:!!o.socialFurnitureV20};
 if(o.box)return null; // Existing authored feet geometry stays authoritative.
 const box=(w,h,dx=0,dy=0)=>({id:o.id,box:[o.x-w/2+dx,o.y-h+dy,w,h],seat:!!o.socialFurnitureV20});
 if(o.socialFurnitureV20)return o.benchV20?box(77,16,14,-1):box(26,17,0,-1);
 if(o.sheet==='actors'&&o.asset===13)return box(25,18);
 if(o.sheet==='world'){
  if(o.asset===9)return box(o.w*.76,Math.min(o.h*.44,70));
  if(o.asset===10)return box(o.w*.78,Math.min(o.h*.38,38));
  if(o.asset===11)return box(o.w*.78,Math.min(o.h*.31,52));
  if(o.asset===12)return box(o.w*.72,Math.min(o.h*.55,46));
 }
 if(o.sheet==='romancePropsV20'){
  // These use contact pivots. Small edible/held props deliberately have no floor collision.
  if(o.asset===0)return box(o.w*.70,30,0,-5);
  if(o.asset===1)return box(o.w*.80,25,0,-7);
  if(o.asset===2)return box(o.w*.72,23,0,-5);
  if(o.asset===7)return box(39,21,10,-3);
 }
 if(o.sheet==='cityFurnishingsV19'){
  if(o.asset===1)return box(o.w*.79,Math.min(46,o.h*.34));
  if(o.asset===3)return box(o.w*.66,Math.min(38,o.h*.29));
  if(o.asset===5)return box(o.w*.70,Math.min(34,o.h*.22));
  if(o.asset===7)return box(o.w*.66,Math.min(26,o.h*.27));
 }
 return null;
}
export function mapFurnitureV26(map){
 const rows=worldScenery[map]||[],props=worldMaps[map]?.props||[],cached=extraCache.get(map);if(cached?.rows===rows&&cached.length===rows.length&&cached.propLength===props.length)return cached.items;
 const items=rows.flatMap((o,i)=>[furnitureFootprintV26(o),...supplementalFootprintsV281(o)].filter(Boolean).map(f=>({...f,id:f.id??`${map}:scenery:${i}`})));
 for(const p of props){if(!p.action||p.nativeV18||!p.art)continue;const art={...p,...p.art,asset:p.art.index};for(const f of [furnitureFootprintV26(art),...supplementalFootprintsV281(art)].filter(Boolean))items.push({...f,prop:true});}
 extraCache.set(map,{rows,length:rows.length,propLength:props.length,items});return items;
}
const aliveFootprint=(g,o)=>!o.prop||g.props.some(p=>p.id===o.id&&!p.broken&&(!p.used||g.questPropNeeded?.(p.id)));

const inBox=(x,y,b,pad=10)=>x>b[0]-pad&&x<b[0]+b[2]+pad&&y>b[1]-pad&&y<b[1]+b[3]+pad;
export function configureSceneGeometryV26({MAPS,SCENERY}){worldMaps=MAPS;worldScenery=SCENERY;extraCache.clear();}
function segmentActor(a,b,o){const dx=b.x-a.x,dy=(b.y-a.y)*1.4,px=o.x-a.x,py=(o.y-a.y)*1.4,den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,(px*dx+py*dy)/den)):0;return Math.hypot(px-dx*t,py-dy*t)<22;}
function segmentBox(a,b,box,pad=10){
 let lo=0,hi=1;for(const [origin,delta,min,max]of [[a.x,b.x-a.x,box[0]-pad+1e-5,box[0]+box[2]+pad-1e-5],[a.y,b.y-a.y,box[1]-pad+1e-5,box[1]+box[3]+pad-1e-5]]){
  if(Math.abs(delta)<1e-8){if(origin<=min||origin>=max)return false;continue;}
  const t1=(min-origin)/delta,t2=(max-origin)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2));if(lo>hi)return false;
 }return hi>0&&lo<1;
}
export function stageFurnitureV26(stage){const physical=[...mapFurnitureV26(stage.map)];for(const seat of stage.seatsV20||[]){if(physical.some(o=>o.seat&&inBox(seat.x,seat.y,o.box,3)))continue;physical.push({id:`scene-seat-${stage.map}-${seat.x}-${seat.y}`,box:[seat.x-13,seat.y-18,26,17],seat:true,temporary:true});}return physical;}
export function installPhysicalWorldV26(RPG,registries){
 configureSceneGeometryV26(registries);const P=RPG.prototype;if(P.__physicalV26)return;Object.defineProperty(P,'__physicalV26',{value:true});const old=P.blocked,oldLine=P.clearLine;
 P.blocked=function(x,y,props=true){return old.call(this,x,y,props)||mapFurnitureV26(this.map).some(o=>aliveFootprint(this,o)&&!this.geometryIgnoreV26?.has(o.id)&&inBox(x,y,o.box));};
 P.clearLine=function(a,b,props=true){return oldLine.call(this,a,b,props)&&!(worldMaps[this.map]?.blocks||[]).some(box=>segmentBox(a,b,box,12))&&!mapFurnitureV26(this.map).some(o=>aliveFootprint(this,o)&&!this.geometryIgnoreV26?.has(o.id)&&segmentBox(a,b,o.box));};
}
function seatIgnore(stage,key,pose,from,to){
 const ignore=new Set();const seat=stage.seatsV20?.find(s=>s.actor===key);
 if(seat&&seated.has(pose))for(const o of stageFurnitureV26(stage))if(o.seat&&inBox(seat.x,seat.y,o.box,3))ignore.add(o.id);
 return ignore;
}
export function stageNavigationV26(g,stage,key,pose='stand',from=null,to=null,actors=[]){
 const nav=Object.create(g);nav.map=stage.map;nav.geometryIgnoreV26=seatIgnore(stage,key,pose,from,to);Object.defineProperty(nav,'props',{value:g.states?.[stage.map]?.props||worldMaps[stage.map]?.props||[],configurable:true});
 const blocked=g.blocked,line=g.clearLine,temporary=stageFurnitureV26(stage).filter(o=>o.temporary);const obstacles=actors.filter(a=>a.id!==key&&a.visible!==false&&a.renderAs!=='prop'&&!a.fall&&!resting.has(a.pose)&&!(stage.actorMeta?.hero?.v25Cloak&&a.id==='saint')&&!(pose==='carry'&&a.id==='saint'));
 nav.blocked=function(x,y,props=true){return blocked.call(nav,x,y,props)||temporary.some(o=>!nav.geometryIgnoreV26.has(o.id)&&inBox(x,y,o.box))||obstacles.some(a=>Math.hypot(a.x-x,(a.y-y)*1.4)<22);};nav.clearLine=function(a,b,props=true){return line.call(nav,a,b,props)&&!temporary.some(o=>!nav.geometryIgnoreV26.has(o.id)&&segmentBox(a,b,o.box))&&!obstacles.some(o=>segmentActor(a,b,o));};return nav;
}
function nearestClear(nav,p,radius=160){if(!nav.blocked(p.x,p.y))return {x:p.x,y:p.y};for(let r=6;r<=radius;r+=6)for(const k of [4,3,5,2,6,1,7,0,8,15,9,14,10,13,11,12]){const a=k*Math.PI/8,q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(!nav.blocked(q.x,q.y))return q;}return nav.safePoint(p.x,p.y);}
export function exactRouteV26(nav,start,end){
 if(nav.clearLine(start,end))return [end];
 const path=nav.routeTo(end,start);if(path.length&&d(path.at(-1),end)<.15)return path;
 // A 40-pixel legacy grid can miss a clear aisle between two chairs. Retry only on failure.
 const step=20,nodes=[],lookup=new Map(),key=p=>`${p.x},${p.y}`;
 for(let y=160;y<=960;y+=step)for(let x=140;x<=1460;x+=step)if(!nav.blocked(x,y)){const p={x,y};nodes.push(p);lookup.set(key(p),p);}
 const nearest=p=>nodes.slice().sort((a,b)=>d(a,p)-d(b,p)).find(n=>nav.clearLine(p,n));const first=nearest(start),last=nearest(end);if(!first||!last)return [];
 const queue=[first],parent=new Map([[key(first),null]]);for(let i=0;i<queue.length;i++){const cur=queue[i];if(cur===last)break;for(let dx=-step;dx<=step;dx+=step)for(let dy=-step;dy<=step;dy+=step){if(!dx&&!dy)continue;const next=lookup.get(`${cur.x+dx},${cur.y+dy}`);if(next&&!parent.has(key(next))&&nav.clearLine(cur,next)){parent.set(key(next),cur);queue.push(next);}}}
 if(!parent.has(key(last)))return [];let cur=last;const result=[end];while(cur){result.unshift(cur);cur=parent.get(key(cur));}result.unshift(start);for(let i=0;i<result.length-2;i++)while(i+2<result.length&&nav.clearLine(result[i],result[i+2]))result.splice(i+1,1);return result.slice(1);
}
export function preparePhysicalStageV26(stage,g){
 if(!stage?.actors)return stage;
 const placed=[];for(const [key,at]of Object.entries(stage.actors)){const meta=stage.actorMeta?.[key]||{};if(resting.has(meta.pose)||meta.attachedTo||meta.patientSurface||meta.renderAs==='prop'||meta.fall)continue;const p={x:at[0],y:at[1]},nav=stageNavigationV26(g,stage,key,meta.pose,p,p,placed),safe=nearestClear(nav,p);stage.actors[key]=[safe.x,safe.y];placed.push({id:key,...safe,...meta,initialV26:true});}
 for(const beat of stage.beats||[])for(const [key,meta]of Object.entries(beat.actorMeta||{})){if(!Number.isFinite(meta.x)||!Number.isFinite(meta.y)||resting.has(meta.pose)||meta.attachedTo||meta.patientSurface||meta.renderAs==='prop'||meta.fall)continue;const p={x:meta.x,y:meta.y},nav=stageNavigationV26(g,stage,key,meta.pose,p,p),safe=nearestClear(nav,p);meta.x=safe.x;meta.y=safe.y;}
 return stage;
}
export function queuePhysicalMoveV26(cine,rawMove,id,x,y,duration=1,delay=0,extra={}){
 const actor=cine.get(id);if(!actor)return;
 const previous=cine.moves.filter(m=>m.id===id).at(-1),from={x:previous?.to.x??actor.x,y:previous?.to.y??actor.y};
 // Patient lifting/lowering is a surface transfer, not walking through a bed footprint.
 if(actor.renderAs==='prop'||actor.attachedTo||actor.patientSurface||actor.fall||resting.has(actor.pose)||resting.has(extra.arrivalMeta?.pose)||extra.fall){const transfer=resting.has(extra.arrivalMeta?.pose)||resting.has(actor.pose);return rawMove.call(cine,id,x,y,duration,delay,transfer?{...extra,geometryTransferV26:extra.arrivalMeta?.pose==='carried'?'lift':'surface',arrivalMeta:{...extra.arrivalMeta,geometryTransferV26:null}}:extra);}
 const seat=cine.stage.seatsV20?.find(s=>s.actor===id),targetPose=extra.arrivalMeta?.pose||actor.pose;
 const leaving=seat&&d(from,seat)<4&&d({x,y},seat)>4,entering=seat&&seated.has(targetPose)&&d({x,y},seat)<4;
 const reservations=[...cine.actors];for(const a of cine.actors){if(a.id===id||a.fall||a.geometryTransferV26||resting.has(a.pose))continue;const last=cine.moves.filter(m=>m.id===a.id).at(-1);if(last)reservations.push({...a,id:'destination-'+a.id,x:last.to.x,y:last.to.y});}
 const nav=stageNavigationV26(cine.g,cine.stage,id,'stand',from,{x,y},reservations);
 const seatObjects=seat?stageFurnitureV26(cine.stage).filter(o=>o.seat&&inBox(seat.x,seat.y,o.box,3)):[];
 const access=seat?nearestClear(nav,{x:seat.x,y:seat.y+34}):null;
 const start=leaving?from:nearestClear(nav,from),goal=entering?{x:seat.x,y:seat.y}:nearestClear(nav,{x,y});
 const middleStart=leaving?access:start,middleGoal=entering?access:goal;
 if(d(start,from)>.15){actor.x=start.x;actor.y=start.y;if(previous)previous.to={...previous.to,...start};}
 const middle=exactRouteV26(nav,middleStart,middleGoal);if(!middle.length)throw Error(`Scene ${cine.id} line ${cine.line}: no walkable route for ${id}`);
 // The seat aperture is used only for a short, front-facing sit/stand transfer.
 // Crossing from behind or across the bench always uses the normal furniture collision.
 const path=[...(leaving?[{p:access,seatTransfer:true}]:[]),...middle.map(p=>({p,seatTransfer:false})),...(entering?[{p:goal,seatTransfer:true}]:[])];
 let last=start,total=0;const legs=path.filter((leg,i)=>d(i?path[i-1].p:start,leg.p)>.02).map(leg=>{const length=d(last,leg.p);last=leg.p;total+=length;return {...leg,length};});
 if(!legs.length)return rawMove.call(cine,id,goal.x,goal.y,.001,delay,extra);
 const seconds=Math.max(Number(duration)||.1,total/165);let base=Math.max(Number(delay)||0,(previous?.end??cine.time)-cine.time);
 const scheduled=cine.moves.filter(m=>m.id!==id&&m.end>cine.time&&!m.to.geometryTransferV26);
 const at=(moves,a,time)=>{let p={x:a.x,y:a.y};for(const m of moves){if(time<m.start)break;const q=Math.max(0,Math.min(1,(time-m.start)/(m.end-m.start)));p={x:m.from.x+(m.to.x-m.from.x)*q,y:m.from.y+(m.to.y-m.from.y)*q};}return p;};
 const proposed=[];let offset=0,point=start;for(const leg of legs){const span=seconds*leg.length/Math.max(.001,total);proposed.push({from:point,to:leg.p,start:cine.time+base+offset,end:cine.time+base+offset+span});offset+=span;point=leg.p;}
 let conflict=false;for(const other of cine.actors){if(other.id===id||other.fall||other.geometryTransferV26||resting.has(other.pose)||cine.stage.actorMeta?.hero?.v25Cloak&&['hero','saint'].includes(id)&&['hero','saint'].includes(other.id))continue;const moves=scheduled.filter(m=>m.id===other.id);if(!moves.length)continue;for(let time=cine.time+base;time<=Math.max(cine.time+base+seconds,...moves.map(m=>m.end))+.001;time+=.025){const p=at(proposed,start,time),q=at(moves,other,time);if(Math.hypot(p.x-q.x,(p.y-q.y)*1.4)<23){conflict=true;break;}}}
 if(conflict)base=Math.max(base,Math.max(...scheduled.map(m=>m.end))-cine.time+.12);
 if(leaving){actor.geometrySeatV26=seatObjects.map(o=>o.id);actor.pose=seated.has(actor.poseBeforeMoveV26)?actor.poseBeforeMoveV26:'seated';}else if(seated.has(actor.pose)){actor.pose='stand';actor.poseFlip=null;actor.depthY=null;}
 let elapsed=0;for(let i=0;i<legs.length;i++){const {p,length,seatTransfer}=legs[i],t=total>0?Math.max(.001,seconds*length/total):.001,final=i===legs.length-1;
 const arrivalMeta={...(final?extra.arrivalMeta:{}),geometrySeatV26:final&&entering?seatObjects.map(o=>o.id):null};
 const options={...(final?extra:{}),arrivalMeta,geometrySeatV26:seatTransfer?seatObjects.map(o=>o.id):null,...(leaving?{walkPoseV26:'stand'}:{})};
 rawMove.call(cine,id,p.x,p.y,t,base+elapsed,options);elapsed+=t;
 }
}
// Projection uses exactly the same cropped atlas frame and ground pivot as ArtBank.draw.
export function sceneryProjectionV26(bank,o){
 const f=bank.frame(o.sheet,o.asset);if(!f)return null;const m=f.meta||{},anchor=m.anchorInSourceRect||m.anchor;
 const anchored=['cityWorld','cityArchitectureV19','cityFurnishingsV19','romancePropsV20','medicalProps','deepProps'].includes(o.sheet)&&anchor;
 const sx=o.w/f.w,sy=anchored?sx:o.h/f.h;return {f,left:o.x-(anchored?anchor[0]*sx:o.w/2),top:o.y-(anchored?anchor[1]*sy:o.h),w:f.w*sx,h:f.h*sy,sx,sy};
}
const alphaCache=new WeakMap();
function opaqueAt(bank,o,p,x,y){const image=bank.images[o.sheet];if(!image?.getContext)return true;let a=alphaCache.get(image);if(!a){try{a=image.getContext('2d',{willReadFrequently:true}).getImageData(0,0,image.width,image.height).data;alphaCache.set(image,a);}catch{return true;}}const xx=Math.floor(p.f.x+(x-p.left)/p.sx),yy=Math.floor(p.f.y+(y-p.top)/p.sy);return xx>=p.f.x&&xx<p.f.x+p.f.w&&yy>=p.f.y&&yy<p.f.y+p.f.h&&a[(yy*image.width+xx)*4+3]>96;}
export function sceneryAlphaV26(bank,o,people=[]){
 // Furniture still occludes feet naturally. Only tall foreground roofs/canopies need a cutaway.
 if(o.occlusionV26===false||o.socialFurnitureV20||o.romanceWaterV20||o.h<125)return 1;
 const projection=sceneryProjectionV26(bank,o);if(!projection)return 1;const depth=o.depthY??o.y;
 for(const a of Array.isArray(people)?people:[people]){
  if(!a||a.visible===false||a.renderAs==='prop'||a.compositeParentV20||a.fall||resting.has(a.pose))continue;
  if((a.depthY??a.y)>=depth-.5)continue;
  const bodyHeight=a.renderHeightV281||actorHeightV281(a);for(const [dx,dy]of [[0,-bodyHeight*.80],[-9,-bodyHeight*.63],[9,-bodyHeight*.63],[0,-bodyHeight*.43]]){const x=a.x+dx,y=a.y+dy;if(x<projection.left||x>=projection.left+projection.w||y<projection.top||y>=projection.top+projection.h)continue;if(opaqueAt(bank,o,projection,x,y))return .30;}
 }
 return 1;
}
