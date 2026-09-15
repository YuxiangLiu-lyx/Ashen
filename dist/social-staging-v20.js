import {drawCalmSocialHeroV24} from './movement-v24.js';
import {heroSocialFrameV23,movementRenderAngleV23} from './movement-v23.js';
export const SOCIAL_BENCH_LOAD_V20=['socialBenchesV20','assets/v20/social-benches-v20.png',2,1,true];
import {SOCIAL_COMPANION_META_V20} from './social-companion-meta-v20.js';
import {SOCIAL_ART_META_V20} from './social-art-meta-v20.js';

export const SOCIAL_COMPANION_LOAD_V20=['socialCompanionsV20','assets/v20/social-companions-v20.png',1,1,true];
const benchPoses=new Set(['bench-wood','bench-stone']);
const benchGap=150*84/410;
export const SOCIAL_ART_LOAD_V20=['socialActionsV20','assets/v20/social-actions-v20.png',1,1,true];
const OPTIONAL=/^(v18Saint|v19Discovery|v20Romance|v22CityArrival|v24Moment|c[67]v25|v25C8|c[678]v26)/;
const seated=new Set(['seated','sit','drink','listen','seated-listen']);
const emptyGestures=new Set(['offer','work','gesture','pour','welcome','tired']);
const immobile=new Set(['lying','sleep','sleep-bed','carried']);
const clone=x=>structuredClone(x);
const xy=(x,y)=>({x,y});
const legacySeats={Cards:[[630,620],[745,620]],Cups:[[940,660],[1030,655]],Past:[[835,705],[920,710]],Rain:[[485,345],[540,345]],Bread:[[1050,790],[1130,790]],Lantern:[[1010,800],[950,790]],Care:[null,[940,580]],Morning:[null,[1030,550]],Practice:[null,[540,685]]};

export function socialSeatDefinitionsV20(stage,id){
 if(stage.seatsV20)return clone(stage.seatsV20);
 const group=Object.keys(legacySeats).find(key=>id.startsWith('v18Saint'+key));
 if(!group)return [];
 return legacySeats[group].flatMap((p,i)=>p?[{id:'v20-seat-'+group+'-'+i,actor:i?'saint':'hero',x:p[0],y:p[1],flip:false}]:[]);
}
function cleanMeta(meta){
 const result={...meta};
 if(emptyGestures.has(result.pose))result.pose='stand';
 if(result.pose==='stand'){result.autoFace=true;result.poseFlip=null;result.depthY=null;}
 // Old care is an empty two-hand gesture; the actual needle action is shown in its illustration.
 if(result.pose==='care')result.pose='seated';
 return result;
}

// All edits are to the Cinematic's cloned stage. Stable scene IDs, save rows, and registry definitions remain intact.
export function prepareSocialStageV20(stage,g,id){
 if(!stage||!OPTIONAL.test(id))return stage;
 stage.socialV20=true;stage.seatsV20=socialSeatDefinitionsV20(stage,id);stage.actorMeta||={};
 const positions=Object.fromEntries(Object.entries(stage.actors).map(([key,p])=>[key,xy(...p)]));
 const current={};
 for(const key of ['hero','saint'])if(stage.actors[key]){
  const m=stage.actorMeta[key]=cleanMeta({...stage.actorMeta[key],socialV20:true,hideWeapon:true});
  current[key]=m.pose||'stand';const seat=stage.seatsV20.find(s=>s.actor===key);
  if(seat&&seated.has(m.pose)){stage.actors[key]=[seat.x,seat.y];positions[key]=xy(seat.x,seat.y);m.poseFlip=seat.flip;}
 }
 for(const b of stage.beats||[]){
  b.moves||=[];b.actorMeta||={};
  const propPose=id==='v18SaintRiddleA'&&[0,8].includes(b.line)?'hold-ring':id==='v18SaintMarketB'&&[9,13].includes(b.line)?'hold-bread':id==='v18SaintLanternA'&&[0,3,8].includes(b.line)||id==='v18SaintWorkshopB'&&b.line===9?'hold-lantern':null;
  if(propPose)b.actorMeta.saint={...b.actorMeta.saint,pose:propPose};
  for(const key of ['hero','saint'])if(b.actorMeta[key])b.actorMeta[key]=cleanMeta({...b.actorMeta[key],socialV20:true,hideWeapon:true});
  for(const [key,meta] of Object.entries(b.actorMeta)){if(Number.isFinite(meta.x)&&Number.isFinite(meta.y))positions[key]=xy(meta.x,meta.y);}
  if(benchPoses.has(b.actorMeta.hero?.pose)&&b.actorMeta.saint?.pose===b.actorMeta.hero.pose){
   const h=b.moves.filter(m=>m[0]==='hero').at(-1),s=b.moves.filter(m=>m[0]==='saint').at(-1);
   if(s){s[1]=(h?h[1]:positions.hero.x)+benchGap;s[2]=h?h[2]:positions.hero.y;}
  }
  const pickup=b.actorMeta.hero?.pose==='carry'&&b.actorMeta.saint?.pose==='carried';
  const laydown=current.hero==='carry'&&current.saint==='carried'&&['lying','sleep','sleep-bed'].includes(b.actorMeta.saint?.pose);
  if(pickup||laydown)for(const key of ['hero','saint']){
   const last=b.moves.filter(m=>m[0]===key).at(-1);if(!last)continue;
   last[5]={...last[5],...b.actorMeta[key]};
   b.actorMeta[key]={...b.actorMeta[key],pose:laydown?(key==='hero'?'carry':'carried'):'stand'};
  }
  const movingKeys=[...new Set(b.moves.map(m=>m[0]).filter(k=>k==='hero'||k==='saint'))];
  for(const key of movingKeys){
   const intended=b.actorMeta[key]?.pose;
   if(immobile.has(intended)||intended==='carry'||current[key]==='carry'&&intended===undefined||current[key]==='carried'&&intended===undefined)continue;
   const own=b.moves.filter(m=>m[0]===key),last=own.at(-1),seat=stage.seatsV20.find(s=>s.actor===key);
   const goalMeta=cleanMeta({...(intended?{pose:intended}: {}),...last[5]});
   if(seated.has(goalMeta.pose)&&seat){last[1]=seat.x;last[2]=seat.y;goalMeta.poseFlip=seat.flip;}
   // A walking actor cannot retain a chair, raised mug, or stretching pose.
   b.actorMeta[key]={...(b.actorMeta[key]||{}),pose:'stand',socialV20:true,hideWeapon:true};
   if(Object.keys(goalMeta).length)last[5]=goalMeta;
  }
  // V26 resolves every real move against furniture and other actors in Cinematic.move.
  for(const [key,x,y]of b.moves)positions[key]=xy(x,y);
  for(const key of ['hero','saint']){
   if(b.actorMeta[key]?.pose)current[key]=b.actorMeta[key].pose;
   const last=b.moves.filter(m=>m[0]===key).at(-1);if(last?.[5]?.pose)current[key]=last[5].pose;
  }
  if(current.hero==='carry'&&current.saint==='carried')positions.saint={...positions.hero};
  if(benchPoses.has(current.hero)&&current.saint===current.hero)positions.saint={x:positions.hero.x+benchGap,y:positions.hero.y};
  // Give prop/pose-only beats real action time. An explicit zero remains possible for a pure facing correction.
  if(b.hold===undefined&&Object.values(b.actorMeta).some(m=>m.pose&&m.pose!=='stand'))b.hold=.55;
 }
 return stage;
}

// One root actor owns both bodies during carrying. Repeating this on seek/restore is idempotent.
export function syncSocialActorsV20(cine){
 if(!cine?.stage?.socialV20)return;
 const hero=cine.get('hero'),saint=cine.get('saint');if(!hero||!saint)return;hero.benchCompositeReadyV20=false;
 if(hero.pose==='carry'&&saint.pose==='carried'){
  saint.compositeParentV20='hero';saint.x=hero.x;saint.y=hero.y;saint.angle=hero.angle;saint.moving=hero.moving;saint.walkDistance=hero.walkDistance;
 }else if(benchPoses.has(hero.pose)&&saint.pose===hero.pose&&!hero.moving&&!saint.moving){
  hero.benchCompositeReadyV20=true;saint.compositeParentV20='hero';saint.x=hero.x+benchGap;saint.y=hero.y;saint.moving=false;
 }else delete saint.compositeParentV20;
}

function raster(c,bank,index,x,y,{size=84,flip=false,width=null,companion=false}={}){
 const image=bank.images[companion?'socialCompanionsV20':'socialActionsV20'];if(!image)return false;
 const m=(companion?SOCIAL_COMPANION_META_V20:SOCIAL_ART_META_V20).items[index],[sx,sy,sw,sh]=m.sourceRect,[ax,ay]=m.anchor,k=width?width/sw:size/m.referenceHeight;
 c.save();c.translate(Math.round(x),Math.round(y));if(flip)c.scale(-1,1);c.imageSmoothingEnabled=true;
 c.drawImage(image,sx,sy,sw,sh,-ax*k,-ay*k,sw*k,sh*k);c.restore();return true;
}

export function drawSocialActorV20(c,bank,actor,time=0,extra={}){
 if(actor.compositeParentV20)return true;
 if(!(extra.socialV20??actor.socialV20))return false;
 const key=extra.socialActorV20??(actor.id==='saint'||actor.cls==='saint'?'saint':'hero'),pose=extra.pose??actor.pose;
 const x=extra.x??actor.x,y=extra.y??actor.y,moving=extra.moving??actor.moving;
 const flip=typeof extra.poseFlip==='boolean'?extra.poseFlip:typeof actor.poseFlip==='boolean'?actor.poseFlip:(Math.cos(movementRenderAngleV23(actor,extra))<0)!==(key==='saint');
 let index=null;
 if(key==='hero'&&benchPoses.has(pose)&&!moving&&(extra.benchCompositeReadyV20??actor.benchCompositeReadyV20))return raster(c,bank,pose==='bench-wood'?6:7,x,y,{size:extra.size||84,companion:true});
 if(key==='hero'&&!['carry',...seated].includes(pose)){
  if(drawCalmSocialHeroV24(c,bank,actor,extra))return true;
  const frame=heroSocialFrameV23(actor,extra);
  return raster(c,bank,frame.index,x,y,{size:extra.size||84,flip:frame.flip,companion:true});
 }

 if(key==='hero'&&pose==='carry')index=moving?5+Math.floor(Math.abs(extra.walkDistance??actor.walkDistance??(extra.anim||0)*18)/15)%2:4;
 else if(!moving&&seated.has(pose))index=key==='saint'?(pose==='drink'?3:2):(pose==='drink'?1:0);
 else if(key==='saint'&&!moving)index={'hold-lantern':8,'hold-bread':9,'hold-ring':10}[pose]??null;
 if(pose==='sleep-bed'&&actor.bedWorldV20){const b=actor.bedWorldV20;return raster(c,bank,7,b.x,b.y,{width:b.width||180,flip:!!b.flip});}
 if(index===null)return false;
 return raster(c,bank,index,x,y,{size:extra.size||84,flip});
}

// Persistent furniture definitions can be installed once into the map registry. They are independent of moving actor positions.
function benchDefinition(stage,id){
 if(!stage.benchV20)return null;
 const b=typeof stage.benchV20==='object'?stage.benchV20:{},seat=stage.seatsV20?.find(s=>s.actor==='hero');
 const p=stage.actors?.hero;
 return {id:'v20-fixed-bench-'+stage.map+'-'+(b.x??seat?.x??p?.[0]),x:b.x??seat?.x??p?.[0],y:b.y??seat?.y??p?.[1],type:b.type||(id.includes('Stars')?'stone':'wood'),socialFurnitureV20:true,benchV20:true,flat:true};
}
export function socialFurnitureForStageV20(stage,id){
 if(!stage||!OPTIONAL.test(id))return [];
 const bench=benchDefinition(stage,id);if(bench)return [{...bench,depthY:bench.y-.5}];
 return socialSeatDefinitionsV20(stage,id).map(seat=>({id:'v20-fixed-seat-'+stage.map+'-'+seat.x+'-'+seat.y,actor:seat.actor,x:seat.x,y:seat.y,w:39,h:63,depthY:seat.y-.5,sheet:'actors',asset:13,flat:true,socialFurnitureV20:true,flip:seat.flip}));
}
export function installSocialFurnitureV20(stages,scenery){
 for(const [id,stage]of Object.entries(stages).filter(([id])=>id.startsWith('v20Romance')))for(const o of socialFurnitureForStageV20(stage,id)){
  const list=scenery[stage.map];if(list&&!list.some(p=>p.id===o.id))list.push(o);
 }
}
export function socialFurnitureV20(cine){
 if(!cine?.stage?.socialV20)return [];
 return socialFurnitureForStageV20(cine.stage,cine.id);
}
export function drawSocialFurnitureV20(c,bank,o,actors=[]){
 if(!o.socialFurnitureV20)return false;
 const people=Array.isArray(actors)?actors:[];
 if(o.benchV20){
  if(people.some(a=>a.id==='hero'&&a.visible&&!a.moving&&a.benchCompositeReadyV20&&benchPoses.has(a.pose)&&Math.hypot(a.x-o.x,a.y-o.y)<3))return true;
  const index=o.type==='stone'?1:0,f=bank.frame('socialBenchesV20',index),im=bank.images.socialBenchesV20;if(!f||!im)return true;
  const k=84/410,left=(index?111:123)*k,top=(index?141:144)*k,w=(index?380:388)*k,h=(index?124:120)*k;
  c.drawImage(im,f.x,f.y,f.w,f.h,o.x-left,o.y-top,w,h);return true;
 }
 if(people.some(a=>a.visible&&!a.moving&&seated.has(a.pose)&&Math.hypot(a.x-o.x,a.y-o.y)<3))return true;
 c.save();c.translate(o.x,o.y);if(o.flip)c.scale(-1,1);bank.draw(c,'actors',13,0,0,o.w,o.h);c.restore();return true;
}
