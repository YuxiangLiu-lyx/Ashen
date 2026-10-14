import {EXPERIENCE_DUNGEONS,EXPERIENCE_CACHES} from './rpg-experience-exploration.js';
import {C1_PEOPLE} from './chapter-one-story-world.js';
import {C1_NEW_MAPS} from './chapter-one-expansion-data.js';
import {c1State} from './chapter-one-expansion-save.js';
import {C1_LAYOUTS,C1_MAPS,C1_FURNITURE,C1_RESOURCE_SITES,c1Boundary,c1Map,c1Land} from './chapter-one-layout.js';
import {WATERS,BRIDGES} from './world-v14.js';
export const C1_CONNECTIONS=[['hall','c1TrainingYard'],['c1TrainingYard','c1TrialFoyer'],['c1TrialFoyer','c1DrillGallery'],['c1TrialFoyer','c1TrialCrypt'],['c1TrialCrypt','c1TrialVault'],['grove','c1RiversideCamp'],['road','c1RiversideCamp'],['c1RiversideCamp','c1KilnCourt'],['c1KilnCourt','c1ReedKiln'],['c1DrillGallery','warehouse'],['workshop','c1LoomRoom'],['town','c1NorthWalk'],['c1NorthWalk','alley'],['grove','c1ReedKiln'],['c1DrillGallery','c1TrialCrypt'],['c1TrialCrypt','c1TrainingYard'],['c1TrialVault','c1DrillGallery'],['c1RiversideCamp','millpath'],['c1ReedKiln','c1NorthWalk']];
export const C1_CHANGED_MAPS=C1_MAPS.filter(id=>!C1_NEW_MAPS.includes(id));
const door=(to,x,y,tx,ty,label)=>({to,x,y,tx,ty,label,c1Door:true,manualOnly:true});
const prop=(id,label,x,y,action,extra={})=>({id,label,x,y,type:'book',action,flat:true,geometryV26:false,collisionV281:false,...extra});
const npc=(id,name,x,y,sprite)=>({id,name,x,y,sprite,angle:Math.PI/2});
export function configureC1World({MAPS,SCENERY,BOUNDARIES}){
 const create=(id,name,safe,npcs,spawns)=>{MAPS[id]={name,sub:C1_LAYOUTS[id].space,atlas:'interior',cell:0,safe,worldV4:true,c1Expansion:true,doors:[],blocks:[],props:[],npcs,spawns};};
 create('c1TrainingYard','灰烛练武庭',false,[],[['rat',480,380,'c1-moss-1'],['rat',590,560,'c1-moss-2'],['rat',1030,530,'c1-moss-3'],['rat',1270,660,'c1-moss-4']]);
 create('c1DrillGallery','一层旧试炼廊',false,[],[['rat',360,845,'c1-sentry-1'],['rat',800,620,'c1-sentry-2'],['wolf',1260,520,'c1-trial-warden']]);
 create('c1LoomRoom','缀纹工坊',true,[npc('c1rosa','罗萨',400,480,4),npc('c1saido','赛铎',1170,460,11)],[]);
 create('c1NorthWalk','北渠检修道',false,[],[['rat',370,490,'c1-valve-rat'],['rat',470,760,'c1-north-rat-2'],['rat',960,420,'c1-north-rat-3'],['rat',1130,760,'c1-north-rat-4'],['rat',1260,620,'c1-north-rat-5'],['bat',1080,280,'c1-valve-bat'],['bat',1340,470,'c1-north-bat-2'],['bat',980,860,'c1-north-bat-3']]);
 create('c1ReedKiln','苇湾废窑',false,[],[['bat',550,760,'c1-kiln-bat-a'],['bat',760,580,'c1-kiln-bat-b'],['bat',1030,460,'c1-kiln-bat-c'],['bat',1280,620,'c1-kiln-bat-d'],['bat',1200,760,'c1-kiln-bat-e']]);
 for(const [id,name,safe]of [['c1TrialFoyer','地下接待室',true],['c1TrialCrypt','二层蓄能廊',false],['c1TrialVault','三层封存库',false],['c1RiversideCamp','河畔营地',true],['c1KilnCourt','窑工院',true]])create(id,name,safe,[],[]);
 for(const [id,p]of Object.entries(C1_PEOPLE)){const xy={c1iden:[530,530],c1hesha:[280,855],c1venn:[285,845],c1blake:[455,530],c1eve:[1130,900],c1mada:[465,540]}[id];MAPS[p.map].npcs.push(npc(id,p.name,...xy,4));}
 for(const [id,spawns]of Object.entries(EXPERIENCE_DUNGEONS))MAPS[id].spawns=spawns.map(s=>[...s]);
 const join=(a,b,ax,ay,bx,by)=>{MAPS[a].doors.push(door(b,ax,ay,bx,by,MAPS[b].name));MAPS[b].doors.push(door(a,bx,by,ax,ay,MAPS[a].name));};
 join('hall','c1TrainingYard',180,560,220,820);join('c1TrainingYard','c1TrialFoyer',1360,860,220,870);join('c1TrialFoyer','c1DrillGallery',1360,520,220,870);join('c1TrialFoyer','c1TrialCrypt',1020,880,210,905);join('c1TrialCrypt','c1TrialVault',1380,870,210,915);join('c1DrillGallery','warehouse',1350,860,240,870);
 join('workshop','c1LoomRoom',1340,740,230,850);join('town','c1NorthWalk',1100,220,230,850);join('c1NorthWalk','alley',1370,850,480,870);join('grove','c1ReedKiln',1390,540,230,870);
 join('grove','c1RiversideCamp',320,910,1370,450);join('road','c1RiversideCamp',1240,900,230,850);join('c1RiversideCamp','c1KilnCourt',1370,600,230,850);join('c1KilnCourt','c1ReedKiln',1360,540,380,900);
 join('c1DrillGallery','c1TrialCrypt',1380,390,1290,580);join('c1TrialCrypt','c1TrainingYard',480,870,890,310);join('c1TrialVault','c1DrillGallery',810,620,420,290);
 join('c1RiversideCamp','millpath',880,320,760,870);join('c1ReedKiln','c1NorthWalk',560,410,900,300);
 // Destinations describe the adjoining floor, while the passage itself belongs to the building.
 const passage=(map,to,label)=>{const d=MAPS[map].doors.find(d=>d.to===to);d.label=label;d.c1Passage=true;};
 passage('c1DrillGallery','c1TrialCrypt','二层蓄能廊 · 东厅侧阶');passage('c1TrialCrypt','c1DrillGallery','一层旧廊 · 上行侧阶');
 passage('c1TrialCrypt','c1TrainingYard','练武庭 · 旧升降井台阶');passage('c1TrainingYard','c1TrialCrypt','二层蓄能廊 · 旧升降井');
 passage('c1TrialVault','c1DrillGallery','一层旧廊 · 检修便道');passage('c1DrillGallery','c1TrialVault','三层封存库 · 检修便道');
 passage('c1ReedKiln','c1NorthWalk','北渠检修道 · 窑工小径');passage('c1NorthWalk','c1ReedKiln','苇湾废窑 · 窑工小径');
 MAPS.millpath.spawns.push(['wolf',1150,830,'c1-mill-wolf-2'],['wolf',710,350,'c1-mill-wolf-3']);
 const keep={hall:['hallbook','hallpot'],warehouse:['crack','frost','wbox1','wbox2'],road:[],town:['well','townbook'],chapel:[],alley:['alleycrate'],canal:['canalbox'],grove:['stone'],guestroom:['guest-journal','guest-basin','guest-bunk'],millpath:['mill-barrel'],echo:['echo-machine','echo-valve','v29-echo-core'],workshop:['repair-bench','reset-bench','v29-repair-core']};
 for(const [id,ids]of Object.entries(keep))MAPS[id].props=MAPS[id].props.filter(p=>ids.includes(p.id));
 for(const [id,c]of Object.entries(EXPERIENCE_CACHES))MAPS[c.map].props.push(prop(id,c.label,c.x,c.y,'c1:cache',{c1Art:['Furnishings',4,75,65],c1Box:[c.x-27,c.y-22,54,22],interactX:c.x,interactY:c.y+45}));
 MAPS.c1TrialCrypt.props.push(prop('c1-crypt-cable','供能机接头',540,330,'c1:inspect',{c1Art:['Utilities',14,135,70],c1Box:[493,300,94,30],interactX:540,interactY:390}),prop('c1-crypt-drain','回水槽接缝',1200,350,'c1:inspect',{c1Art:['Objects',2,220,65],c1Box:[1123,320,154,30],interactX:1200,interactY:410}));
 MAPS.c1TrialVault.props.push(prop('c1-vault-ledger','东厅封存清册',1180,300,'c1:inspect',{c1Art:['Furnishings',2,210,170],c1Box:[1106,270,147,30],interactX:1180,interactY:360}));
 MAPS.road.props.push(prop('c1-shelter','城门外车棚 · 歇到天亮',1330,440,'c1:shelter',{c1Art:['Objects',10,80,48],interactX:1330,interactY:495}));
 MAPS.c1LoomRoom.props.push(prop('c1-loom','缀纹机 · 比较与制作',780,520,'c1:loom',{c1Art:['loom',0,145,185],c1Box:[725,440,110,80],interactX:780,interactY:575}));
 for(const [map,sites]of Object.entries(C1_RESOURCE_SITES))sites.forEach(([x,y],i)=>MAPS[map].props.push(prop('c1-herb-'+i,'银叶草',x,y,'c1:herb',{type:'herb',c1Resource:true,c1Art:['Furnishings',8,48,42]})));
 const at=(map,id,x,y,extra={})=>Object.assign(MAPS[map].props.find(p=>p.id===id),{x,y,interactX:x,interactY:y,...extra});
 at('hall','hallbook',950,320,{interactY:380,c1Art:['Furnishings',9,46,30]});at('hall','hallpot',1360,320,{c1Art:['Settlement',7,50,58]});
 at('town','well',880,640,{interactX:880,interactY:705,c1Art:['Settlement',2,145,125],c1Box:[825,600,110,40]});at('town','townbook',990,840,{c1Art:['Furnishings',10,72,95]});
 at('guestroom','guest-bunk',520,470,{interactX:620,interactY:495,c1Art:['Utilities',0,230,160],c1Box:[435,390,170,80]});
 at('guestroom','guest-journal',540,650,{interactY:730,c1Art:['Furnishings',9,42,28]});
 at('warehouse','frost',1200,910,{c1Art:['Furnishings',9,44,32]});at('warehouse','wbox1',340,690,{c1Art:['Furnishings',4,82,72]});at('warehouse','wbox2',1070,840,{c1Art:['Objects',0,38,56]});
 at('millpath','mill-barrel',1050,760,{c1Art:['Furnishings',6,68,86]});
 at('alley','alleycrate',1050,800,{c1Art:['Furnishings',4,80,74]});at('canal','canalbox',430,730,{c1Art:['Furnishings',4,80,74]});
 at('warehouse','crack',1300,185,{interactY:235,c1WallPatch:true,label:'北墙松动的修补木板'});at('warehouse','frost',1200,910);at('warehouse','wbox1',340,690);at('warehouse','wbox2',1070,840);
 at('grove','stone',1290,355,{c1Art:['Utilities',19,92,58]});at('echo','v29-echo-core',1200,405,{c1Art:['Utilities',14,65,38]});at('echo','echo-machine',1280,330,{interactX:1280,interactY:425,c1Art:['Settlement',10,175,165]});at('echo','echo-valve',880,725,{c1Art:['Furnishings',11,56,76]});
 at('workshop','repair-bench',1040,490,{interactY:535,c1Art:['Utilities',8,80,42]});at('workshop','reset-bench',390,585,{c1Art:['Utilities',17,48,30]});at('workshop','v29-repair-core',1080,480,{interactY:535,c1Art:['Utilities',14,60,34]});
 at('guestroom','guest-basin',950,395,{c1Art:['Utilities',13,65,42]});
 // The woodland is a visible branch, available to herb gathering as well as the ring quest.
 delete MAPS.road.doors.find(d=>d.to==='grove').hidden;
 Object.assign(MAPS.road.npcs.find(n=>n.id==='courier'),{x:400,y:510});
 Object.assign(MAPS.town.npcs.find(n=>n.id==='herbalist'),{x:430,y:465});Object.assign(MAPS.town.npcs.find(n=>n.id==='dolly'),{x:665,y:800});Object.assign(MAPS.town.npcs.find(n=>n.id==='oldwoman'),{x:1130,y:575});
 // Machinery is painted by its interactive prop, not a second copy behind it.
 C1_FURNITURE.warehouse=C1_FURNITURE.warehouse.filter(o=>o.sheet!=='chapterSettlement');
 C1_FURNITURE.guestroom=C1_FURNITURE.guestroom.filter(o=>!(o.sheet==='chapterUtilities'&&o.asset===0));
 C1_FURNITURE.road=C1_FURNITURE.road.filter(o=>!(o.sheet==='chapterObjects'&&o.asset===10));
 C1_FURNITURE.c1TrialCrypt=C1_FURNITURE.c1TrialCrypt.filter(o=>!(o.sheet==='chapterUtilities'&&o.asset===14&&o.x===540)&&!(o.sheet==='chapterObjects'&&o.asset===2&&o.x===1200));
 C1_FURNITURE.c1TrialVault=C1_FURNITURE.c1TrialVault.filter(o=>!(o.sheet==='chapterFurnishings'&&o.asset===2&&o.x===1180));
 C1_FURNITURE.echo=C1_FURNITURE.echo.filter(o=>o.sheet!=='chapterSettlement');
 for(const id of C1_MAPS){const m=MAPS[id],layout=C1_LAYOUTS[id];m.c1Layout=EXPERIENCE_DUNGEONS[id]?10:9;m.sub=layout.space;
  const boundary=c1Boundary(id);BOUNDARIES[id]=boundary;WATERS[id]=(layout.water||[]).map(b=>[...b]);delete BRIDGES[id];
  SCENERY[id]=(C1_FURNITURE[id]||[]).map((o,i)=>({...o,id:'c1-furniture-'+id+'-'+i}));
  m.blocks=[...boundary,...SCENERY[id].map(o=>o.box),...m.props.flatMap(p=>p.c1Box?[p.c1Box]:[])];
  // Add actual encounters across walkable rooms, away from workers and door landings.
  const fill=(type,prefix,total,match)=>{let n=m.spawns.filter(match).length,k=1;
   const spots=[...({c1TrialCrypt:[[490,450],[660,610],[710,850],[770,300],[1110,580],[1300,490],[1180,770],[1280,720]],c1TrialVault:[[500,470],[660,670],[700,340],[820,620],[1110,400],[1350,340],[1170,750],[1360,800]]}[id]||[])];for(let y=290;y<=875;y+=145)for(let x=260;x<=1370;x+=185)if(c1Land(id,x,y)&&!m.blocks.some(([a,b,w,h])=>x>a-65&&x<a+w+65&&y>b-65&&y<b+h+65)&&!m.npcs.some(p=>Math.hypot(x-p.x,y-p.y)<310)&&!m.doors.some(p=>Math.hypot(x-p.x,y-p.y)<125))spots.push([x,y]);
   for(const [x,y]of spots){if(n>=total)break;if(!c1Land(id,x,y)||m.blocks.some(([a,b,w,h])=>x>a-55&&x<a+w+55&&y>b-55&&y<b+h+55)||m.npcs.some(p=>Math.hypot(x-p.x,y-p.y)<310)||m.doors.some(p=>Math.hypot(x-p.x,y-p.y)<125))continue;if(m.spawns.some(s=>Math.hypot(x-s[1],y-s[2])<115))continue;while(m.spawns.some(s=>s[3]===prefix+k))k++;m.spawns.push([type,x,y,prefix+k++]);n++;}
  };
  if(id==='warehouse')fill('rat','c1-grain-rat-',8,s=>s[0]==='rat');
  if(id==='c1TrainingYard')fill('rat','c1-moss-',8,s=>s[3]?.startsWith('c1-moss-'));
  if(id==='c1DrillGallery')fill('rat','c1-sentry-',8,s=>s[3]?.startsWith('c1-sentry-'));
  if(id==='c1TrialCrypt')fill('rat','c1-crypt-',8,()=>true);
  if(id==='c1TrialVault'&&!EXPERIENCE_DUNGEONS[id]){fill('rat','c1-vault-sentry-',8,()=>true);m.spawns.push(['wolf',1280,510,'c1-vault-warden']);}
  if(id==='road')fill('wolf','c1-road-beast-',8,s=>['rat','wolf'].includes(s[0]));
  if(id==='grove')fill('wolf','c1-grove-beast-',8,s=>['rat','wolf','bat'].includes(s[0])&&!s[3]?.includes('elite'));
  if(id==='c1NorthWalk'){fill('rat','c1-north-rat-',8,s=>s[0]==='rat');fill('bat','c1-north-bat-',8,s=>s[0]==='bat');}
  if(id==='c1ReedKiln')fill('bat','c1-kiln-bat-',8,s=>s[0]==='bat');
  if(id==='millpath')fill('wolf','c1-mill-wolf-',8,s=>s[0]==='wolf');
  // Old V29 encounter rectangles followed old narrow lanes; updated groups use authored clearings.
  if(m.encounters)m.encounters=[];
  m.ambientActors=(m.ambientActors||[]).filter((a,i)=>i<2&&!(m.blocks.some(([x,y,w,h])=>a.x>x-20&&a.x<x+w+20&&a.y>y-20&&a.y<y+h+20)));
  for(const d of m.doors){const floors={hall:0,warehouse:0,c1TrainingYard:0,c1TrialFoyer:1,c1DrillGallery:1,c1TrialCrypt:2,c1TrialVault:3};if(floors[id]!==undefined&&floors[d.to]!==undefined&&floors[id]!==floors[d.to])d.c1Stair=floors[d.to]>floors[id]?'down':'up';d.manualOnly=true;d.c1Exit=true;d.x=Math.max(175,Math.min(1425,d.x));d.y=Math.max(225,Math.min(935,d.y));if(id==='town'&&d.to==='chapel')d.y=290;}
  for(const p of m.props){p.c1Layout=m.c1Layout;p.geometryV26=false;p.collisionV281=false;}
 }
}
export function installC1World(RPG){
 const P=RPG.prototype,enter=P.enter,ensure=P.ensureMap,restore=P.restore,pathDirection=P.pathDirection;
 function align(g,id){if(!c1Map(id)||!g.states[id])return;const st=g.states[id],m=worldMaps[id];
  const previous=new Map(st.props.map(p=>[p.id,p]));st.props=m.props.map(p=>({...previous.get(p.id),...p,hp:previous.get(p.id)?.hp??(p.action?999:18),used:previous.get(p.id)?.used||false,broken:previous.get(p.id)?.broken||false}));
  if(st.c1Layout!==m.c1Layout){st.c1Layout=m.c1Layout;for(const [i,s]of m.spawns.entries()){const key=s[3]||id+'-'+i;if(!st.enemies.some(e=>e.id===key))st.enemies.push(g.enemy(s[0],s[1],s[2],key));}
   for(const e of st.enemies){const spawn=m.spawns.find(s=>(s[3]||id+'-'+m.spawns.indexOf(s))===e.id);if(e.id.startsWith('c1-crypt-')){delete e.c1Species;e.label='啃线鼠';}if(spawn)Object.assign(e,{x:spawn[1],y:spawn[2],homeX:spawn[1],homeY:spawn[2],roamTarget:null,leashBounds:null,activationBounds:null});}for(const k of Object.keys(g.npcPoses||{}))if(k.startsWith(id+':'))delete g.npcPoses[k];}
 }
 P.ensureMap=function(id){const r=ensure.call(this,id);align(this,id);return r;};
 P.enter=function(...args){this.c1EndTraining?.();const r=enter.apply(this,args);align(this,this.map);this.repairEntities();return r;};
 P.restore=function(...args){const r=restore.apply(this,args);for(const id of C1_MAPS)align(this,id);if(c1Map(this.map)&&this.blocked(this.p.x,this.p.y))this.relocate(this.p.x,this.p.y);return r;};
 // At a masonry corner two actors can be within 18px yet have no line of
 // sight. The old waypoint tolerance consumed both corner and destination,
 // leaving auto-approach motionless. Finish the last few actual steps here.
 P.pathDirection=function(actor,goal){const direction=pathDirection.call(this,actor,goal);if(!c1Map(this.map)||Math.hypot(direction.x,direction.y)>.01||this.clearLine(actor,goal))return direction;const next=this.routeTo(goal,actor).find(p=>Math.hypot(p.x-actor.x,p.y-actor.y)>3);if(!next)return direction;const d=Math.hypot(next.x-actor.x,next.y-actor.y);return {x:(next.x-actor.x)/d,y:(next.y-actor.y)/d};};
 P.c1AtService=function(which){if(this.map!=='c1LoomRoom'||this.p.hp<=0||this.enemies.some(e=>!e.dead))return false;const at=which==='loom'?{x:780,y:575}:which==='rosa'?{x:400,y:480}:{x:1170,y:460};return Math.hypot(this.p.x-at.x,this.p.y-at.y)<150&&this.clearLine(this.p,at,false);};
}
// Reference is assigned once by the installer; avoids importing partially initialized core.
let worldMaps;
export function c1WorldRegistry(maps){worldMaps=maps;}
