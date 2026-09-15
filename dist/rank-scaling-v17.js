// Shared rank curves: old ranks retain their values; later investment is bounded.
export const SKILL_RANK_CAP_V17=8;
export function skillRankMultiplierV17(rank=1,career=false){
 const extra=Math.max(0,Math.min(SKILL_RANK_CAP_V17,Number(rank)||1)-1);
 return Number((1+Math.min(2,extra)*(career?.2:.25)+Math.max(0,extra-2)*(career?.05:.06)).toFixed(3));
}
export function skillRankDurationV17(rank=1){
 const extra=Math.max(0,Math.min(SKILL_RANK_CAP_V17,Number(rank)||1)-1);
 return Number((Math.min(2,extra)+Math.max(0,extra-2)*.35).toFixed(2));
}
export function skillRankSupportV17(rank=1){
 const extra=Math.max(0,Math.min(SKILL_RANK_CAP_V17,Number(rank)||1)-1);
 return Math.min(2,extra)+Math.max(0,extra-2)*.3;
}
export function saintBondBonusesV17(p){
 const count=new Set((p?.saintBondV17?.schema===1&&Array.isArray(p.saintBondV17.completed)?p.saintBondV17.completed:[]).filter(k=>['drink','game','practice'].includes(k))).size;
 return p?.cls==='saint'||p?.career?.preview||p?.memoryEmpowered?{hp:0,reduction:0}:{hp:count*10,reduction:count*.005};
}
