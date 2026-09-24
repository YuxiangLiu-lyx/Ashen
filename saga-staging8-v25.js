// V25 chapter 8 candidate. Geometry uses the companion world candidate's actual
// raster furnishing anchors. Root's V25 prepareSocialStage performs routeTo.
import {DIALOGUES} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {CHAPTER8_DIALOGUES_V25} from './chapter8-text-v25.js';

const clone=v=>structuredClone(v);
const stand={pose:'stand',v25Pose:'stand',v25Held:null,autoFace:true};
const hmeta={...stand,renderAs:'hero',socialV20:true,hideWeapon:true};
const smeta={...stand,sprite:0,socialV20:true,hideWeapon:true,disguiseV25:false};
const cmeta={...stand,sprite:1,socialV20:false,v25Identity:'chengli',hideWeapon:true};
const enemy=(type)=>({...stand,renderAs:'enemy',type,anim:0,hideWeapon:false,size:90});
const move=(id,x,y,duration=.8,delay=0,arrival)=>[id,x,y,duration,delay,...(arrival?[arrival]:[])];
const beat=(line,moves=[],hold=.3,actorMeta={},faceTargets={})=>({line,moves,hold,actorMeta,faceTargets});
const face3={hero:'chengli',saint:'chengli',chengli:'hero'};
const base=(map,actors,extra={})=>({map,actors,actorMeta:Object.fromEntries(Object.keys(actors).map(id=>[id,clone(id==='hero'?hmeta:id==='saint'?smeta:id==='chengli'?cmeta:id==='v25Weser'?enemy('v25PursuitKnight'):enemy('v25FinalJudge'))])),socialV20:true,commitActor:'hero',initiallyHidden:[],focus:[815,625],faceTargets:clone(face3),beats:[],...extra});
const clearMoving=(ids)=>Object.fromEntries(ids.map(id=>[id,clone(stand)]));
const ma=(line,moves,hold=.3,meta={},faces={})=>beat(line,moves,hold,{...clearMoving([...new Set(moves.map(m=>m[0]))]),...meta},faces);
const pair=(hx,hy,sx,sy,duration=1.1)=>[move('hero',hx,hy,duration),move('saint',sx,sy,duration+.1)];
const spirit={...cmeta,v25Spirit:true,v25Pose:'spirit',v25SpiritAlpha:.72};

export const CHAPTER8_STAGING_V25={
 v25C8Pursuit:{...base('ch8FlightRavine',{hero:[690,730],saint:[595,755],v25Weser:[1145,580]}),beats:[
  beat(0,[],.45,{saint:{disguiseV25:true},hero:{hideWeapon:false}},{hero:'v25Weser',saint:'hero',v25Weser:'hero'}),
  ma(3,[move('saint',585,695,.75),move('v25Weser',905,610,1.5)],.35,{}, {hero:'v25Weser',saint:'v25Weser',v25Weser:'hero'}),
  ma(7,[move('hero',760,700,.55)],.4,{}, {hero:'v25Weser'}),beat(11,[],.7,{v25Weser:{attackUntil:1.2}}, {hero:'v25Weser',v25Weser:'hero'})
 ]},
 v25C8Defeat:{...base('ch8FlightRavine',{hero:[760,700],saint:[585,695],v25Weser:[905,610]}),beats:[
  ma(0,[move('hero',660,725,.55)],.8,{saint:{disguiseV25:true},hero:{hideWeapon:false}},{hero:'v25Weser',saint:'hero',v25Weser:'hero'}),
  ma(7,[move('hero',635,695,.55)],.45,{}, {hero:'saint',saint:'hero'}),
  ma(9,[move('hero',980,620,2.2),move('saint',1045,650,2.35),move('v25Weser',850,640,1.9)],.3,{}, {hero:[1400,420],saint:[1400,420],v25Weser:'hero'}),
  ma(12,[move('hero',1315,435,2.2),move('saint',1370,475,2.3),move('v25Weser',1080,580,1.8)],.35,{}, {hero:[1430,410],saint:[1430,410]})
 ]},
 v25C8Sanctuary:{...base('ch8HiddenGate',{hero:[700,680],saint:[645,730],chengli:[920,620],v25Weser:[460,750]}),beats:[
  ma(0,pair(865,680,905,735,1.2),.4,{saint:{disguiseV25:true}}, {hero:'chengli',saint:'chengli',chengli:'v25Weser',v25Weser:'hero'}),
  ma(4,[move('v25Weser',690,670,1.2)],.7,{}, {chengli:'v25Weser',v25Weser:'chengli'}),
  ma(7,[move('v25Weser',320,760,1.25,0,{visible:false})],.5,{}, {chengli:'hero',hero:'chengli'}),
  ma(8,[move('saint',1200,690,1.4,0,{disguiseV25:false}),move('chengli',875,635,.7)],.5,{}, {hero:'chengli',chengli:'hero',saint:[1180,610]}),
  ma(14,[move('hero',930,685,.8,0,{pose:'seated',v25Pose:'stand',autoFace:false,angle:0}),move('saint',980,722,1.2),move('chengli',895,690,.7,0,{v25Pose:'bandage'})],.6,{}, {saint:'hero',chengli:'hero'}),
  beat(23,[],.45,{chengli:clone(stand)},{saint:'hero',chengli:'hero'})
 ]},
 v25C8Lodging:{...base('ch8GuestHouse',{hero:[820,675],saint:[935,625],chengli:[1160,590]}),beats:[
  ma(0,[move('chengli',1145,430,1.2)],.45,{}, {chengli:[1090,330],hero:'saint',saint:'chengli'}),
  ma(4,[move('saint',1080,575,.8)],.6,{}, {saint:[1080,490],chengli:'saint'}),
  ma(12,[move('chengli',1155,575,.9)],.5,{}, {chengli:'hero',hero:'chengli'}),
  ma(16,[move('saint',1060,575,.4),move('chengli',1170,555,.6)],.65,{}, {saint:[1080,520],chengli:[1080,520]}),
  ma(20,[move('saint',1080,520,.75,0,{pose:'sleep-bed',v25Pose:'sleep',v25Bed:{x:1080,y:520,width:160},bedWorldV20:{x:1080,y:520,width:160},autoFace:false,angle:0}),move('hero',800,320,1.8,.95),move('chengli',895,335,1.8,1.05)],1.8,{}, {hero:[800,180],chengli:'hero'})
 ]},
 v25C8Dawn:{...base('ch8DawnTerrace',{hero:[685,735],chengli:[895,615]}),beats:[
  ma(0,[move('hero',775,665,1)],.5,{}, {hero:'chengli',chengli:'hero'}),
  beat(5,[],.6,{hero:{v25Pose:'practice',v25Held:'practiceSword'},chengli:{v25Pose:'practice',v25Held:'practiceSword'}},{hero:'chengli',chengli:'hero'}),
  ma(9,[move('hero',790,635,.7,0,{v25Pose:'practice',v25Held:'practiceSword'}),move('chengli',875,625,.4,0,{v25Pose:'practice',v25Held:'practiceSword'})],.7),
  beat(12,[],.65,{hero:{v25Pose:'practice'},chengli:{v25Pose:'practice'}},{hero:[865,630],chengli:'hero'}),
  ma(16,[move('hero',760,700,.6,0),move('hero',870,700,.7,.7),move('hero',760,700,.7,1.5),move('hero',820,665,.6,2.3,{v25Pose:'practice',v25Held:'practiceSword'})],3.1,{}, {chengli:'hero'}),
  ma(22,[move('hero',1035,480,1.5),move('chengli',945,495,1.4)],.6,{}, {hero:[1130,460],chengli:'hero'})
 ]},
 v25C8StoneAfter:{...base('ch8StoneTrial',{hero:[755,565],saint:[835,625],chengli:[595,330]}),initiallyHidden:['chengli'],beats:[
  beat(0,[],.5,{}, {hero:[1210,390],saint:'hero'}),
  ma(3,[move('hero',360,400,2.6),move('saint',405,365,2.6)],.5,{}, {hero:[405,405],saint:[405,405]}),
  beat(6,[],1,{}, {hero:[405,405],saint:[405,405]}),
  ma(7,[move('chengli',550,360,.9)],.45,{}, {chengli:'hero'}),
  ma(9,[move('chengli',470,365,.65)],.5,{}, {chengli:[405,405],hero:'chengli',saint:'chengli'}),
  ma(15,[move('hero',560,535,1.3),move('saint',485,565,1.25),move('chengli',635,510,1.2)],.3,{},face3)
 ]},
 v25C8MirrorAfter:{...base('ch8MirrorTrial',{hero:[955,675],chengli:[1060,610]}),beats:[
  beat(0,[],.45,{}, {hero:'chengli',chengli:'hero'}),
  ma(4,[move('chengli',1190,495,1),move('hero',1095,510,1.05)],.65,{}, {chengli:[1190,435],hero:'chengli'}),
  ma(13,[move('hero',1230,650,1.2,0,{v25Pose:'token',v25Held:'trainingDagger'}),move('chengli',1310,700,1.1)],.6,{}, {hero:'chengli',chengli:'hero'}),
  beat(19,[],.65,{hero:clone(stand)}, {hero:'chengli',chengli:[1325,600]})
 ]},
 v25C8TrialRescue:{...base('ch8StormTrial',{hero:[950,650],chengli:[1290,590]}),initiallyHidden:['chengli'],beats:[
  ma(0,[move('hero',1020,665,.7)],.4,{}, {hero:[1400,650]}),
  ma(4,[move('hero',1055,710,.55,0,{v25Pose:'kneel'})],.7),
  ma(5,[move('chengli',1120,670,.8,0,{v25Pose:'protect'})],.8,{}, {chengli:[1300,510]}),
  beat(7,[],.8,{hero:{v25Pose:'kneel'},chengli:{v25Pose:'protect'}},{hero:'chengli',chengli:[1300,510]}),
  ma(12,[move('hero',960,755,1.05),move('chengli',1035,735,1.05)],.5,{}, {hero:'chengli',chengli:'hero'}),
  beat(16,[],.6,{}, {chengli:[995,800],hero:'chengli'}),
  ma(22,[move('hero',705,760,2),move('chengli',780,755,2)],.4,{}, {hero:[170,650],chengli:[170,650]})
 ]},
 v25C8Recovery:{...base('ch8FlowerCourt',{hero:[775,715],saint:[825,625],chengli:[615,640]}),beats:[
  ma(0,[move('hero',775,650,.65,0,{pose:'seated',v25Pose:'stand',autoFace:false,angle:Math.PI}),move('saint',710,735,.9),move('chengli',620,640,.3)],.5,{}, {hero:'saint',saint:'chengli',chengli:'saint'}),
  beat(4,[],.5,{}, {saint:[700,600],chengli:'saint'}),
  ma(7,[move('saint',625,695,.7)],.6,{}, {saint:'chengli',chengli:'saint'}),
  ma(11,[move('saint',825,675,1)],.6,{}, {saint:'hero',hero:'saint',chengli:'hero'}),
  ma(22,[move('chengli',675,715,.8)],.55,{}, {chengli:'hero',hero:'chengli'})
 ]},
 v25C8Table:{...base('ch8GuestHouse',{hero:[550,650],saint:[715,650],chengli:[630,690]}),beats:[
  beat(0,[],.6,{hero:{pose:'seated',autoFace:false,angle:0},saint:{pose:'seated',autoFace:false,angle:Math.PI}}, {chengli:[630,605]}),
  beat(5,[],.7,{}, {hero:'chengli',saint:'chengli',chengli:[630,605]}),
  beat(9,[],.5,{}, {chengli:[1090,330]}),
  beat(18,[],.5,{}, {chengli:'saint'}),beat(23,[],.65,{}, {hero:'chengli',saint:'chengli',chengli:'hero'})
 ]},
 v25C8Warning:{...base('ch8FlowerCourt',{hero:[760,675],saint:[845,700],chengli:[905,585],v25Weser:[1290,365],v25Heron:[1155,365]}),initiallyHidden:['v25Weser','v25Heron'],beats:[
  beat(0,[],.55,{}, {hero:'chengli',saint:'chengli'}),
  ma(2,[move('chengli',1190,770,1.7)],.7,{}, {chengli:[1220,700],hero:'chengli',saint:'chengli'}),
  beat(6,[],.8,{v25Weser:{visible:true},v25Heron:{visible:true}}, {chengli:'v25Heron',v25Weser:'chengli',v25Heron:'chengli',hero:'v25Heron',saint:'v25Heron'}),
  beat(12,[],.4,{}, {saint:'v25Heron',hero:'saint'}),
  beat(15,[],.65,{v25Heron:{attackUntil:1.1}}, {hero:[1220,700],saint:[1220,700],chengli:'v25Heron'}),
  ma(21,[move('chengli',985,770,1.3),move('chengli',985,450,1.9,1.5),move('chengli',1110,450,.8,3.6),move('hero',820,765,.85),move('saint',895,795,.85)],.4,{}, {chengli:'v25Heron',hero:[1220,700],saint:[1220,700]})
 ]},
 v25C8Hold:{...base('ch8LastSanctum',{hero:[780,685],saint:[1045,485],chengli:[1010,635],v25Heron:[1170,610]}),beats:[
  beat(0,[],.5,{}, {saint:[1160,400],hero:'chengli',chengli:'v25Heron',v25Heron:'chengli'}),
  ma(2,[move('chengli',930,650,.6),move('v25Heron',1080,610,.7)],.7,{chengli:{v25Pose:'protect'}},{hero:'chengli',chengli:'v25Heron',v25Heron:'chengli'}),
  ma(5,[move('chengli',890,675,.5,0,{v25Pose:'protect'})],.7),
  ma(6,[move('hero',835,685,.45),move('chengli',880,685,.35),move('saint',940,735,1)],.65,{}, {hero:'chengli',saint:'v25Heron',chengli:'hero'}),
  beat(10,[],.55,{}, {saint:'chengli',hero:'chengli'}),
  beat(13,[],.6,{hero:{v25Pose:'token',v25Held:'trainingDagger'}},{hero:'chengli',chengli:'hero'}),
  beat(19,[],.6,{chengli:{v25Pose:'binding'},saint:{v25Pose:'stand'}},{chengli:'hero',saint:'v25Heron'})
 ]},
 v25C8Bind:{...base('ch8LastSanctum',{hero:[835,685],saint:[940,735],chengli:[880,685],v25Heron:[1080,610]}),beats:[
  beat(0,[],.6,{hero:{v25Pose:'token',v25Held:'trainingDagger'},chengli:{v25Pose:'binding'}},{hero:'chengli',chengli:'hero',saint:'v25Heron',v25Heron:'hero'}),
  beat(5,[],.55,{}, {hero:'chengli',chengli:'hero'}),
  beat(10,[],.8,{}, {chengli:'hero',hero:'chengli'}),
  beat(15,[],1.1,{chengli:{v25Spirit:true,v25SpiritAlpha:.45,v25Pose:'spirit'}}),
  beat(16,[],.7,{hero:{v25Pose:'kneel',v25Held:null}}),
  beat(18,[],.7,{chengli:{visible:false,v25Spirit:true},hero:{...stand,hideWeapon:false}}),
  beat(19,[],.5,{hero:{...stand,hideWeapon:false}},{hero:'v25Heron'}),
  ma(22,[move('saint',700,735,.85)],.5,{}, {hero:'v25Heron',saint:'v25Heron'})
 ]},
 v25C8After:{...base('ch8LastSanctum',{hero:[835,685],saint:[930,700],chengli:[885,720]}),initiallyHidden:['chengli'],beats:[
  beat(0,[],.5,{hero:{hideWeapon:false}}, {hero:[1080,610],saint:'hero'}),
  beat(6,[],.95,{chengli:{...spirit,visible:true}}, {chengli:'hero',hero:'chengli',saint:'chengli'}),
  ma(10,[move('hero',765,735,1,0,{pose:'seated',v25Pose:'seatedToken',v25Held:'trainingDagger',v25SeatAnchor:true,depthY:786,autoFace:false,angle:0}),move('saint',960,825,.9)],.75,{}, {saint:'chengli'}),
  ma(13,[move('chengli',855,735,.45,0,{...spirit,pose:'seated',v25Pose:'spiritSeated',v25SeatAnchor:true,depthY:786,autoFace:false,angle:Math.PI})],.65),
  beat(14,[],.55,{}, {hero:[815,780],chengli:[815,780],saint:'chengli'}),
  beat(22,[],.7,{}, {hero:[1080,350],chengli:[1080,350],saint:[1080,350]})
 ]},
 v25C8Farewell:{...base('ch8FlowerCourt',{hero:[760,675],saint:[845,700],chengli:[865,630]}),beats:[
  beat(0,[],.55,{chengli:clone(spirit)}, {hero:'saint',saint:[700,600],chengli:'saint'}),
  ma(5,[move('hero',945,420,1.6),move('saint',1145,435,1.7),move('hero',770,680,1.6,1.85),move('saint',855,695,1.75,1.85)],3.8,{}, {chengli:[1150,520]}),
  beat(9,[],.65,{hero:{v25Pose:'token',v25Held:'trainingDagger'}},{hero:'chengli',chengli:'hero'}),
  ma(18,[move('hero',1090,660,2),move('saint',1180,700,2.05),move('chengli',1120,610,2,0,clone(spirit))],.45,{}, {hero:[1430,650],saint:[1430,650],chengli:'hero'})
 ]}
};

// Optional spirit topics need the actual current safe map; callers may register
// this returned stage immediately before showScene. Never relocate to the old
// courtyard merely because the player asked to speak with the spirit.
export function makeChapter8SpiritStageV25(id,map,hero,saint){
 if(!/^v25C8Spirit(?:Cup|Practice|Boundary|Companions)$/.test(id))return null;
 const s=base(map,{hero:[...hero],chengli:[hero[0]+76,hero[1]-24],...(saint?{saint:[...saint]}:{})});
 s.dynamicSafeMapV25=true;s.actorMeta.chengli=clone(spirit);
 s.beats=[beat(0,[],.5,{}, {hero:'chengli',chengli:'hero'}),beat(4,[],.3,{}, {chengli:'hero'}),beat(11,[],.4,id==='v25C8SpiritBoundary'?{chengli:{visible:false}}:{})];
 if(id==='v25C8SpiritPractice')s.beats[0].actorMeta.hero={v25Pose:'practice',v25Held:'practiceSword'};
 if(id==='v25C8SpiritPractice')s.beats[2].actorMeta.hero=clone(stand);
 s.speaker_actor_per_line=CHAPTER8_DIALOGUES_V25[id].map(([name])=>({'诺恩':'hero','艾莉娅':'saint','澄璃':'chengli'}[name]||null));
 return s;
}

export function installChapter8StagingV25(){
 Object.assign(DIALOGUES,clone(CHAPTER8_DIALOGUES_V25));
 for(const id of Object.keys(CHAPTER8_DIALOGUES_V25).filter(id=>id.startsWith('v25C8Spirit'))){STAGING.scenes[id]=CHAPTER_STAGING[id]={map:'ch8LastSanctum',actors:{hero:[760,675]},actorMeta:{hero:{renderAs:'hero'}},beats:[]};CINEMATIC_SCENES.add(id);}
 for(const[id,source]of Object.entries(CHAPTER8_STAGING_V25)){
  const s=clone(source);
  s.speaker_actor_per_line=CHAPTER8_DIALOGUES_V25[id].map(([name])=>({'诺恩':'hero','艾莉娅':'saint','澄璃':'chengli','维瑟':'v25Weser','赫洛恩':'v25Heron'}[name]||null));
  STAGING.scenes[id]=CHAPTER_STAGING[id]=s;CINEMATIC_SCENES.add(id);
 }
}
