// V26 candidate. Only authored raster props; no empty-hand action poses.
// Root's routeTo / arrival pipeline must route these moves with live collisions.
import {DIALOGUES} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {CHAPTER8_DIALOGUES_V26} from './v26-story8-text.js';
const clone=x=>structuredClone(x);
const stand={pose:'stand',v25Pose:'stand',v25Held:null,hideWeapon:true,autoFace:true};
const face={hero:'chengli',chengli:'hero',saint:'chengli'};
const move=(id,x,y,duration=1,delay=0)=>[id,x,y,duration,delay];
const beat=(line,moves=[],hold=.45,faces={})=>({line,moves,hold,actorMeta:Object.fromEntries(moves.filter(m=>!m[0].startsWith('p_')).map(m=>[m[0],clone(stand)])),faceTargets:{...face,...faces}});
const base=(map,actors,beats,focus)=>({map,actors,beats,socialV20:true,commitActor:'hero',initiallyHidden:[],noCG:true,focus:focus||[770,680],faceTargets:face,actorMeta:Object.fromEntries(Object.keys(actors).map(id=>[id,{...stand,...(id==='hero'?{renderAs:'hero',socialV20:true}:id==='saint'?{sprite:0,socialV20:true}:{sprite:1,v25Identity:'chengli',socialV20:false})}]))});
const dawn=(beats)=>base('ch8DawnTerrace',{hero:[700,770],chengli:[925,835]},beats,[825,765]);
const mirror=(beats)=>base('ch8MirrorTrial',{hero:[535,780],chengli:[665,745]},beats,[610,700]);
const storm=(beats)=>base('ch8StormTrial',{hero:[635,760],chengli:[800,730]},beats,[730,680]);
const guest=(beats)=>base('ch8GuestHouse',{hero:[525,710],saint:[760,630],chengli:[770,740]},beats,[675,600]);
const court=(beats)=>base('ch8FlowerCourt',{hero:[790,720],saint:[610,705],chengli:[735,590]},beats,[705,625]);
const raster=(s,id,sheet,index,x,y,w,h)=>{s.actors[id]=[x,y];const supportDepth={ch8DawnTerrace:915.2,ch8GuestHouse:667.2,ch8FlowerCourt:630.2}[s.map];s.actorMeta[id]={renderAs:'prop',pose:'lying',autoFace:false,visible:true,v25Raster:{sheet,index,w,h},depthY:supportDepth??y+1};return s;};
export const CHAPTER8_STAGING_V26={
 c8v26WindowMorning:dawn([
  beat(0,[move('hero',735,825,1)],.5),beat(4,[move('hero',765,850,.6)],.5,{hero:[815,886],chengli:[815,886]}),
  beat(14,[move('chengli',930,790,.55)],.5),beat(22,[move('hero',755,815,.6)],.4),beat(27,[move('chengli',905,755,.7)],.6)
 ]),
 c8v26WindowThread:dawn([
  beat(0,[move('hero',750,835,1)],.5),beat(5,[move('chengli',905,825,.55)],.45,{hero:'chengli'}),
  beat(13,[],.6,{hero:[835,885],chengli:[835,885]}),beat(23,[move('hero',755,745,.65),move('chengli',900,785,.55)],.6,{hero:[1010,610],chengli:[1010,610]}),beat(28,[],.5)
 ]),
 c8v26WindowReady:dawn([
  beat(0,[move('hero',760,835,1)],.6,{hero:[815,886],chengli:[815,886]}),beat(5,[move('chengli',890,845,.5)],.6),
  beat(16,[],.45),beat(20,[move('hero',760,775,.65),move('chengli',885,790,.65)],.5),beat(28,[move('chengli',875,675,1)],.6)
 ]),
 c8v26LettersRequest:mirror([
  beat(0,[move('hero',565,755,.6)],.55,{hero:[620,780],chengli:'hero'}),beat(12,[],.6,{hero:[620,780],chengli:[620,780]}),
  beat(17,[move('chengli',690,780,.45)],.7),beat(25,[move('hero',570,790,.4)],.45),beat(27,[],.5)
 ]),
 c8v26LettersBench:dawn([
  beat(0,[move('hero',760,835,.8),move('chengli',905,835,.55)],.6,{hero:[835,886],chengli:[835,886]}),
  beat(4,[move('chengli',930,795,.5)],.5),beat(17,[],.75),beat(21,[move('hero',775,800,.5)],.5),beat(28,[],.6)
 ]),
 c8v26LettersAnswer:mirror([
  beat(0,[move('hero',560,755,.55),move('chengli',660,765,.4)],.6,{hero:[610,790],chengli:[610,790]}),
  beat(9,[],.9),beat(14,[move('hero',540,785,.4)],.7),beat(19,[],.5),beat(25,[move('chengli',710,745,.6)],.65),beat(28,[],.5)
 ]),
 c8v26NotesAtGate:storm([
  beat(0,[move('hero',680,735,.6)],.6),beat(5,[move('hero',695,715,.5)],.6),beat(14,[move('chengli',855,725,.6)],.5),
  beat(17,[move('chengli',805,750,.6)],.5),beat(24,[move('chengli',670,845,1.3)],.6),beat(28,[move('chengli',545,825,1.2)],.65)
 ]),
 c8v26NotesWarmCup:guest([
  beat(0,[move('hero',515,665,.6)],.55,{saint:'chengli',chengli:[650,623]}),beat(6,[move('saint',750,685,.5)],.6),
  beat(14,[],.6),beat(17,[move('chengli',725,720,.55)],.65,{hero:[645,620],saint:'chengli',chengli:'hero'}),beat(27,[move('hero',530,735,.6)],.55),beat(29,[],.5)
 ]),
 c8v26NotesCorrection:storm([
  beat(0,[move('hero',680,735,.6)],.6,{hero:[770,775],chengli:[770,775]}),beat(8,[move('chengli',850,755,.6)],.55),
  beat(13,[move('hero',715,735,.5)],.65),beat(19,[],.8),beat(24,[move('chengli',825,710,.55)],.55),beat(29,[move('chengli',920,745,.85)],.6)
 ]),
 c8v26BreakfastList:court([
  beat(0,[move('hero',810,680,.55)],.6,{hero:[700,590],saint:'chengli',chengli:'hero'}),beat(6,[move('chengli',755,595,.35)],.45),
  beat(11,[move('saint',610,750,.55)],.5),beat(18,[],.55,{hero:'chengli',saint:[680,590],chengli:'saint'}),beat(23,[move('hero',850,715,.55)],.6),beat(27,[move('hero',995,675,1.2)],.65)
 ]),
 c8v26BreakfastDough:guest([
  beat(0,[move('hero',515,670,.55)],.6),beat(6,[move('chengli',815,730,.6)],.55),beat(7,[move('chengli',720,720,.7)],.65),
  beat(17,[move('hero',515,720,.5)],.7),beat(21,[],.7,{hero:[870,400],saint:'chengli',chengli:[870,400]}),beat(28,[move('hero',820,810,1.6)],.7),beat(29,[],.5)
 ]),
 c8v26BreakfastTable:guest([
  beat(0,[move('chengli',725,720,.6),move('hero',515,665,.65)],.65,{hero:[645,620],saint:[645,620],chengli:[645,620]}),
  beat(4,[],.6),beat(9,[move('hero',815,805,1.7),move('hero',515,675,1.7,1.8)],.7),
  beat(12,[],.85),beat(17,[],.65),beat(21,[move('saint',735,675,.5)],.6),beat(26,[],.7),beat(29,[],.9)
 ])
};
for(const id of ['c8v26WindowMorning','c8v26WindowThread','c8v26WindowReady','c8v26LettersBench'])raster(CHAPTER8_STAGING_V26[id],'p_v26_supplies','details',7,813,886,52,39);
raster(CHAPTER8_STAGING_V26.c8v26WindowThread,'p_v26_bread','romancePropsV20',5,855,881,37,28);
for(const id of ['c8v26LettersRequest','c8v26LettersAnswer'])raster(CHAPTER8_STAGING_V26[id],'p_v26_letters','details',5,610,790,43,29);
for(const id of ['c8v26NotesAtGate','c8v26NotesCorrection'])raster(CHAPTER8_STAGING_V26[id],'p_v26_notes','details',5,770,775,49,34);
// Guest room already has the permanent paper at 652,614 and cup at 614,620.
// Reuse those instead of overlaying another paper/cup on the same tabletop.
raster(CHAPTER8_STAGING_V26.c8v26BreakfastList,'p_v26_recipe','details',5,715,584,43,29);
raster(CHAPTER8_STAGING_V26.c8v26BreakfastDough,'p_v26_supplies','details',7,579,630,28,21);
raster(CHAPTER8_STAGING_V26.c8v26BreakfastTable,'p_v26_bread','romancePropsV20',5,685,625,34,25);
for(const[id,s]of Object.entries(CHAPTER8_STAGING_V26))s.speaker_actor_per_line=CHAPTER8_DIALOGUES_V26[id].map(([name])=>({'诺恩':'hero','艾莉娅':'saint','澄璃':'chengli'}[name]||null));
export function installChapter8StagingV26(){
 Object.assign(DIALOGUES,clone(CHAPTER8_DIALOGUES_V26));
 for(const[id,s]of Object.entries(CHAPTER8_STAGING_V26)){STAGING.scenes[id]=CHAPTER_STAGING[id]=clone(s);CINEMATIC_SCENES.add(id);}
}
