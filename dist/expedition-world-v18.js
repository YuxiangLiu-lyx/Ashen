import {MAPS} from './data-v14.js';
import {SCENERY} from './world-v14.js';
import {V11_GROUND_STYLE} from './chapter34-world-v14.js';
import {CH5_MAPS,CH5_SCENERY,CH5_GROUND_STYLE,CH5_VISUAL_FAMILIES} from './chapter5-world-v14.js';
import {V11_DEEP_ENEMY_PROFILES} from './combat-data-v14.js';
import {WORLD_ADDITIONS} from './exploration-v14.js';

const copy=x=>JSON.parse(JSON.stringify(x));
const node=(name,theme,mode,packs,objective)=>({name,theme,mode,packs,objective});
// Only non-boss encounter groups are tuned here. The existing trial guardian is
// referenced by its original type, without modifying its profile or action data.
export const EXPEDITIONS_V18={
 breach:{id:'breach',legacy:15,key:'breach',name:'裂灯巡猎',difficulty:1,label:'普通',tone:'巡灯记录、合用的装备与封存报酬',nodes:[
  node('失灯外堤','floodgate','signal',[['guard','hound'],['archer','guard']],'找出两处断线，重新点亮信号灯。'),
  node('折桥哨道','bridge','signal',[['guard','archer'],['hound','guard','archer']],'绕过断桥，从两侧接通信号。'),
  node('暮钟站台','bells','signal',[['guard','hound','archer'],['elite','guard']],'点亮最后的巡灯台，带回记录。')]},
 salvage:{id:'salvage',legacy:15,key:'salvage',name:'矿庭深采',difficulty:2,label:'进阶',tone:'矿材、旧装备与密封矿匣',branch:true,nodes:[
  node('弃轨场','rails','mine',[['guard','archer'],['hound','guard']],'开启排风阀，采出矿层样本。'),
  node('三岔矿腹','crystal','mine',[['elite','hound'],['guard','archer','hound']],'处理主矿脉；北边还有一条没记在图上的支洞。'),
  node('熔脉库','furnace','mine',[['elite','guard','archer'],['elite','hound']],'采下最后的矿样，再挑一只封匣。')]},
 deathmatch:{id:'deathmatch',legacy:15,key:'deathmatch',name:'无赎回廊',difficulty:3,label:'挑战',tone:'角斗凭证、战具与封缄报酬',branch:true,nodes:[
  node('角斗报名廊','arena','arena',[['elite','guard','archer'],['guard','hound','archer']],'扳下角斗闸，赢下两组对手。'),
  node('断阶斗庭','bridge','arena',[['elite','hound','archer'],['elite','guard','archer']],'穿过两侧战台；休整台与加赛支廊只能选一边。'),
  node('悬灯终庭','bells','arena',[['elite','guard','archer'],['elite','elite','hound']],'应付最后两组夹击，敲响终场钟。')]},
 trial:{id:'trial',legacy:15,key:'trial',name:'三灯登阶',difficulty:3,label:'挑战',tone:'守灯者留下的心得与遗物',nodes:[
  node('沉光阶廊','bells','sequence',[['elite','guard'],['archer','hound','guard']],'按灯光的指引接通三座灯柱。'),
  node('逆风灯庭','storm','sequence',[['elite','guard','archer'],['elite','hound']],'在落雷预警之间重接灯链。'),
  node('三灯高台','astral','guardian',[['champion']], '在原守灯像的攻势中站稳，再点亮最后的灯。')]},
 escort:{id:'escort',legacy:17,key:'escort',name:'灯河护送',difficulty:1,label:'普通',tone:'工坊报酬、护具与旅途拾遗',nodes:[
  node('工坊外堤','floodgate','escort',[['guard','hound'],['archer','guard']],'开启水闸，护送灯舟经过外堤。'),
  node('折桥水闸','bridge','escort',[['guard','archer'],['hound','guard','archer']],'让灯舟穿过折桥下的水闸。'),
  node('灯舟泊地','harbour','escort',[['guard','hound'],['guard','archer','hound']],'把最后一段灯火送到泊地。')]},
 calibration:{id:'calibration',legacy:17,key:'calibration',name:'风暴回路',difficulty:2,label:'进阶',tone:'回路零件、行装与未拆封的谢礼',nodes:[
  node('风琴机房','storm','sequence',[['guard','archer'],['hound','guard']],'先清除干扰，再按亮起的灯柱接通回路。'),
  node('雷痕廊桥','bridge','sequence',[['elite','archer'],['guard','hound','archer']],'穿过预警中的雷痕，继续接通回路。'),
  node('星镜阵台','astral','sequence',[['elite','guard'],['elite','archer','hound']],'把最后三段回路引向星镜。')]},
 mining:{id:'mining',legacy:17,key:'salvage',name:'余烬远掘',difficulty:2,label:'进阶',tone:'矿样、补给与埋藏的旧物',branch:true,nodes:[
  node('冷炉运矿道','rails','mine',[['guard','hound'],['archer','guard']],'开动排风机，取得第一批矿样。'),
  node('红晶裂谷','crystal','mine',[['elite','hound'],['guard','archer','hound']],'在矿火间采样；侧洞的回声似乎有些特别。'),
  node('灰烬藏窟','furnace','mine',[['elite','guard','archer'],['elite','hound']],'从深处带回矿样，再决定打开哪只封匣。')]}
};
export const expeditionMapV18=(id,index)=>'ch5V18_'+id+'_'+index;
export const expeditionMapInfoV18=map=>{const m=/^ch5V18_([a-z]+)_([0-3])$/.exec(map||'');return m&&EXPEDITIONS_V18[m[1]]?{id:m[1],index:Number(m[2])}:null;};
const obj=(map,id,verb,label,x,y,asset=5,sheet='cityWorld')=>({id:map+'-'+id,action:'v18exp:'+verb,label,x,y,interactX:x,interactY:y+56,art:{sheet,index:asset,w:80,h:110},box:[x-22,y-16,44,18]});
function geometry(theme,index){
 const border=[[0,0,1600,150],[0,965,1600,115],[0,150,130,815],[1470,150,130,815]];
 const shapes={
 floodgate:[[610,150,150,345],[610,740,150,225],[1100,150,120,325]],
 bridge:[[570,150,390,235],[570,715,390,250],[990,385,110,80]],
 bells:[[540,380,135,160],[975,625,140,150]],
 rails:[[470,430,180,100],[880,655,310,110]],
 crystal:[[520,330,190,180],[870,665,160,145],[1180,300,160,95]],
 furnace:[[520,325,120,320],[960,640,240,100]],
 arena:[[555,360,90,90],[1000,715,100,110]],
 storm:[[590,300,230,125],[1000,650,130,150]],
 astral:[[480,350,130,155],[920,680,150,140]],
 harbour:[[470,350,180,120],[880,710,350,95]]};
 return [...border,...(shapes[theme]||shapes.bells)];
}
export function registerExpeditionWorldV18(){
 for(const [role,base]of Object.entries({guard:'ch5V15-guard',hound:'ch5V15-hound',archer:'ch5V15-archer',elite:'ch5V15-elite'}))for(let tier=1;tier<=3;tier++){
  const b=V11_DEEP_ENEMY_PROFILES[base],id='ch5V18-'+tier+'-'+role;
  // Narrow encounter scaling, never a boss profile. Difficulty also comes from
  // separated encounters, mechanism pressure, geometry and limited recovery.
  const factor=[0,.78,2.1,2.7][tier];V11_DEEP_ENEMY_PROFILES[id]={...b,hp:Math.round(b.hp*factor),damage:Math.round(b.damage*[0,.82,1.7,2.1][tier]),cooldown:[0,1.9,1.65,1.55][tier],...(b.specialDamageOverride?{specialDamageOverride:Math.round(b.specialDamageOverride*[0,1,1.7,2.1][tier])}:{}),aggro:520,leash:1500,isBoss:false};
  CH5_VISUAL_FAMILIES[id]=b.visualFamily;WORLD_ADDITIONS.idleAI[id]={radius:35,pause:[.8,1.5],speed:25};
 }
 for(const a of Object.values(EXPEDITIONS_V18))for(let i=0;i<(a.branch?4:3);i++){
  const n=i===3?node(a.id==='deathmatch'?'静默加赛廊':'无人支洞',a.id==='deathmatch'?'arena':'crystal','branch',[['elite','archer'],['elite','hound']],'这条支路没有巡灯。打退守卫后检查尽头的旧箱。'):a.nodes[i],map=expeditionMapV18(a.id,i),props=[];
  if(n.mode==='signal'){props.push(obj(map,'left','switch:0','断线灯座',430,670),obj(map,'right','switch:1','巡灯信标',1260,530));}
  if(n.mode==='sequence'){for(let j=0;j<3;j++)props.push(obj(map,'lamp'+j,'sequence:'+j,['铜灯','青灯','白灯'][j],[420,820,1180][j],[620,450,520][j]));}
  if(n.mode==='mine'){props.push(obj(map,'fan','fan','旧排风阀',340,700,4),obj(map,'ore0','ore:0','左侧矿脉',790,540,4,'hellWorld'),obj(map,'ore1','ore:1','深处矿脉',1220,420,4,'hellWorld'));}
  if(n.mode==='escort'){props.push(obj(map,'gate','switch:0','水闸绞盘',390,650,11,'hellWorld'),{...obj(map,'cart','cart','送灯舟',340,800,0,'hellProps'),box:undefined,interactY:800});}
  if(n.mode==='arena')props.push(obj(map,'bell','switch:0','开场铜钟',400,610,1,'hellProps'),obj(map,'endbell','switch:1','终场铜钟',1250,460,1,'hellProps'));
  if(n.mode==='guardian')props.push(obj(map,'seal','switch:0','最后的试炼灯',1190,410));
  if(n.mode==='branch')props.push(obj(map,'cache','branchcache','裂封旧箱',1210,430,12,'world'));
  if(i===1){props.push(obj(map,'camp','camp','应急热汤',330,850,8));if(a.branch)props.push(obj(map,'branchsign','branchsign','支道标记',1380,235,15,'world'));}
  if(i===2)for(let j=0;j<3;j++)props.push(obj(map,'reward'+j,'finish:'+j,['缠绳匣','铜扣匣','布封匣'][j],[1120,1250,1380][j],790,12,'world'));
  for(const p of props){if(p.action==='v18exp:cart')p.art={...p.art,w:128,h:118};if(p.action==='v18exp:camp')p.art={...p.art,w:125,h:90};if(p.art.sheet==='world'&&p.art.index===12)p.art={...p.art,w:86,h:75};}
  const doors=[{x:175,y:845,to:i===0?'ch5Forge':expeditionMapV18(a.id,i===3?1:i-1),tx:i===0?1080:1350,ty:i===0?870:820,label:i===0?'撤回工坊':i===3?'返回主路':'回到上一段',direction:'西',manualOnly:true,gate:'v18exp:back'}];
  if(i===2)doors.push({x:1400,y:900,to:'ch5Forge',tx:1080,ty:870,label:'沿返程栈道回工坊',direction:'东南',manualOnly:true,gate:'v18exp:return'});
  if(i<2)doors.push({x:1400,y:850,to:expeditionMapV18(a.id,i+1),tx:235,ty:845,label:'前往 '+a.nodes[i+1].name,direction:'东',manualOnly:true,gate:'v18exp:next'});
  if(i===1&&a.branch)doors.push({x:1390,y:315,to:expeditionMapV18(a.id,3),tx:235,ty:845,label:'循着支道标记深入',direction:'北',manualOnly:true,gate:'v18exp:branch'});
  const decor=[{id:map+'-beacon0',sheet:'cityWorld',asset:5,x:235,y:240,w:75,h:150,box:[217,222,36,20]},{id:map+'-beacon1',sheet:'cityWorld',asset:5,x:1380,y:225,w:80,h:160,box:[1360,205,40,20]}];
  const m={name:n.name,sub:a.name+' · '+a.label+' · '+n.objective,chapterRegion:5,floor:'stone',width:1600,height:1080,entry:[235,845],doors,npcs:[],props,spawns:[],blocks:[...geometry(n.theme,i),...props.filter(p=>p.box).map(p=>p.box),...decor.map(p=>p.box)],scenery:decor,v18Music:['mine','branch'].includes(n.mode)?'ash':['escort','signal'].includes(n.mode)?'road':'tension',expeditionV18:{id:a.id,index:i,theme:n.theme,mode:n.mode,difficulty:a.difficulty}};
  MAPS[map]=copy(m);CH5_MAPS[map]=copy(m);SCENERY[map]=copy(decor);CH5_SCENERY[map]=copy(decor);
  const ground={sheet:'cityGround',base:['rails','crystal','furnace'].includes(n.theme)?3:1,paths:[{asset:1,width:150,points:[[180,845],[400,820],[820,550],[1250,550],[1400,845]]}],patches:[]};V11_GROUND_STYLE[map]=copy(ground);CH5_GROUND_STYLE[map]=copy(ground);
 }
}
