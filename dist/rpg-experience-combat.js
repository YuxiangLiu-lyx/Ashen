import {EXPERIENCE_ROLES,experienceProfile} from './rpg-experience-data.js';
import {C1_MAPS} from './chapter-one-layout.js';
const inChapterOne=(g,map=g.map)=>g.chapter<5&&C1_MAPS.includes(map);
function roleFor(e,map){
 if(e.c1Training||e.c1NoReward||e.c1Custom||e.storyTag||e.id==='captain')return null;
 if(e.id==='c1-trial-warden')return 'trialWarden';
 if(e.id==='c1-vault-warden')return 'vaultWarden';
 if(e.id.startsWith('c1-moss-'))return 'mossBeetle';
 if(e.id.startsWith('c1-sentry-'))return 'drillSentry';
 if(e.id.startsWith('c1-crypt-'))return 'cableRat';
 if(e.id.startsWith('c1-vault-sentry-'))return Number(e.id.split('-').at(-1))%3===0?'vaultThrower':'vaultSentry';
 if(e.type==='bat')return 'kilnBat';
 if(e.type==='wolf')return map==='road'?'roadWolf':'millWolf';
 if(e.type==='rat')return map==='warehouse'?'grainRat':'canalRat';
 return null;
}
function tune(g,e,map){
 if(!inChapterOne(g,map))return;
 const role=roleFor(e,map),cfg=EXPERIENCE_ROLES[role];if(!cfg)return;
 if(e.experienceRevision!==1){const ratio=Math.max(0,Math.min(1,e.hp/Math.max(1,e.maxHP)));e.maxHP=cfg.hp;e.hp=e.dead?0:Math.max(1,Math.round(cfg.hp*ratio));e.experienceRevision=1;}
 e.experienceRole=role;e.v28DamageMultiplier=1;e.v15BossStats='custom';
 if(cfg.isBoss){e.isBoss=true;e.elite=true;}
 // Keep respawns and all quest credit. Repeated entries no longer print full XP.
 const generation=e.c1QuestGeneration||1,repeat=generation>1;
 e.v28RewardXP=repeat?Math.max(3,Math.round(cfg.xp*.35)):cfg.xp;
 e.v28RewardGold=repeat?Math.max(1,Math.floor(cfg.gold*.6)):cfg.gold;
}
export function installExperienceCombat(RPG,{stats}){
 const P=RPG.prototype,old={};for(const k of ['enemy','ensureMap','enter','restore','gainXP','damage'])old[k]=P[k];
 P.enemy=function(...args){const e=old.enemy.apply(this,args);tune(this,e,this.map);return e;};
 P.ensureMap=function(id){const result=old.ensureMap.call(this,id);for(const e of this.states[id]?.enemies||[])tune(this,e,id);return result;};
 P.enter=function(id,...args){const result=old.enter.call(this,id,...args);if(this.map===id)for(const e of this.enemies)tune(this,e,id);return result;};
 P.restore=function(...args){const result=old.restore.apply(this,args);for(const [map,st]of Object.entries(this.states))for(const e of st.enemies)tune(this,e,map);return result;};
 P.gainXP=function(n){
  const p=this.p,before={level:p.level,hp:p.hp,mp:p.mp,stats:stats(p)},scoped=inChapterOne(this),result=old.gainXP.call(this,n);
  if(scoped&&p.level>before.level){const s=stats(p),levels=p.level-before.level;
   p.hp=Math.min(s.hp,before.hp+s.hp-before.stats.hp+Math.round(s.hp*.15*levels));
   p.mp=Math.min(s.mp,before.mp+s.mp-before.stats.mp+Math.round(s.mp*.2*levels));this.saveEvent();
  }return result;
 };
 P.damage=function(e,n,kind='hit',...args){
  if(inChapterOne(this)&&e.c1Custom&&['hit','skill','ch3skill'].includes(kind)){
   if(e.c1Recovery>0)n*=1.3;
   else if(e.id==='c1-elite-rat'&&(e.telegraph||e.c1Charge)){
    const facing=e.c1Charge?.a??e.telegraph?.a??e.angle;
    if(Math.cos(Math.atan2(this.p.y-e.y,this.p.x-e.x)-facing)>.35)n*=.55;
   }
  }
  const hp=e.hp,result=old.damage.call(this,e,n,kind,...args),cfg=experienceProfile(e);
  if(cfg?.guardFront&&!cfg.isBoss&&!e.dead&&e.hp<hp&&['skill','ch3skill'].includes(kind)){
   e.exposedUntil=Math.max(e.exposedUntil||0,this.time+1.3);this.text('护势松动',e.x,e.y-85,'#e6bf85');
  }return result;
 };
}
