import {C1_NEW_MAPS} from './chapter-one-expansion-data.js';
// Painted materials are shared with the existing chapter; decoration is baked
// only over the same boundary solids used by navigation.
function material(c,bank,index,rect,size=220){
 const f=bank.frame('chapterMaterials',index),im=bank.images.chapterMaterials;if(!f||!im)return;
 c.save();c.beginPath();c.rect(...rect);c.clip();c.imageSmoothingEnabled=true;
 for(let y=Math.floor(rect[1]/size)*size;y<rect[1]+rect[3];y+=size)for(let x=Math.floor(rect[0]/size)*size;x<rect[0]+rect[2];x+=size)c.drawImage(im,f.cell.x,f.cell.y,f.cell.w,f.cell.h,x,y,size,size);c.restore();
}
export function c1Ground(bank,id){if(!C1_NEW_MAPS.includes(id))return null;
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1080;const c=canvas.getContext('2d'),outside=id==='c1ReedKiln',wood=['c1LoomRoom','c1DrillGallery'].includes(id);
 material(c,bank,outside?1:wood?2:0,[0,0,1600,1080],outside?480:wood?270:205);
 c.fillStyle='#55504320';c.fillRect(0,0,1600,1080);
 for(const b of [[0,0,1600,160],[0,1000,1600,80],[0,160,140,840],[1460,160,140,840]]){material(c,bank,3,b,175);c.fillStyle='#101c2444';c.fillRect(...b);}
 c.strokeStyle='#181d1b';c.lineWidth=8;c.strokeRect(140,160,1320,840);c.strokeStyle='#a2957355';c.lineWidth=3;c.strokeRect(146,166,1308,828);
 if(outside){for(let i=0;i<9;i++){bank.draw(c,'chapterArchitecture',6,80+i*180,155,180,125);bank.draw(c,'chapterArchitecture',6,65+i*180,1090,170,120);}for(let y=280;y<1000;y+=165){bank.draw(c,'chapterSettlement',8,80,y,115,90);bank.draw(c,'chapterArchitecture',6,1540,y,165,130);}}
 else {for(let x=220;x<1500;x+=250)bank.draw(c,'chapterArchitecture',4,x,162,250,88);for(const x of [110,1490])for(let y=360;y<990;y+=260)bank.draw(c,'chapterUtilities',7,x,y,85,128);}
 if(id==='c1TrainingYard'){for(const x of [870,1110]){c.strokeStyle='#c0a36d80';c.lineWidth=4;c.beginPath();c.ellipse(x,590,165,220,0,0,Math.PI*2);c.stroke();}c.fillStyle='#6f5a3d30';c.fillRect(220,400,340,460);}
 if(id==='c1DrillGallery'){c.strokeStyle='#b59b6266';c.lineWidth=7;for(const y of [330,850]){c.beginPath();c.moveTo(300,550);c.lineTo(490,y);c.lineTo(1260,y);c.lineTo(1310,800);c.stroke();}c.strokeStyle='#9b6651';c.lineWidth=3;c.beginPath();c.moveTo(530,290);c.lineTo(530,890);c.stroke();}
 if(id==='c1LoomRoom'){for(const [x,y,w,h,color]of [[240,370,340,500,'#758d6918'],[650,360,340,420,'#ad885118'],[1060,300,330,450,'#69989918']]){c.fillStyle=color;c.fillRect(x,y,w,h);}}
 if(id==='c1NorthWalk'){c.fillStyle='#171f22';c.fillRect(667,166,156,827);const water=c.createLinearGradient(680,0,810,0);water.addColorStop(0,'#29444a');water.addColorStop(.5,'#496565');water.addColorStop(1,'#21383e');c.fillStyle=water;c.fillRect(680,170,130,825);c.strokeStyle='#b8d0c330';c.lineWidth=1.4;for(let y=180;y<980;y+=23){c.beginPath();c.moveTo(697+Math.sin(y)*8,y);c.quadraticCurveTo(755,y+5,794,y-2);c.stroke();}c.strokeStyle='#93876f';c.lineWidth=8;c.strokeRect(670,166,150,834);}
 if(id==='c1ReedKiln'){const ash=c.createRadialGradient(1090,350,30,1090,350,290);ash.addColorStop(0,'#302823aa');ash.addColorStop(.6,'#514c4150');ash.addColorStop(1,'#514c4100');c.fillStyle=ash;c.fillRect(790,180,620,490);c.strokeStyle='#171e1dc0';c.lineWidth=15;c.beginPath();c.moveTo(430,780);c.lineTo(590,780);c.lineTo(590,290);c.lineTo(1150,290);c.stroke();c.strokeStyle='#8e7660';c.lineWidth=7;c.stroke();c.strokeStyle='#b59d7455';c.lineWidth=2;c.stroke();c.strokeStyle='#92897335';c.lineWidth=50;c.lineCap='round';c.beginPath();c.moveTo(230,860);c.bezierCurveTo(460,800,450,640,600,560);c.bezierCurveTo(820,470,940,560,1180,740);c.stroke();}
 return canvas;
}
export function drawC1Prop(c,bank,g,p){if(!p.action?.startsWith('c1:'))return false;const key=p.action.slice(3),h=g.c1Expansion?.worldChanges||{};
 c.save();c.translate(p.x,p.y);c.fillStyle='#161c1966';c.beginPath();c.ellipse(0,0,26,9,0,0,7);c.fill();
 const paint=(sheet,index,w,h)=>bank.draw(c,sheet,index,0,0,w,h);
 if(key==='loom'){bank.draw(c,'chapterObjects',1,0,-24,112,108);bank.draw(c,'chapterUtilities',14,0,-2,110,48);c.strokeStyle='#cfbd8c';c.lineWidth=1.5;for(let x=-28;x<=28;x+=5){c.beginPath();c.moveTo(x,-81);c.lineTo(x+8,-28);c.stroke();}bank.draw(c,'chapterUtilities',8,57,-6,44,33);if(h.runePattern)bank.draw(c,'chapterUtilities',18,40,5,42,28);}
 else if(['pressure','lamp-valve','kiln-intake','kiln-exhaust'].includes(key)||key.startsWith('patrol-')){paint('chapterFurnishings',11,55,72);if(h[key]||key==='pressure'&&h.pressure){c.fillStyle='#a4c6ab';c.beginPath();c.arc(14,-21,3,0,7);c.fill();}}
 else if(['plank','sluice'].includes(key))paint('chapterObjects',1,77,75);
 else if(key==='leak'){paint('chapterObjects',2,75,43);if(!h.leakFixed){c.strokeStyle='#a6c9ca';for(let i=0;i<4;i++){c.beginPath();c.arc(10+i*7,-8-Math.sin(g.time*4+i)*5,3,0,7);c.stroke();}}}
 else if(key.includes('lamp')){paint('chapterFurnishings',3,38,80);if(key==='lamp-right'&&!h.lampFixed){c.fillStyle='#282720';c.beginPath();c.ellipse(15,1,14,5,0,0,7);c.fill();}}
 else if(key==='board'||key==='wall-seal'){if(key==='board'&&g.c1Expansion.questSteps.rats?.board){c.restore();return true;}if(key==='wall-seal'&&!h.wallSealed){c.restore();return true;}paint('chapterObjects',3,65,52);}
 else if(['training-target','warning-target'].includes(key))paint('chapterUtilities',16,65,105);
 else if(key==='wall-hole'){paint('chapterSettlement',5,61,80);if(h.wallSealed)paint('chapterObjects',3,66,65);}
 else if(key==='healthy')paint('chapterFurnishings',8,64,50);
 else if(key==='branch'){if(!h.herbGarden)paint('chapterUtilities',5,95,36);else paint('chapterFurnishings',8,65,45);}
 else if(key==='cart'){paint('chapterSettlement',4,85,69);bank.draw(c,'chapterObjects',1,37,4,39,42);}
 else if(key==='cloth')paint('chapterObjects',10,48,38);
 else if(key==='mud')paint('chapterUtilities',17,68,44);
 else if(key==='shelter'){paint('chapterFurnishings',1,123,56);bank.draw(c,'chapterObjects',10,0,-23,69,43);bank.draw(c,'chapterFurnishings',4,80,0,52,65);}
 else if(key==='kettle')paint('chapterObjects',0,36,45);
 else if(key==='kiln-ladder')paint('chapterArchitecture',7,60,110);
 else if(key==='cloth-rack'){if(g.quests.lantern==='done')paint('chapterObjects',10,60,26);else paint('chapterObjects',4,90,107);}
 else if(key==='sample-tray')paint('chapterUtilities',12,76,54);
 else if(['wet-a','wet-b','kiln-node'].includes(key)){paint('chapterUtilities',14,54,34);c.strokeStyle=h.leakFixed?'#b2d1b5':'#94adc0';c.lineWidth=2;c.strokeRect(-14,-25,28,15);}
 else if(key==='transmission')paint('chapterUtilities',14,84,50);
 else if(key==='mark'||key==='route-mark'){c.strokeStyle='#baaa86';c.lineWidth=3;for(let i=0;i<2;i++){c.beginPath();c.moveTo(i*12-10,-5);c.lineTo(i*12+2,-21);c.stroke();}}
 else if(key==='alarm-cut'){paint('chapterUtilities',10,59,47);if(!g.c1Expansion.questSteps.c1ExitDrill?.line){c.strokeStyle='#927c55';c.lineWidth=3;c.beginPath();c.moveTo(0,-15);c.lineTo(0,45);c.stroke();}}
 else if(key==='drill-start')paint('chapterObjects',7,67,50);
 else if(key.includes('sign')||key==='entry-rule')paint('chapterFurnishings',10,58,80);
 else paint('chapterUtilities',18,48,34);
 c.restore();return true;
}
export function drawC1Telegraph(c,t){if(!t)return;c.save();c.fillStyle='#e6aa553d';c.strokeStyle='#f5cc87';c.lineWidth=3;c.translate(t.x,t.y);c.beginPath();if(t.shape==='circle')c.arc(0,0,t.r,0,Math.PI*2);else if(t.shape==='cone'){c.moveTo(0,0);c.arc(0,0,t.r,t.a-t.arc,t.a+t.arc);c.closePath();}else{c.rotate(t.a);c.rect(0,-t.width/2,t.length,t.width);}c.fill();c.stroke();c.restore();}
export function drawC1World(c,g,bank){const h=g.c1Expansion?.worldChanges||{};
 if(bank&&g.map==='c1NorthWalk'&&h.plank){c.save();c.translate(750,540);c.rotate(Math.PI/2);bank.draw(c,'chapterArchitecture',7,0,95,105,190);c.restore();}
 if(g.map==='c1ReedKiln'){c.fillStyle='#151c1e';c.fillRect(140,620,225,55);c.fillStyle='#314348';c.fillRect(145,630,215,35);c.strokeStyle='#8a836750';c.lineWidth=3;c.beginPath();c.moveTo(145,625);c.lineTo(365,625);c.moveTo(145,670);c.lineTo(365,670);c.stroke();if(h.kilnLadder){c.strokeStyle='#b49b6e';c.lineWidth=7;for(const x of [245,305]){c.beginPath();c.moveTo(x,609);c.lineTo(x,685);c.stroke();}c.lineWidth=4;for(let y=620;y<680;y+=14){c.beginPath();c.moveTo(245,y);c.lineTo(305,y);c.stroke();}}}
 if(g.map==='c1ReedKiln'&&h.kilnExhaust){c.strokeStyle='#bbd2c26b';c.lineWidth=2;for(let i=0;i<8;i++){c.beginPath();c.moveTo(430+i*6,760);c.quadraticCurveTo(780,540,880+i*4,280);c.stroke();}}
 if(bank&&g.map==='c1LoomRoom'&&h.samplesSealed)for(let x=1150;x<1240;x+=30)bank.draw(c,'chapterObjects',8,x,356,24,39);
 if(bank&&g.map==='warehouse'&&g.c1Expansion?.questSteps.rats?.board&&!h.wallSealed)bank.draw(c,'chapterObjects',3,g.p.x+20,g.p.y-20,30,33);
 if(g.map==='c1ReedKiln'&&h.kilnBackflow&&!h.kilnExhaust){c.fillStyle='#b7afa035';for(let i=0;i<7;i++){c.beginPath();c.ellipse(840+Math.sin(i+g.time)*55,420+i*24,40,12,0,0,7);c.fill();}}
 drawC1Telegraph(c,g.c1TrainingSession?.warning);
 for(const e of g.enemies)if(!e.dead&&e.telegraph?.c1)drawC1Telegraph(c,e.telegraph);
}
export function drawC1Target(c,e,bank){if(!e.c1Training)return false;if(bank){bank.draw(c,'chapterUtilities',16,e.x,e.y,65,105);return true;}c.save();c.translate(e.x,e.y);c.fillStyle='#8d7652';c.fillRect(-7,-86,14,86);c.fillRect(-44,-59,88,10);c.fillStyle='#bcb08b';c.beginPath();c.ellipse(0,-69,21,25,0,0,7);c.fill();c.strokeStyle='#675237';c.lineWidth=4;c.beginPath();c.arc(0,-69,14,0,7);c.stroke();c.restore();return true;}
export function drawC1Elite(c,e){if(!e.c1Custom)return;c.save();c.translate(e.x,e.y);const sign=Math.cos(e.angle||0)<0?-1:1;c.scale(sign,1);c.strokeStyle='#d0c3a2';c.fillStyle='#66574f';c.lineWidth=3;
 if(e.type==='rat'){c.beginPath();c.moveTo(14,-24);c.lineTo(22,-17);c.lineTo(25,-31);c.moveTo(24,-23);c.lineTo(31,-18);c.lineTo(34,-29);c.stroke();}
 if(e.type==='wolf'){for(let x=-27;x<27;x+=9){c.beginPath();c.moveTo(x,-36);c.lineTo(x-5,-49);c.lineTo(x+8,-37);c.fill();c.stroke();}}
 if(e.type==='bat'){c.strokeStyle='#b8a984';c.lineWidth=2;for(const side of [-1,1]){c.beginPath();c.moveTo(side*12,-43);c.quadraticCurveTo(side*34,-71,side*57,-39);c.lineTo(side*27,-35);c.stroke();}}
 c.restore();}

export function drawC1Scenery(c,bank,o){if(!o.c1Scenery)return false;const [x,y,w,h]=o.box;
 c.save();
 if(o.c1Scenery==='training-rack'){bank.draw(c,'chapterFurnishings',1,o.x,o.y,w,h+35);bank.draw(c,'chapterUtilities',8,o.x,o.y-35,95,45);}
 else if(o.c1Scenery==='workbench'){bank.draw(c,'chapterUtilities',1,o.x,o.y,w,h+55);if(x<600)bank.draw(c,'chapterUtilities',15,o.x,o.y-h-8,70,46);else if(x>1000)bank.draw(c,'chapterFurnishings',8,o.x,o.y-h,80,48);}
 else if(o.c1Scenery==='kiln-pier'){if(w>150){c.filter='saturate(.3) brightness(.72)';bank.draw(c,'chapterUtilities',2,o.x,o.y,w,155);}else bank.draw(c,'chapterUtilities',7,o.x,o.y,w,h+40);}
 else bank.draw(c,'chapterArchitecture',4,o.x,o.y,w,h+35);
 c.restore();return true;
}
