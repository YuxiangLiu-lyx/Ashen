// Actual campaign snapshot experiment. Isolation/entry-condition changes are explicit.
import fs from 'node:fs';import path from 'node:path';import {RPG,stats} from '../../dist/core-v14.js';import {parseSave} from '../../dist/save-transfer-v14.js';import {seeded} from './simulator.mjs';import {c1Danger} from '../../dist/chapter-one-expansion-combat.js';import {C1_ELITES} from '../../dist/chapter-one-expansion-data.js';import {provenance,sha} from './provenance.mjs';
const encounters={rat:{map:'grove',id:'c1-elite-rat',type:'rat',x:800,y:570},warden:{map:'echo',id:'echo-warden',type:'wolf',x:950,y:570},bat:{map:'c1ReedKiln',id:'c1-elite-bat',type:'bat',x:1060,y:500},captain:{map:'canal',id:'captain',type:'captain',x:950,y:500},bren:{map:'manor',id:'ch2-bren',type:'captain',x:1000,y:680}};
export function simulateSnapshot(snapshot,encounter,seed,condition='saved',strategy='responsive'){
 const source=parseSave(JSON.stringify(snapshot)),cfg=encounters[encounter],g=new RPG(source.p.cls,source,seeded(seed));
 // Only the encounter/map placement and stated condition are fixtures. All gear,
 // ranks, AP/SP, resources (saved mode), level and effects come from the actual route.
 g.map=cfg.map;g.ensureMap(cfg.map);g.pending=null;g.transition=null;g.active=true;g.portCD=999;g.saint.visible=false;g.bullets=[];g.zones=[];
 g.states[cfg.map].enemies=[];const at=g.safePoint(cfg.x,cfg.y),e=g.enemy(cfg.type,at.x,at.y,cfg.id);g.states[cfg.map].enemies=[e];const stand=g.safePoint(at.x-200,at.y+100);g.relocate(stand.x,stand.y);g.target=e.id;
 if(condition==='full'){g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;g.p.items.hp=Math.min(2,g.p.items.hp||0);g.p.items.mp=Math.min(2,g.p.items.mp||0);}
 if(condition==='low_mana'){g.p.mp=Math.min(5,g.p.mp);g.p.items.hp=Math.min(1,g.p.items.hp||0);g.p.items.mp=0;}
 if(condition==='no_potions'){g.p.items.hp=0;g.p.items.mp=0;}
 const start={level:g.p.level,hp:g.p.hp,mp:g.p.mp,stats:stats(g.p),items:{...g.p.items},gear:g.p.gear,enemyHP:e.maxHP},dt=.035,t0=g.time;let spent=0,received=0,warnings=0,lastTell=null,idleMana=0,attacks=0,skills=0,potions=0;
 const hurt=g.hurt;g.hurt=function(...a){const hp=this.p.hp,result=hurt.apply(this,a);received+=Math.max(0,hp-this.p.hp);return result;};
 for(let n=0;n<240/dt&&!e.dead&&g.p.hp>0;n++){
  if(e.telegraph&&e.telegraph!==lastTell){warnings++;lastTell=e.telegraph;}
  if(g.p.hp<stats(g.p).hp*.6&&g.potion('hp'))potions++;if(g.p.mp<18)g.potion('mp');
  const t=e.telegraph;let input={auto:true};if(strategy==='responsive'&&t&&e.wind>.14&&c1Danger(t,g.p)){const a=t.shape==='circle'?Math.atan2(g.p.y-t.y,g.p.x-t.x):t.a+Math.PI/2;input={x:Math.cos(a),y:Math.sin(a)};}else{const before=g.p.mp;if(g.p.cls!=='shadow'||e.bleed>=3)if(g.skill('e'))skills++;if(g.skill('q'))skills++;if(g.p.emotion>=100)g.skill('resonance');spent+=Math.max(0,before-g.p.mp);}
  const cd=g.p.cd.attack||0;g.update(dt,input);if((g.p.cd.attack||0)>cd)attacks++;if(g.p.mp<10)idleMana+=dt;g.events=[];if(!g.active||g.pending||g.transition){if(e.dead||g.p.hp<=0)break;return {outcome:'interrupted',seed,condition,encounter};}
 }
 return {seed,condition,encounter,strategy,outcome:e.dead?'win':g.p.hp<=0?'loss':'timeout',elapsed:g.time-t0,remainingHP:g.p.hp,remainingMP:g.p.mp,enemyRemainingHP:Math.max(0,e.hp),received,spent,warnings,attacks,skills,potions,secondsBelow10MP:idleMana,start};
}
if(import.meta.url==='file://'+process.argv[1]){
 const report={provenance:provenance(),sources:[],groups:[],limits:['Actual campaign gear/stats, isolated authored map encounters; not human success rates.','Full/low_mana/no_potions are explicit laboratory entry conditions; they do not alter the retained campaign saves.','Uses actual runtime damage, AI, collision and potion cooldown; only scripted control policy.','No target-time claims: compare measured ranges before changing budgets.']};
 for(const cls of ['shadow','oath','ember'])for(const route of ['main_only','typical','all_once']){
  const file='docs/ch1-expansion/economy/'+cls+'-'+route+'.json',raw=fs.readFileSync(file),data=JSON.parse(raw);report.sources.push({path:file,sha256:sha(raw)});
  for(const encounter of Object.keys(encounters)){const milestone=data.milestones.find(x=>x.name===(encounter==='bren'?'manor-entry':encounter==='captain'?'captain-entry':'prepared'));for(const condition of ['full','low_mana','no_potions']){const runs=Array.from({length:12},(_,i)=>simulateSnapshot(milestone.snapshot,encounter,7300+i,condition));const wins=runs.filter(r=>r.outcome==='win');report.groups.push({cls,route,encounter,condition,source:file,milestone:milestone.name,winRate:wins.length/12,ttk:wins.map(r=>r.elapsed),runs});}}
 }
 fs.mkdirSync('docs/ch1-expansion/balance',{recursive:true});fs.writeFileSync('docs/ch1-expansion/balance/ACTUAL_SNAPSHOTS.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.groups.map(({runs,...r})=>r),null,2));
}
