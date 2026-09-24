import {POTION_IDS} from './systems-data-v14.js';
// Learned ranks, equipped combat skills and invested points are separate state.
export const ACTIVE_LIMIT=5;
export const UTILITIES=[...POTION_IDS,'resonance'];
export const RESET_ITEMS={attributeReset:{kind:'attributes',name:'澄心盐',cost:85,shards:2},skillReset:{kind:'skills',name:'回响墨',cost:85,shards:2}};
export const SAINT_START=['saintRay','saintMend','saintAegis','saintNova','saintChime'];
export function freeRank(p,k,skills){return p.skillOrigins?.[k]||p.cls!=='saint'&&(k==='q'||k==='e')||p.cls==='saint'&&SAINT_START.includes(k)||skills[k]?.book&&(p.knownBooks||[]).includes(k)?1:0;}
export function invested(p,k,skills){return Math.max(0,(p.skills[k]||0)-freeRank(p,k,skills))*(skills[k]?.cost||0);}
export function cleanBindings(p,skills){const active=new Set(p.activeSkills);p.bar=[0,1].map(pg=>Array.from({length:6},(_,i)=>{const k=p.bar?.[pg]?.[i];return UTILITIES.includes(k)||active.has(k)&&!skills[k]?.passive?k:null;}));}
export function migrateAttunement(p,skills,version){
 p.skillOrigins={...(p.skillOrigins||{})};
 for(const k of p.cls==='saint'?SAINT_START:['q','e'])p.skillOrigins[k]='innate';
 for(const k of p.knownBooks||[])if(skills[k]?.book)p.skillOrigins[k]=p.skillOrigins[k]||'book';
 p.knownBooks=[...new Set((p.knownBooks||[]).filter(k=>skills[k]?.book))];
 for(const k of Object.keys(p.skillOrigins).filter(k=>skills[k]))p.skills[k]=Math.max(1,p.skills[k]||0);
 const learned=Object.keys(p.skills).filter(k=>skills[k]&&!skills[k].passive&&p.skills[k]>0);
 const preferred=version<7?[...(p.bar||[]).flat(),...learned]:(Array.isArray(p.activeSkills)?p.activeSkills:[]);
 p.activeSkills=[...new Set(preferred)].filter(k=>learned.includes(k)).slice(0,ACTIVE_LIMIT);
 p.skillSpent=Object.fromEntries(Object.keys(skills).map(k=>[k,invested(p,k,skills)]));
 cleanBindings(p,skills);
}
export function resetPreview(p,kind,skills){
 const points=kind==='attributes'?Object.values(p.attrs).reduce((a,b)=>a+b,0):Object.keys(skills).reduce((n,k)=>n+Math.min(p.skillSpent?.[k]||0,invested(p,k,skills)),0);
 return {points,kind,baseSkills:kind==='skills'?Object.keys(skills).filter(k=>freeRank(p,k,skills)):[]};
}
