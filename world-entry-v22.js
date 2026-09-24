// Reconstructed V21/V22 behaviour from the published V20 baseline and user requests.
// This module is not an assertion of byte-identical recovery of the original release.
import {DIALOGUES,MAPS} from './data-v14.js';
import {STAGING} from './staging-v14.js';
import {CHAPTER_STAGING} from './chapter-staging-v14.js';
import {CINEMATIC_SCENES} from './cinematics-v14.js';
import {CITY_ARCHITECTURE_META_V19 as architecture,CITY_FURNISHINGS_META_V19 as furnishings} from './world-art-meta-v19.js';
const copy=v=>structuredClone(v),ID='v22CityArrival',ACTION='v22arrival:complete:';
const fresh=()=>({schema:1,completed:false,active:false,token:0});
const state=g=>g.arrivalV22||(g.arrivalV22=fresh());
export const CITY_ARRIVAL_LINES_V22=[
 ['旁白','铜门后是一条宽阔的石街。两侧的窗都亮着，玻璃穹顶下还有一排花树。艾莉娅走过门洞，脚步慢了下来。'],
 ['艾莉娅','这里……竟然还有这么大一座城。'],
 ['诺恩','从外面看不出来。'],
 ['旁白','一辆装着鲜花的手推车从回廊出来。诺恩往边上让了让，艾莉娅却还望着楼上的长窗，过了一会儿才跟上。'],
 ['艾莉娅','你看那扇窗。里面好像有人在弹琴。'],
 ['诺恩','听见了。刚才门外也有一点。'],
 ['艾莉娅','我还以为是风。一路走过来，除了脚步声，就只顾着听后面有没有东西追上来。'],
 ['旁白','铜灯下面有人提着热面包经过。艾莉娅不自觉地看了一眼，又低头摸了摸已经瘪下去的干粮袋。'],
 ['诺恩','饿了？'],
 ['艾莉娅','有一点。刚才还不觉得，闻到才想起来。'],
 ['诺恩','进去找找。应该有卖吃的地方。'],
 ['旁白','他说完，又回头看向铜门。门外那片刺眼的白光已经被石壁挡住，他的手却仍搭在刀鞘旁。'],
 ['艾莉娅','还在想断桥上的事吗？'],
 ['诺恩','得想办法出去。'],
 ['艾莉娅','我知道。可是你肩上的伤还没好，我的脚也走得有些疼了。今天先歇一歇，好不好？'],
 ['诺恩','找个地方坐。'],
 ['艾莉娅','不是坐一小会儿，等我站起来，你就又去试那座桥。'],
 ['旁白','诺恩看向她。艾莉娅把干粮袋收好，声音仍然很轻，却没有躲开他的目光。'],
 ['艾莉娅','你不用现在就把所有事情都想明白。我们先吃顿热的，睡一觉，再看看这里能做些什么。'],
 ['诺恩','这里也未必安全。'],
 ['艾莉娅','那就先看看。我会跟着你，也会留意周围。总不能只有你一个人一直撑着。'],
 ['旁白','她说完，抬手理了理被行囊压皱的衣领。诺恩这才发觉，两人的靴边都沾着厚厚的灰，站在干净的石路上格外显眼。'],
 ['诺恩','先把鞋上的灰拍掉。进店别弄脏人家的地。'],
 ['艾莉娅','你也是。你左边那只还更多一点。'],
 ['旁白','他低头看了看，走到路边拍落靴上的浮灰。艾莉娅也扶着石栏整理好鞋带，再直起身时，眉间终于松快了一些。'],
 ['艾莉娅','走吧。刚才那股面包香，我现在还闻得到。'],
 ['诺恩','慢点走，前面有台阶。'],
 ['旁白','艾莉娅点点头，与他一起往灯火深处走去。远处又换了一支曲子，铜门外的风声渐渐听不见了。']
];
const move=(actor,x,y,duration=.9)=>[actor,x,y,duration];
const beat=(line,moves=[],hold=0,faceTargets)=>({line,moves,hold,...(faceTargets?{faceTargets}:{})});
function installScene(){
 DIALOGUES[ID]=copy(CITY_ARRIVAL_LINES_V22);
 const stage={map:'ch5CityGate',actors:{hero:[800,620],saint:[875,630]},actorMeta:{hero:{renderAs:'hero',pose:'stand',socialV20:true,hideWeapon:true},saint:{sprite:0,pose:'stand',socialV20:true,hideWeapon:true}},initiallyHidden:[],socialV20:true,commitActor:'hero',focus:[840,575],faceTargets:{hero:'saint',saint:'hero'},beats:[
 beat(0,[],.55),beat(3,[move('hero',855,690),move('saint',930,710,1)]),
 beat(7,[],.45),beat(11,[],.55,{hero:[800,300],saint:'hero'}),
 beat(17,[],.6,{hero:'saint',saint:'hero'}),beat(21,[],.5),
 beat(24,[move('hero',925,735),move('saint',1000,750,1)]),
 beat(27,[move('hero',1110,740,1.25),move('saint',1190,765,1.35)])]};
 STAGING.scenes[ID]=CHAPTER_STAGING[ID]=stage;CINEMATIC_SCENES.add(ID);
}
export function validateArrivalSaveV22(save){
 const s=save?.arrivalV22,p=save?.pending;
 if(s===undefined){if(p?.id===ID)throw Error('城门休憩剧情缺少续播记录。');return;}
 const bad=()=>{throw Error('城门休憩记录不完整。');};
 if(!s||typeof s!=='object'||Array.isArray(s)||s.schema!==1||typeof s.completed!=='boolean'||typeof s.active!=='boolean'||!Number.isInteger(s.token)||s.token<0||s.token>1||Object.keys(s).some(k=>!['schema','completed','active','token'].includes(k)))bad();
 if(s.completed&&(s.active||s.token!==1)||s.active&&(s.completed||s.token!==1)||!s.completed&&!s.active&&s.token!==0)bad();
 if(s.active){if(p?.id!==ID||p.then!==ACTION+s.token||save.map!=='ch5CityGate'||save.memoryV13||!save.flags?.ch5CitySeen)bad();}
 else if(p?.id===ID)bad();
}
export function installArrivalV22(RPG){
 const P=RPG.prototype;if(P._arrivalV22Installed)return;installScene();Object.defineProperty(P,'_arrivalV22Installed',{value:true});
 const old={};for(const k of ['restore','snapshot','enter','apply','update','beginPrivateMemory'])old[k]=P[k];
 const eligible=g=>g.map==='ch5CityGate'&&g.flags.ch5CitySeen&&g.p.cls!=='saint'&&g.p.hp>0&&!g.memoryV13?.active;
 const quiet=g=>eligible(g)&&g.active&&!g.pending&&!g.transition&&g.portCD<=0&&!g.enemies.some(e=>!e.dead)&&!g.romanceV20?.active&&!g.saintStoryV18?.active&&!g.saintStoryV18?.resting&&!g.saintBondV17?.active&&!g.cityStoriesV18?.active&&!g.discoveryBusyV19?.()&&!g.hellExpeditionsV18?.run;
 const arm=g=>{g._arrivalQueuedV22=g.map==='ch5CityGate'&&!state(g).completed&&!state(g).active;};
 P.startArrivalV22=function(){const s=state(this);if(!quiet(this)||s.completed||s.active)return false;s.active=true;s.token=1;this._arrivalQueuedV22=false;const origin={hero:[this.p.x,this.p.y],saint:[this.saint.x,this.saint.y]};this.beginScene(ID,ACTION+s.token);this.pending.sceneOrigin=origin;this.saveEvent();return true;};
 P.restore=function(saved){validateArrivalSaveV22(saved);old.restore.call(this,saved);this.arrivalV22=saved.arrivalV22?copy(saved.arrivalV22):fresh();arm(this);};
 P.snapshot=function(){return {...old.snapshot.call(this),arrivalV22:copy(this.memoryV13?.active?(this.memoryV13.reality.arrivalV22||fresh()):state(this))};};
 P.enter=function(id,x,y){old.enter.call(this,id,x,y);if(this.map===id)arm(this);};
 P.apply=function(action){const id=typeof action==='string'?action:action?.id;if(!id?.startsWith(ACTION))return old.apply.call(this,action);const s=state(this);if(!s.active||s.completed||this.pending||id!==ACTION+s.token||!eligible(this))return false;s.active=false;s.completed=true;this._arrivalQueuedV22=false;this.active=true;this.saveEvent();return true;};
 P.beginPrivateMemory=function(){if(state(this).active)return false;const s=copy(state(this)),ok=old.beginPrivateMemory.call(this);if(ok&&this.memoryV13?.active)this.memoryV13.reality.arrivalV22=s;return ok;};
 P.update=function(dt,input){old.update.call(this,dt,input);if(Number.isFinite(dt)&&dt>0&&this._arrivalQueuedV22&&quiet(this))this.startArrivalV22();};
}
const frame=(id,sheet,asset,x,y,w,box)=>{const meta=sheet==='cityArchitectureV19'?architecture[asset]:furnishings[asset];return {id:'v22-entry-'+id,sheet,asset,x,y,w,h:w*meta.sourceRect[3]/meta.sourceRect[2],flat:true,box:box||null};};
export const ENTRY_SCENERY_V22=[
 frame('west-guild','cityArchitectureV19',1,225,565,235,[170,546,112,18]),
 frame('east-house','cityArchitectureV19',1,1370,545,225,[1318,527,108,18]),
 frame('south-bar','cityArchitectureV19',2,1210,925,235,[1135,905,150,18]),
 frame('cloth-stall','cityArchitectureV19',5,620,915,210,[553,896,135,18]),
 frame('west-flowers','cityFurnishingsV19',5,385,595,150,[340,579,90,14]),
 frame('east-flowers','cityFurnishingsV19',5,1220,605,148,[1175,590,90,13]),
 frame('west-roses','cityFurnishingsV19',7,385,425,115,[350,413,70,12]),
 frame('east-roses','cityFurnishingsV19',7,1205,420,115,[1170,408,70,12]),
 frame('west-treebed','cityFurnishingsV19',7,215,795,115,[180,783,70,12]),
 frame('east-treebed','cityFurnishingsV19',7,1390,850,112,[1355,838,70,12]),
 frame('south-roses','cityFurnishingsV19',7,995,925,112,[960,913,70,12]),
 frame('north-roses','cityFurnishingsV19',7,545,250,100,[515,238,60,12]),
 frame('east-north-roses','cityFurnishingsV19',7,1070,255,100,[1040,243,60,12]),
 frame('west-lantern','cityFurnishingsV19',4,445,535,47,[437,524,16,10]),
 frame('east-lantern','cityFurnishingsV19',4,1150,545,47,[1142,534,16,10]),
 frame('south-lantern','cityFurnishingsV19',4,755,885,45,[747,874,16,10]),
 frame('east-south-lantern','cityFurnishingsV19',4,1320,875,45,[1312,864,16,10]),
 frame('west-bench','cityFurnishingsV19',6,320,755,150,[277,741,86,13]),
 frame('west-rail','cityFurnishingsV19',2,485,835,135,[443,822,84,12]),
 frame('east-rail','cityFurnishingsV19',2,1190,835,135,[1148,822,84,12])
];
export const ENTRY_RESIDENTS_V22=[
 {id:'v22-entry-vendor',x:440,y:655,sprite:6,angle:-2.6},
 {id:'v22-entry-buyer',x:510,y:680,sprite:3,angle:-2.8},
 {id:'v22-entry-reader',x:985,y:485,sprite:8,angle:-.4},
 {id:'v22-entry-window-guest',x:1290,y:640,sprite:5,angle:-1.7},
 {id:'v22-entry-florist',x:600,y:845,sprite:10,angle:.6},
 {id:'v22-entry-porter',x:1315,y:790,sprite:9,angle:2.7}
].map(a=>({...a,name:'',nonInteractive:true,mapMarker:false}));
export function installEntryWorldV22({MAPS,SCENERY,CH5_SCENERY,CH5_GROUND_STYLE,V11_GROUND_STYLE}){
 const map=MAPS.ch5CityGate;if(!map||map.entryArtV22)return;map.entryArtV22=true;
 SCENERY.ch5CityGate.push(...copy(ENTRY_SCENERY_V22));map.blocks.push(...ENTRY_SCENERY_V22.filter(o=>o.box).map(o=>copy(o.box)));map.ambientActors.push(...copy(ENTRY_RESIDENTS_V22));
 // Existing gate pillars stay at their original coordinates. The complete central
 // lanes x=750/800/850, y=290..610 and the eastward main street remain untouched.
 const style={sheet:'terrain',base:0,paths:[{asset:12,width:185,points:[[800,150],[800,500],[800,720],[1470,700]]},{asset:12,width:125,points:[[405,630],[800,685],[1220,675]]}],patches:[]};
 V11_GROUND_STYLE.ch5CityGate=copy(style);CH5_GROUND_STYLE.ch5CityGate=copy(style);CH5_SCENERY.ch5CityGate=copy(SCENERY.ch5CityGate);
 map.sub='铜门内，花摊沿着白石路摆开。楼上的琴声越过灯架，混着面包和夜风的香气。';
}
