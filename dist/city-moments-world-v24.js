// Only reviewed, existing raster assets. Three local settings, no new map,
// portal, Boss, reward trigger, red carpet or geometric placeholder artwork.
import {CITY_FURNISHINGS_META_V19 as M} from './world-art-meta-v19.js';
const object=(id,sheet,asset,x,y,w,h,box=null,extra={})=>({id:'v24-moment-'+id,sheet,asset,x,y,w,h,flat:true,box,...extra});
const furnishing=(id,asset,x,y,w,box=null)=>object(id,'cityFurnishingsV19',asset,x,y,w,w*M[asset].sourceRect[3]/M[asset].sourceRect[2],box);
export const CITY_MOMENTS_SCENERY_V24={
 ch5GrandSquare:[furnishing('square-east-flower',7,1150,580,110,[1116,566,68,14]),furnishing('square-west-flower',7,470,570,105,[437,556,66,14]),furnishing('square-high-flowers',7,1220,366,100)],
 ch5Market:[object('book-table','world',9,700,440,155,60,[649,425,102,15]),object('book-volume','details',0,700,409,42,25,null,{depthY:441}),object('book-shelf','world',11,555,388,100,118,[526,373,58,15]),furnishing('book-flowers',7,920,390,105,[887,376,66,14])],
 ch5Forge:[object('lamp-workbench','world',9,565,620,150,60,[516,605,98,15]),object('lamp-return-table','world',9,690,785,76,45,[665,773,50,12]),furnishing('lamp-planter',7,940,695,95,[910,681,60,14]),object('lamp-object','world',14,855,674,37,100,[845,663,20,11],{momentLampV24:true})]
};
export function installCityMomentsWorldV24({MAPS,SCENERY,CH5_SCENERY}){
 for(const [map,objects]of Object.entries(CITY_MOMENTS_SCENERY_V24)){
  if(!MAPS[map])continue;SCENERY[map]||=[];
  for(const o of objects)if(!SCENERY[map].some(x=>x.id===o.id)){SCENERY[map].push(structuredClone(o));if(o.box)MAPS[map].blocks.push(structuredClone(o.box));}
  if(CH5_SCENERY)CH5_SCENERY[map]=structuredClone(SCENERY[map]);
 }
}

// Reuse the isolated lantern body in the already-loaded world atlas. This is
// runtime sprite sampling, not a modified image or a geometric lamp substitute.
// Rectangle checked on the actual 1254×1254 world-props source.
export const MOMENT_LAMP_SOURCE_V24=[793,986,61,103];
export function cityMomentLampPlacementV24(g,scene){
 const id=scene?.id,line=scene?.line??g?.pending?.line??0;
 if(id==='v24MomentLampB'){
  // The same lamp is in Saint's actual hand sprite. Never draw a second copy.
  if(line<13)return {where:'held'};
  // At the start of this beat Saint has already put the lantern down and her
  // hands are free for walking. Keep it visibly resting on the real side table
  // until the hanging/clearance action is finished; no disappearing handoff.
  if(line===13&&g?.pending?.phase==='action')return {where:'return-table',x:690,y:762,lit:true};
  return {where:'mounted',x:855,y:674};
 }
 if(id==='v24MomentLampA')return {where:'table',x:565,y:584,lit:line>=11};
 return g?.cityMomentsV24?.completed?.includes('lamp')?{where:'mounted',x:855,y:674}:{where:'table',x:565,y:584,lit:false};
}
const drawLampBody=(ctx,bank,at)=>{
 const source=bank.images.world;if(!source)return true;
 ctx.save();if(!at.lit)ctx.filter='saturate(0) brightness(.3)';ctx.imageSmoothingEnabled=true;
 ctx.drawImage(source,...MOMENT_LAMP_SOURCE_V24,at.x-8.5,at.y-28.7,17,28.7);ctx.restore();return true;
};
export function drawCityMomentSceneryV24(ctx,bank,o,g,scene){
 if(!o.momentLampV24&&o.id!=='v24-moment-lamp-return-table')return false;
 const at=cityMomentLampPlacementV24(g,scene);
 if(o.id==='v24-moment-lamp-return-table'){
  if(at.where!=='return-table')return false;
  // Draw body with its actual support, after the table. The lamp's usual
  // farther-away ground pivot must not sort it behind this foreground table.
  bank.draw(ctx,o.sheet,o.asset,o.x,o.y,o.w,o.h);return drawLampBody(ctx,bank,at);
 }
 if(at.where==='held'||at.where==='return-table')return true;
 if(at.where==='mounted'){bank.draw(ctx,'world',14,at.x,at.y,37,100);return true;}
 return drawLampBody(ctx,bank,at);
}
