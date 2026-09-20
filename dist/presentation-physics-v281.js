import {footRadiusV281} from './presentation-metrics-v281.js';
export const validFootBoxV281=b=>Array.isArray(b)&&b.length===4&&b.every(Number.isFinite)&&b[2]>0&&b[3]>0;
export function pointInFootBoxV281(x,y,b,pad=0){return validFootBoxV281(b)&&x>b[0]-pad&&x<b[0]+b[2]+pad&&y>b[1]-pad&&y<b[1]+b[3]+pad;}
export function segmentFootBoxV281(a,b,box,pad=0){
 if(!validFootBoxV281(box))return false;let lo=0,hi=1;
 for(const [p,d,mn,mx]of [[a.x,b.x-a.x,box[0]-pad,box[0]+box[2]+pad],[a.y,b.y-a.y,box[1]-pad,box[1]+box[3]+pad]]){
  if(Math.abs(d)<1e-9){if(p<=mn||p>=mx)return false;continue;}
  const u=(mn-p)/d,v=(mx-p)/d;lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));if(lo>=hi)return false;
 }return hi>0&&lo<1;
}
// Supplement only missing authored footprints. An arch is TWO posts, never a wall.
export function supplementalFootprintsV281(raw){
 const o={...raw,...raw.art,asset:raw.art?.index??raw.asset};
 if(o.geometryV26===false||o.collisionV281===false||o.flat||o.romanceWaterV20||o.box)return [];
 if(Array.isArray(o.collisionBoxesV281))return o.collisionBoxesV281.filter(validFootBoxV281).map((box,i)=>({id:o.id,part:i,box}));
 const w=Number(o.w)||0,h=Number(o.h)||0;if(!Number.isFinite(o.x)||!Number.isFinite(o.y)||w<=0||h<=0)return [];
 const box=(bw,bh,dx=0,dy=0)=>[{id:o.id,box:[o.x-bw/2+dx,o.y-bh+dy,bw,bh]}];
 const posts=(separation,bw,bh)=>[-1,1].map((side,i)=>({id:o.id,part:i,box:[o.x+side*separation-bw/2,o.y-bh,bw,bh]}));
 if(o.sheet==='world'){
  if(o.asset===4)return box(Math.min(76,w*.23),Math.min(35,h*.13));
  if(o.asset===5)return box(w*.83,Math.min(38,h*.32));
  if(o.asset===0||o.asset===1)return box(w*.82,Math.min(100,h*.30));
  if(o.asset===7)return posts(w*.39,w*.12,Math.min(32,h*.13));
  if(o.asset===13)return box(w*.66,Math.min(22,h*.38));
  if(o.asset===14||o.asset===15)return box(Math.min(28,w*.38),Math.min(20,h*.14));
 }
 if(o.sheet==='medicalProps'&&o.asset===1)return box(w*.86,Math.min(52,h*.55));
 if(o.sheet==='medicalCart')return box(w*.74,Math.min(50,h*.42));
 if(o.sheet==='details'&&[1,3,7,9,10].includes(o.asset))return box(w*.70,Math.min(30,h*.38));
 if(o.sheet==='cityArchitectureV19'&&o.asset===0)return posts(w*.39,w*.14,Math.min(35,h*.14));
 // Window panels, bridge decks and door thresholds are decoration/passages, not solid rectangles.
 return [];
}
export function installPresentationPhysicsV281(RPG,{MAPS,SCENERY,aliases={},furniture=()=>[],invalidateGeometry=()=>{}}){
 const P=RPG.prototype;if(P.__physicalV281)return;Object.defineProperty(P,'__physicalV281',{value:true});
 const rawBlocked=P.blocked,rawLine=P.clearLine,rawMove=P.moveActor,rawPath=P.pathDirection,rawUpdate=P.update,rawEnter=P.enter,rawRestore=P.restore;
 const cache=new Map();
 function extras(g){
  const rows=SCENERY[g.map]||[],props=g.states?.[g.map]?.props||MAPS[g.map]?.props||[];
  let item=cache.get(g.map);
  if(!item||item.rows!==rows||item.props!==props||item.n!==rows.length||item.pn!==props.length){
   item={rows,props,n:rows.length,pn:props.length,solids:[...rows.flatMap((o,i)=>supplementalFootprintsV281(o).map(f=>({...f,id:f.id??`${g.map}:scenery:${i}`}))),...props.flatMap(p=>supplementalFootprintsV281(p).map(f=>({...f,prop:true})))]};cache.set(g.map,item);
  }return item.solids;
 }
 const alive=(g,o)=>!o.prop||(g.states?.[g.map]?.props||MAPS[g.map]?.props||[]).some(p=>p.id===o.id&&!p.broken&&(!p.used||g.questPropNeeded?.(p.id)));
 P.blocked=function(x,y,props=true){
  if(rawBlocked.call(this,x,y,props))return true;
  const radius=this.navigationRadiusV281||12;
  if(radius>12&&(MAPS[this.map]?.blocks||[]).some(b=>pointInFootBoxV281(x,y,b,radius)))return true;
  return [...extras(this),...(radius>12?furniture(this.map):[])].some(o=>alive(this,o)&&!this.geometryIgnoreV26?.has(o.id)&&pointInFootBoxV281(x,y,o.box,radius));
 };
 P.clearLine=function(a,b,props=true){
  if(!rawLine.call(this,a,b,props))return false;
  const radius=this.navigationRadiusV281||12;
  // Keep the authored human seat aperture (10/12 px). Only larger actor
  // navigation expands the legacy furniture segment tests to the actor radius.
  if(radius<=12)return true;
  return !(MAPS[this.map]?.blocks||[]).some(box=>segmentFootBoxV281(a,b,box,radius))&&
   ![...extras(this),...furniture(this.map)].some(o=>alive(this,o)&&!this.geometryIgnoreV26?.has(o.id)&&segmentFootBoxV281(a,b,o.box,radius));
 };
 function withActor(g,a,fn){const old=g.navigationRadiusV281;g.navigationRadiusV281=footRadiusV281(a,aliases);try{return fn();}finally{if(old===undefined)delete g.navigationRadiusV281;else g.navigationRadiusV281=old;}}
 P.moveActor=function(a,x,y,props=true){
  if(!a||![a.x,a.y,x,y].every(Number.isFinite))return;
  const ox=a.x,oy=a.y,walk=Number(a.walkDistance)||0;
  const result=withActor(this,a,()=>rawMove.call(this,a,x,y,props));
  const distance=Math.hypot(a.x-ox,a.y-oy);
  // Core V28 advances walkDistance only inside enemy AI; companions and generic NPCs also need it.
  if(distance>.001&&(Number(a.walkDistance)||0)===walk)a.walkDistance=walk+distance;
  return result;
 };
 P.pathDirection=function(a,target){return withActor(this,a,()=>rawPath.call(this,a,target));};
 P.presentationCollisionAuditV281=function(){return {map:this.map,supplemental:extras(this).filter(o=>alive(this,o)).map(o=>({id:o.id,box:[...o.box]}))};};
 P.update=function(dt,input){cache.delete(this.map);invalidateGeometry(this.map);return rawUpdate.call(this,dt,input);};
 function repair(g){
  if(!g.states?.[g.map])return;
  for(const a of new Set([g.p,g.saint,...(g.states[g.map].enemies||[]),...(g.activeMercenaries?.()||[])])){
   if(!a||a.dead||a.downed||a.visible===false||a.attachedTo||a.patientSurface||a.geometryTransferV26)continue;
   withActor(g,a,()=>{if(g.blocked(a.x,a.y,false)){const q=g.safePoint(a.x,a.y);a.x=q.x;a.y=q.y;}
    if(Number.isFinite(a.homeX)&&Number.isFinite(a.homeY)&&g.blocked(a.homeX,a.homeY,false)){const q=g.safePoint(a.homeX,a.homeY);a.homeX=q.x;a.homeY=q.y;}});
  }
  g.paths?.clear();
 }
 P.enter=function(...args){cache.clear();invalidateGeometry();const result=rawEnter.apply(this,args);cache.clear();invalidateGeometry();repair(this);return result;};
 P.restore=function(...args){cache.clear();invalidateGeometry();const result=rawRestore.apply(this,args);cache.clear();invalidateGeometry();repair(this);return result;};
}
