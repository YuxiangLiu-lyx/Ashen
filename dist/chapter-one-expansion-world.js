import {C1_NEW_MAPS} from './chapter-one-expansion-data.js';
import {c1State} from './chapter-one-expansion-save.js';
export const C1_CONNECTIONS=[['hall','c1TrainingYard'],['c1TrainingYard','c1DrillGallery'],['c1DrillGallery','warehouse'],['workshop','c1LoomRoom'],['town','c1NorthWalk'],['c1NorthWalk','alley'],['grove','c1ReedKiln']];
export const C1_CHANGED_MAPS=['hall','warehouse','road','grove','millpath','echo','town','workshop','alley','canal','guestroom'];
const prop=(id,label,x,y,extra={})=>({id:'c1-'+id,label,x,y,type:'book',action:'c1:'+id,flat:true,geometryV26:false,collisionV281:false,...extra});
const door=(to,x,y,tx,ty,label)=>({to,x,y,tx,ty,label,c1Door:true,manualOnly:true});
const walls=[[0,0,1600,160],[0,1000,1600,80],[0,160,140,840],[1460,160,140,840]];
const npc=(id,name,x,y,sprite)=>({id,name,x,y,sprite,angle:Math.PI/2});
export function configureC1World({MAPS,SCENERY,BOUNDARIES}){
 const create=(id,name,sub,safe,blocks,props,npcs=[],spawns=[])=>{
  MAPS[id]={name,sub,atlas:'interior',cell:0,safe,worldV4:true,c1Expansion:true,doors:[],blocks:[...walls.map(b=>[...b]),...blocks],props,npcs,spawns};BOUNDARIES[id]=walls.map(b=>[...b]);SCENERY[id]=[];
 };
 create('c1TrainingYard','灰烛练武庭','旧伤复核 · 看清预警后再动手',true,[[370,260,190,65],[1050,270,200,65],[760,690,230,65]],
  [prop('record','练习记录／开始复核',370,520),prop('training-target','技能靶',900,480),prop('warning-target','预警靶',1150,680),prop('copper-test','铜圈试用架',530,770)],
  [npc('sister','薇蕾娜',320,460,1),npc('clerk','鲁恩',440,460,3),npc('steward','奥伦',400,810,2)]);
 create('c1DrillGallery','旧试炼廊','上方掩体与下方巡查道，均通向库房便门',true,[[640,390,190,80],[640,660,190,80],[1080,510,150,65]],
  [prop('drill-start','警铃线路图／演练负重',330,550),prop('alarm-cut','沿线断开铃线',530,400),prop('drill-cover','掩体背面的标记',890,340),prop('drill-detour','巡查道的盲角',950,840),prop('drill-exit','放下负重／开便门',1290,800)]);
 create('c1LoomRoom','缀纹工坊','西侧符文柜 · 中央试织台 · 东侧样本架',true,[[280,275,210,65],[690,400,210,65],[1130,310,220,75]],
  [prop('loom','缀纹机／预览与制作',780,520,{type:'book'}),prop('rune-board','受潮纹路记录',360,620),prop('kiln-plan','旧窑通风图',410,800),prop('sample-tray','样本鉴定台',1190,560)],
  [npc('c1rosa','罗萨',400,480,4),npc('c1saido','赛铎',1170,460,11)]);
 create('c1NorthWalk','北渠检修道','水沿北槽东流；先泄压，再放踏板',false,[[670,160,150,240],[670,620,150,380],[1050,300,160,60]],
  [prop('water-sign','水痕与排水箭头',330,730),prop('pressure','上游泄压阀',500,420),prop('plank','检修踏板绞盘',590,560),prop('mark','东岸撤路记号',1120,800),prop('north-lamp','北渠灯路',1270,590),prop('wet-a','受潮符片节点甲',330,430),prop('wet-b','受潮符片节点乙',1120,680),prop('leak','漏压接头',1030,470)],[],[['rat',470,570,'c1-valve-rat'],['bat',1220,740,'c1-valve-bat']]);
 create('c1ReedKiln','苇湾废窑','上游进风 · 顶部排烟 · 窑柱后的夜翼巢',false,[[670,320,90,115],[670,670,90,115],[1110,210,180,60]],
  [prop('kiln-intake','下层进风口',430,780),prop('kiln-exhaust','高处排烟绳',880,350),prop('kiln-node','失控纹路与翼尘',1220,800),prop('kiln-ladder','返程短梯',320,420),prop('patrol-kiln','通风巡检接头',950,730)],[],[['bat',700,540,'c1-kiln-bat-a'],['bat',920,780,'c1-kiln-bat-b']]);
 const join=(a,b,ax,ay,bx,by)=>{MAPS[a].doors.push(door(b,ax,ay,bx,by,MAPS[b].name));MAPS[b].doors.push(door(a,bx,by,ax,ay,MAPS[a].name));};
 join('hall','c1TrainingYard',235,560,220,820);
 join('c1TrainingYard','c1DrillGallery',1330,850,230,830);
 join('c1DrillGallery','warehouse',1320,850,235,730);
 join('workshop','c1LoomRoom',1280,740,230,850);
 join('town','c1NorthWalk',1100,300,230,850);
 join('c1NorthWalk','alley',1340,850,480,790);
 join('grove','c1ReedKiln',1300,540,230,870);
 const add=(map,...props)=>MAPS[map].props.push(...props);
 add('warehouse',prop('wall-hole','墙脚漏口',1050,320),prop('board','松落的挡板',850,730),prop('wall-seal','扶正挡板并封墙',1060,380),prop('lamp-left','左灯：检查垫片',360,680),prop('lamp-right','右灯：检查垫片',1220,680),prop('lamp-valve','关阀换垫',1200,740),prop('lamp-light','点灯验证',1230,790));
 add('guestroom',prop('kettle','炉边水壶',550,650));
 add('road',prop('road-sign','破损路牌',500,540),prop('cart','断轴车与拖痕',1020,590),prop('route-mark','安全路线标记',1180,595),prop('cloth','断车布片',1090,680),prop('mud','岔路两组泥迹',930,740),prop('shelter','城门外车棚／天亮进城',1320,540),prop('patrol-road','投递线受潮接头',620,560));
 add('millpath',prop('transmission','断裂传动架',460,540),prop('patrol-mill','磨坊线路开关',1010,650));
 add('grove',prop('healthy','比较健康与污染植株',470,760),prop('branch','移开药圃倒枝',470,690),prop('name','辨认松石下的刻名',1250,380),prop('patrol-grove','溪岸通风接头',1050,730));
 add('town',prop('cloth-rack','朵莉的外侧衣架',640,820),prop('duty-book','北门维护值班簿',1030,430),prop('entry-rule','礼拜入口与午钟封门牌',930,290),prop('lamp-west','西街灯路',590,760),prop('lamp-east','东街灯路',1050,750));
 add('canal',prop('sluice','东闸绞盘',1270,750),prop('hideout','闸后藏身处',1320,860));
 // Scene props share a footprint with their physical machine; reachable actions
 // sit on its working side. Decorative sprites never create invisible obstacles.
 for(const id of C1_NEW_MAPS){const m=MAPS[id];for(let i=4;i<m.blocks.length;i++){const b=m.blocks[i];
   // The long north-channel solids are water, painted by c1Ground, not furniture.
   if(id==='c1NorthWalk'&&i<6)continue;
   const kind=id==='c1ReedKiln'?'kiln-pier':id==='c1DrillGallery'?'stone-cover':id==='c1TrainingYard'?'training-rack':'workbench';
   SCENERY[id].push({id:'c1-solid-'+i,c1Scenery:kind,sheet:'chapterUtilities',asset:1,x:b[0]+b[2]/2,y:b[1]+b[3],w:b[2],h:b[3]+55,box:b,collisionV281:false});}
  for(const d of m.doors)SCENERY[id].push({id:'c1-door-'+d.to,sheet:'chapterArchitecture',asset:3,x:d.x,y:d.y+6,w:125,h:135,geometryV26:false,collisionV281:false});
 }

}
export function installC1World(RPG){
 const P=RPG.prototype,blocked=P.blocked,line=P.clearLine,enter=P.enter;
 P.blocked=function(x,y,...args){if(this.map==='c1ReedKiln'&&!c1State(this).worldChanges.kilnLadder&&x>155&&x<355&&y>615&&y<680)return true;if(this.map==='c1NorthWalk'&&!c1State(this).worldChanges.plank&&x>655&&x<835&&y>395&&y<625)return true;return blocked.call(this,x,y,...args);};
 P.clearLine=function(a,b,...args){if(this.map==='c1ReedKiln'&&!c1State(this).worldChanges.kilnLadder){for(let t=0;t<=1;t+=.025)if(a.x+(b.x-a.x)*t>155&&a.x+(b.x-a.x)*t<355&&a.y+(b.y-a.y)*t>615&&a.y+(b.y-a.y)*t<680)return false;}if(this.map==='c1NorthWalk'&&!c1State(this).worldChanges.plank){for(let t=0;t<=1;t+=.025)if(a.x+(b.x-a.x)*t>655&&a.x+(b.x-a.x)*t<835&&a.y+(b.y-a.y)*t>395&&a.y+(b.y-a.y)*t<625)return false;}return line.call(this,a,b,...args);};
 P.enter=function(...args){this.c1EndTraining?.();return enter.apply(this,args);};
 P.c1AtService=function(which){if(this.map!=='c1LoomRoom'||this.p.hp<=0||this.enemies.some(e=>!e.dead))return false;const at=which==='loom'?{x:780,y:520}:which==='rosa'?{x:400,y:480}:{x:1170,y:460};return Math.hypot(this.p.x-at.x,this.p.y-at.y)<150&&this.clearLine(this.p,at,false);};
}
