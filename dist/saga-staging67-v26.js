// V26 physical staging for 24 new village / historical-memory episodes.
// Generated from the authored blueprint. Every beat retains its dialogue row.
import {MAPS,DIALOGUES} from './data-v14.js';
import {SCENERY} from './world-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {SAGA_DIALOGUES67_V26} from './v26-story67-text.js';
const clone=x=>structuredClone(x);
const names={"艾莉娅": "saint", "诺恩": "hero", "老杜": "oldDu", "阿绢": "aju", "伤工": "worker", "获救姑娘": "girl1", "渡船老人": "boatman", "阿棠": "atang", "奥德里克": "odric", "护卫": "guard1", "车夫": "driver", "玛尔塔夫人": "martha", "药舍学徒": "apprentice"};
const SEEDS={
 "c6v26BorrowedRoofIntro": {
  "map": "ch6VillageSquare",
  "actors": {
   "hero": [
    655,
    635
   ],
   "saint": [
    710,
    585
   ],
   "oldDu": [
    795,
    490
   ],
   "aju": [
    885,
    565
   ],
   "child": [
    895,
    495
   ]
  }
 },
 "c6v26BorrowedRoofHerbs": {
  "map": "ch6VillageLane",
  "actors": {
   "saint": [
    740,
    715
   ],
   "oldDu": [
    880,
    735
   ],
   "aju": [
    850,
    615
   ],
   "hero": [
    665,
    660
   ]
  }
 },
 "c6v26BorrowedRoofBoards": {
  "map": "ch6VillageLane",
  "actors": {
   "aju": [
    850,
    615
   ],
   "hero": [
    665,
    660
   ],
   "saint": [
    740,
    715
   ],
   "oldDu": [
    945,
    665
   ]
  }
 },
 "c6v26BorrowedRoofComplete": {
  "map": "ch6VillageLane",
  "actors": {
   "oldDu": [
    945,
    665
   ],
   "saint": [
    740,
    715
   ],
   "aju": [
    850,
    615
   ],
   "hero": [
    665,
    660
   ]
  }
 },
 "c6v26MissingNamesIntro": {
  "map": "ch6VillageSquare",
  "actors": {
   "saint": [
    720,
    720
   ],
   "worker": [
    955,
    730
   ],
   "aju": [
    850,
    635
   ],
   "hero": [
    640,
    680
   ]
  }
 },
 "c6v26MissingNamesReceipts": {
  "map": "ch6VillageLane",
  "actors": {
   "aju": [
    850,
    615
   ],
   "saint": [
    740,
    715
   ],
   "worker": [
    930,
    755
   ],
   "hero": [
    665,
    660
   ]
  }
 },
 "c6v26MissingNamesSeals": {
  "map": "ch6VillageLane",
  "actors": {
   "hero": [
    665,
    660
   ],
   "aju": [
    850,
    615
   ],
   "saint": [
    740,
    715
   ],
   "worker": [
    930,
    755
   ]
  }
 },
 "c6v26MissingNamesComplete": {
  "map": "ch6VillageLane",
  "actors": {
   "worker": [
    930,
    755
   ],
   "saint": [
    740,
    715
   ],
   "aju": [
    850,
    615
   ],
   "hero": [
    665,
    660
   ]
  }
 },
 "c6v26LastWagonIntro": {
  "map": "ch6ConvoyRoad",
  "actors": {
   "saint": [
    820,
    760
   ],
   "girl1": [
    905,
    805
   ],
   "hero": [
    730,
    740
   ]
  }
 },
 "c6v26LastWagonKeys": {
  "map": "ch6ConvoyRoad",
  "actors": {
   "saint": [
    820,
    760
   ],
   "girl1": [
    905,
    805
   ],
   "hero": [
    730,
    740
   ]
  }
 },
 "c6v26LastWagonBelongings": {
  "map": "ch6ConvoyRoad",
  "actors": {
   "girl1": [
    905,
    805
   ],
   "saint": [
    820,
    760
   ],
   "hero": [
    730,
    740
   ]
  }
 },
 "c6v26LastWagonComplete": {
  "map": "ch6ConvoyRoad",
  "actors": {
   "girl1": [
    905,
    805
   ],
   "hero": [
    730,
    740
   ],
   "saint": [
    820,
    760
   ]
  }
 },
 "c6v26LastFerryIntro": {
  "map": "ch6Riverside",
  "actors": {
   "boatman": [
    710,
    825
   ],
   "aju": [
    500,
    805
   ],
   "hero": [
    535,
    735
   ],
   "saint": [
    620,
    775
   ],
   "atang": [
    660,
    870
   ]
  }
 },
 "c6v26LastFerryReeds": {
  "map": "ch6Riverside",
  "actors": {
   "boatman": [
    710,
    825
   ],
   "saint": [
    620,
    775
   ],
   "hero": [
    535,
    735
   ]
  }
 },
 "c6v26LastFerryTools": {
  "map": "ch6Riverside",
  "actors": {
   "boatman": [
    710,
    825
   ],
   "saint": [
    620,
    775
   ],
   "hero": [
    535,
    735
   ],
   "aju": [
    500,
    805
   ]
  }
 },
 "c6v26LastFerryComplete": {
  "map": "ch6Riverside",
  "actors": {
   "boatman": [
    710,
    825
   ],
   "aju": [
    500,
    805
   ],
   "oldDu": [
    420,
    690
   ],
   "saint": [
    620,
    775
   ],
   "atang": [
    660,
    870
   ],
   "hero": [
    535,
    735
   ]
  }
 },
 "c7v26SecondWagonIntro": {
  "map": "ch7OdricPass",
  "actors": {
   "odric": [
    985,
    490
   ],
   "guard1": [
    1125,
    570
   ],
   "hero": [
    890,
    470
   ]
  }
 },
 "c7v26SecondWagonAxles": {
  "map": "ch7OdricPass",
  "actors": {
   "odric": [
    985,
    490
   ],
   "driver": [
    1080,
    465
   ],
   "hero": [
    890,
    470
   ]
  }
 },
 "c7v26SecondWagonWedges": {
  "map": "ch7OdricPass",
  "actors": {
   "driver": [
    1080,
    465
   ],
   "hero": [
    890,
    470
   ],
   "odric": [
    985,
    490
   ],
   "guard1": [
    1125,
    570
   ]
  }
 },
 "c7v26SecondWagonComplete": {
  "map": "ch7OdricPass",
  "actors": {
   "driver": [
    1080,
    465
   ],
   "guard1": [
    1125,
    570
   ],
   "odric": [
    985,
    490
   ],
   "hero": [
    890,
    470
   ]
  }
 },
 "c7v26MedicineRoundsIntro": {
  "map": "ch7MarthaHospice",
  "actors": {
   "martha": [
    975,
    590
   ],
   "apprentice": [
    1110,
    600
   ],
   "hero": [
    875,
    650
   ]
  }
 },
 "c7v26MedicineRoundsHerbs": {
  "map": "ch7MarthaHospice",
  "actors": {
   "apprentice": [
    1110,
    600
   ],
   "martha": [
    975,
    590
   ],
   "hero": [
    875,
    650
   ]
  }
 },
 "c7v26MedicineRoundsPackets": {
  "map": "ch7MarthaHospice",
  "actors": {
   "martha": [
    975,
    590
   ],
   "hero": [
    875,
    650
   ],
   "apprentice": [
    1110,
    600
   ],
   "driver": [
    1180,
    735
   ]
  }
 },
 "c7v26MedicineRoundsComplete": {
  "map": "ch7MarthaHospice",
  "actors": {
   "martha": [
    975,
    590
   ],
   "apprentice": [
    1110,
    600
   ],
   "hero": [
    875,
    650
   ],
   "driver": [
    1180,
    735
   ]
  }
 }
};
const stand={pose:'stand',v25Pose:'stand',autoFace:true,hideWeapon:true,v25Held:null};
const cast={oldDu:2,aju:7,worker:4,girl1:6,boatman:2,atang:6,odric:8,guard1:8,driver:2,martha:11,apprentice:4,child:4};
const m=(id,x,y,t=.9,delay=0,arrival)=>[id,x,y,t,delay,...(arrival?[arrival]:[])];
const b=(line,moves=[],hold=.45,faces={},meta={})=>({line,moves,hold,faceTargets:faces,actorMeta:{...Object.fromEntries(moves.filter(v=>!v[0].startsWith('p_')).map(v=>[v[0],clone(stand)])),...meta}});
const mutual={hero:'saint',saint:'hero'};
const sit={pose:'seated',v25Pose:'stand',autoFace:false,poseFlip:false,angle:0};
const BEATS={
 c6v26BorrowedRoofIntro:[b(0,[m('saint',735,530,1)],.65,{saint:'oldDu',oldDu:'saint',hero:'oldDu',aju:'oldDu'}),b(7,[m('hero',700,590,.6)],.5,{hero:'aju',aju:'hero'}),b(11,[m('aju',860,520,.65)],.7,{saint:[820,535],aju:[820,535]}),b(16,[m('aju',890,610,.8)],.4),b(17,[m('hero',745,610,.5)],.6,mutual)],
 c6v26BorrowedRoofHerbs:[b(0,[m('saint',750,680,.6)],.6,{saint:'oldDu',oldDu:'saint',hero:'oldDu',aju:'saint'}),b(6,[m('saint',755,620,.65)],.6,{saint:[840,615]}),b(10,[m('hero',690,700,.6)],.6,mutual),b(13,[m('saint',745,720,.8)],.5,mutual),b(15,[],.5)],
 c6v26BorrowedRoofBoards:[b(0,[m('hero',730,590,1)],.6,{hero:'aju',aju:'hero',saint:'aju',oldDu:'hero'}),b(3,[],.4),{...b(6,[],1.5),screenFadeV20:true},b(7,[m('hero',700,685,.9)],.5,mutual),b(13,[m('aju',865,600,.5)],.65,{hero:'aju',saint:'aju',aju:[840,615]}),b(15,[],.55,{saint:'aju',hero:'saint'})],
 c6v26BorrowedRoofComplete:[b(0,[m('oldDu',930,650,.5)],.6,{hero:[840,615],saint:'oldDu',oldDu:'saint',aju:'oldDu'}),b(6,[m('saint',755,650,.6)],.6,{saint:[840,615],oldDu:[840,615]}),b(10,[m('hero',705,570,.9)],.5,mutual),b(14,[m('saint',765,565,.9)],.8,mutual),b(17,[],.5)],
 c6v26MissingNamesIntro:[b(0,[m('saint',845,745,1)],.65,{saint:'worker',worker:'saint',hero:'worker',aju:'worker'}),b(5,[m('hero',735,740,.85)],.5,{hero:'worker',worker:'hero'}),b(13,[m('aju',865,655,.45)],.7,{aju:'worker',saint:'aju'}),b(15,[m('saint',820,715,.45)],.5,mutual),b(17,[],.6)],
 c6v26MissingNamesReceipts:[b(0,[m('saint',750,660,.6)],.6,{hero:[840,615],aju:[840,615],saint:[840,615],worker:'aju'}),b(6,[m('aju',905,590,.6)],.65,{aju:[1140,560],saint:'aju'}),b(9,[m('hero',690,725,.7)],.5,{hero:'worker',worker:'hero'}),b(14,[m('saint',800,755,.65)],.5,{saint:'worker',worker:'saint'}),b(15,[],.7)],
 c6v26MissingNamesSeals:[b(0,[m('hero',745,640,.7)],.65,{hero:[840,615],aju:[840,615],saint:'hero',worker:'hero'}),b(4,[m('saint',815,740,.65)],.5,{saint:'worker',worker:'hero'}),b(10,[m('aju',890,595,.5)],.65,{aju:'saint',saint:'aju'}),b(14,[m('hero',705,730,.8)],.5,{hero:'aju',aju:'hero'}),b(15,[],.65)],
 c6v26MissingNamesComplete:[b(0,[m('saint',820,735,.7)],.7,{saint:'worker',worker:[885,775],hero:'worker',aju:'worker'}),b(5,[m('aju',1070,520,1.6)],.65,{worker:'aju',saint:'worker'}),b(9,[],.65,mutual),b(11,[m('worker',1030,735,1.6),m('saint',915,760,1.1)],.85,{hero:'worker',saint:'worker',worker:[1130,565]}),b(15,[m('aju',1070,600,.7)],.55,{aju:'hero',hero:'aju'}),b(17,[],.8,{hero:[1370,620],saint:[1370,620],aju:[1370,620],worker:[1370,620]})],
 c6v26LastWagonIntro:[b(0,[m('saint',885,755,.65)],.7,{hero:'girl1',saint:'girl1',girl1:'saint'}),b(5,[m('girl1',985,795,.75),m('saint',925,750,.55)],.7,{girl1:[1120,755],saint:'girl1'}),b(8,[m('hero',785,795,.6)],.5,mutual),b(14,[m('girl1',1020,790,.5)],.7,{girl1:[1125,740],saint:'girl1'}),b(17,[],.5)],
 c6v26LastWagonKeys:[b(0,[m('girl1',975,785,.75),m('saint',900,755,.75)],.7,{girl1:[1030,790],saint:[1030,790],hero:'girl1'}),b(7,[m('hero',795,805,.6)],.6,{hero:'girl1',girl1:'hero'}),b(8,[m('girl1',980,805,.4)],.65,{girl1:'saint',saint:'girl1'}),b(12,[m('hero',835,760,.6)],.5,mutual),b(15,[],.6)],
 c6v26LastWagonBelongings:[b(0,[m('hero',745,800,.6),m('saint',830,790,.4)],.6,{hero:[850,835],saint:[850,835],girl1:'saint'}),b(6,[m('girl1',930,830,.5)],.7,{saint:'girl1',girl1:[910,850]}),b(7,[m('hero',720,725,.6)],.5,mutual),b(13,[m('saint',795,745,.6)],.55,mutual),b(15,[m('hero',650,670,.8)],.65,{saint:'hero',girl1:[1130,740]})],
 c6v26LastWagonComplete:[b(0,[m('saint',855,755,.4)],.65,{saint:'girl1',girl1:'saint',hero:'girl1'}),b(5,[m('girl1',955,815,.5)],.55,{girl1:'saint',saint:'girl1'}),b(11,[],.8,{hero:[1135,740],saint:[1135,740],girl1:[1135,740]}),b(12,[m('hero',1040,815,1.6)],.65,{hero:[1135,740],saint:'hero'}),b(17,[m('girl1',965,850,.45)],.75,{girl1:'hero',saint:[1135,740]})],
 c6v26LastFerryIntro:[b(0,[m('hero',555,765,.45)],.65,{hero:'boatman',saint:'boatman',boatman:'hero',aju:'boatman',atang:'aju'}),b(8,[m('atang',690,900,.5)],.65,{atang:'aju',aju:'atang',saint:'atang'}),b(12,[m('hero',570,715,.55)],.45,mutual),b(16,[m('boatman',785,850,.7)],.7,{boatman:[1050,835]}),b(17,[],.5,{aju:'hero',hero:'aju'})],
 c6v26LastFerryReeds:[b(0,[m('saint',645,775,.4)],.7,{hero:'boatman',saint:'boatman',boatman:'saint'}),b(6,[m('hero',560,825,.7)],.8,{hero:[655,835],saint:'hero'}),b(11,[],.7,{boatman:'saint',hero:'boatman',saint:'boatman'}),b(14,[m('hero',515,725,.75),m('saint',605,745,.6)],.5,mutual),b(15,[],.55,{hero:'boatman',saint:'boatman'})],
 c6v26LastFerryTools:[b(0,[m('hero',580,755,.5)],.7,{hero:'boatman',boatman:[735,860],saint:'boatman',aju:'boatman'}),b(5,[m('aju',570,815,.6),m('saint',635,810,.6)],.65,{aju:'saint',saint:'aju'}),b(8,[],.85,{hero:'aju',saint:'aju',aju:'saint'}),b(13,[],.75),b(14,[m('aju',520,865,.55)],.5,{saint:'aju',aju:'saint'}),b(15,[],.55)],
 c6v26LastFerryComplete:[b(0,[m('boatman',750,835,.55)],.65,{boatman:'aju',aju:'oldDu',oldDu:'aju',saint:'boatman',hero:'boatman',atang:'saint'}),b(6,[m('atang',665,860,.45)],.75,{saint:'atang',atang:'saint',hero:'saint'}),b(11,[m('aju',505,735,.7)],.7,{aju:'hero',hero:'aju'}),b(15,[],.65,{hero:'boatman',saint:'boatman',aju:'boatman',atang:'boatman'}),b(17,[],.8,{saint:'aju',aju:'saint'})],
 c7v26SecondWagonIntro:[b(0,[m('guard1',1100,545,.55)],.7,{odric:'guard1',guard1:'odric',hero:'guard1'}),b(4,[m('hero',880,530,.65)],.5,{hero:'odric',odric:'hero'}),b(9,[],.8,{hero:[950,530],odric:[970,565]}),b(14,[],.65,{hero:'odric',odric:'hero'}),b(15,[m('hero',835,615,1),m('odric',970,650,1.3)],.65,{hero:[650,720],odric:[650,720]})],
 c7v26SecondWagonAxles:[b(0,[m('hero',910,520,.65)],.65,{hero:[1020,550],odric:[1020,550],driver:'odric'}),b(2,[m('driver',1100,495,.45)],.5,{driver:'hero',hero:'driver'}),b(7,[m('hero',910,565,.5)],.65,{hero:'driver',driver:[1040,550]}),b(12,[m('odric',985,520,.45)],.7,{odric:'driver',hero:'odric'}),b(15,[m('odric',900,645,1.3)],.55,{odric:'hero',hero:'odric'})],
 c7v26SecondWagonWedges:[b(0,[m('hero',905,560,.75)],.65,{hero:'driver',driver:'hero',odric:'hero',guard1:'odric'}),b(4,[m('guard1',1135,640,.8)],.7,{guard1:'odric',odric:'guard1'}),b(8,[],.6,{hero:'odric',odric:'hero'}),b(10,[m('driver',1090,510,.5)],.65,{driver:'hero',hero:'driver'}),b(15,[],.6,{odric:'guard1',guard1:'odric'})],
 c7v26SecondWagonComplete:[b(0,[m('hero',900,555,.75)],.7,{hero:'driver',driver:'guard1',guard1:'driver',odric:'driver'}),b(8,[m('driver',1085,520,.6)],.65,{driver:'hero',hero:'driver'}),b(12,[m('hero',900,620,.7,0,sit)],.9,{hero:'odric',odric:'hero'}),b(16,[],.6,{odric:'guard1',guard1:'odric'}),b(17,[],.95,{}, {hero:{pose:'drink',v25Pose:'stand',autoFace:false,poseFlip:false}})],
 c7v26MedicineRoundsIntro:[b(0,[m('hero',945,670,.75)],.7,{hero:'martha',martha:'apprentice',apprentice:'martha'}),b(7,[m('apprentice',1140,610,.5)],.65,{apprentice:[1090,635],martha:'apprentice',hero:'apprentice'}),b(12,[],.55,{hero:'apprentice',apprentice:'hero'}),b(17,[m('martha',990,580,.5)],.8,{martha:'hero',hero:'martha'})],
 c7v26MedicineRoundsHerbs:[b(0,[m('hero',950,680,.8)],.65,{hero:'apprentice',apprentice:'martha',martha:'apprentice'}),b(6,[m('apprentice',1150,635,.55)],.65,{apprentice:[1080,635],martha:'apprentice'}),b(9,[],.6,{martha:'apprentice',apprentice:'martha'}),b(14,[m('hero',920,760,.8)],.65,{martha:'hero',hero:'martha'}),b(15,[m('apprentice',1110,735,.85)],.7,{hero:'apprentice',apprentice:'hero'})],
 c7v26MedicineRoundsPackets:[b(0,[m('hero',950,700,.85)],.65,{hero:'martha',martha:[1080,635],apprentice:'martha',driver:'martha'}),b(6,[m('driver',1185,705,.55)],.7,{driver:'martha',martha:'driver'}),b(10,[],.5,{driver:[960,855],martha:'driver',hero:'driver'}),b(13,[m('apprentice',1100,770,1),m('hero',890,825,1.2)],.7,{hero:[960,855],apprentice:'hero'}),b(15,[],.65)],
 c7v26MedicineRoundsComplete:[{...b(0,[],1.5,{hero:'martha',martha:'apprentice',apprentice:'martha',driver:'martha'}),screenFadeV20:true},b(5,[m('driver',1170,715,.5)],.7,{driver:'martha',martha:'driver'}),b(10,[m('apprentice',1135,725,.95)],.65,{apprentice:'hero',hero:'apprentice'}),b(14,[m('hero',930,715,.9,0,sit)],.8,{hero:'martha',martha:'hero'}),b(17,[m('apprentice',1070,750,.65)],1,{hero:'martha',apprentice:[1080,635]}, {hero:{pose:'drink',v25Pose:'stand',autoFace:false,poseFlip:false}})]
};
export const CHAPTER67_STAGING_V26={};
for(const[id,seed]of Object.entries(SEEDS)){
 const s=CHAPTER67_STAGING_V26[id]={...clone(seed),actorMeta:{},beats:BEATS[id],socialV20:true,commitActor:'hero',initiallyHidden:[],noCG:true,focus:[seed.actors.hero[0]+85,seed.actors.hero[1]-65],faceTargets:{},speaker_actor_per_line:SAGA_DIALOGUES67_V26[id].map(([name])=>names[name]||null)};
 for(const key of Object.keys(s.actors))s.actorMeta[key]=key==='hero'?{...stand,renderAs:'hero',socialV20:true,v25Cloak:false}:key==='saint'?{...stand,sprite:0,socialV20:true,disguiseV25:true}:{...stand,sprite:cast[key]??3,socialV20:false,...(['child','apprentice'].includes(key)?{size:key==='child'?58:70}:{})};
 if(id==='c7v26SecondWagonComplete')s.seatsV20=[{id:'v26-pass-hero-chair',actor:'hero',x:900,y:620,flip:false}];
 if(id==='c7v26MedicineRoundsComplete')s.seatsV20=[{id:'v26-hospice-hero-chair',actor:'hero',x:930,y:715,flip:false}];
}
const prop=(s,id,sheet,index,x,y,w,h,depthY=y+1)=>{s.actors[id]=[x,y];s.actorMeta[id]={renderAs:'prop',pose:'lying',autoFace:false,visible:true,v25Raster:{sheet,index,w,h},depthY};};
for(const[id,s]of Object.entries(CHAPTER67_STAGING_V26)){
 if(id.includes('BorrowedRoof')||id.includes('MissingNames')){
  const square=s.map==='ch6VillageSquare';prop(s,'p_v26_medicine','details',7,square?845:817,square?595:615,42,31,square?596:655.2);
  if(id.includes('Complete')||id.includes('Receipts')||id.includes('Seals')||id.includes('Boards'))prop(s,'p_v26_receipts','details',5,868,615,42,29,655.3);
 }
 if(id.includes('LastWagon')){prop(s,'p_v26_water','world',13,875,858,33,35);prop(s,'p_v26_luggage','details',7,815,850,60,45);}
 if(id.includes('LastFerry')){prop(s,'p_v26_supplies','details',7,590,880,64,46);prop(s,'p_v26_reeds','details',6,780,905,45,45);}
 if(id.includes('SecondWagon')){prop(s,'p_v26_supplies','details',7,1025,550,45,34,590.2);if(id.endsWith('Complete'))prop(s,'p_v26_food','romancePropsV20',5,1060,550,35,26,590.3);}
 if(id.includes('MedicineRounds')){prop(s,'p_v26_medicine','details',7,1070,635,43,31,675.2);prop(s,'p_v26_notes','details',5,1120,635,31,21,675.3);}
}
export const CHAPTER67_FURNITURE_V26=[
 {map:'ch6VillageLane',object:{id:'v26-village-worktable',sheet:'world',asset:9,x:840,y:655,w:150,h:63,box:[783,633,114,22]}},
 {map:'ch7OdricPass',object:{id:'v26-pass-worktable',sheet:'world',asset:9,x:1020,y:590,w:150,h:63,box:[963,568,114,22]}},
 {map:'ch7MarthaHospice',object:{id:'v26-hospice-well',sheet:'world',asset:8,x:960,y:855,w:100,h:104,box:[928,827,64,28]}}
];
export function installChapter67StagingV26(){
 Object.assign(DIALOGUES,clone(SAGA_DIALOGUES67_V26));
 for(const{map,object}of CHAPTER67_FURNITURE_V26){
  const definition=MAPS[map],scenery=SCENERY[map];if(!definition||!scenery)throw new Error('Register V25 maps before V26 staging: '+map);
  if(!scenery.some(o=>o.id===object.id))scenery.push(clone(object));
  definition.scenery||=[];if(!definition.scenery.some(o=>o.id===object.id))definition.scenery.push(clone(object));
  definition.blocks||=[];if(!definition.blocks.some(v=>JSON.stringify(v)===JSON.stringify(object.box)))definition.blocks.push(clone(object.box));
 }
 for(const[id,s]of Object.entries(CHAPTER67_STAGING_V26)){STAGING.scenes[id]=CHAPTER_STAGING[id]=clone(s);CINEMATIC_SCENES.add(id);}
}
