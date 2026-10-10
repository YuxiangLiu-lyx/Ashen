// Dedicated first-chapter actors. Animation is sampled from actual distance and
// attack telegraphs; art has no access to HP, pathfinding, cooldowns or rewards.
export const C1_PURSUIT_LOADS=[
 ['c1Guard','assets/c1-incremental/pursuit-guard.png',4,4,false],
 ['c1Officer','assets/c1-incremental/pursuit-officer.png',4,4,false]
];
export function pursuitFrame(a){
 const back=Math.sin(a.angle||0)<-.22?8:0;
 if(a.wind>0)return back+4+(a.wind/(a.windMax||.45)<.45?1:0);
 if(a.attackAnim>0)return back+(a.attackAnim>.14?6:7);
 return back+(a.moving?Math.floor((a.walkDistance||0)/38)%4:1);
}
export function installPursuitFrames(bank,name,data){
 if(!['c1Guard','c1Officer'].includes(name))return;
 const image=bank.images[name],frames=bank.frames[name];
 for(const f of frames){
  // Anchor the soles, never the sword tip/cape. Equal cell scale prevents a
  // wide attack pose from changing the actor's body height.
  let bottom=f.y+f.h-1;
  const left=Math.round(f.cell.x+f.cell.w*.28),right=Math.round(f.cell.x+f.cell.w*.72);
  for(let y=f.cell.y+f.cell.h-1;y>=f.cell.y;y--){
   let count=0;for(let x=left;x<right;x++)if(data.data[(y*image.width+x)*4+3]>120)count++;
   if(count>3){bottom=y;break;}
  }
  f.foot={x:f.cell.x+f.cell.w*.5,y:bottom};
 }
}
export function drawPursuit(ctx,bank,a,height){
 const sheet=a.type==='captain'?'c1Officer':a.type==='guard'?'c1Guard':null;
 const f=sheet&&bank.frame(sheet,pursuitFrame(a));if(!f?.foot)return false;
 const reference=Math.max(...bank.frames[sheet].slice(0,4).map(f=>f.h));
 const k=height/reference;
 ctx.save();ctx.translate(a.x,a.y);if(Math.cos(a.angle||0)<0)ctx.scale(-1,1);
 ctx.imageSmoothingEnabled=true;
 ctx.drawImage(bank.images[sheet],f.x,f.y,f.w,f.h,(f.x-f.foot.x)*k,(f.y-f.foot.y)*k,f.w*k,f.h*k);
 ctx.restore();return true;
}
