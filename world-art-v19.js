import {CITY_ARCHITECTURE_META_V19,CITY_FURNISHINGS_META_V19} from './world-art-meta-v19.js';

const CITIES=new Set(['ch5CityGate','ch5GrandSquare','ch5Forge','ch5Tavern','ch5Arcade','ch5Reservoir','ch5Market','ch5LanternQuay','ch5NightMarket','ch5BellTerrace','ch5GuestRooms']);
const clone=v=>JSON.parse(JSON.stringify(v));
const drawing=(index,w)=>({sheet:'cityArchitectureV19',asset:index,w,h:w*CITY_ARCHITECTURE_META_V19[index].sourceRect[3]/CITY_ARCHITECTURE_META_V19[index].sourceRect[2]});
// Only artwork, material and descriptive atmosphere are replaced. Original collision
// boxes, doors, interaction coordinates and narrative staging remain authoritative.
export function registerCityArtV19({MAPS,SCENERY,CH5_SCENERY,CH5_GROUND_STYLE,V11_GROUND_STYLE}){
 if(MAPS.ch5CityGate?.cityArtV19)return;
 const set=(map,id,index,w)=>{const o=SCENERY[map]?.find(o=>o.id===id);if(o)Object.assign(o,drawing(index,w));};
 const native=(map,id,kind,w,h)=>{const o=SCENERY[map]?.find(o=>o.id===id);if(o)Object.assign(o,{rasterBackdropV20:kind,w,h});};
 const prop=(map,id,index,w)=>{const p=MAPS[map]?.props.find(p=>p.id===id);if(p)p.art={sheet:'cityArchitectureV19',index,w,h:w*CITY_ARCHITECTURE_META_V19[index].sourceRect[3]/CITY_ARCHITECTURE_META_V19[index].sourceRect[2]};};
 set('ch5CityGate','c5-cg-front',0,390);const gate=SCENERY.ch5CityGate.find(o=>o.id==='c5-cg-front');if(gate)gate.x=800;
 set('ch5CityGate','c5-cg-left',1,275);set('ch5CityGate','c5-cg-right',4,280);set('ch5CityGate','c5-cg-shop',5,230);
 set('ch5GrandSquare','c5-plaza-building1',1,285);set('ch5GrandSquare','c5-plaza-building2',1,305);set('ch5GrandSquare','c5-plaza-shop1',5,230);set('ch5GrandSquare','c5-plaza-shop2',4,210);
 native('ch5Forge','c5-forge-front','brick-wall',550,200);native('ch5Forge','c5-forge-shelf','tool-rack',245,190);prop('ch5Forge','ch5-class-forge',3,290);
 native('ch5Tavern','c5-tavern-window1','oak-window',260,185);native('ch5Tavern','c5-tavern-window2','oak-window',270,185);prop('ch5Tavern','ch5-tavern-bar',2,290);
 native('ch5Arcade','c5-arc-front','game-salon',610,185);
 set('ch5Reservoir','c5-water-wall1',4,340);native('ch5Reservoir','c5-water-wall2','ivory-arcade',245,190);
 set('ch5Market','c5-market-wall1',1,285);set('ch5Market','c5-market-wall2',5,280);set('ch5Market','c5-market-stall2',5,240);prop('ch5Market','ch5-market-shop',5,210);
 set('ch5LanternQuay','v18-quay-canopy',5,280);set('ch5LanternQuay','v18-quay-store',1,235);
 set('ch5NightMarket','v18-market-north-cloth',5,280);set('ch5NightMarket','v18-market-south-stall',5,275);set('ch5NightMarket','v18-market-east-cloth',5,290);set('ch5NightMarket','v18-market-little-forge',3,170);
 const furnishing=(map,id,index,w)=>{const o=SCENERY[map]?.find(o=>o.id===id);if(!o)return;delete o.nativeCityV19;delete o.rasterBackdropV20;Object.assign(o,{sheet:'cityFurnishingsV19',asset:index,w,h:w*CITY_FURNISHINGS_META_V19[index].sourceRect[3]/CITY_FURNISHINGS_META_V19[index].sourceRect[2]});};
 for(const map of CITIES)for(const o of SCENERY[map]){
  if(o.sheet==='cityWorld'&&o.asset===8)furnishing(map,o.id,1,o.w);
  if(o.sheet==='cityWorld'&&o.asset===11&&['ch5LanternQuay','ch5BellTerrace'].includes(map))furnishing(map,o.id,2,o.w);
  if(o.sheet==='cityWorld'&&o.asset===5&&map!=='ch5GrandSquare')furnishing(map,o.id,4,map==='ch5NightMarket'?46:48);
 }
 for(const map of CITIES)for(const p of MAPS[map].props)if(p.art?.sheet==='cityWorld'&&p.art.index===8&&!p.id.startsWith('v18-saint-story'))p.art={sheet:'cityFurnishingsV19',index:1,w:p.art.w,h:p.art.w*.71};
 furnishing('ch5Tavern','c5-tavern-window1',0,265);furnishing('ch5Tavern','c5-tavern-window2',0,275);
 furnishing('ch5NightMarket','v18-market-north-cloth',5,280);furnishing('ch5NightMarket','v18-market-east-cloth',5,290);
 furnishing('ch5LanternQuay','v18-quay-canopy',6,245);furnishing('ch5BellTerrace','v18-terrace-star-table',3,150);
 const stars=MAPS.ch5BellTerrace.props.find(p=>p.id==='v18-city-star-chart');if(stars)stars.nativeV18=true;
 for(const id of ['v18-city-chime','v18-city-bell-rope']){const bell=MAPS.ch5BellTerrace.props.find(p=>p.id===id);if(bell){bell.nativeV18=false;bell.art={sheet:'newProps',index:7,w:50,h:106};}}
 for(const id of ['ch5BellTerrace','ch5NightMarket','ch5Reservoir']){V11_GROUND_STYLE[id]={sheet:'terrain',base:id==='ch5BellTerrace'?12:0,paths:[],patches:[]};CH5_GROUND_STYLE[id]=clone(V11_GROUND_STYLE[id]);}
 for(const id of ['ch5Tavern','ch5GuestRooms']){V11_GROUND_STYLE[id]={sheet:'terrain',base:8,paths:[],patches:[]};CH5_GROUND_STYLE[id]=clone(V11_GROUND_STYLE[id]);}
 const rest=MAPS.ch5Tavern.props.find(p=>p.id==='ch5-tavern-bed');if(rest){rest.label='楼梯旁的歇脚长凳';rest.art={sheet:'world',index:10,w:148,h:55};rest.v13Bed=false;}
 for(const id of CITIES){MAPS[id].cityArtV19=true;CH5_SCENERY[id]=clone(SCENERY[id]);}
 MAPS.ch5Tavern.sub='酒香从弧形吧台后飘来。有人在木梁下弹琴，窗边的灯一直留着。';
 MAPS.ch5LanternQuay.sub='两座白石桥跨过暗河，灯火在桥洞下摇碎。雨棚后面，留着一段安静的石岸。';
 MAPS.ch5NightMarket.sub='布棚一顶接着一顶，烤饼摊前有人排队。纸灯下面，木环刚好套住了第三根小桩。';
}

// V20: semantic raster assets supply every piece of scenery. Canvas primitives
// remain only for non-object lighting/colour grades and texture clipping.
export function cityConversationSeatsV19(){return [];}
const frameRatio=(bank,sheet,index,w,fallback)=>{const f=bank.frame(sheet,index);return f?w*f.h/f.w:fallback;};
const sprite=(c,bank,sheet,index,x,y,w,h)=>bank.draw(c,sheet,index,x,y,w,h??frameRatio(bank,sheet,index,w,w));
export function drawNativeCitySceneryV19(c,bank,o){
 if(o.sheet==='cityArchitectureV19'&&o.asset===0){c.save();c.imageSmoothingEnabled=true;sprite(c,bank,o.sheet,o.asset,o.x,o.y,o.w,o.h);c.restore();return true;}
 const kind=o.rasterBackdropV20||o.nativeCityV19;if(!kind)return false;
 if(kind==='conversation-stool'||kind==='conversation-tea')return true;
 c.save();c.imageSmoothingEnabled=true;
 if(kind==='brick-wall')for(const dx of [-o.w*.34,0,o.w*.34])sprite(c,bank,'world',5,o.x+dx,o.y,o.w*.36,84);
 else if(kind==='tool-rack')sprite(c,bank,'newProps',3,o.x,o.y,o.w,o.h);
 else if(kind==='game-salon')for(const dx of [-o.w*.34,0,o.w*.34])sprite(c,bank,'cityFurnishingsV19',0,o.x+dx,o.y,o.w*.32);
 else if(kind==='oak-window')sprite(c,bank,'cityFurnishingsV19',0,o.x,o.y,o.w);
 else if(kind==='ivory-arcade')sprite(c,bank,'cityArchitectureV19',4,o.x,o.y,o.w);
 c.restore();return true;
}
function glow(c,x,y,r,color){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(230,190,126,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function grade(c,color){c.fillStyle=color;c.fillRect(0,0,1600,1080);}
function repeatRaster(c,bank,sheet,index,x,y,w,h,side=170,offset=0){
 const f=bank.frame(sheet,index);if(!f)return;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
 for(let yy=y-side+offset;yy<y+h;yy+=side)for(let xx=x;xx<x+w;xx+=side)c.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,xx,yy,side,side);
 c.restore();
}
function river(c,bank,time){
 c.save();c.filter='saturate(.38) brightness(.52)';repeatRaster(c,bank,'details',12,630,155,280,810,175,(time*3)%175);c.restore();
 // The two original collision apertures remain 295..435 and 645..790.
 for(const [foot,width]of [[417,316],[777,316]])sprite(c,bank,'cityArchitectureV19',6,770,foot,width,160);
 // Banks are real painted stonework and leave both bridge approaches open.
 for(const x of [620,910])for(const [y,h]of [[155,140],[435,210],[790,175]])repeatRaster(c,bank,'terrain',12,x,y,10,h,85);
 for(const [x,y]of [[575,293],[960,293],[575,645],[960,645]]){sprite(c,bank,'cityWorld',5,x,y,35,100);glow(c,x,y-74,45,'#efd69d28');}
}
function distantCity(c,bank){
 c.save();c.globalAlpha=.46;c.filter='saturate(.48) brightness(.65)';
 for(let i=0;i<12;i++)sprite(c,bank,'cityArchitectureV19',[1,4,1,5][i%4],70+i*138,195-(i%3)*10,140+(i%2)*30);
 c.restore();sprite(c,bank,'cityArchitectureV19',7,755,257,140,243);
}
function tavern(c,bank){
 for(const [x,w]of [[180,440],[975,440]])repeatRaster(c,bank,'terrain',8,x,70,w,126,145);
 for(const [x,y]of [[365,292],[1190,292],[680,680],[1050,550]])glow(c,x,y,165,'#e9b86724');
}
function room(c,bank){
 // Partition materials follow the unchanged room-wall collider coordinates.
 repeatRaster(c,bank,'terrain',8,250,95,1090,158,150);
 repeatRaster(c,bank,'terrain',8,650,215,32,360,100);
 repeatRaster(c,bank,'terrain',8,290,620,240,26,100);
 sprite(c,bank,'cityFurnishingsV19',0,450,241,188,151);
 sprite(c,bank,'cityFurnishingsV19',0,1135,252,188,151);
 sprite(c,bank,'newProps',1,330,745,155,160);
 glow(c,330,700,145,'#e9aa6526');
}
export function drawCityEnvironmentV19(c,bank,id,time,foreground=false,g=null){
 if(!CITIES.has(id))return;c.save();c.imageSmoothingEnabled=true;
 if(!foreground){
  if(['ch5LanternQuay','ch5BellTerrace','ch5NightMarket'].includes(id))grade(c,'#11243855');
  if(id==='ch5Reservoir')grade(c,'#28554b22');
  if(id==='ch5CityGate')for(const x of [583,1018])glow(c,x,318,110,'#e2bb6d32');
  else if(id==='ch5Forge')glow(c,970,340,260,'#f2a24a25');
  else if(id==='ch5Tavern')tavern(c,bank);
  else if(id==='ch5Arcade')glow(c,860,400,240,'#dabd6a23');
  else if(id==='ch5Reservoir'){glow(c,785,240,170,'#c3e2c31c');sprite(c,bank,'cityFurnishingsV19',7,365,468,210,131);}
  else if(id==='ch5LanternQuay')river(c,bank,time);
  else if(id==='ch5NightMarket')for(const [x,y,color]of [[380,600,'#ee9b4530'],[1170,480,'#df789f20'],[830,330,'#e7c78028']])glow(c,x,y,175,color);
  else if(id==='ch5BellTerrace')distantCity(c,bank);
  else if(id==='ch5GuestRooms')room(c,bank);
  if(g?.saintStoryTimeV18?.()==='morning')grade(c,id==='ch5GuestRooms'?'#ecdab816':'#b8c9ce08');
 }else if(['ch5NightMarket','ch5BellTerrace'].includes(id)){
  for(const [x,y]of id==='ch5NightMarket'?[[700,300],[960,845],[1330,590]]:[[405,605],[1195,845]])glow(c,x,y-49,52,'#e8ca8618');
 }
 c.restore();
}
