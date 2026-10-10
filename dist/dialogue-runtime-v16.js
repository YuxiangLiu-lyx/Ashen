import {DIALOGUE_TEXT_V16} from './dialogue-text-v16.js';
import {DIALOGUE_MIGRATIONS_V16} from './dialogue-migrations-v16.js';
import {CH3_SIDE} from './chapter3-sidequests-v14.js';

const clone=value=>JSON.parse(JSON.stringify(value));
const signature=(id,lines)=>JSON.stringify([id,lines]);

// Install after every story registration. Only text changes; staging uses the
// existing scene IDs, speakers and row indexes. Keep those contracts intact.
export function installDialogueTextV16(RPG,dialogues){
 const migrations=new Map();
 const remember=(id,before,after)=>{
  if(JSON.stringify(before)!==JSON.stringify(after))migrations.set(signature(id,before),clone(after));
 };
 for(const [id,texts] of Object.entries(DIALOGUE_TEXT_V16)){
  const rows=dialogues[id];
  if(!rows||rows.length!==texts.length)throw new Error('Dialogue row contract: '+id);
  const before=clone(rows);
  texts.forEach((text,index)=>{rows[index][1]=text;});
  remember(id,before,rows);
 }
 // These controlled-actor rows override pending.lines after beginScene.
 // Their hero branches must use the final table as well.
 for(const scene of CH3_SIDE.scenes){
  if(!scene.dialogueByControlledActor?.hero||!dialogues[scene.id])continue;
  remember(scene.id,scene.dialogueByControlledActor.hero,dialogues[scene.id]);
  scene.dialogueByControlledActor.hero=dialogues[scene.id];
 }
 for(const entry of DIALOGUE_MIGRATIONS_V16)remember(entry.id,entry.before,entry.after);
 const restore=RPG.prototype.restore;
 RPG.prototype.restore=function(saved){
  restore.call(this,saved);
  const pending=this.pending;
  if(!pending?.lines)return;
  const lines=migrations.get(signature(pending.id,pending.lines));
  if(lines)this.pending={...pending,lines:clone(lines)};
 };
}
