import {HELL_SKILL_BOOKS,SAINT_SKILLS} from './chapter3-combat-data-v14.js';
import {PROGRESSION_SKILLS} from './progression-data-v14.js';
// Player input is transient: never store queued intent or actor references in saves.
export const SKILL_INPUT_WINDOW_V17 = .35;
export const SKILL_INPUT_TAIL_V17 = .30;
const pendingSkills = new WeakMap();
const projectileOwners = new WeakMap();
const installed = new WeakSet();
const interruptedEvents = new Set(['scene','map','actor','death','transition','mechanism','npc','ending','departure']);
const usable = g => !!g.active && g.p?.hp > 0 && !g.pending && !g.transition && !g._mercenaryContext;
const targetedHellSkills = new Set([...HELL_SKILL_BOOKS,...SAINT_SKILLS].filter(s=>['target','projectile'].includes(s.mechanic.kind)).map(s=>s.id));
const needsEnemy = (p,k) => k==='q'&&p.cls==='shadow' || targetedHellSkills.has(k) || ['target','targetPulse','projectile'].includes(PROGRESSION_SKILLS[k]?.kind);

function pendingFor(g) {
  const q = pendingSkills.get(g);
  if (!q) return null;
  if (!usable(g) || q.actor !== g.p || q.cls !== g.p.cls || q.map !== g.map || g.time > q.until) {
    pendingSkills.delete(g);
    return null;
  }
  return q;
}

// Friendly shots cannot acquire the identity/passives of a newly controlled actor.
// Untagged legacy/test projectiles keep their existing contract; every actual player
// attack/skill tags its newly emitted projectiles through the final runtime installer.
export function playerProjectileSourceValidV17(g, bullet) {
  const source = projectileOwners.get(bullet);
  return !source || source.actor === g.p && source.cls === g.p.cls && source.map === g.map;
}

function tagProjectiles(g, start, actor, map) {
  if (g._mercenaryContext) return;
  const source = {actor, cls:actor.cls, map};
  for (let i = start; i < g.bullets.length; i++) {
    const bullet = g.bullets[i];
    if (bullet.friendly) projectileOwners.set(bullet, source);
  }
}

export function installCombatInputV17(RPG, {skillNumbers, CLASSES, POTION_IDS}) {
  const P = RPG.prototype;
  if (installed.has(P)) return;
  installed.add(P);
  const old = {};
  for (const key of ['skill','attack','emit','restore']) old[key] = P[key];
  const utility = k => k === 'resonance' || POTION_IDS.includes(k);
  const fail = (g, text) => { g.say(text); return false; };

  P.clearSkillInput = function() { pendingSkills.delete(this); };
  P.queuedSkill = function() { return pendingFor(this)?.key || null; };

  // Existing skill() remains the immediate, fully validated combat primitive.
  // requestSkill() is exclusively the human input path; NPC AI never queues casts.
  P.requestSkill = function(k) {
    if (!usable(this)) { this.clearSkillInput(); return false; }
    const p = this.p;
    this.clearSkillInput(); // A new deliberate skill press replaces older intent.
    if (utility(k)) return this.skill(k);
    if (!(p.skills[k] > 0) || !this.activeSkills().includes(k)) return fail(this,'这项战技尚未激活。');
    const numbers = skillNumbers(p,k,CLASSES[p.cls]);
    if (!numbers) return false;
    if (p.mp < numbers.cost) return fail(this,'法力不足，可使用清醒药。');
    const cooldown = Math.max(0,p.cd[k] || 0);
    if (cooldown > SKILL_INPUT_TAIL_V17) return fail(this,'战技尚在冷却：'+Math.ceil(cooldown*10)/10+'秒。');
    const wait = Math.max(cooldown,p.cd.action || 0,p.dash || 0);
    if (wait > SKILL_INPUT_TAIL_V17) return fail(this,'动作尚未结束，请稍后再试。');
    if (wait > 0) {
      pendingSkills.set(this,{key:k,actor:p,cls:p.cls,map:this.map,target:this.target,until:this.time+SKILL_INPUT_WINDOW_V17});
      return true;
    }
    const before = this.events.length, result = this.skill(k);
    if (!result && !this.events.slice(before).some(e=>e.type==='toast')) this.say('目标不在战技范围内，或被障碍物挡住了。');
    return !!result;
  };

  // Called after movement/cooldown ticking and BEFORE the held/automatic attack.
  P.flushSkillInput = function() {
    const q = pendingFor(this);
    if (!q) return false;
    if (needsEnemy(this.p,q.key) && (q.target !== this.target || q.target && !this.enemies.some(e=>e.id===q.target&&!e.dead))) {
      this.clearSkillInput(); return false;
    }
    const p = this.p;
    if (p.cd.action > 0 || p.cd[q.key] > 0 || p.dash > 0) return false;
    this.clearSkillInput();
    return this.requestSkill(q.key);
  };

  P.attack = function(...args) {
    if (pendingFor(this)) return false;
    const start=this.bullets.length, actor=this.p, map=this.map;
    const result=old.attack.apply(this,args);
    tagProjectiles(this,start,actor,map);
    return result;
  };
  P.skill = function(...args) {
    const start=this.bullets.length, actor=this.p, map=this.map;
    const result=old.skill.apply(this,args);
    tagProjectiles(this,start,actor,map);
    return result;
  };
  P.emit = function(type,...args) {
    if (interruptedEvents.has(type)) this.clearSkillInput();
    return old.emit.call(this,type,...args);
  };
  P.restore = function(...args) {
    this.clearSkillInput();
    return old.restore.apply(this,args);
  };
}

// Fire on pointer-down for mouse/touch/pen, then consume only that physical click.
// Keyboard/screen-reader clicks retain the existing delegated click handler.
export function bindCombatSkillPointersV17(ui,{isPlaying,useSlot,clock=()=>performance.now()}) {
  const presses=new WeakMap();
  ui.addEventListener('pointerdown',e=>{
    const button=e.target.closest('[data-slot]');
    if(!button||!isPlaying()||e.button!==0)return;
    e.preventDefault();
    presses.set(button,{id:e.pointerId,until:clock()+1000});
    button.setPointerCapture?.(e.pointerId);
    useSlot(Number(button.dataset.slot));
  });
  ui.addEventListener('click',e=>{
    const button=e.target.closest('[data-slot]'),press=button&&presses.get(button);
    if(!press)return;
    presses.delete(button);
    if(e.detail!==0&&clock()<=press.until){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  ui.addEventListener('pointercancel',e=>{
    const button=e.target.closest('[data-slot]');
    if(button&&presses.get(button)?.id===e.pointerId)presses.delete(button);
  });
}
