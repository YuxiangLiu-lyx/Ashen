// Authored spatial briefs, shared by the world, floor renderer and quality audit.
// Units are world pixels. Arena rectangles are protected walking space, not spawns.
const lane=(width,...points)=>({width,points});
const plan=(kind,purpose,focal,arenas=[],paths=[])=>({kind,purpose,focal,arenas,paths});
export const SPATIAL_PLANS_V30={
 hall:plan('interior','接待厅：中央接待，北侧文书，西南等候','接待长桌'),
 warehouse:plan('interior','仓储：货架贴墙，中央装卸回转，北墙鼠洞','北墙破洞',[[650,560,350,220]]),
 road:plan('wild','王道：宽路穿过草甸，林缘狼群与南侧磨坊岔路','道路分岔',[[890,420,470,230]],[lane(220,[150,540],[560,550],[950,560],[1450,540]),lane(170,[920,180],[870,380],[900,550]),lane(165,[1000,550],[1080,740],[1050,950])]),
 town:plan('settlement','街镇：井边广场连接住宅、药铺和教堂，店前有退让','井与教堂轴线',[],[lane(240,[150,610],[740,590],[1100,550],[1450,500]),lane(200,[820,180],[800,570],[880,810])]),
 chapel:plan('interior','礼拜厅：仪式轴线、侧席和突围通道','祭坛',[[660,550,440,210]]),
 alley:plan('settlement','后巷：建筑围合内院，转角掩护，向闸口出口渐开','院落转角',[[760,550,330,200]],[lane(210,[150,530],[810,550],[1450,560]),lane(190,[850,180],[850,550])]),
 canal:plan('interior','闸室：保留水渠阻隔，东西检修岸与东岸长官交战台','闸桥',[[925,440,390,230]],[lane(190,[170,630],[490,600],[770,525],[1150,510],[1410,500])]),
 grove:plan('wild','溪林：沿溪两块林隙，林缘密而内部疏，横桥连接','溪流与东岸旧石',[[390,400,330,220],[975,440,340,230]],[lane(155,[800,960],[635,770],[655,550],[845,545],[1080,560],[1240,335])]),
 guestroom:plan('interior','客房：床、盥洗和写字各自有使用侧，出口留空','床与书桌'),
 millpath:plan('wild','磨坊：房前卸料场、东侧水槽作业台，磨坊遗物靠机器','磨坊水轮',[[880,495,350,220]],[lane(195,[800,180],[785,460],[970,590],[1180,865]),lane(150,[785,460],[560,475],[400,580])]),
 echo:plan('interior','机房：隔墙和阀门保留，西检修间接东机器大厅','机芯槽',[[840,465,350,230]]),
 workshop:plan('interior','修理铺：工位围绕中央通道，诊断台与储物分开','主工作台'),
 post:plan('settlement','驿站：马厩装卸靠西，旅店门前回转，东路通关','旅店门廊',[],[lane(220,[800,395],[805,610],[1150,650],[1430,650]),lane(165,[310,475],[470,570],[805,610])]),
 inn:plan('interior','旅店：前廊水泵和炉凳，后屋文书桌以隔墙分开','炉火与水泵'),
 bridge:plan('crossing','关道：东西主路与宽桥，北侧查验停靠湾，南侧废弃沟岸危险支路','桥头查验湾',[[280,705,330,195],[900,685,300,192]],[lane(220,[170,600],[445,580],[770,560],[1050,560],[1430,650]),lane(155,[445,580],[470,450],[590,400]),lane(170,[980,555],[1090,445],[1260,430]),lane(115,[1030,615],[1000,740],[1060,855],[1200,840])]),
 manor:plan('settlement','庄园：北宅与内门、井边院落、南侧退路；警戒与突围分层','井与封闭内门',[[750,560,400,200]],[lane(205,[170,720],[430,745],[810,670],[1160,545]),lane(160,[430,745],[280,935])]),
 spillway:plan('crossing','泄水沟：水闸分岸，两侧维修平台宽于桥口，保留追兵侧路','闸杆与桥',[[270,470,320,220],[975,465,360,220]],[lane(195,[170,700],[450,640],[725,570],[1080,610],[1430,620])]),
 exile:plan('wild','界口：倒木标识旧路，界碑前留出停步空间，东岸植被渐疏','界碑',[],[lane(195,[230,700],[660,630],[850,560],[1100,600],[1320,750])]),
 chamber:plan('interior','庄园内室：桌、壁炉与宾客围合；保留剧情演员承托','领主长桌'),
 bridgecellar:plan('interior','桥下税库：称量台与账箱靠墙，梯口直达中心','旧税箱'),
 wellcrypt:plan('interior','井下石室：外围残壁和箱，中央守井兽回转场','守井兽',[[550,400,370,210]]),
 hellGate:plan('ruin','界门：坠落遗迹两侧残构，中央灰土地容纳群战','断门',[[540,475,400,200]]),
 hellApproach:plan('ruin','前哨坡道：西侧休整台，南北双绕行穿过废墟','倾倒墙段',[[900,565,340,220]]),
 hellQuarry:plan('quarry','采石场：绞盘靠开采壁，中央装运面与东侧高台分层','旧绞盘',[[920,440,350,250]]),
 hellSluice:plan('crossing','旧水闸：北泵房、两侧检修台，湿沟与干燥路线明确','泵机',[[930,465,345,240]]),
 hellWall:plan('ruin','壁垒：中段残墙保留战术绕行口，两端形成交战台地','断墙与伤者',[[920,570,330,230]]),
 hellCamp:plan('settlement','营地：医疗西侧安静区，中央分流，东侧作坊出口','医疗床与营灯'),
 hellGrotto:plan('cave','盐洞：菌生湿壁与干燥洞室交替，中央低岩分隔视线','盐苔',[[965,630,300,195]]),
 hellWorkshop:plan('interior','地底工坊：北储料、东工台、西转轮，中央步行线分离','工作炉台'),
 hellMine:plan('mine','矿井：断轨通向采掘面，南侧回车空地，塌石限在矿壁','断轨',[[930,555,350,225]]),
 hellFerry:plan('shore','渡口：西码头与守灯人，东滩活动面，北上营地','渡灯',[[735,605,300,195]]),
 hellPass:plan('pass','关隘：交错岩脊形成两次绕行，东端集结空地连接竞技场','夹峙岩脊',[[950,605,350,195]]),
 hellArena:plan('arena','竞技场：残柱环绕大块中央场，入口侧保留后撤空间','中央决斗场',[[515,450,575,325]]),
 hellTomb:plan('ruin','墓园：残存墓墙体现旧室边界，中心与东入口有交战空地','封存墓箱',[[865,580,325,215]]),
 hellRift:plan('sanctuary','裂隙：北祭台、南入口和侧边残石，前场保持安静留白','试炼祭台')
};
export const SPATIAL_INTERIORS_V30=new Set(Object.entries(SPATIAL_PLANS_V30).filter(([,p])=>p.kind==='interior').map(([id])=>id));
const terrain=(kind,...points)=>({kind,points});
export const SPATIAL_TERRAIN_V30={
 bridge:[terrain('water',[695,0],[840,0],[858,220],[840,335],[852,485],[705,485],[695,330],[680,235]),terrain('water',[705,670],[852,670],[866,780],[850,875],[835,1080],[685,1080],[677,865],[694,760])],
 // Forest shade is not a solid wall: only the existing trunk footprints block.
 grove:[terrain('water',[805,0],[920,0],[915,200],[898,350],[910,485],[790,485],[778,330],[800,160]),terrain('water',[790,620],[910,620],[930,740],[950,870],[1030,1080],[900,1080],[825,900],[810,775])],
 hellGate:[terrain('cliff',[135,155],[535,155],[480,250],[310,305],[135,280])],
 hellApproach:[terrain('cliff',[135,155],[415,155],[355,255],[215,325],[135,375])],
 hellQuarry:[terrain('cliff',[135,155],[270,155],[245,235],[200,355],[135,400]),terrain('cliff',[1160,155],[1465,155],[1465,245],[1320,215])],
 hellSluice:[terrain('cliff',[135,155],[240,155],[205,320],[135,410])],
 hellWall:[terrain('cliff',[135,155],[455,155],[390,235],[260,265],[135,340])],
 hellGrotto:[terrain('cliff',[135,155],[420,155],[335,265],[200,320],[135,390]),terrain('cliff',[1370,600],[1465,575],[1465,965],[1220,965],[1320,870])],
 hellMine:[terrain('cliff',[135,155],[235,155],[195,280],[135,315]),terrain('cliff',[1380,490],[1465,410],[1465,965],[1290,965],[1350,760])],
 hellPass:[terrain('cliff',[135,155],[655,155],[620,225],[440,245],[305,310],[135,370])],
 hellTomb:[terrain('cliff',[135,155],[570,155],[455,225],[275,225],[135,315])],
 hellRift:[terrain('cliff',[135,155],[370,155],[310,265],[135,395])]
};
// Explicit per-place edits: [scenery id, x, y]. Footprints translate with their host.
export const SPATIAL_MOVES_V30={
 warehouse:[['stock-c',1250,585],['v8-stock-sacks',405,700]],
 road:[['v29-road-cart',1330,770]],
 millpath:[['v29-mill-canopy-7',1160,270]],
 grove:[['v8-grove-stone',360,825]],
 manor:[['manor-barricade',1295,880]],
 spillway:[['spill-log',335,870],['v9-spill-turn-east',1290,375]],
 wellcrypt:[['v9-well-pillar-west',445,570]],
 hellGate:[['gate-black-ridge-s',820,870]],
 hellPass:[['pass-far-south-spur',1350,900]],
};
// Roles are tied to work locations. No random waypoint or combat RNG is consumed.
export const NPC_DUTIES_V30={
 'bridge:bridgewatch':{role:'桥头查验',speed:34,stops:[[660,415,8,1.3],[600,410,6,2.8],[660,415,12,1.3]]},
 'town:herbalist':{role:'药铺柜前接客',speed:30,stops:[[480,585,12,-1.5],[555,570,6,3],[480,585,9,.2]]},
 'town:dolly':{role:'针线摊收拾',speed:28,stops:[[710,680,14,2.8],[675,760,5,-2],[710,680,8,.2]]},
 'town:watch':{role:'教堂门岗',speed:0,stops:[[760,340,20,1.35]]},
 'road:courier':{role:'岔路等候送信',speed:32,stops:[[430,400,14,.9],[480,435,6,-2.2]]},
 'hall:clerk':{role:'书记桌前核对文书',speed:26,stops:[[1010,385,15,-1.5],[1080,385,8,2.8]]},
 'post:roadElder':{role:'马厩前歇脚',speed:0,stops:[[580,630,20,-.3]]},
 'bridge:v9-civilian-01':{role:'送货者等候查验',speed:30,stops:[[445,400,12,.2],[535,405,8,0]]},
 'bridge:v9-civilian-06':{role:'车夫检查车轮',speed:26,stops:[[365,390,10,-1.5],[295,380,8,0]]},
 'bridge:v9-civilian-11':{role:'布贩清点已检货物',speed:28,stops:[[1130,405,12,-1.4],[1235,440,8,1.5]]},
 'bridge:v9-civilian-10':{role:'桥头等候家人',speed:0,stops:[[975,420,20,2.8]]},
 'bridge:v9-civilian-12':{role:'商人等待货车装运',speed:26,stops:[[1310,485,15,-2],[1205,500,6,-1.5]]},
 'bridge:v9-civilian-03':{role:'路边等候亲属',speed:0,stops:[[420,485,20,-1.5]]}
};
