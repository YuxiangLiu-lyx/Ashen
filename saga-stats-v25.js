// Runtime association, never copied into equipment or independently owned companions.
const builds=new WeakMap();
export const SAGA_MAX_LEVEL_V25=48;
export const sagaLevelCapV25=g=>g?.sagaV25?.started&&!g?.memoryV13?.active?SAGA_MAX_LEVEL_V25:32;
export const sagaSavedLevelCapV25=s=>s?.sagaV25?.schema===1&&s.sagaV25.started&&!s.memoryV13?SAGA_MAX_LEVEL_V25:32;
export function syncSagaBuildV25(p,state){if(p&&typeof p==='object')builds.set(p,state);}
// Explicit UI preview cloning: descendants retain the same lineage, other actors do not.
export function sagaPreviewBuildV25(source,changes={}){
 const preview={...source,...changes},s=builds.get(source);
 if(s&&!source?.mercenaryId&&!preview.mercenaryId&&source?.cls===preview.cls&&preview.cls!=='saint'&&!preview.memoryEmpowered)builds.set(preview,s);
 return preview;
}
export function sagaWeaponBonusV25(p){
 const s=builds.get(p),armed=!!(p?.gear?.weapon||p?.gear?.offhand);
 if(!s?.started||!armed||p?.mercenaryId||p?.cls==='saint'||p?.memoryEmpowered)return {power:0,hp:0,haste:0,reduction:0,spirit:false};
 const lessons=Math.min(3,s.training?.length||0),rank=s.spirit?.unlocked?Math.max(1,Math.min(4,s.spirit.level||1)):0;
 return {power:lessons*15+(rank?55+rank*20:0),hp:lessons*65+(rank?80+rank*35:0),haste:lessons*.015+rank*.0125,reduction:rank*.005,spirit:rank>0};
}
export function sagaBasePowerV25(p){return sagaWeaponBonusV25(p).power;}
export function applySagaStatsV25(p,stats){const b=sagaWeaponBonusV25(p);if(!b.power&&!b.hp&&!b.haste&&!b.reduction)return stats;return {...stats,hp:Math.round(stats.hp+b.hp),haste:(stats.haste||0)+b.haste,attackRate:stats.attackRate*(1+(stats.haste||0))/(1+(stats.haste||0)+b.haste),reduction:Math.min(.60,(stats.reduction||0)+b.reduction)};}
