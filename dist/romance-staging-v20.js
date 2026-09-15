import {DIALOGUES} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {ROMANCE_SCENES_V20,ROMANCE_EPISODES_V20} from './romance-text-v20.js';

const copy=v=>structuredClone(v),mutual={hero:'saint',saint:'hero'};
const move=(id,x,y,duration=.7,delay=0,arrival)=>[id,x,y,duration,delay,...(arrival?[arrival]:[])];
const beat=(line,moves=[],actorMeta={},hold=0,faceTargets=mutual)=>({line,moves,actorMeta,hold,faceTargets});
const poses=(hero='stand',saint='stand')=>({hero:{pose:hero},saint:{pose:saint}});
const seated=(id,x,y)=>move(id,x,y,.8,0,{pose:'seated'});
const both=(hx,hy,sx,sy)=>[move('hero',hx,hy),move('saint',sx,sy,.85)];

export function installRomanceStagingV20(){
 Object.assign(DIALOGUES,copy(ROMANCE_SCENES_V20));
 for(const e of ROMANCE_EPISODES_V20)for(const id of e.parts){
  const s={map:e.map,actors:copy(e.actors),actorMeta:{hero:{renderAs:'hero',pose:'stand',socialV20:true,hideWeapon:true},saint:{sprite:0,pose:'stand',socialV20:true}},initiallyHidden:[],commitActor:'hero',focus:[(e.actors.hero[0]+e.actors.saint[0])/2,e.actors.hero[1]-35],faceTargets:copy(mutual),beats:[beat(0,[],{},.45)]};
  STAGING.scenes[id]=CHAPTER_STAGING[id]=s;CINEMATIC_SCENES.add(id);
 }
 const set=(id,config,beats)=>{const s=STAGING.scenes['v20Romance'+id];Object.assign(s,config);s.beats=beats;return s;};
 const actors=(hero,saint)=>({actors:{hero,saint}});
 const seats=(h,s)=>({seatsV20:[{id:'hero-seat',actor:'hero',x:h[0],y:h[1],flip:false},{id:'saint-seat',actor:'saint',x:s[0],y:s[1],flip:false}]});
 const poseStart=(h='seated',s='seated')=>({actorMeta:{hero:{renderAs:'hero',pose:h,socialV20:true,hideWeapon:true},saint:{sprite:0,pose:s,socialV20:true}}});
 const tableSeats=seats([940,660],[1030,655]);
 const tavernActors={hero:[925,710],saint:[1030,710],ch5Barkeep:[1110,720]};
 const tavernMeta={hero:{renderAs:'hero',pose:'stand',socialV20:true,hideWeapon:true},saint:{sprite:0,pose:'stand',socialV20:true},ch5Barkeep:{sprite:12}};
 set('TavernA',{actors:tavernActors,actorMeta:tavernMeta,...tableSeats,focus:[985,600]},[
  beat(0,[],{},.5),beat(3,[move('ch5Barkeep',1090,710,.8)]),
  beat(7,[seated('hero',940,660),seated('saint',1030,655)]),
  beat(14,[],{saint:{pose:'drink'}},.9),beat(18,[],{saint:{pose:'seated'}},.3),
  beat(19,[],poses('drink','drink'),.8),beat(23,[],poses('seated','seated'),.5)
 ]);
 set('TavernB',{...actors([940,660],[1030,655]),...poseStart(),...tableSeats,focus:[985,600]},[
  beat(0,[],{},.4),beat(5,[],poses('drink','drink'),.7),beat(6,[],poses('seated','seated')),
  beat(15,[],poses('drink','drink'),.8),beat(19,[],poses('seated','seated')),
  beat(23,both(1100,875,1170,875),poses())
 ]);
 const care=set('TavernC',{map:'ch5GuestRooms',actors:{hero:[850,620],saint:[940,620],ch5Barkeep:[1110,590]},actorMeta:{...tavernMeta,saint:{sprite:0,pose:'seated',socialV20:true}},...seats([850,620],[940,620]),focus:[1040,525]},[
  beat(0,[],{},.6),beat(8,[move('hero',900,620,.65)]),
  beat(14,[],{hero:{pose:'carry'},saint:{pose:'carried'}},1),
  beat(15,[move('hero',1025,570,1.5)]),
  beat(16,[],{hero:{pose:'stand'},saint:{pose:'lying',x:1100,y:455,depthY:531,angle:Math.PI,autoFace:false,poseFlip:true}},1),
  beat(19,[move('hero',1000,555,.5)]),
  beat(23,[move('hero',835,660,1.2)]),
  {...beat(24,[],{hero:{x:865,y:620},saint:{pose:'stand',x:955,y:620,depthY:620,autoFace:true,poseFlip:false}},1.5),screenFadeV20:true},
  beat(25,[],{},.5),
  beat(26,both(865,700,1040,735),poses())
 ]);
 care.actorMeta.ch5Barkeep={sprite:12};

 set('BridgeA',{...actors([540,720],[600,725]),focus:[770,660]},[
  beat(0,[],{},.4),beat(3,both(600,720,585,725)),beat(9,both(700,710,650,725)),
  beat(16,[],{},.8),beat(19,both(760,710,825,725))
 ]);
 set('BridgeB',{...actors([760,710],[825,725]),focus:[790,685]},[
  beat(0,[],{},.6),beat(8,both(790,710,850,725)),beat(12,[],{},.6),beat(19,[],{},.8,{hero:[850,620],saint:[850,620]})
 ]);
 set('BridgeC',{...actors([790,710],[850,725]),focus:[850,695]},[
  beat(0,[],{},.5),beat(6,[move('hero',820,720,.6)],{},.3),
  beat(13,both(995,710,1030,760)),beat(16,[],{},.5,{hero:[770,720],saint:[770,720]}),beat(19,both(1060,740,1130,755))
 ]);

 set('MarketA',{...actors([1070,650],[1155,650]),focus:[1130,590]},[
  beat(0,[],{},.4),beat(3,[move('saint',1155,620,.6,0,{pose:'hold-ring'})],{},0,{hero:'saint',saint:[1170,524]}),
  beat(10,[],{saint:{pose:'stand'}},.9),beat(14,[],{saint:{pose:'hold-ring'}},.6),beat(18,[],{saint:{pose:'stand'}},.9)
 ]);
 set('MarketB',{...actors([1070,650],[1155,620]),focus:[1100,645]},[
  beat(0,[],poses(),.4),beat(4,[move('hero',1125,640,.6)],{},.9),
  beat(11,both(1020,735,1135,730)),beat(15,[],{saint:{pose:'hold-bread'}},.7),beat(19,both(1000,835,1090,835),poses())
 ]);
 set('MarketC',{...actors([1000,835],[1090,835]),focus:[1070,770]},[
  beat(0,[],{saint:{pose:'hold-bread'}},.6),beat(4,[],{},.6),beat(15,[],poses(),.5),beat(18,[move('saint',1070,835,.5)],{},.5),beat(19,both(1040,850,1130,855),poses())
 ]);

 const gardenSeats={...seats([505,520],[535.7317073170732,520]),benchV20:true};
 set('GardenA',{...actors([505,560],[590,570]),focus:[570,460]},[
  beat(0,[],{},.4),beat(3,both(505,515,585,520)),beat(6,both(540,430,605,435)),
  beat(11,[],{},.8),beat(16,[],{},.7),beat(19,both(505,520,590,520))
 ]);
 set('GardenB',{...actors([505,555],[590,555]),...gardenSeats,focus:[550,460]},[
  beat(0,[],{},.3),beat(4,both(505,520,535.7317073170732,520),poses('bench-wood','bench-wood')),
  beat(7,[],{},.6),beat(12,[],{},.9),beat(16,[],{},.7),beat(19,[],{},.6)
 ]);
 set('GardenC',{...actors([505,520],[535.7317073170732,520]),...poseStart('bench-wood','bench-wood'),...gardenSeats,focus:[550,465]},[
  beat(0,[],{},.8),beat(7,[],{},.5),beat(10,both(540,430,605,435),poses()),
  beat(14,[],{},.7),beat(17,both(510,575,600,575),poses()),beat(19,both(505,645,590,655))
 ]);

 const starSeats={...seats([1190,620],[1220.7317073170732,620]),benchV20:true};
 set('StarsA',{...actors([475,460],[565,470]),focus:[565,390]},[
  beat(0,[],{},.5),beat(3,[move('saint',570,420,.65)],{},0,{hero:'saint',saint:[620,325]}),beat(6,[move('hero',480,405,.6)],{},.7,{hero:'saint',saint:[620,325]}),
  beat(10,[],{},.3),beat(14,both(560,425,625,470),{},0,{hero:[620,325],saint:'hero'}),beat(17,both(490,460,570,425),{},0,{hero:'saint',saint:[620,325]}),beat(19,[],{},.7)
 ]);
 set('StarsB',{...actors([490,460],[570,425]),...starSeats,focus:[845,465]},[
  beat(0,[],{},.4),beat(8,[],{},.5),beat(15,[],{},.8),
  beat(18,both(1190,620,1220.7317073170732,620),poses('bench-stone','bench-stone'))
 ]);
 set('StarsC',{...actors([1190,620],[1220.7317073170732,620]),...poseStart('bench-stone','bench-stone'),...starSeats,focus:[1240,545]},[
  beat(0,[],{},.5),beat(7,[],{},.6),beat(11,[],{},.7,{hero:[950,240],saint:[950,240]}),beat(15,[],{},1),
  beat(18,both(1160,650,1280,655),poses()),beat(19,both(1130,790,1220,795))
 ]);

 const arcadeSeats=seats([1035,635],[1125,635]);
 set('ArcadeA',{...actors([710,555],[805,560]),focus:[805,485]},[
  beat(0,[],{},.4),beat(3,both(755,505,900,505)),beat(7,[],{},.8),beat(11,[],{},.6),beat(14,[],{},.8),beat(17,[],{},.8)
 ]);
 set('ArcadeB',{...actors([755,505],[900,505]),focus:[845,500]},[
  beat(0,[],{},.5),beat(4,[],{},.6),beat(8,[],{},1),beat(10,[],{},.7),
  beat(16,both(920,610,1010,620)),beat(19,both(1035,670,1125,670))
 ]);
 set('ArcadeC',{...actors([1035,670],[1125,670]),...arcadeSeats,focus:[1090,565]},[
  beat(0,[],{},.5),beat(4,[seated('hero',1035,635),seated('saint',1125,635)]),beat(9,[],{},.5),
  beat(13,both(1350,700,1415,700),poses(),.9,{hero:[1510,620],saint:[1510,620]}),beat(17,[],{},.8),beat(18,both(1020,700,1110,705),poses()),beat(19,both(970,720,1055,725))
 ]);
}
