// Chapter-two additions only. Call before world collision assembly; no core import.
const clone = value => JSON.parse(JSON.stringify(value));
const art = (id, asset, x, y, w, h, box = null, sheet = 'world') => ({id, asset, x, y, w, h, box, sheet});
const interact = (id, action, label, x, y, extra = {}) => ({id, action: 'v9-' + action, label, x, y, secret: true, mapMarker: false, ...extra});
const roomEdges = [[0, 0, 1600, 255], [0, 255, 320, 825], [1280, 255, 320, 825], [320, 925, 960, 155]];
export const SECRET_MAP_IDS = ['bridgecellar', 'wellcrypt'];
export const QUALITY_MAP_IDS = ['post', 'inn', 'bridge', 'manor', 'spillway', 'exile', ...SECRET_MAP_IDS];

// No actor here owns a dialogue, quest, collision or minimap icon. Variants are
// existing civilian bodies (2 steward, 3 clerk, 4 courier, 5 herbalist, 6 woman,
// 7 elder, 11 seamstress), never a portrait substituted for a speaking identity.
export const BRIDGE_CIVILIANS = [
  {id:'v9-civilian-01', sprite:4, x:280, y:395, angle:.5, size:80, pose:'holds-paper', role:'送货青年'},
  {id:'v9-civilian-02', sprite:7, x:330, y:455, angle:.2, size:76, pose:'waits', role:'扶墙老人'},
  {id:'v9-civilian-03', sprite:6, x:385, y:420, angle:0, size:79, pose:'protects-bundle', role:'抱着包袱的妇人'},
  {id:'v9-civilian-04', sprite:3, x:450, y:445, angle:.1, size:83, pose:'looks-down', role:'排队工人'},
  {id:'v9-civilian-05', sprite:11, x:410, y:340, angle:1.1, size:77, pose:'waits', role:'布贩'},
  {id:'v9-civilian-06', sprite:2, x:510, y:365, angle:.7, size:84, pose:'holds-paper', role:'车夫'},
  {id:'v9-civilian-07', sprite:5, x:565, y:445, angle:-.6, size:79, pose:'protects-bundle', role:'背药袋的路人'},
  {id:'v9-civilian-08', sprite:6, x:565, y:345, angle:1.1, size:81, pose:'looks-away', role:'等候查验的妇人'},
  {id:'v9-civilian-09', sprite:4, x:925, y:425, angle:2.8, size:80, pose:'watches-gate', role:'检查完的脚夫'},
  {id:'v9-civilian-10', sprite:7, x:1035, y:470, angle:2.5, size:76, pose:'rests-by-cargo', role:'等车的老人'},
  {id:'v9-civilian-11', sprite:11, x:1125, y:385, angle:2.2, size:80, pose:'protects-bundle', role:'收拢货物的布贩'},
  {id:'v9-civilian-12', sprite:3, x:1225, y:450, angle:-2.5, size:85, pose:'watches-gate', role:'被扣货的商人'},
  {id:'v9-civilian-13', sprite:5, x:1305, y:380, angle:2.4, size:78, pose:'looks-down', role:'等候家人的年轻人'},
  {id:'v9-civilian-14', sprite:6, x:1395, y:475, angle:-2.2, size:81, pose:'waits', role:'等车妇人'},
].map(a => ({...a, name:'', ambient:true, nonInteractive:true, blocksMovement:false, mapMarker:false, moving:false}));

// Groups share threat only within groupId. Spawn metadata is deliberately separate
// from balance values. Root owns aggro, encounter activation and revisit refresh.
export const ENCOUNTER_METADATA = {
  warehouse:[{groupId:'v9-stock-tutorial',bounds:[570,330,770,520],size:6,danger:'tutorial',refresh:'never',storyWave:true,spawnIds:['warehouse-0','warehouse-1','warehouse-2','warehouse-3','warehouse-4','warehouse-5'],types:['rat'],count:[6,6]}],
  road:[{groupId:'v9-road-east',bounds:[760,345,575,540],size:4,danger:'ordinary',refresh:'revisit',spawnIds:['road-0','road-1','road-2','road-v8-patrol'],types:['wolf','wolf','rat'],count:[3,4]}],
  grove:[
    {groupId:'v9-grove-west',bounds:[390,365,335,520],size:3,danger:'ordinary',refresh:'revisit',spawnIds:['grove-0','grove-v8-wolf','grove-v9-rat'],types:['wolf','rat','bat'],count:[3,4]},
    {groupId:'v9-grove-east',bounds:[960,405,395,435],size:3,danger:'ordinary',refresh:'revisit',spawnIds:['grove-1','grove-v9-bat','grove-v9-rat-east'],types:['wolf','bat','rat'],count:[3,3]},
  ],
  millpath:[
    {groupId:'v9-mill-west',bounds:[400,490,350,340],size:3,danger:'ordinary',refresh:'revisit',spawnIds:['millpath-0','millpath-1','millpath-v9-bat'],types:['rat','rat','bat'],count:[3,3]},
    {groupId:'v9-mill-east',bounds:[935,505,380,360],size:3,danger:'ordinary',refresh:'revisit',spawnIds:['millpath-2','millpath-3','millpath-v8-rat'],types:['wolf','bat','rat'],count:[3,4]},
  ],
  echo:[
    {groupId:'v9-echo-west',bounds:[310,420,285,455],size:3,danger:'ordinary',refresh:'revisit',spawnIds:['echo-0','echo-v8-rat','echo-v9-rat'],types:['bat','rat','rat'],count:[3,3]},
    {groupId:'v9-echo-east',bounds:[885,660,440,230],size:3,danger:'ordinary',refresh:'revisit',spawnIds:['echo-1','echo-v9-bat','echo-v9-rat-east'],types:['wolf','bat','rat'],count:[3,3]},
    {groupId:'v9-echo-unique',bounds:[1010,365,210,220],size:1,danger:'elite',refresh:'never',bossId:'echo-warden',spawnIds:['echo-warden'],types:['wolf'],count:[1,1]},
  ],
  canal:[
    {groupId:'v9-canal-west',bounds:[430,280,225,600],size:3,danger:'ordinary',refresh:'revisit',spawnIds:['canal-0','canal-2','canal-v9-rat'],types:['bat','rat','rat'],count:[3,3]},
    {groupId:'v9-canal-east',bounds:[900,270,460,610],size:3,danger:'ordinary',refresh:'revisit',spawnIds:['canal-1','canal-3','canal-v8-bat'],types:['rat','bat','bat'],count:[3,4]},
    {groupId:'v9-canal-captain',bounds:[910,395,350,270],size:1,danger:'boss',refresh:'never',bossId:'captain',storyWave:true,spawnIds:['captain'],types:['captain'],count:[1,1]},
  ],
  bridge: [
    {groupId:'v9-bridge-west', bounds:[290,650,350,270], activationBounds:[200,590,430,345], size:3, danger:'ordinary', refresh:'revisit', leashBounds:[180,555,490,390], roles:['skirmisher','skirmisher','harrier'], spawnIds:['ch2-bridge-rat1','ch2-bridge-rat2','ch2-v9-bridge-bat-west']},
    {groupId:'v9-bridge-east', bounds:[920,675,460,250], activationBounds:[875,565,540,375], size:4, danger:'ordinary', refresh:'revisit', leashBounds:[850,555,590,390], roles:['frontline','frontline','harrier','skirmisher'], spawnIds:['ch2-bridge-wolf1','ch2-bridge-wolf2','ch2-bridge-bat','ch2-v9-bridge-rat-east']},
  ],
  spillway: [
    {groupId:'v9-spill-west', bounds:[340,390,270,440], activationBounds:[220,375,410,510], size:3, danger:'ordinary', refresh:'revisit', roles:['frontline','harrier','skirmisher'], spawnIds:['ch2-spill-guard1','ch2-spill-bat1','ch2-v9-spill-rat-west']},
    {groupId:'v9-spill-east', bounds:[900,390,440,440], activationBounds:[850,355,570,535], size:4, danger:'dangerous', refresh:'revisit', roles:['frontline','frontline','harrier','skirmisher'], spawnIds:['ch2-spill-guard2','ch2-v9-spill-guard-east','ch2-spill-bat2','ch2-spill-rat']},
    {groupId:'v9-spill-pursuit', bounds:[270,650,180,170], size:2, danger:'reinforcement', refresh:'never', storyWave:true, spawnIds:['ch2-spill-late1','ch2-spill-late2']},
  ],
  manor: [
    {groupId:'v9-manor-alarm', bounds:[940,580,380,260], size:3, danger:'ordinary', refresh:'never', storyWave:true, spawnIds:['ch2-alarm-1','ch2-alarm-2','ch2-v9-alarm-3']},
    {groupId:'v9-manor-bren', bounds:[710,540,550,330], size:3, danger:'boss', refresh:'never', storyWave:true, bossId:'ch2-bren', spawnIds:['ch2-bren','ch2-wave2-guard','ch2-v9-wave2-guard']},
  ],
  wellcrypt: [
    {groupId:'v9-well-warden', bounds:[465,360,670,455], size:1, danger:'boss', refresh:'never', bossId:'secret-warden', isBossArena:true, spawnIds:['secret-warden']},
  ],
};

// First chapter receives only small mixed-group additions. Its maps, keys,
// quests, six-rat tutorial and authored scenery are otherwise preserved.
export const FIRST_CHAPTER_SPAWN_ADDITIONS = {
  grove:[['rat',520,830,'grove-v9-rat'],['bat',1220,460,'grove-v9-bat'],['rat',1250,780,'grove-v9-rat-east']],
  millpath:[['bat',530,760,'millpath-v9-bat']],
  echo:[['rat',390,820,'echo-v9-rat'],['bat',1170,710,'echo-v9-bat'],['rat',1280,865,'echo-v9-rat-east']],
  canal:[['rat',540,570,'canal-v9-rat']],
};

for(const groups of Object.values(ENCOUNTER_METADATA)) for(const group of groups) {
  group.area=[...group.bounds];
  group.center=[group.bounds[0]+group.bounds[2]/2,group.bounds[1]+group.bounds[3]/2];
  group.spread=[Math.max(35,group.bounds[2]/2-25),Math.max(35,group.bounds[3]/2-25)];
  group.count ||= [group.size,group.size];
  group.types ||= group.danger==='boss'?['wolf']:group.groupId.includes('bridge-west')?['rat','rat','bat']:group.groupId.includes('bridge-east')?['wolf','wolf','bat','rat']:group.groupId.includes('spill')?['guard','bat','rat']:['guard'];
  group.entryExclusionRadius=160;
  group.aggroShareRadius=190;
  group.unique=group.refresh==='never';
}

export const SECRET_MAPS = {
  bridgecellar: {
    name:'桥下旧收费室', sub:'绳索磨亮了井口，干燥的石台高过旧水线', atlas:'interior', cell:0, ground:'stone', safe:true,
    secret:true, mapMarker:false, chapter:2, blocks:roomEdges,
    doors:[{x:800,y:880,to:'bridge',tx:930,ty:845,label:'爬回南沟',manualOnly:true}],
    npcs:[],spawns:[], props:[
      interact('v9-toll-box','toll-box','包着旧绳的木匣',1100,390,{interactX:1100,interactY:500,type:'crate',art:{sheet:'world',index:12,w:61,h:53}}),
      interact('v9-toll-scale','toll-scale','空着的秤盘',510,405,{interactX:510,interactY:520,art:{sheet:'details',index:5,w:38,h:28},flat:true,depthY:470.1}),
    ],
  },
  wellcrypt: {
    name:'守井石室', sub:'旧护井兽拖着断链，在低矮石柱间踱步', atlas:'interior', cell:3, ground:'stone',
    secret:true, mapMarker:false, chapter:2, isBossArena:true, bossId:'secret-warden', disableSaveDuringScene:true,
    blocks:roomEdges, doors:[{x:800,y:880,to:'manor',tx:855,ty:545,label:'井壁踏孔',gate:'v9-warden-exit',manualOnly:true}],
    npcs:[],spawns:[['wolf',800,455,'secret-warden']], props:[
      interact('v9-warden-box','warden-box','铁链后的小木盒',1135,390,{interactX:1135,interactY:500,type:'crate',art:{sheet:'world',index:12,w:59,h:51}}),
      interact('v9-warden-chain','warden-chain','穿过石环的断链',515,655,{interactX:530,interactY:725,art:{sheet:'chapterProps',index:5,w:67,h:103}}),
    ],
  },
};

export const SECRET_SCENERY = {
  bridgecellar:[
    art('v9-cellar-table',9,510,470,220,120,[410,422,200,48]),
    art('v9-cellar-north-shelf',11,1090,405,245,165,[980,335,220,70]),
    art('v9-cellar-lamp',14,660,365,42,128,[649,347,22,18]),
    art('v9-cellar-sacks',6,465,755,135,90,[410,722,110,33],'chapterProps'),
    art('v9-cellar-cracked-wall',5,1200,680,125,95,[1150,645,100,35]),
    {...art('v9-cellar-wet-cloth',15,980,720,115,56,null,'details'),flat:true},
    art('v9-cellar-exit',2,800,935,150,143,null,'mechanisms'),
  ],
  wellcrypt:[
    art('v9-well-pillar-west',5,620,565,115,100,[573,530,94,35]),
    art('v9-well-pillar-east',5,995,640,115,100,[948,605,94,35]),
    art('v9-well-lamp',14,1140,315,42,130,[1129,297,22,18]),
    art('v9-well-broken-bed',10,455,365,170,80,[380,333,150,32]),
    art('v9-well-old-shelf',11,1135,425,160,130,[1065,376,140,49]),
    art('v9-well-stones',3,1170,800,130,80,[1115,771,110,29],'details'),
    art('v9-well-exit',2,800,935,140,140,null,'mechanisms'),
  ],
};

export const SECRET_PROP_PATCHES = {
  post:[interact('v9-post-wedge','post-wedge','滑出车轮的木楔',425,670,{interactX:425,interactY:725,secret:false,art:{sheet:'details',index:3,w:38,h:27}})],
  bridge:[
    interact('v9-cart-rope','cart-rope','坏车上松脱的绳头',1240,780,{interactX:1290,interactY:800,art:{sheet:'details',index:7,w:45,h:30}}),
    interact('v9-cellar-wall','cellar-wall','石墙下露出的铁环',940,920,{interactX:930,interactY:845,art:{sheet:'details',index:2,w:52,h:50}}),
    interact('v9-bridge-water','bridge-water','搁在货物旁的水壶',1010,460,{interactX:1040,interactY:525,secret:false,art:{sheet:'world',index:13,w:37,h:40}}),
  ],
  manor:[
    interact('v9-well-rim','well-rim','井沿的三道浅槽',970,450,{interactX:970,interactY:525,art:null}),
    interact('v9-well-pulley','well-pulley','转不动的旧绞盘',750,415,{interactX:755,interactY:475,art:{sheet:'chapterProps',index:5,w:70,h:105}}),
  ],
  spillway:[
    interact('v9-waterline','waterline','墙上的水线刻记',535,330,{interactX:535,interactY:390,art:{sheet:'details',index:5,w:37,h:30},flat:true,depthY:330.1}),
    interact('v9-dry-niche','dry-niche','排水石槽里的暗格',1260,790,{interactX:1260,interactY:850,art:{sheet:'details',index:3,w:65,h:47}}),
  ],
};

export function configureQualityWorld(maps, scenery, waters, bridges) {
  if(maps.bridge?.qualityWorldV9) return;
  Object.assign(maps, clone(SECRET_MAPS));
  Object.assign(scenery, clone(SECRET_SCENERY));
  for(const [id,spawns] of Object.entries(FIRST_CHAPTER_SPAWN_ADDITIONS)) for(const spawn of spawns) if(!maps[id].spawns.some(s=>s[3]===spawn[3]))maps[id].spawns.push([...spawn]);
  for(const [id,groups] of Object.entries(ENCOUNTER_METADATA)) if(maps[id])maps[id].encounters=clone(groups);
  for(const [id, props] of Object.entries(SECRET_PROP_PATCHES)) maps[id].props.push(...clone(props));
  for(const id of QUALITY_MAP_IDS) {
    maps[id].qualityWorldV9=true;
    maps[id].encounters=clone(ENCOUNTER_METADATA[id]||[]);
    maps[id].ambientActors=[];
    maps[id].contentVersion=9;
  }
  maps.bridge.ambientActors=clone(BRIDGE_CIVILIANS);maps.post.ambientActors=[{id:'roadElder',sprite:7,x:580,y:630,angle:-.3,size:78,name:'',ambient:true,nonInteractive:true,mapMarker:false}];
  maps.bridge.sub='北侧查验车货，南沟绕开队列；积水留在车辙和石墙之间';
  maps.bridge.safeZones=[[190,260,480,290],[880,270,550,265]];
  maps.bridge.npcs.find(n=>n.id==='bridgewatch').x=660;
  maps.bridge.npcs.find(n=>n.id==='bridgewatch').y=415;
  maps.bridge.spawns=[
    ['rat',390,735,'ch2-bridge-rat1'],['rat',530,810,'ch2-bridge-rat2'],['bat',470,675,'ch2-v9-bridge-bat-west'],
    ['wolf',1020,705,'ch2-bridge-wolf1'],['wolf',1290,875,'ch2-bridge-wolf2'],['bat',1150,680,'ch2-bridge-bat'],['rat',980,845,'ch2-v9-bridge-rat-east'],
  ];
  const tools=maps.bridge.props.find(p=>p.id==='bridge-tools'); Object.assign(tools,{x:1200,y:815});
  Object.assign(maps.bridge.props.find(p=>p.id==='bridge-crate'),{x:1210,y:365});
  Object.assign(maps.bridge.props.find(p=>p.id==='bridge-barrel'),{x:1340,y:320});
  maps.bridge.doors.push({x:980,y:905,to:'bridgecellar',tx:800,ty:840,label:'石墙下的窄口',hidden:'v9CellarOpen',mapMarker:false,manualOnly:true});
  maps.manor.doors.push({x:865,y:505,to:'wellcrypt',tx:800,ty:830,label:'井壁踏孔',hidden:'v9WellOpen',mapMarker:false,manualOnly:true,isBossArena:true,bossId:'secret-warden',disableSaveDuringScene:true,requiresReturnWarning:true,transitionType:'boss'});
  // Every piece belongs to a check-in bay, traffic throat, warehouse bank or ditch.
  scenery.bridge=[
    art('v9-check-cart-west',7,350,315,175,123,[280,275,140,40],'chapterProps'),
    art('v9-check-cart-east',7,1065,335,200,140,[985,290,160,45],'chapterProps'),
    art('bridge-cart-s',7,1225,780,165,112,[1160,740,130,40],'chapterProps'),
    art('v9-check-desk',9,610,305,160,93,[540,270,140,35]),
    art('v9-check-left-gate',2,650,365,110,100,[604,332,92,33],'chapterProps'),
    art('v9-check-right-gate',2,900,505,105,92,[856,475,88,30],'chapterProps'),
    art('v9-check-wall-west',5,355,545,350,78,[190,514,330,31]),
    art('v9-check-wall-west-end',5,610,545,115,78,[561,514,98,31]),
    art('v9-check-wall-east',5,1165,570,490,92,[930,536,470,34]),
    art('v9-check-wall-north',5,1225,250,390,95,[1040,218,370,32]),
    art('v9-check-sacks-left',6,250,350,94,76,[210,322,80,28],'chapterProps'),
    art('v9-check-sacks-east',6,1310,455,150,96,[1245,422,130,33],'chapterProps'),
    art('v9-check-cargo-stack',11,1185,325,155,130,[1118,277,134,48]),
    art('v9-check-lamp',14,850,435,45,136,[839,416,22,19]),
    art('v9-ditch-tree-west',4,245,835,180,250,[220,802,50,33]),
    art('v9-ditch-stone-west',3,595,835,100,68,[553,810,84,25],'details'),
    art('v9-ditch-fallen-log',3,430,920,210,90,[340,890,180,30],'chapterProps'),
    art('v9-ditch-stone-east',3,1090,880,115,72,[1042,853,96,27],'details'),
    art('v9-ditch-wall-ending',5,905,925,106,95,[860,892,90,33]),
    art('v9-ditch-tree-east',4,1400,785,170,225,[1377,752,46,33]),
    {...art('v9-ditch-trodden-grass',6,940,878,56,33,null,'details'),flat:true},
  ];
  waters.bridge=[[710,150,125,340],[710,650,125,310]];
  bridges.bridge={x:660,y:490,w:230,h:160};
  scenery.post.push(art('v9-post-cargo',6,1120,845,150,96,[1055,812,130,33],'chapterProps'),art('v9-post-side-wall',5,1190,455,200,90,[1100,422,180,33]));
  scenery.manor.push(art('v9-manor-well-wall',5,725,380,130,85,[670,348,110,32]),art('v9-manor-west-cargo',6,390,875,150,90,[325,842,130,33],'chapterProps'),art('v9-manor-court-stone',3,630,620,90,62,[593,597,74,23],'details'));
  maps.spillway.spawns=[
    ['guard',470,480,'ch2-spill-guard1'],['bat',570,715,'ch2-spill-bat1'],['rat',380,815,'ch2-v9-spill-rat-west'],
    ['guard',975,555,'ch2-spill-guard2'],['guard',1235,710,'ch2-v9-spill-guard-east'],['bat',1170,420,'ch2-spill-bat2'],['rat',1080,735,'ch2-spill-rat'],
  ];
  scenery.spillway.push(art('v9-spill-turn-west',5,380,450,160,92,[310,416,140,34]),art('v9-spill-turn-east',5,1145,610,155,88,[1078,577,134,33]),art('v9-spill-salt-crate',6,1310,810,130,86,[1255,778,110,32],'chapterProps'));
  scenery.exile.push(art('v9-exile-abandoned-pack',7,525,765,68,44,null,'details'),art('v9-exile-boundary-rock',3,1120,870,140,85,[1060,840,120,30],'details'));
}

export function secretPropArt(p) {
  return p?.action?.startsWith('v9-') ? (p.art ?? null) : undefined;
}

// Do not add these four story actors as initial map spawns: alarm progression
// owns their lifetime, and adding them early would turn the quiet court hostile.
export const STORY_SPAWN_ADDITIONS = {
  alarm:[['guard',1290,815,'ch2-v9-alarm-3']],
  bren:[['guard',1040,560,'ch2-v9-wave2-guard']],
};

export const WORLD_QA_SCHEMA = {
  post:{entry:[680,660],critical:['inn','bridge','post-training','inn'],optional:['v9-post-wedge'],expectedCivilians:0},
  inn:{entry:[800,875],critical:['seline','inn-pump','post'],optional:[],expectedCivilians:0},
  bridge:{entry:[230,600],critical:['post','manor','bridge-tools','bridgewatch'],optional:['v9-cart-rope','v9-cellar-wall','v9-bridge-water','bridgecellar'],expectedCivilians:14},
  manor:{entry:[260,720],critical:['inner-door','spillway','bridge'],optional:['v9-well-rim','v9-well-pulley','wellcrypt'],expectedCivilians:0},
  spillway:{entry:[260,700],critical:['exile','spill-sluice'],optional:['v9-waterline','v9-dry-niche'],expectedCivilians:0},
  exile:{entry:[260,700],critical:['exile-mark','exile-deep'],optional:[],expectedCivilians:0},
  bridgecellar:{entry:[800,840],critical:['bridge'],optional:['v9-toll-box','v9-toll-scale'],expectedCivilians:0},
  wellcrypt:{entry:[800,830],critical:['manor'],optional:['v9-warden-box','v9-warden-chain'],expectedCivilians:0},
};
