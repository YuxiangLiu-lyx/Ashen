// Map pre-1.2 static cursors by meaning. Inline text remains its own saved
// conversation; old backstage tails retain their independent cursor/commit.
export const C1_CARE_REVISION=1;
export const C1_CARE_CURSOR_MAP={
 contract:[...Array.from({length:20},(_,i)=>i),21,22,23,26,31],
 sisterIdle:[0,1,2,3,8,9,10],
 sisterBeforeDeparture:[0,1,2,3,4,5,6,7,8,13],
 c1TrainingReason:[1,2,3],
};
export function migrateC1CarePending(pending){
 if(!pending||!Object.hasOwn(C1_CARE_CURSOR_MAP,pending.id)||pending.c1CareRevision===C1_CARE_REVISION)return pending;
 const next={...pending,c1CareRevision:C1_CARE_REVISION};
 if(!pending.lines&&!pending.c1Tail){
  const index=pending.line??0,mapped=C1_CARE_CURSOR_MAP[pending.id][index];
  if(Number.isInteger(index)&&mapped!==undefined)next.line=mapped;
 }
 return next;
}
