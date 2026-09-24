import {actorHeightV281,nativeMonsterTypeV281,movingPoseV281,walkPhaseV281} from './presentation-metrics-v281.js';
const feetCache=new WeakMap();
export function frameFootPointsV281(bank,sheet,index,f,unit,foot){
 let cache=feetCache.get(bank);if(!cache){cache=new Map();feetCache.set(bank,cache);}const key=sheet+':'+index+':'+f.x+':'+f.y;
 let points=cache.get(key);
 if(!points){
  points=[];try{
   const image=bank.images[sheet],height=Math.max(2,Math.ceil(f.h*.23)),top=f.y+f.h-height;
   const pixels=image.getContext('2d',{willReadFrequently:true}).getImageData(f.x,top,f.w,height).data;
   for(const [lo,hi]of [[0,Math.floor(f.w/2)],[Math.floor(f.w/2),f.w]]){
    let found=null;for(let yy=height-1;yy>=0&&!found;yy--){let n=0,sum=0;for(let xx=lo;xx<hi;xx++)if(pixels[(yy*f.w+xx)*4+3]>180){n++;sum+=xx;}if(n>=2)found=[f.x-f.cell.x+sum/n,top-f.cell.y+yy];}
    if(found)points.push(found);
   }
  }catch{/* Texture access is optional; never misplace an invented boot. */}
  cache.set(key,points);
 }
 return points.map(([x,y])=>[(x-foot[0])*unit,(y-foot[1])*unit]);
}
export function drawCutoutGaitV281(c,image,src,dest,a){
 const [sx,sy,sw,sh]=src,[x,y,w,h]=dest;
 if(!movingPoseV281(a)){c.drawImage(image,sx,sy,sw,sh,x,y,w,h);return;}
 // Four contact poses articulate the two lower legs independently. The head is not rocked.
 const phase=walkPhaseV281(a,72,4),offset=[-.75,0,.75,0][phase],split=Math.round(sh*.72),dh=h*split/sh;
 c.drawImage(image,sx,sy,sw,split,x,y,w,dh);
 const half=Math.floor(sw/2),leftWidth=w*half/sw;
 c.drawImage(image,sx,sy+split,half,sh-split,x,y+dh+offset,leftWidth,h-dh);
 c.drawImage(image,sx+half,sy+split,sw-half,sh-split,x+leftWidth,y+dh-offset,w-leftWidth,h-dh);
}
function poly(c,p,fill,stroke='#473e35',width=.8){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function stroke(c,p,color,width=1){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function hash(id){let n=0;for(const x of String(id||''))n=(Math.imul(n,31)+x.charCodeAt(0))>>>0;return n;}
export function monsterStyleV281(a,aliases={}){
 const type=nativeMonsterTypeV281(a,aliases),height=actorHeightV281(a,'enemy',aliases),seed=hash(a.id||a.type),tier=Math.max(1,Math.min(8,Math.ceil((a.level||1)/5)));
 const boss=!!a.isBoss||['captain','hellJailer','ironScuttler','furnaceSentinel','odric','martha','severin','bloodDemon'].includes(type);
 const own={ch5Gatekeeper:'sunward',v25FinalJudge:'judgement',v25PursuitKnight:'black-cape',v25TrialMaster:'stone-crown',v25BrokerChief:'split-banner',v25GrainChief:'quartered-shield',v25BridgeMarshal:'plume'}[a.type];
 const ornament=own||(boss?{captain:'plume',hellJailer:'chains',ironScuttler:'bone-ridge',furnaceSentinel:'furnace',odric:'split-banner',martha:'reliquary',severin:'black-cape',bloodDemon:'none'}[type]:/Hound$/.test(type)||type==='wolf'?['collar','bone-ridge','mane'][tier%3]:/Soul$/.test(type)?['reliquary','ribbons','cowl'][tier%3]:type==='guard'||/Guard$/.test(type)||type==='deepElite'?['pauldrons','quartered-shield','plume'][seed%3]:'none');
 return {type,height,boss,ornament,tier,seed};
}
export function drawMonsterOrnamentV281(c,a,style,time,behind=false){
 if(style.ornament==='none'||a.memoryCorpse)return;
 const {height:h,ornament:k,tier}=style,sway=movingPoseV281(a)?Math.sin((a.walkDistance||0)/20)*.8:0;
 const dark=tier>5?'#39333e':'#4c4944',metal=tier>5?'#a79cac':'#b4a992',gold='#c6aa6c';
 c.save();c.translate(Math.round(a.x),Math.round(a.y));if(Math.cos(a.angle||0)<0)c.scale(-1,1);if(a.fall)c.rotate(Math.min(1,a.fall)*1.43);
 if(behind){
  if(['black-cape','split-banner','judgement'].includes(k)){
   for(const side of [-1,1])poly(c,[[side*h*.13,-h*.73],[side*(h*.25+sway),-h*.40],[side*h*.24,-h*.18],[side*h*.12,-h*.29],[side*h*.07,-h*.67]],k==='judgement'?'#b5b0a0':dark,k==='judgement'?gold:'#615766',.8);
  }
  if(k==='sunward'){
   c.beginPath();c.arc(0,-h*.78,h*.27,Math.PI,Math.PI*2);c.strokeStyle=gold;c.lineWidth=2;c.stroke();
   for(let i=0;i<7;i++){const angle=Math.PI+i*Math.PI/6;stroke(c,[[Math.cos(angle)*h*.29,-h*.78+Math.sin(angle)*h*.29],[Math.cos(angle)*h*.34,-h*.78+Math.sin(angle)*h*.34]],'#ddc48b',1.4);}
  }
  if(k==='ribbons')for(const side of [-1,1])poly(c,[[side*h*.15,-h*.72],[side*(h*.29+sway),-h*.24],[side*h*.20,-h*.11],[side*h*.21,-h*.43]],'#746f80','#4d485c',.65);
  c.restore();return;
 }
 if(k==='pauldrons')for(const side of [-1,1]){
  // Small curved ridges sit on the native shoulder instead of flat floating boxes.
  c.beginPath();c.moveTo(side*h*.12,-h*.77);c.quadraticCurveTo(side*h*.20,-h*.79,side*h*.25,-h*.70);c.quadraticCurveTo(side*h*.20,-h*.68,side*h*.16,-h*.69);c.closePath();
  c.fillStyle=dark;c.fill();c.strokeStyle=metal;c.lineWidth=.55;c.stroke();
 }
 if(k==='judgement'){
  stroke(c,[[h*.02,-h*.74],[h*.13,-h*.60]],gold,1);
  poly(c,[[h*.12,-h*.60],[h*.18,-h*.60],[h*.17,-h*.35],[h*.12,-h*.37]],'#a9a08a','#645e51',.6);
  for(let i=0;i<3;i++)stroke(c,[[h*.135,-h*.54+i*4],[h*.16,-h*.54+i*4]],'#65564b',.7);
 }
 if(k==='plume'||k==='stone-crown'){
  for(const side of [-1,1])poly(c,[[side*h*.025,-h*.91],[side*h*.09,-h*1.055],[side*h*.14,-h*1.005],[side*h*.075,-h*.91]],k==='plume'?'#81705d':'#8b948d',metal,.7);
 }
 if(k==='quartered-shield')poly(c,[[h*.15,-h*.61],[h*.27,-h*.58],[h*.25,-h*.46],[h*.18,-h*.41],[h*.13,-h*.49]],dark,gold,1);
 if(k==='collar'||k==='mane'){
  // Canine neck is forward of the shoulder. No humanoid helmet is pasted onto it.
  const x=h*.30,y=-h*.49;stroke(c,[[x-3,y-9],[x+1,y],[x-2,y+8]],k==='mane'?'#bbb5a4':'#77644b',k==='mane'?3:2);
 }
 if(k==='bone-ridge')for(let i=0;i<3;i++)poly(c,[[-h*.29+i*h*.16,-h*.66],[-h*.28+i*h*.16,-h*.75],[-h*.22+i*h*.16,-h*.66]],'#a9a18e','#585248',.4);
 if(k==='reliquary'){
  stroke(c,[[-h*.10,-h*.73],[0,-h*.54],[h*.09,-h*.72]],gold,.8);poly(c,[[-3,-h*.54],[0,-h*.59],[3,-h*.54],[0,-h*.47]],dark,gold,.7);
 }
 if(k==='chains')for(let i=0;i<4;i++){c.beginPath();c.ellipse(h*.29,-h*.59+i*6,2.2,3.2,.15,0,7);c.strokeStyle=metal;c.lineWidth=1;c.stroke();}
 if(k==='cowl')stroke(c,[[-h*.11,-h*.89],[0,-h*.99],[h*.10,-h*.88]],'#a8a09d',1.3);
 c.restore();
}
