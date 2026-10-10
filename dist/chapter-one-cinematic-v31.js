import {StoryFlow} from './story-flow-v14.js';
import {Cinematic} from './cinematics-v14.js';
import {STAGING} from './staging-v14.js';

// This adapter keeps the original pending ID, eighteen lines and completion action.
// The two local epilogues run before gameplay/rewards resume. No nested scene queue.
export const C1_HIDDEN = {
 c1HiddenPairArrangement: [
  ['鲁恩','只为杀卡德兰，不必把她也带出来。'],
  ['薇蕾娜','上面要的，不止他的死。还要让诺恩和她同行一段。'],
  ['鲁恩','你觉得会有结果？'],
  ['薇蕾娜','我不知道。她不会顺着他，他也没学过怎么跟这样的人相处。'],
  ['鲁恩','他回来问你呢？'],
  ['薇蕾娜','我会答。先把答应我的退路留好，两个人都得回来。']
 ],
 c1HiddenSealEcho: [
  ['助手','刻线断了。'],['老人','印启用了。把旧记录取来……这回，要变天了。'],
  ['来人','少算了一步？'],['女性','是结果变了。旧案先留着，再算一次。'],
  ['军吏','又响了？'],['青年','这次只响了一声。先记下来，别把人都叫来。']
 ]
};
const tailFor={contract:'c1HiddenPairArrangement',assassination:'c1HiddenSealEcho'};
const actionFor={contract:'contractAccept',assassination:'assassinate'};
let staged=false;
function prepareStage(){
 if(staged)return;staged=true;
 const stage=STAGING.scenes.assassination;
 // Preserve all physical paths and final actor positions. The new screen action
 // unfolds inside the same beat, with the seal cue only after resistance ends.
 for(const [line,hold] of [[4,.8],[6,1.2],[7,1],[9,1.6],[10,10],[12,1.1]]){
  let beat=stage.beats.find(b=>b.line===line);
  if(!beat){beat={line,moves:[]};stage.beats.push(beat);}
  beat.hold=hold;
  if(line===10){beat.cueDelay=8;}
 }
}

export class ChapterOneStoryFlow extends StoryFlow {
 constructor(g,lines){
  prepareStage();super(g,lines);
  this.c1Enabled=!!tailFor[this.id];this.mainCine=this.cine;
  this.c1TailID=tailFor[this.id];this.c1BeatAt=this.cine?.time||0;
  if(this.c1Enabled&&g.pending?.c1Tail?.id===this.c1TailID){
   this.openTail(g.pending.c1Tail.line);
  }
 }
 openTail(line=0){
  this.c1Tail={id:this.c1TailID,line:Math.max(0,Math.min(5,Number(line)||0))};
  this.phase='dialogue';this.closing=true;
  if(this.c1Tail.id==='c1HiddenPairArrangement'){
   this.cine=new Cinematic(this.g,'aside');this.cine.fastForward();
  }
  this.revision++;this.sync();
 }
 sync(){
  if(this.c1Tail){
   if(this.g.pending){this.g.pending.c1Tail={...this.c1Tail};this.g.pending.phase='dialogue';this.g.pending.closing=true;}
   return;
  }
  super.sync();
 }
 get current(){return this.c1Tail?C1_HIDDEN[this.c1Tail.id][this.c1Tail.line]:super.current;}
 complete(){
  if(this.finished)return;
  const g=this.g,allowed=g.c1Replay||g.pending?.then===actionFor[this.id];
  if(this.c1Enabled&&!this.c1Tail&&allowed&&!g.flags.c1Viewed?.[this.c1TailID]){
   this.openTail();return;
  }
  if(this.c1Tail&&!g.c1Replay){g.flags.c1Viewed={...g.flags.c1Viewed,[this.c1TailID]:true};}
  this.cine=this.mainCine;
  if(g.c1Replay){this.finished=true;this.phase='complete';g.pending=null;this.revision++;return;}
  super.complete();
 }
 advance(){
  if(this.finished)return false;
  if(this.c1Tail){
   if(this.c1Tail.line===5)this.complete();
   else{this.c1Tail.line++;this.revision++;this.sync();}
   return true;
  }
  const changed=super.advance();
  if(changed)this.c1BeatAt=this.mainCine?.time||0;
  return changed;
 }
 update(dt){
  if(this.c1Tail){this.cine?.update(dt);return [];}
  return super.update(dt);
 }
 skip(){
  if(!this.c1Enabled||this.finished)return false;
  if(!this.c1Tail){
   // Apply every staged movement in order, then commit the original outro once.
   for(let i=this.index+1;i<this.lines.length;i++)this.mainCine?.setLine(i);
   this.mainCine?.fastForward();
   if(!this.closing){this.mainCine?.startOutro();this.mainCine?.fastForward();}
   this.index=this.lines.length-1;
  }
  this.c1Tail={id:this.c1TailID,line:5};this.complete();return true;
 }
}

export const C1_CINEMATIC_LOADS=[
 ['c1Chapel','assets/c1-incremental/chapel.png',1,1,false],
 ['c1ActionA','assets/c1-incremental/chapel-action-a.png',2,2,false],
 ['c1ActionB','assets/c1-incremental/chapel-action-b.png',2,2,false],
 ['c1Echo','assets/c1-incremental/seal-echo.png',3,1,false]
];
const shots=[
 ['c1ActionA',0,'午钟之前'],['c1ActionA',0,'桌角的通行纸'],
 ['c1ActionA',1,'短刃'],['c1ActionA',1,'倒下的主祭'],
 ['c1ActionA',2,'先救人'],['c1ActionA',3,'争回一步'],
 ['c1ActionB',0,'近身'],['c1ActionB',1,'封术'],
 ['c1ActionB',2,'光熄灭之后'],['c1ActionB',2,'侧门'],
 ['c1ActionB',3,'护卫入厅'],['c1ActionB',3,'撤离']
];
export function c1Shot(flow){
 if(!flow||flow.id!=='assassination'||flow.c1Tail)return null;
 const n=flow.index,t=Math.max(0,(flow.mainCine?.time||0)-(flow.c1BeatAt||0));
 let i=n<2?0:n<4?1:n<6?2:n<8?3:n<10?4:n===10&&flow.phase==='action'?(t<4?5:t<8?6:7):n<12?7:n===12?8:n===13?9:n<17?10:11;
 return {index:i,sheet:shots[i][0],frame:shots[i][1],label:shots[i][2],time:t};
}
function plate(ctx,bank,sheet,index,w,h,zoom=1){
 const f=bank.frame(sheet,index),im=bank.images[sheet];if(!f||!im)return false;
 // Crop only the known sheet cell, with a tiny inset excluding grid boundaries.
 const r=f.cell,k=Math.min(w/(r.w-4),h/(r.h-4))*zoom;
 ctx.drawImage(im,r.x+2,r.y+2,r.w-4,r.h-4,(w-(r.w-4)*k)/2,(h-(r.h-4)*k)/2,(r.w-4)*k,(r.h-4)*k);return true;
}
export function drawC1Cinematic(ctx,bank,flow,w,h,reduced=false){
 const tail=flow?.c1Tail,shot=c1Shot(flow);
 if(!shot&&tail?.id!=='c1HiddenSealEcho')return false;
 ctx.save();ctx.fillStyle='#0c1014';ctx.fillRect(0,0,w,h);
 // Reserve a separate subtitle strip: faces and the seal are never covered.
 const bottom=h<520?112:w<=600?200:164,top=50,area=Math.max(100,h-bottom-top);
 ctx.translate(0,top);
 if(tail)plate(ctx,bank,'c1Echo',Math.floor(tail.line/2),w,area);
 else{
  plate(ctx,bank,shot.sheet,shot.frame,w,area,reduced?1:1+Math.min(shot.time,6)*.002);
  if(!reduced&&shot.index===7&&shot.time<9){ctx.globalAlpha=.04;ctx.fillStyle='#e4dbba';ctx.fillRect(0,0,w,area);}
 }
 ctx.restore();return true;
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function c1DialogueHTML(flow,token){
 if(!flow?.c1Enabled||flow.id==='contract'&&!flow.c1Tail)return null;
 const tail=flow.c1Tail,shot=c1Shot(flow);
 const label=tail?.id==='c1HiddenPairArrangement'?'稍后 · 灰烛会馆':tail?['旧观测室','异地书房','远方前哨'][Math.floor(tail.line/2)]:'第一章 · 午钟之前';
 const row=flow.current||(flow.index===10?['','']:flow.lines[Math.max(0,flow.index-1)])||['',''];
 return `<div class="c1-cinema-ui ${flow.id==='contract'&&!tail?'c1-commission':''}"><header><span>${esc(label)}</span><button class="ghost" data-act="c1-skip" data-scene-token="${token}">${flow.g.c1Replay?'结束回看':'跳过本段'}</button></header><section class="c1-dialogue" aria-live="polite"><p class="speaker">${esc(row[0])}</p><p class="line">${esc(row[1])}</p><div class="c1-controls"><span>${tail?'幕间':shot?esc(shot.label):''}</span>${flow.phase==='dialogue'?`<button data-act="next" data-scene-token="${token}">继续 ▸</button>`:'<span class="c1-action">……</span>'}</div></section></div>`;
}
