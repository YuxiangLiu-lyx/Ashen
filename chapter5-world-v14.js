// Every placement is a foot coordinate in the existing 1600 × 1080 world.
// Scenery uses authored atlases; collision boxes cover bases, never full artwork.
const door=(x,y,to,tx,ty,label,direction,gate=null)=>({x,y,to,tx,ty,label,direction,...(gate?{gate}:{})});
const npc=(id,name,x,y,sprite=2,angle=Math.PI/2)=>({id,name,x,y,sprite,angle,interactionRadius:100});
const prop=(id,kind,label,x,y,index=13,w=100,h=90,extra={})=>({id,action:'ch5:'+kind,label,x,y,interactX:x,interactY:y+78,art:{sheet:'hellWorld',index,w,h},box:[x-w*.3,y-23,w*.6,23],...extra});
// Art's fixed 4×3 order: gate, storefront, tavern, forge, still, lamp,
// fountain, canopy, table, clock-machine, contract-desk, bridge railing.
const CITY_ASSET=[0,1,1,6,3,4,2,8,9,10,5,11];
const cityProp=(id,kind,label,x,y,index,w=160,h=140,extra={})=>prop(id,kind,label,x,y,CITY_ASSET[index],w,h,{...extra,art:{sheet:'cityWorld',index:CITY_ASSET[index],w,h}});
const scenery=(id,asset,x,y,w=180,h=145,sheet='hellWorld',extra={})=>({id,sheet,asset,x,y,w,h,box:[x-w*.32,y-28,w*.64,28],...extra});
const rock=(id,x,y,w=180,h=120)=>scenery(id,4,x,y,w,h);
const lamp=(id,x,y)=>scenery(id,15,x,y,44,110,'hellWorld',{box:[x-12,y-18,24,18]});
const city=(id,asset,x,y,w=250,h=230)=>scenery(id,CITY_ASSET[asset],x,y,w,h,'cityWorld');
const rubble=(id,x,y)=>scenery(id,6,x,y,165,36,'hellWorld',{flat:true,depthY:0,box:null});
const path=(asset,width,points)=>({asset,width,points});
const ground=(base,paths,patches=[])=>({sheet:'hellWorld',base,paths,patches});
const group=(id,type,x,y)=>[type,x,y,id];
const pack=(prefix,types,x,y)=>types.map((t,i)=>group(prefix+'-'+i,t,x+(i%2)*83,y+Math.floor(i/2)*84));
const mainRoad=ground(3,[path(1,145,[[130,760],[390,760],[620,650],[980,650],[1220,490],[1470,350]])]);
const plazaGround=ground(3,[path(1,160,[[130,650],[1470,650]]),path(1,140,[[800,150],[800,965]])]);

export const CH5_MAPS={
 ch5AshRoad:{name:'白槲旧道',sub:'灰下露出一截旧篱笆。远处的灯，和村道一样熟悉',chapterRegion:5,entry:[280,760],
  doors:[door(170,760,'deepCamp',1160,760,'铁火营地','西南'),door(1430,350,'ch5Memorial',280,760,'老宅庭院','东北')],npcs:[],
  props:[prop('ch5-road-letter','letter','被石块压住的信封',390,350,13,80,68,{limited:true}),prop('ch5-road-ore','gather','残温金砂',1180,800,4,90,75,{resource:'ch5GoldSand',refresh:true})],
  spawns:[...pack('ch5-road-a',['ch5Hound','ch5Hound','ch5Archer'],580,690),...pack('ch5-road-b',['ch5Guard','ch5Archer'],850,280),...pack('ch5-road-c',['ch5Hound','ch5Guard','ch5Archer'],1090,550)]},
 ch5Memorial:{name:'老宅庭院',sub:'门框上还留着量身高的刻痕。有人一直坐在台阶旁',chapterRegion:5,safe:true,entry:[280,760],
  doors:[door(170,760,'ch5AshRoad',1320,350,'白槲旧道','西南'),door(1430,650,'ch5Crossroads',280,760,'裂灯岔道','东','ch5-career')],npcs:[npc('mentor','雷昂',745,605,5,Math.PI/2)],
  props:[prop('ch5-home-mark','home-mark','门柱上的刻痕',1080,370,7,135,185),prop('ch5-home-bed','rest','整理好的旧铺位',425,485,1,148,92,{art:{sheet:'medicalProps',index:1,w:148,h:92},v13Bed:true})],spawns:[]},
 ch5Crossroads:{name:'裂灯岔道',sub:'出口的白光刺得人睁不开眼。西南的石壁后，偶尔传来钟声',chapterRegion:5,safe:true,entry:[280,760],
  doors:[door(170,760,'ch5Memorial',1320,650,'老宅庭院','西南'),door(1430,390,'ch5Gate',280,760,'白昼断桥','东北','ch5-career'),door(800,940,'ch5CityGate',800,290,'阙灯城门','南','ch5-city')],
  npcs:[],props:[prop('ch5-cross-sign','sign','断裂的路牌',765,380,7,112,160)],spawns:[]},
 ch5Gate:{name:'白昼断桥',sub:'桥外的光照在重甲上，头盔始终低垂',chapterRegion:5,entry:[280,760],
  doors:[door(170,760,'ch5Crossroads',1320,390,'裂灯岔道','西南'),door(1430,340,'ch5Exit',280,760,'禁地出口','东北','ch5-boss-clear')],
  npcs:[],props:[prop('ch5-gate-seal','gate-fight','断桥的封光印',1110,260,13,116,104)],spawns:[],bossType:'ch5Gatekeeper',bossAnchor:[1090,510]},
 ch5CityGate:{name:'阙灯城门',sub:'石壁间的铜门打开，门内透出炉火的暖光，传来乐声与人声',chapterRegion:5,safe:true,entry:[800,290],
  doors:[door(800,180,'ch5Crossroads',800,830,'裂灯岔道','北'),door(1430,700,'ch5GrandSquare',280,650,'万灯广场','东')],
  npcs:[npc('ch5GateHost','引灯人',780,580,12,Math.PI)],props:[cityProp('ch5-city-notice','city-notice','阙灯城告示',1060,450,9,138,145)],spawns:[],
  ambientActors:[npc('ch5-arrival-guest-a','',540,740,4,0),npc('ch5-arrival-guest-b','',1110,715,3,Math.PI)]},
 ch5GrandSquare:{name:'万灯广场',sub:'回廊上的灯一盏挨一盏。客人带着空钱袋进城，也带着新刀离开',chapterRegion:5,safe:true,entry:[280,650],
  doors:[door(170,650,'ch5CityGate',1320,700,'阙灯城门','西'),door(800,180,'ch5Forge',800,830,'金缕工坊','北'),door(1430,650,'ch5Market',280,650,'回廊集市','东'),door(800,940,'ch5Tavern',800,290,'长夜酒馆','南'),door(340,940,'ch5Reservoir',340,290,'凝露水院','西南')],
  npcs:[npc('ch5Archivist','维兰',1080,775,5,Math.PI),npc('ch5SquareMusician','乐师',405,445,10,.5)],props:[cityProp('ch5-square-font','font','仍在流动的金泉',805,490,3,250,225),cityProp('ch5-square-board','board','悬赏与城规',1240,470,9,118,144)],spawns:[],
  ambientActors:[npc('ch5-walker-1','',535,760,7,-1.3),npc('ch5-walker-2','',1070,340,8,1.8),npc('ch5-walker-3','',1290,805,1,-2.2),npc('ch5-walker-4','',615,845,6,.3)]},
 ch5Forge:{name:'金缕工坊',sub:'冷铁在细金火里变红。挂在墙上的成品，每一件都留下了匠人的名字',chapterRegion:5,safe:true,entry:[800,830],
  doors:[door(800,940,'ch5GrandSquare',800,290,'万灯广场','南'),door(1430,620,'ch5Training',280,650,'铸魂练场','东')],
  npcs:[npc('ch5Smith','格蕾娜',660,540,11,0)],props:[cityProp('ch5-class-forge','forge','职业铸炉',975,420,4,265,225),cityProp('ch5-forge-crates','supplies','登记过的余料箱',395,370,9,145,135)],spawns:[],
  ambientActors:[npc('ch5-forge-worker-a','',1190,720,9,Math.PI),npc('ch5-forge-worker-b','',465,790,2,-.9)]},
 ch5Tavern:{name:'长夜酒馆',sub:'暖酒端过石桌，琴声从拱门里面传来。这里没人催客人回家',chapterRegion:5,safe:true,entry:[800,290],
  doors:[door(800,180,'ch5GrandSquare',800,830,'万灯广场','北'),door(1430,700,'ch5Arcade',280,650,'回铃游艺厅','东')],
  npcs:[npc('ch5Barkeep','瑟琳娜',575,515,12,0)],props:[cityProp('ch5-tavern-bar','tavern','温着的酒单',365,405,6,265,175),cityProp('ch5-tavern-table','saint-table','靠窗的双人桌',1010,580,7,178,126),prop('ch5-tavern-bed','rest','楼梯旁的客床',440,785,1,148,92,{art:{sheet:'medicalProps',index:1,w:148,h:92},v13Bed:true})],spawns:[],
  ambientActors:[npc('ch5-tavern-guest-a','',1200,800,3,-2),npc('ch5-tavern-guest-b','',680,780,7,-.4),npc('ch5-tavern-guest-c','',1100,340,4,1.8)]},
 ch5Arcade:{name:'回铃游艺厅',sub:'有人为了猜中一枚铜片坐了一整晚。老板只肯收城里的旧币',chapterRegion:5,safe:true,entry:[280,650],
  doors:[door(170,650,'ch5Tavern',1320,700,'长夜酒馆','西'),door(800,940,'ch5Market',800,290,'回廊集市','南')],
  npcs:[npc('ch5GameHost','铜铃侍者',1100,640,5,Math.PI)],props:[cityProp('ch5-arcade-machine','arcade','三盏回铃',865,450,8,220,210),cityProp('ch5-arcade-drawer','arcade-prize','游艺兑奖柜',405,385,9,170,160)],spawns:[],
  ambientActors:[npc('ch5-game-guest-a','',540,790,7,-.8),npc('ch5-game-guest-b','',1195,805,9,-2.4)]},
 ch5Training:{name:'铸魂练场',sub:'护墙后，旧甲一次次重新站起来。每一次真正命中，都算数',chapterRegion:5,entry:[280,650],
  doors:[door(170,650,'ch5Forge',1320,620,'金缕工坊','西'),door(1430,790,'ch5Quarry',280,760,'星屑矿庭','东')],npcs:[],
  props:[cityProp('ch5-training-bell','training','练场的铜钟',370,340,11,115,180),prop('ch5-training-crystal','gather','凝住的灯芯',1280,330,4,88,72,{resource:'ch5LampCore',refresh:true})],
  spawns:[...pack('ch5-train-a',['ch5Guard','ch5Archer','ch5Hound'],560,620),...pack('ch5-train-b',['ch5Archer','ch5Archer','ch5Guard'],965,350),...pack('ch5-train-c',['ch5Elite','ch5Hound','ch5Guard'],1110,710)]},
 ch5Quarry:{name:'星屑矿庭',sub:'矿车不再运煤。每块石头里，都像藏着一小点没熄的夜空',chapterRegion:5,entry:[280,760],
  doors:[door(170,760,'ch5Training',1320,790,'铸魂练场','西南'),door(1430,350,'ch5Reservoir',1320,650,'凝露水院','东北')],npcs:[],
  props:[prop('ch5-quarry-gold-a','gather','残温金砂',425,375,4,110,85,{resource:'ch5GoldSand',refresh:true}),prop('ch5-quarry-gold-b','gather','灯芯晶簇',1110,830,4,110,85,{resource:'ch5LampCore',refresh:true}),prop('ch5-quarry-cache','quarry-cache','石缝里的刻印匣',1210,230,13,100,86,{limited:true})],
  spawns:[...pack('ch5-mine-a',['ch5Hound','ch5Guard','ch5Archer'],560,680),...pack('ch5-mine-b',['ch5Archer','ch5Hound','ch5Hound'],680,285),...pack('ch5-mine-c',['ch5Elite','ch5Guard','ch5Archer'],1060,560)]},
 ch5Reservoir:{name:'凝露水院',sub:'水从穹顶落进细颈瓶里。弥娅说，灯亮着的时候才有露',chapterRegion:5,safe:true,entry:[340,290],
  doors:[door(340,180,'ch5GrandSquare',340,830,'万灯广场','北'),door(1430,650,'ch5Quarry',1320,350,'星屑矿庭','东')],npcs:[npc('ch5Alchemist','弥娅',1000,565,11,Math.PI)],
  props:[cityProp('ch5-potion-machine','alchemy','铜露调配机',1150,415,5,225,215),prop('ch5-water-herbs','gather','水院温草',465,680,14,100,75,{resource:'emberHerb',refresh:true}),cityProp('ch5-water-still','water','净水分流器',665,395,3,185,165,{refresh:true})],spawns:[]},
 ch5Market:{name:'回廊集市',sub:'药瓶、铸书、旧契约，从暖灯下一直摆到回廊尽头',chapterRegion:5,safe:true,entry:[280,650],
  doors:[door(170,650,'ch5GrandSquare',1320,650,'万灯广场','西'),door(800,180,'ch5Arcade',800,830,'回铃游艺厅','北')],npcs:[npc('ch5Recruiter','赛芙',1060,505,12,Math.PI),npc('ch5Merchant','行商',515,740,2,-Math.PI/2)],
  props:[cityProp('ch5-market-contract','mercenaries','灯契名册',1150,365,9,225,168),cityProp('ch5-market-shop','shop','行商的药品与书册',440,585,2,205,175)],spawns:[],
  ambientActors:[npc('ch5-market-customer-a','',685,405,1,.9),npc('ch5-market-customer-b','',1250,790,6,-2),npc('ch5-market-customer-c','',860,790,4,-1.6)]},
 ch5Exit:{name:'禁地出口',sub:'桥外吹来的风很凉。路边的衣服，早已分不清颜色',chapterRegion:5,safe:true,entry:[280,760],
  doors:[door(170,760,'ch5Gate',1320,340,'白昼断桥','西南')],npcs:[],props:[prop('ch5-exit-track','exit','被灰埋住的车辙',1090,390,13,110,80)],spawns:[]},
 ch5Exterior:{name:'禁地外哨',sub:'只给玩家观看的出口封锁场景',chapterRegion:5,safe:true,privateMemory:true,entry:[500,760],doors:[],npcs:[],props:[],spawns:[]}
};

export const CH5_SCENERY={
 ch5AshRoad:[rock('c5-ar1',365,590),rock('c5-ar2',765,550,230),rock('c5-ar3',1210,240),rock('c5-ar4',1340,865),scenery('c5-ar-door',7,420,240,180,205),lamp('c5-ar-l1',405,845),lamp('c5-ar-l2',1260,430),rubble('c5-ar-r',890,835)],
 ch5Memorial:[scenery('c5-home-front',8,770,330,430,235,'hellWorld',{box:[570,285,400,45]}),rock('c5-home-r1',475,675,130,80),rock('c5-home-r2',1230,785,155,94),lamp('c5-home-l1',580,445),lamp('c5-home-l2',990,445),scenery('c5-home-well',9,1220,300,135,152),rubble('c5-home-walk',755,540)],
 ch5Crossroads:[rock('c5-cross-r1',555,555,220),rock('c5-cross-r2',1020,800,220),rock('c5-cross-r3',1240,220),scenery('c5-cross-arch',7,870,290,170,195),lamp('c5-cross-l1',430,840),lamp('c5-cross-l2',1260,470),lamp('c5-cross-l3',685,790),rubble('c5-cross-r4',980,455)],
 ch5Gate:[rock('c5-gate-r1',465,520,220),rock('c5-gate-r2',810,260,165),rock('c5-gate-r3',770,915,155,85),rock('c5-gate-r4',1335,835,155,90),scenery('c5-gate-arch',7,1260,250,235,265),lamp('c5-gate-l1',895,350),lamp('c5-gate-l2',1300,740),rubble('c5-gate-floor',1020,650)],
 ch5CityGate:[{...city('c5-cg-front',0,785,370,590,440),box:null},city('c5-cg-left',1,350,325,340,315),city('c5-cg-right',1,1280,345,340,315),city('c5-cg-lamp1',10,535,545,88,174),city('c5-cg-lamp2',10,1085,610,88,174),city('c5-cg-shop',2,405,905,260,190)],
 ch5GrandSquare:[city('c5-plaza-building1',1,395,295,330,260),city('c5-plaza-building2',1,1210,295,350,270),city('c5-plaza-shop1',2,480,910,230,175),city('c5-plaza-shop2',2,1285,890,255,188),city('c5-plaza-l1',10,565,525,82,159),city('c5-plaza-l2',10,1035,525,82,159),city('c5-plaza-l3',10,625,790,82,159),city('c5-plaza-l4',10,995,875,82,159)],
 ch5Forge:[city('c5-forge-front',1,735,285,550,290),city('c5-forge-shelf',2,1240,315,275,205),city('c5-forge-l1',10,435,605,82,164),city('c5-forge-l2',10,1090,805,82,164),city('c5-forge-sidel',11,300,850,115,165)],
 ch5Tavern:[city('c5-tavern-window1',1,365,285,285,240),city('c5-tavern-window2',1,1200,285,300,235),city('c5-tavern-table2',7,1190,690,175,125),city('c5-tavern-table3',7,690,685,175,125),city('c5-tavern-l1',10,640,390,80,155),city('c5-tavern-l2',10,1260,905,80,155)],
 ch5Arcade:[city('c5-arc-front',1,765,285,610,260),city('c5-arc-small-machine',8,1270,410,160,160),city('c5-arc-table1',7,640,765,175,125),city('c5-arc-table2',7,1120,835,175,125),city('c5-arc-l1',10,380,820,80,155),city('c5-arc-l2',10,1210,605,80,155)],
 ch5Training:[city('c5-train-wall1',11,740,240,135,190),city('c5-train-wall2',11,1280,490,135,190),city('c5-train-wall3',11,825,785,135,190),rock('c5-train-low',620,895,165,95),lamp('c5-train-l1',400,780),lamp('c5-train-l2',1330,875),rubble('c5-train-r1',805,450)],
 ch5Quarry:[rock('c5-mine-r1',425,570,190),rock('c5-mine-r2',750,510,190),rock('c5-mine-r3',930,800,180),rock('c5-mine-r4',980,225,180),rock('c5-mine-r5',1360,835,125,90),scenery('c5-mine-machine',10,355,260,175,150),lamp('c5-mine-l1',390,840),lamp('c5-mine-l2',1290,500)],
 ch5Reservoir:[city('c5-water-wall1',1,775,270,470,255),city('c5-water-wall2',2,370,465,245,215),city('c5-water-l1',10,870,785,80,160),city('c5-water-l2',10,1210,810,80,160),city('c5-water-table',7,630,850,170,126)],
 ch5Market:[city('c5-market-wall1',1,385,290,315,260),city('c5-market-wall2',1,1200,245,335,220),city('c5-market-stall2',2,1050,835,275,178),city('c5-market-l1',10,640,590,82,160),city('c5-market-l2',10,1280,590,82,160),city('c5-market-l3',10,710,850,82,160)],
 ch5Exit:[rock('c5-exit-r1',440,540,190),rock('c5-exit-r2',805,840,180),scenery('c5-exit-arch',7,1250,300,220,250),lamp('c5-exit-l',390,850),rubble('c5-exit-dust',950,615)],
 ch5Exterior:[scenery('c5-ext-arch',7,1120,270,240,260),rock('c5-ext-r1',400,450,175),rock('c5-ext-r2',1260,850,190),lamp('c5-ext-l1',730,400),lamp('c5-ext-l2',1280,485)]
};
export const CH5_GROUND_STYLE=Object.fromEntries(Object.keys(CH5_MAPS).map(id=>[id,id==='ch5AshRoad'||id==='ch5Quarry'||id==='ch5Gate'||id==='ch5Exit'?mainRoad:plazaGround]));
CH5_GROUND_STYLE.ch5Memorial=ground(3,[path(1,125,[[130,760],[440,760],[640,700],[800,650],[1470,650]]),path(1,100,[[800,650],[770,380]])]);
CH5_GROUND_STYLE.ch5Crossroads=ground(3,[path(1,145,[[130,760],[560,760],[800,650],[1180,500],[1470,390]]),path(1,115,[[800,650],[800,965]])]);
CH5_GROUND_STYLE.ch5CityGate=ground(3,[path(1,185,[[800,150],[800,500],[800,720],[1470,700]])]);

function boundary(doors){
 const segments=(start,end,centres)=>{const out=[];let cursor=start;for(const c of centres.sort((a,b)=>a-b)){const lo=Math.max(start,c-110),hi=Math.min(end,c+110);if(lo>cursor)out.push([cursor,lo-cursor]);cursor=Math.max(cursor,hi);}if(cursor<end)out.push([cursor,end-cursor]);return out;};
 return [...segments(0,1600,doors.filter(d=>d.y<=200).map(d=>d.x)).map(([a,n])=>[a,0,n,150]),...segments(0,1600,doors.filter(d=>d.y>=920).map(d=>d.x)).map(([a,n])=>[a,965,n,115]),...segments(150,965,doors.filter(d=>d.x<=200).map(d=>d.y)).map(([a,n])=>[0,a,130,n]),...segments(150,965,doors.filter(d=>d.x>=1400).map(d=>d.y)).map(([a,n])=>[1470,a,130,n])];
}
for(const [id,map]of Object.entries(CH5_MAPS)){for(const d of map.doors)if(d.gate==='ch5-city')d.hidden='ch5CityUnlocked';map.blocks=boundary(map.doors);map.floor='stone';map.width=1600;map.height=1080;map.scenery=CH5_SCENERY[id];}
// The arch is open. Its two stone feet collide; the visible passage at x800 does not.
CH5_MAPS.ch5CityGate.blocks.push([596,342,118,28],[885,342,119,28]);

export const CH5_ENEMY_PROFILES={
 ch5Hound:{name:'余烬猎犬',level:20,hp:1440,damage:55,speed:179,aggro:250,reach:62,cooldown:1.7,leash:540,rewardXP:112,visualFamily:'hellHound'},
 ch5Guard:{name:'空甲巡卫',level:21,hp:1880,damage:59,speed:150,aggro:260,reach:78,cooldown:1.9,leash:560,rewardXP:132,visualFamily:'hellGuard'},
 ch5Archer:{name:'执灯弩手',level:21,hp:1370,damage:49,speed:120,aggro:335,reach:62,rangedReach:335,rangedCooldown:1.7,projectileSpeed:315,cooldown:1.7,leash:560,rewardXP:125,attack:'ordinarySoulBolt',visualFamily:'hellSoul'},
 ch5Elite:{name:'镀金执刑甲',level:23,hp:3300,damage:67,speed:145,aggro:275,reach:82,cooldown:1.9,leash:580,rewardXP:230,elite:true,specialMove:'furnaceSweep',specialDamageOverride:85,specialCooldown:10,visualFamily:'hellGuard'},
 ch5Gatekeeper:{name:'守日者 · 缄光',level:26,hp:55000,damage:91,speed:105,aggro:490,reach:345,rangedReach:410,rangedCooldown:1.05,projectileSpeed:350,cooldown:1.05,leash:null,isBoss:true,basicAttack:'projectile',basicAttacksBetweenSpecials:4,specialCooldown:6.5,moveOrder:['ch5Dawnfall','ch5SunSpear','ch5HaloBurst'],guardFront:.9,guardRear:1,dotMultiplier:.94,visualFamily:'martha',rewardXP:1700}
};
export const CH5_BOSS_MOVES={
 ch5Dawnfall:{label:'坠日烙痕',shape:'circle',wind:1.28,recovery:1.75,r:170,damage:148,resolver:'circle',target:'lockedPlayerPosition',vfx:'fadingLettersOnAsh'},
 ch5SunSpear:{label:'贯桥光矛',shape:'line',wind:1.02,recovery:1.65,length:515,width:36,speed:360,damage:130,resolver:'projectile',vfx:'narrowSoulLance'},
 ch5HaloBurst:{label:'回落光环',shape:'circle',wind:1.48,recovery:2.1,r:215,damage:168,resolver:'circle',target:'self',vfx:'bellWisps'}
};
export const CH5_VISUAL_FAMILIES=Object.fromEntries(Object.entries(CH5_ENEMY_PROFILES).map(([id,p])=>[id,p.visualFamily]));
export const CH5_STAGE_ANCHORS={
 ch5AshRoad:{hero:[350,740],saint:[435,755]},
 ch5Memorial:{hero:[740,700],saint:[825,715],mentor:[745,605]},
 ch5Crossroads:{hero:[730,655],saint:[815,670]},
 ch5Gate:{hero:[835,650],saint:[750,695],boss:[1090,510]},
 ch5CityGate:{hero:[710,710],saint:[795,730],ch5GateHost:[825,615]},
 ch5GrandSquare:{hero:[1000,700],saint:[910,720],ch5Archivist:[1080,775]},
 ch5Tavern:{hero:[940,660],saint:[1030,655],ch5Barkeep:[980,750]},
 ch5Exit:{hero:[880,660],saint:[970,675]}
};

// Original raster ground, sampled at world scale. City floors never use wall tiles.
for(const[id,style]of Object.entries(CH5_GROUND_STYLE)){
 const wild=['ch5AshRoad','ch5Memorial','ch5Quarry','ch5Exit','ch5Exterior'].includes(id),indoor=['ch5Forge','ch5Tavern','ch5Arcade','ch5Training'].includes(id);
 CH5_GROUND_STYLE[id]={...style,sheet:'cityGround',base:wild?3:indoor?1:0,paths:(style.paths||[]).map(p=>({...p,asset:wild?2:indoor?1:0})),patches:[]};
}
