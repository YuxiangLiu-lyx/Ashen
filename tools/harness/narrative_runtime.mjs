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
const action=process.argv.includes('--action')?process.argv[process.argv.indexOf('--action')+1]:null;
if(action){
  if(selected)throw Error('Choose either --scene or --action');
  const npc=action.startsWith('c1:localTalk:')?action.slice('c1:localTalk:'.length):null;
  if(!npc||!Object.hasOwn(C1_LOCAL_TALK,npc))throw Error('Unsupported dynamic action; inspect its quest/flags caller: '+action);
  const g=new RPG('shadow',null,()=>.44);
  g.choose(action);
  if(g.pending?.id!=='c1Conversation'||!Array.isArray(g.pending.lines))throw Error('Dynamic action did not produce its expected dialogue');
  const rows=g.pending.lines;
  console.log(JSON.stringify({action,id:g.pending.id,sha256:hash(rows),speakers:[...new Set(rows.map(r=>r[0]))],lines:rows.length,
    ...(process.argv.includes('--text')?{text:rows}:{}),limits:['Reads localTalk action output only; not proof of map or quest availability']}));
  process.exit(0);
}
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
