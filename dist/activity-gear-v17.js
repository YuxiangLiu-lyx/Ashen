// Authored rewards; callers own the persisted random draw and claim ledger.
const ROUTES={bloodblade:'shadow',assassin:'shadow',nightmare:'shadow',dreadguard:'oath',berserker:'oath',spellbreaker:'oath',pyromancer:'ember',frostweaver:'ember',riftmage:'ember'};
const LABELS={bloodblade:'缝骨',assassin:'掩声',nightmare:'追夜',dreadguard:'守灯',berserker:'裂铁',spellbreaker:'咒钢',pyromancer:'星火',frostweaver:'凝霜',riftmage:'织星'};
const TYPES={head:'护额',feet:'行靴',relic:'刻印'};
const EFFECTS={
 bloodblade:[{dotDamage:.12},{skillDamage:.07},{reduction:.025}],
 assassin:[{executeDamage:.10},{crit:.025},{skillDamage:.07}],
 nightmare:[{basicDamage:.15},{haste:.06},{onHitPower:.06}],
 dreadguard:[{basicDamage:.12},{reduction:.025},{manaRegen:.25}],
 berserker:[{basicDamage:.15},{executeDamage:.10},{haste:.06}],
 spellbreaker:[{onHitWis:.30},{manaRegen:.3},{skillDamage:.07}],
 pyromancer:[{skillDamage:.08},{dotDamage:.12},{manaRegen:.3}],
 frostweaver:[{slowDamage:.10},{reduction:.025},{manaRegen:.3}],
 riftmage:[{skillDamage:.08},{mp:35},{manaRegen:.3}]
};
const pct=n=>Number((n*100).toFixed(1))+'%';
export function activityGearTextV17(s){return Object.entries(s).map(([k,n])=>({basicDamage:'普攻伤害 +'+pct(n),haste:'独立装备攻速 +'+pct(n),onHitPower:'普攻附伤：基础战力 ×'+n,onHitWis:'普攻附伤：精神 ×'+n,skillDamage:'直接战技傷害 +'+pct(n),dotDamage:'持续伤害 +'+pct(n),executeDamage:'对生命低于35%的目标直接伤害 +'+pct(n),crit:'暴击率 +'+pct(n),reduction:'减伤 +'+pct(n),slowDamage:'对受控目标直接伤害 +'+pct(n),manaRegen:'每秒回蓝 +'+n,mp:'法力上限 +'+n})[k]).join('；').replace('傷','伤');}
export function createActivityGearV17(cls,careerId,slot,variant=0,quality='epic'){
 if(ROUTES[careerId]!==cls||!TYPES[slot]||!Number.isInteger(variant)||variant<0||variant>2||!['epic','legendary'].includes(quality))return null;
 const legendary=quality==='legendary',primary={shadow:'dex',oath:'str',ember:'wis'}[cls],attrs={[primary]:(slot==='relic'?18:16)+variant*2+(legendary?2:0),vit:(slot==='relic'?7:5)+(legendary?1:0)};
 if(careerId==='dreadguard'){attrs.vit+=5;attrs.str-=4;}if(careerId==='spellbreaker'){attrs.wis=Math.floor(attrs.str/2);attrs.str-=attrs.wis;}
 const special={...EFFECTS[careerId][variant]};
 return {id:'quest-v17-activity-'+careerId+'-'+slot+'-'+variant,name:LABELS[careerId]+' · '+['稳纹','回纹','深纹'][variant]+TYPES[slot],slot,rarity:quality,minLevel:18,
  atk:(slot==='relic'?18:6)+(legendary?4:0),hp:(slot==='relic'?75:slot==='head'?55:45)+(legendary?15:0),attrs,affix:null,careerId,
  activityGearV17:{version:17,variant,quality},activityGearStatsV17:special,activityGearDescriptionV17:activityGearTextV17(special)+'。同类城中历练词条仅取最高值；只在对应转职下生效。',source:'阙灯城 · 城中历练'};
}
export function activityGearBonusesV17(p){
 const out={};if(!ROUTES[p?.career?.id]||p.career.preview)return out;
 const seen=new Set();
 for(const [slot,item]of Object.entries(p.gear||{})){
  const data=item?.activityGearV17;if(!data||item.slot!==slot||item.careerId!==p.career.id)continue;
  const authored=createActivityGearV17(p.cls,item.careerId,slot,data.variant,data.quality);
  if(!authored||item.id!==authored.id||seen.has(item.id))continue;seen.add(item.id);
  // Two copies with different slots do not duplicate the same special effect.
  for(const [k,n]of Object.entries(authored.activityGearStatsV17))out[k]=Math.max(out[k]||0,n);
 }
 return out;
}
