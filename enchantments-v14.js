import {ENCHANT_DEFS as DEFS,ENCHANT_RULES as RULES} from './combat-data-v14.js';
export {DEFS as ENCHANT_DEFS,RULES as ENCHANT_RULES};
const rows=p=>Object.values(p.gear||{}).filter(Boolean).map(i=>({i,e:i.enchantment,d:DEFS[i.enchantment?.defId]})).filter(r=>r.d&&r.d.slots.includes(r.i.slot));
export function enchantStat(p,key){return rows(p).reduce((n,{e,d})=>n+(d.kind==='stat'&&d.stat===key?e.value:0),0);}
export function enchantDescription(e){const d=DEFS[e?.defId];return d?`${RULES.qualityNames[e.quality]} · ${d.name}：${d.display.replaceAll('{value}',e.value).replaceAll('{decimal}',(e.value/10).toFixed(1))}`:'尚无刻印';}
export function skillEnchantRows(p,k){const m=new Map();for(const r of rows(p)){if(r.d.kind!=='skill'||!r.d.skills.includes(k))continue;const key=r.d.stackGroup||r.d.id;if(!m.has(key)||m.get(key).e.value<r.e.value)m.set(key,r);}return [...m.values()];}
export function modifySkill(p,k,s,{range,radius,hpCap,maxHP}={}){
 if(!s)return s;s={...s};let mult=1,healMult=1,shieldMult=1;const desc=[];const baseCd=s.cd;
 for(const {e,d} of skillEnchantRows(p,k)){
  desc.push(enchantDescription(e));if(d.modifier==='damagePct')mult*=1+e.value/100;
  if(d.damageMultiplier)mult*=d.damageMultiplier;
  if(d.modifier==='rangePct')range=(range||125)*(1+e.value/100);
  if(d.modifier==='radiusPct')radius=(radius||170)*(1+e.value/100);
  if(d.modifier==='healPct')healMult*=1+e.value/100;
  if(d.modifier==='shieldPct')shieldMult*=1+e.value/100;
  if(d.mpAdd)s.cost+=d.mpAdd;
  if(d.modifier==='mpFlatReduction'){s.cost=Math.max(4,s.cost-e.value);s.cd+=d.cdAdd;}
  if(d.modifier==='cooldownTenthsReduction')s.cd=Math.max(baseCd*.85,s.cd-e.value/10);
 }
 if(range)s.range=range;if(radius)s.radius=radius;
 if(Number.isFinite(s.damage)){s.damage*=mult;if(s.damage>0)s.value=Math.round(s.damage)+' 伤害';}
 if(s.nova)s.nova*=mult;
 if(Number.isFinite(s.heal)&&k==='saintMend'){s.heal=Math.round(Math.min(maxHP*hpCap,s.heal*healMult));s.value=s.heal+' 治疗';}
 if(Number.isFinite(s.shield)){s.shield=Math.round(Math.min(maxHP*hpCap,s.shield*shieldMult));s.value=s.shield+' 护盾';}
 if(desc.length){s.extra=(s.extra||'')+' 刻印：'+desc.join(' ');if(mult!==1&&s.formula)s.formula=`(${s.formula})×${mult.toFixed(3)}（刻印）`;if(s.increments&&mult!==1)s.increments+='；以上基础增幅另乘刻印倍率 '+mult.toFixed(3);if(s.range)s.extra+=` 实际距离 ${Math.round(s.range)}。`;if(s.radius)s.extra+=` 实际半径 ${Math.round(s.radius)}。`;}
 return s;
}
export function validateEnchantment(e,slot){if(e==null)return;const d=DEFS[e.defId],r=d?.range?.[e.quality];if(!d||e.schema!==1||!r||!d.slots.includes(slot)||!Number.isInteger(e.value)||e.value<r[0]||e.value>r[1]||typeof e.nonce!=='string'||e.nonce.length>100)throw new Error('装备刻印记录不正确。');}
function pick(list,rng,weight){const total=list.reduce((n,x)=>n+weight(x),0);let r=rng()*total;for(const x of list){r-=weight(x);if(r<0)return x;}return list.at(-1);}
export function rollEnchantment(slot,rng,nonce,family='all'){const defs=Object.values(DEFS).filter(d=>d.slots.includes(slot)&&(family==='all'||d.kind===family));if(!defs.length)return null;const d=pick(defs,rng,d=>d.weight),quality=pick(Object.keys(RULES.qualityWeights),rng,k=>RULES.qualityWeights[k]),range=d.range[quality];return {schema:1,defId:d.id,quality,value:range[0]+Math.floor(rng()*(range[1]-range[0]+1)),nonce};}
// This is a bonus damage packet, never a second attack or trigger source.
export function enchantProc(g,e,kind,basePower,defence){if(!['hit','skill','ch3skill'].includes(kind)||e.dead)return;const r=rows(g.p).find(r=>r.d.kind==='element'&&r.i.slot==='weapon');if(!r)return;const {d,v,e:engraving}= {...r,v:r.e.value};if((g.p.cd[d.procFamily]||0)>0)return;g.p.cd[d.procFamily]=d.cooldown;
 const targets=[e];if(d.targets===2){const other=g.enemies.filter(x=>x!==e&&!x.dead&&Math.hypot(x.x-e.x,x.y-e.y)<=d.jumpRange&&g.clearLine(e,x,false)).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(other)targets.push(other);}
 for(let i=0;i<targets.length;i++){const t=targets[i],n=Math.max(1,Math.round((v+basePower*d.basePowerCoefficient)*(i?d.secondaryMultiplier:1)*defence(t)));g.damage(t,n,'enchant');g.effect(d.element==='lightning'?'lightning':d.element==='fire'?'flame':'frost',t.x,t.y-25,30,'#c4daf0',.3);if(d.slow){t.slow=Math.max(t.slow||0,d.slow.duration);t.slowFactor=t.isBoss?d.slow.bossFactor:d.slow.normalFactor;}}

}
