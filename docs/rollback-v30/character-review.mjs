// Read-only rendering evidence using an isolated browser and the installed game.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {browserSession} from '../../tools/browser_session.mjs';
const hook=`window.__ROLLBACK_ROLES={ready:()=>assetsReady,capture:()=>{
 const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=650;
 const c=canvas.getContext('2d');c.fillStyle='#34413b';c.fillRect(0,0,1440,650);
 for(const [row,type,portrait] of [[0,'guard',6],[1,'captain',8]]){
  bank.draw(c,'npcPortraits5',portrait,85,row*320+220,120,180);
  c.fillStyle='#eee';c.font='18px sans-serif';c.fillText(type+' reference',10,row*320+265);
  for(let i=0;i<8;i++){
   const x=255+(i%4)*330,y=row*320+(i<4?130:285);
   const a={type,id:'rollback-role',x,y,angle:i<4?0:-1.2,moving:i%4<2,walkDistance:i%4*38,wind:i%4===2?.15:0,windMax:.45,attackAnim:i%4===3?.2:0};
   c.strokeStyle='#a8b598';c.beginPath();c.moveTo(x-60,y);c.lineTo(x+60,y);c.stroke();
   drawMonster(c,bank,a,0,{natural:true});
  }
 }
 return canvas.toDataURL('image/webp',.95).split(',')[1];
}};`;
const b=await browserSession(process.cwd(),hook);
try{
 await b.wait('window.__ROLLBACK_ROLES?.ready()',120000);
 fs.writeFileSync('docs/rollback-v30/browser/role-reference.webp',Buffer.from(await b.evaluate('__ROLLBACK_ROLES.capture()'),'base64'));
 assert.deepEqual(b.errors,[]);
 console.log('Captured restored guard/captain front/back movement and attack with original portrait references. Original shared atlas and scaling remain by explicit snapshot rollback.');
}finally{await b.close();}
