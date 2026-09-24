import {SKILL_RANK_CAP_V17} from './rank-scaling-v17.js';
import {PROGRESSION_SKILLS} from './progression-data-v14.js';
import {HELL_SKILL_BOOKS,SAINT_SKILLS} from './chapter3-combat-data-v14.js';
import {SYSTEM_SKILLS} from './systems-data-v14.js';
import {migrateEquipment,normalizeGear} from './equipment-v14.js';
export function installGrowthV17(RPG,{SKILLS}){
 for(const s of Object.values(SKILLS))if(s.rank>1)s.rank=SKILL_RANK_CAP_V17;
 for(const s of [...Object.values(PROGRESSION_SKILLS),...HELL_SKILL_BOOKS,...SAINT_SKILLS,...SYSTEM_SKILLS])if(s.rank>1)s.rank=SKILL_RANK_CAP_V17;
 for(const k of ['battleTempo','stoneSkin']){
  const desc=SKILLS[k].desc.replace('每阶延长1秒','2–3阶每阶延长1秒，4–8阶每阶延长0.35秒');SKILLS[k].desc=desc;
  for(const s of [...HELL_SKILL_BOOKS,...SYSTEM_SKILLS])if(s.id===k)s.description=desc;
 }
 SKILLS.focusBreath.desc='6秒内额外恢复法力，每秒4 + 精神×0.03；2–3阶每阶再加0.5，4–8阶每阶再加0.15。法力已满时不能使用。';
 for(const s of [...HELL_SKILL_BOOKS,...SYSTEM_SKILLS])if(s.id==='focusBreath')s.description=SKILLS.focusBreath.desc;
 const old=RPG.prototype.restore;
 RPG.prototype.restore=function(s){
  old.call(this,s);
  const actors=[this.p,this.ch3?.frozenHero,this.ch3?.saintBuild,this.ch3?.saintActor,...Object.values(this.mercenariesV14?.roster||{}),this.memoryV13?.reality?.p,this.memoryV13?.reality?.ch3?.frozenHero,this.memoryV13?.reality?.ch3?.saintBuild];
  for(const p of new Set(actors.filter(Boolean)))migrateEquipment(p);
  this.pendingRewards=(this.pendingRewards||[]).map(i=>normalizeGear(i,this.p.cls));
 };
}
