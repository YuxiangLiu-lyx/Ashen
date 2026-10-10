// Shared floorplan contract: y grows southwards; all coordinates are world feet.
export const C1_MAPS=['hall','guestroom','warehouse','road','town','chapel','alley','canal','grove','millpath','echo','workshop','c1Approach','post','c1Station'];
export const C1_CHAPEL={
 south:[800,930],altar:[800,285],table:[1020,435],prelate:[1020,495],fallen:[1030,510],
 hero:[1110,540],saint:[910,510],fightHero:[900,720],fightSaint:[930,510],
 westDoor:[460,570],eastDoor:[1190,480],backDoor:[1420,480],care:[285,490],
 wardWest:[680,505],wardEast:[1090,655],
 walls:[[120,140,1360,70],[120,210,50,770],[1430,210,50,200],[1430,550,50,430],
 [170,930,560,50],[870,930,560,50],[435,210,45,300],[435,630,45,300],
 [1170,210,45,210],[1170,540,45,390]],
 furniture:[
  ['c1-altar',800,315,240,135,'chapterSettlement',3,[685,255,230,60]],
  ['c1-table',1020,460,245,135,'chapterFurnishings',0,[905,397,230,63]],
  ['c1-pew-w1',625,705,205,75,'chapterFurnishings',1,[530,672,190,33]],
  ['c1-pew-e1',1020,705,205,75,'chapterFurnishings',1,[925,672,190,33]],
  ['c1-pew-w2',625,825,205,75,'chapterFurnishings',1,[530,792,190,33]],
  ['c1-pew-e2',1020,825,205,75,'chapterFurnishings',1,[925,792,190,33]],
  ['c1-care-cot',285,455,150,115,'chapterUtilities',0,[218,410,134,45]],
  ['c1-prep-rack',1315,320,145,135,'chapterObjects',4,[1255,285,120,35]],
  ['c1-basin',1320,650,75,70,'chapterUtilities',13,[1292,625,56,25]],
  ['c1-empty-chair',835,425,48,68,'chapterObjects',6,[817,405,36,20]],
  ['c1-tools',1095,575,55,40,'chapterObjects',7,[1073,557,44,18]],
 ],
};
const prop=(id,name,x,y,action=id,extra={})=>({id,name,x,y,action,type:'clue',...extra});
const scenery=([id,x,y,w,h,sheet,asset,box])=>({id,x,y,w,h,sheet,asset,box,c1Art:true});
const edge=[[0,0,1600,140],[0,980,1600,100],[0,140,120,840],[1480,140,120,840]];
export function configureC1Layout({MAPS,SCENERY,BOUNDARIES,WATERS,BRIDGES,invalidate}){
 if(MAPS.chapel.c1Layout)return;
 const m=MAPS.chapel;
 m.c1Layout=1;m.name='白榆圣堂';m.sub='南门主廊 · 西照护间 · 东准备室';
 BOUNDARIES.chapel=C1_CHAPEL.walls.map(b=>[...b]);WATERS.chapel=[];
 SCENERY.chapel=C1_CHAPEL.furniture.map(scenery);
 m.blocks=[...BOUNDARIES.chapel,...SCENERY.chapel.map(o=>o.box)];
 m.npcs=[{id:'prelate',name:'主祭卡德兰',sprite:5,x:1020,y:495},{id:'saint',name:'艾莉娅',sprite:0,x:910,y:510},
 {id:'c1-attendant',name:'勤务人员',sprite:3,x:1280,y:485}];
 m.doors=[{x:800,y:940,to:'town',tx:820,ty:270,label:'南正门 · 白榆城'},
 {x:1415,y:480,to:'alley',tx:850,ty:290,label:'东后门 · 北门小巷',gate:'escape',manualOnly:true}];
 m.props=[prop('c1-care','照护间的急救用品',295,510),prop('c1-rack','送来的铜件',1290,405),
 prop('c1-latch','后门门闩',1390,480),prop('c1-commit','长桌东南角',1110,520)];
 // Existing maps retain their functional navigation; additions sit beside work sites.
 const additions={
 hall:[prop('c1-dossier','目标卷宗',1060,670),prop('c1-paper','通行纸与回执',1190,720),prop('c1-route','水渠撤离图',1310,650)],
 town:[prop('c1-relief','遮雨棚的热水',550,750),prop('c1-missing','家属的寻人页',1080,840)],
 alley:[prop('c1-cart','巷口的空推车',1110,630)],
 canal:[prop('c1-winch','北闸绞盘',1320,570)],
 post:[prop('c1-foyer','消息桌 · 驿站前厅',620,470)],
 };
 for(const [id,rows]of Object.entries(additions))MAPS[id].props.push(...rows);
 const newMap=(name,sub,doors,props,objects)=>({name,sub,safe:true,c1Layout:1,blocks:[],spawns:[],npcs:[],props,doors,ambientActors:[],c1Objects:objects});
 MAPS.c1Approach=newMap('郊外驿道','城钟渐远，水声沿着检修道传来',
 [{x:180,y:690,to:'canal',tx:1370,ty:500,label:'北闸检修道',manualOnly:true},
 {x:1420,y:490,to:'post',tx:260,ty:650,label:'灰石驿站'},
 {x:460,y:870,to:'road',tx:1300,ty:720,label:'隐蔽检修道 · 旧王道',manualOnly:true}],
 [prop('c1-lookback','回望白榆城',790,610),prop('c1-hide','检修道上的足迹',500,820)],
 [['c1-way-sign',1180,470,65,110,'chapterFurnishings',10,[1158,447,44,23]],
 ['c1-shelter',510,470,260,190,'chapterSettlement',0,[400,365,220,105]],
 ['c1-mooring',270,600,70,80,'chapterObjects',2,[244,575,52,25]],
 ['c1-way-tree',1290,350,210,265,'chapterArchitecture',2,[1270,323,40,27]]]);
 MAPS.c1Station=newMap('灰石驿站 · 前厅','消息桌、炉边与看得见门的独立坐席',
 [{x:800,y:940,to:'post',tx:620,ty:550,label:'驿站外院'},
 {x:1400,y:470,to:'inn',tx:800,ty:850,label:'去后屋领信',manualOnly:true}],
 [prop('c1-station-desk','核验通行纸',920,480),prop('c1-station-rest','炉边休整',440,600),prop('c1-save','旅人手记',540,735)],
 [['c1-message-table',935,415,275,145,'chapterFurnishings',0,[805,350,260,65]],
 ['c1-message-papers',920,365,75,45,'chapterUtilities',18,[910,352,20,13]],
 ['c1-station-hearth',290,500,180,180,'chapterSettlement',2,[225,428,130,72]],
 ['c1-seat-saint',1040,795,65,82,'chapterObjects',6,[1017,770,46,25]],
 ['c1-seat-hero',575,670,65,82,'chapterObjects',6,[552,645,46,25]],
 ['c1-station-cabinet',1210,285,165,170,'chapterObjects',5,[1140,235,140,50]]]);
 MAPS.c1Station.npcs=[{id:'seline',name:'塞琳',x:1070,y:465,sprite:6}];
 for(const id of ['c1Approach','c1Station']){
  const map=MAPS[id];BOUNDARIES[id]=edge.map(b=>[...b]);WATERS[id]=[];SCENERY[id]=map.c1Objects.map(scenery);
  map.blocks=[...BOUNDARIES[id],...SCENERY[id].map(o=>o.box)];delete map.c1Objects;
 }
 invalidate();
}
