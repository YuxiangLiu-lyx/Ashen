import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {SAINT_STORY_EVENTS_V18} from './saint-story-text-v18.js';

const copy=v=>structuredClone(v);
const beat=(line,moves=[],actorMeta={},faceTargets={})=>({line,moves,actorMeta,faceTargets});
const move=(id,x,y,duration=.7,delay=0)=>[id,x,y,duration,delay];
const pose=(hero='stand',saint='stand')=>({hero:{pose:hero},saint:{pose:saint}});
const mutual={hero:'saint',saint:'hero'};
const scenesFor=p=>typeof p==='string'?[p]:p.variant?[p.wine,p.flower]:p.options.map(o=>o.scene);

// CG is a brief reading inset. The renderer must return to the actual world during action.
export const SAINT_ILLUSTRATION_BEATS_V19=Object.freeze({
 v18SaintCupsB:[{from:6,to:9,id:'tavern'}],
 v18SaintPastA:[{from:11,to:13,id:'tavern'}],
 v18SaintLanternB:[{from:0,to:3,id:'riverside'},{from:12,to:14,id:'riverside'}],
 v18SaintRiddleB:[{from:8,to:10,id:'marketgame'}],
 v18SaintRainA:[{from:10,to:12,id:'rain'}],
 v18SaintCareA:[{from:7,to:8,id:'care'}],
 v18SaintDepartureB:[{from:4,to:8,id:'observatory'}]
});

export function installSaintStagingV19(){
 // Called after V18 scene registration. It only changes optional-scene choreography.
 for(const event of SAINT_STORY_EVENTS_V18)for(const part of event.parts)for(const id of scenesFor(part)){
  if(!STAGING.scenes[id])throw new Error('V19 staging must follow saint story registration: '+id);
  const s={map:event.map,actors:copy(event.actors),actorMeta:{hero:{renderAs:'hero',pose:'stand'},saint:{sprite:0,pose:'stand'}},initiallyHidden:[],commitActor:'hero',focus:[(event.actors.hero[0]+event.actors.saint[0])/2,event.actors.hero[1]-35],faceTargets:copy(mutual),beats:[]};
  STAGING.scenes[id]=CHAPTER_STAGING[id]=s;CINEMATIC_SCENES.add(id);
 }
 const stage=(id,config,beats)=>{const s=STAGING.scenes[id];Object.assign(s,copy(config));s.beats=beats;return s;};
 const actors=(hero,saint)=>({actors:{hero,saint}});
 const prop=(s,id,kind,x,y,size=1)=>{s.actors[id]=[x,y];s.actorMeta[id]={renderAs:'prop',propKind:'v19:'+kind,autoFace:false,size,visible:false};return s;};

 stage('v18SaintMarketA',{},[
  beat(0,[move('hero',820,680),move('saint',905,690,.85)],{}, {hero:[760,670],saint:[1010,580]}),
  beat(3,[move('hero',790,665),move('saint',885,650)],{},mutual),
  beat(10,[move('saint',915,625,.7)],{}, {hero:'saint',saint:[985,570]}),
  beat(13,[move('hero',825,650,.6)],{}, {hero:[800,700],saint:[985,570]})]);
 const sugar=stage('v18SaintMarketB',actors([825,650],[915,625]),[
  beat(0,[],{}, {hero:[985,570],saint:[985,570]}),
  beat(7,[move('hero',880,660,.6)],pose()),
  beat(9,[move('saint',925,660,.55)],{saint:{pose:'offer'}},mutual),
  beat(12,[move('hero',850,695,.6),move('saint',940,700,.75)],{...pose('stand','stand'),paper:{visible:false}}),
  beat(13,[],{saint:{pose:'offer'}})]);
 prop(sugar,'paper','paper',904,625,.7);sugar.beats[2].moves.push(move('paper',910,625,.45));

 stage('v18SaintRiddleA',{},[
  beat(0,[move('saint',1155,610,.65)],{saint:{pose:'offer'}},{hero:'saint',saint:[1170,540]}),
  beat(5,[move('hero',1095,615,.55)],{},mutual),
  beat(8,[move('saint',1170,605,.5)],{saint:{pose:'offer'}},{hero:'saint',saint:[1170,540]}),
  beat(13,[move('hero',1100,650),move('saint',1165,650,.8)],pose(),mutual)]);
 const rings=stage('v18SaintRiddleB',actors([1100,650],[1165,650]),[
  beat(0,[move('saint',1165,630,.55)],{saint:{pose:'offer'}},{hero:'saint',saint:[1165,570]}),
  beat(4,[move('woodRing',1165,565,.5),move('woodRing',1090,652,.55,.5)],{woodRing:{visible:true,walkDistance:0,arcLength:167,arcHeight:24},saint:{pose:'offer'}},{hero:'woodRing',saint:'woodRing'}),
  beat(6,[move('hero',1120,653,.45),move('woodRing',1150,603,.65)],{woodRing:{walkDistance:0,arcLength:75,arcHeight:8}},mutual),
  beat(8,[move('hero',1095,650,.5),move('woodRing',1165,570,.85)],{woodRing:{walkDistance:0,arcLength:42,arcHeight:21}},{hero:'woodRing',saint:'woodRing'}),
  beat(11,[move('hero',1140,600,.65),move('hero',1110,650,.65,.7),move('saint',1185,648,.7)],{saint:{pose:'offer'},woodRing:{visible:false}},mutual),
  beat(12,[],pose())]);
 prop(rings,'woodRing','ring',1165,597,.9);

 stage('v18SaintCardsA',{},[
  beat(0,[move('saint',730,625,.6),move('hero',615,645,.7)],{saint:{pose:'offer'}},{hero:'saint',saint:[715,595]}),
  beat(4,[move('hero',630,620,.6),move('saint',745,620,.6)],pose('seated','seated'),mutual),
  beat(9,[],{saint:{pose:'seated-listen'}}),
  beat(11,[],{hero:{pose:'listen'},saint:{pose:'seated'}})]);
 for(const id of ['v18SaintCardsLeft','v18SaintCardsRight'])stage(id,{...actors([630,620],[745,620]),actorMeta:{hero:{renderAs:'hero',pose:'seated'},saint:{sprite:0,pose:'seated'}}},[
  beat(2,[],{saint:{pose:'seated-listen'}}),beat(5,[],{hero:{pose:'listen'},saint:{pose:'seated'}})]);
 stage('v18SaintCardsB',{...actors([630,620],[745,620]),actorMeta:{hero:{renderAs:'hero',pose:'seated'},saint:{sprite:0,pose:'seated'}}},[
  beat(7,[],{}, {hero:'saint',saint:[1100,640]}),
  beat(10,[move('saint',785,670,.6)],{saint:{pose:'stand'}},mutual),
  beat(13,[move('saint',810,660,.45),move('saint',767,650,.55,.45),move('saint',850,665,.65,1.0)],{saint:{pose:'stand'}},{hero:'saint',saint:[980,640]})]);

 stage('v18SaintBreadA',{},[
  beat(0,[move('saint',1120,750,.65),move('hero',1030,755,.65)],pose(),{hero:[1190,690],saint:[1190,690]}),
  beat(4,[move('saint',1150,735,.6)],{saint:{pose:'offer'}},{hero:'saint',saint:[1190,690]}),
  beat(8,[move('hero',1080,760,.65),move('saint',1140,775,.6)],pose(),mutual),
  beat(11,[move('hero',1050,790,.6),move('saint',1130,790,.6)],pose('seated','seated'))]);
 stage('v18SaintBreadB',{...actors([1050,790],[1130,790]),actorMeta:{hero:{renderAs:'hero',pose:'seated'},saint:{sprite:0,pose:'seated'}}},[
  beat(0,[],{},mutual),
  beat(5,[move('hero',1060,795,.45),move('saint',1145,795,.45)],pose('seated','seated'),{hero:[850,720],saint:[850,720]}),
  beat(9,[move('saint',1120,795,.45)],{saint:{pose:'seated'}},mutual),
  beat(13,[move('hero',1080,820,.65),move('saint',1160,820,.7)],pose(),{hero:[1200,760],saint:'hero'})]);

 stage('v18SaintPracticeA',{},[
  beat(0,[move('saint',515,665,.55),move('hero',415,690,.55)],{}, {hero:'saint',saint:[510,625]}),
  beat(5,[move('saint',470,680,.6)],{}, {hero:[490,610],saint:[490,610]}),
  beat(9,[move('hero',435,660,.5),move('saint',515,665,.6)],{saint:{pose:'practice'}},mutual),
  {...beat(10,[],{saint:{pose:'guard'}}),cue:'holy_ward'},
  beat(12,[move('hero',435,620,.85),move('saint',520,635,.9,.15)],{saint:{pose:'stand'}},{hero:[435,520],saint:'hero'})]);
 stage('v18SaintPracticeB',actors([435,620],[520,635]),[
  {...beat(0,[move('hero',430,600,.65),move('saint',515,615,.7)],{saint:{pose:'guard'}}),cue:'holy_ward'},
  beat(5,[move('hero',425,665,.65),move('saint',520,670,.7)],pose(),mutual),
  beat(9,[move('saint',472,662,.6)],{saint:{pose:'offer'}},{hero:[435,520],saint:'hero'}),
  beat(13,[move('saint',540,685,.65)],{saint:{pose:'drink'}},mutual)]);

 stage('v18SaintRainA',{},[
  beat(0,[move('hero',475,365,.8),move('saint',550,365,.7)],pose(),{hero:[560,280],saint:'hero'}),
  beat(3,[move('hero',450,350,.55),move('saint',550,345,.65)],pose('seated','seated'),mutual),
  beat(7,[move('hero',440,355,.6),move('saint',540,345,.45)],pose('seated','seated')),
  beat(10,[move('hero',485,345,.6)],{saint:{pose:'care'}},mutual)]);
 stage('v18SaintRainB',{...actors([485,345],[540,345]),actorMeta:{hero:{renderAs:'hero',pose:'seated'},saint:{sprite:0,pose:'care'}}},[
  beat(3,[],{saint:{pose:'seated-listen'}},{hero:[475,460],saint:[540,385]}),
  beat(8,[],{saint:{pose:'care'}},mutual),
  beat(11,[move('hero',480,420,.9)],{hero:{pose:'stand'},saint:{pose:'seated'}},{hero:[430,500],saint:'hero'}),
  beat(15,[move('hero',480,355,.8),move('saint',550,380,.55,.65)],pose(),mutual)]);

 stage('v18SaintRoofA',{},[
  beat(0,[move('saint',880,535,.65),move('hero',780,550,.8)],{}, {hero:'saint',saint:[880,230]}),
  beat(3,[move('saint',875,560,.45)],{}, {hero:[900,240],saint:[900,240]}),
  beat(9,[move('hero',825,555,.45)],{}, {hero:'saint',saint:[900,240]}),
  beat(11,[move('saint',875,545,.4)],{}, {hero:'saint',saint:[920,230]})]);
 stage('v18SaintRoofB',actors([825,555],[875,545]),[
  beat(0,[move('saint',890,565,.4)],{saint:{pose:'gesture'}},mutual),
  beat(3,[move('hero',830,570,.5)],{},mutual),
  beat(6,[move('saint',865,570,.45)],{saint:{pose:'offer'}},mutual),
  beat(10,[move('saint',900,585,.6)],pose(),{hero:[930,300],saint:[930,300]}),
  beat(14,[move('hero',820,615,.7),move('saint',920,625,.75)],pose(),{hero:'saint',saint:[1100,700]})]);

 const tavernMeta={hero:{renderAs:'hero'},saint:{sprite:0},ch5Barkeep:{sprite:12}};
 stage('v18SaintCupsA',{actors:{hero:[925,710],saint:[1030,700],ch5Barkeep:[1090,730]},actorMeta:tavernMeta},[
  beat(0,[move('ch5Barkeep',1090,650,.8),move('saint',1040,670,.7),move('hero',940,675,.75)],{}, {hero:'ch5Barkeep',saint:'ch5Barkeep',ch5Barkeep:'saint'}),
  beat(4,[move('hero',940,660,.45),move('saint',1030,655,.5)],pose('seated','seated'),mutual),
  beat(7,[move('ch5Barkeep',1090,705,.7)],{}, {ch5Barkeep:'saint'}),
  beat(11,[],{saint:{pose:'seated-listen'}})]);
 for(const [id,line] of [['v18SaintCupsWine',1],['v18SaintCupsFlower',2]])stage(id,{actors:{hero:[940,660],saint:[1030,655],ch5Barkeep:[1090,705]},actorMeta:{hero:{renderAs:'hero',pose:'seated'},saint:{sprite:0,pose:'seated'},ch5Barkeep:{sprite:12}}},[
  beat(line,[],{saint:{pose:'drink'}}),beat(id.endsWith('Wine')?5:9,[],{hero:{pose:'drink'},saint:{pose:'seated'}})]);
 stage('v18SaintCupsB',{actors:{hero:[940,660],saint:[1030,655],ch5Barkeep:[1090,705]},actorMeta:{hero:{renderAs:'hero',pose:'seated'},saint:{sprite:0,pose:'seated'},ch5Barkeep:{sprite:12}}},[
  beat(0,[],{saint:{pose:'seated-listen'}},{hero:[800,460],saint:[800,460]}),
  beat(6,[],{},mutual),
  beat(9,[move('ch5Barkeep',1080,750,.55)],{saint:{pose:'drink'}},{ch5Barkeep:[800,460]}),
  beat(11,[move('hero',925,710,.6),move('saint',1020,710,.6),move('ch5Barkeep',1090,705,.6)],pose(),mutual)]);

 for(const id of ['v18SaintPastWine','v18SaintPastFlower'])stage(id,{},[
  beat(0,[move('hero',835,705,.6),move('saint',920,710,.65)],pose('seated','seated'),{hero:[880,350],saint:[880,350]}),
  beat(id.endsWith('Wine')?4:5,[],{hero:{pose:'listen'},saint:{pose:'seated-listen'}},mutual)]);
 stage('v18SaintPastA',{...actors([835,705],[920,710]),actorMeta:{hero:{renderAs:'hero',pose:'listen'},saint:{sprite:0,pose:'seated-listen'}}},[
  beat(3,[],{saint:{pose:'seated'}},mutual),
  beat(8,[],{saint:{pose:'drink'}},{hero:'saint',saint:[925,760]}),
  beat(12,[move('hero',840,705,.45)],{hero:{pose:'seated'},saint:{pose:'seated-listen'}},mutual)]);
 stage('v18SaintPastB',{...actors([840,705],[920,710]),actorMeta:{hero:{renderAs:'hero',pose:'seated'},saint:{sprite:0,pose:'seated-listen'}}},[
  beat(2,[],{saint:{pose:'seated'}}),
  beat(7,[],{}, {hero:[780,750],saint:[780,750]}),
  beat(10,[],{hero:{pose:'listen'}},mutual),
  beat(17,[move('saint',915,760,.6),move('saint',920,720,.5,.6),move('saint',975,775,.65,1.1)],{saint:{pose:'stand'}},{hero:'saint',saint:[1040,780]})]);

 for(const id of ['v18SaintCareWine','v18SaintCareFlower'])stage(id,{actors:{hero:[1040,650],saint:[1130,650],ch5Barkeep:[1090,740]},actorMeta:tavernMeta},[
  beat(0,[move('saint',1085,645,.55),move('saint',1085,710,.65,.55),move('hero',1040,700,.7)],{saint:{pose:'tired'}},mutual),
  beat(4,[move('hero',1070,720,.55),move('ch5Barkeep',1100,825,1)],{saint:{pose:'stand'}},mutual),
  beat(7,[move('hero',1100,780,.9),move('saint',1140,780,.9,.1)],pose(),{hero:[1120,900],saint:'hero'}),
  beat(10,[move('hero',1100,845,.8),move('saint',1140,845,.85)],{}, {hero:[1120,930],saint:[1120,930]})]);
 const careA=stage('v18SaintCareA',{map:'ch5GuestRooms',actors:{hero:[850,580],saint:[940,580],ch5Barkeep:[1080,620]},actorMeta:{hero:{renderAs:'hero'},saint:{sprite:0,pose:'seated'},ch5Barkeep:{sprite:12}},focus:[1030,500]},[
  beat(3,[move('hero',890,585,.5)],{},mutual),
  beat(6,[move('hero',900,590,.5),move('saint',915,580,.5)],{hero:{pose:'carry'},saint:{pose:'carried',poseFlip:false}}),
  beat(7,[move('hero',1040,545,1.4),move('saint',1055,535,1.4)]),
  beat(9,[move('hero',1020,550,.5),move('saint',1100,455,.5)],{hero:{pose:'stand'},saint:{pose:'lying',depthY:531,angle:Math.PI,autoFace:false,poseFlip:true}}),
  beat(12,[move('hero',990,545,.4)])]);
 stage('v18SaintCareB',{map:'ch5GuestRooms',actors:{hero:[1020,550],saint:[1100,455],ch5Barkeep:[1160,580]},actorMeta:{hero:{renderAs:'hero'},saint:{sprite:0,pose:'lying',depthY:531,angle:Math.PI,autoFace:false,poseFlip:true},ch5Barkeep:{sprite:12}},focus:[1030,500]},[
  beat(3,[move('hero',995,570,.5)]),
  beat(8,[move('hero',800,625,1.1)]),
  beat(10,[move('ch5Barkeep',885,625,.8)])]);
 stage('v18SaintMorningA',{actors:{hero:[850,620],saint:[1030,550]},initiallyHidden:['hero'],actorMeta:{hero:{renderAs:'hero'},saint:{sprite:0,pose:'seated'}}},[
  beat(2,[move('saint',940,580,.75)],{saint:{pose:'stand'}}),
  beat(3,[move('hero',850,580,.65)],{},mutual),
  beat(10,[move('hero',825,610,.6)],{},mutual),
  beat(12,[move('saint',990,555,.7)],{}, {hero:'saint',saint:[1100,455]})]);
 stage('v18SaintMorningB',actors([825,610],[990,555]),[
  beat(0,[move('saint',920,605,.8)],{saint:{pose:'offer'}},mutual),
  beat(4,[move('hero',875,615,.55)],{},mutual),
  beat(7,[move('hero',850,640,.55),move('saint',935,635,.6)],pose()),
  beat(10,[move('saint',1015,665,.7)],{},mutual),
  beat(13,[move('hero',835,725,.8),move('hero',1030,745,1,.8),move('saint',1100,720,.9)],{}, {hero:[1120,800],saint:[1120,800]})]);

 stage('v18SaintWorkshopA',{},[
  beat(0,[move('saint',775,635,.65),move('hero',680,650,.55)],{saint:{pose:'offer'}},{hero:[740,580],saint:[740,580]}),
  beat(3,[move('hero',705,630,.55)],{saint:{pose:'work'}},mutual),
  beat(7,[move('saint',795,635,.55)],{saint:{pose:'offer'}},{hero:[750,580],saint:[750,580]}),
  beat(12,[move('hero',720,650,.6)],{saint:{pose:'work'}},mutual)]);
 stage('v18SaintWorkshopB',actors([720,650],[795,635]),[
  beat(5,[move('saint',825,615,.6)],{saint:{pose:'offer'}},{hero:'saint',saint:[825,510]}),
  beat(8,[move('saint',785,640,.6)],{saint:{pose:'work'}},mutual),
  beat(9,[move('hero',740,620,.65),move('saint',825,620,.65)],{saint:{pose:'offer'}},{hero:[780,560],saint:[780,560]}),
  beat(12,[move('hero',730,680,.8),move('saint',820,690,.8)],{saint:{pose:'stand'}},mutual)]);

 stage('v18SaintLanternA',{},[
  beat(0,[move('hero',990,825,.6),move('saint',945,815,.6)],{saint:{pose:'offer'}},{hero:[890,820],saint:[890,820]}),
  beat(3,[],{saint:{pose:'work'}},mutual),
  beat(8,[move('hero',970,835,.55),move('saint',945,830,.55)],{saint:{pose:'offer'}},{hero:[900,830],saint:[900,830]}),
  beat(11,[move('hero',950,845,.55)],{saint:{pose:'stand'}},{hero:[870,835],saint:[870,835]})]);
 stage('v18SaintLanternB',actors([950,845],[945,830]),[
  beat(0,[move('hero',980,820,.7),move('saint',950,800,.75)],pose(),{hero:[775,785],saint:[775,785]}),
  beat(4,[move('saint',970,780,.7)],{},mutual),
  beat(9,[],{}, {hero:[775,785],saint:[775,785]}),
  beat(14,[move('hero',1010,800,.7),move('saint',950,790,.7)],pose('seated','seated'),{hero:[770,780],saint:[770,780]})]);

 stage('v18SaintDepartureA',{},[
  beat(0,[move('saint',580,470,.55),move('hero',510,470,.65)],{saint:{pose:'offer'}},{hero:[545,405],saint:[545,405]}),
  beat(4,[move('hero',525,505,.45),move('hero',615,500,.75,.45)],{}, {hero:'saint',saint:[545,405]}),
  beat(7,[move('saint',568,465,.5)],{saint:{pose:'offer'}},{hero:[545,405],saint:[545,405]}),
  beat(11,[move('saint',575,480,.45)],{saint:{pose:'stand'}},mutual)]);
 stage('v18SaintDepartureB',actors([615,500],[575,480]),[
  beat(4,[move('hero',585,480,.6),move('saint',655,475,.7)],{saint:{pose:'offer'}},{hero:[545,405],saint:'hero'}),
  beat(6,[move('saint',638,480,.45)],{saint:{pose:'offer'}},mutual),
  beat(9,[move('hero',630,505,.65),move('saint',575,475,.65)],{saint:{pose:'stand'}},{hero:'saint',saint:[545,405]}),
  beat(14,[move('hero',590,530,.6),move('saint',620,515,.65)],{saint:{pose:'offer'}},mutual),
  beat(16,[move('hero',585,575,.75),move('saint',680,570,.8)],pose(),{hero:'saint',saint:[550,370]})]);
 return Object.keys(SAINT_ILLUSTRATION_BEATS_V19);
}

// Small objects use the same Cinematic actors/moves as people: no reward or save mutation.
// Called before the game's generic stageprop fallback; returns false for all legacy props.
// Legacy object actors retain save/stage timing. Their physical props now live in the raster poses.
export function drawSaintStoryPropV19(c,a){return !!a.propKind?.startsWith('v19:');}
