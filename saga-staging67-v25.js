// V25 candidate: physical staging for all chapter 6/7 scenes.
// Every movement is expanded by production prepareSocialStageV20/routeTo.
import {DIALOGUES} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {CHAPTER67_DIALOGUES_V25} from './chapter67-text-v25.js';

const clone=x=>structuredClone(x);
const stand={pose:'stand',v25Pose:'stand',autoFace:true};
const human=(sprite=3,name='')=>({...stand,sprite,name,socialV20:false,hideWeapon:true});
const cast={musician:human(4,'乐师'),guard:human(8,'哨兵'),officer:human(8,'执旗官'),aju:human(7,'阿绢'),oldDu:human(8,'老杜'),taxOfficer:human(3,'税吏'),atang:human(11,'阿棠'),conscriptionOfficer:human(8,'征选使'),guard1:human(8,'护卫'),guard2:human(8,'护卫'),worker:human(6,'伤工'),girl1:human(11,'获救姑娘'),girl2:human(7,'获救姑娘'),girl3:human(11,'获救姑娘'),boatman:human(7,'渡船老人'),peddler:human(6,'货郎'),asin:human(4,'阿辛'),broker:human(8,'维伦'),scribe1:human(3,'账房'),scribe2:human(6,'账房'),apprentice:human(4,'药舍学徒'),tao:human(8,'陶叔'),porter1:human(6,'搬夫'),porter2:human(8,'搬夫'),steward:human(3,'管事'),child:human(4,'孩子'),odric:human(8,'奥德里克'),driver:human(6,'车夫'),martha:human(7,'玛尔塔夫人'),patient:human(6,'伤者'),severin:human(8,'塞维尔'),clerk:human(3,'书记员'),checkpointOfficer:human(8,'关卡军官')};
Object.assign(cast,{oldDu:human(2,'老杜'),worker:human(4,'伤工'),boatman:human(2,'渡船老人'),peddler:human(4,'货郎'),scribe2:human(3,'账房'),tao:human(2,'陶叔'),porter1:human(4,'搬夫'),porter2:human(2,'搬夫'),driver:human(4,'车夫'),martha:human(11,'玛尔塔夫人'),patient:human(4,'伤者'),severin:human(10,'塞维尔')});
Object.assign(cast,{atang:human(6,'阿棠'),girl1:human(6,'获救姑娘'),girl2:human(5,'获救姑娘'),girl3:human(11,'获救姑娘')});
cast.asin.size=67;cast.apprentice.size=70;cast.child.size=58;
const mm=(id,x,y,duration=.8,delay=0,arrival)=>[id,x,y,duration,delay,...(arrival?[arrival]:[])];
const b=(line,moves=[],hold=.3,meta={},faces={})=>({line,moves,hold,actorMeta:meta,faceTargets:faces});
const walk=(line,moves,hold=.3,meta={},faces={})=>b(line,moves,hold,{...Object.fromEntries([...new Set(moves.map(m=>m[0]))].filter(k=>!k.startsWith('p_')).map(k=>[k,clone(stand)])),...meta},faces);
const duo=(hx,hy,sx,sy,seconds=1)=>[mm('hero',hx,hy,seconds),mm('saint',sx,sy,seconds)];
const pairFaces={hero:'saint',saint:'hero'};
const base=(map,actors,extra={})=>({map,actors,actorMeta:Object.fromEntries(Object.keys(actors).map(id=>[id,id==='hero'?{...stand,renderAs:'hero',socialV20:true,hideWeapon:true,v25Cloak:false}:id==='saint'?{...stand,sprite:0,socialV20:true,hideWeapon:true,disguiseV25:map.startsWith('ch7')||['ch6VillageLane','ch6VillageSquare','ch6TaxWarehouse','ch6ConvoyRoad','ch6Riverside'].includes(map)}:clone(cast[id]||human())])),socialV20:true,commitActor:'hero',initiallyHidden:[],focus:[actors.hero?.[0]||800,(actors.hero?.[1]||650)-45],faceTargets:actors.saint?clone(pairFaces):{},beats:[],noCG:true,...extra});
function prop(s,id,sheet,index,x,y,w,h,visible=true){s.actors[id]=[x,y];s.actorMeta[id]={renderAs:'prop',pose:'lying',autoFace:false,visible,v25Raster:{sheet,index,w,h}};return s;}
function seat(s,x,y,flip=false){s.seatsV20=[...(s.seatsV20||[]),{id:'v25-seat-'+s.map+'-'+x+'-'+y,actor:'hero',x,y,flip}];return s;}
const sit={pose:'seated',v25Pose:'stand',autoFace:false,angle:0};

export const CHAPTER67_STAGING_V25={
 c6v25Musician:{...base('ch6Outpost',{hero:[555,675],saint:[625,725],musician:[435,690]}),beats:[
  b(0,[],.5,{saint:{disguiseV25:false}},{hero:'musician',saint:'musician',musician:'hero'}),
  walk(8,[mm('musician',485,675,.6)],.55,{}, {musician:'hero'}),
  walk(16,[mm('hero',560,690,.5),mm('musician',450,690,.6)],.5),
  walk(17,[mm('saint',588,710,.8)],.65,{},pairFaces),
  b(22,[],.75,{hero:{v25Cloak:true},saint:{disguiseV25:false}},{hero:[1100,620],saint:[1100,620]})
 ]},
 c6v25Checkpoint:{...base('ch6Outpost',{hero:[780,715],saint:[807,734],guard:[1030,600],officer:[1140,590]}),beats:[
  b(0,[],.65,{hero:{v25Cloak:true},saint:{disguiseV25:false}},{hero:'guard',saint:'guard',guard:'officer',officer:'guard'}),
  walk(4,[mm('guard',1110,650,.75)],.35,{}, {guard:'officer'}),
  walk(9,duo(790,705,817,724,.45),.6,{},pairFaces),
  walk(15,duo(858,685,885,704,.7),.65,{}, {hero:'guard',saint:'guard'}),
  walk(19,[mm('guard',1205,630,1.1)],.5),
  walk(20,duo(990,650,1017,669,1),.45,{}, {hero:[1290,590],saint:[1290,590]}),
  walk(22,duo(1240,610,1267,629,1.8),.5)
 ]},
 c6v25Gather:{...base('ch6ReedWild',{hero:[650,760],saint:[745,775]}),beats:[
  b(0,[],.7,{hero:{v25Cloak:false},saint:{disguiseV25:false}},pairFaces),
  walk(5,[mm('saint',720,750,.6)],.55),
  walk(13,duo(765,780,830,750,1.0),.4,{}, {hero:[1240,600],saint:'hero'}),
  b(14,[],.55,{}, {hero:[980,620],saint:[980,620]}),
  walk(18,duo(850,725,890,785,.8),.3)
 ]},
 c6v25Disguise:{...base('ch6VillageLane',{hero:[530,505],saint:[635,475]}),beats:[
  b(0,[],.6,{saint:{disguiseV25:false},hero:{autoFace:false,angle:Math.PI}},{saint:[670,400]}),
  walk(2,[mm('hero',570,480,.6)],.45,{}, {hero:[630,445]}),
  b(4,[],.6,{hero:{autoFace:true}},{hero:'saint',saint:'hero'}),
  { ...b(9,[],1.25,{saint:{disguiseV25:true}},{hero:[480,600],saint:[670,400]}),screenFadeV20:true},
  b(14,[],.7,{}, {saint:[670,400],hero:'saint'}),
  walk(21,duo(630,560,710,560,.95),.45,{},pairFaces)
 ]},
 c6v25Village:{...base('ch6VillageLane',{hero:[680,680],saint:[755,640],aju:[830,615],oldDu:[1000,645],taxOfficer:[1280,655]}),initiallyHidden:['taxOfficer'],beats:[
  walk(0,[mm('saint',795,590,.6),mm('aju',850,565,.55)],.4,{}, {saint:'aju',aju:'saint'}),
  walk(6,[mm('oldDu',925,620,.75),mm('aju',895,600,.6)],.5,{}, {aju:'oldDu',saint:'oldDu'}),
  walk(13,[mm('taxOfficer',1110,615,1.2)],.5,{}, {hero:'taxOfficer',saint:'taxOfficer',aju:'taxOfficer',oldDu:'taxOfficer'}),
  walk(19,[mm('aju',790,595,.75),mm('saint',740,615,.7)],.6,{}, {saint:'aju'}),
  walk(20,[mm('hero',1010,695,1.5)],.4,{}, {hero:[1430,650],saint:'hero'})
 ]},
 c6v25Tax:{...base('ch6VillageSquare',{hero:[980,555],saint:[1070,540],aju:[1015,505],oldDu:[845,610],taxOfficer:[1120,475]}),beats:[
  b(0,[],.5,{}, {hero:'taxOfficer',saint:'taxOfficer',aju:'taxOfficer',taxOfficer:'aju'}),
  walk(9,[mm('hero',970,570,.5),mm('aju',890,620,.9),mm('saint',955,650,.9)],.6,{}, {hero:'aju',saint:'aju',aju:'saint'}),
  walk(18,[mm('oldDu',865,645,.6),mm('hero',920,665,.7)],.6,{}, {oldDu:'hero',hero:'oldDu',saint:'oldDu'}),
  walk(21,[mm('hero',865,760,.9),mm('saint',965,755,.9)],.4,{}, {hero:[800,180],saint:'hero'})
 ]},
 c6v25Conscription:{...base('ch6VillageSquare',{hero:[800,650],saint:[895,650],aju:[800,580],atang:[1025,680],worker:[950,570],conscriptionOfficer:[1220,630],guard1:[1310,710],guard2:[1250,780]}),initiallyHidden:['conscriptionOfficer','guard1','guard2'],beats:[
  b(0,[],.65,{}, {hero:[835,610],saint:[835,610],aju:'saint',worker:'saint'}),
  walk(5,[mm('conscriptionOfficer',1120,675,1.1),mm('guard1',1200,730,1.1),mm('guard2',1210,815,1.1)],.6,{}, {hero:'conscriptionOfficer',saint:'conscriptionOfficer',conscriptionOfficer:'atang'}),
  walk(11,[mm('saint',1000,685,.75),mm('conscriptionOfficer',1080,690,.5),mm('hero',1030,740,.9)],.65,{}, {hero:'conscriptionOfficer',conscriptionOfficer:'hero',saint:'atang'}),
  walk(16,[mm('conscriptionOfficer',1290,610,1.25),mm('guard1',1340,660,1.15),mm('guard2',1340,760,1.1)],.4),
  walk(19,[mm('atang',870,765,1.2),mm('aju',790,765,1.1),mm('saint',955,750,.6)],.4,{}, {saint:'atang',hero:'saint'}),
  walk(21,[mm('atang',710,825,1.2),mm('aju',625,795,1.25)],.4)
 ]},
 c6v25Rescue:{...base('ch6ConvoyRoad',{hero:[970,675],saint:[1200,790],girl1:[1235,775],girl2:[1300,785],girl3:[1325,855]}),beats:[
  walk(0,[mm('girl1',1170,825,.85),mm('saint',1125,815,.9)],.6,{}, {saint:'girl1',girl1:'saint'}),
  walk(5,[mm('girl1',970,825,1.45),mm('girl2',1040,865,1.5),mm('hero',1040,780,.9)],.65,{}, {hero:[1130,740],saint:'girl3'}),
  walk(12,[mm('saint',1250,840,.8),mm('girl3',1300,850,.4),mm('hero',1260,860,1.6,0,{v25Pose:'kneel'})],.8,{}, {saint:'girl3',girl3:'saint',hero:'girl3'}),
  walk(15,[mm('hero',1100,815,.6)],.55,{}, {hero:'girl1'}),
  walk(20,[mm('saint',1115,860,1.15),mm('girl3',1180,845,1.15),mm('hero',1020,865,.8)],.6,{},pairFaces)
 ]},
 c6v25Departure:{...base('ch6Riverside',{hero:[610,735],saint:[690,765],aju:[535,705],oldDu:[440,645],atang:[635,830],girl1:[685,875],girl2:[585,875],boatman:[1020,810],peddler:[1100,720]}),beats:[
  b(0,[],.6,{}, {saint:'atang',hero:'aju',aju:'saint',atang:'girl1'}),
  walk(7,[mm('oldDu',520,690,.8)],.6,{}, {oldDu:'hero',hero:'oldDu'}),
  walk(13,[mm('peddler',935,830,1.15),mm('atang',850,865,1.2)],.55,{}, {peddler:'atang',atang:'peddler'}),
  walk(17,[mm('girl1',1035,875,2.1),mm('girl2',1090,895,2.25),mm('aju',1000,840,2),mm('atang',1125,880,1.7),mm('boatman',1190,810,1.4)],.7,{}, {saint:[1360,860],hero:[1360,860]}),
  walk(18,[mm('girl1',1200,810,1.3),mm('girl1',1400,810,1.3,1.4,{visible:false}),mm('girl2',1190,805,1.3,.15),mm('girl2',1415,815,1.4,1.65,{visible:false}),mm('aju',1365,805,2.25,.3,{visible:false}),mm('atang',1375,795,2.1,.45,{visible:false}),mm('boatman',1400,780,1.7,.3,{visible:false})],.65),
  walk(19,duo(1120,760,1200,715,2.8),.5),
  walk(20,[mm('hero',1400,760,1.7,0,{visible:false}),mm('saint',1410,805,1.7,0,{visible:false}),mm('peddler',1060,745,.7,2),mm('peddler',1200,290,3,2.8)],.7,{}, {peddler:[1200,180]})
 ]},
 c6v25NightTalk:{...base('ch6Riverside',{hero:[605,605],saint:[695,620]}),beats:[
  b(0,[],.7,{}, {saint:[700,590],hero:'saint'}),
  walk(3,[mm('hero',595,675,.8,0,sit)],.7,{}, {hero:'saint'}),
  walk(13,[mm('saint',680,665,.5)],.7,{},pairFaces),
  walk(20,[mm('saint',650,705,.7)],.65,{}, {saint:[650,650],hero:'saint'})
 ]},
 c7v25Confide:{...base('ch7Camp',{hero:[780,630],saint:[995,590]}),beats:[
  walk(0,[mm('hero',800,590,.5,0,sit)],.65,{}, {hero:'saint',saint:'hero'}),
  walk(9,[mm('saint',1030,580,.5)],.7,{},pairFaces),
  b(18,[],1.0,{}, {hero:[805,340],saint:'hero'})
 ]},
 c7v25ContractOne:{...base('ch7BrokerLane',{hero:[590,665],asin:[710,585],broker:[1070,520],scribe1:[1120,420],scribe2:[1300,520]}),initiallyHidden:['broker','scribe1','scribe2'],beats:[
  b(0,[],.65,{}, {hero:'asin',asin:'hero'}),
  walk(4,[mm('hero',650,640,.6)],.55,{}, {hero:[680,595]}),
  walk(10,[mm('asin',785,600,.7)],.65,{}, {asin:[1130,500],hero:'asin'}),
  walk(14,[mm('asin',480,760,2.1,0,{visible:false}),mm('hero',950,600,2),mm('broker',1080,535,.2),mm('scribe1',1130,500,.2),mm('scribe2',1220,550,.2)],.7,{}, {hero:'broker',broker:'hero'}),
  walk(20,[mm('broker',1230,595,1)],.55,{}, {broker:'hero',hero:'broker'})
 ]},
 c7v25FirstEscape:{...base('ch7BrokerVault',{hero:[1050,535],scribe1:[1160,520],scribe2:[1250,605],asin:[570,635],apprentice:[1160,645]}),initiallyHidden:['asin'],beats:[
  walk(0,[mm('hero',1080,570,.4),mm('scribe1',980,600,1.2),mm('scribe2',1040,645,1.2)],.65,{}, {hero:'scribe1',scribe1:'hero'}),
  walk(5,[mm('asin',745,635,1.15)],.55,{}, {hero:'asin',asin:'hero'}),
  walk(11,[mm('asin',1030,700,1.5),mm('apprentice',1100,725,.7),mm('hero',1120,500,1)],.65,{}, {asin:'apprentice',hero:[1180,390]}),
  walk(15,[mm('scribe1',370,650,2.8,0,{visible:false}),mm('scribe2',450,680,2.8,.2,{visible:false}),mm('apprentice',500,635,2.9,.4,{visible:false}),mm('asin',605,645,2.4,.65),mm('hero',715,690,2.2,.85)],.8,{}, {hero:'asin',asin:[170,650]}),
  b(16,[],.6,{}, {hero:[170,650]})
 ]},
 c7v25ContractTwo:{...base('ch7GrainWharf',{hero:[775,695],tao:[690,575],porter1:[805,565],porter2:[850,655],steward:[1075,640]}),beats:[
  b(0,[],.6,{}, {hero:'tao',tao:'hero'}),
  walk(6,[mm('steward',915,625,.9),mm('porter1',860,620,.6),mm('tao',810,655,.9)],.65,{}, {steward:'porter1',hero:'steward'}),
  walk(10,[mm('steward',1280,655,2),mm('hero',880,675,.75)],.55,{}, {hero:'tao',tao:'hero'}),
  walk(17,[mm('hero',1325,715,2.7)],.55,{}, {hero:[1430,650],tao:'hero'})
 ]},
 c7v25Granary:{...base('ch7GrainHold',{hero:[1000,650],tao:[1120,655],porter1:[1145,745],porter2:[1230,810],child:[1230,705]}),beats:[
  walk(0,[mm('tao',1170,720,.55)],.55,{}, {tao:'child',hero:'tao'}),
  walk(3,[mm('child',1320,665,1),mm('tao',1240,645,1),mm('porter1',1360,750,1.3),mm('porter2',1400,810,1.15)],.7,{}, {hero:[1430,650]}),
  walk(9,[mm('tao',1100,630,1),mm('hero',1040,600,.6)],.6,{}, {tao:'hero',hero:'tao'}),
  walk(13,[mm('hero',1370,655,2.1),mm('tao',1210,590,1.2),mm('child',1410,680,.9,0,{visible:false}),mm('porter1',1430,745,.5,0,{visible:false}),mm('porter2',1430,810,.5,0,{visible:false})],.6,{}, {hero:[1430,650],tao:'hero'}),
  b(14,[],.5)
 ]},
 c7v25Odric:{...base('ch7OdricPass',{hero:[765,690],odric:[960,535],driver:[855,610],guard1:[1020,610],guard2:[1140,690]}),beats:[
  b(0,[],.7,{hero:{v25Pose:'kneel'}},{hero:'driver',driver:'hero',odric:'hero'}),
  walk(4,[mm('odric',825,690,1.1),mm('guard1',875,755,1),mm('guard2',900,655,1.1),mm('hero',700,700,.6)],.8,{}, {odric:'hero',hero:'odric'}),
  walk(8,[mm('hero',805,590,1),mm('driver',890,580,.45)],.6,{}, {hero:'driver'}),
  walk(12,[mm('guard1',965,570,1.3),mm('driver',945,490,1.3),mm('guard2',990,490,1.3)],.55,{}, {hero:[1090,720],odric:[1090,720]}),
  walk(19,[mm('hero',705,770,1.45),mm('odric',1060,550,1.65),mm('guard1',1130,565,1.3)],.6,{}, {odric:[1300,690],hero:[620,700]})
 ]},
 c7v25OdricFarewell:{...base('ch7OdricPass',{hero:[945,440],odric:[865,450],driver:[1040,450],guard1:[1090,530]}),beats:[
  b(0,[],.7,{hero:{...sit}},{hero:'odric',odric:'hero'}),
  walk(5,[mm('odric',845,475,.5)],.6,{}, {odric:'hero'}),
  walk(11,[mm('guard1',1030,475,.55),mm('odric',995,500,.9)],.7,{}, {odric:'driver',hero:'odric'}),
  {...walk(17,[mm('hero',780,675,1.8),mm('odric',1150,595,1.6),mm('driver',1210,610,1.7),mm('guard1',1240,685,1.8)],.8,{}, {hero:'odric',odric:'hero'}),screenFadeV20:true},
  b(18,[],.6)
 ]},
 c7v25Martha:{...base('ch7MarthaHospice',{hero:[805,550],martha:[835,455],apprentice:[1190,650],patient:[950,675]}),initiallyHidden:['apprentice'],beats:[
  walk(0,[mm('martha',835,535,.6)],.7,{}, {hero:'martha',martha:'hero'}),
  walk(4,[mm('hero',925,645,1.1,0,sit),mm('martha',990,645,1.2)],.7,{}, {hero:'martha',martha:'hero'}),
  walk(8,[mm('apprentice',1120,605,1)],.6,{}, {martha:'apprentice',hero:'apprentice'}),
  walk(15,[mm('martha',1000,625,.4)],.7,{}, {martha:'hero',hero:'martha'}),
  b(19,[],1.3,{hero:{...sit}},{martha:'patient',hero:'martha'})
 ],outro:{moves:[],cue:'cloth'}},
 c7v25MarthaFarewell:{...base('ch7MarthaHospice',{hero:[925,645],martha:[1000,630],apprentice:[1230,560]}),beats:[
  b(0,[],.65,{}, {hero:'martha',martha:[1080,675]}),
  walk(4,[mm('hero',925,645,.05,0,sit),mm('apprentice',1140,530,1)],.6,{}, {hero:'apprentice',apprentice:'hero',martha:'hero'}),
  walk(11,[mm('martha',1110,485,1.2),mm('martha',995,635,1.15,1.3)],.7,{}, {martha:'hero',hero:'martha'}),
  walk(18,[mm('hero',870,685,.6),mm('martha',835,555,1.1)],.65,{}, {martha:'hero',hero:'martha'}),
  walk(21,[mm('hero',675,650,1.3)],.45,{}, {hero:[170,650],martha:'hero'})
 ]},
 c7v25Severin:{...base('ch7SeverinBridge',{hero:[595,630],severin:[820,565],clerk:[1010,540],checkpointOfficer:[1040,610],guard1:[1090,745],guard2:[1210,665]}),beats:[
  b(0,[],.65,{}, {severin:'checkpointOfficer',clerk:'severin',hero:'severin',checkpointOfficer:'severin'}),
  walk(4,[mm('hero',735,600,1)],.6,{}, {hero:'severin',severin:'hero',checkpointOfficer:'hero'}),
  walk(10,[mm('checkpointOfficer',1200,575,1.1),mm('guard1',1130,665,.6),mm('guard2',1320,620,.75)],.65,{}, {guard1:'severin',guard2:'severin',severin:'checkpointOfficer'}),
  walk(19,[mm('hero',520,680,1.7),mm('severin',970,590,1.1),mm('clerk',980,520,.4)],.6,{}, {hero:[490,750],severin:[1130,610],clerk:'severin'})
 ]},
 c7v25SeverinFarewell:{...base('ch7SeverinBridge',{hero:[1020,610],severin:[1150,630],driver:[1220,695],clerk:[1160,550]}),beats:[
  walk(0,[mm('severin',1190,655,.5),mm('severin',1110,610,.7,.65)],.6,{}, {hero:'severin',severin:'hero'}),
  walk(5,[mm('severin',1130,575,.5)],.7,{}, {severin:[1160,550],hero:'severin'}),
  walk(10,[mm('hero',835,605,1.2),mm('severin',930,600,1.2),mm('driver',1290,650,.7)],.65,{}, {hero:'severin',severin:'hero'}),
  walk(14,[mm('hero',660,600,1.1),mm('severin',1140,570,1.6),mm('driver',1360,575,1.1),mm('clerk',1340,535,1.2)],.65,{}, {hero:'severin',severin:'hero'}),
  b(15,[],.7)
 ]},
 c7v25Truth:{...base('ch7Camp',{hero:[795,590],saint:[990,570]}),beats:[
  b(0,[],.8,{hero:{...sit}},{hero:'saint',saint:[900,530]}),
  walk(11,[mm('saint',1020,630,.7)],.8,{}, {saint:[900,530],hero:'saint'}),
  b(20,[],.85,{}, {saint:[805,340],hero:'saint'}),
  walk(27,[mm('saint',990,565,.7)],.65,{}, {saint:[900,530],hero:'saint'}),
  b(33,[],1.2,{}, {hero:'saint',saint:[805,340]})
 ]}
};

// Stable real chairs: only Noen uses the available seated body. Disguised Saint
// stands beside the table so the new costume never turns into the old white one.
seat(CHAPTER67_STAGING_V25.c6v25NightTalk,595,675);
seat(CHAPTER67_STAGING_V25.c7v25Confide,800,590);
seat(CHAPTER67_STAGING_V25.c7v25OdricFarewell,945,440);
seat(CHAPTER67_STAGING_V25.c7v25Martha,925,645);
seat(CHAPTER67_STAGING_V25.c7v25MarthaFarewell,925,645);
seat(CHAPTER67_STAGING_V25.c7v25Truth,795,590);

// Raster props remain literal known assets. The integrator calls the renderer
// below before the legacy stageprop fallback (which otherwise draws a chain).
for(const sid of ['c6v25Tax','c6v25Conscription'])prop(CHAPTER67_STAGING_V25[sid],'p_ledger','details',0,sid.endsWith('Tax')?1110:835,sid.endsWith('Tax')?407:610,45,28);
prop(CHAPTER67_STAGING_V25.c6v25Conscription,'p_scene_table','world',9,835,645,150,63);
CHAPTER67_STAGING_V25.c6v25Conscription.actorMeta.p_ledger.depthY=647;
CHAPTER67_STAGING_V25.c6v25Tax.actorMeta.p_ledger.depthY=432;
prop(CHAPTER67_STAGING_V25.c6v25Disguise,'p_clean_cloth','romancePropsV20',6,615,480,39,27);
prop(CHAPTER67_STAGING_V25.c6v25Village,'p_basin','world',13,825,590,45,48);
CHAPTER67_STAGING_V25.c6v25Village.beats[0].moves.push(mm('p_basin',870,550,.7));
prop(CHAPTER67_STAGING_V25.c6v25NightTalk,'p_wash','world',13,700,590,48,51);
prop(CHAPTER67_STAGING_V25.c6v25NightTalk,'p_teatable','world',9,650,665,140,60);
prop(CHAPTER67_STAGING_V25.c6v25NightTalk,'p_bundle','details',7,650,638,46,36);
CHAPTER67_STAGING_V25.c6v25NightTalk.actorMeta.p_bundle.depthY=667;
prop(CHAPTER67_STAGING_V25.c7v25ContractOne,'p_bread','romancePropsV20',5,680,630,32,23,false);
CHAPTER67_STAGING_V25.c7v25ContractOne.beats.find(x=>x.line===4).actorMeta.p_bread={visible:true};
for(const sid of ['c7v25Odric','c7v25OdricFarewell'])prop(CHAPTER67_STAGING_V25[sid],'p_cart','qualityWorld',3,sid.endsWith('Farewell')?1150:870,sid.endsWith('Farewell')?645:670,210,139);
for(const sid of ['c7v25Martha','c7v25MarthaFarewell'])prop(CHAPTER67_STAGING_V25[sid],'p_medicine','details',7,1060,652,52,40);
for(const sid of ['c7v25Severin','c7v25SeverinFarewell'])prop(CHAPTER67_STAGING_V25[sid],'p_graincart','qualityWorld',3,sid.endsWith('Farewell')?1235:910,sid.endsWith('Farewell')?725:625,200,132);
prop(CHAPTER67_STAGING_V25.c7v25Truth,'p_old_order','details',5,877,507,39,33);
prop(CHAPTER67_STAGING_V25.c7v25Truth,'p_new_notes','details',5,929,507,39,33,false);
CHAPTER67_STAGING_V25.c7v25Truth.actorMeta.p_old_order.depthY=535;
CHAPTER67_STAGING_V25.c7v25Truth.actorMeta.p_new_notes.depthY=536;
CHAPTER67_STAGING_V25.c7v25Truth.beats.find(x=>x.line===27).actorMeta.p_new_notes={visible:true};

// Portrait speech from today's guesthouse is a voice-over in these memories;
// it never creates an Elyria actor in the old city/pass/bridge.
const voiceovers={c7v25FirstEscape:[16,17,18,19,20],c7v25Granary:[14,15,16,17,18,19],c7v25OdricFarewell:[18,19,20],c7v25SeverinFarewell:[15,16,17,18,19,20,21,22]};
for(const[id,s]of Object.entries(CHAPTER67_STAGING_V25)){
 s.voiceoverRowsV25=voiceovers[id]||[];s.speaker_actor_per_line={};
 for(const[i,[speaker]]of CHAPTER67_DIALOGUES_V25[id].entries()){
  if(s.voiceoverRowsV25.includes(i)||speaker==='旁白')continue;
  const actor=speaker==='诺恩'?'hero':speaker==='艾莉娅'?'saint':Object.keys(s.actors).find(k=>s.actorMeta[k]?.name===speaker);
  if(actor&&s.actors[actor])s.speaker_actor_per_line[i]=actor;
 }
}

export function installChapter67StagingV25(){
 Object.assign(DIALOGUES,clone(CHAPTER67_DIALOGUES_V25));
 for(const[id,s]of Object.entries(CHAPTER67_STAGING_V25)){
  STAGING.scenes[id]=CHAPTER_STAGING[id]=clone(s);CINEMATIC_SCENES.add(id);
 }
}
export function drawChapter67StagePropV25(ctx,bank,a){
 const p=a?.v25Raster;if(!p)return false;
 if(a.visible!==false)bank.draw(ctx,p.sheet,p.index,a.x,a.y,p.w,p.h);
 return true;
}
