// Despill generated chroma edges only; preserve the original PNGs and skin tones.
export function cleanNarrativeKeyV30(data,name){
 if(!['elyriaGentleV30','elyriaResoluteV30','narrativeStores'].includes(name))return;
 const p=data.data,w=data.width,h=data.height,source=new Uint8ClampedArray(p);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*4;if(!p[i+3]||p[i]<=p[i+1]+8||p[i+2]<=p[i+1]+4)continue;
  let edge=false;for(let dy=-12;dy<=12&&!edge;dy++)for(let dx=-12;dx<=12;dx++){
   const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<w&&yy<h&&!source[(yy*w+xx)*4+3]){edge=true;break;}
  }
  if(edge){p[i]=Math.min(p[i],p[i+1]+8);p[i+2]=Math.min(p[i+2],p[i+1]+4);}
 }
}
// Relief stays inside solid wall rectangles; no new invisible geometry.
export function drawInteriorReliefV30(c,id,boundaries){
 if(!['hall','warehouse','chapel','guestroom','workshop','inn','chamber','bridgecellar','echo'].includes(id))return;
 const wood=['hall','warehouse','guestroom','workshop','inn'].includes(id);
 for(const [x,y,w,h]of boundaries){
  if(w<180||y>700)continue;
  const depth=Math.min(58,h),top=y+h-depth;
  const g=c.createLinearGradient(0,top,0,y+h);g.addColorStop(0,wood?'#675039a8':'#928c7d99');g.addColorStop(.16,wood?'#362a2255':'#514e4844');g.addColorStop(1,wood?'#382b2488':'#45454177');
  c.fillStyle=g;c.fillRect(x,top,w,depth);c.fillStyle='#aca08460';c.fillRect(x,top,w,3);c.fillStyle='#090d1190';c.fillRect(x,y+h-3,w,3);
  for(let xx=x+30;xx<x+w-20;xx+=wood?240:300){c.fillStyle=wood?'#171510c0':'#252b2dba';c.fillRect(xx+5,top+3,18,depth-3);c.fillStyle=wood?'#6a533c':'#7c7b6e';c.fillRect(xx,top-5,14,depth+2);c.fillStyle='#b4a08045';c.fillRect(xx,top-5,3,depth);}
 }
 if(id==='warehouse'){
  c.save();c.strokeStyle='#bdac8522';c.lineWidth=3;for(const d of [-28,28]){c.beginPath();c.moveTo(780+d,950);c.bezierCurveTo(790+d,755,735+d,510,550+d,520);c.stroke();}c.restore();
 }
 if(id==='chapel'){
  c.save();c.globalCompositeOperation='screen';
  for(const yy of [320,635]){const g=c.createLinearGradient(110,yy,610,yy+240);g.addColorStop(0,'#d9d4bc36');g.addColorStop(1,'#d9d4bc00');c.fillStyle=g;c.beginPath();c.moveTo(110,yy-28);c.lineTo(110,yy+28);c.lineTo(640,yy+270);c.lineTo(500,yy+270);c.closePath();c.fill();}
  c.restore();
 }
}
