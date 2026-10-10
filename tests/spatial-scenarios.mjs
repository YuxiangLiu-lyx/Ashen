// Shared browser/Node scenarios call only public, installed RPG behavior.
// Fixtures select positions/levels/enemies; no damage, path or collision mocks.
export function runSpatialScenarios({RPG,stats,onScene}){
 const results=[],record=(g,row)=>{results.push(Object.fromEntries(Object.entries(row).map(([k,v])=>[k,typeof v==='number'?Number(v.toFixed(6)):v])));onScene?.(row.name,g);},check=(ok,message)=>{if(!ok)throw Error(message);},distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const make=(cls='shadow',map='road',x=1020,y=540)=>{const g=new RPG(cls,null,()=>.44);g.p.level=9;g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;g.enter(map,x,y);g.pending=null;g.transition=null;g.active=true;g.portCD=999;g.p.invuln=0;g.events=[];return g;};
 const tick=(g,seconds,input={})=>{for(let i=0;i<Math.round(seconds*60);i++){g.update(1/60,typeof input==='function'?input(i/60):input);check(!g.blocked(g.p.x,g.p.y),'player entered solid');}};
 const one=(g,type,x,y,id='spatial-fixture')=>{g.states[g.map].enemies=[g.enemy(type,x,y,id)];const e=g.enemies[0];g.target=e.id;return e;};
 {
  const g=make(),e=one(g,'guard',1080,540),hp=e.hp,mp=g.p.mp;g.attack();tick(g,.6);const hit=hp-e.hp;check(hit>0,'melee did not connect');g.requestSkill('q');tick(g,.3);check(g.p.mp<mp,'melee skill not released');record(g,{name:'melee-and-skill',damage:hp-e.hp,basicHit:hit,mpSpent:mp-g.p.mp});
 }
 {
  const g=make('ember','road',950,520),e=one(g,'guard',1230,520),hp=e.hp;g.attack();tick(g,1.15,{y:-.2});check(e.hp<hp,'ranged shot did not hit');const mp=g.p.mp;g.requestSkill('q');tick(g,1.2);check(g.p.mp<mp,'ranged skill not released');record(g,{name:'ranged-and-area-skill',damage:hp-e.hp,range:280,mpSpent:mp-g.p.mp});
 }
 {
  const g=make('ember','bridge',640,230),e=one(g,'guard',920,230),hp=e.hp;check(!g.clearLine(g.p,e,false),'river must block line of sight');g.attack();tick(g,1);check(e.hp===hp,'projectile crossed river collision');record(g,{name:'solid-blocks-projectile',damage:e.hp-hp});
 }
 {
  const g=make('shadow','road',1325,705),e=one(g,'wolf',1325,805),at={x:e.x,y:e.y};g.damage(e,1);check(!g.clearLine(g.p,e,false),'obstacle pursuit fixture needs an occluder');tick(g,3);check(distance(e,at)>65,'enemy did not navigate around cart');check(!g.blocked(e.x,e.y,false),'enemy stuck in cart');check(distance(e,g.p)<125,'enemy could not approach around cart');record(g,{name:'pursuit-around-cart',travelled:distance(e,at),remainingDistance:distance(e,g.p)});
 }
 {
  const g=make('shadow','road',1020,530),e=one(g,'wolf',1130,530,'spatial-alpha');e.abilityCD=0;e.cd=0;e.pattern=0;g.damage(e,1);
  for(let i=0;i<180&&!e.telegraph;i++)g.update(1/60,{});check(e.telegraph?.kind==='wolfSweep','elite did not telegraph area attack');const hp=g.p.hp,warning={...e.telegraph};tick(g,1.1,{x:-1});check(g.p.hp===hp,'area dodge failed');check(distance(g.p,warning)>warning.r,'did not leave warning radius');record(g,{name:'area-dodge',radius:warning.r,distance:distance(g.p,warning),damageTaken:hp-g.p.hp});
 }
 {
  const g=make('shadow','road',1020,540),before={x:g.p.x,y:g.p.y},hp=g.p.hp;let travelled=0,engaged=0;
  tick(g,6,t=>{const x=1115+Math.cos(t*1.25)*155,y=535+Math.sin(t*1.25)*85,dx=x-g.p.x,dy=y-g.p.y,d=Math.max(1,Math.hypot(dx,dy));engaged=Math.max(engaged,g.enemies.filter(e=>['COMBAT','ALERT'].includes(e.aiState)).length);travelled+=distance(g.p,before);Object.assign(before,{x:g.p.x,y:g.p.y});return {x:dx/d,y:dy/d};});
  check(engaged>=2,'multiple enemies never engaged');check(travelled>650,'multi-enemy movement stalled');check(g.p.hp>0,'multi-enemy fixture died');record(g,{name:'multi-enemy-movement',enemies:g.enemies.length,engaged,travelled,damageTaken:hp-g.p.hp});
 }
 {
  const g=make('shadow','bridge',170,600),hp=g.p.hp;let travelled=0;
  for(const goal of [{x:620,y:560},{x:930,y:560},{x:1430,y:650}]){for(let i=0;i<900&&distance(g.p,goal)>12;i++){const d=g.pathDirection(g.p,goal),at={...g.p};g.update(1/60,d);travelled+=distance(g.p,at);}check(distance(g.p,goal)<15,'bridge main route stalled');}
  check(g.p.hp===hp,'main bridge traffic lane pulled southern encounter');check(g.enemies.length===7,'existing southern encounters changed count');record(g,{name:'bridge-safe-main-route',travelled,damageTaken:hp-g.p.hp});
 }
 {
  const g=make('shadow','bridge',1020,755),e=g.enemies.find(e=>e.id==='ch2-bridge-wolf1');g.damage(e,1);tick(g,1,{y:-1});
  for(let i=0;i<1200;i++){const d=g.pathDirection(g.p,{x:1030,y:380});g.update(1/60,d);}check(!['COMBAT','ALERT'].includes(e.aiState),'enemy never disengaged outside ditch: '+JSON.stringify({player:[g.p.x,g.p.y,g.p.hp],enemy:[e.x,e.y,e.aiState],bounds:e.leashBounds,clock:g.time,active:g.active}));record(g,{name:'ditch-disengagement',state:e.aiState,distanceFromHome:Math.hypot(e.x-e.homeX,e.y-e.homeY)});
 }
 return {scenarios:results,limits:'Isolated real-runtime fixtures at level9 with original combat rules; scripted input at60Hz, not an end-to-end human campaign playthrough. Basic locked attacks retain their existing rules; dodge scenario tests an actual telegraphed elite area attack.'};
}
