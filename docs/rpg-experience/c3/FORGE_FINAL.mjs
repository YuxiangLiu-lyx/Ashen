// Production bosses/adds and real recipe transactions over retained normal-UI saves.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=process.cwd(),sourceRoot=path.resolve(new URL('../../..',import.meta.url).pathname),folder=process.env.ASHEN_C3_SAVES||'docs/rpg-experience/c3/natural-011',out=process.argv[2];assert.ok(out);fs.mkdirSync(out,{recursive:true});
const {cohort}=await import(path.join(root,'tools/balance_lab/experience-audit.mjs')),{RPG,stats,MAPS}=await import(path.join(root,'dist/core-v14.js')),{c1Danger}=await import(path.join(root,'dist/chapter-one-expansion-combat.js')),{provenance,sha}=await import(path.join(root,'tools/balance_lab/provenance.mjs'));
function battle(source,kind,seed,encounter){
 const g=cohort(source,kind,seed),map={ironScuttler:'hellQuarry',furnaceSentinel:'hellSluice',hellJailer:'hellArena'}[encounter]||encounter;delete g.states[map];g.enter(map,800,850);g.pending=null;g.transition=null;g.ch3.experienceScenes=[];g.active=true;g.portCD=999;g.saint.visible=false;g.v11.activeBoss=null;
 if(['ironScuttler','furnaceSentinel','hellJailer'].includes(encounter)){g.states[map].enemies=[];if(encounter==='hellJailer')g.apply('ch3:bossStart');else g.spawnV11Boss(encounter);}
 const counts={received:0,skills:0,attacks:0,hpPotions:0,mpPotions:0,warnings:0,manaSpent:0},start={level:g.p.level,stats:stats(g.p),gear:g.p.gear,enemies:g.enemies.map(e=>({id:e.id,type:e.type,hp:e.maxHP}))};let died=false,lastTell=null;const hurt=g.hurt,attack=g.attack;
 g.hurt=function(...a){const hp=this.p.hp,v=hurt.apply(this,a);counts.received+=Math.max(0,hp-this.p.hp);if(this.p.hp<=0)died=true;return v;};g.attack=function(...a){const cd=this.p.cd.attack||0,v=attack.apply(this,a);if((this.p.cd.attack||0)>cd)counts.attacks++;return v;};
 const t0=g.time;let outcome='timeout';
 for(let n=0;n<300/.035;n++){
  const live=g.enemies.filter(e=>!e.dead);if(died||g.p.hp<=0){outcome='loss';break;}if(!live.length){outcome='win';break;}if(!g.active||g.pending||g.transition){outcome='interrupted';break;}
  const e=live.sort((a,b)=>Math.hypot(a.x-g.p.x,a.y-g.p.y)-Math.hypot(b.x-g.p.x,b.y-g.p.y))[0];g.target=e.id;const st=stats(g.p);
  if(g.p.hp<st.hp*.55){if(g.potion('hp'))counts.hpPotions++;for(const heal of ['fieldMend','saintMend'])if(g.p.activeSkills.includes(heal)&&g.skill(heal))counts.skills++;}
  if(g.p.mp<st.mp*.25&&g.potion('mp'))counts.mpPotions++;
  const t=e.telegraph;if(t&&t!==lastTell){counts.warnings++;lastTell=t;}let input={auto:true};
  if(t&&e.wind>.14&&c1Danger(t,g.p)){const a=t.shape==='circle'?Math.atan2(g.p.y-t.y,g.p.x-t.x):t.a+Math.PI/2;input={x:Math.cos(a),y:Math.sin(a)};}
  else{const mp=g.p.mp;if(g.p.cls!=='shadow'||e.bleed>=3)if(g.skill('e'))counts.skills++;if(g.skill('q'))counts.skills++;if(g.p.emotion>=100&&g.skill('resonance'))counts.skills++;counts.manaSpent+=Math.max(0,mp-g.p.mp);}
  g.update(.035,input);if(g.events.some(e=>e.type==='death'))died=true;g.events=[];
 }
 return{kind,seed,encounter,outcome,elapsed:g.time-t0,...counts,start,hp:g.p.hp,mp:g.p.mp,remaining:g.enemies.filter(e=>!e.dead).map(e=>({id:e.id,hp:e.hp})),deathObserved:died};
}
const r={provenance:provenance(),sources:[],bosses:[],forge:[],limits:['Snapshots are unmodified actual C3 normal-UI saves; detached placement and full HP/MP plus 2 small potions each are explicit Lab entry conditions.','Boss fixtures use real spawnV11Boss (including two adds) and ch3:bossStart; ordinary groups use native enter/collision/AI.','Recipe comparisons craft from the SAME pre-forge snapshot with actual funds/materials and equip through production methods; no item stats are invented.','A death event counts as loss even if a projectile earns level-up healing in the same frame. Human fun/win rate is not inferred.']};
function source(cls,milestone){const file=path.join(sourceRoot,folder.endsWith('.json')?JSON.parse(fs.readFileSync(path.join(sourceRoot,folder),'utf8'))[cls][milestone]:path.join(folder,cls,milestone+'-save.json')),raw=fs.readFileSync(file),s=JSON.parse(raw);r.sources.push({cls,milestone,path:path.relative(sourceRoot,file),sha256:sha(raw),level:s.p.level});return s;}
for(const cls of ['shadow','oath','ember']){
 if(!process.env.ASHEN_FORGE_ONLY)for(const [enemy,milestone]of [['ironScuttler','03-approach-clear'],['furnaceSentinel','04-quarry'],['hellJailer','16-herb-result']]){const s=source(cls,milestone);for(const kind of ['starter','normal','optimized'])for(const seed of [7300,7301,7302])r.bosses.push({cls,...battle(s,kind,seed,enemy)});}
 const s=source(cls,'12-machine'),g=cohort(s,'normal',7300);g.enter('hellWorkshop');g.pending=null;g.transition=null;g.active=true;const n=g.npcs.find(n=>n.id==='mechanist');g.relocate(n.x,n.y+55);const held=structuredClone(g.snapshot()),cash=g.p.gold,iron=g.p.items.cinderIron,glass=g.p.items.blackGlass;assert.ok(g.hellAction('craft','forge-class-weapon'),cls+' real recipe affordability');assert.equal(g.p.gold,cash-90);assert.equal(g.p.items.cinderIron,iron-5);assert.equal(g.p.items.blackGlass,glass-3);const id={shadow:'ch3-ashfang',oath:'ch3-burden',ember:'ch3-wickstaff'}[cls];assert.ok(g.equip(id));const crafted=structuredClone(g.snapshot());
 for(const [stage,snapshot]of [['held',held],['crafted',crafted]])for(const encounter of ['hellMine','hellTomb','hellJailer'])for(const seed of [7300,7301,7302])r.forge.push({cls,stage,recipe:{gold:90,cinderIron:5,blackGlass:3},...battle(snapshot,'normal',seed,encounter)});
 console.log(cls,'completed');
}
fs.writeFileSync(path.join(out,'COMBAT.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({bosses:r.bosses.length,forge:r.forge.length,unresolved:[...r.bosses,...r.forge].filter(x=>['timeout','interrupted'].includes(x.outcome)).length}));
