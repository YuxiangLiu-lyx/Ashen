import {C1_CONVERSATIONS} from './chapter-one-conversations-data.js';
import {C1_HIDDEN} from './chapter-one-dialogues-v31.js';
import {C1_LOCAL_TALK} from './chapter-one-story-world.js';
import {C1_NPC_NAMES} from './chapter-one-objectives.js';
import {V12_PACING} from './pacing-data-v14.js';
// Install after the trial overlay. Keep shared arrays and saved full-text pages;
// only newly opened dialogue uses this edition. Actor IDs and quest commits stay stable.
export function installC1Conversations(RPG,{MAPS,QUESTS,ITEMS,DIALOGUES}){
 for(const e of C1_CONVERSATIONS){
  if(e.key.startsWith('local:')){C1_LOCAL_TALK[e.key.slice(6)]=e.rows[0][1];continue;}
  let rows;
  if(e.static)rows=DIALOGUES[e.key]||C1_HIDDEN[e.key];
  else if(e.key.startsWith('pacing:')){const[,id,part,index]=e.key.split(':'),q=V12_PACING.find(q=>q.id===id);rows=part==='goal'?q.dialogue.goal[index]:q.dialogue[part];}
  if(!rows)throw Error('Missing chapter-one conversation: '+e.key);
  if(rows.length!==e.rows.length)throw Error('Chapter-one page shape changed: '+e.key);
  rows.splice(0,rows.length,...e.rows.map(r=>r.slice()));
 }
 C1_NPC_NAMES.c1rosa='商人';
 for(const map of Object.values(MAPS))for(const n of map.npcs||[])if(n.id==='c1rosa')n.name='商人';
 for(const entry of [...Object.values(QUESTS),...Object.values(ITEMS)])if(entry.desc?.includes('罗萨'))entry.desc=entry.desc.replaceAll('罗萨','商人');
 const oldCanDoor=RPG.prototype.canDoor;
 RPG.prototype.canDoor=function(...args){const result=oldCanDoor.apply(this,args);return typeof result==='string'?result.replaceAll('罗萨','商人'):result;};
 const old=RPG.prototype.ensureMap;
 RPG.prototype.ensureMap=function(...args){const result=old.apply(this,args);for(const [key,pose]of Object.entries(this.npcPoses||{}))if(key.endsWith(':c1rosa')&&Object.hasOwn(pose,'name'))pose.name='商人';return result;};
}
