import {V11_DIALOGUES,V11_CONTINUITY_PATCHES,V11_SCENES} from './narrative-v14.js';
import {DIALOGUES,MAPS} from './data-v14.js';
import {SCENERY} from './world-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
const move=(id,x,y,t=.6,delay=0)=>[id,x,y,t,delay];
const beat=(line,moves=[],extra={})=>({line,moves,...extra});
function set(id,st){STAGING.scenes[id]=CHAPTER_STAGING[id]=st;CINEMATIC_SCENES.add(id);}
function side(id,map,actors,meta={},beats=[]){set(id,{map,actors,actorMeta:meta,beats:beats.length?beats:[beat(0,[])],initiallyHidden:[],commitActor:'hero',faceTargets:{hero:actors.deepMerchant?'deepMerchant':actors.deepEnchanter?'deepEnchanter':actors.mechanist?'mechanist':'saint',saint:'hero',...(actors.mechanist?{mechanist:'hero'}:{}),...(actors.deepMerchant?{deepMerchant:'hero'}:{})},focus:[actors.hero[0]+40,actors.hero[1]-20]});}
export function installV11Staging(){
 Object.assign(DIALOGUES,V11_DIALOGUES);for(const[id,lines]of Object.entries(V11_CONTINUITY_PATCHES))for(const[i,line]of Object.entries(lines))if(DIALOGUES[id]?.[i])DIALOGUES[id][i]=line;
 const corpses=new Set(['ch3AdvanceBoss1After','ch3AdvanceBoss2After','ch4Boss1After','ch4Boss2After','ch4Boss3After']);
 for(const id of corpses){const st=STAGING.scenes[id];if(st?.actorMeta.boss)st.actorMeta.boss.fall=.8;}
 STAGING.scenes.ch3AdvanceIntro.actors.saint=[455,795];
 for(const id of ['ch3AdvanceIntro','ch3AdvanceBoss1Before','ch3AdvanceBoss1After','ch3AdvanceBoss2After']){const st=STAGING.scenes[id];st.actors.mechanist=id==='ch3AdvanceIntro'?[505,745]:id==='ch3AdvanceBoss2After'?[895,615]:[805,600];st.actorMeta.mechanist={sprite:11};st.faceTargets.mechanist='hero';}
 const q=STAGING.scenes.ch3AdvanceBoss1Before;for(const id of ['ch3AdvanceBoss1Before','ch3AdvanceBoss1After']){const st=STAGING.scenes[id];st.actors.cart=[1280,625];st.actorMeta.cart={renderAs:'prop',propKind:'cart',autoFace:false};st.beats=[beat(0,[move('mechanist',840,620,.65)]),beat(3,[move('hero',955,600,.45)])];}
 side('ch3AdvanceRest','hellQuarry',{hero:[400,525],saint:[490,570],mechanist:[425,625]},{mechanist:{sprite:11}},[beat(0,[move('hero',410,525,.5)]),beat(10,[],{cue:'paper'})]);
 side('ch4Arrival','deepGate',{hero:[315,795],saint:[385,855],deepMerchant:[495,800]},{deepMerchant:{sprite:5}},[beat(0,[move('hero',340,785,.65),move('saint',410,845,.75)]),beat(2,[move('deepMerchant',475,800,.4)])]);
 side('ch4CampWelcome','deepCamp',{hero:[490,595],saint:[580,625],deepMerchant:[590,480],deepEnchanter:[1035,475]},{deepMerchant:{sprite:5},deepEnchanter:{sprite:2}},[beat(0,[move('hero',530,575,.6),move('saint',620,605,.6)])]);
 for(const id of ['ch3TeachingIntro','ch3TeachingRepeat','ch3TeachingPractice'])side(id,'hellCamp',{hero:[690,605],saint:[775,645]}, {},[beat(0,[]),beat(Math.min(6,DIALOGUES[id].length-1),[],{cue:'holy_focus'})]);
 // World-space luxury, never an inserted story image. Original adult actors remain in the room.
 const chamber=SCENERY.chamber;const table=chamber.find(x=>x.id==='chamber-table');if(table)Object.assign(table,{sheet:'medicalProps',asset:2,w:310,h:219});
 chamber.push({id:'v11-chamber-cabinet',sheet:'medicalProps',asset:3,x:1340,y:455,w:165,h:201,box:[1280,430,120,25]},{id:'v11-chamber-sideboard',sheet:'medicalProps',asset:2,x:555,y:395,w:225,h:158,box:[465,375,180,20]});MAPS.chamber.blocks.push([1280,430,120,25],[465,375,180,20]);
 MAPS.chamber.ambientActors=[...(MAPS.chamber.ambientActors||[]),{id:'guest1',sprite:9,x:730,y:420,angle:1.3},{id:'guest2',sprite:6,x:815,y:445,angle:1.8},{id:'musician',sprite:3,x:760,y:800,angle:0}];
 const before=STAGING.scenes.ch2TargetBefore,after=STAGING.scenes.ch2TargetAfter;
 before.speaker_actor_per_line={0:'hester',1:'guard1',2:'hester',3:'dancer2',4:'hester',5:'dancer1',6:'hester',7:'dancer2',8:'hester',9:'victim1',10:'hester',11:'victim1',12:'hester',13:'guard1',14:'hester',15:'servant'};
 before.beats=[beat(0,[move('dancer1',880,750,.6),move('dancer2',977,730,.7)],{actorMeta:{dancer1:{idleAnimation:'dance'},dancer2:{idleAnimation:'dance'}}}),beat(3,[move('dancer1',875,770,.6)],{fall:{dancer1:.6},actorMeta:{dancer2:{idleAnimation:null}}}),beat(6,[move('guard2',940,785,.55),move('dancer1',890,763,.35,.55)],{fall:{dancer1:0},cue:'cloth'}),beat(7,[move('dancer1',882,780,.5),move('dancer2',933,730,.35)],{fall:{dancer1:.7},cue:'fall'}),beat(8,[move('dancer2',980,735,.6)],{actorMeta:{dancer2:{idleAnimation:'dance'}}}),beat(9,[],{faceTargets:{hester:'victim1',victim1:'hester'}}),beat(12,[move('victim1',520,670,.9),move('victim2',530,745,1),move('guard1',485,670,.65)],{faceTargets:{hester:'guard1'}}),beat(15,[move('servant',1108,573,.6)],{faceTargets:{servant:'hester',hester:'servant'},actorMeta:{servant:{pose:'tray'}}})];
 after.speaker_actor_per_line={0:'messenger',1:'hester',2:'messenger',3:'hester',4:'messenger',5:'hester',6:'servant',7:'hester',8:'servant',9:'hester',10:'servant',11:'dancer2',12:'hester'};
 after.actors.servant=[1110,575];after.actorMeta.dancer2.idleAnimation='dance';
 after.beats=[beat(0,[move('messenger',1285,650,.9)]),beat(4,[move('messenger',1390,800,1)]),beat(5,[],{cue:'wine_spill',faceTargets:{hester:'servant',servant:'hester'}}),beat(6,[move('servant',1140,581,.3)]),beat(7,[move('hester',1180,580,.65)],{cue:'slap',actorMeta:{hester:{gesture:'slap'},servant:{pose:'offbalance'}}}),beat(8,[move('servant',1100,610,.3)],{faceTargets:{servant:'hester'}}),beat(9,[move('servant',1050,658,.6)],{fall:{servant:1},cue:'tray',actorMeta:{hester:{gesture:'push'},servant:{standing:false}}}),beat(10,[],{actorMeta:{hester:{gesture:null}},faceTargets:{servant:'hester'}}),beat(11,[move('dancer2',980,670,.55)],{actorMeta:{dancer2:{idleAnimation:null}}}),beat(12,[move('dancer2',975,735,.65)],{actorMeta:{dancer2:{idleAnimation:'dance'}}})];
 after.outro={moves:[move('servant',1045,665,.8)],actorMeta:{servant:{pose:'collect_shards',standing:false,fall:.8}}};
 for(const st of [before,after]){st.noCG=true;st.commitActor=null;}
 const ench=MAPS.deepCamp.props.find(p=>p.id==='v11-deep-enchant');ench.art={sheet:'deepProps',index:0,w:195,h:196};
 const door=MAPS.deepSeal.props.find(p=>p.id==='v11-deep-seal');door.art={sheet:'deepProps',index:1,w:260,h:263};
 for(const id of ['deepCourt','deepBastion','deepCloister']){const objects=SCENERY[id];for(const o of objects.filter(o=>o.id.includes('light')))Object.assign(o,{sheet:'deepProps',asset:3,w:52,h:61});const o=objects.find(o=>o.id.includes('west-arch')||o.id.includes('banner-frame'));if(o)Object.assign(o,{sheet:'deepProps',asset:2,w:135,h:155});}
}
