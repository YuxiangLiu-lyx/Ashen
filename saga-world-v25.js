// Authored V25 map additions. Coordinate system is the real 1600×1080 playfield.
// Geometry is foot-level collision; every visible object uses an existing raster.
import {MAPS} from './data-v14.js';
import {SCENERY,BOUNDARIES} from './world-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {CITY_ARCHITECTURE_META_V19 as A,CITY_FURNISHINGS_META_V19 as F} from './world-art-meta-v19.js';
import {registerSagaCombatV25} from './saga-combat-v25.js';
const clone=v=>JSON.parse(JSON.stringify(v));
const obj=(id,sheet,asset,x,y,w,h,box=null,extra={})=>({id,sheet,asset,x,y,w,h,box,...extra});
const house=(id,x,y,w=300)=>obj(id,'world',0,x,y,w,w*1.09,[x-w*.4,y-75,w*.8,75]);
const tree=(id,x,y,w=200)=>obj(id,'world',4,x,y,w,w*1.03,[x-25,y-25,50,25]);
const rock=(id,x,y,w=130)=>obj(id,'details',3,x,y,w,w*.63,[x-w*.35,y-24,w*.7,24]);
const wall=(id,x,y,w=190)=>obj(id,'world',5,x,y,w,w*.4,[x-w*.45,y-34,w*.9,34]);
const fence=(id,x,y,w=160)=>obj(id,'world',6,x,y,w,w*.42,[x-w*.45,y-23,w*.9,23]);
const crate=(id,x,y,w=75)=>obj(id,'world',12,x,y,w,w*1.1,[x-w*.35,y-35,w*.7,35]);
const sacks=(id,x,y,w=140)=>obj(id,'details',9,x,y,w,w*.64,[x-w*.36,y-26,w*.72,26]);
const lamp=(id,x,y,w=36)=>obj(id,'world',14,x,y,w,w*2.08,[x-10,y-13,20,13]);
const table=(id,x,y,w=165)=>obj(id,'world',9,x,y,w,w*.42,[x-w*.38,y-22,w*.76,22]);
const arch=(id,index,x,y,w=280)=>obj(id,'cityArchitectureV19',index,x,y,w,w*A[index].sourceRect[3]/A[index].sourceRect[2],[0,6].includes(index)?null:[x-w*.37,y-45,w*.74,45]);
const furnishing=(id,index,x,y,w=160,box=null)=>obj(id,'cityFurnishingsV19',index,x,y,w,w*F[index].sourceRect[3]/F[index].sourceRect[2],box);
const bed=(id,x,y)=>obj(id,'medicalProps',1,x,y,160,100,[x-62,y-44,124,44],{v13Bed:true});
const paper=(id,x,y)=>obj(id,'details',5,x,y,43,27,null,{flat:true,depthY:y+30});
const plant=(id,x,y,w=65)=>obj(id,'details',6,x,y,w,w*1.06,null,{flat:true});
const npc=(id,name,x,y,sprite=3,extra={})=>({id,name,x,y,sprite,angle:Math.PI/2,interactionRadius:108,...extra});
const prop=(id,label,x,y,sheet='details',index=5,w=62,h=45)=>({id:'v25-'+id,action:'v25:task:'+id,label,x,y,interactX:x,interactY:y+66,art:{sheet,index,w,h},box:null});
const terrain=(base,points,material=0,width=132)=>({sheet:'terrain',base,paths:points?.length?[{asset:material,width,points}]:[],patches:[]});
const map=(name,chapter,theme,sub,extra={})=>({name,sub,chapterRegion:chapter,width:1600,height:1080,worldV4:true,entry:[280,760],floor:'stone',doors:[],npcs:[],props:[],spawns:[],safe:false,blocks:[],sagaV25:{chapter,theme},v18Music:chapter===6?'road':chapter===7?'memory':'sanctuary',...extra});
export const SAGA_MAPS_V25={
 ch6Outpost:map('禁地外哨',6,'abandoned-checkpoint','白光照不到的路边，散着行囊和断了绳的水壶。哨棚下传来甲片声。',{safe:true,entry:[280,760],npcs:[npc('ch5SquareMusician','乐师',435,690,4)],props:[prop('outpost-track','断绳的行囊',1215,480,'details',7,66,58)]}),
 ch6ReedWild:map('芦苇野径',6,'reed-and-mud','泥路从水洼间穿过。背风的草叶上还挂着灰白的露。',{props:[prop('dye-leaf','乌叶果',410,345,'details',6,55,47),prop('dye-bark','赤根',1120,340,'details',6,50,45),prop('dye-clay','细苇绒',1270,790,'details',6,53,47)]}),
 ch6VillageLane:map('芦湾村口',6,'low-thatched-lane','晾着的渔网遮住半条小巷。有人蹲在门前，把磨破的鞋底又缝了一层。',{safe:true,npcs:[npc('v25VillageHost','阿绢',830,615,7)],props:[prop('disguise-basin','门边的清水罐',670,400,'world',13,48,51)]}),
 ch6VillageSquare:map('晒盐广场',6,'salt-village-square','秤砣还没放稳，等着过秤的人已经排到了井边。',{safe:true,npcs:[npc('v25TaxClerk','税吏',1120,475,3),npc('v25Villager','老杜',760,665,2),npc('v25YoungWoman','阿棠',1020,730,6),npc('v25Witness','货郎',445,530,4)],props:[prop('tax-notice','钉在木板上的税单',1280,450,'details',4,87,107)]}),
 ch6TaxWarehouse:map('盐税仓院',6,'confiscated-salt-yard','盐袋堆得比窗台还高，搬货的人却连一碗水也不敢先喝。',{props:[prop('tax-ledger','摊开的入仓账',1130,400),prop('ration-sack','系紧口的粮袋',430,400,'details',9,102,72),prop('warehouse-cache','留在梁下的行囊',1240,780,'world',12,76,82)]}),
 ch6ConvoyRoad:map('北埠车道',6,'convoy-road','车轮把湿土压成深沟。路边留着半只草鞋，鞋带还系着。',{props:[prop('convoy-list','押送名册',1210,355),prop('convoy-lock','车旁的铁锁',1175,755,'details',7,58,49),prop('convoy-cache','裹得很紧的包袱',435,355,'world',12,74,82)]}),
 ch6Riverside:map('渡口旧屋',6,'riverside-refuge','屋里腾出了两张铺。有人把新烧的水放在门边，便轻轻带上门。',{safe:true,npcs:[npc('v25Ferryman','渡船老人',1060,560,2)],props:[prop('ferry-supply','渡船老人留下的包裹',1090,385,'details',7,66,51)]}),
 ch7Camp:map('临河客舍',7,'present-day-rest','窗外的船桨偶尔响一声。灯芯剪短了，桌上的茶还没有凉。',{safe:true,props:[prop('memory-listen','窗边的旧长凳',825,690,'world',10,150,55)]}),
 ch7BrokerLane:map('石阶暗巷',7,'rainy-city-backlane','那一夜下着小雨。被掩住的门缝里，露出了一角写错名字的契纸。',{props:[prop('broker-route','湿了半边的交货签',1170,440,'details',7,53,47)]}),
 ch7BrokerVault:map('销契密库',7,'underground-contract-vault','架上的木盒按人名排着。有些已经空了，欠款却还记在里面。',{props:[prop('broker-proof','钉在账册里的旧契',1180,390),prop('broker-cache','没有署名的铁匣',450,790,'world',12,76,84)]}),
 ch7GrainWharf:map('饥河码头',7,'grain-wharf','锅底已经刮干净了，满载的粮船却仍停在河心，等一个好价钱。',{props:[prop('grain-pass','船工藏下的舱牌',1220,720,'details',7,57,46)]}),
 ch7GrainHold:map('粮船底舱',7,'timber-grain-hold','舱口关着，米粒却从麻袋缝里落下来。人挨饿时，这声响格外清楚。',{props:[prop('grain-manifest','盖过两次印的运粮单',1130,405),prop('grain-open','被绳子拴住的舱门',1260,740,'world',12,95,105),prop('grain-cache','油布包着的谢礼',440,420,'details',7,65,55)]}),
 ch7OdricPass:map('风雨隘口',7,'military-mountain-pass','雨把山道冲窄了一半，老兵仍把队伍里最慢的人留在自己前面。',{npcs:[npc('odric','奥德里克',890,595,8)],props:[prop('odric-banner','被泥压住的旧旗袋',1210,395,'details',7,66,52)]}),
 ch7MarthaHospice:map('溪畔药舍',7,'hospice-woodland','药炉不分给谁熬药。棚下的人挪了挪，把仅剩的干处让出来。',{npcs:[npc('martha','玛尔塔夫人',795,610,11)],props:[prop('martha-herbs','药篓里的缺口',1170,735,'details',6,63,54)]}),
 ch7SeverinBridge:map('旧石桥',7,'border-bridge','桥头两边都有人说自己奉命办事。站在中间的那个人先让孩子过去。',{npcs:[npc('severin','塞维尔',960,585,10)],props:[prop('severin-record','桥栏下的证人口供',1230,770)]}),
 ch8FlightRavine:map('断雾山径',8,'pursuit-ravine','身后的脚步始终不急。前面的山雾里，只有一条贴着水声的窄路。',{props:[prop('flight-mark','雾里透光的石缝',1250,380,'details',3,90,57)]}),
 ch8HiddenGate:map('花隐溪门',8,'flower-hidden-boundary','风突然停了。白花落在溪面，过了石阶便不再向外漂。',{safe:true,props:[prop('boundary-gate','石阶旁的旧界石',1150,420,'hellWorld',4,90,63)]}),
 ch8FlowerCourt:map('秘境花庭',8,'flower-court','花荫下留着一张旧桌。桌脚垫了薄石片，杯里的水终于不再向一边偏。',{safe:true,npcs:[npc('chengli','澄璃',865,575,1)],props:[prop('flower-tea','树荫下的茶桌',700,630,'cityFurnishingsV19',1,162,115),prop('boundary-court','花庭外的界石',1220,700,'hellWorld',4,96,67)]}),
 ch8GuestHouse:map('临溪客舍',8,'sanctuary-guest-room','窗帘留了一道缝，能听见溪流。柜上放着叠好的干衣与一盆温水。',{safe:true,props:[prop('guest-rest','铺平的被褥',1080,520,'medicalProps',1,160,100),prop('guest-supply','窗台上的药包',430,395,'details',7,61,47)]}),
 ch8DawnTerrace:map('晨露剑坪',8,'dawn-sword-terrace','台阶上还湿着。剑坪没有喝彩声，只听见收剑时衣袖擦过护腕。',{safe:true,props:[prop('dawn-practice','磨光的练剑木桩',1130,460,'newProps',4,88,139),prop('boundary-dawn','崖边的界石',1220,775,'hellWorld',4,91,64)]}),
 ch8StoneTrial:map('折瀑石阶',8,'waterfall-stair-trial','瀑声从石阶下面传来。每上一层，落脚的地方都比眼睛看见的更窄。',{props:[prop('stone-tablet','石阶尽头的残刻',1210,390,'details',3,98,63),prop('stone-nest','低处石缝里的鸟窝',405,405,'newProps',15,55,43),prop('stone-cache','干石台上的布包',1130,815,'details',7,64,51)]}),
 ch8MirrorTrial:map('澄潭镜洞',8,'clear-water-mirror-cave','洞里很静。水面映出举剑的人，倒影却迟了半拍。',{props:[prop('mirror-shard','嵌在岩壁中的旧界片',1190,435,'hellWorld',4,81,57),prop('mirror-cache','石边的旧匣',415,370,'world',12,74,82)]}),
 ch8StormTrial:map('风雨悬台',8,'storm-suspended-court','雨线横着掠过石台。台上的旧剑像，每一处磨损都像真正握过剑的人。',{props:[prop('storm-bell','悬台上的铜铃',1160,430,'newProps',7,54,104),prop('boundary-storm','断栏后的界石',1240,780,'hellWorld',4,93,65)]}),
 ch8LastSanctum:map('花庭后殿',8,'last-sanctuary-defense','后殿的窗映着花影。三处界石的光沿石纹汇到门前，仍没有熄。',{safe:true,props:[prop('last-ward','后殿门前的界石',1160,400,'hellWorld',4,105,74),prop('spirit-rest','窗前的置剑架',750,425,'newProps',3,125,133)]})
};
// Existing original musical motifs, assigned to each new setting.
for(const [id,theme]of Object.entries({"ch6Outpost":"tension","ch6ReedWild":"road","ch6VillageLane":"hearth","ch6VillageSquare":"tension","ch6TaxWarehouse":"tension","ch6ConvoyRoad":"tension","ch6Riverside":"river","ch7Camp":"hearth","ch7BrokerLane":"memory","ch7BrokerVault":"tension","ch7GrainWharf":"river","ch7GrainHold":"tension","ch7OdricPass":"road","ch7MarthaHospice":"hearth","ch7SeverinBridge":"memory","ch8FlightRavine":"tension","ch8HiddenGate":"sanctuary","ch8FlowerCourt":"sanctuary","ch8GuestHouse":"hearth","ch8DawnTerrace":"river","ch8StoneTrial":"road","ch8MirrorTrial":"nightSky","ch8StormTrial":"tension","ch8LastSanctum":"sanctuary"}))SAGA_MAPS_V25[id].v18Music=theme;
const scenery={
 ch6Outpost:[wall('out-w1',630,405,290),wall('out-w2',1070,815,240),obj('out-tent','hellWorld',8,450,320,295,198,[340,280,220,40]),crate('out-box',455,840),fence('out-barrier',1040,420,240),lamp('out-lamp',1060,560)],
 ch6ReedWild:[tree('reed-t1',350,520,240),tree('reed-t2',755,350,245),tree('reed-t3',1350,600,250),tree('reed-t4',945,875,230),rock('reed-r1',660,695,180),rock('reed-r2',1110,460,150),plant('reed-a',490,335),plant('reed-b',1300,865),plant('reed-c',1170,245)],
 ch6VillageLane:[house('lane-h1',465,390,345),house('lane-h2',1160,320,325),house('lane-h3',1220,920,295),fence('lane-f1',575,800,185),fence('lane-f2',335,940),tree('lane-tree',965,435,240),obj('lane-well','world',8,705,440,106,109,[671,411,68,29]),lamp('lane-lamp',1280,545)],
 ch6VillageSquare:[house('sq-h1',420,315,330),house('sq-h2',1280,305,320),obj('sq-salt','details',9,435,835,165,100,[375,808,120,27]),obj('sq-well','world',8,780,440,125,132,[740,405,80,35]),table('sq-desk',1110,430),fence('sq-west',365,740,150),tree('sq-tree',1260,880,200),lamp('sq-lamp',1030,805)],
 ch6TaxWarehouse:[house('tax-front',820,295,420),crate('tax-b1',495,470,100),crate('tax-b2',495,590,100),crate('tax-b3',950,780,100),crate('tax-b4',1090,780,100),sacks('tax-s1',620,405,180),sacks('tax-s2',1260,555,175),sacks('tax-s3',750,885,150),table('tax-table',1130,420),lamp('tax-light',1360,475)],
 ch6ConvoyRoad:[tree('con-tree1',420,515,230),tree('con-tree2',1240,910,210),obj('con-cart','qualityWorld',3,1135,740,215,146,[1050,693,170,47]),crate('con-box',1220,480),fence('con-fence',650,370,225),sacks('con-sacks',465,285,130),wall('con-wall',920,910,190)],
 ch6Riverside:[house('river-house',495,360,350),furnishing('river-bench',6,1120,430,225,[1036,405,168,25]),table('river-table',970,675),tree('river-tree',1230,885,240),obj('river-pier','details',8,1070,835,260,103,null,{flat:true,depthY:0}),lamp('river-lamp',1070,495),bed('river-bed',480,530)],
 ch7Camp:[furnishing('camp-window',0,805,340,315),furnishing('camp-tea',1,900,530,188,[829,508,142,22]),bed('camp-bed',450,460),obj('camp-shelf','world',11,1180,425,145,173,[1120,390,120,35]),lamp('camp-lamp',1120,670),furnishing('camp-flower',7,460,830,150,[410,813,100,17])],
 ch7BrokerLane:[house('broker-l1',470,420,390),house('broker-l2',1190,320,310),house('broker-l3',1160,920,390),wall('broker-wall',825,420,215),crate('broker-bin',950,825),lamp('broker-lamp1',665,530),lamp('broker-lamp2',1320,650)],
 ch7BrokerVault:[obj('vault-shelf1','world',11,420,430,215,225,[337,397,166,33]),obj('vault-shelf2','world',11,715,330,230,234,[620,295,190,35]),obj('vault-shelf3','world',11,1110,330,215,225,[1027,297,166,33]),table('vault-table',1170,430,180),crate('vault-crate1',540,760,92),crate('vault-crate2',680,760,92),wall('vault-wall',1010,905,310),lamp('vault-lamp',365,525)],
 ch7GrainWharf:[sacks('wharf-grain1',440,400,195),sacks('wharf-grain2',650,380,175),crate('wharf-crate',620,755,96),obj('wharf-pier','details',8,1195,820,400,160,null,{flat:true,depthY:0}),house('wharf-office',450,940,315),lamp('wharf-lamp',1110,625),obj('wharf-abandoned-cart','qualityWorld',3,1300,565,205,135,[1218,535,164,30])],
 ch7GrainHold:[sacks('hold-s1',475,330,240),sacks('hold-s2',1090,340,230),sacks('hold-s3',440,885,230),sacks('hold-s4',1070,870,220),crate('hold-box1',795,440,105),crate('hold-box2',795,740,100),table('hold-desk',1130,435,170),lamp('hold-light',1270,610)],
 ch7OdricPass:[rock('pass-r1',490,485,245),rock('pass-r2',755,305,180),rock('pass-r3',1260,870,210),tree('pass-tree',1240,420,255),fence('pass-f1',420,855,235),obj('pass-tent','hellWorld',8,1000,280,275,181,[891,252,218,28]),lamp('pass-lamp',1070,390)],
 ch7MarthaHospice:[house('hospice-house',625,365,375),obj('hospice-medicine','world',2,1130,395,250,204,[1030,361,200,34]),bed('hospice-bed1',450,790),bed('hospice-bed2',680,835),tree('hospice-tree',1190,875,240),table('hospice-table',1080,675,150),plant('hospice-herb1',390,520),plant('hospice-herb2',1300,540)],
 ch7SeverinBridge:[arch('bridge-main',6,810,648,380),wall('bridge-w1',610,400,165),wall('bridge-w2',1010,400,165),wall('bridge-w3',610,820,165),wall('bridge-w4',1010,820,165),tree('bridge-tree',1280,315,245),lamp('bridge-l1',535,565),lamp('bridge-l2',1080,670)],
 ch8FlightRavine:[rock('flight-r1',485,490,260),rock('flight-r2',850,335,205),rock('flight-r3',1110,760,220),rock('flight-r4',510,895,220),tree('flight-t1',1260,425,200),tree('flight-t2',315,345,245)],
 ch8HiddenGate:[table('hidden-wash-table',1180,630,95),obj('hidden-wash-jug','world',13,1180,606,42,44,null,{depthY:631}),obj('hidden-aid-table','world',9,1020,700,185,78,[950,674,140,26]),arch('hidden-glass',4,1175,375,320),arch('hidden-gate',0,810,520,300),furnishing('hidden-flowers1',7,455,485,180,[395,465,120,20]),furnishing('hidden-flowers2',7,1140,795,220,[1065,774,150,21]),tree('hidden-tree',390,895,260),tree('hidden-tree2',1300,590,240),lamp('hidden-lamp',870,835)],
 ch8FlowerCourt:[arch('flower-pavilion',4,1000,310,400),tree('flower-big-tree',440,485,310),furnishing('flower-bed1',7,435,805,210,[361,785,148,20]),furnishing('flower-bed2',7,1150,520,220,[1075,499,150,21]),furnishing('flower-bench',6,1145,900,250,[1053,874,184,26]),furnishing('flower-rail',2,810,880,220,[711,861,198,19]),lamp('flower-lamp',1040,720)],
 ch8GuestHouse:[furnishing('guest-window',0,1090,330,280),obj('guest-shelf','world',11,455,355,153,170,[397,329,116,26]),obj('guest-table','world',9,630,666,170,73,[568,648,124,18]),obj('guest-third-chair','actors',13,630,745,66,66,[610,732,40,13]),obj('guest-saint-chair-v27','actors',13,715,650,39,63,[702,632,26,17],{depthY:649.5}),obj('guest-paper','details',5,652,614,32,20,null,{flat:true,depthY:667}),obj('guest-repair-cup','sagaTeaV25',0,614,620,38,30,null,{flat:true,depthY:667.1}),obj('guest-basin','world',13,510,455,49,52),furnishing('guest-flowers',7,1080,880,185,[1017,862,126,18]),lamp('guest-lamp',1140,680)],
 ch8DawnTerrace:[furnishing('dawn-north-rail',2,800,315,300,[665,293,270,22]),furnishing('dawn-west-flower',7,410,455,180,[348,436,124,19]),furnishing('dawn-east-flower',7,1200,890,180,[1138,871,124,19]),tree('dawn-tree',1260,350,230),rock('dawn-rock',480,820,145),furnishing('dawn-bench',6,835,915,200,[761,893,148,22])],
 ch8StoneTrial:[rock('stone-r1',465,440,240),rock('stone-r2',730,815,260),rock('stone-r3',1140,355,215),rock('stone-r4',1240,840,190),arch('stone-bridge',6,830,620,330),plant('stone-grass',435,390,52),tree('stone-tree',430,855,225)],
 ch8MirrorTrial:[rock('mirror-r1',470,520,225),rock('mirror-r2',760,320,230),rock('mirror-r3',1170,895,240),rock('mirror-r4',1330,550,150),obj('mirror-crystal1','hellWorld',4,1160,370,180,125,[1105,345,110,25]),obj('mirror-crystal2','hellWorld',4,445,855,130,91,[405,837,80,18]),lamp('mirror-l1',690,905),lamp('mirror-l2',1290,345)],
 ch8StormTrial:[furnishing('storm-rail1',2,590,340,265,[471,318,238,22]),furnishing('storm-rail2',2,1110,340,260,[993,318,234,22]),furnishing('storm-rail3',2,520,885,230,[416,863,208,22]),rock('storm-r1',410,525,130),rock('storm-r2',1280,890,120),arch('storm-bell',7,1300,435,115)],
 ch8LastSanctum:[obj('last-rest-bench','socialBenchesV20',1,810,785,220,60,[730,761,160,24]),arch('last-window1',4,460,345,275),arch('last-window2',4,1185,345,285),furnishing('last-flowers1',7,430,830,210,[357,809,146,21]),furnishing('last-flowers2',7,1210,855,220,[1133,833,154,22]),furnishing('last-rail',2,820,305,250,[707,283,226,22]),lamp('last-lamp1',575,535),lamp('last-lamp2',1040,520)]
};
SAGA_MAPS_V25.ch6Outpost.ambientActors=[npc('v25-fallen-traveler-a','',590,775,4,{fall:1.08}),npc('v25-fallen-villager-b','',900,380,7,{fall:1.08}),npc('v25-fallen-traveler-c','',1190,870,6,{fall:1.08}),npc('guard1','',890,875,8,{fall:1.08}),npc('v25-fallen-courier-d','',1280,325,4,{fall:1.08})];
export const SAGA_SCENERY_V25=scenery;
export const SAGA_GROUND_V25={
 ch6Outpost:terrain(4,[[165,760],[575,720],[880,620],[1220,520],[1430,430]],12,135),
 ch6ReedWild:terrain(4,[[165,760],[550,785],[825,580],[1065,625],[1430,650]],5,125),
 ch6VillageLane:terrain(4,[[165,650],[740,650],[920,560],[1430,650]],0,138),
 ch6VillageSquare:terrain(0,[[170,650],[1430,650]],4,190),
 ch6TaxWarehouse:terrain(4,[[800,950],[820,640],[1190,600],[1430,650]],0,150),
 ch6ConvoyRoad:terrain(4,[[170,650],[540,650],[875,540],[1430,650]],5,210),
 ch6Riverside:terrain(4,[[170,650],[570,640],[720,810],[1050,855],[1430,760]],0,115),
 ch7Camp:terrain(8),ch7BrokerLane:terrain(12,[[170,760],[790,720],[835,555],[1430,560]],0,140),ch7BrokerVault:terrain(12),
 ch7GrainWharf:terrain(4,[[170,760],[785,720],[900,600],[1380,650]],8,148),ch7GrainHold:terrain(8),
 ch7OdricPass:terrain(4,[[170,760],[800,735],[890,580],[1430,450]],12,140),
 ch7MarthaHospice:terrain(4,[[170,650],[855,660],[1140,545],[1430,500]],0,105),
 ch7SeverinBridge:terrain(4,[[170,600],[620,600],[950,600],[1430,650]],0,155),
 ch8FlightRavine:terrain(12,[[170,760],[665,760],[800,560],[1030,560],[1430,410]],4,135),
 ch8HiddenGate:terrain(4,[[170,760],[690,760],[795,620],[1040,630],[1430,650]],0,125),
 ch8FlowerCourt:terrain(4,[[170,650],[1430,650]],0,140),ch8GuestHouse:terrain(8),
 ch8DawnTerrace:terrain(0,[[170,650],[1430,650]],4,115),
 ch8StoneTrial:terrain(12,[[170,760],[650,650],[930,575],[1120,625],[1430,650]],0,140),
 ch8MirrorTrial:terrain(12,[[170,650],[690,650],[930,740],[1190,660],[1430,650]],4,130),
 ch8StormTrial:terrain(12),ch8LastSanctum:terrain(0)
};
export const SAGA_WATER_V25={
 ch6ReedWild:[[710,180,200,200],[1040,805,155,150]],ch6Riverside:[[780,170,210,260],[780,450,210,290]],
 ch7GrainWharf:[[950,170,465,360]],ch7SeverinBridge:[[720,160,190,325],[720,660,190,300]],
 ch8HiddenGate:[[665,180,160,220]],ch8StoneTrial:[[730,150,180,320],[730,695,180,260]],ch8MirrorTrial:[[720,360,295,175]],ch8FlowerCourt:[[580,190,155,175]]
};
// Raster borders establish a place beyond the walkable field. They are inside
// the existing solid map perimeter; door apertures stay visually open as well.
const rooms=new Set(['ch7Camp','ch7BrokerVault','ch7GrainHold','ch8GuestHouse']);
const stony=new Set(['ch6Outpost','ch7BrokerLane','ch8FlightRavine','ch8StoneTrial','ch8MirrorTrial','ch8StormTrial','ch8LastSanctum']);
for(const[id,m]of Object.entries(SAGA_MAPS_V25)){
 for(let i=0;i<9;i++){
  const x=70+i*182;
  if(rooms.has(id))scenery[id].push(wall(id+'-north-masonry-'+i,x,158,205),wall(id+'-south-masonry-'+i,x,1075,205));
  else if(stony.has(id))scenery[id].push(rock(id+'-north-rock-'+i,x,140,210),rock(id+'-south-rock-'+i,x,1100,190));
  else scenery[id].push(tree(id+'-north-green-'+i,x,147+(i%2)*5,235),tree(id+'-south-green-'+i,x,1120+(i%2)*13,245));
 }
 for(let i=0;i<4;i++){
  const y=235+i*220;
  scenery[id].push(rooms.has(id)?wall(id+'-west-edge-'+i,38,y,130):stony.has(id)?rock(id+'-west-edge-'+i,25,y,150):tree(id+'-west-edge-'+i,30,y,210));
  scenery[id].push(rooms.has(id)?wall(id+'-east-edge-'+i,1570,y,130):stony.has(id)?rock(id+'-east-edge-'+i,1580,y,150):tree(id+'-east-edge-'+i,1580,y,210));
 }
 // No extra collision from decorative geometry placed in the already-solid edge.
 for(const o of scenery[id])if(/-(?:north-masonry|south-masonry|north-rock|south-rock|north-green|south-green|west-edge|east-edge)-/.test(o.id))o.box=null;
 for(const[j,[x,y,w,h]]of(SAGA_WATER_V25[id]||[]).entries()){
  for(let k=0;k<Math.ceil(h/62);k++)for(const edge of[x,x+w])scenery[id].push(obj(id+'-bank-'+j+'-'+edge+'-'+k,'details',3,edge+(k%2?5:-4),y+k*62+20,46+(k%2)*10,29,null,{flat:true,depthY:0}));
  for(let k=0;k<Math.ceil(w/69);k++)for(const edge of[y,y+h])scenery[id].push(obj(id+'-shore-'+j+'-'+edge+'-'+k,'details',3,x+k*69+18,edge+10,51,29,null,{flat:true,depthY:0}));
 }
}
const at={W:[170,650],E:[1430,650],N:[800,180],S:[800,940],SW:[170,760],NE:[1430,430]};
function inward([x,y]){return [x<210?280:x>1390?1320:x,y<210?290:y>910?830:y];}
function link(a,b,sideA='E',sideB='W'){
 const aa=Array.isArray(sideA)?sideA:at[sideA],bb=Array.isArray(sideB)?sideB:at[sideB];
 SAGA_MAPS_V25[a].doors.push({x:aa[0],y:aa[1],to:b,tx:inward(bb)[0],ty:inward(bb)[1],label:SAGA_MAPS_V25[b].name,direction:aa[0]<210?'西':aa[0]>1390?'东':aa[1]<210?'北':'南',manualOnly:true,gate:'v25:route:'+b});
 SAGA_MAPS_V25[b].doors.push({x:bb[0],y:bb[1],to:a,tx:inward(aa)[0],ty:inward(aa)[1],label:SAGA_MAPS_V25[a].name,direction:bb[0]<210?'西':bb[0]>1390?'东':bb[1]<210?'北':'南',manualOnly:true,gate:'v25:route:'+a});
}
link('ch6Outpost','ch6ReedWild','NE','SW');link('ch6ReedWild','ch6VillageLane');link('ch6VillageLane','ch6VillageSquare');
link('ch6VillageSquare','ch6TaxWarehouse','N','S');link('ch6TaxWarehouse','ch6ConvoyRoad');link('ch6VillageSquare','ch6ConvoyRoad');link('ch6VillageSquare','ch6Riverside','S',[1200,180]);link('ch6ConvoyRoad','ch6Riverside','S','E');link('ch6Riverside','ch7Camp',[1430,760],'SW');
link('ch7Camp','ch7BrokerLane','N','SW');link('ch7BrokerLane','ch7BrokerVault',[1430,560],'W');link('ch7Camp','ch7GrainWharf','E','SW');link('ch7GrainWharf','ch7GrainHold','E','W');link('ch7Camp','ch7OdricPass','S','SW');link('ch7OdricPass','ch7MarthaHospice',[1430,450],'W');link('ch7MarthaHospice','ch7SeverinBridge',[1430,500],[170,600]);link('ch7Camp','ch8FlightRavine',[1430,870],'SW');
link('ch8FlightRavine','ch8HiddenGate',[1430,410],'SW');link('ch8HiddenGate','ch8FlowerCourt');link('ch8FlowerCourt','ch8GuestHouse','S','N');link('ch8FlowerCourt','ch8DawnTerrace');link('ch8DawnTerrace','ch8StoneTrial','E','SW');link('ch8StoneTrial','ch8MirrorTrial');link('ch8MirrorTrial','ch8StormTrial');link('ch8FlowerCourt','ch8LastSanctum','N','S');
function boundary(doors){const out=[];function intervals(start,end,centers){let p=start;for(const c of [...centers].sort((a,b)=>a-b)){const lo=Math.max(start,c-112),hi=Math.min(end,c+112);if(lo>p)out.push([p,lo-p]);p=Math.max(p,hi);}if(end>p)out.push([p,end-p]);return out.splice(0);}
 return [...intervals(0,1600,doors.filter(d=>d.y<210).map(d=>d.x)).map(([p,n])=>[p,0,n,150]),...intervals(0,1600,doors.filter(d=>d.y>910).map(d=>d.x)).map(([p,n])=>[p,965,n,115]),...intervals(150,965,doors.filter(d=>d.x<210).map(d=>d.y)).map(([p,n])=>[0,p,130,n]),...intervals(150,965,doors.filter(d=>d.x>1390).map(d=>d.y)).map(([p,n])=>[1470,p,130,n])];}
SAGA_MAPS_V25.ch6Outpost.doors.unshift({x:170,y:760,to:'ch5Exit',tx:1230,ty:650,label:'禁地出口',direction:'西南',manualOnly:true,gate:'v25:return-ch5'});
for(const[id,m]of Object.entries(SAGA_MAPS_V25)){
 const edge=boundary(m.doors);scenery[id]=scenery[id].filter(o=>!m.doors.some(d=>Math.abs(o.x-d.x)<185&&((o.y>1000&&d.y>910)||(o.y<170&&d.y<210))||Math.abs(o.y-d.y)<180&&((o.x<100&&d.x<210)||(o.x>1500&&d.x>1390))));m.blocks=[...edge,...scenery[id].filter(o=>o.box).map(o=>o.box),...m.props.filter(o=>o.box).map(o=>o.box),...(SAGA_WATER_V25[id]||[])];m.scenery=scenery[id];m.sagaV25.boundary=edge;
 // Three known support points; the early story demonstrates their later function.
 m.sagaV25.stage=id==='ch6Riverside'?{hero:[600,650],saint:[685,700],chengli:[660,560]}:id==='ch7SeverinBridge'?{hero:[745,590],saint:[830,620],chengli:[1000,585]}:id==='ch8StoneTrial'?{hero:[755,565],saint:[835,625],chengli:[930,570]}:{hero:[760,675],saint:[845,700],chengli:[905,585]};
}
const group=(key,types,x,y)=>types.map((type,i)=>[type,x+(i%2)*90,y+Math.floor(i/2)*85,'v25-'+key+'-'+i]);
const enc=(map,groups)=>({map,spawns:groups.flat()});
export const SAGA_ENCOUNTERS_V25={
 ch6Patrol:enc('ch6Outpost',[group('patrol-a',['v25Watchman','v25Watchman'],710,515),group('patrol-b',['v25Watchman','v25RoadHunter','v25Watchman'],1080,610)]),
 ch6CollectDisguise:enc('ch6ReedWild',[group('dye-a',['v25ReedWolf','v25ReedWolf'],545,575),group('dye-b',['v25ReedWolf','v25ReedWolf'],1000,600)]),
 ch6TaxLedger:enc('ch6TaxWarehouse',[group('tax-a',['v25TaxGuard','v25RoadHunter'],675,600),group('tax-b',['v25TaxGuard','v25ConvoyOfficer'],1120,575)]),
 ch6RescueConvoy:enc('ch6ConvoyRoad',[group('convoy-a',['v25TaxGuard','v25RoadHunter'],650,600),group('convoy-b',['v25ConvoyOfficer','v25TaxGuard','v25RoadHunter'],1110,540)]),
 ch7BrokerApproach:enc('ch7BrokerLane',[group('broker-a',['v25BrokerBlade','v25BrokerBlade'],660,645),group('broker-b',['v25RoadHunter','v25BrokerBlade'],1080,555)]),
 ch7BrokerContract:enc('ch7BrokerVault',[group('broker-chief',['v25BrokerChief'],980,580),group('broker-retinue',['v25BrokerBlade','v25RoadHunter'],630,565)]),
 ch7GrainApproach:enc('ch7GrainWharf',[group('wharf-a',['v25GrainGuard','v25GrainGuard'],580,550),group('wharf-b',['v25RoadHunter','v25GrainGuard'],1140,620)]),
 ch7GrainContract:enc('ch7GrainHold',[group('hold-a',['v25GrainGuard','v25GrainOfficer'],545,580),group('hold-b',['v25GrainGuard','v25GrainChief','v25RoadHunter'],1030,570)]),
 ch7HelpOdric:enc('ch7OdricPass',[group('odric-a',['v25RidgeRaider','v25RidgeRaider'],660,660),group('odric-b',['v25MoorWolf','v25RidgeRaider'],1060,695)]),
 ch7HelpMartha:enc('ch7MarthaHospice',[group('martha-a',['v25MoorWolf','v25MoorWolf'],510,600),group('martha-b',['v25RidgeRaider','v25MoorWolf'],1050,570)]),
 ch7HelpSeverin:enc('ch7SeverinBridge',[group('severin-a',['v25GrainGuard','v25RoadHunter'],490,680),group('severin-b',['v25BridgeMarshal','v25RidgeRaider'],1100,580)]),
 ch8Escape:enc('ch8FlightRavine',[group('flight-a',['v25PursuitGuard','v25PursuitGuard'],690,630),group('flight-b',['v25PursuitGuard','v25RoadHunter'],1080,505)]),
 ch8DawnPractice:enc('ch8DawnTerrace',[group('dawn-a',['v25StoneWarden','v25StoneWarden'],930,595)]),
 ch8StoneTrial:enc('ch8StoneTrial',[group('stone-a',['v25StoneWarden','v25WindHound'],500,610),group('stone-b',['v25StoneWarden','v25PoolWisp','v25WindHound'],1050,535)]),
 ch8MirrorTrial:enc('ch8MirrorTrial',[group('mirror-a',['v25PoolWisp','v25StoneWarden'],520,685),group('mirror-b',['v25PoolWisp','v25PoolWisp','v25WindHound'],1090,630)]),
 ch8StormTrial:enc('ch8StormTrial',[group('storm-master',['v25TrialMaster'],1030,580)]),
 ch8DefendBoundary:enc('ch8FlowerCourt',[group('boundary-a',['v25SealGuard','v25PursuitGuard'],570,680),group('boundary-b',['v25SealGuard','v25RoadHunter'],1110,610)]),
 ch8FinalDuel:enc('ch8LastSanctum',[group('final-judge',['v25FinalJudge'],1040,645)])
};
const tasks={
 ch6CollectDisguise:{map:'ch6ReedWild',props:['dye-leaf','dye-bark','dye-clay']},ch6MakeDisguise:{map:'ch6VillageLane',props:['disguise-basin']},ch6ReadTax:{map:'ch6VillageSquare',props:['tax-notice']},ch6TaxLedger:{map:'ch6TaxWarehouse',props:['tax-ledger','ration-sack']},ch6RescueConvoy:{map:'ch6ConvoyRoad',props:['convoy-list','convoy-lock']},ch6FerrySupply:{map:'ch6Riverside',props:['ferry-supply']},
 ch7BrokerApproach:{map:'ch7BrokerLane',props:['broker-route']},ch7BrokerContract:{map:'ch7BrokerVault',props:['broker-proof']},ch7GrainApproach:{map:'ch7GrainWharf',props:['grain-pass']},ch7GrainContract:{map:'ch7GrainHold',props:['grain-manifest','grain-open']},ch7HelpOdric:{map:'ch7OdricPass',props:['odric-banner']},ch7HelpMartha:{map:'ch7MarthaHospice',props:['martha-herbs']},ch7HelpSeverin:{map:'ch7SeverinBridge',props:['severin-record']},
 ch8Escape:{map:'ch8FlightRavine',props:['flight-mark']},ch8DawnPractice:{map:'ch8DawnTerrace',props:['dawn-practice']},ch8StoneTrial:{map:'ch8StoneTrial',props:['stone-tablet']},ch8MirrorTrial:{map:'ch8MirrorTrial',props:['mirror-shard']},ch8StormTrial:{map:'ch8StormTrial',props:['storm-bell']},ch8DefendBoundary:{map:'ch8FlowerCourt',props:['boundary-court']},ch8FinalDuel:{map:'ch8LastSanctum',props:[]}
};
export const SAGA_WORLD_TASKS_V25=Object.fromEntries(Object.entries(tasks).map(([id,t])=>[id,{id,map:t.map,propIds:t.props.map(p=>'v25-'+p),enemyIds:(SAGA_ENCOUNTERS_V25[id]?.spawns||[]).map(s=>s[3]),spawns:SAGA_ENCOUNTERS_V25[id]?.spawns||[]}]));
export function registerSagaWorldV25(){
 registerSagaCombatV25();
 for(const[id,m]of Object.entries(SAGA_MAPS_V25)){if(MAPS[id]?.sagaV25)continue;MAPS[id]=clone(m);SCENERY[id]=clone(scenery[id]);BOUNDARIES[id]=clone(m.sagaV25.boundary);V11_GROUND_STYLE[id]=clone(SAGA_GROUND_V25[id]);}
}
// Root controls encounter lifecycle and death rewards. The helper is intentionally
// idempotent and creates ordinary enemies through the production enemy() pipeline.
export function spawnSagaEncounterV25(g,key){
 const def=SAGA_ENCOUNTERS_V25[key];if(!def||g.map!==def.map)return false;
 for(const[type,x,y,id]of def.spawns){if(g.enemies.some(e=>e.id===id))continue;const at=g.safePoint(x,y),e=g.enemy(type,at.x,at.y,id);e.sagaV25=key;e.groupId=id.replace(/-\d+$/,'');e.cd=1.5;e.leashRadius=700;g.enemies.push(e);}return true;
}
// Call once on the world background, and use this instead of hell ash atmosphere
// on saga maps. Clip only the existing painted water texture; no synthetic objects.
export function drawSagaEnvironmentV25(ctx,bank,id,time=0,front=false){
 const m=SAGA_MAPS_V25[id];if(!m)return false;if(front)return true;
 ctx.save();ctx.imageSmoothingEnabled=true;
 for(const[x,y,w,h]of SAGA_WATER_V25[id]||[]){const f=bank.frame('details',12);if(!f)continue;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.filter='saturate(.42) brightness(.85)';for(let yy=y-128+(time*2)%128;yy<y+h;yy+=128)for(let xx=x;xx<x+w;xx+=128)ctx.drawImage(bank.images.details,f.x,f.y,f.w,f.h,xx,yy,128,128);ctx.restore();}
 const tint=ctx.createLinearGradient(0,0,0,1080);tint.addColorStop(0,m.chapterRegion===8?'#dbeede0c':m.chapterRegion===7?'#2c314922':'#879aac10');tint.addColorStop(1,'#14232b00');ctx.fillStyle=tint;ctx.fillRect(0,0,1600,1080);ctx.restore();return true;
}
