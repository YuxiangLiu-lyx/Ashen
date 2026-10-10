// Presentation only: use the same object centre and reach/line test as the
// existing pointer handler. No new target, reward, collision or save fields.
const objects=new Set(['hallbook','townbook','letter','v29-road-sign','well']);
export function installChapterOneInteraction(RPG){
 const targets=RPG.prototype.targets;
 RPG.prototype.targets=function(){
  return targets.call(this).map(t=>this.map==='town'&&t.kind==='prop'&&t.id==='well'?{...t,y:735}:t);
 };
}
export function drawChapterOneInteraction(ctx,g,p){
 if(!objects.has(p.id)||p.used||Math.hypot(g.p.x-p.x,g.p.y-p.y)>=150)return false;
 const x=p.drawX??p.x,y=(p.drawY??p.y)-25;
 const target=p.id==='well'?{x:p.x,y:735}:p;
 const ready=Math.hypot(g.p.x-target.x,g.p.y-target.y)<115&&g.clearLine(g.p,target,false);
 ctx.save();ctx.strokeStyle=ready?'#e9d49b':'#d7ceaf77';ctx.lineWidth=1.5;
 for(const [dx,dy]of [[-1,-1],[1,-1],[-1,1],[1,1]]){
  ctx.beginPath();ctx.moveTo(x+dx*34,y+dy*25);ctx.lineTo(x+dx*34,y+dy*34);ctx.lineTo(x+dx*25,y+dy*34);ctx.stroke();
 }
 ctx.restore();return true;
}
