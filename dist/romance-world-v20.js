import {ROMANCE_PROPS_META_V20} from './romance-props-meta-v20.js';
export const ROMANCE_PROP_LOAD_V20=['romancePropsV20','assets/v20/romance-props-v20.png',4,2,false];
const meta=ROMANCE_PROPS_META_V20.items;
const object=(id,index,x,y,w,extra={})=>({id,sheet:'romancePropsV20',asset:index,x,y,w,h:w*meta[index].sourceRect[3]/meta[index].sourceRect[2],flat:true,...extra});
const world=(id,sheet,asset,x,y,w,h,extra={})=>({id,sheet,asset,x,y,w,h,flat:true,...extra});
export function romancePointV20(o,point){const m=meta[o.asset],k=o.w/m.sourceRect[2];return [o.x+(point[0]-m.anchorInSourceRect[0])*k,o.y+(point[1]-m.anchorInSourceRect[1])*k];}
// Objects are positioned from the required hand/eye contact, then converted to a ground pivot.
const contactObject=(id,index,w,local,target,extra={})=>{const m=meta[index],k=w/m.sourceRect[2];return object(id,index,target[0]-(local[0]-m.anchorInSourceRect[0])*k,target[1]-(local[1]-m.anchorInSourceRect[1])*k,w,extra);};
const rolling=contactObject('v20-world-bell-ball-table',0,146,[39,140],[764,458],{depthY:500});
const garden=contactObject('v20-world-potting-bench',2,100,[214,212],[555,399],{depthY:440});
const telescope=contactObject('v20-world-telescope',7,112,[20,157],[570,351],{depthY:410});
export const ROMANCE_WORLD_ANCHORS_V20={
 arcade:{heroFeet:[755,505],saintFeet:[900,505],leftKnob:romancePointV20(rolling,[39,140]),rightKnob:romancePointV20(rolling,[349,155]),ball:romancePointV20(rolling,[223,163]),tableFoot:[rolling.x,rolling.y]},
 garden:{heroFeet:[540,430],saintFeet:[605,435],workSurface:romancePointV20(garden,[214,212]),tableFoot:[garden.x,garden.y]},
 market:{saintFeet:[1155,620],throwTarget:[1170,524]},
 stars:{saintFeet:[570,420],eye:[570,351],eyepiece:romancePointV20(telescope,[20,157]),objective:romancePointV20(telescope,[302,56]),recommendedFacing:[620,325],stool:[500,510]},
 arcadeBalcony:{heroFeet:[1350,700],saintFeet:[1415,700],focus:[1380,660],lookAt:[1510,620],waterBounds:[1470,150,130,815],note:'Water uses the existing non-walkable eastern boundary; no reachable pavement becomes water.'}
};
const SCENERY_V20={
 ch5Tavern:[world('v20-world-tavern-small-table','world',9,985,670,76,50,{depthY:670}),object('v20-world-tavern-bread',5,987,637,27,{depthY:671})],
 ch5Arcade:[rolling,
  {id:'v20-world-arcade-canal',romanceWaterV20:true,x:1470,y:150,w:130,h:815,depthY:-100,flat:true},
  world('v20-world-arcade-wood-rail','world',6,1385,720,155,60,{depthY:720}),
  world('v20-world-arcade-flower-box','cityFurnishingsV19',7,1365,805,135,84),
  world('v20-world-arcade-balcony-lamp','cityWorld',5,1390,565,45,112),
  world('v20-world-arcade-small-tea-table','world',9,1080,677,78,48),
  object('v20-world-arcade-bread',5,1080,641,26,{depthY:678})],
 ch5Reservoir:[garden,world('v20-world-garden-extra-planter','cityFurnishingsV19',7,440,370,118,74)],
 ch5NightMarket:[object('v20-world-ring-stand',1,1170,588,150,{depthY:589}),object('v20-world-bird-prize',3,1240,554,27,{depthY:590})],
 ch5BellTerrace:[telescope,world('v20-world-star-stool','actors',13,500,510,39,63,{depthY:510})]
};
// This function is deliberately art-only: it never touches blocks, doors, entry,
// spawns or interaction coordinates. Added furniture is persistent scenery.
export function installRomanceWorldV20({MAPS,SCENERY}){
 for(const [id,rows]of Object.entries(SCENERY_V20)){if(!MAPS[id])continue;SCENERY[id]||=[];for(const row of rows)if(!SCENERY[id].some(o=>o.id===row.id))SCENERY[id].push(structuredClone(row));}
 const oldBench=SCENERY.ch5BellTerrace?.find(o=>o.id==='v18-terrace-bench');if(oldBench)Object.assign(oldBench,{sheet:'cityFurnishingsV19',asset:7,w:160,h:100});
 const machine=MAPS.ch5Arcade?.props.find(p=>p.id==='ch5-arcade-machine');if(machine)machine.nativeV18=true;
 const linen=SCENERY.ch5GuestRooms?.find(o=>o.id==='v18-room-linen');if(linen)Object.assign(linen,object(linen.id,6,linen.x,linen.y,70));
 const chime=MAPS.ch5BellTerrace?.props.find(p=>p.id==='v18-city-chime');if(chime){chime.nativeV18=false;chime.art={sheet:'romancePropsV20',index:4,w:88,h:88*meta[4].sourceRect[3]/meta[4].sourceRect[2]};}
 const bread=MAPS.ch5NightMarket?.props.find(p=>p.id==='v18-city-market-samples');if(bread){bread.art={sheet:'romancePropsV20',index:5,w:38,h:38*meta[5].sourceRect[3]/meta[5].sourceRect[2]};bread.depthY=351;}
}
export function installRomanceWorldFramesV20(bank,name){if(name!=='romancePropsV20')return;bank.frames[name]=meta.map(m=>({x:m.sourceRect[0],y:m.sourceRect[1],w:m.sourceRect[2],h:m.sourceRect[3],cell:{x:m.sourceRect[0],y:m.sourceRect[1],w:m.sourceRect[2],h:m.sourceRect[3]},meta:m}));}
export function drawRomanceFrameV20(c,bank,name,index,x,y,w){if(name!=='romancePropsV20')return false;const m=meta[index],im=bank.images[name];if(!m||!im)return true;const [sx,sy,sw,sh]=m.sourceRect,[ax,ay]=m.anchorInSourceRect,k=w/sw;c.save();c.imageSmoothingEnabled=true;c.drawImage(im,sx,sy,sw,sh,x-ax*k,y-ay*k,sw*k,sh*k);c.restore();return true;}
export function drawRomancePropV20(c,bank,o){
 if(o.romanceWaterV20){const f=bank.frame('details',12);if(!f)return true;c.save();c.beginPath();c.rect(o.x,o.y,o.w,o.h);c.clip();c.filter='saturate(.32) brightness(.52)';for(let y=o.y;y<o.y+o.h;y+=145)c.drawImage(bank.images.details,f.x,f.y,f.w,f.h,o.x,y,o.w,145);c.restore();return true;}
 return drawRomanceFrameV20(c,bank,o.sheet,o.asset??o.index,o.x,o.y,o.w);
}
// For old saved map snapshots, use this before ordinary actionPropArt handling.
export function romanceActionArtV20(p){if(p.id==='ch5-arcade-machine')return null;if(p.id==='v18-city-chime')return {sheet:'romancePropsV20',index:4,w:88,h:99.12};if(p.id==='v18-city-market-samples')return {sheet:'romancePropsV20',index:5,w:38,h:26.15};return undefined;}
