import {C2_ROLES,C2_SCENES,C2_EVENTS} from './rpg-chapter-two-data.js';
import {SECRET_REWARDS} from './secrets-v14.js';
import {experienceSceneSafe} from './rpg-experience-triggers.js';
const phase=g=>g.chapter>=5&&g.chapter<12;
const eligible=(g,r)=>(g.map===r.map||g.map===r.fallbackMap)&&r.phases.includes(g.chapter)&&(r.minX===undefined||g.p.x>r.minX);
function tune(g,e,map){
 if(!phase(g)||!['manor','spillway'].includes(map)||!e.id.startsWith('ch2-'))return;
 if(map==='manor')e.groupId='c2-manor-wave';
 if(e.type!=='guard')return;
 const role=/alarm-1|wave2-guard$/.test(e.id)&&!e.id.includes('v9')?'c2Front':/v9-alarm-3|v9-wave2|guard1/.test(e.id)?'c2Thrower':'c2Pursuer',cfg=C2_ROLES[role];
 if(e.c2ExperienceRevision!==1){const ratio=Math.max(0,Math.min(1,e.hp/Math.max(1,e.maxHP)));e.maxHP=cfg.hp;e.hp=e.dead?0:Math.max(1,Math.round(cfg.hp*ratio));e.c2ExperienceRevision=1;}
 e.experienceRole=role;e.v28DamageMultiplier=1;
}
const rewards={'quest-v9-dry-knot':24,'quest-v9-well-brow':28};
function migrateRewards(g){for(const item of [...Object.values(g.p.gear||{}),...(g.p.bag||[]),...(g.c1Expansion?.escrow||[])])if(rewards[item?.id]){item.hp=Math.max(item.hp||0,rewards[item.id]);item.c2RewardRevision=1;}}
export function installChapterTwoExperience(RPG,{DIALOGUES,stats}){
 Object.assign(DIALOGUES,C2_SCENES);
 DIALOGUES.v9TollFound=DIALOGUES.v9TollFound.map((line,i)=>i?line:[line[0],line[1]+'护符下面还压着两瓶蜡封的清醒药和一瓶疗伤药，瓶口没有渗漏。']);
 SECRET_REWARDS.toll.hp=24;SECRET_REWARDS.warden.hp=28;
 const P=RPG.prototype,old={};for(const key of ['enemy','ensureMap','enter','restore','update','beginScene','npcOptions','choose','apply','useProp','experienceRest'])old[key]=P[key];
 P.enemy=function(...a){const e=old.enemy.apply(this,a);tune(this,e,this.map);return e;};
 P.ensureMap=function(id){const v=old.ensureMap.call(this,id);for(const e of this.states[id]?.enemies||[])tune(this,e,id);return v;};
 P.restore=function(...a){const v=old.restore.apply(this,a);for(const [id,s]of Object.entries(this.states))for(const e of s.enemies)tune(this,e,id);migrateRewards(this);return v;};
 P.beginScene=function(id,then){const row=(this.c2Entering||this.c2Ticking)&&C2_EVENTS.find(r=>r.id===id&&eligible(this,r));if(row&&!experienceSceneSafe(this)){if(row.markOnStart)this.flags[row.flag]=false;this.saveEvent();return false;}return old.beginScene.call(this,id,then);};
 P.enter=function(id,...a){this.c2Entering=true;try{return old.enter.call(this,id,...a);}finally{delete this.c2Entering;}};
 P.c2SceneTick=function(){if(!experienceSceneSafe(this))return false;const r=C2_EVENTS.find(r=>eligible(this,r)&&!this.flags[r.flag]);if(!r)return false;if(r.markOnStart)this.flags[r.flag]=true;this.beginScene(r.id,r.then??null);return true;};
 P.update=function(...a){if(this.c2SceneTick())return;this.c2Ticking=true;try{return old.update.apply(this,a);}finally{delete this.c2Ticking;}};
 P.c2RestAvailable=function(){if(this.map!=='inn'||this.chapter<5||this.chapter>=8||this.pending||this.transition||this.p.hp<=0||this.enemies.some(e=>!e.dead)||this.bullets.some(b=>b.friendly===false))return false;return [...this.npcs.filter(n=>n.id==='seline'),...this.props.filter(p=>p.id==='inn-rest').map(p=>({...p,x:p.interactX??p.x,y:p.interactY??p.y}))].some(p=>Math.hypot(this.p.x-p.x,this.p.y-p.y)<=150&&this.clearLine(this.p,p,false));};
 P.npcOptions=function(id){const rows=old.npcOptions.call(this,id);if(id==='seline'&&this.flags.pumpFixed)for(const r of rows)if(r.action==='ch2:rest')r.label='水泵修好了，借炉边歇一会儿。 · 不收费';return rows;};
 P.choose=function(a){if(a==='ch2:rest'){if(!this.c2RestAvailable())return false;const s=stats(this.p),cost=this.flags.pumpFixed?0:20;if(this.p.gold<cost||this.p.hp>=s.hp&&this.p.mp>=s.mp)return false;this.beginScene(this.flags.pumpFixed?'c2PumpRest':'innRestTalk','ch2_paid_rest');return true;}return old.choose.call(this,a);};
 P.experienceRest=function(id){return id==='seline'?this.choose('ch2:rest'):old.experienceRest.call(this,id);};
 P.apply=function(a){const id=typeof a==='string'?a:a?.id;if(id==='ch2_paid_rest'){if(!this.c2RestAvailable())return false;const s=stats(this.p),cost=this.flags.pumpFixed?0:20;if(this.p.gold<cost||this.p.hp>=s.hp&&this.p.mp>=s.mp)return false;this.p.gold-=cost;this.p.hp=s.hp;this.p.mp=s.mp;this.saveEvent();return true;}return old.apply.call(this,a);};
 P.useProp=function(id,...a){if(id==='inn-rest')return this.choose('ch2:rest');const before=!!this.flags.v9TollClaimed,held=[...this.p.bag,...Object.values(this.p.gear)].some(i=>i?.id==='quest-v9-dry-knot'),v=old.useProp.call(this,id,...a);if(id==='v9-toll-box'&&!before&&!held&&this.flags.v9TollClaimed)this.c1Transaction('c2:toll-supplies',()=>{this.addItem('mp',2);this.addItem('hp');return {items:['mp','mp','hp']};});return v;};
}
