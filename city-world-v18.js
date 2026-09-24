// V18 city extension. All coordinates are feet in the existing 1600 × 1080 world.
// Four connected streets add traversable area without changing any Boss map.
const clone=v=>JSON.parse(JSON.stringify(v));
const door=(x,y,to,tx,ty,label,direction)=>({x,y,to,tx,ty,label,direction});
const decor=(id,sheet,asset,x,y,w,h,box=null,extra={})=>({id,sheet,asset,x,y,w,h,box,...extra});
const city=(id,index,x,y,w=180,h=160,box=null)=>decor(id,'cityWorld',index,x,y,w,h,box);
const lamp=(id,x,y)=>city(id,5,x,y,54,128,[x-12,y-12,24,12]);
const prop=(id,label,x,y,sheet,index,w=70,h=65,extra={})=>({id,action:'v18city:'+id,label,x,y,interactX:x,interactY:y+65,art:{sheet,index,w,h},...extra});
const fence=(id,x,y,w=220)=>city(id,11,x,y,w,84,[x-w*.43,y-18,w*.86,18]);
const path=(asset,width,points)=>({asset,width,points});
const ground=(base,paths)=>({sheet:'cityGround',base,paths,patches:[]});

export const CITY_MAPS_V18={
 ch5LanternQuay:{name:'水灯河岸',sub:'两座木桥跨过暗河。水灯从桥洞钻出来，浮到远处的雨棚下面。',chapterRegion:5,safe:true,entry:[280,650],
  doors:[door(170,650,'ch5Reservoir',1320,850,'凝露水院','西'),door(1430,700,'ch5NightMarket',280,760,'绮灯夜市','东')],npcs:[],spawns:[],
  props:[prop('v18-city-mint','雨棚下的温薄荷',380,335,'details',6,65,62),prop('v18-city-dew','桥东接露的小瓶',1210,410,'world',13,48,55),prop('v18-city-quay-rail','水边的旧系绳桩',1120,855,'details',3,62,42,{interactY:800}),prop('v18-city-rain-basin','檐下接雨的铜盆',410,500,'world',13,75,62)],
  ambientActors:[{id:'v18-quay-couple-a',name:'',x:1180,y:620,sprite:3,angle:2.7},{id:'v18-quay-couple-b',name:'',x:1265,y:645,sprite:6,angle:-2.8}],
  interiorBlocks:[[630,155,280,140],[630,435,280,210],[630,790,280,175]]},
 ch5NightMarket:{name:'绮灯夜市',sub:'染布挂在头顶，烤饼香从窄巷里飘过来。有人把换来的旧物当场修好。',chapterRegion:5,safe:true,entry:[280,760],
  doors:[door(170,760,'ch5LanternQuay',1320,700,'水灯河岸','西南'),door(800,940,'ch5Market',800,830,'回廊集市','南'),door(1430,350,'ch5BellTerrace',280,790,'钟台长阶','东北')],npcs:[],spawns:[],
  props:[prop('v18-city-bread-note','烤炉旁的送货便签',380,600,'details',0,55,38,{interactY:675}),prop('v18-city-market-ribbons','试系的发带',1210,650,'details',15,88,62,{nativeV18:true}),prop('v18-city-market-mender','补过三次的零钱袋',1000,300,'details',7,55,40),prop('v18-city-market-samples','留下半块的试吃饼',590,350,'cityWorld',8,95,65)],
  ambientActors:[{id:'v18-bread-vendor',name:'卖饼人',x:475,y:650,sprite:5,angle:1.3},{id:'v18-cloth-vendor',name:'',x:1130,y:560,sprite:6,angle:2.8},{id:'v18-market-repairer',name:'',x:1120,y:300,sprite:3,angle:.4},{id:'v18-market-listener',name:'',x:610,y:530,sprite:8,angle:-.4}],
  interiorBlocks:[[315,440,210,40],[1040,455,250,40]]},
 ch5BellTerrace:{name:'听风钟台',sub:'长阶尽头没有店招。沿着栏杆走，整座城的灯都在脚下，风铃却只轻轻响。',chapterRegion:5,safe:true,entry:[280,790],
  doors:[door(170,790,'ch5NightMarket',1320,350,'绮灯夜市','西南'),door(1430,780,'ch5GuestRooms',1320,760,'酒馆外廊','东南')],npcs:[],spawns:[],
  props:[prop('v18-city-chime','缠着旧布条的风铃',1100,380,'cityWorld',5,55,118,{interactY:460,nativeV18:true}),prop('v18-city-star-chart','摊在石栏上的星图',540,400,'details',0,80,56,{interactY:465}),prop('v18-city-bell-rope','钟台的旧牵绳',760,280,'cityWorld',9,130,165,{interactY:375,nativeV18:true})],
  ambientActors:[],interiorBlocks:[[475,730,620,35],[240,230,210,35],[1160,230,195,35],[675,237,160,23]]},
 ch5GuestRooms:{name:'酒馆楼上',sub:'楼下的琴声隔着木板变轻了。水壶温在炉边，窗缝里透进河上的夜风。',chapterRegion:5,safe:true,entry:[420,820],
  doors:[door(420,940,'ch5Tavern',1120,840,'长夜酒馆','南'),door(1430,760,'ch5BellTerrace',1320,780,'听风钟台','东')],npcs:[],spawns:[],
  props:[prop('v18-city-guest-wash','备好的水与干净毛巾',1210,610,'world',13,72,60),prop('v18-city-guest-window','窗边的薄帘',1190,285,'details',15,116,82,{interactY:390,nativeV18:true}),prop('v18-city-guest-ledger','写满不同字迹的留言簿',495,460,'details',0,65,45),prop('v18-city-guest-bed','铺平的客床',1100,530,'medicalProps',1,175,115,{interactY:600,v13Bed:true,box:[1025,520,150,12]})],
  ambientActors:[],interiorBlocks:[[650,215,32,360],[290,620,240,26],[1040,215,240,24],[335,246,230,19],[1000,255,270,20],[280,730,100,20]]}
};

export const CITY_SCENERY_V18={
 ch5LanternQuay:[city('v18-quay-canopy',7,420,245,290,160,[295,225,250,20]),city('v18-quay-store',1,1210,290,290,230,[1090,266,235,24]),
  decor('v18-quay-tree','world',4,315,850,235,220,[295,830,40,20]),decor('v18-quay-bench','world',10,455,740,155,67,[400,725,110,15]),
  lamp('v18-quay-lamp1',565,565),lamp('v18-quay-lamp2',1000,600),lamp('v18-quay-lamp3',1320,840),
  fence('v18-quay-west-rail1',595,605,110),fence('v18-quay-east-rail1',945,605,110),fence('v18-quay-east-rail2',1030,905,140)],
 ch5NightMarket:[city('v18-market-north-cloth',7,430,330,300,160,[315,308,230,22]),city('v18-market-south-stall',1,390,545,280,200,[290,522,210,23]),
  city('v18-market-east-cloth',7,1170,440,340,180,[1035,418,270,22]),city('v18-market-little-forge',3,1190,250,205,170,[1110,232,160,18]),
  city('v18-market-small-table',8,585,350,105,74,[548,337,75,13]),city('v18-market-south-table',8,1120,795,145,95,[1070,780,100,15]),
  lamp('v18-market-lamp1',700,300),lamp('v18-market-lamp2',960,845),lamp('v18-market-lamp3',1330,590),
  decor('v18-market-bread-basket','details',9,330,675,75,63,[307,660,46,15]),decor('v18-market-cloth-roll','details',9,1295,680,65,48,[1275,667,40,13]),
  decor('v18-market-coins','world',12,1120,335,66,60,[1100,323,40,12])],
 ch5BellTerrace:[fence('v18-terrace-north-rail1',385,235,220),fence('v18-terrace-north-rail2',1220,235,215),
  ...[565,715,865,1015].map((x,i)=>fence('v18-terrace-south-rail-'+i,x,750,165)),decor('v18-terrace-bench','world',10,1240,560,160,67,[1185,545,110,15]),
  city('v18-terrace-star-table',8,535,390,125,90,[490,375,90,15]),lamp('v18-terrace-lamp1',400,615),lamp('v18-terrace-lamp2',1180,870),
  decor('v18-terrace-crate','world',12,315,365,74,80,[293,349,44,16])],
 ch5GuestRooms:[decor('v18-room-spare-bed','medicalProps',1,430,440,165,110,[370,420,120,20]),decor('v18-room-chair','world',10,925,690,105,60,[890,677,70,13]),
  city('v18-room-tea-table',8,730,800,175,120,[670,780,120,20]),decor('v18-room-bookcase','world',11,735,335,120,130,[695,315,80,20]),
  lamp('v18-room-lamp1',1350,500),
  decor('v18-room-linen','details',9,1250,460,75,52,[1225,445,50,15])]
};
export const CITY_GROUND_V18={
 ch5LanternQuay:ground(0,[path(0,155,[[165,650],[435,650],[450,720],[1150,720],[1435,700]]),path(0,135,[[450,720],[450,360],[1150,360],[1150,720]])]),
 ch5NightMarket:ground(0,[path(0,175,[[165,760],[750,760],[800,940]]),path(0,155,[[750,760],[820,600],[820,350],[1435,350]]),path(1,120,[[370,650],[790,650],[1170,650]])]),
 ch5BellTerrace:ground(0,[path(1,180,[[165,790],[360,790],[470,610],[800,580],[1175,670],[1435,780]]),path(0,135,[[800,580],[800,345]])]),
 ch5GuestRooms:{sheet:'terrain',base:8,paths:[],patches:[]}
};
const LINKS=[
 {map:'ch5Reservoir',door:door(1430,850,'ch5LanternQuay',280,650,'水灯河岸','东南')},
 {map:'ch5Market',door:door(800,940,'ch5NightMarket',800,830,'绮灯夜市','南')},
 {map:'ch5Tavern',door:door(1120,940,'ch5GuestRooms',420,820,'楼上客房','东南')}
];
function boundary(doors){
 const cuts=(a,b,cs)=>{const out=[];let at=a;for(const c of cs.sort((x,y)=>x-y)){const lo=Math.max(a,c-115),hi=Math.min(b,c+115);if(lo>at)out.push([at,lo-at]);at=Math.max(at,hi);}if(at<b)out.push([at,b-at]);return out;};
 return [...cuts(0,1600,doors.filter(d=>d.y<=200).map(d=>d.x)).map(([x,w])=>[x,0,w,150]),...cuts(0,1600,doors.filter(d=>d.y>=920).map(d=>d.x)).map(([x,w])=>[x,965,w,115]),...cuts(150,965,doors.filter(d=>d.x<=200).map(d=>d.y)).map(([y,h])=>[0,y,130,h]),...cuts(150,965,doors.filter(d=>d.x>=1400).map(d=>d.y)).map(([y,h])=>[1470,y,130,h])];
}
export function registerCityWorldV18({MAPS,SCENERY,CH5_MAPS,CH5_SCENERY,CH5_GROUND_STYLE,V11_GROUND_STYLE}){
 for(const [id,m]of Object.entries(CITY_MAPS_V18)){
  const scene=clone(CITY_SCENERY_V18[id]),map={...clone(m),width:1600,height:1080,floor:'stone',citySceneV18:true,scenery:scene};
  map.blocks=[...boundary(map.doors),...(map.interiorBlocks||[]),...scene.filter(s=>s.box).map(s=>s.box),...map.props.filter(p=>p.box).map(p=>p.box)];
  MAPS[id]=map;CH5_MAPS[id]=clone(map);SCENERY[id]=scene;CH5_SCENERY[id]=clone(scene);V11_GROUND_STYLE[id]=clone(CITY_GROUND_V18[id]);CH5_GROUND_STYLE[id]=clone(CITY_GROUND_V18[id]);
 }
 for(const link of LINKS){
  const map=MAPS[link.map];if(map.doors.some(d=>d.to===link.door.to))continue;map.doors.push(clone(link.door));
  // Replace only the outer frame, retaining every existing scenery collision.
  map.blocks=map.blocks.filter(b=>!(b[1]===0&&b[3]===150||b[1]===965&&b[3]===115||b[0]===0&&b[2]===130||b[0]===1470&&b[2]===130));
  map.blocks.unshift(...boundary(map.doors));
 }
}

// V20: the original public hook remains for older imports; active painted city
// environment is owned exclusively by world-art-v19.js, avoiding double layers.
export function drawCityAtmosphereV18(){}
