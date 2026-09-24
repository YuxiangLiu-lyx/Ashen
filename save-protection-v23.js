// Preserve pre-reconstruction save bytes. Unsupported progress is never guessed,
// skipped or converted to an empty state. This is not proof of real V22 compatibility.
const KNOWN_TOP_LEVEL_V23=new Set(['version','map','chapter','time','p','flags','quests','states','pending','companion','pendingRewards','knowledge','relations','beforeDeparture','ch3','v11','v12','v13','ch5','mercenariesV14','hellActivitiesV15','hellActivitiesV17','saintBondV17','hellExpeditionsV18','cityStoriesV18','discoveryV19','saintStoryV18','romanceV20','arrivalV22','cityMomentsV24','sagaV25','sagaV26','memoryV13']);
// These four actual production helpers intentionally create dialogue in pending.lines.
const INLINE_SCENES_V23=new Set(['_spoken','_hellTalk','_explore','_post_sign']);
export function assertSupportedSavedProgressV23(save,dialogues){
 if(!save||typeof save!=='object'||Array.isArray(save))return; // existing parser owns shape errors
 const unknown=Object.keys(save).filter(k=>!KNOWN_TOP_LEVEL_V23.has(k));
 if(unknown.length)throw Error('这份存档包含当前版本尚不能接续的扩展进度。原始内容已保留，请先导出存档。');
 const q=save.pending;
 if(q&&!Object.hasOwn(dialogues,q.id)&&!INLINE_SCENES_V23.has(q.id))throw Error('这段未结束的剧情在当前版本中尚不能接续。原始内容已保留，请先导出存档。');
}
export function storedSaveRecordV23(storage,key){
 const candidates=[key,...(key==='ashen-vow-rpg-v10'?['ashen-vow-rpg-v9','ashen-vow-rpg-v8','ashen-vow-rpg-v7','ashen-vow-rpg-v6','ashen-vow-rpg-v5','ashen-vow-rpg-v4','ashen-vow-rpg-v3','ashen-vow-rpg-v2']:[])];
 try{for(const sourceKey of candidates){const raw=storage.getItem(sourceKey);if(raw!==null&&raw!=='')return {key:sourceKey,raw};}}catch{return null;}
 return null;
}
export function preserveStoredSaveV23(storage,record){
 if(!record)return null;
 const key=record.key+'-before-v23-original',existing=storage.getItem(key);
 if(existing===null){storage.setItem(key,record.raw);if(storage.getItem(key)!==record.raw)throw Error('原存档备份未能写入，请先导出原始存档。');}
 return {key,raw:existing===null?record.raw:existing};
}
export function originalStoredSaveV23(storage,key){
 const current=storedSaveRecordV23(storage,key);if(!current)return null;
 const archived=storage.getItem(current.key+'-before-v23-original');return archived===null?current:{key:current.key+'-before-v23-original',raw:archived};
}
