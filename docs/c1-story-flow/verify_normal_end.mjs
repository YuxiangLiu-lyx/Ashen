// Validate the original UI trace after fixing only its final phase-5 assertion.
// Do not rewrite the failed command, its logs, or any save to manufacture a pass.
import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {RPG} from '../../dist/core-v14.js';
import {C1_MAIN} from '../../dist/chapter-one-expansion-data.js';
import {parseSave} from '../../dist/save-transfer-v14.js';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),rows=[];
for(const cls of ['shadow','oath','ember']){
 const base='docs/c1-story-flow/natural-001/'+cls;
 const read=name=>JSON.parse(fs.readFileSync(base+'/'+name));
 const progress=read('PROGRESS.json'),failure=read('FAILURE.json'),raw=fs.readFileSync(base+'/15-post-save.json'),save=parseSave(raw.toString());
 assert.equal(progress.scope,'normal title/new-game; read-only hooks; real keyboard/mouse');assert.deepEqual(progress.errors,[]);
 assert.match(failure.error,/6 !== 5/);assert.match(failure.error,/browser-chapter-one-natural.mjs:32:/);
 const expected=['01-hall','02-warehouse','03-rats','04-commission','04b-outfit','05-readiness','06a-crypt','06b-rest','06c-drill','07-morning','08-loom','09-north','10-chapel','11-alley','12-captain-entry','13-captain','14-departure','15-post'];
 assert.deepEqual(progress.steps.slice(0,-1).map(s=>s.name),expected);assert.equal(progress.steps.at(-1).name,'failure');
 assert.equal(save.map,'post');assert.equal(save.chapter,6);assert.equal(save.p.cls,cls);assert.equal(save.flags.c1Viewed.c1HiddenPairArrangement,true);
 assert.equal(progress.steps.find(s=>s.name==='04-commission').state.flags.c1PrivateTalk,'awaitingExit');
 assert.equal(progress.steps.find(s=>s.name==='05-readiness').state.flags.c1Viewed.c1HiddenPairArrangement,true);
 assert.equal(progress.steps.find(s=>s.name==='13-captain').outcome,'clear');
 assert.ok(fs.statSync(base+'/04c-private-meeting.png').size>1000);
 for(const q of C1_MAIN)assert.equal(save.quests[q.id],'done',cls+':'+q.id);
 const g=new RPG(cls,save),again=g.snapshot();assert.equal(g.map,'post');assert.equal(g.chapter,6);assert.equal(g.pending,null);assert.equal(g.flags.c1Viewed.c1HiddenPairArrangement,true);
 assert.deepEqual(g.c1Expansion.claimLedger,save.c1Expansion.claimLedger);assert.equal(g.p.gold,save.p.gold);assert.equal(g.p.xp,save.p.xp);
 rows.push({class:cls,status:'complete-to-post-phase-6',original_input_command_exit:1,reason:'Only final expected phase was incorrect (5 instead of actual 6); original failure is retained.',trace:{path:base+'/PROGRESS.json',sha256:hash(fs.readFileSync(base+'/PROGRESS.json'))},original_save:{path:base+'/15-post-save.json',sha256:hash(raw)},first_chapter_main_quests:C1_MAIN.length,private_after_real_exit:true,restore_without_reward_change:true,limits:['Automated real input, not a human reading or fun assessment.','This terminal verification does not relabel the original driver exit as success.']});
}
fs.writeFileSync('docs/c1-story-flow/NORMAL_INPUT_CHAIN.json',JSON.stringify({status:'verified',rows},null,2)+'\n');console.log(JSON.stringify(rows.map(r=>({class:r.class,status:r.status}))));
