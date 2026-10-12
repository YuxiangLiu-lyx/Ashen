import {C1_NEW_MAPS} from './chapter-one-expansion-data.js';
export function c1Ground(bank,id){if(!C1_NEW_MAPS.includes(id))return null;
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1080;const c=canvas.getContext('2d'),base=id==='c1ReedKiln'?4:['c1NorthWalk','c1TrainingYard'].includes(id)?12:8;c.imageSmoothingEnabled=false;
 for(let y=0;y<1080;y+=64)for(let x=0;x<1600;x+=64){const f=bank.frame('terrain',base+((x/64*13+y/64*7)%4));c.drawImage(bank.images.terrain,f.cell.x,f.cell.y,f.cell.w,f.cell.h,x,y,64,64);}
 c.fillStyle='#202a24aa';for(const b of [[0,0,1600,160],[0,1000,1600,80],[0,160,140,840],[1460,160,140,840]])c.fillRect(...b);
 c.strokeStyle='#9e8b6138';c.lineWidth=5;c.strokeRect(180,210,1240,740);
 if(id==='c1TrainingYard'){for(const x of [870,1110]){c.strokeStyle='#c0a36d77';c.lineWidth=4;c.beginPath();c.ellipse(x,590,165,220,0,0,Math.PI*2);c.stroke();}c.fillStyle='#6f5a3d50';c.fillRect(220,400,340,460);}
 if(id==='c1DrillGallery'){c.strokeStyle='#b59b6266';c.lineWidth=7;for(const y of [330,850]){c.beginPath();c.moveTo(300,550);c.lineTo(490,y);c.lineTo(1260,y);c.lineTo(1310,800);c.stroke();}c.strokeStyle='#9b6651';c.lineWidth=3;c.beginPath();c.moveTo(530,290);c.lineTo(530,890);c.stroke();}
 if(id==='c1LoomRoom'){for(const [x,y,w,h,color]of [[240,370,340,500,'#758d6938'],[650,360,340,420,'#ad88513a'],[1060,300,330,450,'#69989930']]){c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeStyle='#b2a48066';c.lineWidth=3;c.strokeRect(x,y,w,h);}}
 if(id==='c1NorthWalk'){c.fillStyle='#193f4be0';c.fillRect(680,180,130,800);c.strokeStyle='#a4c1bd66';for(let y=240;y<980;y+=65){c.beginPath();c.moveTo(705,y);c.lineTo(750,y+14);c.lineTo(782,y);c.stroke();}c.strokeStyle='#93876f';c.lineWidth=8;c.strokeRect(670,180,150,800);}
 if(id==='c1ReedKiln'){c.fillStyle='#342f2b88';c.beginPath();c.ellipse(1080,420,280,200,0,0,Math.PI*2);c.fill();c.strokeStyle='#92765a88';c.lineWidth=12;c.beginPath();c.ellipse(1080,420,285,205,0,Math.PI,Math.PI*2);c.stroke();c.strokeStyle='#bbab7155';c.lineWidth=5;c.beginPath();c.moveTo(430,780);c.lineTo(840,560);c.lineTo(880,350);c.stroke();}
 return canvas;
}
export function drawC1Prop(c,bank,g,p){if(!p.action?.startsWith('c1:'))return false;const key=p.action.slice(3),h=g.c1Expansion?.worldChanges||{};
 c.save();c.translate(p.x,p.y);c.fillStyle='#161c1966';c.beginPath();c.ellipse(0,0,26,9,0,0,7);c.fill();
 const machine=['loom','pressure','plank','leak','kiln-intake','kiln-exhaust','sluice','lamp-valve'].includes(key)||key.startsWith('patrol-');
 if(machine){c.fillStyle='#5f5747';c.fillRect(-24,-42,48,32);c.strokeStyle='#bda675';c.lineWidth=5;c.beginPath();c.arc(0,-35,key==='loom'?25:16,0,Math.PI*2);c.moveTo(-20,-35);c.lineTo(20,-35);c.moveTo(0,-55);c.lineTo(0,-15);c.stroke();if(key==='loom'){c.strokeStyle='#b3c6b8';c.lineWidth=2;for(let x=-18;x<20;x+=6){c.beginPath();c.moveTo(x,-55);c.lineTo(x,-8);c.stroke();}}}
 else if(key.includes('lamp')){c.fillStyle='#786e54';c.fillRect(-5,-49,10,43);c.fillStyle=h.lampFixed||key!=='lamp-right'?'#e8c987':'#ac9b6d';c.fillRect(-13,-60,26,19);if(key==='lamp-right'&&!h.lampFixed){c.fillStyle='#282720';c.beginPath();c.ellipse(14,4,15,6,0,0,7);c.fill();}}
 else if(key==='board'||key==='wall-seal'){c.fillStyle=h.wallSealed?'#8a7855':'#6e5a40';c.rotate(h.wallSealed?0:.22);c.fillRect(-35,-28,70,21);c.strokeStyle='#ad9871';c.lineWidth=2;c.strokeRect(-35,-28,70,21);}
 else if(['training-target','warning-target'].includes(key)){drawC1Target(c,{x:0,y:0,c1Training:true});}
 else if(key==='wall-hole'){c.fillStyle='#171e1c';c.beginPath();c.ellipse(0,-12,27,16,0,Math.PI,0);c.fill();}
 else if(['healthy','branch'].includes(key)){bank.draw(c,'chapterFurnishings',8,0,-4,66,44);if(key==='branch'&&!h.herbGarden){c.strokeStyle='#6c5340';c.lineWidth=8;c.beginPath();c.moveTo(-35,-9);c.lineTo(37,-22);c.stroke();}}
 else if(key==='cart'){bank.draw(c,'chapterSettlement',4,0,-4,85,69);bank.draw(c,'chapterObjects',1,37,4,39,42);}
 else if(key==='cloth'){c.fillStyle='#9a8771';c.beginPath();c.moveTo(-24,-23);c.lineTo(15,-31);c.lineTo(24,0);c.lineTo(-18,-4);c.fill();}
 else if(key==='mud'){c.strokeStyle='#514b3c';c.lineWidth=5;for(let i=0;i<5;i++){c.beginPath();c.moveTo(i*15-35,i%2*8);c.lineTo(i*15-25,-15);c.stroke();}}
 else if(key==='shelter'){bank.draw(c,'chapterArchitecture',5,0,0,160,120);}
 else if(key==='kettle'){bank.draw(c,'chapterObjects',0,0,0,36,45);}
 else if(key==='kiln-ladder'){c.strokeStyle='#b09b74';c.lineWidth=5;for(const x of [-18,18]){c.beginPath();c.moveTo(x,-85);c.lineTo(x,0);c.stroke();}for(let y=-78;y<0;y+=15){c.beginPath();c.moveTo(-18,y);c.lineTo(18,y);c.stroke();}}
 else if(key==='sample-tray'){bank.draw(c,'chapterUtilities',12,0,0,76,54);}
 else if(['wet-a','wet-b','kiln-node'].includes(key)){bank.draw(c,'chapterUtilities',14,0,0,54,34);c.strokeStyle=h.leakFixed?'#b2d1b5':'#94adc0';c.lineWidth=2;c.strokeRect(-14,-25,28,15);}
 else if(key==='transmission'){bank.draw(c,'chapterObjects',1,0,0,74,68);}
 else if(key.includes('sign')||key==='entry-rule'){bank.draw(c,'chapterFurnishings',10,0,0,58,80);}
 else {bank.draw(c,'chapterFurnishings',9,0,-3,48,34);}
 c.restore();return true;
}
export function drawC1Telegraph(c,t){if(!t)return;c.save();c.fillStyle='#e6aa553d';c.strokeStyle='#f5cc87';c.lineWidth=3;c.translate(t.x,t.y);c.beginPath();if(t.shape==='circle')c.arc(0,0,t.r,0,Math.PI*2);else if(t.shape==='cone'){c.moveTo(0,0);c.arc(0,0,t.r,t.a-t.arc,t.a+t.arc);c.closePath();}else{c.rotate(t.a);c.rect(0,-t.width/2,t.length,t.width);}c.fill();c.stroke();c.restore();}
export function drawC1World(c,g){const h=g.c1Expansion?.worldChanges||{};
 if(g.map==='c1NorthWalk'&&h.plank){c.fillStyle='#8e7453';c.fillRect(660,493,180,95);c.strokeStyle='#c2a47a';c.lineWidth=3;for(let x=670;x<835;x+=18){c.beginPath();c.moveTo(x,497);c.lineTo(x,584);c.stroke();}}
 if(g.map==='c1ReedKiln'&&h.kilnExhaust){c.strokeStyle='#bbd2c26b';c.lineWidth=2;for(let i=0;i<8;i++){c.beginPath();c.moveTo(430+i*6,760);c.quadraticCurveTo(780,540,880+i*4,280);c.stroke();}}
 if(g.map==='c1LoomRoom'&&h.samplesSealed){for(let x=1150;x<1240;x+=30){c.fillStyle='#9ac7bc';c.fillRect(x,355,19,30);c.fillStyle='#cbb891';c.fillRect(x-1,351,21,6);}}
 drawC1Telegraph(c,g.c1TrainingSession?.warning);
 for(const e of g.enemies)if(!e.dead&&e.telegraph?.c1)drawC1Telegraph(c,e.telegraph);
}
export function drawC1Target(c,e){if(!e.c1Training)return false;c.save();c.translate(e.x,e.y);c.fillStyle='#8d7652';c.fillRect(-7,-86,14,86);c.fillRect(-44,-59,88,10);c.fillStyle='#bcb08b';c.beginPath();c.ellipse(0,-69,21,25,0,0,7);c.fill();c.strokeStyle='#675237';c.lineWidth=4;c.beginPath();c.arc(0,-69,14,0,7);c.stroke();c.restore();return true;}
export function drawC1Elite(c,e){if(!e.c1Custom)return;c.save();c.translate(e.x,e.y);const sign=Math.cos(e.angle||0)<0?-1:1;c.scale(sign,1);c.strokeStyle='#d0c3a2';c.fillStyle='#66574f';c.lineWidth=3;
 if(e.type==='rat'){c.beginPath();c.moveTo(14,-24);c.lineTo(22,-17);c.lineTo(25,-31);c.moveTo(24,-23);c.lineTo(31,-18);c.lineTo(34,-29);c.stroke();}
 if(e.type==='wolf'){for(let x=-27;x<27;x+=9){c.beginPath();c.moveTo(x,-36);c.lineTo(x-5,-49);c.lineTo(x+8,-37);c.fill();c.stroke();}}
 if(e.type==='bat'){c.strokeStyle='#b8a984';c.lineWidth=2;for(const side of [-1,1]){c.beginPath();c.moveTo(side*12,-43);c.quadraticCurveTo(side*34,-71,side*57,-39);c.lineTo(side*27,-35);c.stroke();}}
 c.restore();}

export function drawC1Scenery(c,bank,o){if(!o.c1Scenery)return false;const [x,y,w,h]=o.box;
 c.save();c.fillStyle='#111a1770';c.fillRect(x-5,y+h-5,w+16,18);
 if(o.c1Scenery==='workbench'){bank.draw(c,'chapterUtilities',1,o.x,o.y,w,h+65);}
 else if(o.c1Scenery==='training-rack'){c.fillStyle='#665139';c.fillRect(x,y+h-53,w,13);for(const dx of [12,w-20])c.fillRect(x+dx,y+h-70,9,70);for(let dx=35;dx<w-18;dx+=29){c.strokeStyle='#bac0ab';c.lineWidth=4;c.beginPath();c.moveTo(x+dx,y+h-76);c.lineTo(x+dx-8,y+h-11);c.stroke();c.strokeStyle='#8c7652';c.lineWidth=6;c.beginPath();c.moveTo(x+dx-14,y+h-24);c.lineTo(x+dx+2,y+h-23);c.stroke();}}
 else{c.fillStyle=o.c1Scenery==='kiln-pier'?'#5b4b40':'#68695d';c.fillRect(x,y-22,w,h+22);c.fillStyle='#9b9580';c.fillRect(x,y-22,w,11);c.strokeStyle='#292f2b';c.lineWidth=2;for(let row=0;row<(h+22)/22;row++){const py=y-22+row*22;c.beginPath();c.moveTo(x,py);c.lineTo(x+w,py);c.stroke();for(let dx=row%2*23;dx<w;dx+=46){c.beginPath();c.moveTo(x+dx,py);c.lineTo(x+dx,Math.min(py+22,y+h));c.stroke();}}}
 c.restore();return true;
}
