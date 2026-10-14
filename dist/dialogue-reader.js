// Reading history is presentation-only. StoryFlow owns the durable cursor,
// cinematic beats, finishScene and all once-only game transactions.
export class DialogueReader {
 constructor(flow){this.flow=flow;this.reviewIndex=null;}
 get rows(){return this.flow.readingRows;}
 get liveIndex(){return this.flow.readingIndex;}
 get index(){return this.reviewIndex??this.liveIndex;}
 get reviewing(){return this.reviewIndex!==null;}
 get current(){return this.flow.phase==='dialogue'?this.rows[this.index]:null;}
 get canPrevious(){return !this.flow.finished&&this.flow.phase==='dialogue'&&this.index>0;}
 previous(){if(!this.canPrevious)return false;this.reviewIndex=this.index-1;return true;}
 next(){
  if(this.flow.finished||this.flow.phase!=='dialogue')return false;
  if(this.reviewing){this.reviewIndex++;if(this.reviewIndex>=this.liveIndex)this.reviewIndex=null;return true;}
  return this.flow.advance();
 }
}
