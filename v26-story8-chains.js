// V26 candidate, chapter 8. Root integrates this additive state-owned content.
// All materials are quest-owned, not sellable inventory entries. Every stage
// requires an explicit return and grants its sealed reward at most once.
const allRoutes=['ch8HiddenGate','ch8FlowerCourt','ch8GuestHouse','ch8DawnTerrace','ch8StoneTrial','ch8MirrorTrial','ch8StormTrial'];
const turn=(map,x=900,y=690)=>({map,npc:'chengli',name:'澄璃',x,y});
const gather=(id,name,count,points)=>({id,name,count,source:'gather',points});
const drop=(id,name,count)=>({id,name,count,source:'drop'});
const reward=(xp,gold=115)=>({xp,gold,items:{hpGrand:2,mpGrand:2},random:true});
export const SAGA_CHAINS8_V26=[
 {id:'c8xV26DryWindow',chapter:8,beforeNode:'v25C8Dawn',title:'窗外的雨，窗里的灯',introScene:'c8v26WindowMorning',routeMaps:allRoutes.slice(0,4),steps:[
  {id:'c8xV26WindowReeds',title:'去花隐溪门采六束月苇，带回做护带的纤维',map:'ch8HiddenGate',collect:[gather('c8v26MoonReed','月苇纤维',6,[[520,650],[670,820],[1040,860]])],turnIn:turn('ch8DawnTerrace',790,740),scene:'c8v26WindowThread',reward:reward(620)},
  {id:'c8xV26WindowSprings',title:'清理六具失控剑侍，找回三只仍能回弹的铜簧',map:'ch8DawnTerrace',kills:{type:'v25StoneWarden',count:6},collect:[drop('c8v26WindowSpring','完好的铜簧',3)],turnIn:turn('ch8DawnTerrace',790,740),scene:'c8v26WindowReady',reward:reward(760,145)}
 ]},
 {id:'c8xV26UnsentLetters',chapter:8,beforeNode:'v25MirrorTrial',title:'她留着的旧信',introScene:'c8v26LettersRequest',routeMaps:allRoutes.slice(0,6),steps:[
  {id:'c8xV26LettersStone',title:'清理折瀑八具失控剑侍，采六块细纹泉铁修练习护片',map:'ch8StoneTrial',kills:{type:'v25StoneWarden',count:8},collect:[gather('c8v26FineSpringIron','细纹泉铁',6,[[550,360],[1110,525],[1060,770]])],turnIn:turn('ch8DawnTerrace',790,740),scene:'c8v26LettersBench',reward:reward(830,150)},
  {id:'c8xV26LettersSatchel',title:'击退八只岚影兽，取回散落的三包油布信纸',map:'ch8StoneTrial',kills:{type:'v25WindHound',count:8},collect:[gather('c8v26WrappedLetters','油布包好的旧信',3,[[565,380],[1050,450],[1015,835]])],turnIn:turn('ch8MirrorTrial',570,760),scene:'c8v26LettersAnswer',reward:reward(850,160)}
 ]},
 {id:'c8xV26MistakeInNotes',chapter:8,beforeNode:'v25StormTrial',title:'她也会改掉的答案',introScene:'c8v26NotesAtGate',routeMaps:allRoutes,steps:[
  {id:'c8xV26NotesWater',title:'清除十道镜潭残影，取四份凝露并采五株清喉草',map:'ch8MirrorTrial',kills:{type:'v25PoolWisp',count:10},collect:[drop('c8v26StillwaterEssence','澄净凝露',4),gather('c8v26ClearthroatHerb','清喉草',5,[[560,805],[650,580],[1120,745]])],turnIn:turn('ch8GuestHouse',815,715),scene:'c8v26NotesWarmCup',reward:reward(970,175)},
  {id:'c8xV26NotesMarks',title:'拆除八具失控剑侍，拓下三处受潮的停机关记号',map:'ch8StormTrial',kills:{type:'v25StoneWarden',count:8},collect:[gather('c8v26MachineRubbings','停机关标记拓片',3,[[565,470],[865,790],[1150,720]])],turnIn:turn('ch8StormTrial',710,740),scene:'c8v26NotesCorrection',reward:reward(1060,180)}
 ]},
 {id:'c8xV26PromisedBreakfast',chapter:8,beforeNode:'v25C8Warning',title:'明天做一点好吃的',introScene:'c8v26BreakfastList',routeMaps:allRoutes,steps:[
  {id:'c8xV26BreakfastBerries',title:'击退八只岚影兽，采八把熟透的月莓和四枝干香草',map:'ch8StoneTrial',kills:{type:'v25WindHound',count:8},collect:[gather('c8v26RipeMoonberry','熟月莓',8,[[555,385],[1070,745],[1100,525]]),gather('c8v26DryHerb','烘焙香草',4,[[610,530],[1000,835]])],turnIn:turn('ch8GuestHouse',815,715),scene:'c8v26BreakfastDough',reward:reward(1020,160)},
  {id:'c8xV26BreakfastWard',title:'清理八道异常残影，收回三处界标的失效晶芯',map:'ch8HiddenGate',kills:{type:'v25PoolWisp',count:8},collect:[gather('c8v26WardCrystal','失效的界标晶芯',3,[[540,615],[850,795],[1050,730]])],turnIn:turn('ch8GuestHouse',815,715),scene:'c8v26BreakfastTable',reward:reward(1160,185)}
 ]}
];
