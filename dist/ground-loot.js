import {ITEMS,MAPS} from './data-v14.js';
import {normalizeGear} from './equipment-v14.js';
import {C1_PARTS} from './chapter-one-expansion-data.js';
import {C1_OBJECTIVES,c1ObjectiveParts} from './chapter-one-objectives.js';
import {equipmentDesign,GEAR_COLORS} from './equipment-icons.js';

const clone=v=>structuredClone(v),captures=new WeakMap(),notices=new WeakMap();
const state=g=>g.groundLoot||(g.groundLoot={schema:1,sequence:0,maps:{}});
const current=g=>captures.get(g)?.at(-1);
const unique=i=>i.id?.startsWith('quest-')||i.id?.startsWith('ch3-')||i.v28Drop||i.uniqueEffect||i.instanceId;
const owned=(g,i)=>unique(i)&&[...g.p.bag,...Object.values(g.p.gear),...g.pendingRewards,...(g.c1Expansion?.escrow||[]),...Object.values(state(g).maps).flat().map(d=>d.gear),...(captures.get(g)||[]).flatMap(c=>c.gear)].some(o=>o?.id===i.id);

export function validateGroundLoot(saved){
 const s=saved.groundLoot;if(s==null)return;
 if(s.schema!==1||!Number.isSafeInteger(s.sequence)||s.sequence<0||!s.maps||Array.isArray(s.maps))throw Error('地面战利品记录不完整。');
 const ids=new Set();
 for(const [map,rows]of Object.entries(s.maps)){
  if(!MAPS[map]||!Array.isArray(rows)||rows.length>10000)throw Error('地面战利品地图不正确。');
  for(const d of rows){
   if(!d||typeof d.id!=='string'||!/^loot-[1-9][0-9]*$/.test(d.id)||Number(d.id.slice(5))>s.sequence||ids.has(d.id)||!Number.isFinite(d.x)||!Number.isFinite(d.y)||d.x<0||d.x>1600||d.y<0||d.y>1080||!['gold','item','gear','quest','sample'].includes(d.kind))throw Error('地面战利品内容不正确。');
   ids.add(d.id);
   if(['gold','item'].includes(d.kind)&&(!Number.isSafeInteger(d.amount)||d.amount<1||d.amount>10000000))throw Error('地面战利品数量不正确。');
   if(d.kind==='item'&&!ITEMS[d.item])throw Error('未知战利品。');
   if(d.kind==='gear'&&(!d.gear||typeof d.gear.id!=='string'||!GEAR_COLORS[d.gear.rarity]||!['weapon','offhand','head','chest','hands','feet','relic'].includes(d.gear.slot)))throw Error('地面装备不完整。');
   if(d.kind==='quest'){const o=C1_OBJECTIVES[d.quest],p=o?.kind==='drop'&&c1ObjectiveParts(o).find(p=>p.id===d.part?.id);if(!p||!d.part||d.part.count!==p.count||d.part.item!==p.item)throw Error('战利品任务不存在或数量不正确。');}
   if(d.kind==='gear'&&(typeof d.gear.name!=='string'||['atk','hp','minLevel'].some(k=>!Number.isFinite(d.gear[k]??0))))throw Error('地面装备属性不完整。');
   if(d.kind==='sample'&&!Object.hasOwn(C1_PARTS,d.sample))throw Error('未知样本。');
  }
 }
}

// Capture the installed game's actual rolls. Gold/item grants are moved to the
// floor only after a death succeeds; XP and quest kills remain immediate.
function capture(g,e,run){
 if(!e||e.c1Training||e.c1NoReward||g.memoryV13?.active)return run();
 const stack=captures.get(g)||[];if(stack.some(c=>c.enemy===e))return run();
 const c={enemy:e,map:g.map,actor:g.p,gold:g.p.gold,items:{...g.p.items},gear:[],quests:[],samples:{...(g.c1Expansion?.samples||{})},texts:g.texts.length,events:g.events.length};
 stack.push(c);captures.set(g,stack);
 let succeeded=false;
 try{const result=run();succeeded=true;return result;}finally{
  stack.pop();
  if(succeeded&&e.dead&&e.hp<=0&&g.p===c.actor){
   const drops=[];
   const gold=Math.max(0,g.p.gold-c.gold);if(gold){g.p.gold-=gold;drops.push({kind:'gold',amount:gold});}
   for(const [id,n]of Object.entries(g.p.items)){const amount=n-(c.items[id]||0);if(amount>0){if(c.items[id]===undefined)delete g.p.items[id];else g.p.items[id]=c.items[id];drops.push({kind:'item',item:id,amount});}}
   for(const gear of c.gear)drops.push({kind:'gear',gear});
   for(const q of c.quests)drops.push({kind:'quest',...q});
   for(const key of Object.keys(C1_PARTS))if(g.c1Expansion?.samples[key]&&!c.samples[key]){g.c1Expansion.samples[key]=false;drops.push({kind:'sample',sample:key});}
   if(drops.length){
    g.texts=g.texts.filter((t,i)=>i<c.texts||!/(?:\+\s*\d|×\s*\d|稀有掉落|^获得 )/.test(t.text)||/^经验/.test(t.text));
    g.events=g.events.filter((v,i)=>i<c.events||v.type!=='toast'||!/^获得 |已收进行囊|已妥善收起/.test(v.text||''));
    for(const d of drops)g.placeGroundLoot(d,e,c.map);
    g.saveEvent();
   }
  }else if(succeeded&&c.gear.length){for(const i of c.gear)g.obtainGear(i);}
 }
}

export function installGroundLoot(RPG){
 const P=RPG.prototype,old={};for(const k of ['damage','handleHellDeath','dropCombatLoot','obtainGear','c1Deliver','c1AddCount','snapshot','restore','update','enter'])old[k]=P[k];
 P.placeGroundLoot=function(value,origin=this.p,map=this.map){
  const s=state(this),index=++s.sequence,a=index*2.399963,r=13+index%3*13;
  const desired={x:origin.x+Math.cos(a)*r,y:origin.y+Math.sin(a)*r};
  const p=map===this.map?this.safePoint(desired.x,desired.y):desired;
  const d={...clone(value),id:'loot-'+index,x:p.x,y:p.y,born:this.time};(s.maps[map]||=[]).push(d);return d;
 };
 P.floorLoot=function(){return state(this).maps[this.map]||[];};
 for(const name of ['damage','handleHellDeath','dropCombatLoot'])if(old[name])P[name]=function(e,...args){return capture(this,e,()=>old[name].call(this,e,...args));};
 for(const name of ['obtainGear','c1Deliver'])P[name]=function(item){const c=current(this);if(!c)return old[name].call(this,item);const i=normalizeGear(clone(item),this.p.cls);if(owned(this,i))return false;c.gear.push(i);return true;};
 P.c1AddCount=function(id,part){const c=current(this);if(c&&C1_OBJECTIVES[id]?.kind==='drop'){c.quests.push({quest:id,part:clone(part)});return this.c1Count(id,part.id);}return old.c1AddCount.call(this,id,part);};
 P.pickGroundLoot=function(id){
  if(!this.active||this.pending||this.transition||this.p.hp<=0)return false;
  const rows=this.floorLoot(),i=rows.findIndex(d=>d.id===id),d=rows[i];if(!d||Math.hypot(this.p.x-d.x,this.p.y-d.y)>42||!this.clearLine(this.p,d,false))return false;
  if(d.kind==='gear'&&this.p.bag.length>=60){const n=notices.get(this)||{};if((n[id]??-Infinity)+3<=this.time){this.say('无法拾取：装备栏已满。');n[id]=this.time;notices.set(this,n);}return false;}
  if(d.kind==='gear')this.p.bag.push(clone(d.gear));
  if(d.kind==='gold')this.p.gold+=d.amount;
  if(d.kind==='item')oldAddItem(this,d.item,d.amount);
  if(d.kind==='sample')this.c1Expansion.samples[d.sample]=true;
  if(d.kind==='quest'&&this.quests[d.quest]==='active'){const n=old.c1AddCount.call(this,d.quest,d.part);if(d.quest==='copper')this.flags.practiceCopper=n>=5;}
  rows.splice(i,1);this.emit('sfx',{name:'coin'});this.saveEvent();return true;
 };
 const oldAddItem=(g,id,n)=>{g.p.items[id]=(g.p.items[id]||0)+n;};
 P.update=function(...args){const r=old.update.apply(this,args);if(this.active&&!this.pending&&this.p.hp>0){for(const d of [...this.floorLoot()])if(this.time-(d.born||0)>.45)this.pickGroundLoot(d.id);for(const p of this.props)if(p.action==='v26:drop'&&!p.used&&Math.hypot(this.p.x-p.x,this.p.y-p.y)<=42)this.useProp(p.id,true);}return r;};
 // The manor escape cutscene moves the hero before input resumes. Keep its
 // uncollected drops visible at the escape landing, where they can be picked up.
 P.enter=function(id,...args){const carry=this.map==='manor'&&id==='spillway'&&this.chapter===10?[...this.floorLoot()]:[];const r=old.enter.call(this,id,...args);if(carry.length&&this.map===id){state(this).maps.manor=[];for(const [i,d]of carry.entries()){const a=i*2.399963,p=this.safePoint(this.p.x+Math.cos(a)*65,this.p.y+Math.sin(a)*65);Object.assign(d,p,{born:this.time});(state(this).maps[id]||=[]).push(d);}}return r;};
 P.snapshot=function(){return {...old.snapshot.call(this),groundLoot:clone(state(this))};};
 P.restore=function(s){validateGroundLoot(s);const r=old.restore.call(this,s);this.groundLoot=clone(s.groundLoot||{schema:1,sequence:0,maps:{}});for(const rows of Object.values(this.groundLoot.maps))for(const d of rows)d.born=0;return r;};
}

export function drawGroundLoot(c,bank,g){
 const drops=g.floorLoot?.()||[],closest=drops.reduce((best,d)=>!best||Math.hypot(g.p.x-d.x,g.p.y-d.y)<Math.hypot(g.p.x-best.x,g.p.y-best.y)?d:best,null);
 for(const d of drops){
  const near=d===closest&&Math.hypot(g.p.x-d.x,g.p.y-d.y)<100;c.save();c.translate(d.x,d.y);
  c.fillStyle='#0007';c.beginPath();c.ellipse(0,4,15,5,0,0,Math.PI*2);c.fill();
  if(d.kind==='gold'){
   for(const [x,y]of [[-7,1],[4,4],[1,-3],[10,-1],[-4,-6]]){const gold=c.createLinearGradient(x-3,y-3,x+3,y+3);gold.addColorStop(0,'#e5ba59');gold.addColorStop(.45,'#aa7227');gold.addColorStop(1,'#dca744');c.fillStyle=gold;c.strokeStyle='#e9ce80';c.lineWidth=.7;c.beginPath();c.ellipse(x,y,4.5,2.6,-.2,0,7);c.fill();c.stroke();}
  }else{
   let sheet='discovery',index=4,size=27;
   if(d.kind==='gear'){const art=equipmentDesign(d.gear);sheet=art.sheet;index=art.index;size=36;c.strokeStyle=art.color;c.globalAlpha=.55;c.lineWidth=1.5;c.beginPath();c.ellipse(0,3,19,7,0,0,7);c.stroke();c.globalAlpha=1;}
   else if(d.kind==='item'&&/^(hp|mp)(Medium|Large|Grand)?$/.test(d.item)){
    c.save();c.rotate(-.55);c.scale(.8,.8);c.fillStyle='#9caaa5';c.strokeStyle='#34231d';c.lineWidth=1.4;c.beginPath();c.roundRect(-5,-23,10,8,2);c.fill();c.stroke();const liquid=c.createLinearGradient(-9,0,9,0),red=d.item.startsWith('hp');liquid.addColorStop(0,red?'#421724':'#17284b');liquid.addColorStop(.35,red?'#c45460':'#5c9ac8');liquid.addColorStop(1,red?'#5f1c2d':'#203c60');c.fillStyle=liquid;c.beginPath();c.roundRect(-9,-16,18,20,5);c.fill();c.stroke();c.fillStyle='#e8b976';c.fillRect(-5,-27,10,5);c.fillStyle='#ffffff88';c.fillRect(-5,-12,2,9);c.restore();sheet=null;
   }
   else if(d.kind==='sample'){sheet='mechanisms';index=7;}
   else if(d.kind==='quest'){sheet='discovery';index=5;}
   else{sheet='mechanisms';index=d.item==='c1MedicinalEssence'?3:2;}
   const f=sheet&&bank.frame(sheet,index);if(f)bank.draw(c,sheet,index,0,7,size*f.w/Math.max(f.w,f.h),size*f.h/Math.max(f.w,f.h));
  }
  if(near){const label=d.kind==='gear'?d.gear.name:d.kind==='gold'?d.amount+' 金':d.kind==='item'?(ITEMS[d.item]?.name||'材料')+(d.amount>1?' ×'+d.amount:''):d.kind==='sample'?'精英样本':C1_OBJECTIVES[d.quest]?.name||'任务材料';c.font='12px system-ui';c.textAlign='center';c.fillStyle='#fff0cd';c.shadowColor='#000';c.shadowBlur=4;c.fillText(label,0,-31);}
  c.restore();
 }
}
