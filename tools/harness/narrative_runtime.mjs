// Read-only view of the fully installed game. No browser, save or runtime writes.
import {createHash} from 'node:crypto';
import {RPG} from '../../dist/core-v14.js';
import {DIALOGUES, MAPS} from '../../dist/data-v14.js';
import {C1_HIDDEN} from '../../dist/chapter-one-dialogues-v31.js';
import {C1_PEOPLE, C1_LOCAL_TALK} from '../../dist/chapter-one-story-world.js';
import {C1_NPC_NAMES} from '../../dist/chapter-one-objectives.js';

const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const scenes={};
const selected=process.argv.includes('--scene')?process.argv[process.argv.indexOf('--scene')+1]:null;
for(const [id,rows] of Object.entries({...DIALOGUES,...C1_HIDDEN})){
  scenes[id]={sha256:hash(rows),speakers:[...new Set(rows.map(r=>r[0]))],lines:rows.length};
  if(process.argv.includes('--text'))scenes[id].text=rows;
}
if(selected){
  if(!scenes[selected])throw Error('Unknown static scene; inspect dynamic caller/action: '+selected);
  console.log(JSON.stringify({id:selected,...scenes[selected]}));
  process.exit(0);
}
const npcs={};
for(const [map,data] of Object.entries(MAPS))for(const npc of data.npcs||[]){
  const name=C1_PEOPLE[npc.id]?.name||C1_NPC_NAMES[npc.id]||npc.name;
  if(name) npcs[npc.id]={name,maps:[...new Set([...(npcs[npc.id]?.maps||[]),map])]};
}
const knowledge={};
for(const id of ['assassination','ch2TargetBefore','ch2TargetAfter','darkCommissionV9','darkExileV9']){
  const g=new RPG('shadow',null,()=>.44);
  g.pending={id,then:null};g.finishScene();
  knowledge[id]=structuredClone(g.knowledge);
}
console.log(JSON.stringify({schema:1,scenes,npcs,local_talk:C1_LOCAL_TALK,knowledge,
  limits:['DIALOGUES registration is not proof every scene is reachable',
    'Dynamic c1Conversation text requires its action/quest caller, not just the shared ID',
    'finishScene knowledge probes omit then actions; they are not campaign playthroughs']}));
