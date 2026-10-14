import fs from 'node:fs';
import path from 'node:path';
import {browserSession,delay} from '../../tools/browser_session.mjs';
const out=path.resolve(process.argv[2]||'docs/c1-care-ui/baseline');fs.mkdirSync(out,{recursive:true});
const b=await browserSession(process.cwd(),`
window.__CARE={ready:()=>assetsReady,
 map:(map,collision=false)=>{flow=null;cine=null;flowPending=null;g=new RPG('shadow');g.chapter=2;g.flags.chapterCardsV17=[1,2,3,4,5,6,7,8];g.enter(map,800,850);g.relocate(g.p.x,g.p.y);g.events=[];g.pending=null;g.active=false;mode='pause';chapterCards.attach(g,{restored:true});cam={x:800,y:540};scale=Math.min(w/1600,h/1080);ui.style.visibility='hidden';notice.style.visibility='hidden';draw();const cells=[];if(collision){ctx.save();ctx.translate(w/2-view.x*scale,h/2-view.y*scale);ctx.scale(scale,scale);for(let y=10;y<1080;y+=20)for(let x=10;x<1600;x+=20){const blocked=g.blocked(x,y,false);cells.push({x,y,blocked});ctx.fillStyle=blocked?'#d4484866':'#39c68544';ctx.fillRect(x-10,y-10,20,20);}ctx.restore();}return {image:canvas.toDataURL('image/png').split(',')[1],cells,npcs:g.npcs.map(n=>({id:n.id,x:n.x,y:n.y})),frames:bank.frames.c1UnderNPC};},
 portrait:(name)=>bank.portrait(name),
 npc:(id)=>{ui.style.visibility='visible';notice.style.visibility='visible';npc(id);},
};`);
try{
 await b.wait('window.__CARE?.ready()',120000);
 for(const [map,id,name]of [['c1TrialFoyer','c1iden','伊登'],['c1TrialCrypt','c1hesha','赫莎'],['c1TrialVault','c1venn','维恩']]){
  for(const collision of [false,true]){const r=await b.evaluate(`__CARE.map('${map}',${collision})`);fs.writeFileSync(path.join(out,map+(collision?'-collision':'')+'.png'),Buffer.from(r.image,'base64'));delete r.image;fs.writeFileSync(path.join(out,map+(collision?'-collision':'')+'.json'),JSON.stringify(r,null,2));}
  await b.evaluate(`__CARE.npc('${id}')`);await delay(300);await b.shot(path.join(out,id+'-dialogue.png'));
  const url=await b.evaluate(`__CARE.portrait('${name}')`);fs.writeFileSync(path.join(out,id+'-portrait.png'),Buffer.from(url.split(',')[1],'base64'));
 }
 if(b.errors.length)throw Error(JSON.stringify(b.errors));console.log('Captured three actual underground maps, collision grids and NPC portraits.');
}finally{await b.close();}
