// Installed static tables plus every currently authored dynamic text provider.
// Caller data is evidence of text, not a claim that every variant is reachable.
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {RPG} from '../../dist/core-v14.js';
import {DIALOGUES} from '../../dist/data-v14.js';
import {C1_HIDDEN} from '../../dist/chapter-one-dialogues-v31.js';
import {C1_LOCAL_TALK,C1_PEOPLE} from '../../dist/chapter-one-story-world.js';
import {V12_PACING} from '../../dist/pacing-data-v14.js';
import {CH3_SIDE} from '../../dist/chapter3-sidequests-v14.js';
import {QUEST_PROGRESS_DIALOGUE_V16} from '../../dist/quest-dialogue-v16.js';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function dialogueCorpus(){
 const scenes={};
 const add=(id,text,source,extra={})=>{if(!Array.isArray(text)||!text.every(r=>Array.isArray(r)&&r.length===2&&r.every(x=>typeof x==='string')))throw Error(id);scenes[id]={text:structuredClone(text),sha256:hash(text),source,...extra};};
 for(const[id,rows]of Object.entries({...DIALOGUES,...C1_HIDDEN}))add(id,rows,'installed:DIALOGUES');
 for(const q of V12_PACING){for(const [part,rows]of Object.entries(q.dialogue)){if(part==='goal')rows.forEach((lines,i)=>add(`pacing:${q.id}:goal:${i}`,lines,'dist/pacing-data-v14.js',{quest:q.id,chapter:q.chapter,part}));else add(`pacing:${q.id}:${part}`,rows,'dist/pacing-data-v14.js',{quest:q.id,chapter:q.chapter,part});}if(q.completeAfterRecovery)add(`pacing:${q.id}:recovered`,q.completeAfterRecovery,'dist/pacing-data-v14.js',{quest:q.id,chapter:q.chapter,part:'completeAfterRecovery'});}
 for(const s of CH3_SIDE.scenes)for(const[actor,rows]of Object.entries(s.dialogueByControlledActor||{}))if(actor!=='hero')add(`controlled:${s.id}:${actor}`,rows,'dist/chapter3-sidequests-v14.js',{scene:s.id,actor,chapter:3});
 for(const[id,line]of Object.entries(C1_LOCAL_TALK))add('local:'+id,[[C1_PEOPLE[id].name,line]],'dist/chapter-one-story-world.js',{action:'c1:localTalk:'+id,chapter:1});
 for(const[id,s]of Object.entries(QUEST_PROGRESS_DIALOGUE_V16))add('progress:'+id,[[s.speaker,s.text]],'dist/quest-dialogue-v16.js',{quest:id,chapter:5});
 // Execute inline dialogue producers through the real RPG methods, with explicit fixtures.
 const probe=(id,action,map,cls='shadow',flags={},stage='recovered')=>{const g=new RPG(cls);g.chapter=map.startsWith('deep')?16:map.startsWith('ch5')?21:12;g.enter(map,600,650);g.pending=null;g.flags={...g.flags,...flags};if(g.ch3)g.ch3.stage=stage;if(action==='ch3:rest'){const n=g.npcs.find(n=>n.id==='doctor');g.p.x=n.x;g.p.y=n.y;g.p.hp=1;}g.choose(action);if(!g.pending?.lines)throw Error('No inline text: '+id);add(id,g.pending.lines,'production:'+action,{action,map,cls,flags,stage});};
 for(const action of ['doctorIdle','ferrymanIdle','drawkeeperIdle','saintIdle','returnLamp'])probe('inline:ch3:'+action,'ch3:'+action,'hellCamp');
 probe('inline:ch3:rest','ch3:rest','hellCamp','saint',{},'medicine');
 probe('inline:ch3:ferryFixed','ch3:ferryTalk','hellFerry','shadow',{ch3FerryLampFixed:true});
 for(const cls of ['shadow','saint'])probe('inline:ch3:mechanistIdle:'+cls,'ch3:mechanistIdle','hellWorkshop',cls);
 for(const action of ['directions','merchantTalk','innTalk'])probe('inline:ch4:'+action,'v11:'+action,'deepCamp');
 probe('inline:ch5:music','v14ch5:music','ch5Plaza');
 // Read remaining one-off prop descriptions from their audited literal call sites.
 for(const source of ['dist/chapter4-runtime-v14.js','dist/chapter-runtime-v14.js','dist/core-v14.js']){
  const code=fs.readFileSync(source,'utf8');let n=0;
  for(const match of code.matchAll(/(?:this|g)\.hellTalk\('([^']*)','([^']*)'\)/g))add(`literal:${source}:${n++}`,[[match[1],match[2]]],source);
  for(const match of code.matchAll(/this\.say\('(奥伦|阿林|米拉|蕾娜|托马)：([^']*)'\)/g))add(`spoken:${source}:${n++}`,[[match[1],match[2]]],source);
 }
 const g=new RPG('shadow');g.chapter=2;g.enter('road',600,650);g.pending=null;g.quests.v12CourierRoad='done';g.c1Morning();add('inline:c1:morning',g.pending.lines,'production:c1Morning',{chapter:1});
 for(const chapter of [2,3])for(const action of ['repairShelf','repairInvoice','millDoor']){const g=new RPG('shadow');g.chapter=chapter;g.pending=null;g.exploreProp({action});if(g.pending?.lines)add(`explore:${action}:${chapter}`,g.pending.lines,'production:exploreProp',{chapter:1,phase:chapter});}
 add('inline:ch2:sign',[['旁白','木牌指向东面的灰桥，新钉上去的布告压着一行旧字：入桥摘帽，行李开包。']],'dist/chapter-runtime-v14.js',{chapter:2});
 for(const cls of ['shadow','saint'])add('inline:ch3:tomb:'+cls,[[cls==='saint'?'艾莉娅':'诺恩','铜牌刻着：上闸二刻，中闸归零，下闸一刻。检修时至少留一盏灯。']],'dist/chapter3-runtime-v14.js',{chapter:3});
 return {schema:1,scenes,limits:['Static registration and explicit producer fixtures enumerate authored text; campaign reachability is a separate check.','Historical migration before-text is not current playable dialogue.','UI buttons, combat toasts, item descriptions and procedure-generated counts are outside spoken dialogue.']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(dialogueCorpus()));
