// Authored space, not a random density pass. Existing map/quest/prop IDs are stable.
export const DEMO_MAPS_V29=['road','millpath','echo','workshop'];
const scene=(id,sheet,asset,x,y,w,h,box=null)=>({id,sheet,asset,x,y,w,h,box});
const tree=(id,x,y,w=190,h=230)=>scene(id,'world',4,x,y,w,h,[x-w*.11,y-24,w*.22,24]);
const wall=(id,x,y,w=150)=>scene(id,'world',5,x,y,w,76,[x-w*.42,y-27,w*.84,27]);
const rock=(id,x,y,w=85,h=60)=>scene(id,'details',3,x,y,w,h,[x-w*.34,y-22,w*.68,22]);
const plant=(id,x,y,w=100,h=78)=>({...scene(id,'qualityWorld',7,x,y,w,h),collisionV281:false});
const clue=(id,action,x,y,label,art,extra={})=>({id,action,type:'book',x,y,label,art,worldInteractionV29:{duration:.35},...extra});
const updateProp=(map,id,changes)=>Object.assign(map.props.find(p=>p.id===id),changes);
const group=(groupId,bounds,spawnIds,types,refresh='revisit',danger='ordinary')=>({groupId,bounds,activationBounds:bounds,leashBounds:[bounds[0]-50,bounds[1]-50,bounds[2]+100,bounds[3]+100],spawnIds,types,count:[spawnIds.length,spawnIds.length],size:spawnIds.length,refresh,danger,area:bounds,center:[bounds[0]+bounds[2]/2,bounds[1]+bounds[3]/2],spread:[Math.max(25,bounds[2]/2-25),Math.max(25,bounds[3]/2-25)],entryExclusionRadius:130,aggroShareRadius:155,unique:refresh==='never'});

export const WORLD_REGIONS_V29={
 road:{kind:'road',entry:[230,550],paths:[{width:142,points:[[140,540],[360,570],[650,510],[850,535],[1090,590],[1460,540]]},{width:84,points:[[900,190],[880,350],[850,535]]},{width:90,points:[[1010,600],[1070,720],[1050,900]]},{width:68,points:[[450,540],[490,405],[650,300],[770,410],[850,535]]}],landmarks:[{id:'courier',x:430,y:400,radius:135},{id:'v29-road-sign',x:925,y:680,radius:115},{id:'letter',x:1115,y:600,radius:115},{id:'herb1',x:650,y:290,radius:95}],walks:[['hall','town'],['hall','millpath'],['hall','grove']]},
 millpath:{kind:'forest',entry:[800,270],paths:[{width:100,points:[[800,170],[780,340],[845,475],[990,560],[1080,685],[1180,870]]},{width:72,points:[[780,340],[615,400],[450,520],[490,660],[720,735],[940,720],[1080,685]]},{width:68,points:[[990,560],[1190,505],[1290,600],[1250,750],[1180,870]]}],landmarks:[{id:'mill-door',x:485,y:400,radius:100},{id:'mill-copper',x:430,y:560,radius:100},{id:'v29-mill-tracks',x:880,y:510,radius:120},{id:'echo',x:1180,y:870,radius:110},{id:'mill-practice',x:680,y:675,radius:100}],walks:[['road','echo']]},
 echo:{kind:'waterworks',entry:[300,810],paths:[{width:118,points:[[300,890],[300,710],[480,595],[720,590],[940,590],[1130,520],[1210,450]]},{width:85,points:[[480,595],[460,435],[450,370]]},{width:90,points:[[830,590],[850,480]]},{width:82,points:[[1040,590],[1130,745],[1200,810]]}],landmarks:[{id:'echo-notes',x:450,y:370,radius:120},{id:'echo-valve',x:850,y:485,radius:100},{id:'echo-warden',x:1170,y:500,radius:175},{id:'v29-echo-core',x:1150,y:450,radius:110},{id:'echo-crystal-west',x:385,y:635,radius:95}],walks:[['millpath','echo-machine']]},
 workshop:{kind:'workshop',entry:[800,870],paths:[{width:130,points:[[800,950],[800,790],[850,700],[920,630]]},{width:90,points:[[800,790],[540,845],[390,665]]},{width:90,points:[[850,700],[760,570],[530,460]]}],landmarks:[{id:'lotti',x:920,y:630,radius:120},{id:'reset-bench',x:390,y:665,radius:105},{id:'repair-bench',x:1040,y:600,radius:100},{id:'repair-invoice',x:480,y:855,radius:100}],walks:[['town','lotti']]}
};

export function configureExplorationWorldV29(maps,scenery,waters,bridges,boundaries){
 const road=maps.road,mill=maps.millpath,echo=maps.echo,shop=maps.workshop;
 road.sub='车辙向东，磨坊的旧路从矮墙旁分开';
 scenery.road=[wall('road-wall',455,765),wall('v29-road-breakwall',815,720,130),scene('road-sign','world',15,530,405,52,75,[517,391,26,14]),scene('v29-road-cart','qualityWorld',3,1160,640,170,115,[1100,616,120,24]),
  ...[[210,270,205,244],[420,240,190,228],[590,200,210,250],[760,160,175,218],[1150,250,195,238],[1330,290,220,265],[1490,360,210,245],[215,810,205,248],[390,930,220,265],[600,915,185,232],[1285,850,230,280],[1460,925,210,258],[80,420,180,225],[70,710,220,270],[1510,735,190,235]].map((p,i)=>tree('v29-road-canopy-'+i,...p)),rock('v29-road-crest',740,360,105,72),plant('v29-road-growth',620,830),plant('v29-road-bank',1350,760)];
 road.blocks=[[0,0,650,200],[1040,0,560,230],[0,860,620,220],[1190,880,410,200],[0,200,150,190],[0,680,150,180],[1450,230,150,160],[1450,690,150,190]];
 updateProp(road,'letter',{x:1115,y:600});
 road.props.push(clue('v29-road-sign','v29RoadSign',925,680,'磨坊的褪色指路牌',{sheet:'world',index:15,w:50,h:74},{interactX:925,interactY:730}));
 road.spawns=[['wolf',1040,460,'road-0'],['wolf',1220,690,'road-1'],['rat',1040,775,'road-2'],['wolf',1280,480,'road-v8-patrol']];
 road.encounters=[group('v29-road-cart',[1010,400,310,340],['road-0','road-1','road-v8-patrol'],['wolf']),group('v29-road-ditch',[990,730,150,100],['road-2'],['rat'])];

 mill.sub='断了的水槽通向东岸，狼爪印停在检修洞前';
 mill.blocks=[[0,0,690,190],[910,0,690,190],[0,190,195,735],[1430,190,170,735],[0,925,1600,155]];
 scenery.millpath=[scene('mill-building','world',0,490,360,315,285,[355,265,270,95]),wall('mill-west-wall',330,560,115),scene('mill-practice-table','world',9,680,680,145,90,[620,648,120,32]),wall('mill-low-wall',760,875,160),scene('mill-old-sacks','chapterProps',6,570,417,90,65,[537,395,66,22]),scene('echo-entrance','mechanisms',2,1180,904,145,150),
  scene('v29-mill-cart','chapterProps',7,1060,400,140,98,[1010,376,100,24]),scene('v29-mill-log','chapterProps',3,420,760,150,65,[365,737,110,23]),
  ...[[220,300,200,245],[150,520,200,240],[290,825,205,250],[530,940,180,220],[900,940,230,278],[1390,860,190,232],[1430,570,205,250],[1340,330,220,267],[1120,220,195,238],[960,190,180,220]].map((p,i)=>tree('v29-mill-canopy-'+i,...p)),
  rock('v29-mill-spring',1290,410,150,85),plant('v29-mill-reeds-n',1255,370,110,100),plant('v29-mill-reeds-s',1400,735,110,100),rock('v29-mill-ridge',960,825,100,70)];
 waters.millpath=[[1330,430,85,275],[1220,260,195,100]];
 updateProp(mill,'mill-practice',{x:680,y:615,depthY:681,interactX:680,interactY:715});
 updateProp(mill,'mill-wheel',{x:1190,y:430,art:{sheet:'chapterProps',index:5,w:64,h:96}});
 updateProp(mill,'mill-barrel',{x:1050,y:760});updateProp(mill,'mill-pot',{x:560,y:780});
 mill.props.push(clue('v29-mill-tracks','v29MillTracks',880,510,'湿泥里的爪印',{sheet:'details',index:14,w:48,h:28},{flat:true}),clue('v29-mill-channel','v29MillChannel',1280,690,'卡住的旧引水槽',{sheet:'details',index:3,w:56,h:34},{interactX:1210,interactY:675}));
 mill.spawns=[['rat',470,620,'millpath-0'],['wolf',1030,590,'millpath-2'],['bat',1210,710,'millpath-3']];
 mill.encounters=[group('v29-mill-oldstock',[410,580,170,170],['millpath-0'],['rat']),group('v29-mill-waterbank',[980,540,270,230],['millpath-2','millpath-3'],['wolf','bat'])];

 echo.sub='先听水声，再看铜管的去向';
 echo.blocks=[[0,0,1600,190],[0,190,150,890],[1450,190,150,890],[150,945,1300,135]];
 scenery.echo=[scene('echo-arch','mechanisms',2,300,937,130,125),scene('echo-machine-base','mechanisms',0,1210,350,180,180,[1140,295,140,55]),scene('echo-left-table','world',9,450,330,155,88,[384,300,132,30]),scene('echo-lamp1','world',14,530,270,35,100,[521,256,18,14]),scene('echo-lamp2','world',14,900,850,35,100,[891,836,18,14]),wall('v29-echo-partition-w',285,520,215),wall('v29-echo-partition-e',1280,680,180),wall('v29-echo-north-pier',930,320,115),scene('v29-echo-shelf','world',11,260,340,125,132,[212,307,96,33]),rock('v29-echo-rubble',1030,800,105,68),scene('v29-echo-repair-crate','world',12,550,405,55,55,[530,385,40,20])];
 waters.echo=[[675,190,105,340],[675,650,105,295]];bridges.echo={x:650,y:520,w:155,h:130};
 updateProp(echo,'echo-valve',{x:850,y:425,interactX:850,interactY:485,worldInteractionV29:{duration:.65}});
 updateProp(echo,'echo-machine',{worldInteractionV29:{duration:.5}});
 echo.props.push(clue('v29-echo-core','v29EchoCore',1150,390,'后槽里的黄铜心轴',{sheet:'mechanisms',index:7,w:48,h:34},{interactX:1150,interactY:450,depthY:391,worldInteractionV29:{duration:.75}}));
 echo.spawns=[['bat',480,440,'echo-0'],['wolf',1130,740,'echo-1'],['wolf',1170,500,'echo-warden']];
 echo.encounters=[group('v29-echo-archive',[390,380,180,140],['echo-0'],['bat'],'never'),group('v29-echo-tailrace',[1050,700,250,160],['echo-1'],['wolf'],'never'),{...group('v29-echo-warden',[1060,425,260,160],['echo-warden'],['wolf'],'never','elite'),bossId:'echo-warden'}];

 shop.sub='门边是待取的旧件，台上留着一块干净包布';
 shop.blocks=[[0,0,1600,190],[0,190,150,890],[1450,190,150,890],[150,945,520,135],[930,945,520,135]];
 scenery.workshop=[scene('repair-north-shelf','newProps',3,430,365,175,180,[360,325,140,40]),scene('repair-east-shelf','world',11,1210,340,165,175,[1142,300,136,40]),scene('repair-main-table','newProps',2,1040,560,210,145,[952,522,176,38]),scene('repair-bench-seat','world',10,1140,725,160,70,[1075,700,130,25]),scene('repair-west-table','world',9,480,820,180,95,[404,788,152,32]),scene('repair-lamp','world',14,790,365,36,110,[781,351,18,14]),scene('repair-stockbag','chapterProps',6,1300,830,85,60,[1268,809,64,21]),scene('shop-exit-frame','newProps',11,800,964,96,125),scene('reset-base','mechanisms',1,390,585,145,130,[333,548,114,37]),scene('v29-repair-cabinet','world',11,620,320,140,150,[565,290,110,30]),scene('v29-repair-stool','world',10,955,360,105,58,[913,338,84,22]),scene('v29-repair-incoming','world',12,1230,880,50,55,[1210,860,40,20])];
 Object.assign(shop.npcs.find(n=>n.id==='lotti'),{x:920,y:630,angle:-.65});
 updateProp(shop,'repair-bench',{x:1040,y:497,depthY:561,interactX:1040,interactY:600});
 updateProp(shop,'repair-shelf',{interactX:430,interactY:420});
 updateProp(shop,'repair-invoice',{x:480,y:768,depthY:821,interactX:480,interactY:855});
 updateProp(shop,'training-dummy',{x:740,y:460});
 shop.props.push(clue('v29-repair-core','v29RepairCore',995,510,'留在修理台上的机芯',{sheet:'mechanisms',index:7,w:42,h:28},{interactX:990,interactY:600,depthY:562,worldInteractionV29:{duration:.3}}));
 for(const id of DEMO_MAPS_V29){
  boundaries[id]=maps[id].blocks.map(b=>[...b]);
  maps[id].blocks.push(...scenery[id].filter(o=>o.box).map(o=>o.box),...(waters[id]||[]));
  maps[id].worldLayoutV29=1;
  for(const p of maps[id].props)if(p.action&&!p.worldInteractionV29)p.worldInteractionV29={duration:p.type==='book'?.25:.4};
 }
 // Small, opt-in reuse outside the demo: existing guestroom interactions, unchanged outcomes.
 for(const p of maps.guestroom.props)if(['guestJournal','guestBasin','guestRest'].includes(p.action))p.worldInteractionV29={duration:p.action==='guestRest'?.65:.35};
}
