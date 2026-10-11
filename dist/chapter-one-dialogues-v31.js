import {StoryFlow} from './story-flow-v14.js';

// Short backstage additions, using the original dialogue renderer and staging.
// Keep the pending IDs, completion actions and viewed markers from revision 0.3.
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
  ['','印启用了。把旧记录取来。'],
  ['','是结果变了。旧案先留着，再算一次。'],
  ['','这次只响了一声。先记下来，别把人都叫来。']
 ]
};
const tailFor={contract:'c1HiddenPairArrangement',assassination:'c1HiddenSealEcho'};
const actionFor={contract:'contractAccept',assassination:'assassinate'};

export class ChapterOneStoryFlow extends StoryFlow {
 constructor(g,lines){
  super(g,lines);
  this.mainCine=this.cine;this.c1TailID=tailFor[this.id];
  const saved=g.pending?.c1Tail;
  if(this.c1TailID&&saved?.id===this.c1TailID){
   const oldLine=Math.max(0,Math.floor(Number(saved.line)||0));
   const line=saved.id==='c1HiddenSealEcho'&&saved.revision!==2?Math.floor(oldLine/2):oldLine;
   this.openTail(line);
  }
 }
 openTail(line=0){
  const last=C1_HIDDEN[this.c1TailID].length-1;
  this.c1Tail={id:this.c1TailID,line:Math.max(0,Math.min(last,Math.floor(Number(line)||0))),revision:2};
  this.phase='dialogue';this.closing=true;this.cine=null;
  this.revision++;this.sync();
 }
 sync(){
  if(!this.c1Tail){super.sync();return;}
  if(this.g.pending){this.g.pending.c1Tail={...this.c1Tail};this.g.pending.phase='dialogue';this.g.pending.closing=true;}
 }
 get current(){return this.c1Tail?C1_HIDDEN[this.c1Tail.id][this.c1Tail.line]:super.current;}
 complete(){
  if(this.finished)return;
  const g=this.g;
  if(this.c1TailID&&!this.c1Tail&&g.pending?.then===actionFor[this.id]&&!g.flags.c1Viewed?.[this.c1TailID]){
   this.openTail();return;
  }
  if(this.c1Tail)g.flags.c1Viewed={...g.flags.c1Viewed,[this.c1TailID]:true};
  this.cine=this.mainCine;
  super.complete();
 }
 advance(){
  if(this.finished)return false;
  if(!this.c1Tail)return super.advance();
  if(this.c1Tail.line===C1_HIDDEN[this.c1Tail.id].length-1)this.complete();
  else{this.c1Tail.line++;this.revision++;this.sync();}
  return true;
 }
 update(dt){return this.c1Tail?[]:super.update(dt);}
}

// A neutral, faceless vector silhouette fits the existing portrait area.
// No external picture, identity label or new scene presentation is loaded.
export function hiddenPortraitHTML(){
 return '<svg class="portrait-art backstage-shadow" viewBox="0 0 360 480" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18 480 35 324Q43 270 112 250L141 226 141 200Q109 180 107 130Q98 74 128 45Q149 24 180 24Q211 24 232 45Q262 74 253 130Q251 180 219 200L219 226 248 250Q317 270 325 324L342 480Z"/></svg>';
}
