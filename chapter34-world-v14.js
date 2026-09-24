/**
 * V11 growth road + hell depths. Pure data: imports no game code and mutates no V10 object.
 * All scenery coordinates are FOOT positions. Collision rectangles end at that foot y.
 * Integration: maps[id].blocks = boundary blocks + scenery[].box + props[].box ONCE.
 * Root owns story transitions, boss instances, drop tables, gating and respawn.
 * Existing hellWorld atlas only; deepWorld replacement hints do not affect collision.
 */
const D=(x,y,to,tx,ty,label,direction,gate)=>({x,y,to,tx,ty,label,direction,...(gate?{gate}:{})});
const O=(id,asset,x,y,w,h,box=null,extra={})=>({id,sheet:'hellWorld',asset,x,y,w,h,box,...extra});
const R=(id,x,y,w=180,h=125,bw=130,bh=36)=>O(id,4,x,y,w,h,[x-bw/2,y-bh,bw,bh]);
const T=(id,x,y,w=140,h=185)=>O(id,5,x,y,w,h,[x-20,y-27,40,27]);
const L=(id,x,y,h=105)=>O(id,15,x,y,42,h,[x-10,y-18,20,18]);
const C=(id,x,y,w=190,h=42)=>O(id,6,x,y,w,h,null,{flat:true,depthY:0});
const G=(id,x,y,w=58,h=44)=>O(id,14,x,y,w,h,null,{flat:true,depthY:0});
const P=(id,action,label,x,y,ix,iy,index=13,w=100,h=90,bw=68,bh=25,extra={})=>({id,action,label,x,y,interactX:ix,interactY:iy,art:{sheet:'hellWorld',index,w,h},box:[x-bw/2,y-bh,bw,bh],...extra});
const N=(id,name,x,y,sprite,angle=Math.PI/2)=>({id,name,x,y,sprite,angle,interactionRadius:105});
const S=(type,x,y,id)=>[type,x,y,id];
const group=(id,spawns,eliteIds=[])=>({id,spawns,members:spawns.map(s=>s[3]),eliteIds,anchor:[Math.round(spawns.reduce((a,s)=>a+s[1],0)/spawns.length),Math.round(spawns.reduce((a,s)=>a+s[2],0)/spawns.length)],roamRadius:42,leash:265,assistRadius:135,maxActiveMembers:4,spawnJitter:28});
const path=(asset,width,points)=>({asset,width,points});
const patch=(asset,x,y,w,h,shape='ellipse')=>({asset,x,y,w,h,shape});
const ground=(base,paths,patches=[])=>({sheet:'hellWorld',base,paths,patches});
function boundary(doors){
 const out=[];
 const segments=(start,end,centers)=>{const gaps=centers.map(c=>[Math.max(start,c-110),Math.min(end,c+110)]).sort((a,b)=>a[0]-b[0]);const s=[];let p=start;for(const[a,b]of gaps){if(a>p)s.push([p,a-p]);p=Math.max(p,b);}if(p<end)s.push([p,end-p]);return s;};
 for(const[a,n]of segments(0,1600,doors.filter(d=>d.y<=200).map(d=>d.x)))out.push([a,0,n,150]);
 for(const[a,n]of segments(0,1600,doors.filter(d=>d.y>=920).map(d=>d.x)))out.push([a,965,n,115]);
 for(const[a,n]of segments(150,965,doors.filter(d=>d.x<=200).map(d=>d.y)))out.push([0,a,130,n]);
 for(const[a,n]of segments(150,965,doors.filter(d=>d.x>=1400).map(d=>d.y)))out.push([1470,a,130,n]);
 return out;
}

export const V11_ENEMY_GROUPS={
 hellApproach:[
  group('v11-approach-low',[S('hellHound',555,765,'v11-approach-1'),S('hellHound',630,805,'v11-approach-2'),S('hellSoul',605,695,'v11-approach-3')]),
  group('v11-approach-ridge',[S('hellSoul',590,320,'v11-approach-4'),S('hellSoul',665,270,'v11-approach-5'),S('hellGuard',710,365,'v11-approach-6')]),
  group('v11-approach-far',[S('hellHound',1140,685,'v11-approach-7'),S('hellGuard',1210,755,'v11-approach-8')])
 ],
 hellQuarry:[
  group('v11-quarry-lower',[S('hellHound',510,720,'v11-quarry-1'),S('hellHound',600,765,'v11-quarry-2'),S('hellGuard',615,655,'v11-quarry-3')]),
  group('v11-quarry-upper',[S('hellSoul',520,295,'v11-quarry-4'),S('hellHound',600,265,'v11-quarry-5'),S('hellGuard',655,335,'v11-quarry-6')]),
  group('v11-quarry-watch',[S('hellGuard',1120,790,'v11-quarry-7'),S('hellSoul',1210,770,'v11-quarry-8')],['v11-quarry-7'])
 ],
 hellSluice:[
  group('v11-sluice-low',[S('hellHound',545,775,'v11-sluice-1'),S('hellSoul',615,820,'v11-sluice-2'),S('hellHound',640,725,'v11-sluice-3')]),
  group('v11-sluice-bank',[S('hellSoul',470,325,'v11-sluice-4'),S('hellSoul',545,275,'v11-sluice-5'),S('hellGuard',590,370,'v11-sluice-6')]),
  group('v11-sluice-watch',[S('hellGuard',1100,800,'v11-sluice-7'),S('hellSoul',1200,785,'v11-sluice-8')])
 ],
 deepGate:[
  group('v11-deep-gate-low',[S('hellHound',550,650,'v11-deep-gate-1'),S('hellHound',630,720,'v11-deep-gate-2'),S('hellGuard',640,610,'v11-deep-gate-3')]),
  group('v11-deep-gate-high',[S('hellSoul',745,280,'v11-deep-gate-4'),S('hellSoul',825,250,'v11-deep-gate-5'),S('hellGuard',850,340,'v11-deep-gate-6')]),
  group('v11-deep-gate-far',[S('hellHound',1140,765,'v11-deep-gate-7'),S('hellGuard',1230,780,'v11-deep-gate-8')])
 ],
 deepCamp:[],
 deepCourt:[
  group('v11-court-broken-pews',[S('hellGuard',550,735,'v11-court-1'),S('hellSoul',620,785,'v11-court-2'),S('hellSoul',640,685,'v11-court-3')]),
  group('v11-court-west-aisle',[S('hellSoul',485,315,'v11-court-4'),S('hellGuard',565,270,'v11-court-5'),S('hellGuard',605,370,'v11-court-6')]),
  group('v11-court-retainers',[S('hellGuard',1110,800,'v11-court-7'),S('hellSoul',1220,790,'v11-court-8')],['v11-court-7'])
 ],
 deepBastion:[
  group('v11-bastion-low',[S('hellHound',555,805,'v11-bastion-1'),S('hellGuard',635,880,'v11-bastion-2'),S('hellGuard',650,790,'v11-bastion-3')]),
  group('v11-bastion-wall',[S('hellGuard',520,520,'v11-bastion-4'),S('hellSoul',595,570,'v11-bastion-5'),S('hellGuard',660,530,'v11-bastion-6')]),
  group('v11-bastion-oathguard',[S('hellGuard',1100,790,'v11-bastion-7'),S('hellHound',1190,810,'v11-bastion-8'),S('hellSoul',1270,750,'v11-bastion-9')],['v11-bastion-7'])
 ],
 deepCloister:[
  group('v11-cloister-low',[S('hellHound',485,560,'v11-cloister-1'),S('hellSoul',560,600,'v11-cloister-2'),S('hellGuard',580,505,'v11-cloister-3')]),
  group('v11-cloister-north',[S('hellSoul',530,275,'v11-cloister-4'),S('hellSoul',625,245,'v11-cloister-5'),S('hellGuard',675,320,'v11-cloister-6')]),
  group('v11-cloister-choir',[S('hellGuard',1090,805,'v11-cloister-7'),S('hellSoul',1210,790,'v11-cloister-8')],['v11-cloister-7'])
 ],
 deepSeal:[]
};

export const V11_MAPS={
 hellApproach:{name:'焚骨坡道',sub:'焦骨埋在灰里。主路沿南坡绕行，北面的断台还能攀上去',chapterRegion:3,entry:[280,760],layout:'forked-ash-slope',
  doors:[D(170,760,'hellGate',1320,380,'灰烬渡口','西南'),D(1430,350,'hellQuarry',280,760,'断镐采场','东北')],npcs:[],
  props:[P('v11-approach-vein','v11-ore','冷烬矿脉',365,360,365,440,4,105,90,76,26,{resource:'coldAsh',refresh:'map-reentry',firstGuaranteed:true}),P('v11-approach-bundle','v11-road-cache','压在石后的行囊',995,830,995,900,13,88,76,60,20,{limitedClaim:'approach-cache'})]},
 hellQuarry:{name:'断镐采场',sub:'两道开采沟在东端汇成石坪，沉重的脚步声从那里传来',chapterRegion:3,entry:[280,760],layout:'quarry-ribs-and-open-platform',
  doors:[D(170,760,'hellApproach',1320,350,'焚骨坡道','西南'),D(1430,350,'hellSluice',280,760,'烬潮闸道','东北','v11-quarry-cleared')],npcs:[],
  props:[P('v11-quarry-winch','v11-quarry-winch','断链绞盘',370,425,370,510,11,110,128,76,29,{limitedClaim:'quarry-winch'}),P('v11-quarry-scar','v11-boss-quarry','采场祭痕',1040,240,1040,320,13,110,92,76,26,{service:'boss-first-or-rematch'})],
  bossType:'ironScuttler',bossName:'噬铁螯兽',bossAnchor:[1110,505],cinematicStage:{hero:[905,610],saint:[830,680],boss:[1110,505]},bossTrigger:{action:'v11-boss-quarry',spawn:[1110,505],clearRadius:210,initialBoss:false,guardsMustBeCleared:false,storyGuards:['v11-quarry-7','v11-quarry-8'],reinforcementPoints:[[1130,745],[1270,740]]}},
 hellSluice:{name:'烬潮闸道',sub:'旧闸不再挡水，黑色潮气还在石缝里涨落',chapterRegion:3,entry:[280,760],layout:'broken-sluice-bypass',
  doors:[D(170,760,'hellQuarry',1320,350,'断镐采场','西南'),D(1430,340,'hellWall',280,740,'哭墙荒径','东北','v11-sluice-cleared')],npcs:[],
  props:[P('v11-sluice-pump','v11-sluice-pump','锈死的分流器',750,370,750,455,9,112,130,76,31,{limitedClaim:'sluice-pump'}),P('v11-sluice-scar','v11-boss-sluice','闸门祭痕',1120,215,1120,295,13,110,92,76,26,{service:'boss-first-or-rematch'})],
  bossType:'furnaceSentinel',bossName:'失控炉卫',bossAnchor:[1110,520],cinematicStage:{hero:[965,625],saint:[915,710],boss:[1110,520]},bossTrigger:{action:'v11-boss-sluice',spawn:[1110,520],clearRadius:210,initialBoss:false,guardsMustBeCleared:false,storyGuards:['v11-sluice-7','v11-sluice-8'],reinforcementPoints:[[1120,765],[1255,735]]}},
 deepGate:{name:'黑曜阶道',sub:'阶道向地下折去。远处传来打铁声，红火照在黑石上',chapterRegion:4,entry:[280,820],layout:'descending-obsidian-switchback',
  doors:[D(1430,460,'deepCamp',280,640,'铁火营地','东北')],npcs:[],
  props:[P('v11-deep-gate-ore','v11-deep-ore','带纹的黑晶',375,390,375,465,4,104,88,72,24,{resource:'abyssDust',refresh:'map-reentry'}),P('v11-deep-gate-pack','v11-deep-gate-cache','废弃的药囊',1030,855,1030,920,13,88,73,60,21,{limitedClaim:'deep-gate-pack'})],storyAnchors:{arrivalHero:[315,795],arrivalSaint:[380,845]}},
 deepCamp:{name:'铁火营地',sub:'矮棚挡住热风，药商把灯挂在货架上。最里面的炉子始终没熄',chapterRegion:4,safe:true,entry:[280,640],layout:'sheltered-smith-market',
  doors:[D(170,640,'deepGate',1320,460,'黑曜阶道','西'),D(1430,650,'deepCourt',280,760,'灰冕前庭','东'),D(1000,180,'deepBastion',620,290,'残旗行馆','北','v11-court-cleared'),D(1000,940,'deepCloister',620,830,'无钟回廊','南','v11-bastion-cleared')],
  npcs:[N('deepMerchant','药商',590,445,2),N('deepEnchanter','老匠人',1050,465,5),N('deepInnkeeper','守炉人',555,790,11,0)],
  props:[P('v11-deep-shop','v11-deep-shop','药商货台',435,390,435,470,12,174,102,140,32,{service:'shop'}),P('v11-deep-rest','v11-deep-rest','歇脚棚',365,770,365,855,8,220,161,184,52,{service:'rest'}),P('v11-deep-enchant','v11-deep-enchant','刻魂锻台',1170,390,1170,480,10,174,148,140,42,{service:'enchant',newSystem:true})],
  storyAnchors:{enchantHero:[1090,545],enchantSaint:[995,590],enchanter:[1050,465],restHero:[600,730],restSaint:[675,775]}},
 deepCourt:{name:'灰冕前庭',sub:'石席只剩半边，旧城的军徽仍挂在门廊上',chapterRegion:4,entry:[280,760],layout:'broken-court-and-open-dais',
  doors:[D(170,760,'deepCamp',1320,650,'铁火营地','西南'),D(1430,350,'deepBastion',280,760,'残旗行馆','东北','v11-court-cleared')],npcs:[],
  props:[P('v11-court-ash','v11-deep-ore','灰纹结晶',350,460,350,535,4,98,82,70,25,{resource:'abyssDust',refresh:'map-reentry'}),P('v11-court-scar','v11-boss-court','灰冕祭痕',1110,220,1110,300,13,112,96,76,27,{service:'boss-first-or-rematch'})],
  bossType:'odric',bossName:'奥德里克',bossAnchor:[1110,520],cinematicStage:{hero:[910,620],saint:[835,675],boss:[1110,520]},bossTrigger:{action:'v11-boss-court',spawn:[1110,520],clearRadius:210,initialBoss:false,guardsMustBeCleared:false,storyGuards:['v11-court-7','v11-court-8'],reinforcementPoints:[[1090,755],[1245,745]]}},
 deepBastion:{name:'残旗行馆',sub:'断旗垂在旅居大厅外，铺过地毯的石坪仍有人守着',chapterRegion:4,entry:[280,760],layout:'bastion-fork-and-muster-yard',
  doors:[D(170,760,'deepCourt',1320,350,'灰冕前庭','西南'),D(620,180,'deepCamp',1000,290,'铁火营地','北','v11-court-cleared'),D(1430,350,'deepCloister',280,760,'无钟回廊','东北','v11-bastion-cleared')],npcs:[],
  props:[P('v11-bastion-crate','v11-bastion-cache','封着军印的匣子',365,425,365,505,13,104,86,72,25,{limitedClaim:'bastion-supply'}),P('v11-bastion-scar','v11-boss-bastion','断旗祭痕',1110,220,1110,300,13,112,96,76,27,{service:'boss-first-or-rematch'})],
  bossType:'martha',bossName:'玛尔塔夫人',bossAnchor:[1110,520],cinematicStage:{hero:[970,600],saint:[935,700],boss:[1110,520]},bossTrigger:{action:'v11-boss-bastion',spawn:[1110,520],clearRadius:210,initialBoss:false,guardsMustBeCleared:false,storyGuards:['v11-bastion-7','v11-bastion-8','v11-bastion-9'],reinforcementPoints:[[1080,755],[1215,755]]}},
 deepCloister:{name:'无钟回廊',sub:'几根雕柱撑着塌了一半的回廊。礼钟没有声音，祷词却一直没停',chapterRegion:4,entry:[280,760],layout:'cloister-courtyard-and-side-return',
  doors:[D(170,760,'deepBastion',1320,350,'残旗行馆','西南'),D(620,940,'deepCamp',1000,830,'铁火营地','南','v11-bastion-cleared'),D(1430,370,'deepSeal',280,760,'缄门深庭','东北','v11-cloister-cleared')],npcs:[],
  props:[P('v11-cloister-font','v11-cloister-font','干涸的洗礼盆',825,820,825,900,9,104,110,72,28,{limitedClaim:'cloister-font'}),P('v11-cloister-scar','v11-boss-cloister','无钟祭痕',1110,220,1110,300,13,112,96,76,27,{service:'boss-first-or-rematch'})],
  bossType:'severin',bossName:'塞维尔',bossAnchor:[1110,520],cinematicStage:{hero:[970,600],saint:[935,700],boss:[1110,520]},bossTrigger:{action:'v11-boss-cloister',spawn:[1110,520],clearRadius:210,initialBoss:false,guardsMustBeCleared:false,storyGuards:['v11-cloister-7','v11-cloister-8'],reinforcementPoints:[[1065,765],[1220,755]]}},
 deepSeal:{name:'缄门深庭',sub:'门缝没有风，台阶上的灰却像刚落下。这里没有能用上的锁孔',chapterRegion:4,safe:true,entry:[280,760],layout:'silent-sealed-threshold',
  doors:[D(170,760,'deepCloister',1320,370,'无钟回廊','西南')],npcs:[],
  props:[P('v11-deep-seal','v11-deep-seal','缄默之门',1120,350,1120,455,7,230,255,160,45,{service:'future-sealed-door',neverOpensInChapter:4,futureContentKey:'return-to-hell'}),P('v11-deep-return-lamp','v11-deep-return','回程灯',650,745,650,820,15,50,128,24,23,{service:'camp-return'})],
  storyAnchors:{sealHero:[1070,520],sealSaint:[965,555],endingHero:[800,650],endingSaint:[875,685]}}
};

export const V11_SCENERY={
 hellApproach:[R('v11-ap-rock-w',370,630,160,104,112,31),R('v11-ap-divider-1',690,550,210,135,154,40),R('v11-ap-divider-2',915,455,205,138,150,40),R('v11-ap-east-low',1310,870,150,95,108,30),R('v11-ap-upper-tail',1050,245,150,110,110,33),T('v11-ap-tree',1230,545),T('v11-ap-tree-low',790,915,130,170),L('v11-ap-lamp-east',1275,340),L('v11-ap-lamp-west',400,845),C('v11-ap-scar',800,605,310,47),C('v11-ap-cold',465,240,180,37),G('v11-ap-herb',430,415),G('v11-ap-herb-east',1050,755)],
 hellQuarry:[R('v11-q-divider-w',565,520,220,147,168,43),R('v11-q-divider-mid',755,575,190,126,140,38),R('v11-q-south',860,915,170,103,125,32),R('v11-q-top',860,255,170,116,124,34),R('v11-q-west',285,305,137,96,100,29),R('v11-q-far',1375,865,137,91,96,29),O('v11-q-broken-frame',7,320,235,144,163,[269,204,102,31]),L('v11-q-lamp-arena-n',1320,265),L('v11-q-lamp-arena-s',1320,840),L('v11-q-lamp-fork',715,430),C('v11-q-rut',585,585,238,36),C('v11-q-ring',1100,655,250,43),G('v11-q-blue-rock',425,795)],
 hellSluice:[R('v11-s-bank-w',370,620,160,112,116,32),R('v11-s-bank-mid',640,555,204,130,150,39),R('v11-s-bank-top',875,285,148,104,105,31),R('v11-s-south-rock',865,915,170,107,125,32),R('v11-s-far-stone',1380,855,133,90,96,27),O('v11-s-old-still',9,330,235,101,128,[294,206,72,29]),T('v11-s-dead-tree',810,680,120,160),L('v11-s-east-lamp',1340,240),L('v11-s-south-lamp',1290,865),L('v11-s-west-lamp',395,845),C('v11-s-low-seam',715,630,230,42),C('v11-s-arena-seam',1120,650,235,40),C('v11-s-long-seam',465,465,300,40),G('v11-s-little-grass',705,435)],
 deepGate:[R('v11-dg-first-rise',410,665,165,115,120,33),R('v11-dg-step-mid',785,530,200,140,145,40),R('v11-dg-step-far',1070,540,192,133,140,38),R('v11-dg-upper',1120,280,170,116,124,34),R('v11-dg-south',845,915,165,100,122,30),O('v11-dg-broken-arch',7,420,240,180,204,[355,205,130,35]),T('v11-dg-tree',1360,715,125,168),L('v11-dg-lamp-turn',1030,360),L('v11-dg-lamp-camp',1290,455),L('v11-dg-lamp-entry',350,920,94),C('v11-dg-deep-scar',820,610,290,49),C('v11-dg-red-seam',1070,645,220,49),G('v11-dg-ore-tuft',465,455)],
 deepCamp:[O('v11-dc-north-shelter',8,410,260,220,160,[316,207,188,53]),O('v11-dc-store-tent',8,1310,855,196,150,[1227,805,166,50]),O('v11-dc-old-arch',7,770,250,178,202,[706,216,128,34]),O('v11-dc-water-still',9,290,520,86,110,[260,493,60,27]),R('v11-dc-central-rock',855,710,152,99,110,30),R('v11-dc-forge-wall',1290,260,174,118,126,34),R('v11-dc-low-wall',750,905,150,94,108,29),L('v11-dc-shop-lamp',665,400),L('v11-dc-forge-lamp',1310,490),L('v11-dc-rest-lamp',555,875),L('v11-dc-east-lamp',1290,635),L('v11-dc-north-lamp',1130,290),G('v11-dc-cold-grass',675,320),C('v11-dc-forge-scorch',1155,580,220,45)],
 deepCourt:[O('v11-dct-west-arch',7,340,230,175,200,[278,195,124,35]),R('v11-dct-broken-seat-1',560,540,195,125,146,37),R('v11-dct-broken-seat-2',785,450,160,106,116,32),R('v11-dct-top-seat',825,225,140,95,100,28),R('v11-dct-low-seat',850,915,166,100,120,30),R('v11-dct-far-seat',1375,865,137,89,98,28),L('v11-dct-dais-light-n',1320,245),L('v11-dct-dais-light-s',1310,845),L('v11-dct-west-light',395,845),O('v11-dct-rubble-gate',7,730,650,150,174,[677,618,106,32]),C('v11-dct-floor-fracture',1050,645,270,42),C('v11-dct-low-fracture',670,875,190,40),G('v11-dct-ash-flower',365,555)],
 deepBastion:[R('v11-db-west-block',370,610,155,105,112,32),R('v11-db-wall-low',805,650,174,120,130,36),R('v11-db-wall-high',800,315,166,113,122,34),R('v11-db-low-buttress',895,915,174,104,126,32),R('v11-db-far-buttress',1380,875,139,94,100,30),O('v11-db-broken-banner-frame',7,360,240,170,195,[299,206,122,34]),O('v11-db-unused-forge',10,470,250,112,102,[428,222,84,28]),L('v11-db-north-light',720,255),L('v11-db-east-light',1320,240),L('v11-db-low-light',1320,850),L('v11-db-west-light',405,855),C('v11-db-floor-scar',980,650,240,43),C('v11-db-lower-scar',600,880,230,36)],
 deepCloister:[O('v11-dcl-west-arch',7,365,255,169,195,[304,221,122,34]),R('v11-dcl-west-pew',365,435,146,98,106,30),R('v11-dcl-cross-pillar',755,470,156,109,112,32),R('v11-dcl-low-pillar',840,685,152,103,110,31),R('v11-dcl-top-pillar',830,225,140,94,100,28),R('v11-dcl-end-pillar',1380,865,138,95,98,29),L('v11-dcl-cold-lamp-n',1320,245),L('v11-dcl-cold-lamp-s',1320,845),L('v11-dcl-return-lamp',735,880),L('v11-dcl-west-lamp',410,835),T('v11-dcl-dead-tree',770,630,116,151),C('v11-dcl-altar-scar',1110,665,245,40),C('v11-dcl-west-scar',630,675,190,38),G('v11-dcl-blue-ash',935,845)],
 deepSeal:[R('v11-ds-approach-left',555,555,196,128,144,39),R('v11-ds-approach-right',875,760,180,119,130,35),R('v11-ds-west-tail',350,365,152,108,108,31),R('v11-ds-north-left',860,300,170,120,120,35),R('v11-ds-east-foot',1340,660,172,116,124,33),O('v11-ds-door-left-frame',7,900,280,150,192,[846,248,108,32]),O('v11-ds-door-right-frame',7,1340,300,150,192,[1286,268,108,32]),L('v11-ds-lamp-left',965,400),L('v11-ds-lamp-right',1280,460),L('v11-ds-west-lamp',435,825),C('v11-ds-door-seam',1120,425,275,38),C('v11-ds-cold-fissure',780,435,235,44),G('v11-ds-gray-grass',735,720)]
};

export const V11_GROUND_STYLE={
 hellApproach:ground(2,[path(1,137,[[130,760],[370,760],[610,650],[840,660],[1090,510],[1290,350],[1470,350]]),path(1,99,[[370,760],[330,510],[435,325],[680,250],[855,320],[1090,510]]),path(1,80,[[840,660],[980,900],[1180,800],[1290,600]])],[patch(0,565,450,460,185),patch(1,930,740,260,165)]),
 hellQuarry:ground(0,[path(1,138,[[130,760],[350,760],[655,790],[850,690],[1000,610],[1160,500],[1300,350],[1470,350]]),path(1,96,[[350,760],[350,510],[410,340],[660,230],[845,330],[970,500]]),path(3,108,[[925,590],[950,360],[1100,320],[1280,400],[1270,650],[1080,710],[925,590]])],[patch(3,890,320,445,400),patch(2,465,465,335,145)]),
 hellSluice:ground(0,[path(3,130,[[130,760],[400,760],[670,665],[900,685],[1110,615],[1290,480],[1470,340]]),path(1,102,[[400,760],[300,475],[415,300],[650,235],[790,450],[930,600]]),path(3,106,[[930,600],[940,360],[1120,305],[1310,410],[1300,660],[1100,715],[930,600]])],[patch(2,470,485,285,135),patch(3,890,310,450,410)]),
 deepGate:ground(0,[path(3,143,[[280,965],[280,820],[450,790],[705,675],[825,640],[970,400],[1210,450],[1470,460]]),path(1,94,[[450,790],[350,485],[450,370],[720,245],[940,340],[970,400]]),path(1,91,[[825,640],[980,810],[1190,850],[1300,655],[1210,450]])],[patch(2,660,480,480,170),patch(3,250,700,460,185)]),
 deepCamp:ground(3,[path(1,142,[[130,640],[435,640],[760,590],[1025,600],[1470,650]]),path(1,119,[[1000,150],[1000,335],[885,485],[885,590],[1060,760],[1000,965]]),path(1,100,[[435,640],[435,480],[610,475],[885,485]]),path(1,95,[[435,640],[535,730],[610,805],[1060,760]]),path(2,90,[[1025,600],[1170,480]])],[patch(2,1000,300,330,305),patch(1,260,700,440,160)]),
 deepCourt:ground(3,[path(1,135,[[130,760],[415,760],[680,810],[880,705],[1040,600],[1160,500],[1320,350],[1470,350]]),path(1,105,[[415,760],[345,580],[405,345],[650,240],[795,310],[920,490]]),path(1,105,[[900,630],[940,365],[1110,305],[1310,420],[1280,675],[1090,715],[900,630]])],[patch(0,450,460,390,230),patch(2,915,365,380,305)]),
 deepBastion:ground(3,[path(1,142,[[130,760],[430,760],[675,650],[920,705],[1100,620],[1260,480],[1470,350]]),path(1,118,[[620,150],[620,295],[690,460],[675,650]]),path(1,108,[[920,705],[925,430],[1080,305],[1320,410],[1300,660],[1100,720]])],[patch(0,700,550,185,155),patch(2,910,355,405,350)]),
 deepCloister:ground(3,[path(1,142,[[130,760],[375,760],[650,750],[850,575],[1075,620],[1295,485],[1470,370]]),path(1,109,[[375,760],[435,595],[600,435],[680,270],[880,325],[925,455]]),path(1,108,[[620,965],[620,830],[650,750]]),path(1,97,[[925,630],[950,365],[1110,305],[1300,400],[1280,650],[1080,725]])],[patch(0,665,410,170,280),patch(2,900,350,410,370)]),
 deepSeal:ground(0,[path(3,148,[[130,760],[390,760],[660,675],[835,555],[1110,455]]),path(3,98,[[660,675],[650,820],[935,900],[1160,760],[1240,545],[1110,455]])],[patch(3,925,410,365,245),patch(2,710,795,345,125)])
};

for(const[id,m]of Object.entries(V11_MAPS)){m.size=[1600,1080];m.footBounds=[135,155,1465,965];m.safe=m.safe===true;m.blocks=boundary(m.doors);m.spawns=V11_ENEMY_GROUPS[id].flatMap(g=>g.spawns.map(s=>[...s]));m.enemyGroups=V11_ENEMY_GROUPS[id].map(g=>g.id);m.initialSpawnSafeRadius=200;m.mapReentryRefresh={ordinaryMonsters:!m.safe,resources:!m.safe,bosses:false,jitter:28};}

export const CH3_EXT_MAPS=Object.fromEntries(Object.entries(V11_MAPS).filter(([,m])=>m.chapterRegion===3));
export const CH4_MAPS=Object.fromEntries(Object.entries(V11_MAPS).filter(([,m])=>m.chapterRegion===4));
export const V11_DOOR_PATCHES=[
 {map:'hellGate',matchTo:'hellWall',replacement:D(1430,380,'hellApproach',280,760,'焚骨坡道','东北')},
 {map:'hellWall',matchTo:'hellGate',replacement:D(170,740,'hellSluice',1320,340,'烬潮闸道','西南','v11-sluice-cleared')}
];
export const V11_BOSS_LAYOUTS=Object.fromEntries(Object.entries(V11_MAPS).filter(([,m])=>m.bossTrigger).map(([id,m])=>[id,{...m.bossTrigger,bossType:m.bossType,bossName:m.bossName,bossAnchor:m.bossAnchor,cinematicStage:m.cinematicStage,firstFight:'story',rematch:'explicit-prop-only',repeatRewardPolicy:'runtime'}]));
export const V11_ART_REPLACEMENT_HINTS={
 deepGate:{ground:'cold obsidian stair remnants; keep walkable 2D paths continuous',replace:['v11-dg-broken-arch','v11-dg-lamp-turn','v11-dg-lamp-camp']},
 deepCamp:{ground:'soot-dark courtyard lit by orange forge and lamps',replace:['v11-deep-shop','v11-deep-rest','v11-deep-enchant']},
 deepCourt:{ground:'black stone court with tarnished gilding, broken seating on west, clear east arena',replace:['v11-dct-west-arch','v11-dct-broken-seat-1','v11-dct-broken-seat-2','v11-dct-rubble-gate']},
 deepBastion:{ground:'old military forecourt; weathered banners, intact clear central muster ground',replace:['v11-db-broken-banner-frame','v11-db-wall-low','v11-db-wall-high']},
 deepCloister:{ground:'cold blue obsidian cloister with ornate broken pillars, sparse pale embers',replace:['v11-dcl-west-arch','v11-dcl-cross-pillar','v11-dcl-low-pillar','v11-dcl-top-pillar']},
 deepSeal:{ground:'quiet basalt approach; monumental closed door, no motion or recognisable voice beyond it',replace:['v11-deep-seal','v11-ds-door-left-frame','v11-ds-door-right-frame']}
};
