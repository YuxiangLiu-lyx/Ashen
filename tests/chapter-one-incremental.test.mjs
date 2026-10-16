import {beforeCopyedit} from './fixtures/dialogue-copyedit-contract.mjs';
import {DIALOGUE_COPYEDITS} from '../dist/dialogue-copyedits-data.js';
import {C1_QUEST_DIALOGUES} from '../dist/chapter-one-quest-dialogues.js';
import {C3_AUTHORED_CAVES,assertAuthoredCave,legacyCaves} from './c3-spatial-control.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {C1_MAPS} from '../dist/chapter-one-layout.js';
import {C1_NEW_MAPS,C1_QUESTS} from '../dist/chapter-one-expansion-data.js';
import {RPG,MAPS,QUESTS} from '../dist/core-v14.js';
import {DIALOGUES} from '../dist/data-v14.js';
import {SCENERY} from '../dist/world-v14.js';
import {StoryFlow} from '../dist/story-flow-v14.js';
import {ChapterOneStoryFlow,C1_HIDDEN} from '../dist/chapter-one-dialogues-v31.js';
import {STAGING} from '../dist/staging-v14.js';
import {C1_PURSUIT_LOADS,pursuitSheet,pursuitFrame,drawPursuit} from '../dist/chapter-one-pursuit-v31.js';
import {identityPortraitV18,IDENTITY_LOADS_V18} from '../dist/identity-visuals-v18.js';
import {sagaPortraitV25} from '../dist/saga-art-v25.js';
const trialScript=JSON.parse(fs.readFileSync(new URL('../docs/c1-trial-forge/SCRIPT.json',import.meta.url))).scenes;
const trialStageIds=['c1TrialLegacyContract','c1TrialInvitation','c1TrialReport','c1SaintAid','c1HuntOffer','c1HuntProgress','c1HuntReport','c1SupplyIntro','c1CoreOrderOffer','c1TownDolly','c1TownLena'];
const baseline=JSON.parse(fs.readFileSync(new URL('../docs/ch1-dialogue-cleanup/BASELINE.json',import.meta.url)));
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const copy=v=>JSON.parse(JSON.stringify(v));
function game(cls,id){const g=new RPG(cls,null,()=>.44);g.c1Expansion.preparation.legacy=true;g.chapter=id==='contract'?1:2;g.enter(id==='contract'?'hall':'chapel',800,850);g.beginScene(id,id==='contract'?'contractAccept':'assassinate');g.events=[];return g;}
function finish(f){let n=0;while(!f.finished&&n++<200){if(f.phase==='action')f.update(30);else f.advance();}assert.equal(f.finished,true);}
function outcome(g){return copy({chapter:g.chapter,quests:g.quests,p:g.p,knowledge:g.knowledge,saint:g.saint,enemies:g.enemies,relations:g.relations});}

test('default saint portrait uses the preserved gentle original; later disguises retain their own image',()=>{
 const manifest=JSON.parse(fs.readFileSync(new URL('../docs/ch1-voice/ASSET_MANIFEST.json',import.meta.url)));
 const asset=fs.readFileSync(new URL('../dist/assets/c1-voice/elyria-gentle.png',import.meta.url));
 assert.equal(crypto.createHash('sha256').update(asset).digest('hex'),'6acd8529a1255205c170ed6654cb8804811457540a2f0947c22f7b3282fcaa9f');
 assert.deepEqual(asset,fs.readFileSync(new URL('../history/reconstruction-20261010/dist/assets/v30-narrative/elyria-gentle.png',import.meta.url)));
 assert.equal(manifest.sha256,crypto.createHash('sha256').update(asset).digest('hex'));assert.deepEqual(IDENTITY_LOADS_V18.find(([name])=>name==='saintCoverV31'),['saintCoverV31','assets/c1-voice/elyria-gentle.png',1,1,true]);
 const bank={cropped:(sheet,index)=>sheet+'/'+index,portrait(name){return identityPortraitV18(this,name);}};
 for(const name of ['艾莉娅','saint','aelia'])assert.equal(bank.portrait(name),'saintCoverV31/0');
 assert.equal(sagaPortraitV25(bank,'艾莉娅',{map:'chapel'}),'saintCoverV31/0');
 assert.equal(sagaPortraitV25(bank,'艾莉娅',{sagaV25:{disguise:true}}),'sagaElyriaPortraitV27/0');
 assert.equal(sagaPortraitV25(bank,'艾莉娅',{map:'ch8Forest',sagaV25:{started:true}}),'sagaElyriaPortraitV27/0');
 assert.equal(sagaPortraitV25(bank,'艾莉娅',{}, {get:()=>({disguiseV25:true})}),'sagaElyriaPortraitV27/0');
});

test('original 118 maps, dialogue and retained art protected around explicitly authorized 0.6 additions',()=>{
 for(const [key,table]of Object.entries({maps:MAPS,scenery:SCENERY,quests:QUESTS,dialogues:DIALOGUES,originalStaging:STAGING.scenes})){
  const added=Object.keys(table).filter(id=>!(id in baseline[key]));
  const allowed=key==='maps'||key==='scenery'?C1_NEW_MAPS:key==='quests'?Object.keys(C1_QUESTS).filter(id=>!(id in baseline[key])):key==='dialogues'?['c3HerbMedicine','c3BrewMedicine','c2PumpRest','c1Conversation','c1GateBrief','c1NorthBrief','c1RepairAccept','c1RepairCable','c1RepairDrain','c1RepairLegacyReturn','c1RepairReturn','c1VaultAccept','c1VaultLedger','c1VaultLegacyReturn','c1VaultReturn',...Object.keys(C1_QUEST_DIALOGUES),'c1HiddenPairArrangement',...Object.keys(trialScript).filter(id=>!(id in baseline.dialogues)&&!Object.hasOwn(C1_QUEST_DIALOGUES,id)&&!['c1RepairReturn','c1VaultAccept'].includes(id))]:key==='originalStaging'?['c1HiddenPairArrangement',...trialStageIds]:[];
  assert.deepEqual(added.sort(),allowed.slice().sort(),key+' authorized additions');
  for(const [id,h]of Object.entries(baseline[key])){
   if(key==='quests'&&C1_QUESTS[id])continue; // exact new budgets/IDs guarded by expansion tests
   if(['maps','scenery'].includes(key)&&C1_MAPS.includes(id))continue; // 0.7 explicit 17-map geometry/art authorization; independently audited.
   let value=key==='dialogues'?beforeCopyedit(id,table[id]):key==='originalStaging'&&id==='contract'?STAGING.scenes.c1TrialLegacyContract:table[id];if(['maps','scenery'].includes(key)&&C3_AUTHORED_CAVES.includes(id)){assertAuthoredCave(id);value=legacyCaves[key][id];}if(key==='dialogues'&&['intro','ratAccept'].includes(id))value=value.map(([speaker,line])=>[speaker,line.replaceAll('八只','六只')]); // Authorized 0.8 objective count; all remaining dialogue stays exact.
   if(key==='dialogues'&&['contract','sisterIdle','sisterBeforeDeparture'].includes(id)){const prior=JSON.parse(fs.readFileSync(new URL('../docs/c1-story-flow/baseline/dialogues.json',import.meta.url)))[id],adopted=JSON.parse(fs.readFileSync(new URL('../docs/c1-care-ui/SCRIPT.json',import.meta.url))).scenes[id];assert.deepEqual(value,adopted,id+' adopted 1.2');if(id==='contract')assert.deepEqual(value.slice(3,19),prior.slice(3,19));value=prior;}
   if(key==='dialogues'&&id==='v9TollFound')value=value.map(([speaker,line],i)=>[speaker,i?line:line.replace('护符下面还压着两瓶蜡封的清醒药和一瓶疗伤药，瓶口没有渗漏。','')]); // C2 0.4: exact appended cache contents only.
   if(key==='maps'){value=copy(value);value.doors=value.doors.filter(d=>!d.c1Door);value.props=value.props.filter(p=>!p.action?.startsWith('c1:'));}
   assert.equal(hash(value),h,key+'/'+id);
  }
 }
 for(const [file,h]of Object.entries(baseline.retainedFiles)){
  let data=fs.readFileSync(new URL('../'+file,import.meta.url));
  if(file==='dist/core-v14.js'){
   // The chapter-test task added exactly this test-only guard after the 0.4
   // baseline. Keep the complete original core hash check around that change.
   const guard='if(isStoryTestV25(this))n=Math.max(1,n,e.hp);',source=data.toString();
   assert.equal(source.split(guard).length,2,'exactly one approved test guard');
   let original=source.replace(guard,'');
   for(const fragment of ["import {installC2Conversations} from './chapter-two-conversations.js';\n","installC2Conversations(RPG,{DIALOGUES});\n","import {installC1Conversations} from './chapter-one-conversations.js';\n","installC1Conversations(RPG,{MAPS,QUESTS,ITEMS,DIALOGUES});\n","import {installEncounterRestraint} from './encounter-restraint.js';\n","installEncounterRestraint(RPG);\n","import {installC1Trial} from './chapter-one-trial-runtime.js';\n","\ninstallC1Trial(RPG,{MAPS,QUESTS,ITEMS,DIALOGUES});\n","import {installDialogueCopyedits} from './dialogue-copyedits-runtime.js';\n","\ninstallDialogueCopyedits(DIALOGUES);\n"]){assert.equal(original.split(fragment).length,2);original=original.replace(fragment,'');}
   const spoken=DIALOGUE_COPYEDITS.find(e=>e.key==='spoken:dist/core-v14.js:3');assert.equal(original.split(spoken.after[0][1]).length,2);original=original.replace(spoken.after[0][1],spoken.before[0][1]);
   // 1.0 fixes invalid overkill saves; no other original damage behavior changes.
   assert.equal(original.split('e.hp=Math.max(0,e.hp-n);').length,2);
   original=original.replace('e.hp=Math.max(0,e.hp-n);','e.hp-=n;');
   for(const [approved,prior]of [
    ["import {installChapterThreeExperience} from './rpg-chapter-three.js';\n",''],["import {installChapterThreeCaves} from './rpg-chapter-three-world.js';\n",''],["\ninstallChapterThreeCaves(RPG,{MAPS,SCENERY,BOUNDARIES});\ninstallChapterThreeExperience(RPG,{DIALOGUES,stats});\n",''],
    ["import {installChapterTwoExperience} from './rpg-chapter-two.js';\n",''],["\ninstallChapterTwoExperience(RPG,{DIALOGUES,stats});\n",''],
    ["import {installGameSettings} from './game-settings-v31.js';\n",''],["installGameSettings(RPG,{MAPS});\n",''],
    ["import {installChapterOneExpansion} from './chapter-one-expansion-runtime.js';\n",''],["import {BOUNDARIES} from './world-v14.js';\n",''],
    ["\ninstallChapterOneExpansion(RPG,{MAPS,QUESTS,ITEMS,DIALOGUES,SCENERY,BOUNDARIES,stats});\n",''],
    ["this.c1MainPayment('c1CommissionBrief');",'this.gainXP(15);'],["this.c1MainPayment('c1Assassination');",'this.gainXP(65);'],
    ['if(!this.c1Expansion)this.gainXP(20);','this.gainXP(20);'],['礼拜厅门禁已核实。备好退路后，从北侧前厅进入。','已问清礼拜厅的入口 · 经验 +20'],['追缉官倒地。清除剩余追兵后，从东侧闸口撤离。','追缉官倒地。东侧闸门已经打开。']]){
     assert.equal(original.split(approved).length,2,'one scoped 0.6 core change');original=original.replace(approved,prior);
    }data=Buffer.from(original);
  }
  if(file==='dist/chapter23-art-v30.js'){let source=data.toString();for(const [approved,prior]of [["import {drawChapterThreeCaveMass} from './rpg-chapter-three-art.js';\n",''],['floorDetail(c,id);drawChapterThreeCaveMass(c,bank,id);','floorDetail(c,id);'],['[[[180,405],[430,405],[520,300],[900,300],[1080,400]],[[1100,920],[1100,820],[640,820],[520,735]]]','[[[220,405],[350,405],[555,540]],[[625,555],[925,555],[1080,745]]]']]){assert.equal(source.split(approved).length,2);source=source.replace(approved,prior);}data=Buffer.from(source);}
  if(file==='dist/visuals-v14.js'){let source=data.toString();for(const approved of ["import {c1Ground} from './chapter-one-expansion-art.js';\n",'c1Ground(this,id)||',"import {installC1NaturalFrames,c1LocalPortrait} from './chapter-one-natural-art.js';\n",'installC1NaturalFrames(this,name,data);','const local=c1LocalPortrait(this,name);if(local)return local;']){assert.equal(source.split(approved).length,2);source=source.replace(approved,'');}data=Buffer.from(source);}
  if(file==='dist/chapter-one-interaction-v31.js'){let source=data.toString();source=source.replace("{...t,y:this.props.find(p=>p.id==='well')?.interactY??735}",'{...t,y:735}').replace('{x:p.interactX??p.x,y:p.interactY??735}','{x:p.x,y:735}');data=Buffer.from(source);}
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),h,file);
 }
});
test('normal dialogue completion preserves original outcomes and cannot commit twice for three classes',()=>{
 for(const cls of ['shadow','oath','ember'])for(const id of ['contract','assassination']){
  const control=game(cls,id);finish(new StoryFlow(control,DIALOGUES[id]));
  const g=game(cls,id),f=new ChapterOneStoryFlow(g,DIALOGUES[id]);finish(f);
  assert.deepEqual(outcome(g),outcome(control),cls+'/'+id);
  assert.equal(g.flags.c1Viewed,undefined);if(id==='contract')assert.equal(g.flags.c1PrivateTalk,'awaitingExit');
  const committed=copy(g.snapshot());f.complete();f.advance();f.update(1);
  assert.deepEqual(copy(g.snapshot()),committed,'repeated input must not commit twice');
 }
 for(const [id,h]of Object.entries(baseline.originalStaging))assert.equal(hash(id==='contract'?STAGING.scenes.c1TrialLegacyContract:STAGING.scenes[id]),h,id);
});
test('every original pending line resumes in both action and dialogue phases without duplicating completion',()=>{
 for(const cls of ['shadow','oath','ember'])for(const id of ['contract','assassination']){
  for(let line=0;line<DIALOGUES[id].length;line++)for(const phase of ['action','dialogue']){
   const old=game(cls,id);Object.assign(old.pending,{line,phase});
   const saved=copy(old.snapshot()),control=new RPG(cls,copy(saved),()=>.44);
   finish(new StoryFlow(control,DIALOGUES[id]));
   const g=new RPG(cls,copy(saved),()=>.44),f=new ChapterOneStoryFlow(g,DIALOGUES[id]);finish(f);
   assert.deepEqual(outcome(g),outcome(control),`${cls}/${id}/${line}/${phase}`);
  }
 }
});
test('all hidden-tail cursors survive real snapshot/restore and keep backstage knowledge private',()=>{
 for(const id of ['contract'])for(let line=0;line<C1_HIDDEN.c1HiddenPairArrangement.length;line++){
  const g=game('shadow',id);Object.assign(g.pending,{line:19,phase:'dialogue',closing:true,c1Tail:{id:'c1HiddenPairArrangement',line,revision:3}});const f=new ChapterOneStoryFlow(g,DIALOGUES[id]);if(f.phase==='action')f.update(30);
  const saved=copy(g.snapshot()),r=new RPG('shadow',saved,()=>.44),resume=new ChapterOneStoryFlow(r,DIALOGUES[id]);
  assert.equal(resume.c1Tail.line,line);assert.deepEqual(resume.current,C1_HIDDEN[resume.c1TailID][line]);
  assert.deepEqual(r.knowledge,g.knowledge);finish(resume);assert.equal(r.pending,null);
  assert.equal(r.flags.c1Viewed[resume.c1TailID],true);
 }
});
test('legacy H1 restarts the rewritten exchange once; revision3 then keeps its exact cursor',()=>{
 for(const revision of [undefined,1,2])for(let line=0;line<6;line++)for(const closing of [false,true]){
  const old=game('shadow','contract');
  Object.assign(old.pending,{line:19,phase:'dialogue',closing,c1Tail:{id:'c1HiddenPairArrangement',line,revision}});
  const g=new RPG('shadow',copy(old.snapshot()),()=>.44),f=new ChapterOneStoryFlow(g,DIALOGUES.contract);
  assert.equal(f.c1Tail.line,0);assert.equal(g.pending.c1Tail.revision,3);
  if(f.phase==='action')f.update(30);f.advance();const saved=copy(g.snapshot()),r=new RPG('shadow',copy(saved),()=>.44),resumed=new ChapterOneStoryFlow(r,DIALOGUES.contract);
  assert.equal(resumed.c1Tail.line,1,'second restore must not restart');
  assert.deepEqual(resumed.current,C1_HIDDEN.c1HiddenPairArrangement[1]);finish(resumed);
  delete saved.pending.c1Tail;const control=new RPG('shadow',saved,()=>.44);finish(new StoryFlow(control,DIALOGUES.contract));
  assert.deepEqual(outcome(r),outcome(control));
 }
});
test('every retired H2 cursor completes the original assassination once without anonymous dialogue',()=>{
 for(const cls of ['shadow','oath','ember'])for(const revision of [undefined,1,2])for(let line=0;line<(revision===2?3:6);line++)for(const closing of [false,true]){
  const old=game(cls,'assassination');
  Object.assign(old.pending,{line:17,phase:'dialogue',closing,c1Tail:{id:'c1HiddenSealEcho',line,revision}});
  const saved=copy(old.snapshot()),g=new RPG(cls,copy(saved),()=>.44),f=new ChapterOneStoryFlow(g,DIALOGUES.assassination);
  assert.equal(f.finished,true);assert.equal(f.current,null);assert.equal(g.pending,null);assert.equal(g.chapter,3);
  delete saved.pending.c1Tail;saved.pending.closing=true;
  const control=new RPG(cls,saved,()=>.44);finish(new StoryFlow(control,DIALOGUES.assassination));
  assert.deepEqual(outcome(g),outcome(control),`${cls}/${revision}/${line}/${closing}`);
  const committed=copy(g.snapshot());f.complete();f.advance();f.update(1);assert.deepEqual(copy(g.snapshot()),committed);
  const r=new RPG(cls,committed,()=>.44);assert.equal(r.pending,null);assert.equal(r.p.xp,g.p.xp);assert.equal(r.p.gold,g.p.gold);
 }
});
test('past-event saves do not replay tails and already viewed flags suppress duplication',()=>{
 const g=game('shadow','assassination');finish(new ChapterOneStoryFlow(g,DIALOGUES.assassination));
 const past=copy(g.snapshot());delete past.flags.c1Viewed;const restored=new RPG('shadow',past,()=>.44);
 restored.enter('chapel',800,850);assert.equal(restored.pending,null);assert.equal(restored.chapter,3);
 for(const id of ['contract','assassination']){
  const r=game('shadow',id),tail=id==='contract'?'c1HiddenPairArrangement':'c1HiddenSealEcho';r.flags.c1Viewed={[tail]:true};
  const f=new ChapterOneStoryFlow(r,DIALOGUES[id]);finish(f);assert.equal(f.c1Tail,undefined);
 }
});
test('only the requested known-speaker exchange remains; anonymous dialogue and silhouette are removed',()=>{
 const expected=JSON.parse(fs.readFileSync(new URL('../docs/ch1-voice/DIALOGUE.json',import.meta.url)));
 assert.deepEqual(beforeCopyedit('c1HiddenPairArrangement',C1_HIDDEN.c1HiddenPairArrangement).slice(1),expected.lines.slice(1));assert.equal(C1_HIDDEN.c1HiddenPairArrangement[0][0],'旁白');assert.match(C1_HIDDEN.c1HiddenPairArrangement[0][1],/鲁恩.*走到薇蕾娜身边/);
 assert.deepEqual(expected.lines.at(-1),['鲁恩','对不起……']);
 assert.ok(expected.lines.some(([speaker,line])=>speaker==='薇蕾娜'&&line.includes('禁制')));
 assert.ok(expected.lines.some(([speaker,line])=>speaker==='薇蕾娜'&&line.includes('服从命令')));
 assert.ok(expected.lines.every(([speaker])=>['旁白','薇蕾娜','鲁恩'].includes(speaker)));
 for(const [,url]of C1_PURSUIT_LOADS)assert.ok(fs.statSync(new URL('../dist/'+url,import.meta.url)).size>100000,url);
 const gameSource=fs.readFileSync(new URL('../dist/game-v14.js',import.meta.url),'utf8');
 assert.doesNotMatch(gameSource,/hiddenPortraitHTML|backstage-shadow|c1Replay|c1-skip|c1-replay|C1_CINEMATIC|drawC1Cinematic|c1DialogueHTML/);
 assert.equal(fs.existsSync(new URL('../dist/chapter-one-cinematic-v31.js',import.meta.url)),false);
});
test('the well keeps its artwork and saved object, with a reachable south-rim interaction in old visited saves',()=>{
 const g=new RPG('shadow');g.enter('town',900,770);g.pending=null;g.active=true;
 const saved=copy(g.snapshot()),prop=saved.states.town.props.find(p=>p.id==='well');
 assert.deepEqual([prop.x,prop.y],[880,640]);
 for(const offMap of [false,true]){
  const old=copy(saved);if(offMap)old.map='hall';const r=new RPG('shadow',old);if(offMap)r.enter('town',900,770);
  r.pending=null;r.active=true;const t=r.targets().find(t=>t.id==='well');assert.deepEqual([t.x,t.y,t.drawX,t.drawY],[880,705,880,640]);
  assert.equal(r.blocked(t.x,t.y,false),false);assert.equal(r.clearLine(r.p,t,false),true);r.interact(t);assert.equal(r.flags.wellSeen,true);
  assert.deepEqual(saved.states.town.props.find(p=>p.id==='well'),prop);
 }
});
test('guard, elite and officer select distinct 16-frame sheets at equal body scale',()=>{
 assert.equal(pursuitSheet({type:'guard'}),'c1Guard');assert.equal(pursuitSheet({type:'guard',elite:true}),'c1Elite');assert.equal(pursuitSheet({type:'captain'}),'c1Officer');assert.equal(pursuitSheet({type:'wolf',elite:true}),null);
 const calls=[],ctx=new Proxy({drawImage:(...args)=>calls.push(args)},{get:(t,k)=>t[k]||(()=>{})});
 const bank={images:{},frames:{},frame:(s,i)=>bank.frames[s]?.[i]};
 for(const [sheet]of C1_PURSUIT_LOADS){bank.frames[sheet]=Array.from({length:16},()=>({x:0,y:0,w:200,h:400,foot:{x:100,y:400}}));bank.images[sheet]=sheet;}
 for(const a of [{type:'guard'},{type:'guard',elite:true},{type:'captain'}])drawPursuit(ctx,bank,{...a,x:0,y:0});
 assert.deepEqual(calls.map(c=>c.at(-1)),[82,82,82]);
 assert.deepEqual([0,38,76,114].map(walkDistance=>pursuitFrame({moving:true,walkDistance})),[0,1,2,3]);
 assert.equal(pursuitFrame({angle:-1,wind:.4,windMax:.45}),12);assert.equal(pursuitFrame({angle:-1,attackAnim:.2}),14);
});
