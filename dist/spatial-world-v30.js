import {SPATIAL_PLANS_V30,SPATIAL_MOVES_V30,SPATIAL_INTERIORS_V30,SPATIAL_TERRAIN_V30,NPC_DUTIES_V30} from './spatial-design-v30.js';
import {invalidateSceneGeometryV281} from './scene-geometry-v26.js';
import {clearEnemyCombatV9} from './enemy-ai-v14.js';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function move(o,x,y){const dx=x-o.x,dy=y-o.y;o.x=x;o.y=y;if(o.box)o.box=[o.box[0]+dx,o.box[1]+dy,...o.box.slice(2)];}
const tree=(id,x,y,w=175,h=220)=>({id,sheet:'world',asset:4,x,y,w,h,box:[x-20,y-24,40,24],purpose:'林缘保留的成簇乔木'});
const edges=[[0,0,1600,140],[0,980,1600,100],[0,140,120,840],[1480,140,120,840]];
// Small authored groves, never a scatter loop or an edge-filling grid.
const groves={town:[[185,265],[1400,870]],alley:[[220,800],[1370,250]],post:[[1370,270],[235,855]],manor:[[250,270],[1380,820]],exile:[[270,275],[335,310],[1390,885]],grove:[[245,255],[345,290],[1300,240],[1390,300],[285,885],[1375,910]]};
export function configureSpatialWorldV30({MAPS,SCENERY,BOUNDARIES,WATERS,BRIDGES}){
 if(MAPS.bridge.spatialV30)return;
 for(const [id,brief]of Object.entries(SPATIAL_PLANS_V30)){
  const m=MAPS[id],old=SCENERY[id],oldBoundary=BOUNDARIES[id]||[],oldWater=WATERS[id]||[];
  const inherited=(m.blocks||[]).filter(b=>!oldBoundary.some(q=>same(b,q))&&!oldWater.some(q=>same(b,q))&&!old.some(o=>o.box&&same(b,o.box)));
  SCENERY[id]=old.filter(o=>!o.id.startsWith('edge-tree-'));
  for(const [key,x,y]of SPATIAL_MOVES_V30[id]||[]){const o=SCENERY[id].find(o=>o.id===key);if(!o)throw Error(`Unknown spatial host ${id}:${key}`);move(o,x,y);}
  for(const [i,xy]of (groves[id]||[]).entries())SCENERY[id].push(tree('spatial-'+id+'-grove-'+i,...xy));
  if(!SPATIAL_INTERIORS_V30.has(id))BOUNDARIES[id]=edges.map(b=>[...b]);
  if(id==='bridge'){
   const remove=new Set(['v9-check-right-gate','v9-check-wall-west','v9-check-wall-west-end','v9-check-wall-east','v9-check-wall-north','v9-check-sacks-left','v9-ditch-stone-west','v9-ditch-stone-east','v9-ditch-trodden-grass']);
   SCENERY[id]=SCENERY[id].filter(o=>!remove.has(o.id));
   for(const [key,x,y]of [['v9-check-cart-west',340,320],['v9-check-desk',585,320],['v9-check-left-gate',620,370],['v9-check-cart-east',1120,300],['v9-check-cargo-stack',1290,350],['v9-check-sacks-east',1320,430],['bridge-cart-s',1390,825],['v9-ditch-tree-west',215,910],['v9-ditch-fallen-log',405,960],['v9-ditch-tree-east',1415,950]])move(SCENERY[id].find(o=>o.id===key),x,y);
   SCENERY[id].push(tree('spatial-bridge-shade',250,265),tree('spatial-bridge-wet-bank',650,850,145,190));
   move(SCENERY[id].find(o=>o.id==='v9-check-lamp'),900,435);
   WATERS[id]=[]; // River polygons are shared by spatial-ground and terrainBlocked.
   BRIDGES[id]={x:670,y:450,w:225,h:220,orientation:'east-west'};
   SCENERY[id].push({id:'spatial-bridge-front',sheet:'spatialBridgeFront',asset:0,x:782.5,y:670,w:225,h:77,box:[674,645,217,25],purpose:'桥南侧实体护栏；按脚底深度遮住桥上人物足部'});
   const ids=['v9-civilian-01','v9-civilian-03','v9-civilian-06','v9-civilian-10','v9-civilian-11','v9-civilian-12'];m.ambientActors=m.ambientActors.filter(a=>ids.includes(a.id));
   m.safeZones=[[150,250,550,400],[850,220,610,470]];m.sub='宽桥连起查验湾与庄园道；南侧荒沟通向弃车和桥下旧税库';
   const south=[[365,800],[535,830],[470,745],[1020,785],[1280,850],[1170,745],[955,875]];m.spawns=m.spawns.map((s,i)=>[s[0],...south[i],s[3]]);
   m.encounters.forEach((group,i)=>{group.bounds=i?[900,715,460,225]:[225,705,415,225];group.activationBounds=i?[865,700,570,250]:[180,690,490,260];group.leashBounds=[...group.activationBounds];group.returnToDitchV30=true;});
   Object.assign(m.props.find(p=>p.id==='v9-bridge-water'),{x:1040,y:460});
  }
  if(BRIDGES[id])BRIDGES[id].orientation='east-west';
  if(id==='town')Object.assign(m.props.find(p=>p.id==='well'),{interactX:900,interactY:745});
  if(id==='grove')WATERS[id]=[];
  if(id==='hellFerry')WATERS[id]=[[135,150,100,395],[235,150,205,90]];
  for(const a of [...m.npcs,...(m.ambientActors||[])]){const d=NPC_DUTIES_V30[id+':'+a.id];if(d){[a.x,a.y,,a.angle]=d.stops[0];a.dutyV30=d.role;}}
  m.blocks=[...(BOUNDARIES[id]||[]),...inherited,...SCENERY[id].filter(o=>o.box).map(o=>[...o.box]),...(WATERS[id]||[])];m.spatialV30=1;m.spatialPurposeV30=brief.purpose;
 }invalidateSceneGeometryV281();
}
const living=new WeakMap();
export function terrainBlockedV30(id,x,y,pad=12){
 return (SPATIAL_TERRAIN_V30[id]||[]).some(({points})=>{
  let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
   const [ax,ay]=points[j],[bx,by]=points[i],dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
   if(Math.hypot(x-ax-t*dx,y-ay-t*dy)<pad)return true;
   if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  }return inside;
 });
}
function duties(g,map,actors){
 let maps=living.get(g);if(!maps){maps=new Map();living.set(g,maps);}let state=maps.get(map);if(!state){state=new Map();maps.set(map,state);}
 return actors.map(a=>{const config=NPC_DUTIES_V30[map+':'+a.id];const pose=g.npcPoses?.[map+':'+a.id];if(!config||Number.isFinite(pose?.x)||Number.isFinite(pose?.y))return a;
  let actor=state.get(a.id);if(!actor){actor={...a,stop:0,pause:config.stops[0][2],walkDistance:0,moving:false};state.set(a.id,actor);}return {...a,...actor,...pose,moving:pose?false:actor.moving};});
}
export function ambientActorsV30(g,map=g.map){return duties(g,map,g.spatialMapsV30?.[map]?.ambientActors||[]);}
export function installSpatialLifeV30(RPG,{MAPS}){
 const P=RPG.prototype;if(P.__spatialLifeV30)return;Object.defineProperty(P,'__spatialLifeV30',{value:true});Object.defineProperty(P,'spatialMapsV30',{value:MAPS});
 const npcs=Object.getOwnPropertyDescriptor(P,'npcs').get,ensure=P.ensureMap,restore=P.restore,update=P.update;
 const blocked=P.blocked;P.blocked=function(x,y,...args){return MAPS[this.map]?.spatialV30&&terrainBlockedV30(this.map,x,y,this.navigationRadiusV281||12)||blocked.call(this,x,y,...args);};
 Object.defineProperty(P,'npcs',{configurable:true,get(){return duties(this,this.map,npcs.call(this));}});
 function migrate(g,id){const st=g.states[id],m=MAPS[id];if(!st||!SPATIAL_PLANS_V30[id]||st.spatialV30===1)return;
  if(id==='bridge')for(const e of st.enemies){const spawn=m.spawns.find(s=>s[3]===e.id),group=m.encounters.find(v=>v.spawnIds.includes(e.id));if(!spawn)continue;
   if(!e.dead)Object.assign(e,{x:spawn[1],y:spawn[2],homeX:spawn[1],homeY:spawn[2],roamTarget:null,wind:0,telegraph:null,action:null,aiState:'IDLE'});
   if(group)Object.assign(e,{leashBounds:[...group.leashBounds],activationBounds:[...group.activationBounds]});
  }st.spatialV30=1;
 }
 P.ensureMap=function(id){const result=ensure.call(this,id);migrate(this,id);return result;};
 P.restore=function(...args){living.delete(this);const result=restore.apply(this,args);for(const id of Object.keys(this.states))migrate(this,id);return result;};
 P.update=function(dt,...args){
  // The inhabited traffic corridor is a sanctuary. The ordinary proximity grace
  // must not allow ditch packs to follow a stopped traveler into the guard bay.
  if(this.active&&!this.pending)for(const group of MAPS[this.map]?.encounters||[]){if(!group.returnToDitchV30)continue;const [x,y,w,h]=group.activationBounds;
   if(this.p.x>=x&&this.p.x<=x+w&&this.p.y>=y&&this.p.y<=y+h)continue;
   for(const e of this.enemies)if(group.spawnIds.includes(e.id)&&!e.dead&&['COMBAT','ALERT'].includes(e.aiState)){clearEnemyCombatV9(e,this);e.aiState='RETURNING';e.returning=true;}
  }
  const result=update.call(this,dt,...args);if(!SPATIAL_PLANS_V30[this.map])return result;
  const actors=[...duties(this,this.map,npcs.call(this)),...ambientActorsV30(this)],state=living.get(this)?.get(this.map);
  for(const a of actors){const config=NPC_DUTIES_V30[this.map+':'+a.id],actor=state?.get(a.id);if(!config||!actor)continue;actor.moving=false;
   if(!this.active||this.pending||this.transition||this.npcPoses?.[this.map+':'+a.id])continue;
   if(distance(actor,this.p)<85){actor.angle=Math.atan2(this.p.y-actor.y,this.p.x-actor.x);continue;}
   if(actor.pause>0){actor.pause-=dt;continue;}if(!config.speed)continue;
   const next=config.stops[(actor.stop+1)%config.stops.length],goal={x:next[0],y:next[1]};
   if(distance(actor,goal)<5){actor.stop=(actor.stop+1)%config.stops.length;actor.pause=next[2];actor.angle=next[3];continue;}
   const direction=this.pathDirection(actor,goal),step=Math.min(.1,dt)*config.speed,q={x:actor.x+direction.x*step,y:actor.y+direction.y*step};
   if(actors.some(other=>other.id!==actor.id&&distance(other,q)<30)||distance(this.p,q)<55)continue;
   this.moveActor(actor,q.x,q.y);if(actor.moving)actor.angle=Math.atan2(direction.y,direction.x);else actor.pause=1;
  }return result;
 };
}
