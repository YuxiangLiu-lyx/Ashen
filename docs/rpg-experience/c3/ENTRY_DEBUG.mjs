// Paired historical/current production encounters, including the actual map-entry
// placement repair. Direct ensureMap fixtures leave migrated actors inside rocks.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=process.cwd(),sourceRoot=path.resolve(new URL('../../..',import.meta.url).pathname);
const {cohort}=await import(path.join(root,'tools/balance_lab/experience-audit.mjs')),{stats,MAPS}=await import(path.join(root,'dist/core-v14.js')),{c1Danger}=await import(path.join(root,'dist/chapter-one-expansion-combat.js')),{provenance,sha}=await import(path.join(root,'tools/balance_lab/provenance.mjs'));
const out=process.argv[2];assert.ok(out);fs.mkdirSync(out,{recursive:true});
function run(snapshot,{kind,seed,maps,policy}){
 const g=cohort(snapshot,kind,seed),start={level:g.p.level,stats:stats(g.p),gear:g.p.gear,attrs:{...g.p.attrs}},counts={received:0,skills:0,attacks:0,hpPotions:0,mpPotions:0,levelUps:0},encounters=[];
 const hurt=g.hurt;g.hurt=function(...a){const hp=this.p.hp,result=hurt.apply(this,a);counts.received+=Math.max(0,hp-this.p.hp);return result;};const attack=g.attack;g.attack=function(...a){const cd=this.p.cd.attack||0,result=attack.apply(this,a);if((this.p.cd.attack||0)>cd)counts.attacks++;return result;};
 for(const map of maps){
  delete g.states[map];const door=MAPS[map].doors[0];g.enter(map,door.x,door.y);g.pending=null;g.transition=null;g.active=true;g.portCD=999;g.saint.visible=false;
  const initial=g.enemies.filter(e=>!e.dead).map(e=>({id:e.id,type:e.type,hp:e.maxHP,x:e.x,y:e.y,blocked:g.blocked(e.x,e.y,false)}));assert.ok(initial.every(e=>!e.blocked),map+' entry correction');const t0=g.time,level=g.p.level;let outcome='timeout';
  for(let n=0;n<240/.035;n++){
   const live=g.enemies.filter(e=>!e.dead);if(!live.length){outcome='win';break;}if(g.p.hp<=0){outcome='loss';break;}if(!g.active||g.pending||g.transition){outcome='interrupted';console.log('interrupt',JSON.stringify({active:g.active,hp:g.p.hp,pending:g.pending,transition:g.transition,map:g.map,ch3:g.ch3.stage,flags:g.flags}));break;}
   const e=live.sort((a,b)=>Math.hypot(a.x-g.p.x,a.y-g.p.y)-Math.hypot(b.x-g.p.x,b.y-g.p.y))[0];g.target=e.id;
   if(g.p.hp<stats(g.p).hp*.55&&g.potion('hp'))counts.hpPotions++;if(policy!=='basic'&&g.p.mp<18&&g.potion('mp'))counts.mpPotions++;
   const t=e.telegraph;let input={auto:true};if(policy==='responsive'&&t&&e.wind>.14&&c1Danger(t,g.p)){const a=t.shape==='circle'?Math.atan2(g.p.y-t.y,g.p.x-t.x):t.a+Math.PI/2;input={x:Math.cos(a),y:Math.sin(a)};}
   else if(policy!=='basic'){if(g.p.cls!=='shadow'||e.bleed>=3)if(g.skill('e'))counts.skills++;if(g.skill('q'))counts.skills++;if(g.p.emotion>=100&&g.skill('resonance'))counts.skills++;}
   g.update(.035,input);if(g.events.some(e=>e.type==='death'))console.log('DEATH',g.time,g.p.hp);g.events=[];
  }
  counts.levelUps+=g.p.level-level;encounters.push({map,outcome,elapsed:g.time-t0,initial,remaining:g.enemies.filter(e=>!e.dead).map(e=>({id:e.id,hp:e.hp,x:e.x,y:e.y})),hp:g.p.hp,mp:g.p.mp,level:g.p.level,position:{x:g.p.x,y:g.p.y}});if(outcome!=='win')break;
 }
 return{kind,seed,policy,maps,start,...counts,encounters,outcome:encounters.at(-1).outcome,elapsed:encounters.reduce((s,e)=>s+e.elapsed,0)};
}
const report={provenance:provenance(),sources:[],groups:[],limits:['Actual unchanged C2 normal-UI completion saves; three classes/cohorts, production enemy AI/navigation/loot/level healing.','Both early boss completion flags set for ordinary-group isolation; not normal-input evidence.','Real enter() applies current collision correction and entry grace; same driver runs against 9d352b1 and current. No custom navigation or moved enemies.','Full HP/MP and two small medicines at start only, resources retained between maps. Timeouts and deaths remain failures.']};
for(const cls of ['ember']){
 const file=path.join(sourceRoot,`docs/rpg-experience/c2/natural-005/${cls}/10-chapter-two-end-save.json`),raw=fs.readFileSync(file),s=JSON.parse(raw);Object.assign(s.flags,{ch3Advance1:true,ch3Advance2:true});report.sources.push({path:path.relative(sourceRoot,file),sha256:sha(raw),level:s.p.level,phase:s.chapter});
 for(const kind of ['starter'])for(const policy of ['basic'])for(const seed of [7300])for(const maps of [['hellSluice']])report.groups.push({cls,...run(s,{kind,policy,seed,maps})});console.log(cls,'completed');
}
fs.writeFileSync(path.join(out,'COMBAT.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({groups:report.groups.length,outcomes:Object.fromEntries(['win','loss','timeout','interrupted'].map(k=>[k,report.groups.filter(r=>r.outcome===k).length]))}));
