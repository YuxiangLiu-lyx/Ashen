// Dedicated first-chapter actors. Animation is sampled from actual distance and
// attack telegraphs; art has no access to HP, pathfinding, cooldowns or rewards.
export const C1_PURSUIT_LOADS=[
 ['c1Guard','assets/c1-incremental/pursuit-guard.png',4,4,false],
 ['c1Elite','assets/c1-incremental/pursuit-elite.png',4,4,false],
 ['c1Officer','assets/c1-incremental/pursuit-officer.png',4,4,false]
];
export function pursuitFrame(a){
 const back=Math.sin(a.angle||0)<-.22?8:0;
 if(a.wind>0)return back+4+(a.wind/(a.windMax||.45)<.45?1:0);
 if(a.attackAnim>0)return back+(a.attackAnim>.14?6:7);
 return back+(a.moving?Math.floor((a.walkDistance||0)/38)%4:1);
}
export function installPursuitFrames(bank,name,data){
 if(!['c1Guard','c1Elite','c1Officer'].includes(name))return;
 const image=bank.images[name],frames=bank.frames[name];
 // Label whole connected cutouts before sampling cells. This also removes
 // neighbouring-column sword tips from recovery frames without editing assets.
 const width=image.width,height=image.height,labels=new Int32Array(width*height),parts=[];
 for(let start=0;start<labels.length;start++){
  if(labels[start]||data.data[start*4+3]<20)continue;
  const label=parts.length+1,queue=[start];labels[start]=label;
  let x0=width,y0=height,x1=0,y1=0;
  for(let n=0;n<queue.length;n++){
   const at=queue[n],x=at%width,y=Math.floor(at/width);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const xx=x+dx,yy=y+dy,k=yy*width+xx;if(xx<0||xx>=width||yy<0||yy>=height||labels[k]||data.data[k*4+3]<20)continue;
    labels[k]=label;queue.push(k);
   }
  }
  parts.push({label,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,count:queue.length});
 }
 const actors=parts.filter(p=>p.count>width*height*.008);
 if(actors.length===16){
  for(let i=0;i<16;i++){
   const row=Math.floor(i/4),col=i%4,candidates=actors.filter(p=>Math.floor((p.x+p.w*.5)/width*4)===col&&Math.floor((p.y+p.h*.5)/height*4)===row);
   if(candidates.length!==1)throw Error('Ambiguous pursuit cutout '+name+':'+i);
   const p=candidates[0],bitmap=document.createElement('canvas');bitmap.width=p.w;bitmap.height=p.h;
   const c=bitmap.getContext('2d'),pixels=c.createImageData(p.w,p.h);
   for(let y=0;y<p.h;y++)for(let x=0;x<p.w;x++){
    const at=(p.y+y)*width+p.x+x;if(labels[at]===p.label)for(let ch=0;ch<4;ch++)pixels.data[(y*p.w+x)*4+ch]=data.data[at*4+ch];
   }c.putImageData(pixels,0,0);
   Object.assign(frames[i],{x:p.x,y:p.y,w:p.w,h:p.h,bitmap,cell:{x:Math.round(col*width/4),y:Math.round(row*height/4),w:Math.round(width/4),h:Math.round(height/4)},cutout:true});
  }
 }
 // Generated rows are separated by transparent gaps, not exact quarter pixels.
 // Find each column's gap so a raised blade cannot bleed into the preceding row.
 for(let col=0;col<4;col++){
  const x=Math.round(col*image.width/4),right=Math.round((col+1)*image.width/4),ys=[0];
  for(let row=1;row<4;row++){
   let best=Infinity,edge=Math.round(row*image.height/4);
   for(let y=Math.round((row/4-.025)*image.height);y<Math.round((row/4+.025)*image.height);y++){
    let count=0;for(let xx=x;xx<right;xx++)if(data.data[(y*image.width+xx)*4+3]>120)count++;
    const score=count+Math.abs(y-row*image.height/4)*.01;
    if(score<best){best=score;edge=y;}
   }ys.push(edge);
  }ys.push(image.height);
  for(let row=0;row<4;row++){
   const f=frames[row*4+col],top=ys[row],bottom=ys[row+1];
   let x0=right,y0=bottom,x1=x,y1=top;
   for(let y=top;y<bottom;y++)for(let xx=x;xx<right;xx++)if(data.data[(y*image.width+xx)*4+3]>120){x0=Math.min(x0,xx);x1=Math.max(x1,xx);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   if(!f.cutout)Object.assign(f,{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,cell:{x,y:top,w:right-x,h:bottom-top}});
  }
 }
 for(const f of frames){
  // Anchor the soles, never the sword tip/cape. Equal cell scale prevents a
  // wide attack pose from changing the actor's body height.
  let bottom=f.y+f.h-1;
  const left=Math.round(f.cell.x+f.cell.w*.28),right=Math.round(f.cell.x+f.cell.w*.72);
  for(let y=f.y+f.h-1;y>=f.y;y--){
   let count=0;for(let x=left;x<right;x++)if(data.data[(y*image.width+x)*4+3]>120)count++;
   if(count>3){bottom=y;break;}
  }
  // Centre on the supporting feet, independent of shield/cape/weapon width.
  let sum=0,count=0;
  for(let y=bottom-8;y<=bottom;y++)for(let x=left;x<right;x++)if(data.data[(y*image.width+x)*4+3]>120){sum+=x;count++;}
  f.foot={x:count?sum/count:f.cell.x+f.cell.w*.5,y:bottom};
 }
}
export const pursuitSheet=a=>a.type==='captain'?'c1Officer':a.type==='guard'?(a.elite?'c1Elite':'c1Guard'):null;
export function drawPursuit(ctx,bank,a){
 const sheet=pursuitSheet(a);
 const f=sheet&&bank.frame(sheet,pursuitFrame(a));if(!f?.foot)return false;
 const reference=Math.max(...bank.frames[sheet].slice(0,4).map(f=>f.h));
 const k=82/reference;
 ctx.save();ctx.translate(a.x,a.y);if(Math.cos(a.angle||0)<0)ctx.scale(-1,1);
 ctx.imageSmoothingEnabled=true;
 ctx.drawImage(f.bitmap||bank.images[sheet],f.bitmap?0:f.x,f.bitmap?0:f.y,f.w,f.h,(f.x-f.foot.x)*k,(f.y-f.foot.y)*k,f.w*k,f.h*k);
 ctx.restore();return true;
}
