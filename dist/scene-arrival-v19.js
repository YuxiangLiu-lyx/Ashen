// Only optional V19 encounters opt into this physical arrival. Existing story scenes and V18 saves without an origin retain their staging.
const copy=x=>structuredClone(x),point=xy=>({x:xy[0],y:xy[1]});
const valid=xy=>Array.isArray(xy)&&xy.length===2&&xy.every(Number.isFinite)&&xy[0]>=135&&xy[0]<=1465&&xy[1]>=155&&xy[1]<=965;
export function prepareSceneArrivalV19(stage,g,id){
 const origin=g.pending?.sceneOrigin;
 if(!stage||stage.map!==g.map||g.pending?.id!==id||!origin||!(/^(v18Saint|v19Discovery|v20Romance|v22CityArrival|v24Moment|c[67]v25|v25C8|c[678]v26)/.test(id)))return stage;
 const arrivals=[],restore={},originalZero=stage.beats?.find(b=>b.line===0),zero=originalZero?copy(originalZero):{line:0,moves:[]};let duration=0;
 // Plan both paths before changing actors, so an invalid imported origin never leaves a half-modified stage.
 for(const key of ['hero','saint']){
  if(!valid(origin[key])||!valid(stage.actors?.[key])||stage.initiallyHidden?.includes(key))continue;
  const from=point(origin[key]),goal=point(stage.actors[key]);if(g.blocked(from.x,from.y)||g.blocked(goal.x,goal.y))continue;
  const path=g.routeTo(goal,from);if(!path.length&&Math.hypot(goal.x-from.x,goal.y-from.y)>1)continue;
  const plan=[];let previous=from,elapsed=0;
  for(const target of path){const distance=Math.hypot(target.x-previous.x,target.y-previous.y);if(distance<.1)continue;
   if(!g.clearLine(previous,target))throw new Error('偶遇入场路线穿过了障碍。');
   const seconds=Math.max(.03,distance/175);plan.push([key,target.x,target.y,seconds,elapsed]);elapsed+=seconds;previous=target;
  }
  if(!plan.length)continue;
  const meta={...(stage.actorMeta?.[key]||{}),...(zero.actorMeta?.[key]||{})};
  plan.at(-1).push(meta);restore[key]={origin:[...origin[key]],meta};arrivals.push(...plan);duration=Math.max(duration,elapsed);
 }
 if(!arrivals.length)return stage;
 stage.actorMeta||={};zero.actorMeta||={};
 for(const [key,{origin:from}]of Object.entries(restore)){
  stage.actors[key]=from;stage.actorMeta[key]={...(stage.actorMeta[key]||{}),pose:'stand'};
  // Sitting and other opening poses begin only when the actor reaches their place.
  delete zero.actorMeta[key];
 }
 zero.moves=[...arrivals,...(zero.moves||[]).map(move=>{const m=[...move];m[4]=(Number(m[4])||0)+duration;return m;})];
 if(zero.cue)zero.cueDelay=(zero.cueDelay||0)+duration;
 stage.beats=[zero,...(stage.beats||[]).filter(b=>b.line!==0)];
 stage.arrivalV19={duration,origins:copy(origin),actors:Object.keys(restore),segments:arrivals.length};
 return stage;
}

// Return the optional scene's standing companion to the same world position.
// Supported bed/carry poses are visual body anchors, never ordinary follower feet.
export function commitOptionalCompanionV19(cine){
 const g=cine?.g,a=cine?.get?.('saint');
 if(!g||cine.map!==g.map||!/^(v18Saint|v19Discovery|v20Romance|v22CityArrival|v24Moment|c[67]v25|v25C8|c[678]v26)/.test(cine.id)||!a?.visible||a.fall||a.renderAs==='prop'||['lying','sleep','carried'].includes(a.pose)||!Number.isFinite(a.x)||!Number.isFinite(a.y)||g.blocked(a.x,a.y))return false;
 Object.assign(g.saint,{x:a.x,y:a.y,angle:a.angle||0,visible:true,moving:false,entry:null});
 return true;
}
