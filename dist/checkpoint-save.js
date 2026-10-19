// Browser persistence policy; snapshots remain owned by the installed RPG.
export const AUTOSAVE_SECONDS=300;
export function checkpointBlockReason(g){
 if(!g)return '没有正在进行的旅程。';
 if(g.p.hp<=0)return '倒下后的状态不会覆盖存档。';
 if(g.c1TrainingSession)return '练习结束后可以保存，原行装会保留。';
 return g.canSave()?'':g.saveBlockReason()||'当前无法保存。';
}
export function automaticSaveSafe(g){
 if(checkpointBlockReason(g)||g.pending||g.transition||g.memoryV13?.active)return false;
 if(g.bullets?.length||g.zones?.length)return false;
 return !g.enemies?.some(e=>!e.dead&&(e.wind>0||e.attackAnim>0||Math.hypot(e.x-g.p.x,e.y-g.p.y)<300&&g.clearLine(g.p,e,false)));
}
export class CheckpointClock{
 constructor(){this.reset();}
 reset(){this.elapsed=0;this.retry=0;this.savedAt=null;this.kind=null;}
 saved(kind,now=Date.now()){this.elapsed=0;this.retry=0;this.savedAt=now;this.kind=kind;}
 tick(dt,g,playing,write){
  if(!playing||!g||g.p.hp<=0)return false;
  this.elapsed+=Math.max(0,Math.min(dt,1));this.retry=Math.max(0,this.retry-dt);
  if(this.elapsed<AUTOSAVE_SECONDS||this.retry>0||!automaticSaveSafe(g))return false;
  // A storage failure never counts as a successful checkpoint or retries every frame.
  this.retry=5;return write('auto');
 }
}
