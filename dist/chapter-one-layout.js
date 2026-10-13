// Chapter 0.8: the walkable land, terrain and authored feet share one plan.
// Rooms/clearings overlap through wide passages; hubs remain broad open spaces.
export const C1_LAYOUTS={
 hall:{floor:2,space:'接待大厅 · 书记角 · 后院通道',rooms:[[140,180,1320,780]]},
 warehouse:{floor:2,space:'卸货道 · 粮架区 · 北墙鼠洞',rooms:[[140,180,1320,780]]},
 road:{floor:1,outdoor:true,space:'王道主路 · 北林岔口 · 南侧车辙',rooms:[[140,400,1320,280],[580,180,850,320],[200,600,420,340],[520,560,560,240],[820,580,540,380]],paths:[[[150,540],[730,540],[1440,540]],[[750,500],[920,190]],[[960,570],[1060,880]]]},
 town:{floor:0,outdoor:true,space:'中央广场 · 西侧集市 · 北门前庭',rooms:[[140,180,1320,780]],paths:[[[150,610],[810,610],[1430,500]],[[800,900],[820,180]]]},
 chapel:{floor:3,space:'中殿 · 两侧回廊 · 东侧门',rooms:[[140,180,1320,790]]},
 alley:{floor:0,outdoor:true,edge:'masonry',space:'前街 · 货场 · 北门巷口',rooms:[[140,400,1320,280],[680,180,500,340],[280,600,450,340],[880,560,500,380]],paths:[[[150,530],[900,530],[1430,560]],[[850,190],[850,530]],[[480,810],[480,570]]]},
 canal:{floor:3,space:'双岸巡道 · 过水桥 · 东闸平台',rooms:[[140,180,1320,780]],water:[[720,0,120,430],[720,650,120,130],[720,960,120,120]],bridges:[[700,430,160,220],[700,780,160,180]]},
 grove:{floor:1,outdoor:true,space:'入口草甸 · 上游药圃 · 东岸兽窝',rooms:[[140,420,580,520],[260,180,400,420],[860,200,600,740],[600,480,340,180],[580,800,440,160],[640,840,320,130]],water:[[720,0,140,480],[720,660,140,140],[720,960,140,120]],bridges:[[690,480,200,180],[690,800,200,160]],paths:[[[800,950],[640,850],[450,750],[450,300]],[[580,570],[960,570],[1290,540]]]},
 guestroom:{floor:2,space:'卧榻 · 炉边 · 行旅桌',rooms:[[260,220,1080,740]]},
 millpath:{floor:1,outdoor:true,space:'屋前院 · 水轮槽 · 后场检修口',rooms:[[510,180,590,350],[140,440,680,500],[620,520,840,420]],water:[[430,0,80,500]],paths:[[[800,190],[800,600],[1180,870]],[[800,600],[390,610]]]},
 echo:{floor:3,space:'入口间 · 检修廊 · 守兽后槽',rooms:[[180,620,520,350],[420,220,480,570],[960,180,500,740],[780,430,280,250]]},
 workshop:{floor:2,space:'修理柜台 · 工作台 · 练习角',rooms:[[220,240,1180,720]]},
 c1TrainingYard:{floor:1,outdoor:true,space:'集合地 · 苔壳兽场 · 东侧通道',rooms:[[140,680,540,280],[200,240,560,560],[820,200,640,740],[650,430,320,240]],paths:[[[220,820],[460,710],[460,500],[920,550],[1320,850]]]},
 c1DrillGallery:{floor:3,space:'西训练厅 · 中央回廊 · 看守室',rooms:[[140,220,530,740],[770,180,690,780],[600,390,270,300],[570,780,330,180]]},
 c1LoomRoom:{floor:2,space:'符文柜 · 缀纹机 · 样本台',rooms:[[180,220,1240,740]]},
 c1NorthWalk:{floor:0,outdoor:true,space:'西岸检修台 · 双桥 · 东岸灯路',rooms:[[160,240,490,720],[820,180,630,780],[590,420,300,220],[590,800,300,160]],water:[[660,0,160,420],[660,640,160,160],[660,960,160,120]],bridges:[[630,420,220,220],[630,800,220,160]]},
 c1ReedKiln:{floor:1,outdoor:true,space:'苇湾入口 · 窑前空场 · 东侧蝠巢',rooms:[[160,600,480,360],[440,340,630,530],[900,180,540,580]],paths:[[[230,870],[530,730],[770,610],[1180,430]]]},
 c1TrialFoyer:{floor:3,space:'地下接待室 · 值守桌 · 两侧阶梯',rooms:[[180,240,1240,720]]},
 c1TrialCrypt:{floor:3,space:'维修工入口 · 西蓄能厅 · 东回流槽',rooms:[[140,680,380,280],[370,180,500,780],[990,180,470,780],[770,360,330,270],[740,780,340,180]]},
 c1TrialVault:{floor:3,space:'守库账桌 · 封存书架 · 失控看守内室',rooms:[[140,650,450,310],[380,180,480,700],[980,180,480,780],[740,440,350,250]]},
 c1RiversideCamp:{floor:1,outdoor:true,space:'柴车停靠地 · 药棚 · 林边步道',rooms:[[140,250,1320,710]],paths:[[[220,820],[740,650],[1360,600]]]},
 c1KilnCourt:{floor:0,outdoor:true,edge:'masonry',space:'窑工歇脚院 · 晾坯棚 · 后窑通道',rooms:[[160,280,1280,680]],paths:[[[220,810],[800,650],[1380,540]]]},
};
export const C1_MAPS=Object.keys(C1_LAYOUTS);
export const c1Map=id=>!!C1_LAYOUTS[id];
export const insideRect=(x,y,b)=>x>=b[0]&&x<=b[0]+b[2]&&y>=b[1]&&y<=b[1]+b[3];
export const c1Land=(id,x,y)=>C1_LAYOUTS[id]?.rooms.some(b=>insideRect(x,y,b))&&!C1_LAYOUTS[id]?.water?.some(b=>insideRect(x,y,b));
// Merge adjacent cells, so navigation and minimaps use a small static list.
export function c1Boundary(id){const rows=[],step=20;
 for(let y=0;y<1080;y+=step){let start=null;for(let x=0;x<=1600;x+=step){const solid=x<1600&&!c1Land(id,x+10,y+10);if(solid&&start===null)start=x;if(!solid&&start!==null){rows.push([start,y,x-start,step]);start=null;}}}
 const merged=[];for(const b of rows){const previous=merged.findLast(p=>p[0]===b[0]&&p[2]===b[2]&&p[1]+p[3]===b[1]);if(previous)previous[3]+=b[3];else merged.push(b);}return merged;
}
// Each entry is a distinct real object: sheet/index, anchor, displayed size, feet.
const a=(sheet,index,x,y,w,h,bw=w*.7,bh=30)=>({sheet:'chapter'+sheet,asset:index,x,y,w,h,box:[x-bw/2,y-bh,bw,bh],c1Authored:true,collisionV281:false});
const table=(x,y,w=185)=>a('Utilities',1,x,y,w,110,w*.84,45);
const tree=(x,y,w=180)=>a('Architecture',2,x,y,w,w*1.07,36,23);
const rock=(x,y,w=105)=>a('Settlement',8,x,y,w,w*.57,w*.68,28);
const wall=(x,y,w=150)=>a('Architecture',4,x,y,w,78,w*.94,34);
export const C1_FURNITURE={
 hall:[a('Furnishings',0,1010,330,200,115),a('Furnishings',2,1200,290,150,130),a('Objects',9,440,700,230,100),a('Furnishings',1,450,815,170,60),a('Utilities',2,330,295,170,170),a('Objects',4,1320,765,120,140)],
 warehouse:[a('Furnishings',4,410,320,170,140),a('Furnishings',5,840,350,180,90),a('Furnishings',4,430,850,185,155),a('Furnishings',6,1300,845,90,110),a('Furnishings',5,950,880,180,85),a('Furnishings',4,770,640,150,135),a('Settlement',5,1290,265,110,125)],
 road:[tree(410,300,200),tree(620,365,180),tree(1450,365,210),tree(320,880,220),rock(920,740),a('Settlement',9,1110,350,160,115),a('Furnishings',10,880,395,62,85),a('Hell',4,1330,415,180,150,100,40)],
 town:[a('Settlement',0,420,400,245,225,170,70),a('Settlement',1,560,825,210,190,145,60),a('Architecture',0,1320,365,270,240,205,65),a('Architecture',1,820,195,310,240,180,20),a('Objects',9,250,870,170,85),tree(260,270,180),tree(1370,880,200)],
 chapel:[a('Settlement',3,1230,420,200,110,170,45),a('Furnishings',1,450,570,180,65),a('Furnishings',1,450,750,180,65),a('Furnishings',1,1070,790,180,65),a('Furnishings',3,1380,350,42,112),a('Furnishings',3,220,350,42,112)],
 alley:[a('Architecture',0,350,385,260,230,180,50),a('Architecture',0,1280,355,230,210,170,50),a('Settlement',4,1070,350,190,145,130,48),a('Furnishings',6,360,800,75,95),a('Utilities',5,620,905,140,50,100,22),wall(1230,840,180),a('Furnishings',3,1330,430,45,105)],
 canal:[a('Settlement',10,400,330,155,160,100,65),wall(1050,760,170),a('Objects',1,1310,400,100,100,70,40),a('Furnishings',3,300,805,42,115),a('Furnishings',3,1290,930,42,115)],
 grove:[tree(280,370,160),tree(580,275,185),tree(1350,290,190),tree(1420,850,190),rock(1000,365,125),rock(1110,750,120),a('Utilities',5,370,830,150,55,100,22)],
 guestroom:[a('Utilities',0,520,470,230,160,170,80),a('Utilities',2,1090,355,170,175,110,65),a('Objects',4,1240,720,135,145),a('Objects',9,540,680,210,98,160,35)],
 millpath:[a('Architecture',5,380,420,300,290,190,55),a('Objects',2,1180,490,235,70,175,30),a('Furnishings',4,280,870,130,100),tree(1370,790,185),tree(610,330,170),rock(960,840,115)],
 echo:[a('Settlement',10,1280,320,185,180,125,65),wall(1060,700,150),wall(840,350,150),a('Utilities',14,600,390,130,70,100,30),a('Objects',5,400,830,115,135,85,35)],
 workshop:[table(1050,455,230),a('Objects',5,420,380,140,155),a('Utilities',2,1270,370,155,170,100,60),a('Utilities',16,680,430,70,125,34,20),a('Furnishings',1,580,820,170,65),a('Objects',4,1300,870,110,130)],
 c1TrainingYard:[a('Utilities',4,360,680,170,90,145,35),tree(620,320,190),rock(1090,335,110),a('Utilities',4,1080,790,170,90,145,35),a('Furnishings',1,290,880,140,60)],
 c1DrillGallery:[wall(400,745,150),wall(770,460,150),wall(1210,335,150),a('Objects',5,1320,650,120,140,80,38)],
 c1LoomRoom:[a('Furnishings',2,380,335,220,155,160,45),table(1180,370,190),a('Furnishings',1,620,830,145,60),a('Objects',5,1280,800,130,150,85,40)],
 c1NorthWalk:[a('Objects',2,350,350,170,55,130,30),a('Furnishings',3,1230,310,46,120),a('Furnishings',3,1270,840,46,120),rock(1040,660,110),wall(440,680,165)],
 c1ReedKiln:[{...a('Utilities',2,1180,300,270,218,170,95),sheet:'c1Kiln',asset:0},wall(920,620,150),wall(670,495,150),a('Objects',2,680,810,165,55,115,30),rock(360,820,105),tree(1340,680,190)],
 c1TrialFoyer:[a('Furnishings',0,500,430,190,110),a('Furnishings',2,620,320,150,150),a('Furnishings',1,980,630,190,62),a('Furnishings',3,1300,420,46,115)],
 c1TrialCrypt:[table(290,770,150),a('Utilities',14,540,330,135,70),a('Objects',2,1200,350,220,65),wall(1200,740,150)],
 c1TrialVault:[a('Furnishings',0,290,750,160,95),a('Furnishings',2,540,310,200,175),a('Furnishings',2,1180,300,210,170),a('Objects',11,1330,800,110,80)],
 c1RiversideCamp:[a('Hell',4,410,390,230,200,145,60),a('Settlement',9,1050,460,180,135),a('Settlement',0,1140,820,220,200,150,60),tree(730,300,190),a('Utilities',5,620,850,170,55)],
 c1KilnCourt:[a('Architecture',0,430,400,250,225,170,60),a('Furnishings',6,1010,410,85,105),a('Objects',9,900,780,210,110),a('Settlement',7,1260,800,55,65),a('Furnishings',4,660,900,150,120)],
};
export const C1_RESOURCE_SITES={road:[[650,285],[1190,775],[1280,270],[360,745],[1030,330],[760,680],[860,320],[1150,620],[520,710],[990,860]],grove:[[400,690],[350,490],[470,280],[1030,830],[1280,690],[1210,400],[530,700],[1020,510],[1170,860],[370,580]]};
