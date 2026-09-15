import {DIALOGUES} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {CITY_MOMENTS_SCENES_V24} from './city-moments-text-v24.js';
const clone=x=>structuredClone(x),mutual={hero:'saint',saint:'hero'};
const move=(id,x,y,duration=.85,arrival)=>[id,x,y,duration,0,...(arrival?[arrival]:[])];
const both=(hx,hy,sx,sy,duration=1)=>[move('hero',hx,hy,duration),move('saint',sx,sy,duration+.1)];
const beat=(line,moves=[],hold=.35,faceTargets=mutual,actorMeta={})=>({line,moves,hold,faceTargets,actorMeta});
const base=(map,hero,saint,extra={})=>({map,actors:{hero,saint},actorMeta:{hero:{renderAs:'hero',pose:'stand',socialV20:true,hideWeapon:true},saint:{sprite:0,pose:'stand',socialV20:true,hideWeapon:true}},initiallyHidden:[],socialV20:true,commitActor:'hero',focus:[(hero[0]+saint[0])/2,(hero[1]+saint[1])/2-45],faceTargets:clone(mutual),...extra});
export function installCityMomentsStagingV24(){
 Object.assign(DIALOGUES,clone(CITY_MOMENTS_SCENES_V24));
 const scenes={
  v24MomentFountainA:{...base('ch5GrandSquare',[665,665],[755,680]),beats:[beat(0),beat(4,both(740,615,825,625),.5,{hero:[805,390],saint:[805,390]}),beat(9,[],.35),beat(14,[],.65,{hero:[405,445],saint:[405,445]}),beat(18,[],.45),beat(21,both(945,635,1030,650,1.4),.5,{hero:[405,445],saint:[405,445]})]},
  v24MomentFountainB:{...base('ch5GrandSquare',[945,635],[1030,650]),beats:[beat(0,[],.5,{hero:[405,445],saint:[405,445]}),beat(9,[],.65,{hero:[405,445],saint:[405,445]}),beat(14,[],.7),beat(15,both(1140,680,1220,695,1.3),.5,{hero:'saint',saint:[1210,210]}),beat(22,both(1155,690,1235,705),.5,{hero:[1210,210],saint:[1210,210]}),beat(23,both(1240,730,1325,740),.4)]},
  v24MomentBookA:{...base('ch5Market',[650,535],[745,550]),beats:[beat(0),beat(4,both(650,475,740,480),.5,{hero:[700,395],saint:[700,395]}),beat(12,[],.7,{hero:[700,395],saint:[700,395]}),beat(19,[],.6),beat(23,[],.8,{hero:[700,395],saint:[700,395]})]},
  v24MomentBookB:{...base('ch5Market',[650,475],[740,480]),beats:[beat(0,[],.55,{hero:[700,395],saint:[700,395]}),beat(6,[],.35),beat(10,[],.65),beat(12,both(900,625,990,630,1.5),.45),beat(14,[],.7),beat(18,[],.5,{hero:[1100,240],saint:[1100,240]}),beat(22,both(910,700,1000,710),.6),beat(23,both(885,760,970,775),.3)]},
  v24MomentLampA:{...base('ch5Forge',[490,715],[580,720]),beats:[beat(0),beat(4,both(515,665,610,670),.55,{hero:[565,600],saint:[565,600]}),beat(11,[],.75,{hero:[565,600],saint:[565,600]}),beat(17,[],.6),beat(21,both(530,745,625,750),.45),beat(23,[],.25)]},
  v24MomentLampB:{...base('ch5Forge',[530,745],[625,750]),beats:[beat(0,[],.7,mutual,{saint:{pose:'hold-lantern'}}),beat(3,[],.65),beat(6,[],.5),beat(11,[],.65),beat(13,both(760,720,845,735,1.3),.6,{hero:[855,620],saint:[855,620]},{saint:{pose:'stand'}}),beat(16,[],.8,{hero:[855,620],saint:[855,620]}),beat(22,both(775,825,855,835),.4),beat(23,[],.25)]}
 };
 // The same actual service identities are present; never render a random villager
 // while its established portrait is speaking. They stand on clear floor.
 for(const id of ['v24MomentBookA','v24MomentBookB']){
  scenes[id].actors.ch5Merchant=[835,405];scenes[id].actorMeta.ch5Merchant={sprite:5,pose:'stand'};scenes[id].faceTargets.ch5Merchant='hero';
 }
 for(const id of ['v24MomentLampA','v24MomentLampB']){
  scenes[id].actors.ch5Smith=id.endsWith('A')?[690,580]:[690,705];scenes[id].actorMeta.ch5Smith={sprite:11,pose:'stand'};scenes[id].faceTargets.ch5Smith='hero';
 }
 scenes.v24MomentLampA.beats.find(b=>b.line===21).moves.push(move('ch5Smith',690,705,1.3));
 for(const [id,s]of Object.entries(scenes)){STAGING.scenes[id]=CHAPTER_STAGING[id]=s;CINEMATIC_SCENES.add(id);}
}
