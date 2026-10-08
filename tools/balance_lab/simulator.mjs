// Browser/Node shared experiment driver. Every combat step uses the real installed RPG.
import {RPG, MAPS, CLASSES, SKILLS, stats, loot, skillNumbers} from '../../dist/core-v14.js';
import {CAREERS, PROGRESSION_SKILLS} from '../../dist/progression-data-v14.js';
import {profileForEnemy, ENEMY_PROFILES} from '../../dist/balance-v14.js';
import {HELL_ENEMY_PROFILES} from '../../dist/chapter3-combat-data-v14.js';
import {V11_BOSS_PROFILES,V11_DEEP_ENEMY_PROFILES} from '../../dist/combat-data-v14.js';
import {ACTIVE_LIMIT} from '../../dist/attunement-v14.js';
import {isStoryTestV25} from '../../dist/story-test-v25.js';

export const LIMITS = [
  'Isolated encounters in a real map; authored crowds, campaign reachability and scene chains are not simulated',
  'Strategies are scripted input policies, not measured human skill or full-chapter completion rates',
  'Fixed dt <= 0.035 includes runtime hitstop; TTK is simulation clock, not device wall time',
  'Starting levels, ranks, gear and career activity unlocks are synthetic explicit fixtures, not proven obtainable paths',
  'Random generic equipment IDs include Date.now in runtime; lab canonicalizes IDs at obtainGear only, with identical stats/RNG draws',
  'Damage is effective HP loss, excluding overkill; nested proc damage is counted once; projectile skill attribution is unresolved',
];
export const DEFAULTS = Object.freeze({cls:'shadow',level:8,map:'road',enemy:'guard',seed:42,
  duration:60,dt:.025,strategy:'combo',gearRarity:'rare',skills:{q:1,e:1},attrs:{str:0,dex:0,vit:0,wis:0},potions:false});
export const STRATEGIES = ['basic','novice','combo','defensive'];
const clone = value => JSON.parse(JSON.stringify(value));
const round = v => Number(v.toFixed(6));
const supportedEnemies = new Set([...Object.keys(ENEMY_PROFILES),...Object.keys(HELL_ENEMY_PROFILES),
  ...Object.keys(V11_BOSS_PROFILES),...Object.keys(V11_DEEP_ENEMY_PROFILES)]);

export function seeded(seed) {
  let state = seed >>> 0;
  return () => {state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}

export function normalizeConfig(input={}) {
  const c = {...clone(DEFAULTS),...clone(input)};
  if (!['shadow','oath','ember'].includes(c.cls)) throw Error('Supported classes: shadow, oath, ember');
  if (!Number.isInteger(c.level)||c.level<1||c.level>32) throw Error('Isolated fixture level must be 1..32');
  if (!Number.isInteger(c.seed)||c.seed<0||c.seed>0xffffffff) throw Error('Seed must be uint32');
  if (!(c.dt>0&&c.dt<=.035&&Number.isFinite(c.dt))) throw Error('dt must be >0 and <=0.035');
  if (!(c.duration>0&&c.duration<=600&&Number.isFinite(c.duration))) throw Error('duration must be 0..600 seconds');
  if (!MAPS[c.map]||!supportedEnemies.has(c.enemy)) throw Error('Unknown map/enemy; no guard-profile fallback allowed');
  if (!STRATEGIES.includes(c.strategy)) throw Error('Unknown input strategy');
  if (!['common','uncommon','rare','epic','legendary','abyssal'].includes(c.gearRarity)) throw Error('Unknown rarity');
  if (c.career&&CAREERS[c.career]?.cls!==c.cls) throw Error('Career/class mismatch');
  if (!c.skills||typeof c.skills!=='object'||Array.isArray(c.skills)||!Object.keys(c.skills).length) throw Error('Nonempty skill ranks required');
  if (Object.keys(c.skills).length>ACTIVE_LIMIT) throw Error('Active skill limit exceeded');
  for (const [k,v] of Object.entries(c.skills)) {
    if (!SKILLS[k]||!Number.isInteger(v)||v<1||v>SKILLS[k].rank) throw Error('Invalid skill/rank: '+k);
    if (SKILLS[k].passive||SKILLS[k].saintOnly||PROGRESSION_SKILLS[k]&&PROGRESSION_SKILLS[k].career!==c.career) throw Error('Unsupported/locked skill fixture: '+k);
  }
  if (!c.attrs||Object.keys(c.attrs).some(k=>!['str','dex','vit','wis'].includes(k))||Object.values(c.attrs).some(v=>!Number.isInteger(v)||v<0)) throw Error('Invalid attribute allocation');
  if (Object.values(c.attrs).reduce((a,b)=>a+b,0)>(c.level-1)*3) throw Error('Allocated attributes exceed level-derived budget');
  return c;
}

export function createEncounter(input={}) {
  const config=normalizeConfig(input),rng=seeded(config.seed),g=new RPG(config.cls,null,rng);
  g.p.level=config.level;Object.assign(g.p.attrs,config.attrs);
  if(config.career) g.p.career={id:config.career,levelAtUnlock:config.level,progressionVersion:15,
    unlockedStages:[1,2,3,4,5],activityRewards:{2:'lab-fixture',3:'lab-fixture',4:'lab-fixture',5:'lab-fixture'}};
  g.p.skills={...config.skills};g.p.activeSkills=Object.keys(config.skills);
  g.p.bar=[[...g.p.activeSkills,...Array(6).fill(null)].slice(0,6),Array(6).fill(null)];
  g.p.gear={};
  for(const slot of ['weapon','head','chest','hands','feet','relic']) {
    if(config.gear?.[slot]===null){g.p.gear[slot]=null;continue;}
    const fix={id:'lab-'+slot,slot,rarity:config.gearRarity,...config.gear?.[slot]};
    g.p.gear[slot]=loot(config.cls,config.level,rng,fix);
  }
  // Canonicalize generated identity only; do not touch fixed quest/rare IDs or RNG draws.
  const obtain=g.obtainGear;let genericId=0;
  g.obtainGear=function(item){if(/^i[0-9a-z]+$/.test(item.id))item={...item,id:'lab-loot-'+(++genericId)};return obtain.call(this,item);};
  g.p.hp=stats(g.p).hp;g.p.mp=stats(g.p).mp;g.map=config.map;g.ensureMap(g.map);
  g.states[g.map].enemies=[];g.pending=null;g.transition=null;g.active=true;
  g.portCD=config.duration+1;g.saint.visible=false;
  const at=g.safePoint(config.x??800,config.y??740);Object.assign(g.p,at);
  const enemyAt=g.safePoint(at.x+(config.distance??100),at.y);
  const enemy=g.enemy(config.enemy,enemyAt.x,enemyAt.y,'lab-'+config.enemy);
  g.states[g.map].enemies.push(enemy);g.target=enemy.id;
  if(isStoryTestV25(g)) throw Error('Balance experiments must not use invulnerable story-test fixtures');
  if(!g.clearLine(g.p,enemy,false)) throw Error('Fixture has no line of sight; choose coordinates explicitly');
  g.events=[];g.fx=[];g.texts=[];
  return {g,enemy,config};
}

export function strategyStep(g,e,c,step) {
  if(c.strategy==='basic')return;
  if(c.strategy==='novice'&&step%Math.round(1/c.dt)!==0)return;
  if(c.potions){if(g.p.hp<stats(g.p).hp*.35)g.skill('hp');if(g.p.mp<20)g.skill('mp');}
  const priorities=Object.keys(c.skills);
  if(c.cls==='oath'&&e.wind>0)priorities.sort(k=>k==='e'?-1:1);
  for(const k of priorities){
    if(c.strategy!=='novice'&&c.cls==='shadow'&&k==='e'&&e.bleed<3&&!e.careerBleed)continue;
    if(c.strategy!=='novice'&&c.cls==='ember'&&k==='e'&&!g.zones.length)continue;
    if(g.skill(k))break;
  }
  if(c.strategy!=='novice'&&g.p.emotion>=100)g.skill('resonance');
}

export function simulate(input={}, {trace=true}={}) {
  const {g,enemy:e,config:c}=createEncounter(input),events=[],damageStack=[];
  const uses={},byKind={},bySkill={},samples=[];
  let received=0,mpSpent=0,shieldAbsorbed=0,maxBleed=0,peakBurst=0,action=null;
  const log=x=>{if(trace)events.push({time:round(g.time),...x});};
  const damage=g.damage;
  g.damage=function(target,n,kind='hit'){
    const frame={target,children:0},before=Math.max(0,target.hp);damageStack.push(frame);
    try{return damage.call(this,target,n,kind);}finally{
      damageStack.pop();const total=Math.max(0,before-Math.max(0,target.hp));
      const own=Math.max(0,total-frame.children);
      for(const parent of [...damageStack].reverse())if(parent.target===target){parent.children+=total;break;}
      if(own){byKind[kind]=(byKind[kind]||0)+own;const origin=action||(['dot','careerDot','proc','enchant'].includes(kind)?kind:'unattributed-projectile');
        bySkill[origin]=(bySkill[origin]||0)+own;samples.push({time:g.time,n:own});log({type:'damage',target:target.id,kind,origin,amount:own,hp:round(target.hp)});}
    }
  };
  const hurt=g.hurt;
  g.hurt=function(n){const hp=g.p.hp,shield=g.p.shield;const result=hurt.call(this,n);
    const lost=Math.max(0,hp-g.p.hp),absorbed=Math.max(0,shield-g.p.shield);received+=lost;shieldAbsorbed+=absorbed;
    if(lost||absorbed)log({type:'hurt',amount:round(lost),absorbed:round(absorbed),hp:round(g.p.hp)});return result;};
  for(const method of ['skill','attack']){
    const original=g[method];g[method]=function(...args){const key=method==='skill'?args[0]:'attack',beforeMP=g.p.mp,beforeCD=g.p.cd.attack||0,previous=action;action=key;
      try{const result=original.apply(this,args);if(method==='skill'?result===true:(g.p.cd.attack||0)>beforeCD){uses[key]=(uses[key]||0)+1;
        const spent=Math.max(0,beforeMP-g.p.mp);mpSpent+=spent;log({type:'use',key,mpSpent:round(spent),mp:round(g.p.mp),cooldown:round(g.p.cd[key]||0)});}return result;
      }finally{action=previous;}};
  }
  log({type:'start',enemy:e.type,maxHP:e.maxHP,tier:e.v28Tier,player:plainStats(stats(g.p)),profile:profileForEnemy(e.type,e.id)});
  const initialEnemyHP=e.maxHP;
  for(let step=0;step<Math.ceil(c.duration/c.dt)&&!e.dead&&g.p.hp>0;step++){
    if(g.pending||g.transition||!g.active)break;
    strategyStep(g,e,c,step);
    const d=Math.hypot(e.x-g.p.x,e.y-g.p.y);
    let input={auto:true};
    // Defensive policy tries to leave special warnings via actual movement; basic locked hits remain real.
    if(c.strategy==='defensive'&&e.wind>0&&!e.actionSpec?.basicAttack){const a=Math.atan2(g.p.y-e.y,g.p.x-e.x);input={x:Math.cos(a),y:Math.sin(a),attack:d<CLASSES[c.cls].reach};}
    g.update(Math.min(c.dt,c.duration-g.time),input);
    maxBleed=Math.max(maxBleed,e.bleed||0,e.careerBleed?.stacks||0);
    while(samples.length&&samples[0].time<g.time-1)samples.shift();
    peakBurst=Math.max(peakBurst,samples.reduce((n,s)=>n+s.n,0));
    for(const event of g.events.splice(0))if(['death','scene','transition','map','level'].includes(event.type))log({type:'runtime',event:event.type});
  }
  const dealt=Object.values(byKind).reduce((a,b)=>a+b,0),won=!!e.dead;
  const outcome=won?'win':g.p.hp<=0?'loss':g.pending||g.transition||!g.active?'interrupted':'timeout';
  const result={config:c,outcome,elapsed:round(g.time),ttk:won?round(g.time):null,
    metrics:{damage:round(dealt),damageReceived:round(received),dps:g.time?round(dealt/g.time):0,
      peakOneSecondDamage:round(peakBurst),remainingHP:round(g.p.hp),remainingMP:round(g.p.mp),mpSpent:round(mpSpent),
      shieldAbsorbed:round(shieldAbsorbed),maxBleed,uses,damageByKind:byKind,damageBySource:bySkill,
      enemyInitialHP:initialEnemyHP,enemyRemainingHP:round(Math.max(0,e.hp)),enemyAttacks:e.attackAttempts||0},
    events,limits:LIMITS};
  if(!Object.values(result.metrics).filter(v=>typeof v==='number').every(Number.isFinite))throw Error('Nonfinite experiment metric');
  return result;
}

export function plainStats(s){return {...s,affixes:[...s.affixes].sort()};}

export function summarize(runs) {
  const wins=runs.filter(x=>x.outcome==='win'),times=wins.map(x=>x.ttk).sort((a,b)=>a-b);
  const quantile=p=>times.length?times[Math.floor((times.length-1)*p)]:null;
  const avg=k=>runs.reduce((s,x)=>s+x.metrics[k],0)/runs.length;
  const rate=wins.length/runs.length,z=1.96,n=runs.length,den=1+z*z/n;
  const center=(rate+z*z/(2*n))/den,half=z*Math.sqrt(rate*(1-rate)/n+z*z/(4*n*n))/den;
  return {count:n,winRate:rate,winRateWilson95:[center-half,center+half],ttk:{p10:quantile(.1),median:quantile(.5),p90:quantile(.9)},
    meanDPS:avg('dps'),meanDamageReceived:avg('damageReceived'),meanMPSpent:avg('mpSpent'),
    meanRemainingHP:avg('remainingHP'),meanPeakOneSecondDamage:avg('peakOneSecondDamage'),
    outcomes:Object.fromEntries(['win','loss','timeout','interrupted'].map(k=>[k,runs.filter(x=>x.outcome===k).length]))};
}
