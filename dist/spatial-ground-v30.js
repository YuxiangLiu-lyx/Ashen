import {WATERS,BRIDGES} from './world-v14.js';
import {SPATIAL_TERRAIN_V30} from './spatial-design-v30.js';
export const traceTerrainV30=(c,points)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
// Geometry is shared with blocked(): banks, cliff faces and wooded slopes cannot
// look like empty playable grass. No repeated stone sprite fence along the water.
export function drawSpatialTerrainV30(c,bank,id){
 for(const region of SPATIAL_TERRAIN_V30[id]||[]){
  if(region.kind==='water')continue;
  // A raised rock shelf has a textured top and a vertical face. Its bottom edge
  // is the collision polygon; the perspective overhang extends only upward.
  const top=region.points.map(([x,y])=>[x,y-42]),f=bank.frame('chapterHellMaterials',0),im=bank.images.chapterHellMaterials;
  c.save();traceTerrainV30(c,region.points);c.shadowColor='#10151890';c.shadowBlur=15;c.shadowOffsetY=8;c.fillStyle='#303434';c.fill();c.restore();
  c.save();traceTerrainV30(c,top);c.clip();
  if(f&&im)for(let y=0;y<1080;y+=245)for(let x=0;x<1600;x+=245)c.drawImage(im,f.cell.x,f.cell.y,f.cell.w,f.cell.h,x,y,245,245);
  c.fillStyle='#232b2b45';c.fillRect(0,0,1600,1080);c.restore();
  for(let i=0;i<region.points.length;i++){
   const a=region.points[i],b=region.points[(i+1)%region.points.length];if(b[0]>=a[0])continue;
   traceTerrainV30(c,[a,b,[b[0],b[1]-42],[a[0],a[1]-42]]);const shade=c.createLinearGradient(0,Math.min(a[1],b[1])-42,0,Math.max(a[1],b[1]));shade.addColorStop(0,'#737671');shade.addColorStop(.35,'#454b49');shade.addColorStop(1,'#232929');c.fillStyle=shade;c.fill();
   c.strokeStyle='#151b1b55';c.lineWidth=1;for(let t=.17;t<1;t+=.23){const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;c.beginPath();c.moveTo(x-5,y-39);c.lineTo(x,y-17);c.lineTo(x-3,y);c.stroke();}
  }
 }
}
export function drawSpatialWaterV30(c,bank,id){
 const water=WATERS[id]||[],rivers=(SPATIAL_TERRAIN_V30[id]||[]).filter(r=>r.kind==='water');if(!water.length&&!rivers.length)return;
 c.save();c.beginPath();for(const b of water)c.rect(...b);for(const r of rivers){r.points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}c.clip();
 const shade=c.createLinearGradient(450,0,1000,1080);shade.addColorStop(0,'#3d5954');shade.addColorStop(.5,'#293e44');shade.addColorStop(1,'#496159');c.fillStyle=shade;c.fillRect(0,0,1600,1080);
 c.strokeStyle='#b8cac326';c.lineWidth=1;for(let y=170;y<980;y+=43){c.beginPath();c.moveTo(100,y);c.bezierCurveTo(500,y-5,1150,y+9,1490,y-2);c.stroke();}c.restore();
 // Trace only exposed segment edges, avoiding artificial seams between river bends.
 const wet=(x,y)=>water.some(([a,b,w,h])=>x>a&&x<a+w&&y>b&&y<b+h);
 c.lineWidth=6;c.strokeStyle='#62685c';c.lineCap='round';
 for(const [x,y,w,h]of water)for(const [a,b,n]of [[[x,y],[x+w,y],[0,-1]],[[x+w,y],[x+w,y+h],[1,0]],[[x+w,y+h],[x,y+h],[0,1]],[[x,y+h],[x,y],[-1,0]]]){
  const length=Math.hypot(b[0]-a[0],b[1]-a[1]),steps=Math.ceil(length/8);
  for(let i=0;i<steps;i++){const t=(i+.5)/steps;if(wet(a[0]+(b[0]-a[0])*t+n[0],a[1]+(b[1]-a[1])*t+n[1]))continue;c.beginPath();c.moveTo(a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps);c.lineTo(a[0]+(b[0]-a[0])*(i+1)/steps,a[1]+(b[1]-a[1])*(i+1)/steps);c.stroke();}
 }
 for(const r of rivers){c.save();c.lineJoin='round';traceTerrainV30(c,r.points);c.filter='blur(5px)';c.strokeStyle='#72715380';c.lineWidth=18;c.stroke();c.filter='none';traceTerrainV30(c,r.points);c.strokeStyle='#69725c80';c.lineWidth=3;c.stroke();c.restore();}
 const b=BRIDGES[id];if(b){c.save();if(bank.images.spatialBridge)bank.draw(c,'spatialBridge',0,b.x+b.w/2,b.y+b.h,b.w,b.h);else bank.draw(c,'chapterArchitecture',7,b.x+b.w/2,b.y+b.h,b.w,b.h);c.restore();}
}
