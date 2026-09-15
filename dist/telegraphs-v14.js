import {paintedFX} from './combat-visuals-v14.js';
// Functional ground guidance follows the same radius/arc/width as collision.
// Fine luminous seams and painted sparks, never a filled debug-sector polygon.
export function drawBossWarning(c,bank,e,time){
 const t=e.telegraph;if(!t||!(e.wind>0))return;
 const p=Math.max(0,Math.min(1,1-e.wind/Math.max(.01,e.windMax))),a=t.a??e.angle;
 const fire=/furnace|iron|blood/.test(e.type),holy=e.type==='martha'||e.type==='trialBoss4',family=fire?'fire':holy?'holy':'spirit',color=fire?'#ffad72':holy?'#ffe4a0':'#9ddde9';
 const phase=Math.floor(time*10)%4;c.save();c.globalCompositeOperation='screen';c.strokeStyle=color;c.lineWidth=1.4+p*1.4;c.globalAlpha=.35+p*.55;
 if(t.shape==='circle'){
  const x=t.x??e.x,y=t.y??e.y,r=t.r||110;
  for(let i=0;i<8;i++){const b=i*Math.PI/4+.035;c.beginPath();c.arc(x,y,r,b,b+.70);c.stroke();paintedFX(c,bank,family,phase,x+Math.cos(b)*r,y+Math.sin(b)*r+15,27,32,b,.45+p*.4);}
  c.globalAlpha=.15+p*.35;c.beginPath();c.arc(x,y,r*(.22+.74*p),0,7);c.stroke();
 }else if(t.shape==='line'){
  const length=t.length||300,half=(t.width||32)/2,dx=Math.cos(a),dy=Math.sin(a);
  for(const side of [-1,1]){c.beginPath();c.moveTo(e.x-dy*half*side,e.y+dx*half*side);c.lineTo(e.x+dx*length-dy*half*side,e.y+dy*length+dx*half*side);c.stroke();}
  for(let i=1;i<=7;i++){const d=length*i/7;paintedFX(c,bank,family,(phase+i)%4,e.x+dx*d,e.y+dy*d+12,30,38,a,.25+p*.45);}
 }else{
  const r=t.r||150,arc=t.arc||.82;c.beginPath();c.arc(e.x,e.y,r,a-arc,a+arc);c.stroke();
  for(const side of [-1,1]){const angle=a+side*arc;c.beginPath();c.moveTo(e.x+Math.cos(angle)*30,e.y+Math.sin(angle)*30);c.lineTo(e.x+Math.cos(angle)*r,e.y+Math.sin(angle)*r);c.stroke();}
  for(let i=0;i<6;i++){const angle=a-arc+2*arc*i/5;paintedFX(c,bank,family,(phase+i)%4,e.x+Math.cos(angle)*r,e.y+Math.sin(angle)*r+12,30,40,angle,.3+p*.45);}
 }
 paintedFX(c,bank,family,phase,e.x+Math.cos(a)*27,e.y-38+Math.sin(a)*12,48+p*25,58+p*30,a,.75);c.restore();
}
export function bossTell(b){if(!b)return '';if(b.telegraph&&b.wind>0)return b.telegraph.label+' · '+(b.telegraph.shape==='line'?'离开两道光痕之间':b.telegraph.shape==='circle'?'走出地上的光圈':'移到首领侧后方');if(b.exposedUntil>0&&b.aiState==='COMBAT'&&b.cd>0)return '观察抬手与落点，重招结束后反击';return '普攻锁定命中 · 仅蓄力重招可走位避开';}
