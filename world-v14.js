import {romanceActionArtV20} from './romance-world-v20.js';
import {configureQualityWorld,secretPropArt} from './quality-world-v14.js';
import {configureChapterWorld} from './chapter-world-v14.js';
import {DENSITY} from './density-v14.js';
import {configureMechanisms} from './mechanisms-v14.js';
import {STAGING} from './staging-v14.js';
import {WORLD_ADDITIONS} from './exploration-v14.js';
const prop=(id,asset,x,y,w,h,box=null,sheet='world')=>({id,asset,x,y,w,h,box,sheet});
export const BOUNDARIES={};
export const SCENERY={
 hall:[prop('hall-shelf',11,340,275,205,165,[240,210,200,65]),prop('hall-table',9,445,765,290,145,[300,680,290,85]),prop('hall-records',11,1130,260,300,165,[980,200,300,60]),prop('hall-bench',10,1255,875,210,85,[1150,835,210,40]),prop('hall-lamp',14,240,540,52,150,[226,521,28,19])],
 warehouse:[prop('stock-a',11,730,275,460,175,[500,230,460,45]),prop('stock-b',11,515,600,120,210,[470,420,95,180]),prop('stock-c',11,975,585,150,175,[920,500,110,85]),prop('sacks',9,1105,790,145,80,[1040,750,130,40],'details')],
 road:[prop('road-wall',5,455,765,150,85,[390,720,130,45]),prop('road-tree',4,765,305,225,270,[720,260,90,45]),prop('road-tree2',4,1360,835,235,285,[1315,800,90,35]),prop('road-sign',15,530,405,68,95,[513,391,34,14])],
 town:[prop('west-home',0,395,355,365,325,[230,220,330,135]),prop('east-workshop',0,1170,285,330,300,[1020,205,300,80]),prop('south-home',0,410,925,350,315,[250,850,320,75]),prop('south-shop',0,1210,950,350,320,[1050,895,320,55]),prop('medicine',2,455,535,220,155,[350,495,210,40]),prop('tailor',3,585,735,180,145,[515,694,140,41]),prop('lamp-nw',14,700,300,43,140,[689,284,22,16]),prop('lamp-ne',14,940,330,43,140,[929,314,22,16]),prop('north-chapel',1,820,155,270,250),prop('well-base',8,900,700,90,82,[867,677,66,28])],
 chapel:[prop('pulpit',9,1095,255,245,120,[980,200,230,55]),prop('pew-w1',10,375,465,230,100,[260,410,230,55]),prop('pew-w2',10,375,645,230,100,[260,590,230,55]),prop('pew-e1',10,1345,395,170,90,[1260,350,170,45]),prop('pew-e2',10,1345,815,170,90,[1260,770,170,45]),prop('chapel-lamp',14,590,300,48,160,[578,285,24,15])],
 alley:[prop('alley-home1',0,410,355,350,320,[250,220,320,135]),prop('alley-home2',0,1180,315,330,295,[1030,220,300,95]),prop('alley-home3',0,465,910,360,305,[300,845,330,65]),prop('alley-home4',0,1215,890,300,290,[1080,805,270,85]),prop('alley-lamp',14,1180,490,40,132,[1168,475,24,15]),prop('alley-gate',7,1440,535,150,235)],
 canal:[prop('canal-arch',7,1420,500,180,250),prop('canal-wall',5,760,310,140,80),prop('canal-lamp',14,510,410,45,140,[498,395,24,15])],
 grove:[prop('grove-tree1',4,300,490,240,310,[264,450,72,40]),prop('grove-tree2',4,1380,720,250,320,[1340,680,80,40]),prop('grove-tree3',4,1080,245,220,285,[1046,214,68,31]),prop('stone1',3,1050,345,52,34,[1027,328,46,17],'details'),prop('stone2',3,1150,330,54,36,[1125,313,50,17],'details')]
};
export const WATERS={canal:[[700,200,140,230],[700,620,140,280]],grove:[[790,175,120,310],[790,620,120,200]]};
export const BRIDGES={canal:{x:680,y:430,w:180,h:190},grove:{x:770,y:485,w:160,h:135}};
const interiors=new Set(['hall','warehouse','chapel','canal','guestroom','workshop','echo','inn','spillway','chamber','bridgecellar','wellcrypt']);
export function groundCell(id,x,y){let material=interiors.has(id)?['hall','warehouse','guestroom','workshop','inn'].includes(id)?8:12:4;if(['post','manor','bridge'].includes(id)&&y>450&&y<720)material=0;if(id==='town'&&((x>650&&x<1010)||(y>480&&y<710)))material=0;if(id==='alley'&&(y>455&&y<665||x>760&&x<945))material=0;if(id==='road'&&(Math.abs(y-(540+Math.sin(x/300)*25))<105||x>860&&x<980&&y<540))material=0;if(id==='millpath'&&(x>730&&x<870&&y<525||x>420&&x<1160&&y>485&&y<605))material=0;return material+Math.abs((x/64|0)*13+(y/64|0)*7+id.length)%4;}
export function configureWorld(maps){
 Object.assign(maps,WORLD_ADDITIONS.maps);Object.assign(SCENERY,WORLD_ADDITIONS.scenery);for(const [id,doors] of Object.entries(WORLD_ADDITIONS.doorPatches))for(const d of doors)if(!maps[id].doors.some(v=>v.to===d.to))maps[id].doors.push(d);
 configureMechanisms(maps,SCENERY,WATERS,BRIDGES);
 configureChapterWorld(maps,SCENERY,WATERS,BRIDGES);
 for(const [id,change] of Object.entries(DENSITY)){maps[id].spawns=[...(maps[id].spawns||[]),...(change.addSpawns||[])];maps[id].props.push(...(change.addProps||[]));SCENERY[id].push(...(change.addScenery||[]));}
 const millReturn=maps.millpath.doors.find(d=>d.to==='road');if(millReturn){millReturn.tx=1090;millReturn.ty=805;}
 // Shelves have a stable object scale; host flat items on desks and wall details on actual walls.
 const stock=SCENERY.warehouse;stock.splice(stock.findIndex(o=>o.id==='stock-a'),1,prop('stock-a-left',11,620,275,205,165,[525,215,190,60]),prop('stock-a-right',11,860,275,205,165,[765,215,190,60]));Object.assign(stock.find(o=>o.id==='stock-b'),{x:515,y:570,w:175,h:145,box:[438,520,154,50]});
 Object.assign(maps.warehouse.props.find(o=>o.id==='crack'),{x:1270,y:210,interactX:1270,interactY:290,flat:true});
 for(const id of ['hallbook','frost','letter'])for(const m of Object.values(maps)){const item=m.props.find(o=>o.id===id);if(item)item.flat=true;}
 const west=maps.echo.props.find(o=>o.action==='echoCrystal'&&o.x<500);if(west)west.label='石缝中的晶簇';
 const bag=SCENERY.millpath.find(o=>o.id==='mill-old-sacks');if(bag)Object.assign(bag,{sheet:'chapterProps',asset:6,w:122,h:88});

 SCENERY.hall.push({...prop('commission-paper',7,1085,510,29,20,null,'details'),depthY:615.1,flat:true});SCENERY.chapel.push({...prop('ceremony-notes',7,1125,435,33,22,null,'details'),depthY:525.1,flat:true});
 for(const p of STAGING.newScenery)if(!SCENERY[p.map].some(o=>o.id===p.id))SCENERY[p.map].push({...p});
 configureQualityWorld(maps,SCENERY,WATERS,BRIDGES);
 for(const [map,id,index] of [['manor','manor-well',6],['bridge','bridge-cart-s',3],['post','post-cart',3],['bridgecellar','v9-cellar-exit',1],['wellcrypt','v9-well-exit',1],['exile','exile-camp',5]]){const o=SCENERY[map]?.find(v=>v.id===id);if(o){o.sheet='qualityWorld';o.asset=index;}}

 for(const [id,m] of Object.entries(maps)){if(m.worldV4)continue;m.worldV4=true;BOUNDARIES[id]=[...(m.blocks||[])];m.blocks=[...(m.blocks||[]),...SCENERY[id].filter(o=>o.box).map(o=>o.box),...(WATERS[id]||[])];}
 maps.town.npcs.push({id:'dolly',name:'朵莉',x:600,y:590,sprite:11});
 for(const [id,patches] of Object.entries(WORLD_ADDITIONS.existingNPCFacingPatches))for(const p of patches){const n=maps[id].npcs.find(n=>n.id===p.id);if(n)Object.assign(n,{x:p.x,y:p.y,angle:Math.atan2(p.homeLookAt[1]-p.y,p.homeLookAt[0]-p.x)});}
 for(const [id,ps] of Object.entries(STAGING.npcPositions))for(const [nid,[x,y]] of Object.entries(ps)){const n=maps[id].npcs.find(v=>v.id===nid);Object.assign(n,{x,y,angle:Math.atan2(600-y,800-x)});}
 for(const [id,bounds] of Object.entries(BOUNDARIES)){if(interiors.has(id))continue;for(const [bi,[x,y,w,h]] of bounds.entries())for(let yy=y+90;yy<y+h+40;yy+=136)for(let xx=x+50;xx<x+w;xx+=126){const xx2=xx+((bi+Math.floor(yy/136))%2)*22;SCENERY[id].push(prop('edge-tree-'+bi+'-'+xx+'-'+yy,4,xx2,yy,154,184));}}
 for(const id of Object.keys(SCENERY))SCENERY[id]=SCENERY[id].filter(o=>!(o.sheet==='details'&&o.asset===15&&!o.box));
 maps.chapel.npcs.find(n=>n.id==='prelate').x=1230;maps.chapel.npcs.find(n=>n.id==='prelate').y=530;
 maps.canal.spawns=maps.canal.spawns.map(s=>s[1]===720&&s[2]===830?[s[0],640,830]:s[1]===700&&s[2]===330?[s[0],640,330]:s);
 for(const o of SCENERY.exile)if(o.x>980)o.cold=true;maps.town.sub='井边仍有人等着，午钟迟迟没响';maps.alley.sub='贴着墙走，水渠就在东面';
}
export function actionPropArt(p,g){const romance=romanceActionArtV20(p);if(romance!==undefined)return romance;if(p.nativeV18)return null;if(p.art){if(p.art.sheet==='details'&&p.art.index===15)return null;return p.art;}const secretArt=secretPropArt(p);if(secretArt!==undefined)return secretArt;
 if(p.action?.startsWith('ch2-')){if(['ch2-sign'].includes(p.action))return {sheet:'details',index:4,w:70,h:95};if(p.action==='ch2-tools')return {sheet:'details',index:7,w:52,h:33};if(['ch2-paper','ch2-cache'].includes(p.action))return {sheet:'details',index:0,w:38,h:27};return null;}if(['echoMachine','resetBench'].includes(p.action))return null;if(p.action==='echoCrystal')return {sheet:'mechanisms',index:3,w:72,h:60};if(p.action==='echoNotes')return {sheet:'mechanisms',index:6,w:37,h:31};if(p.action==='echoValve')return {sheet:'chapterProps',index:5,w:75,h:118};
 if(p.training)return {sheet:'newProps',index:4,w:70,h:110};if(p.action==='millWheel')return {sheet:'chapterProps',index:5,w:85,h:127};if(p.action==='workshopSign')return {sheet:'details',index:4,w:65,h:85};if(p.type==='barrel')return {sheet:'details',index:10,w:44,h:62};if(Object.hasOwn(WORLD_ADDITIONS.renderHints.actionArt,p.action)){const a=WORLD_ADDITIONS.renderHints.actionArt[p.action];return a?{sheet:a[0],index:a[1],w:a[2],h:a[3]}:null;}
 if(p.id==='well')return null;
 if(p.id==='crack')return {sheet:'details',index:g?.quests.rats==='done'?11:2,w:76,h:85};
 if(p.id==='oil')return {sheet:'details',index:1,w:42,h:48};
 if(p.id==='letter')return {sheet:'details',index:7,w:56,h:36};
 if(p.action==='notice')return {sheet:'details',index:4,w:80,h:110};
 if(p.action==='secret')return {sheet:'details',index:3,w:59,h:38};
 if(p.type==='herb')return {sheet:'details',index:6,w:38,h:33};
 if(p.type==='book')return {sheet:'details',index:0,w:40,h:29};
 return {sheet:'world',index:p.type==='pot'?13:12,w:p.type==='pot'?34:45,h:p.type==='pot'?36:43};
}
