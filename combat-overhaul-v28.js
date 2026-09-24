// V28 combat-system overhaul. Installed last so legacy story/runtime behavior stays intact.
// The project still uses the existing sprite atlases; variants select different families and
// render filters instead of inventing missing binary assets.

export const V28_VERSION=28;
export const V28_RARE_DROP_CHANCE=.01;

export const V28_ENEMY_VARIANTS=Object.freeze([
 {tier:1,family:'beast',name:'灰脊鼠',visual:'rat',filter:'brightness(.92) saturate(1.18)',hp:1.04,damage:.98},
 {tier:1,family:'spirit',name:'暮翼蝠',visual:'bat',filter:'brightness(.86) saturate(1.18) hue-rotate(18deg)',hp:.96,damage:1.05},
 {tier:1,family:'humanoid',name:'旧城区巡兵',visual:'guard',filter:'brightness(.95) saturate(.88)',hp:1.08,damage:1.02},
 {tier:2,family:'beast',name:'荒径瘦狼',visual:'wolf',filter:'brightness(.9) saturate(1.12) sepia(.12)',hp:1.05,damage:1.04},
 {tier:2,family:'spirit',name:'黑羽夜蝠',visual:'bat',filter:'brightness(.78) saturate(1.35) hue-rotate(205deg)',hp:.98,damage:1.09},
 {tier:2,family:'humanoid',name:'裂石追兵',visual:'guard',filter:'brightness(.88) contrast(1.08) saturate(.78)',hp:1.12,damage:1.04},
 {tier:3,family:'beast',name:'焦骨猎犬',visual:'hellHound',filter:'brightness(.98) saturate(1.12)',hp:1.07,damage:1.05},
 {tier:3,family:'spirit',name:'灰烬亡魂',visual:'hellSoul',filter:'brightness(.92) saturate(.95) hue-rotate(16deg)',hp:1.00,damage:1.10},
 {tier:3,family:'humanoid',name:'流放重卫',visual:'hellGuard',filter:'brightness(.94) saturate(.92)',hp:1.14,damage:1.05},
 {tier:4,family:'beast',name:'黑潮猎犬',visual:'deepHound',filter:'brightness(.82) saturate(1.32) hue-rotate(175deg)',hp:1.10,damage:1.07},
 {tier:4,family:'spirit',name:'断誓幽魂',visual:'deepSoul',filter:'brightness(.88) saturate(1.28) hue-rotate(188deg)',hp:1.02,damage:1.12},
 {tier:4,family:'humanoid',name:'熔甲守卫',visual:'deepGuard',filter:'brightness(.9) saturate(1.22) sepia(.16)',hp:1.16,damage:1.07},
 {tier:5,family:'beast',name:'深井血犬',visual:'hellHound',filter:'brightness(.78) saturate(1.55) hue-rotate(325deg)',hp:1.12,damage:1.10},
 {tier:5,family:'spirit',name:'沉灯怨魂',visual:'hellSoul',filter:'brightness(.72) saturate(1.22) hue-rotate(240deg)',hp:1.04,damage:1.14},
 {tier:5,family:'humanoid',name:'裂甲执刑者',visual:'hellGuard',filter:'brightness(.82) contrast(1.12) saturate(1.18)',hp:1.18,damage:1.09},
 {tier:6,family:'beast',name:'霜骨猎兽',visual:'deepHound',filter:'brightness(1.02) saturate(.72) hue-rotate(155deg)',hp:1.14,damage:1.11},
 {tier:6,family:'spirit',name:'失声祷魂',visual:'deepSoul',filter:'brightness(.86) saturate(.7) hue-rotate(125deg)',hp:1.06,damage:1.16},
 {tier:6,family:'humanoid',name:'黑铁审判兵',visual:'deepGuard',filter:'brightness(.72) contrast(1.2) saturate(.72)',hp:1.20,damage:1.10},
 {tier:7,family:'beast',name:'虚蚀猎兽',visual:'hellHound',filter:'brightness(.72) saturate(1.5) hue-rotate(260deg)',hp:1.16,damage:1.13},
 {tier:7,family:'spirit',name:'镜火幽魂',visual:'hellSoul',filter:'brightness(.96) saturate(1.5) hue-rotate(292deg)',hp:1.08,damage:1.18},
 {tier:7,family:'humanoid',name:'灰冠近卫',visual:'hellGuard',filter:'brightness(.8) contrast(1.16) saturate(.62)',hp:1.22,damage:1.12},
 {tier:8,family:'beast',name:'烬界凶兽',visual:'deepHound',filter:'brightness(.7) contrast(1.18) saturate(1.65) hue-rotate(312deg)',hp:1.18,damage:1.15},
 {tier:8,family:'spirit',name:'无名古魂',visual:'deepSoul',filter:'brightness(.68) contrast(1.12) saturate(1.45) hue-rotate(225deg)',hp:1.10,damage:1.20},
 {tier:8,family:'humanoid',name:'终誓重卫',visual:'deepGuard',filter:'brightness(.7) contrast(1.25) saturate(.85) hue-rotate(330deg)',hp:1.24,damage:1.14}
]);

export const V28_RARE_GEAR=Object.freeze([
 {id:'v28-greyfang-edge',tier:1,level:2,name:'灰牙磨刃',slot:'weapon',rarity:'rare',affix:'blood'},
 {id:'v28-cinder-cuff',tier:1,level:2,name:'余烬皮护腕',slot:'hands',rarity:'rare',affix:'fire'},
 {id:'v28-road-charm',tier:1,level:3,name:'旧路回声符',slot:'relic',rarity:'rare',affix:'echo'},
 {id:'v28-night-runner',tier:2,level:5,name:'夜行软靴',slot:'feet',rarity:'rare',affix:'echo'},
 {id:'v28-stonewatch',tier:2,level:5,name:'石哨护胸',slot:'chest',rarity:'rare',affix:'ward'},
 {id:'v28-spark-grip',tier:2,level:6,name:'逐雷握手',slot:'hands',rarity:'rare',affix:'storm'},
 {id:'v28-bonebrand',tier:3,level:8,name:'焦骨刻刃',slot:'weapon',rarity:'epic',affix:'fire'},
 {id:'v28-ash-hood',tier:3,level:8,name:'灰烬兜帽',slot:'head',rarity:'rare',affix:'mercy'},
 {id:'v28-soul-knot',tier:3,level:9,name:'缚魂结饰',slot:'relic',rarity:'epic',affix:'echo'},
 {id:'v28-tide-mail',tier:4,level:11,name:'黑潮旅甲',slot:'chest',rarity:'epic',affix:'ward'},
 {id:'v28-rift-boots',tier:4,level:11,name:'裂隙踏靴',slot:'feet',rarity:'epic',affix:'storm'},
 {id:'v28-oath-ember',tier:4,level:12,name:'断誓余烬刃',slot:'weapon',rarity:'epic',affix:'fire'},
 {id:'v28-bloodwell',tier:5,level:14,name:'血井护手',slot:'hands',rarity:'epic',affix:'blood'},
 {id:'v28-lantern-crown',tier:5,level:14,name:'沉灯冠',slot:'head',rarity:'legendary',affix:'echo'},
 {id:'v28-executor-shell',tier:5,level:15,name:'执刑者壳甲',slot:'chest',rarity:'legendary',affix:'ward'},
 {id:'v28-frost-bite',tier:6,level:17,name:'霜骨咬刃',slot:'weapon',rarity:'legendary',affix:'storm'},
 {id:'v28-prayer-thread',tier:6,level:17,name:'失声祷线',slot:'relic',rarity:'legendary',affix:'mercy'},
 {id:'v28-black-iron-step',tier:6,level:18,name:'黑铁行刑靴',slot:'feet',rarity:'legendary',affix:'ward'},
 {id:'v28-voidfang',tier:7,level:20,name:'虚蚀牙刃',slot:'weapon',rarity:'legendary',affix:'blood'},
 {id:'v28-mirrorflame',tier:7,level:21,name:'镜火护符',slot:'relic',rarity:'legendary',affix:'fire'},
 {id:'v28-greycrown',tier:7,level:21,name:'灰冠战盔',slot:'head',rarity:'legendary',affix:'storm'},
 {id:'v28-ashen-vow',tier:8,level:23,name:'烬誓',slot:'weapon',rarity:'abyssal',affix:'blood'},
 {id:'v28-nameless-echo',tier:8,level:23,name:'无名古魂之环',slot:'relic',rarity:'abyssal',affix:'echo'},
 {id:'v28-last-guard',tier:8,level:24,name:'终誓黑甲',slot:'chest',rarity:'abyssal',affix:'ward'}
]);

// Six class core skills (Q/E across three player classes) plus the existing
// eighteen learnable/system skills form the 24-skill V28 combat catalog.
export const V28_SKILL_CATALOG=Object.freeze([
 'shadow:q','shadow:e','oath:q','oath:e','ember:q','ember:e',
 'fieldMend','battleTempo','stoneSkin','focusBreath','bladeRain','chainFetters','ashBurst','iceShard',
 'boneBreak','emberLance','soulBind','ashWard','bloodPact','graveBell','wispLantern','counterBrand','ferrymanCut','echoExchange'
]);

const VARIANTABLE=new Set(['rat','bat','wolf','guard','hellHound','hellSoul','hellGuard','deepHound','deepSoul','deepGuard','deepElite']);
const BOSS_IDS=/captain|boss|warden|jailer|odric|martha|severin|sentinel|scuttler|bloodDemon/i;

function tierFor(g,e=null){
 const level=Math.max(1,Number(g?.p?.level)||1,Number(e?.level)||1);
 if(level<=3)return 1;if(level<=6)return 2;if(level<=9)return 3;if(level<=12)return 4;
 if(level<=15)return 5;if(level<=18)return 6;if(level<=22)return 7;return 8;
}
function hash(text){let h=2166136261>>>0;for(const ch of String(text||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function family(type){
 if(['rat','wolf','hellHound','deepHound'].includes(type))return 'beast';
 if(['bat','hellSoul','deepSoul'].includes(type))return 'spirit';
 return 'humanoid';
}
function isBoss(e){return !!(e?.isBoss||e?.isBossArena||e?.squadLeader||e?.type==='captain'||e?.type==='hellJailer'||BOSS_IDS.test(e?.id||'')||BOSS_IDS.test(e?.type||''));}
function rewardGoldNumber(v,fallback){if(Array.isArray(v))return Math.round((Number(v[0])||0)+(Number(v[1])-Number(v[0])||0)/2);return Number.isFinite(v)?v:fallback;}
function variantFor(e,tier){
 if(!VARIANTABLE.has(e.type))return null;
 const f=family(e.type),lo=Math.max(1,tier-1),pool=V28_ENEMY_VARIANTS.filter(v=>v.family===f&&v.tier>=lo&&v.tier<=tier);
 return pool[hash((e.id||e.type)+':'+tier)%pool.length]||null;
}
function tuneEnemy(g,e,{restore=false}={}){
 if(!e||e.v28Tuned)return e;
 const tier=tierFor(g,e),boss=isBoss(e),v=variantFor(e,tier);
 const ratio=e.dead?0:Math.max(0,Math.min(1,(Number(e.hp)||0)/Math.max(1,Number(e.maxHP)||1)));
 const baseHP=Math.max(1,Number(e.maxHP)||Number(e.hp)||1);
 const hpScale=(boss?1.08+tier*.015:1.15+tier*.045)*(v?.hp||1);
 const maxHP=Math.max(1,Math.round(baseHP*hpScale));
 e.maxHP=maxHP;e.hp=e.dead?0:Math.max(1,Math.round(maxHP*(restore?ratio:1)));
 e.v28DamageMultiplier=Number(((boss?1.04+tier*.01:1.03+tier*.02)*(v?.damage||1)).toFixed(4));
 e.v28RewardXP=Math.max(1,Math.round((Number(e.rewardXP)||Math.max(10,(Number(e.level)||tier*3)*4))*1.08));
 e.rewardXP=e.v28RewardXP;
 e.v28RewardGold=Math.max(1,Math.round(rewardGoldNumber(e.rewardGold,2+tier)*1.05));
 if(Array.isArray(e.rewardGold))e.rewardGold=e.rewardGold.map(n=>Math.max(1,Math.round(Number(n)*1.05)));
 else if(Number.isFinite(e.rewardGold))e.rewardGold=Math.max(1,Math.round(e.rewardGold*1.05));
 if(v&&!boss){e.v28Variant=v.name;e.label=v.name;e.v28VisualType=v.visual;e.v28Filter=v.filter;}
 e.v28Tier=tier;e.v28Tuned=true;return e;
}
function owns(g,id){return [...(g.p?.bag||[]),...Object.values(g.p?.gear||{}),...(g.pendingRewards||[])].some(i=>i?.id===id);}
function rareDrop(g,e,loot){
 if(!e||e.v28RareRoll||e.storyTag||e.trialFloor||e.v11Add)return false;
 e.v28RareRoll=true;
 if((g.rng?.()??Math.random())>=V28_RARE_DROP_CHANCE)return false;
 const tier=tierFor(g,e),lo=Math.max(1,tier-1),pool=V28_RARE_GEAR.filter(x=>x.tier>=lo&&x.tier<=tier&&!owns(g,x.id));
 if(!pool.length)return false;
 const pick=pool[Math.floor((g.rng?.()??Math.random())*pool.length)];
 const item=loot(g.p.cls,pick.level,()=>g.rng?.()??Math.random(),{id:pick.id,name:pick.name,slot:pick.slot,rarity:pick.rarity,affix:pick.affix,minLevel:Math.max(1,pick.level-2)});
 item.v28Drop=true;item.v28Tier=pick.tier;
 if(g.obtainGear(item)){g.text('稀有掉落',e.x,e.y-92,'#f0c476');return true;}
 return false;
}

export function installCombatOverhaulV28(RPG,{loot,SKILLS,ITEMS}){
 if(!RPG?.prototype||RPG.prototype.v28CombatInstalled)return;
 const P=RPG.prototype;
 const oldEnemy=P.enemy,oldRestore=P.restore,oldDrop=P.dropCombatLoot;
 P.enemy=function(...args){return tuneEnemy(this,oldEnemy.apply(this,args));};
 P.restore=function(saved){const out=oldRestore.call(this,saved);for(const st of Object.values(this.states||{}))for(const e of st?.enemies||[])tuneEnemy(this,e,{restore:true});return out;};
 P.dropCombatLoot=function(e){const out=oldDrop?.call(this,e);rareDrop(this,e,loot);return out;};
 P.v28CombatCatalog=function(){return {version:V28_VERSION,enemyVariants:V28_ENEMY_VARIANTS.length,skills:V28_SKILL_CATALOG.length,rareGear:V28_RARE_GEAR.length,rareDropChance:V28_RARE_DROP_CHANCE};};
 P.v28CombatInstalled=true;
 // Metadata is intentionally additive; the existing skill/item runtime remains authoritative.
 if(SKILLS)Object.defineProperty(SKILLS,'v28Catalog',{value:V28_SKILL_CATALOG,enumerable:false,configurable:true});
 if(ITEMS)Object.defineProperty(ITEMS,'v28RareGear',{value:V28_RARE_GEAR,enumerable:false,configurable:true});
}
