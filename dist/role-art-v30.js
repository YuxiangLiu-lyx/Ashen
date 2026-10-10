// Identity, clothing and silhouette define rank. Human body scale stays stable.
export const ROLE_ART_V30={
 soldier:{sheet:'chapterGuards',height:82,reference:'assets/v5/npc-portraits-v5.png#6',identity:'头盔、短须、朴素锁甲与蓝罩衣、圆盾'},
 elite:{sheet:'spatialElite',height:83,reference:'assets/v5/npc-portraits-v5.png#6',identity:'分片胸甲、活动肩甲、开面盔、短甲裙、尖底盾；同军种独立装备'},
 officer:{sheet:'spatialOfficer',height:84,reference:'assets/v5/npc-portraits-v5.png#8',identity:'灰黑短发短须、红披风、双圆徽扣、纹章胸甲、军官佩剑'}
};
export function militaryRoleV30(a){return a.type==='captain'||['bren','captain','ch2-bren'].includes(a.id)?'officer':a.elite||a.id==='bodyguard1'?'elite':'soldier';}
export function roleAtlasV30(a){return ROLE_ART_V30[militaryRoleV30(a)];}
