import {CHENGLI_REWRITE_V27} from './chengli-text-v27.js';
import {DIALOGUE_MIGRATIONS_V26} from './dialogue-migrations-v26.js';
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const validRows=rows=>Array.isArray(rows)&&rows.length>0&&rows.length<=200&&rows.every(row=>Array.isArray(row)&&row.length===2&&row.every(v=>typeof v==='string'&&v.length<=2000));
const equalRows=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((row,i)=>Array.isArray(row)&&row.length===2&&row[0]===b[i][0]&&row[1]===b[i][1]);
const copyRows=rows=>rows.map(row=>[row[0],row[1]]);
// Exact static text migration and guard. Other save validators still run afterwards.
// Unregistered dynamic scenes retain their own existing validation rules.
// Register extra chapter author pairs via the factory, or append them to the data file.
export function createDialogueSaveMigratorV26(entries){
 if(!Array.isArray(entries)||entries.length>2048)throw new Error('对白迁移登记不完整。');
 const registry=new Map();
 for(const entry of entries){
  const {id,before,after}=entry||{};
  if(typeof id!=='string'||!id.length||!validRows(before)||!validRows(after)||before.length!==after.length||before.some((row,i)=>row[0]!==after[i][0]))throw new Error('对白迁移不得改变行数或说话人。');
  const bucket=registry.get(id)||[];
  const existing=bucket.find(item=>equalRows(item.before,before));
  if(existing&&!equalRows(existing.after,after))throw new Error('同一场对白的旧版本迁移存在冲突。');
  if(!existing)bucket.push({before:copyRows(before),after:copyRows(after)});
  registry.set(id,bucket);
 }
 return function migrateDialogueSaveV26(save){
  const active=new WeakSet(),done=new WeakMap();let visited=0;
  function walk(value,depth){
   if(!record(value))return value;
   if(active.has(value))throw new Error('存档中的历史记录不能循环引用。');
   if(depth>8||++visited>64)throw new Error('存档中的历史记录嵌套过深。');
   if(done.has(value))return done.get(value);
   active.add(value);let result=value;
   const change=(key,next)=>{if(result===value)result={...value};result[key]=next;};
   const pending=value.pending;
   if(record(pending)&&typeof pending.id==='string'&&pending.lines!==undefined&&pending.lines!==null){
    const variants=registry.get(pending.id);
    if(variants){
     const match=variants.find(entry=>equalRows(pending.lines,entry.before));
     if(match){if(!equalRows(pending.lines,match.after))change('pending',{...pending,lines:copyRows(match.after)});}
     else if(!variants.some(entry=>equalRows(pending.lines,entry.after)))throw new Error('对白版本无法识别，请使用完整的已发行存档。');
    }
   }
   if(record(value.beforeDeparture)){
    const next=walk(value.beforeDeparture,depth+1);
    if(next!==value.beforeDeparture)change('beforeDeparture',next);
   }
   if(record(value.memoryV13)&&record(value.memoryV13.reality)){
    const next=walk(value.memoryV13.reality,depth+1);
    if(next!==value.memoryV13.reality)change('memoryV13',{...value.memoryV13,reality:next});
   }
   active.delete(value);done.set(value,result);return result;
  }
  return walk(save,0);
 };
}
// Send every exact legacy version directly to the current text. A sequential V26 guard
// would reject already-updated V27 saves before the new migrator could inspect them.
const latestByIdV27=new Map(CHENGLI_REWRITE_V27.map(entry=>[entry.id,entry]));
const currentMigrationsV27=DIALOGUE_MIGRATIONS_V26.map(entry=>{
 const next=latestByIdV27.get(entry.id);
 if(!next)return entry;
 if(!equalRows(entry.after,next.before))throw new Error('对白迁移基线不一致：'+entry.id);
 return {...entry,after:next.after};
});
export const migrateDialogueSaveV26=createDialogueSaveMigratorV26([...currentMigrationsV27,...CHENGLI_REWRITE_V27]);
