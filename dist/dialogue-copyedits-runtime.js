import {DIALOGUE_COPYEDITS} from './dialogue-copyedits-data.js';
import {C1_HIDDEN} from './chapter-one-dialogues-v31.js';
import {C1_LOCAL_TALK} from './chapter-one-story-world.js';
import {V12_PACING} from './pacing-data-v14.js';
import {CH3_SIDE} from './chapter3-sidequests-v14.js';
// Preserve shared authored arrays used by historical validators and controlled actors.
export function installDialogueCopyedits(dialogues){
 for(const e of DIALOGUE_COPYEDITS){
  let rows;
  if(e.static)rows=dialogues[e.key]||C1_HIDDEN[e.key];
  else if(e.key.startsWith('pacing:')){const[,id,part,index]=e.key.split(':'),q=V12_PACING.find(q=>q.id===id);rows=part==='recovered'?q.completeAfterRecovery:part==='goal'?q.dialogue.goal[index]:q.dialogue[part];}
  else if(e.key.startsWith('local:')){const id=e.key.slice(6);if(C1_LOCAL_TALK[id]!==e.before[0][1])throw Error('Local dialogue baseline drift: '+id);C1_LOCAL_TALK[id]=e.after[0][1];continue;}
  else continue; // Inline branches are edited at their real producer.
  if(JSON.stringify(rows)!==JSON.stringify(e.before))throw Error('Dialogue copyedit baseline drift: '+e.key);
  e.after.forEach((r,i)=>{rows[i][1]=r[1];});
 }
 for(const scene of CH3_SIDE.scenes)if(scene.dialogueByControlledActor?.hero&&dialogues[scene.id])scene.dialogueByControlledActor.hero=dialogues[scene.id];
}
