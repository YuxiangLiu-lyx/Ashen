// Explicit laboratory fixtures over the final production RPG. No alternate rules.
import fs from 'node:fs';
import path from 'node:path';
import {RPG, MAPS, stats} from '../../dist/core-v14.js';
import {CHAPTER_CARDS_V17} from '../../dist/presentation-v17.js';
import {C1_MAPS} from '../../dist/chapter-one-layout.js';
import {C1_OBJECTIVES} from '../../dist/chapter-one-objectives.js';
import {SAGA_NODES_V25, SAGA_TASKS_V25} from '../../dist/saga-nodes-v25.js';
import {SAGA_CHAINS67_V26} from '../../dist/saga-chains67-v26.js';
import {SAGA_CHAINS8_V26} from '../../dist/v26-story8-chains.js';
import {c1Danger} from '../../dist/chapter-one-expansion-combat.js';
import {seeded} from './simulator.mjs';
import {provenance,sha} from './provenance.mjs';

export function mapChapter(id,m=MAPS[id]) {
 if(C1_MAPS.includes(id))return 1;
 if(['post','inn','bridge','manor','spillway','exile'].includes(id))return 2;
 if(/^ch[5678]/.test(id))return Number(id[2]);
 if(m.chapterRegion)return m.chapterRegion;
 if(id.startsWith('deep'))return 4;
 if(id.startsWith('hell'))return 3;
 return null;
}
export function inventory() {
 const g=new RPG('shadow',null,seeded(42));g.pending=null;
 const maps=Object.entries(MAPS).map(([id,m])=>{
  g.map=id;g.ensureMap(id);const size=40,cols=40,rows=27,open=new Set();
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(!g.blocked(x*size+size/2,y*size+size/2,false))open.add(y*cols+x);
  const remaining=new Set(open),components=[];
  while(remaining.size){const first=remaining.values().next().value,queue=[first];remaining.delete(first);let count=0;
   for(let q=0;q<queue.length;q++){const k=queue[q],x=k%cols,y=Math.floor(k/cols);count++;
    for(const [nx,ny]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){const n=ny*cols+nx;if(nx>=0&&nx<cols&&ny>=0&&ny<rows&&remaining.delete(n))queue.push(n);}}
   components.push(count);
  }
  return {id,chapter:mapChapter(id,m),name:m.name,safe:!!m.safe,doors:(m.doors||[]).map(d=>({to:d.to,label:d.label,at:[d.x,d.y],hidden:!!d.hidden,manual:!!d.manualOnly})),
   npcs:(m.npcs||[]).map(n=>({id:n.id,name:n.name})),props:(m.props||[]).map(p=>({id:p.id,label:p.label,action:p.action})),
   spawns:m.spawns||[],enemies:g.enemies.map(e=>({id:e.id,type:e.type,hp:e.maxHP,elite:!!e.elite,boss:!!e.isBoss,x:e.x,y:e.y})),
   sampledWalkable:{cellSize:size,total:open.size,area:open.size*size*size,components:components.sort((a,b)=>b-a)}};
 });
 return {provenance:provenance(),chapters:CHAPTER_CARDS_V17,maps,objectives:C1_OBJECTIVES,sagaNodes:SAGA_NODES_V25,sagaTasks:SAGA_TASKS_V25,sagaChains:[...SAGA_CHAINS67_V26,...SAGA_CHAINS8_V26],
  limits:['40-pixel grid is a coarse topology diagnostic, not a reachability acceptance.','Final installed map registry; chapter grouping by explicit region/prefix, unclassified entries remain null.','Enemy listing uses new-game state: conditional story waves are represented separately in task definitions, not invented.']};
}
export function cohort(snapshot,kind,seed=42){
 const g=new RPG(snapshot.p.cls,structuredClone(snapshot),seeded(seed));
 if(kind==='unarmed'||kind==='starter'){
  const fresh=new RPG(g.p.cls,null,seeded(seed));g.p.gear=Object.fromEntries(Object.keys(g.p.gear).map(k=>[k,null]));
  if(kind==='starter')g.p.gear.weapon=structuredClone(fresh.p.gear.weapon);
  g.p.attrs={str:0,dex:0,vit:0,wis:0};g.p.skills={...fresh.p.skills};g.p.bar=['q','e'];
 }else if(kind==='optimized'){
  // Only reassign points already spent on this real route; only equip owned loot.
  const points=Object.values(g.p.attrs).reduce((a,b)=>a+b,0),main={shadow:'dex',oath:'str',ember:'wis'}[g.p.cls];
  g.p.attrs={str:0,dex:0,vit:Math.floor(points/5),wis:0};g.p.attrs[main]=points-g.p.attrs.vit;
  const value=s=>s.atk+s.hp*.08+s.reduction*100+s.mp*.03;
  for(const item of [...g.p.bag]){const before=structuredClone(g.p),old=value(stats(g.p));if(g.equip(item.id,item.slot)&&value(stats(g.p))<old)g.p=before;}
 }
 g.pending=null;g.transition=null;g.active=true;g.saint.visible=false;g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;
 g.p.items.hp=2;g.p.items.mp=2;g.p.cd={};g.p.resonance=0;g.p.emotion=0;
 return g;
}
export function groupExperiment(snapshot,{kind='normal',seed=42,maps=['c1DrillGallery'],policy='responsive'}={}){
 const g=cohort(snapshot,kind,seed),start={level:g.p.level,stats:stats(g.p),gear:g.p.gear,attrs:{...g.p.attrs}},counts={received:0,skills:0,attacks:0,hpPotions:0,mpPotions:0,levelUps:0},encounters=[];
 const hurt=g.hurt;g.hurt=function(...a){const hp=this.p.hp;const result=hurt.apply(this,a);counts.received+=Math.max(0,hp-this.p.hp);return result;};
 const attack=g.attack;g.attack=function(...a){const cd=this.p.cd.attack||0,result=attack.apply(this,a);if((this.p.cd.attack||0)>cd)counts.attacks++;return result;};
 for(const map of maps){
  // Detached placement fixture; retain resources, cooldowns and earned XP between maps.
  delete g.states[map];g.map=map;g.ensureMap(map);g.pending=null;g.transition=null;g.active=true;g.portCD=999;g.bullets=[];g.zones=[];
  const door=MAPS[map].doors?.[0],at=g.safePoint(door?.x??250,door?.y??850);g.relocate(at.x,at.y);
  const initial=g.enemies.filter(e=>!e.dead).map(e=>({id:e.id,type:e.type,hp:e.maxHP})),t0=g.time,level=g.p.level;
  let outcome='timeout';
  for(let n=0;n<240/.035;n++){
   const live=g.enemies.filter(e=>!e.dead);if(!live.length){outcome='win';break;}if(g.p.hp<=0){outcome='loss';break;}
   if(!g.active||g.pending||g.transition){outcome='interrupted';break;}
   const e=live.sort((a,b)=>Math.hypot(a.x-g.p.x,a.y-g.p.y)-Math.hypot(b.x-g.p.x,b.y-g.p.y))[0];g.target=e.id;
   if(g.p.hp<stats(g.p).hp*.55&&g.potion('hp'))counts.hpPotions++;
   if(policy!=='basic'&&g.p.mp<18&&g.potion('mp'))counts.mpPotions++;
   const t=e.telegraph;let input={auto:true};
   if(policy==='responsive'&&t&&e.wind>.14&&c1Danger(t,g.p)){
    const a=t.shape==='circle'?Math.atan2(g.p.y-t.y,g.p.x-t.x):t.a+Math.PI/2;input={x:Math.cos(a),y:Math.sin(a)};
   }else if(policy!=='basic'){
    if(g.p.cls!=='shadow'||e.bleed>=3)if(g.skill('e'))counts.skills++;
    if(g.skill('q'))counts.skills++;if(g.p.emotion>=100&&g.skill('resonance'))counts.skills++;
   }
   g.update(.035,input);g.events=[];
  }
  counts.levelUps+=g.p.level-level;encounters.push({map,outcome,elapsed:g.time-t0,initial,remaining:g.enemies.filter(e=>!e.dead).map(e=>({id:e.id,hp:e.hp})),hp:g.p.hp,mp:g.p.mp,level:g.p.level});
  if(outcome!=='win')break;
 }
 return {kind,seed,policy,maps,start,...counts,encounters,outcome:encounters.at(-1).outcome,elapsed:encounters.reduce((s,e)=>s+e.elapsed,0)};
}
function main(){
 const mode=process.argv[2]||'inventory',out=path.resolve(process.argv[3]||'docs/rpg-experience/audit');fs.mkdirSync(out,{recursive:true});
 if(mode==='inventory'){const report=inventory();fs.writeFileSync(path.join(out,'WORLD.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({maps:report.maps.length,unclassified:report.maps.filter(m=>m.chapter===null).map(m=>m.id),chapters:Object.keys(report.chapters).map(n=>({chapter:Number(n),maps:report.maps.filter(m=>m.chapter==n).length}))}));return;}
 if(mode!=='combat')throw Error('Use inventory or combat [output directory] [route directory]');
 const sourceDir=process.argv[4]||'docs/rpg-experience/baseline/routes',runs=[],sources=[];
 for(const cls of ['shadow','oath','ember']){
  const file=path.join(sourceDir,cls+'-main_only.json'),raw=fs.readFileSync(file),data=JSON.parse(raw),snapshot=data.milestones.find(m=>m.name==='prepared').snapshot;sources.push({path:file,sha256:sha(raw)});
  for(const kind of ['unarmed','starter','normal','optimized'])for(const policy of ['basic','responsive'])for(const maps of [['c1DrillGallery'],['c1TrialCrypt'],['c1TrialVault'],['road','millpath','grove']])for(const seed of [7300,7301,7302]){
   const run={cls,...groupExperiment(snapshot,{kind,policy,maps,seed})};runs.push(run);
  }
  console.log(cls,JSON.stringify(Object.fromEntries(['unarmed','starter','normal','optimized'].map(k=>{const rs=runs.filter(r=>r.cls===cls&&r.kind===k);return [k,{wins:rs.filter(r=>r.outcome==='win').length,total:rs.length,meanDamage:rs.reduce((s,r)=>s+r.received,0)/rs.length}];}))));
 }
 fs.writeFileSync(path.join(out,'COMBAT.json'),JSON.stringify({provenance:provenance(),sources,runs,limits:['Laboratory placement and deterministic scripted policies; no human win-rate or playtime claim.','Normal cohort is actual main-only prepared save. Optimized uses its owned gear and allocated points only.','Unarmed literally removes weapons; starter retains the zero-attack starting weapon so legal attacks/skills can be compared.','Full HP/MP and two small potions of each type at sequence start; no rest, refill, or reset between sequence maps.','Live production XP, drops, level-up healing and collision remain enabled. Three seeds are a diagnosis, not statistical certification.']},null,2)+'\n');
}
if(import.meta.url==='file://'+path.resolve(process.argv[1]||''))main();
